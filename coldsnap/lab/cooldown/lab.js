// Cooldown playground: sliders drive the font's axes through CSS variables, checkboxes switch
// its OpenType sets (ss03 tails on d/q, ss02 sparkle dots). Each "story" button explains one
// reason the font exists and sets the controls to show it. ?lang=en for English.
(function () {
  const lang = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'fr';
  document.documentElement.lang = lang;
  // Inside the project viewer (an iframe) the page is set tighter so it fits without scrolling.
  if (window.self !== window.top) document.documentElement.classList.add('is-embed');

  const T = {
    fr: {
      weight: 'Graisse', xheight: 'Hauteur des minuscules', wobble: 'Bancal',
      tail: 'Queues sur d et q', spark: 'Points en étoile', compare: 'Comparer sans réglages',
      plain: 'Sans réglages (≈ Comfortaa)',
      stories: {
        dyslexia: ['Dyslexie', 'bdpq · qdbp',
          'Dans Comfortaa, d et q sont b et p retournés : un lecteur dyslexique peut les confondre. Avec les queues, chaque lettre a sa propre forme. Les lettres sont aussi un peu plus espacées.'],
        vision: ['Basse vision', 'Salle 3 · 14 h 30',
          'Des minuscules plus hautes se lisent mieux en petit et de loin, sur une borne ou un panneau. La hauteur se règle sans toucher aux majuscules.'],
        fun: ['Pour jouer', 'Joyeux hiver ❄ !',
          'Chaque lettre peut pencher à sa façon, comme écrite à la main, et les points deviennent des étoiles de givre. Sur notre site, ce léger bancal remplace l’italique.'],
        name: ['Le nom', 'Cooldown ❄',
          'Cold Snap est le sort qui remet tous les temps de recharge à zéro. Cooldown garde les formes rondes de Comfortaa et retire ce qui fait trébucher à la lecture.']
      }
    },
    en: {
      weight: 'Weight', xheight: 'Lowercase height', wobble: 'Wobble',
      tail: 'Tails on d and q', spark: 'Sparkle dots', compare: 'Compare with no settings',
      plain: 'No settings (≈ Comfortaa)',
      stories: {
        dyslexia: ['Dyslexia', 'bdpq · qdbp',
          'In Comfortaa, d and q are b and p flipped over, so a dyslexic reader can mix them up. With tails, each letter has a shape of its own. Letters also sit a little further apart.'],
        vision: ['Low vision', 'Room 3 · 2:30 pm',
          'Taller lowercase letters read better small and from a distance, on a kiosk or a sign. The height changes without touching the capitals.'],
        fun: ['For fun', 'Happy winter ❄ !',
          'Each letter can tilt its own way, as if written by hand, and dots turn into frost sparkles. On our site, this slight wobble stands in for italics.'],
        name: ['The name', 'Cooldown ❄',
          'Cold Snap is the spell that resets every cooldown. Cooldown keeps Comfortaa’s round shapes and removes what makes readers stumble.']
      }
    }
  }[lang];

  const PRESETS = {
    dyslexia: { wght: 400, xhgt: 547, wobl: 0, tail: true, spark: false },
    vision: { wght: 500, xhgt: 595, wobl: 0, tail: true, spark: false },
    fun: { wght: 600, xhgt: 560, wobl: 0.7, tail: false, spark: true },
    name: { wght: 700, xhgt: 547, wobl: 0, tail: false, spark: false }
  };

  const $ = id => document.getElementById(id);
  const root = document.documentElement.style;
  const sample = $('sample'), story = $('story'), css = $('css');
  const sliders = { wght: $('wght'), xhgt: $('xhgt'), wobl: $('wobl') };
  const tail = $('tail'), spark = $('spark'), compare = $('compare');
  const compareBox = $('compareBox'), compareText = $('compareText');

  document.querySelectorAll('[data-t]').forEach(el => { el.textContent = T[el.dataset.t]; });
  document.querySelector('.lab__compare-label').textContent = T.plain;

  function apply() {
    for (const [axis, input] of Object.entries(sliders)) {
      root.setProperty('--' + axis, input.value);
      $(axis + 'Out').textContent = input.value;
    }
    const feats = [tail.checked && '"ss03" 1', spark.checked && '"ss02" 1'].filter(Boolean);
    sample.style.fontFeatureSettings = feats.length ? feats.join(', ') : 'normal';
    compareBox.hidden = !compare.checked;
    compareText.textContent = sample.innerText;
    css.textContent =
      'font-family: "Cooldown";\n' +
      `font-variation-settings: "wght" ${sliders.wght.value}, "XHGT" ${sliders.xhgt.value}, "WOBL" ${sliders.wobl.value};` +
      (feats.length ? `\nfont-feature-settings: ${feats.join(', ')};` : '');
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

  const bar = $('stories');
  const buttons = {};
  function choose(key) {
    const [, text, body] = T.stories[key];
    const p = PRESETS[key];
    for (const [k, b] of Object.entries(buttons)) b.setAttribute('aria-selected', String(k === key));
    sliders.wght.value = p.wght;
    sliders.xhgt.value = p.xhgt;
    sliders.wobl.value = p.wobl;
    tail.checked = p.tail;
    spark.checked = p.spark;
    setSample(text);
    story.textContent = body;
    apply();
  }
  for (const key of Object.keys(T.stories)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'lab__story-btn';
    b.setAttribute('role', 'tab');
    b.textContent = T.stories[key][0];
    b.addEventListener('click', () => choose(key));
    bar.appendChild(b);
    buttons[key] = b;
  }

  Object.values(sliders).forEach(s => s.addEventListener('input', apply));
  [tail, spark, compare].forEach(c => c.addEventListener('change', apply));
  sample.addEventListener('input', apply);
  choose('dyslexia');
})();
