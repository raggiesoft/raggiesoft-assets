#!/bin/bash
# ==============================================================================
# PLAIN-ENGLISH OVERVIEW FOR NEW DEVELOPERS (READ-ALONG TEACHING HEADER)
# ==============================================================================
# What is this file?
#   This is `build-resume.sh`, an automated Bash shell build script that turns a
#   plain-text Markdown resume (`mragsdale-resume.md`) into two recruiter- and
#   screen-reader-ready documents:
#     1. A Federal Section 508, WCAG 2.1 AA/AAA, and ISO 14289-1 (`PDF/UA-1`)
#        "Tagged PDF" (`mragsdale-resume.pdf`).
#     2. A private, local-only Microsoft Word document (`mragsdale-resume.docx`)
#        saved strictly inside `_resume/resumes/` for job portals that require `.docx`.
#
# Why does this pipeline exist instead of clicking "Save as PDF" in a browser?
#   Most browser "Print to PDF" exports create "untagged" PDFs—just flat x/y paint
#   coordinates on a page with no real headings, lists, or reading order, which
#   causes blind screen-reader users (JAWS, NVDA, VoiceOver) and Applicant Tracking
#   Systems (ATS) to misread the document! This script runs a 5-stage pipeline:
#     Stage 1: Optional `--portal` mode injects Michael's phone number into a
#              temporary Markdown copy (public web resumes only show email to prevent
#              spam calls, while private job-portal uploads include phone).
#     Stage 2: `pandoc` converts Markdown (`#`, `##`, `-`) into semantic HTML5
#              using `pdf-ua-template.html` and `resume-pdf-ua.css`.
#     Stage 3: An inline Python pass wraps hyphenated compound words (like
#              `Full-Stack` or `UTF-8`) in `<span class="nowrap-compound">` so
#              line breaks never corrupt hyphens in ATS text extractors.
#     Stage 4: `weasyprint` (with a custom `pydyf` post-processor) compiles the
#              HTML5 + `@page` print CSS into a fully tagged `PDF/UA-1` file and
#              adds spoken screen-reader descriptions onto every clickable link.
#     Stage 5: `verify-pdf-508.py` programmatically audits the staged PDF and
#              DOCX files inside `$TMP_DIR`—enforcing the **Mandatory USAJOBS.gov
#              2-Page Resume Maximum (`pages <= 2`)** and full Section 508 /
#              PDF/UA-1 compliance BEFORE promoting any file to disk! Running
#              `./build-resume.sh` also automatically builds and verifies the
#              phone-enabled `--portal` USAJOBS edition so neither edition can
#              ever silently drift or spill onto Page 3!
#
# Usage Examples:
#   - `./build-resume.sh`               -> Builds & verifies BOTH public + `--portal` 2-page PDFs & DOCXs
#   - `./build-resume.sh --portal`      -> Builds & verifies private phone-enabled 2-page PDF + DOCX only
# ==============================================================================

# Bash Strict Mode (`set -euo pipefail`)—essential safety net for shell scripts:
#   `-e` : Exit immediately if any command returns a non-zero error code.
#   `-u` : Treat misspelled/unset `$VARIABLES` as fatal errors instead of empty strings.
#   `-o pipefail` : Catch failures inside piped commands (`cmd1 | cmd2`), not just the last command.
set -euo pipefail

# Ensure Homebrew (`/opt/homebrew/bin` on Apple Silicon Macs), `/usr/local/bin`, and TeX
# tools are on `PATH` even when invoked from an IDE button or non-login shell.
export PATH="/opt/homebrew/bin:/usr/local/bin:/Library/TeX/texbin:$PATH"

# Change working directory (`cd`) to the exact folder containing `build-resume.sh` (`$0`)
# so relative paths like `pdf-ua-template.html` and `./verify-pdf-508.py` always resolve.
cd "$(dirname "$0")"

# ------------------------------------------------------------------------------
# 1. PARSE COMMAND-LINE ARGUMENTS (`--portal` FLAG & INPUT MARKDOWN FILE)
# ------------------------------------------------------------------------------
# `${1:-}` reads the first CLI argument, safely defaulting to `""` if none was passed.
# If `--portal` was passed, flip `PORTAL_MODE=true` and `shift` arguments left so `$1`
# becomes the optional filename argument (defaulting to `mragsdale-resume.md`).
PORTAL_MODE=false
if [ "${1:-}" = "--portal" ]; then
    PORTAL_MODE=true
    shift
