import json

json_path = '/Users/michael/Library/CloudStorage/OneDrive-raggiesoft.com/raggiesoft-servers/raggiesoft-narratives/books/luna-leo/katie.json'
with open(json_path, 'r') as f:
    data = json.load(f)

# Find book 8
b008 = next((b for b in data['books'] if b.get('book_num') == 8), None)
c020 = next((c for c in b008['chapters'] if c.get('chap_num') == 20), None)

# Remove p009.md from c020
if c020:
    c020['parts'] = [p for p in c020.get('parts', []) if p.get('part_num') != 9]

# Create or update c021
c021 = next((c for c in b008['chapters'] if c.get('chap_num') == 21), None)
if not c021:
    c021 = {
        "chap_num": 21,
        "chap_title": "Fellowship with All Life",
        "parts": []
    }
    # Insert c021 after c020
    idx_c020 = b008['chapters'].index(c020)
    b008['chapters'].insert(idx_c020 + 1, c021)

c021['parts'] = [
    {
        "part_num": 1,
        "part_title": "Part 1: Fellowship with All Life",
        "file_path": "b008/c021/p001.md"
    }
]

with open(json_path, 'w') as f:
    json.dump(data, f, indent=2)

print("Updated katie.json successfully.")
