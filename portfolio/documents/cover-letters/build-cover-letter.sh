#!/bin/bash
# Build script for cover letters
# Usage: ./build-cover-letter.sh [input-markdown-file]

cd "$(dirname "$0")"

MD_FILE=$1
if [ -z "$MD_FILE" ]; then
    echo "Error: Please provide a cover letter markdown file as an argument."
    exit 1
fi

BASENAME=$(basename "$MD_FILE" .md)
OUTPUT_DIR="/Users/michael/Library/CloudStorage/OneDrive-raggiesoft.com/raggiesoft-servers/_resume/cover-letters"
mkdir -p "$OUTPUT_DIR"

PDF_FILE="$OUTPUT_DIR/${BASENAME}.pdf"

echo "Building $PDF_FILE from $MD_FILE..."
pandoc "$MD_FILE" -o "$PDF_FILE" --pdf-engine=pdflatex -V geometry:margin=1in

echo "Done! Generated $PDF_FILE"
