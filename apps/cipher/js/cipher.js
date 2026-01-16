// Stardust Cipher - Uplink Script
// Handles communication between the Cipher Interface and the Logic Core

document.getElementById('mastermindForm').addEventListener('submit', function(e) {
    e.preventDefault(); // STOP the page from refreshing

    // 1. Gather Data from the Interface
    const secretCode = document.getElementById('secretCode').value;
    const guess = document.getElementById('guessInput').value;

    // 2. Open Channel to the Logic Core
    // We use the direct path we whitelisted in Nginx
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
        // Check if the signal was received (HTTP 200 OK)
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // 3. Update the Display Fluidly
        const resultBox = document.getElementById('resultBox');
        const symbols = document.getElementById('resultSymbols');
        const explanationBox = document.getElementById('explanationBox');
        const logList = document.getElementById('logList');

        // A. Show the Result Symbols (+ - - -)
        resultBox.classList.remove('d-none');
        symbols.textContent = data.result_string || "(No matches)";

        // B. Update the Explanation Log
        explanationBox.classList.remove('d-none');
        logList.innerHTML = ''; // Wipe previous transmission logs
        
        // Loop through the log messages from PHP and format them
        data.explanation_log.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            
            // Add some Stardust flair to the text colors
            if (item.includes('(+)')) {
                li.style.color = '#198754'; // Bootstrap Success Green
                li.style.fontWeight = 'bold';
            } else if (item.includes('(-)')) {
                li.style.color = '#fd7e14'; // Bootstrap Orange
            }
            
            logList.appendChild(li);
        });
    })
    .catch((error) => {
        console.error('Signal Lost:', error);
        alert("Critical Error: Unable to contact the Stardust Engine Logic Core.\n\nCheck your console for details.");
    });
});
// NEW: Reset Protocol
document.getElementById('resetBtn').addEventListener('click', function() {
    // 1. Clear Inputs
    document.getElementById('secretCode').value = '';
    document.getElementById('guessInput').value = '';
    
    // 2. Hide Results
    document.getElementById('resultBox').classList.add('d-none');
    document.getElementById('explanationBox').classList.add('d-none');
    
    // 3. Show Placeholder
    const placeholder = document.getElementById('placeholderState');
    if(placeholder) placeholder.classList.remove('d-none');

    // 4. Focus back on start
    document.getElementById('secretCode').focus();
});