// 404 page. Game over: CONTINUE? counts down from 9. A coin in the slot (js/arcade-coin.js)
// goes home and counts as a secret; at 0 the screen shuts off and goes home anyway.
(function () {
  var home = document.documentElement.lang === 'fr' ? '/' : '/en/';
  document.getElementById('homeSlot').dataset.href = home;
  document.getElementById('homeLink').href = home;
  document.title = (document.documentElement.lang === 'fr' ? '404 — Page introuvable' : '404 — Page not found') + ' | ColdSnap';

  var screen = document.getElementById('arcadeScreen');
  var count = document.getElementById('continueCount');
  var left = 9;
  var timer = setInterval(function () {
    left -= 1;
    count.textContent = left;
    if (left > 0) return;
    clearInterval(timer);
    // No surprise page change for people who asked for less motion: the link stays.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var shutter = document.createElement('div');
    shutter.className = 'crt-shutter';
    document.body.appendChild(shutter);
    setTimeout(function () { location.href = home; }, 420);
  }, 1000);

  // Touching the coin stops the clock: the player is taking the hint.
  var stop = function () { clearInterval(timer); screen.classList.add('is-paused'); };
  document.querySelector('.coin').addEventListener('pointerdown', stop);
  document.querySelector('.coin').addEventListener('keydown', stop);
  document.addEventListener('coldsnap:coin-inserted', function () {
    stop();
    if (window.Secrets) window.Secrets.award('continue');
  });
})();
