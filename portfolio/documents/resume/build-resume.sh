#!/bin/bash
# ==============================================================================
# Architectural Block: build-resume.sh
# ==============================================================================
# Compiles Markdown resume files (`mragsdale-resume*.md`) into:
#   1. ISO 14289-1 (`PDF/UA-1`), Federal Section 508, & WCAG 2.1 AA Tagged PDFs
#      (via Pandoc semantic HTML5 -> `weasyprint --pdf-variant pdf/ua-1`) with
#      real `<H1>`/`<H2>`/`<H3>` headings, `<L>`/`<LI>` lists, `<Link>` tags,
#      `/Lang (en-US)`, `/DisplayDocTitle true`, `/Tabs /S`, PDF Bookmarks, and
#      unbroken hyphenated compounds for 100% clean ATS ASCII text extraction.
#   2. Private Local-Only Accessible Microsoft Word `.docx` packages inside
#      `_resume/resumes/` (NEVER published to `raggiesoft-assets/` or the public
#      CDN, preventing unauthorized recruiter re-editing while keeping a clean
#      single-column `.docx` ready on local NVMe for DOCX-only ATS portals).
#   3. Verified automatically via `./verify-pdf-508.py` on every build.
#
# Modes:
#   - `./build-resume.sh [file.md]`
#       Builds public email-only `.pdf` in `raggiesoft-assets/...` and mirrors
#       both `.pdf` and local-only `.docx` into `_resume/resumes/`.
#   - `./build-resume.sh --portal [file.md]`
#       Injects direct job-portal phone number from `_resume/portal-contact-profile.md`
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
    # DOCX is ALWAYS generated strictly in local `_resume/resumes/`, never in public `raggiesoft-assets/`
    OUT_DOCX="$OUTPUT_DIR/${BASENAME}.docx"
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

# Keep hyphenated technical compounds unbroken across right-margin wraps so Pango/WeasyPrint
# never substitutes an end-of-line hyphen glyph that ATS PDF text extractors read as U+FFFD.
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

weasyprint \
    --pdf-variant pdf/ua-1 \
    --encoding utf-8 \
    "$TMP_HTML" \
    "$OUT_PDF"

echo "Building Local-Only Accessible Section 508 DOCX (for DOCX-only ATS portals): $OUT_DOCX ..."
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
    echo "Done! Verified public PDF ($OUT_PDF) and mirrored PDF + local-only DOCX to $OUTPUT_DIR."
else
    echo "Done! Verified portal-only PDF & DOCX (with phone) in $OUTPUT_DIR."
fi
