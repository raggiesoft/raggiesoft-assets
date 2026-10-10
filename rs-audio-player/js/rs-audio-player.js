/**
 * ============================================================================
 * RAGGIESOFT AUDIO PLAYER
 * Web Component: <rs-audio-player>
 * ============================================================================
 * Architecture: Custom Web Component
 * Purpose: A persistent, theme-aware audio player designed for RaggieSoft
 *          applications. It provides background music capabilities with two
 *          distinct modes:
 *          1. Album Mode: Plays an entire album sequentially.
 *          2. Ambient Mode: Loops a single track infinitely (used for atmospheric 
 *             site background music).
 * 
 * Key Features:
 * - Reads album metadata (`album.json`) and tracklists (`tracks.json`) generated 
 *   by the RaggieSoft transcoding pipeline.
 * - Dynamically constructs OGG stream URLs based on standard track formatting.
 * - Integrates with the browser's Media Session API for OS-level media controls 
 *   (e.g., keyboard media keys, lock screen controls).
 * - Utilizes Shadow DOM for style isolation, but exposes customizable `part` 
 *   attributes and slots for external theming.
 * - Persists the "music enabled" state across sessions using `localStorage`.
 * 
 * Future Maintenance Notes:
 * - This component expects tracks to be available in OGG format. If the backend 
 *   transcoding script (`transcode-all.sh`) changes its output format, the 
 *   `loadTrack` URL builder logic must be updated.
 * - `data-json-base-url` allows the JSON and audio files to be hosted on a CDN 
 *   or external server. Ensure CORS is configured properly if fetching cross-origin.
 * - The Shadow DOM is initialized in `open` mode, allowing the parent page 
 *   to manipulate its internals if absolutely necessary, though using slots 
 *   is preferred.
 * ============================================================================
 */
class RaggieSoftAudioPlayer extends HTMLElement {

    constructor() {
        super();
        // Attach an open Shadow DOM to encapsulate internal player styles
        this.attachShadow({ mode: 'open' });

        // Instantiate the core HTMLAudioElement
        this.audio = new Audio();
        
        // Initialize default internal state
        this.playlist = [];
        this.currentTrackIndex = 0;
        this.albumData = {};
        
        /**
         * --------------------------------------------------------------------
         * STORAGE CONFIGURATION
         * --------------------------------------------------------------------
         * Determine the localStorage key based on the 'data-storage-key-id' 
         * attribute. This allows multiple distinct projects on the same domain 
         * to track their "music enabled" preference independently.
         */
        const storageId = this.getAttribute('data-storage-key-id') || 'rs-audio-player';
        this.storageKey = `${storageId}MusicEnabled`;
        this.musicEnabled = localStorage.getItem(this.storageKey) === 'true';

        // --- Internal State ---
        this.jsonBaseUrl = '';
        this.albumPath = '';
        this.showControls = true; // Default to 'album' mode (showing all controls)
        this.lastVolume = 1;      // Remembers volume before muting

        /**
         * --------------------------------------------------------------------
         * METHOD BINDING
         * --------------------------------------------------------------------
         * Bind event handler methods to the component instance to ensure 
         * 'this' correctly references the web component when invoked by 
         * DOM events or the Media Session API.
         */
        this.togglePlayPause = this.togglePlayPause.bind(this);
        this.toggleMasterMusic = this.toggleMasterMusic.bind(this);
        this.playNext = this.playNext.bind(this);
        this.playPrev = this.playPrev.bind(this);
        this.handleVolumeChange = this.handleVolumeChange.bind(this);
        this.toggleMute = this.toggleMute.bind(this);
    }

    /**
     * OBSERVED ATTRIBUTES
     * Instructs the browser to notify the component via `attributeChangedCallback`
     * if any of these attributes change. (Note: The callback itself is not 
     * currently implemented in this version, but this future-proofs the component).
     */
    static get observedAttributes() {
        return ['data-album-path', 'data-track-index', 'data-storage-key-id', 'data-json-base-url'];
    }

    /**
     * LIFECYCLE CALLBACK
     * Fires automatically when the `<rs-audio-player>` element is appended 
     * to the document body. Triggers the initial data load.
     */
    connectedCallback() {
        this.loadData();
    }

