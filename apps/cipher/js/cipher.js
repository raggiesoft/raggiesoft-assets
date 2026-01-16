// Stardust Cipher - Uplink Script v2.1
// Includes Stealth Notification Logic

// --- 1. CONFIGURATION HANDLERS ---
const diffRadios = document.querySelectorAll('input[name="difficulty"]');
const rulesBadge = document.getElementById('rulesBadge');
const secretInput = document.getElementById('secretCode');
const guessInput = document.getElementById('guessInput');
const secretHint = document.getElementById('secretHint');

// Rules Definitions
const rules = {
    'calibration': { label: '1-5 • Unique', pattern: '[1-5]{4}', hint: 'Digits 1-5. No repeats.' },
    'orbital':     { label: '1-6 • Repeats', pattern: '[1-6]{4}', hint: 'Digits 1-6. Repeats allowed.' },
    'deep':        { label: '0-9 • Unique', pattern: '[0-9]{4}', hint: 'Digits 0-9. No repeats.' },
    'horizon':     { label: '0-9 • Repeats', pattern: '[0-9]{4}', hint: 'Digits 0-9. Repeats allowed.' }
};

// Listen for difficulty changes
diffRadios.forEach(radio => {
    radio.addEventListener('change', function() {
        const rule = rules[this.value];
        rulesBadge.textContent = rule.label;
        secretInput.setAttribute('pattern', rule.pattern);
        guessInput.setAttribute('pattern', rule.pattern);
        secretHint.textContent = rule.hint;
    });
});

// --- 2. STEALTH & VISIBILITY HANDLERS ---
const stealthToggle = document.getElementById('stealthMode');
const toggleVisBtn = document.getElementById('toggleSecretVisibility');
const eyeIcon = document.getElementById('eyeIcon');

// Toggle Eye Icon (Manual Peek)
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

// Stealth Switch Logic
stealthToggle.addEventListener('change', function() {
    // A. Immediate UI Update (The inputs themselves)
    if(this.checked) {
        secretInput.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
        toggleVisBtn.disabled = true; 
    } else {
        toggleVisBtn.disabled = false;
    }

    // B. Logic Notification
    // We only notify if a game is currently active (Results are visible)
    // because that is when the user might expect the logs to vanish instantly.
    const resultBox = document.getElementById('resultBox');
    
    if (!resultBox.classList.contains('d-none')) {
        alert("Stealth Protocol preference updated.\n\nChanges to the Logic Log will take effect on your next analysis.");
    }
});

// --- 3. FORM SUBMISSION ---
const cipherForm = document.getElementById('cipherForm');

if (cipherForm) {
    cipherForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const secretCode = secretInput.value;
        const guess = guessInput.value;
        const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
        const isStealth = stealthToggle.checked;

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
            if (!response.ok) return response.json().then(err => { throw new Error(err.message) });
            return response.json();
        })
        .then(data => {
            const resultBox = document.getElementById('resultBox');
            const symbols = document.getElementById('resultSymbols');
            const explanationBox = document.getElementById('explanationBox');
            const logList = document.getElementById('logList');
            const placeholder = document.getElementById('placeholderState');

            // UI Updates
            if(placeholder) placeholder.classList.add('d-none');
            
            // Show Symbols
            resultBox.classList.remove('d-none');
            symbols.textContent = data.result_string || "(No matches)";

            // Handle Explanation (Respect Stealth)
            if (isStealth) {
                explanationBox.classList.add('d-none'); // Force Hide
            } else {
                explanationBox.classList.remove('d-none'); // Show
                logList.innerHTML = ''; 
                
                data.explanation_log.forEach(item => {
                    const li = document.createElement('li');
                    li.className = "list-group-item bg-transparent border-0 ps-0";
                    li.textContent = item;
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
            alert("Error: " + error.message);
        });
    });
}

// --- 4. RESET ---
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