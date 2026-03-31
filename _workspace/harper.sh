#!/bin/bash

# --- HARPER: THE STUDIO ENGINEER (v20.0 - The Vault Edition) ---
# "I live in the studio. I take raw master tapes and press them for the airwaves."
#
# ROLE:
# Harper is the heavy lifter. She recursively scans the workspace for Master WAV files.
# NEW: Generates 128kbps "Radio Edits" for the free public web player.
# NEW: Routes High-Fidelity MP3s (V0), OGGs (Q9), and Archives into the secure /vault/ directory.
# She drafts Markdown metadata files for commercial streaming distribution.
# Integrates Real-ESRGAN for automated 4K DistroKid art upscaling.
# Generates sanitized DSP lyrics and structures the /streaming-services package.
#
# PERSONALITY: High-Energy, Efficient, Loud.

echo "🎧 HARPER: Alright! Firing up the mixing board (v20.0)... Let's make some noise!"

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

# --- LOCATE UPSCALER BINARY ---
UPSCALER_BASE="$ROOT_DIR/build-tools/realesrgan"
USE_UPSCALER=false

if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    if [ -f "$UPSCALER_BASE/windows/realesrgan-ncnn-vulkan.exe" ]; then
        UPSCALER_CMD="$UPSCALER_BASE/windows/realesrgan-ncnn-vulkan.exe"
        USE_UPSCALER=true
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    if [ -f "$UPSCALER_BASE/macos/realesrgan-ncnn-vulkan" ]; then
        UPSCALER_CMD="$UPSCALER_BASE/macos/realesrgan-ncnn-vulkan"
        chmod +x "$UPSCALER_CMD"
        USE_UPSCALER=true
    fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if [ -f "$UPSCALER_BASE/ubuntu/realesrgan-ncnn-vulkan" ]; then
        UPSCALER_CMD="$UPSCALER_BASE/ubuntu/realesrgan-ncnn-vulkan"
        chmod +x "$UPSCALER_CMD"
        USE_UPSCALER=true
    fi
fi

if [ "$USE_UPSCALER" = true ]; then
    echo "   ✅ HARPER: Upscaler loaded: $UPSCALER_CMD"
