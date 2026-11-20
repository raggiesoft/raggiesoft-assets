/**
 * ============================================================================
 * READ-ALONG TEACHING OVERVIEW: elara-spa.js
 * ============================================================================
 * WHAT THIS FILE IS:
 *   "Elara" is RaggieSoft's custom, zero-dependency Vanilla JavaScript Single
 *   Page Application (SPA) router and email-link obfuscator. Instead of forcing
 *   the browser to tear down the entire window, re-download shared CSS/JS, and
 *   flash white on every click, Elara intercepts internal `<a href="...">` clicks,
 *   fetches the destination HTML in the background with `fetch()`, and swaps
 *   only the changed layout regions in milliseconds.
 *
 * WHICH WEBSITES LOAD IT:
 *   Loaded from `https://assets.raggiesoft.com/common/js/elara-spa.js` primarily
 *   on `raggiesoft.com` (PHP 8.5 + DaisyUI 5 SSR) and Elara front-controller sites.
 *
 * WHAT INPUTS IT CONSUMES:
 *   1. User clicks on `<a>` links inside `document.body`, plus browser Back/Forward
 *      button events (`window.addEventListener('popstate', ...)`).
 *   2. Server-rendered HTML responses containing `<div id="elara-layout-wrapper">`,
 *      `<header>`, and `<footer id="elara-master-footer">`.
 *   3. Obfuscated email anchors (`<a class="elara-secure-mail" data-u="..." data-d="..." data-t="...">`).
 *
 * WHAT VISIBLE UI & EVENTS IT PRODUCES:
 *   - Dispatches `elara:navigating` (so loading indicators can appear) before
 *     fetching, swaps `<head>` metadata/stylesheets/JSON-LD + body zones, preserves
 *     Light/Dark theme attributes, updates the browser URL bar (`history.pushState`),
 *     moves screen-reader focus to `#main-content`, and dispatches `elara:loaded`
 *     so component scripts (`cinema-carousel.js`, `hero-image.js`, `raggiesoft-network.js`,
 *     etc.) re-initialize on the newly injected DOM!
 *
 * 100-LEVEL JAVASCRIPT CONCEPTS TAUGHT IN THIS FILE:
 *   - Event Delegation (`document.body.addEventListener('click', ...)` + `.closest('a')`).
 *   - Off-Screen HTML Parsing (`new DOMParser().parseFromString(html, 'text/html')`).
 *   - HTML5 History API (`history.pushState`, `popstate`, `history.scrollRestoration`).
 *   - Why `<script>` tags inside replaced DOM nodes don't auto-run (and how
 *     rebuilding them with `document.createElement('script')` executes them).
 *   - Accessible SPA Focus Management (`tabindex="-1"` + `.focus({ preventScroll: true })`).
 * ============================================================================
 */

/* Tell the browser NOT to auto-jump the scroll bar on Back/Forward navigation
 * before Elara has finished fetching and swapping the new page's HTML height! */
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

