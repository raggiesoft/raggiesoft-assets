/**
 * ============================================================================
 * STARDUST ENGINE: READER LOGIC (reader.js)
 * ARCHITECTURAL OVERVIEW
 * ============================================================================
 * 
 * Description:
 * This script is the primary controller for the Stardust Engine's reading 
 * interface (Oliver). It manages user preferences, media playback, layout 
 * adjustments, and offline capabilities entirely client-side.
 * 
 * Core Subsystems:
 * 1. UI Toggles: Handles the off-canvas sidebar, settings dialogs, and 
 *    wizard dialogs.
 * 2. Audio Engine: Controls the `<audio>` element for in-story soundtracks 
 *    or narration, including a custom scrubber, lyrics fetcher, loop toggling, 
 *    and MediaSession API integration for OS-level control.
 * 3. LocalStorage State: Persists user preferences (theme, font size, column 
 *    width, font family, auto-play) and reading data (bookmarks, hidden books, 
 *    last-read location) locally to avoid requiring server-side accounts.
 * 4. Keyboard Shortcuts: Implements hotkeys for quick navigation (Next/Prev), 
 *    theme toggling, and fullscreen mode.
 * 5. Offline Cache Manager: Uses `fetch` to proactively download book assets 
 *    (JSON TOC, images, HTML parts) so the Service Worker can intercept and 
 *    cache them for offline reading.
 * 
 * Maintainability Notes:
 * - This script is designed to run in a Single Page Application (SPA) context. 
 *   The `initOceanViewReader` wrapper ensures that event listeners can be 
 *   safely re-bound or prevented from double-binding on soft DOM swaps 
 *   (e.g., listening for `stardust:loaded`).
 * - All DOM queries must gracefully fail if the element doesn't exist, as 
 *   certain UI components (like audio players) are contextual.
 * ============================================================================
 */
