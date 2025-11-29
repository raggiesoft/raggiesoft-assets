document.addEventListener('DOMContentLoaded', () => {
    // The Konami Code Sequence
    // Up, Up, Down, Down, Left, Right, Left, Right, B, A, Start (Enter)
    const konamiCode = [
        'ArrowUp', 'ArrowUp', 
        'ArrowDown', 'ArrowDown', 
        'ArrowLeft', 'ArrowRight', 
        'ArrowLeft', 'ArrowRight', 
        'b', 'a',
        'Enter' // Represents "Start"
    ];
    
    let currentPosition = 0;

    document.addEventListener('keydown', (e) => {
        // Normalize key input (handle lowercase 'b' and 'a')
        const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        
        // Get expected key from sequence
        let requiredKey = konamiCode[currentPosition];
        if (requiredKey.length === 1) requiredKey = requiredKey.toLowerCase();

        if (key === requiredKey) {
            currentPosition++;
            
            // If the full sequence is entered
            if (currentPosition === konamiCode.length) {
                // Trigger the Bootstrap Modal
                const secretModal = new bootstrap.Modal(document.getElementById('konamiModal'));
                secretModal.show();
                
                // Reset sequence
                currentPosition = 0;
            }
        } else {
            // Mistake made, reset sequence
            currentPosition = 0;
        }
    });

    // Page Loader Logic (Existing)
    const loader = document.getElementById('page-loader');
    if(loader) {
        document.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                const target = this.getAttribute('target');
                if (href && target !== '_blank' && !href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !this.hasAttribute('download')) {
                    const currentUrl = window.location.pathname;
                    if (href.startsWith('#') || (href.includes(currentUrl) && href.includes('#'))) return;
                    loader.classList.add('active');
                }
            });
        });
        window.addEventListener('pageshow', function(event) {
            if (event.persisted) loader.classList.remove('active');
        });
    }
});