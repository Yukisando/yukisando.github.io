/**
 * ColdSnap - The arcade's coin slot
 *
 * A project with `coinSlot` in data/projects.js shows a coin and a slot in the viewer,
 * and in the popup its hero card opens.
 * Drag the coin into the slot, or click it or press Enter on it to let it fly there by itself.
 * The coin glides over, turns edge-on to the slit and drops in, then the screen shuts off like
 * an old TV and the arcade opens.
 *
 * The viewer and the popup re-render their markup, so everything hangs off listeners on the document.
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
  const pose = ({ x = 0, y = 0, rotate = 0, scale = 1 }) =>
    `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`;
  const dragPose = (dx, dy) => ({ x: dx, y: dy, rotate: dx / 5, scale: 1.1 });

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

  // The flight to the slot as keyframes along a curve: it lifts a little, then glides down onto the slit.
  function flightFrames(start, end) {
    const lift = { x: (start.x + end.x) / 2, y: Math.min(start.y, end.y) - 34 };
    const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const frames = [];
    for (let i = 0; i <= 20; i++) {
      const t = ease(i / 20);
      const u = 1 - t;
      frames.push({
        transform: pose({
          x: u * u * start.x + 2 * u * t * lift.x + t * t * end.x,
          y: u * u * start.y + 2 * u * t * lift.y + t * t * end.y,
          rotate: start.rotate * u,
          scale: start.scale + (end.scale - start.scale) * t + 0.1 * Math.sin(Math.PI * t)
        }),
        offset: i / 20
      });
    }
    return frames;
  }

  function enterArcade(slot) {
    location.href = `${slot.dataset.href}?lang=${i18n.lang}`;
  }

  async function insertCoin(coin, start) {
    const slot = coin.closest('.coin-slot');
    const plate = slot.querySelector('.coin-slot__plate');
    const hole = slot.querySelector('.coin-slot__hole');
    const body = coin.querySelector('.coin__body');
    const startAngle = currentAngle(body);
    inserting = true;
    slot.classList.add('is-inserting');
    document.dispatchEvent(new CustomEvent('coldsnap:coin-inserted', { detail: { slot } }));

    if (reducedMotion()) {
      coin.setAttribute('disabled', '');
      enterArcade(slot);
      return;
    }

    // From here on the coin is only ever moved by its own animations, starting exactly where it is.
    const to = offsetToSlot(coin, hole, start.x, start.y);
    coin.style.transform = pose(start);
    coin.setAttribute('disabled', '');
    coin.classList.remove('is-dragging');
    plate.classList.add('is-ready');

    // Glide over and finish edge-on: seen from the side, the coin lines up with the slit.
    const end = { x: to.x, y: to.y, scale: 0.78 };
    const edgeOn = Math.ceil((startAngle + 120 - 90) / 180) * 180 + 90;
    play(body, [{ transform: spin(startAngle) }, { transform: spin(edgeOn) }],
      { duration: 640, easing: 'cubic-bezier(0.45, 0, 0.25, 1)' });
    await play(coin, flightFrames(start, end), { duration: 640 });
    await wait(90);

    // In it goes, away from the player and into the dark.
    await play(coin, [
      { transform: pose(end), opacity: 1, filter: 'brightness(1)' },
      { transform: pose({ ...end, scale: 0.45 }), opacity: 0, filter: 'brightness(0.3)' }
    ], { duration: 190, easing: 'ease-in' });

    coinSound();
    plate.classList.remove('is-ready');
    plate.classList.add('is-credit');
    plate.animate([
      { transform: 'translateY(0)' },
      { transform: 'translateY(3px)', offset: 0.3 },
      { transform: 'translateY(0)' }
    ], { duration: 280, easing: 'ease-out' });
    slot.querySelector('.coin-slot__led').textContent = i18n.t('coin.credit');
    if (window.csSparkle) window.csSparkle(18, centre(hole));
    await wait(600);

    const shutter = document.createElement('div');
    shutter.className = 'crt-shutter';
    document.body.appendChild(shutter);
    await wait(420);
    enterArcade(slot);
  }

  // Missed the slot: it springs back to its resting place, overshooting a little.
  function returnCoin(coin, dx, dy) {
    coin.classList.remove('is-dragging');
    if (reducedMotion()) {
      coin.style.transform = '';
      return;
    }
    // is-returning keeps the idle bob off until the coin is home, so it can't jump there first.
    coin.classList.add('is-returning');
    const from = dragPose(dx, dy);
    const back = coin.animate([
      { transform: pose(from) },
      { transform: pose({ x: -dx * 0.06, y: -dy * 0.06, rotate: -from.rotate * 0.25, scale: 0.97 }), offset: 0.62 },
      { transform: pose({}) }
    ], { duration: 560, easing: 'cubic-bezier(0.3, 0.55, 0.35, 1)', fill: 'forwards' });
    const settle = () => {
      coin.style.transform = '';
      coin.classList.remove('is-returning');
      back.cancel();
    };
    back.finished.then(settle, () => {});
  }

  // Coming back with the browser's Back button can restore the page exactly as it was left.
  window.addEventListener('pageshow', e => {
    if (!e.persisted) return;
    inserting = false;
    document.querySelectorAll('.crt-shutter').forEach(el => el.remove());
    if (typeof renderViewer === 'function') renderViewer();
    // The hero card popup may still be open with the coin already swallowed: put a fresh one back.
    const modalSlot = document.querySelector('#modalFooter .coin-slot');
    if (modalSlot && typeof coinSlotHTML === 'function') {
      modalSlot.outerHTML = coinSlotHTML({ coinSlot: modalSlot.dataset.href });
    }
  });

  document.addEventListener('pointerdown', e => {
    const coin = e.target.closest('.coin');
    if (!coin || inserting || e.button !== 0 || coin.classList.contains('is-returning')) return;
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
      coin.style.transform = pose(dragPose(dx, dy));
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
      const inSlot = distanceToSlot() < DROP_DISTANCE;
      plate.classList.remove('is-ready');
      if (inSlot) insertCoin(coin, dragPose(dx, dy));
      else returnCoin(coin, dx, dy);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  });

  // A click or the keyboard: the coin goes in by itself.
  document.addEventListener('click', e => {
    const coin = e.target.closest('.coin');
    if (coin && !inserting && !coin.dataset.justDragged) insertCoin(coin, { x: 0, y: 0, rotate: 0, scale: 1 });

    // Arcade links in the nav and footer open the project here, without a page reload.
    const link = e.target.closest('[data-arcade-link]');
    if (!link) return;
    e.preventDefault();
    if (activeFilter !== 'all') setFilter('all');
    showProject('coldsnap-arcade', { animate: true, scroll: true });
  });
})();
