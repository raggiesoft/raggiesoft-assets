#!/bin/bash

# Define paths
WORKSPACE_DIR=$(dirname "$0")
cd "$WORKSPACE_DIR" || exit
SEARCH_PATH="../engine-room-records/artists"
OUTPUT_FILE="engine-room-timeline.md"

echo "🔍 Scanning archives for narrative timeline..."

# Initialize the Markdown file
{
    echo "# 📅 Engine Room Records: Narrative Timeline"
    echo "*Generated on: $(date +"%Y-%m-%d %I:%M %p")*"
    echo ""
    echo "| Narrative Year | Artist | Album / Project | Folder Path |"
    echo "| :--- | :--- | :--- | :--- |"
} > "$OUTPUT_FILE"

# Find all album.json files and extract metadata
TEMP_LIST=$(mktemp)

find "$SEARCH_PATH" -name "album.json" | while read -r file; do
    YEAR=$(jq -r '.temporalCoverage // empty' "$file" | cut -c 1-4)
    if [ -z "$YEAR" ]; then YEAR="9999"; fi
    
    ARTIST=$(jq -r '.byArtist.name // empty' "$file")
    if [ -z "$ARTIST" ]; then ARTIST="*Missing Artist*"; fi
    
    ALBUM=$(jq -r '.name // empty' "$file")
    if [ -z "$ALBUM" ]; then ALBUM="*Missing Album Name*"; fi
    
    # Get the relative path for easy locating
    REL_PATH=$(dirname "$file" | sed "s|$SEARCH_PATH/||")
    
    echo "$YEAR|$ARTIST|$ALBUM|$REL_PATH" >> "$TEMP_LIST"
done

# Check for folders that might have been created but lack an album.json entirely
# (We look for directories that have audio files or tracks.json but NO album.json)
find "$SEARCH_PATH" -mindepth 2 -maxdepth 2 -type d | while read -r dir; do
    if [ ! -f "$dir/album.json" ]; then
        # Check if it has tracks.json or mp3/wav files to ensure it's meant to be an album folder
        if [ -f "$dir/tracks.json" ] || ls "$dir"/*.wav 1> /dev/null 2>&1 || ls "$dir"/*.mp3 1> /dev/null 2>&1; then
            REL_PATH=$(echo "$dir" | sed "s|$SEARCH_PATH/||")
            echo "9999|*Missing album.json*|*Uninitialized*|$REL_PATH" >> "$TEMP_LIST"
        fi
    fi
done

# Sort numerically by Year, then output to Markdown
sort -n "$TEMP_LIST" | while IFS='|' read -r year artist album path; do
    # Format WIP rows differently
    if [ "$year" == "9999" ]; then
        echo "| ⚠️ **WIP** | $artist | $album | \`$path\` |" >> "$OUTPUT_FILE"
    else
        echo "| **$year** | $artist | $album | \`$path\` |" >> "$OUTPUT_FILE"
    fi
done

rm -f "$TEMP_LIST"

echo "✅ Timeline generated successfully: $WORKSPACE_DIR/$OUTPUT_FILE"
