document.addEventListener('DOMContentLoaded', function () {
  const navs = document.querySelectorAll('[data-site-nav]');

  navs.forEach(function (nav) {
    const toggle = nav.querySelector('[data-site-nav-toggle]');
    const mobileMenu = nav.querySelector('[data-site-nav-menu]');

    if (!toggle || !mobileMenu) {
      return;
    }

    toggle.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', function (event) {
      if (!nav.contains(event.target) && mobileMenu.classList.contains('is-open')) {
        mobileMenu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  const language = (navigator.language || navigator.userLanguage || '').toLowerCase();
  if (language.startsWith('fr')) {
    document.querySelectorAll('[data-cv-link]').forEach(function (link) {
      link.href = '/doc/cv_fr.pdf';
    });
  }
});