document.addEventListener('DOMContentLoaded', () => {
    /**
     * ========================================================================
     * 1. GLOBAL LINK INTERCEPTOR (EVENT DELEGATION ON `document.body`)
     * ========================================================================
     * Why listen on `document.body` instead of `querySelectorAll('a')`?
     * Because every time Elara swaps in a new page, hundreds of old `<a>` tags
     * are destroyed and new ones are inserted! Because click events "bubble" up
     * from any child element (`<span>`, `<svg>`, `<img>`, `<a>`) to `document.body`,
     * a single listener here catches clicks on every current and future link.
     */
    document.body.addEventListener('click', async (e) => {
        /* `e.target` might be an icon `<i>` or `<span>` *inside* `<a href="/about">`.
         * `.closest('a')` walks up the ancestor chain to find the enclosing `<a>`
         * tag (or returns `null` if the user clicked plain text or a `<button>`). */
        const link = e.target.closest('a');
        if (!link) return;

        /* Read the raw `href` attribute string exactly as written in HTML. */
        const href = link.getAttribute('href');

        /* GUARD 1: Ignore UI component toggles (`data-bs-toggle` / `data-bs-dismiss`)
         * Dropdown toggles, modal close links, and tab triggers aren't real page
         * navigations—let their own component JS handle them. */
        if (link.hasAttribute('data-bs-toggle') || link.hasAttribute('data-bs-dismiss')) {
            /* If it uses a dummy `href="#"`, stop the browser from jumping to the top of the page. */
            if (href && href.startsWith('#')) e.preventDefault();
            return; 
        }
        
        /* GUARD 2: Ignore non-HTTP pseudo-protocols (`#`, `javascript:`, `mailto:`, `tel:`)
         * Clicking an email address or phone number should open the user's Mail/Phone app,
         * NOT try to `fetch('mailto:...')`! */
        if (!href || href === '#' || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            if (href === '#') e.preventDefault();
            return;
        }

        /* GUARD 3: Respect "Open in New Tab / Window" gestures!
         * If the link has `target="_blank"`, or the user held Ctrl (Windows/Linux),
         * Cmd (`metaKey` on macOS), or Shift (New Window), return immediately so
         * the browser performs its native new-tab behavior untouched. */
        if (link.target === '_blank' || e.ctrlKey || e.metaKey || e.shiftKey) return;

        /* Parse both the link's destination and the current page into structured
         * `URL` objects (`origin`, `pathname`, `search`, `hash`). */
        const targetUrl = new URL(link.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        /* GUARD 4: Ignore cross-origin / external links (e.g., `raggiesoft.com` -> `music.raggiesoft.com`
         * or `github.com`). Browser security (CORS) and separate tech stacks require a real
         * full-page navigation when `origin` (protocol + hostname + port) differs. */
        if (targetUrl.origin !== currentUrl.origin) return;
        
        /* GUARD 5: Same-page `#section` hash links (e.g., Table of Contents jump links)
         * If we are already on `/about` and the user clicks `/about#mission`, don't
         * re-fetch `/about` over the network—just smooth-scroll to `#mission`! */
        if (targetUrl.pathname === currentUrl.pathname && targetUrl.hash !== '') {
            e.preventDefault(); // Prevent abrupt browser jump
            const targetId = targetUrl.hash.substring(1); // Strip leading `'#'`
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                /* Record `#mission` in browser history so the Back button returns to the previous scroll spot. */
                window.history.pushState(null, null, targetUrl.hash);
            }
            return;
        }
        
        /* Edge case: trailing bare `#` on the current URL (e.g., `href="/about#"`). */
        if (targetUrl.pathname === currentUrl.pathname && link.href.endsWith('#')) {
            e.preventDefault();
            return;
        }

        /* Passed all guards! This is an internal same-origin page navigation.
         * Cancel the browser's default hard page reload and run our soft SPA swap instead. */
        e.preventDefault();
        await navigateTo(targetUrl.href);
    });


    /**
     * ========================================================================
     * 2. BROWSER BACK / FORWARD BUTTON HANDLER (`popstate`)
     * ========================================================================
     * Whenever the user clicks the browser's Back or Forward arrow, the browser
     * changes `window.location.href` to that history entry's URL and fires
     * `popstate`. We call `navigateTo(window.location.href, false)`—passing
     * `pushState = false` because the browser ALREADY moved its history pointer,
     * and pushing a duplicate state would break the Forward button!
     */
    window.addEventListener('popstate', async (e) => {
        await navigateTo(window.location.href, false);
    });
});



/**
 * ============================================================================
 * CORE SOFT-NAVIGATION ENGINE (`navigateTo`)
 * ============================================================================
 * Downloads `url` via `fetch()`, parses it into an off-screen virtual DOM,
 * reconciles `<head>` attributes/stylesheets/styles/JSON-LD, swaps body zones,
 * re-executes inline/page `<script>` tags, and manages scroll + screen-reader focus.
 *
 * @param {string} url - Full destination URL on the same origin.
 * @param {boolean} pushState - `true` on link clicks (adds a new Back-button entry);
 *                              `false` on `popstate` (replays an existing entry).
 */
