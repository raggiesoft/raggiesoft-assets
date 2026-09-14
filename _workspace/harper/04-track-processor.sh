#!/usr/bin/env bash
# --- HARPER MODULE 04: TRACK PROCESSOR ---

FILE_BASE=`echo "$track_json" | jq -r '.fileName'`
TITLE=`echo "$track_json" | jq -r '.title'`
DISC_NUM=`echo "$track_json" | jq -r '.disc // 1'`
TRACK_NUM=`echo "$track_json" | jq -r '.track'`
SUITE_NAME=`echo "$track_json" | jq -r '.suiteName // empty'`
SUITE_TRACK=`echo "$track_json" | jq -r '.suiteTrack // empty'`

if [ -n "$SUITE_NAME" ]; then
    if [ "$SUITE_TRACK" == "1" ]; then
        echo "" >> "$README_FILE"
        echo "  --- $SUITE_NAME ---" >> "$README_FILE"
    fi
    echo "  $TRACK_NUM.$TITLE" >> "$README_FILE"
else
    echo "  $TRACK_NUM.$TITLE" >> "$README_FILE"
fi

echo "      🎙️  HARPER: Checking Track $TRACK_NUM - '$TITLE'..."
echo "## $TITLE" >> "$MASTER_DISCO_FILE"

LYRIC_MD_PATH="lyrics/$FILE_BASE.md"

if [ -f "$LYRIC_MD_PATH" ]; then
    sed -e 's/\*\*LORE NOTE:\*\*/### Lore/' \
        -e 's/\*\*LYRICS:\*\*/### Lyrics/' \
        "$LYRIC_MD_PATH" >> "$MASTER_DISCO_FILE"
    echo "" >> "$MASTER_DISCO_FILE"
else
    echo "*(Instrumental / Structure-Only Track)*" >> "$MASTER_DISCO_FILE"
    echo "" >> "$MASTER_DISCO_FILE"
fi

MASTER_WAV_PATH=`echo "$track_json" | jq -r '.masterWavPath // empty'`
ISRC_CODE=`echo "$track_json" | jq -r '.isrc // empty'`
DSP_STATUS_OVERRIDE=`echo "$track_json" | jq -r '.dspStatus // empty'`

case "$ALBUM_ARTIST" in
    "The Stardust Engine") ROSTER_PREFIX="ERR-001" ;;
    "Fractured Prisms") ROSTER_PREFIX="ERR-002" ;;
    "The Paper Wall"|"Mirage") ROSTER_PREFIX="ERR-003" ;;
    "Firelight") ROSTER_PREFIX="ERR-004" ;;
    "The Winter Palace") ROSTER_PREFIX="ERR-005" ;;
    *) ROSTER_PREFIX="ERR-999" ;;
esac

FORMATTED_TRACK=`printf "%d%02d" "$DISC_NUM" "$TRACK_NUM"`
ERR_ID="$ROSTER_PREFIX-$NARRATIVE_YEAR-$FORMATTED_TRACK"

if [ "$ALBUM_DISTRO" == "Internal Vault" ] || [ "$DSP_STATUS_OVERRIDE" == "vault" ]; then
    RELEASE_STATUS="Vault Exclusive"
elif [ -n "$ISRC_CODE" ] && [ "$ISRC_CODE" != "null" ]; then
    RELEASE_STATUS="Released"
else
    RELEASE_STATUS="Pending DSP"
fi

jq -n -c \
    --arg err_id "$ERR_ID" \
    --arg isrc "$ISRC_CODE" \
    --arg upc "$ALBUM_UPC" \
    --arg title "$TITLE" \
    --arg artist "$ALBUM_ARTIST" \
    --arg slug "$ARTIST_SLUG" \
    --arg album "$ALBUM_NAME" \
    --arg album_type "$ALBUM_TYPE" \
    --arg album_slug "$ALBUM_SLUG" \
    --arg track_slug "$FILE_BASE" \
    --arg r_date "$REAL_RELEASE_DATE" \
    --arg status "$RELEASE_STATUS" \
    --arg owner "Michael P. Ragsdale / RaggieSoft" \
    --arg distro "$ALBUM_DISTRO" \
    --arg ai "$ALBUM_CLEARANCE" \
    --arg vocals "Synthetic / Non-Cloned" \
    '{
        err_id: $err_id, 
        isrc: $isrc, 
        albumUPC: $upc,
        trackTitle: $title, 
        albumTitle: $album, 
        albumProductionType: $album_type,
        artistPersona: $artist,
        artistSlug: $slug,
        albumSlug: $album_slug,
        trackSlug: $track_slug,
        legalOwner: $owner, 
        distributor: $distro, 
        aiClearance: $ai, 
        vocalType: $vocals, 
        realReleaseDate: $r_date, 
        status: $status
    }' >> "$ROOT_DIR/$TEMP_CATALOG_INDEX"

MASTER_DIR="../master-wav" 
SOURCE_WAV="$MASTER_DIR/$MASTER_WAV_PATH.wav"
LOCAL_WAV="vault/wav/$FILE_BASE.wav"
RUNTIME=""

if [ ! -f "$SOURCE_WAV" ]; then 
    echo "         ⚠️  WHOA! Master tape missing from central vault: $SOURCE_WAV"
else
    RUNTIME=`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$SOURCE_WAV" | awk '{printf "%d:%02d\n", $1/60, $1%60}'`
    echo "      ⏱️  HARPER: Track runtime clocked at $RUNTIME"

    if [ "$METADATA_ONLY" = false ]; then
        if [ ! -f "$LOCAL_WAV" ] || [ "$OVERWRITE" = true ]; then
            echo "         -> 💾 Pulling $MASTER_WAV_PATH from the vault to$LOCAL_WAV..."
            mkdir -p vault/wav
            cp "$SOURCE_WAV" "$LOCAL_WAV"
        fi
    fi
