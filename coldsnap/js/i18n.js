/**
 * ColdSnap - EN/FR translations
 *
 * Markup carries the English text plus a key:
 *   data-i18n="key"            → textContent
 *   data-i18n-html="key"       → innerHTML (for strings with <em>, <strong>, links)
 *   data-i18n-attr="attr:key"  → an attribute (comma-separate several)
 *   data-legal-href="url"      → nathandecastro.com legal page, gets ?lang=fr in French
 * Strings live in js/i18n-strings.js. Static markup is already translated by
 * tools/coldsnap-build.mjs (/ is French, /en/ English); this file translates
 * what scripts render (projects, viewer, cards) and links the FR/EN switch.
 */
(function () {
  const { FR, EN_EXTRA } = window.CS_STRINGS;

  const EN = Object.assign({}, EN_EXTRA);
  const listeners = [];
  let lang = document.documentElement.lang === 'fr' ? 'fr' : 'en';

  // Remember the English markup the first time each element is seen.
  function captureEnglish() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (!(key in EN)) EN[key] = el.textContent;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.dataset.i18nHtml;
      if (!(key in EN)) EN[key] = el.innerHTML;
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      el.dataset.i18nAttr.split(',').forEach(pair => {
        const [attr, key] = pair.split(':').map(s => s.trim());
        if (!(key in EN)) EN[key] = el.getAttribute(attr) || '';
      });
    });
  }

  function t(key) {
    const dict = lang === 'fr' ? FR : EN;
    return key in dict ? dict[key] : (EN[key] !== undefined ? EN[key] : key);
  }

  function apply() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      el.dataset.i18nAttr.split(',').forEach(pair => {
        const [attr, key] = pair.split(':').map(s => s.trim());
        el.setAttribute(attr, t(key));
      });
    });
    document.querySelectorAll('[data-legal-href]').forEach(el => {
      el.href = el.dataset.legalHref + (lang === 'fr' ? '?lang=fr' : '');
    });
    document.querySelectorAll('[data-lang]').forEach(link => {
      if (link.dataset.lang === lang) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    const mail = document.getElementById('contactMail');
    if (mail) mail.href = 'mailto:contact@coldsnap.fr?subject=' + encodeURIComponent(t('contact.subject'));
  }

  // Each language is its own static page (/ and /en/, /projets/<id>/ and /en/projects/<id>/);
  // switching remembers the choice (cookie) and loads the page's hreflang twin at the same spot.
  function setLang(next) {
    next = next === 'fr' ? 'fr' : 'en';
    // The worker on coldsnap.fr reads this cookie to send the visitor to their language.
    document.cookie = `coldsnap-lang=${next}; path=/; max-age=31536000; samesite=lax${location.protocol === 'https:' ? '; secure' : ''}`;
    try { localStorage.setItem('coldsnap-lang', next); } catch (e) {}
    if (next === lang) return;
    const url = new URL(location.href);
    const twin = document.querySelector(`link[rel="alternate"][hreflang="${next}"]`);
    url.searchParams.delete('lang');
    url.pathname = twin ? new URL(twin.href).pathname : (next === 'en' ? '/en/' : '/');
    location.href = url.toString();
  }

  // Pick a translated field from a project (falls back to English).
  function field(project, name) {
    if (lang === 'fr' && project.fr && project.fr[name] !== undefined) return project.fr[name];
    return project[name];
  }

  captureEnglish();
  apply();
  document.querySelectorAll('[data-lang]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      setLang(link.dataset.lang);
    });
  });

  window.CS_I18N = {
    get lang() { return lang; },
    t,
    field,
    setLang,
    onChange(fn) { listeners.push(fn); }
  };
})();
