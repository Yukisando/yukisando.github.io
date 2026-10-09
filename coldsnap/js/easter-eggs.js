/**
 * ColdSnap - Easter eggs
 *
 * 1. Console greeting for curious developers.
 * 2. Konami code (↑↑↓↓←→←→BA): every hero card flips and gets flung, with sparkles.
 * 3. Type "snap", or click the nav logo 5 times quickly (frost builds with each click): a cold snap freezes the page (and the cards).
 * 4. Reveal every card on the table: a secret wizard card drops into the deck.
 *    Clicking it turns it into a car (js/drive.js).
 * 5. The ✦ at the very bottom of the footer: make a wish.
 *
 * Every egg found is reported to the shared secrets counter (js/secrets.js), the
 * same one nathandecastro.com uses. The ice for 3 is drawn by js/frost.js.
 *
 * Physics hooks come from window.coldsnapDeck (js/coldsnap.js), which only exists on desktop.
 */
(function () {
  const i18n = window.CS_I18N;
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Toast ───────────────────────────────────────────────
  let toastTimer = null;
  function toast(message) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 3600);
  }

  // ── Secrets ─────────────────────────────────────────────
  function award(key) {
    if (window.Secrets) window.Secrets.award(key);
  }

  // ── Sparkles ────────────────────────────────────────────
  function sparkleBurst(count = 36, origin) {
    if (reducedMotion()) return;
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.className = 'sparkle';
      s.textContent = Math.random() < 0.7 ? '✦' : '✧';
      const x = origin ? origin.x : Math.random() * innerWidth;
      const y = origin ? origin.y : Math.random() * innerHeight;
      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * (origin ? 160 : 60);
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      s.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      s.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
      s.style.setProperty('--size', (10 + Math.random() * 16) + 'px');
      s.style.animationDelay = (Math.random() * 400) + 'ms';
      document.body.appendChild(s);
      s.addEventListener('animationend', () => s.remove());
    }
  }

  window.csSparkle = sparkleBurst;

  // ── 1. Console greeting ─────────────────────────────────
  console.log(
    '%c✦ ColdSnap %c\n\n' +
    '      .\n' +
    '     /:\\      ' + i18n.t('egg.console') + '\n' +
    '    /;:.\\\n' +
    '   //;:. \\    contact@coldsnap.fr\n' +
    '  ///;:.. \\\n' +
    ' ~~~~~~~~~~~\n',
    'font: 700 18px sans-serif; color: #F5841A;',
    'font: 12px monospace; color: #6BBFD0;'
  );

  // ── 2. Konami code ──────────────────────────────────────
  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let konamiPos = 0;

  function castSpell() {
    sparkleBurst(48);
    document.body.classList.add('is-spellbound');
    setTimeout(() => document.body.classList.remove('is-spellbound'), 1600);
    const deck = window.coldsnapDeck;
    if (deck) {
      deck.revealAll();
      deck.shuffle();
    }
    toast(i18n.t('egg.konami'));
    award('konami');
  }

  // ── 3. Cold snap ────────────────────────────────────────
  let typed = '';
  let freezing = false;

  function coldSnap() {
    if (freezing) return;
    freezing = true;
    if (window.coldsnapDeck) window.coldsnapDeck.setFrozen(true);
    toast(i18n.t('egg.freeze'));
    award('snap');
    const done = () => {
      if (window.coldsnapDeck) window.coldsnapDeck.setFrozen(false);
      freezing = false;
    };
    if (window.CS_FROST) {
      // real ice: js/frost.js grows crystals over the whole viewport, holds, then thaws
      window.CS_FROST.snap().then(done);
      return;
    }
    document.body.classList.add('is-frozen');
    setTimeout(() => {
      document.body.classList.remove('is-frozen');
      document.body.classList.add('is-thawing');
      setTimeout(() => {
        document.body.classList.remove('is-thawing');
        done();
      }, 1200);
    }, 5000);
  }

  document.addEventListener('keydown', (e) => {
    const target = e.target;
    if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    konamiPos = key === KONAMI[konamiPos] ? konamiPos + 1 : (key === KONAMI[0] ? 1 : 0);
    if (konamiPos === KONAMI.length) {
      konamiPos = 0;
      castSpell();
    }

    if (key.length === 1) {
      typed = (typed + key).slice(-4);
      if (typed === 'snap') coldSnap();
    }
  });

  // Each quick logo click frosts the screen a little more; the fifth freezes it.
  const logo = document.querySelector('.cs-nav__brand');
  const CLICKS_TO_FREEZE = 5;
  let logoClicks = [];
  let chillTimer = null;

  function setChill(level) {
    if (window.CS_FROST) window.CS_FROST.chill(level / CLICKS_TO_FREEZE);
  }

  if (logo) {
    logo.addEventListener('click', () => {
      if (freezing) return;
      const now = Date.now();
      logoClicks = logoClicks.filter(t => now - t < 2000).concat(now);
      if (logoClicks.length >= CLICKS_TO_FREEZE) {
        logoClicks = [];
        clearTimeout(chillTimer);
        setChill(0);
        coldSnap();
        return;
      }
      setChill(logoClicks.length);
      logo.classList.remove('is-shivering');
      void logo.offsetWidth;
      logo.classList.add('is-shivering');
      clearTimeout(chillTimer);
      chillTimer = setTimeout(() => { logoClicks = []; setChill(0); }, 2000);
    });
    logo.addEventListener('dragstart', e => e.preventDefault());
  }

  // ── 4. The wizard card ──────────────────────────────────
  const WIZARD = {
    id: 'the-wizard',
    drive: true,
    category: 'Secret',
    title: 'Drive me',
    type: 'Secret card',
    thumbnail: 'assets/car.png',
    fr: {
      title: 'Conduis-moi',
      type: 'Carte secrète'
    }
  };
  let wizardDealt = false;

  document.addEventListener('coldsnap:all-revealed', () => {
    if (wizardDealt || !window.coldsnapDeck) return;
    wizardDealt = true;
    setTimeout(() => {
      window.coldsnapDeck.addCard(WIZARD, 'physics-card--wizard');
      const table = document.getElementById('card-table');
      if (table) {
        const r = table.getBoundingClientRect();
        sparkleBurst(24, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }
      toast(i18n.t('egg.wizard'));
      award('wizard');
    }, 700);
  });

  // ── 5. Wishing star ─────────────────────────────────────
  const star = document.getElementById('secretStar');
  if (star) {
    star.addEventListener('click', () => {
      if (!reducedMotion()) {
        const shooting = document.createElement('span');
        shooting.className = 'shooting-star';
        shooting.textContent = '✦';
        document.body.appendChild(shooting);
        shooting.addEventListener('animationend', () => shooting.remove());
        const r = star.getBoundingClientRect();
        sparkleBurst(14, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }
      toast(i18n.t('egg.star'));
      award('star');
    });
  }
})();
