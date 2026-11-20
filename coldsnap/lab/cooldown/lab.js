// Cooldown Sans playground: sliders drive the font's axes, switches turn on its OpenType sets
// (ss03 tails on d/q, ss02 snowflake dots), and three preset buttons show what it was built for.
// The "why" text lives in the project description, not here. ?lang=en for English.
//
// Smoothness: sliders, presets and the intro demo only set a *target*. One animation loop eases
// the shown values toward it every frame (no CSS transition, which lagged behind the slider and
// jumped when it was interrupted), and sleeps once everything has arrived.
(function () {
  const lang = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'fr';
  document.documentElement.lang = lang;
  // Inside the project viewer (an iframe) the page is set tighter so it fits without scrolling.
  if (window.self !== window.top) document.documentElement.classList.add('is-embed');

  const T = {
    fr: {
      weight: 'Graisse', xheight: 'Hauteur des minuscules', wobble: 'Bancal',
      tail: 'Queues sur d et q', spark: 'Points en flocon',
      sample: 'Cooldown Sans · bdpq ij !',
      presets: { dyslexia: ['Dyslexie', 'bdpq · qdbp'], vision: ['Basse vision', 'Salle 3 · 14 h 30'], fun: ['Pour jouer', 'Joyeux hiver ❄ · jeu, joie !'] }
    },
    en: {
      weight: 'Weight', xheight: 'Lowercase height', wobble: 'Wobble',
      tail: 'Tails on d and q', spark: 'Snowflake dots',
      sample: 'Cooldown Sans · bdpq ij !',
      presets: { dyslexia: ['Dyslexia', 'bdpq · qdbp'], vision: ['Low vision', 'Room 3 · 2:30 pm'], fun: ['For fun', 'Happy winter ❄ · join in!'] }
    }
  }[lang];

  const AXES = ['wght', 'xhgt', 'wobl'];
  const DEFAULT = { wght: 400, xhgt: 547, wobl: 0, tail: false, spark: false };
  const PRESETS = {
    dyslexia: { wght: 400, xhgt: 547, wobl: 0, tail: true, spark: false },
    vision: { wght: 500, xhgt: 595, wobl: 0, tail: true, spark: false },
    fun: { wght: 600, xhgt: 560, wobl: 0.7, tail: false, spark: true }
  };

  const $ = id => document.getElementById(id);
  const sample = $('sample'), css = $('css');
  const sliders = { wght: $('wght'), xhgt: $('xhgt'), wobl: $('wobl') };
  const tail = $('tail'), spark = $('spark');

  document.querySelectorAll('[data-t]').forEach(el => { el.textContent = T[el.dataset.t]; });

  // What the sliders ask for, and what the text shows right now.
  const target = { wght: DEFAULT.wght, xhgt: DEFAULT.xhgt, wobl: DEFAULT.wobl };
  const shown = { ...target };
  const EASE = 0.14;   // share of the remaining distance covered each frame (~60 fps)

  function render() {
    sample.style.fontVariationSettings =
      `"wght" ${shown.wght.toFixed(1)}, "XHGT" ${shown.xhgt.toFixed(1)}, "WOBL" ${shown.wobl.toFixed(3)}`;
    const feats = [tail.checked && '"ss03" 1', spark.checked && '"ss02" 1'].filter(Boolean);
    sample.style.fontFeatureSettings = feats.length ? feats.join(', ') : 'normal';
    css.textContent =
      'font-family: "Cooldown Sans";\n' +
      `font-variation-settings: "wght" ${Math.round(target.wght)}, "XHGT" ${Math.round(target.xhgt)}, "WOBL" ${target.wobl.toFixed(2)};` +
      (feats.length ? `\nfont-feature-settings: ${feats.join(', ')};` : '');
  }

  let looping = false;
  let demoStep = null;   // set while the intro demo runs
  function loop(now) {
    if (demoStep) demoStep(now);
    let moving = false;
    for (const a of AXES) {
      const gap = target[a] - shown[a];
      if (Math.abs(gap) > (a === 'wobl' ? 0.0005 : 0.05)) {
        shown[a] += gap * EASE;
        moving = true;
      } else {
        shown[a] = target[a];
      }
    }
    render();
    if (moving || demoStep) requestAnimationFrame(loop);
    else looping = false;
  }
  function wake() {
    if (looping) return;
    looping = true;
    requestAnimationFrame(loop);
  }

  // Slider thumbs follow the target; the text eases after it.
  function setTargets(values) {
    for (const a of AXES) {
      target[a] = values[a];
      sliders[a].value = values[a];
    }
    if ('tail' in values) tail.checked = values.tail;
    if ('spark' in values) spark.checked = values.spark;
    wake();
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
  for (const key of Object.keys(PRESETS)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'lab__preset';
    b.textContent = T.presets[key][0];
    b.addEventListener('click', () => {
      select(key);
      setTargets(PRESETS[key]);
      setSample(T.presets[key][1]);
    });
    $('presets').appendChild(b);
    buttons[key] = b;
  }

  // Touching a slider or switch by hand leaves the presets.
  for (const a of AXES) {
    sliders[a].addEventListener('input', () => {
      select(null);
      target[a] = parseFloat(sliders[a].value);
      wake();
    });
  }
  [tail, spark].forEach(c => c.addEventListener('change', () => { select(null); render(); }));

  setSample(T.sample);
  setTargets(DEFAULT);
  render();

  // Until the visitor touches anything, the font plays with itself, slowly: the targets drift
  // through weight, x-height and wobble, and the switches turn on and off now and then. The
  // first touch, click or key brings everything back to normal, so only what the visitor then
  // picks is on.
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const start = performance.now();
  let lastFlip = 0;
  demoStep = now => {
    const t = (now - start) / 1000;
    const values = {
      wght: 500 - 200 * Math.cos(t * 0.28),
      xhgt: 555 - 35 * Math.cos(t * 0.19),
      wobl: 0.3 - 0.3 * Math.cos(t * 0.23)
    };
    for (const a of AXES) {
      target[a] = values[a];
      sliders[a].value = values[a];
    }
    if (t - lastFlip > 5) {
      lastFlip = t;
      const step = Math.round(t / 5) % 4;
      tail.checked = step === 1 || step === 2;
      spark.checked = step >= 2;
    }
  };
  function stop() {
    if (!demoStep) return;
    demoStep = null;
    select(null);
    setTargets(DEFAULT);
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach(type =>
    addEventListener(type, stop, { once: true, passive: true, capture: true }));
  wake();
})();
