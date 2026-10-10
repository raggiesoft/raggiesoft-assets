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
 * - The `wa-select` listener is tightly coupled to the Web Awesome (Shoelace) 
 *   dropdown components. If the UI framework changes, this event listener 
 *   will need to be updated.
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
    // Log successful initialization to the console for debugging purposes.
    console.log("Piper Sullivan initialized. Web Awesome DOM is under my jurisdiction.");
});

/**
 * ----------------------------------------------------------------------------
 * 2. GLOBAL ROUTING LISTENER
 * ----------------------------------------------------------------------------
 * Intercepts selection events from Web Awesome dropdown menus and select 
 * elements, transforming them into navigation actions when appropriate.
 */
// Global Web Awesome Dropdown Navigation Listener
document.addEventListener('wa-select', event => {
    // Extract the selected item from the event detail payload
    const item = event.detail.item;
    
    // Validate that an item exists and has a value property
    if (item && item.value) {
        // Only navigate if the value looks like a URL (starts with / or http)
        // This prevents accidental navigation from standard form selects.
        if (item.value.startsWith('/') || item.value.startsWith('http')) {
            // Perform the routing by assigning the window location
            window.location.href = item.value;
        }
    }
});
