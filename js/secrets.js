/**
 * Secrets counter, shared by nathandecastro.com and coldsnap.fr.
 *
 * One registry of every easter egg on both sites. Finding one shows a small
 * pill in the bottom-left corner with the running count; click it for the list
 * (found secrets by name, the rest as "???", the other site as a link), so one
 * find invites the next.
 *
 * The two sites are different origins, so localStorage is not shared. Instead
 * every link from one site to the other carries the found keys in ?s=..., and
 * the landing page merges them into its own storage. Travel both ways and the
 * two copies converge.
 *
 * The ↺ in the panel wipes them and starts over. A reset is stamped with its time
 * (?sr=...) and travels the same way: a site that sees a newer reset clears its
 * own list, and drops finds carried in from a site that hasn't heard of it yet.
 *
 * A shared secret (the Konami code) is one secret that counts on both sites:
 * found on either, it shows as found on both.
 *
 * Include once per page:  <script src="js/secrets.js" data-site="home" defer>
 * then award from an egg: window.Secrets.award('konami')
 *
 * The same file is served at /js/secrets.js and /coldsnap/js/secrets.js
 * (coldsnap.fr is a worker in front of /coldsnap/, it cannot reach the root).
 * Edit one, copy to the other.
 */
(function () {
  'use strict';

  var SITES = {
    home: {
      host: 'nathandecastro.com',
      path: '/',
      secrets: {
        weee: { en: 'Scrolling is overrated', fr: 'Le scroll, c\'est surfait' },
        hadoken: { en: 'Hadoken!', fr: 'Hadoken !' },
        fanclub: { en: 'Found the fan club', fr: 'A trouvé le fan club' }
      }
    },
    coldsnap: {
      host: 'coldsnap.fr',
      path: '/coldsnap/',
      secrets: {
        snap: { en: 'Caused a cold snap', fr: 'A déclenché un cold snap' },
        wizard: { en: 'Found the wizard', fr: 'A trouvé le magicien' },
        star: { en: 'Made a wish', fr: 'A fait un vœu' }
      }
    }
  };

  // Hidden on both sites; stored as "shared.<key>" and listed under whichever site you're on.
  var SHARED = {
    konami: { en: 'Knew the code!', fr: 'Connaît le code !' }
  };

  var TEXT = {
    en: {
      label: 'secrets',
      aria: 'Secrets found: {n} of {total}',
      hidden: '???',
      found: 'Secret {n}/{total}',
      more: 'More secrets are hiding on this page…',
      elsewhere: 'The rest hides on {site} →',
      complete: 'All found. You are thorough. I like thorough.',
      reset: 'Reset secrets',
      confirm: 'Reset all?',
      cleared: 'Secrets reset. Happy hunting.'
    },
    fr: {
      label: 'secrets',
      aria: 'Secrets trouvés : {n} sur {total}',
      hidden: '???',
      found: 'Secret {n}/{total}',
      more: 'Il reste des secrets sur cette page…',
      elsewhere: 'Le reste se cache sur {site} →',
      complete: 'Tout trouvé. Vous êtes minutieux. J\'aime ça.',
      reset: 'Réinitialiser les secrets',
      confirm: 'Tout effacer ?',
      cleared: 'Secrets remis à zéro. Bonne chasse.'
    }
  };

  var CSS = '' +
    '.secrets{position:fixed;left:16px;bottom:16px;z-index:3900;display:none;flex-direction:column;align-items:flex-start;gap:8px;' +
      'font-family:"Comfortaa","Segoe UI",system-ui,sans-serif;font-size:13px;line-height:1.4;color:#f4f1ea}' +
    '.secrets.is-visible{display:flex}' +
    '.secrets__btn{display:inline-flex;align-items:center;gap:8px;padding:8px 14px 8px 12px;border-radius:999px;' +
      'border:1px solid rgba(255,255,255,.18);background:rgba(12,14,19,.94);color:inherit;font:inherit;font-weight:700;cursor:pointer;' +
      'animation:secrets-in .5s cubic-bezier(.2,.8,.2,1)}' +
    '.secrets__btn:hover,.secrets__btn:focus-visible{border-color:#f5841a}' +
    '.secrets__btn:focus-visible{outline:2px solid #f5841a;outline-offset:2px}' +
    '.secrets__star{display:inline-block;color:#ffe7a3}' +
    '.secrets__btn.is-complete .secrets__star{color:#cdeef6}' +
    '.secrets__btn.is-bumping .secrets__star{animation:secrets-bump .7s cubic-bezier(.2,.8,.2,1)}' +
    '.secrets__count{font-variant-numeric:tabular-nums}' +
    '.secrets__label{opacity:.55;font-weight:500}' +
    '.secrets__panel{margin:0;padding:10px 14px 12px;min-width:220px;border-radius:14px;border:1px solid rgba(255,255,255,.18);' +
      'background:rgba(12,14,19,.96);animation:secrets-in .3s cubic-bezier(.2,.8,.2,1)}' +
    '.secrets__panel[hidden]{display:none}' +
    '.secrets__site{margin:8px 0 2px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;opacity:.5}' +
    '.secrets__site:first-child{margin-top:0}' +
    'a.secrets__site{display:block;opacity:.75;color:#f5841a;text-decoration:none}' +
    'a.secrets__site:hover{opacity:1;text-decoration:underline}' +
    '.secrets__list{margin:0;padding:0;list-style:none}' +
    '.secrets__list li{display:flex;align-items:center;gap:8px;padding:2px 0;opacity:.55}' +
    '.secrets__list li::before{content:"?";width:14px;text-align:center}' +
    '.secrets__list li.is-found{opacity:1}' +
    '.secrets__list li.is-found::before{content:"\\2726";color:#ffe7a3}' +
    '.secrets__foot{display:flex;align-items:flex-end;gap:10px;margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,.12)}' +
    '.secrets__hint{flex:1;margin:0;font-style:italic;opacity:.7}' +
    '.secrets__reset{flex:none;display:inline-flex;align-items:center;justify-content:center;gap:6px;min-width:26px;height:26px;padding:0 6px;' +
      'border-radius:999px;border:1px solid transparent;background:none;color:inherit;font:inherit;font-size:12px;font-weight:700;' +
      'opacity:.5;cursor:pointer;transition:opacity .2s ease,border-color .2s ease,color .2s ease}' +
    '.secrets__reset:hover,.secrets__reset:focus-visible{opacity:1;border-color:rgba(255,255,255,.18)}' +
    '.secrets__reset:focus-visible{outline:2px solid #f5841a;outline-offset:2px}' +
    '.secrets__reset svg{width:14px;height:14px}' +
    '.secrets__reset span:empty{display:none}' +
    '.secrets__reset.is-armed{opacity:1;color:#f5841a;border-color:#f5841a;padding:0 10px}' +
    '.secrets__hint a{color:#f5841a;text-decoration:none}' +
    '.secrets__hint a:hover{text-decoration:underline}' +
    '.secrets__toast{position:fixed;left:16px;bottom:64px;z-index:3900;padding:8px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.18);' +
      'background:rgba(12,14,19,.96);color:#f4f1ea;font-family:"Comfortaa","Segoe UI",system-ui,sans-serif;font-size:13px;' +
      'opacity:0;transform:translateY(8px);transition:opacity .3s ease,transform .4s cubic-bezier(.2,.8,.2,1);pointer-events:none}' +
    '.secrets__toast.is-visible{opacity:1;transform:translateY(0)}' +
    '.secrets__toast b{color:#ffe7a3;font-weight:700}' +
    '@keyframes secrets-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}' +
    '@keyframes secrets-bump{0%{transform:scale(1) rotate(0)}35%{transform:scale(1.7) rotate(25deg)}100%{transform:scale(1) rotate(0)}}' +
    '@media (max-width:600px){.secrets{left:12px;bottom:12px}.secrets__label{display:none}.secrets__toast{left:12px;bottom:58px}}' +
    '@media (prefers-reduced-motion:reduce){.secrets__btn,.secrets__panel,.secrets__btn.is-bumping .secrets__star{animation:none}.secrets__toast{transition:none}}';

  var STORE = 'secrets.found';
  var RESET_STORE = 'secrets.reset';
  var PARAM = 's';
  var RESET_PARAM = 'sr';
  var script = document.currentScript;
  var site = (script && script.getAttribute('data-site')) || (location.pathname.indexOf('/coldsnap/') === 0 || location.hostname === 'coldsnap.fr' ? 'coldsnap' : 'home');
  if (!SITES[site]) site = 'home';

  var ALL = Object.keys(SHARED).map(function (k) { return 'shared.' + k; });
  Object.keys(SITES).forEach(function (s) {
    Object.keys(SITES[s].secrets).forEach(function (k) { ALL.push(s + '.' + k); });
  });

  function lang() { return document.documentElement.lang === 'fr' ? 'fr' : 'en'; }
  function t(key, vars) {
    var str = TEXT[lang()][key];
    Object.keys(vars || {}).forEach(function (v) { str = str.replace('{' + v + '}', vars[v]); });
    return str;
  }
  function keyFor(key) { return (SHARED[key] ? 'shared' : site) + '.' + key; }
  function name(full) {
    var parts = full.split('.');
    var group = parts[0] === 'shared' ? SHARED : SITES[parts[0]].secrets;
    return group[parts[1]][lang()];
  }

  // ── storage ─────────────────────────────────────────────
  var found = [];
  var resetAt = 0; // when the secrets were last reset, on either site
  function load() {
    try { resetAt = Number(localStorage.getItem(RESET_STORE)) || 0; } catch (e) { resetAt = 0; }
    try { found = JSON.parse(localStorage.getItem(STORE) || '[]'); } catch (e) { found = []; }
    if (!Array.isArray(found)) found = [];
    // the first version of the coldsnap counter stored bare keys
    try {
      var legacy = JSON.parse(localStorage.getItem('coldsnap-secrets') || '[]');
      if (Array.isArray(legacy)) legacy.forEach(function (k) { found.push('coldsnap.' + k); });
      localStorage.removeItem('coldsnap-secrets');
    } catch (e) { /* nothing to migrate */ }
    found = dedupe(found);
  }
  function save() {
    try {
      localStorage.setItem(STORE, JSON.stringify(found));
      if (resetAt) localStorage.setItem(RESET_STORE, String(resetAt));
    } catch (e) { /* private mode */ }
  }
  // Each site used to have its own Konami secret (home.konami, coldsnap.konami).
  function migrate(k) {
    var parts = String(k).split('.');
    return SITES[parts[0]] && SHARED[parts[1]] ? 'shared.' + parts[1] : k;
  }
  function dedupe(list) {
    list = list.map(migrate);
    return list.filter(function (k, i) { return ALL.indexOf(k) !== -1 && list.indexOf(k) === i; });
  }

  // ── cross-site handoff (?s=home.konami,coldsnap.snap&sr=<reset time>) ───
  function readHandoff() {
    var url;
    try { url = new URL(location.href); } catch (e) { return; }
    var s = url.searchParams.get(PARAM);
    var sr = Number(url.searchParams.get(RESET_PARAM)) || 0;
    if (s === null && !sr) return;
    if (sr > resetAt) {
      found = [];
      resetAt = sr;
    }
    // Finds from a site that missed the latest reset date from before it.
    if (s !== null && sr >= resetAt) found = dedupe(found.concat(s.split(',')));
    save();
    url.searchParams.delete(PARAM);
    url.searchParams.delete(RESET_PARAM);
    try { history.replaceState(history.state, '', url.pathname + url.search + url.hash); } catch (e) { /* file:// */ }
  }

  function otherSite() { return site === 'home' ? 'coldsnap' : 'home'; }

  // A link leaves for the other site when it points at its host, or (same origin,
  // e.g. local dev) crosses the /coldsnap/ boundary.
  function isOtherSite(a) {
    var url;
    try { url = new URL(a.getAttribute('href'), location.href); } catch (e) { return false; }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    var other = SITES[otherSite()];
    if (url.hostname === other.host || url.hostname === 'www.' + other.host) return true;
    if (url.origin !== location.origin) return false;
    var inColdsnap = url.pathname.indexOf('/coldsnap/') === 0;
    return inColdsnap === (otherSite() === 'coldsnap');
  }

  function stamp(url) {
    if (found.length) url.searchParams.set(PARAM, found.join(','));
    else url.searchParams.delete(PARAM);
    if (resetAt) url.searchParams.set(RESET_PARAM, String(resetAt));
  }

  function carry(a) {
    if (!found.length && !resetAt) return;
    var url = new URL(a.getAttribute('href'), location.href);
    stamp(url);
    a.setAttribute('href', url.toString());
  }

  function otherSiteHref() {
    var other = SITES[otherSite()];
    var url = new URL(location.hostname === 'localhost' || location.hostname === '127.0.0.1' ? other.path : 'https://' + other.host + '/', location.href);
    stamp(url);
    return url.toString();
  }

  // ── UI ──────────────────────────────────────────────────
  var box, btn, star, count, panel, toastEl, toastTimer, armTimer;
  var RESET_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 3v5h5"/></svg>';

  function build() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    box = document.createElement('div');
    box.className = 'secrets';
    box.id = 'secrets';
    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'secrets__btn';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'secretsPanel');
    star = document.createElement('span');
    star.className = 'secrets__star';
    star.setAttribute('aria-hidden', 'true');
    star.textContent = '✦';
    count = document.createElement('span');
    count.className = 'secrets__count';
    var label = document.createElement('span');
    label.className = 'secrets__label';
    btn.appendChild(star); btn.appendChild(count); btn.appendChild(label);
    panel = document.createElement('div');
    panel.className = 'secrets__panel';
    panel.id = 'secretsPanel';
    panel.hidden = true;
    box.appendChild(btn); box.appendChild(panel);
    toastEl = document.createElement('div');
    toastEl.className = 'secrets__toast';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(box);
    document.body.appendChild(toastEl);

    btn.addEventListener('click', function () {
      var open = panel.hidden;
      panel.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
    });
    // The reset button asks once ("Reset all?") before it wipes anything.
    panel.addEventListener('click', function (e) {
      var r = e.target.closest('.secrets__reset');
      if (!r) return;
      if (r.classList.contains('is-armed')) { reset(); return; }
      r.classList.add('is-armed');
      r.querySelector('span').textContent = t('confirm');
      r.setAttribute('aria-label', t('confirm'));
      clearTimeout(armTimer);
      armTimer = setTimeout(function () {
        r.classList.remove('is-armed');
        r.querySelector('span').textContent = '';
        r.setAttribute('aria-label', t('reset'));
      }, 3000);
    });
    document.addEventListener('click', function (e) {
      if (!panel.hidden && !box.contains(e.target)) {
        panel.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
    });
  }

  function render() {
    var total = ALL.length;
    var complete = found.length === total;
    box.classList.toggle('is-visible', found.length > 0);
    btn.classList.toggle('is-complete', complete);
    btn.setAttribute('aria-label', t('aria', { n: found.length, total: total }));
    count.textContent = found.length + '/' + total;
    btn.querySelector('.secrets__label').textContent = t('label');

    panel.innerHTML = '';
    var hereDone = true;
    [site, otherSite()].forEach(function (s) {
      var head;
      if (s === site) {
        head = document.createElement('p');
      } else {
        head = document.createElement('a');
        head.href = otherSiteHref();
      }
      head.className = 'secrets__site';
      head.textContent = SITES[s].host;
      panel.appendChild(head);
      var ul = document.createElement('ul');
      ul.className = 'secrets__list';
      var keys = Object.keys(SITES[s].secrets).map(function (k) { return s + '.' + k; });
      if (s === site) keys = keys.concat(Object.keys(SHARED).map(function (k) { return 'shared.' + k; }));
      keys.forEach(function (full) {
        var got = found.indexOf(full) !== -1;
        if (s === site && !got) hereDone = false;
        var li = document.createElement('li');
        li.className = got ? 'is-found' : '';
        li.textContent = got ? name(full) : t('hidden');
        ul.appendChild(li);
      });
      panel.appendChild(ul);
    });
    var hint = document.createElement('p');
    hint.className = 'secrets__hint';
    if (complete) {
      hint.textContent = t('complete');
    } else if (hereDone) {
      var a = document.createElement('a');
      a.href = otherSiteHref();
      a.textContent = SITES[otherSite()].host;
      var parts = t('elsewhere', { site: '\u0000' }).split('\u0000');
      hint.appendChild(document.createTextNode(parts[0]));
      hint.appendChild(a);
      hint.appendChild(document.createTextNode(parts[1] || ''));
    } else {
      hint.textContent = t('more');
    }
    var resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'secrets__reset';
    resetBtn.title = t('reset');
    resetBtn.setAttribute('aria-label', t('reset'));
    resetBtn.innerHTML = RESET_ICON + '<span></span>';
    var foot = document.createElement('div');
    foot.className = 'secrets__foot';
    foot.appendChild(hint);
    foot.appendChild(resetBtn);
    panel.appendChild(foot);
  }

  function toast(html) {
    toastEl.innerHTML = html;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 3200);
  }

  // Marks a secret of this site as found. Safe to call again; only the first time counts.
  function award(key) {
    var full = keyFor(key);
    if (ALL.indexOf(full) === -1 || found.indexOf(full) !== -1) return false;
    found.push(full);
    save();
    render();
    star.classList.remove('is-bumping');
    void star.offsetWidth;
    btn.classList.remove('is-bumping');
    void btn.offsetWidth;
    btn.classList.add('is-bumping');
    toast('<b>' + t('found', { n: found.length, total: ALL.length }) + '</b> · ' + name(full));
    if (found.length === ALL.length) setTimeout(function () { toast(t('complete')); }, 3600);
    return true;
  }

  function boot() {
    load();
    readHandoff();
    build();
    render();
    // links to the other site carry what was found here
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (a && isOtherSite(a)) carry(a);
    }, true);
    // the page can switch language at runtime (coldsnap.fr)
    if ('MutationObserver' in window) {
      new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    }
  }

  // Forgets every secret here, and on the other site the next time you cross over.
  function reset() {
    clearTimeout(armTimer);
    found = [];
    resetAt = Date.now();
    save();
    panel.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    render();
    toast(t('cleared'));
  }

  window.Secrets = {
    award: award,
    reset: reset,
    get found() { return found.slice(); },
    get total() { return ALL.length; },
    get site() { return site; }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
