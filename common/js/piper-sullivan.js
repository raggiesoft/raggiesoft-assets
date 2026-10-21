/**
 * ============================================================================
 * PIPER SULLIVAN
 * RaggieSoft Common UI & DOM Routing Library
 * ============================================================================
 * Architecture: Global Utility Script
 * Purpose: This file serves as the global initialization and DOM routing 
 *          assistant for RaggieSoft applications. Named after the persona 
 *          "Piper Sullivan", it is intended to house sitewide event listeners 
 *          and UI orchestration logic that isn't tied to a single component.
 * 
 * Future Maintenance Notes:
 * - This script is designed to run on the `DOMContentLoaded` event. Keep 
 *   initialization code lightweight to prevent blocking the main thread 
 *   during page load.
 * - Manages DaisyUI 5 `<details class="dropdown">` outside-click dismissal and
 *   SPA navigation closing so dropdown menus behave cleanly without runtime bloat.
 * 
 * "I'm Piper. I organize the chaos so the frontend doesn't collapse into a pile of unrouted DIVs.
 * Keep your tags semantic, your CSS variables tidy, and for the love of everything, don't inline your scripts."
 * ============================================================================
 */

/**
 * ----------------------------------------------------------------------------
 * 1. DOM INITIALIZATION
 * ----------------------------------------------------------------------------
 * Bootstraps the Piper Sullivan library once the HTML document has been 
 * completely parsed.
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log("Piper Sullivan initialized. DaisyUI 5 semantic DOM is under my jurisdiction.");
});

/**
 * ----------------------------------------------------------------------------
 * 2. GLOBAL DROPDOWN ORCHESTRATION (DaisyUI 5 <details class="dropdown">)
 * ----------------------------------------------------------------------------
 * Closes open `<details class="dropdown">` elements when clicking outside or
 * selecting an item inside the dropdown menu.
 */
document.addEventListener('click', event => {
    document.querySelectorAll('details.dropdown[open]').forEach(dropdown => {
        if (!dropdown.contains(event.target) || event.target.closest('.dropdown-content a')) {
            dropdown.removeAttribute('open');
        }
    });
});
