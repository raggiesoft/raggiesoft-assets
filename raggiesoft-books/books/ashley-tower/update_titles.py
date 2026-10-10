"""
Architectural Block Comment:
File: update_titles.py
Purpose:
    This script synchronizes the title frontmatter in individual markdown files with the titles stored in the central 'katie.json' registry for the 'ashley-tower' series.
    It iterates over all books, chapters, and parts defined in the JSON, reads the corresponding markdown file for each part, and updates its 'title: "..."' line.

Design Decisions & Future Maintenance:
    - Directory Structure: Assumes markdown files are relative to the 'base_dir'.
    - Regex Substitution: Utilizes a multiline regex to locate the exact frontmatter line `title: "..."` and replaces it with the JSON's `part_title`.
    - Safety: Titles containing quotes are escaped to prevent breaking the frontmatter syntax in the markdown file.
    - Performance: Currently reads and writes every single file that exists and has a title in JSON, even if the title hasn't changed. Future optimization could include a check to skip writing if `new_content == content`.
    - Encodings: Explicitly uses utf-8 encoding for both JSON and markdown file I/O to avoid cross-platform encoding issues.
"""

import json
import os
import re

# Base directory for the ashley-tower series where markdown files and katie.json reside.
base_dir = "/Users/michael/Library/CloudStorage/OneDrive-raggiesoft.com/raggiesoft-servers/raggiesoft-narratives/books/ashley-tower"
json_path = os.path.join(base_dir, "katie.json")

# Load the central registry (katie.json) that holds the source of truth for all part titles.
with open(json_path, 'r', encoding='utf-8') as f:
    katie = json.load(f)

# Deep iteration through the JSON hierarchy: Books -> Chapters -> Parts
for book in katie.get("books", []):
    for chapter in book.get("chapters", []):
        for part in chapter.get("parts", []):
            file_path = part.get("file_path")
            part_title = part.get("part_title")
            
            # Ensure both a valid path and title exist in the JSON definition before proceeding.
            if file_path and part_title:
                full_path = os.path.join(base_dir, file_path)
                
                # Check if the markdown file actually exists on the filesystem.
                if os.path.exists(full_path):
                    # Read the entire markdown content into memory.
                    with open(full_path, 'r', encoding='utf-8') as mf:
                        content = mf.read()
                    
                    # Safe regex replacement for title:
                    # Escaping quotes in the title to prevent malformed markdown frontmatter syntax.
                    safe_title = part_title.replace('"', '\\"')
                    
                    # Perform regex substitution on the 'title' field.
                    # 're.MULTILINE' is required because we use '^' and '$' to match the start and end of a line.
                    new_content = re.sub(
                        r'^title:\s*".*?"$', 
                        f'title: "{safe_title}"', 
                        content, 
                        flags=re.MULTILINE
                    )
                    
                    # Write the updated content back to the markdown file.
                    # Overwrites the entire file.
                    with open(full_path, 'w', encoding='utf-8') as mf:
                        mf.write(new_content)

# Provide console feedback that the batch operation has finished.
print("Markdown titles updated.")
