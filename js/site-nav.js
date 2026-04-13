document.addEventListener('DOMContentLoaded', function () {
  const navs = Array.from(document.querySelectorAll('[data-site-nav]'));
  const affixOffset = 100;
  const anchorSelectionHoldMs = 1600;
  const routeTransitionDurationMs = 180;
  const prefetchedNavTargets = new Set();
  const navItems = [
    {
      key: 'contact',
      label: 'Contact',
      href: '/#contact',
      homeHref: '#contact',
      usePageScrollOnHome: true,
    },
    {
      key: 'about',
      label: 'About',
      href: '/#about',
      homeHref: '#about',
      usePageScrollOnHome: true,
    },
    {
      key: 'coldsnap',
      label: 'ColdSnap',
      href: '/coldsnap/',
    },
    {
      key: 'stuff',
      label: 'Stuff',
      href: '/Portfolio/',
      secondary: true,
    },
  ];

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function parseColor(value) {
    if (!value) {
      return null;
    }

    const normalized = value.trim();
    if (!normalized || normalized === 'transparent') {
      return null;
    }

    const hexMatch = normalized.match(/^#([\da-f]{3}|[\da-f]{6})$/i);
    if (hexMatch) {
      const hex = hexMatch[1];
      const expanded = hex.length === 3
        ? hex.split('').map(function (char) { return char + char; }).join('')
        : hex;

      return {
        r: parseInt(expanded.slice(0, 2), 16),
        g: parseInt(expanded.slice(2, 4), 16),
        b: parseInt(expanded.slice(4, 6), 16),
        a: 1,
      };
    }

    const rgbMatch = normalized.match(/^rgba?\(([^)]+)\)$/i);
    if (!rgbMatch) {
      return null;
    }

    const channels = rgbMatch[1].split(',').map(function (channel) {
      return channel.trim();
    });

    if (channels.length < 3) {
      return null;
    }

    return {
      r: parseFloat(channels[0]),
      g: parseFloat(channels[1]),
      b: parseFloat(channels[2]),
      a: channels[3] === undefined ? 1 : parseFloat(channels[3]),
    };
  }

  function colorToRgbString(color, alpha) {
    const resolvedAlpha = alpha === undefined ? (color.a === undefined ? 1 : color.a) : alpha;
    return 'rgba(' + Math.round(color.r) + ', ' + Math.round(color.g) + ', ' + Math.round(color.b) + ', ' + resolvedAlpha + ')';
  }

  function mixColors(base, overlay, amount) {
    const ratio = clamp(amount, 0, 1);

    return {
      r: base.r + (overlay.r - base.r) * ratio,
      g: base.g + (overlay.g - base.g) * ratio,
      b: base.b + (overlay.b - base.b) * ratio,
      a: 1,
    };
  }

  function relativeLuminance(color) {
    function channel(value) {
      const normalized = value / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    }

    return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
  }

  function getCssColor(source, propertyName) {
    return parseColor(getComputedStyle(source).getPropertyValue(propertyName));
  }

  function findBackgroundSource(nav) {
    let candidate = nav.nextElementSibling;

    while (candidate) {
      const styles = getComputedStyle(candidate);
      const backgroundColor = parseColor(styles.backgroundColor);
      if (backgroundColor || styles.backgroundImage !== 'none') {
        return {
          backgroundColor: backgroundColor,
          hasBackgroundImage: styles.backgroundImage !== 'none',
        };
      }
      candidate = candidate.nextElementSibling;
    }

    const bodyStyles = getComputedStyle(document.body);
    return {
      backgroundColor: parseColor(bodyStyles.backgroundColor),
      hasBackgroundImage: bodyStyles.backgroundImage !== 'none',
    };
  }

  function applyNavPalette(nav) {
    const root = document.documentElement;
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const accent = getCssColor(root, '--accent')
      || parseColor(metaThemeColor ? metaThemeColor.getAttribute('content') : '')
      || { r: 240, g: 95, b: 64, a: 1 };
    const accentDark = getCssColor(root, '--accent-dark')
      || mixColors(accent, { r: 0, g: 0, b: 0, a: 1 }, 0.18);
    const backgroundSource = findBackgroundSource(nav);
    const fallbackBackground = { r: 255, g: 255, b: 255, a: 1 };
    const pageBackground = backgroundSource.backgroundColor || getCssColor(root, '--bg-dark') || fallbackBackground;
    const hasHeroImage = backgroundSource.hasBackgroundImage;
    const isDarkSurface = hasHeroImage || relativeLuminance(pageBackground) < 0.42;
    const solidBackground = isDarkSurface
      ? mixColors(pageBackground, { r: 0, g: 0, b: 0, a: 1 }, 0.24)
      : { r: 255, g: 255, b: 255, a: 1 };
    const solidText = isDarkSurface
      ? { r: 240, g: 240, b: 240, a: 1 }
      : { r: 34, g: 34, b: 34, a: 1 };
    const solidBorder = isDarkSurface
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(34, 34, 34, 0.05)';
    const solidTextSoft = isDarkSurface
      ? 'rgba(240, 240, 240, 0.7)'
      : 'rgba(34, 34, 34, 0.74)';
    const overlayBase = isDarkSurface
      ? mixColors(pageBackground, { r: 0, g: 0, b: 0, a: 1 }, 0.18)
      : mixColors(pageBackground, { r: 255, g: 255, b: 255, a: 1 }, 0.08);
    const overlayText = isDarkSurface
      ? { r: 255, g: 255, b: 255, a: 0.88 }
      : { r: 24, g: 28, b: 34, a: 0.88 };
    const overlayBorder = isDarkSurface
      ? { r: 255, g: 255, b: 255, a: 0.16 }
      : { r: 24, g: 28, b: 34, a: 0.12 };
    const mobileOverlayBase = isDarkSurface
      ? mixColors(pageBackground, { r: 0, g: 0, b: 0, a: 1 }, 0.34)
      : mixColors(pageBackground, { r: 255, g: 255, b: 255, a: 1 }, 0.18);
    const menuBackground = isDarkSurface
      ? mixColors(pageBackground, { r: 0, g: 0, b: 0, a: 1 }, 0.5)
      : mixColors(pageBackground, { r: 255, g: 255, b: 255, a: 1 }, 0.26);

    nav.style.setProperty('--site-nav-accent', colorToRgbString(accent));
    nav.style.setProperty('--site-nav-accent-dark', colorToRgbString(accentDark));
    nav.style.setProperty('--site-nav-bg', colorToRgbString(solidBackground));
    nav.style.setProperty('--site-nav-bg-strong', colorToRgbString(solidBackground));
    nav.style.setProperty('--site-nav-border', solidBorder);
    nav.style.setProperty('--site-nav-border-soft', solidBorder);
    nav.style.setProperty('--site-nav-text', colorToRgbString(solidText));
    nav.style.setProperty('--site-nav-text-soft', solidTextSoft);
    nav.style.setProperty('--site-nav-solid-bg', colorToRgbString(solidBackground));
    nav.style.setProperty('--site-nav-solid-border', solidBorder);
    nav.style.setProperty('--site-nav-solid-text', colorToRgbString(solidText));
    nav.style.setProperty('--site-nav-solid-text-soft', solidTextSoft);
    nav.style.setProperty('--site-nav-overlay-bg', colorToRgbString(overlayBase, isDarkSurface ? 0.16 : 0.58));
    nav.style.setProperty('--site-nav-overlay-bg-mobile', colorToRgbString(mobileOverlayBase, isDarkSurface ? 0.78 : 0.9));
    nav.style.setProperty('--site-nav-overlay-menu-bg', colorToRgbString(menuBackground, isDarkSurface ? 0.92 : 0.96));
    nav.style.setProperty('--site-nav-overlay-border', colorToRgbString(overlayBorder));
    nav.style.setProperty('--site-nav-overlay-text', colorToRgbString(overlayText));
    nav.dataset.siteNavTheme = isDarkSurface ? 'dark' : 'light';
  }

  function getLinkMarkup(item, currentPage, isHomePage) {
    const classes = ['site-nav__link'];
    if (item.secondary) {
      classes.push('site-nav__link--secondary');
    }
    if (currentPage === item.key) {
      classes.push('is-active');
    }
    if (isHomePage && item.usePageScrollOnHome) {
      classes.push('page-scroll');
    }

    const href = isHomePage && item.homeHref ? item.homeHref : item.href;
    const keyAttribute = ' data-nav-key="' + item.key + '"';

    return `<a href="${href}" class="${classes.join(' ')}"${keyAttribute}>${item.label}</a>`;
  }

  function findNavItemByHomeHash(hash) {
    if (!hash || !hash.startsWith('#')) {
      return null;
    }

    return navItems.find(function (item) {
      return item.homeHref === hash;
    }) || null;
  }

  function syncRequestedKeyFromHash(nav) {
    if ((nav.dataset.siteNavPage || '') !== 'home') {
      return;
    }

    const matchedItem = findNavItemByHomeHash(window.location.hash);
    if (!matchedItem) {
      delete nav.dataset.siteNavRequestedKey;
      delete nav.dataset.siteNavRequestedUntil;
      return;
    }

    nav.dataset.siteNavRequestedKey = matchedItem.key;
    nav.dataset.siteNavRequestedUntil = String(Date.now() + anchorSelectionHoldMs);
  }

  function renderNav(nav, index) {
    const currentPage = nav.dataset.siteNavPage || '';
    const mode = nav.dataset.siteNavMode || 'solid';
    const isHomePage = currentPage === 'home';
    const mobileMenuId = `site-nav-mobile-${index + 1}`;
    const brandHref = isHomePage ? '#page-top' : '/';
    const brandClasses = ['site-nav__brand'];

    if (isHomePage) {
      brandClasses.push('page-scroll', 'is-active');
    }

    nav.className = 'site-nav';
    nav.classList.add(mode === 'overlay' ? 'site-nav--overlay' : 'site-nav--solid');
    nav.dataset.siteNavMode = mode;

    const desktopLinks = navItems
      .map((item) => getLinkMarkup(item, currentPage, isHomePage))
      .join('');

    const mobileLinks = navItems
      .map((item) => getLinkMarkup(item, currentPage, isHomePage))
      .join('');

    nav.innerHTML = `
      <div class="site-nav__inner">
        <a href="${brandHref}" class="${brandClasses.join(' ')}" data-nav-key="home">Nathan de Castro</a>
        <div class="site-nav__links">
          ${desktopLinks}
        </div>
        <button
          type="button"
          class="site-nav__toggle"
          aria-controls="${mobileMenuId}"
          aria-expanded="false"
          aria-label="Toggle navigation"
          data-site-nav-toggle
        >
          <span class="site-nav__sr-only">Toggle navigation</span>
          <span class="site-nav__toggle-icon" aria-hidden="true">
            <span class="site-nav__toggle-bar"></span>
            <span class="site-nav__toggle-bar"></span>
            <span class="site-nav__toggle-bar"></span>
          </span>
        </button>
      </div>
      <div class="site-nav__mobile" id="${mobileMenuId}" data-site-nav-menu>
        ${mobileLinks}
      </div>
    `;

    return nav;
  }

  function setActiveKey(nav, activeKey) {
    nav.querySelectorAll('.site-nav__brand.is-active, .site-nav__link.is-active').forEach(function (element) {
      element.classList.remove('is-active');
    });

    nav.querySelectorAll('[data-nav-key="' + activeKey + '"]').forEach(function (element) {
      element.classList.add('is-active');
    });
  }

  function getHomeActiveKey(nav) {
    const requestedKey = nav.dataset.siteNavRequestedKey;
    const requestedUntil = Number(nav.dataset.siteNavRequestedUntil || '0');

    if (requestedKey && requestedUntil > Date.now()) {
      return requestedKey;
    }

    const anchorSections = navItems
      .filter(function (item) {
        return item.homeHref && item.homeHref.startsWith('#');
      })
      .map(function (item) {
        return {
          item: item,
          section: document.querySelector(item.homeHref),
        };
      })
      .filter(function (entry) {
        return Boolean(entry.section);
      })
      .sort(function (left, right) {
        return left.section.offsetTop - right.section.offsetTop;
      });

    if (!anchorSections.length) {
      return 'home';
    }

    const viewportTop = window.scrollY + nav.offsetHeight + 24;
    const viewportBottom = window.scrollY + window.innerHeight - Math.max(window.innerHeight * 0.22, 96);
    let activeKey = 'home';

    anchorSections.forEach(function (entry) {
      const sectionTop = entry.section.offsetTop;
      const sectionBottom = sectionTop + entry.section.offsetHeight;

      if (sectionBottom > viewportTop && sectionTop <= viewportBottom) {
        activeKey = entry.item.key;
      }
    });

    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8) {
      activeKey = anchorSections[anchorSections.length - 1].item.key;
    }

    return activeKey;
  }

  function updateNavActiveState(nav) {
    const currentPage = nav.dataset.siteNavPage || '';
    const activeKey = currentPage === 'home' ? getHomeActiveKey(nav) : currentPage;
    setActiveKey(nav, activeKey || 'home');
  }

  function updateNavAffixState(nav) {
    const mode = nav.dataset.siteNavMode || 'solid';
    const shouldAffix = mode !== 'overlay' || window.scrollY > affixOffset;
    nav.classList.toggle('is-affixed', shouldAffix);
  }

  function canPrefetchDocuments() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (!document.head) {
      return false;
    }

    if (connection && (connection.saveData || /(?:^|-)2g$/i.test(connection.effectiveType || ''))) {
      return false;
    }

    return true;
  }

  function normalizePrefetchTarget(href) {
    if (!href || href.startsWith('#')) {
      return null;
    }

    let url;

    try {
      url = new URL(href, window.location.href);
    } catch (error) {
      return null;
    }

    if (url.origin !== window.location.origin) {
      return null;
    }

    if (url.pathname === window.location.pathname && url.search === window.location.search) {
      return null;
    }

    return url;
  }

  function prefetchNavTarget(href) {
    if (!canPrefetchDocuments()) {
      return;
    }

    const url = normalizePrefetchTarget(href);
    if (!url) {
      return;
    }

    const cacheKey = url.pathname + url.search;
    if (prefetchedNavTargets.has(cacheKey)) {
      return;
    }

    prefetchedNavTargets.add(cacheKey);

    const prefetchLink = document.createElement('link');
    prefetchLink.rel = 'prefetch';
    prefetchLink.href = cacheKey;
    prefetchLink.as = 'document';
    document.head.appendChild(prefetchLink);
  }

  function isModifiedNavigation(event) {
    return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
  }

  function shouldAnimateRoute(link, href, event) {
    if (!href || href.startsWith('#') || isModifiedNavigation(event)) {
      return false;
    }

    if (link.hasAttribute('download')) {
      return false;
    }

    const target = link.getAttribute('target');
    if (target && target !== '_self') {
      return false;
    }

    const url = normalizePrefetchTarget(href);
    return Boolean(url);
  }

  function navigateWithRouteAnimation(href) {
    if (document.documentElement.classList.contains('site-route-leaving')) {
      return;
    }

    document.documentElement.classList.add('site-route-leaving');
    window.setTimeout(function () {
      window.location.href = href;
    }, routeTransitionDurationMs);
  }

  navs.forEach(function (nav, index) {
    renderNav(nav, index);
    applyNavPalette(nav);
    syncRequestedKeyFromHash(nav);
    updateNavActiveState(nav);

    const toggle = nav.querySelector('[data-site-nav-toggle]');
    const mobileMenu = nav.querySelector('[data-site-nav-menu]');

    if (!toggle || !mobileMenu) {
      return;
    }

    toggle.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.toggle('is-open');
      toggle.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        const navKey = link.dataset.navKey;
        const href = link.getAttribute('href') || '';

        if (navKey) {
          setActiveKey(nav, navKey);
        }

        if (href.startsWith('#') && nav.dataset.siteNavPage === 'home' && navKey) {
          nav.dataset.siteNavRequestedKey = navKey;
          nav.dataset.siteNavRequestedUntil = String(Date.now() + anchorSelectionHoldMs);
        } else {
          delete nav.dataset.siteNavRequestedKey;
          delete nav.dataset.siteNavRequestedUntil;
        }

        mobileMenu.classList.remove('is-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        window.setTimeout(function () {
          updateNavActiveState(nav);
        }, 50);
      });
    });

    document.addEventListener('click', function (event) {
      if (!nav.contains(event.target) && mobileMenu.classList.contains('is-open')) {
        mobileMenu.classList.remove('is-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    nav.querySelectorAll('.site-nav__brand[data-nav-key], .site-nav__links a[data-nav-key]').forEach(function (link) {
      link.addEventListener('click', function () {
        const navKey = link.dataset.navKey;
        const href = link.getAttribute('href') || '';

        if (navKey) {
          setActiveKey(nav, navKey);
        }

        if (href.startsWith('#') && nav.dataset.siteNavPage === 'home' && navKey) {
          nav.dataset.siteNavRequestedKey = navKey;
          nav.dataset.siteNavRequestedUntil = String(Date.now() + anchorSelectionHoldMs);
        } else {
          delete nav.dataset.siteNavRequestedKey;
          delete nav.dataset.siteNavRequestedUntil;
        }
      });
    });

    nav.querySelectorAll('a[href]').forEach(function (link) {
      const queuePrefetch = function () {
        prefetchNavTarget(link.getAttribute('href'));
      };

      link.addEventListener('click', function (event) {
        const href = link.getAttribute('href') || '';

        if (!shouldAnimateRoute(link, href, event)) {
          return;
        }

        event.preventDefault();
        prefetchNavTarget(href);
        navigateWithRouteAnimation(href);
      });

      link.addEventListener('pointerenter', queuePrefetch, { passive: true, once: true });
      link.addEventListener('focus', queuePrefetch, { passive: true, once: true });
      link.addEventListener('touchstart', queuePrefetch, { passive: true, once: true });
      link.addEventListener('pointerdown', queuePrefetch, { passive: true, once: true });
    });

    updateNavAffixState(nav);
    updateNavActiveState(nav);
  });

  window.addEventListener('scroll', function () {
    navs.forEach(updateNavAffixState);
    navs.forEach(updateNavActiveState);
  }, { passive: true });

  window.addEventListener('resize', function () {
    navs.forEach(applyNavPalette);
    navs.forEach(updateNavAffixState);
    navs.forEach(updateNavActiveState);
  });

  window.addEventListener('hashchange', function () {
    navs.forEach(function (nav) {
      syncRequestedKeyFromHash(nav);
    });
    navs.forEach(updateNavActiveState);
  });
});