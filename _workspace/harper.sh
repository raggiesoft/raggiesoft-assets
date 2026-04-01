#!/bin/bash

# --- HARPER: THE STUDIO ENGINEER (v20.4 - The Distribution Fix) ---
# "I live in the studio. I take raw master tapes and press them for the airwaves."
#
# ROLE:
# Harper is the heavy lifter. She recursively scans the workspace for Master WAV files.
# Generates 128kbps "Radio Edits" for the free public web player.
# Routes High-Fidelity MP3s (V0), OGGs (Q9), and Archives into the secure /vault/ directory.
# Drafts Markdown metadata files for commercial streaming distribution.
# Binds individual lyric markdown files into a master album-level markdown booklet.
# Integrates Real-ESRGAN for automated 4K DistroKid art upscaling.
# Generates sanitized DSP lyrics and structures the /streaming-services package.
# Parses Narrative (Lore) dates and Real-World (DSP) release dates.
# NEW: Stamps real-world release years onto audio files for DSP compliance.
#
# PERSONALITY: High-Energy, Efficient, Loud.

echo "🎧 HARPER: Alright! Firing up the mixing board (v20.4)... Let's make some noise!"

# Define Root relative to script location
WORKSPACE_DIR=$(dirname "$0")
cd "$WORKSPACE_DIR" || exit
ROOT_DIR=$(pwd)

# --- PATH CONFIGURATION ---
SEARCH_PATH="../engine-room-records/artists"
METADATA_FILE="../engine-room-records/artists/metadata.json"
TEMP_SEARCH_INDEX="temp_search_index.jsonl" 

echo "   🎚️  Targeting Studio Archives: $SEARCH_PATH"

# Initialize Index (Fixed: No leading blank line)
> "$TEMP_SEARCH_INDEX" 

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
    GENRE=$(jq -r '.genre' "$ALBUM_JSON")
    
    # --- HARPER: TIME WEAVER DATE LOGIC ---
    NARRATIVE_DATE=$(jq -r '.narrativeReleaseDate' "$ALBUM_JSON")
    REAL_RELEASE_DATE=$(jq -r '.realReleaseDate // empty' "$ALBUM_JSON")
    
    # Fallback to today if realReleaseDate is missing
    if [ -z "$REAL_RELEASE_DATE" ]; then REAL_RELEASE_DATE=$(date +"%Y-%m-%d"); fi

    # Extract just the 4-digit years for standard tagging and zip naming
    NARRATIVE_YEAR=${NARRATIVE_DATE:0:4}
    REAL_RELEASE_YEAR=${REAL_RELEASE_DATE:0:4}
    
    # Slugs
    ALBUM_SLUG=$(basename "$album_dir")
    ARTIST_DIR_PATH=$(dirname "$album_dir")
    ARTIST_SLUG=$(basename "$ARTIST_DIR_PATH")

    WEB_URL="/engine-room/artists/$ARTIST_SLUG/albums/$ALBUM_SLUG"
    SAFE_ALBUM_NAME=$(echo "$ALBUM_NAME" | tr '[:upper:]' '[:lower:]' | tr -d '[:punct:]' | tr ' ' '-')
    ARCHIVE_BASE_NAME="${NARRATIVE_YEAR}-${SAFE_ALBUM_NAME}"
    
    # Date variables
    CURRENT_DATETIME=$(date +"%m-%d-%Y %I:%M:%S %p")

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

    # Art Param for FFmpeg
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
        echo "Copyright (c) $REAL_RELEASE_YEAR Michael P. Ragsdale / RaggieSoft."
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

        # Transcoding
        WAV_FILE="wav/${FILE_BASE}.wav"
        
        # Ensure WAV exists BEFORE indexing the track
        if [ ! -f "$WAV_FILE" ]; then 
            echo "         ⚠️  WHOA! Master tape missing: $WAV_FILE. Skipping!"
            continue
        fi

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

        # --- DSP METADATA GENERATION ---
        METADATA_MD="streaming-services/song-metadata/${FILE_BASE}.md"

        if [ ! -f "$METADATA_MD" ] || [ "$OVERWRITE" = true ]; then
            echo "         -> 📋 Drafting DDEX Metadata sheet..."
            cat <<EOF > "$METADATA_MD"
# $TITLE - Distribution Metadata

