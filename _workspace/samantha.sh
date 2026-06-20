#!/bin/bash

echo "👱‍♀️ Samantha: Taking the podium. We've got a new venue in the GitHub repository. Full ensemble run-through!"

# Ensure the input directory exists
if [[ ! -d "books" ]]; then
    echo "   *Whistle blow!* I can't find the 'books' directory. Are we on the wrong practice field?"
    exit 1
fi

# Loop through every directory inside the 'books' staging area
for DIR in books/*/; do
    BASE=$(basename "$DIR")
    
    NARRATIVE_DOCX="books/$BASE/$BASE.docx"
    LORE_DOCX="books/$BASE/$BASE-lore.docx"
    
    OUT_LORE_DIR="../raggiesoft-books/books/$BASE/$BASE-lore"
    OUT_NARRATIVE_DIR="../raggiesoft-books/books/$BASE/$BASE-narrative"

    # -----------------------------------------
    # PROCESS LORE (Single File Mode)
    # -----------------------------------------
    if [[ -f "$LORE_DOCX" ]]; then
        echo "   Found lore sheet for '$BASE'. Parsing..."
        mkdir -p "$OUT_LORE_DIR"
        
        TMP_LORE="$OUT_LORE_DIR/${BASE}-lore_tmp.md"
        FINAL_LORE="$OUT_LORE_DIR/${BASE}-lore.md"
        
        if ! pandoc "$LORE_DOCX" -t gfm --wrap=none -o "$TMP_LORE"; then
            echo "   *Whistle blow!* Permission error on '$LORE_DOCX'. Is it open in Word?"
        else
            if [[ -f "$FINAL_LORE" ]] && cmp -s "$TMP_LORE" "$FINAL_LORE"; then
                echo "   No tempo changes in '$BASE' lore. Skipping."
                rm "$TMP_LORE"
            else
                mv "$TMP_LORE" "$FINAL_LORE"
                echo "   Flawless execution. Updated lore file: $FINAL_LORE"
            fi
        fi
    fi

    # -----------------------------------------
    # PROCESS NARRATIVE (Index-Only Routing & Master MD)
    # -----------------------------------------
    if [[ -f "$NARRATIVE_DOCX" ]]; then
        echo "   Found narrative score for '$BASE'. Parsing..."
        mkdir -p "$OUT_NARRATIVE_DIR"
        
        # The user's requested master Markdown file
        MASTER_MD="$OUT_NARRATIVE_DIR/${BASE}.md"
        
        if ! pandoc "$NARRATIVE_DOCX" -t gfm --wrap=none -o "$MASTER_MD"; then
            echo "   *Whistle blow!* Permission error on '$NARRATIVE_DOCX'. Is it open in Word?"
        else
            echo "   Sweeping the stage. Removing old routing artifacts..."
            
            # Safely clear out the previous generated b000 folders and manifests, 
            # keeping our new master Markdown file intact.
            find "$OUT_NARRATIVE_DIR" -mindepth 1 -maxdepth 1 ! -name "${BASE}.md" -exec rm -rf {} +
            
            echo "   Slicing the manuscript into index-only chunks..."
            
            TEMP_JSONL="$OUT_NARRATIVE_DIR/temp_index.jsonl"
            > "$TEMP_JSONL"

            LC_ALL=C awk -v base_dir="$OUT_NARRATIVE_DIR" -v json_log="$TEMP_JSONL" '
            
            function escape_json(str) {
                gsub(/\\/, "\\\\", str)
                gsub(/"/, "\\\"", str)
                gsub(/\r/, "", str)
                gsub(/\t/, " ", str)
                return str
            }

            BEGIN { 
                book_count = 0
                chap_count = 0
                part_count = 0
                current_file = "/dev/null" 
            }

            # LEVEL 1: BOOK (Creates b000 Folder)
            /^# / { 
                close(current_file)
                
                book_title = substr($0, 3)
                book_count++
                chap_count = 0 
                
                # Index-Only Book Directory
                book_dir = sprintf("%s/b%03d", base_dir, book_count)
                system("mkdir -p \"" book_dir "\"")
                next
            }

            # LEVEL 2: CHAPTER (Creates c000 Sub-folder)
            /^## / {
                close(current_file)
                
                chap_title = substr($0, 4)
                chap_count++
                part_count = 0 
                
                # Index-Only Chapter Directory
                chap_dir = sprintf("%s/c%03d", book_dir, chap_count)
                system("mkdir -p \"" chap_dir "\"")
                next
            }

            # LEVEL 3: PART (Creates p000.md File)
            /^### / {
                close(current_file)
                
                part_title = substr($0, 5)
                part_count++
                
                # Index-Only Part File
                filename = sprintf("p%03d.md", part_count)
                current_file = sprintf("%s/%s", chap_dir, filename)
                
                # Write the Part heading as an H1 inside the sliced file
                print "# " part_title > current_file
                
                # Strip the physical server path for the JSON manifest
                web_file_path = current_file
                sub(/^\.\.\/raggiesoft-books\/books/, "", web_file_path)
                
                json_entry = sprintf("{\"book_num\": %d, \"book_title\": \"%s\", \"chap_num\": %d, \"chap_title\": \"%s\", \"part_num\": %d, \"part_title\": \"%s\", \"file_path\": \"%s\"}", 
                    book_count, 
                    escape_json(book_title), 
                    chap_count, 
                    escape_json(chap_title), 
                    part_count, 
                    escape_json(part_title), 
                    escape_json(web_file_path))
                    
                print json_entry >> json_log
                next
            }
            
            # LEVEL 4: SUB-SCENE (Elevates to H2 inside Part file)
            /^#### / {
                if (current_file != "/dev/null") {
                    part_line = $0
                    sub(/^#### /, "## ", part_line)
                    print part_line >> current_file
                }
                next
            }

            # STANDARD TEXT (Body paragraphs)
            {
                if (current_file != "/dev/null") {
                    print $0 >> current_file
                }
            }
            ' "$MASTER_MD"

            echo "   Subdivisions complete. Passing the baton to Katie..."

            # Group the flat JSONL log into the nested JSON tree
            jq -s '
              group_by(.book_num) | map({
                book_num: .[0].book_num,
                book_title: .[0].book_title,
                chapters: (
                  group_by(.chap_num) | map({
                    chap_num: .[0].chap_num,
                    chap_title: .[0].chap_title,
                    parts: map({
                      part_num: .part_num,
                      part_title: .part_title,
                      file_path: .file_path
                    })
                  })
                )
              })
            ' "$TEMP_JSONL" > "$OUT_NARRATIVE_DIR/katie.json"

            rm -f "$TEMP_JSONL"

            echo "   Katie's manifest locked. The vault is ready for deployment."
        fi
    fi
done

echo "👱‍♀️ Samantha: Full ensemble run-through complete. The new repository perimeter is secure!"