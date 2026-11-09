// Legal notice: one page holding both languages; the FR/EN buttons show one of them.
(function () {
  var titles = { fr: 'Mentions légales — ColdSnap', en: 'Legal notice — ColdSnap' };
  function apply(lang) {
    document.documentElement.lang = lang;
    document.title = titles[lang];
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });
  }
  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () {
      // Same choice as the FR/EN switch elsewhere: the worker reads the cookie.
      document.cookie = 'coldsnap-lang=' + b.dataset.lang + '; path=/; max-age=31536000; samesite=lax' + (location.protocol === 'https:' ? '; secure' : '');
      try { localStorage.setItem('coldsnap-lang', b.dataset.lang); } catch (e) {}
      apply(b.dataset.lang);
    });
  });
  apply(document.documentElement.lang === 'fr' ? 'fr' : 'en');
  document.getElementById('year').textContent = new Date().getFullYear();
})();