function initOceanViewReader() {

    // ==========================================
    // 0. CLIENT OPERATING SYSTEM RESOLVER
    // ==========================================
    // Sets `data-os="macos|windows|linux|ios|android"` on `<html>` so OS-native
    // UI chrome (such as Zoë's `ZOË.Systems.Logs` diagnostic window header)
    // automatically matches the device viewing the book.
    try {
        const params = new URLSearchParams(window.location.search);
        const previewOs = (params.get('preview_os') || '').toLowerCase();
        const validOs = ['macos', 'windows', 'linux', 'ios', 'android'];
        let resolvedOs = '';
        if (validOs.includes(previewOs)) {
            resolvedOs = previewOs;
        } else {
            const ua = (navigator.userAgent || '').toLowerCase();
            const plat = ((navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '').toLowerCase();
            const isIpadOs = (plat.includes('mac') || ua.includes('macintosh')) && navigator.maxTouchPoints && navigator.maxTouchPoints > 1;
            if (isIpadOs || /iphone|ipad|ipod/.test(ua) || plat.includes('ios')) {
                resolvedOs = 'ios';
            } else if (ua.includes('android') || plat.includes('android')) {
                resolvedOs = 'android';
            } else if (plat.includes('win') || ua.includes('windows')) {
                resolvedOs = 'windows';
            } else if (plat.includes('linux') || ua.includes('linux') || ua.includes('cros')) {
                resolvedOs = 'linux';
            } else {
                resolvedOs = 'macos';
            }
        }
        document.documentElement.setAttribute('data-os', resolvedOs);
    } catch (e) {}

    // ==========================================
    // 1. SIDEBAR MANAGEMENT
    // ==========================================
    const sidebar = document.getElementById('stardust-sidebar');
    const toggleBtn = document.getElementById('stardust-sidebar-toggle');
    const backdrop = document.getElementById('reader-sidebar-backdrop');

    // Toggles the mobile off-canvas sidebar menu
    function toggleSidebar() {
        if (sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            if (backdrop) backdrop.style.display = 'none';
        } else if (sidebar) {
            sidebar.classList.add('open');
            if (backdrop) backdrop.style.display = 'block';
        }
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSidebar);
    }
    if (backdrop) {
        backdrop.addEventListener('click', toggleSidebar);
    }


    // ==========================================
    // 2. IN-UNIVERSE DATETIME FORMATTING
    // ==========================================
    // Formats narrative timestamps according to the user's locale while 
    // respecting the story's defined timezone (IANA).
    const dtEl = document.getElementById('story-datetime-display');
    if (dtEl) {
        const iso = dtEl.getAttribute('data-iso');
        if (iso) {
            try {
                const d = new Date(iso);
                const iana = dtEl.getAttribute('data-iana');
                const options = { 
                    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', 
                    hour: 'numeric', minute: '2-digit', timeZoneName: 'short' 
                };
                if (iana) {
                    options.timeZone = iana;
                }
                const formatter = new Intl.DateTimeFormat(undefined, options);
                const txt = dtEl.querySelector('.dt-text');
                if(txt) txt.textContent = formatter.format(d);
            } catch(e) {}
        }
    }

    // Formats standalone 24-hour fantasy/realm timestamps (e.g., "23:42") into
    // the user's OS time format without any timezone conversion.
    const timeOnlyEl = document.getElementById('story-time-only-display');
    if (timeOnlyEl) {
        const rawStart = timeOnlyEl.getAttribute('data-time-only');
        const rawEnd = timeOnlyEl.getAttribute('data-end-time-only');
        if (rawStart && rawStart.includes(':')) {
            try {
                const formatLocalClock = (hhmm) => {
                    const [h, m] = hhmm.split(':').map(Number);
                    if (isNaN(h) || isNaN(m)) return hhmm;
                    const localDate = new Date(2000, 0, 1, h, m, 0);
                    return new Intl.DateTimeFormat(undefined, {
                        hour: 'numeric',
                        minute: '2-digit'
                    }).format(localDate);
                };
                let formattedClock = formatLocalClock(rawStart);
                if (rawEnd && rawEnd.includes(':')) {
                    formattedClock += ' \u2013 ' + formatLocalClock(rawEnd);
                }
                const txt = timeOnlyEl.querySelector('.dt-text');
                if (txt) txt.textContent = formattedClock;
            } catch (e) {}
        }
    }


    // ==========================================
    // 2B. SCENE HERO IMAGE CAROUSEL CONTROLLER
    // ==========================================
    // Binds interactive Next/Prev buttons, pagination dots, keyboard Left/Right
    // navigation (when focused inside the carousel), and touch swipe gestures
    // for multi-slide 16:9 Chapter Header Plates (`[data-hero-carousel]`).
    const heroCarousels = document.querySelectorAll('[data-hero-carousel]');
    heroCarousels.forEach((carousel) => {
        if (carousel.dataset.carouselBound === 'true') return;
        carousel.dataset.carouselBound = 'true';

        const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
        const prevBtn = carousel.querySelector('[data-hero-prev]');
        const nextBtn = carousel.querySelector('[data-hero-next]');
        const counterEl = carousel.querySelector('[data-hero-counter]');
        if (slides.length <= 1) return;

        let activeIndex = 0;

        const showSlide = (nextIdx) => {
            const total = slides.length;
            activeIndex = ((nextIdx % total) + total) % total;

            slides.forEach((slide, idx) => {
                const isActive = idx === activeIndex;
                slide.classList.toggle('is-active', isActive);
                slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
            });

            dots.forEach((dot, idx) => {
                const isActive = idx === activeIndex;
                dot.classList.toggle('is-active', isActive);
                dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });

            if (counterEl) {
                counterEl.textContent = (activeIndex + 1) + ' / ' + total;
            }
        };

        if (prevBtn && !prevBtn.hasAttribute('onclick')) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                showSlide(activeIndex - 1);
            });
        }

        if (nextBtn && !nextBtn.hasAttribute('onclick')) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                showSlide(activeIndex + 1);
            });
        }

        dots.forEach((dot, idx) => {
            if (!dot.hasAttribute('onclick')) {
                dot.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    showSlide(idx);
                });
            }
        });

        if (carousel.dataset.heroKeySwipeBound !== 'true') {
            carousel.dataset.heroKeySwipeBound = 'true';
            carousel.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    e.stopPropagation();
                    showSlide(activeIndex - 1);
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    e.stopPropagation();
                    showSlide(activeIndex + 1);
                }
            });

            // Touch swipe support for mobile/tablet readers
            let touchStartX = null;
            let touchStartY = null;
            carousel.addEventListener('touchstart', (e) => {
                if (e.touches && e.touches.length === 1) {
                    touchStartX = e.touches[0].clientX;
                    touchStartY = e.touches[0].clientY;
                }
            }, { passive: true });

            carousel.addEventListener('touchend', (e) => {
                if (touchStartX === null || touchStartY === null) return;
                if (e.changedTouches && e.changedTouches.length === 1) {
                    const dx = e.changedTouches[0].clientX - touchStartX;
                    const dy = e.changedTouches[0].clientY - touchStartY;
                    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
                        if (dx < 0) {
                            showSlide(activeIndex + 1);
                        } else {
                            showSlide(activeIndex - 1);
                        }
                    }
                }
                touchStartX = null;
                touchStartY = null;
            }, { passive: true });
        }
    });


    // ==========================================
    // 3. AUDIO ENGINE & MEDIA CONTROLS
    // ==========================================
    const audioEl = document.getElementById('narrative-audio-element');
    const loopBtn = document.getElementById('narrative-audio-loop-toggle');
    const lyricsBtn = document.getElementById('narrative-audio-lyrics-toggle');
    const lyricsDialog = document.getElementById('narrative-lyrics-dialog');
    const lyricsTitle = document.getElementById('narrative-lyrics-title');
    const lyricsContent = document.getElementById('narrative-lyrics-content');
    const playToggleBtn = document.getElementById('narrative-audio-play-toggle');
    const playIcon = document.getElementById('narrative-audio-play-icon');
    const prevBtn = document.getElementById('narrative-audio-prev');
    const nextBtn = document.getElementById('narrative-audio-next');
    const queueToggleBtn = document.getElementById('narrative-audio-queue-toggle');
    const queueDrawer = document.getElementById('narrative-audio-queue-drawer');
    const queuePosEl = document.getElementById('narrative-audio-queue-pos');
    const scrubber = document.getElementById('narrative-audio-scrubber');
    const currentTimeDisplay = document.getElementById('narrative-audio-current');
    const durationDisplay = document.getElementById('narrative-audio-duration');

    // Parse multi-track / album / playlist queue if present
    let audioQueue = [];
    let activeQueueIndex = 0;
    let queueMode = 'single';
    let repeatMode = 'one';

    if (audioEl) {
        queueMode = audioEl.getAttribute('data-queue-mode') || 'single';
        try {
            const rawQueue = audioEl.getAttribute('data-queue');
            if (rawQueue) {
                const parsedQueue = JSON.parse(rawQueue);
                if (Array.isArray(parsedQueue)) {
                    audioQueue = parsedQueue;
                }
            }
        } catch (err) {
            console.warn('Unable to parse narrative audio queue JSON:', err);
        }
        repeatMode = audioEl.getAttribute('data-repeat-mode') || (audioQueue.length > 1 ? 'all' : 'one');
        activeQueueIndex = parseInt(audioEl.getAttribute('data-active-index') || '0', 10) || 0;
    }

    // Helper: updates MediaSession metadata and prev/next handlers for current track
    function syncMediaSessionMetadata(trackObj) {
        if (!('mediaSession' in navigator) || !audioEl) return;
        const tTitle = (trackObj && trackObj.title) || audioEl.getAttribute('data-title') || '';
        const tArtist = (trackObj && trackObj.artist) || audioEl.getAttribute('data-artist') || '';
        const tAlbum = (trackObj && trackObj.album) || audioEl.getAttribute('data-album') || '';
        const tArt = (trackObj && trackObj.artworkUrl) || audioEl.getAttribute('data-artwork') || '';
        try {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: tTitle,
                artist: tArtist,
                album: tAlbum,
                artwork: tArt ? [{ src: tArt, sizes: '512x512', type: 'image/jpeg' }] : []
            });
        } catch (e) {}
    }

    // Helper: loads a specific track from audioQueue by index and updates all player UI nodes
    function loadQueueTrack(targetIndex, autoPlay) {
        if (!audioEl || !audioQueue.length) return;
        const count = audioQueue.length;
        const normalizedIndex = ((targetIndex % count) + count) % count;
        const track = audioQueue[normalizedIndex];
        if (!track) return;

        activeQueueIndex = normalizedIndex;
        audioEl.setAttribute('data-active-index', String(normalizedIndex));
        audioEl.setAttribute('data-title', track.title || '');
        audioEl.setAttribute('data-artist', track.artist || '');
        audioEl.setAttribute('data-album', track.album || '');
        audioEl.setAttribute('data-artwork', track.artworkUrl || '');
        audioEl.setAttribute('data-listening-room-track-url', track.listeningRoomTrackUrl || '');
        audioEl.setAttribute('data-listening-room-album-url', track.listeningRoomAlbumUrl || '');
        audioEl.src = track.audioUrl || '';
        audioEl.currentTime = 0;

        if (scrubber) scrubber.value = 0;
        if (currentTimeDisplay) currentTimeDisplay.textContent = '0:00';
        if (durationDisplay) durationDisplay.textContent = track.duration || '0:00';

        // Update Eyebrow label
        const eyebrowEl = document.getElementById('narrative-audio-eyebrow');
        const playlistTitle = audioEl.getAttribute('data-playlist-title') || '';
        if (eyebrowEl) {
            if (queueMode === 'playlist') {
                eyebrowEl.textContent = 'Background Playlist • Track ' + (normalizedIndex + 1) + ' of ' + count + (playlistTitle ? ' — ' + playlistTitle : '');
            } else if (queueMode === 'album' && count > 1) {
                eyebrowEl.textContent = 'Background Album • Track ' + (normalizedIndex + 1) + ' of ' + count;
            } else {
                eyebrowEl.textContent = 'Background Audio';
            }
        }

        // Update Cover Art & Link
        const coverImg = document.getElementById('narrative-audio-cover-img');
        const coverLink = document.getElementById('narrative-audio-cover-link');
        if (coverImg && track.artworkUrl) {
            coverImg.src = track.artworkUrl;
            coverImg.alt = 'Album cover for ' + (track.album || '') + ' by ' + (track.artist || '');
        }
        if (coverLink && track.listeningRoomAlbumUrl) {
            coverLink.href = track.listeningRoomAlbumUrl;
            coverLink.title = 'Open album ' + (track.album || '') + ' in The Listening Room';
        }

        // Update Track Title, Artist, and Album Links
        const titleText = document.getElementById('narrative-audio-title-text');
        const titleLink = document.getElementById('narrative-audio-title-link');
        if (titleText) titleText.textContent = track.title || '';
        if (titleLink && track.listeningRoomTrackUrl) {
            titleLink.href = track.listeningRoomTrackUrl;
            titleLink.title = 'Listen to "' + (track.title || '') + '" in The Listening Room';
        }

        const artistLink = document.getElementById('narrative-audio-artist-link');
        if (artistLink) {
            artistLink.textContent = track.artist || '';
            if (track.listeningRoomArtistUrl) artistLink.href = track.listeningRoomArtistUrl;
            artistLink.title = 'View ' + (track.artist || '') + ' in The Listening Room';
        }

        const albumText = document.getElementById('narrative-audio-album-text');
        const albumLink = document.getElementById('narrative-audio-album-link');
        if (albumText) albumText.textContent = track.album || '';
        if (albumLink && track.listeningRoomAlbumUrl) {
            albumLink.href = track.listeningRoomAlbumUrl;
            albumLink.title = 'Open album ' + (track.album || '') + ' in The Listening Room';
        }

        // Update Lyrics Button & Dialog Footer Links
        if (lyricsBtn) {
            lyricsBtn.setAttribute('data-url', track.lyricsUrl || '');
            lyricsBtn.setAttribute('data-title', track.title || '');
        }
        const lyricsFooterMeta = document.getElementById('narrative-lyrics-footer-meta');
        if (lyricsFooterMeta) {
            lyricsFooterMeta.innerHTML = '';
            const artistSpan = document.createTextNode((track.artist || '') + ' • ');
            const albumItalic = document.createElement('i');
            albumItalic.textContent = track.album || '';
            lyricsFooterMeta.appendChild(artistSpan);
            lyricsFooterMeta.appendChild(albumItalic);
        }
        const lyricsOpenSong = document.getElementById('narrative-lyrics-open-song');
        if (lyricsOpenSong && track.listeningRoomTrackUrl) lyricsOpenSong.href = track.listeningRoomTrackUrl;
        const lyricsOpenAlbum = document.getElementById('narrative-lyrics-open-album');
        if (lyricsOpenAlbum && track.listeningRoomAlbumUrl) lyricsOpenAlbum.href = track.listeningRoomAlbumUrl;

        // Update Headphones & Listening Room CTA Buttons
        const headphonesLink = document.getElementById('narrative-audio-headphones-link');
        if (headphonesLink && track.listeningRoomTrackUrl) {
            headphonesLink.href = track.listeningRoomTrackUrl;
            headphonesLink.title = 'Open "' + (track.title || '') + '" in The Listening Room';
            headphonesLink.setAttribute('aria-label', 'Open "' + (track.title || '') + '" in The Listening Room');
        }
        const lrSongBtn = document.getElementById('narrative-audio-lr-song-btn');
        if (lrSongBtn && track.listeningRoomTrackUrl) {
            lrSongBtn.href = track.listeningRoomTrackUrl;
            lrSongBtn.title = 'Listen to "' + (track.title || '') + '" in The Listening Room';
        }
        const lrAlbumBtn = document.getElementById('narrative-audio-lr-album-btn');
        if (lrAlbumBtn && track.listeningRoomAlbumUrl) {
            lrAlbumBtn.href = track.listeningRoomAlbumUrl;
            lrAlbumBtn.title = 'Open ' + (track.album || '') + ' in The Listening Room';
        }

        // Update DSP Links if present
        const dspMap = [
            ['narrative-audio-spotify-btn', track.spotifyUrl],
            ['narrative-audio-apple-btn', track.appleUrl],
            ['narrative-audio-amazon-btn', track.amazonUrl],
            ['narrative-audio-youtube-btn', track.youtubeUrl],
            ['narrative-audio-store-std-btn', track.storeStandardUrl],
            ['narrative-audio-store-aud-btn', track.storeAudiophileUrl]
        ];
        dspMap.forEach(([id, url]) => {
            const btn = document.getElementById(id);
            if (btn && url) btn.href = url;
        });

        // Update Queue Counter & Drawer Active Row
        if (queuePosEl) {
            queuePosEl.textContent = (normalizedIndex + 1) + ' / ' + count;
        }
        if (queueDrawer) {
            const items = queueDrawer.querySelectorAll('.reader-audio-queue-item');
            items.forEach((btn, idx) => {
                const isActive = idx === normalizedIndex;
                btn.classList.toggle('is-active', isActive);
                btn.setAttribute('aria-current', isActive ? 'true' : 'false');
                btn.style.background = isActive ? 'rgba(59, 130, 246, 0.12)' : 'transparent';
                if (isActive) {
                    btn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                }
            });
        }

        syncMediaSessionMetadata(track);

        if (autoPlay) {
            audioEl.play().catch(e => console.warn(e));
        }
    }
    
    if (audioEl && playToggleBtn) {
        const startTime = parseFloat(audioEl.getAttribute('data-start-time') || 0);

        // Formats seconds into MM:SS
        function formatTime(secs) {
            if (isNaN(secs)) return '0:00';
            const m = Math.floor(secs / 60);
            const s = Math.floor(secs % 60);
            return m + ':' + (s < 10 ? '0' : '') + s;
        }
        
        playToggleBtn.addEventListener('click', () => {
            if (audioEl.paused) {
                audioEl.play().catch(e => console.warn(e));
            } else {
                audioEl.pause();
            }
        });

        if (prevBtn && audioQueue.length > 1) {
            prevBtn.addEventListener('click', () => {
                // If more than 3 seconds into the track, restart current track; otherwise go to previous track
                if (audioEl.currentTime > 3) {
                    audioEl.currentTime = 0;
                } else {
                    loadQueueTrack(activeQueueIndex - 1, !audioEl.paused || true);
                }
            });
        }

        if (nextBtn && audioQueue.length > 1) {
            nextBtn.addEventListener('click', () => {
                loadQueueTrack(activeQueueIndex + 1, !audioEl.paused || true);
            });
        }

        if (queueToggleBtn && queueDrawer) {
            queueToggleBtn.addEventListener('click', () => {
                const isHidden = queueDrawer.style.display === 'none';
                queueDrawer.style.display = isHidden ? 'block' : 'none';
                queueToggleBtn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
            });
        }

        if (queueDrawer && audioQueue.length > 1) {
            const queueButtons = queueDrawer.querySelectorAll('.reader-audio-queue-item');
            queueButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const idx = parseInt(btn.getAttribute('data-queue-index') || '0', 10);
                    loadQueueTrack(idx, true);
                });
            });
        }
        
        audioEl.addEventListener('play', () => {
            if(playIcon) {
                playIcon.classList.remove('ph-play');
                playIcon.classList.add('ph-pause');
            }
        });
        audioEl.addEventListener('pause', () => {
            if(playIcon) {
                playIcon.classList.remove('ph-pause');
                playIcon.classList.add('ph-play');
            }
        });
        
        audioEl.addEventListener('loadedmetadata', () => {
            if(scrubber) scrubber.max = audioEl.duration;
            if(durationDisplay) durationDisplay.textContent = formatTime(audioEl.duration);
            if (activeQueueIndex === 0 && startTime > 0 && audioEl.currentTime < startTime) {
                audioEl.currentTime = startTime; // Jump to specific start time if provided on first track
            }
        });
        
        // Sync scrubber UI with audio playback
        audioEl.addEventListener('timeupdate', () => {
            if (scrubber && !scrubber.matches(':active')) {
                scrubber.value = audioEl.currentTime;
                if(currentTimeDisplay) currentTimeDisplay.textContent = formatTime(audioEl.currentTime);
            }
        });

        // Handle track completion across single tracks, albums, and playlists
        audioEl.addEventListener('ended', () => {
            if (repeatMode === 'one') {
                audioEl.currentTime = 0;
                audioEl.play().catch(e => console.warn(e));
                return;
            }
            if (audioQueue.length > 1) {
                if (activeQueueIndex + 1 < audioQueue.length) {
                    loadQueueTrack(activeQueueIndex + 1, true);
                } else if (repeatMode === 'all') {
                    loadQueueTrack(0, true);
                }
            }
        });
        
        // Allow user to scrub through the audio
        if (scrubber) {
            scrubber.addEventListener('input', () => {
                if(currentTimeDisplay) currentTimeDisplay.textContent = formatTime(scrubber.value);
            });
            scrubber.addEventListener('change', () => {
                audioEl.currentTime = scrubber.value;
            });
        }

        // Automatically pause in-page background audio if the reader opens the track or album
        // in The Listening Room (music.raggiesoft.com) or an external DSP to prevent dual-stream audio collision.
        const externalAudioLinks = document.querySelectorAll('.reader-audio-external-link');
        externalAudioLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (!audioEl.paused) {
                    audioEl.pause();
                }
            });
        });
    }
    
    // -- Lyrics/Lore Data Fetcher --
    const lyricsClose = document.getElementById('narrative-lyrics-close');
    
    if (lyricsClose && lyricsDialog) {
        lyricsClose.addEventListener('click', () => {
            lyricsDialog.close();
        });
    }
    
    if (lyricsBtn && lyricsDialog) {
        lyricsBtn.addEventListener('click', () => {
            const title = lyricsBtn.getAttribute('data-title');
            const url = lyricsBtn.getAttribute('data-url');
            
            if(lyricsTitle) lyricsTitle.textContent = title;
            if(lyricsContent) lyricsContent.innerHTML = '<div style="text-align: center; padding: 1rem; opacity: 0.7;">Retrieving data from the Vault...</div>';
            lyricsDialog.showModal();
            
            // Fetch raw markdown/text file
            fetch(url + "?v=" + Date.now())
                .then(res => {
                    if (!res.ok) throw new Error("Lore file not found.");
                    return res.text();
                })
                .then(text => {
                    // Simple Markdown parser for headers and bold/italic text
                    let rawBlocks = text.split(/\n\s*\n/);
                    let htmlOutput = rawBlocks.map(block => {
                        if (block.trim() === '') return '';
                        let lines = block.split('\n');
                        let headerHtml = '';
                        let contentLines = [];
                        
                        lines.forEach(line => {
                            line = line.trim();
                            if (line === '') return;
                            
                            if (line.match(/^#+\s+/)) {
                                let headerLevel = line.match(/^#+/)[0].length;
                                let headerText = line.replace(/^#+\s+/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                                if (headerLevel === 1) return; // Skip H1 as it's usually the title
                                let hClass = (headerLevel === 3 && line.includes('LORE NOTE:')) 
                                    ? 'style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; color: var(--rs-primary); letter-spacing: 1px; margin-bottom: 0.5rem;"' 
                                    : 'style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;"';
                                headerHtml += `<div ${hClass}>${headerText}</div>`;
                            } else {
                                contentLines.push(line);
                            }
                        });
                        
                        let processedBody = contentLines.map(line => {
                            let parsedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                            parsedLine = parsedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
                            parsedLine = parsedLine.replace(/~~(.*?)~~/g, '<del>$1</del>');
                            return parsedLine;
                        });
                        
                        if (contentLines.length === 0) return `<div style="margin-bottom: 1.5rem;">${headerHtml}</div>`;
                        
                        return `
                            <div style="margin-bottom: 1.5rem;">
                                ${headerHtml}
                                <div style="line-height: 1.6;">${processedBody.join('<br>')}</div>
                            </div>`;
                    }).join('');
                    
                    if(lyricsContent) lyricsContent.innerHTML = htmlOutput;
                })
                .catch(err => {
                    if(lyricsContent) lyricsContent.innerHTML = '<div style="color: #dc3545; padding: 1rem; border: 1px solid #dc3545; border-radius: 6px; background: rgba(220,53,69,0.1);">Data Corrupted. Unable to retrieve lyrics.</div>';
                });
        });
    }
    
    // -- OS MediaSession Integration & Autoplay --
    if (audioEl) {
        if ('mediaSession' in navigator) {
            syncMediaSessionMetadata(audioQueue[activeQueueIndex] || null);
            navigator.mediaSession.setActionHandler('play', () => audioEl.play());
            navigator.mediaSession.setActionHandler('pause', () => audioEl.pause());
            if (audioQueue.length > 1) {
                try {
                    navigator.mediaSession.setActionHandler('previoustrack', () => {
                        loadQueueTrack(activeQueueIndex - 1, true);
                    });
                    navigator.mediaSession.setActionHandler('nexttrack', () => {
                        loadQueueTrack(activeQueueIndex + 1, true);
                    });
                } catch (e) {}
            }
        }
        
        const lsSettings = localStorage.getItem('reader-settings');
        if (lsSettings) {
            try {
                const parsed = JSON.parse(lsSettings);
                // Attempt autoplay if user has it enabled in settings
                if (parsed.autoPlayAudio === 'true') {
                    audioEl.play().catch(err => {
                        console.warn("Autoplay blocked by browser. User must interact first.", err);
                    });
                }
            } catch(e) {}
        }
    }

    if (audioEl && loopBtn) {
        const icon = loopBtn.querySelector('i');
        const applyRepeatUI = () => {
            if (repeatMode === 'all') {
                audioEl.loop = false;
                if (icon) {
                    icon.classList.remove('ph-repeat-once');
                    icon.classList.add('ph-repeat');
                }
                loopBtn.style.borderColor = 'var(--rs-primary)';
                loopBtn.style.color = 'var(--rs-primary)';
                loopBtn.style.background = 'rgba(0,0,0,0.05)';
                loopBtn.setAttribute('title', 'Repeat All Tracks: ON');
                loopBtn.setAttribute('aria-label', 'Toggle Repeat: All Tracks');
            } else if (repeatMode === 'one') {
                audioEl.loop = (audioQueue.length <= 1);
                if (icon) {
                    icon.classList.remove('ph-repeat');
                    icon.classList.add('ph-repeat-once');
                }
                loopBtn.style.borderColor = 'var(--rs-primary)';
                loopBtn.style.color = 'var(--rs-primary)';
                loopBtn.style.background = 'rgba(0,0,0,0.05)';
                loopBtn.setAttribute('title', 'Repeat 1 Track: ON');
                loopBtn.setAttribute('aria-label', 'Toggle Repeat: 1 Track');
            } else {
                audioEl.loop = false;
                if (icon) {
                    icon.classList.remove('ph-repeat-once');
                    icon.classList.add('ph-repeat');
                }
                loopBtn.style.borderColor = 'var(--rs-border)';
                loopBtn.style.color = 'inherit';
                loopBtn.style.background = 'transparent';
                loopBtn.setAttribute('title', 'Repeat: OFF');
                loopBtn.setAttribute('aria-label', 'Toggle Repeat: OFF');
            }
            audioEl.setAttribute('data-repeat-mode', repeatMode);
        };

        applyRepeatUI();

        loopBtn.addEventListener('click', () => {
            if (audioQueue.length > 1) {
                if (repeatMode === 'all') repeatMode = 'one';
                else if (repeatMode === 'one') repeatMode = 'off';
                else repeatMode = 'all';
            } else {
                repeatMode = (repeatMode === 'one') ? 'off' : 'one';
            }
            applyRepeatUI();
        });
    }


    // ==========================================
    // 4. BOOKMARK SYSTEM
    // ==========================================
    // Saves the current URL to an array in localStorage.
    const bookmarkBtn = document.getElementById('reader-bookmark-btn');
    if (bookmarkBtn) {
        bookmarkBtn.addEventListener('click', () => {
            const currentUrl = window.location.pathname;
            let title = document.title;
            // Clean up title (remove site name)
            if (title.includes('|')) title = title.split('|')[0].trim();
            
            // Extract series slug from URL (e.g. /alex-chloe/book-1/chapter-1)
            const parts = currentUrl.split('/').filter(p => p.length > 0);
            const series = parts.length > 0 ? parts[0] : 'unknown';

            let bookmarks = [];
            try {
                bookmarks = JSON.parse(localStorage.getItem('rs-bookmarks')) || [];
            } catch (e) {
                bookmarks = [];
            }
            
            // Check if already bookmarked
            const existingIndex = bookmarks.findIndex(b => b.url === currentUrl);
            if (existingIndex > -1) {
                // Remove bookmark
                bookmarks.splice(existingIndex, 1);
                bookmarkBtn.innerHTML = '<i class="ph ph-bookmark"></i> Bookmark';
                bookmarkBtn.style.opacity = '1';
            } else {
                // Add bookmark
                bookmarks.push({ url: currentUrl, title: title, series: series, date: Date.now() });
                bookmarkBtn.innerHTML = '<i class="ph-fill ph-bookmark"></i> Bookmarked';
                bookmarkBtn.style.opacity = '0.8';
            }
            localStorage.setItem('rs-bookmarks', JSON.stringify(bookmarks));
        });

        // Initialize state of the button on page load
        let bookmarks = [];
        try { bookmarks = JSON.parse(localStorage.getItem('rs-bookmarks')) || []; } catch (e) {}
        if (bookmarks.some(b => b.url === window.location.pathname)) {
            bookmarkBtn.innerHTML = '<i class="ph-fill ph-bookmark"></i> Bookmarked';
            bookmarkBtn.style.opacity = '0.8';
        }
    }

    // ==========================================
    // 5. READER SETTINGS & THEME ENGINE
    // ==========================================
    const FONT_MAP = {
        'system': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        'georgia': 'Georgia, "Times New Roman", Times, serif',
        'lora': '"Lora", Georgia, serif',
        'inter': '"Inter", system-ui, -apple-system, sans-serif',
        'atkinson': '"Atkinson Hyperlegible", system-ui, -apple-system, sans-serif',
        'opendyslexic': '"OpenDyslexic", "Comic Sans MS", sans-serif'
    };

    function normalizeFontKey(raw) {
        if (!raw || typeof raw !== 'string') return 'system';
        const ff = raw.toLowerCase().trim();
        if (FONT_MAP[ff]) return ff;
        if (ff.includes('opendyslexic')) return 'opendyslexic';
        if (ff.includes('atkinson')) return 'atkinson';
        if (ff.includes('inter')) return 'inter';
        if (ff.includes('lora')) return 'lora';
        if (ff.includes('georgia')) return 'georgia';
        return 'system';
    }

    window.RS_FONT_MAP = FONT_MAP;
    window.rsNormalizeFontKey = normalizeFontKey;

    const dialog = document.getElementById('reader-settings-dialog');
    const btnOpen = document.getElementById('reader-settings-toggle');
    const btnClose = document.getElementById('close-settings-btn');
    
    const contentBody = document.querySelector('.story-content');
    const themeSelect = document.getElementById('reader-theme-select');
    const widthSelect = document.getElementById('reader-width-select');
    const fontSelect = document.getElementById('reader-font-select');
    const audioSelect = document.getElementById('reader-audio-select');
    const customThemeToggle = document.getElementById('reader-custom-theme-toggle');
    const readerPage = document.querySelector('.reader-page');
    const btnResetAll = document.getElementById('reader-settings-reset-all');
    const btnRunWizard = document.getElementById('reader-run-wizard-btn');
    const tabBtns = document.querySelectorAll('.settings-tab');
    const tabContents = document.querySelectorAll('.settings-tab-content');
    
    // Handles tab switching inside the settings modal
    if (tabBtns) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => { e.preventDefault();
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.style.display = 'none');
                btn.classList.add('active');
                document.getElementById('settings-tab-' + btn.dataset.tab).style.display = 'block';
            });
        });
    }
    
    const btnIncrease = document.getElementById('btn-text-increase');
    const btnDecrease = document.getElementById('btn-text-decrease');
    const btnReset = document.getElementById('btn-text-reset');

    let currentTheme = 'auto';
    let currentFontSize = 1.15; 
    let currentWidth = 'default';
    let currentFontFamily = 'system';
    let currentAutoPlayAudio = 'false';
    let currentCustomThemeEnabled = true;
    let currentShowOfflineCta = true;
    let currentLineHeight = localStorage.getItem('rs-line-height') || '1.8';

    function applyFontSize(size, persist = true) {
        const parsed = parseFloat(size);
        currentFontSize = !isNaN(parsed) ? Math.round(parsed * 100) / 100 : 1.15;
        document.documentElement.style.setProperty('--rs-font-size', `${currentFontSize}rem`);
        if (contentBody) contentBody.style.fontSize = `${currentFontSize}rem`;
        if (persist) saveSettings();
    }

    function applyLineHeight(lh, persist = true) {
        currentLineHeight = lh ? String(lh) : '1.8';
        document.documentElement.style.setProperty('--rs-line-height', currentLineHeight);
        if (contentBody) contentBody.style.lineHeight = currentLineHeight;
        if (persist) {
            localStorage.setItem('rs-line-height', currentLineHeight);
        }
    }

    if (btnIncrease) btnIncrease.addEventListener('click', () => applyFontSize(Math.min(currentFontSize + 0.1, 2.5), true));
    if (btnDecrease) btnDecrease.addEventListener('click', () => applyFontSize(Math.max(currentFontSize - 0.1, 0.8), true));
    if (btnReset) btnReset.addEventListener('click', () => applyFontSize(1.15, true));

    // Core Theme Application Logic
    // Strips old themes and applies the new base theme, then layers the custom narrative theme if enabled.
    function applyTheme(theme, customEnabled = true, persist = true) {
        currentTheme = theme || 'auto';
        currentCustomThemeEnabled = (customEnabled !== false);
        if (customThemeToggle) customThemeToggle.checked = currentCustomThemeEnabled;
        const wizCustomTheme = document.getElementById('wizard-custom-theme-toggle');
        if (wizCustomTheme) wizCustomTheme.checked = currentCustomThemeEnabled;
        
        // Strip base themes and any previously active custom narrative theme
        const systemClassesToKeep = new Set(['theme-oceanview', 'theme-raggiesoft-books']);
        Array.from(document.body.classList).forEach(cls => {
            if ((cls.startsWith('theme-') || cls.startsWith('narrative-theme-')) && !systemClassesToKeep.has(cls)) {
                document.body.classList.remove(cls);
            }
        });

        const customThemeMeta = document.querySelector('meta[name="stardust-narrative-theme"]');
        const narrativeTheme = customThemeMeta ? customThemeMeta.getAttribute('content') : null;
        const customThemeLink = document.getElementById('narrative-theme-css');

        // ALWAYS apply the base theme class (e.g. theme-auto, theme-dark) as a fallback
        document.body.classList.add(`theme-${currentTheme}`);

        // Re-apply custom narrative theme if author defined it AND user wants it
        if (currentCustomThemeEnabled && narrativeTheme && narrativeTheme.trim() !== '') {
            document.body.classList.add('theme-custom');
            document.body.classList.add(`theme-${narrativeTheme}`);
            if (customThemeLink) {
                const rawHref = customThemeLink.getAttribute('href') || '';
                if (rawHref) {
                    const baseHref = rawHref.split('?')[0];
                    customThemeLink.setAttribute('href', baseHref + '?v=20261026c');
                }
                customThemeLink.removeAttribute('disabled');
                customThemeLink.disabled = false;
            }
        } else {
            if (customThemeLink) {
                customThemeLink.disabled = true;
                customThemeLink.setAttribute('disabled', '');
            }
        }
        
        if (themeSelect) themeSelect.value = currentTheme;
        if (persist) saveSettings();
    }

    window.applyReaderTheme = applyTheme;

    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => applyTheme(e.target.value, currentCustomThemeEnabled, true));
    }
    if (customThemeToggle) {
        customThemeToggle.addEventListener('change', (e) => applyTheme(themeSelect ? themeSelect.value : currentTheme, e.target.checked, true));
    }

    function applyWidth(width, persist = true) {
        currentWidth = width || 'default';
        if (readerPage) {
            if (currentWidth === 'wide') {
                readerPage.style.maxWidth = '1200px';
            } else if (currentWidth === 'full') {
                readerPage.style.maxWidth = '100%';
            } else {
                readerPage.style.maxWidth = '800px';
            }
        }
        if (widthSelect) widthSelect.value = currentWidth;
        if (persist) saveSettings();
    }
    
    if (widthSelect) widthSelect.addEventListener('change', (e) => applyWidth(e.target.value, true));

    function applyFontFamily(font, persist = true) {
        const fontKey = normalizeFontKey(font);
        const resolvedStack = FONT_MAP[fontKey] || FONT_MAP['system'];
        currentFontFamily = fontKey;
        document.documentElement.style.setProperty('--rs-font-family', resolvedStack);
        document.body.style.fontFamily = resolvedStack;
        if (contentBody) contentBody.style.fontFamily = resolvedStack;
        if (fontSelect) fontSelect.value = fontKey;
        if (persist) saveSettings();
    }

    if (fontSelect) fontSelect.addEventListener('change', (e) => applyFontFamily(e.target.value, true));

    function applyAudioSetting(val, persist = true) {
        currentAutoPlayAudio = (val === true || val === 'true') ? 'true' : 'false';
        if (audioSelect) audioSelect.value = currentAutoPlayAudio;
        if (persist) saveSettings();
    }
    if (audioSelect) audioSelect.addEventListener('change', (e) => applyAudioSetting(e.target.value, true));

    // Controls visibility of the "Take this Story Offline" E-Book CTA Card at the bottom of scenes
    function applyOfflineCtaSetting(val, persist = true) {
        currentShowOfflineCta = (val !== false && val !== 'false');
        const offlineCard = document.getElementById('rs-offline-cta-card');
        if (offlineCard) {
            offlineCard.style.display = currentShowOfflineCta ? 'block' : 'none';
        }
        const settingsOfflineCheckbox = document.getElementById('rs-settings-offline-cta');
        if (settingsOfflineCheckbox) {
            settingsOfflineCheckbox.checked = currentShowOfflineCta;
        }
        if (persist) saveSettings();
    }
    window.applyOfflineCtaSetting = applyOfflineCtaSetting;

    const btnDismissOfflineCta = document.getElementById('rs-dismiss-offline-cta');
    if (btnDismissOfflineCta) {
        btnDismissOfflineCta.addEventListener('click', () => {
            applyOfflineCtaSetting(false, true);
            if (typeof showShortcutToast === 'function') {
                showShortcutToast('Offline download card hidden (re-enable in Settings)');
            }
        });
    }
    
    if (btnResetAll) {
        btnResetAll.addEventListener('click', () => {
            applyFontSize(1.15, true);
            applyLineHeight('1.8', true);
            applyTheme('auto', true, true);
            applyWidth('default', true);
            applyFontFamily('system', true);
            applyAudioSetting('false', true);
            applyOfflineCtaSetting(true, true);
            if (dialog) dialog.close();
        });
    }

    // Persist to local storage without clobbering translationMode or other properties
    function saveSettings() {
        let existing = {};
        try {
            const raw = localStorage.getItem('reader-settings');
            if (raw) existing = JSON.parse(raw) || {};
        } catch (e) {}
        const updated = Object.assign({}, existing, {
            theme: currentTheme,
            customThemeEnabled: currentCustomThemeEnabled,
            fontSize: currentFontSize,
            width: currentWidth,
            fontFamily: normalizeFontKey(currentFontFamily),
            autoPlayAudio: currentAutoPlayAudio,
            showOfflineCta: currentShowOfflineCta
        });
        localStorage.setItem('reader-settings', JSON.stringify(updated));
    }

    // Load Settings from LocalStorage (read-only application during initialization)
    try {
        const stored = localStorage.getItem('reader-settings');
        const storedLh = localStorage.getItem('rs-line-height') || '1.8';
        applyLineHeight(storedLh, false);
        if (stored) {
            const settings = JSON.parse(stored);
            const normalizedFont = normalizeFontKey(settings.fontFamily);
            applyTheme(settings.theme || 'auto', settings.customThemeEnabled !== false, false);
            applyFontSize(settings.fontSize || 1.15, false);
            applyWidth(settings.width || 'default', false);
            applyFontFamily(normalizedFont, false);
            applyAudioSetting(settings.autoPlayAudio || 'false', false);
            applyOfflineCtaSetting(settings.showOfflineCta !== false, false);
            // If legacy CSS font string was stored, normalize it cleanly in storage
            if (settings.fontFamily !== normalizedFont) {
                saveSettings();
            }
        } else {
            applyTheme('auto', true, false);
            applyFontSize(1.15, false);
            applyWidth('default', false);
            applyFontFamily('system', false);
            applyAudioSetting('false', false);
            applyOfflineCtaSetting(true, false);
        }
    } catch (e) {
        applyTheme('auto', true, false);
        applyFontSize(1.15, false);
        applyWidth('default', false);
        applyFontFamily('system', false);
        applyAudioSetting('false', false);
        applyOfflineCtaSetting(true, false);
    }

    // ==========================================
    // 6. ONBOARDING WIZARD
    // ==========================================
    const wizardDialog = document.getElementById('reader-wizard-dialog');
    const hasCompletedWizard = localStorage.getItem('rs-wizard-completed');

    // Show wizard on first settings click, else show normal settings dialog
    if (btnOpen) {
        btnOpen.addEventListener('click', () => {
            if (localStorage.getItem('rs-wizard-completed')) {
                if (dialog) dialog.showModal();
            } else {
                if (wizardDialog) {
                    wizardDialog.showModal();
                    updateWizardState();
                }
            }
        });
    }
    if (btnClose && dialog) btnClose.addEventListener('click', () => dialog.close());

    let currentStep = 1;
    const totalSteps = 6;
    const wizardSidebar = document.getElementById('wizard-sidebar-graphic');
    const btnNext = document.getElementById('wizard-btn-next');
    const btnPrev = document.getElementById('wizard-btn-prev');
    const btnFinish = document.getElementById('wizard-btn-finish');
    
    // Global hook for the "Run Wizard Again" button inside normal settings
    window.runWelcomeWizard = function() {
        localStorage.removeItem('rs-wizard-completed');
        if (dialog && dialog.open) dialog.close();
        currentStep = 1;
        if (wizardDialog) {
            wizardDialog.showModal();
            updateWizardState();
        }
    };
    
    // Sync wizard inputs with settings inputs
    const wizTheme = document.getElementById('wizard-theme-select');
    const wizWidth = document.getElementById('wizard-width-select');
    const wizFont = document.getElementById('wizard-font-select');
    const wizAudio = document.getElementById('wizard-audio-select');
    const wizCustomTheme = document.getElementById('wizard-custom-theme-toggle');
    
    if (wizTheme) wizTheme.value = currentTheme || 'auto';
    if (wizWidth) wizWidth.value = currentWidth || 'default';
    if (wizFont) wizFont.value = normalizeFontKey(currentFontFamily);
    if (wizAudio) wizAudio.value = currentAutoPlayAudio || 'false';
    if (wizCustomTheme) wizCustomTheme.checked = currentCustomThemeEnabled;

    if (wizTheme) wizTheme.addEventListener('change', (e) => applyTheme(e.target.value, currentCustomThemeEnabled, true));
    if (wizWidth) wizWidth.addEventListener('change', (e) => applyWidth(e.target.value, true));
    if (wizFont) wizFont.addEventListener('change', (e) => applyFontFamily(e.target.value, true));
    if (wizAudio) wizAudio.addEventListener('change', (e) => applyAudioSetting(e.target.value, true));
    if (wizCustomTheme) wizCustomTheme.addEventListener('change', (e) => applyTheme(wizTheme ? wizTheme.value : currentTheme, e.target.checked, true));

    function updateWizardState() {
        for(let i = 1; i <= totalSteps; i++) {
            const stepEl = document.getElementById('wizard-step-' + i);
            if (stepEl) stepEl.style.display = 'none';
        }
        const currentEl = document.getElementById('wizard-step-' + currentStep);
        if (currentEl) currentEl.style.display = 'block';
        
        let cdnUrl = '';
        if (wizardDialog) cdnUrl = wizardDialog.getAttribute('data-cdn-url');
        // Update the decorative sidebar image based on step
        const stepImages = {
            1: cdnUrl + '/raggiesoft-books/library/images/wizard/isabel_oliver_hug.jpg',
            2: cdnUrl + '/raggiesoft-books/library/images/wizard/eleanor_oliver_hug.jpg',
            3: cdnUrl + '/raggiesoft-books/library/images/wizard/sophia_oliver_hug.jpg',
            4: cdnUrl + '/raggiesoft-books/library/images/wizard/sophia_isabel_audio.jpg',
            5: cdnUrl + '/raggiesoft-books/library/images/wizard/eleanor_isabel_twins.jpg',
            6: cdnUrl + '/raggiesoft-books/library/images/wizard/isabel_oliver_hug.jpg'
        };

        if (wizardSidebar && stepImages[currentStep]) {
            wizardSidebar.style.backgroundImage = `url('${stepImages[currentStep]}')`;
        }

        if (btnPrev) btnPrev.style.visibility = currentStep > 1 ? 'visible' : 'hidden';
        
        if (currentStep === totalSteps) {
            if (btnNext) btnNext.style.display = 'none';
            if (btnFinish) btnFinish.style.display = 'block';
        } else {
            if (btnNext) btnNext.style.display = 'block';
            if (btnFinish) btnFinish.style.display = 'none';
        }
    }

    if (btnNext) {
        btnNext.addEventListener('click', () => {
            if (currentStep < totalSteps) {
                currentStep++;
                updateWizardState();
            }
        });
    }

    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateWizardState();
            }
        });
    }

    if (btnFinish) {
        btnFinish.addEventListener('click', () => {
            localStorage.setItem('rs-wizard-completed', 'true');
            window.location.href = "/";
        });
    }

    // ==========================================
    // 7. DEVELOPER THEME TESTER (Easter Egg)
    // ==========================================
    // 5 clicks on the Settings Title opens a secret theme injection tool.
    const readerTitle = document.getElementById('reader-settings-title');
    const devTesterDialog = document.getElementById('dev-theme-tester-dialog');
    const btnCloseDevTester = document.getElementById('close-dev-tester-btn');
    
    if (readerTitle && devTesterDialog) {
        let clickCount = 0;
        let clickTimer = null;
        
        readerTitle.addEventListener('click', () => {
            clickCount++;
            if (clickCount >= 5) {
                if (dialog) dialog.close();
                devTesterDialog.showModal();
                clickCount = 0;
            }
            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => { clickCount = 0; }, 2000);
        });
        
        const revertTheme = () => {
            devTesterDialog.close();
            let meta = document.querySelector('meta[name="stardust-narrative-theme"]');
            if (meta) meta.remove();
            let link = document.getElementById('narrative-theme-css');
            if (link) link.remove();
            applyTheme(themeSelect ? themeSelect.value : 'auto', customToggle ? customToggle.checked : true);
        };
        
        if (btnCloseDevTester) btnCloseDevTester.addEventListener('click', revertTheme);
        devTesterDialog.addEventListener('close', revertTheme);
    }
    
    const devThemeInput = document.getElementById('dev-theme-select');
    const devThemeApply = document.getElementById('dev-theme-apply');
    const devThemeForceMode = document.getElementById('dev-theme-force-mode');
    
    if (devThemeApply && devThemeInput && devThemeForceMode) {
        devThemeInput.addEventListener('change', () => {
            const selectedOption = devThemeInput.options[devThemeInput.selectedIndex];
            // Disable mode switching for themes that enforce a single state (like 'Night' or 'Stadium')
            if (selectedOption && selectedOption.dataset.supportsModes === 'false') {
                devThemeForceMode.disabled = true;
                devThemeForceMode.value = 'auto';
                devThemeForceMode.title = "This theme has a fixed aesthetic and does not support toggling light/dark modes.";
                devThemeForceMode.style.opacity = '0.5';
            } else {
                devThemeForceMode.disabled = false;
                devThemeForceMode.title = "";
                devThemeForceMode.style.opacity = '1';
            }
        });

        devThemeApply.addEventListener('click', () => {
            const themeName = devThemeInput.value.trim();
            if (themeName) {
                let meta = document.querySelector('meta[name="stardust-narrative-theme"]');
                if (!meta) {
                    meta = document.createElement('meta');
                    meta.name = 'stardust-narrative-theme';
                    document.head.appendChild(meta);
                }
                meta.setAttribute('content', themeName);
                
                // Inject the stylesheet dynamically
                let link = document.getElementById('narrative-theme-css');
                if (!link) {
                    link = document.createElement('link');
                    link.id = 'narrative-theme-css';
                    link.rel = 'stylesheet';
                    document.head.appendChild(link);
                }
                let cdnUrl = '';
                if (devTesterDialog) cdnUrl = devTesterDialog.getAttribute('data-cdn-url');
                link.href = cdnUrl + '/raggiesoft-books/css/themes/' + themeName + '.css';
                
                setTimeout(() => {
                    applyTheme(themeSelect ? themeSelect.value : 'auto', customThemeToggle ? customThemeToggle.checked : true);
                    
                    if (devThemeForceMode.value === 'light') {
                        document.body.classList.add('theme-light');
                        document.body.classList.remove('theme-dark', 'theme-auto');
                    } else if (devThemeForceMode.value === 'dark') {
                        document.body.classList.add('theme-dark');
                        document.body.classList.remove('theme-light', 'theme-auto');
                    } else {
                        document.body.classList.remove('theme-light', 'theme-dark');
                    }
                }, 50);
            }
        });
    }

    // ==========================================
    // 8. LIBRARY MANAGEMENT (Offline & Hiding)
    // ==========================================
    const libraryList = document.getElementById('library-management-list');
    
    // Always apply hidden books to the catalog if cards exist
    const applyHiddenBooks = () => {
        let hiddenBooks = [];
        try {
            hiddenBooks = JSON.parse(localStorage.getItem('rs-hidden-books') || '[]');
        } catch(e) {}
        
        const cards = document.querySelectorAll('.rs-book-card');
        cards.forEach(card => {
            if (hiddenBooks.includes(card.dataset.slug)) {
                card.style.display = 'none';
            } else {
                card.style.display = 'flex';
            }
        });
    };
    
    // Call it immediately so books hide on catalog load
    applyHiddenBooks();

    // Fetches the TOC and aggressively prefetches every part of the book
    // so the Service Worker can cache it.
    async function downloadBookForOffline(slug) {
        const cdnBase = document.body.dataset.cdnUrl || 'https://assets.raggiesoft.com';
        try {
            console.log('Downloading book for offline: ' + slug);
            const res = await fetch(`${cdnBase}/raggiesoft-books/books/${slug}/toc.json`);
            if (!res.ok) return;
            const toc = await res.json();
            
            let files = [
                `${cdnBase}/raggiesoft-books/images/covers/2x3/${slug}.jpg`,
                `${cdnBase}/raggiesoft-books/books/${slug}/__SERIES_LANDING__`,
                `${cdnBase}/raggiesoft-books/books/${slug}/__TOC__`
            ];
            
            if (toc.books) {
                toc.books.forEach(b => {
                    files.push(`${cdnBase}/raggiesoft-books/books/${slug}/${b.id}/__BOOK_TOC__|${b.id}`);
                    if (b.chapters) {
                        b.chapters.forEach(c => {
                            files.push(`${cdnBase}/raggiesoft-books/books/${slug}/${b.id}/${c.id}/__CHAP_TOC__|${b.id}|${c.id}`);
                            if (c.parts) {
                                c.parts.forEach(p => {
                                    files.push(`${cdnBase}/raggiesoft-books/books/${slug}/${b.id}/${c.id}/${p.file}`);
                                });
                            }
                        });
                    }
                });
            }
            
            // Prefetch each file, allowing SW to cache it
            for (let url of files) {
                fetch(url, { mode: 'cors' }).catch(e => console.log('Offline fetch error:', e));
            }
        } catch(e) {
            console.error('Failed to download book for offline:', e);
        }
    }

    // Connects to the Cache API directly to purge stored books
    async function removeBookFromOffline(slug) {
        try {
            console.log('Removing book from offline cache: ' + slug);
            const cacheKeys = ['ova-dynamic-v4', 'ova-images-v4'];
            for (let cName of cacheKeys) {
                const cache = await caches.open(cName);
                const reqs = await cache.keys();
                for (let req of reqs) {
                    if (req.url.includes(`/books/${slug}/`) || req.url.includes(`covers/2x3/${slug}.jpg`)) {
                        await cache.delete(req);
                    }
                }
            }
        } catch(e) {
            console.error('Failed to remove book from cache:', e);
        }
    }

    if (libraryList) {
        // Populate the Library Management list (only once)
        if (libraryList.children.length === 0) {
            const cdnBase = document.body.dataset.cdnUrl || 'https://assets.raggiesoft.com';
            fetch(`${cdnBase}/raggiesoft-books/books/catalog.json`)
                .then(res => res.json())
                .then(books => {
                    let hiddenBooks = [];
                    try { hiddenBooks = JSON.parse(localStorage.getItem('rs-hidden-books') || '[]'); } catch(e) {}
                    
                    books.forEach(book => {
                        const isHidden = hiddenBooks.includes(book.slug);
                        
                        // Construct the list item UI
                        const item = document.createElement('div');
                        item.style = 'display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--rs-surface); border: 1px solid var(--rs-border); border-radius: 8px;';
                        
                        const titleDiv = document.createElement('div');
                        titleDiv.style = 'font-weight: 600; color: var(--rs-heading); font-size: 0.95rem;';
                        titleDiv.textContent = book.title;
                        
                        // Create a custom toggle switch
                        const label = document.createElement('label');
                        label.style = 'position: relative; display: inline-block; width: 44px; height: 24px; cursor: pointer;';
                        
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.checked = !isHidden;
                        checkbox.style = 'opacity: 0; width: 0; height: 0;';
                        
                        const slider = document.createElement('span');
                        slider.style = 'position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--rs-border); transition: .4s; border-radius: 24px;';
                        
                        const knob = document.createElement('span');
                        knob.style = 'position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%;';
                        
                        const updateSwitchUI = () => {
                            if (checkbox.checked) {
                                slider.style.backgroundColor = 'var(--rs-primary)';
                                knob.style.transform = 'translateX(20px)';
                            } else {
                                slider.style.backgroundColor = 'var(--rs-border)';
                                knob.style.transform = 'translateX(0)';
                            }
                        };
                        updateSwitchUI();
                        
                        // Handle toggling visibility and offline cache
                        checkbox.addEventListener('change', async (e) => {
                            updateSwitchUI();
                            let currentHidden = [];
                            try { currentHidden = JSON.parse(localStorage.getItem('rs-hidden-books') || '[]'); } catch(e) {}
                            
                            if (!e.target.checked) {
                                // Book is being hidden
                                if (!currentHidden.includes(book.slug)) currentHidden.push(book.slug);
                                await removeBookFromOffline(book.slug);
                            } else {
                                // Book is being shown
                                currentHidden = currentHidden.filter(s => s !== book.slug);
                                await downloadBookForOffline(book.slug);
                            }
                            localStorage.setItem('rs-hidden-books', JSON.stringify(currentHidden));
                            applyHiddenBooks();
                        });
                        
                        slider.appendChild(knob);
                        label.appendChild(checkbox);
                        label.appendChild(slider);
                        
                        item.appendChild(titleDiv);
                        item.appendChild(label);
                        libraryList.appendChild(item);
                    });
                })
                .catch(err => console.error("Could not load catalog for management", err));
        }
    }

    // ==========================================
    // 9. KEYBOARD SHORTCUTS
    // ==========================================
    // Renders a temporary toast notification at the bottom of the screen
    function showShortcutToast(msg) {
        let toast = document.getElementById('shortcut-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'shortcut-toast';
            toast.style.position = 'fixed';
            toast.style.bottom = '2rem';
            toast.style.left = '50%';
            toast.style.transform = 'translateX(-50%)';
            toast.style.backgroundColor = 'var(--rs-primary)';
            toast.style.color = '#fff';
            toast.style.padding = '0.5rem 1rem';
            toast.style.borderRadius = '30px';
            toast.style.fontWeight = '600';
            toast.style.fontSize = '0.9rem';
            toast.style.zIndex = '9999';
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.2s';
            toast.style.pointerEvents = 'none';
            toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.style.opacity = '1';
        
        if (toast.hideTimeout) clearTimeout(toast.hideTimeout);
        toast.hideTimeout = setTimeout(() => {
            toast.style.opacity = '0';
        }, 1500);
    }

    if (!window.oceanViewKeydownBound) {
        window.oceanViewKeydownBound = true;
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in an input field
            const active = document.activeElement;
            if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT' || active.isContentEditable)) {
                return;
            }

            // Ignore if modifier keys are pressed (let OS handle them)
            if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
                return;
            }

            // T: Toggle Theme
            // Cycles through available core themes, respecting if a custom narrative theme exists
            if (e.key.toLowerCase() === 't') {
                e.preventDefault();
                const customThemeMeta = document.querySelector('meta[name="stardust-narrative-theme"]');
                const hasCustom = customThemeMeta !== null;
                
                let activeTheme = 'auto';
                let customOn = true;
                try {
                    const stored = JSON.parse(localStorage.getItem('reader-settings') || '{}');
                    if (stored.theme) activeTheme = stored.theme;
                    if (stored.customThemeEnabled !== undefined) customOn = (stored.customThemeEnabled !== false);
                } catch (err) {}
                
                // Define the sequence of states: {theme: '...', custom: boolean, label: '...'}
                let sequence = [];
                if (hasCustom) {
                    sequence.push({theme: 'auto', custom: true, label: 'Immersive Story Theme'});
                }
                sequence.push({theme: 'auto', custom: false, label: 'System Default Theme'});
                sequence.push({theme: 'sepia-system', custom: false, label: 'System Sepia Theme'});
                sequence.push({theme: 'light', custom: false, label: 'Light Mode'});
                sequence.push({theme: 'dark', custom: false, label: 'Dark Mode'});
                sequence.push({theme: 'sepia', custom: false, label: 'Sepia Mode'});
                sequence.push({theme: 'dark-sepia', custom: false, label: 'Dark Sepia Mode'});
                
                // Find current index
                let currentIndex = sequence.findIndex(s => s.theme === activeTheme && s.custom === customOn);
                if (currentIndex === -1) currentIndex = 0; // Fallback
                
                let nextIndex = (currentIndex + 1) % sequence.length;
                let nextState = sequence[nextIndex];
                
                if (typeof window.applyReaderTheme === 'function') {
                    window.applyReaderTheme(nextState.theme, nextState.custom, true);
                }
                const settingsThemeSelect = document.getElementById('rs-settings-theme');
                if (settingsThemeSelect) settingsThemeSelect.value = nextState.theme;
                const settingsNarrativeCheckbox = document.getElementById('rs-settings-narrative-themes');
                if (settingsNarrativeCheckbox) settingsNarrativeCheckbox.checked = nextState.custom;
                showShortcutToast(nextState.label);
            }

            // N or Right Arrow: Next Chapter
            if (e.key.toLowerCase() === 'n' || e.key === 'ArrowRight') {
                const nextBtn = document.getElementById('reader-btn-next');
                if (nextBtn && nextBtn.tagName === 'A' && nextBtn.href) {
                    showShortcutToast("Next Chapter \u2192");
                    nextBtn.click();
                }
            }

            // P or Left Arrow: Previous Chapter
            if (e.key.toLowerCase() === 'p' || e.key === 'ArrowLeft') {
                const prevBtn = document.getElementById('reader-btn-prev');
                if (prevBtn && prevBtn.tagName === 'A' && prevBtn.href) {
                    showShortcutToast("\u2190 Previous Chapter");
                    prevBtn.click();
                }
            }

            // F: Toggle Fullscreen
            if (e.key.toLowerCase() === 'f') {
                e.preventDefault();
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(err => {
                        console.warn(`Error attempting to enable full-screen mode: ${err.message}`);
                    });
                    showShortcutToast("Fullscreen Mode");
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                        showShortcutToast("Exited Fullscreen");
                    }
                }
            }

            // Esc: Return to library (only if not in a dialog or fullscreen)
            if (e.key === 'Escape') {
                // Check if any dialog is open
                const dialogs = document.querySelectorAll('dialog[open]');
                if (dialogs.length > 0) return; // Let default Escape behavior close the dialog
                
                if (document.fullscreenElement) return; // Let default Escape behavior exit fullscreen

                // Close sidebar if open
                const sb = document.getElementById('stardust-sidebar');
                if (sb && sb.classList.contains('open')) {
                    sb.classList.remove('open');
                    const bd = document.getElementById('reader-sidebar-backdrop');
                    if (bd) bd.style.display = 'none';
                    return;
                }
            }
        });
    }
    
    initTranslationSwaps();

    // ==========================================
    // 10. LAST-READ BOOK ROUTE TRACKING
    // ==========================================
    // Only record actual narrative routes (never system pages like /settings or /library)
    const SYSTEM_ROUTES = new Set([
        '/', '/index.php', '/isabel.php', '/library', '/catalog',
        '/settings', '/bookmarks', '/about', '/accessibility',
        '/welcome', '/setup', '/knox', '/aethel-saga', '/search'
    ]);
    const cleanPath = window.location.pathname.replace(/\/+$/, '') || '/';
    // Sanitize any previously corrupted rs-last-read pointing to a system page
    const existingLastRead = localStorage.getItem('rs-last-read');
    if (existingLastRead) {
        const cleanExisting = existingLastRead.replace(/\/+$/, '') || '/';
        if (SYSTEM_ROUTES.has(cleanExisting)) {
            localStorage.removeItem('rs-last-read');
            localStorage.removeItem('rs-last-read-title');
        }
    }
    if (!SYSTEM_ROUTES.has(cleanPath) && document.getElementById('stardust-reading-pane')) {
        localStorage.setItem('rs-last-read', window.location.pathname);
        if (document.title) {
            localStorage.setItem('rs-last-read-title', document.title);
        }
    }

    // ==========================================
    // 10. RAGGIESOFT BACKSTAGE <dialog> API CONTROLLER
    // ==========================================
    // Connects `books.raggiesoft.com` to `backstage.raggiesoft.com` (with automatic
    // CDN fallback to `assets.raggiesoft.com/raggiesoft-backstage/api/v1/`).
    // Triggers when the reader clicks either:
    //   1. A `[data-backstage-slug]` button in the scene's Backstage callout card, OR
    //   2. Any inline link pointing to `https://backstage.raggiesoft.com/<slug>`
    //      inside the reading pane (unless marked `data-backstage-direct="true"`).
    const bsDialog = document.getElementById('rs-backstage-dialog');
    const bsCloseBtn = document.getElementById('rs-backstage-dialog-close');
    const bsTitleEl = document.getElementById('rs-backstage-dialog-title');
    const bsKickerEl = document.getElementById('rs-backstage-dialog-kicker');
    const bsMetaEl = document.getElementById('rs-backstage-dialog-meta');
    const bsBodyEl = document.getElementById('rs-backstage-dialog-body');
    const bsBounceLink = document.getElementById('rs-backstage-dialog-bounce');

    if (bsDialog && bsCloseBtn && !bsDialog.dataset.bsBound) {
        bsDialog.dataset.bsBound = 'true';
        bsCloseBtn.addEventListener('click', () => bsDialog.close());
        bsDialog.addEventListener('click', (e) => {
            if (e.target === bsDialog) bsDialog.close();
        });
    }

    if (!window.__rsBackstageClickBound) {
        window.__rsBackstageClickBound = true;
        document.addEventListener('click', (e) => {
            const targetEl = e.target && e.target.closest ? e.target.closest('[data-backstage-slug], a[href*="backstage.raggiesoft.com/"]') : null;
            if (!targetEl) return;
            if (targetEl.getAttribute('data-backstage-direct') === 'true') return;

            let slug = targetEl.getAttribute('data-backstage-slug') || '';
            if (!slug && targetEl.tagName === 'A') {
                try {
                    const u = new URL(targetEl.href, window.location.origin);
                    if (u.hostname === 'backstage.raggiesoft.com') {
                        slug = u.pathname.replace(/^\/+|\/+$/g, '');
                    }
                } catch (err) {}
            }
            if (!slug) return;

            const activeDialog = document.getElementById('rs-backstage-dialog');
            if (!activeDialog) return;

            e.preventDefault();
            e.stopPropagation();

            const titleEl = document.getElementById('rs-backstage-dialog-title');
            const kickerEl = document.getElementById('rs-backstage-dialog-kicker');
            const metaEl = document.getElementById('rs-backstage-dialog-meta');
            const bodyEl = document.getElementById('rs-backstage-dialog-body');
            const bounceEl = document.getElementById('rs-backstage-dialog-bounce');
            const fullBackstageUrl = 'https://backstage.raggiesoft.com/' + slug;

            if (titleEl) titleEl.textContent = 'Loading RaggieSoft Backstage Record...';
            if (kickerEl) kickerEl.textContent = '🎬 RaggieSoft Backstage Archive';
            if (metaEl) {
                metaEl.style.display = 'none';
                metaEl.textContent = '';
            }
            if (bodyEl) {
                bodyEl.innerHTML = '<p style="text-indent: 0; opacity: 0.8;">Fetching correspondence &amp; behind-the-scenes dossier from RaggieSoft Backstage...</p>';
            }
            if (bounceEl) {
                bounceEl.setAttribute('href', fullBackstageUrl);
            }
            if (typeof activeDialog.showModal === 'function') {
                activeDialog.showModal();
            } else {
                activeDialog.setAttribute('open', 'open');
            }

            const primaryApiUrl = 'https://backstage.raggiesoft.com/api/v1/' + slug + '.json';
            const fallbackCdnApiUrl = 'https://assets.raggiesoft.com/raggiesoft-backstage/api/v1/' + slug + '.json';

            fetch(primaryApiUrl)
                .then((res) => {
                    if (!res.ok) throw new Error('Primary Backstage API returned ' + res.status);
                    return res.json();
                })
                .catch(() =>
                    fetch(fallbackCdnApiUrl).then((res) => {
                        if (!res.ok) throw new Error('CDN Backstage API returned ' + res.status);
                        return res.json();
                    })
                )
                .then((data) => {
                    if (titleEl) titleEl.textContent = data.title || 'Backstage Dossier';
                    if (kickerEl) kickerEl.textContent = '🎬 ' + (data.category || 'RaggieSoft Backstage Archive');
                    if (metaEl) {
                        const metaParts = [];
                        if (data.date) metaParts.push(data.date + (data.time ? ' • ' + data.time : ''));
                        if (data.location) metaParts.push(data.location);
                        if (data.sender) metaParts.push('From: ' + data.sender);
                        if (data.subject) metaParts.push('Subject: ' + data.subject);
                        if (metaParts.length > 0) {
                            metaEl.textContent = metaParts.join('  |  ');
                            metaEl.style.display = 'block';
                        }
                    }
                    if (bodyEl) {
                        bodyEl.innerHTML = data.html || '<p>No content available.</p>';
                    }
                    if (bounceEl && data.canonicalUrl) {
                        bounceEl.setAttribute('href', data.canonicalUrl);
                    }
                })
                .catch(() => {
                    if (bodyEl) {
                        bodyEl.innerHTML = '<p style="text-indent: 0;">Click below to open this dossier directly on <strong>RaggieSoft Backstage</strong>.</p>';
                    }
                });
        });
    }
} // end initOceanViewReader()

