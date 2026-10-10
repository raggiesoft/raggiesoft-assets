/**
 * ============================================================================
 * STARDUST ENGINE - NATIVE SPA ROUTER
 * ============================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * A hyper-optimized, vanilla JavaScript Single Page Application (SPA) router 
 * specifically engineered for the Stardust Book Library. It intercepts standard
 * HTML anchor clicks, fetches the new page via AJAX, and seamlessly replaces
 * only the `#stardust-app` DOM node.
 * 
 * CORE RESPONSIBILITIES:
 * 1. Uninterrupted Media Playback: By preventing full page reloads, the global
 *    audio player (located outside the replaced DOM node or managed persistently) 
 *    continues playing background music across chapter navigations.
 * 2. Event Delegation: Attaches a single click listener to the `body` to handle
 *    all current and future anchor tags dynamically.
 * 3. Script Execution: Manually extracts and re-injects `<script>` tags from 
 *    the fetched HTML payload to ensure page-specific logic executes.
 * 4. Accessibility & State: Manages browser History API, restores focus for 
 *    screen readers, and handles intra-page anchor links smoothly.
 * 
 * USAGE INSTRUCTIONS:
 * - Load globally on all library pages.
 * - Rely on `stardust:navigating` and `stardust:loaded` events to trigger 
 *   loading spinners or analytics.
 * ============================================================================
 */

// Disable the browser's native scroll restoration to prevent jarring jumps
// when the DOM is being manually replaced by the SPA router.
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

document.addEventListener('DOMContentLoaded', () => {
    // Global Event Delegation: Intercept all clicks on the document
    document.body.addEventListener('click', async (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');

        // Ignore dead links, utility protocols (mailto, tel), and native interactions
        if (!href || href === '#' || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            if (href === '#') e.preventDefault(); // Prevent jump to top for empty hashes
            return;
        }

        // Respect user intent: Ignore new tabs or modifier-key clicks (Ctrl, Cmd, Shift)
        if (link.target === '_blank' || e.ctrlKey || e.metaKey || e.shiftKey) return;

        const targetUrl = new URL(link.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        // Security & Scope: Ignore external links pointing away from the current domain
        if (targetUrl.origin !== currentUrl.origin) return;
        
        // Handle same-page anchor hash links (e.g. Table of Contents clicking to a header)
        if (targetUrl.pathname === currentUrl.pathname && targetUrl.hash !== '') {
            e.preventDefault();
            const targetId = targetUrl.hash.substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                window.history.pushState(null, null, targetUrl.hash);
            }
            return;
        }

        // If all checks pass, intercept the click and route through the SPA
        e.preventDefault();
        await navigateTo(targetUrl.href);
    });

    // Handle browser Back/Forward buttons gracefully
    window.addEventListener('popstate', async (e) => {
        await navigateTo(window.location.href, false);
    });
});

/**
 * Core Navigation Engine
 * Fetches the requested URL and patches the local DOM.
 * 
 * @param {string} url - The absolute URL to fetch.
 * @param {boolean} pushState - Whether to push a new entry to the browser history.
 */
async function navigateTo(url, pushState = true) {
    // Broadcast pre-navigation event (useful for UI loading bars)
    document.dispatchEvent(new CustomEvent('stardust:navigating'));

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        // Parse the raw HTML string into a virtual DOM document
        const htmlString = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');

        const newTitle = doc.querySelector('title')?.innerText;
        
        // Isolate the Book Library layout zone we want to swap out
        const layoutTarget = doc.querySelector('#stardust-app');

        if (layoutTarget) {
            // 1. SYNC BODY CLASSES FOR DYNAMIC THEMING
            // This ensures transitions between books update the theme variables correctly
            // (e.g. swapping from `theme-oceanview` to `theme-crimson`)
            
            let nextClass = doc.body.className;
            try {
                const stored = localStorage.getItem('reader-settings');
                if (stored) {
                    const settings = JSON.parse(stored);
                    const isSystemPage = nextClass.includes('theme-oceanview');
                    if (settings.theme && settings.theme !== 'auto') {
                        if (settings.customThemeEnabled === false || isSystemPage) {
                            nextClass = nextClass.replace(/theme-[a-z-]+/g, '').trim() + ' theme-' + settings.theme;
                        }
                    }
                }
            } catch(e) {}
            document.body.className = nextClass.trim();


            // 2. SWAP THE CORE APP ZONE
            // Replaces the current visible app with the newly fetched DOM node
            const currentApp = document.querySelector('#stardust-app');
            if (currentApp) {
                currentApp.replaceWith(layoutTarget);
            }

            // 3. EXECUTE INJECTED SCRIPTS
            // Browsers will not execute <script> tags inserted via innerHTML/replaceWith.
            // We must manually clone and append them to force execution.
            const newlyInjectedApp = document.querySelector('#stardust-app');
            const scripts = newlyInjectedApp.querySelectorAll('script');
            scripts.forEach(oldScript => {
                const newScript = document.createElement('script');
                Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                oldScript.parentNode.replaceChild(newScript, oldScript);
            });

            // 4. UPDATE BROWSER STATE
            if (newTitle) document.title = newTitle;
            if (pushState) window.history.pushState({ url: url }, newTitle, url);

            // 5. SCROLL MANAGEMENT & ACCESSIBILITY
            // Reset scroll position to the top instantly
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            
            // Re-anchor focus to the reading pane to ensure screen readers announce the new content
            const readingPane = document.getElementById('stardust-reading-pane');
            if (readingPane) {
                readingPane.setAttribute('tabindex', '-1');
                readingPane.focus({ preventScroll: true }); 
            }

            // Broadcast success event
            document.dispatchEvent(new CustomEvent('stardust:loaded'));
        } else {
            // Fallback for fatal errors (e.g., target page isn't a Stardust App)
            window.location.href = url;
        }
    } catch (error) {
        console.error('Stardust SPA Error:', error);
        // Hard fallback to standard navigation if fetch fails (network error, etc.)
        window.location.href = url;
    }
}
