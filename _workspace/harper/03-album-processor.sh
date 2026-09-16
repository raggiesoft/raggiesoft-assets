#!/usr/bin/env bash
# --- HARPER MODULE 03: ALBUM PROCESSOR ---

echo "   🔍 HARPER: Indexing vault chronologically by Narrative Year..."
TEMP_SORTED_ALBUMS="temp_sorted_albums.txt"
> "$TEMP_SORTED_ALBUMS"

# --- NEW CLEANUP BLOCK ---
if [ "$OVERWRITE" = true ]; then
    echo "   🧹 HARPER: Sweeping old Master Discography files..."
    find "$SEARCH_PATH" -name "*-discography-and-lyrics.md" -type f -delete
fi

find "$SEARCH_PATH" -name "album.json" | while read album_file; do
    NARR_DATE=`jq -r '.temporalCoverage // empty' "$album_file"`
    NARR_YEAR=`echo "$NARR_DATE" | cut -c 1-4`
    if [ -z "$NARR_YEAR" ]; then NARR_YEAR="9999"; fi
    
    album_dir=`dirname "$album_file"`
    if [ -f "$album_dir/tracks.json" ]; then
        echo "$NARR_YEAR|$album_dir/tracks.json" >> "$TEMP_SORTED_ALBUMS"
    fi
done

