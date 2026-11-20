/**
 * ============================================================================
 * READ-ALONG TEACHING OVERVIEW: encyclopedia.js
 * ============================================================================
 * WHAT THIS FILE IS:
 *   An interactive Lore Encyclopedia modal controller. When a reader clicks an
 *   inline `.lore-link` term inside an article or story summary, this script
 *   fetches that entry's JSON record from `/api/lore` and displays it inside a
 *   native HTML5 `<dialog class="encyclopedia-modal">` popup without leaving
 *   the current page.
 *
 * WHICH WEBSITES LOAD IT:
 *   Loaded from `https://assets.raggiesoft.com/common/js/encyclopedia.js` on
 *   `raggiesoft.com` and Stardust Engine / Elara CMS pages that feature inline
 *   encyclopedia lore links.
 *
 * WHAT INPUTS IT CONSUMES:
 *   1. Trigger links matching `.lore-link` with a `data-lore="<entry-slug>"`
 *      attribute (for example, `<a href="#" class="lore-link" data-lore="cpi">`).
 *   2. A `<dialog class="encyclopedia-modal">` element containing:
 *      - `#encyclopedia-modal-title` (heading text target)
 *      - `#encyclopedia-modal-body` (rendered HTML body target)
 *      - `#encyclopedia-modal-read-more` ("Read More" full-page anchor button)
 *      - `.close-encyclopedia-btn` (close button inside the modal)
 *   3. JSON response from `GET /api/lore?entry=<slug>` returning
 *      `{ metadata: { title, theme }, html }`.
 *
 * WHAT VISIBLE UI IT PRODUCES:
 *   - Opens a modal dialog immediately with a loading spinner ("Decrypting
 *     Archives..."), then swaps in the lore entry's title, custom theme class,
 *     formatted HTML body, and "Read More" link—or a clear error message if
 *     the entry cannot be fetched.
 *
 * 100-LEVEL JAVASCRIPT CONCEPTS TAUGHT IN THIS FILE:
 *   - IIFEs (`(function() { ... })()`): Keeping helper functions private.
 *   - `dataset` Guard Flags (`link.dataset.loreBound`): Preventing duplicate
 *     event listeners when an SPA router re-runs initialization.
 *   - Native `<dialog>` (`showModal()` & `close()`): Built-in browser modal
 *     focus management and `Escape`-key closing.
 *   - `async` / `await` + `fetch()` + `encodeURIComponent()`: Safe asynchronous
 *     HTTP requests with URL query-parameter escaping.
 * ============================================================================
 */
