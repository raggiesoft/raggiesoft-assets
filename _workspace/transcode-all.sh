#!/bin/bash
# --- Engine Room Records: MASTER TRANSCODER (v17) ---
# Updated for _workspace structure

echo "Starting Engine Room Records Label Transcode (v17)..."

# Define Root relative to script location
WORKSPACE_DIR=$(dirname "$0")
cd "$WORKSPACE_DIR" || exit
ROOT_DIR=$(pwd) # This is now .../raggiesoft-assets/_workspace

# --- PATH CONFIGURATION ---
# We go UP one level to finding the assets
SEARCH_PATH="../engine-room-records/artists"
METADATA_FILE="../engine-room-records/artists/metadata.json"
TEMP_SEARCH_INDEX="temp_search_index.jsonl" # Keep temp file in workspace

echo "Targeting: $SEARCH_PATH"

# Initialize Index
echo "" > "$TEMP_SEARCH_INDEX" 

# --- LOCATE 7-ZIP BINARY ---
# Look in local build-tools first
SEVEN_ZIP_LOCAL="./build-tools/7zip"
USE_SEVEN_ZIP=false

if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
     if [ -f "$SEVEN_ZIP_LOCAL/7za.exe" ]; then
         SEVEN_ZIP_CMD="$SEVEN_ZIP_LOCAL/7za.exe"
         USE_SEVEN_ZIP=true
     fi
else
    # Mac/Linux: Check System first, then local
    if command -v 7zz &> /dev/null; then
        SEVEN_ZIP_CMD="7zz"
        USE_SEVEN_ZIP=true
    elif [ -f "$SEVEN_ZIP_LOCAL/7zz" ]; then
        SEVEN_ZIP_CMD="$SEVEN_ZIP_LOCAL/7zz"
        chmod +x "$SEVEN_ZIP_CMD"
        USE_SEVEN_ZIP=true
    fi
fi

if [ "$USE_SEVEN_ZIP" = true ]; then
    echo "  [OK] 7-Zip found: $SEVEN_ZIP_CMD"
else
    echo "  [WARN] 7-Zip not found. WAV archives will be skipped."
fi

ffmpeg_flag="-n" 
if [[ "$1" == "--rebuild" || "$1" == "-y" ]]; then
  ffmpeg_flag="-y"
  echo "  WARNING: Rebuild flag detected."
fi

if [ ! -d "$SEARCH_PATH" ]; then
    echo "  ERROR: Directory not found at $SEARCH_PATH"
    exit 1
fi

