#!/bin/bash

# --- HARPER: THE STUDIO ENGINEER (v18.5) ---
# "I live in the studio. I take raw master tapes and press them for the airwaves."
#
# ROLE:
# Harper is the heavy lifter. She recursively scans the workspace for Master WAV files.
# She uses FFmpeg to generate web-optimized MP3 (320kbps) and OGG (Vorbis) mirrors.
# She creates the Download Zips for the "License Gated" area.
# She drafts Markdown metadata files for commercial streaming distribution.
# NEW: Stripped LLC for legal compliance. Integrated engineroom-records.com vanity URL.
#
# NEW RULE: Skip existing files to save time, unless forced!
#
# PERSONALITY: High-Energy, Efficient, Loud.

echo "🎧 HARPER: Alright! Firing up the mixing board (v18.5)... Let's make some noise!"

# Define Root relative to script location
WORKSPACE_DIR=$(dirname "$0")
cd "$WORKSPACE_DIR" || exit
ROOT_DIR=$(pwd)

# --- PATH CONFIGURATION ---
SEARCH_PATH="../engine-room-records/artists"
METADATA_FILE="../engine-room-records/artists/metadata.json"
TEMP_SEARCH_INDEX="temp_search_index.jsonl" 

echo "   🎚️  Targeting Studio Archives: $SEARCH_PATH"

# Initialize Index
echo "" > "$TEMP_SEARCH_INDEX" 

# --- LOCATE 7-ZIP BINARY ---
SEVEN_ZIP_LOCAL="$ROOT_DIR/build-tools/7zip"
USE_SEVEN_ZIP=false

if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
     if [ -f "$SEVEN_ZIP_LOCAL/7za.exe" ]; then
         SEVEN_ZIP_CMD="$SEVEN_ZIP_LOCAL/7za.exe"
         USE_SEVEN_ZIP=true
     fi
else
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
    echo "   ✅ HARPER: 7-Zip loaded: $SEVEN_ZIP_CMD"
else
    echo "   ⚠️  HARPER: I can't find 7-Zip! I'll skip the zip files for now."
fi

# --- OVERWRITE LOGIC ---
OVERWRITE=false
ffmpeg_flag="-n" 
if [[ "$1" == "--rebuild" || "$1" == "-y" ]]; then
  ffmpeg_flag="-y"
  OVERWRITE=true
  echo "   ⚡ HARPER: Rebuild flag detected! Overwriting old tracks and archives."
fi

if [ ! -d "$SEARCH_PATH" ]; then
    echo "   ❌ HARPER: Whoops! Directory not found at $SEARCH_PATH"
    exit 1
fi

