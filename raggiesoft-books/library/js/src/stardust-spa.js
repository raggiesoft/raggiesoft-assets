/**
 * =============================================================================
 * PLAIN-ENGLISH OVERVIEW FOR NEW DEVELOPERS (100-LEVEL JAVASCRIPT / WEB INTRO)
 * =============================================================================
 * File: library/js/src/stardust-spa.js
 * Compiled On Deploy By `jenna-sync.sh` To:
 *   `raggiesoft-assets/raggiesoft-books/library/js/stardust-spa.min.js`
 * Loaded By: `includes/components/footers/footer.php` at the bottom of `<body>`
 *
 * WHAT IS A "SINGLE PAGE APPLICATION" (SPA) ROUTER?
 *   In a traditional 1990s/2000s website, clicking `<a href="/katie/toc">` tells
 *   the browser to throw away the entire current web page—flashing a blank screen,
 *   re-parsing CSS/JS from scratch, and **destroying any `<audio>` soundtrack that
 *   was playing!**
 *
 *   Instead of installing a giant 100 KB+ framework like React Router, this ~190-line
 *   Vanilla ES2024 JavaScript file turns the entire PHP-rendered Book Reader into a
 *   silky-smooth Single Page Application ("Soft Navigation"):
 *     1. It listens for clicks on internal `<a href="...">` links across the page.
 *     2. Calls `e.preventDefault()` to cancel the browser's hard reload.
 *     3. Uses `fetch(url)` to download the next page's HTML in the background.
 *     4. Uses the browser's built-in `DOMParser` to parse that HTML string into an
 *        in-memory `Document` object (`doc`).
 *     5. Swaps ONLY `<div id="stardust-app">` (`currentApp.replaceWith(layoutTarget)`),
 *        leaving `<audio id="stardust-bgm">` and the top RaggieSoft Network bar
 *        sitting outside `#stardust-app` completely untouched so music keeps playing!
 *     6. Updates the URL bar (`history.pushState`), document `<title>`, reading
 *        theme classes, and keyboard/screen-reader focus (`#stardust-reading-pane`).
 *
 * CUSTOM DOM EVENTS EMITTED BY THIS FILE:
 *   - `'stardust:navigating'`: Fired on `document` right before `fetch(url)` starts.
 *   - `'stardust:loaded'`:     Fired on `document` right after the new `#stardust-app`
 *                              DOM, inline `<script>` tags, and stylesheets are live
 *                              (listened to by `reader.js` to bind chapter audio/UI!).
 * =============================================================================
 */

// Tell the browser NOT to auto-jump the scroll bar on Back/Forward navigation,
// because `#stardust-reading-pane` is an internal scrollable Flexbox pane and
// we manage scroll position explicitly inside `navigateTo()` below.
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // 1. GLOBAL EVENT DELEGATION FOR LINK CLICKS
    // =========================================================================
    // Why attach ONE click listener to `document.body` instead of looping over
    // `document.querySelectorAll('a')`?
    //   1. **Performance**: One listener handles 10 links or 1,000 TOC links with zero overhead.
    //   2. **Survives DOM Swaps**: When `navigateTo()` replaces `#stardust-app` with brand-new
    //      chapter HTML, clicks on the new links bubble up to `document.body` automatically!
    document.body.addEventListener('click', async (e) => {
        // `e.target` might be an `<i>` icon or `<span>` nested *inside* `<a href="...">`.
        // `.closest('a')` walks up the ancestor tree to find the enclosing `<a>` element (or `null`).
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');

        // Guard 1: Ignore empty hashes (`#`), `javascript:`, `mailto:`, and `tel:` links
        if (!href || href === '#' || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            if (href === '#') e.preventDefault(); // Prevent `#` placeholder links from jumping to top
            return;
        }

        // Guard 2: Respect user & author intent!
        //   - `target="_blank"` -> open in a new tab normally
        //   - `data-no-spa`     -> explicit opt-out attribute for hard reloads / anchor pills
        //   - `ctrlKey` / `metaKey` (Cmd on Mac) / `shiftKey` -> user wants a new tab or window!
        if (link.target === '_blank' || link.hasAttribute('data-no-spa') || e.ctrlKey || e.metaKey || e.shiftKey) return;

        // Resolve relative URLs (like `href="/library"`) against `window.location.href`
        const targetUrl = new URL(link.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        // Guard 3: Never intercept external links (`music.raggiesoft.com`, `raggiesoft.com`, EPUB CDN URLs, etc.).
        // Let the browser navigate normally when `origin` (`https://books.raggiesoft.com`) differs!
        if (targetUrl.origin !== currentUrl.origin) return;
        
        // Guard 4: Same-page `#section` hash jump (e.g., clicking a heading anchor on the current page).
        // Smoothly scroll to the target element and update the URL hash without fetching the server.
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

        // All guards passed! Cancel the browser's hard page reload and run our soft SPA transition.
        e.preventDefault();
        await navigateTo(targetUrl.href);
    });

    // =========================================================================
    // 2. BROWSER BACK / FORWARD BUTTON SUPPORT (`popstate`)
    // =========================================================================
    // Whenever the reader clicks the browser's Back or Forward button, the browser
    // updates `window.location.href` to the previous history entry and fires `'popstate'`.
    // Note `pushState = false`: we pass `false` so we don't push a duplicate history entry
    // on top of the history entry the user just stepped back to!
    window.addEventListener('popstate', async (e) => {
        await navigateTo(window.location.href, false);
    });
});

