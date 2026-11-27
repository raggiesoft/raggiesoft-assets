# Job Application Command Center & Interview Prep

A centralized reference guide for all job applications submitted, including full job descriptions, application dates, tailored angles, and key talking points for recruiter phone screens.

## Master Resume, Job-Board Target Sweet Spot & Guardrails (Updated November 27, 2026)
* **Primary Career, Git & Job-Board Email:** `hello@michaelpragsdale.com` (`hireme@michaelpragsdale.com` retained solely as a forwarding alias; `michael.ragsdale@raggiesoft.com` retired from Git commits and job boards as a personal-only inbox; Microsoft Bookings scheduling links intentionally omitted while paused).
* **Job-Portal Phone Policy:** Public web/CDN resumes (`michaelpragsdale.com` / `assets.raggiesoft.com`) stay email-only. When generating resumes directly for ATS/job portals, run `./build-resume.sh --portal` (which reads `_resume/portal-contact-profile.md` and outputs strictly to local `_resume/resumes/`).
* **Target Job-Board Sweet Spot (Going Forward):**
  1. **Mid-Level Full-Stack / Web Developer** (`PHP`, `TypeScript`, `Angular` / `React`, `REST/JSON APIs`, or `C# / .NET`)
  2. **Code-Level Web Accessibility / UI Engineer** (`WCAG 2.1/2.2 AA`, `ADA Title II` & `Revised Section 508` web criteria, semantic `HTML5`, `WAI-ARIA`, JS focus management, manual `JAWS` / `NVDA` / `VoiceOver`, `Deque axe` — **strictly source-code & web architecture, never back-office PDF or Captivate seats**)
  3. **Higher-Education & Municipal Web / LMS Engineering Roles** (leveraging the Commonwealth of Virginia **Alternative Hiring Process / AHP** wherever applicable)
  4. **W-2 Federal / Enterprise Web Engineering Roles** (`VA`, `DoD`, or civilian web teams in Hampton Roads on-site/hybrid or Virginia remote)
  * *Skip 7–10+ year senior commercial SaaS postings (such as Calendly / Seeq) and skip LPTA PDF/eLearning remediation postings.*
* **Strict Content Constraint — Public Trust (6C), Employment History, & Code-Level Web Accessibility Framing:**
  * Never include short-term 2022 contractor history on any resume, cover letter, or portfolio page; anchor work history strictly on **RaggieSoft Media**, **City of Virginia Beach**, **Old Dominion University (ODU Online)**, and **Dominion Enterprises**.
  * Never claim an `"active"` security clearance or refer to Public Trust as a national security clearance. When federal vetting history is relevant, list it strictly as **`Prior Federal Public Trust (6C) Adjudication`** without tying it to an employer (or omit if targeting pure commercial web roles).
  * **Code-Level Web Accessibility ONLY (Avoiding the PDF/Captivate Recruiter Trap):** Never use standalone phrases like `"Section 508 Remediation"`, `"Document Accessibility"`, `"PDF Remediation"`, or `"508 Specialist"`; always pair `"Section 508"` with web/code qualifiers (`"Code-Level WCAG 2.1/2.2 AA & Section 508 Web Accessibility"`, `"Source-Level Web & LMS Accessibility Compliance"`), and never list Acrobat Pro, PDF tag-tree editing, Captivate, SCORM, or Trusted Tester in skills, JSON, or prose.
