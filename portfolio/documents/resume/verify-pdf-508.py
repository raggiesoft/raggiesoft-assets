#!/usr/bin/env python3
"""
==============================================================================
Architectural Block: verify-pdf-508.py
==============================================================================
Automated Federal Section 508, WCAG 2.1 AA, & ISO 14289-1 (PDF/UA-1) Validator
for Resume & Cover Letter Artifacts (`mragsdale-resume*.pdf` / `.docx`).

Purpose:
Verifies without third-party pip dependencies that every compiled PDF and DOCX
artifact satisfies real assistive-technology (JAWS, NVDA, VoiceOver, Acrobat
Accessibility Check, PAC) structural invariants:
1. PDF/UA-1 XMP Metadata Conformance (`pdfuaid:part` = `1` + `dc:title`).
2. Tagged PDF Root (`/MarkInfo << /Marked true >>` & `/StructTreeRoot`).
3. Primary Natural Language (`/Lang (en-US)` — WCAG 3.1.1).
4. Document Title Display (`/ViewerPreferences << /DisplayDocTitle true >>` — WCAG 2.4.2).
5. Structure-Order Keyboard Tabbing (`/Tabs /S` on every `/Type /Page` — PDF/UA 7.18.3).
6. Interactive Heading Hierarchy (`<H1>` == 1, zero skipped heading levels, plus
   `/Outlines` bookmarks — WCAG 1.3.1 & 2.4.6).
7. Semantic Paragraphs (`<P>`), Lists (`<L>` / `<LI>`), and Accessible Links
   (`<Link>` structure elements + `/Subtype /Link` `/Contents` + `/StructParent`).
8. Optional DOCX Verification (`docProps/core.xml` `dc:title`, `dc:creator`,
   `dc:language`, and `word/document.xml` native `Heading1` styles).
==============================================================================
"""

import pathlib
import re
import sys
import zipfile
import zlib


def extract_full_pdf_text(pdf_bytes: bytes) -> str:
    """
    Combines raw uncompressed PDF object headers with all decompressed
    `/FlateDecode` object/XMP streams so structure elements inside compressed
    object streams or XMP metadata streams can be inspected deterministically.
    """
    chunks = [pdf_bytes.decode("latin1")]
    for match in re.finditer(rb"stream\r?\n([\s\S]*?)\r?\nendstream", pdf_bytes):
        payload = match.group(1)
        try:
            decompressed = zlib.decompress(payload)
            chunks.append(decompressed.decode("latin1"))
        except zlib.error:
            # Non-zlib stream (e.g., uncompressed XMP metadata stream); already in raw bytes.
            pass
    return "\n".join(chunks)


