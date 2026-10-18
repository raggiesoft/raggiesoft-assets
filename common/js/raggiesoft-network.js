/**
 * @license MIT
 * ============================================================================
 * raggiesoft-assets/common/js/raggiesoft-network.js
 * ============================================================================
 * Architectural Overview:
 * Unified Omnidirectional Ecosystem Navigation, Multi-Dropdown Menu Engine
 * (`📚 Ocean View ▾`, `⚙️ Engine Room ▾`, `👔 M. P. Ragsdale ▾`), Native PWA
 * Immersion Guard, & Mobile Single-Hamburger Enhancer shared across all
 * RaggieSoft properties:
 *   1. raggiesoft.com (Hub)
 *   2. nebulae.raggiesoft.com (Nebulae Atlas)
 *   3. books.raggiesoft.com (Ocean View Archives + Literary Universes Menu)
 *      └── Flagship Literary Universes:
 *          • Ocean View Archives Hub (books.raggiesoft.com)
 *          • Contemporary Fiction (books.raggiesoft.com/#contemporary-fiction)
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
 *  10. michaelpragsdale.com (Executive Dossier + The Build Team Menu)
 *      └── The Build Team & DevOps Family (/build-team):
 *          • Michael (michaelpragsdale.com/build-team/michael)
 *          • Paige — Safe Person & Editor (michaelpragsdale.com/build-team/paige)
 *          • Jessica — Production VPS (michaelpragsdale.com/build-team/jessica)
 *          • Harper — Studio Engineer (michaelpragsdale.com/build-team/harper)
 *          • Jenna — Release & CDN Sync (michaelpragsdale.com/build-team/jenna)
 *          • Sarah — Autonomous Deployer (michaelpragsdale.com/build-team/sarah)
 *          • Amanda & Elara — Root & Router (michaelpragsdale.com/build-team/amanda-elara)
 * ============================================================================
 */