# --- MAIN LOOP ---
find "$SEARCH_PATH" -name "tracks.json" | while read tracks_file; do
    
    album_dir=$(dirname "$tracks_file")
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
    
    # Date variables
    CURRENT_DATETIME=$(date +"%m-%d-%Y %I:%M:%S %p")
    CURRENT_YEAR=$(date +"%Y")

    echo ""
    echo "   💿 HARPER: Processing '$ALBUM_NAME' by $ALBUM_ARTIST..."

    # Art Param
    if [ ! -f "$ART_FILE" ]; then
        ART_FILE_PARAM=""
    else
        ART_FILE_PARAM="-i $ART_FILE -map 0:a -map 1:v -codec:v mjpeg -disposition:v attached_pic"
    fi

    # Lyrics Check
    HAS_LYRICS=false
    if [ -d "lyrics" ]; then HAS_LYRICS=true; fi

    # Create directories
    mkdir -p mp3 ogg archives streaming-services

    # Generate Readme
    README_FILE="read-me.txt"
    {
        echo "=================================================================="
        echo "  $ALBUM_NAME ($NARRATIVE_YEAR)"
        echo "  by $ALBUM_ARTIST"
        echo "  Published by Engine Room Records"
        echo "=================================================================="
        echo "Genre: $GENRE"
        echo "Label Website: https://engineroom-records.com"
        echo "Album URL: https://raggiesoft.com$WEB_URL"
        echo ""
        echo "LICENSE & COPYRIGHT:"
        echo "This work is licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)."
        echo "Full License Details: https://raggiesoft.com/about/license"
        echo "Copyright (c) $CURRENT_YEAR Michael P. Ragsdale / RaggieSoft."
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
        
        echo "      🎙️  HARPER: Checking Track $TRACK_NUM - '$TITLE'..."

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
        if [ ! -f "$WAV_FILE" ]; then 
            echo "         ⚠️  WHOA! Master tape missing: $WAV_FILE. Skipping!"
            continue
        fi

        # --- STREAMING METADATA GENERATION ---
        STREAMING_MD="streaming-services/${FILE_BASE}.md"

        if [ ! -f "$STREAMING_MD" ] || [ "$OVERWRITE" = true ]; then
            echo "         -> 📝 Drafting Streaming Metadata (AI Disclosures attached)..."
            {
                echo "# $TITLE - Distribution Metadata"
                echo ""
                echo "## Core Track Information"
                echo "* **Album / Release Title:** $ALBUM_NAME"
                echo "* **Track Number:** $TRACK_NUM"
                echo "* **Primary Artist (Release Persona):** $ALBUM_ARTIST"
                echo "* **Real-World / Legal Artist:** Michael P. Ragsdale"
                echo "* **Genre:** $GENRE"
                echo "* **Explicit Content:** No (Clean)"
                echo "* **Vocal Language:** English (EN-US)"
                echo "* **Fictional Narrative Year:** $NARRATIVE_YEAR"
                echo "* **Real-World Release Year:** $CURRENT_YEAR"
                echo "* **Generated On:** $CURRENT_DATETIME"
                echo "* **Master File Located At:** ../wav/${FILE_BASE}.wav"
                echo ""
                echo "## Distribution & AI Disclosure Notes"
                echo ""
                echo "**1. Rights & Clearances**"
                echo "* **Commercial Rights:** 100% cleared. Generated using a commercial-tier Suno Premium subscription."
                echo "* **Copyright Ownership:** The underlying narrative, lyrics, and the '$ALBUM_ARTIST' persona are Copyright Michael P. Ragsdale. While freely distributed under CC BY-SA 4.0 on RaggieSoft.com, full commercial rights are retained and authorized for this specific distribution."
                echo "* **Impersonation/Voice Cloning:** NONE. All vocals are entirely synthetic and do not clone, mimic, or impersonate any real-world artist or person."
                echo ""
                echo "**2. Creative Process & Human Contribution**"
                echo "* This track is a human-directed production."
                echo "* **Human/Author Contribution:** Original narrative concept, thematic direction, lyric writing, and persona creation."
                echo "* **AI Assistance (Gemini):** Lyric refinement and style prompting."
                echo "* **AI Generation (Suno):** AI-assisted instrumentation, composition, and vocal generation."
                echo ""
                echo "**3. Suggested DDEX Credits (For Spotify/Apple Music)**"
                echo "* Lyrics: Human"
                echo "* Instrumentation/Music: AI-Generated"
                echo "* Vocals: AI-Generated"
            } > "$STREAMING_MD"
        else
            echo "         ⏭️  Streaming Metadata already exists! Fast-forwarding."
        fi

        # MP3 (V0)
        if [ ! -f "mp3/$FILE_BASE.mp3" ] || [ "$OVERWRITE" = true ]; then
            echo "         -> 🎚️ Cutting MP3..."
            ffmpeg -nostdin -hide_banner -stats $ffmpeg_flag -i "$WAV_FILE" $ART_FILE_PARAM \
            -codec:a libmp3lame -q:a 0 -id3v2_version 3 -write_id3v1 1 \
            -metadata title="$TITLE" -metadata artist="$ALBUM_ARTIST" -metadata album="$ALBUM_NAME" \
            -metadata date="$NARRATIVE_YEAR" -metadata track="$TRACK_NUM" -metadata disc="$DISC_NUM" -metadata genre="$GENRE" \
            -metadata publisher="Engine Room Records" -metadata copyright="CC BY-SA 4.0 - Michael P. Ragsdale / RaggieSoft" \
            -metadata comment="Website: https://engineroom-records.com | Licensing: https://raggiesoft.com/about/license" \
            "mp3/$FILE_BASE.mp3"
        else
            echo "         ⏭️  MP3 already exists! Fast-forwarding."
        fi

        # OGG (Q9)
        if [ ! -f "ogg/$FILE_BASE.ogg" ] || [ "$OVERWRITE" = true ]; then
            echo "         -> 🎚️ Pressing OGG..."
            ffmpeg -nostdin -hide_banner -stats $ffmpeg_flag -i "$WAV_FILE" \
            -codec:a libvorbis -q:a 9 \
            -metadata title="$TITLE" -metadata artist="$ALBUM_ARTIST" -metadata album="$ALBUM_NAME" \
            -metadata date="$NARRATIVE_YEAR" -metadata tracknumber="$TRACK_NUM" -metadata discnumber="$DISC_NUM" \
            -metadata publisher="Engine Room Records" -metadata copyright="CC BY-SA 4.0 - Michael P. Ragsdale / RaggieSoft" \
            -metadata comment="Website: https://engineroom-records.com | Licensing: https://raggiesoft.com/about/license" \
            "ogg/$FILE_BASE.ogg"
        else
            echo "         ⏭️  OGG already exists! Fast-forwarding."
        fi

    done

    # Archives (7-Zip)
    if [ "$USE_SEVEN_ZIP" = true ]; then
        ZIP_MP3="archives/${ARCHIVE_BASE_NAME}-mp3.zip"
        ZIP_OGG="archives/${ARCHIVE_BASE_NAME}-ogg.zip"
        ZIP_WAV="archives/${ARCHIVE_BASE_NAME}-wav.7z"

        echo "      🎙️  HARPER: Booting up the Archiver. Turning on the studio monitors so you can hear the crunch..."

        # Pack MP3 Archive
        if [ ! -f "$ZIP_MP3" ] || [ "$OVERWRITE" = true ]; then
            echo "         -> 📦 Packing MP3 Archive..."
            rm -f "$ZIP_MP3"
            "$SEVEN_ZIP_CMD" a -tzip -mx=5 "$ZIP_MP3" ./mp3/*.mp3 "$README_FILE" "$ART_FILE"
            if [ "$HAS_LYRICS" = true ]; then "$SEVEN_ZIP_CMD" a -tzip -mx=5 "$ZIP_MP3" ./lyrics/*.md; fi
        else
            echo "         ⏭️  MP3 Archive already exists! Skipping."
        fi

        # Pack OGG Archive
        if [ ! -f "$ZIP_OGG" ] || [ "$OVERWRITE" = true ]; then
            echo "         -> 📦 Packing OGG Archive..."
            rm -f "$ZIP_OGG"
            "$SEVEN_ZIP_CMD" a -tzip -mx=5 "$ZIP_OGG" ./ogg/*.ogg "$README_FILE" "$ART_FILE"
            if [ "$HAS_LYRICS" = true ]; then "$SEVEN_ZIP_CMD" a -tzip -mx=5 "$ZIP_OGG" ./lyrics/*.md; fi
        else
            echo "         ⏭️  OGG Archive already exists! Skipping."
        fi

        # Pack WAV Archive
        if [ ! -f "$ZIP_WAV" ] || [ "$OVERWRITE" = true ]; then
            echo "         -> 📦 Packing massive WAV Archive (Ultra Compression active, hold tight!)..."
            rm -f "$ZIP_WAV"
            "$SEVEN_ZIP_CMD" a -t7z -mx=9 -ms=on "$ZIP_WAV" ./wav/*.wav "$README_FILE" "$ART_FILE"
            if [ "$HAS_LYRICS" = true ]; then "$SEVEN_ZIP_CMD" a -t7z -mx=9 "$ZIP_WAV" ./lyrics/*.md; fi
        else
            echo "         ⏭️  WAV Archive already exists! Skipping."
        fi
        
        echo "   📦 HARPER: Archive checks complete."
    fi
    
    rm "$README_FILE"
    popd > /dev/null
done

# --- FINALIZE SEARCH INDEX ---
echo "🎧 HARPER: Finalizing the Search Index..."
if [ -f "$TEMP_SEARCH_INDEX" ]; then
    jq -s '.' "$TEMP_SEARCH_INDEX" > "$METADATA_FILE"
    rm "$TEMP_SEARCH_INDEX"
    echo "   ✅ HARPER: Index saved to $METADATA_FILE"
fi

echo "🎧 HARPER: Session complete! The tracks and paperwork are hot and ready for the radio."