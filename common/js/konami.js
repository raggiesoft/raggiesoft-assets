/**
 * ============================================================================
 * READ-ALONG TEACHING OVERVIEW: konami.js
 * ============================================================================
 * WHAT THIS FILE IS:
 *   A playful "Easter egg" keyboard listener that watches for the classic
 *   10-key video-game Konami Code sequence:
 *     Up, Up, Down, Down, Left, Right, Left, Right, B, A
 *
 * WHICH WEBSITES LOAD IT:
 *   Loaded from `https://assets.raggiesoft.com/common/js/konami.js` on
 *   RaggieSoft web properties that embed a hidden `#konamiModal` dialog.
 *
 * WHAT INPUTS IT CONSUMES:
 *   - Browser `keydown` events (`e.key`) typed anywhere on the page.
 *   - A hidden modal element with `id="konamiModal"` in the HTML document
 *     (either a Web Awesome `<wa-dialog>` / native `<dialog>` element or a
 *     Bootstrap `.modal` container).
 *
 * WHAT VISIBLE UI IT PRODUCES:
 *   - Nothing at all during normal browsing! When a visitor types all 10 keys
 *     in exact order without a single wrong key in between, `#konamiModal`
 *     pops open on screen.
 *
 * 100-LEVEL JAVASCRIPT CONCEPTS TAUGHT IN THIS FILE:
 *   1. Finite State Machine (Sequence Cursor): Using an integer index
 *      (`currentPosition`) to remember "how many keys in a row the user has
 *      matched so far" across separate `keydown` events over time.
 *   2. Input Normalization: Handling Shift / Caps Lock (`'B'` vs `'b'`) without
 *      accidentally breaking multi-letter key names like `'ArrowUp'`.
 *   3. Feature Detection ("Duck Typing"): Checking `typeof modalElement.show === 'function'`
 *      and `window.bootstrap` so one shared script works across different UI
 *      libraries without crashing.
 * ============================================================================
 */

/* Wait until the HTML document is parsed so `#konamiModal` is guaranteed to
 * exist in the DOM by the time someone finishes typing the 10-key combo. */
document.addEventListener('DOMContentLoaded', () => {
    /**
     * STEP 1: DEFINE THE TARGET KEY SEQUENCE
     * Modern browsers report arrow keys via `KeyboardEvent.key` using exact
     * PascalCase strings (`'ArrowUp'`, `'ArrowDown'`, `'ArrowLeft'`, `'ArrowRight'`),
     * while letter keys report the character itself (`'b'`, `'a'`).
     */
    const konamiCode = [
        'ArrowUp', 'ArrowUp', 
        'ArrowDown', 'ArrowDown', 
        'ArrowLeft', 'ArrowRight', 
        'ArrowLeft', 'ArrowRight', 
        'b', 'a'
    ];
    
    /**
     * STEP 2: INITIALIZE THE STATE CURSOR
     * `currentPosition` lives OUTSIDE the `keydown` callback (in the enclosing
     * function closure) so JavaScript remembers its value between keystrokes!
     * - `0` means we are waiting for the 1st key (`konamiCode[0]`, `'ArrowUp'`).
     * - `9` means the user has typed 9 keys right and only needs `'a'` (`konamiCode[9]`).
     */
    let currentPosition = 0;

    /**
     * STEP 3: LISTEN FOR EVERY KEY PRESS ON THE DOCUMENT
     */
    document.addEventListener('keydown', (e) => {
        /* Normalize single-character keys (`'B'` -> `'b'`, `'A'` -> `'a'`) so
         * having Caps Lock on or holding Shift doesn't ruin the combo.
         * Why check `e.key.length === 1`? Because `'ArrowUp'.length` is 7—if we
         * lowercased `'ArrowUp'` to `'arrowup'`, it wouldn't match `'ArrowUp'`! */
        const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        
        /* Look up whichever key is expected next at the current step of the combo. */
        let requiredKey = konamiCode[currentPosition];
        /* Defensively normalize single-character entries in `konamiCode` as well. */
        if (requiredKey && requiredKey.length === 1) requiredKey = requiredKey.toLowerCase();

        /* STEP 4: CHECK WHETHER THE PRESSED KEY MATCHES THE EXPECTED NEXT STEP */
        if (key === requiredKey) {
            /* Match! Advance our cursor to the next slot in `konamiCode`. */
            currentPosition++;
            
            /* Have we matched all 10 keys (`currentPosition === 10`)? */
            if (currentPosition === konamiCode.length) {
                
                /* Look up the hidden Easter-egg modal in the page's HTML. */
                const modalElement = document.getElementById('konamiModal');
                if (modalElement) {
                    
                    /* Feature Detection Path A: Native `<dialog>` or Web Awesome `<wa-dialog>`.
                     * Instead of guessing which CSS framework this site uses, we check
                     * whether `.show` or `.showModal` exists as a callable function on
                     * the DOM element itself. */
                    if (typeof modalElement.show === 'function') {
                        /* Prefer `.showModal()` when available (opens in the browser's
                         * accessible top layer with Escape-key dismissal and backdrop),
                         * falling back to `.show()` for older Web Awesome components. */
                        if (typeof modalElement.showModal === "function") { 
                            modalElement.showModal(); 
                        } else { 
                            modalElement.show(); 
                        }
                    } 
                    /* Feature Detection Path B: Bootstrap 5 `.modal` (`corporate.raggiesoft.com`).
                     * `window.bootstrap` is defined when Bootstrap's JS bundle is loaded. */
                    else if (window.bootstrap) {
                        /* Reuse an existing Bootstrap Modal controller if one was already
                         * attached to `modalElement`; otherwise construct a new one. */
                        let secretModal = bootstrap.Modal.getInstance(modalElement);
                        if (!secretModal) {
                            secretModal = new bootstrap.Modal(modalElement);
                        }
                        secretModal.show();
                    }
                } else {
                    /* Helpful developer warning if `konami.js` was included on a page
                     * that doesn't define `<div id="konamiModal">` or `<dialog id="konamiModal">`. */
                    console.warn("Konami Activated, but modal element is missing.");
                }
                
                /* Reset the cursor back to 0 so the visitor can trigger the code again later. */
                currentPosition = 0;
            }
        } else {
            /* Wrong key pressed! Break the combo immediately and start over from index 0. */
            currentPosition = 0;
        }
    });
});
