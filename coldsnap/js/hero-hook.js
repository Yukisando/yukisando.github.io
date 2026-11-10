// Hero line: "We make [phrase] fun." ("On rend [phrase] ludiques."). The phrase in the middle
// holds for a moment, frost creeps over it, it cracks and falls apart like ice, and the next
// one thaws in. Phrases are the |-separated list in #heroHookWords (text comes from the page,
// so FR and EN pages each carry their own list). Screen readers read the static .sr-only
// sentence instead. With reduced motion, the first phrase is shown and nothing moves.
(function () {
  const phrase = document.getElementById('heroPhrase');
  const source = document.getElementById('heroHookWords');
  if (!phrase || !source) return;
  const words = source.textContent.split('|').map(w => w.trim()).filter(Boolean);
  if (!words.length) return;
  const line = phrase.closest('.hero__hook-line');

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    phrase.textContent = words[0];
    return;
  }

  // A hidden twin of the phrase, to know how wide the next one will be.
  const measurer = document.createElement('span');
  measurer.className = 'hero__phrase';
  measurer.setAttribute('aria-hidden', 'true');
  measurer.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;left:0;top:0';
  line.appendChild(measurer);
  const widthOf = text => { measurer.textContent = text; return measurer.getBoundingClientRect().width; };

  // Reserve the height of the tallest line so the panel never jumps between phrases.
  function reserveHeight() {
    const keep = phrase.textContent;
    line.style.minHeight = '';
    let tallest = 0;
    for (const w of words) {
      phrase.textContent = w;
      tallest = Math.max(tallest, line.getBoundingClientRect().height);
    }
    phrase.textContent = keep;
    line.style.minHeight = tallest + 'px';
  }
  reserveHeight();
  let resizeTimer;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(reserveHeight, 200);
  });

  const HOLD_MS = 2600, FREEZE_MS = 700, SHATTER_MS = 560, RESIZE_MS = 380, THAW_MS = 950, FIRST_DELAY_MS = 900;
  const wait = ms => new Promise(done => setTimeout(done, ms));
  const pageFrozen = () => document.body.classList.contains('is-frozen');

  // Holds for `ms` of visible, unfrozen time. A cold snap (js/easter-eggs.js puts .is-frozen
  // on <body>) frosts the phrase over with the rest of the page; it thaws when the page does.
  async function hold(ms) {
    let left = ms;
    while (left > 0) {
      if (pageFrozen()) {
        phrase.classList.add('is-frozen');
        while (pageFrozen()) await wait(150);
        phrase.classList.remove('is-frozen');
        await wait(THAW_MS);
        continue;
      }
      if (document.hidden) { await wait(300); continue; }
      await wait(100);
      left -= 100;
    }
  }

  // The frozen phrase cracks into letters that drop and spin away.
  function shatter(text) {
    phrase.classList.add('is-shattering');
    phrase.textContent = '';
    [...text].forEach((char, i) => {
      const shard = document.createElement('span');
      shard.className = 'hero__shard';
      shard.textContent = char;
      phrase.appendChild(shard);
      if (char === ' ') return;
      const x = (Math.random() - 0.5) * 18;
      const y = 14 + Math.random() * 22;
      const r = (Math.random() - 0.5) * 70;
      shard.animate([
        { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${x * 0.3}px, -2px) rotate(${r * 0.1}deg)`, opacity: 1, offset: 0.2 },
        { transform: `translate(${x}px, ${y}px) rotate(${r}deg)`, opacity: 0 }
      ], { duration: SHATTER_MS - 60, delay: i * 8 + Math.random() * 50, easing: 'cubic-bezier(0.5, 0, 0.9, 0.6)', fill: 'forwards' });
    });
  }

  // Comes in iced over and out of focus, then warms back to orange.
  async function thawIn(text) {
    phrase.classList.remove('is-shattering');
    phrase.classList.add('is-frozen', 'is-entering');
    phrase.textContent = text;
    phrase.getBoundingClientRect();  // start the transitions from the iced state
    phrase.classList.remove('is-entering');
    await wait(120);
    phrase.classList.add('is-thawing');
    phrase.classList.remove('is-frozen');
    await wait(THAW_MS);
    phrase.classList.remove('is-thawing');
  }

  async function run() {
    let index = 0;
    await wait(FIRST_DELAY_MS);
    phrase.style.width = widthOf(words[0]) + 'px';
    await thawIn(words[0]);
    phrase.style.width = '';
    for (;;) {
      await hold(HOLD_MS);
      if (words.length < 2) return;
      phrase.classList.add('is-frozen');
      await wait(FREEZE_MS);
      const next = words[(index + 1) % words.length];
      // The ice falls where the phrase stood, then the empty gap between "We make" and "fun."
      // eases to the next phrase's width before it thaws in.
      phrase.style.width = phrase.getBoundingClientRect().width + 'px';
      shatter(words[index]);
      await wait(SHATTER_MS);
      phrase.textContent = '';
      phrase.style.width = widthOf(next) + 'px';
      await wait(RESIZE_MS);
      index = (index + 1) % words.length;
      await thawIn(next);
      phrase.style.width = '';
    }
  }
  run();
})();
