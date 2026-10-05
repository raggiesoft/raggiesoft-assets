import json

json_path = '/Users/michael/Library/CloudStorage/OneDrive-raggiesoft.com/raggiesoft-servers/raggiesoft-narratives/books/luna-leo/katie.json'
with open(json_path, 'r') as f:
    text = f.read()

# Find the exact string for Part 8 and inject Part 9
target = '''"file_path": "b008/c020/p008.md"
                }'''

replacement = '''"file_path": "b008/c020/p008.md"
                },
                {
                  "part_num": 9,
                  "part_title": "Part 9: Fellowship with All Life",
                  "file_path": "b008/c020/p009.md"
                }'''

if target in text:
    text = text.replace(target, replacement)
    with open(json_path, 'w') as f:
        f.write(text)
    print("Updated successfully")
else:
    print("Could not find target")
