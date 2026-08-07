#!/bin/bash

# --- SARAH: AUTONOMOUS DEPLOYMENT (v5.0 - Multi-Site Edition) ---
# "I check for updates every 5 minutes. If Jenna pushed code, I deploy it instantly."
# NO SUDO REQUIRED.

FORCE_RESET=false

# Check for the nuclear override flag
if [ "$1" == "--force-reset" ]; then
    FORCE_RESET=true
    echo "🚨 SARAH: NUCLEAR OVERRIDE INITIATED. Forcing a clean deployment..."
fi

# Sarah's deployment brain
function deploy_site() {
    local SITE_NAME=$1
    local REPO_DIR=$2
    local WEB_ROOT=$3

    # Ensure repository exists locally before attempting sync
    if [ ! -d "$REPO_DIR" ]; then
        echo "⚠️ SARAH: Cannot deploy $SITE_NAME. Repository missing at $REPO_DIR."
        return
    fi

    cd "$REPO_DIR" || return

    # Fetch the latest info from GitHub
    git fetch origin main

    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/main)

    # Standard intelligence check
    if [ "$FORCE_RESET" = false ]; then
        if [ "$LOCAL" == "$REMOTE" ]; then
            return # No changes, stay silent
        fi
        echo "👩‍💼 SARAH: Change detected in $SITE_NAME! Jenna pushed updates."
    else
        echo "👩‍💼 SARAH: Bypassing version check for $SITE_NAME. Purging local repository cache."
    fi

    # PULL UPDATES
    git reset --hard origin/main
    if [ "$FORCE_RESET" = true ]; then
        git clean -fdx
    fi

    # DEPLOY
    echo "   -> Syncing $SITE_NAME to Showroom..."
    rsync -av --delete --no-o --no-g \
        --exclude '.git' \
        --exclude '.gitignore' \
        --exclude 'README.md' \
        "$REPO_DIR/" "$WEB_ROOT/"

    # PERMISSIONS
    find "$WEB_ROOT" -type d -exec chmod 755 {} +
    find "$WEB_ROOT" -type f -exec chmod 644 {} +
    echo "✅ SARAH: $SITE_NAME Deployment Complete."
}

# 1. PROCESS RAGGIESOFT HUB
deploy_site "Hub" "/home/michael/raggiesoft-hub" "/var/www/raggiesoft.com"

# 2. PROCESS NEBULAE INCUBATOR
deploy_site "Nebulae" "/home/michael/raggiesoft-nebulae" "/var/www/nebulae.raggiesoft.com"