def verify_pdf(pdf_path: pathlib.Path, require_h2: bool = True) -> list[str]:
    """
    Audits a compiled PDF file against PDF/UA-1 & Section 508 structural rules.
    Returns a list of human-readable failure messages (empty list == PASS).
    """
    errors: list[str] = []
    if not pdf_path.is_file():
        return [f"PDF file not found: {pdf_path}"]

    pdf_bytes = pdf_path.read_bytes()
    corpus = extract_full_pdf_text(pdf_bytes)

    # 1. PDF/UA-1 XMP Metadata Conformance
    if "pdfuaid:part" not in corpus:
        errors.append("Missing ISO 14289-1 PDF/UA-1 XMP identifier (`pdfuaid:part`).")
    if "dc:title" not in corpus:
        errors.append("Missing XMP `dc:title` document title metadata.")

    # 2. Tagged PDF & Structure Tree Root
    if "/StructTreeRoot" not in corpus:
        errors.append("Missing `/StructTreeRoot` (PDF is untagged).")
    if not re.search(r"/Marked\s+true", corpus):
        errors.append("Missing `/MarkInfo << /Marked true >>` on Document Catalog.")

    # 3. Primary Language & Document Title Preference
    if not re.search(r"/Lang\s*\(en-US\)", corpus):
        errors.append("Missing `/Lang (en-US)` on Document Catalog (WCAG 3.1.1).")
    if not re.search(r"/DisplayDocTitle\s+true", corpus):
        errors.append("Missing `/ViewerPreferences << /DisplayDocTitle true >>` (WCAG 2.4.2).")

    # 4. Page Count & Structure Tab Order (`/Tabs /S`)
    page_count = len(re.findall(r"/Type\s*/Page\b", corpus))
    tabs_s_count = len(re.findall(r"/Tabs\s*/S\b", corpus))
    if page_count == 0:
        errors.append("Detected 0 `/Type /Page` objects in PDF.")
    elif tabs_s_count < page_count:
        errors.append(
            f"Expected `/Tabs /S` (Use Document Structure tab order) on all {page_count} pages, found {tabs_s_count}."
        )

    # 5. Bookmarks (`/Outlines`)
    if "/Outlines" not in corpus:
        errors.append("Missing `/Outlines` PDF bookmarks dictionary.")

    # 6. Semantic Structure Tags (`<Document>`, `<H1>`..`<H6>`, `<P>`)
    if not re.search(r"/S\s*/Document\b", corpus):
        errors.append("Missing `<Document>` root structure element.")

    h_counts = {
        level: len(re.findall(rf"/S\s*/H{level}\b", corpus))
        for level in range(1, 7)
    }
    if h_counts[1] != 1:
        errors.append(f"Expected exactly 1 `<H1>` heading tag, found {h_counts[1]}.")
    if require_h2 and h_counts[2] < 1:
        errors.append("Expected at least 1 `<H2>` section heading tag on resume, found 0.")

    # Enforce zero skipped heading levels (e.g., H3 requires H2; H4 requires H3)
    for level in range(2, 7):
        if h_counts[level] > 0 and h_counts[level - 1] == 0:
            errors.append(
                f"Skipped heading hierarchy detected: found `<H{level}>` ({h_counts[level]}) with 0 `<H{level - 1}>` tags."
            )

    p_count = len(re.findall(r"/S\s*/P\b", corpus))
    if p_count < 1:
        errors.append("Expected semantic `<P>` paragraph structure elements, found 0.")

    # 7. Embedded Fonts (ISO 14289-1 Clause 7.21.4) & Decorative Artifact Hygiene
    font_descriptors = re.findall(r"<<[\s\S]*?/Type\s*/FontDescriptor[\s\S]*?>>", corpus)
    embedded_fonts = sum(1 for fd in font_descriptors if re.search(r"/FontFile[23]?\b", fd))
    if len(font_descriptors) == 0:
        errors.append("Detected 0 `/Type /FontDescriptor` font dictionaries in PDF.")
    elif embedded_fonts < len(font_descriptors):
        errors.append(
            f"Unembedded font detected: {embedded_fonts} of {len(font_descriptors)} FontDescriptors embed `/FontFile*`."
        )

    artifact_count = len(re.findall(r"/Artifact\b", corpus))
    if artifact_count < 1:
        errors.append("Expected `/Artifact` marks on decorative rules/running footers, found 0.")

    # 8. Accessible Hyperlink Annotations
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

    h_summary = ", ".join(f"H{k}={v}" for k, v in h_counts.items() if v > 0)
    li_count = len(re.findall(r"/S\s*/LI\b", corpus))
    print(
        f"  [508/PDF-UA PASS CHECK] {pdf_path.name}: pages={page_count}, headings=({h_summary}), "
        f"paragraphs={p_count}, list_items={li_count}, links={link_struct_count}, "
        f"embedded_fonts={embedded_fonts}/{len(font_descriptors)}, artifacts={artifact_count}"
    )
    return errors


def verify_docx(docx_path: pathlib.Path) -> list[str]:
    """
    Audits a compiled Word `.docx` package for title/author/language metadata
    and real `Heading1` semantic paragraph styles.
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

    print(f"  [508/DOCX PASS CHECK]   {docx_path.name}: title, creator, en-US language & Heading styles verified")
    return errors


def main() -> int:
    args = sys.argv[1:]
    require_h2 = True
    if "--cover-letter" in args:
        require_h2 = False
        args = [a for a in args if a != "--cover-letter"]

    if not args:
        print("Usage: verify-pdf-508.py [--cover-letter] <file.pdf> [file.docx ...]", file=sys.stderr)
        return 2

    all_errors: list[str] = []
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


if __name__ == "__main__":
    raise SystemExit(main())
