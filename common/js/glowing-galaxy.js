/**
 * STARDUST LABS: GLOWING GALAXY (Vanilla JS)
 * SPA-Safe Particle & Planet Generator
 * 
 * Architecture & Purpose:
 * This script dynamically generates visual DOM elements to create a theme-aware background. 
 * It functions as a lightweight, canvas-free rendering system that responds to system color schemes.
 * 
 * Key Features:
 * - Dynamic rendering logic split by user theme preference (Light = Planet, Dark = Starfield).
 * - Automatic prevention of duplicate renders on manual re-triggers or SPA navigation via data attributes.
 * - Dynamic generation and injection of required CSS keyframes.
 * - Full awareness of user accessibility preferences (`prefers-reduced-motion`).
 * 
 * Maintenance Notes:
 * - The container `#stardust-labs-bg` must exist in the DOM.
 * - Animations use standard CSS `@keyframes` rather than JS `requestAnimationFrame` for performance.
 * - Re-renders automatically trigger upon live theme change.
 */

/**
 * Initializes, clears, and renders the visual galaxy environment based on current state.
 */
function initStardustGalaxy() {
    // Attempt to locate the target background container
    const container = document.getElementById('stardust-labs-bg');
    
    // Guard clause: Exit if container is missing or already populated with this cycle
    if (!container || container.hasAttribute('data-galaxy-rendered')) return;

    // ----------------------------------------------------
    // PREPARATION & RESET
    // Remove any existing content to prevent duplicates on manual re-trigger
    // ----------------------------------------------------
    container.innerHTML = '';
    
    // Ensure the container is positioned so absolute children stay inside
    container.style.position = 'relative';
    container.style.overflow = 'hidden';

    // ----------------------------------------------------
    // STATE & PREFERENCE EVALUATION
    // ----------------------------------------------------
    // Evaluate accessibility preferences for animations
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Evaluate active visual theme using both system preferences and defined bootstrap data attributes
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches || document.documentElement.getAttribute('data-bs-theme') === 'dark';

    // ----------------------------------------------------
    // RENDER LOGIC BY THEME
    // ----------------------------------------------------
    if (!isDarkMode) {
        // Light Mode: Render a CSS-only glowing planet
        const planet = document.createElement('div');
        planet.className = 'stardust-planet';
        
        // Inline layout configuration for the planet
        planet.style.position = 'absolute';
        planet.style.top = '50%';
        planet.style.left = '50%';
        planet.style.transform = 'translate(-50%, -50%)';
        planet.style.width = '200px';
        planet.style.height = '200px';
        planet.style.borderRadius = '50%';
        
        // Complex gradient and shadow effects to emulate 3D lighting without assets
        planet.style.background = 'radial-gradient(circle at 30% 30%, #42AADB, #0d1e38)';
        planet.style.boxShadow = '0 0 60px rgba(66, 170, 219, 0.5), inset -20px -20px 40px rgba(0,0,0,0.8)';
        
        // Attach animations conditionally based on a11y preferences
        if (!prefersReducedMotion) {
            planet.style.animation = 'planetFloat 10s ease-in-out infinite alternate';
        }
        
        container.appendChild(planet);
    } else {
        // Dark Mode: Render the starry night sky
        const starCount = 120; // Maximum number of DOM star nodes to generate

        // Procedurally generate star elements
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'stardust-particle';
            
            // Randomly scatter coordinates within the container boundaries
            star.style.position = 'absolute';
            star.style.backgroundColor = '#ffffff';
            star.style.borderRadius = '50%';
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;

            // Randomize individual star sizing for depth perception
            const size = Math.random() * 2.5 + 0.5;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;

            // Attach animations conditionally based on a11y preferences
            if (!prefersReducedMotion) {
                // Apply twinkling keyframes with staggered durations and delays
                star.style.animation = `starTwinkle ${Math.random() * 4 + 3}s infinite alternate`;
                star.style.animationDelay = `${Math.random() * 5}s`;
            } else {
                // Static variance fallback if reduced motion is requested
                star.style.opacity = Math.random() * 0.8 + 0.2; 
            }

            container.appendChild(star);
        }
    }

    // Set semaphore attribute indicating that rendering has completed
    container.setAttribute('data-galaxy-rendered', 'true');
    
    // ----------------------------------------------------
    // DYNAMIC STYLES INJECTION
    // Inject keyframes if not present to ensure standalone operation
    // ----------------------------------------------------
    if (!document.getElementById('stardust-galaxy-styles')) {
        const style = document.createElement('style');
        style.id = 'stardust-galaxy-styles';
        style.textContent = `
            @keyframes starTwinkle {
                0% { opacity: 0.2; transform: scale(0.8); }
                100% { opacity: 1; transform: scale(1.2); box-shadow: 0 0 5px #fff; }
            }
            @keyframes planetFloat {
                0% { transform: translate(-50%, -50%) translateY(0px); }
                100% { transform: translate(-50%, -50%) translateY(-15px); }
            }
        `;
        document.head.appendChild(style);
    }
}

// ----------------------------------------------------
// LIFECYCLE EVENT BINDINGS
// ----------------------------------------------------
// Bind to standard initial DOM load
document.addEventListener('DOMContentLoaded', initStardustGalaxy);
// Bind to Stardust Engine/Elara SPA lifecycle hook to handle seamless navigation
document.addEventListener('elara:loaded', initStardustGalaxy);

// ----------------------------------------------------
// DYNAMIC THEME OBSERVER
// Re-render when operating system theme changes dynamically
// ----------------------------------------------------
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const container = document.getElementById('stardust-labs-bg');
    if (container) {
        // Clear the semaphore to allow the subsequent initialization cycle to render
        container.removeAttribute('data-galaxy-rendered');
        initStardustGalaxy();
    }
});
