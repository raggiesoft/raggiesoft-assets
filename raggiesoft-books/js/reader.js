/**
 * ============================================================================
 * READ-ALONG TEACHING OVERVIEW: reader.js (RaggieSoft Book Reader Controller)
 * Hosted at: https://assets.raggiesoft.com/raggiesoft-books/js/reader.js
 * ============================================================================
 * WHAT THIS FILE IS:
 *   The client-side JavaScript brain of RaggieSoft Book Reader ("Oliver"),
 *   powering reading typography customization, Light/Dark/Sepia/Narrative
 *   themes, synchronized chapter soundtracks, bookmarks, resume-reading progress,
 *   offline Service Worker book caching, Backstage dossiers, Story Arc playlists,
 *   bilingual inline `<lang>` translation toggles, and RaggieSoft Story Crossroads
 *   interactive branching narratives—100% in the browser with zero user tracking
 *   or server-side login accounts!
 *
 * WHICH WEBSITES LOAD IT:
 *   Loaded on `https://books.raggiesoft.com` alongside `reader.css` and
 *   `stardust-spa.min.js` (which dispatches `stardust:loaded` on soft SPA navigations).
 *
 * WHAT INPUTS IT CONSUMES:
 *   1. `localStorage` keys:
 *      - `'reader-settings'` (JSON: `theme`, `customThemeEnabled`, `fontSize`,
 *        `width`, `fontFamily`, `autoPlayAudio`, `showOfflineCta`, `translationMode`)
 *      - `'rs-line-height'` (e.g. `'1.8'`)
 *      - `'rs-bookmarks'` (JSON array of saved chapter URLs & titles)
 *      - `'rs-last-read'` & `'rs-last-read-title'` (last visited story chapter route)
 *      - `'rs-hidden-books'` (JSON array of hidden series slugs)
 *      - `'rs-wizard-completed'` (boolean string `'true'` after first-run wizard)
 *      - `'rs-story-choices-<bookSlug>'` + `rs_cx_<bookSlug>` HTTP cookie (Story Crossroads routes)
 *   2. SSR HTML attributes (`#narrative-audio-element`, `[data-hero-carousel]`,
 *      `meta[name="stardust-narrative-theme"]`, `[data-story-path]`, `[data-backstage-slug]`).
 *   3. Lifecycle events (`DOMContentLoaded` and `stardust:loaded`).
 *
 * WHAT VISIBLE UI & STATE IT PRODUCES:
 *   - Live CSS variable updates (`--rs-font-size`, `--rs-line-height`, `--rs-font-family`)
 *     and `<body>` theme classes (`theme-light`, `theme-dark`, `theme-sepia`, `narrative-theme-*`).
 *   - Continuous WebKit/iOS-safe soundtrack playback on `<audio id="stardust-bgm">`
 *     with OS Lock Screen / AirPods `navigator.mediaSession` controls & Markdown lyrics modal.
 *   - Capture-phase cookie + `localStorage` persistence for Story Crossroads choices.
 *   - Offline book prefetching & Cache Storage API (`caches.open` / `cache.delete`) management.
 *
 * 100-LEVEL JAVASCRIPT CONCEPTS TAUGHT IN THIS FILE:
 *   - `AbortController` (`{ signal: audioSignal }`): Tearing down old SPA event listeners cleanly!
 *   - Negative-Safe Modulo Arithmetic (`((idx % count) + count) % count`) for circular wrap-around.
 *   - `localStorage` Non-Destructive Merging (`Object.assign({}, existing, updated)`).
 *   - Capture Phase (`useCapture = true`) vs Bubble Phase (`false`) in DOM click routing.
 *   - Browser Web APIs: `Intl.DateTimeFormat`, `MediaMetadata`, `Fullscreen`, `Clipboard`, `CacheStorage`.
 * ============================================================================
 */