fi

if [ -n "$RUNTIME" ]; then
    echo "$track_json" | jq -c --arg rt "$RUNTIME" '. + {duration: $rt}' >> "$TEMP_TRACKS_JSONL"
else
    echo "$track_json" >> "$TEMP_TRACKS_JSONL"
fi

WAV_FILE="$LOCAL_WAV"
LYRICS_CONTENT=""
if [ -f "lyrics/$FILE_BASE.md" ]; then LYRICS_CONTENT=`cat "lyrics/$FILE_BASE.md"`; fi

jq -n -c \
    --arg id "$FILE_BASE" \
    --arg title "$TITLE" \
    --arg artist "$ALBUM_ARTIST" \
    --arg album "$ALBUM_NAME" \
    --arg url "$WEB_URL" \
    --arg type "track" \
    --arg content "$LYRICS_CONTENT" \
    '{id: $id, title:$title, artist: $artist, album:$album, url: $url, type:$type, content: $content}' >> "$ROOT_DIR/$TEMP_SEARCH_INDEX"

METADATA_MD="streaming-services/song-metadata/$FILE_BASE.md"

if [ -z "$ALBUM_UPC" ]; then
    UPC_PRINT="None"
else
    UPC_PRINT="$ALBUM_UPC"
fi

if [ ! -f "$METADATA_MD" ] || [ "$OVERWRITE" = true ]; then
    echo "         -> 📋 Drafting DistroKid-Optimized Metadata sheet..."
    cat < "$METADATA_MD"
# $TITLE - DistroKid Quick-Copy Sheet

## 1. DistroKid Upload Form Data
* **Track Title:** $TITLE
* **Primary Artist:** $ALBUM_ARTIST
* **Genre:** $GENRE
* **Real-World DSP Release Date:** $REAL_RELEASE_DATE

**DistroKid AI Credits Questionnaire:**
* **Did AI generate any part of this track?** Yes
* **Which parts?**
  * [ ] **The lyrics** *(Leave blank - Human authored)*
  * [x] **The music** *(AI composed the melody/arrangement)*
  * [x] **All of the audio** *(Everything the listener hears is AI-generated)*
* **Artist Identity:** AI Persona

## 2. DistroKid Credits Dashboard (distrokid.com/credits)
*DistroKid requires a real human name for all songwriter credits.*
* **Songwriter (Required):** Michael P. Ragsdale
* **Songwriter Role:** Lyricist
* **Musician / Producer:** AI-Generated (Vocals & Instrumentation)

## 3. Internal Catalog Information
* **Engine Room ID:** $ERR_ID
* **ISRC:** $ISRC_CODE
* **Album UPC / GTIN-12:** $UPC_PRINT
* **Track Length:** $RUNTIME
* **Fictional Narrative Release Date:** $NARRATIVE_DATE
* **Master File Located At:** ../../vault/wav/$FILE_BASE.wav

## 4. Rights & Clearances
* **Commercial Rights:** 100% cleared via commercial-tier Suno Premium.
* **Copyright:** CC BY-SA 4.0 - Michael P. Ragsdale / RaggieSoft.
* **Impersonation:** NONE. Synthetic vocals only.
EOF
else
    echo "         ⏭️  DSP Metadata sheet already exists! Fast-forwarding."
fi

LYRIC_MD="lyrics/$FILE_BASE.md"
LYRIC_TXT="streaming-services/lyrics/$FILE_BASE.txt"

if [ -f "$LYRIC_MD" ]; then
    if [ ! -f "$LYRIC_TXT" ] || [ "$OVERWRITE" = true ]; then
        echo "         -> 📝 Scrubbing Lyrics for DSP delivery..."
        REGEX_STRUCT="([Vv]erse|[Cc]horus|[Bb]ridge|[Ii]ntro|[Oo]utro|[Hh]ook|[Pp]re-?[Cc]horus|[Ii]nterlude|[Ss]olo)([[:space:]]*[0-9]+)?(:)?"
        sed '1,/\*\*LYRICS:\*\*/d' "$LYRIC_MD" | \
        sed -E '/^[[:space:]]*[[](.*)[]][[:space:]]*$/d' | \
        sed -E "/^[[:space:]]*$REGEX_STRUCT[[:space:]]*$/d" | \
        sed -E 's/[.,?!;:]+[[:space:]]*$//' | \
        cat -s | sed '/^[[:space:]]*$/{N;/^\n$/D;}' > "$LYRIC_TXT"
    else
        echo "         ⏭️  DSP Lyrics already clean! Fast-forwarding."
    fi
fi

if [ "$METADATA_ONLY" = false ]; then
    if [ -f "$WAV_FILE" ]; then
        echo "         -> 🎚️ Pressing Multi-Tier Audio (Parallelized)..."
        press_audio_formats "$WAV_FILE" "$FILE_BASE" "$TITLE" "$ALBUM_ARTIST" "$ALBUM_NAME" "$REAL_RELEASE_YEAR" "$TRACK_NUM" "$DISC_NUM" "$GENRE" &
        PIDS+=($!)
        
        CURRENT_JOBS=`jobs -p | wc -l`
        while [ "$CURRENT_JOBS" -ge "$MAX_JOBS" ]; do
            wait -n
            CURRENT_JOBS=`jobs -p | wc -l`
        done
    else
        echo "         ⏭️  Audio source missing. Skipping FFmpeg encoding for $TITLE."
    fi
else
    echo "         ⏭️  Metadata-Only mode active. Skipping audio encoding."
fi