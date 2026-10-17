/**
 * @license MIT
 * ============================================================================
 * raggiesoft-assets/common/js/raggiesoft-network.js
 * ============================================================================
 * Architectural Overview:
 * Unified Omnidirectional Ecosystem Navigation, Engine Room Band Roster
 * Dropdown Menu, & Mobile Single-Hamburger Enhancer shared across all
 * RaggieSoft properties:
 *   1. raggiesoft.com (Hub)
 *   2. nebulae.raggiesoft.com (Nebulae Atlas)
 *   3. music.raggiesoft.com (The Listening Room)
 *   4. books.raggiesoft.com (RaggieSoft Book Reader)
 *   5. engineroom.raggiesoft.com (Engine Room Records + Band Roster Menu)
 *      └── Alphabetical Band Roster (A–Z):
 *          • Crimson Node (engineroom.raggiesoft.com/artists/crimson-node)
 *          • Firelight (engineroom.raggiesoft.com/artists/firelight)
 *          • Fractured Prisms (engineroom.raggiesoft.com/artists/fractured-prisms)
 *          • Mana Canvas (engineroom.raggiesoft.com/artists/mana-canvas)
 *          • The Arctic Symphony Project (engineroom.raggiesoft.com/artists/the-arctic-symphony-project)
 *          • The Paper Wall (engineroom.raggiesoft.com/artists/the-paper-wall)
 *          • The Stardust Engine (stardust.raggiesoft.com)
 *   6. lore.raggiesoft.com (Lore Archive)
 *   7. corporate.raggiesoft.com (RaggieSoft Media)
 *   8. storetrainer.raggiesoft.com (RaggieSoft StoreTrainer)
 *   9. michaelpragsdale.com (Executive Systems Architect Dossier)
 * ============================================================================
 */
