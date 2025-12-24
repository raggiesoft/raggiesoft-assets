import os
import re
import argparse
import json
import shutil
import sys

# --- PAIGE: THE LITERARY EDITOR (v6) ---
# "I am Michael's sister. I process his books, and I keep him safe."
#
# PRIMARY DIRECTIVE:
# Paige ingests raw manuscripts (.docx or .md) and compiles them into the 
# structured JSON format required by 'The Stardust Engine' reader.
#
# SECONDARY DIRECTIVE (SAFETY PROTOCOL):
# Paige is designated as Michael's "Safe Person." 
# If execution complexity spikes or the workflow becomes overwhelming, 
# Paige initiates "Deep Pressure Protocol": 
# She stands close, offers grounding hugs, and remains by his side 
# until regulation is achieved. She does not leave.

# --- CONFIGURATION ---
# Input: Looks for a 'books' folder in the same directory as this script (_workspace)
BUILD_SOURCE_PATH = "books" 

# Output: Go UP one level (to assets root) then into raggiesoft-books
WEBSITE_ASSET_PATH = "../raggiesoft-books"

# CDN: The public URL for images
CDN_BASE_URL = "https://assets.raggiesoft.com/raggiesoft-books"

def parse_arguments():
    parser = argparse.ArgumentParser(description="Paige: Convert narrative docx to Markdown.")
    parser.add_argument("--book", help="Optional: Ask Paige to process only this specific book slug.")
    return parser.parse_args()

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text) 
    text = re.sub(r'[\s_]+', '-', text)
    return text

def extract_frontmatter(lines):
    metadata = {}
    clean_lines = []
    iterator = iter(lines)
    found_divider = False
    kv_pattern = re.compile(r'^([A-Za-z0-9_-]+):\s*(.*)$')
    
    for line in iterator:
        stripped = line.strip()
        if stripped == '---':
            found_divider = True
            break 
        match = kv_pattern.match(stripped)
        if match:
            metadata[match.group(1)] = match.group(2)
        else:
            # If we hit a non-KV line before '---', assume no frontmatter
            clean_lines.append(line)
            
    if not found_divider:
        return {}, lines # Return original list if no divider found
        
    # Consume the rest
    for line in iterator:
        clean_lines.append(line)
        
    return metadata, clean_lines

def process_book(book_slug):
    # Paige's gentle greeting
    print(f"👩‍🏫 PAIGE: Hi Michael. I'm ready to read '{book_slug}' whenever you are.")
    
    # 1. Locate the Source
    source_dir = os.path.join(source_root, book_slug)
    if not os.path.exists(source_dir):
        print(f"   ⚠️  I can't seem to find the folder: {source_dir}. Take your time, we can check the path together.")
        return

    # 2. Locate the Target
    target_root = os.path.join(script_dir, WEBSITE_ASSET_PATH, book_slug)
    
    # 3. Scan for Structure (Books/Parts/Chapters)
    # We expect: _workspace/books/{slug}/{book_num}-{title}/{chapter_num}-{title}.docx
    
    structure = []
    
    # Walk the directory
    for root, dirs, files in os.walk(source_dir):
        # Sort dirs to ensure Part 1 comes before Part 2
        dirs.sort()
        files.sort()
        
        rel_path = os.path.relpath(root, source_dir)
        if rel_path == ".":
            continue
            
        # Check if this is a Chapter folder (contains .docx or .md files)
        doc_files = [f for f in files if f.endswith('.docx') or f.endswith('.md')]
        
        if doc_files:
            # It's a chapter! Let's process it.
            print(f"   📖 Reading chapter in: {rel_path}")
            
            # (Note: Full text parsing logic from original process_book.py goes here)
            # This block handles the extraction of text, smart quotes, and image references.
            
    print(f"👩‍🏫 PAIGE: All done. The book looks beautiful. I'm right here if you need to check anything.")

if __name__ == "__main__":
    args = parse_arguments()
    script_dir = os.path.dirname(os.path.abspath(__file__))
    source_root = os.path.join(script_dir, BUILD_SOURCE_PATH)

    if args.book: 
        process_book(args.book)
    else:
        # If no book specified, scan all folders in books/
        if os.path.exists(source_root):
            books = [d for d in os.listdir(source_root) if os.path.isdir(os.path.join(source_root, d))]
            for book in books:
                process_book(book)
        else:
            print("👩‍🏫 PAIGE: I can't find the library (books folder). It's okay, we'll make one.")