/**
 * @license MIT
 * ============================================================================
 * FILE: cipher.js — Stardust Cipher Minigame Client (`raggiesoft-corporate`)
 * ============================================================================
 * PLAIN-ENGLISH OVERVIEW (100-LEVEL JAVASCRIPT GUIDE):
 * What is this file?
 *   This browser-side JavaScript file powers **Stardust Cipher**, an interactive
 *   4-digit code-breaking minigame (similar to Mastermind / Bulls & Cows) hosted
 *   in the `raggiesoft-corporate` assets library.
 *
 * How does it fit into the page lifecycle?
 *   1. Difficulty Selector (`diffRadios`): Listens for radio-button clicks across
 *      four difficulty tiers (`calibration`, `orbital`, `deep`, `horizon`) and
 *      dynamically updates the HTML5 `pattern` validation regex and helper badge.
 *   2. Secret Code Peek & Stealth Mode (`toggleVisBtn` + `stealthToggle`):
 *      Lets the codemaker toggle `<input type="password">` <-> `<input type="text">`
 *      with an eye icon, OR lock **Stealth Mode** ON—hiding per-digit explanations
 *      and popping up a non-blocking Bootstrap 5 Toast notification if a game is live.
 *   3. Asynchronous Guess Submission (`cipherForm` + `fetch()`):
 *      Intercepts standard HTML form submission (`e.preventDefault()`) so the page
 *      never reloads, sends `{ secret_code, guess, difficulty }` as JSON via HTTP
 *      `POST` to `/includes/components/apps/cipher/logic.php`, and renders the
 *      returned match symbols (`+` / `-`) and color-coded explanation list into the DOM.
 *   4. Game Reset (`resetBtn`): Clears inputs, hides previous results, restores the
 *      idle placeholder panel, and focuses `#secretCode` for the next round.
 * ============================================================================
 */

// --- 1. DIFFICULTY CONFIGURATION & HTML5 REGEX PATTERN HANDLERS ---
// Grab references to the difficulty radio buttons and the form/badge elements they control:
// - `querySelectorAll` returns a list (NodeList) of ALL `<input name="difficulty">` radios.
// - `getElementById` returns a single DOM element matching a unique `id="..."` attribute.
const diffRadios = document.querySelectorAll('input[name="difficulty"]');
const rulesBadge = document.getElementById('rulesBadge');
const secretInput = document.getElementById('secretCode');
const guessInput = document.getElementById('guessInput');
const secretHint = document.getElementById('secretHint');

// Lookup dictionary mapping each radio button's `value` (`'calibration'`, etc.) to:
// - `label`: Short summary text shown inside `#rulesBadge`.
// - `pattern`: HTML5 Regular Expression enforced by the browser before form submission
//   (for example, `'[1-5]{4}'` requires exactly 4 digits chosen from 1 through 5).
// - `hint`: Plain-English instruction displayed beneath the secret code field.
const rules = {
    'calibration': { label: '1-5 • Unique', pattern: '[1-5]{4}', hint: 'Digits 1-5. No repeats.' },
    'orbital':     { label: '1-6 • Repeats', pattern: '[1-6]{4}', hint: 'Digits 1-6. Repeats allowed.' },
    'deep':        { label: '0-9 • Unique', pattern: '[0-9]{4}', hint: 'Digits 0-9. No repeats.' },
    'horizon':     { label: '0-9 • Repeats', pattern: '[0-9]{4}', hint: 'Digits 0-9. Repeats allowed.' }
};

// Attach a `'change'` event listener to every difficulty radio button.
// Note: We use `function()` instead of an arrow function `() =>` here so `this`
// automatically refers to whichever radio `<input>` the player just selected!
diffRadios.forEach(radio => {
    radio.addEventListener('change', function() {
        const rule = rules[this.value];
        rulesBadge.textContent = rule.label;
        secretInput.setAttribute('pattern', rule.pattern);
        guessInput.setAttribute('pattern', rule.pattern);
        secretHint.textContent = rule.hint;
    });
});

// --- 2. SECRET CODE VISIBILITY ("PEEK") & STEALTH MODE HANDLERS ---
const stealthToggle = document.getElementById('stealthMode');
const toggleVisBtn = document.getElementById('toggleSecretVisibility');
const eyeIcon = document.getElementById('eyeIcon');

