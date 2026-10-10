"""
Architectural Block Comment:
File: build_katie.py
Purpose:
    This script generates the central JSON registry ('katie.json') for the 'ashley-tower' series by directly parsing a source Microsoft Word document (.docx).
    It extracts structural metadata based on paragraph styles (Heading1 = Books, Heading2 = Chapters, Heading3 = Parts/Interludes) to construct a hierarchical JSON mapping of the series.

Design Decisions & Future Maintenance:
    - DOCX Parsing: Relies on `zipfile` and `xml.etree.ElementTree` rather than external libraries (like `python-docx`) for dependency-free extraction. It directly reads `word/document.xml` from the DOCX archive.
    - Namespaces: XML namespaces are hardcoded as they adhere to the standard Office Open XML (OOXML) specifications.
    - Hierarchy Rules: 
        * Heading1 (H1) signifies a new Book.
        * Heading2 (H2) signifies a new Chapter (resets part/interlude indexes).
        * Heading3 (H3) signifies a new Part or Interlude.
    - Interlude Handling: Despite logic attempting to distinguish 'Interlude' titles to assign distinct 'iXXX.md' filenames, subsequent overrides force all parts (including interludes) to use sequential 'pXXX.md' filenames. This maintains a unified indexing system.
    - Future Scalability: Paths for both input (.docx) and output (.json) are hardcoded. Exposing these as CLI arguments would improve flexibility across different environments or series.
"""

import zipfile, xml.etree.ElementTree as ET
import json
import re

def get_headings():
    """
    Parses the OOXML standard 'word/document.xml' file embedded in a Microsoft Word .docx archive.
    Extracts and returns a list of tuples containing the heading level (H1, H2, H3) and the heading text.
    """
    headings = []
    try:
        # Open the .docx file as a ZIP archive (since .docx is inherently a compressed XML package).
        with zipfile.ZipFile('/Users/michael/Library/CloudStorage/OneDrive-raggiesoft.com/raggiesoft-servers/raggiesoft-assets/_workspace/books/ashley-tower/ashley-tower.docx', 'r') as docx:
            # Read the main document content.
            content = docx.read('word/document.xml')
            root = ET.fromstring(content)
            
            # The OOXML standard uses this namespace for WordprocessingML.
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            # Iterate through all paragraph nodes (<w:p>).
            for p in root.findall('.//w:p', ns):
                # Attempt to find the paragraph style.
                pStyle = p.find('.//w:pStyle', ns)
                style = pStyle.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val') if pStyle is not None else ''
                
                # Extract all text runs (<w:t>) within the paragraph.
                texts = [t.text for t in p.findall('.//w:t', ns) if t.text]
                text = ''.join(texts).strip()
                
                # If text is present, classify it based on its style value.
                if text:
                    if style == 'Heading1':
                        headings.append(('H1', text))
                    elif style == 'Heading2':
                        headings.append(('H2', text))
                    elif style == 'Heading3':
                        headings.append(('H3', text))
    except Exception as e:
        # Silentish failure: prints error but still returns whatever was processed.
        print('Error:', e)
    return headings

# Initialize the base template for katie.json structure.
katie = {
    "series_title": "Ashley Tower",
    "series_description": "Donald's harrowing escape from Texas to the safety of Ashley Tower.",
    "series_image": "/raggiesoft-books/images/covers/2x3/ashley-tower.jpg",
    "books": []
}

# Fetch the raw headings sequence from the DOCX file.
headings = get_headings()

# Tracking variables for current state across iterations.
current_book = None
current_chapter = None
part_index = 1
interlude_index = 1

# Process the linear sequence of headings to construct the nested JSON hierarchy.
for level, text in headings:
    if level == 'H1':
        # Encountered a new book. Reset current_book context.
        book_num = len(katie["books"]) + 1
        current_book = {
            "book_num": book_num,
            "book_title": text,
            "chapters": []
        }
        katie["books"].append(current_book)
        
    elif level == 'H2':
        # Encountered a new chapter. Requires an active book context.
        if not current_book: continue
        chap_num = len(current_book["chapters"]) + 1
        current_chapter = {
            "chap_num": chap_num,
            "chap_title": text,
            "parts": []
        }
        current_book["chapters"].append(current_chapter)
        
        # Reset counters for the new chapter.
        part_index = 1
        interlude_index = 1
        
    elif level == 'H3':
        # Encountered a new part or interlude. Requires an active chapter context.
        if not current_chapter: continue
        
        # Determine part numbering and file naming conventions.
        # If it starts with Interlude
        if text.startswith("Interlude"):
            part_num = len(current_chapter["parts"]) + 1 # Use sequential index
            file_name = f"i{interlude_index:03}.md"
            interlude_index += 1
            # But wait, earlier we saw they were sequential p00X files!
            # Let's just assume they use pXXX for everything if interludes aren't separate, but I'll use iXXX if it says Interlude to be safe, 
            # wait the ls showed p001 p002 p003 p004 for chapter 2 which has 1 interlude.
            # So they ARE using p00X sequentially for all of them!
            file_name = f"p{part_index:03}.md"
            part_index += 1
        else:
            # Standard parts simply increment the part index.
            file_name = f"p{part_index:03}.md"
            part_index += 1
            
        # Format the parent directory names for the file path (e.g. 'b001', 'c001').
        b_str = f"b{current_book['book_num']:03}"
        c_str = f"c{current_chapter['chap_num']:03}"
        
        # Append the constructed part dictionary to the current chapter.
        current_chapter["parts"].append({
            "part_num": part_index - 1,
            "part_title": text,
            "file_path": f"{b_str}/{c_str}/{file_name}"
        })

# Persist the generated mapping structure to disk.
with open('/Users/michael/Library/CloudStorage/OneDrive-raggiesoft.com/raggiesoft-servers/raggiesoft-narratives/books/ashley-tower/katie.json', 'w', encoding='utf-8') as f:
    json.dump(katie, f, indent=4)
    
print("katie.json generated successfully!")
