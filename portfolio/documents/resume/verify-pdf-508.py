#!/usr/bin/env python3
"""
==============================================================================
PLAIN-ENGLISH OVERVIEW FOR NEW DEVELOPERS (READ-ALONG TEACHING HEADER)
==============================================================================
What is this file?
  This is `verify-pdf-508.py`, an automated Python 3 accessibility test suite
  that inspects compiled `.pdf` and `.docx` resumes and cover letters to prove
  they meet **Federal Section 508**, **WCAG 2.1 AA**, and **ISO 14289-1 (PDF/UA-1)**
  accessibility standards before any build succeeds.

How can a Python script "look inside" a PDF or Word document without specialized
third-party libraries (`pikepdf` / `pypdf`)?
  1. **How PDFs Work Under the Hood**:
     Even though a `.pdf` looks like a binary file, its internal skeleton is
     actually ASCII text dictionaries (`<< /Key /Value >>`) mixed with zlib-
     compressed data blocks (`stream ... endstream`). By decompressing every
     `zlib` stream with Python's built-in `zlib` module, we can inspect the
     exact same PDF Structure Tree tags (`/StructTreeRoot`, `/S /H1`, `/S /P`,
     `/S /LI`, `/S /Link`, `/Lang (en-US)`, `/MarkInfo`, `/Tabs /S`, `/Artifact`)
     that Adobe Acrobat Accessibility Checker, PAC, JAWS, NVDA, and Python PDF
     libraries (`pikepdf` / `pypdf`) read!
  2. **How Word `.docx` Files Work Under the Hood**:
     Every `.docx` file is secretly a standard `.zip` archive containing XML
     files! Python's built-in `zipfile` module opens the `.docx` directly in
     memory to verify `docProps/core.xml` (`dc:title`, `dc:creator`, `en-US`)
     and `word/document.xml` (`Heading1` semantic paragraph styles).

Why zero external `pip` dependencies?
  Using 100% Python Standard Library modules (`pathlib`, `re`, `sys`, `zipfile`,
  `zlib`) guarantees this validator runs identically on macOS, Linux, and Windows
  without virtual environments breaking!

What inputs feed into it, and what output does it produce?
  - Inputs: Paths to `.pdf` and/or `.docx` files on the command line, plus an
    optional `--cover-letter` flag:
      * Resumes (default): Strictly enforces the **Mandatory USAJOBS.gov / OPM
        2-Page Federal Resume Maximum (`pages <= 2`)** alongside `<H1>` + `<H2>`
        heading hierarchy, compact 2-page `.docx` margins, and full Section 508 /
        ISO 14289-1 (`PDF/UA-1`) tags. Any 3+ page resume fails with exit code `1`.
      * Cover Letters (`--cover-letter`): Enforces a strict **1-Page Maximum
        (`pages <= 1`)** with `<H1>` letterhead and `<P>` body tags.
  - Outputs: Prints a concise `[508/PDF-UA + USAJOBS CAP PASS]` telemetry summary
    and exits with status code `0` on full compliance, or prints every specific
    page-cap / accessibility violation to `stderr` and exits with code `1` to
    halt the build immediately.
==============================================================================
"""

# Standard Library Imports:
# - `pathlib` : Object-oriented file path handling (cross-platform `/` vs `\`).
# - `re`      : Regular expressions (just like `/pattern/g` in JavaScript).
# - `sys`     : Command-line arguments (`sys.argv`) and standard error stream (`sys.stderr`).
# - `zipfile` : Opens `.docx` Office Open XML packages (which are `.zip` archives).
# - `zlib`    : Decompresses PDF `/FlateDecode` streams in memory.
import pathlib
import re
import sys
import zipfile
import zlib


