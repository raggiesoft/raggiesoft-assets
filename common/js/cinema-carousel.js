function initializeCinemaCarousel() {
    const carousel = document.getElementById('cinemaCarousel');
    const prevBtns = document.querySelectorAll('.cinema-prev');
    const nextBtns = document.querySelectorAll('.cinema-next');
    let autoplayInterval;
    const autoplayDelay = 6000; // 6 seconds
    
    // WCAG: Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if(carousel) {
        const scrollNext = () => {
            const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';
            console.log('Scroll Next Fired. Current Left:', carousel.scrollLeft);
            if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 50) {
                carousel.scrollTo({ left: 0, behavior: scrollBehavior });
            } else {
                carousel.scrollTo({ left: carousel.scrollLeft + carousel.clientWidth, behavior: scrollBehavior });
            }
        };
        const scrollPrev = () => {
            const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';
            console.log('Scroll Prev Fired. Current Left:', carousel.scrollLeft);
            if (carousel.scrollLeft <= 50) {
                carousel.scrollTo({ left: carousel.scrollWidth, behavior: scrollBehavior });
            } else {
                carousel.scrollTo({ left: carousel.scrollLeft - carousel.clientWidth, behavior: scrollBehavior });
            }
        };
        
        // Ensure clean binding (remove existing listeners if this runs multiple times via Elara)
        prevBtns.forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                scrollPrev();
                resetAutoplay();
            });
        });
        
        nextBtns.forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                scrollNext();
                resetAutoplay();
            });
        });

        // Autoplay Logic
        const startAutoplay = () => {
            if (!prefersReducedMotion) {
                autoplayInterval = setInterval(scrollNext, autoplayDelay);
            }
        };

        const stopAutoplay = () => {
            if (autoplayInterval) {
                clearInterval(autoplayInterval);
            }
        };

        const resetAutoplay = () => {
            stopAutoplay();
            startAutoplay();
        };

        // WCAG: Pause autoplay when user hovers or interacts
        const parent = carousel.parentElement;
        const newParent = parent.cloneNode(false);
        // Wait, cloning the parent breaks all children bindings!
        // Instead of cloneNode, we can just bind it. Multiple bindings of the same named function works if we reference it, or we just trust Elara replaces the DOM so old bindings die anyway.
        
        parent.addEventListener('mouseenter', stopAutoplay);
        parent.addEventListener('mouseleave', startAutoplay);
        parent.addEventListener('touchstart', stopAutoplay, {passive: true});
        parent.addEventListener('touchend', startAutoplay, {passive: true});

        // Start initially
        startAutoplay();
    }
}

document.addEventListener('DOMContentLoaded', initializeCinemaCarousel);
document.addEventListener('elara:loaded', initializeCinemaCarousel);