* **Grounded Primary Headline:** `Full-Stack Web Developer & Web Accessibility Engineer` (replacing `Section 508 Specialist` / `Principal Systems Architect`; RaggieSoft Media framed transparently as `Independent Full-Stack Web Developer & Open-Source Maintainer`).
* **Master Resume Source:** `raggiesoft-assets/portfolio/documents/resume/mragsdale-resume.md`. Public web/CDN exposes **PDF only** (preventing third-party recruiter tampering/re-editing), while `./build-resume.sh` and `./build-resume.sh --portal` compile clean single-column `.docx` copies strictly into local `_resume/resumes/` for ATS portals that reject PDF.
* **Portfolio Alignment (`michaelpragsdale.com`, `raggiesoftstudio.com` & `raggiesoft.dev`):** Synchronized in 1:1 lockstep as a clean, welcoming **Full-Stack & Web Accessibility Portfolio** covering all 19 decoupled production web applications + **RaggieSoft Studio** (`Accessibility Studio`, `Installer Studio`, `Help Studio`, `RaggieScript v1.0`) + C#/.NET & SwiftUI companion apps + CI/CD tooling docs (`/build-team`), keeping creative/family lore separated onto RaggieSoft's consumer domains.
* **Coherent Career Arc:** Software development internship (`Dominion Enterprises`) $\rightarrow$ higher-ed source-level PLE & Canvas LMS web accessibility engineering (`ODU Online`) $\rightarrow$ public-facing municipal `Clerk-Cashier` role (`City of Virginia Beach`) while completing A.S. in IT at `TCC` $\rightarrow$ continuous independent full-stack, accessibility IDE & compiler development (`Stardust Engine CMS`, 19 web apps, `RaggieSoft Studio`, `.NET` & `SwiftUI`) $\rightarrow$ W-2 Full-Stack Web Developer / Web Accessibility Engineer roles (Direct Hire or W-2 Government/Enterprise Contractor).
* **Go-To Behavioral Interview Story (*"Tell me about a time you improved an existing process"*):**
  * **Problem:** ActiveNet holds all recreation center reservation data, yet its dense interface isn't an efficient quick reference when Front Desk staff are simultaneously helping walk-up patrons, answering phones, and checking members in.
  * **Action:** Extracted weekend room-rental records from ActiveNet, verified and transformed the schedule records, and organized them with consistent tabular hierarchy into a standardized, concise Microsoft Word reference sheet—while also serving as an approachable technical resource for coworkers on ActiveNet and Microsoft Office.
  * **Result:** Front Desk staff have an immediate at-a-glance physical/digital reference for weekend facility rentals without digging through raw ActiveNet screens mid-rush.

---

## 1. Calendly — Senior Full Stack Engineer (Website Development)
* **Company:** Calendly (Commercial SaaS)
* **Applied Date:** October 12, 2026
* **Location:** Remote (Tier 3: Norfolk, VA)
* **Target Compensation:** $187,000 – $226,600 USD (Base) + Equity & Benefits
* **Resume Used:** `mragsdale-resume-calendly.pdf`
* **Cover Letter Used:** `calendly-full-stack.pdf`
* **Status:** No response / No interview callback (as of November 18, 2026)

### Elevator Pitch & Talking Points:
* **The Headless CMS Angle:** The posting listed headless CMS experience (like Payload) as a "Nice to Have." Talk about how you didn't just use one—you architected and open-sourced **Stardust Engine CMS**, a zero-database, JSON-driven headless backend powering 9 production domains via Cloudflare edge routing.
* **Core Web Vitals & AEO:** Emphasize that your architecture optimizes for sub-second LCP, strict WCAG 2.1 AA accessibility, and structured JSON content that natively supports Answer Engine Optimization (AEO) for AI assistants.
* **Collaboration with Marketing:** You understand that public web experiences must empower marketing/content teams to ship fast without sacrificing architectural integrity or accessibility.

### Key Job Description Excerpts:
* **Role Summary:** Build performant, accessible web experiences for public marketing site and Help Center used by millions. Own projects end to end.
* **Core Responsibilities:**
  * Build scalable frontend architecture, reusable components, and content models.
  * Integrate web applications with CMS, analytics, experimentation platforms, and APIs.
  * Apply technical SEO and Answer Engine Optimization (AEO) best practices.
  * Monitor and improve Core Web Vitals, site performance, and accessibility.
* **Key Requirements:**
  * 7+ years professional software development experience.
  * Modern JavaScript/TypeScript, HTML, CSS, component architecture.
  * Nice-to-have: Modern headless CMS (Payload), static/server-rendered architectures, structured content for AI.

---

## 2. Seeq — Frontend System Engineering (Design Systems)
* **Company:** Seeq (Industrial Analytics / Enterprise SaaS)
* **Applied Date:** October 12, 2026
* **Location:** Remote-First (U.S.)
* **Target Compensation:** $155,000 – $187,500 USD + Equity + Unlimited PTO
* **Resume Used:** `mragsdale-resume-seeq.pdf`
* **Cover Letter Used:** `seeq-frontend-system.pdf`
* **Status:** No response / No interview callback (as of November 18, 2026)

### Elevator Pitch & Talking Points:
* **Workflows Over Pixels:** Connect with their core philosophy that "interface work starts with understanding how people actually work." Reference your Front Desk experience at Virginia Beach Parks & Rec transforming dense ActiveNet reservation records into an accessible, at-a-glance Microsoft Word weekend reference for coworkers, alongside your Stardust Engine CMS component architecture.
* **Tailwind CSS & Component Architecture:** Mention that you are currently architecting a composable UI component library using **Tailwind CSS** for an upcoming media distribution platform.
* **Accessibility as a First-Class Citizen:** Explain your work at ODU Online remediating complex web interfaces for screen readers (NVDA/JAWS) and keyboard navigation. Emphasize that accessible components must be ergonomic for developers to adopt.

