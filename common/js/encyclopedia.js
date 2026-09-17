
// encyclopedia.js
function bindEncyclopediaLinks() {
    const links = document.querySelectorAll(".encyclopedia-link");
    
    links.forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            
            const url = this.getAttribute("href");
            const modalEl = document.getElementById("encyclopediaModal");
            const modalBody = document.getElementById("encyclopediaModalBody");
            
            if (!modalEl || !modalBody) return;
            
            // Show loading state
            modalBody.innerHTML = `
                <div class="d-flex justify-content-center align-items-center py-5 text-muted">
                    <div class="spinner-border me-3" role="status"></div>
                    <span>Accessing database...</span>
                </div>
            `;
            
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
            
            // Fetch content with ajax=1
            const fetchUrl = url.includes("?") ? url + "&ajax=1" : url + "?ajax=1";
            
            fetch(fetchUrl)
                .then(response => {
                    if (!response.ok) throw new Error("Network response was not ok");
                    return response.text();
                })
                .then(html => {
                    modalBody.innerHTML = html;
                })
                .catch(error => {
                    modalBody.innerHTML = `
                        <div class="p-5 text-center text-danger">
                            <i class="fa-solid fa-triangle-exclamation fs-1 mb-3"></i>
                            <h4>Database Error</h4>
                            <p>Unable to retrieve lore entry. Please try again later.</p>
                        </div>
                    `;
                    console.error("Encyclopedia Fetch Error:", error);
                });
        });
    });
}

// Bind on initial load
document.addEventListener("DOMContentLoaded", bindEncyclopediaLinks);
