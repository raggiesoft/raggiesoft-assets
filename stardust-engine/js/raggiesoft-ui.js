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
