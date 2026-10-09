/**
 * ColdSnap - Drive mode
 *
 * The secret wizard card turns into a little car. Drive it around the page,
 * shove the hero cards, and press E next to a link or button to use it.
 * Physics come from js/car-physics.js (window.CarPhysics).
 *
 * Car position lives in page coordinates (x = viewport x, y = page y); the
 * camera follows it with a dead zone, like a top-down game.
 */
(function () {
  const i18n = window.CS_I18N;
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const CAR_SIZE = 64;
  const INTERACT_RANGE = 70;
  const TARGETS = [
    '.cs-nav__brand', '.cs-nav__links a', '.filter',
    '.project-card', '.contact__card .btn', '.contact__about a',
    '.cs-footer a'
  ].join(',');

  let active = false;
  let launchCard = null;
  let carEl, bodyEl, hudEl, promptEl, exitBtn;
  let car, input, handlers;
  let targets = [];
  let near = null;
  let rafId = null;
  let lastTime = 0;
  let glide = null;
  let warping = false;
  let puffTick = 0;

  function ready() {
    return window.CarPhysics && window.coldsnapDeck;
  }

  // ── Scaffolding ─────────────────────────────────────────
  function buildUI() {
    carEl = document.createElement('div');
    carEl.className = 'drive-car';
    carEl.innerHTML = '<div class="drive-car__body"><img src="assets/car.png" alt="" draggable="false"></div>';
    bodyEl = carEl.firstChild;

    promptEl = document.createElement('div');
    promptEl.className = 'drive-prompt';
    promptEl.innerHTML = '<kbd>E</kbd><span></span>';

    hudEl = document.createElement('div');
    hudEl.className = 'drive-hud';
    hudEl.innerHTML =
      '<span class="drive-hud__keys"><kbd>↑</kbd><kbd>←</kbd><kbd>↓</kbd><kbd>→</kbd> <span>' + i18n.t('drive.drive') + '</span></span>' +
      '<span class="drive-hud__keys"><kbd>Space</kbd> <span>' + i18n.t('drive.drift') + '</span></span>' +
      '<span class="drive-hud__keys"><kbd>E</kbd> <span>' + i18n.t('drive.use') + '</span></span>';
    exitBtn = document.createElement('button');
    exitBtn.type = 'button';
    exitBtn.className = 'drive-hud__exit';
    exitBtn.innerHTML = '<kbd>Esc</kbd> ' + i18n.t('drive.exit');
    exitBtn.addEventListener('click', () => stop());
    hudEl.appendChild(exitBtn);

    document.body.append(carEl, promptEl, hudEl);
  }

  function collectTargets() {
    targets = [...document.querySelectorAll(TARGETS)].filter(el => !el.closest('.modal-overlay'));
  }

  // ── Start / stop ────────────────────────────────────────
  function start(card) {
    if (active || !ready()) return;
    active = true;
    launchCard = card;

    const rect = card.el.getBoundingClientRect();
    const sx = rect.left + rect.width / 2;
    const sy = rect.top + rect.height / 2;

    buildUI();
    collectTargets();

    car = window.CarPhysics.createCarState(sx, sy + window.scrollY, Math.PI / 2);
    input = window.CarPhysics.createInputState();
    handlers = window.CarPhysics.createInputHandlers(input, {
      onEscape: () => stop(),
      onInteract: interact
    });
    window.CarPhysics.attachInputHandlers(handlers);

    // The card flips away while the car pops in on the same spot.
    card.el.classList.add('is-driven-away');
    placeCar();
    carEl.classList.add('is-arriving');
    if (window.csSparkle) window.csSparkle(22, { x: sx, y: sy });

    document.body.classList.add('is-driving');
    requestAnimationFrame(() => hudEl.classList.add('is-visible'));
    window.addEventListener('wheel', blockScroll, { passive: false });
    window.addEventListener('touchmove', blockScroll, { passive: false });
    window.addEventListener('keydown', blockKeys, { passive: false });

    lastTime = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    if (!active) return;
    active = false;
    cancelAnimationFrame(rafId);
    rafId = null;
    window.CarPhysics.detachInputHandlers(handlers);
    window.removeEventListener('wheel', blockScroll);
    window.removeEventListener('touchmove', blockScroll);
    window.removeEventListener('keydown', blockKeys);
    document.body.classList.remove('is-driving', 'keyboard-mode');
    clearNear();

    hudEl.classList.remove('is-visible');
    carEl.classList.add('is-leaving');
    promptEl.classList.remove('is-visible');
    const card = launchCard;
    const rect = carEl.getBoundingClientRect();
    if (window.csSparkle) window.csSparkle(16, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });

    setTimeout(() => {
      [carEl, promptEl, hudEl].forEach(el => el.remove());
      if (card) card.el.classList.remove('is-driven-away');
      launchCard = null;
    }, 420);
  }

  function blockScroll(e) { e.preventDefault(); }
  function blockKeys(e) {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) e.preventDefault();
  }

  // ── Interaction ─────────────────────────────────────────
  function targetLabel(el) {
    const raw = el.getAttribute('aria-label') ||
      el.querySelector('.project-title, .stat__label, h3')?.textContent ||
      el.textContent;
    return raw.replace(/\s+/g, ' ').trim().slice(0, 28);
  }

  function nearestTarget(sx, sy) {
    let best = null;
    let bestDist = INTERACT_RANGE;
    for (const el of targets) {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) continue;
      const dx = Math.max(r.left - sx, 0, sx - r.right);
      const dy = Math.max(r.top - sy, 0, sy - r.bottom);
      const dist = Math.hypot(dx, dy);
      if (dist < bestDist) { bestDist = dist; best = el; }
    }
    return best;
  }

  function clearNear() {
    if (near) near.classList.remove('drive-near');
    near = null;
    promptEl.classList.remove('is-visible');
  }

  function interact() {
    if (!near) return;
    const el = near;
    el.classList.add('drive-pressed');
    setTimeout(() => el.classList.remove('drive-pressed'), 220);

    if (el.matches('.project-card')) {
      // Opening a project hands control back to the page.
      stop();
      setTimeout(() => el.click(), 450);
      return;
    }
    const href = el.getAttribute('href') || '';
    if (href.startsWith('#') && href.length > 1) {
      const section = document.querySelector(href);
      if (section) glideTo(section.getBoundingClientRect().top + window.scrollY + 140);
      return;
    }
    el.click();
  }

  function glideTo(pageY) {
    glide = { from: car.y, to: pageY, start: performance.now(), dur: 900 };
    car.velX = car.velY = car.speed = 0;
  }

  // ── Frame ───────────────────────────────────────────────
  function placeCar() {
    const sx = car.x;
    const sy = car.y - window.scrollY;
    carEl.style.left = (sx - CAR_SIZE / 2) + 'px';
    carEl.style.top = (sy - CAR_SIZE / 2) + 'px';
    return { sx, sy };
  }

  function frame(now) {
    if (!active) return;
    rafId = requestAnimationFrame(frame);
    const dt = Math.min(2, (now - lastTime) / 16.667);
    lastTime = now;
    const CP = window.CarPhysics;

    if (glide) {
      const t = Math.min(1, (now - glide.start) / glide.dur);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      car.y = glide.from + (glide.to - glide.from) * eased;
      if (t >= 1) glide = null;
    } else if (!warping) {
      let desired;
      if (!input.useKeyboardSteering) {
        desired = Math.atan2(input.mouseY - (car.y - window.scrollY), input.mouseX - car.x);
      }
      const result = CP.updatePhysics(car, input, dt, desired);
      car.x += car.velX * dt;
      car.y += car.velY * dt;
      puff(result, now);
    }

    const pageH = document.documentElement.scrollHeight;
    car.x = Math.max(CAR_SIZE / 2, Math.min(innerWidth - CAR_SIZE / 2, car.x));
    car.y = Math.max(0, Math.min(pageH, car.y));

    // Hitting the bottom of the page drops the car back in at the top.
    if (!warping && car.y > pageH - CAR_SIZE) warpToTop();

    // Camera: only follow once the car leaves the middle band of the screen.
    const top = innerHeight * 0.3;
    const bottom = innerHeight * 0.7;
    const screenY = car.y - window.scrollY;
    let targetScroll = window.scrollY;
    if (screenY < top) targetScroll = car.y - top;
    else if (screenY > bottom) targetScroll = car.y - bottom;
    const smooth = window.scrollY + (targetScroll - window.scrollY) * (glide ? 0.3 : 0.15);
    window.scrollTo({ top: Math.max(0, Math.min(pageH - innerHeight, smooth)), behavior: 'instant' });

    const { sx, sy } = placeCar();
    CP.applyCarTransform(bodyEl, CP.calculateCarTransform(car, 1, now));

    // The car shoves hero cards around.
    if (Math.abs(car.speed) > 1) window.coldsnapDeck.push(sx, sy, car.velX, car.velY);

    // Nearby link / button
    const hit = nearestTarget(sx, sy);
    if (hit !== near) {
      if (near) near.classList.remove('drive-near');
      near = hit;
      if (near) {
        near.classList.add('drive-near');
        promptEl.lastChild.textContent = targetLabel(near);
      }
    }
    promptEl.classList.toggle('is-visible', !!near);
    if (near) {
      promptEl.style.left = sx + 'px';
      promptEl.style.top = (sy - CAR_SIZE / 2 - 14) + 'px';
    }
  }

  function warpToTop() {
    warping = true;
    clearNear();
    carEl.classList.remove('is-arriving');
    carEl.classList.add('is-leaving');
    if (window.csSparkle) {
      const r = carEl.getBoundingClientRect();
      window.csSparkle(14, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
    }
    setTimeout(() => {
      if (!active) return;
      car.y = CAR_SIZE;
      car.velX = car.velY = car.speed = 0;
      window.scrollTo({ top: 0, behavior: 'instant' });
      carEl.classList.remove('is-leaving');
      void carEl.offsetWidth;
      carEl.classList.add('is-arriving');
      if (window.csSparkle) window.csSparkle(14, { x: car.x, y: car.y });
      warping = false;
    }, 420);
  }

  // Ice-blue puffs when the car slides.
  function puff(result, now) {
    if (reducedMotion()) return;
    const smoke = window.CarPhysics.createDriftSmoke(car, result, car.x, car.y);
    if (!smoke) return;
    smoke.forEach(s => {
      const el = document.createElement('span');
      el.className = 'drive-puff';
      el.style.cssText = `left:${s.x}px;top:${s.y}px;width:${s.size}px;height:${s.size}px`;
      document.body.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    });
  }

  window.CS_DRIVE = { start, stop, get active() { return active; } };
})();
