document.addEventListener('DOMContentLoaded', () => {
    // The Konami Code Sequence
    // Up, Up, Down, Down, Left, Right, Left, Right, B, A
    const konamiCode = [
        'ArrowUp', 'ArrowUp', 
        'ArrowDown', 'ArrowDown', 
        'ArrowLeft', 'ArrowRight', 
        'ArrowLeft', 'ArrowRight', 
        'b', 'a'
    ];
    
    let currentPosition = 0;

    document.addEventListener('keydown', (e) => {
        // Normalize key input (handle lowercase 'b' and 'a')
        const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        
        // Get expected key from sequence
        let requiredKey = konamiCode[currentPosition];
        if (requiredKey && requiredKey.length === 1) requiredKey = requiredKey.toLowerCase();

        if (key === requiredKey) {
            currentPosition++;
            
            // If the full sequence is entered
            if (currentPosition === konamiCode.length) {
                
                // Trigger the Bootstrap Modal
                const modalElement = document.getElementById('konamiModal');
                if (modalElement && window.bootstrap) {
                    // Check if a modal instance already exists to avoid toggling issues
                    let secretModal = bootstrap.Modal.getInstance(modalElement);
                    if (!secretModal) {
                        secretModal = new bootstrap.Modal(modalElement);
                    }
                    secretModal.show();
                } else {
                    console.warn("Konami Activated, but modal element or Bootstrap is missing.");
                }
                
                // Reset sequence
                currentPosition = 0;
            }
        } else {
            // Mistake made, reset sequence
            currentPosition = 0;
        }
    });
});