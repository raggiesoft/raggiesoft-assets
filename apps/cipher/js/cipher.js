// Stardust Cipher - Uplink Script
// Handles communication between the Cipher Interface and the Logic Core

// 1. LISTEN FOR FORM SUBMISSION
// Updated ID: We now correctly target 'cipherForm' instead of 'mastermindForm'
const cipherForm = document.getElementById('cipherForm');

if (cipherForm) {
    cipherForm.addEventListener('submit', function(e) {
        e.preventDefault(); // STOP the page from refreshing immediately

        // A. Gather Data from the Interface
        const secretCode = document.getElementById('secretCode').value;
        const guess = document.getElementById('guessInput').value;

        // B. Open Channel to the Logic Core
        fetch('/includes/components/apps/cipher/logic.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                secret_code: secretCode,
                guess: guess
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // C. Update the Display Fluidly
            const resultBox = document.getElementById('resultBox');
            const symbols = document.getElementById('resultSymbols');
            const explanationBox = document.getElementById('explanationBox');
            const logList = document.getElementById('logList');
            const placeholder = document.getElementById('placeholderState');

            // Hide Placeholder
            if(placeholder) placeholder.classList.add('d-none');

            // Show the Result Symbols (+ - - -)
            resultBox.classList.remove('d-none');
            symbols.textContent = data.result_string || "(No matches)";

            // Show the Explanation Log
            explanationBox.classList.remove('d-none');
            logList.innerHTML = ''; // Wipe previous transmission logs
            
            // Loop through the log messages
            data.explanation_log.forEach(item => {
                const li = document.createElement('li');
                li.className = "list-group-item bg-transparent border-0 ps-0"; // Bootstrap styling
                li.textContent = item;
                
                // Add Stardust flair to colors
                if (item.includes('(+)')) {
                    li.style.color = '#198754'; // Success Green
                    li.style.fontWeight = 'bold';
                } else if (item.includes('(-)')) {
                    li.style.color = '#fd7e14'; // Orange
                }
                
                logList.appendChild(li);
            });
        })
        .catch((error) => {
            console.error('Signal Lost:', error);
            alert("Critical Error: Unable to contact the Stardust Engine Logic Core.\n\nCheck your console for details.");
        });
    });
}

// 2. RESET PROTOCOL
const resetBtn = document.getElementById('resetBtn');

if (resetBtn) {
    resetBtn.addEventListener('click', function() {
        // A. Clear Inputs
        document.getElementById('secretCode').value = '';
        document.getElementById('guessInput').value = '';
        
        // B. Hide Results
        document.getElementById('resultBox').classList.add('d-none');
        document.getElementById('explanationBox').classList.add('d-none');
        
        // C. Show Placeholder
        const placeholder = document.getElementById('placeholderState');
        if(placeholder) placeholder.classList.remove('d-none');

        // D. Focus back on start
        document.getElementById('secretCode').focus();
    });
}