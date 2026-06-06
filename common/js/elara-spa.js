/**
 * RaggieSoft Elara SPA Router (Vanilla JS)
 * Replaces Turbo for lightweight, native page transitions.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Intercept all link clicks
    document.body.addEventListener('click', async (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        // Ignore javascript, mailto, tel, and empty links
        if (!href || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

        // Ignore new tabs or modifier-key clicks
        if (link.target === '_blank' || e.ctrlKey || e.metaKey || e.shiftKey) return;

        const targetUrl = new URL(link.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        // Ignore external links
        if (targetUrl.origin !== currentUrl.origin) return;
        
        // Ignore same-page anchor hash links
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
        // Fetch the new page HTML behind the scenes
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const htmlString = await response.text();

        // Parse the raw text into a virtual DOM
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');

        // Target exactly what we need to swap
        const newMain = doc.querySelector('#main-content');
        const newTitle = doc.querySelector('title')?.innerText;

        if (newMain) {
            // Perform the surgical swap on the live DOM
            const currentMain = document.querySelector('#main-content');
            currentMain.replaceWith(newMain);

            // Update the browser tab title
            if (newTitle) document.title = newTitle;

            // Update the URL bar cleanly
            if (pushState) {
                window.history.pushState({ url: url }, newTitle, url);
            }

            // Snap the user back to the top of the new page
            window.scrollTo(0, 0);

            // Fire event to hide the loader and re-bind Stardust Engine JS
            document.dispatchEvent(new CustomEvent('elara:loaded'));
        } else {
            // Safety Net: If the fetched page doesn't have a #main-content, force a hard reload
            window.location.href = url;
        }
    } catch (error) {
        console.error('Elara SPA Error:', error);
        // Safety Net: If the network drops or fetch fails, force a hard reload
        window.location.href = url;
    }
}