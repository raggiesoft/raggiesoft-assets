/**
 * ============================================================================
 * Stardust Engine UI Scripts (raggiesoft-ui.js)
 * ============================================================================
 * PLAIN-ENGLISH OVERVIEW (READ THIS FIRST):
 * What is this file?
 *   This is a dependency-free ("vanilla") JavaScript file that wires up three
 *   interactive behaviors for Stardust Engine pages:
 *     1. Opening and closing the slide-out mobile navigation sidebar (`#rs-sidebar`).
 *     2. Switching the long-form reading color theme (`light`, `dark`, `sepia`)
 *        and remembering the user's choice in `localStorage`.
 *     3. Allowing `<button href="...">` / `.rs-btn[href]` elements to navigate
 *        smoothly through our Single-Page Application (SPA) router without
 *        triggering a full browser reload.
 *
 * JAVASCRIPT & DOM FUNDAMENTALS USED IN THIS FILE:
 * - The DOM (Document Object Model): The browser's live, in-memory tree of HTML
 *   elements on the page (`document`). JavaScript reads and updates HTML tags
 *   through `document.getElementById(...)`, `.classList`, and `.addEventListener(...)`.
 * - Arrow Functions `(e) => { ... }`: Modern ES6 shorthand for `function(e) { ... }`.
 * - Event Bubbling: When you click a button inside a `<body>`, that click event
 *   travels ("bubbles") upward from the button -> parent `<div>` -> `<body>` -> `document`.
 * ============================================================================
 */

// Wait for `DOMContentLoaded` before looking up `#rs-sidebar-toggle` or `#rs-sidebar`.
// Why? If this script runs in `<head>` before the browser has finished reading `<body>`,
// `document.getElementById(...)` would return `null` ("not found yet"). `DOMContentLoaded`
// fires the exact millisecond all HTML tags have been parsed into the DOM tree.
document.addEventListener('DOMContentLoaded', () => {
    // Look up the three optional sidebar elements by their unique HTML `id="..."` attributes.
    // `const` declares a block-scoped reference that won't be reassigned later in this function.
    const toggleBtn = document.getElementById('rs-sidebar-toggle');
    const sidebar = document.getElementById('rs-sidebar');
    const backdrop = document.getElementById('rs-backdrop');

    // -------------------------------------------------------------------------
    // 1. Mobile Sidebar Open / Close Toggle
    // -------------------------------------------------------------------------
    // Defensive null-check: only attach the click listener on pages that actually render a sidebar.
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', (e) => {
            // Stop this click event from bubbling up to `document` / parent listeners
            // that might treat "any click outside the sidebar" as a signal to close it immediately.
            e.stopPropagation();

            // `.classList.toggle('open')` adds the `open` CSS class if absent, or removes it if present.
            // In `raggiesoft-ui.css`, `.rs-sidebar.open` slides the drawer from `translateX(-100%)` to `0`.
            sidebar.classList.toggle('open');

            // If the page also includes a dimmed `#rs-backdrop` overlay behind the drawer, toggle it in sync.
            if (backdrop) backdrop.classList.toggle('open');
        });
    }

    // -------------------------------------------------------------------------
    // 2. Backdrop Tap-to-Dismiss Logic
    // -------------------------------------------------------------------------
    // Letting users tap anywhere on the dimmed background overlay to close the drawer
    // is a standard mobile usability pattern alongside close buttons.
    if (backdrop && sidebar) {
        backdrop.addEventListener('click', () => {
            // Explicitly `.remove('open')` so clicking the backdrop always closes (never opens) the drawer.
            sidebar.classList.remove('open');
            backdrop.classList.remove('open');
        });
    }
});

/**
 * -----------------------------------------------------------------------------
 * 3. Reading Theme Controller (`window.setReaderTheme`)
 * -----------------------------------------------------------------------------
 * Why attach this function to `window`?
 *   In browsers, `window` is the global object. Assigning `window.setReaderTheme = ...`
 *   makes `setReaderTheme('sepia')` callable directly from inline HTML button handlers
 *   (like `onclick="setReaderTheme('sepia')"`) or other scripts across the page.
 *
 * @param {string} theme - Theme identifier: `'light'`, `'dark'`, `'sepia'`, or `'default'`.
 */
window.setReaderTheme = function (theme) {
    // `document.documentElement` refers directly to the root `<html>` tag at the top of the document.
    // First, strip all three known theme classes so two themes (e.g., `reader-light` AND `reader-dark`)
    // are never active at the same time.
    document.documentElement.classList.remove('reader-light', 'reader-dark', 'reader-sepia');

    // If the user picked a specific reading palette (not `'default'`), add `reader-light`,
    // `reader-dark`, or `reader-sepia` to `<html>`, which activates the CSS variables in `theme-default.css`.
    if (theme !== 'default') {
        document.documentElement.classList.add('reader-' + theme);
    }

    // `localStorage` is a small key-value dictionary built into every web browser that survives
    // tab closes and browser restarts (unlike normal JS variables, which reset on refresh).
    // Saving `'rs-reader-theme'` lets the next page load restore the user's preferred palette.
    localStorage.setItem('rs-reader-theme', theme);
};

/**
 * -----------------------------------------------------------------------------
 * 4. Delegated Button-Link SPA Interceptor
 * -----------------------------------------------------------------------------
 * What problem does this solve?
 *   Sometimes a template renders `<button class="rs-btn" href="/about">Learn More</button>`.
 *   Unlike `<a href="/about">`, HTML `<button>` tags ignore `href` attributes by default!
 *
 * Why listen on `document` instead of looping over every button ("Event Delegation")?
 *   When our Single-Page Application (SPA) router swaps in new page HTML dynamically,
 *   any newly inserted buttons automatically work without needing to re-attach listeners,
 *   because their click events bubble up to `document`!
 */
document.addEventListener('click', (e) => {
    // `e.target` is the exact innermost element clicked (for example, an `<i>` icon inside a button).
    // `.closest('button[href], .rs-btn[href]')` walks UP the DOM tree from `e.target` to check if
    // the click happened on (or inside) a `<button href="...">` or `.rs-btn[href]`.
    // Guard `e.target.closest` first in case a non-Element node ever dispatches an event.
    const btn = e.target && e.target.closest ? e.target.closest('button[href], .rs-btn[href]') : null;

    if (btn) {
        // If `btn` is actually a real `<a class="rs-btn" href="...">` anchor tag, let the browser
        // or the SPA router handle that real `<a>` click naturally so we don't loop infinitely!
        if (btn.tagName === 'A') return;

        // Stop `<button>` inside a `<form>` from accidentally submitting the form.
        e.preventDefault();

        // Read the destination URL and optional `target` attribute (`_blank` for new tab) from the HTML tag.
        const url = btn.getAttribute('href');
        const target = btn.getAttribute('target');
        if (!url) return;

        // Respect `target="_blank"` by opening external/new-tab links via `window.open` with `noopener` safety.
        if (target === '_blank') {
            window.open(url, '_blank', 'noopener');
        } else {
            // Virtual Anchor Simulation:
            // Create a temporary invisible `<a href="...">` tag in memory, append it to `<body>`,
            // trigger `.click()` on it, and immediately remove it.
            // Why? Because the Elara/Stardust SPA router listens for clicks on genuine `<a>` tags
            // to perform smooth client-side page transitions (keeping background music playing!).
            const a = document.createElement('a');
            a.href = url;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }
});
