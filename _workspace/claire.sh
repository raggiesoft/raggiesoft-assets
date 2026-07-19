#!/bin/bash

# --- CLAIRE: THE STUDIO MANAGER (v1.0.1 - Technical Debt Sweeper) ---
# "A messy studio is a slow studio. Let me clear the floor before Harper comes in."
#
# ROLE:
# Claire sweeps through the Artist Archives and strips out all generated audio,
# compiled metadata, packed archives, and upscaled art. She leaves only the pristine
# source files (tracks.json, album.json, raw art, social previews, and raw lyrics).
# She also targets legacy folder structures (like root-level mp3, ogg, and wav folders).
#
# PERSONALITY: Meticulous, polite but firm, highly organized, likes a spotless desk.

echo "🧹 CLAIRE: Good evening! I'll get this studio cleaned up and ready for Harper."
echo "   ✨ Grabbing the trash bins..."

# Define Root relative to script location
WORKSPACE_DIR=$(dirname "$0")
cd "$WORKSPACE_DIR" || exit

# Target Path
SEARCH_PATH="../engine-room-records/artists"

if [ ! -d "$SEARCH_PATH" ]; then
    echo "   ❌ CLAIRE: Oh dear, I can't seem to find the archives at $SEARCH_PATH. Are you sure that's the right door?"
    exit 1
fi

echo "   🗄️  Sweeping the archives: $SEARCH_PATH"

# Find every album folder by looking for tracks.json
find "$SEARCH_PATH" -name "tracks.json" | while read -r tracks_file; do
    
    album_dir=$(dirname "$tracks_file")
    
    # Check if album.json exists to confirm it's a valid album directory
    if [ ! -f "$album_dir/album.json" ]; then
        continue
    fi

    echo "      🗑️  CLAIRE: Dusting off '$album_dir'..."
    
    # Enter the album directory
    pushd "$album_dir" > /dev/null

    # 1. Delete generated audio and current vault structures
    rm -rf web-mp3
    rm -rf vault
    
    # 2. Delete legacy root-level audio folders (pre-vault architecture)
    rm -rf wav
    rm -rf mp3
    rm -rf ogg
    
    # 3. Delete generated streaming services packages
    rm -rf streaming-services
    
    # 4. Delete root-level generated text files (README)
    rm -f read-me.txt
    
    # 5. Safely remove the bound Markdown lyric booklet in the root folder.
    # Using maxdepth 1 ensures she NEVER touches the raw source files inside the lyrics/ folder!
    find . -maxdepth 1 -name "*.md" -type f -delete
    
    # Return to the previous directory
    popd > /dev/null

done

# 6. Clean up any temporary index files Harper might have left behind in the root workspace
echo "   🧽 CLAIRE: Wiping down the main workspace temp files..."
rm -f temp_search_index.jsonl
rm -f temp_catalog_index.jsonl
rm -f temp_tracks_update.jsonl

echo "🧹 CLAIRE: All done! The floors are swept, the legacy folders are in the dumpster, and the studio is spotless."
echo "   ✨ You're all clear to call in Harper for a --rebuild."