/**
 * PIPER SULLIVAN
 * RaggieSoft Common UI & DOM Routing Library
 * 
 * "I'm Piper. I organize the chaos so the frontend doesn't collapse into a pile of unrouted DIVs.
 * Keep your tags semantic, your CSS variables tidy, and for the love of everything, don't inline your scripts."
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("Piper Sullivan initialized. Web Awesome DOM is under my jurisdiction.");
});

// Global Web Awesome Dropdown Navigation Listener
document.addEventListener('wa-select', event => {
    const item = event.detail.item;
    if (item && item.value) {
        // Only navigate if the value looks like a URL (starts with / or http)
        if (item.value.startsWith('/') || item.value.startsWith('http')) {
            window.location.href = item.value;
        }
    }
});
