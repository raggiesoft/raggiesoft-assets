/**
 * ============================================================================
 * THE RAGGIESOFT NEBULAE — INTERACTIVE SENSOR & STORYBOARD CONTROLLER
 * ============================================================================
 * File: /raggiesoft-assets/nebulae/js/nebulae.js
 * Served via CDN: https://assets.raggiesoft.com/nebulae/js/nebulae.js
 * License: MIT License
 *
 * ARCHITECTURAL OVERVIEW:
 * 1. Accessible Sensor Hotspot Synchronization:
 *    - Links the overlaid 16:9 viewport pins (`.hotspot-pin`) and the below-
 *      viewport selector buttons (`.sensor-tab-btn`) via `data-sensor-target`.
 *    - Updates `aria-expanded="true" | "false"` across all matching triggers,
 *      toggles the `hidden` attribute on the corresponding `.sensor-panel`,
 *      and announces the active scan in a centralized `aria-live="polite"`
 *      status region without stealing keyboard focus.
 * 2. 4-Act Director's Storyboard Filter:
 *    - Allows users to view the complete 15:33 four-movement treatment or
 *      isolate individual acts (`Act I` through `Act IV`) with `aria-pressed`
 *      state synchronization.
 * 3. Adaptive Theme Controller (`Cosmic Void Dark` <-> `LCARS Parchment Light`):
 *    - Defaults to the operating system's `prefers-color-scheme` preference
 *      while providing an accessible header toggle for manual inspection.
 * ============================================================================
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const docEl = document.documentElement;
    const liveAnnouncer = document.getElementById('nebulae-live-announcer');

    /**
     * Helper to announce state updates politely to screen readers.
     * @param {string} message
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
     * ------------------------------------------------------------------------ */
    const sensorTriggers = Array.from(document.querySelectorAll('[data-sensor-target]'));
    const sensorPanels = Array.from(document.querySelectorAll('.sensor-panel'));

    function activateSensor(targetId, shouldAnnounce) {
      let activeTitle = '';

      sensorTriggers.forEach(function (btn) {
        const isMatch = btn.getAttribute('data-sensor-target') === targetId;
        btn.setAttribute('aria-expanded', isMatch ? 'true' : 'false');
      });

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

      if (shouldAnnounce && activeTitle) {
        announcePolite('Sensor telemetry active: ' + activeTitle);
      }
    }

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
     * ------------------------------------------------------------------------ */
    const actFilterButtons = Array.from(document.querySelectorAll('[data-act-filter]'));
    const actCards = Array.from(document.querySelectorAll('.act-card'));

    actFilterButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const selectedAct = btn.getAttribute('data-act-filter') || 'all';

        actFilterButtons.forEach(function (other) {
          const isCurrent = other === btn;
          other.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');
        });

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

    function getEffectiveTheme() {
      const explicit = docEl.getAttribute('data-theme');
      if (explicit === 'light' || explicit === 'dark') return explicit;
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

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
      syncThemeButtonUI();
      themeToggleBtn.addEventListener('click', function () {
        const nextTheme = getEffectiveTheme() === 'dark' ? 'light' : 'dark';
        docEl.setAttribute('data-theme', nextTheme);
        docEl.setAttribute('data-bs-theme', nextTheme);
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

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
      if (!docEl.hasAttribute('data-theme')) {
        syncThemeButtonUI();
      }
    });
  });
})();

