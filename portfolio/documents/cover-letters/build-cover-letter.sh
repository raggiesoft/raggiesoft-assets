#!/bin/bash
# ==============================================================================
# PLAIN-ENGLISH OVERVIEW FOR NEW DEVELOPERS (READ-ALONG TEACHING HEADER)
# ==============================================================================
# What is this file?
#   This is `build-cover-letter.sh`, the companion Bash build script to
#   `../resume/build-resume.sh`. It compiles a Markdown cover letter (`.md`)
#   into both an **ISO 14289-1 (`PDF/UA-1`) / Federal Section 508 Tagged PDF**
#   and an accessible **Microsoft Word `.docx`** file inside the private local
#   career folder (`_resume/cover-letters/`).
#
# Why does it exist in the ecosystem?
#   Just like resumes, cover letters submitted to federal, university, and
#   enterprise engineering teams must be 100% accessible to assistive technologies
#   (JAWS, NVDA, VoiceOver) and cleanly parseable by Applicant Tracking Systems (ATS).
#   Because cover letters are tailored to specific employers, they are NEVER
#   published to the public CDN (`raggiesoft-assets/`)—this script outputs both
#   `.pdf` and `.docx` strictly into local `_resume/cover-letters/`.
#
# How the 4-Stage Pipeline Works:
#   1. `pandoc` converts the Markdown cover letter into semantic HTML5 using
#      the shared `../resume/pdf-ua-template.html` and `cover-letter-pdf-ua.css`.
#   2. An inline Python script wraps hyphenated compound words (`Full-Stack`,
#      `Section-508`, etc.) in `<span class="nowrap-compound">` so line wraps
#      never trigger ATS hyphen-extraction bugs.
#   3. `weasyprint` + `pydyf` compiles the HTML5 + `@page` print CSS into a
#      tagged `PDF/UA-1` file with spoken `/Contents` descriptions on every link,
#      while `pandoc` generates the companion `.docx`.
#   4. `../resume/verify-pdf-508.py --cover-letter` audits both files automatically!
#
# Usage:
#   `./build-cover-letter.sh path/to/company-cover-letter.md`
# ==============================================================================

# Bash Strict Mode: stop immediately on any command failure (`-e`), undefined
# variable (`-u`), or failed pipeline stage (`-o pipefail`).
set -euo pipefail

# Ensure Homebrew (`/opt/homebrew/bin`) and standard CLI locations are on `PATH`.
export PATH="/opt/homebrew/bin:/usr/local/bin:/Library/TeX/texbin:$PATH"

# Move into `build-cover-letter.sh`'s own directory so relative paths (`../resume/...`
# and `cover-letter-pdf-ua.css`) work from any caller directory.
cd "$(dirname "$0")"

# ------------------------------------------------------------------------------
# 1. VALIDATE REQUIRED INPUT ARGUMENT & RESOLVE LOCAL OUTPUT PATHS
# ------------------------------------------------------------------------------
# Cover letters don't have a single default filename, so require `$1` explicitly.
MD_FILE="${1:-}"
if [ -z "$MD_FILE" ]; then
    echo "Error: Please provide a cover letter markdown file as an argument."
    exit 1
fi

# Extract filename stem without `.md` and ensure local `_resume/cover-letters/` exists.
BASENAME="$(basename "$MD_FILE" .md)"
OUTPUT_DIR="$(cd ../../../../../_resume/cover-letters 2>/dev/null && pwd || echo "$(pwd)/../../../../../_resume/cover-letters")"
mkdir -p "$OUTPUT_DIR"

PDF_FILE="$OUTPUT_DIR/${BASENAME}.pdf"
DOCX_FILE="$OUTPUT_DIR/${BASENAME}.docx"
DOC_TITLE="Michael P. Ragsdale — Cover Letter (${BASENAME})"

# Create a self-cleaning temporary directory (`trap ... EXIT` deletes it even on error).
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT
TMP_HTML="$TMP_DIR/${BASENAME}.html"

# ------------------------------------------------------------------------------
# 2. STAGE A: PANDOC MARKDOWN -> SEMANTIC HTML5 CONVERSION
# ------------------------------------------------------------------------------
# Reuses the clean `../resume/pdf-ua-template.html` skeleton paired with the
# formal business-letter print stylesheet (`cover-letter-pdf-ua.css`).
echo "Building PDF/UA-1 & Section 508 Cover Letter: $PDF_FILE ..."
pandoc "$MD_FILE" \
    -f markdown \
    -t html5 \
    --standalone \
    --template="../resume/pdf-ua-template.html" \
    --css="$(pwd)/cover-letter-pdf-ua.css" \
    --metadata lang="en-US" \
    --metadata pagetitle="$DOC_TITLE" \
    --metadata author-meta="Michael P. Ragsdale" \
    -o "$TMP_HTML"

