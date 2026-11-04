/**
 * ColdSnap - wiring for the static project pages (/projets/, /en/projects/).
 * The homepage uses js/coldsnap.js instead; this keeps only the nav and the footer year.
 */
(function () {
  const nav = document.querySelector('.cs-nav');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  if (!nav || !toggle || !links) return;

  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const setOpen = open => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };
  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
})();
