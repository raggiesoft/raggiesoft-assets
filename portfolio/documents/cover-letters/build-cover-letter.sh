#!/bin/bash
# ==============================================================================
# Architectural Block: build-cover-letter.sh
# ==============================================================================
# Compiles Markdown cover letter files into ISO 14289-1 (`PDF/UA-1`), Section 508,
# and WCAG 2.1 AA Tagged PDFs (plus a local `.docx` copy for DOCX-only ATS portals)
# inside local NVMe `_resume/cover-letters/` and validates via `verify-pdf-508.py`.
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
OUTPUT_DIR="$(cd ../../../../../_resume/cover-letters 2>/dev/null && pwd || echo "$(pwd)/../../../../../_resume/cover-letters")"
mkdir -p "$OUTPUT_DIR"

PDF_FILE="$OUTPUT_DIR/${BASENAME}.pdf"
DOCX_FILE="$OUTPUT_DIR/${BASENAME}.docx"
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

WEASY_BIN="$(command -v weasyprint)"
WEASY_PY="$(head -n 1 "$WEASY_BIN" | sed -n 's/^#!//p' || true)"
if [ -n "$WEASY_PY" ] && [ -x "$WEASY_PY" ]; then
    "$WEASY_PY" - "$TMP_HTML" "$PDF_FILE" <<'PY'
import sys, pydyf, weasyprint

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

pandoc "$MD_FILE" \
    -f markdown \
    -t docx \
    --metadata title="$DOC_TITLE" \
    --metadata author="Michael P. Ragsdale" \
    --metadata lang="en-US" \
    -o "$DOCX_FILE"

python3 ../resume/verify-pdf-508.py --cover-letter "$PDF_FILE" "$DOCX_FILE"
echo "Done! Generated and verified $PDF_FILE and $DOCX_FILE"
