#!/bin/bash
# ==============================================================================
# Architectural Block: build-resume.sh
# ==============================================================================
# Compiles Markdown resume files (`mragsdale-resume*.md`) into:
#   1. ISO 14289-1 (`PDF/UA-1`), Federal Section 508, & WCAG 2.1 AA Tagged PDFs
#      (via Pandoc semantic HTML5 -> `weasyprint --pdf-variant pdf/ua-1`) with
#      real `<H1>`/`<H2>`/`<H3>` headings, `<L>`/`<LI>` lists, `<Link>` tags,
#      `/Lang (en-US)`, `/DisplayDocTitle true`, `/Tabs /S`, and PDF Bookmarks.
#   2. Accessible Microsoft Word `.docx` packages with explicit `title`,
#      `author`, `lang=en-US` metadata and native `Heading 1..3` styles.
#   3. Verified automatically via `./verify-pdf-508.py` on every build.
#
# Modes:
#   - `./build-resume.sh [file.md]`
#       Builds public email-only `.pdf` and `.docx` in `raggiesoft-assets/...`
#       and mirrors them into local NVMe `_resume/resumes/`.
#   - `./build-resume.sh --portal [file.md]`
#       Injects direct job-portal phone number from local `_resume/portal-contact-profile.md`
#       and writes `<basename>-portal.pdf` + `<basename>-portal.docx` strictly
#       into local `_resume/resumes/` (never synced to public CDN).
# ==============================================================================

set -euo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:/Library/TeX/texbin:$PATH"
cd "$(dirname "$0")"

PORTAL_MODE=false
if [ "${1:-}" = "--portal" ]; then
    PORTAL_MODE=true
    shift
fi

MD_FILE="${1:-mragsdale-resume.md}"
BASENAME="$(basename "$MD_FILE" .md)"
OUTPUT_DIR="$(cd ../../../../_resume/resumes 2>/dev/null && pwd || echo "$(pwd)/../../../../_resume/resumes")"
PORTAL_PROFILE="$(cd ../../../../_resume 2>/dev/null && pwd || echo "$(pwd)/../../../../_resume")/portal-contact-profile.md"
mkdir -p "$OUTPUT_DIR"

DOC_TITLE="Michael P. Ragsdale — Full-Stack Web Developer & Section 508 Accessibility Specialist (Resume)"
DOC_AUTHOR="Michael P. Ragsdale"
DOC_DESC="Accessible Section 508 and PDF/UA-1 resume of Michael P. Ragsdale, Full-Stack Web Developer and Section 508 Accessibility Specialist in Norfolk, VA."

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

SOURCE_MD="$MD_FILE"
if [ "$PORTAL_MODE" = true ]; then
    PORTAL_PHONE="757-289-1609"
    if [ -f "$PORTAL_PROFILE" ]; then
        EXTRACTED_PHONE="$(grep -Eo '[0-9]{3}-[0-9]{3}-[0-9]{4}' "$PORTAL_PROFILE" | head -n 1 || true)"
        if [ -n "$EXTRACTED_PHONE" ]; then
            PORTAL_PHONE="$EXTRACTED_PHONE"
        fi
    fi
    SOURCE_MD="$TMP_DIR/${BASENAME}-portal.md"
    PORTAL_PHONE="$PORTAL_PHONE" python3 - "$MD_FILE" "$SOURCE_MD" <<'PY'
import os, pathlib, sys
src = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8")
phone = os.environ["PORTAL_PHONE"]
digits = "".join(ch for ch in phone if ch.isdigit())
phone_md = f"[{phone}](tel:+1{digits})"
target = "[hello@michaelpragsdale.com](mailto:hello@michaelpragsdale.com)"
if target in src and phone not in src:
    src = src.replace(target, f"{target} | {phone_md}", 1)
pathlib.Path(sys.argv[2]).write_text(src, encoding="utf-8")
PY
    OUT_PDF="$OUTPUT_DIR/${BASENAME}-portal.pdf"
    OUT_DOCX="$OUTPUT_DIR/${BASENAME}-portal.docx"
else
    OUT_PDF="${BASENAME}.pdf"
    OUT_DOCX="${BASENAME}.docx"
fi

TMP_HTML="$TMP_DIR/${BASENAME}.html"

echo "Building PDF/UA-1 & Section 508 Tagged PDF: $OUT_PDF ..."
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

weasyprint \
    --pdf-variant pdf/ua-1 \
    --encoding utf-8 \
    "$TMP_HTML" \
    "$OUT_PDF"

echo "Building Accessible Section 508 DOCX: $OUT_DOCX ..."
pandoc "$SOURCE_MD" \
    -f markdown \
    -t docx \
    --metadata title="$DOC_TITLE" \
    --metadata author="$DOC_AUTHOR" \
    --metadata lang="en-US" \
    -o "$OUT_DOCX"

python3 ./verify-pdf-508.py "$OUT_PDF" "$OUT_DOCX"

if [ "$PORTAL_MODE" = false ]; then
    cp "$OUT_PDF" "$OUTPUT_DIR/"
    cp "$OUT_DOCX" "$OUTPUT_DIR/"
    echo "Done! Verified & mirrored $OUT_PDF and $OUT_DOCX to $OUTPUT_DIR."
else
    echo "Done! Verified portal-only resume (with phone) in $OUTPUT_DIR."
fi
