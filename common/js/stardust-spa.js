/**
 * Stardust Engine SPA Router
 * A hyper-optimized, standalone SPA router specifically for the Book Library.
 * Replaces page content without reloading so background music is uninterrupted.
 */

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', async (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');

        // Ignore dead links, utility protocols, and native interactions
        if (!href || href === '#' || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            if (href === '#') e.preventDefault();
            return;
        }

        // Ignore new tabs or modifier-key clicks
        if (link.target === '_blank' || e.ctrlKey || e.metaKey || e.shiftKey) return;

        const targetUrl = new URL(link.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        // Ignore external links
        if (targetUrl.origin !== currentUrl.origin) return;
        
        // Handle same-page anchor hash links (e.g. table of contents clicking to a header)
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

        e.preventDefault();
        await navigateTo(targetUrl.href);
    });

    window.addEventListener('popstate', async (e) => {
        await navigateTo(window.location.href, false);
    });
});

async function navigateTo(url, pushState = true) {
    document.dispatchEvent(new CustomEvent('stardust:navigating'));

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const htmlString = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');

        const newTitle = doc.querySelector('title')?.innerText;
        
        // The Book Library layout zone we want to swap out
        const layoutTarget = doc.querySelector('#stardust-app');

        if (layoutTarget) {
            // 1. SYNC BODY CLASSES FOR DYNAMIC THEMING
            // This ensures transitions between books update the theme variables correctly
            document.body.className = doc.body.className;

            // 2. SWAP THE CORE APP ZONE
            const currentApp = document.querySelector('#stardust-app');
            if (currentApp) {
                currentApp.replaceWith(layoutTarget);
            }

            // 3. EXECUTE INJECTED SCRIPTS
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

            // 5. SCROLL MANAGEMENT
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            
            // Re-anchor focus
            const readingPane = document.getElementById('stardust-reading-pane');
            if (readingPane) {
                readingPane.setAttribute('tabindex', '-1');
                readingPane.focus({ preventScroll: true }); 
            }

            document.dispatchEvent(new CustomEvent('stardust:loaded'));
        } else {
            // Fallback for fatal errors
            window.location.href = url;
        }
    } catch (error) {
        console.error('Stardust SPA Error:', error);
        window.location.href = url;
    }
}
