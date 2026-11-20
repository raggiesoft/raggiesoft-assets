/**
 * ============================================================================
 * READ-ALONG TEACHING OVERVIEW: cinema-carousel.js
 * ============================================================================
 * WHAT THIS FILE IS:
 *   An interactive horizontal hero slider ("Cinema Carousel") controller that
 *   powers manual Previous/Next button scrolling and accessible 6-second
 *   auto-advance with infinite wrap-around.
 *
 * WHICH WEBSITES LOAD IT:
 *   Loaded from `https://assets.raggiesoft.com/common/js/cinema-carousel.js`
 *   on RaggieSoft showcase / corporate hero pages containing `<div id="cinemaCarousel">`.
 *
 * WHAT INPUTS IT CONSUMES:
 *   1. `#cinemaCarousel`: A horizontally scrollable flex/grid track styled with
 *      CSS `scroll-snap-type: x mandatory` where each slide spans 100% of the
 *      container's visible width (`carousel.clientWidth`).
 *   2. `.cinema-prev` & `.cinema-next`: One or more Previous/Next button controls.
 *   3. `window.matchMedia('(prefers-reduced-motion: reduce)')` OS setting.
 *   4. Mouse (`mouseenter`/`mouseleave`) and touch (`touchstart`/`touchend`)
 *      events on `carousel.parentElement`, plus `DOMContentLoaded` and `elara:loaded`.
 *
 * WHAT VISIBLE UI IT PRODUCES:
 *   - Clicking Next/Prev scrolls `#cinemaCarousel` horizontally by one full
 *     slide width (`clientWidth`), wrapping seamlessly from the last slide back
 *     to slide 1 (and from slide 1 to the last slide).
 *   - Automatically advances every 6 seconds UNLESS the user prefers reduced
 *     motion or is actively hovering/touching the carousel.
 *
 * 100-LEVEL JAVASCRIPT CONCEPTS TAUGHT IN THIS FILE:
 *   - DOM Scroll Geometry (`scrollLeft`, `clientWidth`, `scrollWidth`) and why
 *     a `50px` tolerance prevents sub-pixel rounding bugs on zoomed/Retina screens.
 *   - The `cloneNode(true)` + `replaceChild` Pattern: How to strip anonymous
 *     event listeners off buttons during Single Page Application (SPA) re-inits.
 *   - Passive Touch Listeners (`{ passive: true }`): Telling mobile browsers
 *     your touch listener won't block native vertical page scrolling.
 * ============================================================================
 */

/* Diagnostic trace in DevTools Console confirming the script file was fetched. */
console.log('CINEMA CAROUSEL SCRIPT FILE LOADED');

/**
 * ----------------------------------------------------------------------------
 * CORE INITIALIZATION FUNCTION (`initializeCinemaCarousel`)
 * ----------------------------------------------------------------------------
 * Finds `#cinemaCarousel` and wires up scroll navigation, autoplay timers, and
 * WCAG-compliant hover/touch pause listeners. Safe to invoke on both initial
 * page loads and Elara SPA soft navigations.
 */
