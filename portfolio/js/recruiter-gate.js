// ==============================================================================
// ARCHITECTURAL BLOCK: RECRUITER GATE (recruiter-gate.js)
// ==============================================================================
// This script powers an interactive qualification funnel ("Gate") for recruiters 
// trying to contact Michael. It ensures alignment on basic requirements (Resume, 
// Location, Salary) before revealing direct contact information or calendar booking.
//
// Key Responsibilities:
// 1. Fetch remote JSON configuration for acceptable locations and salary bands.
// 2. Prevent redundant initialization within Elara SPA environments.
// 3. Render a multi-step interactive UI inside the `#gate-container`.
// 4. Validate user input against predefined thresholds and provide targeted feedback.
// 5. Reveal actionable contact methods (Email/Booking link) upon successful completion.
// ==============================================================================

// assets/portfolio/js/recruiter-gate.js
// The RaggieSoft "Recruiter Gate"
// Filters inquiries based on Resume, Location, and Salary.

// ------------------------------------------------------------------------------
// 1. GLOBAL VARIABLES
// ------------------------------------------------------------------------------
// Initial configuration base. Values like bookingUrl will be hydrated via JSON fetch.
let CONFIG = {
    minSalary: 75000,
    targetSalary: 85000,
    hourlyThreshold: 200,
    locationsJson: 'https://assets.raggiesoft.com/portfolio/json/locations.json',
    salaryJson: 'https://assets.raggiesoft.com/portfolio/json/salary.json',
    bookingUrl: null // Will be populated from salary.json if present
};

// Holds the array of acceptable location objects fetched from the server
let locationsData = [];

// ------------------------------------------------------------------------------
// 2. CORE INITIALIZATION FUNCTIONS
// ------------------------------------------------------------------------------
// Determines if the gate should render on the current page and handles idempotency.
function bootstrapGate() {
    const container = document.getElementById('gate-container');
    if (!container) return; // Silent exit if not on the contact page
    
    // Prevent double-initialization if Elara Router triggers multiple load events
    if (container.getAttribute('data-initialized') === 'true') return;
    container.setAttribute('data-initialized', 'true');
    
    initGate();
}

// Asynchronously fetches external JSON configuration before rendering the first step.
async function initGate() {
    const container = document.getElementById('gate-container');

    try {
        // Parallel Fetch: Optimize load time by requesting Locations and Salary concurrently
        const [locResponse, salaryResponse] = await Promise.all([
            fetch(CONFIG.locationsJson),
            fetch(CONFIG.salaryJson)
        ]);

        // Parse JSON responses
        locationsData = await locResponse.json();
        const salaryData = await salaryResponse.json();
        
        // Merge fetched salary configuration into the global CONFIG object
        CONFIG = { ...CONFIG, ...salaryData };

    } catch (e) {
        // Graceful degradation on network or parsing failure
        console.error("Failed to load gate configuration", e);
        container.innerHTML = `<div class="alert alert-danger">Error loading configuration. Please try refreshing the page.</div>`;
        return;
    }

    // Begin the interactive funnel
    renderStep1();
}

// ------------------------------------------------------------------------------
// 3. EVENT LISTENERS & EXECUTION TRIGGERS
// ------------------------------------------------------------------------------
// Self-Execute (Catches late script injections by Elara SPA)
bootstrapGate();

// Initial Load (Catches standard browser hard refreshes)
document.addEventListener('DOMContentLoaded', bootstrapGate);

// Elara SPA Navigation (Catches soft navigation events from the custom router)
document.addEventListener('elara:loaded', bootstrapGate);

// ------------------------------------------------------------------------------
// 4. FUNNEL STEP 1: RESUME CHECK
// ------------------------------------------------------------------------------
// Asks the recruiter to confirm they have reviewed the candidate's resume.
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

// Processes the response to the resume question. Disallows progression if 'no'.
function handleResume(answer) {
    if (answer === 'no') {
        document.getElementById('step1-feedback').innerHTML = `
            <div class="alert alert-warning mt-3">
                <i class="fa-duotone fa-circle-exclamation me-2"></i>
                Please <a href="/about/michael-ragsdale/resume" class="alert-link">review my resume</a> first to ensure my skills match your needs.
            </div>`;
    }
}

// ------------------------------------------------------------------------------
// 5. FUNNEL STEP 2: LOCATION CHECK
// ------------------------------------------------------------------------------
// Validates the geographic requirements of the role.
function renderStep2() {
    const container = document.getElementById('gate-container');
    
    // Build Options dynamically from the fetched locations array
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

// Validates the selected location against candidate boundaries.
function handleLocation() {
    const val = document.getElementById('locationSelect').value;
    const feedback = document.getElementById('step2-feedback');

    // Require an actual selection
    if (!val) {
        feedback.innerHTML = '<span class="text-danger">Please select a location.</span>';
        return;
    }

    // Hard block for out-of-state roles
    if (val === 'other') {
        feedback.innerHTML = `
            <div class="alert alert-danger mt-3">
                <h5 class="alert-heading"><i class="fa-duotone fa-hand-palm me-2"></i>Out of Range</h5>
                <p class="mb-0">I am currently only accepting roles within <strong>Virginia</strong> (Remote or On-Site) to maintain my in-state tuition status at TCC.</p>
            </div>`;
        return;
    }

    // Soft block/Warning for in-state relocation requirements
    if (val === 'relocate-va') {
        feedback.innerHTML = `
            <div class="alert alert-info mt-3">
                <i class="fa-duotone fa-circle-info me-2"></i>
                <strong>Note:</strong> Relocation within VA requires relocation assistance.
                <div class="mt-2"><button class="btn btn-sm btn-outline-info" onclick="renderStep3()">Acknowledge & Continue</button></div>
            </div>`;
        return;
    }

    // Proceed cleanly if acceptable
    renderStep3();
}

// ------------------------------------------------------------------------------
// 6. FUNNEL STEP 3: SALARY CHECK
// ------------------------------------------------------------------------------
// Checks if the compensation package meets the minimum threshold.
function renderStep3() {
    const container = document.getElementById('gate-container');
    // Using neutral placeholder to avoid anchoring expectations
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
    
    // Bind enter key for UX convenience
    document.getElementById('salaryInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSalary();
    });
}

// Validates the entered salary amount against CONFIG thresholds.
function handleSalary() {
    const input = document.getElementById('salaryInput').value;
    // Strip commas if user typed them out of habit
    const amount = parseFloat(input.replace(/,/g, ''));
    const feedback = document.getElementById('step3-feedback');

    // Input validation
    if (!amount || amount <= 0) {
        feedback.innerHTML = '<span class="text-danger">Please enter a valid number.</span>';
        return;
    }

    // Hard block for salaries below minimum
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
        // Success criteria met, reveal the gate
        revealContactInfo(amount);
    }
}

// ------------------------------------------------------------------------------
// 7. FUNNEL STEP 4: SUCCESS / CONTACT REVEAL
// ------------------------------------------------------------------------------
// Unlocks the contact information. Presentation varies based on whether a booking link exists.
function revealContactInfo(salary) {
    // Dynamic styling based on whether the offer hits the ideal target threshold
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
        // OPTION B: Email Only (Fallback if Booking URL is missing from remote config)
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

// ------------------------------------------------------------------------------
// 8. UTILITIES
// ------------------------------------------------------------------------------
// Standardizes currency formatting for output display.
function formatMoney(num) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
}