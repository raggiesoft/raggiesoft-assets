/* Stardust Engine JS */
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('rs-sidebar-toggle');
  const sidebar = document.getElementById('rs-sidebar');
  const backdrop = document.getElementById('rs-backdrop');
  
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('open');
      if (backdrop) backdrop.classList.toggle('open');
    });
  }
  
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('open');
      backdrop.classList.remove('open');
    });
  }
});

// Reading Theme Controller
window.setReaderTheme = function(theme) {
    // Remove existing reader themes
    document.documentElement.classList.remove('reader-light', 'reader-dark', 'reader-sepia');
    
    if (theme !== 'default') {
        document.documentElement.classList.add('reader-' + theme);
    }
    
    // Persist choice
    localStorage.setItem('rs-reader-theme', theme);
};

// Link Buttons Handler
// Stardust Engine intercepts clicks on buttons with 'href' attributes
// since native HTML buttons do not support href.
document.addEventListener('click', (e) => {
    const btn = e.target.closest('button[href], .rs-btn[href]');
    if (btn) {
        const url = btn.getAttribute('href');
        const target = btn.getAttribute('target');
        
        if (target === '_blank') {
            window.open(url, '_blank');
        } else {
            // Check if Elara SPA is active. If so, let Elara handle the jump.
            if (typeof window.ElaraRouter !== 'undefined' && url.startsWith('/')) {
                // If it's a relative URL, we just navigate using Elara's pushState
                // To do this natively, we can either trigger a custom event or just let standard navigation happen
                // For now, standard navigation which Elara intercepts
                window.location.href = url;
            } else {
                window.location.href = url;
            }
        }
    }
});
