// assets/js/salary-negotiator.js
// RaggieSoft Salary Negotiation Logic (2025 Edition)

document.addEventListener('DOMContentLoaded', () => {
    initSalaryCalculator();
});

const CONFIG = {
    minSalary: 75000,    // Hard floor
    targetSalary: 85000, // The "Happy" number
    hourlyThreshold: 200 // If input is below this, assume hourly rate
};

function initSalaryCalculator() {
    const container = document.getElementById('salary-negotiator-container');
    if (!container) return;

    // Render Initial Form
    container.innerHTML = `
        <div class="card shadow-sm border-0">
            <div class="card-body p-4 text-center">
                <div class="mb-4 text-primary">
                    <i class="fa-duotone fa-sack-dollar fa-3x"></i>
                </div>
                <h3 class="h5 fw-bold mb-3">Compensation Transparency</h3>
                <p class="text-secondary small mb-4">
                    I value your time. Enter the <strong>yearly base salary</strong> for this role to see if we are aligned.
                </p>
                
                <div class="input-group mb-3">
                    <span class="input-group-text bg-body-tertiary border-end-0">$</span>
                    <input type="number" id="salaryInput" class="form-control form-control-lg border-start-0 ps-1" 
                           placeholder="Yearly Amount (e.g. 80000)" aria-label="Salary">
                    <button class="btn btn-primary" type="button" id="checkSalaryBtn">
                        Check Alignment
                    </button>
                </div>
                <div id="feedback-zone"></div>
            </div>
        </div>
    `;

    // Attach Listeners
    const btn = document.getElementById('checkSalaryBtn');
    const input = document.getElementById('salaryInput');

    btn.addEventListener('click', () => processSalary(input.value));
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') processSalary(input.value);
    });
}

function processSalary(value) {
    const zone = document.getElementById('feedback-zone');
    const amount = parseFloat(value.replace(/,/g, '')); // Strip commas if user typed them

    // 1. Validation
    if (!amount || isNaN(amount) || amount <= 0) {
        renderFeedback('warning', 'fa-triangle-exclamation', 'Input Error', 'Please enter a valid numeric salary amount.');
        return;
    }

    // 2. Hourly Check (Did they type "40" instead of "80000"?)
    if (amount < CONFIG.hourlyThreshold) {
        // Auto-convert hourly to yearly (approx 2080 hours)
        const annualized = amount * 2080;
        renderFeedback('info', 'fa-calculator', 'Hourly Detected', 
            `It looks like you entered an hourly rate ($${amount}/hr).<br>That annualizes to roughly <strong>${formatMoney(annualized)}</strong>. Calculating based on that...`);
        
        // Small delay then process the annualized amount
        setTimeout(() => processSalary(annualized.toString()), 2000);
        return;
    }

    // 3. The Logic (Red vs Green)
    if (amount >= CONFIG.minSalary) {
        // SUCCESS
        const isTarget = amount >= CONFIG.targetSalary;
        const icon = isTarget ? 'fa-traffic-light-go' : 'fa-check-circle';
        const color = isTarget ? 'success' : 'primary';
        const msg = isTarget 
            ? `Fantastic! <strong>${formatMoney(amount)}</strong> meets my target expectations.` 
            : `<strong>${formatMoney(amount)}</strong> falls within my acceptable range.`;

        zone.innerHTML = `
            <div class="alert alert-${color} mt-4 text-start border-${color}" role="alert">
                <div class="d-flex">
                    <div class="me-3 fs-1"><i class="fa-duotone ${icon}"></i></div>
                    <div>
                        <h4 class="alert-heading h5 fw-bold">We are aligned!</h4>
                        <p class="mb-2">${msg}</p>
                        <hr>
                        <div class="d-grid gap-2 d-md-flex justify-content-md-start">
                            <a href="mailto:hireme@michaelpragsdale.com?subject=Interview Request (Salary Aligned)" class="btn btn-${color} fw-bold">
                                <i class="fa-solid fa-envelope me-2"></i> Contact Me
                            </a>
                            <button class="btn btn-outline-${color}" onclick="initSalaryCalculator()">Reset</button>
                        </div>
                    </div>
                </div>
            </div>`;
            
    } else {
        // REJECTION
        zone.innerHTML = `
            <div class="alert alert-danger mt-4 text-start border-danger" role="alert">
                <div class="d-flex">
                    <div class="me-3 fs-1"><i class="fa-duotone fa-traffic-light-stop"></i></div>
                    <div>
                        <h4 class="alert-heading h5 fw-bold">Out of Range</h4>
                        <p class="mb-0">
                            Unfortunately, <strong>${formatMoney(amount)}</strong> is below my minimum requirement for this role. 
                            To maintain transparency and respect your time, I must decline opportunities at this compensation level.
                        </p>
                        <div class="mt-3">
                             <button class="btn btn-sm btn-outline-danger" onclick="initSalaryCalculator()">Check Another Rate</button>
                        </div>
                    </div>
                </div>
            </div>`;
    }
}

function renderFeedback(type, icon, title, message) {
    const zone = document.getElementById('feedback-zone');
    zone.innerHTML = `
        <div class="alert alert-${type} mt-3 d-flex align-items-center" role="alert">
            <i class="fa-duotone ${icon} fs-3 me-3"></i>
            <div>
                <strong>${title}:</strong> ${message}
            </div>
        </div>`;
}

function formatMoney(num) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
}