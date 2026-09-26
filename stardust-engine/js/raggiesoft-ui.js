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
document.addEventListener('click', (e) => {
    const btn = e.target.closest('button[href], .rs-btn[href]');
    if (btn) {
        e.preventDefault();
        const url = btn.getAttribute('href');
        const target = btn.getAttribute('target');
        
        if (target === '_blank') {
            window.open(url, '_blank');
        } else {
            // Create a temporary anchor element and click it 
            // so Elara SPA Router intercepts it gracefully!
            const a = document.createElement('a');
            a.href = url;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }
});