## Core Track Information
* **Track Title:** $TITLE
* **Album / Release Title:** $ALBUM_NAME
* **Disc Number:** $DISC_NUM
* **Track Number:** $TRACK_NUM
* **Primary Artist (Release Persona):** $ALBUM_ARTIST
* **Real-World / Legal Artist:** Michael P. Ragsdale
* **Genre:** $GENRE
* **Explicit Content:** No (Clean)
* **Vocal Language:** English (EN-US)
* **Fictional Narrative Release Date:** $NARRATIVE_DATE
* **Real-World DSP Release Date:** $REAL_RELEASE_DATE
* **Generated On:** $CURRENT_DATETIME
* **Master File Located At:** ../../wav/${FILE_BASE}.wav

## Distribution & AI Disclosure Notes

**1. Rights & Clearances**
* **Commercial Rights:** 100% cleared. Generated using a commercial-tier Suno Premium subscription.
* **Copyright Ownership:** The underlying narrative, lyrics, and the '$ALBUM_ARTIST' persona are Copyright Michael P. Ragsdale. While freely distributed under CC BY-SA 4.0 on RaggieSoft.com, full commercial rights are retained and authorized for this specific distribution.
* **Impersonation/Voice Cloning:** NONE. All vocals are entirely synthetic and do not clone, mimic, or impersonate any real-world artist or person.

**2. Creative Process & Human Contribution**
* This track is a human-directed production.
* **Human/Author Contribution:** Original narrative concept, thematic direction, lyric writing, and persona creation.
* **AI Assistance (Gemini):** Lyric refinement and style prompting.
* **AI Generation (Suno):** AI-assisted instrumentation, composition, and vocal generation.

