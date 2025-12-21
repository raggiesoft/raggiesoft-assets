#!/bin/bash

# --- RAGGIESOFT SYNC COMMANDER v3 (Fixed) ---
# Usage: ./raggie-sync.sh --push | --pull

# 1. ESTABLISH ABSOLUTE PATHS (The Critical Fix)
# We use 'cd' and 'pwd' to get the full path, so it never breaks when we move around.
WORKSPACE_DIR=$(cd "$(dirname "$0")" && pwd)
ASSETS_ROOT=$(cd "$WORKSPACE_DIR/.." && pwd)
HUB_ROOT=$(cd "$ASSETS_ROOT/../raggiesoft-hub" && pwd)

echo "🔧 Debug: Workspace is $WORKSPACE_DIR"
echo "🔧 Debug: Assets Root is $ASSETS_ROOT"

# 2. DETECT RCLONE
RCLONE_BIN=""
# Conf is now an absolute path
RCLONE_CONF="$WORKSPACE_DIR/build-tools/rclone/rclone.conf"

if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    # Windows: Look in build-tools
    if [ -f "$WORKSPACE_DIR/build-tools/rclone/rclone.exe" ]; then
        RCLONE_BIN="$WORKSPACE_DIR/build-tools/rclone/rclone.exe"
    else
        echo "❌ Error: rclone.exe not found at $WORKSPACE_DIR/build-tools/rclone/rclone.exe"
        exit 1
    fi
else
    # Mac/Linux
    if command -v rclone &> /dev/null; then
        RCLONE_BIN="rclone"
    elif [ -f "$WORKSPACE_DIR/build-tools/rclone/rclone" ]; then
        RCLONE_BIN="$WORKSPACE_DIR/build-tools/rclone/rclone"
    else
        echo "❌ Error: rclone not found."
        exit 1
    fi
fi

# Ensure Config Exists
if [ ! -f "$RCLONE_CONF" ]; then
    echo "❌ Error: rclone.conf missing at $RCLONE_CONF"
    echo "   -> Copy rclone.conf.example to rclone.conf and add your keys."
    exit 1
fi

# 2. DEFINE FUNCTIONS
function show_help() {
    echo "========================================"
    echo "   RaggieSoft Sync Commander"
    echo "========================================"
    echo "Usage:"
    echo "  ./raggie-sync.sh --pull   (Cloud -> Local)"
    echo "  ./raggie-sync.sh --push   (Local -> Cloud)"
    echo ""
    echo "Actions:"
    echo "  --pull: git pull (Hub & Assets) + rclone sync (Download)"
    echo "  --push: git push (Hub & Assets) + rclone copy (Upload)"
    echo ""
}

function do_pull() {
    echo "⬇️  STARTING PULL (Cloud -> Local)..."
    
    echo "1. Updating Code (Hub)..."
    # Check if directory exists to avoid errors on fresh installs
    if [ -d "$HUB_ROOT" ]; then
        cd "$HUB_ROOT" && git pull origin main
    else
        echo "   ⚠️  Hub folder not found at $HUB_ROOT"
    fi
    
    echo "2. Updating Workspace (Assets Repo)..."
    cd "$ASSETS_ROOT" && git pull origin main
    
    echo "3. Downloading Heavy Assets (Spaces)..."
    # Sync: Make local identical to cloud
    "$RCLONE_BIN" sync do-spaces:assets.raggiesoft.com "$ASSETS_ROOT" \
        --config "$RCLONE_CONF" \
        --exclude "/_workspace/**" \
        --exclude "/.git/**" \
        -P --transfers=8
        
    echo "✅ Pull Complete."
}

function do_push() {
    echo "⬆️  STARTING PUSH (Local -> Cloud)..."
    
    echo "1. Committing Code (Hub)..."
    if [ -d "$HUB_ROOT" ]; then
        cd "$HUB_ROOT"
        git add .
        # Only commit if there are changes to avoid empty commit errors
        if ! git diff-index --quiet HEAD --; then
             git commit -m "WIP: Automated sync commit"
             git push origin main
        else
             echo "   (No changes to commit in Hub)"
        fi
    fi
    
    echo "2. Committing Workspace (Assets Repo)..."
    cd "$ASSETS_ROOT"
    git add .
    if ! git diff-index --quiet HEAD --; then
        git commit -m "WIP: Automated workspace update"
        git push origin main
    else
        echo "   (No changes to commit in Assets)"
    fi
    
    echo "3. Uploading Heavy Assets (Spaces)..."
    # Copy: Only add new/changed files (Safer than sync for push)
    "$RCLONE_BIN" copy "$ASSETS_ROOT" do-spaces:assets.raggiesoft.com \
        --config "$RCLONE_CONF" \
        --exclude "/_workspace/**" \
        --exclude "/.git/**" \
        --exclude ".gitignore" \
        -P --transfers=8
        
    echo "✅ Push Complete."
}

# 3. EXECUTE
case "$1" in
    --pull)
        do_pull
        ;;
    --push)
        do_push
        ;;
    *)
        show_help
        ;;
esac
