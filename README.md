# RaggieSoft Assets (CDN Origin)

This repository serves as the centralized static asset host for the **RaggieSoft Network**, including *The Stardust Engine*, *Project: KNOX*, and the corporate portfolio.

It is designed to keep the main application repositories lightweight by offloading binary assets (audio, high-res imagery, archives) and shared frontend libraries.

## 📂 Repository Structure

### 1. The Stardust Engine (`/stardust-engine`)
Assets for the fictional 80s synth-rock band narrative.
- **`/music`**: Organized by album slug (e.g., `1995-the-warehouse-tapes`).
  - Contains `tracks.json` and `album.json` metadata.
  - Stores `album-art.jpg` and `social-preview.jpg`.
  - **Note:** Actual audio files (`.ogg`, `.mp3`) are typically hosted here but ignored by Git (see `.gitignore`).
- **`/images`**: Band member portraits, timeline graphics, and narrative illustrations (e.g., *Ad Astra* mission logs).
- **`/css`**: Custom Bootstrap themes (`ad-astra`, `crucible`).
- **`/js`**: The `stardust-player.js` logic.

### 2. Project: KNOX (`/knox`)
Assets for the sci-fi narrative universe.
- **`/images`**: Atmospheric concept art for Port Telsus, Aerie-Hold, and character designs.
- **`/css`**: Theme files for the Knox-specific UI.

### 3. Common Libraries (`/common`)
Shared resources used across all RaggieSoft sites to ensure visual consistency.
- **`/css/bootstrap-common`**: Base overrides that kill default Bootstrap styling (typography, heavy headers).
- **`/css/raggiesoft-corporate`**: The professional "Portfolio" theme.
- **`/js`**: Shared scripts like `bootstrap.js` and the Konami code trigger.
- **`/patterns`**: Reusable background textures (starfields, noise).

### 4. RS Audio Player (`/rs-audio-player`)
The custom Web Component (`<rs-audio-player>`) used to stream music.
- **`/js`**: The core component logic.
- **`/docs`**: Integration documentation.

---

## 🚀 Usage & Integration

These assets are intended to be served via a CDN (e.g., DigitalOcean Spaces, AWS S3, or a dedicated Nginx static host).

**Public URL Pattern:**
`https://assets.raggiesoft.com/[project]/[path/to/file]`

**Example:**
```html
<img src="[https://assets.raggiesoft.com/stardust-engine/images/stardust-engine-hero.jpg](https://assets.raggiesoft.com/stardust-engine/images/stardust-engine-hero.jpg)">

<link href="[https://assets.raggiesoft.com/common/css/bootstrap-common/bootstrap-base.css](https://assets.raggiesoft.com/common/css/bootstrap-common/bootstrap-base.css)" rel="stylesheet">