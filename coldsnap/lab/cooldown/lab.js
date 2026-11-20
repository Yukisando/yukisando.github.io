// Cooldown Sans playground: sliders drive the font's axes through CSS variables, switches turn
// on its OpenType sets (ss03 tails on d/q, ss02 sparkle dots), and three preset buttons show
// what it was built for. The "why" text lives in the project description, not here.
// ?lang=en for English.
(function () {
  const lang = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'fr';
  document.documentElement.lang = lang;
  // Inside the project viewer (an iframe) the page is set tighter so it fits without scrolling.
  if (window.self !== window.top) document.documentElement.classList.add('is-embed');

  const T = {
    fr: {
      weight: 'Graisse', xheight: 'Hauteur des minuscules', wobble: 'Bancal',
      tail: 'Queues sur d et q', spark: 'Points en étoile',
      presets: { dyslexia: ['Dyslexie', 'bdpq · qdbp'], vision: ['Basse vision', 'Salle 3 · 14 h 30'], fun: ['Pour jouer', 'Joyeux hiver ❄ !'] }
    },
    en: {
      weight: 'Weight', xheight: 'Lowercase height', wobble: 'Wobble',
      tail: 'Tails on d and q', spark: 'Sparkle dots',
      presets: { dyslexia: ['Dyslexia', 'bdpq · qdbp'], vision: ['Low vision', 'Room 3 · 2:30 pm'], fun: ['For fun', 'Happy winter ❄ !'] }
    }
  }[lang];

  const DEFAULT = { wght: 400, xhgt: 547, wobl: 0, tail: false, spark: false };
  const PRESETS = {
    dyslexia: { wght: 400, xhgt: 547, wobl: 0, tail: true, spark: false },
    vision: { wght: 500, xhgt: 595, wobl: 0, tail: true, spark: false },
    fun: { wght: 600, xhgt: 560, wobl: 0.7, tail: false, spark: true }
  };

  const $ = id => document.getElementById(id);
  const root = document.documentElement.style;
  const sample = $('sample'), css = $('css');
  const sliders = { wght: $('wght'), xhgt: $('xhgt'), wobl: $('wobl') };
  const tail = $('tail'), spark = $('spark');

  document.querySelectorAll('[data-t]').forEach(el => { el.textContent = T[el.dataset.t]; });

  function apply() {
    for (const [axis, input] of Object.entries(sliders)) {
      root.setProperty('--' + axis, input.value);
      $(axis + 'Out').textContent = input.value;
    }
    const feats = [tail.checked && '"ss03" 1', spark.checked && '"ss02" 1'].filter(Boolean);
    sample.style.fontFeatureSettings = feats.length ? feats.join(', ') : 'normal';
    css.textContent =
      'font-family: "Cooldown Sans";\n' +
      `font-variation-settings: "wght" ${sliders.wght.value}, "XHGT" ${sliders.xhgt.value}, "WOBL" ${sliders.wobl.value};` +
      (feats.length ? `\nfont-feature-settings: ${feats.join(', ')};` : '');
  }

  function set(values) {
    sliders.wght.value = values.wght;
    sliders.xhgt.value = values.xhgt;
    sliders.wobl.value = values.wobl;
    tail.checked = values.tail;
    spark.checked = values.spark;
  }

  function setSample(text) {
    sample.textContent = '';
    const [first, ...rest] = text.split(' · ');
    sample.append(first);
    if (rest.length) {
      const second = document.createElement('span');
      second.className = 'lab__pairs';
      second.textContent = rest.join(' · ');
      sample.append(document.createElement('br'), second);
    }
  }

  const buttons = {};
  const select = key => { for (const [k, b] of Object.entries(buttons)) b.setAttribute('aria-pressed', String(k === key)); };
  function choose(key) {
    select(key);
    set(PRESETS[key]);
    setSample(T.presets[key][1]);
    apply();
  }
  for (const key of Object.keys(PRESETS)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'lab__preset';
    b.textContent = T.presets[key][0];
    b.addEventListener('click', () => choose(key));
    $('presets').appendChild(b);
    buttons[key] = b;
  }

  // Touching a slider or switch by hand leaves the presets.
  Object.values(sliders).forEach(s => s.addEventListener('input', () => { select(null); apply(); }));
  [tail, spark].forEach(c => c.addEventListener('change', () => { select(null); apply(); }));
  sample.addEventListener('input', apply);

  set(DEFAULT);
  setSample('Cooldown Sans · bdpq ❄');
  apply();

  // Until the visitor touches anything, the font plays with itself, slowly: the sliders drift
  // through weight, x-height and wobble, and the switches turn on and off now and then. The
  // first touch, click or key puts everything back to normal, so only what the visitor then
  // picks is on.
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const page = document.documentElement;
  page.classList.add('is-demo');
  let running = true;
  const start = performance.now();
  let lastFlip = 0;
  function frame(now) {
    if (!running) return;
    const t = (now - start) / 1000;
    sliders.wght.value = Math.round(500 - 200 * Math.cos(t * 0.28));
    sliders.xhgt.value = Math.round(555 - 35 * Math.cos(t * 0.19));
    sliders.wobl.value = (0.3 - 0.3 * Math.cos(t * 0.23)).toFixed(2);
    if (t - lastFlip > 5) {
      lastFlip = t;
      const step = Math.round(t / 5) % 4;
      tail.checked = step === 1 || step === 2;
      spark.checked = step >= 2;
    }
    apply();
    requestAnimationFrame(frame);
  }
  function stop() {
    if (!running) return;
    running = false;
    page.classList.remove('is-demo');
    set(DEFAULT);
    select(null);
    apply();
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach(type =>
    addEventListener(type, stop, { once: true, passive: true, capture: true }));
  requestAnimationFrame(frame);
})();
