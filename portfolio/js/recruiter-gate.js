// ==============================================================================
// PLAIN-ENGLISH OVERVIEW FOR NEW DEVELOPERS (READ-ALONG TEACHING HEADER)
// ==============================================================================
// What is this file?
//   This is `recruiter-gate.js`, an interactive 4-step JavaScript "wizard"
//   (qualification funnel) that runs inside `#gate-container` on Michael's
//   recruiter contact page.
//
// Why does it exist in the ecosystem?
//   Engineers often receive automated mass-blast messages for out-of-state or
//   under-market roles without the sender ever reading their resume. Instead of
//   publishing an email address in plain sight for bots to scrape, this script
//   walks human recruiters through three quick alignment checks—(1) Resume
//   Reviewed, (2) Virginia Location Alignment, and (3) Minimum Base Salary—and
//   reveals Michael's direct email and interview booking link on Step 4 once
//   alignment is confirmed!
//
// What inputs feed into it, and what visible output does it produce?
//   - Inputs:
//       1. `#gate-container` DOM placeholder on the contact page.
//       2. Two remote JSON files fetched from `assets.raggiesoft.com`:
//          `locations.json` (accepted Virginia regions/remote options) and
//          `salary.json` (minimum/target salary bands + optional `bookingUrl`).
//       3. User button clicks, `<select>` dropdown choices, and salary number input.
//   - Outputs:
//       Dynamically updates `container.innerHTML` step-by-step from Step 1
//       through Step 4 ("Access Granted"), showing friendly warning/decline
//       alerts when an inquiry falls outside geographic or compensation bounds.
//
// File: /raggiesoft-assets/portfolio/js/recruiter-gate.js
// Served via CDN: https://assets.raggiesoft.com/portfolio/js/recruiter-gate.js
// License: MIT License
// ==============================================================================

// ------------------------------------------------------------------------------
// 1. GLOBAL CONFIGURATION & STATE VARIABLES
// ------------------------------------------------------------------------------
// `CONFIG` holds fallback defaults so the app always has sensible numbers, which
// get overwritten ("hydrated") with live values as soon as `salary.json` finishes
// downloading in `initGate()` below. Notice `let` (not `const`) is used here
// because `CONFIG` gets reassigned via object spread (`{ ...CONFIG, ...salaryData }`).
let CONFIG = {
    minSalary: 75000,
    targetSalary: 85000,
    hourlyThreshold: 200,
    locationsJson: 'https://assets.raggiesoft.com/portfolio/json/locations.json',
    salaryJson: 'https://assets.raggiesoft.com/portfolio/json/salary.json',
    bookingUrl: null // Will be populated from salary.json if an active calendar link is configured
};

// Stores the array of `{ value, label }` location choices fetched from `locations.json`.
let locationsData = [];

// ------------------------------------------------------------------------------
// 2. CORE INITIALIZATION & IDEMPOTENCY GUARD
// ------------------------------------------------------------------------------
/**
 * Checks whether the current page actually contains `#gate-container` and ensures
 * the funnel only initializes ONCE per visit ("idempotency").
 *
 * What does "idempotent" mean for a 100-level JS student?
 *   Below in Section 3, we call `bootstrapGate()` three ways (immediately, on
 *   `DOMContentLoaded`, and on custom `elara:loaded` SPA navigation). Without
 *   marking `data-initialized="true"` on the HTML element, `initGate()` could
 *   fire twice on the same page and trigger duplicate network fetches!
 */
function bootstrapGate() {
    const container = document.getElementById('gate-container');
    if (!container) return; // Silent exit if this script is loaded on a page without `#gate-container`
    
    // Prevent double-initialization if both DOMContentLoaded and Elara Router fire
    if (container.getAttribute('data-initialized') === 'true') return;
    container.setAttribute('data-initialized', 'true');
    
    initGate();
}

/**
 * Downloads `locations.json` and `salary.json` in parallel using `async / await`
 * and `Promise.all()`, then renders Step 1 of the qualification funnel.
 */
