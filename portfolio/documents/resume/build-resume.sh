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
#     Stage 5: `verify-pdf-508.py` programmatically audits the finished PDF and
#              DOCX files—failing the build immediately if any Section 508 tag is missing!
#
# Usage Examples:
#   - `./build-resume.sh`               -> Builds public email-only PDF + local DOCX
#   - `./build-resume.sh --portal`      -> Builds private phone-enabled PDF + DOCX in `_resume/resumes/`
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
DOC_DESC="Resume of Michael P. Ragsdale, Full-Stack Web Developer and Web Accessibility Engineer in Norfolk, VA specializing in TypeScript, PHP 8.5, Angular, React, C#/.NET, SwiftUI, and code-level WCAG 2.1/2.2 AA & Section 508 web compliance."

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

# ------------------------------------------------------------------------------
# 3. STAGE A: PANDOC MARKDOWN -> SEMANTIC HTML5 CONVERSION
# ------------------------------------------------------------------------------
# Pandoc parses `$SOURCE_MD` (`-f markdown`) and renders a complete standalone HTML5
# document (`-t html5 --standalone`) wrapped in `pdf-ua-template.html`, linking
# `resume-pdf-ua.css` and populating language, `<title>`, author, and description metadata.
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
    "$WEASY_PY" - "$TMP_HTML" "$OUT_PDF" <<'PY'
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
        "$OUT_PDF"
fi

# ------------------------------------------------------------------------------
# 6. STAGE D: PRIVATE LOCAL-ONLY ACCESSIBLE WORD (`.docx`) GENERATION
# ------------------------------------------------------------------------------
# Converts the exact same Markdown source into a clean, single-column Word `.docx`
# with native `Heading 1` / `Heading 2` / `Heading 3` styles and `en-US` metadata.
echo "Building Local-Only Accessible Section 508 DOCX (for DOCX-only ATS portals): $OUT_DOCX ..."
pandoc "$SOURCE_MD" \
    -f markdown \
    -t docx \
    --metadata title="$DOC_TITLE" \
    --metadata author="$DOC_AUTHOR" \
    --metadata lang="en-US" \
    -o "$OUT_DOCX"

# ------------------------------------------------------------------------------
# 7. STAGE E: AUTOMATED SECTION 508 / PDF/UA-1 VERIFICATION GATE & MIRRORING
# ------------------------------------------------------------------------------
# Audit both generated artifacts immediately. Because `set -e` is active at the top
# of this script, if `verify-pdf-508.py` finds ANY accessibility defect and exits `1`,
# the build fails loudly right here before copying anything!
python3 ./verify-pdf-508.py "$OUT_PDF" "$OUT_DOCX"

if [ "$PORTAL_MODE" = false ]; then
    # Mirror the verified public PDF into local `_resume/resumes/` alongside the `.docx`.
    cp "$OUT_PDF" "$OUTPUT_DIR/"
    echo "Done! Verified public PDF ($OUT_PDF) and mirrored PDF + local-only DOCX to $OUTPUT_DIR."
else
    echo "Done! Verified portal-only PDF & DOCX (with phone) in $OUTPUT_DIR."
fi