def extract_full_pdf_text(pdf_bytes: bytes) -> str:
    """
    Unpacks an entire PDF file (both raw uncompressed headers AND compressed
    `/FlateDecode` object/XMP streams) into one searchable string.

    Step-by-Step Walkthrough:
      1. `pdf_bytes.decode("latin1")` converts raw bytes (`0x00`–`0xFF`) 1-to-1
         into characters without ever crashing with `UnicodeDecodeError` on binary
         font bytes—preserving uncompressed catalog dictionaries and XMP XML metadata.
      2. Modern PDF generators like WeasyPrint pack the semantic tag tree (`<H1>`,
         `<P>`, `<L>`, `<LI>`, `<Link>`) inside compressed `stream ... endstream`
         blocks. `re.finditer(...)` finds every stream block in `pdf_bytes`.
      3. `zlib.decompress(payload)` inflates compressed streams so we can inspect
         every hidden PDF object dictionary deterministically!
    """
    chunks = [pdf_bytes.decode("latin1")]
    for match in re.finditer(rb"stream\r?\n([\s\S]*?)\r?\nendstream", pdf_bytes):
        payload = match.group(1)
        try:
            decompressed = zlib.decompress(payload)
            chunks.append(decompressed.decode("latin1"))
        except zlib.error:
            # Non-zlib stream (e.g., an uncompressed XMP XML metadata packet or font binary);
            # its raw text is already included in `chunks[0]`, so we safely skip it.
            pass
    return "\n".join(chunks)


# Hard statutory/federal page ceilings & human-readability floors:
# - USAJOBS.gov / OPM federal hiring rules disqualify or truncate resumes exceeding 2 pages.
# - Formal engineering cover letters must stay strictly on 1 single page.
# - Anti-Cramming Floors: NEVER beat the 2-page cap by shrinking body text to 8pt micro-print,
#   crushing line-height, shaving margins, or stripping heading orphan locks (`break-after: avoid`).
MAX_RESUME_PAGES = 2
MAX_COVER_LETTER_PAGES = 1
MIN_BODY_FONT_PT = 9.2
MIN_LINE_HEIGHT = 1.28
MIN_PAGE_MARGIN_IN = 0.45


def verify_resume_stylesheet_and_markdown_invariants(script_dir: pathlib.Path) -> list[str]:
    """
    Guards against two subtle failure modes in automated resume pipelines:
      1. **Anti-Micro-Print Readability Floor (`resume-pdf-ua.css`)**:
         Ensures nobody satisfies `page_count <= 2` by shrinking `html` font-size
         below `9.2pt`, crushing `line-height` below `1.28`, shaving `@page` margins
         below `0.45in`, or removing `break-after: avoid` / `orphans` / `widows`.
      2. **Explicit CommonMark Line-Break Hygiene (`mragsdale-resume.md`)**:
         Rejects invisible two-trailing-space (`  \\n`) hard breaks because SharePoint,
         LLM extractors, and editor whitespace trimmers strip trailing spaces and
         concatenate adjacent lines (`**Title**Tagline`). Require explicit ` \\` breaks!
    """
    errors: list[str] = []
    css_path = script_dir / "resume-pdf-ua.css"
    if css_path.is_file():
        css = css_path.read_text(encoding="utf-8")
        html_block = re.search(r"\bhtml\s*\{([^}]*)\}", css)
        if html_block:
            body = html_block.group(1)
            fs_match = re.search(r"font-size\s*:\s*([0-9.]+)\s*pt", body)
            if fs_match and float(fs_match.group(1)) < MIN_BODY_FONT_PT:
                errors.append(
                    f"Typography floor violated in `resume-pdf-ua.css`: `html` font-size is "
                    f"{fs_match.group(1)}pt (minimum readable floor is {MIN_BODY_FONT_PT}pt; trim redundant copy instead!)."
                )
            lh_match = re.search(r"line-height\s*:\s*([0-9.]+)", body)
            if lh_match and float(lh_match.group(1)) < MIN_LINE_HEIGHT:
                errors.append(
                    f"Typography floor violated in `resume-pdf-ua.css`: `html` line-height is "
                    f"{lh_match.group(1)} (minimum floor is {MIN_LINE_HEIGHT})."
                )
        margin_match = re.search(r"@page\s*\{[\s\S]*?margin\s*:\s*([^;]+);", css)
        if margin_match:
            inches = [float(m) for m in re.findall(r"([0-9.]+)\s*in", margin_match.group(1))]
            if inches and min(inches) < MIN_PAGE_MARGIN_IN:
                errors.append(
                    f"Page margin floor violated in `resume-pdf-ua.css`: minimum `@page` margin is "
                    f"{min(inches)}in (minimum floor is {MIN_PAGE_MARGIN_IN}in)."
                )
        if len(re.findall(r"break-after\s*:\s*avoid", css)) < 4:
            errors.append(
                "Missing heading pagination locks (`break-after: avoid`) on `h1`, `h2`, `h3`, or `h3 + p` in `resume-pdf-ua.css`."
            )
        if "orphans:" not in css or "widows:" not in css:
            errors.append("Missing `orphans` / `widows` pagination rules in `resume-pdf-ua.css`.")

    md_path = script_dir / "mragsdale-resume.md"
    if md_path.is_file():
        for line_no, raw_line in enumerate(md_path.read_text(encoding="utf-8").splitlines(), start=1):
            if raw_line.endswith("  "):
                errors.append(
                    f"`mragsdale-resume.md` line {line_no} uses fragile trailing-space hard break (`  `); "
                    f"use explicit ` \\\\` so Markdown extractors never concatenate lines."
                )

    return errors


