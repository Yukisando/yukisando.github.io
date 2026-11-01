/**
 * ColdSnap - The arcade's coin slot
 *
 * A project with `coinSlot` in data/projects.js shows a coin and a slot in the viewer.
 * Drag the coin into the slot, or click it or press Enter on it to let it fly there by itself.
 * The coin drops in, David runs past with the horde behind him, the screen shuts off like an
 * old TV, and the arcade opens.
 *
 * The viewer re-renders its markup, so everything hangs off listeners on the document.
 */
(function () {
  const i18n = window.CS_I18N;
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DROP_DISTANCE = 64;  // px between coin and slot centres that counts as "in the slot"
  const DRAG_THRESHOLD = 6;  // px of movement that turns a press into a drag
  const EASE_OUT = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
  let inserting = false;

  // Animations stall in a tab that isn't painting; the sequence must still finish.
  const play = (el, frames, options) => {
    const animation = el.animate(frames, { fill: 'forwards', ...options });
    return Promise.race([
      animation.finished.catch(() => {}),
      new Promise(done => setTimeout(done, options.duration + 150))
    ]);
  };
  const wait = ms => new Promise(done => setTimeout(done, ms));

  const spin = degrees => `perspective(260px) rotateY(${degrees}deg)`;

  // Where the spinning coin is right now, in degrees from face-on (-180 to 180).
  function currentAngle(body) {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(body).transform);
    return Math.atan2(-matrix.m13, matrix.m11) * 180 / Math.PI;
  }

  const centre = el => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };

  // The coin's resting position stays the origin of all its moves: this is the way to the slot from there.
  function offsetToSlot(coin, hole, dx, dy) {
    const from = centre(coin);
    const to = centre(hole);
    return { x: to.x - from.x + dx, y: to.y - from.y + dy };
  }

  function coinSound() {
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      [[988, 0, 0.09], [1319, 0.09, 0.4]].forEach(([frequency, start, length]) => {
        const tone = context.createOscillator();
        const gain = context.createGain();
        tone.type = 'square';
        tone.frequency.value = frequency;
        gain.gain.setValueAtTime(0.035, context.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + start + length);
        tone.connect(gain).connect(context.destination);
        tone.start(context.currentTime + start);
        tone.stop(context.currentTime + start + length);
      });
    } catch (e) { /* no sound is fine */ }
  }

  // [sprite, seconds before it enters, seconds to cross the screen]
  const HORDE = [
    ['david', 0, 1.1],
    ['zombie_fast', 0.2, 1.2],
    ['zombie_fast', 0.36, 1.15],
    ['zombie_big', 0.5, 1.4],
    ['zombie_fast', 0.7, 1.2]
  ];

  function releaseHorde() {
    HORDE.forEach(([sprite, delay, duration]) => {
      const runner = document.createElement('span');
      runner.className = 'horde-runner';
      runner.style.backgroundImage = `url(assets/arcade/${sprite}.png)`;
      runner.style.animationDelay = `0s, ${delay}s`;
      runner.style.animationDuration = `0.24s, ${duration}s`;
      runner.addEventListener('animationend', e => { if (e.animationName === 'horde-run') runner.remove(); });
      document.body.appendChild(runner);
    });
  }

  function enterArcade(slot) {
    location.href = `${slot.dataset.href}?lang=${i18n.lang}`;
  }

  async function insertCoin(coin, dx, dy) {
    const slot = coin.closest('.coin-slot');
    const plate = slot.querySelector('.coin-slot__plate');
    const hole = slot.querySelector('.coin-slot__hole');
    const body = coin.querySelector('.coin__body');
    const startAngle = currentAngle(body);
    inserting = true;
    slot.classList.add('is-inserting');
    coin.setAttribute('disabled', '');

    if (reducedMotion()) {
      enterArcade(slot);
      return;
    }

    const to = offsetToSlot(coin, hole, dx, dy);
    const at = (x, y, scale) => `translate(${x}px, ${y}px) scale(${scale})`;
    // Fly to the slot and finish edge-on: seen from the side, the coin lines up with the slit.
    play(body, [
      { transform: spin(startAngle) },
      { transform: spin(810) }
    ], { duration: 460, easing: 'ease-out' });
    await play(coin, [
      { transform: at(dx, dy, 1.1) },
      { transform: at((dx + to.x) / 2, Math.min(dy, to.y) - 26, 1.1), offset: 0.55 },
      { transform: at(to.x, to.y, 0.9) }
    ], { duration: 460, easing: 'ease-in-out' });
    coinSound();
    await play(coin, [
      { transform: at(to.x, to.y, 0.9), opacity: 1 },
      { transform: at(to.x, to.y, 0.6), opacity: 0 }
    ], { duration: 130, easing: 'ease-in' });

    plate.classList.add('is-credit');
    slot.querySelector('.coin-slot__led').textContent = i18n.t('coin.credit');
    if (window.csSparkle) window.csSparkle(18, centre(hole));
    releaseHorde();
    await wait(1150);

    const shutter = document.createElement('div');
    shutter.className = 'crt-shutter';
    document.body.appendChild(shutter);
    await wait(420);
    enterArcade(slot);
  }

  // Coming back with the browser's Back button can restore the page exactly as it was left.
  window.addEventListener('pageshow', e => {
    if (!e.persisted) return;
    inserting = false;
    document.querySelectorAll('.crt-shutter, .horde-runner').forEach(el => el.remove());
    if (typeof renderViewer === 'function') renderViewer();
  });

  document.addEventListener('pointerdown', e => {
    const coin = e.target.closest('.coin');
    if (!coin || inserting || e.button !== 0) return;
    const slot = coin.closest('.coin-slot');
    const plate = slot.querySelector('.coin-slot__plate');
    const hole = slot.querySelector('.coin-slot__hole');
    const body = coin.querySelector('.coin__body');
    const startX = e.clientX;
    const startY = e.clientY;
    let dx = 0;
    let dy = 0;
    let dragging = false;

    // Grabbed: the spin stops and the coin turns to face the player.
    const angle = currentAngle(body);
    coin.classList.add('is-held');
    if (!reducedMotion()) {
      body.animate([{ transform: spin(angle) }, { transform: spin(0) }], { duration: 240, easing: EASE_OUT });
    }

    const distanceToSlot = () => {
      const a = centre(coin);
      const b = centre(hole);
      return Math.hypot(a.x - b.x, a.y - b.y);
    };

    const onMove = move => {
      dx = move.clientX - startX;
      dy = move.clientY - startY;
      if (!dragging && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      if (!dragging) {
        dragging = true;
        coin.setPointerCapture(e.pointerId);
        coin.classList.add('is-dragging');
      }
      coin.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx / 5}deg) scale(1.1)`;
      plate.classList.toggle('is-ready', distanceToSlot() < DROP_DISTANCE);
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      coin.classList.remove('is-held');
      if (!dragging) return;  // a plain press: the click handler below takes it
      coin.dataset.justDragged = '1';
      setTimeout(() => { delete coin.dataset.justDragged; }, 0);
      // Measure first: without is-dragging the idle animation takes the coin back to its resting place.
      const inSlot = distanceToSlot() < DROP_DISTANCE;
      coin.classList.remove('is-dragging');
      plate.classList.remove('is-ready');
      if (inSlot) {
        insertCoin(coin, dx, dy);
        return;
      }
      // Missed: it springs back to where it was.
      coin.style.transform = '';
      if (!reducedMotion()) {
        coin.animate([
          { transform: `translate(${dx}px, ${dy}px) rotate(${dx / 5}deg) scale(1.1)` },
          { transform: 'translate(0, 0) rotate(0deg) scale(1)' }
        ], { duration: 420, easing: 'cubic-bezier(0.3, 1.6, 0.5, 1)' });
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  });

  // A click or the keyboard: the coin goes in by itself.
  document.addEventListener('click', e => {
    const coin = e.target.closest('.coin');
    if (coin && !inserting && !coin.dataset.justDragged) insertCoin(coin, 0, 0);

    // Arcade links in the nav and footer open the project here, without a page reload.
    const link = e.target.closest('[data-arcade-link]');
    if (!link) return;
    e.preventDefault();
    if (activeFilter !== 'all') setFilter('all');
    showProject('coldsnap-arcade', { animate: true, scroll: true });
  });
})();
