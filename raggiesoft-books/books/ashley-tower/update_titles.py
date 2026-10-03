import json
import os
import re

base_dir = "/Users/michael/Library/CloudStorage/OneDrive-raggiesoft.com/raggiesoft-servers/raggiesoft-narratives/books/ashley-tower"
json_path = os.path.join(base_dir, "katie.json")

with open(json_path, 'r', encoding='utf-8') as f:
    katie = json.load(f)

for book in katie.get("books", []):
    for chapter in book.get("chapters", []):
        for part in chapter.get("parts", []):
            file_path = part.get("file_path")
            part_title = part.get("part_title")
            
            if file_path and part_title:
                full_path = os.path.join(base_dir, file_path)
                if os.path.exists(full_path):
                    with open(full_path, 'r', encoding='utf-8') as mf:
                        content = mf.read()
                    
                    # Safe regex replacement for title
                    # Escaping quotes in the title
                    safe_title = part_title.replace('"', '\\"')
                    new_content = re.sub(
                        r'^title:\s*".*?"$', 
                        f'title: "{safe_title}"', 
                        content, 
                        flags=re.MULTILINE
                    )
                    
                    with open(full_path, 'w', encoding='utf-8') as mf:
                        mf.write(new_content)

print("Markdown titles updated.")
