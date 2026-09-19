#!/usr/bin/env bash

# --- HARPER: THE STUDIO ENGINEER (Modular Edition) ---
# "I live in the studio. I take raw master tapes and press them for the airwaves."

# --- RECORD START TIME ---
START_EPOCH=$(date +%s)
START_TIME_STR=$(date +"%Y-%m-%d %I:%M:%S %p")

echo "🎧 HARPER: Alright! Firing up the mixing board (Modular Edition)... Let's hit the Vault!"
echo "   ⏰ Session Started: $START_TIME_STR"

# Define Root relative to script location
WORKSPACE_DIR=$(dirname "$0")
cd "$WORKSPACE_DIR" || exit
export ROOT_DIR=$(pwd)

# --- LOAD MODULES ---
MODULE_DIR="$ROOT_DIR/harper"

if [ ! -d "$MODULE_DIR" ]; then
    echo "🛑 HARPER FATAL ERROR: Module directory '/harper' not found! I need my gear."
    exit 1
fi

# 1. Initialize System & Arguments
source "$MODULE_DIR/01-init.sh"

# 2. Load Audio Worker Functions
source "$MODULE_DIR/02-audio-engine.sh"

# 3. Process Albums & Tracks (This handles the sorting and both loops)
source "$MODULE_DIR/03-album-processor.sh"

# 4. Finalize & Cleanup
source "$MODULE_DIR/06-finalize.sh"