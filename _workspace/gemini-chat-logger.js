(function extractChat() {
    // 1. Target both user queries and model responses. 
    // querySelectorAll automatically returns them in document order.
    const messageNodes = document.querySelectorAll('.query-text-line, .response-container-content');
    
    if (messageNodes.length === 0) {
        console.error("No nodes found. Make sure you are scrolled to the top so everything is rendered.");
        return;
    }

    // 2. Extract and format the text
    const chatLog = Array.from(messageNodes).map((node) => {
        let speaker = "";
        
        // Check which class the node has to apply the correct label
        if (node.classList.contains('query-text-line')) {
            speaker = "**User:**\n";
        } else if (node.classList.contains('response-container-content')) {
            speaker = "**Model:**\n";
        }
        
        return speaker + node.innerText.trim();
    }).join('\n\n---\n\n');

    // 3. Package the string into a Blob to bypass clipboard limits
    const blob = new Blob([chatLog], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    // 4. Force a silent download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meridian-city-lore-backup.md';
    document.body.appendChild(a);
    a.click();
    
    // 5. Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log("Extraction complete. Markdown file downloaded.");
})();