fi

MD_FILE="${1:-mragsdale-resume.md}"
# `basename "mragsdale-resume.md" .md` strips folder path and `.md` suffix -> `mragsdale-resume`.
BASENAME="$(basename "$MD_FILE" .md)"

# Resolve the private local-only `_resume/resumes` folder on NVMe (`5` parent folders up
# from `raggiesoft-servers/raggiesoft-assets/portfolio/documents/resume`), creating it if needed.
OUTPUT_DIR="$(cd ../../../../../_resume/resumes 2>/dev/null && pwd || echo "$(pwd)/../../../../../_resume/resumes")"
PORTAL_PROFILE="$(cd ../../../../../_resume 2>/dev/null && pwd || echo "$(pwd)/../../../../../_resume")/portal-contact-profile.md"
mkdir -p "$OUTPUT_DIR"

# Document-level XMP & PDF Catalog metadata embedded into both the PDF and DOCX outputs.
DOC_TITLE="Michael P. Ragsdale — Full-Stack Web Developer & Web Accessibility Engineer (Resume)"
DOC_AUTHOR="Michael P. Ragsdale"
DOC_DESC="Resume of Michael P. Ragsdale, Full-Stack Web Developer and Web Accessibility Engineer in Norfolk, VA specializing in TypeScript, PHP 8.5, Angular, React, C#/.NET, Win32 C++20, SwiftUI, RaggieSoft Studio, and code-level WCAG 2.1/2.2 AA & Section 508 web compliance."

# Create an isolated temporary directory in `/tmp` (or macOS `/var/folders/...`) for
# intermediate HTML files. `trap ... EXIT` works like `try / finally` in JavaScript:
# Bash automatically deletes `$TMP_DIR` when the script finishes OR crashes!
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

# ------------------------------------------------------------------------------
# 2. OPTIONAL PORTAL PHONE INJECTION (`--portal` MODE ONLY)
# ------------------------------------------------------------------------------
SOURCE_MD="$MD_FILE"
if [ "$PORTAL_MODE" = true ]; then
    # Default phone fallback; if `_resume/portal-contact-profile.md` exists on disk,
    # extract the first `NNN-NNN-NNNN` phone number from it via `grep -Eo`.
    PORTAL_PHONE="757-289-1609"
    if [ -f "$PORTAL_PROFILE" ]; then
        EXTRACTED_PHONE="$(grep -Eo '[0-9]{3}-[0-9]{3}-[0-9]{4}' "$PORTAL_PROFILE" | head -n 1 || true)"
        if [ -n "$EXTRACTED_PHONE" ]; then
            PORTAL_PHONE="$EXTRACTED_PHONE"
        fi
    fi
    SOURCE_MD="$TMP_DIR/${BASENAME}-portal.md"

    # Run a short inline Python script (`<<'PY' ... PY` is a single-quoted "heredoc" that
    # passes everything up to `PY` into Python's stdin without Bash expanding `$` characters).
    PORTAL_PHONE="$PORTAL_PHONE" python3 - "$MD_FILE" "$SOURCE_MD" <<'PY'
import os, pathlib, sys
# Read original Markdown resume (`sys.argv[1]`) as UTF-8 text
src = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8")
phone = os.environ["PORTAL_PHONE"]
# Strip hyphens to build a clickable `tel:+1...` hyperlink alongside the visible number
digits = "".join(ch for ch in phone if ch.isdigit())
phone_md = f"[{phone}](tel:+1{digits})"
target = "[hello@michaelpragsdale.com](mailto:hello@michaelpragsdale.com)"
# Splice `| [phone](tel:+1...)` immediately after the email link (once) if not already present
if target in src and phone not in src:
    src = src.replace(target, f"{target} | {phone_md}", 1)
pathlib.Path(sys.argv[2]).write_text(src, encoding="utf-8")
PY
    # Portal artifacts include private phone contact info, so BOTH `.pdf` and `.docx`
    # stay strictly inside local `_resume/resumes/` (never synced to public CDN!).
    OUT_PDF="$OUTPUT_DIR/${BASENAME}-portal.pdf"
    OUT_DOCX="$OUTPUT_DIR/${BASENAME}-portal.docx"
