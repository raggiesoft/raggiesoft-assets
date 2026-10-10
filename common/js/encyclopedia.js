/**
 * RaggieSoft Encyclopedia Integration Module
 * 
 * Architecture & Purpose:
 * This script initializes and binds interactive encyclopedia "lore" links 
 * to a centralized dialog/modal component. It operates as an SPA-friendly 
 * (Single Page Application) module, safely querying the DOM for dynamically 
 * injected elements and preventing duplicate bindings.
 * 
 * Key Features:
 * - Event delegation and state management for dynamic "lore" links.
 * - Integration with backend /api/lore endpoints.
 * - Dynamic modal styling based on content frontmatter (themes).
 * - Lifecycle hook bindings for both traditional page loads and Elara SPA navigations.
 * 
 * Maintenance Notes:
 * - Ensure that the `.encyclopedia-modal` is present in the DOM when links are rendered.
 * - The `data-lore-bound` attribute is used as a safety check against duplicate event listeners.
 */
(function() {
    /**
     * Scans the document for lore links and binds click events to populate 
     * and display the encyclopedia modal dialog.
     */
    function initEncyclopediaLinks() {
        // Retrieve all current links designated as lore triggers
        const links = document.querySelectorAll('.lore-link');
        const dialogs = document.querySelectorAll('.encyclopedia-modal');
        
        // Select the latest dialog injected into the DOM (handles Elara SPA edge cases safely)
        const dialog = dialogs[dialogs.length - 1]; 
        
        // Exit early if the required dialog structure is not found in the DOM
        if (!dialog) return;

        // Cache modal internal element references for content injection
        const titleEl = dialog.querySelector('#encyclopedia-modal-title');
        const bodyEl = dialog.querySelector('#encyclopedia-modal-body');
        const readMoreBtn = dialog.querySelector('#encyclopedia-modal-read-more');
        const closeBtn = dialog.querySelector('.close-encyclopedia-btn');

        // Bind standard close interactions if the close button exists
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                // Mutate the standard open property and attempt native hide() method
                dialog.open = false;
                try { dialog.hide(); } catch(e) {}
            });
        }

        // Iterate over found links to bind initialization logic
        links.forEach(link => {
            // Guard clause to prevent duplicate event bindings on SPA re-renders
            if (link.dataset.loreBound) return;
            link.dataset.loreBound = 'true';

            // Main interaction handler for fetching and displaying lore data
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                const entryId = link.getAttribute('data-lore');
                // Abort if the required entry identifier is missing
                if (!entryId) return;

                // ----------------------------------------------------
                // UI STATE RESET: Prepare modal for incoming data
                // ----------------------------------------------------
                titleEl.textContent = 'Decrypting Archives...';
                // Show a loading spinner during the network request
                bodyEl.innerHTML = '<div class="d-flex justify-content-center py-5"><wa-spinner class="fs-1"></wa-spinner></div>';
                readMoreBtn.style.display = 'none';
                
                // Strip out previous theme classes from the dialog to avoid style bleeding
                Array.from(dialog.classList).forEach(cls => {
                    if (cls.startsWith('theme-') || cls.startsWith('wa-theme-')) {
                        dialog.classList.remove(cls);
                    }
                });

                // Show modal immediately with the loading state active
                dialog.open = true;
                try { dialog.show(); } catch(err) {}

                // ----------------------------------------------------
                // DATA FETCH & INJECTION
                // ----------------------------------------------------
                try {
                    // Query the API endpoint using the provided lore identifier
                    const response = await fetch(`/api/lore?entry=${encodeURIComponent(entryId)}`);
                    if (!response.ok) throw new Error('Lore not found');
                    
                    const data = await response.json();
                    
                    // Inject text content safely
                    titleEl.textContent = data.metadata.title || 'Unknown Record';
                    // Inject structured HTML content returned from the parsed markdown/API
                    bodyEl.innerHTML = data.html;

                    // Apply custom theme if specified in YAML frontmatter metadata
                    if (data.metadata.theme) {
                        dialog.classList.add(`theme-${data.metadata.theme}`);
                        dialog.classList.add(`wa-theme-${data.metadata.theme}`);
                    }

                    // Setup the "Read More" full-page link reference
                    readMoreBtn.href = `/encyclopedia/view?entry=${encodeURIComponent(entryId)}`;
                    readMoreBtn.style.display = 'block';

                } catch (error) {
                    // Fallback error state UI implementation
                    titleEl.textContent = 'Error';
                    bodyEl.innerHTML = '<p class="text-danger">The requested archive could not be accessed or has been corrupted.</p>';
                    console.error("Encyclopedia Error:", error);
                }
            });
        });
    }

    // Bind initialization logic to standard DOM load events
    document.addEventListener('DOMContentLoaded', initEncyclopediaLinks);
    // Bind initialization logic to the custom Elara SPA navigation lifecycle event
    document.addEventListener('elara:loaded', initEncyclopediaLinks);
})();