# --- MAIN LOOP ---
find "$SEARCH_PATH" -name "tracks.json" | while read tracks_file; do
    
    album_dir=$(dirname "$tracks_file")
    # We must jump to album dir to process, but remember to come back
    pushd "$album_dir" > /dev/null
    
    ALBUM_JSON="album.json"
    ART_FILE="album-art.jpg"

    if [ ! -f "$ALBUM_JSON" ] || [ ! -d "wav" ]; then
        popd > /dev/null
        continue
    fi

    # Parse Album Data
    ALBUM_ARTIST=$(jq -r '.albumArtist' "$ALBUM_JSON")
    ALBUM_NAME=$(jq -r '.albumName' "$ALBUM_JSON")
    NARRATIVE_YEAR=$(jq -r '.narrativeReleaseDate' "$ALBUM_JSON")
    GENRE=$(jq -r '.genre' "$ALBUM_JSON")
    
    # Slugs
    ALBUM_SLUG=$(basename "$album_dir")
    ARTIST_DIR_PATH=$(dirname "$album_dir")
    ARTIST_SLUG=$(basename "$ARTIST_DIR_PATH")

    WEB_URL="/engine-room/artists/$ARTIST_SLUG/albums/$ALBUM_SLUG"
    SAFE_ALBUM_NAME=$(echo "$ALBUM_NAME" | tr '[:upper:]' '[:lower:]' | tr -d '[:punct:]' | tr ' ' '-')
    ARCHIVE_BASE_NAME="${NARRATIVE_YEAR}-${SAFE_ALBUM_NAME}"

    echo ""
    echo "Processing: $ALBUM_ARTIST - $ALBUM_NAME"

    # Art Param
    if [ ! -f "$ART_FILE" ]; then
        ART_FILE_PARAM=""
    else
        ART_FILE_PARAM="-i $ART_FILE -map 0:a -map 1:v -codec:v mjpeg -disposition:v attached_pic"
    fi

    # Lyrics Check
    HAS_LYRICS=false
    if [ -d "lyrics" ]; then HAS_LYRICS=true; fi

    mkdir -p mp3 ogg archives

    # Generate Readme
    README_FILE="read-me.txt"
    {
        echo "=================================================================="
        echo "  $ALBUM_NAME ($NARRATIVE_YEAR)"
        echo "  by $ALBUM_ARTIST"
        echo "=================================================================="
        echo "Genre: $GENRE"
        echo "Website: https://raggiesoft.com$WEB_URL"
        echo ""
        echo "TRACKLIST:"
    } > "$README_FILE"
    
    # Process Tracks
    jq -c '.tracks[]' "tracks.json" | while read -r track_json; do
        FILE_BASE=$(echo "$track_json" | jq -r '.fileName')
        TITLE=$(echo "$track_json" | jq -r '.title')
        DISC_NUM=$(echo "$track_json" | jq -r '.disc')
        TRACK_NUM=$(echo "$track_json" | jq -r '.track')

        echo "$TRACK_NUM. $TITLE" >> "$README_FILE"
        
        # Add to Search Index (Append to temp file in WORKSPACE, using absolute path from ROOT_DIR variable)
        # Note: We are currently inside album_dir, so we need to reference TEMP_SEARCH_INDEX via full path or relative step back
        # Easier: Just cat to the file we defined earlier using the variable passed down? 
        # Actually, variable scope in pipe loops in bash is tricky.
        # FIX: We write to a temporary file inside the ALBUM dir, then cat it later?
        # BETTER: Just append to the file using the absolute path we captured at start.
        
        # Capturing content for index
        LYRICS_CONTENT=""
        if [ -f "lyrics/${FILE_BASE}.md" ]; then LYRICS_CONTENT=$(cat "lyrics/${FILE_BASE}.md"); fi

        jq -n -c \
            --arg id "$FILE_BASE" \
            --arg title "$TITLE" \
            --arg artist "$ALBUM_ARTIST" \
            --arg album "$ALBUM_NAME" \
            --arg url "$WEB_URL" \
            --arg type "track" \
            --arg content "$LYRICS_CONTENT" \
            '{id: $id, title: $title, artist: $artist, album: $album, url: $url, type: $type, content: $content}' >> "$ROOT_DIR/$TEMP_SEARCH_INDEX"

        # Transcoding
        WAV_FILE="wav/${FILE_BASE}.wav"
        if [ ! -f "$WAV_FILE" ]; then continue; fi

        # MP3 (V0)
        ffmpeg -nostdin -loglevel error $ffmpeg_flag -i "$WAV_FILE" $ART_FILE_PARAM \
        -codec:a libmp3lame -q:a 0 -id3v2_version 3 -write_id3v1 1 \
        -metadata title="$TITLE" -metadata artist="$ALBUM_ARTIST" -metadata album="$ALBUM_NAME" \
        -metadata date="$NARRATIVE_YEAR" -metadata track="$TRACK_NUM" -metadata disc="$DISC_NUM" \
        "mp3/$FILE_BASE.mp3"

        # OGG (Q9)
        ffmpeg -nostdin -loglevel error $ffmpeg_flag -i "$WAV_FILE" \
        -codec:a libvorbis -q:a 9 \
        -metadata title="$TITLE" -metadata artist="$ALBUM_ARTIST" -metadata album="$ALBUM_NAME" \
        -metadata date="$NARRATIVE_YEAR" -metadata tracknumber="$TRACK_NUM" -metadata discnumber="$DISC_NUM" \
        "ogg/$FILE_BASE.ogg"

    done

    # Archives (7-Zip)
    if [ "$USE_SEVEN_ZIP" = true ]; then
        ZIP_MP3="archives/${ARCHIVE_BASE_NAME}-mp3.zip"
        ZIP_OGG="archives/${ARCHIVE_BASE_NAME}-ogg.zip"
        ZIP_WAV="archives/${ARCHIVE_BASE_NAME}-wav.7z"
        rm -f "$ZIP_MP3" "$ZIP_OGG" "$ZIP_WAV"

        "$SEVEN_ZIP_CMD" a -tzip -mx=5 "$ZIP_MP3" ./mp3/*.mp3 "$README_FILE" "$ART_FILE" > /dev/null
        if [ "$HAS_LYRICS" = true ]; then "$SEVEN_ZIP_CMD" a -tzip -mx=5 "$ZIP_MP3" ./lyrics/*.md > /dev/null; fi

        "$SEVEN_ZIP_CMD" a -tzip -mx=5 "$ZIP_OGG" ./ogg/*.ogg "$README_FILE" "$ART_FILE" > /dev/null
        if [ "$HAS_LYRICS" = true ]; then "$SEVEN_ZIP_CMD" a -tzip -mx=5 "$ZIP_OGG" ./lyrics/*.md > /dev/null; fi

        "$SEVEN_ZIP_CMD" a -t7z -mx=9 -ms=on "$ZIP_WAV" ./wav/*.wav "$README_FILE" "$ART_FILE" > /dev/null
        if [ "$HAS_LYRICS" = true ]; then "$SEVEN_ZIP_CMD" a -t7z -mx=9 "$ZIP_WAV" ./lyrics/*.md > /dev/null; fi
        
        echo "  -> Archives Created."
    fi
    
    rm "$README_FILE"
    popd > /dev/null # Return to workspace
done

# --- FINALIZE SEARCH INDEX ---
echo "Building Search Index..."
if [ -f "$TEMP_SEARCH_INDEX" ]; then
    jq -s '.' "$TEMP_SEARCH_INDEX" > "$METADATA_FILE"
    rm "$TEMP_SEARCH_INDEX"
    echo "  [OK] Index built at: $METADATA_FILE"
fi

echo "--- Complete ---"
