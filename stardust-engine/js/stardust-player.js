/**
 * Stardust Player Engine v2.1
 * Features:
 * - Media Session API (Lock Screen)
 * - Robust Lyrics Parser (Regex Headers)
 * - Repeat / Shuffle Logic
 * - Time Remaining Fix (.load())
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Validation
    if (typeof window.STARDUST_PLAYLIST === 'undefined' || window.STARDUST_PLAYLIST.length === 0) {
        console.warn("Stardust Player: No playlist found.");
        return;
    }

    const playlist = window.STARDUST_PLAYLIST;
    let currentIndex = -1;

    // 2. State & Settings
    const REPEAT_MODES = ['none', 'all', 'one', 'album'];
    let repeatMode = 'none';
    let isShuffle = false;

    // Load Prefs
    try {
        const savedRepeat = localStorage.getItem('stardust_repeat_mode');
        if (REPEAT_MODES.includes(savedRepeat)) repeatMode = savedRepeat;
        
        const savedShuffle = localStorage.getItem('stardust_shuffle_mode');
        if (savedShuffle === 'true') isShuffle = true;
    } catch (e) {}

    // 3. DOM Elements
    const dom = {
        player: document.getElementById('sticky-audio-player'),
        audio: document.getElementById('main-audio-element'),
        title: document.getElementById('player-track-title'),
        art: document.getElementById('player-album-art'),
        btnPrev: document.getElementById('player-prev'),
        btnNext: document.getElementById('player-next'),
        btnRepeat: document.getElementById('player-repeat'),
        btnShuffle: document.getElementById('player-shuffle'),
        btnLyrics: document.getElementById('player-lyrics'),
        btnClose: document.getElementById('btn-close-player'),
        // Modal (Note: We use the Bootstrap API)
        modalElement: document.getElementById('lyricsModal'),
        modalTitle: document.getElementById('lyricsModalTitle'),
        modalContent: document.getElementById('lyricsContent')
    };
    
    const bsModal = new bootstrap.Modal(dom.modalElement);

    // --- HELPER: Random Index ---
    function getRandomIndex() {
        let newIndex = Math.floor(Math.random() * playlist.length);
        if (newIndex === currentIndex && playlist.length > 1) {
            newIndex = (newIndex + 1) % playlist.length;
        }
        return newIndex;
    }

    // --- HELPER: Get Next Index ---
    function getNextIndex(direction = 1) {
        if (playlist.length === 0) return -1;

        if (isShuffle && repeatMode !== 'one') return getRandomIndex();
        if (repeatMode === 'one') return currentIndex;

        if (repeatMode === 'album') {
            const currentTrack = playlist[currentIndex];
            const currentAlbum = currentTrack.album;
            const albumIndices = [];
            playlist.forEach((track, idx) => {
                if (track.album === currentAlbum) albumIndices.push(idx);
            });
            let internalPos = albumIndices.indexOf(currentIndex);
            internalPos += direction;
            if (internalPos >= albumIndices.length) internalPos = 0;
            if (internalPos < 0) internalPos = albumIndices.length - 1;
            return albumIndices[internalPos];
        }

        let nextIndex = currentIndex + direction;
        if (repeatMode === 'all') {
            if (nextIndex >= playlist.length) nextIndex = 0;
            if (nextIndex < 0) nextIndex = playlist.length - 1;
        } else {
            if (nextIndex >= playlist.length || nextIndex < 0) nextIndex = -1;
        }
        return nextIndex;
    }

    // --- UI UPDATES ---
    function updateControlUI() {
        const rIcon = dom.btnRepeat.querySelector('i');
        dom.btnRepeat.className = 'btn btn-sm ' + (repeatMode === 'none' ? 'btn-outline-secondary' : 'btn-outline-primary active');
        
        if (repeatMode === 'one') rIcon.className = 'fa-solid fa-repeat-1';
        else if (repeatMode === 'album') rIcon.className = 'fa-duotone fa-compact-disc';
        else rIcon.className = 'fa-solid fa-repeat';
        
        dom.btnRepeat.title = "Repeat: " + repeatMode.charAt(0).toUpperCase() + repeatMode.slice(1);
        dom.btnShuffle.className = 'btn btn-sm ' + (isShuffle ? 'btn-outline-primary active' : 'btn-outline-secondary');
        
        dom.btnPrev.disabled = (repeatMode !== 'all' && repeatMode !== 'album' && !isShuffle && currentIndex === 0);
        dom.btnNext.disabled = (repeatMode !== 'all' && repeatMode !== 'album' && !isShuffle && currentIndex === playlist.length - 1);
    }

    // --- CORE: LOAD TRACK ---
    window.loadTrack = function(index, autoPlay = true) {
        if (index < 0 || index >= playlist.length) return;

        currentIndex = index;
        const track = playlist[index];

        // UI
        dom.player.classList.remove('d-none');
        dom.title.textContent = track.title;
        dom.art.src = track.artwork;

        // Highlight Active Row
        document.querySelectorAll('.track-row').forEach(row => {
            row.classList.remove('bg-primary', 'bg-opacity-25');
            const icon = row.querySelector('.play-indicator');
            if(icon) icon.className = 'fa-duotone fa-play-circle fs-4 text-primary opacity-50 play-indicator';
        });
        
        const activeRow = document.getElementById('track-row-' + index);
        if(activeRow) {
            activeRow.classList.add('bg-primary', 'bg-opacity-25');
            const icon = activeRow.querySelector('.play-indicator');
            if(icon) icon.className = 'fa-duotone fa-volume-high fs-4 text-white play-indicator';
        }

        // Audio State Reset
        dom.audio.pause();
        dom.audio.src = track.src;
        dom.audio.load(); // Forces browser to dump old duration/buffer

        // Update Metadata Buttons
        dom.btnLyrics.setAttribute('data-title', track.title);
        dom.btnLyrics.setAttribute('data-url', track.lyrics);

        // Media Session
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: track.title, artist: track.artist, album: track.album,
                artwork: [
                    { src: track.artwork, sizes: '96x96', type: 'image/jpeg' },
                    { src: track.artwork, sizes: '128x128', type: 'image/jpeg' },
                    { src: track.artwork, sizes: '192x192', type: 'image/jpeg' },
                    { src: track.artwork, sizes: '256x256', type: 'image/jpeg' },
                    { src: track.artwork, sizes: '384x384', type: 'image/jpeg' },
                    { src: track.artwork, sizes: '512x512', type: 'image/jpeg' }
                ]
            });
            navigator.mediaSession.setActionHandler('previoustrack', () => loadTrack(getNextIndex(-1)));
            navigator.mediaSession.setActionHandler('nexttrack', () => loadTrack(getNextIndex(1)));
            navigator.mediaSession.setActionHandler('play', () => dom.audio.play());
            navigator.mediaSession.setActionHandler('pause', () => dom.audio.pause());
        }

        updateControlUI();

        if (autoPlay) dom.audio.play().catch(e => console.warn("Autoplay blocked:", e));
    };

    // --- FEATURE: ROBUST LYRICS PARSER ---
    window.openLyrics = function(title, url) {
        dom.modalTitle.textContent = title;
        dom.modalContent.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-2 font-monospace">Retrieving data from the Vault...</p>
            </div>`;
        
        bsModal.show();

        fetch(url + "?v=" + Date.now())
            .then(response => {
                if (!response.ok) throw new Error("Lore file not found.");
                return response.text();
            })
            .then(text => {
                // Sanitize
                let safeText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                // Split by double newline (Paragraph blocks)
                let blocks = safeText.split(/\n\s*\n/);

                let htmlOutput = blocks.map(block => {
                    let lines = block.trim().split(/\n/);
                    if (lines.length === 0) return '';

                    let headerHtml = '';
                    let contentLines = lines;
                    let firstLine = lines[0].trim();

                    // Detect Main Headers (LORE NOTE:)
                    if (firstLine.match(/^\*\*[A-Z ]+:\*\*$/)) {
                        let cleanHeader = firstLine.replace(/\*\*/g, '');
                        headerHtml = `<h4 class="text-warning fw-bold border-bottom border-secondary pb-2 mb-3 mt-2">${cleanHeader}</h4>`;
                        contentLines = lines.slice(1);
                    }
                    // Detect Section Headers (Verse/Chorus)
                    else if (firstLine.match(/^[\(\[].*?[\)\]]$/)) {
                        headerHtml = `<h5 class="text-info fw-bold text-uppercase mb-2 mt-2">${firstLine}</h5>`;
                        contentLines = lines.slice(1);
                    }

                    // Process Bold Text in Body
                    let processedBody = contentLines.map(line => {
                        return line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-body fw-bold">$1</strong>');
                    });

                    if (contentLines.length === 0) return `<div class="mb-4">${headerHtml}</div>`;

                    return `
                        <div class="lyrics-block mb-4">
                            ${headerHtml}
                            <div style="line-height: 1.6;">${processedBody.join('<br>')}</div>
                        </div>`;
                }).join('');

                dom.modalContent.innerHTML = `<div class="p-3">${htmlOutput}</div>`;
            })
            .catch(err => {
                dom.modalContent.innerHTML = `<div class="alert alert-warning m-3">Data Corrupted. Unable to retrieve lyrics.</div>`;
            });
    };

    // --- EVENT BINDINGS ---
    
    // Direct Bindings for List Buttons
    document.querySelectorAll('.btn-play-index').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            loadTrack(parseInt(btn.getAttribute('data-index')));
        });
    });

    document.querySelectorAll('.btn-view-lyrics').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openLyrics(btn.getAttribute('data-title'), btn.getAttribute('data-url'));
        });
    });

    // Player Controls
    dom.btnPrev.onclick = () => { let idx = getNextIndex(-1); if(idx !== -1) loadTrack(idx); };
    dom.btnNext.onclick = () => { let idx = getNextIndex(1); if(idx !== -1) loadTrack(idx); };
    dom.btnLyrics.onclick = () => openLyrics(dom.btnLyrics.getAttribute('data-title'), dom.btnLyrics.getAttribute('data-url'));
    
    dom.btnClose.onclick = () => {
        dom.audio.pause();
        dom.player.classList.add('d-none');
    };

    dom.btnRepeat.onclick = () => {
        const idx = REPEAT_MODES.indexOf(repeatMode);
        repeatMode = REPEAT_MODES[(idx + 1) % REPEAT_MODES.length];
        localStorage.setItem('stardust_repeat_mode', repeatMode);
        updateControlUI();
    };

    dom.btnShuffle.onclick = () => {
        isShuffle = !isShuffle;
        localStorage.setItem('stardust_shuffle_mode', isShuffle);
        updateControlUI();
    };

    // Auto Advance
    dom.audio.onended = () => {
        if(repeatMode === 'one') {
            dom.audio.currentTime = 0;
            dom.audio.play();
        } else {
            let idx = getNextIndex(1);
            if(idx !== -1) loadTrack(idx);
        }
    };

    // Init UI State
    updateControlUI();
});