/**
 * ============================================================================
 * READ-ALONG TEACHING OVERVIEW: piper-sullivan.js
 * ============================================================================
 * WHAT THIS FILE IS:
 *   "Piper Sullivan" is RaggieSoft's lightweight global UI helper script for
 *   managing interactive DaisyUI 5 `<details class="dropdown">` menus without
 *   needing a heavy JavaScript UI framework.
 *
 * WHICH WEBSITES LOAD IT:
 *   Loaded from `https://assets.raggiesoft.com/common/js/piper-sullivan.js` on
 *   `raggiesoft.com` (PHP 8.5 + DaisyUI 5 SSR + Elara SPA).
 *
 * WHAT INPUTS IT CONSUMES:
 *   - Browser `DOMContentLoaded` lifecycle event (fires as soon as HTML tags
 *     finish parsing into the DOM tree).
 *   - Browser `click` events anywhere on `document`, inspecting `<details>`
 *     elements that carry both the `.dropdown` class and the `[open]` attribute.
 *
 * WHAT VISIBLE UI IT PRODUCES:
 *   - Automatically closes any open `<details class="dropdown" open>` popup
 *     menu whenever a visitor clicks anywhere outside the menu OR clicks a
 *     navigation link (`<a>`) inside `.dropdown-content`.
 *
 * 100-LEVEL JAVASCRIPT CONCEPTS TAUGHT IN THIS FILE:
 *   1. Native HTML5 `<details>` & `<summary>`: Browsers can open/close a
 *      `<details>` menu natively by toggling its `open` attribute, EXCEPT
 *      native `<details>` stays open forever if you click elsewhere on the page!
 *   2. Event Delegation (`document.addEventListener('click', ...)`): Instead
 *      of attaching a separate click listener to every dropdown on every page
 *      (which breaks when new HTML is swapped in via AJAX/SPA routing), we
 *      attach ONE listener at the top of `document`. Clicks "bubble" up from
 *      the clicked element to `document`, so this single listener handles both
 *      current and future dropdowns automatically.
 *
 * "I'm Piper. I organize the chaos so the frontend doesn't collapse into a pile of unrouted DIVs.
 * Keep your tags semantic, your CSS variables tidy, and for the love of everything, don't inline your scripts."
 * ============================================================================
 */

/**
 * ----------------------------------------------------------------------------
 * 1. DOM INITIALIZATION HOOK (`DOMContentLoaded`)
 * ----------------------------------------------------------------------------
 * `DOMContentLoaded` fires as soon as the browser finishes reading the HTML
 * document and building the DOM (Document Object Model) tree—without waiting
 * for large external images or audio files to finish downloading.
 * Here we log a quick diagnostic message to the Developer Tools console so
 * maintainers can verify the script loaded cleanly.
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log("Piper Sullivan initialized. DaisyUI 5 semantic DOM is under my jurisdiction.");
});

/**
 * ----------------------------------------------------------------------------
 * 2. GLOBAL DROPDOWN DISMISSAL (`details.dropdown[open]`)
 * ----------------------------------------------------------------------------
 * How DaisyUI 5 `<details>` dropdowns work in HTML:
 *   <details class="dropdown">
 *     <summary class="btn">Menu</summary>
 *     <ul class="dropdown-content menu">
 *       <li><a href="/about">About</a></li>
 *     </ul>
 *   </details>
 *
 * When the user clicks `<summary>`, the browser automatically adds the boolean
 * `open` attribute (`<details class="dropdown" open>`), revealing the menu.
 *
 * Step-by-step walkthrough of what happens on EVERY click anywhere on the page:
 *   1. `document.querySelectorAll('details.dropdown[open]')` finds only the
 *      dropdowns that are CURRENTLY open right now (usually 0 or 1 element,
 *      so this loop is practically free!).
 *   2. `event.target` is the exact innermost DOM node the user clicked (for
 *      example, a `<span>` inside a link, or empty background space on `<main>`).
 *   3. `!dropdown.contains(event.target)` checks: "Did the user click OUTSIDE
 *      this `<details>` box?" `.contains()` returns `true` if `event.target`
 *      is the `<details>` element itself or any descendant inside it.
 *   4. `event.target.closest('.dropdown-content a')` walks UP the DOM tree from
 *      `event.target` looking for an `<a>` link inside `.dropdown-content`.
 *      If found, the user just picked a menu option—so we should close the
 *      dropdown right away (especially important in an SPA where the header
 *      isn't reloaded from scratch!).
 *   5. `dropdown.removeAttribute('open')` removes the HTML `open` attribute,
 *      instantly hiding the menu panel again.
 */
document.addEventListener('click', event => {
    document.querySelectorAll('details.dropdown[open]').forEach(dropdown => {
        if (!dropdown.contains(event.target) || event.target.closest('.dropdown-content a')) {
            dropdown.removeAttribute('open');
        }
    });
});
