/**
 * ============================================================================
 * Stardust Engine UI Scripts (raggiesoft-ui.js)
 * ============================================================================
 * 
 * ARCHITECTURAL OVERVIEW:
 * This file provides vanilla JavaScript enhancements for the Stardust Engine's UI.
 * It manages:
 * 1. Mobile sidebar toggling and backdrop interaction.
 * 2. Reading theme controller (e.g., toggling light, dark, sepia modes for long-form content).
 * 3. SPA Link Interceptor, ensuring traditional button/anchor links behave gracefully 
 *    with the Elara SPA router by simulating true anchor clicks.
 * 
 * DESIGN PHILOSOPHY:
 * Keep it lightweight, dependency-free (vanilla JS), and focused strictly on 
 * cross-theme/global interaction patterns.
 * ============================================================================
 */

// Initialize UI behaviors once the DOM is fully constructed
document.addEventListener('DOMContentLoaded', () => {
  // Select sidebar DOM elements
  const toggleBtn = document.getElementById('rs-sidebar-toggle');
  const sidebar = document.getElementById('rs-sidebar');
  const backdrop = document.getElementById('rs-backdrop');
  
  // 1. Sidebar Toggle Logic
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', (e) => {
      // Prevent click from bubbling up to document and immediately closing the sidebar
      e.stopPropagation();
      // Toggle the visual state of the sidebar
      sidebar.classList.toggle('open');
      // If a backdrop element exists, toggle its visibility as well
      if (backdrop) backdrop.classList.toggle('open');
    });
  }
  
  // 2. Backdrop Dismiss Logic
  // Allows users to click outside the sidebar (on the backdrop) to close it
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('open');
      backdrop.classList.remove('open');
    });
  }
});

/**
 * Reading Theme Controller
 * 
 * Allows users to override the global app theme for a specific reading view
 * (e.g., switching an article from dark mode to a high-contrast or sepia mode).
 * 
 * @param {string} theme - The string identifier of the theme ('light', 'dark', 'sepia', 'default').
 */
window.setReaderTheme = function(theme) {
    // Reset state by removing all known reader theme classes from the root HTML element
    document.documentElement.classList.remove('reader-light', 'reader-dark', 'reader-sepia');
    
    // Apply the newly requested theme, assuming 'default' means fallback to system/app styling
    if (theme !== 'default') {
        document.documentElement.classList.add('reader-' + theme);
    }
    
    // Persist the user's choice in localStorage so it remains active across page reloads
    localStorage.setItem('rs-reader-theme', theme);
};

/**
 * Link Buttons Handler (SPA Interceptor)
 * 
 * Intercepts clicks on button elements masquerading as links (e.g., <button href="...">).
 * This bridges UI components that visually look like buttons but need routing capabilities.
 */
document.addEventListener('click', (e) => {
    // Look for the closest ancestor that is a button with an href, or a custom rs-btn
    const btn = e.target.closest('button[href], .rs-btn[href]');
    
    if (btn) {
        // Prevent default form submission or normal button behavior
        e.preventDefault();
        
        // Extract routing information
        const url = btn.getAttribute('href');
        const target = btn.getAttribute('target');
        
        // If the button explicitly requests a new tab/window, respect it
        if (target === '_blank') {
            window.open(url, '_blank');
        } else {
            // Virtual Anchor Simulation:
            // We create a temporary anchor element and click it programmatically.
            // Why? So the underlying Elara SPA Router (or other router frameworks) 
            // natively intercepts the 'click' event on an <a> tag and handles the 
            // client-side routing gracefully, avoiding a full page refresh.
            const a = document.createElement('a');
            a.href = url;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a); // Cleanup the temporary element
        }
    }
});
