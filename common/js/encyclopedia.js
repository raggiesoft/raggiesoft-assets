(function() {
    function initEncyclopediaLinks() {
        const links = document.querySelectorAll('.lore-link');
        const dialogs = document.querySelectorAll('.encyclopedia-modal');
        const dialog = dialogs[dialogs.length - 1]; // Latest one in DOM (Elara SPA safety)
        
        if (!dialog) return;

        const titleEl = dialog.querySelector('#encyclopedia-modal-title');
        const bodyEl = dialog.querySelector('#encyclopedia-modal-body');
        const readMoreBtn = dialog.querySelector('#encyclopedia-modal-read-more');
        const closeBtn = dialog.querySelector('.close-encyclopedia-btn');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                dialog.open = false;
                try { dialog.hide(); } catch(e) {}
            });
        }

        links.forEach(link => {
            if (link.dataset.loreBound) return;
            link.dataset.loreBound = 'true';

            link.addEventListener('click', async (e) => {
                e.preventDefault();
                const entryId = link.getAttribute('data-lore');
                if (!entryId) return;

                // Reset modal state
                titleEl.textContent = 'Decrypting Archives...';
                bodyEl.innerHTML = '<div class="d-flex justify-content-center py-5"><wa-spinner class="fs-1"></wa-spinner></div>';
                readMoreBtn.style.display = 'none';
                
                // Strip out previous theme classes from the dialog
                Array.from(dialog.classList).forEach(cls => {
                    if (cls.startsWith('theme-') || cls.startsWith('wa-theme-')) {
                        dialog.classList.remove(cls);
                    }
                });

                // Show modal immediately with loading state
                dialog.open = true;
                try { dialog.show(); } catch(err) {}

                try {
                    const response = await fetch(`/api/lore?entry=${encodeURIComponent(entryId)}`);
                    if (!response.ok) throw new Error('Lore not found');
                    
                    const data = await response.json();
                    
                    titleEl.textContent = data.metadata.title || 'Unknown Record';
                    bodyEl.innerHTML = data.html;

                    // Apply custom theme if specified in YAML frontmatter
                    if (data.metadata.theme) {
                        dialog.classList.add(`theme-${data.metadata.theme}`);
                        dialog.classList.add(`wa-theme-${data.metadata.theme}`);
                    }

                    // Setup Read More link
                    readMoreBtn.href = `/encyclopedia/view?entry=${encodeURIComponent(entryId)}`;
                    readMoreBtn.style.display = 'block';

                } catch (error) {
                    titleEl.textContent = 'Error';
                    bodyEl.innerHTML = '<p class="text-danger">The requested archive could not be accessed or has been corrupted.</p>';
                    console.error("Encyclopedia Error:", error);
                }
            });
        });
    }

    // Run on initial load and Elara SPA navigation
    document.addEventListener('DOMContentLoaded', initEncyclopediaLinks);
    document.addEventListener('elara:loaded', initEncyclopediaLinks);
})();