### Key Job Description Excerpts:
* **Role Summary:** Frontend system engineering role focused on evolving Seeq's design system and reusable application patterns for data-dense enterprise workflows.
* **Core Responsibilities:**
  * Shape foundational UI primitives, higher-order blocks, and page-level templates.
  * Ensure component systems deliver excellent developer experience (DX) in an AI-assisted world.
  * Leverage open-source foundations (e.g. shadcn/ui, Tailwind CSS) with taste and judgment.
  * Define and document component APIs, responsiveness, and usability.
* **Key Requirements:**
  * 10+ years professional software development experience.
  * Experience building or evolving component libraries, pattern libraries, or design systems.
  * Expert in JavaScript/TypeScript, React concepts, Tailwind CSS, and HTML primitives.
  * Deep commitment to accessibility (keyboard navigation, screen reader support, reduced motion).

---

## 3. NuAxis Innovations — Mid-Level QA/508 Tester
* **Company:** NuAxis Innovations (Federal IT Contractor)
* **Applied Date:** October 12, 2026
* **Location:** Remote (U.S.)
* **Platform:** Taleo
* **Resume Used:** `mragsdale-resume-nuaxis.pdf`
* **Cover Letter Used:** `nuaxis-qa-tester.pdf`
* **Status:** No response / No interview callback (as of November 18, 2026)

### Elevator Pitch & Talking Points:
* **Manual Testing vs. Automated Scanners:** You know firsthand from ODU that automated tools like Deque axe and WAVE only catch ~30% of WCAG violations. Emphasize your experience with screen readers (NVDA, JAWS), manual keyboard trap verification, and semantic HTML5 source audits (`note: going forward, avoid pure QA/Trusted-Tester postings that risk turning into back-office PDF tagging seats`).
* **Developer Mindset in QA:** Because you have a full-stack engineering background, when you find a defect, you can tell the development team *why* the DOM/ARIA state failed and provide exact remediation code.
* **Federal Vetting Readiness:** Passed federal suitability adjudication previously (`Prior Federal Public Trust (6C) Adjudication`), demonstrating a clean record ready for federal background vetting.

### Key Job Description Excerpts:
* **Role Summary:** Conduct functional and Section 508 accessibility testing, WCAG conformance reviews, and defect tracking across federal enterprise platforms.
* **Core Responsibilities:**
  * Perform Section 508 testing using DHS Trusted Tester process and automated scanners.
  * Validate remediation using assistive technologies (NVDA, JAWS).
  * Log, track, and verify defects in Jira; support regression cycles.
* **Technical Environment:** ANDI, axe DevTools, WAVE, Colour Contrast Analyser, JAWS, NVDA, Selenium/Cypress, Postman, Jira.
* **Requirements:** 3–5 years testing experience (2+ years accessibility testing); obtain DHS Trusted Tester within 90 days.

---

## 4. Blackberg Group — Front-End Developer (VA Contract)
* **Company:** Blackberg Group (Veterans Affairs Contractor)
* **Applied Date:** October 12, 2026
* **Location:** Remote (U.S.)
* **Contract/Client:** Department of Veterans Affairs (VA)
* **Resume Used:** `Michael-Ragsdale-Blackberg-Group.pdf`
* **Status:** No response / No interview callback (as of November 18, 2026)

### Elevator Pitch & Talking Points:
* **Public Service & Government Experience:** Highlight your proven track record with the City of Virginia Beach and Old Dominion University building Section 508-compliant, accessible web experiences.
* **Modern Vanilla JS & Mobile-First Design:** You build clean, responsive, mobile-first web interfaces with native JavaScript and modern CSS/SCSS, avoiding unnecessary framework bloat for government portals.
* **Brand Identity & Standards:** Experienced in adhering to strict enterprise and institutional design systems (USWDS principles).

### Key Job Description Excerpts:
* **Role Summary:** Design and develop interactive, mobile-first websites for the Department of Veterans Affairs (VA).
* **Core Responsibilities:**
  * Create low-fidelity and high-fidelity designs for user testing and development.
  * Ensure brand identity, typography, photography, color, and graphics are maintained.
  * Maintain web design guidelines, standards, and best practices.
  * Actively participate in Agile Scrum ceremonies and client workshops.
* **Key Requirements:**
  * Proven frontend development experience with responsive, mobile-first design.
  * Strong collaboration and communication skills.
  * Strict adherence to accessibility and government web standards.

---

## 5. Christopher Newport University (CNU)
* **Organization:** Christopher Newport University (Commonwealth of Virginia Higher Education)
* **Location:** Newport News, VA
* **Pathway:** Commonwealth of Virginia **Alternative Hiring Process (AHP)**
* **Status:** Interviewed (mandatory AHP interview granted) — No post-interview follow-up or decision notice received (as of November 18, 2026)


