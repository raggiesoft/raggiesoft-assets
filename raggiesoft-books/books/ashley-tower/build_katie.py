import zipfile, xml.etree.ElementTree as ET
import json
import re

def get_headings():
    headings = []
    try:
        with zipfile.ZipFile('/Users/michael/Library/CloudStorage/OneDrive-raggiesoft.com/raggiesoft-servers/raggiesoft-assets/_workspace/books/ashley-tower/ashley-tower.docx', 'r') as docx:
            content = docx.read('word/document.xml')
            root = ET.fromstring(content)
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            for p in root.findall('.//w:p', ns):
                pStyle = p.find('.//w:pStyle', ns)
                style = pStyle.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val') if pStyle is not None else ''
                texts = [t.text for t in p.findall('.//w:t', ns) if t.text]
                text = ''.join(texts).strip()
                if text:
                    if style == 'Heading1':
                        headings.append(('H1', text))
                    elif style == 'Heading2':
                        headings.append(('H2', text))
                    elif style == 'Heading3':
                        headings.append(('H3', text))
    except Exception as e:
        print('Error:', e)
    return headings

katie = {
    "series_title": "Ashley Tower",
    "series_description": "Donald's harrowing escape from Texas to the safety of Ashley Tower.",
    "series_image": "/raggiesoft-books/images/covers/2x3/ashley-tower.jpg",
    "books": []
}

headings = get_headings()

current_book = None
current_chapter = None
part_index = 1
interlude_index = 1

for level, text in headings:
    if level == 'H1':
        book_num = len(katie["books"]) + 1
        current_book = {
            "book_num": book_num,
            "book_title": text,
            "chapters": []
        }
        katie["books"].append(current_book)
    elif level == 'H2':
        if not current_book: continue
        chap_num = len(current_book["chapters"]) + 1
        current_chapter = {
            "chap_num": chap_num,
            "chap_title": text,
            "parts": []
        }
        current_book["chapters"].append(current_chapter)
        part_index = 1
        interlude_index = 1
    elif level == 'H3':
        if not current_chapter: continue
        
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
            file_name = f"p{part_index:03}.md"
            part_index += 1
            
        b_str = f"b{current_book['book_num']:03}"
        c_str = f"c{current_chapter['chap_num']:03}"
        
        current_chapter["parts"].append({
            "part_num": part_index - 1,
            "part_title": text,
            "file_path": f"{b_str}/{c_str}/{file_name}"
        })

with open('/Users/michael/Library/CloudStorage/OneDrive-raggiesoft.com/raggiesoft-servers/raggiesoft-narratives/books/ashley-tower/katie.json', 'w', encoding='utf-8') as f:
    json.dump(katie, f, indent=4)
print("katie.json generated successfully!")
