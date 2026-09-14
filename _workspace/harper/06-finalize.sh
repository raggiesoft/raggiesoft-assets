#!/usr/bin/env bash
# --- HARPER MODULE 06: FINALIZE ---

echo "   📝 HARPER: Applying AI Production Disclaimers to Master Catalogs..."
find "$SEARCH_PATH" -name "*-discography-and-lyrics.md" | while read -r master_file; do
    if ! grep -q "### Production Disclaimer" "$master_file"; then
        echo "---" >> "$master_file"
        echo "### Production Disclaimer" >> "$master_file"
        echo "All lyrics and lore are human-authored. Audio composition, instrumentation, and vocals were generated via AI platforms." >> "$master_file"
        echo "" >> "$master_file"
    fi
done

rm -f "$TEMP_SORTED_ALBUMS"
find "$SEARCH_PATH" -name "*-discography-and-lyrics.md" -exec sed -i.bak '//d' {} + 2>/dev/null
find "$SEARCH_PATH" -name "*.bak" -type f -delete 2>/dev/null

echo "🎧 HARPER: Finalizing the Search Index..."
if [ -s "$TEMP_SEARCH_INDEX" ]; then
    jq -s '.' "$TEMP_SEARCH_INDEX" > "$METADATA_FILE"
    rm "$TEMP_SEARCH_INDEX"
    echo "   ✅ HARPER: Index saved to $METADATA_FILE"
else
    echo "   ⚠️  HARPER: Search index was empty. Skipping metadata generation."
    rm -f "$TEMP_SEARCH_INDEX"
fi

CATALOG_DIR="../engine-room-records/json"
mkdir -p "$CATALOG_DIR"
CATALOG_FILE="$CATALOG_DIR/master-catalog.json"

echo "🎧 HARPER: Compiling the Master ISRC/ERR Catalog..."
if [ -s "$TEMP_CATALOG_INDEX" ]; then
    jq -s '.' "$TEMP_CATALOG_INDEX" > "$CATALOG_FILE"
    rm "$TEMP_CATALOG_INDEX"
    echo "   ✅ HARPER: Catalog saved to $CATALOG_FILE"
else
    echo "   ⚠️  HARPER: Catalog index was empty. Skipping generation."
    rm -f "$TEMP_CATALOG_INDEX"
fi

END_EPOCH=$(date +%s)
END_TIME_STR=$(date +"%Y-%m-%d %I:%M:%S %p")
DURATION_SEC=$((END_EPOCH - START_EPOCH))

DURATION_HOURS=$((DURATION_SEC / 3600))
DURATION_MIN=$(((DURATION_SEC % 3600) / 60))
DURATION_REM_SEC=$((DURATION_SEC % 60))

if [ "$METADATA_ONLY" = true ]; then
    echo "🎧 HARPER: Session complete! Metadata repacked and ready for the distro network."
else
    echo "🎧 HARPER: Session complete! The radio edits are public, and the master tapes are locked in the vault."
fi

echo "   ⏰ Session Ended: $END_TIME_STR"
if [ "$DURATION_HOURS" -gt 0 ]; then
    echo "   ⏱️  Total Processing Time: "$DURATION_HOURS"h "$DURATION_MIN"m "$DURATION_REM_SEC"s"
else
    echo "   ⏱️  Total Processing Time: "$DURATION_MIN"m "$DURATION_REM_SEC"s"
fi