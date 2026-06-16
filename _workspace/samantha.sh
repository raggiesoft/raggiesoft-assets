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
    # PROCESS NARRATIVE (3-Tier Routing & Katie JSON)
    # -----------------------------------------
    if [[ -f "$NARRATIVE_DOCX" ]]; then
        echo "   Found narrative score for '$BASE'. Parsing..."
        mkdir -p "$OUT_NARRATIVE_DIR"
        
        TMP_NARRATIVE="$OUT_NARRATIVE_DIR/${BASE}_tmp.md"
        
        if ! pandoc "$NARRATIVE_DOCX" -t gfm --wrap=none -o "$TMP_NARRATIVE"; then
            echo "   *Whistle blow!* Permission error on '$NARRATIVE_DOCX'. Is it open in Word?"
        else
            echo "   Slicing the manuscript and generating AI Book chunks..."
            
            TEMP_JSONL="$OUT_NARRATIVE_DIR/temp_index.jsonl"
            > "$TEMP_JSONL"

            awk -v base_dir="$OUT_NARRATIVE_DIR" -v json_log="$TEMP_JSONL" '
            
            # THE SANITIZER: Escapes quotes and backslashes for valid JSON
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
                current_book_file = "/dev/null"
            }

            # LEVEL 1: BOOK (Creates Folder, resets Chapter count, Compiles AI File)
            /^# / { 
                close(current_file)
                if (current_book_file != "/dev/null") close(current_book_file)
                
                book_title = substr($0, 3)
                safe_book = tolower(book_title)
                gsub(/[^a-z0-9]+/, "-", safe_book)
                sub(/^-+|-+$/, "", safe_book)
                
                book_count++
                chap_count = 0 
                
                # Create the standard web structure folder
                book_dir = sprintf("%s/%03d-%s", base_dir, book_count, safe_book)
                system("mkdir -p \"" book_dir "\"")
                
                # THE COMPILER: Setup the dedicated AI export file for the whole book
                ai_dir = base_dir "/_ai-export"
                system("mkdir -p \"" ai_dir "\"")
                current_book_file = sprintf("%s/%03d-%s.md", ai_dir, book_count, safe_book)
                
                print $0 > current_book_file
                next
            }

            # LEVEL 2: CHAPTER (Creates Sub-folder, resets Part count)
            /^## / {
                close(current_file)
                
                if (current_book_file != "/dev/null") print $0 >> current_book_file
                
                chap_title = substr($0, 4)
                safe_chap = tolower(chap_title)
                gsub(/[^a-z0-9]+/, "-", safe_chap)
                sub(/^-+|-+$/, "", safe_chap)
                
                chap_count++
                part_count = 0 
                
                chap_dir = sprintf("%s/%03d-%s", book_dir, chap_count, safe_chap)
                system("mkdir -p \"" chap_dir "\"")
                next
            }

            # LEVEL 3: PART (Creates File, Elevates to H1)
            /^### / {
                close(current_file)
                
                # Book compiler maintains original H3 structure
                if (current_book_file != "/dev/null") print $0 >> current_book_file
                
                part_title = substr($0, 5)
                safe_part = tolower(part_title)
                gsub(/[^a-z0-9]+/, "-", safe_part)
                sub(/^-+|-+$/, "", safe_part)
                
                part_count++
                
                filename = sprintf("%03d-%s.md", part_count, safe_part)
                current_file = sprintf("%s/%s", chap_dir, filename)
                
                # THE OVERRIDE: Write the Part heading as an H1 inside the sliced file
                print "# " part_title > current_file
                
                # THE ROUTING FIX: Strip the physical server path for the JSON manifest
                web_file_path = current_file
                sub(/^\.\.\/raggiesoft-books\/books/, "", web_file_path)
                
                # Log the sanitized structural data to the JSONL manifest
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
            
            # LEVEL 4: SUB-SCENE (Elevates to H2 inside Part file, remains H4 in full Book file)
            /^#### / {
                if (current_book_file != "/dev/null") {
                    print $0 >> current_book_file
                }
                
                if (current_file != "/dev/null") {
                    part_line = $0
                    sub(/^#### /, "## ", part_line)
                    print part_line >> current_file
                }
                next
            }

            # STANDARD TEXT (Body paragraphs)
            {
                if (current_book_file != "/dev/null") {
                    print $0 >> current_book_file
                }
                if (current_file != "/dev/null") {
                    print $0 >> current_file
                }
            }
            ' "$TMP_NARRATIVE"

            echo "   Subdivisions complete. Passing the baton to Katie..."

            # Use jq to group the flat JSONL log into the nested JSON tree
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
            rm -f "$TMP_NARRATIVE"

            echo "   Katie's manifest locked. The vault is ready for deployment."
        fi
    fi
done

echo "👱‍♀️ Samantha: Full ensemble run-through complete. The new repository perimeter is secure!"