window.applyTranslationMode = function(mode) {
    const langSpans = document.querySelectorAll('.foreign-language');
    langSpans.forEach(span => {
        const orig = span.getAttribute('data-original');
        const trans = span.getAttribute('data-translation');
        if (!orig || !trans) return;
        
        span.dataset.currentMode = mode;
        span.textContent = (mode === 'translated') ? trans : orig;
    });
};

function initTranslationSwaps() {
    const langSpans = document.querySelectorAll('.foreign-language');
    langSpans.forEach(span => {
        if (span.dataset.swapBound) return;
        span.dataset.swapBound = 'true';
        
        span.style.cursor = 'pointer';
        span.style.textDecoration = 'underline dotted';
        span.style.textUnderlineOffset = '3px';
        
        span.addEventListener('click', (e) => {
            const orig = span.getAttribute('data-original');
            const trans = span.getAttribute('data-translation');
            if (!orig || !trans) return;
            
            if (span.dataset.currentMode === 'original') {
                span.dataset.currentMode = 'translated';
                span.textContent = trans;
            } else {
                span.dataset.currentMode = 'original';
                span.textContent = orig;
            }
        });
    });
    
    try {
        const stored = localStorage.getItem('reader-settings');
        if (stored) {
            const settings = JSON.parse(stored);
            if (settings.translationMode) {
                window.applyTranslationMode(settings.translationMode);
            } else {
                window.applyTranslationMode('original');
            }
        } else {
            window.applyTranslationMode('original');
        }
    } catch(e) {}
}

// Prevent duplicate event listeners during SPA soft-navigations
if (!window.oceanViewReaderInitialized) {
    document.addEventListener('DOMContentLoaded', initOceanViewReader);
    document.addEventListener('stardust:loaded', initOceanViewReader);
    window.oceanViewReaderInitialized = true;
}
