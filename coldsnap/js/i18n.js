/**
 * ColdSnap - EN/FR translations
 *
 * Markup carries the English text plus a key:
 *   data-i18n="key"            → textContent
 *   data-i18n-html="key"       → innerHTML (for strings with <em>, <strong>, links)
 *   data-i18n-attr="attr:key"  → an attribute (comma-separate several)
 *   data-legal-href="url"      → nathandecastro.com legal page, gets ?lang=fr in French
 * The English text is captured on first run, so only French needs a dictionary entry.
 * Loaded synchronously at the end of <body>; the inline script in <head> already chose the language.
 */
(function () {
  const FR = {
    'skip': 'Aller au contenu',
    'lang.label': 'Langue',

    'nav.work': 'Réalisations',
    'nav.approach': 'Approche',
    'nav.cta': 'Démarrer un projet',
    'nav.menu': 'Menu',

    'hero.lead': 'Applications, jeux et installations interactives sur mesure qui rendent l\'apprentissage ludique. Vous travaillez directement avec moi, de la première idée jusqu\'à la livraison.',
    'hero.sub': 'Studio de gamification',
    'hero.cta': 'Démarrer un projet',
    'hero.secondary': 'Voir mes réalisations',


    'numbers.users': 'utilisateurs par an sur une plateforme de réservation et de paiement',
    'numbers.visitors': 'visiteurs de musée par an sur mes installations',
    'numbers.escape': 'sessions d\'escape game jouées',
    'numbers.years': 'ans à livrer des logiciels en production',

    'work.title': 'Réalisations',
    'work.filterLabel': 'Filtrer les projets',
    'work.more': 'Voir les {n} projets',
    'work.less': 'Réduire',
    'work.showing': 'À l\'écran',
    'viewer.prev': 'Projet précédent',
    'viewer.next': 'Projet suivant',
    'viewer.prevMedia': 'Image précédente',
    'viewer.nextMedia': 'Image suivante',
    'viewer.zoom': 'Agrandir l\'image',
    'viewer.more': 'Plus de détails',
    'viewer.less': 'Moins de détails',

    'filter.all': 'Tout',
    'filter.Interactive Installations': 'Installations',
    'filter.Games': 'Jeux',
    'filter.Flutter Apps': 'Apps',
    'filter.Web Platforms': 'Plateformes web',
    'filter.Open Source': 'Open source',

    'approach.title': 'Comment se passe un projet',
    'approach.lead': 'Vous travaillez directement avec moi, du premier appel à bien après la livraison. Pas d\'agence ni de chargé de compte entre nous.',
    'approach.1.title': 'On discute',
    'approach.1.text': 'Vous me parlez de votre projet et de votre public. Je pose des questions jusqu\'à ce que l\'objectif soit clair.',
    'approach.2.title': 'Je fais un prototype',
    'approach.2.text': 'Vous avez vite quelque chose à essayer, pas seulement un document.',
    'approach.3.title': 'On l\'affine',
    'approach.3.text': 'Vous testez, vous me dites ce qui marche et ce qui ne marche pas, et j\'ajuste jusqu\'à ce que ce soit juste.',
    'approach.4.title': 'Je m\'en occupe ensuite',
    'approach.4.text': 'Après la livraison, je reste disponible pour les corrections, les mises à jour et les nouvelles fonctionnalités.',

    'contact.title': 'Démarrer un projet',
    'contact.lead': 'Dites-moi ce que vous avez en tête. Je reviens vers vous avec des questions, des idées et un devis clair.',
    'contact.about': 'Envie de savoir qui se cache derrière ColdSnap ? <a href="https://nathandecastro.com/" target="_blank" rel="noopener">nathandecastro.com</a>',
    'contact.subject': 'Nouveau projet',
    'contact.where': 'Basé à',
    'contact.whereValue': 'Mouans-Sartoux, France. Je travaille en France et en Suisse, en français ou en anglais.',
    'contact.terms': 'Conditions',
    'contact.termsValue': 'Conditions générales de vente (CGV)',

    'footer.tagline': 'Rendre l\'apprentissage ludique grâce à la gamification.',
    'footer.contact': 'Contact',
    'footer.founder': 'À propos de moi',
    'footer.legal': 'Légal',
    'footer.mentions': 'Mentions légales',
    'footer.cgv': 'CGV',
    'footer.privacy': 'Confidentialité',
    'footer.vat': 'TVA',
    'footer.made': 'Fait avec soin, du café et un peu de magie',

    'modal.close': 'Fermer',
    'modal.features': 'Fonctionnalités',
    'modal.tech': 'Technologies',

    'card.reveal': 'cliquez pour retourner',
    'card.open': 'cliquez pour ouvrir',

    'egg.console': 'Psst. Il y a quelques secrets sur cette page. Vous connaissez le Konami code ?',
    'egg.konami': 'Abracadabra ! Toutes les cartes sont révélées.',
    'egg.freeze': 'Cold snap ! Tout est gelé… dégel en cours.',
    'egg.wizard': 'Une carte de trop ? Le magicien vient de se glisser dans le paquet.',
    'egg.star': 'Vœu enregistré. ✦',
    'drive.drive': 'conduire',
    'drive.drift': 'déraper',
    'drive.use': 'utiliser',
    'drive.exit': 'Quitter'
  };

  const EN_EXTRA = {
    'filter.all': 'All',
    'filter.Interactive Installations': 'Installations',
    'filter.Games': 'Games',
    'filter.Flutter Apps': 'Apps',
    'filter.Web Platforms': 'Web platforms',
    'filter.Open Source': 'Open source',
    'work.more': 'Show all {n} projects',
    'work.less': 'Show fewer',
    'work.showing': 'Now showing',
    'viewer.prev': 'Previous project',
    'viewer.next': 'Next project',
    'viewer.prevMedia': 'Previous image',
    'viewer.nextMedia': 'Next image',
    'viewer.zoom': 'Enlarge image',
    'viewer.more': 'More details',
    'viewer.less': 'Fewer details',
    'contact.subject': 'New project',
    'modal.close': 'Close',
    'modal.features': 'Features',
    'modal.tech': 'Technologies',
    'card.reveal': 'click to reveal',
    'card.open': 'click to open',
    'egg.console': 'Psst. There are a few secrets on this page. Ever heard of the Konami code?',
    'egg.konami': 'Abracadabra! Every card revealed.',
    'egg.freeze': 'Cold snap! Everything froze… thawing out.',
    'egg.wizard': 'One card too many? The wizard just slipped into the deck.',
    'egg.star': 'Wish recorded. ✦',
    'drive.drive': 'drive',
    'drive.drift': 'drift',
    'drive.use': 'use',
    'drive.exit': 'Exit'
  };

  const TITLES = {
    en: 'ColdSnap — Gamification Studio | Installations, Games & Apps',
    fr: 'ColdSnap — Studio de gamification | Installations, jeux & apps'
  };

  const EN = Object.assign({}, EN_EXTRA);
  const listeners = [];
  let lang = document.documentElement.lang === 'fr' ? 'fr' : 'en';

  // Remember the English markup the first time each element is seen.
  function captureEnglish() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (!(key in EN)) EN[key] = el.textContent;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.dataset.i18nHtml;
      if (!(key in EN)) EN[key] = el.innerHTML;
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      el.dataset.i18nAttr.split(',').forEach(pair => {
        const [attr, key] = pair.split(':').map(s => s.trim());
        if (!(key in EN)) EN[key] = el.getAttribute(attr) || '';
      });
    });
  }

  function t(key) {
    const dict = lang === 'fr' ? FR : EN;
    return key in dict ? dict[key] : (EN[key] !== undefined ? EN[key] : key);
  }

  function apply() {
    document.documentElement.lang = lang;
    document.title = TITLES[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      el.dataset.i18nAttr.split(',').forEach(pair => {
        const [attr, key] = pair.split(':').map(s => s.trim());
        el.setAttribute(attr, t(key));
      });
    });
    document.querySelectorAll('[data-legal-href]').forEach(el => {
      el.href = el.dataset.legalHref + (lang === 'fr' ? '?lang=fr' : '');
    });
    document.querySelectorAll('[data-lang]').forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
    });
    const mail = document.getElementById('contactMail');
    if (mail) mail.href = 'mailto:contact@coldsnap.fr?subject=' + encodeURIComponent(t('contact.subject'));
  }

  function setLang(next) {
    next = next === 'fr' ? 'fr' : 'en';
    if (next === lang) return;
    lang = next;
    try { localStorage.setItem('coldsnap-lang', lang); } catch (e) {}
    const url = new URL(location.href);
    url.searchParams.delete('lang');
    history.replaceState(null, '', url);
    apply();
    listeners.forEach(fn => fn(lang));
  }

  // Pick a translated field from a project (falls back to English).
  function field(project, name) {
    if (lang === 'fr' && project.fr && project.fr[name] !== undefined) return project.fr[name];
    return project[name];
  }

  captureEnglish();
  apply();
  document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });

  window.CS_I18N = {
    get lang() { return lang; },
    t,
    field,
    setLang,
    onChange(fn) { listeners.push(fn); }
  };
})();
