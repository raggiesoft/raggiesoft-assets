/**
 * ============================================================================
 * RAGGIESOFT ELARA SPA ROUTER - ARCHITECTURAL OVERVIEW
 * ============================================================================
 * 
 * Description:
 * Elara is a lightweight, custom Vanilla JS Single Page Application (SPA) 
 * router designed to replace heavy frameworks like Turbo or HTMX. It intercepts 
 * native anchor link clicks, fetches the next page via AJAX, and seamlessly 
 * swaps critical DOM zones to simulate instant page loads without a hard browser 
 * refresh.
 * 
 * Core Mechanisms:
 * 1. Link Interception: Listens to all `<a>` clicks, avoiding Bootstrap native 
 *    toggles, external links, anchor hashes, and modifier-key clicks (Ctrl+Click).
 * 2. Soft Navigation (navigateTo): 
 *    - Fetches the HTML of the target URL.
 *    - Parses it into a virtual DOM.
 *    - Synchronizes `<head>` attributes, meta tags, and `<link>` stylesheets 
 *      (purging obsolete ones and injecting new ones).
 *    - Handles dark mode theme retention.
 *    - Swaps out targeted DOM zones (header, #elara-layout-wrapper, footer).
 *    - Re-evaluates injected `<script>` tags so dynamic content (like audio 
 *      players) initializes correctly.
 * 3. History Management: Uses the HTML5 History API (`pushState`/`popstate`) to 
 *    ensure the browser's Back/Forward buttons continue to work natively.
 * 4. Scroll & Focus Management: Explicitly manages scroll snapping and main-content 
 *    focusing during transitions to ensure screen-reader accessibility and 
 *    prevent visual "jumping".
 * 5. Secure Mail Obfuscator: A bundled utility (`initializeSecureEmails`) that 
 *    assembles `mailto:` links dynamically to thwart basic web scrapers.
 * 
 * Maintainability Notes:
 * - When adding new persistent layout wrappers, ensure their IDs are added to 
 *   the `swapZones` array.
 * - The 15ms `setTimeout` in the post-scroll enforcement is critical for giving 
 *   the browser's main thread time to calculate the height of the newly swapped DOM.
 * ============================================================================
 */

// Tell the browser to let Elara handle scroll positions natively
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Intercept all link clicks across the entire body
    document.body.addEventListener('click', async (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');

        // 1. Let Bootstrap Native JS handle its own components (dropdowns, modals, tabs)
        if (link.hasAttribute('data-bs-toggle') || link.hasAttribute('data-bs-dismiss')) {
            // Prevent the browser from jumping to the anchor hash if it's a dummy link
            if (href && href.startsWith('#')) e.preventDefault();
            return; 
        }
        
        // 2. Ignore dead links and utility protocols (javascript, mailto, tel)
        if (!href || href === '#' || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            if (href === '#') e.preventDefault();
            return;
        }

        // 3. Ignore new tabs or modifier-key clicks (allow native OS behavior)
        if (link.target === '_blank' || e.ctrlKey || e.metaKey || e.shiftKey) return;

        const targetUrl = new URL(link.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        // 4. Ignore external links (cross-origin navigation requires a hard reload)
        if (targetUrl.origin !== currentUrl.origin) return;
        
        // 5. Robustly handle same-page anchor hash links natively without triggering reloads
        if (targetUrl.pathname === currentUrl.pathname && targetUrl.hash !== '') {
            e.preventDefault(); // Stop the browser from triggering a hashchange/reload
            const targetId = targetUrl.hash.substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                // Smooth scroll to the part natively
                targetElement.scrollIntoView({ behavior: 'smooth' });
                // Update URL history state without reloading the page
                window.history.pushState(null, null, targetUrl.hash);
            }
            return;
        }
        
        // Handle empty hash edge case (e.g. href="page#")
        if (targetUrl.pathname === currentUrl.pathname && link.href.endsWith('#')) {
            e.preventDefault();
            return;
        }

        // Prevent the hard browser reload
        e.preventDefault();
        
        // Execute the soft SPA navigation
        await navigateTo(targetUrl.href);
    });


    // 2. Handle Browser Back/Forward Buttons natively via history stack
    window.addEventListener('popstate', async (e) => {
        // Pass false to prevent pushing a duplicate state to the history stack
        await navigateTo(window.location.href, false);
    });
});



