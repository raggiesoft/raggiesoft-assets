/**
 * ============================================================================
 * CINEMA CAROUSEL
 * RaggieSoft Corporate Hero Component Script
 * ============================================================================
 * Architecture: UI Component Script
 * Purpose: Manages the interactive and autoplay logic for the "Cinema Carousel",
 *          a full-width, immersive image/video slider typically used in 
 *          hero sections.
 * 
 * Key Features:
 * - Next/Previous manual navigation via scroll snapping.
 * - Auto-advance (autoplay) every 6 seconds.
 * - WCAG Compliance: Respects 'prefers-reduced-motion' (disables autoplay
 *   and smooth scrolling).
 * - WCAG Compliance: Pauses autoplay on hover or touch interaction.
 * - Elara SPA Compatibility: Listens for both `DOMContentLoaded` and 
 *   `elara:loaded` events to initialize correctly within single-page apps.
 * 
 * Future Maintenance Notes:
 * - The logic uses horizontal scrolling (`carousel.scrollTo`) rather than 
 *   CSS transforms (`translate`). Ensure the CSS backing this component 
 *   utilizes `scroll-snap-type: x mandatory` for smooth snapping.
 * - Button event listeners use the "clone and replace" pattern to prevent 
 *   duplicate event bindings if `initializeCinemaCarousel` is fired multiple 
 *   times by the Elara router.
 * ============================================================================
 */

console.log('CINEMA CAROUSEL SCRIPT FILE LOADED');

/**
 * ----------------------------------------------------------------------------
 * CORE INITIALIZATION FUNCTION
 * ----------------------------------------------------------------------------
 * Locates the carousel DOM elements, calculates scroll bounds, and sets up
 * event listeners for manual and automatic playback.
 */
function initializeCinemaCarousel() {
    const carousel = document.getElementById('cinemaCarousel');
    console.log('initializeCinemaCarousel fired! Found carousel:', carousel);
    
    // Select all navigation buttons (allows multiple UI controls for the same carousel)
    const prevBtns = document.querySelectorAll('.cinema-prev');
    const nextBtns = document.querySelectorAll('.cinema-next');
    
    let autoplayInterval;
    const autoplayDelay = 6000; // 6 seconds
    
    // WCAG: Check for reduced motion preference in the OS/Browser settings
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Proceed only if the carousel element exists on the current page
    if(carousel) {
        
        /**
         * SCROLL NEXT
         * Advances the carousel to the right by exactly one client width.
         * Loops back to the start if at the end.
         */
        const scrollNext = () => {
            // Respect user motion preferences for the scroll animation
            const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';
            console.log('Scroll Next Fired. Current Left:', carousel.scrollLeft);
            
            // If current scroll position + viewport width reaches the total width (with 50px tolerance)
            if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 50) {
                // Wrap around to the beginning
                carousel.scrollTo({ left: 0, behavior: scrollBehavior });
            } else {
                // Scroll one full viewport width to the right
                carousel.scrollTo({ left: carousel.scrollLeft + carousel.clientWidth, behavior: scrollBehavior });
            }
        };
        
        /**
         * SCROLL PREVIOUS
         * Reverses the carousel to the left by exactly one client width.
         * Loops to the end if at the beginning.
         */
        const scrollPrev = () => {
            const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';
            console.log('Scroll Prev Fired. Current Left:', carousel.scrollLeft);
            
            // If we are at or very near the start (50px tolerance)
            if (carousel.scrollLeft <= 50) {
                // Wrap around to the very end
                carousel.scrollTo({ left: carousel.scrollWidth, behavior: scrollBehavior });
            } else {
                // Scroll one full viewport width to the left
                carousel.scrollTo({ left: carousel.scrollLeft - carousel.clientWidth, behavior: scrollBehavior });
            }
        };
        
        /**
         * NAVIGATION EVENT BINDING (PREVIOUS)
         * Ensure clean binding by cloning the node, effectively stripping 
         * any previously attached event listeners. This prevents double-fires 
         * during Elara SPA navigations.
         */
        prevBtns.forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                scrollPrev();
                resetAutoplay(); // Reset the timer so it doesn't auto-advance immediately after a click
            });
        });
        
        /**
         * NAVIGATION EVENT BINDING (NEXT)
         */
        nextBtns.forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                scrollNext();
                resetAutoplay();
            });
        });

        /**
         * AUTOPLAY LOGIC
         */
        const startAutoplay = () => {
            // WCAG: Never start autoplay if the user prefers reduced motion
            if (!prefersReducedMotion) {
                autoplayInterval = setInterval(scrollNext, autoplayDelay);
            }
        };

        const stopAutoplay = () => {
            if (autoplayInterval) {
                clearInterval(autoplayInterval);
            }
        };

        const resetAutoplay = () => {
            stopAutoplay();
            startAutoplay();
        };

        /**
         * WCAG: PAUSE ON INTERACTION
         * Pauses the carousel when the user hovers over it with a mouse 
         * or touches it on a mobile device.
         */
        const parent = carousel.parentElement;
        
        // Wait, cloning the parent breaks all children bindings!
        // Instead of cloneNode, we can just bind it. Multiple bindings of the same 
        // named function works if we reference it, or we just trust Elara replaces 
        // the DOM so old bindings die anyway.
        
        // Attach standard mouse events
        parent.addEventListener('mouseenter', stopAutoplay);
        parent.addEventListener('mouseleave', startAutoplay);
        
        // Attach touch events for mobile devices (using passive: true for scroll performance)
        parent.addEventListener('touchstart', stopAutoplay, {passive: true});
        parent.addEventListener('touchend', startAutoplay, {passive: true});

        // Initialize by starting the autoplay sequence
        startAutoplay();
    }
}

/**
 * ----------------------------------------------------------------------------
 * LIFECYCLE HOOKS
 * ----------------------------------------------------------------------------
 * DOMContentLoaded: Standard full-page load initialization.
 * elara:loaded: Custom event triggered by the Elara SPA router after partial 
 *               page content is swapped.
 */
document.addEventListener('DOMContentLoaded', initializeCinemaCarousel);
document.addEventListener('elara:loaded', initializeCinemaCarousel);
