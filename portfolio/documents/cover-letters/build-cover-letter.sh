#!/bin/bash
# ==============================================================================
# Architectural Block: build-cover-letter.sh
# ==============================================================================
# Compiles Markdown cover letter files into PDF (via pdflatex) directly inside
# the local NVMe `_resume/cover-letters/` workspace directory.
# ==============================================================================

set -e
cd "$(dirname "$0")"

MD_FILE=$1
if [ -z "$MD_FILE" ]; then
    echo "Error: Please provide a cover letter markdown file as an argument."
    exit 1
fi

BASENAME=$(basename "$MD_FILE" .md)
OUTPUT_DIR="$(cd ../../../../_resume/cover-letters 2>/dev/null && pwd || echo "$(pwd)/../../../../_resume/cover-letters")"
mkdir -p "$OUTPUT_DIR"

PDF_FILE="$OUTPUT_DIR/${BASENAME}.pdf"

echo "Building $PDF_FILE from $MD_FILE..."
pandoc "$MD_FILE" -o "$PDF_FILE" --pdf-engine=pdflatex -V geometry:margin=1in

echo "Done! Generated $PDF_FILE"
