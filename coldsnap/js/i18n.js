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
    'nav.process': 'Méthode',
    'nav.cta': 'Démarrer un projet',
    'nav.menu': 'Menu',

    'hero.lead': 'Installations interactives, jeux éducatifs et applications multiplateformes, du premier atelier à la maintenance. France & Suisse.',
    'hero.sub': 'Studio de gamification',
    'hero.cta': 'Démarrer un projet',
    'hero.secondary': 'Voir mes réalisations',
    'hero.caption': 'Mes projets, en vrac. Attrapez une carte, cliquez pour la retourner.',


    'numbers.title': 'En chiffres',
    'numbers.quake.value': 'Le plus grand',
    'numbers.quake.label': 'simulateur de séisme d\'Europe, au centre de formation dont j\'ai créé le parcours interactif',
    'numbers.years': 'ans à livrer des logiciels en production',
    'numbers.users': 'utilisateurs par an sur la plateforme de réservation et de paiement',
    'numbers.visitors': 'visiteurs de musée par an sur les installations que j\'ai développées',
    'numbers.minigames': 'mini-jeux tactiles répartis sur 27 stations',
    'numbers.escape': 'sessions d\'escape game jouées',


    'work.title': 'Réalisations',
    'work.filterLabel': 'Filtrer les projets',
    'work.featured': 'Étude de cas',
    'work.open': 'Voir le projet',

    'filter.all': 'Tout',
    'filter.Interactive Installations': 'Installations',
    'filter.Games': 'Jeux',
    'filter.Flutter Apps': 'Apps',
    'filter.Web Platforms': 'Plateformes web',
    'filter.Open Source': 'Open source',

    'process.title': 'Ma méthode',
    'process.1.title': 'Comprendre',
    'process.1.text': 'Des ateliers avec vos experts, sismologues, chirurgiens ou enseignants, pour définir ce que le public doit apprendre, ressentir et faire.',
    'process.2.title': 'Prototyper',
    'process.2.text': 'Du jouable, très tôt. Je le teste avec de vrais utilisateurs et je garde les idées qui marchent vraiment.',
    'process.3.title': 'Construire',
    'process.3.text': 'Architecture de production, contenus, interface multilingue, paiements et matériel, conçus pour tourner toute la journée, tous les jours.',
    'process.4.title': 'Lancer & suivre',
    'process.4.text': 'Déploiement, publication sur les stores, flottes de bornes et mises à jour à distance, avec une maintenance en option une fois en ligne.',


    'contact.title': 'Démarrer un projet',
    'contact.lead': 'Dites-moi ce que le public doit apprendre ou faire, à qui ça s\'adresse, où ça va tourner et dans quels délais. Je reviens vers vous avec des questions, des idées et un devis.',
    'numbers.planChange': 'des plans chirurgicaux modifiés après examen du modèle 3D en VR par les chirurgiens (validé cliniquement)',
    'contact.about': 'Envie de savoir qui se cache derrière ColdSnap ? <a href="https://nathandecastro.com/" target="_blank" rel="noopener">nathandecastro.com</a>',
    'contact.subject': 'Nouveau projet',
    'contact.where': 'Basé à',
    'contact.whereValue': 'Mouans-Sartoux, Côte d\'Azur. Je travaille en France et en Suisse.',
    'contact.languages': 'Langues',
    'contact.languagesValue': 'Français & anglais',
    'contact.terms': 'Conditions',
    'contact.termsValue': 'Conditions générales de vente (CGV)',

    'footer.tagline': 'Rendre l\'apprentissage ludique grâce à la gamification.',
    'footer.contact': 'Contact',
    'footer.founder': 'À propos de moi',
    'footer.legal': 'Légal',
    'footer.mentions': 'Mentions légales',
    'footer.cgv': 'CGV',
    'footer.privacy': 'Confidentialité',
    'footer.docs': 'Tous les documents juridiques',
    'footer.vat': 'TVA',
    'footer.made': 'Fait avec soin, du café et un peu de magie',

    'modal.close': 'Fermer',
    'modal.features': 'Fonctionnalités',
    'modal.tech': 'Technologies',

    'card.reveal': 'cliquez pour retourner',
    'card.open': 'cliquez pour ouvrir',

    'egg.console': 'Psst. Il y a quelques secrets sur cette page. ↑↑↓↓←→←→BA, c\'est un bon début.',
    'egg.konami': 'Abracadabra ! Toutes les cartes sont révélées.',
    'egg.freeze': 'Cold snap ! Tout est gelé… dégel en cours.',
    'egg.wizard': 'Une carte de trop ? Le magicien vient de se glisser dans le paquet.',
    'egg.star': 'Vœu enregistré. ✦'
  };

  const EN_EXTRA = {
    'filter.all': 'All',
    'filter.Interactive Installations': 'Installations',
    'filter.Games': 'Games',
    'filter.Flutter Apps': 'Apps',
    'filter.Web Platforms': 'Web platforms',
    'filter.Open Source': 'Open source',
    'work.featured': 'Case study',
    'work.open': 'View project',
    'contact.subject': 'New project',
    'modal.close': 'Close',
    'modal.features': 'Features',
    'modal.tech': 'Technologies',
    'card.reveal': 'click to reveal',
    'card.open': 'click to open',
    'egg.console': 'Psst. There are a few secrets on this page. ↑↑↓↓←→←→BA is a good start.',
    'egg.konami': 'Abracadabra! Every card revealed.',
    'egg.freeze': 'Cold snap! Everything froze… thawing out.',
    'egg.wizard': 'One card too many? The wizard just slipped into the deck.',
    'egg.star': 'Wish recorded. ✦'
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
