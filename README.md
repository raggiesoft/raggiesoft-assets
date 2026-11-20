# RaggieSoft Static Asset CDN Root (`assets.raggiesoft.com`)

[![License: MIT](https://img.shields.io/badge/Code_License-MIT-0369a1.svg)](./LICENSE)
[![CDN: DigitalOcean Spaces S3](https://img.shields.io/badge/CDN-DigitalOcean_Spaces_(rclone)-0080ff.svg)](https://raggiesoft.com)

Centralized static asset repository mirrored to **DigitalOcean Spaces S3 CDN (`https://assets.raggiesoft.com`)** via `rclone` inside `raggiesoft-deployment-tools/jenna-sync.sh`.

## Contents & Architecture

- **`common/`**: Shared WCAG 2.1 AA CSS design tokens, cross-domain navigation bar (`raggiesoft-network.js`), and shared UI iconography consumed across `raggiesoft.com` and `*.raggiesoft.com`.
- **`engine-room-records/` & `raggiesoft-books/` & `raggiesoft-backstage/` & `raggiesoft-lore/` & `nebulae/` & `storetrainer/`**: Public album catalogs, WebVTT (`.vtt`) caption manifests, scene illustrations, cover artwork, and downloadable CC BY-SA 4.0 digital editions (24-bit studio WAV masters remain isolated offline outside this repository).
- **`portfolio/`**: Public static assets and tagged PDF resume served to `https://michaelpragsdale.com`, governed by root [`robots.txt`](./robots.txt) crawler rules so search engines index canonical web pages rather than raw storage bucket files.

## Licensing

- **CSS, JS & Build Code**: MIT License (`LICENSE`)
- **Creative Illustrations, Audio & Narrative Media**: CC BY-SA 4.0