async function initGate() {
    const container = document.getElementById('gate-container');

    try {
        // Why `Promise.all([fetch(...), fetch(...)])` instead of two separate `await fetch(...)` lines?
        //   Two sequential `await` lines wait for File 1 to finish BEFORE starting File 2!
        //   `Promise.all` fires BOTH HTTP requests simultaneously in parallel and waits
        //   until both complete, cutting network wait time roughly in half.
        //   `const [locResponse, salaryResponse]` uses Array Destructuring to unpack both responses.
        const [locResponse, salaryResponse] = await Promise.all([
            fetch(CONFIG.locationsJson),
            fetch(CONFIG.salaryJson)
        ]);

        // `.json()` asynchronously parses the raw HTTP response body text into JavaScript objects/arrays
        locationsData = await locResponse.json();
        const salaryData = await salaryResponse.json();
        
        // Object Spread (`...`): copies all keys from `CONFIG`, then overwrites/adds any matching
        // keys returned from `salary.json` (like updated `minSalary`, `targetSalary`, or `bookingUrl`).
        CONFIG = { ...CONFIG, ...salaryData };

    } catch (e) {
        // Graceful error handling: if the visitor is offline or JSON fails to parse, log the
        // technical error to DevTools Console and show a polite retry message in the UI.
        console.error("Failed to load gate configuration", e);
        container.innerHTML = `<div class="alert alert-danger">Error loading configuration. Please try refreshing the page.</div>`;
        return;
    }

    // Once remote configuration is ready, draw Step 1 inside `#gate-container`
    renderStep1();
}

// ------------------------------------------------------------------------------
// 3. EVENT LISTENERS & EXECUTION TRIGGERS
// ------------------------------------------------------------------------------
// Trigger 1: Run immediately in case this `<script>` was injected dynamically *after* DOMContentLoaded
bootstrapGate();

// Trigger 2: Standard browser lifecycle event fired as soon as initial HTML parsing completes
document.addEventListener('DOMContentLoaded', bootstrapGate);

// Trigger 3: Custom event fired by the Stardust Engine CMS (`elara.js`) after soft SPA page transitions
document.addEventListener('elara:loaded', bootstrapGate);

// ------------------------------------------------------------------------------
// 4. FUNNEL STEP 1: RESUME REVIEW CHECK
// ------------------------------------------------------------------------------
/**
 * Renders Step 1 using a JavaScript multi-line template literal (backticks `` `...` ``).
 * Clicking "No" calls `handleResume('no')`; clicking "Yes" advances directly to `renderStep2()`.
 */
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

/**
 * Handles the "No" button on Step 1 by inserting a helpful link to the resume
 * inside `#step1-feedback` without letting the visitor skip ahead to Step 2.
 *
 * @param {string} answer - `'no'` when the recruiter hasn't read the resume yet.
 */
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
// 5. FUNNEL STEP 2: GEOGRAPHIC LOCATION CHECK
// ------------------------------------------------------------------------------
/**
 * Builds a `<select>` dropdown menu populated dynamically from `locationsData`
 * (downloaded earlier from `locations.json`), plus an `"other"` catch-all option
 * for roles outside Virginia.
 */
