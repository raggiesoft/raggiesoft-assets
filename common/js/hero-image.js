/**
 * RaggieSoft Immersive Hero Rotator
 * 
 * Architecture & Purpose:
 * This module manages the background image rotation for a primary "hero" container. 
 * It continuously cross-fades background images configured via data attributes.
 * 
 * Key Features:
 * - Dynamic configuration extraction from `data-images` JSON array.
 * - Graceful handling of full absolute URLs versus relative CDN paths.
 * - Accessibility (a11y) awareness: Halts animation if user prefers reduced motion.
 * - Alternating layer opacity (layer 1 vs layer 2) to achieve a smooth cross-fade effect.
 * 
 * Maintenance Notes:
 * - Requires two distinct background layer elements (`.hero-bg-layer-1`, `.hero-bg-layer-2`) inside the `.hero-rotator-container`.
 * - The rotator automatically infers its starting index based on the initial inline background injected by the backend.
 */
(function() {
    // Locate the primary hero container element in the DOM
    const container = document.querySelector('.hero-rotator-container');
    if (!container) return;

    // ----------------------------------------------------
    // CONFIGURATION EXTRACTION
    // Read config from data attributes
    // ----------------------------------------------------
    const rawImages = container.getAttribute('data-images');
    if (!rawImages) return;

    let images;
    try {
        // Attempt to parse the configured JSON array of image paths
        images = JSON.parse(rawImages);
    } catch (e) {
        // Fail gracefully if JSON configuration is malformed
        console.error("Hero Rotator: Invalid JSON in data-images");
        return;
    }

    // Centralized constant for relative CDN URL resolution
    const cdnBase = "https://assets.raggiesoft.com";
    // Define the transition interval time in milliseconds
    const intervalTime = 8000; // 8 seconds

    // ----------------------------------------------------
    // SAFETY & ACCESSIBILITY CHECKS
    // ----------------------------------------------------
    // Do not initiate rotator if less than two images are available
    if (!images || images.length < 2) return;
    
    // Check system preference for reduced motion (Accessibility compliance)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return; // Skip if user prefers reduced motion for a11y

    // Select distinct cross-fade layers by specific class hooks
    const bg1 = container.querySelector('.hero-bg-layer-1');
    const bg2 = container.querySelector('.hero-bg-layer-2');

    // Abort if structural background layers are missing
    if (!bg1 || !bg2) return;

    // ----------------------------------------------------
    // STATE INITIALIZATION
    // Match the JS currentIndex to the random image PHP injected on page load
    // ----------------------------------------------------
    let currentIndex = 0;
    const initialBg = bg1.style.backgroundImage;
    // Iterate through configured images to determine which one is currently active
    for (let i = 0; i < images.length; i++) {
        if (initialBg.includes(images[i])) {
            currentIndex = i;
            break;
        }
    }
    
    // Track which layer is currently in the foreground
    let activeLayer = 1;

    /**
     * Executes the cross-fade animation by alternating opacities between two layers 
     * and randomly selecting the next image from the array.
     */
    function rotateImage() {
        let nextIndex = currentIndex;
        // Ensure the next image is different from the currently displayed image
        while (nextIndex === currentIndex) {
            nextIndex = Math.floor(Math.random() * images.length);
        }
        currentIndex = nextIndex;
        
        // Handle absolute URLs vs Relative CDN paths
        const imgPath = images[currentIndex];
        const fullUrl = imgPath.startsWith('http') ? imgPath : cdnBase + imgPath;
        const nextImageUrl = `url('${fullUrl}')`;

        // Alternate opacity settings based on the currently active layer
        if (activeLayer === 1) {
            // Setup Layer 2 with the new image, then fade Layer 2 IN
            bg2.style.backgroundImage = nextImageUrl;
            bg2.style.opacity = '1';
            bg1.style.opacity = '0'; // Fade Layer 1 OUT
            activeLayer = 2;
        } else {
            // Setup Layer 1 with the new image, then fade Layer 1 IN
            bg1.style.backgroundImage = nextImageUrl;
            bg1.style.opacity = '1';
            bg2.style.opacity = '0'; // Fade Layer 2 OUT
            activeLayer = 1;
        }
    }

    // Register the continuous rotation interval
    setInterval(rotateImage, intervalTime);
})();