/**
 * @license MIT
 * ============================================================================
 * READ-ALONG TEACHING OVERVIEW: raggiesoft-network.js
 * Hosted at: https://assets.raggiesoft.com/common/js/raggiesoft-network.js
 * ============================================================================
 * WHAT THIS FILE IS:
 *   The universal cross-site navigation, accessibility, and seasonal-ribbon
 *   engine shared across all 10 RaggieSoft web properties. Because RaggieSoft's
 *   websites are intentionally built on diverse tech stacks (PHP + DaisyUI,
 *   SvelteKit, Next.js + React, Astro, Nuxt + Vue, Bootstrap, Web Awesome,
 *   Vanilla TypeScript, and Zoneless Angular), they cannot share a React or Vue
 *   component directly. Instead, every property loads this single zero-dependency
 *   Vanilla JavaScript file, which upgrades the DOM consistently everywhere!
 *
 * WHICH WEBSITES LOAD IT (ALL 10 ECOSYSTEM PROPERTIES):
 *   1. raggiesoft.com (Hub)
 *   2. nebulae.raggiesoft.com (Nebulae Atlas)
 *   3. books.raggiesoft.com (Ocean View Archives + Literary Universes Menu)
 *      └── Flagship Literary Universes:
 *          • Escape Velocity (Ad Astra) (books.raggiesoft.com/ad-astra)
 *          • Contemporary Fiction (books.raggiesoft.com/library)
 *          • Project: KNOX (books.raggiesoft.com/knox)
 *          • The Silver Gauntlet of Aethel (books.raggiesoft.com/aethel-saga)
 *   4. engineroom.raggiesoft.com (Engine Room Records + Band Roster Menu)
 *      └── Alphabetical Band Roster (A–Z):
 *          • Crimson Node (engineroom.raggiesoft.com/artists/crimson-node)
 *          • Firelight (engineroom.raggiesoft.com/artists/firelight)
 *          • Fractured Prisms (engineroom.raggiesoft.com/artists/fractured-prisms)
 *          • Mana Canvas (engineroom.raggiesoft.com/artists/mana-canvas)
 *          • The Arctic Symphony Project (engineroom.raggiesoft.com/artists/the-arctic-symphony-project)
 *          • The Paper Wall (engineroom.raggiesoft.com/artists/the-paper-wall)
 *          • The Stardust Engine (stardust.raggiesoft.com)
 *   5. music.raggiesoft.com (The Listening Room)
 *   6. stardust.raggiesoft.com (The Stardust Engine)
 *   7. lore.raggiesoft.com (Lore Archive)
 *   8. corporate.raggiesoft.com (RaggieSoft Media)
 *   9. storetrainer.raggiesoft.com (RaggieSoft StoreTrainer)
 *  10. michaelpragsdale.com (Engineering Portfolio, Resume PDF & CI/CD Suite Menu)
 *      └── Build & Deployment Scripts (/build-team):
 *          • Workstation Bootstrap — brooke.sh (michaelpragsdale.com/build-team/michael)
 *          • Content & Search Compiler — paige.php (michaelpragsdale.com/build-team/paige)
 *          • Production Linux Host — jessica (michaelpragsdale.com/build-team/jessica)
 *          • FFmpeg Media Pipeline — harper.sh (michaelpragsdale.com/build-team/harper)
 *          • Multi-Repo & CDN Sync — jenna-sync.sh (michaelpragsdale.com/build-team/jenna)
 *          • Non-Root Cron Deployer — sarah-deploy.sh (michaelpragsdale.com/build-team/sarah)
 *          • Front-Controller Router — elara.php (michaelpragsdale.com/build-team/amanda-elara)
 *
 * WHAT INPUTS IT CONSUMES:
 *   - `window.location.hostname`, `pathname`, and `search` (`?holiday=preview`).
 *   - System clock (`Date.now()`, `Temporal` / `Intl.DateTimeFormat` in `America/New_York`).
 *   - `localStorage` (`rs_holiday_snow_pref`) and `sessionStorage` (`rs_holiday_preview_mode`).
 *   - OS media queries (`prefers-reduced-motion`, `(hover: hover)`, PWA `display-mode`).
 *   - Existing `.rs-network-bar` and mobile menu containers (`#primary-navigation`,
 *     `#header-navigation-panel`, `#navbarCollapse`, `#music-mobile-navigation`, `#stardust-sidebar`).
 *
 * WHAT VISIBLE UI & METADATA IT PRODUCES:
 *   - Upgrades `.rs-network-bar` on desktop with 3 accessible hover/click/keyboard
 *     dropdown menus (`📚 Ocean View ▾`, `⚙️ Engine Room ▾`, `👔 Portfolio & Resume ▾`).
 *   - Injects a 2-column `.rs-mobile-network-section` switcher + collapsible accordions
 *     into each site's mobile hamburger menu so phones never have double hamburger bars.
 *   - Displays the auto-expiring 30-day Sir Patrick Stewart *In Memoriam* ribbon
 *     through `2026-11-28T23:59:59-05:00`, followed automatically on Nov 29, 2026
 *     by the yearly Holiday Season ribbon & pauseable GPU snowfall through Jan 1.
 *   - Injects `<style id="rs-network-core-css">` and `<script type="application/ld+json" id="rs-ecosystem-jsonld">`.
 *   - Hides cross-site navigation chrome automatically inside installed OS PWAs.
 *
 * 100-LEVEL JAVASCRIPT CONCEPTS TAUGHT IN THIS FILE:
 *   - IIFEs (`(function () { 'use strict'; ... })()`): Private module encapsulation.
 *   - ISO-8601 Timestamp Expiration (`Date.parse`) & Timezone-Locked Dates (`America/New_York`).
 *   - Document-Level Event Delegation (`pointerover`, `mousemove`, `focusout`, `click`, `keydown`).
 *   - WAI-ARIA Disclosure Attributes (`aria-expanded`, `aria-controls`, `aria-current="page"`, `Escape` focus return).
 *   - `MutationObserver`: Reacting automatically when Angular or SPA routers mount new DOM nodes.
 * ============================================================================
 */