(function() {
    /**
     * Scans the current page for `.lore-link` elements and wires them up to
     * populate and open `.encyclopedia-modal`. Safe to call multiple times
     * across Elara SPA page transitions.
     */
    function initEncyclopediaLinks() {
        /* Query all lore trigger links and modal `<dialog>` elements currently in the DOM. */
        const links = document.querySelectorAll('.lore-link');
        const dialogs = document.querySelectorAll('.encyclopedia-modal');
        
        /* Pick the LAST `.encyclopedia-modal` in document order (`dialogs.length - 1`).
         * Why? During an SPA zone swap, if an old modal briefly coexists with a newly
         * injected modal, the newest one at the end of the NodeList is the live one. */
        const dialog = dialogs[dialogs.length - 1]; 
        
        /* Guard clause: if this page doesn't render `.encyclopedia-modal`, do nothing. */
        if (!dialog) return;

        /* Look up the child elements *inside* `dialog` (scoping `dialog.querySelector`
         * instead of `document.querySelector` guarantees we target elements inside
         * the exact `dialog` we selected above). */
        const titleEl = dialog.querySelector('#encyclopedia-modal-title');
        const bodyEl = dialog.querySelector('#encyclopedia-modal-body');
        const readMoreBtn = dialog.querySelector('#encyclopedia-modal-read-more');
        const closeBtn = dialog.querySelector('.close-encyclopedia-btn');

        /* Wire up the modal's Close button.
         * Note on `<dialog>`: `.close()` is the standard HTML5 method that closes
         * a modal `<dialog>` and restores keyboard focus to the trigger element;
         * the `catch` fallback sets `dialog.open = false` for older browsers. */
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                try { dialog.close(); } catch(e) { dialog.open = false; }
            });
        }

        /* Loop through every `.lore-link` on the page and attach its click handler. */
        links.forEach(link => {
            /* Duplicate-listener guard:
             * In JavaScript, `link.dataset.loreBound` reads/writes the HTML attribute
             * `data-lore-bound="true"`. If this specific `<a>` element was already
             * bound on an earlier call, skip it so clicking once never fires two fetches! */
            if (link.dataset.loreBound) return;
            link.dataset.loreBound = 'true';

            /* Mark the click callback `async` so we can `await fetch(...)` cleanly
             * instead of nesting `.then()` chains. */
            link.addEventListener('click', async (e) => {
                /* Stop the browser from following `href="#"` or navigating away. */
                e.preventDefault();

                /* Read which lore article slug to fetch from `data-lore="..."`. */
                const entryId = link.getAttribute('data-lore');
                if (!entryId) return;

                /* ------------------------------------------------------------
                 * PHASE 1: RESET MODAL UI & DISPLAY LOADING SPINNER IMMEDIATELY
                 * Why open the modal BEFORE `fetch()` finishes? Instant visual
                 * feedback! Even on a slow mobile connection, the user sees right
                 * away that their tap registered.
                 * ------------------------------------------------------------ */
                titleEl.textContent = 'Decrypting Archives...';
                bodyEl.innerHTML = '<div class="d-flex justify-content-center py-5"><span class="loading loading-spinner loading-lg text-primary"></span></div>';
                readMoreBtn.style.display = 'none';
                
                /* Remove any `theme-*` CSS class left over from a previously viewed
                 * lore entry so its accent colors don't bleed into the new entry.
                 * (`Array.from(dialog.classList)` snapshots the class list first so
                 * removing items mid-loop never skips an index!) */
                Array.from(dialog.classList).forEach(cls => {
                    if (cls.startsWith('theme-')) {
                        dialog.classList.remove(cls);
                    }
                });

                /* Open the native HTML5 `<dialog>` in the top modal layer (which also
                 * traps Tab focus inside the dialog and lets `Escape` close it natively). */
                try { dialog.showModal(); } catch(err) { dialog.open = true; }

                /* ------------------------------------------------------------
                 * PHASE 2: FETCH LORE JSON FROM BACKEND & POPULATE THE MODAL
                 * ------------------------------------------------------------ */
                try {
                    /* `encodeURIComponent(entryId)` safely escapes slashes, spaces, or
                     * special characters so they can't break the query string URL. */
                    const response = await fetch(`/api/lore?entry=${encodeURIComponent(entryId)}`);
                    /* Note: `fetch()` only rejects automatically on network failure—not
                     * HTTP 404/500! Checking `!response.ok` catches 404 Not Found cleanly. */
                    if (!response.ok) throw new Error('Lore not found');
                    
                    /* Parse the HTTP response body from JSON text into a JS object. */
                    const data = await response.json();
                    
                    /* Use `.textContent` (not `.innerHTML`) for plain text titles so
                     * special characters like `&` or `<` are escaped safely. */
                    titleEl.textContent = data.metadata.title || 'Unknown Record';
                    /* Inject the server-rendered HTML article body from Markdown. */
                    bodyEl.innerHTML = data.html;

                    /* If the lore file's YAML frontmatter specifies `theme: ...`,
                     * add matching theme hook classes to style the modal surface. */
                    if (data.metadata.theme) {
                        dialog.classList.add(`theme-${data.metadata.theme}`);
                        dialog.classList.add(`wa-theme-${data.metadata.theme}`);
                    }

                    /* Point the "Read More" button to the standalone encyclopedia view
                     * and unhide it now that valid content has loaded. */
                    readMoreBtn.href = `/encyclopedia/view?entry=${encodeURIComponent(entryId)}`;
                    readMoreBtn.style.display = 'block';

                } catch (error) {
                    /* If offline, 404, or invalid JSON, replace the spinner with a
                     * clear error message inside the already-open modal. */
                    titleEl.textContent = 'Error';
                    bodyEl.innerHTML = '<p class="text-danger">The requested archive could not be accessed or has been corrupted.</p>';
                    console.error("Encyclopedia Error:", error);
                }
            });
        });
    }

    /* Run once on initial full-page load... */
    document.addEventListener('DOMContentLoaded', initEncyclopediaLinks);
    /* ...and run again whenever `elara-spa.js` swaps new page content into the DOM! */
    document.addEventListener('elara:loaded', initEncyclopediaLinks);
})();
