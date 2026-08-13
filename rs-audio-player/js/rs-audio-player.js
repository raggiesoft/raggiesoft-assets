/**
 * RaggieSoft Audio Player <rs-audio-player>
 *
 * REFACTORED (v2) to be DRY.
 * This component now reads the same album.json and tracks.json files
 * used by the transcoding script.
 */
class RaggieSoftAudioPlayer extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.audio = new Audio();
        this.playlist = [];
        this.currentTrackIndex = 0;
        this.albumData = {};
        
        // --- Get Project-Agnostic Storage Key ---
        const storageId = this.getAttribute('data-storage-key-id') || 'rs-audio-player';
        this.storageKey = `${storageId}MusicEnabled`;
        this.musicEnabled = localStorage.getItem(this.storageKey) === 'true';

        // --- Internal State ---
        this.jsonBaseUrl = '';
        this.albumPath = '';
        this.showControls = true; // Default to 'album' mode
        this.lastVolume = 1;

        // --- Method Binding ---
        this.togglePlayPause = this.togglePlayPause.bind(this);
        this.toggleMasterMusic = this.toggleMasterMusic.bind(this);
        this.playNext = this.playNext.bind(this);
        this.playPrev = this.playPrev.bind(this);
        this.handleVolumeChange = this.handleVolumeChange.bind(this);
        this.toggleMute = this.toggleMute.bind(this);
    }

    /**
     * OBSERVED ATTRIBUTES
     * Watch for changes to these attributes.
     */
    static get observedAttributes() {
        // --- UPDATED: We now watch the *path* to the album folder ---
        return ['data-album-path', 'data-track-index', 'data-storage-key-id', 'data-json-base-url'];
    }

    /**
     * LIFECYCLE CALLBACK
     * Runs when the element is added to the page.
     */
    connectedCallback() {
        this.loadData();
    }

    /**
     * [REFACTORED]
     * Asynchronously fetches and processes album.json and tracks.json.
     */
    async loadData() {
        const albumPath = this.getAttribute('data-album-path');
        if (!albumPath) return;

        // --- Store paths for later use (building URLs) ---
        this.albumPath = albumPath;
        this.jsonBaseUrl = this.getAttribute('data-json-base-url') || '';
        
        // --- Check for Ambient Mode ---
        const trackIndexAttr = this.getAttribute('data-track-index');
        const isAmbientMode = trackIndexAttr !== null;
        const ambientTrackIndex = parseInt(trackIndexAttr, 10);

        try {
            // --- UPDATED: Fetch both JSON files concurrently ---
            const [albumResponse, tracksResponse] = await Promise.all([
                fetch(`${this.jsonBaseUrl}${this.albumPath}/album.json`),
                fetch(`${this.jsonBaseUrl}${this.albumPath}/tracks.json`)
            ]);

            const albumData = await albumResponse.json();
            const tracksData = await tracksResponse.json();
            
            this.albumData = albumData; // Store album metadata

            // --- Mode Selection Logic ---
            if (isAmbientMode) {
                // AMBIENT MODE: The playlist is just a single track.
                this.playlist = [tracksData.tracks[ambientTrackIndex]];
                this.audio.loop = true;
                this.showControls = false; // Hide prev/next/volume
            } else {
                // ALBUM MODE: The playlist is the full list of tracks.
                this.playlist = tracksData.tracks;
                this.audio.loop = false;
                this.showControls = true; // Show all controls
            }

            this.render();
            this.setupPlayer();

        } catch (error) {
            console.error('Error loading audio data:', error);
            if (!this.shadowRoot.innerHTML) this.render();
            this.shadowRoot.querySelector('[part="title"]').textContent = 'Error Loading';
            this.shadowRoot.querySelector('[part="artist"]').textContent = 'Check Console';
        }
    }

    /**
     * Attaches all necessary event listeners.
     */
    setupPlayer() {
        if (!this.musicEnabled) {
            this.style.display = 'none';
            return;
        }
        this.style.display = 'block';

        this.playPauseControl.addEventListener('click', this.togglePlayPause);
        this.audio.addEventListener('ended', this.playNext);
        this.audio.addEventListener('play', () => this.updatePlayPauseIcon(false));
        this.audio.addEventListener('pause', () => this.updatePlayPauseIcon(true));

        if (this.showControls) {
            if (this.prevControl) this.prevControl.addEventListener('click', this.playPrev);
            if (this.nextControl) this.nextControl.addEventListener('click', this.playNext);
            if (this.volumeSlider) this.volumeSlider.addEventListener('input', this.handleVolumeChange);
            if (this.volumeSlider) this.volumeSlider.addEventListener('sl-input', this.handleVolumeChange);
            if (this.muteControl) this.muteControl.addEventListener('click', this.toggleMute);
        }

        navigator.mediaSession.setActionHandler('play', this.togglePlayPause);
        navigator.mediaSession.setActionHandler('pause', this.togglePlayPause);
        
        if (this.showControls && this.playlist.length > 1) {
            navigator.mediaSession.setActionHandler('nexttrack', this.playNext);
            navigator.mediaSession.setActionHandler('previoustrack', this.playPrev);
        }
        
        if (this.playlist.length > 0) {
            this.loadTrack(0, false);
        }
    }
    
    /**
     * [REFACTORED]
     * Loads a track and *builds the stream URL* based on transcode logic.
     */
    loadTrack(index, shouldPlay = true) {
        if (index < 0 || index >= this.playlist.length) return;
        this.currentTrackIndex = index;
        
        const track = this.playlist[index]; // { fileName, title, disc, track }
        
        // --- NEW: Build stream URL to match transcode-all.sh ---
        const title = track.title;
        
        // JS equivalent of: tr '[:upper:]' '[:lower:]' | tr -s '[:punct:]' '' | tr ' ' '-'
        const webSafeTitle = title.toLowerCase()
                                .replace(/[^\w\s-]/g, '') // Remove non-word, non-space, non-hyphen
                                .replace(/[\s_]+/g, '-')   // Replace spaces/underscores with one hyphen
                                .replace(/-+/g, '-');      // Collapse multiple hyphens
        
        const trackPadded = String(track.track).padStart(2, '0');
        const outputBaseName = `${track.disc}-${trackPadded}-${webSafeTitle}`;
        
        // Use OGG for streaming, as defined in transcode script
        this.audio.src = `${this.jsonBaseUrl}/${this.albumPath}/ogg/${outputBaseName}.ogg`;
        // --- END: URL Builder ---

        // --- UPDATED: Read from album.json keys ---
        this.updateUIText(track.title, this.albumData.albumArtist);
        this.updateMediaSession(track);

        if (shouldPlay) {
            this.audio.play().catch(e => console.warn("Audio play prevented by browser."));
        }
    }
    
    togglePlayPause() {
        if (this.audio.paused) {
            if (!this.audio.src) this.loadTrack(0, true);
            else this.audio.play().catch(e => console.warn("Audio play prevented by browser."));
        } else {
            this.audio.pause();
        }
    }
    
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
        this.updateMasterToggleIcon();
    }
    
    playNext() {
        if (this.audio.loop) return;
        const newIndex = (this.currentTrackIndex + 1) % this.playlist.length;
        this.loadTrack(newIndex);
    }
    
    playPrev() {
        if (this.audio.loop) return;
        const newIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
        this.loadTrack(newIndex);
    }

    handleVolumeChange(event) {
        const volume = event.target.value;
        this.audio.volume = volume;
        this.audio.muted = (volume == 0);
        this.updateMuteIcon(volume == 0);
    }

    toggleMute() {
        if (this.audio.muted || this.audio.volume === 0) {
            const newVolume = this.lastVolume > 0 ? this.lastVolume : 1;
            this.audio.volume = newVolume;
            if (this.volumeSlider) this.volumeSlider.value = newVolume;
            this.audio.muted = false;
            this.updateMuteIcon(false);
        } else {
            this.lastVolume = this.audio.volume;
            this.audio.volume = 0;
            if (this.volumeSlider) this.volumeSlider.value = 0;
            this.audio.muted = true;
            this.updateMuteIcon(true);
        }
    }

    // --- UI Update Helper Methods ---

    updatePlayPauseIcon(isPaused) { 
        const iconElement = this.playPauseControl.querySelector('[data-role="icon"]');
        if (!iconElement) return;
        const playIcon = 'fa-pro-play';
        const pauseIcon = 'fa-pro-pause';
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
        if (iconElement.tagName === 'WA-ICON') iconElement.name = isMuted ? muteIcon : volumeIcon;
        else {
            iconElement.classList.toggle(muteIcon, isMuted);
            iconElement.classList.toggle(volumeIcon, !isMuted);
        }
    }
    
    updateMasterToggleIcon() {
        const event = new CustomEvent('music-toggle', {
            detail: { enabled: this.musicEnabled },
            bubbles: true,
            composed: true
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
     * [REFACTORED]
     * Updates Media Session with keys from album.json and assumes JPG art.
     */
    updateMediaSession(track) {
        // --- UPDATED: Build artwork URL from base paths and known filename ---
        const fullArtworkUrl = `${this.jsonBaseUrl}/${this.albumPath}/album-art.jpg`;

        navigator.mediaSession.metadata = new MediaMetadata({
            // --- UPDATED: Use keys from album.json ---
            title: track.title,
            artist: this.albumData.albumArtist,
            album: this.albumData.albumName,
            artwork: [
                { src: fullArtworkUrl, sizes: '512x512', type: 'image/jpeg' } // Assume JPG
            ]
        });
        navigator.mediaSession.playbackState = this.audio.paused ? "paused" : "playing";
    }

    /**
     * Finds the interactive element for a given control.
     */
    _getControlElement(slotName) {
        const slot = this.shadowRoot.querySelector(`slot[name="${slotName}"]`);
        if (!slot) return null;
        const assignedElements = slot.assignedElements({ flatten: true });
        if (assignedElements.length > 0) return assignedElements[0];
        return slot.querySelector('[data-action]');
    }

    /**
     * [REFACTORED]
     * Renders the HTML. Now uses `this.showControls` to toggle UI.
     */
    render() {
        this.shadowRoot.innerHTML = `
            <style>
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
                .track-info .title { display: block; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .track-info .artist { display: block; font-size: 0.8em; color: #a0a0a0; }
                .volume-controls { display: flex; align-items: center; gap: 0.5rem; }
                ::slotted(input[type="range"]) {
                    width: 100px;
                }
            </style>
            <div class="player-container" part="base">
                ${this.showControls ? `
                    <slot name="prev-button">
                        <wa-button part="prev-button" data-action="prev">
                            <wa-icon name="fa-pro-backward-step" data-role="icon"></wa-icon>
                        </wa-button>
                    </slot>` : ''}
                
                <slot name="play-pause-button">
                    <wa-button part="play-pause-button" size="large" data-action="play-pause">
                        <wa-icon name="fa-pro-play" data-role="icon"></wa-icon>
                    </wa-button>
                </slot>
                
                ${this.showControls ? `
                    <slot name="next-button">
                        <wa-button part="next-button" data-action="next">
                            <wa-icon name="fa-pro-forward-step" data-role="icon"></wa-icon>
                        </wa-button>
                    </slot>` : ''}
                
                <div class="track-info" part="track-info">
                    <span class="title" part="title">Music Paused</span>
                    <span class="artist" part="artist">${this.albumData.albumArtist || 'The Stardust Engine'}</span>
                </div>
                
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

        // --- Element Caching ---
        this.playPauseControl = this._getControlElement('play-pause-button');
        if (this.showControls) {
            this.prevControl = this._getControlElement('prev-button');
            this.nextControl = this._getControlElement('next-button');
            this.muteControl = this._getControlElement('mute-button');
            this.volumeSlider = this._getControlElement('volume-slider');
        }
    }
}

customElements.define('rs-audio-player', RaggieSoftAudioPlayer);