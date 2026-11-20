/**
 * ============================================================================
 * PLAIN-ENGLISH OVERVIEW FOR NEW DEVELOPERS (READ-ALONG TEACHING HEADER)
 * ============================================================================
 * What is this file?
 *   This is `nebulae.js`, the client-side vanilla JavaScript controller for
 *   The RaggieSoft Nebulae (`https://nebulae.raggiesoft.com`). It runs inside
 *   the visitor's web browser right after the server-rendered HTML from
 *   `index.php` finishes parsing.
 *
 * Why does it exist in the RaggieSoft ecosystem?
 *   `index.php` already delivers 100% of the Caelum-IV telemetry, sensor panels,
 *   and 4-act storyboard HTML from the server (so search engines and non-JS
 *   readers see everything immediately), and `nebulae.css` renders the ambient
 *   nebula gradients and 120 BPM telemetry beacon using zero-CPU CSS animations
 *   (rather than a battery-draining `requestAnimationFrame` `<canvas>` loop).
 *   This script adds the interactive layer on top:
 *     1. Clicking any 16:9 starship viewport pin OR below-viewport console tab
 *        reveals that sensor's readout card and keeps both button bars in sync.
 *     2. Clicking a movement filter button isolates Act I, Act II, Act III, or
 *        Act IV of the 15:33 "Escape Velocity (Ad Astra)" storyboard.
 *     3. Clicking the header Theme button switches between Deep Cosmic Void
 *        (Dark Mode) and LCARS Parchment (Light Mode) and remembers the choice.
 *
 * What inputs feed into it, and what visible output does it produce?
 *   - Inputs: DOM elements carrying `data-sensor-target`, `data-act-filter`,
 *     `#nebulae-theme-toggle`, `localStorage.getItem('nebulae_theme')`, and the
 *     operating system's `window.matchMedia('(prefers-color-scheme: ...)')`.
 *   - Outputs: Updates `aria-expanded`, `aria-pressed`, `hidden`, and
 *     `data-theme` attributes (which `nebulae.css` styles automatically!), plus
 *     screen-reader voice announcements in `#nebulae-live-announcer`.
 *
 * File: /raggiesoft-assets/nebulae/js/nebulae.js
 * Served via CDN: https://assets.raggiesoft.com/nebulae/js/nebulae.js
 * License: MIT License
 * ============================================================================
 */