    /**
     * ------------------------------------------------------------------------
     * DATA LOADING & INITIALIZATION
     * ------------------------------------------------------------------------
     * Asynchronously fetches and processes album.json and tracks.json based 
     * on the provided data attributes.
     */
    async loadData() {
        const albumPath = this.getAttribute('data-album-path');
        // Abort initialization if no path is provided
        if (!albumPath) return;

        // Store paths for later use when constructing media URLs
        this.albumPath = albumPath;
        this.jsonBaseUrl = this.getAttribute('data-json-base-url') || '';
        
        // --- Check for Ambient Mode ---
        // If a specific track index is provided, the player enters "Ambient Mode"
        const trackIndexAttr = this.getAttribute('data-track-index');
        const isAmbientMode = trackIndexAttr !== null;
        const ambientTrackIndex = parseInt(trackIndexAttr, 10);

        try {
            // Fetch both JSON manifests concurrently to improve load time
            const [albumResponse, tracksResponse] = await Promise.all([
                fetch(`${this.jsonBaseUrl}${this.albumPath}/album.json`),
                fetch(`${this.jsonBaseUrl}${this.albumPath}/tracks.json`)
            ]);

            const albumData = await albumResponse.json();
            const tracksData = await tracksResponse.json();
            
            // Store album metadata globally for UI rendering
            this.albumData = albumData; 

            /**
             * MODE SELECTION LOGIC
             * Configure playlist length, looping behavior, and UI complexity 
             * based on the determined mode.
             */
            if (isAmbientMode) {
                // AMBIENT MODE: The playlist is just a single track.
                this.playlist = [tracksData.tracks[ambientTrackIndex]];
                this.audio.loop = true; // Ambient tracks should loop infinitely
                this.showControls = false; // Hide prev/next/volume to minimize UI footprint
            } else {
                // ALBUM MODE: The playlist is the full list of tracks.
                this.playlist = tracksData.tracks;
                this.audio.loop = false; // Progress to the next track when finished
                this.showControls = true; // Show all playback controls
            }

            // Render the Shadow DOM and attach event listeners
            this.render();
            this.setupPlayer();

        } catch (error) {
            // Graceful fallback if network request or parsing fails
            console.error('Error loading audio data:', error);
            if (!this.shadowRoot.innerHTML) this.render();
            this.shadowRoot.querySelector('[part="title"]').textContent = 'Error Loading';
            this.shadowRoot.querySelector('[part="artist"]').textContent = 'Check Console';
        }
    }

    /**
     * ------------------------------------------------------------------------
     * EVENT LISTENER REGISTRATION
     * ------------------------------------------------------------------------
     * Attaches DOM event listeners to UI controls and integrates with the 
     * browser's native Media Session API.
     */
    setupPlayer() {
        // If the user has disabled music globally, hide the player immediately
        if (!this.musicEnabled) {
            this.style.display = 'none';
            return;
        }
        this.style.display = 'block';

        // Bind core playback controls
        this.playPauseControl.addEventListener('click', this.togglePlayPause);
        // Automatically advance the playlist when a track finishes
        this.audio.addEventListener('ended', this.playNext);
        // Keep UI in sync if play/pause is triggered externally (e.g., via keyboard key)
        this.audio.addEventListener('play', () => this.updatePlayPauseIcon(false));
        this.audio.addEventListener('pause', () => this.updatePlayPauseIcon(true));

        // Bind advanced controls if in Album Mode
        if (this.showControls) {
            if (this.prevControl) this.prevControl.addEventListener('click', this.playPrev);
            if (this.nextControl) this.nextControl.addEventListener('click', this.playNext);
            // Handle standard <input type="range"> as well as Web Awesome <wa-range> elements
            if (this.volumeSlider) this.volumeSlider.addEventListener('input', this.handleVolumeChange);
            if (this.volumeSlider) this.volumeSlider.addEventListener('sl-input', this.handleVolumeChange);
            if (this.muteControl) this.muteControl.addEventListener('click', this.toggleMute);
        }

        // Media Session API Integration (Allows OS-level control of the web audio)
        navigator.mediaSession.setActionHandler('play', this.togglePlayPause);
        navigator.mediaSession.setActionHandler('pause', this.togglePlayPause);
        
        if (this.showControls && this.playlist.length > 1) {
            navigator.mediaSession.setActionHandler('nexttrack', this.playNext);
            navigator.mediaSession.setActionHandler('previoustrack', this.playPrev);
        }
        
        // Pre-load the first track in the playlist without playing it
        if (this.playlist.length > 0) {
            this.loadTrack(0, false);
        }
    }
    
