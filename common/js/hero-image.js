// common/js/hero-image.js
// RaggieSoft Immersive Hero Rotator
// Handles cross-fading background images defined in data attributes.

(function() {
    const container = document.querySelector('.hero-rotator-container');
    if (!container) return;

    // Read config from data attributes
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

    // Safety & A11y Checks
    if (!images || images.length < 2) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return; // Skip if user prefers reduced motion for a11y

    // Select layers by specific class hooks
    const bg1 = container.querySelector('.hero-bg-layer-1');
    const bg2 = container.querySelector('.hero-bg-layer-2');

    if (!bg1 || !bg2) return;

    // Match the JS currentIndex to the random image PHP injected on page load
    let currentIndex = 0;
    const initialBg = bg1.style.backgroundImage;
    for (let i = 0; i < images.length; i++) {
        if (initialBg.includes(images[i])) {
            currentIndex = i;
            break;
        }
    }
    
    let activeLayer = 1;

    function rotateImage() {
        let nextIndex = currentIndex;
        while (nextIndex === currentIndex) {
            nextIndex = Math.floor(Math.random() * images.length);
        }
        currentIndex = nextIndex;
        
        // Handle absolute URLs vs Relative CDN paths
        const imgPath = images[currentIndex];
        const fullUrl = imgPath.startsWith('http') ? imgPath : cdnBase + imgPath;
        const nextImageUrl = `url('${fullUrl}')`;

        if (activeLayer === 1) {
            // Fade Layer 2 IN
            bg2.style.backgroundImage = nextImageUrl;
            bg2.style.opacity = '1';
            bg1.style.opacity = '0';
            activeLayer = 2;
        } else {
            // Fade Layer 1 IN
            bg1.style.backgroundImage = nextImageUrl;
            bg1.style.opacity = '1';
            bg2.style.opacity = '0';
            activeLayer = 1;
        }
    }

    setInterval(rotateImage, intervalTime);
})();