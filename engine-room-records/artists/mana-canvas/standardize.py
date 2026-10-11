import os
import json
import glob

base_dir = '/Users/michael/Library/CloudStorage/OneDrive-raggiesoft.com/raggiesoft-servers/raggiesoft-assets/engine-room-records/artists/mana-canvas'

# Find all tracks.json in mana-canvas
for tracks_file in glob.glob(os.path.join(base_dir, '*/tracks.json')):
    album_dir = os.path.dirname(tracks_file)
    lyrics_dir = os.path.join(album_dir, 'lyrics')
    
    if not os.path.exists(lyrics_dir):
        os.makedirs(lyrics_dir)
        
    with open(tracks_file, 'r') as f:
        data = json.load(f)
        
    for track in data.get('tracks', []):
        filename = track.get('fileName')
        if not filename:
            continue
            
        md_file = os.path.join(lyrics_dir, f"{filename}.md")
        
        # We will just overwrite to standardize because they are all just [Instrumental]
        content = "**LORE NOTE:**\nThis is an instrumental track from the official soundtrack.\n\n**LYRICS:**\n\n[Instrumental]\n"
        with open(md_file, 'w') as f:
            f.write(content)
            
print("Standardization complete.")