(function () {
  /* `'use strict'` opts this IIFE into ES5+ Strict Mode, catching accidental
   * undeclared global variables right away instead of silently creating `window.foo`. */
  'use strict';

  /**
   * ==========================================================================
   * SECTION 0: TIME-GATED MEMORIAL RIBBON & YEARLY HOLIDAY SCHEDULE
   * ==========================================================================
   * 1. `MEMORIAM_EXPIRES_ISO`: Fixed ISO-8601 timestamp with `-05:00` (US Eastern
   *    Standard Time) offset honoring Sir Patrick Stewart (July 13, 1940 –
   *    October 28, 2026). After `2026-11-28T23:59:59-05:00`, `isMemoriamActive()`
   *    returns `false` automatically on every visitor's browser without needing
   *    a server redeploy!
   * 2. `SNOW_STORAGE_KEY`: `localStorage` key remembering whether the visitor
   *    clicked "Pause Snow" (`'paused'`) or "Play Snow" (`'playing'`) across visits.
   * 3. `HOLIDAY_PREVIEW_SESSION_KEY`: `sessionStorage` key letting developers
   *    test `?holiday=preview` in a single tab without affecting normal tabs.
   */
  var MEMORIAM_EXPIRES_ISO = '2026-11-28T23:59:59-05:00';
  var SNOW_STORAGE_KEY = 'rs_holiday_snow_pref';
  var HOLIDAY_PREVIEW_SESSION_KEY = 'rs_holiday_preview_mode';

  /**
   * Checks whether the current moment (or an optional `customDate` passed by unit tests)
   * is on or before `2026-11-28T23:59:59-05:00`.
   *
   * How ISO timestamp comparison works in JS:
   *   - `Date.parse('2026-11-28T23:59:59-05:00')` converts that exact Eastern Time
   *     instant into UTC epoch milliseconds (milliseconds since Jan 1, 1970 00:00:00 UTC).
   *   - `Date.now()` returns the current UTC epoch milliseconds.
   *   - Comparing two UTC millisecond integers (`checkMs <= expiryMs`) is 100% immune
   *     to whatever local timezone the visitor's laptop or phone is set to!
   */
  function isMemoriamActive(customDate) {
    try {
      var expiryMs = Date.parse(MEMORIAM_EXPIRES_ISO);
      if (isNaN(expiryMs)) return false;
      var checkMs = customDate instanceof Date ? customDate.getTime() : Date.now();
      return checkMs <= expiryMs;
    } catch (e) {
      return false;
    }
  }

  /**
   * Resolves today's `{ year, month, day }` calendar numbers strictly in New York
   * time (`America/New_York`), regardless of whether the visitor is in Tokyo,
   * London, California, or Virginia.
   *
   * Three-tier progressive fallback:
   *   1. Modern `Temporal.Instant` API (newest JS standard, zero quirks).
   *   2. `Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York' }).formatToParts()`
   *      (supported in every evergreen browser—extracts numeric `year`, `month`, `day`).
   *   3. Local `Date` getters (`getFullYear()`, `getMonth() + 1` since JS months
   *      are 0-indexed `0..11`, and `getDate()`).
   */
  function getEasternCalendarDate(customDate) {
    var targetDate = customDate instanceof Date && !isNaN(customDate.getTime()) ? customDate : new Date();
    try {
      if (typeof Temporal !== 'undefined' && Temporal.Instant) {
        var instant = Temporal.Instant.fromEpochMilliseconds(targetDate.getTime());
        var zdt = instant.toZonedDateTimeISO('America/New_York');
        return { year: zdt.year, month: zdt.month, day: zdt.day };
      }
    } catch (e) {}

    try {
      var fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      });
      var parts = fmt.formatToParts(targetDate);
      var year = 0;
      var month = 0;
      var day = 0;
      for (var i = 0; i < parts.length; i++) {
        if (parts[i].type === 'year') year = parseInt(parts[i].value, 10);
        else if (parts[i].type === 'month') month = parseInt(parts[i].value, 10);
        else if (parts[i].type === 'day') day = parseInt(parts[i].value, 10);
      }
      if (year > 0 && month > 0 && day > 0) {
        return { year: year, month: month, day: day };
      }
    } catch (e2) {}

    return {
      year: targetDate.getFullYear(),
      month: targetDate.getMonth() + 1,
      day: targetDate.getDate()
    };
  }

  /**
   * Computes which day-of-month in November is Black Friday for any given `year`.
   * Step-by-step calendar math:
   *   1. `Date.UTC(year, 10, 1)` creates November 1st (remember JS months start at `0`,
   *      so `10` = November!). `.getUTCDay()` returns `0` (Sun) through `6` (Sat),
   *      where `4` = Thursday.
   *   2. `1 + ((4 - nov1Dow + 7) % 7)` advances from Nov 1st to the FIRST Thursday of November.
   *   3. `+ 21` (3 full weeks) lands on the FOURTH Thursday of November (US Thanksgiving).
   *   4. `+ 1` lands on Black Friday! (For example, in 2026: Nov 26 is Thanksgiving -> returns `27`.)
   */
  function getBlackFridayDay(year) {
    var nov1Dow = new Date(Date.UTC(year, 10, 1)).getUTCDay(); /* 0=Sun .. 4=Thu .. 6=Sat */
    var firstThursday = 1 + ((4 - nov1Dow + 7) % 7);
    var thanksgivingDay = firstThursday + 21;
    return thanksgivingDay + 1;
  }

  /**
   * Developer / QA Preview Override via URL Query Parameter (`?holiday=preview`):
   *   - Visiting `?holiday=on` or `?holiday=preview` stores `'on'` in `sessionStorage`
   *     (which lasts only until this browser tab closes) and forces Holiday Mode on.
   *   - Visiting `?holiday=off` clears `sessionStorage` and forces Holiday Mode off.
   *   - Returns `null` when no preview override is active so normal calendar rules run.
   */
  function getHolidayPreviewOverride() {
    try {
      var params = new URLSearchParams(window.location.search || '');
      var raw = (params.get('holiday') || params.get('rs_holiday') || '').toLowerCase();
      if (raw === '1' || raw === 'true' || raw === 'on' || raw === 'preview') {
        try { sessionStorage.setItem(HOLIDAY_PREVIEW_SESSION_KEY, 'on'); } catch (e) {}
        return true;
      }
      if (raw === '0' || raw === 'false' || raw === 'off' || raw === 'normal') {
        try { sessionStorage.removeItem(HOLIDAY_PREVIEW_SESSION_KEY); } catch (e2) {}
        return false;
      }
      var saved = sessionStorage.getItem(HOLIDAY_PREVIEW_SESSION_KEY);
      if (saved === 'on') return true;
    } catch (e3) {}
    return null;
  }

  /**
   * Determines whether the annual Holiday Season ribbon & snowfall should display:
   *   1. Honors `?holiday=preview|off` when testing interactively.
   *   2. Respectful Tribute Rule: NEVER overlaps with Sir Patrick Stewart's 30-day
   *      In Memoriam window (so in November 2026, Holiday Mode waits until `00:00:00 EST`
   *      on Sunday, November 29, 2026).
   *   3. Otherwise active from Black Friday (`month === 11 && day >= BlackFriday`),
   *      all of December (`month === 12`), and New Year's Day (`month === 1 && day === 1`),
   *      packing away automatically on January 2!
   */
  function isHolidaySeasonActive(customDate) {
    if (!(customDate instanceof Date)) {
      var preview = getHolidayPreviewOverride();
      if (preview !== null) return preview;
    }

    /* Out of respect to the 2026 Sir Patrick Stewart tribute, never overlap with In Memoriam */
    if (isMemoriamActive(customDate)) {
      return false;
    }

    var cal = getEasternCalendarDate(customDate);
    if (cal.month === 12) {
      return true;
    }
    if (cal.month === 1) {
      return cal.day === 1;
    }
    if (cal.month === 11) {
      return cal.day >= getBlackFridayDay(cal.year);
    }
    return false;
  }

  /* Safely checks OS/browser `prefers-reduced-motion: reduce` accessibility setting. */
  function prefersReducedMotion() {
    try {
      return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (e) {
      return false;
    }
  }

  /**
   * Resolves whether falling snow should currently be paused:
   *   - Explicit user choice in `localStorage` (`'paused'` vs `'playing'`) wins first!
   *   - If the user hasn't clicked the snow button yet (`pref === null`), default to
   *     paused when OS `prefers-reduced-motion: reduce` is enabled, or playing otherwise.
   */
  function isSnowPaused() {
    var pref = null;
    try {
      pref = localStorage.getItem(SNOW_STORAGE_KEY);
    } catch (e) {}
    if (pref === 'paused') return true;
    if (pref === 'playing') return false;
    return prefersReducedMotion();
  }

  /**
   * Syncs root `<html>` classes (`rs-snow-paused`, `rs-snow-force-play`) and updates
   * every `.rs-holiday-snow-btn` button's `aria-pressed`, `aria-label`, and visible label.
   *
   * Accessibility Note:
   * `aria-pressed="true|false"` turns `<button>` into an accessible WAI-ARIA toggle
   * button so screen readers announce its current state clearly.
   */
  function applySnowPlaybackState() {
    var root = document.documentElement;
    if (!root) return;
    var pref = null;
    try {
      pref = localStorage.getItem(SNOW_STORAGE_KEY);
    } catch (e) {}
    var paused = isSnowPaused();
    root.classList.toggle('rs-snow-paused', paused);
    root.classList.toggle('rs-snow-force-play', !paused && pref === 'playing');

    var btns = document.querySelectorAll('.rs-holiday-snow-btn');
    for (var i = 0; i < btns.length; i++) {
      var btn = btns[i];
      btn.setAttribute('aria-pressed', paused ? 'true' : 'false');
      btn.setAttribute(
        'aria-label',
        paused ? 'Resume gentle falling snow animation' : 'Pause falling snow animation'
      );
      btn.innerHTML = paused
        ? '<span aria-hidden="true">❄️</span><span>Play Snow</span>'
        : '<span aria-hidden="true">⏸</span><span>Pause Snow</span>';
    }
  }

  /* Flips snow playback between `'paused'` and `'playing'`, saves to `localStorage`
   * (wrapped in `try/catch` for Safari Private Browsing), and updates the DOM immediately. */
  function toggleSnowPlayback() {
    var currentlyPaused = isSnowPaused();
    var nextPaused = !currentlyPaused;
    try {
      localStorage.setItem(SNOW_STORAGE_KEY, nextPaused ? 'paused' : 'playing');
    } catch (e) {}
    applySnowPlaybackState();
  }

  /**
   * Top-level RaggieSoft properties for the Mobile Network Switcher (5x2 balanced grid).
   */
  var NETWORK_SITES = [
    { id: 'hub', href: 'https://raggiesoft.com', host: 'raggiesoft.com', icon: '🌐', label: 'RaggieSoft Hub' },
    { id: 'nebulae', href: 'https://nebulae.raggiesoft.com', host: 'nebulae.raggiesoft.com', icon: '🌌', label: 'Nebulae Atlas' },
    { id: 'books', href: 'https://books.raggiesoft.com', host: 'books.raggiesoft.com', icon: '📚', label: 'Ocean View Archives' },
    { id: 'cedarrun', href: 'https://cedarrun.raggiesoft.com', host: 'cedarrun.raggiesoft.com', icon: '🌲', label: 'Cedar Run (Crossroads)' },
    { id: 'backstage', href: 'https://backstage.raggiesoft.com', host: 'backstage.raggiesoft.com', icon: '🎬', label: 'RaggieSoft Backstage' },
    { id: 'music', href: 'https://music.raggiesoft.com', host: 'music.raggiesoft.com', icon: '🎧', label: 'The Listening Room' },
    { id: 'engineroom', href: 'https://engineroom.raggiesoft.com', host: 'engineroom.raggiesoft.com', icon: '⚙️', label: 'Engine Room' },
    { id: 'corporate', href: 'https://corporate.raggiesoft.com', host: 'corporate.raggiesoft.com', icon: '🏢', label: 'Corporate Media' },
    { id: 'storetrainer', href: 'https://storetrainer.raggiesoft.com', host: 'storetrainer.raggiesoft.com', icon: '💾', label: 'StoreTrainer' },
    { id: 'waystation', href: 'https://waystation.raggiesoft.com', host: 'waystation.raggiesoft.com', icon: '🔮', label: 'The Waystation' },
    { id: 'portfolio', href: 'https://michaelpragsdale.com', host: 'michaelpragsdale.com', icon: '👔', label: 'Portfolio & Resume' }
  ];

  /**
   * Ocean View Archives & Story Crossroads Literary Universes (`books.raggiesoft.com` & `cedarrun.raggiesoft.com`).
   */
  var OCEAN_VIEW_ITEMS = [
    {
      id: 'story-crossroads',
      name: 'RaggieSoft Story Crossroads',
      href: 'https://crossroads.raggiesoft.com',
      pathPrefix: '/crossroads',
      icon: '🧭'
    },
    {
      id: 'cedar-run',
      name: 'Cedar Run (Story Crossroads)',
      href: 'https://cedarrun.raggiesoft.com',
      pathPrefix: '/cedar-run',
      icon: '🌲'
    },
    {
      id: 'ad-astra',
      name: 'Escape Velocity (Ad Astra)',
      href: 'https://books.raggiesoft.com/ad-astra',
      pathPrefix: '/ad-astra',
      icon: '🚀'
    },
    {
      id: 'contemporary',
      name: 'Contemporary Fiction (Library)',
      href: 'https://books.raggiesoft.com/library',
      pathPrefix: '/library',
      icon: '🌊'
    },
    {
      id: 'knox',
      name: 'Project: KNOX (Quantum Directive)',
      href: 'https://books.raggiesoft.com/knox',
      pathPrefix: '/knox',
      icon: '🕵️'
    },
    {
      id: 'aethel',
      name: 'The Silver Gauntlet of Aethel',
      href: 'https://books.raggiesoft.com/aethel-saga',
      pathPrefix: '/aethel',
      icon: '⚔️'
    }
  ];

  /**
   * Official Engine Room Records Band Roster in strict alphabetical order (A–Z).
   */
  var ENGINE_ROOM_BANDS = [
    {
      slug: 'crimson-node',
      name: 'Crimson Node',
      href: 'https://engineroom.raggiesoft.com/artists/crimson-node',
      icon: '🔴'
    },
    {
      slug: 'firelight',
      name: 'Firelight',
      href: 'https://engineroom.raggiesoft.com/artists/firelight',
      icon: '🔥'
    },
    {
      slug: 'fractured-prisms',
      name: 'Fractured Prisms',
      href: 'https://engineroom.raggiesoft.com/artists/fractured-prisms',
      icon: '💎'
    },
    {
      slug: 'mana-canvas',
      name: 'Mana Canvas',
      href: 'https://engineroom.raggiesoft.com/artists/mana-canvas',
      icon: '🎨'
    },
    {
      slug: 'the-arctic-symphony-project',
      name: 'The Arctic Symphony Project',
      href: 'https://engineroom.raggiesoft.com/artists/the-arctic-symphony-project',
      icon: '❄️'
    },
    {
      slug: 'the-paper-wall',
      name: 'The Paper Wall',
      href: 'https://engineroom.raggiesoft.com/artists/the-paper-wall',
      icon: '🧱'
    },
    {
      slug: 'the-stardust-engine',
      name: 'The Stardust Engine',
      href: 'https://stardust.raggiesoft.com',
      icon: '🚀'
    }
  ];

  /**
   * Engineering Portfolio CI/CD & Automation Scripts (`michaelpragsdale.com/build-team/*`).
   */
  var BUILD_TEAM_MEMBERS = [
    {
      slug: 'michael',
      name: 'Workstation Bootstrap (brooke.sh)',
      mobileLabel: 'brooke.sh (Bootstrap)',
      href: 'https://michaelpragsdale.com/build-team/michael',
      icon: '💻'
    },
    {
      slug: 'paige',
      name: 'Content & Search Compiler (paige.php)',
      mobileLabel: 'paige.php (Compiler)',
      href: 'https://michaelpragsdale.com/build-team/paige',
      icon: '📚'
    },
    {
      slug: 'jessica',
      name: 'Production Linux Host (jessica)',
      mobileLabel: 'Linux VPS (Nginx)',
      href: 'https://michaelpragsdale.com/build-team/jessica',
      icon: '🖥️'
    },
    {
      slug: 'harper',
      name: 'FFmpeg Media Pipeline (harper.sh)',
      mobileLabel: 'harper.sh (Media)',
      href: 'https://michaelpragsdale.com/build-team/harper',
      icon: '🎧'
    },
    {
      slug: 'jenna',
      name: 'Multi-Repo & CDN Sync (jenna-sync.sh)',
      mobileLabel: 'jenna-sync.sh (CDN)',
      href: 'https://michaelpragsdale.com/build-team/jenna',
      icon: '🚀'
    },
    {
      slug: 'sarah',
      name: 'Non-Root Cron Deployer (sarah-deploy.sh)',
      mobileLabel: 'sarah-deploy.sh (CD)',
      href: 'https://michaelpragsdale.com/build-team/sarah',
      icon: '🛡️'
    },
    {
      slug: 'amanda-elara',
      name: 'Front-Controller Router (elara.php)',
      mobileLabel: 'elara.php (Router)',
      href: 'https://michaelpragsdale.com/build-team/amanda-elara',
      icon: '🔀'
    }
  ];

  /* ==========================================================================
   * SECTION 1: URL ROUTE MATCHERS & STANDALONE PWA IMMERSION GUARDS
   * ========================================================================== */

  /* Returns lowercase hostname stripped of any leading `www.` (e.g. `'books.raggiesoft.com'`). */
  function getCurrentHost() {
    try {
      return (window.location.hostname || '').toLowerCase().replace(/^www\./, '');
    } catch (e) {
      return '';
    }
  }

  /* Returns normalized URL pathname stripped of trailing slashes (so `'/knox/'` === `'/knox'`, while root stays `'/'`). */
  function getCurrentPathname() {
    try {
      return (window.location.pathname || '/').replace(/\/+$/, '') || '/';
    } catch (e) {
      return '/';
    }
  }

  /* Checks whether the visitor is currently viewing a specific Engine Room band's page
   * (handling The Stardust Engine's dedicated `stardust.raggiesoft.com` domain as well!). */
  function isBandActive(band, currentHost, currentPath) {
    if (band.slug === 'the-stardust-engine') {
      return (
        currentHost === 'stardust.raggiesoft.com' ||
        (currentHost === 'engineroom.raggiesoft.com' &&
          (currentPath.indexOf('/artists/the-stardust-engine') === 0 ||
            currentPath.indexOf('/artists/stardust-engine') === 0))
      );
    }
    return (
      currentHost === 'engineroom.raggiesoft.com' &&
      currentPath.indexOf('/artists/' + band.slug) === 0
    );
  }

  /* Checks whether the visitor is inside one of Ocean View Archives' or Story Crossroads' flagship literary universes. */
  function isOceanViewItemActive(item, currentHost, currentPath) {
    if (item.id === 'story-crossroads') {
      return currentHost === 'crossroads.raggiesoft.com';
    }
    if (item.id === 'cedar-run') {
      return (
        currentHost === 'cedarrun.raggiesoft.com' ||
        (currentHost === 'books.raggiesoft.com' &&
          (currentPath === '/cedar-run' || currentPath.indexOf('/cedar-run/') === 0))
      );
    }
    if (currentHost !== 'books.raggiesoft.com') return false;
    if (item.id === 'ad-astra') {
      return currentPath === '/ad-astra' || currentPath.indexOf('/ad-astra/') === 0;
    }
    if (item.id === 'contemporary') {
      return currentPath === '/library' || currentPath === '/catalog';
    }
    if (item.id === 'knox') {
      return currentPath === '/knox' || currentPath.indexOf('/quantum-directive') === 0;
    }
    if (item.id === 'aethel') {
      return currentPath === '/aethel-saga' || currentPath.indexOf('/aethel') === 0;
    }
    return false;
  }

  /* Checks whether the visitor is viewing a specific CI/CD persona dossier on `michaelpragsdale.com/build-team/*`. */
  function isBuildTeamMemberActive(member, currentHost, currentPath) {
    return (
      currentHost === 'michaelpragsdale.com' &&
      currentPath === '/build-team/' + member.slug
    );
  }

  /**
   * Detects whether the current property is running inside an installed native
   * Progressive Web App (PWA) window across all major OS platforms:
   *   - iOS Safari Home Screen WebClips: `window.navigator.standalone === true`
   *   - Android Trusted Web Activities (TWA): `document.referrer` starts with `'android-app://'`
   *   - Desktop & Android Chrome/Edge/Safari PWAs: `matchMedia('(display-mode: standalone)...')`
   */
  function isStandalonePwa() {
    try {
      if (window.navigator && window.navigator.standalone === true) {
        return true;
      }
      if (document.referrer && document.referrer.indexOf('android-app://') === 0) {
        return true;
      }
      if (typeof window.matchMedia === 'function') {
        if (
          window.matchMedia(
            '(display-mode: standalone), (display-mode: window-controls-overlay), (display-mode: minimal-ui), (display-mode: fullscreen)'
          ).matches
        ) {
          return true;
        }
      }
    } catch (e) {}
    return false;
  }

  /**
   * Capture-Phase External Link Router for Installed PWAs:
   * Notice the `true` 3rd argument passed to `document.addEventListener('click', ..., true)`!
   * In the DOM event model:
   *   1. CAPTURE PHASE (`true`): Travels TOP-DOWN from `document` -> `<body>` -> `<a>` FIRST.
   *   2. BUBBLE PHASE (`false`): Travels BOTTOM-UP from `<a>` -> `<body>` -> `document` SECOND.
   * Running in the capture phase guarantees that if a user inside an installed PWA
   * (e.g. RaggieSoft Book Reader) clicks a link to another hostname (`music.raggiesoft.com`),
   * we stamp `target="_blank" rel="noopener noreferrer"` BEFORE the click finishes so the
   * OS opens their system web browser instead of trapping them in an out-of-scope popup!
   */
  function ensureStandaloneExternalLinkRouting() {
    if (window.__rsPwaExternalLinkRoutingBound) return;
    window.__rsPwaExternalLinkRoutingBound = true;

    document.addEventListener(
      'click',
      function (e) {
        if (!isStandalonePwa()) return;
        var target = e.target;
        if (!target || typeof target.closest !== 'function') return;
        var anchor = target.closest('a[href]');
        if (!anchor) return;
        var rawHref = anchor.getAttribute('href') || '';
        if (!rawHref || rawHref.charAt(0) === '#' || rawHref.indexOf('javascript:') === 0) return;

        try {
          var parsedUrl = new URL(anchor.href, window.location.href);
          if (
            (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') &&
            parsedUrl.hostname.toLowerCase() !== (window.location.hostname || '').toLowerCase()
          ) {
            anchor.setAttribute('target', '_blank');
            anchor.setAttribute('rel', 'noopener noreferrer');
          }
        } catch (err) {}
      },
      true
    );
  }

  /**
   * Injects `<style id="rs-network-core-css">` directly into `<head>` once per tab.
   * Why embed core CSS inside JS when `raggiesoft-network.css` also exists?
   * Defense-in-depth! Static SSG sites or CDN caches might briefly serve an older
   * stylesheet version during deployments; injecting these core layout, contrast,
   * iOS `100dvh` scroll, and PWA hiding rules guarantees zero broken dropdowns.
   */
  function ensureNetworkStylesInjected() {
    if (!document.head || document.getElementById('rs-network-core-css')) return;
    var style = document.createElement('style');
    style.id = 'rs-network-core-css';
    style.textContent = [
      '.rs-network-bar { position: relative; z-index: 1055 !important; overflow: visible !important; background-color: #060913 !important; color: #f8fafc !important; border-bottom: 1px solid rgba(148, 163, 184, 0.35) !important; }',
      'html[data-bs-theme="light"] .rs-network-bar, html[data-theme="light"] .rs-network-bar, html[data-color-scheme="light"] .rs-network-bar { background-color: #0b1120 !important; color: #f8fafc !important; border-bottom: 1px solid #1e293b !important; }',
      '.rs-network-bar-inner, .rs-network-links, .rs-network-bar > div, .rs-network-bar > div > ul { overflow: visible !important; }',
      '.rs-network-label, .rs-network-bar > div > span:first-child { color: #fbbf24 !important; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-weight: 700; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; }',
      '.rs-network-links > li > a, .rs-network-bar > div > ul > li > a { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.2rem 0.5rem; border-radius: 0.35rem; background-color: transparent !important; color: #f1f5f9 !important; text-decoration: none !important; font-weight: 600; font-size: 0.74rem; border: 1px solid transparent !important; white-space: nowrap; }',
      '.rs-network-links > li > a:hover, .rs-network-links > li > a:focus-visible, .rs-network-bar > div > ul > li > a:hover, .rs-network-bar > div > ul > li > a:focus-visible { background-color: #1e293b !important; color: #38bdf8 !important; border-color: rgba(56, 189, 248, 0.55) !important; }',
      '.rs-network-links > li > a[aria-current="page"], .rs-network-links > li > a.is-active, .rs-network-bar > div > ul > li > a[aria-current="page"], .rs-network-bar > div > ul > li > a.is-active { background-color: rgba(56, 189, 248, 0.2) !important; color: #38bdf8 !important; border-color: rgba(56, 189, 248, 0.65) !important; font-weight: 700; }',
      '.rs-network-dropdown { position: relative; display: inline-flex; align-items: center; }',
      '.rs-network-dropdown-toggle { display: inline-flex; align-items: center; gap: 0.28rem; padding: 0.2rem 0.5rem; border-radius: 0.35rem; background: transparent !important; color: #f1f5f9 !important; font-family: inherit; font-weight: 600; font-size: 0.74rem; line-height: 1.3; border: 1px solid transparent !important; cursor: pointer; white-space: nowrap; transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease; }',
      '.rs-network-dropdown-toggle:hover, .rs-network-dropdown-toggle:focus-visible, .rs-network-dropdown.is-open .rs-network-dropdown-toggle { background-color: #1e293b !important; color: #38bdf8 !important; border-color: rgba(56, 189, 248, 0.55) !important; }',
      '.rs-network-dropdown-toggle.is-active { background-color: rgba(56, 189, 248, 0.2) !important; color: #38bdf8 !important; border-color: rgba(56, 189, 248, 0.65) !important; font-weight: 700; }',
      '.rs-network-caret { font-size: 0.65rem; opacity: 0.85; transition: transform 0.15s ease; }',
      '.rs-network-dropdown.is-open .rs-network-caret { transform: rotate(180deg); }',
      '.rs-network-bar .rs-network-dropdown-menu, .rs-network-dropdown-menu { display: none; position: absolute; top: calc(100% + 0.2rem); left: 0; min-width: 255px; background-color: #0b1120 !important; color: #f8fafc !important; border: 1px solid rgba(56, 189, 248, 0.45) !important; border-radius: 0.55rem; padding: 0.4rem; box-shadow: 0 16px 36px rgba(0, 0, 0, 0.65); list-style: none !important; margin: 0 !important; z-index: 2000; }',
      '@media (min-width: 768px) { .rs-network-bar .rs-network-dropdown:last-child > .rs-network-dropdown-menu, .rs-network-bar .rs-network-dropdown[data-rs-dropdown="portfolio"] > .rs-network-dropdown-menu, .rs-network-dropdown:last-child > .rs-network-dropdown-menu, .rs-network-dropdown[data-rs-dropdown="portfolio"] > .rs-network-dropdown-menu { left: auto !important; right: 0 !important; } }',
      '.rs-network-dropdown-menu::before { content: ""; position: absolute; top: -0.65rem; left: -0.75rem; right: -0.75rem; height: 0.75rem; background: transparent; }',
      '.rs-network-bar .rs-network-dropdown.is-open > .rs-network-dropdown-menu, .rs-network-dropdown.is-open > .rs-network-dropdown-menu { display: block !important; }',
      '@media (hover: hover) and (pointer: fine) { .rs-network-bar .rs-network-dropdown:hover > .rs-network-dropdown-menu, .rs-network-dropdown:hover > .rs-network-dropdown-menu { display: block !important; } }',
      '.rs-network-dropdown-menu > li { list-style: none !important; margin: 0 !important; padding: 0 !important; }',
      '.rs-network-dropdown-header { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.64rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #fbbf24 !important; padding: 0.35rem 0.55rem 0.2rem; }',
      '.rs-network-dropdown-divider { height: 1px; background-color: rgba(148, 163, 184, 0.25); margin: 0.3rem 0.25rem; }',
      '.rs-network-dropdown-menu a { display: flex !important; align-items: center; gap: 0.45rem; width: 100%; padding: 0.38rem 0.6rem !important; border-radius: 0.38rem; font-size: 0.76rem !important; font-weight: 600; color: #f1f5f9 !important; background-color: transparent !important; text-decoration: none !important; border: 1px solid transparent !important; white-space: nowrap; }',
      '.rs-network-dropdown-menu a:hover, .rs-network-dropdown-menu a:focus-visible { background-color: #1e293b !important; color: #38bdf8 !important; border-color: rgba(56, 189, 248, 0.45) !important; }',
      '.rs-network-dropdown-menu a.is-active, .rs-network-dropdown-menu a[aria-current="page"] { background-color: rgba(56, 189, 248, 0.2) !important; color: #38bdf8 !important; border-color: rgba(56, 189, 248, 0.6) !important; font-weight: 700; }',
      '.rs-mobile-network-section { display: none; width: 100%; margin-top: 0.75rem; padding-top: 0.75rem; padding-bottom: 0.5rem; border-top: 1px solid rgba(148, 163, 184, 0.28); }',
      '.rs-mobile-network-title { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #fbbf24; margin-bottom: 0.5rem; padding: 0 0.25rem; display: flex; align-items: center; gap: 0.35rem; }',
      '[data-bs-theme="light"] .rs-mobile-network-title, [data-theme="light"] .rs-mobile-network-title, [data-color-scheme="light"] .rs-mobile-network-title, html.light .rs-mobile-network-title { color: #854d0e !important; }',
      '.rs-mobile-network-grid { display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.35rem; list-style: none !important; margin: 0 !important; padding: 0 !important; }',
      '.rs-mobile-network-grid > li { list-style: none !important; margin: 0 !important; padding: 0 !important; min-width: 0; }',
      '.rs-mobile-network-link { display: flex; align-items: center; gap: 0.38rem; padding: 0.38rem 0.55rem; min-height: 38px; border-radius: 0.45rem; font-size: 0.75rem; font-weight: 600; text-decoration: none !important; color: #e2e8f0; background-color: rgba(15, 23, 42, 0.78); border: 1px solid rgba(148, 163, 184, 0.24); line-height: 1.2; min-width: 0; }',
      '[data-bs-theme="light"] .rs-mobile-network-link, [data-theme="light"] .rs-mobile-network-link, [data-color-scheme="light"] .rs-mobile-network-link, html.light .rs-mobile-network-link { color: #0f172a !important; background-color: #f1f5f9 !important; border-color: #64748b !important; }',
      '.rs-mobile-network-link.is-active, .rs-mobile-network-link[aria-current="page"] { background-color: rgba(56, 189, 248, 0.18); color: #38bdf8; border-color: rgba(56, 189, 248, 0.6); font-weight: 700; }',
      '[data-bs-theme="light"] .rs-mobile-network-link.is-active, [data-bs-theme="light"] .rs-mobile-network-link[aria-current="page"], [data-theme="light"] .rs-mobile-network-link.is-active, [data-theme="light"] .rs-mobile-network-link[aria-current="page"], [data-color-scheme="light"] .rs-mobile-network-link.is-active, [data-color-scheme="light"] .rs-mobile-network-link[aria-current="page"] { background-color: #e0f2fe !important; color: #0c4a6e !important; border-color: #0284c7 !important; }',
      '.rs-mobile-network-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
      '.rs-mobile-submenus { display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.55rem; }',
      '.rs-mobile-submenu { border: 1px solid rgba(148, 163, 184, 0.28); border-radius: 0.5rem; background-color: rgba(15, 23, 42, 0.55); overflow: hidden; }',
      '.rs-mobile-submenu-summary { appearance: none; width: 100%; border: 0; background: transparent; text-align: left; list-style: none; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; padding: 0.48rem 0.65rem; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #fbbf24; cursor: pointer; user-select: none; }',
      '.rs-mobile-submenu-summary::-webkit-details-marker { display: none; }',
      '.rs-mobile-submenu-summary:focus-visible { outline: 2px solid #38bdf8; outline-offset: -2px; }',
      '.rs-mobile-submenu-caret { font-size: 0.75rem; transition: transform 0.15s ease; }',
      '.rs-mobile-submenu[open] .rs-mobile-submenu-caret, .rs-mobile-submenu.is-open .rs-mobile-submenu-caret, .rs-mobile-submenu-summary[aria-expanded="true"] .rs-mobile-submenu-caret { transform: rotate(180deg); }',
      '.rs-mobile-submenu-body { padding: 0.2rem 0.5rem 0.55rem; border-top: 1px solid rgba(148, 163, 184, 0.2); }',
      '.rs-mobile-submenu-body[hidden] { display: none !important; }',
      '[data-bs-theme="light"] .rs-mobile-submenu, [data-theme="light"] .rs-mobile-submenu, [data-color-scheme="light"] .rs-mobile-submenu, html.light .rs-mobile-submenu { background-color: #f8fafc !important; border-color: #94a3b8 !important; }',
      '[data-bs-theme="light"] .rs-mobile-submenu-summary, [data-theme="light"] .rs-mobile-submenu-summary, [data-color-scheme="light"] .rs-mobile-submenu-summary, html.light .rs-mobile-submenu-summary { color: #854d0e !important; }',
      '@media (max-width: 1120px) { body.rs-has-primary-nav .rs-network-bar { display: none !important; } .rs-mobile-network-section[data-rs-breakpoint="1120"] { display: block !important; } #primary-navigation { max-height: calc(100vh - 4.5rem) !important; max-height: calc(100dvh - 4.5rem - env(safe-area-inset-top, 0px)) !important; overflow-y: auto !important; overflow-x: hidden !important; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; padding-bottom: calc(3.25rem + env(safe-area-inset-bottom, 0px)) !important; } }',
      '@media (max-width: 767.98px) { body.rs-has-md-nav .rs-network-bar { display: none !important; } .rs-mobile-network-section[data-rs-breakpoint="768"] { display: block !important; } #header-navigation-panel, #navbarCollapse, #music-mobile-navigation, .rs-standalone-network-bar.is-open .rs-network-links { max-height: calc(100vh - 4.5rem) !important; max-height: calc(100dvh - 4.5rem - env(safe-area-inset-top, 0px)) !important; overflow-y: auto !important; overflow-x: hidden !important; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; padding-bottom: calc(3.25rem + env(safe-area-inset-bottom, 0px)) !important; } .rs-standalone-network-bar { position: sticky !important; top: 0 !important; z-index: 1055 !important; } .rs-standalone-network-bar .rs-network-mobile-toggle { display: inline-flex !important; } .rs-standalone-network-bar .rs-network-links { display: none !important; width: 100%; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.4rem; padding-top: 0.5rem; margin-top: 0.35rem; border-top: 1px solid rgba(148, 163, 184, 0.28); } .rs-standalone-network-bar.is-open .rs-network-links { display: grid !important; } .rs-standalone-network-bar .rs-network-links > li > a, .rs-standalone-network-bar .rs-network-dropdown-toggle { width: 100% !important; min-height: 38px; padding: 0.4rem 0.6rem !important; background-color: rgba(30, 41, 59, 0.75) !important; border-color: rgba(148, 163, 184, 0.3) !important; justify-content: flex-start; } .rs-standalone-network-bar .rs-network-dropdown { display: flex !important; flex-direction: column; align-items: stretch; } .rs-standalone-network-bar .rs-network-dropdown.is-open { grid-column: 1 / -1; } .rs-standalone-network-bar .rs-network-dropdown-menu { position: static !important; width: 100% !important; margin-top: 0.35rem !important; box-shadow: none !important; } }',
      '.rs-mobile-network-section[data-rs-breakpoint="always"] { display: block !important; }',
      '.rs-memoriam-bar { width: 100%; background: linear-gradient(90deg, #040711 0%, #0b132b 50%, #040711 100%) !important; color: #f8fafc !important; border-bottom: 1px solid rgba(251, 191, 36, 0.45) !important; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 0.78rem; line-height: 1.45; z-index: 1054; position: relative; }',
      'html[data-bs-theme="light"] .rs-memoriam-bar, html[data-theme="light"] .rs-memoriam-bar, html[data-color-scheme="light"] .rs-memoriam-bar { background: linear-gradient(90deg, #0b1120 0%, #172554 50%, #0b1120 100%) !important; color: #f8fafc !important; border-bottom: 1px solid #d97706 !important; }',
      '.rs-memoriam-inner { max-width: 1360px; margin: 0 auto; padding: 0.42rem 1rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.4rem 1rem; }',
      '.rs-memoriam-text { margin: 0 !important; padding: 0 !important; color: #f1f5f9 !important; font-size: 0.78rem; line-height: 1.45; text-wrap: pretty; }',
      '.rs-memoriam-star { color: #fbbf24 !important; margin-right: 0.35rem; font-size: 0.85rem; }',
      '.rs-memoriam-label { color: #fde68a !important; font-weight: 700; letter-spacing: 0.02em; }',
      '.rs-memoriam-sep { color: #94a3b8 !important; margin: 0 0.35rem; }',
      '.rs-memoriam-quote { color: #e2e8f0 !important; }',
      '.rs-memoriam-link { display: inline-flex; align-items: center; gap: 0.3rem; min-block-size: 26px; padding: 0.2rem 0.65rem; border-radius: 999px; background-color: rgba(251, 191, 36, 0.14) !important; color: #fde68a !important; border: 1px solid rgba(251, 191, 36, 0.55) !important; font-size: 0.74rem; font-weight: 700; text-decoration: none !important; white-space: nowrap; transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease; }',
      '.rs-memoriam-link:hover, .rs-memoriam-link:focus-visible { background-color: #fbbf24 !important; color: #090d16 !important; border-color: #fbbf24 !important; }',
      '.rs-memoriam-link:focus-visible { outline: 3px solid #38bdf8 !important; outline-offset: 2px !important; }',
      '@media (max-width: 767.98px) { .rs-memoriam-inner { flex-direction: column; align-items: flex-start; gap: 0.35rem; padding: 0.5rem 0.85rem; } }',
      '.rs-holiday-bar { width: 100%; background: linear-gradient(90deg, #071e16 0%, #143d2b 35%, #4a121b 72%, #071e16 100%) !important; color: #f8fafc !important; border-bottom: 1px solid rgba(251, 191, 36, 0.55) !important; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 0.78rem; line-height: 1.45; z-index: 1054; position: relative; }',
      'html[data-bs-theme="light"] .rs-holiday-bar, html[data-theme="light"] .rs-holiday-bar, html[data-color-scheme="light"] .rs-holiday-bar, html.light .rs-holiday-bar { background: linear-gradient(90deg, #0b291e 0%, #164e35 38%, #5c1622 75%, #0b291e 100%) !important; color: #f8fafc !important; border-bottom: 1px solid #b45309 !important; }',
      '.rs-holiday-inner { max-width: 1360px; margin: 0 auto; padding: 0.42rem 1rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.45rem 1rem; }',
      '.rs-holiday-text { margin: 0 !important; padding: 0 !important; color: #f8fafc !important; font-size: 0.78rem; line-height: 1.45; text-wrap: pretty; }',
      '.rs-holiday-icon { margin-right: 0.35rem; font-size: 0.88rem; }',
      '.rs-holiday-label { color: #fde68a !important; font-weight: 700; letter-spacing: 0.02em; }',
      '.rs-holiday-sep { color: #cbd5e1 !important; margin: 0 0.35rem; }',
      '.rs-holiday-message { color: #f1f5f9 !important; }',
      '.rs-holiday-actions { display: inline-flex; align-items: center; flex-wrap: wrap; gap: 0.45rem; }',
      '.rs-holiday-link, .rs-holiday-snow-btn { display: inline-flex; align-items: center; gap: 0.3rem; min-block-size: 28px; padding: 0.22rem 0.7rem; border-radius: 999px; font-family: inherit; font-size: 0.74rem; font-weight: 700; line-height: 1.2; text-decoration: none !important; white-space: nowrap; cursor: pointer; transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease; }',
      '.rs-holiday-link { background-color: rgba(251, 191, 36, 0.16) !important; color: #fde68a !important; border: 1px solid rgba(251, 191, 36, 0.65) !important; }',
      '.rs-holiday-link:hover, .rs-holiday-link:focus-visible { background-color: #fbbf24 !important; color: #090d16 !important; border-color: #fbbf24 !important; }',
      '.rs-holiday-snow-btn { background-color: rgba(15, 23, 42, 0.72) !important; color: #f8fafc !important; border: 1px solid rgba(226, 232, 240, 0.55) !important; }',
      '.rs-holiday-snow-btn:hover, .rs-holiday-snow-btn:focus-visible { background-color: #f8fafc !important; color: #090d16 !important; border-color: #f8fafc !important; }',
      '.rs-holiday-link:focus-visible, .rs-holiday-snow-btn:focus-visible { outline: 3px solid #38bdf8 !important; outline-offset: 2px !important; }',
      '@media (forced-colors: active) { .rs-holiday-bar, .rs-memoriam-bar { background: Canvas !important; color: CanvasText !important; border-bottom: 2px solid CanvasText !important; } .rs-holiday-link, .rs-holiday-snow-btn, .rs-memoriam-link { background: ButtonFace !important; color: ButtonText !important; border: 1px solid ButtonText !important; } .rs-snowfall-layer { display: none !important; } }',
      '@media (max-width: 767.98px) { .rs-holiday-inner { flex-direction: column; align-items: flex-start; gap: 0.4rem; padding: 0.5rem 0.85rem; } }',
      '.rs-snowfall-layer { position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none !important; user-select: none !important; overflow: hidden; z-index: 9990; contain: strict; }',
      '.rs-snowflake { position: absolute; top: 0; left: var(--rs-flake-x, 50%); width: var(--rs-flake-size, 6px); height: var(--rs-flake-size, 6px); border-radius: 50%; background: radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(224, 242, 254, 0.72) 65%, rgba(224, 242, 254, 0) 100%); box-shadow: 0 0 4px rgba(15, 23, 42, 0.28); opacity: var(--rs-flake-alpha, 0.72); transform: translate3d(0, -12vh, 0); will-change: transform, opacity; animation: rs-snow-fall var(--rs-flake-dur, 14s) linear var(--rs-flake-delay, 0s) infinite; }',
      'html[data-bs-theme="light"] .rs-snowflake, html[data-theme="light"] .rs-snowflake, html[data-color-scheme="light"] .rs-snowflake, html.light .rs-snowflake { background: radial-gradient(circle, rgba(255, 255, 255, 0.98) 0%, rgba(186, 230, 253, 0.92) 62%, rgba(56, 189, 248, 0.25) 100%); box-shadow: 0 0 4px rgba(14, 116, 144, 0.35); }',
      '@keyframes rs-snow-fall { 0% { transform: translate3d(0, -12vh, 0); opacity: 0; } 10% { opacity: var(--rs-flake-alpha, 0.72); } 50% { transform: translate3d(var(--rs-flake-drift, 18px), 50vh, 0); } 90% { opacity: var(--rs-flake-alpha, 0.72); } 100% { transform: translate3d(calc(var(--rs-flake-drift, 18px) * -0.6), 108vh, 0); opacity: 0; } }',
      'html.rs-snow-paused .rs-snowfall-layer, html:not(.rs-holiday-season) .rs-snowfall-layer { display: none !important; }',
      'html.rs-tab-hidden .rs-snowflake { animation-play-state: paused !important; }',
      '@media (prefers-reduced-motion: reduce) { .rs-holiday-link, .rs-holiday-snow-btn { transition: none !important; } html:not(.rs-snow-force-play) .rs-snowfall-layer { display: none !important; } html:not(.rs-snow-force-play) .rs-snowflake { animation: none !important; } }',
      'html[data-bs-theme="dark"] .btn-ghost:not(.btn-primary):not(.btn-warning):not(.btn-info):not(.btn-success):not(.btn-danger) { color: #f1f5f9 !important; }',
      'html[data-bs-theme="light"] .btn-ghost:not(.btn-primary):not(.btn-warning):not(.btn-info):not(.btn-success):not(.btn-danger) { color: #0f172a !important; }',
      '[data-bs-theme="dark"] .btn-outline-light, [data-theme="dark"] .btn-outline-light, .memoriam-hero .btn-outline-light { color: #ffffff !important; background-color: rgba(15, 23, 42, 0.88) !important; border: 1.5px solid rgba(248, 250, 252, 0.85) !important; }',
      '[data-bs-theme="dark"] .btn-outline-light:hover, [data-bs-theme="dark"] .btn-outline-light:focus-visible, [data-theme="dark"] .btn-outline-light:hover, [data-theme="dark"] .btn-outline-light:focus-visible, .memoriam-hero .btn-outline-light:hover, .memoriam-hero .btn-outline-light:focus-visible { color: #090d16 !important; background-color: #ffffff !important; border-color: #ffffff !important; }',
      '.rs-network-links > li > a.rs-network-memoriam-pill { background-color: rgba(251, 191, 36, 0.14) !important; color: #fde68a !important; border: 1px solid rgba(251, 191, 36, 0.55) !important; font-weight: 700; }',
      '.rs-network-links > li > a.rs-network-memoriam-pill:hover, .rs-network-links > li > a.rs-network-memoriam-pill:focus-visible { background-color: #fbbf24 !important; color: #090d16 !important; border-color: #fbbf24 !important; }',
      '@media print { .rs-memoriam-bar, .rs-holiday-bar, .rs-snowfall-layer, .rs-network-bar, .rs-mobile-network-section { display: none !important; } }',
      '@media (display-mode: standalone), (display-mode: window-controls-overlay), (display-mode: minimal-ui), (display-mode: fullscreen) { .rs-memoriam-bar, .rs-holiday-bar, .rs-network-bar, .rs-mobile-network-section { display: none !important; } }',
      'html.is-pwa-standalone .rs-memoriam-bar, html.is-pwa-standalone .rs-holiday-bar, html.is-pwa-standalone .rs-network-bar, html.is-pwa-standalone .rs-mobile-network-section, body.is-pwa-standalone .rs-memoriam-bar, body.is-pwa-standalone .rs-holiday-bar, body.is-pwa-standalone .rs-network-bar, body.is-pwa-standalone .rs-mobile-network-section { display: none !important; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  /**
   * ==========================================================================
   * SECTION 2: DESKTOP OMNIBAR HTML BUILDERS & ACCESSIBLE DROPDOWN ENGINE
   * ==========================================================================
   * Accessibility Anatomy of Every Dropdown Built Below:
   *   - `<button type="button" aria-expanded="false" aria-controls="rs-dropdown-...">`:
   *     Tells screen readers this button expands a specific `<ul>` menu by ID.
   *   - `<span aria-hidden="true">📚</span>`: Hides decorative emoji icons from
   *     screen readers so VoiceOver doesn't announce `"Open Book Ocean View Black Down-Pointing Small Triangle"`.
   *   - `aria-current="page"`: Standard WAI-ARIA attribute marking the currently active URL.
   *   - `data-no-spa="true"`: Tells local SPA routers not to hijack cross-domain links.
   *
   * 1. Builds the HTML for the `📚 Ocean View ▾` dropdown `<li>` item on `.rs-network-bar`.
   */
  function buildOceanViewDropdownLiHtml(currentHost, currentPath) {
    var isOceanViewGroupActive =
      currentHost === 'books.raggiesoft.com' ||
      currentHost === 'crossroads.raggiesoft.com' ||
      currentHost === 'cedarrun.raggiesoft.com' ||
      currentHost === 'backstage.raggiesoft.com';
    var isImprintHomeActive =
      currentHost === 'books.raggiesoft.com' &&
      (currentPath === '/' || currentPath === '/home');
    var isBackstageActive = currentHost === 'backstage.raggiesoft.com';

    var universesHtml = OCEAN_VIEW_ITEMS.map(function (item) {
      var active = isOceanViewItemActive(item, currentHost, currentPath);
      return (
        '<li>' +
        '<a href="' + item.href + '"' +
        (active ? ' class="is-active" aria-current="page"' : '') +
        ' data-no-spa="true">' +
        '<span aria-hidden="true">' + item.icon + '</span>' +
        '<span>' + item.name + '</span>' +
        '</a>' +
        '</li>'
      );
    }).join('');

    return (
      '<li class="rs-network-dropdown" data-rs-dropdown="oceanview">' +
      '<button type="button" class="rs-network-dropdown-toggle' +
      (isOceanViewGroupActive ? ' is-active' : '') +
      '" aria-expanded="false" aria-controls="rs-dropdown-oceanview">' +
      '<span aria-hidden="true">📚</span>' +
      '<span>Ocean View</span>' +
      '<span class="rs-network-caret" aria-hidden="true">▾</span>' +
      '</button>' +
      '<ul id="rs-dropdown-oceanview" class="rs-network-dropdown-menu" aria-label="Ocean View Archives & Literary Universes">' +
      '<li>' +
      '<a href="https://books.raggiesoft.com"' +
      (isImprintHomeActive ? ' class="is-active" aria-current="page"' : '') +
      ' data-no-spa="true">' +
      '<span aria-hidden="true">📚</span>' +
      '<span>Ocean View Archives Hub</span>' +
      '</a>' +
      '</li>' +
      '<li>' +
      '<a href="https://backstage.raggiesoft.com"' +
      (isBackstageActive ? ' class="is-active" aria-current="page"' : '') +
      ' data-no-spa="true">' +
      '<span aria-hidden="true">🎬</span>' +
      '<span>Backstage &amp; Bonus Features</span>' +
      '</a>' +
      '</li>' +
      '<li class="rs-network-dropdown-divider" aria-hidden="true"></li>' +
      '<li class="rs-network-dropdown-header" aria-hidden="true">✦ Flagship Literary Universes</li>' +
      universesHtml +
      '</ul>' +
      '</li>'
    );
  }

  /**
   * 2. Builds the HTML for the `⚙️ Engine Room ▾` dropdown `<li>` item on `.rs-network-bar`.
   */
  function buildEngineRoomDropdownLiHtml(currentHost, currentPath) {
    var isEngineRoomGroupActive =
      currentHost === 'engineroom.raggiesoft.com' ||
      currentHost === 'stardust.raggiesoft.com' ||
      currentHost === 'music.raggiesoft.com';
    var isImprintHomeActive =
      currentHost === 'engineroom.raggiesoft.com' &&
      currentPath.indexOf('/artists') !== 0;
    var isListeningRoomActive = currentHost === 'music.raggiesoft.com';
    var isArtistsDirActive =
      currentHost === 'engineroom.raggiesoft.com' && currentPath === '/artists';

    var bandsHtml = ENGINE_ROOM_BANDS.map(function (band) {
      var active = isBandActive(band, currentHost, currentPath);
      return (
        '<li>' +
        '<a href="' + band.href + '"' +
        (active ? ' class="is-active" aria-current="page"' : '') +
        ' data-no-spa="true">' +
        '<span aria-hidden="true">' + band.icon + '</span>' +
        '<span>' + band.name + '</span>' +
        '</a>' +
        '</li>'
      );
    }).join('');

    return (
      '<li class="rs-network-dropdown" data-rs-dropdown="engineroom">' +
      '<button type="button" class="rs-network-dropdown-toggle' +
      (isEngineRoomGroupActive ? ' is-active' : '') +
      '" aria-expanded="false" aria-controls="rs-dropdown-engineroom">' +
      '<span aria-hidden="true">⚙️</span>' +
      '<span>Engine Room</span>' +
      '<span class="rs-network-caret" aria-hidden="true">▾</span>' +
      '</button>' +
      '<ul id="rs-dropdown-engineroom" class="rs-network-dropdown-menu" aria-label="Engine Room Records & Band Roster">' +
      '<li>' +
      '<a href="https://engineroom.raggiesoft.com"' +
      (isImprintHomeActive ? ' class="is-active" aria-current="page"' : '') +
      ' data-no-spa="true">' +
      '<span aria-hidden="true">⚙️</span>' +
      '<span>Engine Room Records Hub</span>' +
      '</a>' +
      '</li>' +
      '<li>' +
      '<a href="https://music.raggiesoft.com"' +
      (isListeningRoomActive ? ' class="is-active" aria-current="page"' : '') +
      ' data-no-spa="true">' +
      '<span aria-hidden="true">🎧</span>' +
      '<span>The Listening Room</span>' +
      '</a>' +
      '</li>' +
      '<li>' +
      '<a href="https://engineroom.raggiesoft.com/artists"' +
      (isArtistsDirActive ? ' class="is-active" aria-current="page"' : '') +
      ' data-no-spa="true">' +
      '<span aria-hidden="true">🎸</span>' +
      '<span>All Artists Directory (7)</span>' +
      '</a>' +
      '</li>' +
      '<li class="rs-network-dropdown-divider" aria-hidden="true"></li>' +
      '<li class="rs-network-dropdown-header" aria-hidden="true">✦ Band Roster (A–Z)</li>' +
      bandsHtml +
      '</ul>' +
      '</li>'
    );
  }

  /**
   * 3. Builds the HTML for the `👔 Portfolio & Resume ▾` dropdown `<li>` item on `.rs-network-bar`.
   */
  function buildPortfolioDropdownLiHtml(currentHost, currentPath) {
    var isPortfolioGroupActive = currentHost === 'michaelpragsdale.com';
    var isDossierHomeActive =
      currentHost === 'michaelpragsdale.com' &&
      currentPath.indexOf('/build-team') !== 0;
    var isBuildTeamOverviewActive =
      currentHost === 'michaelpragsdale.com' && currentPath === '/build-team';

    var membersHtml = BUILD_TEAM_MEMBERS.map(function (member) {
      var active = isBuildTeamMemberActive(member, currentHost, currentPath);
      return (
        '<li>' +
        '<a href="' + member.href + '"' +
        (active ? ' class="is-active" aria-current="page"' : '') +
        ' data-no-spa="true">' +
        '<span aria-hidden="true">' + member.icon + '</span>' +
        '<span>' + member.name + '</span>' +
        '</a>' +
        '</li>'
      );
    }).join('');

    return (
      '<li class="rs-network-dropdown" data-rs-dropdown="portfolio">' +
      '<button type="button" class="rs-network-dropdown-toggle' +
      (isPortfolioGroupActive ? ' is-active' : '') +
      '" aria-expanded="false" aria-controls="rs-dropdown-portfolio">' +
      '<span aria-hidden="true">👔</span>' +
      '<span>Portfolio &amp; Resume</span>' +
      '<span class="rs-network-caret" aria-hidden="true">▾</span>' +
      '</button>' +
      '<ul id="rs-dropdown-portfolio" class="rs-network-dropdown-menu" aria-label="Michael P. Ragsdale Portfolio, Resume & Build Suite">' +
      '<li>' +
      '<a href="https://michaelpragsdale.com"' +
      (isDossierHomeActive ? ' class="is-active" aria-current="page"' : '') +
      ' data-no-spa="true">' +
      '<span aria-hidden="true">👔</span>' +
      '<span>Engineering Portfolio (Michael P. Ragsdale)</span>' +
      '</a>' +
      '</li>' +
      '<li>' +
      '<a href="https://assets.raggiesoft.com/portfolio/documents/resume/mragsdale-resume.pdf" target="_blank" rel="noopener" data-no-spa="true">' +
      '<span aria-hidden="true">📄</span>' +
      '<span>Download Resume (PDF)</span>' +
      '</a>' +
      '</li>' +
      '<li>' +
      '<a href="https://michaelpragsdale.com/build-team"' +
      (isBuildTeamOverviewActive ? ' class="is-active" aria-current="page"' : '') +
      ' data-no-spa="true">' +
      '<span aria-hidden="true">⚙️</span>' +
      '<span>CI/CD &amp; Build Suite Overview</span>' +
      '</a>' +
      '</li>' +
      '<li class="rs-network-dropdown-divider" aria-hidden="true"></li>' +
      '<li class="rs-network-dropdown-header" aria-hidden="true">✦ Build &amp; Deployment Scripts</li>' +
      membersHtml +
      '</ul>' +
      '</li>'
    );
  }

  /**
   * Builds the complete canonical `<ul>` innerHTML for `.rs-network-links`.
   */
  function buildDesktopNetworkLinksHtml(currentHost, currentPath) {
    var isHubActive = currentHost === 'raggiesoft.com' && currentPath !== '/in-memoriam' && currentPath !== '/about/in-memoriam';
    var isMemoriamPage = currentHost === 'raggiesoft.com' && (currentPath === '/in-memoriam' || currentPath === '/about/in-memoriam');
    var isNebulaeActive = currentHost === 'nebulae.raggiesoft.com';
    var isCorporateActive = currentHost === 'corporate.raggiesoft.com';
    var isStoreTrainerActive = currentHost === 'storetrainer.raggiesoft.com';

    var links = [
      '<li><a href="https://raggiesoft.com"' +
        (isHubActive ? ' aria-current="page" class="is-active"' : '') +
        ' data-no-spa="true">🌐 Hub</a></li>',
      '<li><a href="https://nebulae.raggiesoft.com"' +
        (isNebulaeActive ? ' aria-current="page" class="is-active"' : '') +
        ' data-no-spa="true">🌌 Nebulae</a></li>',
      buildOceanViewDropdownLiHtml(currentHost, currentPath),
      buildEngineRoomDropdownLiHtml(currentHost, currentPath),
      '<li><a href="https://corporate.raggiesoft.com"' +
        (isCorporateActive ? ' aria-current="page" class="is-active"' : '') +
        ' data-no-spa="true">🏢 Corporate</a></li>',
      '<li><a href="https://storetrainer.raggiesoft.com"' +
        (isStoreTrainerActive ? ' aria-current="page" class="is-active"' : '') +
        ' data-no-spa="true">💾 StoreTrainer</a></li>',
      buildPortfolioDropdownLiHtml(currentHost, currentPath)
    ];

    if (isMemoriamActive()) {
      var memoriamHref = currentHost === 'raggiesoft.com' ? '/in-memoriam' : 'https://raggiesoft.com/in-memoriam';
      links.push(
        '<li><a href="' +
          memoriamHref +
          '" class="rs-network-memoriam-pill' +
          (isMemoriamPage ? ' is-active' : '') +
          '"' +
          (isMemoriamPage ? ' aria-current="page"' : '') +
          ' data-no-spa="true">✦ In Memoriam</a></li>'
      );
    }

    return links.join('');
  }

  /**
   * ==========================================================================
   * SECTION 3: GLOBAL DELEGATED DROPDOWN CONTROLLER (`ensureGlobalDropdownDelegation`)
   * ==========================================================================
   * Why manage all 3 desktop dropdowns (`📚 Ocean View ▾`, `⚙️ Engine Room ▾`,
   * `👔 Portfolio & Resume ▾`) from ONE set of document-level listeners?
   *   1. Mutual Exclusion: Opening `Engine Room` automatically closes `Ocean View`!
   *   2. SPA Resilience: Even when `upgradeDesktopNetworkBar()` rebuilds `linksList.innerHTML`
   *      after a route change, `document` listeners keep working with zero re-binding!
   *   3. Dual Pointer + Keyboard Accessibility:
   *      - Mouse hover opens on `pointerover`/`mousemove` with a 220ms close grace timer
   *        so diagonal mouse movement from button -> menu never snaps shut prematurely.
   *      - Clicking pins the menu open (`dropdownPinnedByClick = true`) for touch/trackpad/keyboard.
   *      - `Tab`bing past the last menu link triggers `focusout` (`!openLi.contains(related)`) and closes it cleanly.
   *      - Pressing `Escape` closes the open menu AND restores `.focus()` back to its toggle `<button>`!
   */
  var dropdownCloseTimer = null;
  var dropdownPinnedByClick = false;

  /* Closes every `.rs-network-dropdown` and resets `aria-expanded="false"` on its toggle button. */
  function closeAllDropdowns() {
    var allDropdowns = document.querySelectorAll('.rs-network-dropdown');
    for (var i = 0; i < allDropdowns.length; i++) {
      allDropdowns[i].classList.remove('is-open');
      var btn = allDropdowns[i].querySelector('.rs-network-dropdown-toggle');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
  }

  /* Opens `targetDropdownLi` (`aria-expanded="true"`) while closing all sibling dropdowns (`aria-expanded="false"`). */
  function openSingleDropdown(targetDropdownLi) {
    if (!targetDropdownLi) return;
    var allDropdowns = document.querySelectorAll('.rs-network-dropdown');
    for (var i = 0; i < allDropdowns.length; i++) {
      var li = allDropdowns[i];
      var btn = li.querySelector('.rs-network-dropdown-toggle');
      if (li === targetDropdownLi) {
        li.classList.add('is-open');
        if (btn) btn.setAttribute('aria-expanded', 'true');
      } else {
        li.classList.remove('is-open');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    }
  }

  function ensureGlobalDropdownDelegation() {
    /* Singleton guard on `window` so we attach these 5 `document` listeners at most ONCE per tab. */
    if (window.__rsNetworkDropdownBound) return;
    window.__rsNetworkDropdownBound = true;

    /* 1. HOVER ENTER (`pointerover`): Ignores touch taps (`e.pointerType === 'touch'`) so
     *    mobile taps go exclusively through the `click` handler below instead of double-firing. */
    document.addEventListener('pointerover', function (e) {
      if (e.pointerType === 'touch') return;
      try {
        if (window.matchMedia && !window.matchMedia('(hover: hover)').matches) return;
      } catch (err) {}
      var target = e.target;
      if (!target || typeof target.closest !== 'function') return;
      var hoveredDropdown = target.closest('.rs-network-dropdown');
      if (hoveredDropdown) {
        if (dropdownCloseTimer) {
          clearTimeout(dropdownCloseTimer);
          dropdownCloseTimer = null;
        }
        if (!dropdownPinnedByClick) {
          openSingleDropdown(hoveredDropdown);
        }
      }
    });

    /* 2. HOVER GRACE PERIOD (`mousemove`): Starts a 220ms `setTimeout` when the mouse leaves
     *    `.rs-network-dropdown` (unless pinned open by a click). If the cursor re-enters the
     *    menu within 220ms, `clearTimeout` cancels the close! */
    document.addEventListener('mousemove', function (e) {
      try {
        if (window.matchMedia && !window.matchMedia('(hover: hover)').matches) return;
      } catch (err) {}
      var target = e.target;
      if (!target || typeof target.closest !== 'function') return;
      var hoveredDropdown = target.closest('.rs-network-dropdown');
      if (hoveredDropdown) {
        if (dropdownCloseTimer) {
          clearTimeout(dropdownCloseTimer);
          dropdownCloseTimer = null;
        }
        if (!dropdownPinnedByClick) {
          openSingleDropdown(hoveredDropdown);
        }
      } else if (!dropdownPinnedByClick) {
        var openLi = document.querySelector('.rs-network-dropdown.is-open');
        if (openLi && !dropdownCloseTimer) {
          dropdownCloseTimer = setTimeout(function () {
            dropdownCloseTimer = null;
            if (!dropdownPinnedByClick) {
              closeAllDropdowns();
            }
          }, 220);
        }
      }
    });

    /* 3. KEYBOARD TAB EXIT (`focusout`): `e.relatedTarget` is the NEW element receiving focus
     *    when the user presses `Tab` or `Shift+Tab`. Once focus leaves `openLi`, close the menu! */
    document.addEventListener('focusout', function (e) {
      var related = e.relatedTarget;
      if (!related) return;
      var openLi = document.querySelector('.rs-network-dropdown.is-open');
      if (openLi && !openLi.contains(related)) {
        dropdownPinnedByClick = false;
        closeAllDropdowns();
      }
    });

    /* 4. CLICK PINNING & OUTSIDE-CLICK DISMISSAL (`click`):
     *    - Clicking a `.rs-network-dropdown-toggle` pins that dropdown open (or closes it if already pinned).
     *    - Clicking a destination link inside the menu or clicking anywhere outside closes all dropdowns. */
    document.addEventListener('click', function (e) {
      var target = e.target;
      if (!target || typeof target.closest !== 'function') return;
      var toggleBtn = target.closest('.rs-network-dropdown-toggle');
      var clickedDropdown = target.closest('.rs-network-dropdown');

      if (toggleBtn && clickedDropdown) {
        e.stopPropagation();
        if (dropdownCloseTimer) {
          clearTimeout(dropdownCloseTimer);
          dropdownCloseTimer = null;
        }
        if (clickedDropdown.classList.contains('is-open') && dropdownPinnedByClick) {
          dropdownPinnedByClick = false;
          closeAllDropdowns();
        } else {
          dropdownPinnedByClick = true;
          openSingleDropdown(clickedDropdown);
        }
        return;
      }

      /* Clicking any menu link or clicking outside closes all dropdowns */
      if (document.querySelector('.rs-network-dropdown.is-open')) {
        dropdownPinnedByClick = false;
        closeAllDropdowns();
      }
    });

    /* 5. KEYBOARD `Escape` DISMISSAL (`keydown`):
     *    WAI-ARIA Menu Button Pattern: Pressing `Escape` closes the open submenu AND
     *    returns keyboard focus (`toggleBtn.focus()`) to the button that opened it! */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var openLi = document.querySelector('.rs-network-dropdown.is-open');
        if (openLi) {
          var toggleBtn = openLi.querySelector('.rs-network-dropdown-toggle');
          dropdownPinnedByClick = false;
          closeAllDropdowns();
          if (toggleBtn) toggleBtn.focus();
        }
      }
    });
  }

  /**
   * Normalizes and upgrades `.rs-network-bar` on any property:
   *   - Adds missing `.rs-network-bar-inner`, `.rs-network-label`, and `.rs-network-links` classes
   *     (`:scope > div` selects ONLY direct children of `bar`, never deeper nested `<div>`s!).
   *   - Stamps `data-rs-state="<host>::<path>"` on `<ul>` so repeated calls on the exact
   *     same route are fast no-ops, while SPA route changes rebuild active `aria-current` highlights!
   */
  function upgradeDesktopNetworkBar() {
    ensureGlobalDropdownDelegation();

    var bar = document.querySelector('.rs-network-bar');
    if (!bar) return;

    var innerDiv = bar.querySelector('.rs-network-bar-inner') || bar.querySelector(':scope > div');
    if (innerDiv && !innerDiv.classList.contains('rs-network-bar-inner')) {
      innerDiv.classList.add('rs-network-bar-inner');
    }

    var labelSpan = bar.querySelector('.rs-network-label') || (innerDiv ? innerDiv.querySelector(':scope > span') : null);
    if (labelSpan && !labelSpan.classList.contains('rs-network-label')) {
      labelSpan.classList.add('rs-network-label');
    }

    var linksList = bar.querySelector('.rs-network-links') || bar.querySelector('ul');
    if (!linksList) return;
    if (!linksList.classList.contains('rs-network-links')) {
      linksList.classList.add('rs-network-links');
    }

    var currentHost = getCurrentHost();
    var currentPath = getCurrentPathname();
    var stateKey = currentHost + '::' + currentPath;

    var dropdownCount = linksList.querySelectorAll(':scope > li.rs-network-dropdown').length;
    if (dropdownCount < 3 || linksList.getAttribute('data-rs-state') !== stateKey) {
      linksList.setAttribute('data-rs-upgraded', 'true');
      linksList.setAttribute('data-rs-state', stateKey);
      linksList.innerHTML = buildDesktopNetworkLinksHtml(currentHost, currentPath);
    }
  }

  /* ==========================================================================
   * SECTION 4: MOBILE SINGLE-HAMBURGER GRID & ACCORDION INJECTOR
   * ==========================================================================
   * On mobile/tablet screens, we inject `.rs-mobile-network-section` directly
   * inside each site's existing mobile drawer.
   * `ensureMobileAccordionBehavior()` attaches ONE delegated click listener that:
   *   1. Toggles `aria-expanded` (`"true"` <-> `"false"`) and `body.hidden` (`false` <-> `true`)
   *      on the clicked `.rs-mobile-submenu` accordion.
   *   2. Automatically collapses sibling accordions so the mobile menu stays compact!
   */
  var mobileAccordionListenerAttached = false;
  var mobileSubmenuSeq = 0;

  function ensureMobileAccordionBehavior() {
    if (mobileAccordionListenerAttached || typeof document === 'undefined') return;
    mobileAccordionListenerAttached = true;

    document.addEventListener('click', function (event) {
      var target = event.target;
      if (!target || typeof target.closest !== 'function') return;
      var btn = target.closest('button.rs-mobile-submenu-summary');
      if (!btn) return;
      var submenu = btn.closest('.rs-mobile-submenu');
      if (!submenu) return;
      var body = submenu.querySelector('.rs-mobile-submenu-body');
      if (!body) return;

      var willOpen = btn.getAttribute('aria-expanded') !== 'true';
      var parent = submenu.parentElement;
      /* Accordion mutual exclusion: close any open sibling `.rs-mobile-submenu` first. */
      if (willOpen && parent) {
        var siblings = parent.querySelectorAll('.rs-mobile-submenu');
        for (var i = 0; i < siblings.length; i++) {
          if (siblings[i] !== submenu) {
            siblings[i].classList.remove('is-open');
            var sibBtn = siblings[i].querySelector('button.rs-mobile-submenu-summary');
            var sibBody = siblings[i].querySelector('.rs-mobile-submenu-body');
            if (sibBtn) sibBtn.setAttribute('aria-expanded', 'false');
            if (sibBody) sibBody.hidden = true;
          }
        }
      }

      submenu.classList.toggle('is-open', willOpen);
      btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      body.hidden = !willOpen;
    });
  }

  /**
   * Builds the HTML for `.rs-mobile-network-section` (top 2-column property grid +
   * 3 collapsible sub-menu accordions with unique `uid` IDs for `aria-controls`).
   */
  function buildMobileGridHtml(breakpointAttr) {
    var currentHost = getCurrentHost();
    var currentPath = getCurrentPathname();
    mobileSubmenuSeq += 1;
    var uid = String(mobileSubmenuSeq);

    var itemsHtml = NETWORK_SITES.map(function (site) {
      var isActive = currentHost === site.host;
      return (
        '<li>' +
        '<a href="' + site.href + '" class="rs-mobile-network-link' + (isActive ? ' is-active' : '') + '"' +
        (isActive ? ' aria-current="page"' : '') +
        ' data-no-spa="true">' +
        '<span class="rs-mobile-network-icon" aria-hidden="true">' + site.icon + '</span>' +
        '<span class="rs-mobile-network-text">' + site.label + '</span>' +
        '</a>' +
        '</li>'
      );
    }).join('');

    var oceanViewHtml = OCEAN_VIEW_ITEMS.map(function (item) {
      var active = isOceanViewItemActive(item, currentHost, currentPath);
      return (
        '<li>' +
        '<a href="' + item.href + '" class="rs-mobile-network-link' + (active ? ' is-active' : '') + '"' +
        (active ? ' aria-current="page"' : '') +
        ' data-no-spa="true">' +
        '<span class="rs-mobile-network-icon" aria-hidden="true">' + item.icon + '</span>' +
        '<span class="rs-mobile-network-text">' + item.name + '</span>' +
        '</a>' +
        '</li>'
      );
    }).join('');

    var isListeningRoomActive = currentHost === 'music.raggiesoft.com';
    var listeningRoomMobileItem =
      '<li>' +
      '<a href="https://music.raggiesoft.com" class="rs-mobile-network-link' + (isListeningRoomActive ? ' is-active' : '') + '"' +
      (isListeningRoomActive ? ' aria-current="page"' : '') +
      ' data-no-spa="true">' +
      '<span class="rs-mobile-network-icon" aria-hidden="true">🎧</span>' +
      '<span class="rs-mobile-network-text">The Listening Room</span>' +
      '</a>' +
      '</li>';

    var isEngineRoomHubActive =
      currentHost === 'engineroom.raggiesoft.com' &&
      (currentPath === '/' || currentPath === '/index.html');
    var engineRoomHubMobileItem =
      '<li>' +
      '<a href="https://engineroom.raggiesoft.com" class="rs-mobile-network-link' + (isEngineRoomHubActive ? ' is-active' : '') + '"' +
      (isEngineRoomHubActive ? ' aria-current="page"' : '') +
      ' data-no-spa="true">' +
      '<span class="rs-mobile-network-icon" aria-hidden="true">⚙️</span>' +
      '<span class="rs-mobile-network-text">Engine Room Hub</span>' +
      '</a>' +
      '</li>';

    var bandsHtml = ENGINE_ROOM_BANDS.map(function (band) {
      var active = isBandActive(band, currentHost, currentPath);
      return (
        '<li>' +
        '<a href="' + band.href + '" class="rs-mobile-network-link' + (active ? ' is-active' : '') + '"' +
        (active ? ' aria-current="page"' : '') +
        ' data-no-spa="true">' +
        '<span class="rs-mobile-network-icon" aria-hidden="true">' + band.icon + '</span>' +
        '<span class="rs-mobile-network-text">' + band.name + '</span>' +
        '</a>' +
        '</li>'
      );
    }).join('');

    var resumeMobileItem =
      '<li>' +
      '<a href="https://assets.raggiesoft.com/portfolio/documents/resume/mragsdale-resume.pdf" target="_blank" rel="noopener" class="rs-mobile-network-link" data-no-spa="true">' +
      '<span class="rs-mobile-network-icon" aria-hidden="true">📄</span>' +
      '<span class="rs-mobile-network-text">Resume (PDF)</span>' +
      '</a>' +
      '</li>';

    var isBuildTeamOverviewActive =
      currentHost === 'michaelpragsdale.com' && currentPath === '/build-team';
    var buildTeamOverviewItem =
      '<li>' +
      '<a href="https://michaelpragsdale.com/build-team" class="rs-mobile-network-link' + (isBuildTeamOverviewActive ? ' is-active' : '') + '"' +
      (isBuildTeamOverviewActive ? ' aria-current="page"' : '') +
      ' data-no-spa="true">' +
      '<span class="rs-mobile-network-icon" aria-hidden="true">⚙️</span>' +
      '<span class="rs-mobile-network-text">CI/CD Suite Overview</span>' +
      '</a>' +
      '</li>';

    var buildTeamHtml = BUILD_TEAM_MEMBERS.map(function (member) {
      var active = isBuildTeamMemberActive(member, currentHost, currentPath);
      return (
        '<li>' +
        '<a href="' + member.href + '" class="rs-mobile-network-link' + (active ? ' is-active' : '') + '"' +
        (active ? ' aria-current="page"' : '') +
        ' data-no-spa="true">' +
        '<span class="rs-mobile-network-icon" aria-hidden="true">' + member.icon + '</span>' +
        '<span class="rs-mobile-network-text">' + member.mobileLabel + '</span>' +
        '</a>' +
        '</li>'
      );
    }).join('');

    return (
      '<div class="rs-mobile-network-section" data-rs-breakpoint="' + breakpointAttr + '" role="region" aria-label="RaggieSoft Ecosystem Switcher">' +
      '<div class="rs-mobile-network-title">✦ Switch RaggieSoft Property</div>' +
      '<ul class="rs-mobile-network-grid">' +
      itemsHtml +
      '</ul>' +
      '<div class="rs-mobile-submenus">' +
      '<div class="rs-mobile-submenu">' +
      '<button type="button" class="rs-mobile-submenu-summary" aria-expanded="false" aria-controls="rs-mob-ocean-' + uid + '">' +
      '<span>📚 Ocean View Archives — Universes &amp; Lore</span>' +
      '<span class="rs-mobile-submenu-caret" aria-hidden="true">▾</span>' +
      '</button>' +
      '<div id="rs-mob-ocean-' + uid + '" class="rs-mobile-submenu-body" hidden>' +
      '<ul class="rs-mobile-network-grid">' +
      oceanViewHtml +
      '</ul>' +
      '</div>' +
      '</div>' +
      '<div class="rs-mobile-submenu">' +
      '<button type="button" class="rs-mobile-submenu-summary" aria-expanded="false" aria-controls="rs-mob-err-' + uid + '">' +
      '<span>⚙️ Engine Room Records — Bands (A–Z)</span>' +
      '<span class="rs-mobile-submenu-caret" aria-hidden="true">▾</span>' +
      '</button>' +
      '<div id="rs-mob-err-' + uid + '" class="rs-mobile-submenu-body" hidden>' +
      '<ul class="rs-mobile-network-grid">' +
      listeningRoomMobileItem +
      engineRoomHubMobileItem +
      bandsHtml +
      '</ul>' +
      '</div>' +
      '</div>' +
      '<div class="rs-mobile-submenu">' +
      '<button type="button" class="rs-mobile-submenu-summary" aria-expanded="false" aria-controls="rs-mob-port-' + uid + '">' +
      '<span>👔 Portfolio, Resume &amp; Build Scripts</span>' +
      '<span class="rs-mobile-submenu-caret" aria-hidden="true">▾</span>' +
      '</button>' +
      '<div id="rs-mob-port-' + uid + '" class="rs-mobile-submenu-body" hidden>' +
      '<ul class="rs-mobile-network-grid">' +
      resumeMobileItem +
      buildTeamOverviewItem +
      buildTeamHtml +
      '</ul>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>'
    );
  }

  /* Injects (or refreshes in-place) `.rs-mobile-network-section` at the bottom of `container`. */
  function injectIntoContainer(container, breakpointAttr) {
    if (!container) return false;
    ensureMobileAccordionBehavior();
    var existing = container.querySelector('.rs-mobile-network-section');
    if (existing) {
      existing.outerHTML = buildMobileGridHtml(breakpointAttr);
      return true;
    }
    container.insertAdjacentHTML('beforeend', buildMobileGridHtml(breakpointAttr));
    return true;
  }

  /**
   * Group C Fallback (`setupStandaloneNetworkBar`):
   * Used on full-screen app views (`books.raggiesoft.com` & `lore.raggiesoft.com`)
   * that don't have a traditional sitewide Bootstrap/DaisyUI navbar. Adds a compact
   * `<button class="rs-network-mobile-toggle">` right inside `.rs-network-bar` so
   * mobile readers can expand/collapse `.rs-network-links` on phones.
   */
  function setupStandaloneNetworkBar() {
    var bar = document.querySelector('.rs-network-bar');
    if (!bar) return;
    bar.classList.add('rs-standalone-network-bar');
    var inner = bar.querySelector('.rs-network-bar-inner');
    var linksList = bar.querySelector('.rs-network-links');
    if (!inner || !linksList) return;

    if (!inner.querySelector('.rs-network-mobile-toggle')) {
      if (!linksList.id) {
        linksList.id = 'rs-standalone-network-links';
      }
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'rs-network-mobile-toggle';
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', linksList.id);
      btn.setAttribute('aria-label', 'Toggle RaggieSoft Network menu');
      btn.innerHTML =
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
        '<line x1="3" y1="6" x2="21" y2="6"></line>' +
        '<line x1="3" y1="12" x2="21" y2="12"></line>' +
        '<line x1="3" y1="18" x2="21" y2="18"></line>' +
        '</svg>' +
        '<span>Network</span>';

      btn.addEventListener('click', function () {
        var isOpen = bar.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      inner.insertBefore(btn, linksList);
    }
  }

  /**
   * ==========================================================================
   * SECTION 5: AUTO-EXPIRING IN MEMORIAM RIBBON & HOLIDAY SNOWFALL ENGINE
   * ==========================================================================
   * `syncMemoriamRibbon()`:
   *   - If past `2026-11-28T23:59:59-05:00`, in Holiday Preview, or inside a standalone
   *     PWA, removes any `.rs-memoriam-bar` from the DOM immediately.
   *   - Otherwise creates/updates `.rs-memoriam-bar` and enforces exact vertical
   *     DOM order: `.rs-network-bar` first -> `.rs-memoriam-bar` second -> `<header>` third!
   */
  function syncMemoriamRibbon() {
    if (!document.body) return;
    var existingBars = document.querySelectorAll('.rs-memoriam-bar');

    if (!isMemoriamActive() || getHolidayPreviewOverride() === true || isStandalonePwa()) {
      for (var i = 0; i < existingBars.length; i++) {
        if (existingBars[i] && existingBars[i].parentNode) {
          existingBars[i].parentNode.removeChild(existingBars[i]);
        }
      }
      return;
    }

    var currentHost = getCurrentHost();
    var currentPath = getCurrentPathname();
    var isTributePage =
      currentHost === 'raggiesoft.com' &&
      (currentPath === '/in-memoriam' || currentPath === '/about/in-memoriam');
    var tributeHref =
      currentHost === 'raggiesoft.com' ? '/in-memoriam' : 'https://raggiesoft.com/in-memoriam';

    var innerHtml =
      '<div class="rs-memoriam-inner">' +
      '<p class="rs-memoriam-text">' +
      '<span class="rs-memoriam-star" aria-hidden="true">✦</span>' +
      '<strong class="rs-memoriam-label">In Memoriam: Sir Patrick Stewart (1940–2026)</strong>' +
      '<span class="rs-memoriam-sep" aria-hidden="true">—</span>' +
      '<span class="rs-memoriam-quote">&ldquo;Thank you for teaching a kid watching weeknight television with his family to look up at the cosmos and wonder what is out there. <em>Ad Astra.</em>&rdquo;</span>' +
      '</p>' +
      '<a href="' +
      tributeHref +
      '" class="rs-memoriam-link"' +
      (isTributePage ? ' aria-current="page"' : '') +
      (currentHost === 'raggiesoft.com' ? '' : ' data-no-spa="true"') +
      '>' +
      '<span>' +
      (isTributePage ? 'Reading Creator&rsquo;s Tribute' : 'Read Creator&rsquo;s Tribute') +
      '</span>' +
      '<span aria-hidden="true">' +
      (isTributePage ? '✦' : '→') +
      '</span>' +
      '</a>' +
      '</div>';

    var networkBar = document.querySelector('.rs-network-bar');

    /* On Angular / SPA properties (`michaelpragsdale.com` `<mpr-root>`), wait until
       the root component mounts `.rs-network-bar` so `.rs-memoriam-bar` NEVER renders
       above `.rs-network-bar`. */
    if (!networkBar && document.querySelector('mpr-root, app-root')) {
      return;
    }

    var ribbon;
    if (existingBars.length > 0) {
      for (var j = 1; j < existingBars.length; j++) {
        if (existingBars[j] && existingBars[j].parentNode) {
          existingBars[j].parentNode.removeChild(existingBars[j]);
        }
      }
      ribbon = existingBars[0];
      ribbon.setAttribute('data-rs-memoriam-expires', MEMORIAM_EXPIRES_ISO);
      ribbon.innerHTML = innerHtml;
    } else {
      ribbon = document.createElement('div');
      ribbon.className = 'rs-memoriam-bar';
      ribbon.setAttribute('data-rs-memoriam-expires', MEMORIAM_EXPIRES_ISO);
      ribbon.innerHTML = innerHtml;
    }

    /* Always enforce canonical top-of-page order:
       1. `.rs-network-bar` (Top Network Switcher)
       2. `.rs-memoriam-bar` (Immediately below `.rs-network-bar`)
       3. Site Header (`<header>`) */
    if (networkBar && networkBar.parentNode) {
      if (networkBar.nextElementSibling !== ribbon) {
        if (networkBar.nextSibling) {
          networkBar.parentNode.insertBefore(ribbon, networkBar.nextSibling);
        } else {
          networkBar.parentNode.appendChild(ribbon);
        }
      }
    } else if (!ribbon.parentNode) {
      if (document.body.firstChild) {
        document.body.insertBefore(ribbon, document.body.firstChild);
      } else {
        document.body.appendChild(ribbon);
      }
    }
  }

  /**
   * Builds (or removes) `#rs-snowfall-layer` containing 28 `<span class="rs-snowflake">`
   * elements. Notice how `xPct`, `sizePx`, `durSec`, and negative `delaySec` use
   * deterministic modular arithmetic (`(i * 37 + 11) % 98`) instead of `Math.random()`:
   *   - Even distribution across `1%..99%` of the screen width with zero ugly clumping!
   *   - Negative `animation-delay` starts snowflakes mid-air across the screen on frame 1
   *     instead of dropping all 28 flakes from the top edge in a single horizontal line!
   */
  function ensureSnowfallLayer(active) {
    if (!document.body) return;
    var existing = document.getElementById('rs-snowfall-layer');
    if (!active) {
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }
      return;
    }

    if (existing) {
      return;
    }

    var layer = document.createElement('div');
    layer.id = 'rs-snowfall-layer';
    layer.className = 'rs-snowfall-layer';
    layer.setAttribute('aria-hidden', 'true');
    layer.setAttribute('role', 'presentation');

    var count = 28;
    for (var i = 0; i < count; i++) {
      var flake = document.createElement('span');
      flake.className = 'rs-snowflake';
      var xPct = ((i * 37 + 11) % 98) + 1;
      var sizePx = 4 + (i % 5) * 1.5;
      var alpha = (0.42 + (i % 5) * 0.11).toFixed(2);
      var durSec = 11 + (i % 7) * 2.1;
      var delaySec = -((i * 1.73) % durSec).toFixed(2);
      var driftSign = i % 2 === 0 ? 1 : -1;
      var driftPx = driftSign * (12 + (i % 4) * 7);

      flake.style.setProperty('--rs-flake-x', xPct + '%');
      flake.style.setProperty('--rs-flake-size', sizePx + 'px');
      flake.style.setProperty('--rs-flake-alpha', alpha);
      flake.style.setProperty('--rs-flake-dur', durSec.toFixed(1) + 's');
      flake.style.setProperty('--rs-flake-delay', delaySec + 's');
      flake.style.setProperty('--rs-flake-drift', driftPx + 'px');
      layer.appendChild(flake);
    }

    document.body.appendChild(layer);
  }

  /* Binds tab-visibility battery saver (`visibilitychange` -> `rs-tab-hidden`) and
   * live OS `prefers-reduced-motion` listener once per browser tab. */
  var holidayListenersBound = false;
  function bindHolidayEnvironmentListeners() {
    if (holidayListenersBound || typeof document === 'undefined') return;
    holidayListenersBound = true;

    document.addEventListener('visibilitychange', function () {
      if (!document.documentElement) return;
      document.documentElement.classList.toggle('rs-tab-hidden', document.hidden === true);
    });

    try {
      if (window.matchMedia) {
        var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (typeof mq.addEventListener === 'function') {
          mq.addEventListener('change', applySnowPlaybackState);
        } else if (typeof mq.addListener === 'function') {
          mq.addListener(applySnowPlaybackState);
        }
      }
    } catch (e) {}
  }

  /**
   * Synchronizes the yearly Holiday Mode across all RaggieSoft web properties:
   * - Toggles `html.rs-holiday-season` + `data-rs-holiday="active"` and dispatches
   *   `raggiesoft:holidaychange` so host apps (like StoreTrainer's Quantum OS 98
   *   or The Listening Room) can activate seasonal themes in lockstep.
   * - Injects `.rs-snowfall-layer` and `.rs-holiday-bar` (with Pause/Play Snow toggle
   *   and direct link to The Listening Room's Winter & Holiday Showcase).
   * - Automatically packs everything away on January 2 (`America/New_York`).
   */
  function syncHolidaySeason() {
    var root = document.documentElement;
    if (!root) return;
    bindHolidayEnvironmentListeners();

    var active = isHolidaySeasonActive();
    var wasActive = root.classList.contains('rs-holiday-season');
    root.classList.toggle('rs-holiday-season', active);
    if (active) {
      root.setAttribute('data-rs-holiday', 'active');
    } else {
      root.removeAttribute('data-rs-holiday');
    }

    if (wasActive !== active && typeof window.CustomEvent === 'function') {
      try {
        window.dispatchEvent(new CustomEvent('raggiesoft:holidaychange', { detail: { active: active } }));
      } catch (e) {}
    }

    if (!document.body) return;

    ensureSnowfallLayer(active);

    var existingBars = document.querySelectorAll('.rs-holiday-bar');
    if (!active || isStandalonePwa()) {
      for (var k = 0; k < existingBars.length; k++) {
        if (existingBars[k] && existingBars[k].parentNode) {
          existingBars[k].parentNode.removeChild(existingBars[k]);
        }
      }
      if (active) {
        applySnowPlaybackState();
      }
      return;
    }

    var networkBar = document.querySelector('.rs-network-bar');
    if (!networkBar && document.querySelector('mpr-root, app-root')) {
      applySnowPlaybackState();
      return;
    }

    var currentHost = getCurrentHost();
    var greetingLabel = 'Happy Holidays from RaggieSoft';
    var greetingMessage = 'Celebrate the season with winter stories and symphonic holiday music.';
    var musicHref = 'https://music.raggiesoft.com/#holiday-music-showcase-heading';
    var musicLabel = 'Winter Soundtrack';
    var musicArrow = '→';

    /* Tailor the seasonal greeting message slightly to match the property's personality. */
    if (currentHost === 'storetrainer.raggiesoft.com') {
      greetingLabel = 'Happy Holidays from RaggieSoft';
      greetingMessage = 'Quantum OS 98 Holiday Desktop Edition is active for the season.';
    } else if (currentHost === 'michaelpragsdale.com') {
      greetingLabel = 'Happy Holidays from Michael P. Ragsdale';
      greetingMessage = 'Wishing you a peaceful winter season and a wonderful New Year.';
    } else if (currentHost === 'music.raggiesoft.com') {
      greetingMessage = 'Stream instrumental winter symphonies from The Arctic Symphony Project.';
      musicHref = '#holiday-music-showcase-heading';
      musicArrow = '↓';
    }

    var ribbon;
    if (existingBars.length > 0) {
      for (var m = 1; m < existingBars.length; m++) {
        if (existingBars[m] && existingBars[m].parentNode) {
          existingBars[m].parentNode.removeChild(existingBars[m]);
        }
      }
      ribbon = existingBars[0];
    } else {
      ribbon = document.createElement('div');
      ribbon.className = 'rs-holiday-bar';
      ribbon.setAttribute('role', 'region');
      ribbon.setAttribute('aria-label', 'Seasonal Holiday Greeting & Snow Controls');
    }

    ribbon.innerHTML =
      '<div class="rs-holiday-inner">' +
      '<p class="rs-holiday-text">' +
      '<span class="rs-holiday-icon" aria-hidden="true">🎄</span>' +
      '<strong class="rs-holiday-label">' + greetingLabel + '</strong>' +
      '<span class="rs-holiday-sep" aria-hidden="true">—</span>' +
      '<span class="rs-holiday-message">' + greetingMessage + '</span>' +
      '</p>' +
      '<div class="rs-holiday-actions">' +
      '<a href="' + musicHref + '" class="rs-holiday-link"' +
      (currentHost === 'music.raggiesoft.com' ? '' : ' data-no-spa="true"') +
      '>' +
      '<span aria-hidden="true">🎧</span>' +
      '<span>' + musicLabel + '</span>' +
      '<span aria-hidden="true">' + musicArrow + '</span>' +
      '</a>' +
      '<button type="button" class="rs-holiday-snow-btn" aria-pressed="false">' +
      '<span aria-hidden="true">⏸</span><span>Pause Snow</span>' +
      '</button>' +
      '</div>' +
      '</div>';

    var snowBtn = ribbon.querySelector('.rs-holiday-snow-btn');
    if (snowBtn) {
      snowBtn.addEventListener('click', function (ev) {
        ev.preventDefault();
        toggleSnowPlayback();
      });
    }

    if (networkBar && networkBar.parentNode) {
      if (networkBar.nextElementSibling !== ribbon) {
        if (networkBar.nextSibling) {
          networkBar.parentNode.insertBefore(ribbon, networkBar.nextSibling);
        } else {
          networkBar.parentNode.appendChild(ribbon);
        }
      }
    } else if (!ribbon.parentNode) {
      if (document.body.firstChild) {
        document.body.insertBefore(ribbon, document.body.firstChild);
      } else {
        document.body.appendChild(ribbon);
      }
    }

    applySnowPlaybackState();
  }

  /**
   * ==========================================================================
   * SECTION 6: SCHEMA.ORG JSON-LD GRAPH, MASTER ORCHESTRATOR & LIFECYCLE HOOKS
   * ==========================================================================
   * `ensureEcosystemJsonLdInjected()` appends a `<script type="application/ld+json">`
   * structured-data graph into `<head>` describing the RaggieSoft organization,
   * founder Michael P. Ragsdale, the permanent Sir Patrick Stewart tribute article,
   * and all ecosystem navigation URLs for search engines.
   */
  function ensureEcosystemJsonLdInjected() {
    if (!document.head || document.getElementById('rs-ecosystem-jsonld') || document.getElementById('raggiesoft-head-jsonld')) return;
    try {
      var script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'rs-ecosystem-jsonld';
      var currentUrl = window.location ? window.location.origin + window.location.pathname : 'https://raggiesoft.com/';
      var graphData = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': 'https://raggiesoft.com/#organization',
            name: 'RaggieSoft',
            alternateName: ['RaggieSoft Media', 'Engine Room Records', 'Ocean View Archives'],
            url: 'https://raggiesoft.com',
            logo: 'https://assets.raggiesoft.com/raggiesoft-corporate/images/logo/raggiesoft-logo.png',
            founder: {
              '@type': 'Person',
              '@id': 'https://michaelpragsdale.com/#michael-ragsdale',
              name: 'Michael P. Ragsdale',
              url: 'https://michaelpragsdale.com'
            },
            sameAs: [
              'https://raggiesoft.com',
              'https://nebulae.raggiesoft.com',
              'https://books.raggiesoft.com',
              'https://crossroads.raggiesoft.com',
              'https://cedarrun.raggiesoft.com',
              'https://waystation.raggiesoft.com',
              'https://lore.raggiesoft.com',
              'https://backstage.raggiesoft.com',
              'https://music.raggiesoft.com',
              'https://stardust.raggiesoft.com',
              'https://engineroom.raggiesoft.com',
              'https://corporate.raggiesoft.com',
              'https://storetrainer.raggiesoft.com',
              'https://michaelpragsdale.com',
              'https://github.com/raggiesoft'
            ],
            subjectOf: {
              '@type': 'Article',
              '@id': 'https://raggiesoft.com/in-memoriam#article',
              headline: 'In Memoriam: Sir Patrick Stewart (July 13, 1940 – October 28, 2026) — Second Star to the Right',
              url: 'https://raggiesoft.com/in-memoriam',
              about: {
                '@type': 'Person',
                '@id': 'https://raggiesoft.com/in-memoriam#sir-patrick-stewart',
                name: 'Sir Patrick Stewart',
                birthDate: '1940-07-13',
                deathDate: '2026-10-28'
              }
            }
          },
          {
            '@type': 'SiteNavigationElement',
            '@id': currentUrl + '#rs-network-navigation',
            name: 'RaggieSoft Ecosystem Network Navigation',
            hasPart: [
              { '@type': 'WebPage', name: 'RaggieSoft Hub', url: 'https://raggiesoft.com/' },
              { '@type': 'WebPage', name: 'In Memoriam: Sir Patrick Stewart', url: 'https://raggiesoft.com/in-memoriam' },
              { '@type': 'WebPage', name: 'RaggieSoft Nebulae (Caelum-IV Survey)', url: 'https://nebulae.raggiesoft.com/' },
              { '@type': 'WebPage', name: 'RaggieSoft Book Reader (Ocean View Archives)', url: 'https://books.raggiesoft.com/' },
              { '@type': 'WebPage', name: 'RaggieSoft Story Crossroads Imprint', url: 'https://crossroads.raggiesoft.com/' },
              { '@type': 'WebPage', name: 'Cedar Run (Story Crossroads Wilderness Launchpad)', url: 'https://cedarrun.raggiesoft.com/' },
              { '@type': 'WebPage', name: 'The Uncharted Waystation (RaggieSoft Universe Map)', url: 'https://waystation.raggiesoft.com/' },
              { '@type': 'WebPage', name: 'Escape Velocity: Ad Astra Book Series', url: 'https://books.raggiesoft.com/ad-astra' },
              { '@type': 'WebPage', name: 'RaggieSoft Lore Graph', url: 'https://lore.raggiesoft.com/' },
              { '@type': 'WebPage', name: 'RaggieSoft Backstage', url: 'https://backstage.raggiesoft.com/' },
              { '@type': 'WebPage', name: 'The Listening Room', url: 'https://music.raggiesoft.com/' },
              { '@type': 'WebPage', name: 'The Stardust Engine', url: 'https://stardust.raggiesoft.com/' },
              { '@type': 'WebPage', name: 'Engine Room Records', url: 'https://engineroom.raggiesoft.com/' },
              { '@type': 'WebPage', name: 'RaggieSoft Media (Corporate & Licensing)', url: 'https://corporate.raggiesoft.com/' },
              { '@type': 'WebPage', name: 'RaggieSoft StoreTrainer', url: 'https://storetrainer.raggiesoft.com/' },
              { '@type': 'WebPage', name: 'Michael P. Ragsdale Portfolio', url: 'https://michaelpragsdale.com/' }
            ]
          }
        ]
      };
      script.textContent = JSON.stringify(graphData);
      document.head.appendChild(script);
    } catch (e) {}
  }

  /**
   * Master idempotent bootstrapper (`initRaggieSoftNetworkMenu`):
   * Safe to run on `DOMContentLoaded`, `window.load`, `elara:loaded`, `popstate`,
   * and `MutationObserver` callbacks. Detects which of the 3 mobile navigation
   * architectures the current property uses and injects the matching switcher!
   */
  function initRaggieSoftNetworkMenu() {
    ensureNetworkStylesInjected();
    ensureEcosystemJsonLdInjected();
    ensureStandaloneExternalLinkRouting();
    if (!document.body) return;

    /* Native PWA Immersion Guard: hide network bar & skip mobile network grid when running as an installed PWA */
    if (isStandalonePwa()) {
      document.documentElement.classList.add('is-pwa-standalone');
      document.body.classList.add('is-pwa-standalone');
      syncMemoriamRibbon();
      syncHolidaySeason();
      var pwaBar = document.querySelector('.rs-network-bar');
      if (pwaBar) {
        pwaBar.hidden = true;
        pwaBar.setAttribute('aria-hidden', 'true');
        pwaBar.style.setProperty('display', 'none', 'important');
      }
      var existingMobileSections = document.querySelectorAll('.rs-mobile-network-section');
      for (var i = 0; i < existingMobileSections.length; i++) {
        existingMobileSections[i].hidden = true;
        existingMobileSections[i].setAttribute('aria-hidden', 'true');
        existingMobileSections[i].style.setProperty('display', 'none', 'important');
      }
      return;
    }

    upgradeDesktopNetworkBar();
    syncMemoriamRibbon();
    syncHolidaySeason();

    /* 1. Group A: Properties using #primary-navigation (1120px mobile breakpoint) */
    var primaryNav = document.getElementById('primary-navigation');
    if (primaryNav) {
      document.body.classList.add('rs-has-primary-nav');
      injectIntoContainer(primaryNav, '1120');
      return;
    }

    /* 2. Group B: Properties using 768px mobile hamburger containers */
    var dossierPanel = document.getElementById('header-navigation-panel');
    var bootstrapCollapse = document.getElementById('navbarCollapse');
    var musicMobileNav = document.getElementById('music-mobile-navigation');

    if (dossierPanel || bootstrapCollapse || musicMobileNav) {
      document.body.classList.add('rs-has-md-nav');
      if (dossierPanel) injectIntoContainer(dossierPanel, '768');
      if (bootstrapCollapse) injectIntoContainer(bootstrapCollapse, '768');
      if (musicMobileNav) injectIntoContainer(musicMobileNav, '768');
      return;
    }

    /* 3. Group C: Standalone / Full-Screen App Views (books.raggiesoft.com & lore.raggiesoft.com) */
    var bookSidebar = document.getElementById('stardust-sidebar');
    if (bookSidebar) {
      injectIntoContainer(bookSidebar, 'always');
    }
    setupStandaloneNetworkBar();
  }

  /* Expose public hooks on `window` so SPA routers and seasonal widgets can call them directly. */
  if (typeof window !== 'undefined') {
    window.initRaggieSoftNetworkMenu = initRaggieSoftNetworkMenu;
    window.RaggieSoftHoliday = {
      isActive: isHolidaySeasonActive,
      getBlackFridayDay: getBlackFridayDay,
      isSnowPaused: isSnowPaused,
      toggleSnow: toggleSnowPlayback,
      sync: syncHolidaySeason
    };
  }

  /* Check `document.readyState`: if HTML is still parsing (`'loading'`), wait for
   * `DOMContentLoaded`; if already `'interactive'` or `'complete'`, run right now! */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRaggieSoftNetworkMenu);
  } else {
    initRaggieSoftNetworkMenu();
    setTimeout(initRaggieSoftNetworkMenu, 300);
  }

  /* Re-run on window load and after SPA route transitions (Elara CMS & History API Back/Forward) */
  window.addEventListener('load', initRaggieSoftNetworkMenu);
  document.addEventListener('elara:loaded', initRaggieSoftNetworkMenu);
  window.addEventListener('popstate', function () {
    setTimeout(initRaggieSoftNetworkMenu, 100);
  });

  /* 100-Level DOM Concept — `MutationObserver`:
   * When RaggieSoft Book Reader (`#stardust-app`) swaps `#stardust-sidebar` via AJAX,
   * or when Angular 19 (`<mpr-root>`) finishes hydrating its client-side template,
   * `MutationObserver` fires automatically as soon as child DOM nodes are inserted! */
  var stardustApp = document.getElementById('stardust-app');
  if (stardustApp && typeof MutationObserver !== 'undefined') {
    var obs = new MutationObserver(function () {
      if (isStandalonePwa()) return;
      var bookSidebar = document.getElementById('stardust-sidebar');
      if (bookSidebar && !bookSidebar.querySelector('.rs-mobile-network-section')) {
        injectIntoContainer(bookSidebar, 'always');
      }
    });
    obs.observe(stardustApp, { childList: true });
  }

  /* Observe Angular `<mpr-root>` / `<app-root>` on michaelpragsdale.com so the instant
     `.rs-network-bar` mounts, `initRaggieSoftNetworkMenu()` upgrades it and places
     `.rs-memoriam-bar` directly below it, then disconnects (`ngObs.disconnect()`) to save CPU. */
  var angularRoot = document.querySelector('mpr-root, app-root');
  if (angularRoot && typeof MutationObserver !== 'undefined') {
    var ngObs = new MutationObserver(function () {
      var bar = angularRoot.querySelector('.rs-network-bar');
      if (bar) {
        initRaggieSoftNetworkMenu();
        ngObs.disconnect();
      }
    });
    ngObs.observe(angularRoot, { childList: true, subtree: true });
  }
})();
