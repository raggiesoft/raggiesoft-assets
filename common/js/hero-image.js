/**
 * ============================================================================
 * RaggieSoft Immersive Hero Rotator (SSR + Elara SPA Compatible)
 * ============================================================================
 * Architecture & Purpose:
 * Manages the background image cross-fade rotation for `.hero-rotator-container`
 * elements on `/contact` and `/about` (Mission Profile).
 *
 * Key Features:
 * - Dynamic configuration extraction from `data-images` JSON array.
 * - Handles full absolute URLs and relative CDN paths on `assets.raggiesoft.com`.
 * - Respects `prefers-reduced-motion: reduce` (WCAG 2.1 AA / Section 508).
 * - Automatically binds on both initial page load and `elara:loaded` SPA transitions.
 * ============================================================================
 */
(function() {
    let activeInterval = null;

    function initHeroRotator() {
        if (activeInterval) {
            clearInterval(activeInterval);
            activeInterval = null;
        }

        const container = document.querySelector('.hero-rotator-container');
        if (!container) return;

        const rawImages = container.getAttribute('data-images');
        if (!rawImages) return;

        let images;
        try {
            images = JSON.parse(rawImages);
        } catch (e) {
            console.error("Hero Rotator: Invalid JSON in data-images");
            return;
        }

        const cdnBase = "https://assets.raggiesoft.com";
        const intervalTime = 8000; // 8 seconds

        if (!images || images.length < 2) return;

        const bg1 = container.querySelector('.hero-bg-layer-1');
        const bg2 = container.querySelector('.hero-bg-layer-2');
        if (!bg1 || !bg2) return;

        // Ensure bg1 has a valid initial image URL even if SSR string was malformed
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
        if (!matched) {
            const firstPath = images[0];
            const firstUrl = firstPath.startsWith('http') ? firstPath : cdnBase + firstPath;
            bg1.style.backgroundImage = `url('${firstUrl}')`;
            bg1.style.opacity = '1';
        }

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        let activeLayer = 1;

        function rotateImage() {
            let nextIndex = currentIndex;
            while (nextIndex === currentIndex) {
                nextIndex = Math.floor(Math.random() * images.length);
            }
            currentIndex = nextIndex;

            const imgPath = images[currentIndex];
            const fullUrl = imgPath.startsWith('http') ? imgPath : cdnBase + imgPath;
            const nextImageUrl = `url('${fullUrl}')`;

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

        activeInterval = setInterval(rotateImage, intervalTime);
    }

    initHeroRotator();
    document.addEventListener('DOMContentLoaded', initHeroRotator);
    document.addEventListener('elara:loaded', initHeroRotator);
})();