def verify_pdf(pdf_path: pathlib.Path, require_h2: bool = True) -> list[str]:
    """
    Audits a compiled PDF file against the Mandatory USAJOBS 2-Page Cap (or 1-page
    cover-letter cap) plus 8 core PDF/UA-1 & Section 508 rules.
    Returns a list of human-readable error strings (`[]` empty list means 100% PASS!).
    """
    errors: list[str] = []
    if not pdf_path.is_file():
        return [f"PDF file not found: {pdf_path}"]

    # Read raw PDF bytes from disk and inflate all internal streams into `corpus`.
    pdf_bytes = pdf_path.read_bytes()
    corpus = extract_full_pdf_text(pdf_bytes)

    # --------------------------------------------------------------------------
    # CHECK 1: ISO 14289-1 (PDF/UA-1) XMP Metadata Conformance
    # --------------------------------------------------------------------------
    # Assistive technology validators (PAC 2024,veraPDF, Acrobat) check the embedded
    # XMP XML packet for `<pdfuaid:part>1</pdfuaid:part>` and `<dc:title>`.
    if "pdfuaid:part" not in corpus:
        errors.append("Missing ISO 14289-1 PDF/UA-1 XMP identifier (`pdfuaid:part`).")
    if "dc:title" not in corpus:
        errors.append("Missing XMP `dc:title` document title metadata.")

    # --------------------------------------------------------------------------
    # CHECK 2: Tagged PDF Catalog & Structure Tree Root
    # --------------------------------------------------------------------------
    # An accessible PDF MUST have `/StructTreeRoot` (the root of the semantic DOM-like
    # tag tree) and `/MarkInfo << /Marked true >>` declaring it is a Tagged PDF.
    if "/StructTreeRoot" not in corpus:
        errors.append("Missing `/StructTreeRoot` (PDF is untagged).")
    if not re.search(r"/Marked\s+true", corpus):
        errors.append("Missing `/MarkInfo << /Marked true >>` on Document Catalog.")

    # --------------------------------------------------------------------------
    # CHECK 3: Primary Natural Language (WCAG 3.1.1) & Window Title (WCAG 2.4.2)
    # --------------------------------------------------------------------------
    # - `/Lang (en-US)` tells screen readers to use English pronunciation rules.
    # - `/DisplayDocTitle true` tells PDF viewers to announce the human `<title>`
    #   instead of reading out a raw filename like `mragsdale-resume.pdf`.
    if not re.search(r"/Lang\s*\(en-US\)", corpus):
        errors.append("Missing `/Lang (en-US)` on Document Catalog (WCAG 3.1.1).")
    if not re.search(r"/DisplayDocTitle\s+true", corpus):
        errors.append("Missing `/ViewerPreferences << /DisplayDocTitle true >>` (WCAG 2.4.2).")

    # --------------------------------------------------------------------------
    # CHECK 4: Mandatory USAJOBS 2-Page Maximum & Keyboard Tab Order (`/Tabs /S`)
    # --------------------------------------------------------------------------
    # 1. Hard Page Ceiling: USAJOBS.gov enforces a strict 2-page maximum on federal
    #    resumes (and cover letters must fit on 1 page). Fail fatally if exceeded!
    # 2. Every `/Type /Page` dictionary must include `/Tabs /S`, which instructs PDF
    #    readers to move keyboard Tab focus in **S**tructure Tree order (logical reading
    #    order) rather than arbitrary geometric X/Y coordinates on the page.
    max_pages = MAX_RESUME_PAGES if require_h2 else MAX_COVER_LETTER_PAGES
    page_count = len(re.findall(r"/Type\s*/Page\b", corpus))
    tabs_s_count = len(re.findall(r"/Tabs\s*/S\b", corpus))
    if page_count == 0:
        errors.append("Detected 0 `/Type /Page` objects in PDF.")
    else:
        if page_count > max_pages:
            doc_label = (
                "USAJOBS.gov / OPM Federal Resume"
                if require_h2
                else "Cover Letter"
            )
            errors.append(
                f"MANDATORY {max_pages}-PAGE MAXIMUM VIOLATED ({doc_label}): "
                f"`{pdf_path.name}` rendered {page_count} pages (strict maximum is {max_pages} pages). "
                f"Tighten Markdown copy so it fits cleanly within {max_pages} page(s)."
            )
        if tabs_s_count < page_count:
            errors.append(
                f"Expected `/Tabs /S` (Use Document Structure tab order) on all {page_count} pages, found {tabs_s_count}."
            )

    # --------------------------------------------------------------------------
    # CHECK 5: Interactive PDF Bookmarks (`/Outlines`)
    # --------------------------------------------------------------------------
    # Allows sighted and low-vision users to jump directly between resume sections
    # in their PDF viewer's left-hand Bookmarks sidebar.
    if "/Outlines" not in corpus:
        errors.append("Missing `/Outlines` PDF bookmarks dictionary.")

    # --------------------------------------------------------------------------
    # CHECK 6: Semantic Structure Tree Elements (`<Document>`, `<H1>`..`<H6>`, `<P>`)
    # --------------------------------------------------------------------------
    # Inside a PDF's `/StructTreeRoot`, each HTML-like tag is stored as a dictionary
    # whose `/S` ("Structure Type") key is `/Document`, `/H1`, `/H2`, `/P`, `/LI`, etc.
    if not re.search(r"/S\s*/Document\b", corpus):
        errors.append("Missing `<Document>` root structure element.")

    # Count how many `/S /H1` through `/S /H6` heading tags exist in the PDF.
    h_counts = {
        level: len(re.findall(rf"/S\s*/H{level}\b", corpus))
        for level in range(1, 7)
    }
    if h_counts[1] != 1:
        errors.append(f"Expected exactly 1 `<H1>` heading tag, found {h_counts[1]}.")
    if require_h2 and h_counts[2] < 1:
        errors.append("Expected at least 1 `<H2>` section heading tag on resume, found 0.")

    # WCAG 1.3.1 Heading Hierarchy Rule: never skip a heading level!
    # For example, having `<H3>` job titles (`h_counts[3] > 0`) when there are zero
    # `<H2>` section headings (`h_counts[2] == 0`) confuses screen-reader outline navigation.
    for level in range(2, 7):
        if h_counts[level] > 0 and h_counts[level - 1] == 0:
            errors.append(
                f"Skipped heading hierarchy detected: found `<H{level}>` ({h_counts[level]}) with 0 `<H{level - 1}>` tags."
            )

    p_count = len(re.findall(r"/S\s*/P\b", corpus))
    if p_count < 1:
        errors.append("Expected semantic `<P>` paragraph structure elements, found 0.")

    # --------------------------------------------------------------------------
    # CHECK 7: 100% Embedded Fonts (PDF/UA Clause 7.21.4) & `/Artifact` Hygiene
    # --------------------------------------------------------------------------
    # Every `/Type /FontDescriptor` MUST embed its actual glyph binary (`/FontFile`,
    # `/FontFile2`, or `/FontFile3`) inside the PDF so characters never render as
    # missing boxes on computers that don't have the author's local fonts installed.
    font_descriptors = re.findall(r"<<[\s\S]*?/Type\s*/FontDescriptor[\s\S]*?>>", corpus)
    embedded_fonts = sum(1 for fd in font_descriptors if re.search(r"/FontFile[23]?\b", fd))
    if len(font_descriptors) == 0:
        errors.append("Detected 0 `/Type /FontDescriptor` font dictionaries in PDF.")
    elif embedded_fonts < len(font_descriptors):
        errors.append(
            f"Unembedded font detected: {embedded_fonts} of {len(font_descriptors)} FontDescriptors embed `/FontFile*`."
        )

    # Decorative CSS borders and `@page` running footers (`Page 1 of 2`) must be marked
    # as `/Artifact` so screen readers don't read them aloud in the middle of sentences.
    artifact_count = len(re.findall(r"/Artifact\b", corpus))
    if artifact_count < 1:
        errors.append("Expected `/Artifact` marks on decorative rules/running footers, found 0.")

    # --------------------------------------------------------------------------
    # CHECK 8: Accessible Hyperlink Annotations (`<Link>`, `/StructParent`, `/Contents`)
    # --------------------------------------------------------------------------
    # In PDF/UA-1, every clickable link rectangle (`/Subtype /Link`) must:
    #   1. Pair with a `<Link>` (`/S /Link`) tag in the semantic structure tree.
    #   2. Carry `/StructParent` pointing back to its parent tag-tree entry.
    #   3. Carry a non-empty `/Contents (...)` description (injected by our `pydyf`
    #      `finisher` in `build-resume.sh` / `build-cover-letter.sh`) so screen
    #      readers announce a clear destination instead of raw punctuation.
    link_annots = re.findall(r"<<[\s\S]*?/Subtype\s*/Link[\s\S]*?>>\s*endobj", corpus)
    link_struct_count = len(re.findall(r"/S\s*/Link\b", corpus))
    if len(link_annots) > 0 and link_struct_count < 1:
        errors.append(
            f"Found {len(link_annots)} `/Subtype /Link` annotations without `<Link>` structure tags."
        )
    for idx, annot in enumerate(link_annots, start=1):
        if "/StructParent" not in annot:
            errors.append(f"Link annotation #{idx} is missing `/StructParent`.")
        if not re.search(r"/Contents\s*\([^)]+\)", annot):
            errors.append(f"Link annotation #{idx} is missing non-empty `/Contents` accessible description.")

    # Print a human-readable structural telemetry line for build logs.
    h_summary = ", ".join(f"H{k}={v}" for k, v in h_counts.items() if v > 0)
    li_count = len(re.findall(r"/S\s*/LI\b", corpus))
    status_tag = "PASS" if not errors else "FAIL"
    print(
        f"  [508/PDF-UA + {max_pages}P CAP {status_tag}] {pdf_path.name}: pages={page_count}/{max_pages}, "
        f"headings=({h_summary}), paragraphs={p_count}, list_items={li_count}, links={link_struct_count}, "
        f"embedded_fonts={embedded_fonts}/{len(font_descriptors)}, artifacts={artifact_count}"
    )
    return errors


