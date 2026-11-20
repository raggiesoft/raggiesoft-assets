/**
 * ============================================================================
 * READ-ALONG TEACHING OVERVIEW: hero-image.js
 * ============================================================================
 * WHAT THIS FILE IS:
 *   An accessible background-image cross-fader ("Hero Rotator") that gently
 *   cycles full-bleed hero artwork every 8 seconds using two stacked CSS
 *   background layers.
 *
 * WHICH WEBSITES LOAD IT:
 *   Loaded from `https://assets.raggiesoft.com/common/js/hero-image.js` on
 *   `raggiesoft.com` immersive pages (such as `/contact` and `/about`), paired
 *   with `.immersive-container` and `.hero-bg-layer` styles in `raggiesoft-grid.css`.
 *
 * WHAT INPUTS IT CONSUMES:
 *   1. A `.hero-rotator-container` wrapper element in the HTML with a
 *      `data-images='["/path/one.jpg", "/path/two.jpg"]'` JSON attribute.
 *   2. Two child `<div>` elements inside that container:
 *      - `.hero-bg-layer-1` (visible initially at `opacity: 1`)
 *      - `.hero-bg-layer-2` (hidden initially at `opacity: 0`)
 *   3. Operating-system motion preference (`prefers-reduced-motion: reduce`).
 *   4. Both full page loads (`DOMContentLoaded`) and Elara SPA soft transitions
 *      (`elara:loaded`).
 *
 * WHAT VISIBLE UI IT PRODUCES:
 *   - Every 8 seconds, picks a random *different* image from `data-images`,
 *     loads it onto whichever background layer is currently invisible (`0`),
 *     and flips their `opacity` values (`1` <-> `0`). Because `.hero-bg-layer`
 *     has `transition: opacity 1.8s ease-in-out` in CSS, the two layers
 *     dissolve smoothly into one another without a white flash!
 *
 * 100-LEVEL JAVASCRIPT CONCEPTS TAUGHT IN THIS FILE:
 *   - IIFEs (`(function() { ... })()`): Wrapping a file in an Immediately
 *     Invoked Function Expression so variables like `activeInterval` stay
 *     private instead of polluting `window`.
 *   - Double-Buffering (`activeLayer = 1` vs `2`): Why cross-fading CSS
 *     `background-image` requires two stacked `<div>` layers.
 *   - Timer Cleanup (`clearInterval`): Preventing runaway background timers
 *     when navigating between pages in a Single Page Application (SPA).
 * ============================================================================
 */
