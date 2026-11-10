/**
 * ColdSnap - project picker ("Need a hand?").
 * Loaded only when the visitor clicks the launcher (js/contact.js), so it costs nothing at page load.
 * A few clickable questions, then matching projects (the `fit` tags in data/projects.js),
 * the contact form filled with the answers, and the email / phone.
 * No AI and no network call: everything runs in the page; sending still goes through the form.
 */
(function () {
  const lang = (window.CS_I18N && window.CS_I18N.lang) === 'en' ? 'en' : 'fr';
  const launcher = document.getElementById('helperLaunch');
  const form = document.getElementById('contactForm');
  const EMAIL = 'contact@coldsnap.fr';
  const PHONE = '+33627648028';
  const PHONE_LABEL = '+33 6 27 64 80 28';

  const TEXT = {
    fr: {
      title: 'Votre projet',
      close: 'Fermer',
      hello: 'Bonjour ! Quatre questions rapides et nous vous montrons des projets proches du vôtre.',
      skip: 'Passer',
      next: 'Continuer',
      notePlaceholder: 'Quelques mots sur votre idée (facultatif)',
      matches: 'Voici des réalisations proches de votre idée :',
      noMatch: 'Voici quelques-unes de nos réalisations :',
      then: 'Pour la suite, au choix :',
      fill: 'Remplir le formulaire avec mes réponses',
      mail: 'E-mail',
      restart: 'Recommencer',
      see: 'Voir le projet',
      subject: 'Nouveau projet',
    },
    en: {
      title: 'Your project',
      close: 'Close',
      hello: 'Hello! Four quick questions and we will show you projects close to yours.',
      skip: 'Skip',
      next: 'Continue',
      notePlaceholder: 'A few words about your idea (optional)',
      matches: 'Here is some of our work close to your idea:',
      noMatch: 'Here is some of our work:',
      then: 'What next? Your choice:',
      fill: 'Fill in the form with my answers',
      mail: 'Email',
      restart: 'Start again',
      see: 'See the project',
      subject: 'New project',
    },
  }[lang];

  // `form` = the value of the matching "You are" radio in the contact form.
  const STEPS = [
    {
      key: 'who',
      q: { fr: 'Vous êtes…', en: 'You are…' },
      label: { fr: 'Vous êtes', en: 'You are' },
      options: [
        { v: 'museum', form: 'Musée / lieu culturel', fr: 'Un musée ou un lieu culturel', en: 'A museum or cultural venue' },
        { v: 'school', form: 'École / formation', fr: 'Une école ou un centre de formation', en: 'A school or training centre' },
        { v: 'public', form: 'Collectivité', fr: 'Une collectivité', en: 'A local authority' },
        { v: 'company', form: 'Entreprise', fr: 'Une entreprise', en: 'A company' },
        { v: 'other', form: 'Autre', fr: 'Autre chose', en: 'Something else' },
      ],
    },
    {
      key: 'what',
      q: { fr: 'Qu’aimeriez-vous créer ?', en: 'What would you like to make?' },
      label: { fr: 'Projet', en: 'Project' },
      options: [
        { v: 'kiosk', fr: 'Une installation ou une borne interactive', en: 'An interactive installation or kiosk' },
        { v: 'game', fr: 'Un jeu (éducatif ou non)', en: 'A game (educational or not)' },
        { v: 'app', fr: 'Une application mobile', en: 'A mobile app' },
        { v: 'web', fr: 'Une plateforme web', en: 'A web platform' },
        { v: 'unsure', fr: 'Je ne sais pas encore', en: 'Not sure yet' },
      ],
    },
    {
      key: 'when',
      q: { fr: 'Pour quand ?', en: 'By when?' },
      label: { fr: 'Pour quand', en: 'By when' },
      options: [
        { v: 'soon', fr: 'Dans moins de 3 mois', en: 'Within 3 months' },
        { v: 'mid', fr: 'Dans 3 à 6 mois', en: 'In 3 to 6 months' },
        { v: 'later', fr: 'Plus tard, c’est souple', en: 'Later, it is flexible' },
        { v: 'unknown', fr: 'Je ne sais pas', en: 'I don’t know' },
      ],
    },
    {
      key: 'budget',
      q: { fr: 'Avez-vous une idée du budget ?', en: 'Do you have a budget in mind?' },
      label: { fr: 'Budget', en: 'Budget' },
      options: [
        { v: 'small', fr: 'Moins de 10 000 €', en: 'Under €10,000' },
        { v: 'medium', fr: 'De 10 000 à 30 000 €', en: '€10,000 to €30,000' },
        { v: 'large', fr: 'Plus de 30 000 €', en: 'Over €30,000' },
        { v: 'unknown', fr: 'Pas encore', en: 'Not yet' },
      ],
    },
    {
      key: 'note',
      q: { fr: 'Un mot sur votre idée ?', en: 'A word about your idea?' },
      free: true,
    },
  ];

  let panel, log, controls, answers, stepIndex, timer;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function build() {
    panel = el('section', 'helper');
    panel.id = 'helper';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-labelledby', 'helperTitle');
    panel.hidden = true;

    const head = el('header', 'helper__head');
    const title = el('h2', 'helper__title', TEXT.title);
    title.id = 'helperTitle';
    const close = el('button', 'helper__close');
    close.type = 'button';
    close.setAttribute('aria-label', TEXT.close);
    close.innerHTML = '<svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#times"/></svg>';
    close.addEventListener('click', hide);
    head.append(title, close);

    log = el('div', 'helper__log');
    log.setAttribute('aria-live', 'polite');
    controls = el('div', 'helper__controls');
    panel.append(head, log, controls);
    panel.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
    document.body.appendChild(panel);
  }

  function scrollDown() { log.scrollTop = log.scrollHeight; }

  function say(node, who) {
    const bubble = el('div', 'helper__msg helper__msg--' + who);
    if (typeof node === 'string') bubble.textContent = node; else bubble.appendChild(node);
    log.appendChild(bubble);
    scrollDown();
    return bubble;
  }

  // Bot lines come in after a short pause, like someone typing.
  function botSay(text, then) {
    clearTimeout(timer);
    controls.replaceChildren();
    const dots = say(el('span', 'helper__typing', '•••'), 'bot');
    timer = setTimeout(() => {
      dots.remove();
      if (text) say(text, 'bot');
      if (then) then();
    }, reduceMotion ? 0 : 450);
  }

  function ask() {
    const step = STEPS[stepIndex];
    if (!step) return finish();
    botSay(step.q[lang], () => (step.free ? askFree(step) : askChoice(step)));
  }

  function askChoice(step) {
    const list = el('div', 'helper__options');
    step.options.forEach(option => {
      const button = el('button', 'cform__chip helper__option', option[lang]);
      button.type = 'button';
      button.addEventListener('click', () => {
        answers[step.key] = option;
        say(option[lang], 'me');
        stepIndex++;
        ask();
      });
      list.appendChild(button);
    });
    controls.replaceChildren(list);
    list.firstChild.focus({ preventScroll: true });
  }

  function askFree(step) {
    const box = el('form', 'helper__free');
    const input = el('textarea', 'helper__input');
    input.rows = 2;
    input.maxLength = 1000;
    input.placeholder = TEXT.notePlaceholder;
    input.setAttribute('aria-label', step.q[lang]);
    const row = el('div', 'helper__row');
    const skip = el('button', 'helper__link', TEXT.skip);
    skip.type = 'button';
    const next = el('button', 'btn btn--primary helper__next', TEXT.next);
    next.type = 'submit';
    row.append(skip, next);
    box.append(input, row);

    const done = () => {
      const note = input.value.trim();
      answers.note = note;
      if (note) say(note, 'me');
      stepIndex++;
      ask();
    };
    skip.addEventListener('click', () => { input.value = ''; done(); });
    box.addEventListener('submit', e => { e.preventDefault(); done(); });
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); done(); }
    });
    controls.replaceChildren(box);
    input.focus({ preventScroll: true });
  }

  // Projects whose `fit` tags match the answers: what counts double, who once.
  function matches() {
    const all = typeof COLDSNAP_PROJECTS !== 'undefined' ? COLDSNAP_PROJECTS : [];
    const what = answers.what && answers.what.v;
    const who = answers.who && answers.who.v;
    const scored = all
      .filter(p => p.fit)
      .map((p, i) => ({ p, i, score: (p.fit.includes(what) ? 2 : 0) + (p.fit.includes(who) ? 1 : 0) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score || a.i - b.i)
      .map(x => x.p);
    return { found: scored.length > 0, list: (scored.length ? scored : all.filter(p => p.fit)).slice(0, 3) };
  }

  function field(p, key) { return (lang === 'fr' && p.fr && p.fr[key]) || p[key] || ''; }

  function projectCard(p) {
    const link = el('a', 'helper__project');
    link.href = (lang === 'fr' ? '/projets/' : '/en/projects/') + encodeURIComponent(p.id) + '/';
    const thumb = field(p, 'thumbnail');
    if (thumb) {
      const img = el('img');
      img.src = thumb;
      img.alt = '';
      img.loading = 'lazy';
      img.width = 96;
      img.height = 64;
      link.appendChild(img);
    }
    const text = el('span', 'helper__projectText');
    text.append(el('strong', '', field(p, 'title')), el('span', '', field(p, 'shortDescription')));
    link.appendChild(text);
    return link;
  }

  function summary() {
    const sep = lang === 'fr' ? ' : ' : ': ';
    const lines = STEPS.filter(s => !s.free && answers[s.key])
      .map(s => s.label[lang] + sep + answers[s.key][lang]);
    return lines.join('\n') + (answers.note ? '\n\n' + answers.note : '');
  }

  function finish() {
    const { found, list } = matches();
    botSay(found ? TEXT.matches : TEXT.noMatch, () => {
      const cards = el('div', 'helper__projects');
      list.forEach(p => cards.appendChild(projectCard(p)));
      const bubble = say(cards, 'bot');
      botSay(TEXT.then, () => {
        showActions();
        log.scrollTop = bubble.offsetTop - log.offsetTop - 60;
      });
    });
  }

  function iconLink(iconName, label, href) {
    const link = el('a', 'btn btn--ghost');
    link.href = href;
    link.innerHTML = '<svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#' + iconName + '"/></svg>';
    link.appendChild(el('span', '', label));
    return link;
  }

  function showActions() {
    const box = el('div', 'helper__actions');
    if (form) {
      const fill = el('button', 'btn btn--primary helper__fill', TEXT.fill);
      fill.type = 'button';
      fill.addEventListener('click', fillForm);
      box.appendChild(fill);
    }
    const direct = el('div', 'helper__row');
    const mail = iconLink('envelope', TEXT.mail, 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(TEXT.subject) + '&body=' + encodeURIComponent(summary()));
    const tel = iconLink('mobile', PHONE_LABEL, 'tel:' + PHONE);
    direct.append(mail, tel);
    const restart = el('button', 'helper__link', TEXT.restart);
    restart.type = 'button';
    restart.addEventListener('click', start);
    box.append(direct, restart);
    controls.replaceChildren(box);
    if (box.firstChild.focus) box.firstChild.focus({ preventScroll: true });
  }

  function fillForm() {
    const who = answers.who && answers.who.form;
    if (who) {
      const radio = [...form.elements.audience].find(r => r.value === who);
      if (radio) radio.checked = true;
    }
    const message = form.elements.message;
    const text = summary();
    if (text) message.value = message.value.trim() ? message.value.trim() + '\n\n' + text : text;
    hide();
    document.getElementById('contact').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    form.elements.name.focus({ preventScroll: true });
  }

  function start() {
    answers = {};
    stepIndex = 0;
    log.replaceChildren();
    botSay(TEXT.hello, ask);
  }

  function show() {
    if (!panel) { build(); start(); }
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    const target = controls.querySelector('button, textarea, a');
    if (target) target.focus({ preventScroll: true });
    else panel.querySelector('.helper__close').focus({ preventScroll: true });
    scrollDown();
  }

  function hide() {
    panel.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus({ preventScroll: true });
  }

  window.CS_HELPER = { toggle() { if (panel && !panel.hidden) hide(); else show(); } };
})();
