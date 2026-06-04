// assets/portfolio/js/recruiter-gate.js
// The RaggieSoft "Recruiter Gate"
// Filters inquiries based on Resume, Location, and Salary.

// FIX: Support both Hard Refreshes and Turbo Navigation
function bootstrapGate() {
    // Prevent double-initialization if Turbo fires twice
    if (document.getElementById('gate-container').getAttribute('data-initialized') === 'true') return;
    initGate();
}

// 1. Initial Load (Hard Refresh)
document.addEventListener('DOMContentLoaded', bootstrapGate);

// 2. Turbo Navigation (Link Clicks)
document.addEventListener('turbo:load', bootstrapGate);

// Default Config (Overwritten by JSON)
let CONFIG = {
    minSalary: 75000,
    targetSalary: 85000,
    hourlyThreshold: 200,
    locationsJson: 'https://assets.raggiesoft.com/portfolio/json/locations.json',
    salaryJson: 'https://assets.raggiesoft.com/portfolio/json/salary.json',
    bookingUrl: null // Will be populated from salary.json if present
};

let locationsData = [];

async function initGate() {
    const container = document.getElementById('gate-container');
    if (!container) return;

    try {
        // Parallel Fetch: Get Locations AND Salary at the same time
        const [locResponse, salaryResponse] = await Promise.all([
            fetch(CONFIG.locationsJson),
            fetch(CONFIG.salaryJson)
        ]);

        locationsData = await locResponse.json();
        const salaryData = await salaryResponse.json();
        
        // Merge fetched salary data into CONFIG
        CONFIG = { ...CONFIG, ...salaryData };

    } catch (e) {
        console.error("Failed to load gate configuration", e);
        container.innerHTML = `<div class="alert alert-danger">Error loading configuration. Please try refreshing the page.</div>`;
        return;
    }

    renderStep1();
}

// --- STEP 1: RESUME CHECK ---
function renderStep1() {
    const container = document.getElementById('gate-container');
    container.innerHTML = `
        <div class="card shadow-sm border-0 fade-in-up">
            <div class="card-body p-5 text-center">
                <div class="mb-4 text-secondary"><i class="fa-duotone fa-file-user fa-3x"></i></div>
                <h3 class="h4 fw-bold mb-3">Step 1: The Basics</h3>
                <p class="lead mb-4">Have you reviewed my resume and technical qualifications?</p>
                
                <div class="d-grid gap-3 d-sm-flex justify-content-center">
                    <button class="btn btn-outline-secondary btn-lg px-5" onclick="handleResume('no')">No</button>
                    <button class="btn btn-primary btn-lg px-5" onclick="renderStep2()">Yes</button>
                </div>
                <div id="step1-feedback" class="mt-3"></div>
            </div>
        </div>
    `;
}

function handleResume(answer) {
    if (answer === 'no') {
        document.getElementById('step1-feedback').innerHTML = `
            <div class="alert alert-warning mt-3">
                <i class="fa-duotone fa-circle-exclamation me-2"></i>
                Please <a href="/about/michael-ragsdale/resume" class="alert-link">review my resume</a> first to ensure my skills match your needs.
            </div>`;
    }
}

// --- STEP 2: LOCATION CHECK ---
function renderStep2() {
    const container = document.getElementById('gate-container');
    
    // Build Options dynamically
    let optionsHtml = '<option value="" selected disabled>Select a Location...</option>';
    locationsData.forEach(loc => {
        optionsHtml += `<option value="${loc.value}">${loc.label}</option>`;
    });
    optionsHtml += '<option value="other">Other / Outside Virginia</option>';

    container.innerHTML = `
        <div class="card shadow-sm border-0 fade-in-up">
            <div class="card-body p-5 text-center">
                <div class="mb-4 text-success"><i class="fa-duotone fa-map-location-dot fa-3x"></i></div>
                <h3 class="h4 fw-bold mb-3">Step 2: Location</h3>
                <p class="mb-4">Where is this position located?</p>
                
                <div class="row justify-content-center">
                    <div class="col-md-8">
                        <select id="locationSelect" class="form-select form-select-lg mb-3">
                            ${optionsHtml}
                        </select>
                        <button class="btn btn-primary px-5 mt-2" onclick="handleLocation()">Next</button>
                    </div>
                </div>
                <div id="step2-feedback" class="mt-3"></div>
            </div>
        </div>
    `;
}

function handleLocation() {
    const val = document.getElementById('locationSelect').value;
    const feedback = document.getElementById('step2-feedback');

    if (!val) {
        feedback.innerHTML = '<span class="text-danger">Please select a location.</span>';
        return;
    }

    if (val === 'other') {
        feedback.innerHTML = `
            <div class="alert alert-danger mt-3">
                <h5 class="alert-heading"><i class="fa-duotone fa-hand-palm me-2"></i>Out of Range</h5>
                <p class="mb-0">I am currently only accepting roles within <strong>Virginia</strong> (Remote or On-Site) to maintain my in-state tuition status at TCC.</p>
            </div>`;
        return;
    }

    if (val === 'relocate-va') {
        feedback.innerHTML = `
            <div class="alert alert-info mt-3">
                <i class="fa-duotone fa-circle-info me-2"></i>
                <strong>Note:</strong> Relocation within VA requires relocation assistance.
                <div class="mt-2"><button class="btn btn-sm btn-outline-info" onclick="renderStep3()">Acknowledge & Continue</button></div>
            </div>`;
        return;
    }

    renderStep3();
}

