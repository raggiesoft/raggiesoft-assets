/**
 * RaggieSoft Elara SPA Router (Vanilla JS)
 * Replaces Turbo for lightweight, native page transitions.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Intercept all link clicks
    document.body.addEventListener('click', async (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        // THE FIX: Is this a Bootstrap component? 
        // Let Bootstrap's native event listeners handle it entirely.
        if (link.hasAttribute('data-bs-toggle') || link.hasAttribute('data-bs-dismiss')) {
            return; 
        }

        const href = link.getAttribute('href');
        
        // THE FIX: Ignore dead links and utility protocols
        if (!href || href === '#' || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            // Prevent the browser from jumping to the top of the page for empty hashes
            if (href === '#') e.preventDefault();
            return;
        }

        // Ignore new tabs or modifier-key clicks
        if (link.target === '_blank' || e.ctrlKey || e.metaKey || e.shiftKey) return;

        const targetUrl = new URL(link.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        // Ignore external links
        if (targetUrl.origin !== currentUrl.origin) return;
        
        // Ignore same-page anchor hash links (e.g., jump links to headers)
        if (targetUrl.pathname === currentUrl.pathname && targetUrl.hash !== '') return;

        // Prevent the hard reload
        e.preventDefault();
        
        // Execute the soft navigation
        await navigateTo(targetUrl.href);
    });


    // 2. Handle Browser Back/Forward Buttons
    window.addEventListener('popstate', async (e) => {
        // Pass false to prevent pushing a duplicate state to the history stack
        await navigateTo(window.location.href, false);
    });
});

async function navigateTo(url, pushState = true) {
    // Fire event to trigger your UI loader animation
    document.dispatchEvent(new CustomEvent('elara:navigating'));

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const htmlString = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');

        const newTitle = doc.querySelector('title')?.innerText;
        let hasCoreLayout = doc.querySelector('#elara-layout-wrapper');

        if (hasCoreLayout) {
            // --- 1. HEAD & META SYNC ENGINE ---
            
            // Sync HTML tag attributes (Critical for forced dark-mode themes)
            Array.from(doc.documentElement.attributes).forEach(attr => {
                document.documentElement.setAttribute(attr.name, attr.value);
            });

            // Diff and Update Stylesheets
            const getBaseHref = (link) => link.href.split('?')[0]; // Ignore ?v= timestamps for diffing
            const newLinks = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
            const oldLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

            // Add new stylesheets
            newLinks.forEach(newLink => {
                if (!oldLinks.some(old => getBaseHref(old) === getBaseHref(newLink))) {
                    document.head.appendChild(newLink.cloneNode(true));
                }
            });

            // Remove obsolete stylesheets
            oldLinks.forEach(oldLink => {
                if (!newLinks.some(newEl => getBaseHref(newEl) === getBaseHref(oldLink))) {
                    oldLink.remove();
                }
            });

            // Update Inline Styles (This fixes your dynamic brand fonts)
            const newStyles = doc.querySelectorAll('style');
            const oldStyles = document.querySelectorAll('style');
            newStyles.forEach((newStyle, index) => {
                if (oldStyles[index]) oldStyles[index].innerHTML = newStyle.innerHTML;
            });


            // --- 2. LOADER STATE UPDATE ---
            // Silently update the loader text so it displays correctly on the *next* click
            const newLoaderTitle = doc.querySelector('#page-loader h4');
            const oldLoaderTitle = document.querySelector('#page-loader h4');
            if (newLoaderTitle && oldLoaderTitle) {
                oldLoaderTitle.innerHTML = newLoaderTitle.innerHTML;
            }


            // --- 3. DOM ZONE SWAPPING ---
            const swapZones = [
                'header',                    
                '#elara-layout-wrapper',     
                '#visual-footer-container'   
            ];

            swapZones.forEach(selector => {
                const newEl = doc.querySelector(selector);
                const currentEl = document.querySelector(selector);
                
                if (newEl && currentEl) {
                    currentEl.replaceWith(newEl);

                    // Re-evaluate injected scripts so the audio player fires
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

            // Update title and URL
            if (newTitle) document.title = newTitle;
            if (pushState) window.history.pushState({ url: url }, newTitle, url);

            window.scrollTo(0, 0);
            document.dispatchEvent(new CustomEvent('elara:loaded'));

        } else {
            window.location.href = url;
        }
    } catch (error) {
        console.error('Elara SPA Error:', error);
        window.location.href = url;
    }
}