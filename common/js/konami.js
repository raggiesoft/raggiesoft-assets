/**
 * ============================================================================
 * KONAMI CODE LISTENER - ARCHITECTURAL OVERVIEW
 * ============================================================================
 * 
 * Description:
 * A lightweight global event listener that implements a state machine to 
 * detect the classic "Konami Code" sequence of keystrokes.
 * 
 * Core Mechanics:
 * 1. Global Listener: Listens for keydown events across the entire document.
 * 2. Sequence Matching: Maintains a state cursor (`currentPosition`) that increments 
 *    when the correct key in the sequence is pressed, and resets to 0 if an 
 *    incorrect key is pressed.
 * 3. Payload Delivery: Upon successful completion of the sequence, it attempts 
 *    to trigger a hidden modal (`#konamiModal`). It gracefully supports both 
 *    Web Awesome (`<wa-dialog>`) and Bootstrap (`.modal`) implementations.
 * 
 * Maintainability Notes:
 * - This script is an "easter egg" and should not contain critical business logic.
 * - The state machine resets immediately on any mistake.
 * - It normalizes inputs by converting single-character keys to lowercase to 
 *   ensure Shift state doesn't break the 'B' and 'A' inputs.
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // The Konami Code Sequence mapping
    // Up, Up, Down, Down, Left, Right, Left, Right, B, A
    const konamiCode = [
        'ArrowUp', 'ArrowUp', 
        'ArrowDown', 'ArrowDown', 
        'ArrowLeft', 'ArrowRight', 
        'ArrowLeft', 'ArrowRight', 
        'b', 'a'
    ];
    
    // State cursor tracking how far the user has progressed in the sequence
    let currentPosition = 0;

    document.addEventListener('keydown', (e) => {
        // Normalize key input (handle uppercase 'B' and 'A' in case Shift or CapsLock is on)
        // We only lower-case length=1 strings so we don't mess up 'ArrowUp', etc.
        const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        
        // Get the expected key from the sequence at the current state cursor
        let requiredKey = konamiCode[currentPosition];
        // Ensure the requirement is normalized against the incoming key
        if (requiredKey && requiredKey.length === 1) requiredKey = requiredKey.toLowerCase();

        // Check if the pressed key matches the required next step
        if (key === requiredKey) {
            // Correct key pressed, advance the cursor
            currentPosition++;
            
            // If the cursor reaches the end of the array, the full sequence is entered
            if (currentPosition === konamiCode.length) {
                
                // Fetch the payload target element
                const modalElement = document.getElementById('konamiModal');
                if (modalElement) {
                    
                    // Attempt Web Awesome Dialog initialization first
                    if (typeof modalElement.show === 'function') {
                        // Web Awesome changed API from show() to showModal(), handle both gracefully
                        if (typeof modalElement.showModal === "function") { 
                            modalElement.showModal(); 
                        } else { 
                            modalElement.show(); 
                        }
                    } 
                    // Fallback to Bootstrap Modal initialization
                    else if (window.bootstrap) {
                        let secretModal = bootstrap.Modal.getInstance(modalElement);
                        if (!secretModal) {
                            secretModal = new bootstrap.Modal(modalElement);
                        }
                        secretModal.show();
                    }
                } else {
                    console.warn("Konami Activated, but modal element is missing.");
                }
                
                // Reset sequence cursor so it can be triggered again
                currentPosition = 0;
            }
        } else {
            // Mistake made: incorrect key breaks the combo. Reset sequence cursor to start.
            currentPosition = 0;
        }
    });
});
