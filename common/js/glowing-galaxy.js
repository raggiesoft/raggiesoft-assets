/**
 * STARDUST LABS: GLOWING GALAXY (Vanilla JS)
 * SPA-Safe Particle & Planet Generator
 */
function initStardustGalaxy() {
    const container = document.getElementById('stardust-labs-bg');
    if (!container || container.hasAttribute('data-galaxy-rendered')) return;

    // Remove any existing content to prevent duplicates on manual re-trigger
    container.innerHTML = '';
    
    // Ensure the container is positioned so absolute children stay inside
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    container.style.backgroundColor = '#050508'; // Deep space default

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hour = new Date().getHours();
    
    // Day time: 6 AM to 6 PM (Show planet)
    const isDaytime = hour >= 6 && hour < 18;

    if (isDaytime) {
        // Render a CSS-only glowing planet
        const planet = document.createElement('div');
        planet.className = 'stardust-planet';
        planet.style.position = 'absolute';
        planet.style.top = '50%';
        planet.style.left = '50%';
        planet.style.transform = 'translate(-50%, -50%)';
        planet.style.width = '200px';
        planet.style.height = '200px';
        planet.style.borderRadius = '50%';
        planet.style.background = 'radial-gradient(circle at 30% 30%, #42AADB, #0d1e38)';
        planet.style.boxShadow = '0 0 60px rgba(66, 170, 219, 0.5), inset -20px -20px 40px rgba(0,0,0,0.8)';
        
        if (!prefersReducedMotion) {
            planet.style.animation = 'planetFloat 10s ease-in-out infinite alternate';
        }
        
        container.appendChild(planet);
    } else {
        // Render the starry night sky
        const starCount = 120; 

        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'stardust-particle';
            
            star.style.position = 'absolute';
            star.style.backgroundColor = '#ffffff';
            star.style.borderRadius = '50%';
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;

            const size = Math.random() * 2.5 + 0.5;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;

            if (!prefersReducedMotion) {
                star.style.animation = `starTwinkle ${Math.random() * 4 + 3}s infinite alternate`;
                star.style.animationDelay = `${Math.random() * 5}s`;
            } else {
                star.style.opacity = Math.random() * 0.8 + 0.2; 
            }

            container.appendChild(star);
        }
    }

    container.setAttribute('data-galaxy-rendered', 'true');
    
    // Inject keyframes if not present
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

// Bind to both initial load and Stardust Engine SPA lifecycle hook
document.addEventListener('DOMContentLoaded', initStardustGalaxy);
document.addEventListener('elara:loaded', initStardustGalaxy);