/**
 * Core Soft-Navigation Engine (`navigateTo`)
 * -----------------------------------------------------------------------------
 * Downloads the HTML of `url` via `fetch()`, parses it into an off-screen virtual
 * DOM with `DOMParser`, swaps `#stardust-app`, re-runs any inline `<script>` tags,
 * syncs `<head>` stylesheets & reading theme classes, and restores accessible focus.
 *
 * @param {string} url       - Absolute URL to load (e.g. `"https://books.raggiesoft.com/katie"`).
 * @param {boolean} pushState - `true` on link clicks (adds history entry); `false` on `popstate`.
 */
async function navigateTo(url, pushState = true) {
    // Notify any UI listeners (e.g. loading indicators) that navigation is starting
    document.dispatchEvent(new CustomEvent('stardust:navigating'));

    try {
        // Fetch the server-rendered HTML from `eleanor/isabel.php`
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        // Convert the raw HTML string into a queryable `Document` object in memory!
        // Importantly, `DOMParser` is completely inert: scripts inside `doc` don't execute yet,
        // and the live page on screen doesn't flicker while we prepare the swap.
        const htmlString = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');

        // Optional chaining (`?.`) safely returns `undefined` if `<title>` were ever missing
        const newTitle = doc.querySelector('title')?.innerText;
        
        // Locate the `#stardust-app` container inside the newly fetched HTML document
        const layoutTarget = doc.querySelector('#stardust-app');

        if (layoutTarget) {
            // =================================================================
            // STEP 1: SYNC `<body>` READING THEME CLASSES & ROOT `color-scheme`
            // =================================================================
            // Keep the new route's base theme class (e.g. `theme-oceanview` or `theme-night`)
            // while layering the user's saved `localStorage` reading preference (`theme-light`,
            // `theme-dark`, `theme-sepia`, `theme-dark-sepia`, `theme-sepia-system`, or `theme-auto`)
            // so switching pages NEVER flashes the wrong background color!
            let nextClass = doc.body.className || 'theme-oceanview';
            let activeTheme = 'auto';
            try {
                const stored = localStorage.getItem('reader-settings');
                if (stored) {
                    const settings = JSON.parse(stored);
                    if (settings && settings.theme) {
                        activeTheme = settings.theme;
                    }
                }
            } catch(e) {}
            nextClass = nextClass
                .replace(/\btheme-(auto|light|sepia|dark|dark-sepia|sepia-system|custom)\b/g, '')
                .trim() + ' theme-' + activeTheme;
            document.body.className = nextClass.trim();
            delete document.body.dataset.narrativeTheme;
            document.documentElement.style.colorScheme = (activeTheme === 'light' || activeTheme === 'sepia')
                ? 'light'
                : ((activeTheme === 'dark' || activeTheme === 'dark-sepia') ? 'dark' : 'light dark');
            // Remove any chapter-specific narrative theme `<meta>` or `<link>` from the previous chapter
            document.head.querySelectorAll('meta[name="stardust-narrative-theme"], link#narrative-theme-css').forEach(el => el.remove());


            // =================================================================
            // STEP 2: SWAP `#stardust-app` IN ONE ATOMIC DOM OPERATION
            // =================================================================
            // Because `<audio id="stardust-bgm">` lives ABOVE `#stardust-app` in `header.php`,
            // `currentApp.replaceWith(layoutTarget)` swaps the entire visible screen while
            // background soundtrack playback continues without a single dropped audio sample!
            const currentApp = document.querySelector('#stardust-app');
            if (currentApp) {
                currentApp.replaceWith(layoutTarget);
            }

            // =================================================================
            // STEP 3: RE-CREATE & EXECUTE INLINE `<script>` TAGS + SYNC CSS
            // =================================================================
            // HTML5 Security Rule: `<script>` elements created by `DOMParser` or `innerHTML`
            // are marked "already started / inert" by the browser and will NOT run when inserted!
            // Creating a brand-new `document.createElement('script')`, copying its attributes
            // and code text, and replacing each inert `<script>` tells the browser to run it
            // (powering page-specific widgets like `illustrations-toc.php` & `illustration-lightbox-dialog.php`!).
            const newlyInjectedApp = document.querySelector('#stardust-app');
            const scripts = newlyInjectedApp.querySelectorAll('script');
            scripts.forEach(oldScript => {
                const newScript = document.createElement('script');
                Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                oldScript.parentNode.replaceChild(newScript, oldScript);
            });

            // If the new page's `<head>` references a theme stylesheet not yet in `document.head`
            // (for example, switching from `theme-oceanview.min.css` to `theme-night.min.css`), append it.
            const newLinks = doc.head.querySelectorAll('link[rel="stylesheet"]');
            const currentLinks = Array.from(document.head.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href);
            newLinks.forEach(newLink => {
                if (!currentLinks.includes(newLink.href)) {
                    const clonedLink = newLink.cloneNode();
                    document.head.appendChild(clonedLink);
                }
            });

            // =================================================================
            // STEP 4: UPDATE TAB TITLE & ADDRESS BAR URL (`history.pushState`)
            // =================================================================
            if (newTitle) document.title = newTitle;
            if (pushState) window.history.pushState({ url: url }, newTitle, url);

            // =================================================================
            // STEP 5: SCROLL RESET & SCREEN-READER FOCUS RESTORATION
            // =================================================================
            // Reset window scroll position to `(0, 0)` immediately
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            
            // Accessibility essential: In a traditional page load, screen readers automatically
            // move focus to the top of the new document. In an SPA, focus would otherwise get
            // stranded or lost when the clicked `<a>` tag is replaced! Giving `#stardust-reading-pane`
            // `tabindex="-1"` lets JavaScript focus it programmatically (without adding an unwanted
            // Tab stop) so VoiceOver/NVDA announces the newly loaded chapter cleanly.
            const readingPane = document.getElementById('stardust-reading-pane');
            if (readingPane) {
                readingPane.setAttribute('tabindex', '-1');
                readingPane.focus({ preventScroll: true }); 
            }

            // Notify `reader.js` and other listeners that the new route DOM is live!
            document.dispatchEvent(new CustomEvent('stardust:loaded'));
        } else {
            // Safety fallback: if the fetched URL wasn't a Stardust page, perform a normal browser navigation
            window.location.href = url;
        }
    } catch (error) {
        console.error('Stardust SPA Error:', error);
        // Safety fallback: if `fetch()` failed (e.g. HTTP 404 or transient error), fall back to standard navigation
        window.location.href = url;
    }
}