function initOceanViewReader() {

    // ========================================================================
    // 0. CLIENT OPERATING SYSTEM RESOLVER (`html[data-os="..."]`)
    // ========================================================================
    // Detects the reader's OS (`macos`, `windows`, `linux`, `ios`, `android`)
    //—or honors `?preview_os=windows` for QA testing—and writes `data-os="..."`
    // onto `<html>`. That lets CSS render OS-authentic window titlebars (like
    // Zoë's `ZOË.Systems.Logs` diagnostic panes) AND apply Dynamic Island top
    // padding specifically on `html[data-os="ios"]`!
    // Notice the iPadOS trick: modern iPads report `"Macintosh"` in `userAgent`
    // to request desktop websites, so checking `navigator.maxTouchPoints > 1`
    // distinguishes a touchscreen iPad from a non-touch MacBook/iMac!
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

    // ========================================================================
    // 1. OFF-CANVAS MOBILE SIDEBAR DRAWER MANAGEMENT
    // ========================================================================
    // On screens `< 992px`, `#stardust-sidebar` is parked off-screen via CSS
    // `transform: translateX(-100%)`. Clicking either `#stardust-sidebar-toggle`
    // ("Menu") or the dark `#reader-sidebar-backdrop` scrim toggles `.open`.
    const sidebar = document.getElementById('stardust-sidebar');
    const toggleBtn = document.getElementById('stardust-sidebar-toggle');
    const backdrop = document.getElementById('reader-sidebar-backdrop');

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


    // ========================================================================
    // 2. IN-UNIVERSE DATETIME & REALM CLOCK FORMATTING
    // ========================================================================
    // Why format dates in JS with `Intl.DateTimeFormat(undefined, options)`?
    // Passing `undefined` as the 1st argument uses the reader's own browser
    // language/clock preference (12-hour `7:00 PM` in the US vs 24-hour `19:00`
    // in Europe), while `options.timeZone = iana` (e.g. `'America/New_York'` or
    // `'America/Los_Angeles'`) locks the clock to the CHARACTER'S city timezone
    // so a 9:00 AM Blacksburg scene still reads 9:00 AM EDT everywhere on Earth!
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

    // Standalone clock formatter for fantasy/sci-fi scenes (`#story-time-only-display`)
    // that have a `23:42` clock time without an Earth Gregorian calendar date.
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


    // ========================================================================
    // 2B. SCENE HERO IMAGE CAROUSEL CONTROLLER (`[data-hero-carousel]`)
    // ========================================================================
    // Powers multi-illustration 16:9 chapter header plates with 4 input modes:
    //   1. Previous / Next arrow buttons (`[data-hero-prev]`, `[data-hero-next]`)
    //   2. Pagination indicator dots (`[data-hero-dot]`)
    //   3. Keyboard `ArrowLeft` / `ArrowRight` when focused (`e.stopPropagation()`
    //      prevents Section 9's global ArrowLeft/ArrowRight chapter jumper from firing!)
    //   4. Touch swipe gestures (`Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)`
    //      requires at least a 40px horizontal swipe that is more horizontal than vertical,
    //      so normal vertical reading scrolls never flip slides by accident!).
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

        /* 100-Level Math Tip — Negative-Safe Wrap-Around:
         * In JavaScript, `-1 % 3` evaluates to `-1` (NOT `2`!).
         * Writing `((nextIdx % total) + total) % total` turns `-1` into `(-1 + 3) % 3 = 2`,
         * wrapping cleanly in BOTH directions! */
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


    // ========================================================================
    // 3. PERSISTENT SOUNDTRACK AUDIO ENGINE & MEDIASESSION CONTROLLER
    // ========================================================================
    // Two Key 100-Level Engineering Patterns Here:
    //   1. Persistent `<audio id="stardust-bgm">` Outside `#stardust-app`:
    //      In Safari / iOS WebKit, `<audio>` tags parsed inside `DOMParser` have
    //      no hardware audio pipeline—AND if two consecutive chapters share the
    //      same background album/song, keeping ONE live `<audio id="stardust-bgm">`
    //      outside the swapped SPA wrapper lets the song keep playing seamlessly
    //      across Part 1 -> Part 2 transitions without restarting at 0:00!
    //   2. `AbortController` (`window.__rsAudioController`):
    //      Because `liveAudio` persists across SPA page swaps while the UI buttons
    //      (`scrubber`, `playIcon`) get replaced on every chapter change, attaching
    //      `liveAudio.addEventListener('timeupdate', ..., { signal: audioSignal })`
    //      lets us call `window.__rsAudioController.abort()` at the top of the next
    //      navigation to detach ALL previous chapter listeners in one clean line!
    if (window.__rsAudioController && typeof window.__rsAudioController.abort === 'function') {
        window.__rsAudioController.abort();
    }
    const audioAbortController = new AbortController();
    window.__rsAudioController = audioAbortController;
    const audioSignal = audioAbortController.signal;

    let liveAudio = document.getElementById('stardust-bgm');
    if (!liveAudio) {
        liveAudio = window.document.createElement('audio');
        liveAudio.id = 'stardust-bgm';
        liveAudio.preload = 'none';
        if (document.body) {
            document.body.insertBefore(liveAudio, document.body.firstChild);
        }
    }

    const metaEl = document.getElementById('narrative-audio-element');
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
    let initialAudioUrl = '';

    if (metaEl) {
        initialAudioUrl = metaEl.getAttribute('data-audio-src') || metaEl.getAttribute('src') || '';
        // Strip any legacy `src` attribute off the SSR carrier so WebKit never spins up a competing pipeline
        if (metaEl.hasAttribute('src')) {
            metaEl.removeAttribute('src');
        }
        queueMode = metaEl.getAttribute('data-queue-mode') || 'single';
        try {
            const rawQueue = metaEl.getAttribute('data-queue');
            if (rawQueue) {
                const parsedQueue = JSON.parse(rawQueue);
                if (Array.isArray(parsedQueue)) {
                    audioQueue = parsedQueue;
                }
            }
        } catch (err) {
            console.warn('Unable to parse narrative audio queue JSON:', err);
        }
        if (!initialAudioUrl && audioQueue.length > 0 && audioQueue[0] && audioQueue[0].audioUrl) {
            initialAudioUrl = audioQueue[0].audioUrl;
        }
        repeatMode = metaEl.getAttribute('data-repeat-mode') || (audioQueue.length > 1 ? 'all' : 'one');
        activeQueueIndex = parseInt(metaEl.getAttribute('data-active-index') || '0', 10) || 0;
    } else {
        // Navigating to a page with no chapter audio player (e.g., Home, TOC, Library):
        // cleanly pause the persistent player so music never plays without visible controls.
        if (liveAudio && !liveAudio.paused) {
            liveAudio.pause();
        }
    }

    // Resolves the canonical MP3 stream URL for the currently selected queue item
    function getActiveTrackAudioUrl() {
        if (audioQueue.length > 0 && audioQueue[activeQueueIndex] && audioQueue[activeQueueIndex].audioUrl) {
            return audioQueue[activeQueueIndex].audioUrl;
        }
        return (metaEl && metaEl.getAttribute('data-audio-src')) || initialAudioUrl || '';
    }

    // Synchronize persistent liveAudio element when entering a chapter with an audio player:
    // - If liveAudio is already playing/loaded on one of this chapter's queue tracks, preserve seamless playback!
    // - Otherwise, pause any previous chapter's song cleanly and keep preload="none" until the reader presses Play.
    if (metaEl && liveAudio) {
        const currentLoadedUrl = liveAudio.currentSrc || liveAudio.getAttribute('src') || '';
        let matchingIdx = -1;
        if (currentLoadedUrl) {
            if (audioQueue.length > 0) {
                matchingIdx = audioQueue.findIndex(t => t && t.audioUrl === currentLoadedUrl);
            } else if (initialAudioUrl && currentLoadedUrl === initialAudioUrl) {
                matchingIdx = 0;
            }
        }
        if (matchingIdx === -1) {
            if (!liveAudio.paused) {
                liveAudio.pause();
            }
            liveAudio.removeAttribute('src');
            liveAudio.preload = 'none';
            liveAudio.load();
        } else if (matchingIdx > 0 && audioQueue.length > 1) {
            activeQueueIndex = matchingIdx;
            metaEl.setAttribute('data-active-index', String(matchingIdx));
        }
    }

    // Helper: updates MediaSession metadata and prev/next handlers for current track
    function syncMediaSessionMetadata(trackObj) {
        if (!('mediaSession' in navigator) || !metaEl) return;
        const tTitle = (trackObj && trackObj.title) || metaEl.getAttribute('data-title') || '';
        const tArtist = (trackObj && trackObj.artist) || metaEl.getAttribute('data-artist') || '';
        const tAlbum = (trackObj && trackObj.album) || metaEl.getAttribute('data-album') || '';
        const tArt = (trackObj && trackObj.artworkUrl) || metaEl.getAttribute('data-artwork') || '';
        try {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: tTitle,
                artist: tArtist,
                album: tAlbum,
                artwork: tArt ? [{ src: tArt, sizes: '512x512', type: 'image/jpeg' }] : []
            });
        } catch (e) {}
    }

    // Starts playback synchronously inside the user gesture on the persistent liveAudio element
    // (matching The Listening Room's Player.svelte pattern for Safari/WebKit macOS & iOS PWAs)
    function playLiveTrackUrl(targetUrl) {
        if (!liveAudio || !targetUrl) return;
        const loadedSrc = liveAudio.getAttribute('src') || '';
        liveAudio.preload = 'auto';
        if (loadedSrc !== targetUrl) {
            liveAudio.src = targetUrl;
        } else if (liveAudio.error) {
            liveAudio.load();
        }
        const playPromise = liveAudio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => console.warn('Audio playback prevented or interrupted:', e));
        }
    }

    // Helper: loads a specific track from audioQueue by index and updates all player UI nodes
    function loadQueueTrack(targetIndex, autoPlay, preserveCurrentStream) {
        if (!metaEl || !liveAudio || !audioQueue.length) return;
        const count = audioQueue.length;
        const normalizedIndex = ((targetIndex % count) + count) % count;
        const track = audioQueue[normalizedIndex];
        if (!track) return;

        activeQueueIndex = normalizedIndex;
        metaEl.setAttribute('data-active-index', String(normalizedIndex));
        metaEl.setAttribute('data-title', track.title || '');
        metaEl.setAttribute('data-artist', track.artist || '');
        metaEl.setAttribute('data-album', track.album || '');
        metaEl.setAttribute('data-artwork', track.artworkUrl || '');
        metaEl.setAttribute('data-listening-room-track-url', track.listeningRoomTrackUrl || '');
        metaEl.setAttribute('data-listening-room-album-url', track.listeningRoomAlbumUrl || '');
        metaEl.setAttribute('data-audio-src', track.audioUrl || '');

        if (!preserveCurrentStream) {
            if (!autoPlay) {
                if (!liveAudio.paused) liveAudio.pause();
                liveAudio.preload = 'none';
                if (track.audioUrl) {
                    liveAudio.src = track.audioUrl;
                }
            }
            if (scrubber) scrubber.value = 0;
            if (currentTimeDisplay) currentTimeDisplay.textContent = '0:00';
            if (durationDisplay) durationDisplay.textContent = track.duration || '0:00';
        }

        // Update Eyebrow label
        const eyebrowEl = document.getElementById('narrative-audio-eyebrow');
        const playlistTitle = metaEl.getAttribute('data-playlist-title') || '';
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

        if (autoPlay && track.audioUrl) {
            if ((liveAudio.getAttribute('src') || '') === track.audioUrl && !preserveCurrentStream) {
                liveAudio.currentTime = 0;
            }
            playLiveTrackUrl(track.audioUrl);
        }
    }
    
    if (metaEl && liveAudio && playToggleBtn) {
        const startTime = parseFloat(metaEl.getAttribute('data-start-time') || 0);
        let pendingSeekTime = (activeQueueIndex === 0 && startTime > 0) ? startTime : null;

        // If continuous playback carried over onto track index > 0 of a multi-track queue, sync UI labels immediately
        if (activeQueueIndex > 0 && audioQueue.length > 1) {
            loadQueueTrack(activeQueueIndex, false, true);
        }

        // Formats seconds into MM:SS
        function formatTime(secs) {
            if (isNaN(secs)) return '0:00';
            const m = Math.floor(secs / 60);
            const s = Math.floor(secs % 60);
            return m + ':' + (s < 10 ? '0' : '') + s;
        }

        function syncPlayPauseIcon() {
            if (!playIcon) return;
            if (liveAudio.paused) {
                playIcon.classList.remove('ph-pause');
                playIcon.classList.add('ph-play');
            } else {
                playIcon.classList.remove('ph-play');
                playIcon.classList.add('ph-pause');
            }
        }
        syncPlayPauseIcon();
        
        playToggleBtn.addEventListener('click', () => {
            if (liveAudio.paused) {
                const targetUrl = getActiveTrackAudioUrl();
                playLiveTrackUrl(targetUrl);
            } else {
                liveAudio.pause();
            }
        });

        if (prevBtn && audioQueue.length > 1) {
            prevBtn.addEventListener('click', () => {
                // If more than 3 seconds into the track, restart current track; otherwise go to previous track
                if (liveAudio.currentTime > 3) {
                    liveAudio.currentTime = 0;
                } else {
                    loadQueueTrack(activeQueueIndex - 1, true, false);
                }
            });
        }

        if (nextBtn && audioQueue.length > 1) {
            nextBtn.addEventListener('click', () => {
                loadQueueTrack(activeQueueIndex + 1, true, false);
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
                    loadQueueTrack(idx, true, false);
                });
            });
        }
        
        liveAudio.addEventListener('play', syncPlayPauseIcon, { signal: audioSignal });
        liveAudio.addEventListener('pause', syncPlayPauseIcon, { signal: audioSignal });
        
        function syncAudioDuration() {
            if (isFinite(liveAudio.duration) && liveAudio.duration > 0) {
                if (scrubber) scrubber.max = liveAudio.duration;
                if (durationDisplay) durationDisplay.textContent = formatTime(liveAudio.duration);
                if (pendingSeekTime !== null && liveAudio.currentTime < pendingSeekTime) {
                    liveAudio.currentTime = pendingSeekTime;
                    pendingSeekTime = null;
                }
            }
        }

        liveAudio.addEventListener('loadedmetadata', syncAudioDuration, { signal: audioSignal });
        liveAudio.addEventListener('durationchange', syncAudioDuration, { signal: audioSignal });
        if (liveAudio.readyState >= 1) {
            syncAudioDuration();
            if (scrubber) scrubber.value = liveAudio.currentTime;
            if (currentTimeDisplay) currentTimeDisplay.textContent = formatTime(liveAudio.currentTime);
        } else {
            // Seed scrubber max from SSR `MM:SS` duration string so seeking works even before metadata loads
            const ssrDur = metaEl.getAttribute('data-duration') || '';
            if (scrubber && ssrDur.includes(':')) {
                const parts = ssrDur.split(':').map(Number);
                if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                    scrubber.max = (parts[0] * 60) + parts[1];
                }
            }
        }
        
        // Sync scrubber UI with audio playback
        liveAudio.addEventListener('timeupdate', () => {
            if (scrubber && !scrubber.matches(':active')) {
                scrubber.value = liveAudio.currentTime;
                if (currentTimeDisplay) currentTimeDisplay.textContent = formatTime(liveAudio.currentTime);
            }
        }, { signal: audioSignal });

        // Handle track completion across single tracks, albums, and playlists
        liveAudio.addEventListener('ended', () => {
            if (repeatMode === 'one') {
                liveAudio.currentTime = 0;
                playLiveTrackUrl(getActiveTrackAudioUrl());
                return;
            }
            if (audioQueue.length > 1) {
                if (activeQueueIndex + 1 < audioQueue.length) {
                    loadQueueTrack(activeQueueIndex + 1, true, false);
                } else if (repeatMode === 'all') {
                    loadQueueTrack(0, true, false);
                }
            }
        }, { signal: audioSignal });
        
        // Allow user to scrub through the audio
        if (scrubber) {
            scrubber.addEventListener('input', () => {
                if (currentTimeDisplay) currentTimeDisplay.textContent = formatTime(scrubber.value);
            });
            scrubber.addEventListener('change', () => {
                const targetSec = parseFloat(scrubber.value) || 0;
                if (liveAudio.readyState >= 1) {
                    liveAudio.currentTime = targetSec;
                } else {
                    pendingSeekTime = targetSec;
                }
            });
        }

        // Automatically pause in-page background audio if the reader opens the track or album
        // in The Listening Room (music.raggiesoft.com) or an external DSP to prevent dual-stream audio collision.
        const externalAudioLinks = document.querySelectorAll('.reader-audio-external-link');
        externalAudioLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (!liveAudio.paused) {
                    liveAudio.pause();
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
    if (metaEl && liveAudio) {
        if ('mediaSession' in navigator) {
            syncMediaSessionMetadata(audioQueue[activeQueueIndex] || null);
            navigator.mediaSession.setActionHandler('play', () => playLiveTrackUrl(getActiveTrackAudioUrl()));
            navigator.mediaSession.setActionHandler('pause', () => liveAudio.pause());
            if (audioQueue.length > 1) {
                try {
                    navigator.mediaSession.setActionHandler('previoustrack', () => {
                        loadQueueTrack(activeQueueIndex - 1, true, false);
                    });
                    navigator.mediaSession.setActionHandler('nexttrack', () => {
                        loadQueueTrack(activeQueueIndex + 1, true, false);
                    });
                } catch (e) {}
            } else {
                try {
                    navigator.mediaSession.setActionHandler('previoustrack', null);
                    navigator.mediaSession.setActionHandler('nexttrack', null);
                } catch (e) {}
            }
        }
        
        const lsSettings = localStorage.getItem('reader-settings');
        if (lsSettings) {
            try {
                const parsed = JSON.parse(lsSettings);
                // Attempt autoplay if user has it enabled in settings and audio isn't already playing
                if (parsed.autoPlayAudio === 'true' && liveAudio.paused) {
                    playLiveTrackUrl(getActiveTrackAudioUrl());
                }
            } catch(e) {}
        }
    }

    if (metaEl && liveAudio && loopBtn) {
        const icon = loopBtn.querySelector('i');
        const applyRepeatUI = () => {
            if (repeatMode === 'all') {
                liveAudio.loop = false;
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
                liveAudio.loop = (audioQueue.length <= 1);
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
                liveAudio.loop = false;
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
            metaEl.setAttribute('data-repeat-mode', repeatMode);
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


    // ========================================================================
    // 4. CLIENT-SIDE BOOKMARK SYSTEM (`localStorage['rs-bookmarks']`)
    // ========================================================================
    // Stores an array of `{ url, title, series, date }` objects in the browser's
    // `localStorage` (which holds strings only—so we `JSON.parse()` when reading
    // and `JSON.stringify()` when saving!). Clicking once adds the chapter;
    // clicking again removes it via `bookmarks.splice(existingIndex, 1)`.
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
            
            // Check if already bookmarked (`findIndex` returns `-1` if not found)
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

    // ========================================================================
    // 5. ACCESSIBLE TYPOGRAPHY, FONT-SIZE, LINE-HEIGHT & THEME ENGINE
    // ========================================================================
    // Maps short storage keys (`'atkinson'`, `'opendyslexic'`, `'lora'`, etc.)
    // to full resilient CSS font stacks. Notably includes:
    //   - `Atkinson Hyperlegible`: Designed by the Braille Institute with distinct
    //     letterforms (`I` vs `l` vs `1`, `0` vs `O`) for low-vision readers.
    //   - `OpenDyslexic`: Weighted bottom-heavy strokes to reduce letter-flipping for dyslexic readers.
    const FONT_MAP = {
        'system': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        'georgia': 'Georgia, "Times New Roman", Times, serif',
        'lora': '"Lora", Georgia, serif',
        'inter': '"Inter", system-ui, -apple-system, sans-serif',
        'atkinson': '"Atkinson Hyperlegible", system-ui, -apple-system, sans-serif',
        'opendyslexic': '"OpenDyslexic", "Comic Sans MS", sans-serif'
    };

    /* Normalizes either a short key (`'lora'`) or a legacy full CSS font-family string back to a canonical key. */
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

    /* Updates `--rs-font-size` on `<html>` (and inline on `.story-content`) in `rem` units,
     * rounding to 2 decimal places (`Math.round(parsed * 100) / 100`) to avoid IEEE-754
     * floating-point drift like `1.15 + 0.1 = 1.2500000000000002rem`! */
    function applyFontSize(size, persist = true) {
        const parsed = parseFloat(size);
        currentFontSize = !isNaN(parsed) ? Math.round(parsed * 100) / 100 : 1.15;
        document.documentElement.style.setProperty('--rs-font-size', `${currentFontSize}rem`);
        if (contentBody) contentBody.style.fontSize = `${currentFontSize}rem`;
        if (persist) saveSettings();
    }

    /* Updates `--rs-line-height` (default `1.8`) and persists to `localStorage['rs-line-height']`. */
    function applyLineHeight(lh, persist = true) {
        currentLineHeight = lh ? String(lh) : '1.8';
        document.documentElement.style.setProperty('--rs-line-height', currentLineHeight);
        if (contentBody) contentBody.style.lineHeight = currentLineHeight;
        if (persist) {
            localStorage.setItem('rs-line-height', currentLineHeight);
        }
    }

    /* Clamp font size between `0.8rem` minimum and `2.5rem` maximum (> 200% WCAG 1.4.4 Resize Text). */
    if (btnIncrease) btnIncrease.addEventListener('click', () => applyFontSize(Math.min(currentFontSize + 0.1, 2.5), true));
    if (btnDecrease) btnDecrease.addEventListener('click', () => applyFontSize(Math.max(currentFontSize - 0.1, 0.8), true));
    if (btnReset) btnReset.addEventListener('click', () => applyFontSize(1.15, true));

    // Reserved base mode slugs that MUST NEVER be overwritten or collided with by a
    // narrative YAML `theme:` slug (e.g., `theme: "dark"` in Luna & Leo must apply
    // `narrative-theme-dark` + `data-narrative-theme="dark"` without forcing `body.theme-dark`!).
    const RESERVED_MODE_SLUGS = new Set([
        'auto', 'light', 'sepia', 'dark', 'dark-sepia', 'sepia-system',
        'oceanview', 'raggiesoft-books', 'custom'
    ]);

    // Core Theme Application Logic
    // Strips old themes, syncs root color-scheme, applies the base reader mode class,
    // and layers the custom narrative theme cleanly without base-mode class collisions.
    function applyTheme(theme, customEnabled = true, persist = true) {
        currentTheme = theme || 'auto';
        currentCustomThemeEnabled = (customEnabled !== false);
        if (customThemeToggle) customThemeToggle.checked = currentCustomThemeEnabled;
        const wizCustomThemeEl = document.getElementById('wizard-custom-theme-toggle');
        if (wizCustomThemeEl) wizCustomThemeEl.checked = currentCustomThemeEnabled;
        const wizThemeEl = document.getElementById('wizard-theme-select');
        if (wizThemeEl) wizThemeEl.value = currentTheme;

        // Sync native UA form controls, scrollbars, and system surfaces via root color-scheme
        if (currentTheme === 'light' || currentTheme === 'sepia') {
            document.documentElement.style.colorScheme = 'light';
        } else if (currentTheme === 'dark' || currentTheme === 'dark-sepia') {
            document.documentElement.style.colorScheme = 'dark';
        } else {
            document.documentElement.style.colorScheme = 'light dark';
        }

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

        // ALWAYS apply the base theme class (e.g. theme-auto, theme-light, theme-dark)
        document.body.classList.add(`theme-${currentTheme}`);

        // Re-apply custom narrative theme if author defined it AND user wants it
        if (currentCustomThemeEnabled && narrativeTheme && narrativeTheme.trim() !== '') {
            const cleanSlug = narrativeTheme.trim();
            document.body.classList.add('theme-custom');
            document.body.classList.add(`narrative-theme-${cleanSlug}`);
            document.body.dataset.narrativeTheme = cleanSlug;
            if (!RESERVED_MODE_SLUGS.has(cleanSlug)) {
                document.body.classList.add(`theme-${cleanSlug}`);
            }
            if (customThemeLink) {
                const rawHref = customThemeLink.getAttribute('href') || '';
                if (rawHref) {
                    const baseHref = rawHref.split('?')[0];
                    customThemeLink.setAttribute('href', baseHref + '?v=20261114a');
                }
                customThemeLink.removeAttribute('disabled');
                customThemeLink.disabled = false;
            }
        } else {
            delete document.body.dataset.narrativeTheme;
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
            applyTheme(themeSelect ? themeSelect.value : 'auto', customThemeToggle ? customThemeToggle.checked : true, false);
        };
        
        if (btnCloseDevTester) btnCloseDevTester.addEventListener('click', revertTheme);
        devTesterDialog.addEventListener('close', revertTheme);
    }
    
    const devThemeInput = document.getElementById('dev-theme-select');
    const devThemeApply = document.getElementById('dev-theme-apply');
    const devThemeForceMode = document.getElementById('dev-theme-force-mode');
    
    if (devThemeApply && devThemeInput && devThemeForceMode) {
        // Every narrative theme supports full Light, Dark, and System Auto modes
        devThemeInput.addEventListener('change', () => {
            devThemeForceMode.disabled = false;
            devThemeForceMode.title = "";
            devThemeForceMode.style.opacity = '1';
        });

        const applyDevPreviewMode = () => {
            const forced = devThemeForceMode.value;
            if (forced === 'light') {
                applyTheme('light', true, false);
            } else if (forced === 'dark') {
                applyTheme('dark', true, false);
            } else {
                applyTheme('auto', true, false);
            }
        };

        devThemeForceMode.addEventListener('change', () => {
            if (document.querySelector('meta[name="stardust-narrative-theme"]')) {
                applyDevPreviewMode();
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
                
                // Inject the stylesheet dynamically with cache-busted version string
                let link = document.getElementById('narrative-theme-css');
                if (!link) {
                    link = document.createElement('link');
                    link.id = 'narrative-theme-css';
                    link.rel = 'stylesheet';
                    document.head.appendChild(link);
                }
                let cdnUrl = '';
                if (devTesterDialog) cdnUrl = devTesterDialog.getAttribute('data-cdn-url');
                link.href = cdnUrl + '/raggiesoft-books/css/themes/' + themeName + '.css?v=20261114a';
                
                setTimeout(applyDevPreviewMode, 50);
            }
        });
    }

    // ========================================================================
    // 8. LIBRARY VISIBILITY & OFFLINE SERVICE WORKER CACHE MANAGER
    // ========================================================================
    // Lets readers hide series from their personal bookshelf (`rs-hidden-books`)
    // AND proactively warm or evict entire novels inside the browser's offline
    // `CacheStorage` (`caches.open('ova-dynamic-...')`) so books remain 100%
    // readable on airplanes or subways with zero cell signal!
    const libraryList = document.getElementById('library-management-list');
    
    // Hides any `.rs-book-card` whose `data-slug` is listed in `localStorage['rs-hidden-books']`.
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

    // Walks a book's `toc.json` (`books -> chapters -> parts`) and issues background
    // CORS `fetch()` requests so the active Service Worker intercepts and caches every part!
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

    // Connects to the Cache API directly to purge stored books across active cache versions
    async function removeBookFromOffline(slug) {
        try {
            console.log('Removing book from offline cache: ' + slug);
            const allKeys = await caches.keys();
            const cacheKeys = allKeys.filter(k => k.startsWith('ova-dynamic-') || k.startsWith('ova-images-'));
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
            toast.style.color = 'var(--rs-on-primary, #ffffff)';
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
    // 12. STORY ARCS PLAYLIST DIALOG, FILTER BAR & SHARE COPY CONTROLLER
    // ==========================================
    // Follows `modern-web-guidance` best practices:
    //   - Uses `addEventListener()` exclusively (zero inline event handlers).
    //   - Opens `#rs-arc-playlist-dialog` via `.showModal()` and provides the
    //     bounding-box light-dismiss fallback for browsers without `closedBy` support.
    const arcDialog = document.getElementById('rs-arc-playlist-dialog');
    const arcOpenBtn = document.getElementById('rs-open-arc-playlist-btn');
    const arcCloseBtn = document.getElementById('rs-arc-playlist-close');

    if (arcDialog && !arcDialog.dataset.arcBound) {
        arcDialog.dataset.arcBound = 'true';
        if (arcOpenBtn) {
            arcOpenBtn.addEventListener('click', () => {
                arcDialog.showModal();
                const currentRow = arcDialog.querySelector('.rs-arc-stop-row.is-current');
                if (currentRow && typeof currentRow.scrollIntoView === 'function') {
                    currentRow.scrollIntoView({ block: 'nearest' });
                }
            });
        }
        if (arcCloseBtn) {
            arcCloseBtn.addEventListener('click', () => arcDialog.close());
        }
        // Fallback light-dismiss check when `HTMLDialogElement.prototype.closedBy` is unsupported (e.g., Safari)
        if (!('closedBy' in HTMLDialogElement.prototype)) {
            arcDialog.addEventListener('click', (event) => {
                const rect = arcDialog.getBoundingClientRect();
                const clickedInside = (
                    rect.top <= event.clientY &&
                    event.clientY <= rect.top + rect.height &&
                    rect.left <= event.clientX &&
                    event.clientX <= rect.left + rect.width
                );
                if (!clickedInside) {
                    arcDialog.close();
                }
            });
        }
        arcDialog.addEventListener('click', (event) => {
            const closeTrigger = event.target && event.target.closest
                ? event.target.closest('[data-close-arc-dialog="true"]')
                : null;
            if (closeTrigger && arcDialog.open) {
                arcDialog.close();
            }
        });
    }

    // Bind `/arcs` book series filter pills cleanly via `addEventListener()`
    const arcFilterButtons = document.querySelectorAll('[data-arc-filter]');
    const arcHubCards = document.querySelectorAll('#rs-arcs-hub-grid [data-arc-series]');
    arcFilterButtons.forEach((btn) => {
        if (btn.dataset.arcFilterBound) return;
        btn.dataset.arcFilterBound = 'true';
        btn.addEventListener('click', () => {
            const targetSeries = btn.getAttribute('data-arc-filter') || 'all';
            arcFilterButtons.forEach((b) => {
                const active = (b === btn);
                b.classList.toggle('is-active', active);
                b.setAttribute('aria-pressed', active ? 'true' : 'false');
            });
            arcHubCards.forEach((card) => {
                const cardSeries = card.getAttribute('data-arc-series') || '';
                card.hidden = !(targetSeries === 'all' || cardSeries === targetSeries);
            });
            try {
                const nextUrl = new URL(window.location.href);
                if (targetSeries === 'all') {
                    nextUrl.searchParams.delete('book');
                } else {
                    nextUrl.searchParams.set('book', targetSeries);
                }
                window.history.replaceState({}, '', nextUrl.pathname + nextUrl.search);
            } catch (err) {}
        });
    });

    // Bind share copy button (`[data-copy-share-url]`) without inline `onclick`
    document.querySelectorAll('[data-copy-share-url]').forEach((copyBtn) => {
        if (copyBtn.dataset.copyBound) return;
        copyBtn.dataset.copyBound = 'true';
        copyBtn.addEventListener('click', () => {
            const shareUrl = copyBtn.getAttribute('data-copy-share-url') || window.location.href;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(shareUrl).then(() => {
                    const labelEl = copyBtn.querySelector('span');
                    const prevText = labelEl ? labelEl.textContent : '';
                    if (labelEl) labelEl.textContent = 'Copied!';
                    setTimeout(() => {
                        if (labelEl) labelEl.textContent = prevText || 'Copy Link';
                    }, 1800);
                });
            }
        });
    });

    // ========================================================================
    // 10A. LAST-READ BOOK ROUTE TRACKING (`localStorage['rs-last-read']`)
    // ========================================================================
    // Powers the "Resume Reading" button on the Library home screen!
    // `SYSTEM_ROUTES` acts as a strict denylist so visiting `/settings`, `/arcs`,
    // or `/bookmarks` NEVER overwrites the actual novel chapter you were reading—
    // and preserving `window.location.search` keeps `?arc=<slug>` Story Arc
    // Playlist Mode active when you return later!
    const SYSTEM_ROUTES = new Set([
        '/', '/index.php', '/isabel.php', '/library', '/catalog', '/arcs', '/story-arcs',
        '/illustrations', '/stats', '/settings', '/bookmarks', '/about', '/accessibility',
        '/welcome', '/setup', '/knox', '/aethel-saga', '/search'
    ]);
    const cleanPath = window.location.pathname.replace(/\/+$/, '') || '/';
    // Sanitize any previously corrupted rs-last-read pointing to a system page
    const existingLastRead = localStorage.getItem('rs-last-read');
    if (existingLastRead) {
        const cleanExisting = existingLastRead.split('?')[0].replace(/\/+$/, '') || '/';
        if (SYSTEM_ROUTES.has(cleanExisting)) {
            localStorage.removeItem('rs-last-read');
            localStorage.removeItem('rs-last-read-title');
        }
    }
    if (!SYSTEM_ROUTES.has(cleanPath) && document.getElementById('stardust-reading-pane')) {
        // Preserve active `?arc=<slug>` query string so Resume Reading restores Story Arc Playlist Mode
        localStorage.setItem('rs-last-read', window.location.pathname + (window.location.search || ''));
        if (document.title) {
            localStorage.setItem('rs-last-read-title', document.title);
        }
    }

    // ========================================================================
    // 10B. RAGGIESOFT BACKSTAGE `<dialog>` API CONTROLLER (WITH CDN FAILOVER)
    // ========================================================================
    // Intercepts clicks on `[data-backstage-slug]` cards or inline `backstage.raggiesoft.com/<slug>`
    // links so readers can inspect in-universe correspondence & bonus dossiers inside
    // `<dialog id="rs-backstage-dialog">` without losing their reading spot!
    // Notice the resilient `.catch(() => fetch(fallbackCdnApiUrl)...)` Promise chain:
    // if `backstage.raggiesoft.com/api/v1/<slug>.json` is unreachable, it automatically
    // retries `assets.raggiesoft.com/raggiesoft-backstage/api/v1/<slug>.json`.
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
            // Do not hijack Story Arc hub/playlist pages (`/arcs` or `/arcs/<slug>`) on Backstage
            if (!slug || slug === 'arcs' || slug.startsWith('arcs/')) return;

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

/**
 * ============================================================================
 * 11. BILINGUAL INLINE `<lang>` TRANSLATION SWAPPER
 * ============================================================================
 * In RaggieSoft novels, multilingual dialogue (`<lang trans="...">`) renders as
 * `<span class="foreign-language" data-original="..." data-translation="...">`
 * with a dotted underline. Readers can either click an individual phrase to flip
 * between original language and English translation, OR set a global default
 * (`'original'` vs `'translated'`) via `window.applyTranslationMode(mode)`.
 */
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

/**
 * ============================================================================
 * 13. STORY CROSSROADS CAPTURE-PHASE PERSISTENCE & SPA BOOTSTRAPPER
 * ============================================================================
 * 100-Level DOM Event Phase Masterclass — Why `, true` at Line 2153?
 * When a reader clicks a Story Crossroads route button (`<a href="/book/..." data-story-path="route-b">`):
 *   - `stardust-spa.min.js` listens in the BUBBLE phase (`false`) and immediately
 *     fires an HTTP `fetch()` to PHP on the server so PHP renders the chosen branch's TOC & Next Chapter!
 *   - PHP needs the `rs_cx_<bookSlug>` HTTP cookie to ALREADY be set when that `fetch()` arrives!
 *   - By attaching our listener in the CAPTURE phase (`true`), our handler runs TOP-DOWN
 *     *before* `stardust-spa.min.js`'s bubble listener runs, saving both the 1-year
 *     `SameSite=Lax` cookie (`max-age=31536000`) and `localStorage` backup synchronously!
 */
if (!window.oceanViewReaderInitialized) {
    document.addEventListener('click', (e) => {
        const pathTrigger = e.target.closest('[data-story-path]');
        if (pathTrigger) {
            const pathId = (pathTrigger.getAttribute('data-story-path') || '').trim();
            const cxId = (pathTrigger.getAttribute('data-story-crossroads') || '').trim();
            const bookSlug = (pathTrigger.getAttribute('data-story-book') || '').trim().replace(/[^a-z0-9_-]/gi, '_');
            if (bookSlug) {
                const mapCookieKey = 'rs_cx_' + bookSlug;
                const legacyCookieKey = 'rs_path_' + bookSlug;
                const storageKey = 'rs-story-choices-' + bookSlug;
                let choicesMap = {};
                try {
                    const existingCookie = document.cookie.split('; ').find((row) => row.startsWith(mapCookieKey + '='));
                    if (existingCookie) {
                        const parsed = JSON.parse(decodeURIComponent(existingCookie.substring(mapCookieKey.length + 1)));
                        if (parsed && typeof parsed === 'object') choicesMap = parsed;
                    } else {
                        const rawLs = localStorage.getItem(storageKey);
                        if (rawLs) {
                            const parsedLs = JSON.parse(rawLs);
                            if (parsedLs && typeof parsedLs === 'object') choicesMap = parsedLs;
                        }
                    }
                } catch (err) {}

                /* `'reset'` clears either one Crossroads decision (`delete choicesMap[cxId]`)
                 * or all decisions in the novel; otherwise save `choicesMap[cxId] = pathId`. */
                if (pathId === 'reset' || pathId === '') {
                    if (cxId && Object.prototype.hasOwnProperty.call(choicesMap, cxId)) {
                        delete choicesMap[cxId];
                    } else {
                        choicesMap = {};
                    }
                } else if (cxId) {
                    choicesMap[cxId] = pathId;
                }

                if (Object.keys(choicesMap).length === 0) {
                    /* Expire cookies immediately via `max-age=0` when all choices are reset. */
                    document.cookie = mapCookieKey + '=; path=/; max-age=0; SameSite=Lax';
                    document.cookie = legacyCookieKey + '=; path=/; max-age=0; SameSite=Lax';
                    try { localStorage.removeItem(storageKey); } catch (err) {}
                } else {
                    const encodedJson = encodeURIComponent(JSON.stringify(choicesMap));
                    document.cookie = mapCookieKey + '=' + encodedJson + '; path=/; max-age=31536000; SameSite=Lax';
                    try { localStorage.setItem(storageKey, JSON.stringify(choicesMap)); } catch (err) {}
                }
            }
            const openDlg = document.getElementById('rs-story-crossroads-dialog');
            if (openDlg && openDlg.open) {
                openDlg.close();
            }
        }

        /* Open `<dialog id="rs-story-crossroads-dialog">` when clicking "Switch Story Path" */
        const openCxBtn = e.target.closest('[data-open-crossroads-dialog], [data-open-crossroads-if-present]');
        if (openCxBtn) {
            const cxDialog = document.getElementById('rs-story-crossroads-dialog');
            if (cxDialog && typeof cxDialog.showModal === 'function') {
                e.preventDefault();
                e.stopPropagation();
                cxDialog.showModal();
                return;
            }
        }

        /* Close button inside `#rs-story-crossroads-dialog` */
        const closeCxBtn = e.target.closest('#rs-story-crossroads-close');
        if (closeCxBtn) {
            const cxDialog = document.getElementById('rs-story-crossroads-dialog');
            if (cxDialog && cxDialog.open) {
                e.preventDefault();
                cxDialog.close();
            }
        }

        /* Bounding-box backdrop click dismissal for `<dialog id="rs-story-crossroads-dialog">` */
        if (e.target && e.target.id === 'rs-story-crossroads-dialog' && e.target.open) {
            const rect = e.target.getBoundingClientRect();
            const inside = (
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom
            );
            if (!inside) {
                e.target.close();
            }
        }
    }, true);

    /* Run `initOceanViewReader()` on initial load AND after every `stardust:loaded` SPA swap! */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initOceanViewReader);
    } else {
        initOceanViewReader();
    }
    document.addEventListener('stardust:loaded', initOceanViewReader);
    window.oceanViewReaderInitialized = true;
}
