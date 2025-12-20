import os           
import re           
import subprocess   
import argparse     
import json         
import shutil       
import sys          

# --- CONFIGURATION (UPDATED v4) ---
# Input: Looks for a 'books' folder in the same directory as this script (_workspace)
BUILD_SOURCE_PATH = "books" 

# Output: Go UP one level (to assets root) then into raggiesoft-books
WEBSITE_ASSET_PATH = "../raggiesoft-books"

# CDN: The public URL for images
CDN_BASE_URL = "https://assets.raggiesoft.com/raggiesoft-books"

def parse_arguments():
    parser = argparse.ArgumentParser(description="Convert narrative docx to Markdown.")
    parser.add_argument("--book", help="Optional: Process only this specific book slug.")
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
            metadata[match.group(1).lower()] = match.group(2).strip()
        elif stripped == "":
            pass
        else:
            if not found_divider: clean_lines.append(line); break 

    for line in iterator: clean_lines.append(line)
    return clean_lines, metadata

def process_book(book_slug):
    # Determine full path to source based on relative config
    script_dir = os.path.dirname(os.path.abspath(__file__))
    source_root = os.path.join(script_dir, BUILD_SOURCE_PATH)
    
    # Input
    book_source_dir = os.path.join(source_root, book_slug)
    input_docx = os.path.join(book_source_dir, f"{book_slug}.docx")
    
    # Output
    output_root = os.path.join(script_dir, WEBSITE_ASSET_PATH)
    book_output_dir = os.path.join(output_root, book_slug)
    json_path = os.path.join(output_root, f"{book_slug}.json")
    media_target_root = os.path.join(book_output_dir, "media") 

    print(f"📖 Processing: {book_slug}")

    if not os.path.exists(input_docx):
        print(f"❌ Error: Source file not found at {input_docx}")
        return

    # Clean Media
    if os.path.exists(media_target_root): shutil.rmtree(media_target_root)
    os.makedirs(media_target_root, exist_ok=True)

    # Pandoc
    try:
        result = subprocess.run(
            ['pandoc', input_docx, '-f', 'docx', '-t', 'gfm', '--wrap=none'],
            capture_output=True, text=True, encoding='utf-8'
        )
        if result.returncode != 0: print("❌ Pandoc Error:", result.stderr); return
    except FileNotFoundError:
        print("❌ Error: Pandoc is not installed.")
        return

    full_text = result.stdout
    lines = full_text.split('\n')
    
    manifest = {
        "title": book_slug.replace("-", " ").title(),
        "base_path": f"/library/{book_slug}/reader",
        "structure": []
    }

    current_book_obj, current_chap_obj, current_part_obj = None, None, None
    bk_slug, ch_slug, pt_slug, sc_slug = "", "", "", ""
    current_scene_title = "Scene 1"
    content_buffer = []

    print("⚡ Parsing hierarchy...")

    for line in lines:
        stripped = line.strip()
        if not stripped: continue

        if line.startswith('# '):
            if current_part_obj: finalize_scene(book_output_dir, book_source_dir, bk_slug, ch_slug, pt_slug, sc_slug, current_scene_title, content_buffer, current_part_obj, book_slug); content_buffer = []
            clean = line.replace('# ', '').strip(); bk_slug = slugify(clean)
            current_book_obj = { "id": bk_slug, "title": clean, "chapters": [] }
            manifest["structure"].append(current_book_obj)
            continue
            
        if line.startswith('## '):
            if current_part_obj: finalize_scene(book_output_dir, book_source_dir, bk_slug, ch_slug, pt_slug, sc_slug, current_scene_title, content_buffer, current_part_obj, book_slug); content_buffer = []; current_part_obj = None
            clean = line.replace('## ', '').strip(); ch_slug = slugify(clean)
            current_chap_obj = { "id": ch_slug, "title": clean, "parts": [] }
            if current_book_obj: current_book_obj["chapters"].append(current_chap_obj)
            continue
            
        if line.startswith('### '):
            if current_part_obj: finalize_scene(book_output_dir, book_source_dir, bk_slug, ch_slug, pt_slug, sc_slug, current_scene_title, content_buffer, current_part_obj, book_slug); content_buffer = []
            clean = line.replace('### ', '').strip(); pt_slug = slugify(clean); sc_slug = "scene-1"; current_scene_title = clean 
            current_part_obj = { "id": pt_slug, "title": clean, "scenes": [] }
            if current_chap_obj: current_chap_obj["parts"].append(current_part_obj)
            continue

        if line.startswith('#### '):
            if content_buffer: finalize_scene(book_output_dir, book_source_dir, bk_slug, ch_slug, pt_slug, sc_slug, current_scene_title, content_buffer, current_part_obj, book_slug); content_buffer = []
            clean = line.replace('#### ', '').strip(); sc_slug = slugify(clean); current_scene_title = clean
            content_buffer.append(f"# {clean}\n")
            continue

        if current_part_obj is not None: content_buffer.append(line)

    if current_part_obj and content_buffer:
        if not content_buffer[0].startswith('# '): content_buffer.insert(0, f"# {current_scene_title}\n")
        finalize_scene(book_output_dir, book_source_dir, bk_slug, ch_slug, pt_slug, sc_slug, current_scene_title, content_buffer, current_part_obj, book_slug)

    with open(json_path, "w", encoding="utf-8") as f: json.dump(manifest, f, indent=2)
    print(f"✅ Success: {book_slug}")