else
    echo "   ⚠️  HARPER: Upscaler missing from $UPSCALER_BASE. Skipping art enhancement."
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

    # Create new Vault directories and public Web MP3 directory
    mkdir -p web-mp3 vault/mp3 vault/ogg vault/archives streaming-services/album-art streaming-services/lyrics streaming-services/song-metadata

    # --- HARPER: ARTWORK UPSCALING ---
    RAW_ART="album-art.jpg"
    UPSCALED_ART="streaming-services/album-art/album-art-upscaled.jpg"
    MODEL_NAME="realesrgan-x4plus"

    if [ "$USE_UPSCALER" = true ] && [ -f "$RAW_ART" ]; then
        if [ ! -f "$UPSCALED_ART" ] || [ "$OVERWRITE" = true ]; then
            echo "      🖼️  HARPER: Artwork detected. Firing up the upscaler to 4K..."
            
            if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
                WIN_IN=$(cygpath -w "$(pwd)/$RAW_ART")
                WIN_OUT=$(cygpath -w "$(pwd)/$UPSCALED_ART")
                WIN_MODELS=$(cygpath -w "$(dirname "$UPSCALER_CMD")/models")
                "$UPSCALER_CMD" -i "$WIN_IN" -o "$WIN_OUT" -m "$WIN_MODELS" -n "$MODEL_NAME" -s 4 -f jpg
            else
                UNIX_MODELS="$(dirname "$UPSCALER_CMD")/models"
                "$UPSCALER_CMD" -i "$RAW_ART" -o "$UPSCALED_ART" -m "$UNIX_MODELS" -n "$MODEL_NAME" -s 4 -f jpg
            fi
            
            echo "      ✅ HARPER: Artwork successfully upscaled to /streaming-services/album-art/"
        else
            echo "      ⏭️  Upscaled 4K Artwork already exists! Fast-forwarding."
        fi
    fi

    # Art Param for FFmpeg (Using original art to keep file size down)
    if [ ! -f "$ART_FILE" ]; then
        ART_FILE_PARAM=""
    else
        ART_FILE_PARAM="-i $ART_FILE -map 0:a -map 1:v -codec:v mjpeg -disposition:v attached_pic"
    fi

    # Lyrics Check
    HAS_LYRICS=false
    if [ -d "lyrics" ]; then HAS_LYRICS=true; fi

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

        # --- DSP LYRICS GENERATION ---
        LYRIC_MD="lyrics/${FILE_BASE}.md"
        LYRIC_TXT="streaming-services/lyrics/${FILE_BASE}.txt"

        if [ -f "$LYRIC_MD" ]; then
            if [ ! -f "$LYRIC_TXT" ] || [ "$OVERWRITE" = true ]; then
                echo "         -> 📝 Scrubbing Lyrics for DSP delivery..."
                sed '1,/\*\*LYRICS:\*\*/d' "$LYRIC_MD" | \
                sed '/^[[:space:]]*[\[(].*[\])][[:space:]]*$/d' | \
                cat -s | sed '/^[[:space:]]*$/{N;/^\n$/D;}' > "$LYRIC_TXT"
            else
                echo "         ⏭️  DSP Lyrics already clean! Fast-forwarding."
            fi
        fi

        # --- FREE TIER: Radio Edit MP3 (128kbps for Web Player) ---
        if [ ! -f "web-mp3/$FILE_BASE.mp3" ] || [ "$OVERWRITE" = true ]; then
            echo "         -> 📻 Pressing Radio Edit MP3 (128kbps)..."
            ffmpeg -nostdin -hide_banner -stats $ffmpeg_flag -i "$WAV_FILE" $ART_FILE_PARAM \
            -codec:a libmp3lame -b:a 128k -id3v2_version 3 -write_id3v1 1 \
            -metadata title="$TITLE" -metadata artist="$ALBUM_ARTIST" -metadata album="$ALBUM_NAME" \
            -metadata date="$NARRATIVE_YEAR" -metadata track="$TRACK_NUM" -metadata disc="$DISC_NUM" -metadata genre="$GENRE" \
            -metadata publisher="Engine Room Records" -metadata copyright="CC BY-SA 4.0 - Michael P. Ragsdale / RaggieSoft" \
            -metadata comment="Free Stream Edition | Premium Archives: https://engineroom-records.com" \
            "web-mp3/$FILE_BASE.mp3"
        else
            echo "         ⏭️  Radio Edit MP3 already exists! Fast-forwarding."
        fi

        # --- PREMIUM TIER: V0 MP3 (Vault) ---
        if [ ! -f "vault/mp3/$FILE_BASE.mp3" ] || [ "$OVERWRITE" = true ]; then
            echo "         -> 🎚️ Cutting High-Fidelity MP3 for the Vault..."
            ffmpeg -nostdin -hide_banner -stats $ffmpeg_flag -i "$WAV_FILE" $ART_FILE_PARAM \
            -codec:a libmp3lame -q:a 0 -id3v2_version 3 -write_id3v1 1 \
            -metadata title="$TITLE" -metadata artist="$ALBUM_ARTIST" -metadata album="$ALBUM_NAME" \
            -metadata date="$NARRATIVE_YEAR" -metadata track="$TRACK_NUM" -metadata disc="$DISC_NUM" -metadata genre="$GENRE" \
            -metadata publisher="Engine Room Records" -metadata copyright="CC BY-SA 4.0 - Michael P. Ragsdale / RaggieSoft" \
            -metadata comment="Premium Archive | Licensing: https://raggiesoft.com/about/license" \
            "vault/mp3/$FILE_BASE.mp3"
        else
            echo "         ⏭️  Premium MP3 already exists! Fast-forwarding."
        fi

        # --- PREMIUM TIER: Q9 OGG (Vault) ---
        if [ ! -f "vault/ogg/$FILE_BASE.ogg" ] || [ "$OVERWRITE" = true ]; then
            echo "         -> 🎚️ Pressing High-Fidelity OGG for the Vault..."
            ffmpeg -nostdin -hide_banner -stats $ffmpeg_flag -i "$WAV_FILE" \
            -codec:a libvorbis -q:a 9 \
            -metadata title="$TITLE" -metadata artist="$ALBUM_ARTIST" -metadata album="$ALBUM_NAME" \
            -metadata date="$NARRATIVE_YEAR" -metadata tracknumber="$TRACK_NUM" -metadata discnumber="$DISC_NUM" \
            -metadata publisher="Engine Room Records" -metadata copyright="CC BY-SA 4.0 - Michael P. Ragsdale / RaggieSoft" \
            -metadata comment="Premium Archive | Licensing: https://raggiesoft.com/about/license" \
            "vault/ogg/$FILE_BASE.ogg"
        else
            echo "         ⏭️  Premium OGG already exists! Fast-forwarding."
        fi

    done

    # Archives (7-Zip) -> Routing to Vault
    if [ "$USE_SEVEN_ZIP" = true ]; then
        ZIP_MP3="vault/archives/${ARCHIVE_BASE_NAME}-mp3.zip"
        ZIP_OGG="vault/archives/${ARCHIVE_BASE_NAME}-ogg.zip"
        ZIP_WAV="vault/archives/${ARCHIVE_BASE_NAME}-wav.7z"

        echo "      🎙️  HARPER: Booting up the Archiver. Securing files into the Vault..."

        # Pack MP3 Archive
        if [ ! -f "$ZIP_MP3" ] || [ "$OVERWRITE" = true ]; then
            echo "         -> 📦 Packing Premium MP3 Archive..."
            rm -f "$ZIP_MP3"
            "$SEVEN_ZIP_CMD" a -tzip -mx=5 "$ZIP_MP3" ./vault/mp3/*.mp3 "$README_FILE" "$ART_FILE"
            if [ "$HAS_LYRICS" = true ]; then "$SEVEN_ZIP_CMD" a -tzip -mx=5 "$ZIP_MP3" ./lyrics/*.md; fi
        else
            echo "         ⏭️  Premium MP3 Archive already exists! Skipping."
        fi

        # Pack OGG Archive
        if [ ! -f "$ZIP_OGG" ] || [ "$OVERWRITE" = true ]; then
            echo "         -> 📦 Packing Premium OGG Archive..."
            rm -f "$ZIP_OGG"
            "$SEVEN_ZIP_CMD" a -tzip -mx=5 "$ZIP_OGG" ./vault/ogg/*.ogg "$README_FILE" "$ART_FILE"
            if [ "$HAS_LYRICS" = true ]; then "$SEVEN_ZIP_CMD" a -tzip -mx=5 "$ZIP_OGG" ./lyrics/*.md; fi
        else
            echo "         ⏭️  Premium OGG Archive already exists! Skipping."
        fi

        # Pack WAV Archive
        if [ ! -f "$ZIP_WAV" ] || [ "$OVERWRITE" = true ]; then
            echo "         -> 📦 Packing massive WAV Master Archive (Ultra Compression active!)..."
            rm -f "$ZIP_WAV"
            "$SEVEN_ZIP_CMD" a -t7z -mx=9 -ms=on "$ZIP_WAV" ./wav/*.wav "$README_FILE" "$ART_FILE"
            if [ "$HAS_LYRICS" = true ]; then "$SEVEN_ZIP_CMD" a -t7z -mx=9 "$ZIP_WAV" ./lyrics/*.md; fi
        else
            echo "         ⏭️  WAV Master Archive already exists! Skipping."
        fi
        
        echo "   📦 HARPER: Vault secure. Archives packed."
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

echo "🎧 HARPER: Session complete! The radio edits are public, and the master tapes are locked in the vault."