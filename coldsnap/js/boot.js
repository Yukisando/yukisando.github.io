/*
 * First script of every coldsnap.fr page, loaded in <head> before the CSS. It lives in a file
 * (not inline) so the Content-Security-Policy can forbid inline scripts.
 *
 *   <script src="/js/boot.js?v=…" data-page="twin">   FR/EN page pair (/, /en/, /projets/<id>/…)
 *   <script src="/js/boot.js?v=…" data-page="404">    one page for both languages
 *   <script src="/js/boot.js?v=…" data-page="legal">  one page for both languages
 *
 * On FR/EN pairs the worker (tools/coldsnap-worker) picks the language before the page is
 * sent. Here: forward old nathandecastro.com/coldsnap/ links, move a choice saved before the
 * worker's cookie existed into that cookie, and set <html lang> on single-language pages.
 */
(function () {
  var script = document.currentScript;
  var page = script && script.dataset.page;
  var root = document.documentElement;

  // Old nathandecastro.com/coldsnap/ links forward to coldsnap.fr.
  if (/(^|\.)nathandecastro\.com$/.test(location.hostname)) {
    location.replace('https://coldsnap.fr' + (location.pathname.replace(/^\/coldsnap/, '') || '/') + location.search + location.hash);
    return;
  }

  var valid = function (lang) { return lang === 'fr' || lang === 'en' ? lang : null; };
  var saved = function () { try { return valid(localStorage.getItem('coldsnap-lang')); } catch (e) { return null; } };
  var cookie = function () { var m = document.cookie.match(/(?:^|;\s*)coldsnap-lang=(fr|en)\b/); return m ? m[1] : null; };
  var setCookie = function (lang) {
    document.cookie = 'coldsnap-lang=' + lang + '; path=/; max-age=31536000; samesite=lax' + (location.protocol === 'https:' ? '; secure' : '');
  };
  var browser = function () { return (navigator.language || '').toLowerCase().indexOf('fr') === 0 ? 'fr' : 'en'; };

  if (page === 'twin') {
    var old = saved();
    if (!old || cookie()) return;
    setCookie(old);
    if (old === root.lang) return;
    var path = location.pathname;
    var twin = old === 'en'
      ? (path === '/' ? '/en/' : path.replace(/^\/projets\//, '/en/projects/'))
      : (path === '/en/' ? '/' : path.replace(/^\/en\/projects\//, '/projets/'));
    if (twin !== path) location.replace(twin + location.search + location.hash);
    return;
  }

  if (page === '404') {
    // Near-miss project addresses (/projects/maya, /projets/Maya, /en/projets/maya/) go to the
    // real page, where the worker picks FR or EN. Unknown ids stay here.
    var m = location.pathname.match(/^\/(en\/)?(projets?|projects?)\/([a-z0-9-]+)\/?$/i);
    if (m) {
      var target = (m[1] || /^projects?$/i.test(m[2]) ? '/en/projects/' : '/projets/') + m[3].toLowerCase() + '/';
      if (target !== location.pathname) { location.replace(target + location.search + location.hash); return; }
    }
    root.lang = /^\/en(\/|$)/.test(location.pathname) ? 'en' : (cookie() || saved() || browser());
    return;
  }

  if (page === 'legal') {
    root.lang = valid(new URLSearchParams(location.search).get('lang')) || cookie() || saved() || browser();
  }
})();
