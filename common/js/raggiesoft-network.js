/**
 * @license MIT
 * ============================================================================
 * raggiesoft-assets/common/js/raggiesoft-network.js
 * ============================================================================
 * Architectural Overview:
 * Unified Omnidirectional Ecosystem Navigation & Mobile Hamburger Enhancer
 * shared across all 10 RaggieSoft properties:
 *   1. raggiesoft.com (Hub)
 *   2. nebulae.raggiesoft.com (Nebulae Atlas)
 *   3. music.raggiesoft.com (The Listening Room)
 *   4. books.raggiesoft.com (RaggieSoft Book Reader)
 *   5. stardust.raggiesoft.com (The Stardust Engine)
 *   6. engineroom.raggiesoft.com (Engine Room Records)
 *   7. lore.raggiesoft.com (Lore Archive)
 *   8. corporate.raggiesoft.com (RaggieSoft Media)
 *   9. storetrainer.raggiesoft.com (RaggieSoft StoreTrainer)
 *  10. michaelpragsdale.com (Executive Systems Architect Dossier)
 *
 * Mobile Single-Hamburger Strategy:
 * - On desktop viewports, `.rs-network-bar` renders horizontally at the top
 *   of the viewport above the property header.
 * - On mobile/tablet viewports where the property's native hamburger button is
 *   active, `.rs-network-bar` hides completely (`display: none`) so there are
 *   never two stacked bars or two hamburger buttons.
 * - This script automatically injects a 2-column "✦ Switch RaggieSoft Property"
 *   app-switcher grid (`.rs-mobile-network-section`) at the bottom of the
 *   property's existing mobile hamburger menu container (`#primary-navigation`,
 *   `#header-navigation-panel`, `#navbarCollapse`, `#music-mobile-navigation`,
 *   or `#stardust-sidebar`).
 * - For standalone full-screen apps without a native top navbar hamburger
 *   (`books.raggiesoft.com` landing/catalog views and `lore.raggiesoft.com`),
 *   this script injects a single 44x44px Section 508 hamburger toggle button
 *   directly into `.rs-network-bar` on mobile viewports.
 * ============================================================================
 */
(function () {
  'use strict';

  var NETWORK_SITES = [
    { id: 'hub', href: 'https://raggiesoft.com', host: 'raggiesoft.com', icon: '🌐', label: 'RaggieSoft Hub' },
    { id: 'nebulae', href: 'https://nebulae.raggiesoft.com', host: 'nebulae.raggiesoft.com', icon: '🌌', label: 'Nebulae Atlas' },
    { id: 'music', href: 'https://music.raggiesoft.com', host: 'music.raggiesoft.com', icon: '🎧', label: 'Listening Room' },
    { id: 'books', href: 'https://books.raggiesoft.com', host: 'books.raggiesoft.com', icon: '📚', label: 'Book Reader' },
    { id: 'stardust', href: 'https://stardust.raggiesoft.com', host: 'stardust.raggiesoft.com', icon: '🚀', label: 'Stardust Engine' },
    { id: 'engineroom', href: 'https://engineroom.raggiesoft.com', host: 'engineroom.raggiesoft.com', icon: '⚙️', label: 'Engine Room' },
    { id: 'lore', href: 'https://lore.raggiesoft.com', host: 'lore.raggiesoft.com', icon: '🏛️', label: 'Lore Archive' },
    { id: 'corporate', href: 'https://corporate.raggiesoft.com', host: 'corporate.raggiesoft.com', icon: '🏢', label: 'Corporate Media' },
    { id: 'storetrainer', href: 'https://storetrainer.raggiesoft.com', host: 'storetrainer.raggiesoft.com', icon: '💾', label: 'StoreTrainer' },
    { id: 'portfolio', href: 'https://michaelpragsdale.com', host: 'michaelpragsdale.com', icon: '👔', label: 'M. P. Ragsdale' }
  ];

  function getCurrentHost() {
    try {
      return (window.location.hostname || '').toLowerCase().replace(/^www\./, '');
    } catch (e) {
      return '';
    }
  }

  function buildMobileGridHtml(breakpointAttr) {
    var currentHost = getCurrentHost();
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

    return (
      '<div class="rs-mobile-network-section" data-rs-breakpoint="' + breakpointAttr + '" role="region" aria-label="RaggieSoft Ecosystem Switcher">' +
      '<div class="rs-mobile-network-title">✦ Switch RaggieSoft Property</div>' +
      '<ul class="rs-mobile-network-grid">' +
      itemsHtml +
      '</ul>' +
      '</div>'
    );
  }

  function injectIntoContainer(container, breakpointAttr) {
    if (!container) return false;
    if (container.querySelector('.rs-mobile-network-section')) return true;
    container.insertAdjacentHTML('beforeend', buildMobileGridHtml(breakpointAttr));
    return true;
  }

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

  function initRaggieSoftNetworkMenu() {
    if (!document.body) return;

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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRaggieSoftNetworkMenu);
  } else {
    initRaggieSoftNetworkMenu();
  }

  /* Re-run after SPA route transitions (Elara CMS & Stardust Book Reader) */
  document.addEventListener('elara:loaded', initRaggieSoftNetworkMenu);
  window.addEventListener('popstate', function () {
    setTimeout(initRaggieSoftNetworkMenu, 100);
  });

  var stardustApp = document.getElementById('stardust-app');
  if (stardustApp && typeof MutationObserver !== 'undefined') {
    var obs = new MutationObserver(function () {
      var bookSidebar = document.getElementById('stardust-sidebar');
      if (bookSidebar && !bookSidebar.querySelector('.rs-mobile-network-section')) {
        injectIntoContainer(bookSidebar, 'always');
      }
    });
    obs.observe(stardustApp, { childList: true });
  }
})();