(function () {
  'use strict';

  /**
   * Top-level RaggieSoft properties (The Listening Room and The Stardust Engine
   * live inside the Engine Room Records menu).
   */
  var NETWORK_SITES = [
    { id: 'hub', href: 'https://raggiesoft.com', host: 'raggiesoft.com', icon: '🌐', label: 'RaggieSoft Hub' },
    { id: 'nebulae', href: 'https://nebulae.raggiesoft.com', host: 'nebulae.raggiesoft.com', icon: '🌌', label: 'Nebulae Atlas' },
    { id: 'books', href: 'https://books.raggiesoft.com', host: 'books.raggiesoft.com', icon: '📚', label: 'Book Reader' },
    { id: 'engineroom', href: 'https://engineroom.raggiesoft.com', host: 'engineroom.raggiesoft.com', icon: '⚙️', label: 'Engine Room' },
    { id: 'corporate', href: 'https://corporate.raggiesoft.com', host: 'corporate.raggiesoft.com', icon: '🏢', label: 'Corporate Media' },
    { id: 'storetrainer', href: 'https://storetrainer.raggiesoft.com', host: 'storetrainer.raggiesoft.com', icon: '💾', label: 'StoreTrainer' },
    { id: 'portfolio', href: 'https://michaelpragsdale.com', host: 'michaelpragsdale.com', icon: '👔', label: 'M. P. Ragsdale' }
  ];

  /**
   * Official Engine Room Records Band Roster in strict alphabetical order (A–Z).
   * Note: The Stardust Engine links to its dedicated cosmic portal (stardust.raggiesoft.com),
   * while all other bands link to their lore dossiers on engineroom.raggiesoft.com/artists/{slug}.
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

  function getCurrentHost() {
    try {
      return (window.location.hostname || '').toLowerCase().replace(/^www\./, '');
    } catch (e) {
      return '';
    }
  }

  function getCurrentPathname() {
    try {
      return (window.location.pathname || '/').replace(/\/+$/, '') || '/';
    } catch (e) {
      return '/';
    }
  }

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

  /**
   * Detects whether the current property is running inside an installed native
   * Progressive Web App (PWA) window (`standalone`, `window-controls-overlay`,
   * `minimal-ui`, `fullscreen`, iOS Safari `navigator.standalone`, or Android TWA).
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
   * Ensures that when running inside an installed native PWA window, any cross-origin
   * link (pointing to another RaggieSoft subdomain or external site) opens in a proper
   * OS browser window (`target="_blank" rel="noopener noreferrer"`) rather than breaking
   * native PWA immersion or triggering an in-app out-of-scope URL bar.
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
   * Injects core defensive CSS rules directly into <head> so that even if a browser
   * or Cloudflare edge node serves a stale cached stylesheet, `.rs-network-dropdown`
   * and `.rs-mobile-network-section` render cleanly across all viewports and hide
   * automatically inside installed native PWAs.
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
      '.rs-network-bar .rs-network-dropdown-menu, .rs-network-dropdown-menu { display: none; position: absolute; top: calc(100% + 0.2rem); left: 0; min-width: 250px; background-color: #0b1120 !important; color: #f8fafc !important; border: 1px solid rgba(56, 189, 248, 0.45) !important; border-radius: 0.55rem; padding: 0.4rem; box-shadow: 0 16px 36px rgba(0, 0, 0, 0.65); list-style: none !important; margin: 0 !important; z-index: 2000; }',
      '.rs-network-dropdown-menu::before { content: ""; position: absolute; top: -0.65rem; left: -0.75rem; right: -0.75rem; height: 0.75rem; background: transparent; }',
      '.rs-network-bar .rs-network-dropdown.is-open > .rs-network-dropdown-menu, .rs-network-dropdown.is-open > .rs-network-dropdown-menu { display: block !important; }',
      '@media (hover: hover) and (pointer: fine) { .rs-network-bar .rs-network-dropdown:hover > .rs-network-dropdown-menu, .rs-network-dropdown:hover > .rs-network-dropdown-menu { display: block !important; } }',
      '.rs-network-dropdown-menu > li { list-style: none !important; margin: 0 !important; padding: 0 !important; }',
      '.rs-network-dropdown-header { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.64rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #fbbf24 !important; padding: 0.35rem 0.55rem 0.2rem; }',
      '.rs-network-dropdown-divider { height: 1px; background-color: rgba(148, 163, 184, 0.25); margin: 0.3rem 0.25rem; }',
      '.rs-network-dropdown-menu a { display: flex !important; align-items: center; gap: 0.45rem; width: 100%; padding: 0.38rem 0.6rem !important; border-radius: 0.38rem; font-size: 0.76rem !important; font-weight: 600; color: #f1f5f9 !important; background-color: transparent !important; text-decoration: none !important; border: 1px solid transparent !important; white-space: nowrap; }',
      '.rs-network-dropdown-menu a:hover, .rs-network-dropdown-menu a:focus-visible { background-color: #1e293b !important; color: #38bdf8 !important; border-color: rgba(56, 189, 248, 0.45) !important; }',
      '.rs-network-dropdown-menu a.is-active, .rs-network-dropdown-menu a[aria-current="page"] { background-color: rgba(56, 189, 248, 0.2) !important; color: #38bdf8 !important; border-color: rgba(56, 189, 248, 0.6) !important; font-weight: 700; }',
      '.rs-mobile-network-section { display: none; width: 100%; margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid rgba(148, 163, 184, 0.28); }',
      '.rs-mobile-network-title { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #fbbf24; margin-bottom: 0.5rem; padding: 0 0.25rem; display: flex; align-items: center; gap: 0.35rem; }',
      '[data-bs-theme="light"] .rs-mobile-network-title, [data-theme="light"] .rs-mobile-network-title, [data-color-scheme="light"] .rs-mobile-network-title, html.light .rs-mobile-network-title { color: #854d0e !important; }',
      '.rs-mobile-network-grid { display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.35rem; list-style: none !important; margin: 0 !important; padding: 0 !important; }',
      '.rs-mobile-network-grid > li { list-style: none !important; margin: 0 !important; padding: 0 !important; }',
      '.rs-mobile-network-link { display: flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.55rem; border-radius: 0.45rem; font-size: 0.76rem; font-weight: 600; text-decoration: none !important; color: #e2e8f0; background-color: rgba(15, 23, 42, 0.78); border: 1px solid rgba(148, 163, 184, 0.24); line-height: 1.2; min-width: 0; }',
      '[data-bs-theme="light"] .rs-mobile-network-link, [data-theme="light"] .rs-mobile-network-link, [data-color-scheme="light"] .rs-mobile-network-link, html.light .rs-mobile-network-link { color: #0f172a !important; background-color: #f1f5f9 !important; border-color: #64748b !important; }',
      '.rs-mobile-network-link.is-active, .rs-mobile-network-link[aria-current="page"] { background-color: rgba(56, 189, 248, 0.18); color: #38bdf8; border-color: rgba(56, 189, 248, 0.6); font-weight: 700; }',
      '[data-bs-theme="light"] .rs-mobile-network-link.is-active, [data-bs-theme="light"] .rs-mobile-network-link[aria-current="page"], [data-theme="light"] .rs-mobile-network-link.is-active, [data-theme="light"] .rs-mobile-network-link[aria-current="page"], [data-color-scheme="light"] .rs-mobile-network-link.is-active, [data-color-scheme="light"] .rs-mobile-network-link[aria-current="page"] { background-color: #e0f2fe !important; color: #0c4a6e !important; border-color: #0284c7 !important; }',
      '.rs-mobile-network-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
      '@media (max-width: 1120px) { body.rs-has-primary-nav .rs-network-bar { display: none !important; } .rs-mobile-network-section[data-rs-breakpoint="1120"] { display: block !important; } }',
      '@media (max-width: 767.98px) { body.rs-has-md-nav .rs-network-bar { display: none !important; } .rs-mobile-network-section[data-rs-breakpoint="768"] { display: block !important; } }',
      '.rs-mobile-network-section[data-rs-breakpoint="always"] { display: block !important; }',
      '@media (display-mode: standalone), (display-mode: window-controls-overlay), (display-mode: minimal-ui), (display-mode: fullscreen) { .rs-network-bar, .rs-mobile-network-section { display: none !important; } }',
      'html.is-pwa-standalone .rs-network-bar, html.is-pwa-standalone .rs-mobile-network-section, body.is-pwa-standalone .rs-network-bar, body.is-pwa-standalone .rs-mobile-network-section { display: none !important; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  /**
   * Builds the HTML for the `⚙️ Engine Room ▾` dropdown `<li>` item on `.rs-network-bar`.
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
        '<li role="none">' +
        '<a role="menuitem" href="' + band.href + '"' +
        (active ? ' class="is-active" aria-current="page"' : '') +
        ' data-no-spa="true">' +
        '<span aria-hidden="true">' + band.icon + '</span>' +
        '<span>' + band.name + '</span>' +
        '</a>' +
        '</li>'
      );
    }).join('');

    return (
      '<li class="rs-network-dropdown">' +
      '<button type="button" class="rs-network-dropdown-toggle' +
      (isEngineRoomGroupActive ? ' is-active' : '') +
      '" aria-expanded="false" aria-haspopup="true">' +
      '<span aria-hidden="true">⚙️</span>' +
      '<span>Engine Room</span>' +
      '<span class="rs-network-caret" aria-hidden="true">▾</span>' +
      '</button>' +
      '<ul class="rs-network-dropdown-menu" role="menu" aria-label="Engine Room Records & Band Roster">' +
      '<li role="none">' +
      '<a role="menuitem" href="https://engineroom.raggiesoft.com"' +
      (isImprintHomeActive ? ' class="is-active" aria-current="page"' : '') +
      ' data-no-spa="true">' +
      '<span aria-hidden="true">⚙️</span>' +
      '<span>Engine Room Records Hub</span>' +
      '</a>' +
      '</li>' +
      '<li role="none">' +
      '<a role="menuitem" href="https://music.raggiesoft.com"' +
      (isListeningRoomActive ? ' class="is-active" aria-current="page"' : '') +
      ' data-no-spa="true">' +
      '<span aria-hidden="true">🎧</span>' +
      '<span>The Listening Room</span>' +
      '</a>' +
      '</li>' +
      '<li role="none">' +
      '<a role="menuitem" href="https://engineroom.raggiesoft.com/artists"' +
      (isArtistsDirActive ? ' class="is-active" aria-current="page"' : '') +
      ' data-no-spa="true">' +
      '<span aria-hidden="true">🎸</span>' +
      '<span>All Artists Directory (7)</span>' +
      '</a>' +
      '</li>' +
      '<li class="rs-network-dropdown-divider" role="separator"></li>' +
      '<li class="rs-network-dropdown-header" role="presentation">✦ Band Roster (A–Z)</li>' +
      bandsHtml +
      '</ul>' +
      '</li>'
    );
  }

  /**
   * Global delegated state for `.rs-network-dropdown` so that even if React/Svelte/Angular
   * hydrates or replaces `.rs-network-bar` nodes, hover grace periods and click toggling
   * never break or get stuck open.
   */
  var dropdownCloseTimer = null;
  var dropdownPinnedByClick = false;

  function setDropdownOpenState(isOpen) {
    var dropdownLi = document.querySelector('.rs-network-dropdown');
    if (!dropdownLi) return;
    var toggleBtn = dropdownLi.querySelector('.rs-network-dropdown-toggle');
    if (isOpen) {
      dropdownLi.classList.add('is-open');
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
    } else {
      dropdownLi.classList.remove('is-open');
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
    }
  }

  function ensureGlobalDropdownDelegation() {
    if (window.__rsNetworkDropdownBound) return;
    window.__rsNetworkDropdownBound = true;

    /* Pointer tracking with a 220ms grace period when moving from button to menu */
    document.addEventListener('pointerover', function (e) {
      var target = e.target;
      if (!target || typeof target.closest !== 'function') return;
      if (target.closest('.rs-network-dropdown')) {
        if (dropdownCloseTimer) {
          clearTimeout(dropdownCloseTimer);
          dropdownCloseTimer = null;
        }
        setDropdownOpenState(true);
      }
    });

    document.addEventListener('mousemove', function (e) {
      var target = e.target;
      if (!target || typeof target.closest !== 'function') return;
      if (target.closest('.rs-network-dropdown')) {
        if (dropdownCloseTimer) {
          clearTimeout(dropdownCloseTimer);
          dropdownCloseTimer = null;
        }
        setDropdownOpenState(true);
      } else if (!dropdownPinnedByClick) {
        var dropdownLi = document.querySelector('.rs-network-dropdown');
        if (dropdownLi && dropdownLi.classList.contains('is-open') && !dropdownCloseTimer) {
          dropdownCloseTimer = setTimeout(function () {
            dropdownCloseTimer = null;
            if (!dropdownPinnedByClick) {
              setDropdownOpenState(false);
            }
          }, 220);
        }
      }
    });

    document.addEventListener('click', function (e) {
      var target = e.target;
      if (!target || typeof target.closest !== 'function') return;
      var toggleBtn = target.closest('.rs-network-dropdown-toggle');
      var dropdownLi = document.querySelector('.rs-network-dropdown');
      if (toggleBtn && dropdownLi) {
        e.stopPropagation();
        if (dropdownCloseTimer) {
          clearTimeout(dropdownCloseTimer);
          dropdownCloseTimer = null;
        }
        if (dropdownLi.classList.contains('is-open') && dropdownPinnedByClick) {
          dropdownPinnedByClick = false;
          setDropdownOpenState(false);
        } else {
          dropdownPinnedByClick = true;
          setDropdownOpenState(true);
        }
        return;
      }

      if (dropdownLi && !dropdownLi.contains(target) && dropdownLi.classList.contains('is-open')) {
        dropdownPinnedByClick = false;
        setDropdownOpenState(false);
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var dropdownLi = document.querySelector('.rs-network-dropdown');
        if (dropdownLi && dropdownLi.classList.contains('is-open')) {
          dropdownPinnedByClick = false;
          setDropdownOpenState(false);
          var toggleBtn = dropdownLi.querySelector('.rs-network-dropdown-toggle');
          if (toggleBtn) toggleBtn.focus();
        }
      }
    });
  }

  /**
   * Upgrades `.rs-network-bar` on any page so that:
   * 1. Semantic classes (`.rs-network-bar-inner`, `.rs-network-label`, `.rs-network-links`)
   *    are normalized automatically.
   * 2. Standalone top-level `stardust.raggiesoft.com` and `music.raggiesoft.com` links
   *    are consolidated into the `⚙️ Engine Room ▾` dropdown menu.
   * 3. If a client framework (e.g. React 19 hydration on `lore.raggiesoft.com`) overwrote
   *    the DOM back to a flat link list, it re-upgrades `.rs-network-dropdown` automatically.
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

    var existingDropdown = linksList.querySelector('.rs-network-dropdown');
    var hasLegacyTopLevelLinks = false;
    var topAnchors = Array.prototype.slice.call(linksList.querySelectorAll(':scope > li > a'));
    topAnchors.forEach(function (a) {
      var href = (a.getAttribute('href') || '').toLowerCase();
      if (
        href.indexOf('stardust.raggiesoft.com') !== -1 ||
        href.indexOf('music.raggiesoft.com') !== -1 ||
        href.indexOf('lore.raggiesoft.com') !== -1
      ) {
        hasLegacyTopLevelLinks = true;
      }
    });

    if (!existingDropdown || hasLegacyTopLevelLinks || !linksList.getAttribute('data-rs-upgraded')) {
      linksList.setAttribute('data-rs-upgraded', 'true');

      /* Remove standalone top-level stardust, music, and unlaunched lore links if present in static HTML */
      topAnchors.forEach(function (a) {
        var href = (a.getAttribute('href') || '').toLowerCase();
        if (
          href.indexOf('stardust.raggiesoft.com') !== -1 ||
          href.indexOf('music.raggiesoft.com') !== -1 ||
          href.indexOf('lore.raggiesoft.com') !== -1
        ) {
          var parentLi = a.parentElement;
          if (parentLi && parentLi.parentElement === linksList) {
            linksList.removeChild(parentLi);
          }
        }
      });

      /* Replace or upgrade the Engine Room <li> with the Band Roster dropdown */
      existingDropdown = linksList.querySelector('.rs-network-dropdown');
      var dropdownHtml = buildEngineRoomDropdownLiHtml(currentHost, currentPath);

      if (existingDropdown) {
        existingDropdown.outerHTML = dropdownHtml;
      } else {
        var engineAnchor = null;
        var remainingAnchors = Array.prototype.slice.call(linksList.querySelectorAll(':scope > li > a'));
        for (var i = 0; i < remainingAnchors.length; i++) {
          var h = (remainingAnchors[i].getAttribute('href') || '').toLowerCase();
          if (h.indexOf('engineroom.raggiesoft.com') !== -1) {
            engineAnchor = remainingAnchors[i];
            break;
          }
        }
        if (engineAnchor && engineAnchor.parentElement) {
          engineAnchor.parentElement.outerHTML = dropdownHtml;
        } else {
          linksList.insertAdjacentHTML('beforeend', dropdownHtml);
        }
      }
    }
  }

  function buildMobileGridHtml(breakpointAttr) {
    var currentHost = getCurrentHost();
    var currentPath = getCurrentPathname();

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

    return (
      '<div class="rs-mobile-network-section" data-rs-breakpoint="' + breakpointAttr + '" role="region" aria-label="RaggieSoft Ecosystem Switcher">' +
      '<div class="rs-mobile-network-title">✦ Switch RaggieSoft Property</div>' +
      '<ul class="rs-mobile-network-grid">' +
      itemsHtml +
      '</ul>' +
      '<div class="rs-mobile-network-title" style="margin-top: 0.65rem;">⚙️ Engine Room Records &amp; Bands (A–Z)</div>' +
      '<ul class="rs-mobile-network-grid">' +
      listeningRoomMobileItem +
      bandsHtml +
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
    ensureNetworkStylesInjected();
    ensureStandaloneExternalLinkRouting();
    if (!document.body) return;

    /* Native PWA Immersion Guard: hide network bar & skip mobile network grid when running as an installed PWA */
    if (isStandalonePwa()) {
      document.documentElement.classList.add('is-pwa-standalone');
      document.body.classList.add('is-pwa-standalone');
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

  if (typeof window !== 'undefined') {
    window.initRaggieSoftNetworkMenu = initRaggieSoftNetworkMenu;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRaggieSoftNetworkMenu);
  } else {
    initRaggieSoftNetworkMenu();
    setTimeout(initRaggieSoftNetworkMenu, 300);
  }

  /* Re-run on window load and after SPA route transitions (Elara CMS & Stardust Book Reader) */
  window.addEventListener('load', initRaggieSoftNetworkMenu);
  document.addEventListener('elara:loaded', initRaggieSoftNetworkMenu);
  window.addEventListener('popstate', function () {
    setTimeout(initRaggieSoftNetworkMenu, 100);
  });

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
})();

