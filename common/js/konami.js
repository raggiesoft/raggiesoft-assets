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
                
                // Trigger the Web Awesome Modal
                const modalElement = document.getElementById('konamiModal');
                if (modalElement) {
                    if (typeof modalElement.show === 'function') {
                        if (typeof modalElement.showModal === "function") { modalElement.showModal(); } else { modalElement.show(); } // Web Awesome Dialog
                    } else if (window.bootstrap) {
                        let secretModal = bootstrap.Modal.getInstance(modalElement);
                        if (!secretModal) {
                            secretModal = new bootstrap.Modal(modalElement);
                        }
                        secretModal.show();
                    }
                } else {
                    console.warn("Konami Activated, but modal element is missing.");
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
