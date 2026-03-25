#!/bin/bash

# --- CHLOÉ MASON: THE ARCHIVIST (v1.3.0 - Elara Routing Edition) ---
# "I read everything. I pack the codebase into neat little boxes so the AI can read it."

echo "📚 CHLOÉ MASON: Bonjour, Michael. Let me grab my clipboard and my tea..."
echo "                (And before you ask: the tea is from the Québec side of the border,"
echo "                 even if the hospital in Newport insists on claiming my birth certificate.)"
echo ""

# 1. ESTABLISH PATHS
WORKSPACE_DIR=$(cd "$(dirname "$0")" && pwd)
ROOT_DEV_DIR=$(cd "$WORKSPACE_DIR/../.." && pwd)

# Give Chloé her own private reading room for the manuscripts
CHLOE_DIR="$WORKSPACE_DIR/chloe"
if [ ! -d "$CHLOE_DIR" ]; then
    mkdir -p "$CHLOE_DIR"
    echo "   📁 Setting up my private archives at: /chloe"
fi

DATE_STAMP=$(date +"%Y-%m-%d")
TIME_STAMP=$(date +"%H-%M-%S")
SCRIPT_NAME="chloe-bundle"
OUTPUT_FILE="$CHLOE_DIR/${SCRIPT_NAME}-${DATE_STAMP}_${TIME_STAMP}.txt"

echo "   🔍 Targeting Master Directory: $ROOT_DEV_DIR"
echo "   Je commence... Scanning for code artifacts now."
echo "------------------------------------------------------------------"

# 2. CLEAR THE DESK & WRITE METADATA
> "$OUTPUT_FILE"

{
    echo "=================================================================="
    echo "  CHLOÉ MASON'S ARCHIVE BUNDLE"
    echo "  Archivist Origin: Stanstead, QC (via Newport, VT)"
    echo "=================================================================="
    echo "  [AI CONTEXT METADATA]"
    echo "  Date Compiled: $DATE_STAMP"
    echo "  Time Compiled: $TIME_STAMP (24-Hour Format)"
    echo "  Environment: RaggieSoft Hub (Elara Router) & Assets CDN"
    echo "  Purpose: Codebase ingestion and context alignment."
    echo "=================================================================="
    echo ""
} >> "$OUTPUT_FILE"

# 3. EXECUTE THE SMART SEARCH
cd "$ROOT_DEV_DIR" || exit

find . -type d \( -name ".git" -o -name "node_modules" -o -name "vendor" -o -name "chloe" -o -name "wav" -o -name "mp3" -o -name "ogg" -o -name "archives" \) -prune \
    -o -type f \( -name "*.php" -o -name "*.json" -o -name "*.js" -o -name "*.css" \) -print | while read -r file; do
    
    REL_PATH="${file#./}"
    DIR_NAME=$(dirname "$REL_PATH")
    BASE_NAME=$(basename "$REL_PATH")
    EXT="${BASE_NAME##*.}"
    LIVE_URL="[INTERNAL/UNMAPPED]"
    
    # --- CHLOÉ's URL RESOLUTION LOGIC ---
    if [[ "$REL_PATH" == *"raggiesoft-assets/"* ]]; then
        # Rule 1: Static Assets CDN
        CLEAN_PATH="${REL_PATH#*raggiesoft-assets/}"
        LIVE_URL="https://assets.raggiesoft.com/${CLEAN_PATH}"
        
    elif [[ "$REL_PATH" == *"raggiesoft-hub/"* ]]; then
        CLEAN_PATH="${REL_PATH#*raggiesoft-hub/}"
        
        if [[ "$CLEAN_PATH" == "pages/"* ]]; then
            # Rule 2: Pages Routing
            PAGE_PATH="${CLEAN_PATH#pages/}" 
            PAGE_PATH="${PAGE_PATH%.php}" # Strip .php extension
            
            PAGE_DIR=$(dirname "$PAGE_PATH")
            PAGE_BASE=$(basename "$PAGE_PATH")
            
            # Rule 3: Overview/Home Index Masking
            if [ "$PAGE_BASE" == "overview" ] || [ "$PAGE_BASE" == "home" ]; then
                if [ "$PAGE_DIR" == "." ]; then
                    LIVE_URL="https://raggiesoft.com/"
                else
                    LIVE_URL="https://raggiesoft.com/${PAGE_DIR}/"
                fi
            else
                if [ "$PAGE_DIR" == "." ]; then
                    LIVE_URL="https://raggiesoft.com/${PAGE_BASE}"
                else
                    LIVE_URL="https://raggiesoft.com/${PAGE_DIR}/${PAGE_BASE}"
                fi
            fi
        else
            # Rule 4: Protected Internal Hub Files
            LIVE_URL="[INTERNAL - Protected by Nginx / Elara Gateway]"
        fi
    fi
    # ------------------------------------

    # Chloé's verbose categorization based on file type
    if [ "$EXT" == "php" ]; then
        echo "      🐘 Parsing server logic:   $REL_PATH"
    elif [ "$EXT" == "json" ]; then
        echo "      📋 Filing JSON manifest:   $REL_PATH"
    elif [ "$EXT" == "js" ]; then
        echo "      ⚡ Archiving JavaScript:   $REL_PATH"
    elif [ "$EXT" == "css" ]; then
        echo "      🎨 Storing Stylesheet:     $REL_PATH"
    else
        echo "      📑 Cataloging artifact:    $REL_PATH"
    fi
    
    # Write to the manuscript
    {
        echo "--- START OF FILE $REL_PATH ---"
        echo "// DIRECTORY: $DIR_NAME"
        echo "// FILE:      $BASE_NAME"
        echo "// LIVE URL:  $LIVE_URL"
        echo "------------------------------------------------------------------"
        cat "$file"
        echo -e "\n\n"
    } >> "$OUTPUT_FILE"
    
done

echo "------------------------------------------------------------------"
echo "📚 CHLOÉ MASON: Voilà! The manuscript is collated and mapped."
echo "   📦 Saved to: $OUTPUT_FILE"
echo "   You can hand this directly to Gemini now. I'll be in my reading room if you need me."