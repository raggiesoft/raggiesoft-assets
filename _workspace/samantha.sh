#!/bin/bash

echo "Samantha: Taking the podium. We've got a new venue in the GitHub repository. Full ensemble run-through!"

# Ensure the input directory exists
if [[ ! -d "books" ]]; then
    echo "Samantha: *Whistle blow!* I can't find the 'books' directory. Are we on the wrong practice field?"
    exit 1
fi

# Loop through every directory inside the 'books' staging area
for DIR in books/*/; do
    # Extract the base name (e.g., 'rachel' from 'books/rachel/')
    BASE=$(basename "$DIR")
    
    # Define the exact input file paths
    NARRATIVE_DOCX="books/$BASE/$BASE.docx"
    LORE_DOCX="books/$BASE/$BASE-lore.docx"
    
    # Define the new output directory paths
    OUT_LORE_DIR="../raggiesoft-books/books/$BASE/$BASE-lore"
    OUT_NARRATIVE_DIR="../raggiesoft-books/books/$BASE/$BASE-narrative"

    # -----------------------------------------
    # PROCESS LORE (Single File Mode)
    # -----------------------------------------
    if [[ -f "$LORE_DOCX" ]]; then
        echo "Samantha: Found lore sheet for '$BASE'. Parsing..."
        
        # Ensure the target lore directory exists
        mkdir -p "$OUT_LORE_DIR"
        
        TMP_LORE="$OUT_LORE_DIR/${BASE}-lore_tmp.md"
        FINAL_LORE="$OUT_LORE_DIR/${BASE}-lore.md"
        
        # Pandoc conversion with strict error checking
        if ! pandoc "$LORE_DOCX" -t gfm --wrap=none -o "$TMP_LORE"; then
            echo "Samantha: *Whistle blow!* Permission error on '$LORE_DOCX'. Is it open in Word?"
        else
            # Compare and update
            if [[ -f "$FINAL_LORE" ]] && cmp -s "$TMP_LORE" "$FINAL_LORE"; then
                echo "Samantha: No tempo changes in '$BASE' lore. Skipping."
                rm "$TMP_LORE"
            else
                mv "$TMP_LORE" "$FINAL_LORE"
                echo "Samantha: Flawless execution. Updated lore file: $FINAL_LORE"
            fi
        fi
    fi

    # -----------------------------------------
    # PROCESS NARRATIVE (Split Chapter Mode)
    # -----------------------------------------
    if [[ -f "$NARRATIVE_DOCX" ]]; then
        echo "Samantha: Found narrative score for '$BASE'. Parsing..."
        
        # Ensure the target narrative directory exists
        mkdir -p "$OUT_NARRATIVE_DIR"
        
        TMP_NARRATIVE="$OUT_NARRATIVE_DIR/${BASE}_tmp.md"
        TMP_DIR="$OUT_NARRATIVE_DIR/tmp_split_${BASE}"
        mkdir -p "$TMP_DIR"
        
        # Pandoc conversion with strict error checking
        if ! pandoc "$NARRATIVE_DOCX" -t gfm --wrap=none -o "$TMP_NARRATIVE"; then
            echo "Samantha: *Whistle blow!* Permission error on '$NARRATIVE_DOCX'. Is it open in Word?"
            rm -rf "$TMP_DIR" # Cleanup empty tmp dir
        else
            echo "Samantha: Subdividing the beats for '$BASE' into: $OUT_NARRATIVE_DIR/"
            
            # Slice the temporary full document and format the filenames
            awk -v outdir="$TMP_DIR" '
            BEGIN { 
                c = 0
                file = outdir "/000-preface.md" 
            }
            /^# / { 
                close(file)
                
                # Extract and sanitize heading text
                heading = substr($0, 3)
                heading = tolower(heading)
                gsub(/[^a-z0-9]+/, "-", heading)
                sub(/^-+/, "", heading)
                sub(/-+$/, "", heading)
                
                c++
                file = sprintf("%s/%03d-%s.md", outdir, c, heading)
            }
            { print > file }
            ' "$TMP_NARRATIVE"

            # Compare new chunks against existing files in the output directory
            for new_file in "$TMP_DIR"/*.md; do
                [[ -e "$new_file" ]] || break 
                
                filename=$(basename "$new_file")
                target_file="$OUT_NARRATIVE_DIR/$filename"
                prefix=$(echo "$filename" | grep -o '^[0-9]\{3\}')
                
                # Clean up renamed/obsolete chapters in the output dir
                for old_file in "$OUT_NARRATIVE_DIR"/${prefix}-*.md; do
                    if [[ -f "$old_file" && "$old_file" != "$target_file" ]]; then
                        rm "$old_file"
                        echo "Samantha: Removed obsolete measure: $(basename "$old_file")"
                    fi
                done
                
                # Update or skip
                if [[ -f "$target_file" ]] && cmp -s "$new_file" "$target_file"; then
                    continue
                else
                    mv "$new_file" "$target_file"
                    echo "Samantha: Re-wrote sheet music: $target_file"
                fi
            done
            
            # Cleanup temporary files
            rm -rf "$TMP_DIR"
            rm "$TMP_NARRATIVE"
        fi
    fi
done

echo "Samantha: Full ensemble run-through complete. The new repository perimeter is secure!"