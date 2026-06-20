#!/bin/bash

echo "👱‍♀️ Samantha: Taking the podium. Native Modular Routing initialized!"

if [[ ! -d "books" ]]; then
    echo "   *Whistle blow!* I can't find the 'books' directory."
    exit 1
fi

for DIR in books/*/; do
    BASE=$(basename "$DIR")
    
    # LOCAL SOURCES
    LORE_MD="books/$BASE/$BASE-lore.md"
    MANUSCRIPT_DIR="books/$BASE/manuscript"
    
    # PUBLIC DEPLOYMENT FOLDERS
    OUT_LORE_DIR="../raggiesoft-books/books/$BASE/$BASE-lore"
    OUT_NARRATIVE_DIR="../raggiesoft-books/books/$BASE/$BASE-narrative"

    # -----------------------------------------
    # PROCESS LORE
    # -----------------------------------------
    if [[ -f "$LORE_MD" ]]; then
        mkdir -p "$OUT_LORE_DIR"
        FINAL_WEB_LORE="$OUT_LORE_DIR/${BASE}-lore.md"
        
        if [[ -f "$FINAL_WEB_LORE" ]] && cmp -s "$LORE_MD" "$FINAL_WEB_LORE"; then
            echo "   🛡️ [SKIP] No tempo changes in '$BASE' lore."
        else
            cp "$LORE_MD" "$FINAL_WEB_LORE"
            echo "   Flawless execution. Updated web lore file for '$BASE'."
        fi
    fi

    # -----------------------------------------
    # PROCESS NARRATIVE (The Stitch & Slice)
    # -----------------------------------------
    if [[ -d "$MANUSCRIPT_DIR" ]]; then
        # Gather all chunked files in strict alphabetical/numeric order
        SOURCE_FILES=$(find "$MANUSCRIPT_DIR" -maxdepth 1 -name "[0-9][0-9][0-9]-*.md" | sort)
        
        if [[ -n "$SOURCE_FILES" ]]; then
            MANIFEST="$OUT_NARRATIVE_DIR/katie.json"
            NEEDS_UPDATE=false
            
            # THE EFFICIENCY SHIELD
            if [[ ! -f "$MANIFEST" ]]; then
                NEEDS_UPDATE=true
            else
                NEWER_FILES=$(find "$MANUSCRIPT_DIR" -maxdepth 1 -name "*.md" -newer "$MANIFEST" 2>/dev/null)
                if [[ -n "$NEWER_FILES" ]]; then
                    NEEDS_UPDATE=true
                fi
            fi

            if [[ "$NEEDS_UPDATE" == false ]]; then
                echo "   🛡️ [SKIP] Modular files in '$BASE/manuscript' are unchanged."
            else
                echo "   Found updated manuscript chunks for '$BASE'. Stitching and Slicing..."
                
                mkdir -p "$OUT_NARRATIVE_DIR"
                find "$OUT_NARRATIVE_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
                
                TEMP_JSONL="$OUT_NARRATIVE_DIR/temp_index.jsonl"
                > "$TEMP_JSONL"

                # Use cat to stream all files seamlessly into AWK
                cat $SOURCE_FILES | LC_ALL=C awk -v base_dir="$OUT_NARRATIVE_DIR" -v json_log="$TEMP_JSONL" '
                
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

                /^# / { 
                    close(current_file)
                    
                    book_title = substr($0, 3)
                    book_count++
                    chap_count = 0 
                    
                    book_dir = sprintf("%s/b%03d", base_dir, book_count)
                    system("mkdir -p \"" book_dir "\"")
                    next
                }

                /^## / {
                    close(current_file)
                    
                    chap_title = substr($0, 4)
                    chap_count++
                    part_count = 0 
                    
                    chap_dir = sprintf("%s/c%03d", book_dir, chap_count)
                    system("mkdir -p \"" chap_dir "\"")
                    next
                }

                /^### / {
                    close(current_file)
                    
                    part_title = substr($0, 5)
                    part_count++
                    
                    filename = sprintf("p%03d.md", part_count)
                    current_file = sprintf("%s/%s", chap_dir, filename)
                    
                    print "# " part_title > current_file
                    
                    web_file_path = current_file
                    sub(/^\.\.\/raggiesoft-books\/books/, "", web_file_path)
                    
                    json_entry = sprintf("{\"book_num\": %d, \"book_title\": \"%s\", \"chap_num\": %d, \"chap_title\": \"%s\", \"part_num\": %d, \"part_title\": \"%s\", \"file_path\": \"%s\"}", 
                        book_count, escape_json(book_title), 
                        chap_count, escape_json(chap_title), 
                        part_count, escape_json(part_title), 
                        escape_json(web_file_path))
                        
                    print json_entry >> json_log
                    next
                }
                
                /^#### / {
                    if (current_file != "/dev/null") {
                        part_line = $0
                        sub(/^#### /, "## ", part_line)
                        print part_line >> current_file
                    }
                    next
                }

                {
                    if (current_file != "/dev/null") print $0 >> current_file
                }
                ' 

                echo "   Subdivisions complete. Passing the baton to Katie..."

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

                echo "   Katie's manifest locked for '$BASE'."
            fi
        fi
    fi
done

echo "👱‍♀️ Samantha: Run-through complete. The repository is pristine!"