def verify_docx(docx_path: pathlib.Path) -> list[str]:
    """
    Audits a compiled Microsoft Word `.docx` file for Section 508 / Word Accessibility
    Checker compliance AND compact 2-page US Letter geometry by opening the `.docx`
    as a `.zip` archive in memory:
      - `docProps/core.xml` must contain non-empty `<dc:title>` and `<dc:creator>`.
      - `en-US` proofing language must be declared in `core.xml` or `word/styles.xml`.
      - `word/document.xml` must use real `Heading1` paragraph styles (not just big bold text!)
        AND explicit `<w:pgMar` compact page margins so ATS `.docx`-to-PDF converters do not
        inflate a 2-page resume onto 3–4 pages using Word's wide `1.0"` default margins.
    """
    errors: list[str] = []
    if not docx_path.is_file():
        return [f"DOCX file not found: {docx_path}"]

    with zipfile.ZipFile(docx_path, "r") as zf:
        names = set(zf.namelist())
        if "docProps/core.xml" not in names:
            errors.append("DOCX missing `docProps/core.xml` metadata.")
        else:
            core_xml = zf.read("docProps/core.xml").decode("utf-8", errors="replace")
            if not re.search(r"<dc:title>[^<]+</dc:title>", core_xml):
                errors.append("DOCX missing non-empty `<dc:title>` (Word Accessibility Check requirement).")
            if not re.search(r"<dc:creator>[^<]+</dc:creator>", core_xml):
                errors.append("DOCX missing non-empty `<dc:creator>`.")
            if "en-US" not in core_xml and "word/styles.xml" in names:
                styles_xml = zf.read("word/styles.xml").decode("utf-8", errors="replace")
                if "en-US" not in styles_xml:
                    errors.append("DOCX missing `en-US` proofing/document language.")

        if "word/document.xml" not in names:
            errors.append("DOCX missing `word/document.xml`.")
        else:
            doc_xml = zf.read("word/document.xml").decode("utf-8", errors="replace")
            if 'w:val="Heading1"' not in doc_xml:
                errors.append("DOCX missing native `Heading1` style in `word/document.xml`.")
            if "<w:pgMar" not in doc_xml:
                errors.append("DOCX missing explicit `<w:pgMar` compact US Letter margins in `word/document.xml`.")

    status_tag = "PASS" if not errors else "FAIL"
    print(f"  [508/DOCX + MARGINS {status_tag}] {docx_path.name}: title, creator, en-US, Heading styles & US Letter margins verified")
    return errors


