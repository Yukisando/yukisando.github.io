// Hero typewriter: the phrase between "We make" and "fun." ("On rend" … "ludiques.") types, erases and cycles through
// the |-separated list in #heroHookWords (text comes from the page, so FR and EN pages each
// carry their own list). Screen readers read the static .sr-only sentence instead.
// With reduced motion, the first phrase is shown and nothing moves.
(function () {
  const typed = document.getElementById('heroTyped');
  const source = document.getElementById('heroHookWords');
  if (!typed || !source) return;
  const words = source.textContent.split('|').map(w => w.trim()).filter(Boolean);
  if (!words.length) return;
  const line = typed.closest('.hero__hook-line');

  // Reserve the height of the tallest phrase so the panel never jumps while typing.
  function reserveHeight() {
    line.style.minHeight = '';
    let tallest = 0;
    for (const w of words) {
      typed.textContent = w;
      tallest = Math.max(tallest, line.getBoundingClientRect().height);
    }
    typed.textContent = '';
    line.style.minHeight = tallest + 'px';
  }

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    typed.textContent = words[0];
    line.classList.add('is-still');
    return;
  }

  reserveHeight();
  let resizeTimer;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { const keep = typed.textContent; reserveHeight(); typed.textContent = keep; }, 200);
  });

  const TYPE_MS = 55, ERASE_MS = 25, HOLD_MS = 2200, GAP_MS = 350, FIRST_DELAY_MS = 700;
  let index = 0, length = 0, erasing = false;

  // A cold snap (js/easter-eggs.js puts .is-frozen on <body>) stops the typing mid-word;
  // it carries on from there once the page thaws.
  function step() {
    if (document.body.classList.contains('is-frozen')) return schedule(100);
    const word = words[index];
    if (!erasing) {
      length++;
      typed.textContent = word.slice(0, length);
      if (length >= word.length) { erasing = true; line.classList.add('is-holding'); return schedule(HOLD_MS); }
      return schedule(TYPE_MS + Math.random() * 40);   // a little uneven, like a person typing
    }
    line.classList.remove('is-holding');
    length--;
    typed.textContent = word.slice(0, length);
    if (length <= 0) { erasing = false; index = (index + 1) % words.length; return schedule(GAP_MS); }
    schedule(ERASE_MS);
  }

  // Pause while the tab is hidden so the loop does not burn time in the background.
  let timer = null;
  function schedule(ms) { timer = setTimeout(step, ms); }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { clearTimeout(timer); timer = null; }
    else if (timer === null) schedule(GAP_MS);
  });
  schedule(FIRST_DELAY_MS);
})();
