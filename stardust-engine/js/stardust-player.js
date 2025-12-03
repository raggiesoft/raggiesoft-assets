/**
 * ============================================================================
 * THE STARDUST PLAYER ENGINE (v2.2 - "Ad Astra" Stability Patch)
 * ============================================================================
 * * CORE ARCHITECTURE:
 * 1. Blob Fetching Strategy: 
 * We do NOT set audio.src = URL directly. Why? Because many CDNs (like DigitalOcean)
 * struggle with HTTP 206 Partial Content ranges for HTML5 audio on some browsers.
 * Instead, we fetch the entire file as a Blob, store it in browser memory,
 * and create a temporary local ObjectURL. This guarantees gapless playback.
 * * 2. Memory Management:
 * Because we are storing audio in RAM (Blob), we must aggressively clean up
 * old blobs using URL.revokeObjectURL() every time the track changes to prevent
 * the browser from crashing due to memory leaks.
 * * 3. State Persistence:
 * User preferences (Shuffle/Repeat) are saved to LocalStorage so they persist
 * across page reloads.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. SAFETY CHECK ---
    // We look for the global JSON playlist variable injected by PHP.
    // If it's missing, we abort immediately to prevent JS errors.
    if (typeof window.STARDUST_PLAYLIST === 'undefined' || window.STARDUST_PLAYLIST.length === 0) {
        console.warn("Stardust Player: No playlist found. (Is the PHP injector running?)");
        return;
    }

    // --- 2. GLOBAL VARIABLES ---
    const playlist = window.STARDUST_PLAYLIST;
    let currentIndex = -1;       // Tracks the currently playing song index
    let currentBlobUrl = null;   // Holds the memory reference to the audio file

    // --- 3. PLAYBACK STATE & SETTINGS ---
    const REPEAT_MODES = ['none', 'all', 'one', 'album'];
    let repeatMode = 'none';
    let isShuffle = false;

    // Restore user preferences from LocalStorage if they exist
    try {
        const savedRepeat = localStorage.getItem('stardust_repeat_mode');
        if (REPEAT_MODES.includes(savedRepeat)) repeatMode = savedRepeat;
        
        const savedShuffle = localStorage.getItem('stardust_shuffle_mode');
        if (savedShuffle === 'true') isShuffle = true;
    } catch (e) {
        console.warn("LocalStorage access denied. Settings will not persist.");
    }

    // --- 4. DOM CACHE ---
    // We cache all elements upfront to improve performance.
    const dom = {
        player: document.getElementById('sticky-audio-player'),   // The fixed bottom bar
        audio: document.getElementById('main-audio-element'),     // The hidden HTML5 <audio> tag
        
        // Metadata Elements (In the Player Bar)
        title: document.getElementById('player-track-title'),
        art: document.getElementById('player-album-art'),
        
        // Control Buttons
        btnPrev: document.getElementById('player-prev'),
        btnNext: document.getElementById('player-next'),
        btnRepeat: document.getElementById('player-repeat'),
        btnShuffle: document.getElementById('player-shuffle'),
        btnLyrics: document.getElementById('player-lyrics'),
        btnClose: document.getElementById('btn-close-player'),
        
        // Lyrics Modal (Bootstrap Component)
        modalElement: document.getElementById('lyricsModal'),
        modalTitle: document.getElementById('lyricsModalTitle'),
        modalContent: document.getElementById('lyricsContent')
    };
    
    // Initialize the Bootstrap Modal instance for programmatic control
    const bsModal = new bootstrap.Modal(dom.modalElement);


    // ========================================================================
    // LOGIC ENGINE: NAVIGATION & STATE
    // ========================================================================

    /**
     * HELPER: getRandomIndex()
     * Returns a random index that is NOT the current index (if possible).
     * Used for Shuffle mode.
     */
    function getRandomIndex() {
        let newIndex = Math.floor(Math.random() * playlist.length);
        // Simple retry logic to avoid playing the same song twice in a row
        if (newIndex === currentIndex && playlist.length > 1) {
            newIndex = (newIndex + 1) % playlist.length;
        }
        return newIndex;
    }

    /**
     * HELPER: getNextIndex()
     * Calculates which song to play next based on Repeat Mode and Shuffle.
     * @param {number} direction - 1 for Next, -1 for Previous
     */
    function getNextIndex(direction = 1) {
        if (playlist.length === 0) return -1;

        // PRIORITY 1: Shuffle (overrides normal order)
        if (isShuffle && repeatMode !== 'one') return getRandomIndex();
        
        // PRIORITY 2: Repeat One (Always returns current index)
        if (repeatMode === 'one') return currentIndex;

        // PRIORITY 3: Album Repeat (Complex Logic)
        // Finds other tracks in the playlist that belong to the SAME album.
        if (repeatMode === 'album') {
            const currentTrack = playlist[currentIndex];
            const currentAlbum = currentTrack.album;
            const albumIndices = [];
            
            // Map all indices belonging to this album
            playlist.forEach((track, idx) => {
                if (track.album === currentAlbum) albumIndices.push(idx);
            });
            
            // Find where we are in that subset and move relative to it
            let internalPos = albumIndices.indexOf(currentIndex);
            internalPos += direction;
            
            // Loop within the album subset
            if (internalPos >= albumIndices.length) internalPos = 0;
            if (internalPos < 0) internalPos = albumIndices.length - 1;
            
            return albumIndices[internalPos];
        }

        // PRIORITY 4: Normal Linear Navigation
        let nextIndex = currentIndex + direction;
        
        if (repeatMode === 'all') {
            // Wrap around playlist edges
            if (nextIndex >= playlist.length) nextIndex = 0;
            if (nextIndex < 0) nextIndex = playlist.length - 1;
        } else {
            // Hard Stop at playlist edges
            if (nextIndex >= playlist.length || nextIndex < 0) nextIndex = -1;
        }
        return nextIndex;
    }

    /**
     * UI UPDATE: updateControlUI()
     * Refreshes the button states (Active/Inactive colors and Icons)
     * based on the current repeat/shuffle variables.
     */
    function updateControlUI() {
        // 1. Update Repeat Button
        const rIcon = dom.btnRepeat.querySelector('i');
        dom.btnRepeat.className = 'btn btn-sm ' + (repeatMode === 'none' ? 'btn-outline-secondary' : 'btn-outline-primary active');
        
        // Icon Switching logic
        if (repeatMode === 'one') rIcon.className = 'fa-solid fa-repeat-1';
        else if (repeatMode === 'album') rIcon.className = 'fa-duotone fa-compact-disc';
        else rIcon.className = 'fa-solid fa-repeat';
        
        dom.btnRepeat.title = "Repeat: " + repeatMode.charAt(0).toUpperCase() + repeatMode.slice(1);
        
        // 2. Update Shuffle Button
        dom.btnShuffle.className = 'btn btn-sm ' + (isShuffle ? 'btn-outline-primary active' : 'btn-outline-secondary');
        
        // 3. Update Navigation Buttons (Disable if at end of list and no repeat)
        dom.btnPrev.disabled = (repeatMode !== 'all' && repeatMode !== 'album' && !isShuffle && currentIndex === 0);
        dom.btnNext.disabled = (repeatMode !== 'all' && repeatMode !== 'album' && !isShuffle && currentIndex === playlist.length - 1);
    }


    // ========================================================================
    // CORE ENGINE: AUDIO LOADING & PLAYBACK
    // ========================================================================

    /**
     * CORE FUNCTION: loadTrack()
     * The heart of the player. Handles fetching, blob creation, UI updates,
     * and audio triggering.
     * * @param {number} index - The playlist index to load.
     * @param {boolean} autoPlay - Whether to start playing immediately.
     */
    window.loadTrack = function(index, autoPlay = true) {
        if (index < 0 || index >= playlist.length) return;

        // STEP A: GARBAGE COLLECTION
        // Critical: Free up browser memory from the PREVIOUS song's blob.
        if (currentBlobUrl) {
            URL.revokeObjectURL(currentBlobUrl);
            currentBlobUrl = null;
        }

        currentIndex = index;
        const track = playlist[index];

        // STEP B: UI FEEDBACK (BUFFERING STATE)
        // Show the player if hidden
        dom.player.classList.remove('d-none');
        
        // 1. Set Player Bar to "Buffering..." status
        dom.title.innerHTML = `
            <span class="spinner-border spinner-border-sm text-primary me-2" role="status"></span>
            <span class="text-muted fst-italic">Buffering ${track.title}...</span>
        `;
        dom.art.src = track.artwork;

        // 2. Update the Tracklist (if visible on page)
        // Reset all other rows to default state
        document.querySelectorAll('.track-row').forEach(row => {
            row.classList.remove('bg-primary', 'bg-opacity-25');
            const icon = row.querySelector('.play-indicator');
            if(icon) icon.className = 'fa-duotone fa-play-circle fs-4 text-primary opacity-50 play-indicator';
        });
        
        // Highlight the active row with a loading spinner
        const activeRow = document.getElementById('track-row-' + index);
        if(activeRow) {
            activeRow.classList.add('bg-primary', 'bg-opacity-25');
            const icon = activeRow.querySelector('.play-indicator');
            if(icon) icon.className = 'spinner-border spinner-border-sm text-light play-indicator'; 
        }

        // Update Metadata for Lyrics Modal
        dom.btnLyrics.setAttribute('data-title', track.title);
        dom.btnLyrics.setAttribute('data-url', track.lyrics);
        
        updateControlUI(); 

        // STEP C: NETWORK FETCH
        // We perform a Fetch request to download the OGG/MP3 file as raw data (Blob).
        fetch(track.src)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
                return response.blob(); // Convert response to Blob
            })
            .then(blob => {
                // STEP D: PLAYBACK INITIALIZATION
                // Create a local URL pointing to the Blob in memory
                currentBlobUrl = URL.createObjectURL(blob);
                dom.audio.src = currentBlobUrl;
                
                // Update UI to "Success" state
                dom.title.textContent = track.title;
                if(activeRow) {
                    const icon = activeRow.querySelector('.play-indicator');
                    if(icon) icon.className = 'fa-duotone fa-volume-high fs-4 text-white play-indicator';
                }

                // Trigger Audio Element
                dom.audio.load(); 
                if (autoPlay) {
                    // Note: Browsers may block autoplay if user hasn't interacted with page yet.
                    dom.audio.play().catch(e => console.warn("Autoplay blocked by browser policy:", e));
                }

                // STEP E: MEDIA SESSION API (LOCK SCREEN SUPPORT)
                // This allows control from keyboard media keys, smartwatches, and mobile lock screens.
                if ('mediaSession' in navigator) {
                    navigator.mediaSession.metadata = new MediaMetadata({
                        title: track.title, 
                        artist: track.artist, 
                        album: track.album,
                        artwork: [
                            { src: track.artwork, sizes: '96x96', type: 'image/jpeg' },
                            { src: track.artwork, sizes: '512x512', type: 'image/jpeg' }
                        ]
                    });
                    
                    // Bind hardware keys to our logic
                    navigator.mediaSession.setActionHandler('previoustrack', () => loadTrack(getNextIndex(-1)));
                    navigator.mediaSession.setActionHandler('nexttrack', () => loadTrack(getNextIndex(1)));
                    navigator.mediaSession.setActionHandler('play', () => dom.audio.play());
                    navigator.mediaSession.setActionHandler('pause', () => dom.audio.pause());
                }
            })
            .catch(err => {
                console.error("Playback Error:", err);
                dom.title.innerHTML = `<span class="text-danger"><i class="fa-duotone fa-triangle-exclamation me-2"></i>Load Failed</span>`;
                if(activeRow) {
                    const icon = activeRow.querySelector('.play-indicator');
                    if(icon) icon.className = 'fa-duotone fa-circle-exclamation fs-4 text-danger play-indicator';
                }
            });
    };


    // ========================================================================
    // FEATURE: LYRICS & LORE PARSER
    // ========================================================================

    /**
     * FEATURE: openLyrics()
     * Fetches the Markdown (.md) lyrics file and converts it into styled HTML on the fly.
     * This handles custom headers like **LORE NOTE:**
     */
    window.openLyrics = function(title, url) {
        // 1. Set Loading State
        dom.modalTitle.textContent = title;
        dom.modalContent.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-2 font-monospace">Retrieving data from the Vault...</p>
            </div>`;
        
        bsModal.show();

        // 2. Fetch MD File (with cache busting ?v=timestamp to ensure fresh lore)
        fetch(url + "?v=" + Date.now())
            .then(response => {
                if (!response.ok) throw new Error("Lore file not found.");
                return response.text();
            })
            .then(text => {
                // 3. Parse Markdown
                // Sanitize HTML tags to prevent XSS
                let safeText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                
                // Split file by double newlines (paragraphs)
                let blocks = safeText.split(/\n\s*\n/);

                // Process each block
                let htmlOutput = blocks.map(block => {
                    let lines = block.trim().split(/\n/);
                    if (lines.length === 0) return '';

                    let headerHtml = '';
                    let contentLines = lines;
                    let firstLine = lines[0].trim();

                    // Detect "**HEADER:**" pattern (e.g., **LORE NOTE:**)
                    if (firstLine.match(/^\*\*[A-Z ]+:\*\*$/)) {
                        let cleanHeader = firstLine.replace(/\*\*/g, ''); // Strip stars
                        headerHtml = `<h4 class="text-warning fw-bold border-bottom border-secondary pb-2 mb-3 mt-2">${cleanHeader}</h4>`;
                        contentLines = lines.slice(1); // Remove header from body
                    }
                    // Detect "[Section Header]" pattern (e.g., [Chorus])
                    else if (firstLine.match(/^[\(\[].*?[\)\]]$/)) {
                        headerHtml = `<h5 class="text-info fw-bold text-uppercase mb-2 mt-2">${firstLine}</h5>`;
                        contentLines = lines.slice(1);
                    }

                    // Bold specific text within lines
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

                // 4. Render
                dom.modalContent.innerHTML = `<div class="p-3">${htmlOutput}</div>`;
            })
            .catch(err => {
                dom.modalContent.innerHTML = `<div class="alert alert-warning m-3">Data Corrupted. Unable to retrieve lyrics.</div>`;
            });
    };


    // ========================================================================
    // EVENT BINDINGS
    // ========================================================================
    
    // 1. Bind Track List Buttons (Play)
    // We use event delegation implicitly by selecting all buttons currently on page
    document.querySelectorAll('.btn-play-index').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering parent row click
            loadTrack(parseInt(btn.getAttribute('data-index')));
        });
    });

    // 2. Bind Track List Buttons (Lyrics)
    document.querySelectorAll('.btn-view-lyrics').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openLyrics(btn.getAttribute('data-title'), btn.getAttribute('data-url'));
        });
    });

    // 3. Player Bar Controls
    dom.btnPrev.onclick = () => { let idx = getNextIndex(-1); if(idx !== -1) loadTrack(idx); };
    dom.btnNext.onclick = () => { let idx = getNextIndex(1); if(idx !== -1) loadTrack(idx); };
    
    // Use button attributes (set during loadTrack) to fetch correct lyrics
    dom.btnLyrics.onclick = () => openLyrics(dom.btnLyrics.getAttribute('data-title'), dom.btnLyrics.getAttribute('data-url'));
    
    // Close Button (Hides player, stops audio)
    dom.btnClose.onclick = () => {
        dom.audio.pause();
        dom.player.classList.add('d-none');
    };

    // Settings Toggles
    dom.btnRepeat.onclick = () => {
        // Cycle through: none -> all -> one -> album
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

    // 4. Auto-Advance Logic
    // When a song ends, decide what to do next based on settings
    dom.audio.onended = () => {
        if(repeatMode === 'one') {
            dom.audio.currentTime = 0;
            dom.audio.play();
        } else {
            let idx = getNextIndex(1); // Get next song index
            if(idx !== -1) loadTrack(idx); // Play if valid
        }
    };

    // Initialize UI on Load
    updateControlUI();
});