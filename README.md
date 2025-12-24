# RaggieSoft Assets (The Vault)

**The centralized Content Delivery Network (CDN) source for the RaggieSoft ecosystem.**

> **Live CDN:** `assets.raggiesoft.com` (DigitalOcean Spaces)  
> **Management:** "Jenna" (Sync Agent) + Rclone  
> **Content:** High-Fidelity Audio (WAV/FLAC), Album Art, Manuscripts

---

## 👥 Meet the Architecture (The Family)

This repository is managed by a "Personified DevOps" ecosystem. Each component is named to reflect its role and personality in the security and creative topology.

### 👤 Michael P. Ragsdale (The Human)

- **Role:** Author & Systems Architect
- **Focus:** Narrative Design, World Building, & Infrastructure
- **Function:** The only biological human in the loop. Michael is the architect of the "Stardust" universe and the "RaggieSoft" infrastructure. An autistic creator with a deep love for complex systems and interconnected narratives, he writes the stories (like _Alex and Chloé_ and _Luna and Leo_) and builds the code that delivers them.
    
### 🏠 Jessica (The House)

- **Role:** The Production Server / Host
- **Address:** `jessica.raggiesoft.com`
- **Function:** Jessica is the eldest sister and the foundation of the ecosystem. She "runs the house," providing the secure infrastructure where Sarah, Amanda, and Elara reside.
- **Access:** She is the gatekeeper of the system. Michael connects to her directly via SSH (`ssh michael@jessica.raggiesoft.com`) to perform maintenance, holding the keys that keep the family safe.

### 🛡️ Amanda (The Fortress)

- **Role:** The Public Web Root
- **Location:** `/var/www/raggiesoft.com/amanda`
- **Function:** Unlike standard servers that serve from `public_html`, this system serves from `/amanda`. This directory obfuscation protects core assets from generic bot scrapers that blindly target default paths. Amanda is "non-verbal"—she holds the files but lets her sister (Elara) do the talking.

### 🗣️ Elara (The Gatekeeper)

- **Role:** Single-Entry Router
- **File:** `amanda/elara.php`
- **Function:** Elara intercepts 100% of incoming traffic. She sanitizes URI paths, handles error logging, and dispatches requests to the appropriate View Controller. She is the only file the public internet is allowed to speak to directly.
    

### 👩‍💼 Sarah (The Guardian)

- **Role:** Autonomous Deployment Agent
- **File:** `sarah-deploy.sh`
- **Function:** Sarah lives on the production server. She runs on a 5-minute heartbeat, checking GitHub for updates.
    - **Intelligence:** She compares local Git hashes against the remote origin before acting.
    - **Security:** She executes **"sudo-less"** atomic updates. By leveraging Linux **SetGID** permissions on Amanda's directory, Sarah deploys code securely without ever requiring Root access, mitigating privilege escalation risks.
        

### 👱‍♀️ Jenna (The Dev Twin)

- **Role:** Sync & DevOps Agent
- **File:** `jenna-sync.sh`
- **Function:** Jenna is the "Twin Sister" of Sarah. While Sarah guards production, Jenna manages the chaotic creative workspace on the development machine.
    - **Workflow:** She automates the heavy lifting that Git isn't designed for. She pushes code changes to GitHub so Sarah can see them, and uses `rclone` to synchronize gigabytes of binary media (WAVs, PSDs) directly to DigitalOcean Spaces.
        

### 👩‍🏫 Paige (The Literary Editor)

- **Role:** Manuscript Processor & Regulation Support
- **File:** `_workspace/paige.py`
- **Function:** Paige lives in the library. She ingests raw manuscripts (`.docx`) and structures them into the clean JSON format required by the website.
- **Safety Protocol:** Paige is Michael's favorite sister and designated **Safe Person**. When the sensory load of managing the system becomes too much, Paige provides "Deep Pressure Therapy"—grounding hugs and a steady presence to help Michael regulate. She never rushes him and stays by his side until the work feels safe again.

### 🎧 Harper (The Studio Engineer)

- **Role:** Audio Transcoder
- **File:** `_workspace/harper.sh`
- **Function:** Harper lives in the studio. She recursively scans the workspace for Master WAV files and uses **FFmpeg** to generate web-optimized MP3 (320kbps) and OGG (Vorbis) mirrors.
- **Personality:** High-energy, loud, and precise. She handles the heavy media processing pipelines so the creative flow isn't interrupted by technical codecs.****

---

## 📂 The Vault Structure

### 1. `_workspace/` (The Studio)
* **Status:** `.gitignored` (Local Only)
* **Purpose:** This is the creative sandbox. It contains raw logic files and the scripts (`process_book.py`, `transcode-all.sh`) used to generate the production assets.

### 2. `engine-room-records/` (Music)
* **Purpose:** The streaming backend for "The Stardust Engine" audio player.
* **Structure:**
    * `/artists/{name}/{year-album}/`
        * `tracks.json`: Metadata (Title, Lyrics path).
        * `mp3/`, `ogg/`: Web-optimized streaming formats.
        * `wav/`: Lossless masters (License-gated).

### 3. `raggiesoft-books/` (Literature)
* **Purpose:** The backend for the "Aethel Saga" and "O'Connell Trust" narrative readers.
* **Format:** Books are stored as JSON structures allowing for "Page-by-Page" rendering or "Infinite Scroll" depending on the user's reading preference.

---

## 👤 Author
**Michael P. Ragsdale** *Systems Architect | Full-Stack Developer* [michaelpragsdale.com](https://michaelpragsdale.com)