(function() {
    /* Private module state: holds the numeric timer ID returned by `setInterval()`
     * so we can cancel an old page's timer whenever the user navigates to a new page. */
    let activeInterval = null;

    /**
     * Initializes (or re-initializes) the hero image cross-fade loop for the
     * current page's `.hero-rotator-container`, if one exists.
     */
    function initHeroRotator() {
        /* STEP 1: CLEAN UP ANY PREVIOUS TIMER
         * In an SPA (`elara-spa.js`), moving from `/about` to `/home` swaps the
         * page HTML without reloading the browser tab. Clearing `activeInterval`
         * ensures we never leave orphaned 8-second timers running in memory! */
        if (activeInterval) {
            clearInterval(activeInterval);
            activeInterval = null;
        }

        /* STEP 2: LOCATE THE HERO CONTAINER & READ ITS JSON CONFIGURATION
         * If the current page doesn't have `.hero-rotator-container`, exit quietly. */
        const container = document.querySelector('.hero-rotator-container');
        if (!container) return;

        /* HTML attributes are always strings, so `data-images` holds raw JSON text
         * like `["/raggiesoft-corporate/images/bg1.webp", "/.../bg2.webp"]`. */
        const rawImages = container.getAttribute('data-images');
        if (!rawImages) return;

        /* Parse the JSON string into a real JavaScript Array inside a `try/catch`
         * block so a typo in HTML never crashes the rest of the page's scripts. */
        let images;
        try {
            images = JSON.parse(rawImages);
        } catch (e) {
            console.error("Hero Rotator: Invalid JSON in data-images");
            return;
        }

        /* Base URL prepended whenever an entry in `data-images` is a root-relative
         * CDN path (e.g. `"/raggiesoft-books/..."`) instead of a full `https://` URL. */
        const cdnBase = "https://assets.raggiesoft.com";
        const intervalTime = 8000; // Rotate once every 8,000 milliseconds (8 seconds)

        /* If there are 0 or 1 images, there is nothing to rotate between! */
        if (!images || images.length < 2) return;

        /* Grab the two stacked background `<div>` layers ("double buffer"). */
        const bg1 = container.querySelector('.hero-bg-layer-1');
        const bg2 = container.querySelector('.hero-bg-layer-2');
        if (!bg1 || !bg2) return;

        /* STEP 3: DETECT OR REPAIR THE INITIAL LAYER-1 IMAGE
         * Server-Side Rendering (SSR) usually pre-fills `bg1.style.backgroundImage`
         * so the hero appears immediately before JS runs. Here we check which array
         * index SSR rendered so our first rotation won't pick the exact same image. */
        let currentIndex = 0;
        const initialBg = bg1.style.backgroundImage || '';
        let matched = false;
        for (let i = 0; i < images.length; i++) {
            if (initialBg.includes(images[i])) {
                currentIndex = i;
                matched = true;
                break;
            }
        }
        /* Fallback: if SSR didn't set a matching inline background on `bg1`,
         * populate `bg1` with `images[0]` right now and make sure it's visible. */
        if (!matched) {
            const firstPath = images[0];
            const firstUrl = firstPath.startsWith('http') ? firstPath : cdnBase + firstPath;
            bg1.style.backgroundImage = `url('${firstUrl}')`;
            bg1.style.opacity = '1';
        }

        /* STEP 4: WCAG 2.1 AA / SECTION 508 MOTION SAFETY
         * Users with vestibular disorders or motion sensitivity can enable
         * "Reduce Motion" in macOS, iOS, Windows, Android, or Linux settings.
         * If enabled, we keep the static initial hero image and DO NOT start
         * the automatic cross-fade timer. */
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        /* Tracks which of the two layers (`1` or `2`) is currently showing on screen. */
        let activeLayer = 1;

        /**
         * STEP 5: DOUBLE-BUFFERED CROSS-FADE FUNCTION
         * Why two layers? If you overwrite `backgroundImage` on a single visible
         * `<div>`, it snaps abruptly (or flickers blank while downloading).
         * With two stacked layers (`bg1` and `bg2`), we set the new URL on the
         * HIDDEN layer (`opacity: 0`), then fade the hidden layer UP to `1`
         * while fading the old layer DOWN to `0` simultaneously!
         */
        function rotateImage() {
            /* Pick a random index guaranteed to differ from `currentIndex`
             * (safe because we already verified `images.length >= 2` above). */
            let nextIndex = currentIndex;
            while (nextIndex === currentIndex) {
                nextIndex = Math.floor(Math.random() * images.length);
            }
            currentIndex = nextIndex;

            /* Support both full URLs (`https://...`) and relative CDN paths (`/path/...`). */
            const imgPath = images[currentIndex];
            const fullUrl = imgPath.startsWith('http') ? imgPath : cdnBase + imgPath;
            const nextImageUrl = `url('${fullUrl}')`;

            /* Swap whichever layer is currently hidden to become the new visible layer. */
            if (activeLayer === 1) {
                bg2.style.backgroundImage = nextImageUrl;
                bg2.style.opacity = '1';
                bg1.style.opacity = '0';
                activeLayer = 2;
            } else {
                bg1.style.backgroundImage = nextImageUrl;
                bg1.style.opacity = '1';
                bg2.style.opacity = '0';
                activeLayer = 1;
            }
        }

        /* Start the repeating 8-second interval and store its handle for cleanup. */
        activeInterval = setInterval(rotateImage, intervalTime);
    }

    /* STEP 6: LIFECYCLE HOOKS
     * 1. Call `initHeroRotator()` immediately in case this `<script>` was loaded
     *    at the bottom of `<body>` or dynamically after `DOMContentLoaded` already fired.
     * 2. Listen for `DOMContentLoaded` for standard `<head defer>` / initial loads.
     * 3. Listen for `elara:loaded` so soft SPA navigations (`elara-spa.js`) start or
     *    stop the rotator cleanly whenever a new page swaps into the DOM. */
    initHeroRotator();
    document.addEventListener('DOMContentLoaded', initHeroRotator);
    document.addEventListener('elara:loaded', initHeroRotator);
})();