// Wrap the entire file in an IIFE ("Immediately Invoked Function Expression"):
// `(function () { ... })();` creates a private local scope so none of our helper
// functions or variables leak onto the browser's global `window` object.
(function () {
  // `'use strict'` opts into modern strict JavaScript error checking (for example,
  // catching accidental undeclared variables instead of silently creating globals).
  'use strict';

  // Wait for `DOMContentLoaded` so we are guaranteed every `<button>` and `<article>`
  // rendered by `index.php` exists in the DOM before we query for it.
  document.addEventListener('DOMContentLoaded', function () {
    // `document.documentElement` is the root `<html>` tag where `data-theme` lives.
    const docEl = document.documentElement;

    // Grab the visually hidden `<div aria-live="polite">` region from `index.php`.
    const liveAnnouncer = document.getElementById('nebulae-live-announcer');

    /**
     * Announces an interactive UI update to screen readers (VoiceOver, NVDA, JAWS)
     * without stealing the user's keyboard focus away from the button they clicked.
     *
     * Why do we clear `textContent = ''` first and wait 40 milliseconds?
     *   Assistive technologies watch `aria-live` regions for DOM text *changes*.
     *   If a user clicks the same button twice, or clicks two buttons rapidly,
     *   emptying the box first and filling it 40ms later guarantees the screen
     *   reader detects a fresh text mutation every single time!
     *
     * @param {string} message - Plain-English status update to read aloud.
     */
    function announcePolite(message) {
      if (!liveAnnouncer) return;
      liveAnnouncer.textContent = '';
      window.setTimeout(function () {
        liveAnnouncer.textContent = message;
      }, 40);
    }

    /* ------------------------------------------------------------------------
     * 1. SENSOR HOTSPOT CONTROLLER (16:9 Viewport Pins + Selector Bar)
     * ------------------------------------------------------------------------
     * Notice that BOTH the overlaid `.hotspot-pin` buttons on the 16:9 image AND
     * the `.sensor-tab-btn` buttons below the image share the exact same custom
     * HTML attribute: `data-sensor-target="panel-..."`.
     * Querying `[data-sensor-target]` collects all of them into one unified list,
     * and `Array.from(...)` converts the browser's `NodeList` into a standard JS Array.
     */
    const sensorTriggers = Array.from(document.querySelectorAll('[data-sensor-target]'));
    const sensorPanels = Array.from(document.querySelectorAll('.sensor-panel'));

    /**
     * Synchronizes both sensor button bars and swaps which `.sensor-panel` is visible.
     *
     * @param {string} targetId - The DOM `id` of the `<article class="sensor-panel">` to show.
     * @param {boolean} shouldAnnounce - Whether to speak the change via `announcePolite`.
     */
    function activateSensor(targetId, shouldAnnounce) {
      let activeTitle = '';

      // Step A: Loop over every pin and console tab. Any button pointing to `targetId`
      // gets `aria-expanded="true"` (which CSS highlights in Solis Gold); all others get `"false"`.
      sensorTriggers.forEach(function (btn) {
        const isMatch = btn.getAttribute('data-sensor-target') === targetId;
        btn.setAttribute('aria-expanded', isMatch ? 'true' : 'false');
      });

      // Step B: Loop over every telemetry readout panel. Remove the `hidden` attribute
      // on the matching panel to reveal it, read its `<h3>` heading for screen readers,
      // and add `hidden=""` to all non-matching panels so only one shows at a time.
      sensorPanels.forEach(function (panel) {
        const isMatch = panel.id === targetId;
        if (isMatch) {
          panel.removeAttribute('hidden');
          const heading = panel.querySelector('h3');
          if (heading) activeTitle = heading.textContent.trim();
        } else {
          panel.setAttribute('hidden', '');
        }
      });

      // Step C: Announce the newly opened sensor panel to screen-reader users.
      if (shouldAnnounce && activeTitle) {
        announcePolite('Sensor telemetry active: ' + activeTitle);
      }
    }

    // Wire a click listener onto every viewport pin and console selector button.
    // Note: Native `<button>` elements automatically fire `click` on keyboard
    // Enter AND Spacebar presses for free—no custom keydown code needed!
    sensorTriggers.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const targetId = btn.getAttribute('data-sensor-target');
        if (targetId) {
          activateSensor(targetId, true);
        }
      });
    });

    /* ------------------------------------------------------------------------
     * 2. 4-ACT DIRECTOR'S STORYBOARD FILTER
     * ------------------------------------------------------------------------
     * Unlike disclosure tabs (which use `aria-expanded` to open one panel), filter
     * pills use `aria-pressed="true" | "false"` to tell assistive tech which filter
     * button is currently pressed down.
     */
    const actFilterButtons = Array.from(document.querySelectorAll('[data-act-filter]'));
    const actCards = Array.from(document.querySelectorAll('.act-card'));

    actFilterButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        // Read which movement was clicked (`"all"`, `"act-1"`, `"act-2"`, etc.).
        const selectedAct = btn.getAttribute('data-act-filter') || 'all';

        // Mark ONLY the clicked filter button as `aria-pressed="true"`.
        actFilterButtons.forEach(function (other) {
          const isCurrent = other === btn;
          other.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');
        });

        // Show all 4 movement cards when `"all"` is active, or only the matching Act card.
        actCards.forEach(function (card) {
          const cardAct = card.getAttribute('data-act-id');
          if (selectedAct === 'all' || cardAct === selectedAct) {
            card.removeAttribute('hidden');
          } else {
            card.setAttribute('hidden', '');
          }
        });

        announcePolite('Storyboard view updated: ' + btn.textContent.trim());
      });
    });

    /* ------------------------------------------------------------------------
     * 3. THEME TOGGLE (DARK COSMIC VOID <-> LIGHT LCARS PARCHMENT)
     * ------------------------------------------------------------------------ */
    const themeToggleBtn = document.getElementById('nebulae-theme-toggle');
    const themeToggleLabel = document.getElementById('nebulae-theme-label');

    /**
     * Determines which color theme is currently active:
     *   1. If `<html data-theme="...">` was explicitly set (from `localStorage`
     *      or a previous button click), honor that user choice first.
     *   2. Otherwise, ask the browser if the operating system is in Light Mode
     *      via `window.matchMedia('(prefers-color-scheme: light)')`.
     *
     * @returns {'light' | 'dark'}
     */
    function getEffectiveTheme() {
      const explicit = docEl.getAttribute('data-theme');
      if (explicit === 'light' || explicit === 'dark') return explicit;
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    /**
     * Updates the header Theme button's `aria-pressed` state and visible label
     * so it always reflects the active theme accurately.
     */
    function syncThemeButtonUI() {
      if (!themeToggleBtn || !themeToggleLabel) return;
      const current = getEffectiveTheme();
      const isLight = current === 'light';
      themeToggleBtn.setAttribute('aria-pressed', isLight ? 'true' : 'false');
      themeToggleLabel.textContent = isLight
        ? 'Theme: LCARS Parchment (Light)'
        : 'Theme: Cosmic Void (Dark)';
    }

    if (themeToggleBtn) {
      // Sync the button label immediately on initial page load.
      syncThemeButtonUI();

      // Flip between `'dark'` and `'light'` whenever the user clicks the toggle button.
      themeToggleBtn.addEventListener('click', function () {
        const nextTheme = getEffectiveTheme() === 'dark' ? 'light' : 'dark';

        // Set both `data-theme` (used by `nebulae.css`) and `data-bs-theme` (used by
        // shared ecosystem styles) on `<html>`.
        docEl.setAttribute('data-theme', nextTheme);
        docEl.setAttribute('data-bs-theme', nextTheme);

        // Persist the user's choice in `localStorage` inside a `try/catch` block
        // so strict privacy browsers that block storage never throw an uncaught error.
        try {
          localStorage.setItem('nebulae_theme', nextTheme);
        } catch (e) {}

        syncThemeButtonUI();
        announcePolite(
          nextTheme === 'light'
            ? 'Switched to Daylight Starfleet Technical Manual Light Mode.'
            : 'Switched to Deep Cosmic Void Dark Mode.'
        );
      });
    }

    // Live OS Theme Listener: if the visitor hasn't manually locked a theme via the
    // header button and their OS automatically shifts from Sunset/Daylight mode,
    // update the header button label in real time!
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
      if (!docEl.hasAttribute('data-theme')) {
        syncThemeButtonUI();
      }
    });
  });
})();