async function navigateTo(url, pushState = true) {
    /* Broadcast a custom event on `document` so optional top progress bars or
     * page-loader overlays know a network fetch just started. */
    document.dispatchEvent(new CustomEvent('elara:navigating'));

    try {
        /* STEP 1: FETCH RAW HTML TEXT OVER HTTP */
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const htmlString = await response.text();

        /* STEP 2: PARSE HTML STRING INTO AN INERT VIRTUAL `Document` (`doc`)
         * `DOMParser` builds a complete DOM tree in memory (`doc.head`, `doc.body`,
         * `doc.querySelector(...)`) WITHOUT rendering anything on screen or running
         * scripts yet. */
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');

        /* Optional chaining (`?.`) safely returns `undefined` if `<title>` is absent. */
        const newTitle = doc.querySelector('title')?.innerText;
        /* Verify the fetched page actually uses the Elara layout (`#elara-layout-wrapper`).
         * If the link pointed to a standalone PDF, feed, or non-Elara app, we'll fall
         * back to `window.location.href = url` in the `else` branch below. */
        let hasCoreLayout = doc.querySelector('#elara-layout-wrapper');

        if (hasCoreLayout) {
            /* ================================================================
             * PHASE 1: `<head>` & ROOT `<html>` ATTRIBUTE SYNCHRONIZATION
             * ================================================================ */

            /* Snapshot attributes on both the incoming `<html>` tag and live `<html>` tag
             * (for example `lang="en"`, `data-bs-theme="dark"`, `data-theme="dark"`). */
            const newHtmlAttrs = Array.from(doc.documentElement.attributes);
            const currentHtmlAttrs = Array.from(document.documentElement.attributes);

            /* 1A. Remove attributes from the live `<html>` tag if the new page doesn't have them. */
            currentHtmlAttrs.forEach(attr => {
                if (!doc.documentElement.hasAttribute(attr.name)) {
                    document.documentElement.removeAttribute(attr.name);
                }
            });

            /* 1B. Copy every attribute from the incoming `<html>` tag onto the live `<html>` tag. */
            newHtmlAttrs.forEach(attr => {
                document.documentElement.setAttribute(attr.name, attr.value);
            });

            /* 1C. THEME CONTINUITY SAFEGUARD (Light & Dark Mode Retention)
             * Server-rendered PHP HTML doesn't know the visitor's client-side `localStorage`
             * or OS `prefers-color-scheme`, so `doc.documentElement` may arrive without
             * `data-bs-theme` / `data-theme`. Step 1A above would then strip the user's
             * active Dark Mode! Here we immediately restore both `data-bs-theme` (Bootstrap)
             * and `data-theme` (DaisyUI 5) from `localStorage` or OS `matchMedia`. */
            if (!doc.documentElement.hasAttribute('data-bs-theme')) {
                const storedTheme = localStorage.getItem('theme');
                const preferredTheme = storedTheme ? storedTheme : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.setAttribute('data-bs-theme', preferredTheme);
                document.documentElement.setAttribute('data-theme', preferredTheme);
            } else if (!doc.documentElement.hasAttribute('data-theme')) {
                /* If the new page forced a specific `data-bs-theme` (like a cosmic dark tribute page),
                 * mirror that exact value onto DaisyUI 5's `data-theme` attribute so canvas tokens match. */
                document.documentElement.setAttribute('data-theme', doc.documentElement.getAttribute('data-bs-theme'));
            }

            /* 1D. DIFF `<link rel="stylesheet">` TAGS
             * Why diff instead of wiping `<head>`? If we removed and re-added shared CSS
             * like `raggiesoft-grid.css`, the page would flash unstyled (FOUC) on every click!
             * Instead, we compare base URLs (stripping `?v=timestamp` cache-busters):
             *   - Append stylesheets that only exist on the NEW page.
             *   - Remove stylesheets that only existed on the OLD page. */
            const getBaseHref = (link) => link.href.split('?')[0];
            const newLinks = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
            const oldLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

            newLinks.forEach(newLink => {
                if (!oldLinks.some(old => getBaseHref(old) === getBaseHref(newLink))) {
                    document.head.appendChild(newLink.cloneNode(true));
                }
            });

            oldLinks.forEach(oldLink => {
                if (!newLinks.some(newEl => getBaseHref(newEl) === getBaseHref(oldLink))) {
                    oldLink.remove();
                }
            });

            /* 1E. SYNC PAGE-SPECIFIC `<style>` BLOCKS IN `<head>`
             * Replaces inline `<style>` blocks from the old page with the new page's `<style>`
             * blocks, while carefully preserving `#rs-network-core-css` (which `raggiesoft-network.js`
             * injects once per tab session). */
            const newHeadStyles = Array.from(doc.head.querySelectorAll('style'));
            const oldHeadStyles = Array.from(document.head.querySelectorAll('style'));

            oldHeadStyles.forEach(style => {
                if (style.id !== 'rs-network-core-css') {
                    style.remove();
                }
            });
            newHeadStyles.forEach(style => {
                if (style.id !== 'rs-network-core-css') {
                    document.head.appendChild(style.cloneNode(true));
                }
            });

            /* 1F. SYNC `<script type="application/ld+json">` STRUCTURED DATA IN `<head>`
             * Keeps Schema.org SEO metadata accurate for the current page while preserving
             * the persistent `#rs-ecosystem-jsonld` graph injected by `raggiesoft-network.js`. */
            const newHeadJsonLd = Array.from(doc.head.querySelectorAll('script[type="application/ld+json"]'));
            const oldHeadJsonLd = Array.from(document.head.querySelectorAll('script[type="application/ld+json"]'));
            oldHeadJsonLd.forEach(script => {
                if (script.id !== 'rs-ecosystem-jsonld') {
                    script.remove();
                }
            });
            newHeadJsonLd.forEach(script => {
                if (script.id !== 'rs-ecosystem-jsonld') {
                    document.head.appendChild(script.cloneNode(true));
                }
            });


            /* ================================================================
             * PHASE 2: LOADER LABEL & PRE-SWAP SCROLL LOCK
             * ================================================================ */
            /* Update the optional `#page-loader h4` label to match the incoming page. */
            const newLoaderTitle = doc.querySelector('#page-loader h4');
            const oldLoaderTitle = document.querySelector('#page-loader h4');
            if (newLoaderTitle && oldLoaderTitle) {
                oldLoaderTitle.innerHTML = newLoaderTitle.innerHTML;
            }

            /* Disable CSS `scroll-behavior: smooth` BEFORE replacing DOM content!
             * Otherwise, jumping from `y = 3000px` on a long article to `y = 0px` on a
             * short page causes a dizzying visible upward scroll animation. */
            document.documentElement.style.scrollBehavior = 'auto';

            /* Snap scroll coordinates to `(0, 0)` across `window`, `<html>`, and `<body>`. */
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;


            /* ================================================================
             * PHASE 3: SWAP BODY ZONES & RE-EXECUTE PAGE `<script>` TAGS
             * ================================================================ */
            /* Only these three semantic layout containers are replaced—persistent
             * top-level elements outside them (like `.rs-network-bar` or background
             * audio players) survive untouched! */
            const swapZones = [
                'header',                    
                '#elara-layout-wrapper',     
                '#elara-master-footer'   
            ];

            swapZones.forEach(selector => {
                const newEl = doc.querySelector(selector);
                const currentEl = document.querySelector(selector);
                
                if (newEl && currentEl) {
                    /* Replace the old live DOM node with the newly parsed node in one atomic step. */
                    currentEl.replaceWith(newEl);

                    /* CRITICAL HTML5 SECURITY QUIRK:
                     * Any `<script>` tag that came out of `DOMParser` is marked "already started / inert"
                     * by the browser, so `replaceWith(newEl)` will NOT execute inline or external
                     * `<script>` tags inside the swapped zone!
                     * Solution: Create a brand-new `document.createElement('script')`, copy all
                     * attributes (`src`, `type`, `defer`, etc.) and inline code, and swap it in
                     * so the browser's JS engine runs it as a fresh script. */
                    const newlyInjectedEl = document.querySelector(selector);
                    const scripts = newlyInjectedEl.querySelectorAll('script');
                    
                    scripts.forEach(oldScript => {
                        const newScript = document.createElement('script');
                        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                        oldScript.parentNode.replaceChild(newScript, oldScript);
                    });
                }
            });

            /* Update the browser tab's title and URL address bar (`history.pushState`). */
            if (newTitle) document.title = newTitle;
            if (pushState) window.history.pushState({ url: url }, newTitle, url);

            /* ================================================================
             * PHASE 4: SYNCHRONOUS REFLOW, ACCESSIBLE FOCUS & `elara:loaded`
             * ================================================================ */
            
            /* Reading `.offsetHeight` forces the browser to compute layout measurements
             * for the newly swapped DOM right now ("forced synchronous reflow").
             * `void` tells readers and linters we intentionally discard the numeric return value. */
            void document.documentElement.offsetHeight;

            /* Wait one 15ms frame so layout/paint settles before finalizing scroll & focus. */
            setTimeout(() => {
                /* Lock scroll position at `(0, 0)` one final time after layout calculation. */
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;

                /* WCAG 2.1 AA SCREEN-READER FOCUS MANAGEMENT:
                 * On a traditional full-page load, screen readers (VoiceOver, NVDA, JAWS)
                 * automatically start at the top of the new document. In an SPA, focus would
                 * otherwise stay stuck on the nav link the user just clicked!
                 * Giving `#main-content` `tabindex="-1"` makes a non-interactive `<main>`
                 * programmatically focusable via `.focus({ preventScroll: true })` without
                 * adding it to the normal Tab-key ring. */
                const mainContent = document.getElementById('main-content') || document.body;
                mainContent.setAttribute('tabindex', '-1');
                mainContent.focus({ preventScroll: true }); 
                if (mainContent === document.body) mainContent.removeAttribute('tabindex');

                /* Restore normal smooth scrolling for in-page `#hash` jumps. */
                document.documentElement.style.scrollBehavior = '';

                /* Broadcast `elara:loaded` so page widgets (`cinema-carousel.js`,
                 * `encyclopedia.js`, `glowing-galaxy.js`, `hero-image.js`, `raggiesoft-network.js`)
                 * bind to the newly swapped DOM! */
                document.dispatchEvent(new CustomEvent('elara:loaded'));
            }, 15);

        } else {
            /* Graceful Fallback 1: Target URL isn't an Elara template -> perform normal browser navigation. */
            window.location.href = url;
        }
    } catch (error) {
        /* Graceful Fallback 2: Network glitch or non-200 HTTP status -> let the browser navigate normally. */
        console.error('Elara SPA Error:', error);
        window.location.href = url;
    }
}