function initializeCinemaCarousel() {
    /* Look up the main scrollable track element. */
    const carousel = document.getElementById('cinemaCarousel');
    console.log('initializeCinemaCarousel fired! Found carousel:', carousel);
    
    /* `querySelectorAll` returns a list of ALL `.cinema-prev` and `.cinema-next`
     * buttons on the page (supporting layouts with both desktop side arrows and
     * mobile bottom arrows controlling the same carousel). */
    const prevBtns = document.querySelectorAll('.cinema-prev');
    const nextBtns = document.querySelectorAll('.cinema-next');
    
    /* `autoplayInterval` stores the timer ID from `setInterval()` so we can
     * pause (`clearInterval`) and restart it cleanly on user interaction. */
    let autoplayInterval;
    const autoplayDelay = 6000; // 6,000 milliseconds = 6 seconds between slides
    
    /* WCAG 2.1 AA Accessibility Check:
     * Returns `true` if the visitor turned on "Reduce Motion" in their OS settings. */
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Only run carousel setup if `#cinemaCarousel` actually exists on this page. */
    if(carousel) {
        
        /**
         * SCROLL NEXT (`scrollNext`)
         * How horizontal scroll geometry works on an element:
         *   - `carousel.clientWidth`: Width of ONE visible slide viewport (e.g. 1200px).
         *   - `carousel.scrollWidth`: Total width of ALL slides laid out side-by-side
         *     (e.g. 4 slides * 1200px = 4800px).
         *   - `carousel.scrollLeft`: How many pixels from the left edge we have
         *     already scrolled (0px on slide 1, 1200px on slide 2, ..., 3600px on slide 4).
         *
         * On the very last slide, `scrollLeft + clientWidth` equals `scrollWidth`
         * (3600 + 1200 = 4800). We subtract `50` pixels (`scrollWidth - 50`) as a
         * safety cushion because browser zoom (like 110% or 125%) can produce
         * fractional pixels like `4799.5` instead of `4800`!
         */
        const scrollNext = () => {
            /* Use instant `'auto'` jumps for reduced-motion users, `'smooth'` glide otherwise. */
            const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';
            console.log('Scroll Next Fired. Current Left:', carousel.scrollLeft);
            
            if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 50) {
                /* At the last slide -> wrap all the way back to slide 1 (`left: 0`). */
                carousel.scrollTo({ left: 0, behavior: scrollBehavior });
            } else {
                /* Otherwise -> advance right by one full viewport width (`+ clientWidth`). */
                carousel.scrollTo({ left: carousel.scrollLeft + carousel.clientWidth, behavior: scrollBehavior });
            }
        };
        
        /**
         * SCROLL PREVIOUS (`scrollPrev`)
         * Mirrors `scrollNext` in reverse:
         *   - If we are within `50px` of the left start edge (`scrollLeft <= 50`),
         *     wrap all the way to the right end (`left: carousel.scrollWidth`).
         *   - Otherwise move one slide width to the left (`scrollLeft - clientWidth`).
         */
        const scrollPrev = () => {
            const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';
            console.log('Scroll Prev Fired. Current Left:', carousel.scrollLeft);
            
            if (carousel.scrollLeft <= 50) {
                carousel.scrollTo({ left: carousel.scrollWidth, behavior: scrollBehavior });
            } else {
                carousel.scrollTo({ left: carousel.scrollLeft - carousel.clientWidth, behavior: scrollBehavior });
            }
        };
        
        /**
         * BIND PREVIOUS BUTTONS (USING THE "CLONE & REPLACE" CLEANUP PATTERN)
         * Why `btn.cloneNode(true)`?
         * In JavaScript, `cloneNode(true)` copies an HTML element and its inner
         * icons/text, WITHOUT copying any previously attached `addEventListener`
         * callbacks! Replacing `btn` with `newBtn` guarantees that if `elara:loaded`
         * runs `initializeCinemaCarousel()` a second time on the same button,
         * one click won't fire two listeners and skip two slides at once.
         */
        prevBtns.forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                scrollPrev();
                /* Restart the 6-second countdown so the carousel doesn't auto-advance
                 * 0.2 seconds right after the user manually clicked Previous! */
                resetAutoplay();
            });
        });
        
        /**
         * BIND NEXT BUTTONS (SAME CLONE & REPLACE PATTERN)
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
         * AUTOPLAY TIMER HELPERS
         * - `startAutoplay`: Starts the 6-second interval ONLY when the user has
         *   NOT requested reduced motion (`!prefersReducedMotion`).
         * - `stopAutoplay`: Cancels the active `setInterval` timer.
         * - `resetAutoplay`: Restarts a fresh full 6-second window after manual clicks.
         */
        const startAutoplay = () => {
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
         * WCAG 2.2.2 PAUSE, STOP, HIDE: PAUSE ON HOVER OR TOUCH
         * When a reader moves their mouse over the hero to read a headline or
         * touches the slide on a phone, we pause auto-rotation so the slide never
         * yanks away mid-sentence.
         *
         * Note why we do NOT `cloneNode` `parent`: cloning `parent` would also
         * replace `#cinemaCarousel` and our newly bound `.cinema-prev`/`.cinema-next`
         * buttons inside it, wiping out all the listeners we just attached above!
         *
         * `{ passive: true }` tells mobile Safari/Chrome that `stopAutoplay` and
         * `startAutoplay` will NEVER call `event.preventDefault()`, allowing the
         * browser's compositor thread to scroll the page smoothly at 60-120fps
         * without waiting on JavaScript.
         */
        const parent = carousel.parentElement;
        
        parent.addEventListener('mouseenter', stopAutoplay);
        parent.addEventListener('mouseleave', startAutoplay);
        
        parent.addEventListener('touchstart', stopAutoplay, {passive: true});
        parent.addEventListener('touchend', startAutoplay, {passive: true});

        /* Kick off automatic slide advancement (no-op if reduced motion is active). */
        startAutoplay();
    }
}

/**
 * ----------------------------------------------------------------------------
 * PAGE & SPA LIFECYCLE HOOKS
 * ----------------------------------------------------------------------------
 * - `DOMContentLoaded`: Runs once when the initial HTML document finishes parsing.
 * - `elara:loaded`: Custom event dispatched by `elara-spa.js` whenever soft
 *   navigation swaps a new page's `<main>` content into the DOM.
 */
document.addEventListener('DOMContentLoaded', initializeCinemaCarousel);
document.addEventListener('elara:loaded', initializeCinemaCarousel);