else
    # Public mode writes `mragsdale-resume.pdf` into this public `raggiesoft-assets` folder,
    # while keeping `.docx` strictly inside local `_resume/resumes/` so third-party
    # recruiters cannot download and alter an editable Word file from the public web.
    OUT_PDF="${BASENAME}.pdf"
    # DOCX is ALWAYS generated strictly in local `_resume/resumes/`, never in public `raggiesoft-assets/`
    OUT_DOCX="$OUTPUT_DIR/${BASENAME}.docx"
fi

TMP_HTML="$TMP_DIR/${BASENAME}.html"
# Atomic Staging Paths: WeasyPrint and Pandoc write into `$TMP_DIR` FIRST.
# If `verify-pdf-508.py` detects `pages > 2` (violating USAJOBS.gov's 2-page limit)
# or any missing Section 508 tag, the script aborts BEFORE overwriting `$OUT_PDF` or `$OUT_DOCX`!
STAGE_PDF="$TMP_DIR/${BASENAME}.pdf"
STAGE_DOCX="$TMP_DIR/${BASENAME}.docx"

# ------------------------------------------------------------------------------
# 3. STAGE A: PANDOC MARKDOWN -> SEMANTIC HTML5 CONVERSION
# ------------------------------------------------------------------------------
# Pandoc parses `$SOURCE_MD` (`-f markdown`) and renders a complete standalone HTML5
# document (`-t html5 --standalone`) wrapped in `pdf-ua-template.html`, linking
# `resume-pdf-ua.css` and populating language, `<title>`, author, and description metadata.
echo "Building PDF/UA-1 & Section 508 Tagged PDF (USAJOBS <= 2-Page Cap): $OUT_PDF ..."
pandoc "$SOURCE_MD" \
    -f markdown \
    -t html5 \
    --standalone \
    --template="pdf-ua-template.html" \
    --css="$(pwd)/resume-pdf-ua.css" \
    --metadata lang="en-US" \
    --metadata pagetitle="$DOC_TITLE" \
    --metadata author-meta="$DOC_AUTHOR" \
    --metadata description-meta="$DOC_DESC" \
    -o "$TMP_HTML"

# ------------------------------------------------------------------------------
# 4. STAGE B: ATS-SAFE HYPHENATED COMPOUND PROTECTION
# ------------------------------------------------------------------------------
# Subtle PDF Pitfall Explained:
#   When Pango/WeasyPrint breaks a hyphenated word like `Full-Stack` or `Section-508`
#   across the right margin of a line, some fonts emit a typographic end-of-line hyphen
#   glyph that older Applicant Tracking System (ATS) text parsers misread as `U+FFFD` ().
#   The Python snippet below walks only the visible prose inside `<main>...</main>`
#   (skipping inside `<a ...>` URLs and `<code>` blocks!) and wraps hyphenated words in
#   `<span class="nowrap-compound">...</span>` (`white-space: nowrap` in CSS).
python3 - "$TMP_HTML" <<'PY'
import pathlib, re, sys
p = pathlib.Path(sys.argv[1])
html = p.read_text(encoding="utf-8")
body_start = html.find("<main>")
body_end = html.rfind("</main>")
if body_start != -1 and body_end != -1:
    prefix = html[:body_start]
    main_html = html[body_start:body_end]
    suffix = html[body_end:]
    # Split into alternating plain-text and `<tag>` tokens so HTML attributes are never modified
    parts = re.split(r"(<[^>]+>)", main_html)
    in_code_or_a = 0
    for idx, tok in enumerate(parts):
        if tok.startswith("<"):
            low = tok.lower()
            # Track nesting depth inside `<a>` or `<code>` elements
            if re.match(r"^<(a|code)\b", low):
                in_code_or_a += 1
            elif re.match(r"^</(a|code)\b", low):
                in_code_or_a = max(0, in_code_or_a - 1)
        elif in_code_or_a == 0:
            # Wrap ASCII hyphenated compounds (`Full-Stack`, `PDF/UA-1`'s `UA-1`, etc.)
            parts[idx] = re.sub(
                r"\b([A-Za-z0-9]+(?:-[A-Za-z0-9]+)+)\b",
                r'<span class="nowrap-compound">\1</span>',
                tok,
            )
    p.write_text(prefix + "".join(parts) + suffix, encoding="utf-8")
