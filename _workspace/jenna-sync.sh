#!/bin/bash

# --- JENNA: THE DEVELOPMENT LIAISON (v4) ---
# "I live on your machine, keeping your local workspace and the cloud in perfect harmony."
# Usage: ./jenna-sync.sh --push | --pull

# 1. ESTABLISH ABSOLUTE PATHS
WORKSPACE_DIR=$(cd "$(dirname "$0")" && pwd)
ASSETS_ROOT=$(cd "$WORKSPACE_DIR/.." && pwd)
HUB_ROOT=$(cd "$ASSETS_ROOT/../raggiesoft-hub" && pwd)

# 2. DETECT RCLONE
RCLONE_BIN=""
RCLONE_CONF="$WORKSPACE_DIR/build-tools/rclone/rclone.conf"

if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    if [ -f "$WORKSPACE_DIR/build-tools/rclone/rclone.exe" ]; then
        RCLONE_BIN="$WORKSPACE_DIR/build-tools/rclone/rclone.exe"
    else
        echo "👱‍♀️ JENNA: I can't find rclone.exe! Check build-tools?"
        exit 1
    fi
else
    if command -v rclone &> /dev/null; then
        RCLONE_BIN="rclone"
    elif [ -f "$WORKSPACE_DIR/build-tools/rclone/rclone" ]; then
        RCLONE_BIN="$WORKSPACE_DIR/build-tools/rclone/rclone"
    else
        echo "👱‍♀️ JENNA: I can't find the rclone binary anywhere!"
        exit 1
    fi
fi

if [ ! -f "$RCLONE_CONF" ]; then
    echo "👱‍♀️ JENNA: Uh oh, I'm missing my credentials (rclone.conf)!"
    exit 1
fi

# 2. JENNA'S LOGIC
function show_help() {
    echo "========================================"
    echo "   👱‍♀️ JENNA (Dev Sync)"
    echo "========================================"
    echo "Hey! Tell me what to do:"
    echo "  ./jenna-sync.sh --pull   (I'll grab the latest from Sarah/GitHub)"
    echo "  ./jenna-sync.sh --push   (I'll send your work up to the cloud)"
    echo ""
}

function do_pull() {
    echo "👱‍♀️ JENNA: On it! Bringing everything down to your machine..."
    
    echo "   1. Checking the Hub (Code)..."
    if [ -d "$HUB_ROOT" ]; then
        cd "$HUB_ROOT" && git pull origin main
    else
        echo "      ⚠️  Wait, where is the Hub folder? ($HUB_ROOT)"
    fi
    
    echo "   2. Checking the Assets (Workspace)..."
    cd "$ASSETS_ROOT" && git pull origin main
    
    echo "   3. Hauling the heavy boxes (DigitalOcean Spaces)..."
    "$RCLONE_BIN" sync do-spaces:assets.raggiesoft.com "$ASSETS_ROOT" \
        --config "$RCLONE_CONF" \
        --exclude "/_workspace/**" \
        --exclude "/.git/**" \
        -P --transfers=8
        
    echo "👱‍♀️ JENNA: All done! Your local files are perfectly synced."
}

function do_push() {
    echo "👱‍♀️ JENNA: Alright, let's ship this! Sending it up..."
    
    echo "   1. Packaging the Code (Hub)..."
    if [ -d "$HUB_ROOT" ]; then
        cd "$HUB_ROOT"
        git add .
        if ! git diff-index --quiet HEAD --; then
             git commit -m "Jenna: Automated sync commit"
             git push origin main
             echo "      ✓ Code sent to GitHub."
        else
             echo "      (Nothing new in the Hub code, skipping.)"
        fi
    fi
    
    echo "   2. Packaging the Workspace (Assets)..."
    cd "$ASSETS_ROOT"
    git add .
    if ! git diff-index --quiet HEAD --; then
        git commit -m "Jenna: Workspace update"
        git push origin main
        echo "      ✓ Workspace synced to GitHub."
    else
        echo "      (Assets repo looks unchanged.)"
    fi
    
    echo "   3. Beaming heavy assets to the CDN..."
    "$RCLONE_BIN" copy "$ASSETS_ROOT" do-spaces:assets.raggiesoft.com \
        --config "$RCLONE_CONF" \
        --exclude "/_workspace/**" \
        --exclude "/.git/**" \
        --exclude ".gitignore" \
        -P --transfers=8
        
    echo "👱‍♀️ JENNA: Success! Sarah should see these changes on the server soon."
}

# 3. EXECUTE
case "$1" in
    --pull) do_pull ;;
    --push) do_push ;;
    *) show_help ;;
esac