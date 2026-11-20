/**
 * ============================================================================
 * READ-ALONG TEACHING OVERVIEW: glowing-galaxy.js
 * ============================================================================
 * WHAT THIS FILE IS:
 *   "Stardust Labs: Glowing Galaxy" — a zero-image, zero-`<canvas>` Vanilla JS
 *   background renderer that procedurally builds either a glowing 3D-shaded CSS
 *   planet (in Light Mode) or a 120-star twinkling starfield (in Dark Mode).
 *
 * WHICH WEBSITES LOAD IT:
 *   Loaded from `https://assets.raggiesoft.com/common/js/glowing-galaxy.js` on
 *   RaggieSoft / Stardust Labs pages containing `<div id="stardust-labs-bg">`.
 *
 * WHAT INPUTS IT CONSUMES:
 *   1. Target container element `<div id="stardust-labs-bg">` in the DOM.
 *   2. Active color theme via `window.matchMedia('(prefers-color-scheme: dark)')`
 *      OR `document.documentElement.getAttribute('data-bs-theme') === 'dark'`.
 *   3. Accessibility motion preference `window.matchMedia('(prefers-reduced-motion: reduce)')`.
 *   4. Lifecycle events: `DOMContentLoaded`, `elara:loaded` (SPA navigation),
 *      and live OS dark-mode `change` events.
 *
 * WHAT VISIBLE UI IT PRODUCES:
 *   - Light Mode: Injects a centered `200px x 200px` circular `.stardust-planet`
 *     with radial-gradient 3D lighting and a gentle 10-second floating bob.
 *   - Dark Mode: Injects 120 randomly positioned, randomly sized `.stardust-particle`
 *     star `<div>`s with staggered CSS `starTwinkle` animations (or calm static
 *     opacities if the user prefers reduced motion).
 *   - Injects `<style id="stardust-galaxy-styles">` into `<head>` once with the
 *     `@keyframes starTwinkle` and `@keyframes planetFloat` definitions.
 *
 * 100-LEVEL JAVASCRIPT CONCEPTS TAUGHT IN THIS FILE:
 *   - Procedural DOM Creation (`document.createElement` + `Math.random()`).
 *   - Semaphore Attributes (`data-galaxy-rendered="true"`): Marking a container
 *     so repeated initialization calls don't append 120 *more* stars each time.
 *   - CSS `@keyframes` vs JS Loops: Offloading continuous animations to the
 *     browser's CSS compositor instead of running JavaScript 60 times a second.
 *   - Live MediaQuery Listeners (`matchMedia(...).addEventListener('change', ...)`).
 * ============================================================================
 */

/**
 * Builds (or rebuilds) the planet/starfield inside `#stardust-labs-bg` to match
 * the user's current Light/Dark theme and Reduced Motion accessibility setting.
 */