    /**
     * ------------------------------------------------------------------------
     * MEDIA LOADING & URL CONSTRUCTION
     * ------------------------------------------------------------------------
     * Loads a track from the playlist array and dynamically builds the stream URL
     * based on the formatting rules established by the backend transcode script.
     */
    loadTrack(index, shouldPlay = true) {
        // Boundary checking to prevent out-of-bounds errors
        if (index < 0 || index >= this.playlist.length) return;
        this.currentTrackIndex = index;
        
        const track = this.playlist[index]; // { fileName, title, disc, track }
        
        /**
         * URL BUILDER LOGIC
         * This section replicates the shell logic used in `transcode-all.sh`.
         * It converts a standard track title into a web-safe, hyphenated slug.
         */
        const title = track.title;
        
        // JS equivalent of: tr '[:upper:]' '[:lower:]' | tr -s '[:punct:]' '' | tr ' ' '-'
        const webSafeTitle = title.toLowerCase()
                                .replace(/[^\w\s-]/g, '') // Remove non-word, non-space, non-hyphen characters
                                .replace(/[\s_]+/g, '-')   // Replace spaces/underscores with a single hyphen
                                .replace(/-+/g, '-');      // Collapse multiple consecutive hyphens
        
        // Ensure the track number is zero-padded (e.g., '1' becomes '01')
        const trackPadded = String(track.track).padStart(2, '0');
        const outputBaseName = `${track.disc}-${trackPadded}-${webSafeTitle}`;
        
        // Assign the constructed OGG path to the audio element's source
        this.audio.src = `${this.jsonBaseUrl}/${this.albumPath}/ogg/${outputBaseName}.ogg`;

        // Update the visual UI and the OS-level media metadata
        this.updateUIText(track.title, this.albumData.albumArtist);
        this.updateMediaSession(track);

        if (shouldPlay) {
            // Attempt playback. Catch and suppress errors if autoplay is blocked by browser policy.
            this.audio.play().catch(e => console.warn("Audio play prevented by browser."));
        }
    }
    
    /**
     * ------------------------------------------------------------------------
     * PLAYBACK CONTROLS
     * ------------------------------------------------------------------------
     */
    togglePlayPause() {
        if (this.audio.paused) {
            // If the audio source was cleared or unloaded, reload the first track
            if (!this.audio.src) this.loadTrack(0, true);
            else this.audio.play().catch(e => console.warn("Audio play prevented by browser."));
        } else {
            this.audio.pause();
        }
    }
    
    /**
     * Toggles the global music preference and saves it to localStorage.
     * This allows users to permanently opt-out of site-wide audio.
     */
    toggleMasterMusic() {
        this.musicEnabled = !this.musicEnabled;
        localStorage.setItem(this.storageKey, this.musicEnabled);
        
        if (this.musicEnabled) {
            this.style.display = 'block';
            if (!this.audio.src && this.playlist.length > 0) this.loadTrack(0, false);
        } else {
            this.audio.pause();
            this.style.display = 'none';
        }
        
        // Dispatch a custom event so other components (like a nav bar toggle) can sync
        this.updateMasterToggleIcon();
    }
    
    playNext() {
        if (this.audio.loop) return; // Do not advance if in ambient loop mode
        const newIndex = (this.currentTrackIndex + 1) % this.playlist.length;
        this.loadTrack(newIndex);
    }
    
    playPrev() {
        if (this.audio.loop) return; // Do not regress if in ambient loop mode
        // Formula ensures negative numbers wrap around correctly to the end of the playlist
        const newIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
        this.loadTrack(newIndex);
    }

