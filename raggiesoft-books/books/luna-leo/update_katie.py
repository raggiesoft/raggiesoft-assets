"""
Architectural Block Comment:
File: update_katie.py
Purpose:
    This script is designed to manipulate the 'katie.json' structure specifically for the 'luna-leo' book series.
    It targets structural anomalies or updates required in Book 8, Chapter 20 and Chapter 21.
    
    Specifically, it:
    1. Removes part 9 from Chapter 20 of Book 8.
    2. Creates or updates Chapter 21 in Book 8, ensuring it is positioned directly after Chapter 20.
    3. Overwrites Chapter 21's parts with a specific single part entry.

Design Decisions & Future Maintenance:
    - Data structure expectations: The JSON file must contain a 'books' array. Books contain 'chapters', which contain 'parts'.
    - Hardcoded Paths: The JSON file path is currently hardcoded. For future maintenance, consider making this an environment variable or command-line argument.
    - Error Handling: It uses `next(..., None)` for safe lookups, but assumes Book 8 and Chapter 20 always exist when looking for their indices. It might crash if Book 8 doesn't exist, which should be addressed if this script becomes generic.
"""

import json

# Target JSON path. Update this if the directory structure changes.
json_path = '/Users/michael/Library/CloudStorage/OneDrive-raggiesoft.com/raggiesoft-servers/raggiesoft-narratives/books/luna-leo/katie.json'

# Load the existing JSON data structure into memory for manipulation.
with open(json_path, 'r') as f:
    data = json.load(f)

# Locate Book 8 from the books array. Returns None if not found, but subsequent code assumes it's found.
b008 = next((b for b in data['books'] if b.get('book_num') == 8), None)
# Locate Chapter 20 within Book 8.
c020 = next((c for c in b008['chapters'] if c.get('chap_num') == 20), None)

# If Chapter 20 exists, filter out the part with part_num 9 (p009.md).
# This effectively removes part 9 from the chapter.
if c020:
    c020['parts'] = [p for p in c020.get('parts', []) if p.get('part_num') != 9]

# Check if Chapter 21 already exists within Book 8.
c021 = next((c for c in b008['chapters'] if c.get('chap_num') == 21), None)

# If Chapter 21 does not exist, initialize it with a predefined title and an empty parts array.
if not c021:
    c021 = {
        "chap_num": 21,
        "chap_title": "Fellowship with All Life",
        "parts": []
    }
    # Find the index of Chapter 20 to ensure Chapter 21 is inserted immediately after it,
    # maintaining sequential chapter ordering.
    idx_c020 = b008['chapters'].index(c020)
    b008['chapters'].insert(idx_c020 + 1, c021)

# Regardless of whether Chapter 21 was newly created or already existed,
# overwrite its 'parts' array to contain exactly this one part.
c021['parts'] = [
    {
        "part_num": 1,
        "part_title": "Part 1: Fellowship with All Life",
        "file_path": "b008/c021/p001.md"
    }
]

# Write the modified data structure back to the JSON file, using an indent of 2 for readability.
with open(json_path, 'w') as f:
    json.dump(data, f, indent=2)

# Feedback to console upon successful completion.
print("Updated katie.json successfully.")