def finalize_scene(target_root, source_root, bk, ch, pt, sc_id, sc_title, lines, part_object, book_slug):
    if not lines: return 
    clean_lines, metadata = extract_frontmatter(lines)
    image_rel = metadata.get('image'); image_alt = metadata.get('image-alt') 
    
    if image_rel:
        if not image_alt:
            print(f"\n❌ WCAG ERROR: Missing Alt Text for {image_rel} in {book_slug}"); sys.exit(1)
        src = os.path.join(source_root, image_rel)
        if os.path.exists(src):
            dst = os.path.join(target_root, "media", image_rel); os.makedirs(os.path.dirname(dst), exist_ok=True); shutil.copy2(src, dst)
            cdn_url = f"{CDN_BASE_URL}/{book_slug}/media/{image_rel.replace(os.sep, '/')}"
            img_md = f"\n![{image_alt}]({cdn_url})\n"
            clean_lines.insert(1 if clean_lines and clean_lines[0].startswith('# ') else 0, img_md)
        else: print(f"⚠️  Image not found: {src}")

    final_lines = []
    dropped = False
    for line in clean_lines:
        if not dropped and line.strip() and not line.startswith('#') and not line.startswith('!['):
            if re.match(r'^[A-Za-z]', line):
                line = f'<span class="drop-cap">{line[0]}</span>{line[1:]}'
                dropped = True
        final_lines.append(line)

    scene_data = { "id": sc_id, "title": sc_title, "theme": metadata.get('theme'), "music": metadata.get('music'), "location": metadata.get('location'), "pov": metadata.get('pov') }
    part_object["scenes"].append({k: v for k, v in scene_data.items() if v is not None})

    d = os.path.join(target_root, bk, ch, pt); os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, f"{sc_id}.md"), "w", encoding="utf-8") as f: f.write('\n\n'.join(final_lines))

if __name__ == "__main__":
    args = parse_arguments()
    script_dir = os.path.dirname(os.path.abspath(__file__))
    source_root = os.path.join(script_dir, BUILD_SOURCE_PATH)

    if args.book: process_book(args.book)
    else:
        print(f"🚀 Batch Mode: Scanning {source_root}...")
        if not os.path.exists(source_root): print(f"❌ Error: {source_root} not found."); sys.exit(1)
        for entry in os.scandir(source_root):
            if entry.is_dir():
                docx = os.path.join(entry.path, f"{entry.name}.docx")
                if os.path.exists(docx): process_book(entry.name)
