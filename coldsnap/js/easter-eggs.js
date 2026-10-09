/**
 * ColdSnap - Easter eggs
 *
 * 1. Console greeting for curious developers.
 * 2. Konami code (↑↑↓↓←→←→BA): every hero card flips and gets flung, with sparkles.
 * 3. Type "snap", or click the nav logo 5 times quickly: a cold snap freezes the page (and the cards).
 * 4. Reveal every card on the table: a secret wizard card drops into the deck.
 * 5. The ✦ at the very bottom of the footer: make a wish.
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
  }

  // ── 3. Cold snap ────────────────────────────────────────
  let typed = '';
  let freezing = false;

  function coldSnap() {
    if (freezing) return;
    freezing = true;
    document.body.classList.add('is-frozen');
    if (window.coldsnapDeck) window.coldsnapDeck.setFrozen(true);
    toast(i18n.t('egg.freeze'));
    setTimeout(() => {
      document.body.classList.remove('is-frozen');
      document.body.classList.add('is-thawing');
      if (window.coldsnapDeck) window.coldsnapDeck.setFrozen(false);
      setTimeout(() => {
        document.body.classList.remove('is-thawing');
        freezing = false;
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

  const logo = document.querySelector('.cs-nav__brand');
  let logoClicks = [];
  if (logo) {
    logo.addEventListener('click', () => {
      const now = Date.now();
      logoClicks = logoClicks.filter(t => now - t < 2000).concat(now);
      if (logoClicks.length >= 5) {
        logoClicks = [];
        coldSnap();
      }
    });
  }

  // ── 4. The wizard card ──────────────────────────────────
  const WIZARD = {
    id: 'the-wizard',
    category: 'Secret',
    title: 'The Wizard',
    type: 'Secret card',
    thumbnail: 'assets/coldnsap_logo.png',
    media: ['assets/coldnsap_logo.png'],
    description: 'You turned over every single card. That\'s exactly how I work: look under every card before building anything. Slip the word "abracadabra" into your email and I\'ll know you\'re one of the curious ones.',
    features: ['Curiosity: maxed out', 'Cards turned: all of them', 'Password: abracadabra'],
    tech: ['Patience', 'Curiosity', 'A little magic'],
    links: [
      { label: 'Write to the wizard', labelFr: 'Écrire au magicien', href: 'mailto:contact@coldsnap.fr?subject=Abracadabra', icon: 'fa-magic' }
    ],
    fr: {
      title: 'Le Magicien',
      type: 'Carte secrète',
      description: 'Vous avez retourné toutes les cartes. C\'est exactement comme ça que je travaille : regarder sous chaque carte avant de construire. Glissez le mot « abracadabra » dans votre e-mail, je saurai que vous faites partie des curieux.',
      features: ['Curiosité : maximale', 'Cartes retournées : toutes', 'Mot de passe : abracadabra']
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
    });
  }
})();
