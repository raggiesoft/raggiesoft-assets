#!/bin/bash

echo "👱‍♀️ Samantha: Taking the podium. Legacy DOCX Shatter Protocol initialized!"

if [[ ! -d "books" ]]; then
    echo "   *Whistle blow!* I can't find the 'books' directory. Are we on the wrong practice field?"
    exit 1
fi

for DIR in books/*/; do
    BASE=$(basename "$DIR")
    
    # LOCAL SOURCES
    NARRATIVE_DOCX="books/$BASE/$BASE.docx"
    LORE_DOCX="books/$BASE/$BASE-lore.docx"
    LOCAL_LORE_MD="books/$BASE/$BASE-lore.md"
    MANUSCRIPT_DIR="books/$BASE/manuscript"
    
    # PUBLIC DEPLOYMENT FOLDERS
    OUT_LORE_DIR="../raggiesoft-books/books/$BASE/$BASE-lore"
    OUT_NARRATIVE_DIR="../raggiesoft-books/books/$BASE/$BASE-narrative"
    FINAL_WEB_LORE="$OUT_LORE_DIR/${BASE}-lore.md"

    # -----------------------------------------
    # PROCESS LORE
    # -----------------------------------------
    if [[ -f "$LORE_DOCX" ]]; then
        if [[ -f "$LOCAL_LORE_MD" ]] && [[ "$LOCAL_LORE_MD" -nt "$LORE_DOCX" ]]; then
            echo "   🛡️ [PROTECT] Local '$LOCAL_LORE_MD' is newer than DOCX. Skipping Pandoc."
        else
            echo "   Found legacy DOCX lore sheet for '$BASE'. Extracting..."
            pandoc "$LORE_DOCX" -t gfm --wrap=none -o "$LOCAL_LORE_MD" 2>/dev/null
        fi
        
        if [[ -f "$LOCAL_LORE_MD" ]]; then
            mkdir -p "$OUT_LORE_DIR"
            if [[ -f "$FINAL_WEB_LORE" ]] && cmp -s "$LOCAL_LORE_MD" "$FINAL_WEB_LORE"; then
                echo "   No tempo changes in lore sync. Skipping."
            else
                cp "$LOCAL_LORE_MD" "$FINAL_WEB_LORE"
                echo "   Updated web lore file: $FINAL_WEB_LORE"
            fi
        fi
    fi

    # -----------------------------------------
    # PROCESS NARRATIVE (The Shatter)
    # -----------------------------------------
    if [[ -f "$NARRATIVE_DOCX" ]]; then
        # SHIELD CHECK: Are there already Markdown chunks in the manuscript folder?
        if [[ -d "$MANUSCRIPT_DIR" ]] && [[ $(find "$MANUSCRIPT_DIR" -maxdepth 1 -name "[0-9][0-9][0-9]-*.md" | wc -l) -gt 0 ]]; then
            echo "   🛡️ [PROTECT] Native Markdown chunks found in '$MANUSCRIPT_DIR'. Skipping DOCX shatter."
        else
            echo "   Found legacy DOCX narrative score for '$BASE'. Shattering into manuscript chunks..."
            
            TMP_MD="books/$BASE/${BASE}_tmp.md"
            if ! pandoc "$NARRATIVE_DOCX" -t gfm --wrap=none -o "$TMP_MD"; then
                echo "   *Whistle blow!* Permission error on '$NARRATIVE_DOCX'."
                continue
            fi
            
            mkdir -p "$MANUSCRIPT_DIR"
            mkdir -p "$OUT_NARRATIVE_DIR"
            
            # Clear old web artifacts
            find "$OUT_NARRATIVE_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
            
            TEMP_JSONL="$OUT_NARRATIVE_DIR/temp_index.jsonl"
            > "$TEMP_JSONL"

            LC_ALL=C awk -v base_dir="$OUT_NARRATIVE_DIR" -v manu_dir="$MANUSCRIPT_DIR" -v json_log="$TEMP_JSONL" '
            
            function escape_json(str) {
                gsub(/\\/, "\\\\", str)
                gsub(/"/, "\\\"", str)
                gsub(/\r/, "", str)
                gsub(/\t/, " ", str)
                return str
            }
            
            function make_slug(title) {
                slug = tolower(title)
                gsub(/[^a-z0-9 -]/, "", slug)
                gsub(/[ -]+/, "-", slug)
                sub(/^-+|-+$/, "", slug)
                if (length(slug) > 35) {
                    slug = substr(slug, 1, 35)
                    sub(/-[^-]*$/, "", slug)
                }
                return slug
            }

            BEGIN { 
                book_count = 0
                chap_count = 0
                part_count = 0
                current_file = "/dev/null"
                current_manu_file = "/dev/null"
            }

            /^# / { 
                close(current_file)
                if (current_manu_file != "/dev/null") close(current_manu_file)
                
                book_title = substr($0, 3)
                safe_book = make_slug(book_title)
                book_count++
                chap_count = 0 
                
                # 1. Web Routing
                book_dir = sprintf("%s/b%03d", base_dir, book_count)
                system("mkdir -p \"" book_dir "\"")
                
                # 2. Permanent Authoring Chunk
                current_manu_file = sprintf("%s/%03d-%s.md", manu_dir, book_count, safe_book)
                print $0 > current_manu_file
                
                next
            }

            /^## / {
                close(current_file)
                if (current_manu_file != "/dev/null") print $0 >> current_manu_file
                
                chap_title = substr($0, 4)
                chap_count++
                part_count = 0 
                
                chap_dir = sprintf("%s/c%03d", book_dir, chap_count)
                system("mkdir -p \"" chap_dir "\"")
                next
            }

            /^### / {
                close(current_file)
                if (current_manu_file != "/dev/null") print $0 >> current_manu_file
                
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
                if (current_manu_file != "/dev/null") print $0 >> current_manu_file
                if (current_file != "/dev/null") {
                    part_line = $0
                    sub(/^#### /, "## ", part_line)
                    print part_line >> current_file
                }
                next
            }

            {
                if (current_manu_file != "/dev/null") print $0 >> current_manu_file
                if (current_file != "/dev/null") print $0 >> current_file
            }
            ' "$TMP_MD"

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
            rm -f "$TMP_MD"

            echo "   Katie's manifest locked. Source chunks saved to manuscript vault."
        fi
    fi
done

echo "👱‍♀️ Samantha: Shatter Protocol complete!"