    /**
     * ------------------------------------------------------------------------
     * VOLUME CONTROLS
     * ------------------------------------------------------------------------
     */
    handleVolumeChange(event) {
        const volume = event.target.value;
        this.audio.volume = volume;
        // Automatically mute if the slider hits 0
        this.audio.muted = (volume == 0);
        this.updateMuteIcon(volume == 0);
    }

    toggleMute() {
        if (this.audio.muted || this.audio.volume === 0) {
            // Unmute: restore to previous volume, or default to 100% if previous was 0
            const newVolume = this.lastVolume > 0 ? this.lastVolume : 1;
            this.audio.volume = newVolume;
            if (this.volumeSlider) this.volumeSlider.value = newVolume;
            this.audio.muted = false;
            this.updateMuteIcon(false);
        } else {
            // Mute: save current volume and drop to 0
            this.lastVolume = this.audio.volume;
            this.audio.volume = 0;
            if (this.volumeSlider) this.volumeSlider.value = 0;
            this.audio.muted = true;
            this.updateMuteIcon(true);
        }
    }

    /**
     * ------------------------------------------------------------------------
     * UI UPDATE HELPER METHODS
     * ------------------------------------------------------------------------
     * These methods interact with the DOM elements within the Shadow Root to 
     * reflect the current state of the player.
     */

    updatePlayPauseIcon(isPaused) { 
        const iconElement = this.playPauseControl.querySelector('[data-role="icon"]');
        if (!iconElement) return;
        const playIcon = 'fa-pro-play';
        const pauseIcon = 'fa-pro-pause';
        
        // Handle both Web Awesome <wa-icon> and standard <i> tags
        if (iconElement.tagName === 'WA-ICON') iconElement.name = isPaused ? playIcon : pauseIcon;
        else {
            iconElement.classList.toggle(playIcon, isPaused);
            iconElement.classList.toggle(pauseIcon, !isPaused);
        }
    }
    
    updateMuteIcon(isMuted) { 
        if (!this.muteControl) return;
        const iconElement = this.muteControl.querySelector('[data-role="icon"]');
        if (!iconElement) return;
        const volumeIcon = 'fa-pro-volume';
        const muteIcon = 'fa-pro-volume-slash';
        
        // Handle both Web Awesome <wa-icon> and standard <i> tags
        if (iconElement.tagName === 'WA-ICON') iconElement.name = isMuted ? muteIcon : volumeIcon;
        else {
            iconElement.classList.toggle(muteIcon, isMuted);
            iconElement.classList.toggle(volumeIcon, !isMuted);
        }
    }
    
    updateMasterToggleIcon() {
        // Dispatches a global event that external UI toggles can listen to
        const event = new CustomEvent('music-toggle', {
            detail: { enabled: this.musicEnabled },
            bubbles: true,
            composed: true // Allows the event to break out of the Shadow DOM boundary
        });
        this.dispatchEvent(event);
    }
    
    updateUIText(title, artist) { 
        const titleEl = this.shadowRoot.querySelector('[part="title"]');
        const artistEl = this.shadowRoot.querySelector('[part="artist"]');
        if (titleEl) titleEl.textContent = title;
        if (artistEl) artistEl.textContent = artist;
    }
    
    /**
     * Updates the OS-level Media Session API with track metadata and album art.
     * This data is displayed on mobile lock screens, smartwatch controls, etc.
     */
    updateMediaSession(track) {
        // Build artwork URL assuming a standard 'album-art.jpg' file exists in the directory
        const fullArtworkUrl = `${this.jsonBaseUrl}/${this.albumPath}/album-art.jpg`;

        navigator.mediaSession.metadata = new MediaMetadata({
            title: track.title,
            artist: this.albumData.albumArtist,
            album: this.albumData.albumName,
            artwork: [
                { src: fullArtworkUrl, sizes: '512x512', type: 'image/jpeg' }
            ]
        });
        
        // Sync playback state with the OS
        navigator.mediaSession.playbackState = this.audio.paused ? "paused" : "playing";
    }