function renderStep2() {
    const container = document.getElementById('gate-container');
    
    // Start with a disabled placeholder option so the user must consciously pick a location
    let optionsHtml = '<option value="" selected disabled>Select a Location...</option>';
    locationsData.forEach(loc => {
        // Template interpolation `${...}` injects each JSON object's `value` and `label`
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

/**
 * Evaluates the selected `<option>` value from `#locationSelect` against four cases:
 *   1. Empty (`!val`)          -> Prompt user to choose from the dropdown.
 *   2. `'other'` (Out of state)-> Hard stop with a clear explanation.
 *   3. `'relocate-va'`         -> Soft notice requiring relocation assistance + Acknowledge button.
 *   4. Local / Remote VA       -> Advance immediately to `renderStep3()`.
 */
function handleLocation() {
    const val = document.getElementById('locationSelect').value;
    const feedback = document.getElementById('step2-feedback');

    // Case 1: User clicked "Next" while still on the disabled placeholder
    if (!val) {
        feedback.innerHTML = '<span class="text-danger">Please select a location.</span>';
        return;
    }

    // Case 2: Hard block for out-of-state roles
    if (val === 'other') {
        feedback.innerHTML = `
            <div class="alert alert-danger mt-3">
                <h5 class="alert-heading"><i class="fa-duotone fa-hand-palm me-2"></i>Out of Range</h5>
                <p class="mb-0">I am currently only accepting roles within <strong>Virginia</strong> (Remote or On-Site) to maintain my in-state tuition status at TCC.</p>
            </div>`;
        return;
    }

    // Case 3: Soft warning for in-state Virginia roles outside Hampton Roads that require relocation
    if (val === 'relocate-va') {
        feedback.innerHTML = `
            <div class="alert alert-info mt-3">
                <i class="fa-duotone fa-circle-info me-2"></i>
                <strong>Note:</strong> Relocation within VA requires relocation assistance.
                <div class="mt-2"><button class="btn btn-sm btn-outline-info" onclick="renderStep3()">Acknowledge & Continue</button></div>
            </div>`;
        return;
    }

    // Case 4: Directly aligned location (e.g., Remote or Hampton Roads) -> proceed to Step 3
    renderStep3();
}

// ------------------------------------------------------------------------------
// 6. FUNNEL STEP 3: BASE SALARY THRESHOLD CHECK
// ------------------------------------------------------------------------------
/**
 * Renders the yearly W2 base salary input field and wires up keyboard `Enter`
 * support so recruiters don't have to switch from keyboard to mouse to submit.
 */
function renderStep3() {
    const container = document.getElementById('gate-container');
    // Uses a neutral text placeholder (`"Enter yearly amount"`) rather than showing a number
    // up front so recruiters enter the role's genuine budgeted base salary.
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
    
    // Convenience UX: submit automatically when the user presses the `Enter` key inside the input box
    document.getElementById('salaryInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSalary();
    });
}

/**
 * Parses the typed salary string into a floating-point number and compares it
 * against `CONFIG.minSalary`:
 *   - Below `minSalary`: Politely declines right away to save everyone's time.
 *   - At or above `minSalary`: Unlocks Step 4 (`revealContactInfo(amount)`).
 */
function handleSalary() {
    // `.value` on an HTML `<input>` is ALWAYS a string (e.g., `"95000"` or `""`), even on `type="number"`.
    const input = document.getElementById('salaryInput').value;
    // `.replace(/,/g, '')` uses a global (`/g`) regex to strip any commas, and `parseFloat` converts to a Number.
    const amount = parseFloat(input.replace(/,/g, ''));
    const feedback = document.getElementById('step3-feedback');

    // Reject `NaN` (`!amount`), `0`, or negative numbers
    if (!amount || amount <= 0) {
        feedback.innerHTML = '<span class="text-danger">Please enter a valid number.</span>';
        return;
    }

    // Hard block for compensation offers below the configured floor (`CONFIG.minSalary`)
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
        // Qualification passed! Unlock direct contact details in Step 4.
        revealContactInfo(amount);
    }
}

// ------------------------------------------------------------------------------
// 7. FUNNEL STEP 4: ACCESS GRANTED / CONTACT REVEAL
// ------------------------------------------------------------------------------
/**
 * Renders the final "Access Granted" card revealing Michael's contact channels:
 *   - Visual accent uses green (`'success'`) when `salary >= CONFIG.targetSalary`,
 *     or blue (`'primary'`) when between `minSalary` and `targetSalary`.
 *   - If `salary.json` supplied a `bookingUrl`, renders a primary "Schedule Interview"
 *     button alongside email; otherwise renders a clean direct-email callout.
 *
 * @param {number} salary - Validated yearly W2 base salary entered in Step 3.
 */
function revealContactInfo(salary) {
    // Ternary operator (`condition ? valueIfTrue : valueIfFalse`) picks the Bootstrap theme color
    const isTarget = salary >= CONFIG.targetSalary;
    const color = isTarget ? 'success' : 'primary';
    const container = document.getElementById('gate-container');

    // Choose which contact buttons to display based on whether `CONFIG.bookingUrl` is truthy
    let actionArea = '';
    
    if (CONFIG.bookingUrl) {
        // OPTION A: Calendar Booking Link + Direct Email Backup
        actionArea = `
            <div class="d-grid gap-3 d-sm-flex justify-content-center mb-4">
                <a href="${CONFIG.bookingUrl}" target="_blank" class="btn btn-${color} btn-lg px-5 py-3 fw-bold shadow-sm hover-lift">
                    <i class="fa-duotone fa-calendar-clock me-2"></i> Schedule Interview
                </a>
            </div>
            <div class="text-muted small mb-3">
                Prefer email? <a href="mailto:hello@michaelpragsdale.com" class="text-decoration-none text-secondary fw-bold">hello@michaelpragsdale.com</a>
            </div>
        `;
    } else {
        // OPTION B: Direct Email Only (automatic fallback when no calendar booking URL is active)
        actionArea = `
            <div class="bg-body-tertiary p-4 rounded border mb-4">
                <h5 class="text-secondary text-uppercase small fw-bold ls-1">Direct Contact</h5>
                <div class="fs-4 fw-bold mt-2">
                    <a href="mailto:hello@michaelpragsdale.com?subject=Interview Request (Pre-Screened)" class="text-decoration-none">
                        hello@michaelpragsdale.com
                    </a>
                </div>
            </div>
            <div class="d-grid gap-2 d-sm-flex justify-content-center">
                <a href="mailto:hello@michaelpragsdale.com" class="btn btn-${color} btn-lg px-4">
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
// 8. CURRENCY FORMATTING UTILITY
// ------------------------------------------------------------------------------
/**
 * Formats a raw JavaScript Number (like `85000`) into a clean US Dollar string
 * (`"$85,000"`) using the browser's built-in `Intl.NumberFormat` API (`maximumFractionDigits: 0`
 * omits `.00` cents for annual salaries).
 *
 * @param {number} num - Raw dollar amount to format.
 * @returns {string} Formatted currency string, e.g. `"$85,000"`.
 */
function formatMoney(num) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
}
