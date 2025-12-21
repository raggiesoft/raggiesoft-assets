/**
 * ============================================================================
 * THE STARDUST PLAYER ENGINE (v4.0 - Turbo Drive Edition)
 * ============================================================================
 * UPDATED FOR SINGLE PAGE APPLICATIONS (SPA):
 * 1. Persistent State: The player logic lives in the footer and never reloads.
 * 2. Event-Driven Handoff: Listens for 'stardust:playlist-update' to switch albums.
 * 3. Dynamic Binding: Re-attaches click listeners to new "Play" buttons on every page navigation.
 */

(function() {
    // --- 1. GLOBAL STATE & CONFIGURATION ---
    let currentIndex = -1;       // Tracks the currently playing song index
    let currentBlobUrl = null;   // Holds the memory reference to the audio file
    
    // Playback Settings (Persisted in LocalStorage)
    const REPEAT_MODES = ['none', 'all', 'one', 'album'];
    let repeatMode = 'none';
    let isShuffle = false;

    // Load User Preferences
    try {
        const savedRepeat = localStorage.getItem('stardust_repeat_mode');
        if (REPEAT_MODES.includes(savedRepeat)) repeatMode = savedRepeat;
        const savedShuffle = localStorage.getItem('stardust_shuffle_mode');
        if (savedShuffle === 'true') isShuffle = true;
    } catch (e) {
        console.warn("LocalStorage access denied.");
    }

    // --- 2. DOM CACHE (Persistent Elements Only) ---
    // These elements exist in footer.php and are NEVER destroyed by Turbo.
    const dom = {
        player: document.getElementById('sticky-audio-player'),
        audio: document.getElementById('main-audio-element'),
        title: document.getElementById('player-track-title'),
        artist: document.getElementById('player-track-artist'),
        art: document.getElementById('player-album-art'),
        btnPrev: document.getElementById('player-prev'),
        btnNext: document.getElementById('player-next'),
        btnRepeat: document.getElementById('player-repeat'),
        btnShuffle: document.getElementById('player-shuffle'),
        btnLyrics: document.getElementById('player-lyrics'),
        btnClose: document.getElementById('btn-close-player'),
        modalElement: document.getElementById('lyricsModal'),
        modalTitle: document.getElementById('lyricsModalTitle'),
        modalContent: document.getElementById('lyricsContent')
    };

    let bsModal = null; // Bootstrap Modal Instance

    // ========================================================================
    // INITIALIZATION & EVENT LISTENERS
    // ========================================================================

    function initEngine() {
        if (!dom.player) return; // Safety check

        // Initialize Bootstrap Modal
        if (dom.modalElement) {
            bsModal = new bootstrap.Modal(dom.modalElement);
        }

        // Attach Persistent Controls (Footer Buttons)
        dom.btnPrev.onclick = () => { let idx = getNextIndex(-1); if(idx !== -1) loadTrack(idx); };
        dom.btnNext.onclick = () => { let idx = getNextIndex(1); if(idx !== -1) loadTrack(idx); };
        
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

        dom.btnLyrics.onclick = () => openLyrics(dom.btnLyrics.getAttribute('data-title'), dom.btnLyrics.getAttribute('data-url'));
        
        dom.btnClose.onclick = () => {
            dom.audio.pause();
            dom.player.classList.add('d-none');
        };

        // Auto-Advance Logic
        dom.audio.onended = () => {
            if(repeatMode === 'one') {
                dom.audio.currentTime = 0;
                dom.audio.play();
            } else {
                let idx = getNextIndex(1); 
                if(idx !== -1) loadTrack(idx); 
            }
        };
        
        updateControlUI();
    }

    // --- TURBO EVENT: PAGE LISTENERS ---
    // Runs every time a new page is rendered to attach clicks to the new tracklist.
    function bindPageEvents() {
        // 1. Play Buttons
        document.querySelectorAll('.btn-play-index').forEach(btn => {
            // Remove old listeners to be safe (though Turbo usually wipes them)
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                loadTrack(parseInt(newBtn.getAttribute('data-index')));
            });
        });

        // 2. Lyrics Buttons
        document.querySelectorAll('.btn-view-lyrics').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openLyrics(newBtn.getAttribute('data-title'), newBtn.getAttribute('data-url'));
            });
        });
        
        // 3. Highlight currently playing track (if it exists on this page)
        updateTracklistUI();
    }

    // --- TURBO EVENT: PLAYLIST HANDOFF ---
    // Triggered by _tracklist-downloader.php when a new album loads.
    document.addEventListener('stardust:playlist-update', (e) => {
        if(e.detail && e.detail.playlist) {
            window.STARDUST_PLAYLIST = e.detail.playlist;
            
            // If the player is currently hidden (idle), reset the UI to the new album's first track
            if (dom.player.classList.contains('d-none') && window.STARDUST_PLAYLIST.length > 0) {
                const first = window.STARDUST_PLAYLIST[0];
                dom.title.innerText = "Ready to Play";
                dom.artist.innerText = first.album; // Show Album Name as Artist initially
                dom.art.src = first.artwork;
                dom.player.classList.remove('d-none');
            }
            
            // Re-bind buttons for the new HTML
            bindPageEvents();
        }
    });

    // Run Once on Load
    document.addEventListener('DOMContentLoaded', () => {
        initEngine();
        bindPageEvents(); // Catch initial page load
    });

    // Run on every Turbo Navigation
    document.addEventListener('turbo:load', bindPageEvents);


    // ========================================================================
    // CORE LOGIC ENGINE
    // ========================================================================

    function getNextIndex(direction = 1) {
        const playlist = window.STARDUST_PLAYLIST || [];
        if (playlist.length === 0) return -1;

        if (isShuffle && repeatMode !== 'one') return getRandomIndex();
        if (repeatMode === 'one') return currentIndex;

        if (repeatMode === 'album') {
            const currentTrack = playlist[currentIndex];
            // Simple filter for same album
            const albumIndices = playlist.map((t, i) => (t.album === currentTrack.album ? i : -1)).filter(i => i !== -1);
            let internalPos = albumIndices.indexOf(currentIndex) + direction;
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

    function getRandomIndex() {
        const playlist = window.STARDUST_PLAYLIST || [];
        let newIndex = Math.floor(Math.random() * playlist.length);
        if (newIndex === currentIndex && playlist.length > 1) {
            newIndex = (newIndex + 1) % playlist.length;
        }
        return newIndex;
    }

    // ========================================================================
    // PLAYBACK & UI
    // ========================================================================

    function updateTracklistUI() {
        // Reset all rows
        document.querySelectorAll('.track-row').forEach(row => {
            row.classList.remove('bg-primary', 'bg-opacity-25');
            const icon = row.querySelector('.play-indicator');
            if(icon) icon.className = 'fa-duotone fa-play-circle fs-4 text-primary opacity-50 play-indicator';
        });

        // Highlight active row (if it exists on current page)
        const activeRow = document.getElementById('track-row-' + currentIndex);
        // Only highlight if the song playing actually matches the song in the row!
        // (Prevents highlighting "Track 1" of Album B when "Track 1" of Album A is playing)
        const playlist = window.STARDUST_PLAYLIST || [];
        const currentTrack = playlist[currentIndex];
        
        if(activeRow && currentTrack) {
            // Check if title matches (Weak check, but functional for UI)
            const rowTitle = activeRow.querySelector('strong').innerText;
            if (rowTitle.trim() === currentTrack.title.trim()) {
                 activeRow.classList.add('bg-primary', 'bg-opacity-25');
                 const icon = activeRow.querySelector('.play-indicator');
                 if(icon) icon.className = 'spinner-border spinner-border-sm text-light play-indicator';
                 // If playing, change spinner to volume icon
                 if (!dom.audio.paused) {
                    if(icon) icon.className = 'fa-duotone fa-volume-high fs-4 text-white play-indicator';
                 }
            }
        }
    }

    window.loadTrack = function(index) {
        const playlist = window.STARDUST_PLAYLIST || [];
        if (index < 0 || index >= playlist.length) return;

        // Garbage Collection
        if (currentBlobUrl) {
            URL.revokeObjectURL(currentBlobUrl);
            currentBlobUrl = null;
        }

        currentIndex = index;
        const track = playlist[index];

        // UI Updates
        dom.player.classList.remove('d-none');
        dom.title.innerHTML = `<span class="spinner-border spinner-border-sm text-primary me-2"></span>Buffering...`;
        if(dom.artist) dom.artist.textContent = track.artist;
        dom.art.src = track.artwork;
        
        dom.btnLyrics.setAttribute('data-title', track.title);
        dom.btnLyrics.setAttribute('data-url', track.lyrics);

        updateControlUI();
        updateTracklistUI();

        // Fetch & Play
        fetch(track.src)
            .then(res => {
                if(!res.ok) throw new Error(res.status);
                return res.blob();
            })
            .then(blob => {
                currentBlobUrl = URL.createObjectURL(blob);
                dom.audio.src = currentBlobUrl;
                
                dom.title.textContent = track.title;
                updateTracklistUI(); // Update icon from spinner to Volume

                dom.audio.load();
                dom.audio.play().catch(e => console.warn("Autoplay blocked:", e));
                
                // Media Session API
                if ('mediaSession' in navigator) {
                    navigator.mediaSession.metadata = new MediaMetadata({
                        title: track.title, 
                        artist: track.artist, 
                        album: track.album,
                        artwork: [{ src: track.artwork, sizes: '512x512', type: 'image/jpeg' }]
                    });
                    navigator.mediaSession.setActionHandler('previoustrack', () => loadTrack(getNextIndex(-1)));
                    navigator.mediaSession.setActionHandler('nexttrack', () => loadTrack(getNextIndex(1)));
                    navigator.mediaSession.setActionHandler('play', () => dom.audio.play());
                    navigator.mediaSession.setActionHandler('pause', () => dom.audio.pause());
                }
            })
            .catch(err => {
                console.error("Playback Error:", err);
                dom.title.innerHTML = `<span class="text-danger">Load Failed</span>`;
            });
    };

    function updateControlUI() {
        const rIcon = dom.btnRepeat.querySelector('i');
        dom.btnRepeat.className = 'btn btn-sm ' + (repeatMode === 'none' ? 'btn-outline-secondary' : 'btn-outline-primary active');
        
        if (repeatMode === 'one') rIcon.className = 'fa-solid fa-repeat-1';
        else if (repeatMode === 'album') rIcon.className = 'fa-duotone fa-compact-disc';
        else rIcon.className = 'fa-solid fa-repeat';
        
        dom.btnShuffle.className = 'btn btn-sm ' + (isShuffle ? 'btn-outline-primary active' : 'btn-outline-secondary');
        
        dom.btnPrev.disabled = (repeatMode !== 'all' && repeatMode !== 'album' && !isShuffle && currentIndex === 0);
        dom.btnNext.disabled = (repeatMode !== 'all' && repeatMode !== 'album' && !isShuffle && currentIndex === ((window.STARDUST_PLAYLIST || []).length - 1));
    }

    window.openLyrics = function(title, url) {
        if (!bsModal) return;
        dom.modalTitle.textContent = title;
        dom.modalContent.innerHTML = `<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>`;
        bsModal.show();

        fetch(url + "?v=" + Date.now())
            .then(r => r.text())
            .then(text => {
                let html = text.replace(/</g, '&lt;')
                               .replace(/\*\*(.*?)\*\*/g, '<strong class="text-body fw-bold">$1</strong>')
                               .replace(/\n/g, '<br>');
                dom.modalContent.innerHTML = `<div class="p-3 font-monospace">${html}</div>`;
            })
            .catch(() => dom.modalContent.innerHTML = `<div class="alert alert-warning">Lyrics Unavailable</div>`);
    };

})();