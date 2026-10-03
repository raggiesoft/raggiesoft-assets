import os
import re

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        with open(filepath, 'r', encoding='latin-1') as f:
            content = f.read()

    # Split into frontmatter and body
    parts = content.split('---', 2)
    if len(parts) < 3:
        return # Skip files without proper frontmatter

    frontmatter = parts[1]
    body = parts[2]

    # Extract first occurrences of Theme, Location, POV from body
    theme_match = re.search(r'^Theme:\s*(.*)$', body, re.MULTILINE)
    location_match = re.search(r'^Location:\s*(.*)$', body, re.MULTILINE)
    pov_match = re.search(r'^POV:\s*(.*)$', body, re.MULTILINE)

    theme = theme_match.group(1).strip() if theme_match else None
    location = location_match.group(1).strip() if location_match else None
    pov = pov_match.group(1).strip() if pov_match else None

    # Update frontmatter
    new_frontmatter_lines = []
    for line in frontmatter.strip().split('\n'):
        if line.startswith('location:'):
            if location:
                new_frontmatter_lines.append(f'location: "{location}"')
            else:
                new_frontmatter_lines.append(line)
        else:
            new_frontmatter_lines.append(line)
            
    if theme and not any(l.startswith('theme:') for l in new_frontmatter_lines):
        new_frontmatter_lines.append(f'theme: "{theme}"')
    if pov and not any(l.startswith('pov:') for l in new_frontmatter_lines):
        new_frontmatter_lines.append(f'pov: "{pov}"')

    new_frontmatter = '\n'.join(new_frontmatter_lines)

    # Clean body
    new_body_lines = []
    for line in body.split('\n'):
        # Skip headings, metadata lines, and '='
        if line.startswith('# ') or line.startswith('## '):
            continue
        if line.startswith('Theme:') or line.startswith('Location:') or line.startswith('POV:'):
            continue
        if line.strip() == '=':
            continue
        new_body_lines.append(line)

    # Remove consecutive blank lines at the top of the body caused by deletion
    new_body_str = '\n'.join(new_body_lines).lstrip()

    new_content = f"---\n{new_frontmatter}\n---\n\n{new_body_str}"

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

for root, dirs, files in os.walk('/Users/michael/Library/CloudStorage/OneDrive-raggiesoft.com/raggiesoft-servers/raggiesoft-narratives/books/aethel'):
    for file in files:
        if file.endswith('.md'):
            process_file(os.path.join(root, file))

print("Markdown files modernized.")
