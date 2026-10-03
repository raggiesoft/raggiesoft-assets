#!/bin/bash

# SECURITY CHECK: SARAH REFUSES TO RUN AS ROOT
if [ "$EUID" -eq 0 ]; then
    echo "🚨 SARAH FATAL ERROR: I am not allowed to run as root or via sudo!"
    echo "I was designed to run autonomously as the standard user. Please drop your privileges and try again."
    exit 1
fi


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

# 3. PROCESS STARDUST ENGINE LIBRARY
deploy_site "Books" "/home/michael/raggiesoft-book-library" "/var/www/raggiesoft-book-library"

# 4. PROCESS ASSETS (AND STARDUST ENGINE LIBRARY)
function deploy_assets() {
    local SITE_NAME="Assets"
    local REPO_DIR="/home/michael/raggiesoft-assets"
    local WEB_ROOT="/var/www/assets.raggiesoft.com"

    if [ ! -d "$REPO_DIR" ]; then
        echo "⚠️ SARAH: Cannot deploy $SITE_NAME. Repository missing at $REPO_DIR."
        return
    fi

    cd "$REPO_DIR" || return
    git fetch origin main

    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/main)

    if [ "$FORCE_RESET" = false ]; then
        if [ "$LOCAL" == "$REMOTE" ]; then
            return
        fi
        echo "👩‍💼 SARAH: Change detected in $SITE_NAME! Jenna pushed updates."
    fi

    git reset --hard origin/main
    if [ "$FORCE_RESET" = true ]; then
        git clean -fdx
    fi

    # --- STARDUST ENGINE BUILD PIPELINE ---
    echo "   -> Building Stardust Engine Library..."
    cd "$REPO_DIR/stardust-engine-library" || return
    
    # Minify Core CSS
    php -r '
        $css = "";
        foreach(glob("css/src/*.css") as $file) { $css .= file_get_contents($file); }
        $css = preg_replace("!/\*[^*]*\*+([^/][^*]*\*+)*/!", "", $css);
        $css = str_replace(array("\r\n", "\r", "\n", "\t", "  ", "    ", "    "), "", $css);
        file_put_contents("css/stardust-engine.min.css", $css);
    '
    
    # Minify Theme CSS (Creates theme-name.min.css for each theme-name.css)
    php -r '
        foreach(glob("css/src/theme-*.css") as $file) {
            $name = basename($file, ".css");
            $css = file_get_contents($file);
            $css = preg_replace("!/\*[^*]*\*+([^/][^*]*\*+)*/!", "", $css);
            $css = str_replace(array("\r\n", "\r", "\n", "\t", "  ", "    ", "    "), "", $css);
            file_put_contents("css/" . $name . ".min.css", $css);
        }
    '

    # Minify JS
    php -r '
        foreach(glob("js/src/*.js") as $file) {
            $name = basename($file, ".js");
            $js = file_get_contents($file);
            $js = preg_replace("!/\*[^*]*\*+([^/][^*]*\*+)*/!", "", $js);
            $js = preg_replace("/^[ \t]+/m", "", $js); // Strip leading spaces
            $js = preg_replace("/\n+/", "\n", $js); // Strip blank lines
            file_put_contents("js/" . $name . ".min.js", $js);
        }
    '
    
    cd "$REPO_DIR" || return

    echo "   -> Syncing $SITE_NAME to Showroom..."
    rsync -av --delete --no-o --no-g \
        --exclude '.git' \
        --exclude '.gitignore' \
        --exclude 'README.md' \
        "$REPO_DIR/" "$WEB_ROOT/"

    find "$WEB_ROOT" -type d -exec chmod 755 {} +
    find "$WEB_ROOT" -type f -exec chmod 644 {} +
    echo "✅ SARAH: $SITE_NAME Deployment Complete."
}

deploy_assets