function initStardustGalaxy() {
    /* STEP 1: LOCATE CONTAINER & CHECK SEMAPHORE GUARD
     * If the current page doesn't have `#stardust-labs-bg`, or if we ALREADY
     * rendered this exact container (`data-galaxy-rendered` is present), exit
     * immediately so we never stack 240, 360, 480 stars on repeat events. */
    const container = document.getElementById('stardust-labs-bg');
    if (!container || container.hasAttribute('data-galaxy-rendered')) return;

    /* STEP 2: CLEAR & PREPARE THE STAGE
     * Wipe any leftover inner HTML and make `container` a `position: relative;
     * overflow: hidden` coordinate box. Why `position: relative`? Because an
     * `absolute`-positioned child (`planet` or `star`) positions itself relative
     * to its nearest `relative`/`absolute`/`fixed` ancestor—without this, stars
     * would scatter across the entire `<body>` instead of staying inside the banner! */
    container.innerHTML = '';
    container.style.position = 'relative';
    container.style.overflow = 'hidden';

    /* STEP 3: READ ACCESSIBILITY & THEME PREFERENCES
     * - `prefersReducedMotion`: `true` if the user asked their OS/browser to
     *   minimize animations (WCAG 2.1 Success Criterion 2.3.3).
     * - `isDarkMode`: `true` if EITHER the OS prefers dark mode OR the site's
     *   root `<html>` tag explicitly carries `data-bs-theme="dark"`. */
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches || document.documentElement.getAttribute('data-bs-theme') === 'dark';

    /* STEP 4: RENDER THEME-SPECIFIC ARTWORK */
    if (!isDarkMode) {
        /* --- BRANCH A: LIGHT MODE -> FLOATING 3D CSS PLANET --- */
        const planet = document.createElement('div');
        planet.className = 'stardust-planet';
        
        /* Classic CSS dead-centering trick:
         * `top: 50%; left: 50%` puts the element's TOP-LEFT corner at the center,
         * and `transform: translate(-50%, -50%)` shifts it back by half its own
         * width and height so the planet's center aligns with the container's center! */
        planet.style.position = 'absolute';
        planet.style.top = '50%';
        planet.style.left = '50%';
        planet.style.transform = 'translate(-50%, -50%)';
        planet.style.width = '200px';
        planet.style.height = '200px';
        planet.style.borderRadius = '50%'; // Turns the 200x200 square into a circle
        
        /* Simulate a sunlit sphere without loading an image file:
         * - `radial-gradient(circle at 30% 30%, ...)` puts a bright cyan highlight
         *   in the upper-left quadrant fading into deep navy shadow.
         * - Outer `box-shadow` creates an atmospheric halo glow; `inset` shadow
         *   darkens the lower-right crescent terminator. */
        planet.style.background = 'radial-gradient(circle at 30% 30%, #42AADB, #0d1e38)';
        planet.style.boxShadow = '0 0 60px rgba(66, 170, 219, 0.5), inset -20px -20px 40px rgba(0,0,0,0.8)';
        
        /* Only animate the vertical hover bob if the user allows motion. */
        if (!prefersReducedMotion) {
            planet.style.animation = 'planetFloat 10s ease-in-out infinite alternate';
        }
        
        container.appendChild(planet);
    } else {
        /* --- BRANCH B: DARK MODE -> 120-STAR PROCEDURAL STARFIELD --- */
        const starCount = 120;

        /* Loop 120 times to create 120 tiny circular `<div>` stars. */
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'stardust-particle';
            
            /* `Math.random()` returns a floating-point number from `0` (inclusive)
             * up to `1` (exclusive), so `Math.random() * 100` gives `0%`..`99.99%`
             * across both horizontal (`left`) and vertical (`top`) axes. */
            star.style.position = 'absolute';
            star.style.backgroundColor = '#ffffff';
            star.style.borderRadius = '50%';
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;

            /* Randomize diameter between `0.5px` (distant pinpoint) and `3.0px`
             * (bright foreground star) to create natural visual depth. */
            const size = Math.random() * 2.5 + 0.5;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;

            if (!prefersReducedMotion) {
                /* Give each star its own random cycle duration (`3s` to `7s`) and
                 * random start offset (`0s` to `5s`) so all 120 stars twinkle
                 * independently instead of pulsing in unison! */
                star.style.animation = `starTwinkle ${Math.random() * 4 + 3}s infinite alternate`;
                star.style.animationDelay = `${Math.random() * 5}s`;
            } else {
                /* Reduced-motion fallback: assign each star a fixed brightness
                 * (`0.2` to `1.0`) so the night sky still looks rich without movement. */
                star.style.opacity = Math.random() * 0.8 + 0.2; 
            }

            container.appendChild(star);
        }
    }

    /* STEP 5: SET SEMAPHORE ATTRIBUTE
     * Marks this DOM node as rendered so duplicate lifecycle events skip it. */
    container.setAttribute('data-galaxy-rendered', 'true');
    
    /* STEP 6: SELF-CONTAINED `@keyframes` INJECTION
     * Check `document.getElementById('stardust-galaxy-styles')` first so we only
     * append this `<style>` block to `<head>` ONCE per browser tab session. */
    if (!document.getElementById('stardust-galaxy-styles')) {
        const style = document.createElement('style');
        style.id = 'stardust-galaxy-styles';
        style.textContent = `
            @keyframes starTwinkle {
                0% { opacity: 0.2; transform: scale(0.8); }
                100% { opacity: 1; transform: scale(1.2); box-shadow: 0 0 5px #fff; }
            }
            @keyframes planetFloat {
                0% { transform: translate(-50%, -50%) translateY(0px); }
                100% { transform: translate(-50%, -50%) translateY(-15px); }
            }
        `;
        document.head.appendChild(style);
    }
}

/* ----------------------------------------------------------------------------
 * LIFECYCLE & LIVE OS THEME LISTENERS
 * ----------------------------------------------------------------------------
 * 1. `DOMContentLoaded`: Renders on initial page load.
 * 2. `elara:loaded`: Renders when navigating via the Elara SPA router onto a
 *    new page whose freshly swapped `#stardust-labs-bg` doesn't have
 *    `data-galaxy-rendered` yet.
 * 3. `matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ...)`:
 *    Fires live if the user switches their OS between Light Mode and Dark Mode
 *    (or sunset auto-dark kicks in!). We remove `data-galaxy-rendered` to unlock
 *    the guard clause and re-run `initStardustGalaxy()` to swap Planet <-> Stars.
 * ---------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', initStardustGalaxy);
document.addEventListener('elara:loaded', initStardustGalaxy);

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const container = document.getElementById('stardust-labs-bg');
    if (container) {
        container.removeAttribute('data-galaxy-rendered');
        initStardustGalaxy();
    }
});