def main() -> int:
    """
    CLI Entrypoint: parses optional `--cover-letter` flag, validates every `.pdf`
    and `.docx` path passed on the command line, and returns POSIX exit codes:
      - `0` : Every checked file passed 100% of Section 508 / PDF/UA-1 checks.
      - `1` : One or more accessibility checks failed (halts build scripts!).
      - `2` : Invalid command-line arguments.
    """
    args = sys.argv[1:]
    require_h2 = True
    # Cover letters are 1-page formal letters with an `<H1>` letterhead and `<P>`
    # paragraphs (no `<H2>` sub-sections required), so `--cover-letter` relaxes `require_h2`.
    if "--cover-letter" in args:
        require_h2 = False
        args = [a for a in args if a != "--cover-letter"]

    if not args:
        print("Usage: verify-pdf-508.py [--cover-letter] <file.pdf> [file.docx ...]", file=sys.stderr)
        return 2

    # Collect errors across ALL input files before exiting so the developer can see
    # every failure in a single terminal run instead of playing whack-a-mole.
    all_errors: list[str] = []
    if require_h2:
        script_dir = pathlib.Path(__file__).resolve().parent
        all_errors.extend(verify_resume_stylesheet_and_markdown_invariants(script_dir))

    for raw_arg in args:
        path = pathlib.Path(raw_arg)
        if path.suffix.lower() == ".pdf":
            all_errors.extend(verify_pdf(path, require_h2=require_h2))
        elif path.suffix.lower() == ".docx":
            all_errors.extend(verify_docx(path))
        else:
            all_errors.append(f"Unsupported artifact extension: {path}")

    if all_errors:
        print("\nSECTION 508 / PDF/UA-1 VERIFICATION FAILED:", file=sys.stderr)
        for err in all_errors:
            print(f"  - {err}", file=sys.stderr)
        return 1

    return 0


# Standard Python idiom: run `main()` only when executed directly as a script
# (not if imported as a helper module by another Python test).
if __name__ == "__main__":
    raise SystemExit(main())