**3. Suggested DDEX Credits (For Spotify/Apple Music)**
* Lyrics: Human
* Instrumentation/Music: AI-Generated
* Vocals: AI-Generated
EOF
        else
            echo "         ⏭️  DSP Metadata sheet already exists! Fast-forwarding."
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
            -metadata date="$REAL_RELEASE_YEAR" -metadata track="$TRACK_NUM" -metadata disc="$DISC_NUM" -metadata genre="$GENRE" \
            -metadata publisher="Engine Room Records" -metadata copyright="CC BY-SA 4.0 - $REAL_RELEASE_YEAR Michael P. Ragsdale / RaggieSoft" \
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
            -metadata date="$REAL_RELEASE_YEAR" -metadata track="$TRACK_NUM" -metadata disc="$DISC_NUM" -metadata genre="$GENRE" \
            -metadata publisher="Engine Room Records" -metadata copyright="CC BY-SA 4.0 - $REAL_RELEASE_YEAR Michael P. Ragsdale / RaggieSoft" \
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
            -metadata date="$REAL_RELEASE_YEAR" -metadata tracknumber="$TRACK_NUM" -metadata discnumber="$DISC_NUM" \
            -metadata publisher="Engine Room Records" -metadata copyright="CC BY-SA 4.0 - $REAL_RELEASE_YEAR Michael P. Ragsdale / RaggieSoft" \
            -metadata comment="Premium Archive | Licensing: https://raggiesoft.com/about/license" \
            "vault/ogg/$FILE_BASE.ogg"
        else
            echo "         ⏭️  Premium OGG already exists! Fast-forwarding."
        fi

    done

    # --- HARPER: BINDING THE LYRIC BOOKLET ---
    if [ "$HAS_LYRICS" = true ]; then
        COMBINED_LYRICS_FILE="${SAFE_ALBUM_NAME}.md"
        
        if [ ! -f "$COMBINED_LYRICS_FILE" ] || [ "$OVERWRITE" = true ]; then
            echo "      📝  HARPER: Binding the master lyric booklet ($COMBINED_LYRICS_FILE)..."
            
            # Initialize with a couple of blank lines to match the requested format
            echo "" > "$COMBINED_LYRICS_FILE"
            echo "" >> "$COMBINED_LYRICS_FILE"

            # Loop through tracks.json to guarantee 100% accurate album order
            jq -c '.tracks[]' "tracks.json" | while read -r track_json; do
                FILE_BASE=$(echo "$track_json" | jq -r '.fileName')
                LYRIC_MD="lyrics/${FILE_BASE}.md"
                
                if [ -f "$LYRIC_MD" ]; then
                    echo "***" >> "$COMBINED_LYRICS_FILE"
                    echo "### **${FILE_BASE}.md**" >> "$COMBINED_LYRICS_FILE"
                    echo "***" >> "$COMBINED_LYRICS_FILE"
                    echo "" >> "$COMBINED_LYRICS_FILE"
                    cat "$LYRIC_MD" >> "$COMBINED_LYRICS_FILE"
                    echo "" >> "$COMBINED_LYRICS_FILE"
                    echo "" >> "$COMBINED_LYRICS_FILE"
                fi
            done
        else
            echo "      ⏭️  Master lyric booklet already bound! Fast-forwarding."
        fi
    fi

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
            mkdir -p vault/archives/staging_mp3/lyrics
            cp vault/mp3/*.mp3 vault/archives/staging_mp3/
            cp "$README_FILE" vault/archives/staging_mp3/
            [ -f "$ART_FILE" ] && cp "$ART_FILE" vault/archives/staging_mp3/
            if [ "$HAS_LYRICS" = true ]; then
                cp lyrics/*.md vault/archives/staging_mp3/lyrics/
                [ -f "$COMBINED_LYRICS_FILE" ] && cp "$COMBINED_LYRICS_FILE" vault/archives/staging_mp3/
            fi
            
            pushd vault/archives/staging_mp3 > /dev/null
            "$SEVEN_ZIP_CMD" a -tzip -mx=5 "../${ARCHIVE_BASE_NAME}-mp3.zip" * > /dev/null
            popd > /dev/null
            rm -rf vault/archives/staging_mp3
        else
            echo "         ⏭️  Premium MP3 Archive already exists! Skipping."
        fi

        # Pack OGG Archive
        if [ ! -f "$ZIP_OGG" ] || [ "$OVERWRITE" = true ]; then
            echo "         -> 📦 Packing Premium OGG Archive..."
            rm -f "$ZIP_OGG"
            mkdir -p vault/archives/staging_ogg/lyrics
            cp vault/ogg/*.ogg vault/archives/staging_ogg/
            cp "$README_FILE" vault/archives/staging_ogg/
            [ -f "$ART_FILE" ] && cp "$ART_FILE" vault/archives/staging_ogg/
            if [ "$HAS_LYRICS" = true ]; then
                cp lyrics/*.md vault/archives/staging_ogg/lyrics/
                [ -f "$COMBINED_LYRICS_FILE" ] && cp "$COMBINED_LYRICS_FILE" vault/archives/staging_ogg/
            fi
            
            pushd vault/archives/staging_ogg > /dev/null
            "$SEVEN_ZIP_CMD" a -tzip -mx=5 "../${ARCHIVE_BASE_NAME}-ogg.zip" * > /dev/null
            popd > /dev/null
            rm -rf vault/archives/staging_ogg
        else
            echo "         ⏭️  Premium OGG Archive already exists! Skipping."
        fi

        # Pack WAV Archive
        if [ ! -f "$ZIP_WAV" ] || [ "$OVERWRITE" = true ]; then
            echo "         -> 📦 Packing massive WAV Master Archive (Ultra Compression active!)..."
            rm -f "$ZIP_WAV"
            mkdir -p vault/archives/staging_wav/lyrics
            cp wav/*.wav vault/archives/staging_wav/
            cp "$README_FILE" vault/archives/staging_wav/
            [ -f "$ART_FILE" ] && cp "$ART_FILE" vault/archives/staging_wav/
            if [ "$HAS_LYRICS" = true ]; then
                cp lyrics/*.md vault/archives/staging_wav/lyrics/
                [ -f "$COMBINED_LYRICS_FILE" ] && cp "$COMBINED_LYRICS_FILE" vault/archives/staging_wav/
            fi
            
            pushd vault/archives/staging_wav > /dev/null
            "$SEVEN_ZIP_CMD" a -t7z -mx=9 -ms=on "../${ARCHIVE_BASE_NAME}-wav.7z" * > /dev/null
            popd > /dev/null
            rm -rf vault/archives/staging_wav
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
if [ -s "$TEMP_SEARCH_INDEX" ]; then
    jq -s '.' "$TEMP_SEARCH_INDEX" > "$METADATA_FILE"
    rm "$TEMP_SEARCH_INDEX"
    echo "   ✅ HARPER: Index saved to $METADATA_FILE"
else
    echo "   ⚠️  HARPER: Search index was empty. Skipping metadata generation."
    rm -f "$TEMP_SEARCH_INDEX"
fi

echo "🎧 HARPER: Session complete! The radio edits are public, and the master tapes are locked in the vault."