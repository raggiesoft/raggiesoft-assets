#!/bin/bash

# ============================================================================
# Architectural Block: lyric-combiner.sh
# ============================================================================
# This utility script is designed to concatenate individual Markdown lyric files 
# within an album directory into a single, cohesive `full_album.md` document.
#
# Key Responsibilities:
# 1. Cleanup: Removes any existing `full_album.md` to prevent duplicate appending.
# 2. Iteration: Loops through all `.md` files in the current directory.
# 3. Formatting: Injects markdown separators (***) and headers (### **filename**) 
#    before appending each file's content, ensuring readability.
#
# Maintenance Notes:
# - This script operates strictly on the current working directory.
# - It assumes all `.md` files present (other than the target) are valid lyric files.
# - The inline formatting (`\n\n***\n### **$file**\n***\n`) is tightly coupled to 
#   the expected Markdown structure of the lore engine.
# ============================================================================

# Remove previous artifact, then loop through all markdown files.
# For each file, echo the action, append a styled header to full_album.md, 
# and then concatenate the file's contents into full_album.md.
rm -f full_album.md && for file in *.md; do echo "Merging: $file"; echo -e "\n\n***\n### **$file**\n***\n" >> full_album.md; cat "$file" >> full_album.md; done && echo "Done! Output saved to full_album.md"