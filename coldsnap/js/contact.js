/**
 * ColdSnap - contact form.
 * Sends to POST /api/contact (tools/coldsnap-worker), which mails it through Brevo.
 * Without JavaScript the form still posts and the worker redirects back with ?contact=<status>.
 */
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const i18n = window.CS_I18N;
  const status = document.getElementById('contactStatus');
  const call = document.getElementById('contactCall');
  const callFields = document.getElementById('contactCallFields');
  const slotsBox = document.getElementById('contactSlots');
  const MAX_SLOTS = 3;

  // The worker writes a signed "served at" time here; without it, the time the page loaded.
  if (!form.elements.started.value) form.elements.started.value = String(Date.now());

  // "Start a project" opens the form: after the jump to #contact the cursor waits in the first field.
  const openForm = () => form.elements.name.focus({ preventScroll: true });
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href$="#contact"]');
    if (link && new URL(link.href).pathname === location.pathname) setTimeout(openForm, 0);
  });
  if (location.hash === '#contact') openForm();

  // "Need a hand?" project picker: its script only loads on the first click (no cost at page load).
  const launcher = document.getElementById('helperLaunch');
  if (launcher) launcher.addEventListener('click', () => {
    if (window.CS_HELPER) return window.CS_HELPER.toggle();
    if (launcher.getAttribute('aria-busy')) return;
    launcher.setAttribute('aria-busy', 'true');
    const script = document.createElement('script');
    script.src = '/js/request-helper.js?v=20261110b';
    script.onload = () => { launcher.removeAttribute('aria-busy'); window.CS_HELPER.toggle(); };
    script.onerror = () => { launcher.removeAttribute('aria-busy'); location.hash = 'contact'; openForm(); };
    document.head.appendChild(script);
  });

  function show(key) {
    status.textContent = i18n.t('form.' + key);
    status.dataset.state = key === 'expired' ? 'invalid' : key;
  }

  // Phone call: the phone number and a few half-days over the next working week.
  function buildSlots() {
    const locale = i18n.lang === 'fr' ? 'fr-FR' : 'en-GB';
    const day = new Date();
    const chips = [];
    while (chips.length < 8) {
      day.setDate(day.getDate() + 1);
      if (day.getDay() === 0 || day.getDay() === 6) continue;
      const label = day.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
      ['morning', 'afternoon'].forEach(part => {
        chips.push(`<button type="button" class="cform__chip" aria-pressed="false">${label} · ${i18n.t('form.' + part)}</button>`);
      });
    }
    slotsBox.innerHTML = chips.join('');
  }

  function syncSlots() {
    const picked = [...slotsBox.querySelectorAll('[aria-pressed="true"]')];
    form.elements.slots.value = picked.map(b => b.textContent).join(', ');
    slotsBox.querySelectorAll('[aria-pressed="false"]').forEach(b => { b.disabled = picked.length >= MAX_SLOTS; });
  }

  // "Get back to me by": Phone shows the number field and the call slots.
  function syncCall() {
    callFields.hidden = !call.checked;
    form.elements.phone.required = call.checked;
    if (call.checked && !slotsBox.children.length) buildSlots();
    if (!call.checked) {
      slotsBox.querySelectorAll('[aria-pressed="true"]').forEach(b => b.setAttribute('aria-pressed', 'false'));
      syncSlots();
    }
  }
  form.querySelectorAll('input[name="reply"]').forEach(radio => radio.addEventListener('change', syncCall));

  slotsBox.addEventListener('click', event => {
    const chip = event.target.closest('.cform__chip');
    if (!chip) return;
    chip.setAttribute('aria-pressed', String(chip.getAttribute('aria-pressed') !== 'true'));
    syncSlots();
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const button = form.querySelector('[type="submit"]');
    const data = Object.fromEntries(new FormData(form));
    button.disabled = true;
    show('sending');
    let result = 'unavailable';
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      result = (await response.json()).status || result;
    } catch (e) { /* network error: keep "unavailable" */ }
    button.disabled = false;
    show(result);
    if (result === 'sent') form.classList.add('is-sent');
  });

  // Coming back from a plain (no-JavaScript) post.
  const returned = new URLSearchParams(location.search).get('contact');
  if (['sent', 'invalid', 'expired', 'unavailable'].includes(returned)) {
    show(returned);
    if (returned === 'sent') form.classList.add('is-sent');
  }
})();
