#!/bin/bash

# --- SARAH: AUTONOMOUS DEPLOYMENT (v4) ---
# "I check for updates every 5 minutes. If Jenna pushed code, I deploy it instantly."
# NO SUDO REQUIRED.

# 0. ROOT PRIVILEGE CHECK
if [ "$EUID" -eq 0 ]; then
    echo "🛑👩‍💼 SARAH: WHAT ARE YOU DOING?! I explicitly told you I do not need root!"
    echo "          ABORTING: Drop the sudo and let me do my job."
    exit 1
fi

# 1. CONFIGURATION
REPO_DIR="/home/michael/raggiesoft-hub"
WEB_ROOT="/var/www/raggiesoft.com"

# 2. THE INTELLIGENCE CHECK (Detect Changes)
# Sarah quietly checks the Vault before waking up fully.
cd "$REPO_DIR" || exit

# Fetch the latest info from GitHub (but don't merge yet)
git fetch origin main

# Compare: Where am I (HEAD) vs. Where is GitHub (origin/main)?
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" == "$REMOTE" ]; then
    # No changes. Sarah goes back to sleep silently.
    exit 0
fi

# 3. IF WE ARE HERE, CHANGES WERE DETECTED
echo "👩‍💼 SARAH: Change detected! Jenna pushed updates."
echo "   Previous: $LOCAL"
echo "   New:      $REMOTE"

# Pull the updates
git reset --hard origin/main

# 4. DEPLOY (Standard User Mode - No Sudo)
echo "👩‍💼 SARAH: Syncing files to Showroom..."

# rsync options:
# -a: Archive mode (preserves permissions/times)
# --no-o: Don't try to change Owner (prevents "Operation not permitted" error)
# --no-g: Don't try to change Group (Let the folder's SetGID handle it)
rsync -av --delete --no-o --no-g \
    --exclude '.git' \
    --exclude '.gitignore' \
    --exclude 'deploy.sh' \
    --exclude 'README.md' \
    "$REPO_DIR/" "$WEB_ROOT/"

# 5. PERMISSIONS (Self-Correction)
# Since 'michael' owns the folder now, Sarah can chmod her own files without sudo.
echo "👩‍💼 SARAH: Standardizing file permissions..."
find "$WEB_ROOT" -type d -exec chmod 755 {} +
find "$WEB_ROOT" -type f -exec chmod 644 {} +

echo "✅ SARAH: Deployment Complete at $(date)"