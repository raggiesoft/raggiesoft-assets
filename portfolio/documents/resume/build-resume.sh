#!/bin/bash
# ==============================================================================
# Architectural Block: build-resume.sh
# ==============================================================================
# Compiles Markdown resume files (`mragsdale-resume*.md`) into PDF (via pdflatex)
# and DOCX (via Pandoc) inside `raggiesoft-assets/portfolio/documents/resume/`
# and mirrors the compiled artifacts into the local NVMe `_resume/resumes/` folder.
# ==============================================================================

set -e
export PATH="/Library/TeX/texbin:/opt/homebrew/bin:/usr/local/bin:$PATH"
cd "$(dirname "$0")"

MD_FILE=${1:-mragsdale-resume.md}
BASENAME=$(basename "$MD_FILE" .md)

LOCAL_PDF="${BASENAME}.pdf"
LOCAL_DOCX="${BASENAME}.docx"

OUTPUT_DIR="$(cd ../../../../_resume/resumes 2>/dev/null && pwd || echo "$(pwd)/../../../../_resume/resumes")"
mkdir -p "$OUTPUT_DIR"

echo "Building $LOCAL_PDF from $MD_FILE..."
pandoc "$MD_FILE" -o "$LOCAL_PDF" --pdf-engine=pdflatex -V geometry:margin=1in

echo "Building $LOCAL_DOCX from $MD_FILE..."
pandoc "$MD_FILE" -o "$LOCAL_DOCX"

# Copy to application folder
cp "$LOCAL_PDF" "$OUTPUT_DIR/"
cp "$LOCAL_DOCX" "$OUTPUT_DIR/"

echo "Done! Generated $LOCAL_PDF and $LOCAL_DOCX in local folder and copied to $OUTPUT_DIR."