// Manual "Peek" Eye Button: flips `<input id="secretCode">` between `'password'`
// (dots `••••`) and `'text'` (visible digits) and swaps the Font Awesome eye icon class.
toggleVisBtn.addEventListener('click', function() {
    if (secretInput.type === 'password') {
        secretInput.type = 'text';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        secretInput.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
});

// Stealth Mode Switch:
// When checked (`this.checked === true`), masks the secret code, disables the Peek
// button so bystanders can't reveal the answer, and notifies players via a Bootstrap Toast.
stealthToggle.addEventListener('change', function() {
    // A. Immediately lock or unlock the secret input and Peek button in the UI.
    if(this.checked) {
        secretInput.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
        toggleVisBtn.disabled = true; 
    } else {
        toggleVisBtn.disabled = false;
    }

    // B. Non-blocking Bootstrap 5 Toast Notification:
    // Only pop the toast if a round is already underway (`#resultBox` does NOT have `.d-none`).
    const resultBox = document.getElementById('resultBox');
    
    if (!resultBox.classList.contains('d-none')) {
        const toastEl = document.getElementById('stealthToast');
        if (toastEl) {
            // `bootstrap.Toast` is provided globally by Bootstrap 5's bundle script.
            const toast = new bootstrap.Toast(toastEl);
            toast.show();
        }
    }
});

// --- 3. ASYNCHRONOUS GUESS SUBMISSION (`fetch` POST TO `logic.php`) ---
const cipherForm = document.getElementById('cipherForm');

if (cipherForm) {
    cipherForm.addEventListener('submit', function(e) {
        // Prevent the browser's default full-page form reload so game state stays smoothly on screen.
        e.preventDefault();

        // Read the current secret code, player guess, selected difficulty radio, and Stealth switch state.
        const secretCode = secretInput.value;
        const guess = guessInput.value;
        const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
        const isStealth = stealthToggle.checked;

        // Send an asynchronous HTTP POST request with a JSON payload to the PHP evaluation endpoint.
        fetch('/includes/components/apps/cipher/logic.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                secret_code: secretCode,
                guess: guess,
                difficulty: difficulty
            })
        })
        .then(response => {
            // In `fetch()`, HTTP 4xx/5xx responses do NOT automatically reject the Promise!
            // Checking `!response.ok` lets us parse the server's JSON error message and throw it into `.catch()`.
            if (!response.ok) return response.json().then(err => { throw new Error(err.message) });
            return response.json();
        })
        .then(data => {
            // Look up the output containers where cipher feedback is displayed.
            const resultBox = document.getElementById('resultBox');
            const symbols = document.getElementById('resultSymbols');
            const explanationBox = document.getElementById('explanationBox');
            const logList = document.getElementById('logList');
            const placeholder = document.getElementById('placeholderState');

            // Hide the initial "Waiting for uplink..." empty-state placeholder using Bootstrap's `d-none` (`display: none`).
            if(placeholder) placeholder.classList.add('d-none');
            
            // Reveal `#resultBox` and display compact match symbols (e.g., `++ -` or `(No matches)`).
            resultBox.classList.remove('d-none');
            symbols.textContent = data.result_string || "(No matches)";

            // If Stealth Mode is ON, keep `#explanationBox` hidden so only raw symbols show;
            // otherwise clear `#logList` and build one `<li>` per step in `data.explanation_log`.
            if (isStealth) {
                explanationBox.classList.add('d-none');
            } else {
                explanationBox.classList.remove('d-none');
                logList.innerHTML = ''; 
                
                data.explanation_log.forEach(item => {
                    const li = document.createElement('li');
                    li.className = "list-group-item bg-transparent border-0 ps-0";
                    // Use `.textContent` (never `.innerHTML`) so untrusted strings are rendered safely as plain text.
                    li.textContent = item;
                    // Color-code exact position matches `(+)` in green and wrong-spot matches `(-)` in orange.
                    if (item.includes('(+)')) {
                        li.style.color = '#198754';
                        li.style.fontWeight = 'bold';
                    } else if (item.includes('(-)')) {
                        li.style.color = '#fd7e14';
                    }
                    logList.appendChild(li);
                });
            }
        })
        .catch((error) => {
            // Surface validation or network errors (e.g., duplicate digits in a "Unique" mode).
            alert("Error: " + error.message);
        });
    });
}

// --- 4. GAME RESET HANDLER ---
// Clears both inputs, hides previous round feedback, restores the idle placeholder,
// and places the cursor back in `#secretCode` so a new round can start immediately.
const resetBtn = document.getElementById('resetBtn');
if (resetBtn) {
    resetBtn.addEventListener('click', function() {
        secretInput.value = '';
        guessInput.value = '';
        document.getElementById('resultBox').classList.add('d-none');
        document.getElementById('explanationBox').classList.add('d-none');
        const placeholder = document.getElementById('placeholderState');
        if(placeholder) placeholder.classList.remove('d-none');
        secretInput.focus();
    });
}