PY

# ------------------------------------------------------------------------------
# 5. STAGE C: WEASYPRINT + PYDYF ISO 14289-1 (`PDF/UA-1`) COMPILATION
# ------------------------------------------------------------------------------
# Why inspect the `#!` shebang line of the `weasyprint` executable (`WEASY_PY`)?
#   On macOS Homebrew, `weasyprint` is installed inside its own isolated Python
#   virtualenv alongside `pydyf` (WeasyPrint's low-level PDF dictionary builder).
#   Running WeasyPrint's own Python interpreter lets us pass a custom `finisher`
#   callback that inspects every `/Subtype /Link` PDF dictionary right before saving
#   and adds a human-friendly `/Contents` tooltip/screen-reader description (e.g.,
#   `"Email Michael P. Ragsdale at hello@michaelpragsdale.com"`), satisfying strict
#   Section 508 & PAC hyperlink accessibility checks!
WEASY_BIN="$(command -v weasyprint)"
WEASY_PY="$(head -n 1 "$WEASY_BIN" | sed -n 's/^#!//p' || true)"
if [ -n "$WEASY_PY" ] && [ -x "$WEASY_PY" ]; then
    "$WEASY_PY" - "$TMP_HTML" "$STAGE_PDF" <<'PY'
import sys, pydyf, weasyprint

# Translates raw `mailto:`, `tel:`, and `https://` URIs into clear spoken link descriptions
def describe_uri(raw: str) -> str:
    if raw.startswith("mailto:"):
        addr = raw[len("mailto:"):]
        return f"Email Michael P. Ragsdale at {addr}"
    if raw.startswith("tel:"):
        num = raw[len("tel:"):].lstrip("+1")
        if len(num) == 10:
            num = f"{num[:3]}-{num[3:6]}-{num[6:]}"
        return f"Call Michael P. Ragsdale at {num}"
    known = {
        "https://michaelpragsdale.com": "Michael P. Ragsdale portfolio website (michaelpragsdale.com)",
        "https://raggiesoft.dev": "RaggieSoft open-source developer and compiler hub (raggiesoft.dev)",
        "https://raggiesoftstudio.com": "RaggieSoft Studio developer, packaging, and accessibility suite (raggiesoftstudio.com)",
        "https://github.com/raggiesoft": "RaggieSoft GitHub profile (github.com/raggiesoft)",
        "https://raggiesoft.com": "RaggieSoft Media website (raggiesoft.com)",
    }
    clean = raw.rstrip("/")
    if clean in known:
        return known[clean]
    return f"Visit {raw}"

# Low-level PDF post-processor: attaches `/Contents (...)` onto every clickable `/Link` annotation
def finisher(document, pdf):
    for obj in pdf.objects:
        if isinstance(obj, pydyf.Dictionary) and obj.get("Subtype") == "/Link" and "A" in obj:
            action = obj["A"]
            if isinstance(action, pydyf.Dictionary) and "URI" in action:
                uri_bytes = action["URI"].string
                uri_str = uri_bytes.decode("utf-8", errors="replace") if isinstance(uri_bytes, bytes) else str(uri_bytes)
                obj["Contents"] = pydyf.String(describe_uri(uri_str))

# Render HTML + `@page` print CSS into an ISO 14289-1 (`pdf/ua-1`) Tagged PDF
weasyprint.HTML(filename=sys.argv[1], encoding="utf-8").write_pdf(
    sys.argv[2],
    pdf_variant="pdf/ua-1",
    finisher=finisher,
)
PY
else
    # Fallback if `weasyprint` is a compiled binary rather than a Python script wrapper
    weasyprint \
        --pdf-variant pdf/ua-1 \
        --encoding utf-8 \
        "$TMP_HTML" \
        "$STAGE_PDF"
fi

# ------------------------------------------------------------------------------
# 6. STAGE D: PRIVATE LOCAL-ONLY ACCESSIBLE 2-PAGE WORD (`.docx`) GENERATION
# ------------------------------------------------------------------------------
# Converts the exact same Markdown source into a clean, single-column Word `.docx`
# with native `Heading 1` / `Heading 2` / `Heading 3` styles and `en-US` metadata,
# then injects explicit US Letter (`0.5in` top/bottom, `0.6in` left/right) margins
# and compact `9.5pt` typography so ATS `.docx`-to-PDF renderers ALSO stay `<= 2` pages!
echo "Building Local-Only Accessible Section 508 DOCX (2-page geometry): $OUT_DOCX ..."
pandoc "$SOURCE_MD" \
    -f markdown \
    -t docx \
    --metadata title="$DOC_TITLE" \
    --metadata author="$DOC_AUTHOR" \
    --metadata lang="en-US" \
    -o "$STAGE_DOCX"