sort -n "$TEMP_SORTED_ALBUMS" | cut -d'|' -f2 | while read tracks_file; do
    
    album_dir=`dirname "$tracks_file"`
    pushd "$album_dir" > /dev/null
    
    ALBUM_JSON="album.json"
    ART_FILE="album-art.jpg"

    if [ ! -f "$ALBUM_JSON" ]; then
        popd > /dev/null
        continue
    fi
    

    ALBUM_ARTIST=`jq -r '.byArtist.name // empty' "$ALBUM_JSON"`
    ALBUM_NAME=`jq -r '.name // empty' "$ALBUM_JSON"`
    GENRE=`jq -r '.genre // empty' "$ALBUM_JSON"`
    ALBUM_DISTRO=`jq -r '.publisher.name // "DistroKid"' "$ALBUM_JSON"`
    ALBUM_CLEARANCE=`jq -r '.conditionsOfAccess // "Cleared - Suno Commercial Premium License"' "$ALBUM_JSON"`
    NARRATIVE_DATE=`jq -r '.temporalCoverage // empty' "$ALBUM_JSON"`
    REAL_RELEASE_DATE=`jq -r '.datePublished // empty' "$ALBUM_JSON"`
    ALBUM_UPC=`jq -r '.gtin12 // .identifier // empty' "$ALBUM_JSON"`
    ALBUM_TYPE=`jq -r '.albumProductionType // "StudioAlbum"' "$ALBUM_JSON"`
    
    
    if [ -z "$REAL_RELEASE_DATE" ]; then REAL_RELEASE_DATE=`date +"%Y-%m-%d"`; fi

    NARRATIVE_YEAR=`echo "$NARRATIVE_DATE" | cut -c 1-4`
    REAL_RELEASE_YEAR=`echo "$REAL_RELEASE_DATE" | cut -c 1-4`
    
    ALBUM_SLUG=`basename "$album_dir"`
    ARTIST_DIR_PATH=`dirname "$album_dir"`
    ARTIST_SLUG=`basename "$ARTIST_DIR_PATH"`
    
    WEB_URL="/engine-room/artists/$ARTIST_SLUG/albums/$ALBUM_SLUG"
    SAFE_ALBUM_NAME=`echo "$ALBUM_NAME" | tr '[:upper:]' '[:lower:]' | tr -d '[:punct:]' | tr ' ' '-'`
    ARCHIVE_BASE_NAME="$NARRATIVE_YEAR-$SAFE_ALBUM_NAME"
    CURRENT_DATETIME=`date +"%m-%d-%Y %I:%M:%S %p"`

    MASTER_DISCO_FILE="$ROOT_DIR/$SEARCH_PATH/$ARTIST_SLUG/$ARTIST_SLUG-discography-and-lyrics.md"

    if [ ! -f "$MASTER_DISCO_FILE" ] || [ "$OVERWRITE" = true ]; then
        if ! grep -q "" "$MASTER_DISCO_FILE" 2>/dev/null; then
            echo "      📝 HARPER: Initializing Master Discography for $ALBUM_ARTIST..."
            echo "" > "$MASTER_DISCO_FILE"
            echo "# $ALBUM_ARTIST - Master Discography & Lore" >> "$MASTER_DISCO_FILE"
            echo "Compiled on: $CURRENT_DATETIME" >> "$MASTER_DISCO_FILE"
            echo "" >> "$MASTER_DISCO_FILE"
        fi
    fi
    

    if [ "$ALBUM_TYPE" != "StudioAlbum" ]; then
        echo "# $ALBUM_NAME ($NARRATIVE_YEAR) [$ALBUM_TYPE]" >> "$MASTER_DISCO_FILE"
    else
        echo "# $ALBUM_NAME ($NARRATIVE_YEAR)" >> "$MASTER_DISCO_FILE"
    fi
    
    # --- NEW DATE METADATA BLOCK ---
    echo "* **Narrative Era:** $NARRATIVE_YEAR" >> "$MASTER_DISCO_FILE"
    echo "* **Real-World DSP Release:** $REAL_RELEASE_DATE" >> "$MASTER_DISCO_FILE"
    echo "" >> "$MASTER_DISCO_FILE"
    # -------------------------------
    
    echo "   💿 HARPER: Processing '$ALBUM_NAME' by$ALBUM_ARTIST..."

    mkdir -p web-mp3 vault/mp3 vault/ogg vault/flac vault/wav vault/archives streaming-services/album-art streaming-services/lyrics streaming-services/song-metadata

    UPSCALED_ART="streaming-services/album-art/$ART_FILE"
    if [ -f "$UPSCALED_ART" ]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            CURRENT_WIDTH=`sips -g pixelWidth "$UPSCALED_ART" | tail -n1 | awk '{print $2}'`
            if [ -n "$CURRENT_WIDTH" ] && [ "$CURRENT_WIDTH" -gt 3000 ]; then
                echo "      📏 HARPER: Downscaling art from "$CURRENT_WIDTH"px to DistroKid optimal (3000px)..."
                sips -Z 3000 "$UPSCALED_ART" > /dev/null 2>&1
            fi
        elif command -v identify &> /dev/null && command -v mogrify &> /dev/null; then
            CURRENT_WIDTH=`identify -format "%w" "$UPSCALED_ART" 2>/dev/null`
            if [ -n "$CURRENT_WIDTH" ] && [ "$CURRENT_WIDTH" -gt 3000 ]; then
                echo "      📏 HARPER: Downscaling art from "$CURRENT_WIDTH"px to DistroKid optimal (3000px)..."
                mogrify -resize 3000x3000\> "$UPSCALED_ART"
            fi
        fi
    fi

    if [ ! -f "$ART_FILE" ]; then
        export ART_FILE_PARAM=""
    else
        export ART_FILE_PARAM="-i $ART_FILE -map 0:a -map 1:v -codec:v mjpeg -disposition:v attached_pic"
    fi

    HAS_LYRICS=false
    if [ -d "lyrics" ]; then HAS_LYRICS=true; fi

        README_FILE="read-me.txt"
    {
        echo "=================================================================="
        echo "  $ALBUM_NAME ($NARRATIVE_YEAR)"
        echo "  by $ALBUM_ARTIST"
        echo "  Published by Engine Room Records"
        echo "=================================================================="
        echo "Genre: $GENRE"
        if [ -n "$ALBUM_UPC" ]; then echo "UPC / Barcode:$ALBUM_UPC"; fi
        echo "Label Website: https://engineroom-records.com"
        echo "Album URL: https://raggiesoft.com$WEB_URL"
        echo ""
        echo "LICENSE & COPYRIGHT:"
        echo "This work is licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)."
        echo "Full License Details: https://raggiesoftmedia.com/licensing"
        echo "Copyright (c) $REAL_RELEASE_YEAR Michael P. Ragsdale / RaggieSoft."
        echo ""
        echo "PRODUCTION DISCLAIMER:"
        echo "Audio Generation: Suno."
        echo "AI Elements: Vocals, Instrumentation, Composition."
        echo "Human Elements: Lyrics, Narrative Lore."
        echo "Commercial Rights Cleared via Commercial-Tier Suno Premium."
        echo ""
        echo "TRACKLIST:"
    } > "$README_FILE"

    
    TEMP_TRACKS_JSONL="temp_tracks_update.jsonl"
    > "$TEMP_TRACKS_JSONL"
    declare -a PIDS=()

    while read -r track_json; do
        source "$MODULE_DIR/04-track-processor.sh"
    done < <(jq -c '.tracks[]' "tracks.json")

    # Array length logic rewritten safely
    ARRAY_LENGTH=`echo ${#PIDS[@]}`
    if [ "$ARRAY_LENGTH" -gt 0 ]; then
        echo "      ⏳ HARPER: Waiting for background audio rendering pool to finalize..."
        for pid in "${PIDS[@]}"; do
            wait "$pid"
            EXIT_CODE=$?
            if [ $EXIT_CODE -ne 0 ]; then
                echo "🛑 HARPER FATAL ERROR: Audio processing crashed on PID $pid!"
                exit 1
            fi
        done
        echo "      ✅ HARPER: All multi-tier audio verified."
    fi

    if [ -s "$TEMP_TRACKS_JSONL" ]; then
         jq -s '{tracks: .}' "$TEMP_TRACKS_JSONL" > "tracks.json"
         echo "      💾 HARPER: tracks.json successfully updated with exact audio runtimes."
    fi
    rm -f "$TEMP_TRACKS_JSONL"

    if [ "$HAS_LYRICS" = true ]; then
        COMBINED_LYRICS_FILE="$SAFE_ALBUM_NAME.md"
        
        if [ ! -f "$COMBINED_LYRICS_FILE" ] || [ "$OVERWRITE" = true ]; then
            echo "      📝  HARPER: Binding the master lyric booklet ($COMBINED_LYRICS_FILE)..."
            echo "" > "$COMBINED_LYRICS_FILE"
            echo "" >> "$COMBINED_LYRICS_FILE"

            jq -c '.tracks[]' "tracks.json" | while read -r track_json_booklet; do
                FILE_BASE_BOOKLET=`echo "$track_json_booklet" | jq -r '.fileName'`
                LYRIC_MD_BOOKLET="lyrics/$FILE_BASE_BOOKLET.md"
                
                if [ -f "$LYRIC_MD_BOOKLET" ]; then
                    echo "***" >> "$COMBINED_LYRICS_FILE"
                    echo "### **$FILE_BASE_BOOKLET.md**" >> "$COMBINED_LYRICS_FILE"
                    echo "***" >> "$COMBINED_LYRICS_FILE"
                    echo "" >> "$COMBINED_LYRICS_FILE"
                    cat "$LYRIC_MD_BOOKLET" >> "$COMBINED_LYRICS_FILE"
                    echo "" >> "$COMBINED_LYRICS_FILE"
                    echo "" >> "$COMBINED_LYRICS_FILE"
                fi
            done
        else
            echo "      ⏭️  Master lyric booklet already bound! Fast-forwarding."
        fi
    fi

    source "$MODULE_DIR/05-archiver.sh"
    
    rm "$README_FILE"
    popd > /dev/null
done