    /**
     * Resolves an interactive element from a slot or internal fallback.
     * Essential for allowing external developers to replace default buttons 
     * by passing their own elements into the component slots.
     */
    _getControlElement(slotName) {
        const slot = this.shadowRoot.querySelector(`slot[name="${slotName}"]`);
        if (!slot) return null;
        
        // Check if the developer provided their own element via the slot
        const assignedElements = slot.assignedElements({ flatten: true });
        if (assignedElements.length > 0) return assignedElements[0];
        
        // Otherwise, fallback to the default internal element
        return slot.querySelector('[data-action]');
    }

    /**
     * ------------------------------------------------------------------------
     * DOM RENDERING
     * ------------------------------------------------------------------------
     * Injects the component's HTML structure and isolated CSS into the Shadow Root.
     */
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                /* Host styles define the container itself (the custom tag) */
                :host {
                    display: block;
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(10, 20, 30, 0.9);
                    backdrop-filter: blur(10px);
                    padding: 0.5rem 1rem;
                    z-index: 1000;
                    border-top: 1px solid rgba(100, 120, 140, 0.3);
                }
                .player-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    max-width: 600px;
                    margin: 0 auto;
                }
                .track-info {
                    flex-grow: 1;
                    text-align: center;
                    color: #e0e0e0;
                    overflow: hidden;
                    min-width: 120px;
                }
                .track-info .title { 
                    display: block; 
                    font-weight: bold; 
                    white-space: nowrap; 
                    overflow: hidden; 
                    text-overflow: ellipsis; 
                }
                .track-info .artist { 
                    display: block; 
                    font-size: 0.8em; 
                    color: #a0a0a0; 
                }
                .volume-controls { 
                    display: flex; 
                    align-items: center; 
                    gap: 0.5rem; 
                }
                /* Target elements passed into slots from the light DOM */
                ::slotted(input[type="range"]) {
                    width: 100px;
                }
            </style>
            
            <div class="player-container" part="base">
                <!-- PREVIOUS BUTTON: Only rendered in Album Mode -->
                ${this.showControls ? `
                    <slot name="prev-button">
                        <wa-button part="prev-button" data-action="prev">
                            <wa-icon name="fa-pro-backward-step" data-role="icon"></wa-icon>
                        </wa-button>
                    </slot>` : ''}
                
                <!-- PLAY/PAUSE BUTTON: Always rendered -->
                <slot name="play-pause-button">
                    <wa-button part="play-pause-button" size="large" data-action="play-pause">
                        <wa-icon name="fa-pro-play" data-role="icon"></wa-icon>
                    </wa-button>
                </slot>
                
                <!-- NEXT BUTTON: Only rendered in Album Mode -->
                ${this.showControls ? `
                    <slot name="next-button">
                        <wa-button part="next-button" data-action="next">
                            <wa-icon name="fa-pro-forward-step" data-role="icon"></wa-icon>
                        </wa-button>
                    </slot>` : ''}
                
                <!-- TRACK METADATA -->
                <div class="track-info" part="track-info">
                    <span class="title" part="title">Music Paused</span>
                    <span class="artist" part="artist">${this.albumData.albumArtist || 'The Stardust Engine'}</span>
                </div>
                
                <!-- VOLUME CONTROLS: Only rendered in Album Mode -->
                ${this.showControls ? `
                <div class="volume-controls" part="volume-controls">
                    <slot name="mute-button">
                        <wa-button part="mute-button" data-action="mute">
                            <wa-icon name="fa-pro-volume" data-role="icon"></wa-icon>
                        </wa-button>
                    </slot>
                    <slot name="volume-slider">
                        <wa-range part="volume-slider" min="0" max="1" step="0.01" value="1" style="width: 100px; --thumb-size: 14px;"></wa-range>
                    </slot>
                </div>
                ` : ''}
            </div>
        `;

        // Cache references to the newly created DOM elements for faster event handling
        this.playPauseControl = this._getControlElement('play-pause-button');
        if (this.showControls) {
            this.prevControl = this._getControlElement('prev-button');
            this.nextControl = this._getControlElement('next-button');
            this.muteControl = this._getControlElement('mute-button');
            this.volumeSlider = this._getControlElement('volume-slider');
        }
    }
}

// Register the custom element with the browser's CustomElementRegistry
customElements.define('rs-audio-player', RaggieSoftAudioPlayer);