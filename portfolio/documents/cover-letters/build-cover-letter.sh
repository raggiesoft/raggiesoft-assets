#!/bin/bash
# ==============================================================================
# Architectural Block: build-cover-letter.sh
# ==============================================================================
# Compiles Markdown cover letter files into ISO 14289-1 (`PDF/UA-1`), Section 508,
# and WCAG 2.1 AA Tagged PDFs inside local NVMe `_resume/cover-letters/` and
# validates real heading/paragraph/link structure via `../resume/verify-pdf-508.py`.
# ==============================================================================

set -euo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:/Library/TeX/texbin:$PATH"
cd "$(dirname "$0")"

MD_FILE="${1:-}"
if [ -z "$MD_FILE" ]; then
    echo "Error: Please provide a cover letter markdown file as an argument."
    exit 1
fi

BASENAME="$(basename "$MD_FILE" .md)"
OUTPUT_DIR="$(cd ../../../../_resume/cover-letters 2>/dev/null && pwd || echo "$(pwd)/../../../../_resume/cover-letters")"
mkdir -p "$OUTPUT_DIR"

PDF_FILE="$OUTPUT_DIR/${BASENAME}.pdf"
DOC_TITLE="Michael P. Ragsdale — Cover Letter (${BASENAME})"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT
TMP_HTML="$TMP_DIR/${BASENAME}.html"

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

weasyprint \
    --pdf-variant pdf/ua-1 \
    --encoding utf-8 \
    "$TMP_HTML" \
    "$PDF_FILE"

python3 ../resume/verify-pdf-508.py --cover-letter "$PDF_FILE"
echo "Done! Generated and verified $PDF_FILE"
