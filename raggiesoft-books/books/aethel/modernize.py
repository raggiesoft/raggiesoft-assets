"""
=============================================================================
Architecture & Maintenance Guide: modernize.py
=============================================================================
Purpose:
    This script automates the modernization of Markdown (.md) files within a 
    specific directory by parsing and migrating metadata. It extracts key 
    narrative elements (Theme, Location, POV) from the body of the Markdown 
    and systematically injects them into the YAML frontmatter.

Design Principles:
    - Fault Tolerance: Attempts UTF-8 reading first; falls back to latin-1 
      to handle legacy encodings gracefully.
    - Idempotency: Checks for the existence of metadata in the frontmatter 
      before adding it, ensuring the script can be run multiple times safely.
    - Non-Destructive Parsing: Splits the file into frontmatter and body 
      explicitly to avoid corrupting content.

Maintenance Notes:
    - If new metadata fields need to be extracted, add new regex matchers 
      similar to `theme_match` and append logic to update `new_frontmatter_lines`.
    - Be cautious of the `---` splitting logic; it assumes standard YAML 
      frontmatter formatting.
=============================================================================
"""

import os
import re

def process_file(filepath):
    # Attempt to read the file using UTF-8, falling back to latin-1 on decode failure
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        with open(filepath, 'r', encoding='latin-1') as f:
            content = f.read()

    # Split the document into three parts: pre-frontmatter (empty), frontmatter, and body
    # The '2' limits the split to 3 pieces, isolating the frontmatter.
    parts = content.split('---', 2)
    if len(parts) < 3:
        return # Skip files without proper frontmatter; prevents processing errors

    frontmatter = parts[1]
    body = parts[2]

    # Extract first occurrences of Theme, Location, POV from the body using multiline regex
    theme_match = re.search(r'^Theme:\s*(.*)$', body, re.MULTILINE)
    location_match = re.search(r'^Location:\s*(.*)$', body, re.MULTILINE)
    pov_match = re.search(r'^POV:\s*(.*)$', body, re.MULTILINE)

    # Clean the extracted values; fallback to None if no match is found
    theme = theme_match.group(1).strip() if theme_match else None
    location = location_match.group(1).strip() if location_match else None
    pov = pov_match.group(1).strip() if pov_match else None

    # Update the frontmatter with extracted metadata
    new_frontmatter_lines = []
    for line in frontmatter.strip().split('\n'):
        # If a location is found in the body, overwrite any existing 'location:' in frontmatter
        if line.startswith('location:'):
            if location:
                new_frontmatter_lines.append(f'location: "{location}"')
            else:
                new_frontmatter_lines.append(line)
        else:
            new_frontmatter_lines.append(line)
            
    # Append 'theme' to frontmatter if it was found and doesn't already exist
    if theme and not any(l.startswith('theme:') for l in new_frontmatter_lines):
        new_frontmatter_lines.append(f'theme: "{theme}"')
    
    # Append 'pov' to frontmatter if it was found and doesn't already exist
    if pov and not any(l.startswith('pov:') for l in new_frontmatter_lines):
        new_frontmatter_lines.append(f'pov: "{pov}"')

    # Reconstruct the frontmatter block
    new_frontmatter = '\n'.join(new_frontmatter_lines)

    # Clean the document body by removing headings and extracted metadata
    new_body_lines = []
    for line in body.split('\n'):
        # Skip top-level headings to normalize formatting
        if line.startswith('# ') or line.startswith('## '):
            continue
        # Skip the metadata lines we just extracted to prevent redundancy
        if line.startswith('Theme:') or line.startswith('Location:') or line.startswith('POV:'):
            continue
        # Skip purely decorative dividers
        if line.strip() == '=':
            continue
        new_body_lines.append(line)

    # Remove consecutive blank lines at the top of the body caused by the deletion process
    new_body_str = '\n'.join(new_body_lines).lstrip()

    # Reassemble the entire document with the new frontmatter and cleaned body
    new_content = f"---\n{new_frontmatter}\n---\n\n{new_body_str}"

    # Write the modernized content back to the file using UTF-8 encoding
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

# Walk the designated directory tree to find all relevant .md files
for root, dirs, files in os.walk('/Users/michael/Library/CloudStorage/OneDrive-raggiesoft.com/raggiesoft-servers/raggiesoft-narratives/books/aethel'):
    for file in files:
        if file.endswith('.md'):
            # Process each markdown file found in the traversal
            process_file(os.path.join(root, file))

print("Markdown files modernized.")
