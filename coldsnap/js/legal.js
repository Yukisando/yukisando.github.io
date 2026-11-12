// Legal pages (mentions, CGV, privacy): one page holding both languages; the FR/EN buttons
// show one of them. The tab title is the shown article's <h1> + " — ColdSnap".
(function () {
  function title(lang) {
    var h1 = document.querySelector('article[lang="' + lang + '"] h1');
    return (h1 ? h1.textContent.trim() + ' — ' : '') + 'ColdSnap';
  }
  function apply(lang) {
    document.documentElement.lang = lang;
    document.title = title(lang);
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