/**
 * Core Navigation Engine
 * Fetches the requested URL, parses it, and swaps DOM elements.
 * 
 * @param {string} url - The target URL to load.
 * @param {boolean} pushState - Whether to update the history API (false during popstate).
 */
async function navigateTo(url, pushState = true) {
    // Fire event to trigger UI loader animations globally
    document.dispatchEvent(new CustomEvent('elara:navigating'));

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const htmlString = await response.text();

        // Parse the incoming HTML string into a queryable virtual DOM
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');

        const newTitle = doc.querySelector('title')?.innerText;
        // Verify the incoming page has the expected SPA layout wrapper
        let hasCoreLayout = doc.querySelector('#elara-layout-wrapper');

        if (hasCoreLayout) {
            // --- 1. HEAD & META SYNC ENGINE ---

            // Sync HTML tag attributes (Critical for forced dark-mode themes or language changes)
            const newHtmlAttrs = Array.from(doc.documentElement.attributes);
            const currentHtmlAttrs = Array.from(document.documentElement.attributes);

            // 1. Purge stale attributes that exist on the current DOM but NOT on the new page
            currentHtmlAttrs.forEach(attr => {
                if (!doc.documentElement.hasAttribute(attr.name)) {
                    document.documentElement.removeAttribute(attr.name);
                }
            });

            // 2. Add or update attributes from the new page
            newHtmlAttrs.forEach(attr => {
                document.documentElement.setAttribute(attr.name, attr.value);
            });

            // 3. THE SYSTEM RESTORE: Re-apply OS preference if Elara purged the theme attribute
            if (!doc.documentElement.hasAttribute('data-bs-theme')) {
                const storedTheme = localStorage.getItem('theme');
                const preferredTheme = storedTheme ? storedTheme : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.setAttribute('data-bs-theme', preferredTheme);
            }

            // Diff and Update Stylesheets to prevent CSS leakage or memory leaks
            const getBaseHref = (link) => link.href.split('?')[0]; // Ignore ?v= timestamps for diffing
            const newLinks = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
            const oldLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

            // Add new stylesheets that are missing in the current DOM
            newLinks.forEach(newLink => {
                if (!oldLinks.some(old => getBaseHref(old) === getBaseHref(newLink))) {
                    document.head.appendChild(newLink.cloneNode(true));
                }
            });

            // Remove obsolete stylesheets that are no longer needed
            oldLinks.forEach(oldLink => {
                if (!newLinks.some(newEl => getBaseHref(newEl) === getBaseHref(oldLink))) {
                    oldLink.remove();
                }
            });

            // Update Inline Styles (Head only, to avoid interfering with swapped body styles)
            const newHeadStyles = Array.from(doc.head.querySelectorAll('style'));
            const oldHeadStyles = Array.from(document.head.querySelectorAll('style'));

            // Naively remove all old inline styles and inject all new ones
            oldHeadStyles.forEach(style => style.remove());
            newHeadStyles.forEach(style => document.head.appendChild(style.cloneNode(true)));


            // --- 2. LOADER STATE UPDATE ---
            // Silently update the loader text so it displays correctly on the *next* click
            const newLoaderTitle = doc.querySelector('#page-loader h4');
            const oldLoaderTitle = document.querySelector('#page-loader h4');
            if (newLoaderTitle && oldLoaderTitle) {
                oldLoaderTitle.innerHTML = newLoaderTitle.innerHTML;
            }


            // --- 2A. PRE-SCROLL LOCK ---
            // Assassinate smooth scrolling BEFORE the DOM height changes to prevent jumping
            document.documentElement.style.scrollBehavior = 'auto';

            // Snap to top while the old (potentially taller) DOM is still intact
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;


            // --- 3. DOM ZONE SWAPPING ---
            // Define the specific layout regions that need to be updated
            const swapZones = [
                'header',                    
                '#elara-layout-wrapper',     
                '#elara-master-footer'   
            ];

            swapZones.forEach(selector => {
                const newEl = doc.querySelector(selector);
                const currentEl = document.querySelector(selector);
                
                if (newEl && currentEl) {
                    // Perform the actual DOM node replacement
                    currentEl.replaceWith(newEl);

                    // Re-evaluate injected scripts so dynamic logic (like audio player) fires
                    // Browser won't execute scripts inserted via innerHTML or replaceWith natively
                    const newlyInjectedEl = document.querySelector(selector);
                    const scripts = newlyInjectedEl.querySelectorAll('script');
                    
                    scripts.forEach(oldScript => {
                        const newScript = document.createElement('script');
                        // Copy all attributes (src, type, defer, etc)
                        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                        // Copy inline code
                        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                        // Replace in DOM to trigger browser execution
                        oldScript.parentNode.replaceChild(newScript, oldScript);
                    });
                }
            });

            // Update document title and URL bar
            if (newTitle) document.title = newTitle;
            if (pushState) window.history.pushState({ url: url }, newTitle, url);

            // --- 4. POST-SCROLL ENFORCEMENT & FOCUS ---
            
            // Force a synchronous layout calculation so the browser knows the exact height of the new DOM
            void document.documentElement.offsetHeight;

            // A 15ms timeout ensures the main thread's render queue has fully cleared
            setTimeout(() => {
                // Enforce the 0,0 scroll axes one final time
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;

                // THE ANCHOR: Physically move the browser's active focus to the main content area
                // This is crucial for screen readers to start reading the new page content
                const mainContent = document.getElementById('main-content') || document.body;
                mainContent.setAttribute('tabindex', '-1');
                mainContent.focus({ preventScroll: true }); 
                if (mainContent === document.body) mainContent.removeAttribute('tabindex');

                // Resurrect smooth scrolling for the user for normal in-page anchor links
                document.documentElement.style.scrollBehavior = '';

                // Dispatch event to announce the page load is complete (hides loaders)
                document.dispatchEvent(new CustomEvent('elara:loaded'));
            }, 15);

        } else {
            // Fallback: If the incoming HTML doesn't have the wrapper, do a hard reload
            window.location.href = url;
        }
    } catch (error) {
        // Fallback: If the fetch fails or errors out, do a hard reload
        console.error('Elara SPA Error:', error);
        window.location.href = url;
    }
}

// --- ELARA SECURE MAIL OBFUSCATOR ---
/**
 * Scans for elements with the .elara-secure-mail class and constructs
 * clickable mailto links dynamically to prevent basic bot scraping.
 */
function initializeSecureEmails() {
    document.querySelectorAll('.elara-secure-mail').forEach(link => {
        // Prevent double-binding on SPA transitions to save cycles
        if (link.dataset.secured === "true") return;
        
        // Extract obfuscated data attributes
        const user = link.getAttribute('data-u');
        const domain = link.getAttribute('data-d');
        const tld = link.getAttribute('data-t');
        
        if (user && domain && tld) {
            // Assemble the email in memory
            const email = `${user}@${domain}.${tld}`;
            
            // Set the href for the user so it acts as a normal mail link
            link.setAttribute('href', `mailto:${email}`);
            
            // Mark as processed so it doesn't run again on this specific link
            link.dataset.secured = "true";
        }
    });
}

// 1. Run on initial hard load
document.addEventListener('DOMContentLoaded', initializeSecureEmails);

// 2. Run every time Elara fetches a new page via soft navigation
document.addEventListener('elara:loaded', initializeSecureEmails);