(function () {
  'use strict';

  /**
   * Top-level RaggieSoft properties for the Mobile Network Switcher (4x2 balanced grid).
   */
  var NETWORK_SITES = [
    { id: 'hub', href: 'https://raggiesoft.com', host: 'raggiesoft.com', icon: '🌐', label: 'RaggieSoft Hub' },
    { id: 'nebulae', href: 'https://nebulae.raggiesoft.com', host: 'nebulae.raggiesoft.com', icon: '🌌', label: 'Nebulae Atlas' },
    { id: 'books', href: 'https://books.raggiesoft.com', host: 'books.raggiesoft.com', icon: '📚', label: 'Ocean View Archives' },
    { id: 'music', href: 'https://music.raggiesoft.com', host: 'music.raggiesoft.com', icon: '🎧', label: 'The Listening Room' },
    { id: 'engineroom', href: 'https://engineroom.raggiesoft.com', host: 'engineroom.raggiesoft.com', icon: '⚙️', label: 'Engine Room' },
    { id: 'corporate', href: 'https://corporate.raggiesoft.com', host: 'corporate.raggiesoft.com', icon: '🏢', label: 'Corporate Media' },
    { id: 'storetrainer', href: 'https://storetrainer.raggiesoft.com', host: 'storetrainer.raggiesoft.com', icon: '💾', label: 'StoreTrainer' },
    { id: 'portfolio', href: 'https://michaelpragsdale.com', host: 'michaelpragsdale.com', icon: '👔', label: 'M. P. Ragsdale' }
  ];

  /**
   * Ocean View Archives Flagship Literary Universes (`books.raggiesoft.com`).
   */
  var OCEAN_VIEW_ITEMS = [
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
   * M. P. Ragsdale Build Team & DevOps Family (`michaelpragsdale.com/build-team/*`).
   */
  var BUILD_TEAM_MEMBERS = [
    {
      slug: 'michael',
      name: 'Michael (The Architect)',
      mobileLabel: 'Michael (Architect)',
      href: 'https://michaelpragsdale.com/build-team/michael',
      icon: '🧠'
    },
    {
      slug: 'paige',
      name: 'Paige (paige.php — Safe Person)',
      mobileLabel: 'Paige (Safe Person)',
      href: 'https://michaelpragsdale.com/build-team/paige',
      icon: '👩‍🏫'
    },
    {
      slug: 'jessica',
      name: 'Jessica (jessica.raggiesoft.com)',
      mobileLabel: 'Jessica (VPS Infra)',
      href: 'https://michaelpragsdale.com/build-team/jessica',
      icon: '🖥️'
    },
    {
      slug: 'harper',
      name: 'Harper (harper.sh — Studio)',
      mobileLabel: 'Harper (harper.sh)',
      href: 'https://michaelpragsdale.com/build-team/harper',
      icon: '🎧'
    },
    {
      slug: 'jenna',
      name: 'Jenna (jenna-sync.sh — Sync)',
      mobileLabel: 'Jenna (jenna-sync.sh)',
      href: 'https://michaelpragsdale.com/build-team/jenna',
      icon: '👱‍♀️'
    },
    {
      slug: 'sarah',
      name: 'Sarah (sarah-deploy.sh — Deploy)',
      mobileLabel: 'Sarah (sarah-deploy.sh)',
      href: 'https://michaelpragsdale.com/build-team/sarah',
      icon: '🛡️'
    },
    {
      slug: 'amanda-elara',
      name: 'Amanda & Elara (Root & Router)',
      mobileLabel: 'Amanda & Elara',
      href: 'https://michaelpragsdale.com/build-team/amanda-elara',
      icon: '🌱'
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

  function isOceanViewItemActive(item, currentHost, currentPath) {
    if (currentHost !== 'books.raggiesoft.com') return false;
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

  function isBuildTeamMemberActive(member, currentHost, currentPath) {
    return (
      currentHost === 'michaelpragsdale.com' &&
      currentPath === '/build-team/' + member.slug
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
   * and `.rs-mobile-network-section` render cleanly across all viewports, scroll
   * internally without clipping on iOS Safari, and hide automatically inside
   * installed native PWAs.
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
      '.rs-mobile-submenu-summary { list-style: none; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; padding: 0.48rem 0.65rem; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #fbbf24; cursor: pointer; user-select: none; }',
      '.rs-mobile-submenu-summary::-webkit-details-marker { display: none; }',
      '.rs-mobile-submenu-caret { font-size: 0.75rem; transition: transform 0.15s ease; }',
      '.rs-mobile-submenu[open] .rs-mobile-submenu-caret { transform: rotate(180deg); }',
      '.rs-mobile-submenu-body { padding: 0.2rem 0.5rem 0.55rem; border-top: 1px solid rgba(148, 163, 184, 0.2); }',
      '[data-bs-theme="light"] .rs-mobile-submenu, [data-theme="light"] .rs-mobile-submenu, [data-color-scheme="light"] .rs-mobile-submenu, html.light .rs-mobile-submenu { background-color: #f8fafc !important; border-color: #94a3b8 !important; }',
      '[data-bs-theme="light"] .rs-mobile-submenu-summary, [data-theme="light"] .rs-mobile-submenu-summary, [data-color-scheme="light"] .rs-mobile-submenu-summary, html.light .rs-mobile-submenu-summary { color: #854d0e !important; }',
      '@media (max-width: 1120px) { body.rs-has-primary-nav .rs-network-bar { display: none !important; } .rs-mobile-network-section[data-rs-breakpoint="1120"] { display: block !important; } #primary-navigation { max-height: calc(100vh - 4.5rem) !important; max-height: calc(100dvh - 4.5rem) !important; overflow-y: auto !important; overflow-x: hidden !important; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; padding-bottom: calc(3.25rem + env(safe-area-inset-bottom, 0px)) !important; } }',
      '@media (max-width: 767.98px) { body.rs-has-md-nav .rs-network-bar { display: none !important; } .rs-mobile-network-section[data-rs-breakpoint="768"] { display: block !important; } #header-navigation-panel, #navbarCollapse, #music-mobile-navigation, .rs-standalone-network-bar.is-open .rs-network-links { max-height: calc(100vh - 4.5rem) !important; max-height: calc(100dvh - 4.5rem) !important; overflow-y: auto !important; overflow-x: hidden !important; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; padding-bottom: calc(3.25rem + env(safe-area-inset-bottom, 0px)) !important; } .rs-standalone-network-bar { position: sticky !important; top: 0 !important; z-index: 1055 !important; } .rs-standalone-network-bar .rs-network-mobile-toggle { display: inline-flex !important; } .rs-standalone-network-bar .rs-network-links { display: none !important; width: 100%; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.4rem; padding-top: 0.5rem; margin-top: 0.35rem; border-top: 1px solid rgba(148, 163, 184, 0.28); } .rs-standalone-network-bar.is-open .rs-network-links { display: grid !important; } .rs-standalone-network-bar .rs-network-links > li > a, .rs-standalone-network-bar .rs-network-dropdown-toggle { width: 100% !important; min-height: 38px; padding: 0.4rem 0.6rem !important; background-color: rgba(30, 41, 59, 0.75) !important; border-color: rgba(148, 163, 184, 0.3) !important; justify-content: flex-start; } .rs-standalone-network-bar .rs-network-dropdown { display: flex !important; flex-direction: column; align-items: stretch; } .rs-standalone-network-bar .rs-network-dropdown.is-open { grid-column: 1 / -1; } .rs-standalone-network-bar .rs-network-dropdown-menu { position: static !important; width: 100% !important; margin-top: 0.35rem !important; box-shadow: none !important; } }',
      '.rs-mobile-network-section[data-rs-breakpoint="always"] { display: block !important; }',
      '@media (display-mode: standalone), (display-mode: window-controls-overlay), (display-mode: minimal-ui), (display-mode: fullscreen) { .rs-network-bar, .rs-mobile-network-section { display: none !important; } }',
      'html.is-pwa-standalone .rs-network-bar, html.is-pwa-standalone .rs-mobile-network-section, body.is-pwa-standalone .rs-network-bar, body.is-pwa-standalone .rs-mobile-network-section { display: none !important; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  /**
   * 1. Builds the HTML for the `📚 Ocean View ▾` dropdown `<li>` item on `.rs-network-bar`.
   */
  function buildOceanViewDropdownLiHtml(currentHost, currentPath) {
    var isOceanViewGroupActive = currentHost === 'books.raggiesoft.com';
    var isImprintHomeActive =
      currentHost === 'books.raggiesoft.com' &&
      (currentPath === '/' || currentPath === '/home');

    var universesHtml = OCEAN_VIEW_ITEMS.map(function (item) {
      var active = isOceanViewItemActive(item, currentHost, currentPath);
      return (
        '<li role="none">' +
        '<a role="menuitem" href="' + item.href + '"' +
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
      '" aria-expanded="false" aria-haspopup="true">' +
      '<span aria-hidden="true">📚</span>' +
      '<span>Ocean View</span>' +
      '<span class="rs-network-caret" aria-hidden="true">▾</span>' +
      '</button>' +
      '<ul class="rs-network-dropdown-menu" role="menu" aria-label="Ocean View Archives & Literary Universes">' +
      '<li role="none">' +
      '<a role="menuitem" href="https://books.raggiesoft.com"' +
      (isImprintHomeActive ? ' class="is-active" aria-current="page"' : '') +
      ' data-no-spa="true">' +
      '<span aria-hidden="true">📚</span>' +
      '<span>Ocean View Archives Hub</span>' +
      '</a>' +
      '</li>' +
      '<li class="rs-network-dropdown-divider" role="separator"></li>' +
      '<li class="rs-network-dropdown-header" role="presentation">✦ Flagship Literary Universes</li>' +
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
      '<li class="rs-network-dropdown" data-rs-dropdown="engineroom">' +
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
   * 3. Builds the HTML for the `👔 M. P. Ragsdale ▾` dropdown `<li>` item on `.rs-network-bar`.
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
        '<li role="none">' +
        '<a role="menuitem" href="' + member.href + '"' +
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
      '" aria-expanded="false" aria-haspopup="true">' +
      '<span aria-hidden="true">👔</span>' +
      '<span>M. P. Ragsdale</span>' +
      '<span class="rs-network-caret" aria-hidden="true">▾</span>' +
      '</button>' +
      '<ul class="rs-network-dropdown-menu" role="menu" aria-label="Michael P. Ragsdale & The Build Team">' +
      '<li role="none">' +
      '<a role="menuitem" href="https://michaelpragsdale.com"' +
      (isDossierHomeActive ? ' class="is-active" aria-current="page"' : '') +
      ' data-no-spa="true">' +
      '<span aria-hidden="true">👔</span>' +
      '<span>Executive Dossier (Home)</span>' +
      '</a>' +
      '</li>' +
      '<li role="none">' +
      '<a role="menuitem" href="https://michaelpragsdale.com/build-team"' +
      (isBuildTeamOverviewActive ? ' class="is-active" aria-current="page"' : '') +
      ' data-no-spa="true">' +
      '<span aria-hidden="true">👥</span>' +
      '<span>The Build Team (Overview)</span>' +
      '</a>' +
      '</li>' +
      '<li class="rs-network-dropdown-divider" role="separator"></li>' +
      '<li class="rs-network-dropdown-header" role="presentation">✦ Build Team &amp; DevOps Family</li>' +
      membersHtml +
      '</ul>' +
      '</li>'
    );
  }

  /**
   * Builds the complete canonical `<ul>` innerHTML for `.rs-network-links`.
   */
  function buildDesktopNetworkLinksHtml(currentHost, currentPath) {
    var isHubActive = currentHost === 'raggiesoft.com';
    var isNebulaeActive = currentHost === 'nebulae.raggiesoft.com';
    var isCorporateActive = currentHost === 'corporate.raggiesoft.com';
    var isStoreTrainerActive = currentHost === 'storetrainer.raggiesoft.com';

    return [
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
    ].join('');
  }

  /**
   * Global delegated state for all `.rs-network-dropdown` menus (`📚 Ocean View ▾`,
   * `⚙️ Engine Room ▾`, and `👔 M. P. Ragsdale ▾`).
   * Guarantees only one dropdown is open at any moment, provides a 220ms hover
   * grace period across the button-to-menu bridge, and supports click-pinning
   * and keyboard `Escape` dismissal.
   */
  var dropdownCloseTimer = null;
  var dropdownPinnedByClick = false;

  function closeAllDropdowns() {
    var allDropdowns = document.querySelectorAll('.rs-network-dropdown');
    for (var i = 0; i < allDropdowns.length; i++) {
      allDropdowns[i].classList.remove('is-open');
      var btn = allDropdowns[i].querySelector('.rs-network-dropdown-toggle');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
  }

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
    if (window.__rsNetworkDropdownBound) return;
    window.__rsNetworkDropdownBound = true;

    /* Pointer tracking with a 220ms grace period when moving from button to menu */
    document.addEventListener('pointerover', function (e) {
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

    document.addEventListener('mousemove', function (e) {
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
   * Upgrades `.rs-network-bar` on any page so that:
   * 1. Semantic classes (`.rs-network-bar-inner`, `.rs-network-label`, `.rs-network-links`)
   *    are normalized automatically.
   * 2. All 3 dropdown menus (`📚 Ocean View ▾`, `⚙️ Engine Room ▾`, `👔 M. P. Ragsdale ▾`)
   *    are rendered consistently across every property.
   * 3. Active states update automatically on SPA route changes.
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

  var mobileAccordionListenerAttached = false;
  function ensureMobileAccordionBehavior() {
    if (mobileAccordionListenerAttached || typeof document === 'undefined') return;
    mobileAccordionListenerAttached = true;

    document.addEventListener(
      'toggle',
      function (event) {
        var target = event.target;
        if (!target || !target.classList || !target.classList.contains('rs-mobile-submenu')) return;
        if (!target.open) return;
        var parent = target.parentElement;
        if (!parent) return;
        var siblings = parent.querySelectorAll('details.rs-mobile-submenu[open]');
        for (var i = 0; i < siblings.length; i++) {
          if (siblings[i] !== target) {
            siblings[i].removeAttribute('open');
          }
        }
      },
      true
    );
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

    var isBuildTeamOverviewActive =
      currentHost === 'michaelpragsdale.com' && currentPath === '/build-team';
    var buildTeamOverviewItem =
      '<li>' +
      '<a href="https://michaelpragsdale.com/build-team" class="rs-mobile-network-link' + (isBuildTeamOverviewActive ? ' is-active' : '') + '"' +
      (isBuildTeamOverviewActive ? ' aria-current="page"' : '') +
      ' data-no-spa="true">' +
      '<span class="rs-mobile-network-icon" aria-hidden="true">👥</span>' +
      '<span class="rs-mobile-network-text">Build Team Overview</span>' +
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
      '<details class="rs-mobile-submenu">' +
      '<summary class="rs-mobile-submenu-summary">' +
      '<span>📚 Ocean View Archives — Universes &amp; Lore</span>' +
      '<span class="rs-mobile-submenu-caret" aria-hidden="true">▾</span>' +
      '</summary>' +
      '<div class="rs-mobile-submenu-body">' +
      '<ul class="rs-mobile-network-grid">' +
      oceanViewHtml +
      '</ul>' +
      '</div>' +
      '</details>' +
      '<details class="rs-mobile-submenu">' +
      '<summary class="rs-mobile-submenu-summary">' +
      '<span>⚙️ Engine Room Records — Bands (A–Z)</span>' +
      '<span class="rs-mobile-submenu-caret" aria-hidden="true">▾</span>' +
      '</summary>' +
      '<div class="rs-mobile-submenu-body">' +
      '<ul class="rs-mobile-network-grid">' +
      listeningRoomMobileItem +
      engineRoomHubMobileItem +
      bandsHtml +
      '</ul>' +
      '</div>' +
      '</details>' +
      '<details class="rs-mobile-submenu">' +
      '<summary class="rs-mobile-submenu-summary">' +
      '<span>👔 M. P. Ragsdale — The Build Team</span>' +
      '<span class="rs-mobile-submenu-caret" aria-hidden="true">▾</span>' +
      '</summary>' +
      '<div class="rs-mobile-submenu-body">' +
      '<ul class="rs-mobile-network-grid">' +
      buildTeamOverviewItem +
      buildTeamHtml +
      '</ul>' +
      '</div>' +
      '</details>' +
      '</div>' +
      '</div>'
    );
  }

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