// --- STEP 3: SALARY CHECK ---
function renderStep3() {
    const container = document.getElementById('gate-container');
    // Using neutral placeholder to avoid anchoring
    container.innerHTML = `
        <div class="card shadow-sm border-0 fade-in-up">
            <div class="card-body p-5 text-center">
                <div class="mb-4 text-warning"><i class="fa-duotone fa-sack-dollar fa-3x"></i></div>
                <h3 class="h4 fw-bold mb-3">Step 3: Compensation</h3>
                <p class="mb-4">What is the <strong>yearly base salary</strong> (W2)?</p>
                
                <div class="row justify-content-center">
                    <div class="col-md-6">
                        <div class="input-group input-group-lg mb-3">
                            <span class="input-group-text">$</span>
                            <input type="number" id="salaryInput" class="form-control" placeholder="Enter yearly amount">
                            <button class="btn btn-primary" onclick="handleSalary()">Check</button>
                        </div>
                    </div>
                </div>
                <div id="step3-feedback" class="mt-3"></div>
            </div>
        </div>
    `;
    
    document.getElementById('salaryInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSalary();
    });
}

function handleSalary() {
    const input = document.getElementById('salaryInput').value;
    const amount = parseFloat(input.replace(/,/g, ''));
    const feedback = document.getElementById('step3-feedback');

    if (!amount || amount <= 0) {
        feedback.innerHTML = '<span class="text-danger">Please enter a valid number.</span>';
        return;
    }

    if (amount < CONFIG.minSalary) {
        feedback.innerHTML = `
            <div class="alert alert-danger mt-3 text-start">
                <div class="d-flex">
                    <div class="me-3 fs-1"><i class="fa-duotone fa-traffic-light-stop"></i></div>
                    <div>
                        <h5 class="alert-heading fw-bold">Out of Range</h5>
                        <p>Unfortunately, <strong>${formatMoney(amount)}</strong> is below my minimum requirement ($${formatMoney(CONFIG.minSalary)}). To respect your time, I must decline this opportunity.</p>
                    </div>
                </div>
            </div>`;
    } else {
        revealContactInfo(amount);
    }
}

// --- STEP 4: SUCCESS / REVEAL ---
function revealContactInfo(salary) {
    const isTarget = salary >= CONFIG.targetSalary;
    const color = isTarget ? 'success' : 'primary';
    const container = document.getElementById('gate-container');

    // Logic: Do we have a Booking URL from the JSON?
    let actionArea = '';
    
    if (CONFIG.bookingUrl) {
        // OPTION A: Show Booking Button + Email Backup
        actionArea = `
            <div class="d-grid gap-3 d-sm-flex justify-content-center mb-4">
                <a href="${CONFIG.bookingUrl}" target="_blank" class="btn btn-${color} btn-lg px-5 py-3 fw-bold shadow-sm hover-lift">
                    <i class="fa-duotone fa-calendar-clock me-2"></i> Schedule Interview
                </a>
            </div>
            <div class="text-muted small mb-3">
                Prefer email? <a href="mailto:hireme@michaelpragsdale.com" class="text-decoration-none text-secondary fw-bold">hireme@michaelpragsdale.com</a>
            </div>
        `;
    } else {
        // OPTION B: Email Only (Fallback if Booking URL missing)
        actionArea = `
            <div class="bg-body-tertiary p-4 rounded border mb-4">
                <h5 class="text-secondary text-uppercase small fw-bold ls-1">Direct Contact</h5>
                <div class="fs-4 fw-bold mt-2">
                    <a href="mailto:hireme@michaelpragsdale.com?subject=Interview Request (Pre-Screened)" class="text-decoration-none">
                        hireme@michaelpragsdale.com
                    </a>
                </div>
            </div>
            <div class="d-grid gap-2 d-sm-flex justify-content-center">
                <a href="mailto:hireme@michaelpragsdale.com" class="btn btn-${color} btn-lg px-4">
                    <i class="fa-solid fa-paper-plane me-2"></i> Send Email
                </a>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="card shadow border-${color} fade-in-up">
            <div class="card-body p-5 text-center">
                <div class="mb-4 text-${color}"><i class="fa-duotone fa-unlock-keyhole fa-4x"></i></div>
                <h2 class="h3 fw-bold text-${color} mb-3">Access Granted</h2>
                <p class="lead mb-4">
                    Thank you for confirming alignment on location and compensation.<br>
                    My calendar is open for a preliminary discussion.
                </p>
                
                ${actionArea}

                <div class="mt-4 pt-3 border-top">
                     <a href="https://linkedin.com/in/michael-ragsdale-raggiesoft" target="_blank" class="btn btn-sm btn-link text-secondary text-decoration-none">
                        <i class="fa-brands fa-linkedin me-1"></i> View LinkedIn Profile
                    </a>
                </div>
            </div>
        </div>
    `;
}

function formatMoney(num) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
}