python3 - "$STAGE_DOCX" <<'PY'
import pathlib, re, sys, zipfile

docx_path = pathlib.Path(sys.argv[1])
tmp_zip = docx_path.with_suffix(".tuned.docx")

# In Office Open XML (`twips`, where `1 inch = 1440 twips`):
# - US Letter (`8.5in x 11in`) = `w:w="12240" w:h="15840"`
# - Margins matching `resume-pdf-ua.css` (`0.5in` top/bottom, `0.6in` sides) = `720` / `864` twips
PG_SETUP_XML = (
    '<w:pgSz w:w="12240" w:h="15840"/>'
    '<w:pgMar w:top="720" w:right="864" w:bottom="720" w:left="864" '
    'w:header="360" w:footer="360" w:gutter="0"/>'
)

with zipfile.ZipFile(docx_path, "r") as zin, zipfile.ZipFile(tmp_zip, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        raw = zin.read(item.filename)
        if item.filename == "word/document.xml":
            xml = raw.decode("utf-8")
            if "<w:pgMar" not in xml:
                xml = re.sub(r"(<w:sectPr\b[^>]*>)", r"\1" + PG_SETUP_XML, xml, count=1)
            raw = xml.encode("utf-8")
        elif item.filename == "word/styles.xml":
            xml = raw.decode("utf-8")
            # Tighten Pandoc's default `12pt` (`w:val="24"`) body font & wide `w:after="200"`
            # paragraph spacing to `9.5pt` (`w:val="19"`) and `3pt` (`w:after="60"`) so `.docx`
            # stays cleanly within the 2-page USAJOBS limit just like the WeasyPrint PDF!
            xml = re.sub(r'<w:sz w:val="24"\s*/>', '<w:sz w:val="19"/>', xml)
            xml = re.sub(r'<w:szCs w:val="24"\s*/>', '<w:szCs w:val="19"/>', xml)
            xml = re.sub(r'w:after="200"', 'w:after="60"', xml)
            raw = xml.encode("utf-8")
        zout.writestr(item, raw)

tmp_zip.replace(docx_path)
PY

# ------------------------------------------------------------------------------
# 7. STAGE E: MANDATORY USAJOBS 2-PAGE + SECTION 508 GATE & ATOMIC PROMOTION
# ------------------------------------------------------------------------------
# Audit both staged artifacts inside `$TMP_DIR` FIRST. Because `set -e` is active,
# if `verify-pdf-508.py` detects `pages > 2` or any accessibility defect (`exit 1`),
# the build halts right here and existing files on disk remain 100% untouched!
python3 ./verify-pdf-508.py "$STAGE_PDF" "$STAGE_DOCX"

cp "$STAGE_PDF" "$OUT_PDF"
cp "$STAGE_DOCX" "$OUT_DOCX"

if [ "$PORTAL_MODE" = false ]; then
    # Mirror the verified public PDF into local `_resume/resumes/` alongside the `.docx`.
    cp "$OUT_PDF" "$OUTPUT_DIR/"
    echo "Done! Verified 2-page public PDF ($OUT_PDF) and mirrored PDF + local-only DOCX to $OUTPUT_DIR."

    # Automatically build & verify the phone-included USAJOBS `--portal` edition too
    # (unless suppressed via `RS_SKIP_AUTO_PORTAL=1`) so adding the phone number can
    # NEVER silently push `mragsdale-resume-portal.pdf` onto a 3rd page!
    if [ "${RS_SKIP_AUTO_PORTAL:-0}" != "1" ]; then
        echo "Verifying USAJOBS / Portal phone-enabled edition (<= 2-page cap)..."
        RS_SKIP_AUTO_PORTAL=1 "$0" --portal "$MD_FILE"
    fi
else
    echo "Done! Verified 2-page portal-only PDF & DOCX (with phone) in $OUTPUT_DIR."
fi