# ------------------------------------------------------------------------------
# 3. STAGE B: ATS-SAFE HYPHENATED COMPOUND PROTECTION
# ------------------------------------------------------------------------------
# Wraps hyphenated technical words inside `<main>...</main>` (excluding `<a>` and
# `<code>` tags) with `<span class="nowrap-compound">` so WeasyPrint never splits
# them across a line break with a glyph that ATS parsers misread as `U+FFFD`.
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
    # Tokenize into HTML tags vs text nodes so URLs in `href="..."` are untouched
    parts = re.split(r"(<[^>]+>)", main_html)
    in_code_or_a = 0
    for idx, tok in enumerate(parts):
        if tok.startswith("<"):
            low = tok.lower()
            if re.match(r"^<(a|code)\b", low):
                in_code_or_a += 1
            elif re.match(r"^</(a|code)\b", low):
                in_code_or_a = max(0, in_code_or_a - 1)
        elif in_code_or_a == 0:
            parts[idx] = re.sub(
                r"\b([A-Za-z0-9]+(?:-[A-Za-z0-9]+)+)\b",
                r'<span class="nowrap-compound">\1</span>',
                tok,
            )
    p.write_text(prefix + "".join(parts) + suffix, encoding="utf-8")
PY

# ------------------------------------------------------------------------------
# 4. STAGE C: WEASYPRINT + PYDYF ISO 14289-1 (`PDF/UA-1`) COMPILATION
# ------------------------------------------------------------------------------
# Uses WeasyPrint's Python environment + `pydyf` `finisher` hook to emit a tagged
# `pdf/ua-1` document and inject spoken `/Contents` labels onto every `/Link` object.
WEASY_BIN="$(command -v weasyprint)"
WEASY_PY="$(head -n 1 "$WEASY_BIN" | sed -n 's/^#!//p' || true)"
if [ -n "$WEASY_PY" ] && [ -x "$WEASY_PY" ]; then
    "$WEASY_PY" - "$TMP_HTML" "$PDF_FILE" <<'PY'
import sys, pydyf, weasyprint

# Human-readable link descriptions announced by JAWS, NVDA, and VoiceOver
def describe_uri(raw: str) -> str:
    if raw.startswith("mailto:"):
        return f"Email Michael P. Ragsdale at {raw[len('mailto:'):]}"
    if raw.startswith("tel:"):
        return f"Call Michael P. Ragsdale at {raw[len('tel:'):]}"
    known = {
        "https://michaelpragsdale.com": "Michael P. Ragsdale portfolio website (michaelpragsdale.com)",
        "https://github.com/raggiesoft": "RaggieSoft GitHub profile (github.com/raggiesoft)",
        "https://raggiesoft.com": "RaggieSoft Media website (raggiesoft.com)",
    }
    clean = raw.rstrip("/")
    return known.get(clean, f"Visit {raw}")

# Walk every PDF dictionary before writing to disk and populate `/Contents` on links
def finisher(document, pdf):
    for obj in pdf.objects:
        if isinstance(obj, pydyf.Dictionary) and obj.get("Subtype") == "/Link" and "A" in obj:
            action = obj["A"]
            if isinstance(action, pydyf.Dictionary) and "URI" in action:
                uri_bytes = action["URI"].string
                uri_str = uri_bytes.decode("utf-8", errors="replace") if isinstance(uri_bytes, bytes) else str(uri_bytes)
                obj["Contents"] = pydyf.String(describe_uri(uri_str))

weasyprint.HTML(filename=sys.argv[1], encoding="utf-8").write_pdf(
    sys.argv[2],
    pdf_variant="pdf/ua-1",
    finisher=finisher,
)
PY
else
    weasyprint \
        --pdf-variant pdf/ua-1 \
        --encoding utf-8 \
        "$TMP_HTML" \
        "$PDF_FILE"
fi

# ------------------------------------------------------------------------------
# 5. STAGE D: ACCESSIBLE WORD `.docx` GENERATION & SECTION 508 AUDIT
# ------------------------------------------------------------------------------
pandoc "$MD_FILE" \
    -f markdown \
    -t docx \
    --metadata title="$DOC_TITLE" \
    --metadata author="Michael P. Ragsdale" \
    --metadata lang="en-US" \
    -o "$DOCX_FILE"

# Pass `--cover-letter` so `verify-pdf-508.py` verifies `<H1>`, `<P>`, links, fonts,
# language, and tab order without requiring resume-style `<H2>` sub-headings.
python3 ../resume/verify-pdf-508.py --cover-letter "$PDF_FILE" "$DOCX_FILE"
echo "Done! Generated and verified $PDF_FILE and $DOCX_FILE"