/**
 * ============================================================================
 * 3. ELARA SECURE MAIL OBFUSCATOR (`initializeSecureEmails`)
 * ============================================================================
 * Automated spam bots crawl raw HTML source looking for `mailto:name@domain.com`
 * strings. Instead of printing full email addresses in PHP HTML, templates render:
 *   `<a class="elara-secure-mail" data-u="contact" data-d="raggiesoft" data-t="com">`
 * When a real browser runs this function, it stitches `mailto:contact@raggiesoft.com`
 * into `href` dynamically so human visitors can click it normally!
 */
function initializeSecureEmails() {
    document.querySelectorAll('.elara-secure-mail').forEach(link => {
        /* Skip links we already assembled during this page view (`data-secured="true"`). */
        if (link.dataset.secured === "true") return;
        
        /* Read the three split pieces: username (`data-u`), domain (`data-d`), TLD (`data-t`). */
        const user = link.getAttribute('data-u');
        const domain = link.getAttribute('data-d');
        const tld = link.getAttribute('data-t');
        
        if (user && domain && tld) {
            /* Assemble `user@domain.tld` using an ES6 template literal. */
            const email = `${user}@${domain}.${tld}`;
            
            /* Upgrade the anchor into a live clickable `mailto:` link. */
            link.setAttribute('href', `mailto:${email}`);
            
            /* Mark processed so `elara:loaded` won't re-process persistent footer links. */
            link.dataset.secured = "true";
        }
    });
}

/* Run email assembly on initial hard load AND after every Elara soft page swap. */
document.addEventListener('DOMContentLoaded', initializeSecureEmails);
document.addEventListener('elara:loaded', initializeSecureEmails);
