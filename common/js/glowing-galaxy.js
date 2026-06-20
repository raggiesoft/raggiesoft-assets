/**
 * STARDUST LABS: GLOWING GALAXY (Vanilla JS)
 * SPA-Safe Particle Generator
 */
function initStardustGalaxy() {
    const container = document.getElementById('stardust-labs-bg');
    if (!container || container.hasAttribute('data-galaxy-rendered')) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const starCount = 120; 

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'stardust-particle';
        
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;

        const size = Math.random() * 2.5 + 0.5;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;

        if (!prefersReducedMotion) {
            star.style.animationDelay = `${Math.random() * 5}s`;
            star.style.animationDuration = `${Math.random() * 4 + 3}s`; 
        } else {
            star.style.opacity = Math.random() * 0.8 + 0.2; 
        }

        container.appendChild(star);
    }
    container.setAttribute('data-galaxy-rendered', 'true');
}

document.addEventListener('DOMContentLoaded', initStardustGalaxy);
document.addEventListener('elara:loaded', initStardustGalaxy);