/**
 * ColdSnap - Frost engine
 *
 * Real frost, drawn on one fixed canvas (#frost-page) instead of a CSS gradient:
 *  - a mottled frost texture, built once per viewport size, cut into a handful of
 *    soft round sprites. Frost "creeps" in as cheap drawImage stamps of those
 *    sprites along a front that walks inward from the edges;
 *  - dendrites: branching ice crystals generated as time-stamped segments and
 *    stroked progressively, so they visibly grow;
 *  - incremental drawing: nothing is ever redrawn, each frame only adds the new
 *    stamps and segments. The loop stops as soon as there is nothing to draw and
 *    while the tab is hidden.
 *
 * Nothing is allocated until the first chill/snap, so a visitor who never finds
 * the egg pays for one empty canvas.
 *
 * Public API: window.CS_FROST = { snap(), chill(level), frozen }
 *  - chill(level): logo-click build-up, 0..1 of the edge depth.
 *  - snap(): the full cold snap. Grows crystals across the viewport, holds, then
 *    thaws from the centre. Resolves when the thaw is done.
 */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  const TAU = Math.PI * 2;

  function rand(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  // ─────────────────────────────────────────────────────── layer
  function FrostLayer(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.w = 0; this.h = 0;
    this.texture = null;
    this.sprites = null;
    this.dendrites = [];
  }

  // Sizes the canvas to the viewport. Returns true when the size changed.
  // The texture is rebuilt lazily by ensureTexture() on the next draw.
  FrostLayer.prototype.resize = function () {
    const w = Math.max(1, Math.round(window.innerWidth));
    const h = Math.max(1, Math.round(window.innerHeight));
    if (w === this.w && h === this.h) return false;
    this.w = w; this.h = h;
    this.canvas.width = Math.round(w * DPR);
    this.canvas.height = Math.round(h * DPR);
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    this.texture = null;
    this.sprites = null;
    this.dendrites = [];
    return true;
  };

  FrostLayer.prototype.ensureTexture = function () {
    if (!this.texture) this.buildTexture();
  };

  // Mottled frost: a soft base, hundreds of lighter/clearer blobs, heavier edges.
  FrostLayer.prototype.buildTexture = function () {
    const w = this.w, h = this.h;
    const tex = document.createElement('canvas');
    tex.width = Math.round(w * DPR);
    tex.height = Math.round(h * DPR);
    const c = tex.getContext('2d');
    c.setTransform(DPR, 0, 0, DPR, 0, 0);

    c.fillStyle = 'rgba(226, 242, 252, 0.92)';
    c.fillRect(0, 0, w, h);

    // fine grain: many small soft blobs, half lighter, half clearer
    const blobs = Math.round((w * h) / 700);
    for (let i = 0; i < blobs; i++) {
      const x = Math.random() * w, y = Math.random() * h;
      const r = rand(4, 30);
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      if (i % 2) {
        c.globalCompositeOperation = 'source-over';
        g.addColorStop(0, 'rgba(255,255,255,0.16)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
      } else {
        c.globalCompositeOperation = 'destination-out';
        g.addColorStop(0, 'rgba(0,0,0,0.2)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
      }
      c.fillStyle = g;
      c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    }
    // a few larger, very soft clear patches, like thinner ice
    c.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < Math.round((w * h) / 110000); i++) {
      const x = Math.random() * w, y = Math.random() * h, r = rand(90, 220);
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(0,0,0,0.13)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g;
      c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    }
    c.globalCompositeOperation = 'source-over';
    // crystalline grain: tiny hexagonal strokes
    c.lineCap = 'round';
    c.lineWidth = 1;
    const grains = Math.round((w * h) / 1400);
    for (let i = 0; i < grains; i++) {
      const x = Math.random() * w, y = Math.random() * h;
      const a = (Math.floor(Math.random() * 3) * Math.PI) / 3 + rand(-0.08, 0.08);
      const l = rand(2, 8);
      c.strokeStyle = 'rgba(255,255,255,' + rand(0.08, 0.22) + ')';
      c.beginPath();
      c.moveTo(x - Math.cos(a) * l, y - Math.sin(a) * l);
      c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
      c.stroke();
    }

    // a cool tint in the hollows
    c.fillStyle = 'rgba(107, 191, 208, 0.08)';
    c.fillRect(0, 0, w, h);

    // thicker at the edges
    const d = Math.min(w, h) * 0.28;
    const edge = (x0, y0, x1, y1) => {
      const g = c.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, 'rgba(255,255,255,0.46)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
    };
    edge(0, 0, d, 0); edge(w, 0, w - d, 0); edge(0, 0, 0, d); edge(0, h, 0, h - d);

    this.texture = tex;
    this.buildSprites();
  };

  // Soft round "stamps" cut from the texture. Drawing a small bitmap per blob is
  // far cheaper than clipping a full-size pattern fill hundreds of times a second.
  FrostLayer.prototype.buildSprites = function () {
    const SIZE = 192;
    const sprites = [];
    for (let i = 0; i < 8; i++) {
      const sp = document.createElement('canvas');
      sp.width = SIZE; sp.height = SIZE;
      const c = sp.getContext('2d');
      const sx = Math.random() * Math.max(1, this.texture.width - SIZE);
      const sy = Math.random() * Math.max(1, this.texture.height - SIZE);
      c.drawImage(this.texture, sx, sy, SIZE, SIZE, 0, 0, SIZE, SIZE);
      c.globalCompositeOperation = 'destination-in';
      const g = c.createRadialGradient(SIZE / 2, SIZE / 2, 0, SIZE / 2, SIZE / 2, SIZE / 2);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(0.45, 'rgba(0,0,0,0.85)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g;
      c.fillRect(0, 0, SIZE, SIZE);
      sprites.push(sp);
    }
    this.sprites = sprites;
  };

  FrostLayer.prototype.clear = function () {
    this.ctx.clearRect(0, 0, this.w, this.h);
    this.dendrites = [];
  };

  FrostLayer.prototype.fillAll = function (alpha) {
    this.ensureTexture();
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = alpha === undefined ? 1 : alpha;
    ctx.drawImage(this.texture, 0, 0, this.w, this.h);
    ctx.restore();
  };

  // A soft, textured blob of frost (one small drawImage).
  FrostLayer.prototype.blob = function (x, y, r, alpha) {
    this.ensureTexture();
    const ctx = this.ctx;
    const sp = this.sprites[(Math.random() * this.sprites.length) | 0];
    ctx.globalAlpha = alpha;
    ctx.drawImage(sp, x - r, y - r, r * 2, r * 2);
    ctx.globalAlpha = 1;
  };

  // Frost creeping in from the edges: blobs along a front at `depth` px from the border.
  FrostLayer.prototype.creep = function (depth, count, alpha) {
    const w = this.w, h = this.h;
    for (let i = 0; i < count; i++) {
      const side = Math.floor(Math.random() * 4);
      const t = Math.random();
      const dd = depth * rand(0.55, 1.05);
      let x, y;
      if (side === 0) { x = t * w; y = dd; }
      else if (side === 1) { x = t * w; y = h - dd; }
      else if (side === 2) { x = dd; y = t * h; }
      else { x = w - dd; y = t * h; }
      this.blob(x, y, rand(26, 70), alpha);
    }
  };

  // Fade everything a little (used while the logo-click build-up recedes).
  FrostLayer.prototype.fade = function (amount) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,' + clamp(amount, 0, 1) + ')';
    ctx.fillRect(0, 0, this.w, this.h);
    ctx.restore();
  };

  // Expanding ring melt from a point (used by the thaw).
  FrostLayer.prototype.meltRing = function (x, y, r, feather) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    const g = ctx.createRadialGradient(x, y, Math.max(0, r - feather), x, y, r);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.restore();
  };

  // ── dendrites ───────────────────────────────────────────
  // Generates a branching crystal as segments stamped with the moment they appear.
  FrostLayer.prototype.seedDendrite = function (x, y, angle, length, startTime, speed) {
    const segs = [];
    const spd = speed || 1;
    function grow(px, py, ang, len, depth, t, width) {
      let step = rand(5, 11);
      let cx = px, cy = py, travelled = 0, time = t;
      let sinceBranch = 0;
      while (travelled < len) {
        const jitter = rand(-0.22, 0.22);
        const a = ang + jitter;
        const nx = cx + Math.cos(a) * step;
        const ny = cy + Math.sin(a) * step;
        time += step / (spd * 0.9);
        segs.push({ x1: cx, y1: cy, x2: nx, y2: ny, t: time, w: width, a: 0.55 + 0.4 * (1 - travelled / len) });
        cx = nx; cy = ny; travelled += step; sinceBranch += step;
        if (depth > 0 && sinceBranch > rand(14, 26)) {
          sinceBranch = 0;
          const side = Math.random() < 0.5 ? 1 : -1;
          const bl = len * rand(0.22, 0.45) * (depth / 3);
          grow(cx, cy, ang + side * (Math.PI / 3) * rand(0.85, 1.15), bl, depth - 1, time, width * 0.72);
          if (Math.random() < 0.35) {
            grow(cx, cy, ang - side * (Math.PI / 3) * rand(0.85, 1.15), bl * 0.8, depth - 1, time, width * 0.7);
          }
        }
        step = rand(5, 11);
      }
    }
    grow(x, y, angle, length, 3, startTime, 1.5);
    segs.sort(function (p, q) { return p.t - q.t; });
    this.dendrites.push({ segs: segs, i: 0 });
  };

  // Strokes every segment whose time has come. Returns true while crystals are still growing.
  FrostLayer.prototype.drawDendrites = function (now) {
    const ctx = this.ctx;
    let busy = false;
    ctx.save();
    ctx.lineCap = 'round';
    for (let d = 0; d < this.dendrites.length; d++) {
      const den = this.dendrites[d];
      const segs = den.segs;
      while (den.i < segs.length && segs[den.i].t <= now) {
        const s = segs[den.i++];
        // glow
        ctx.strokeStyle = 'rgba(205, 238, 246, ' + (s.a * 0.28) + ')';
        ctx.lineWidth = s.w + 2.4;
        ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); ctx.stroke();
        // crystal
        ctx.strokeStyle = 'rgba(248, 253, 255, ' + s.a + ')';
        ctx.lineWidth = s.w;
        ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); ctx.stroke();
      }
      if (den.i < segs.length) busy = true;
    }
    ctx.restore();
    if (!busy) this.dendrites = [];
    return busy;
  };

  // Seed crystals along the border, pointing inward.
  FrostLayer.prototype.seedEdges = function (count, length, startTime, speed) {
    const w = this.w, h = this.h;
    for (let i = 0; i < count; i++) {
      const side = i % 4;
      const t = rand(0.05, 0.95);
      let x, y, ang;
      if (side === 0) { x = t * w; y = -2; ang = Math.PI / 2; }
      else if (side === 1) { x = t * w; y = h + 2; ang = -Math.PI / 2; }
      else if (side === 2) { x = -2; y = t * h; ang = 0; }
      else { x = w + 2; y = t * h; ang = Math.PI; }
      this.seedDendrite(x, y, ang + rand(-0.5, 0.5), length * rand(0.6, 1.2), startTime + rand(0, 250), speed);
    }
  };

  // ─────────────────────────────────────────────── page pane
  function initPagePane() {
    const canvas = document.getElementById('frost-page');
    if (!canvas) return null;
    const layer = new FrostLayer(canvas);
    layer.resize();

    let cover = 0;                // current edge-frost depth as a fraction of max
    let chillLevel = 0;           // build-up from the logo clicks, 0..1
    let snapping = null;          // { phase, t0, depth }
    let rafId = null;
    let lastTick = 0;

    function maxDepth() { return Math.min(layer.w, layer.h) * 0.16; }

    function frame(now) {
      rafId = null;
      const dt = lastTick ? Math.min(0.1, (now - lastTick) / 1000) : 0.016;
      lastTick = now;

      if (snapping) {
        stepSnap(now);
        schedule();
        return;
      }

      const crystals = layer.drawDendrites(now);
      if (chillLevel > cover + 0.002) {
        cover = Math.min(chillLevel, cover + dt * 0.35);
        layer.creep(cover * maxDepth(), 5, 0.22);
        if (Math.random() < 0.03) layer.seedEdges(1, maxDepth() * 1.6, now, 0.7);
        schedule();
      } else if (chillLevel < cover - 0.002) {
        cover = Math.max(chillLevel, cover - dt * 0.9);
        layer.fade(dt * 2.6);
        if (cover <= 0.003) { cover = 0; layer.clear(); }
        schedule();
      } else if (crystals) {
        schedule();
      } else {
        lastTick = 0; // idle: the next frame starts a fresh clock
      }
    }

    function schedule() {
      if (rafId === null && !document.hidden) rafId = requestAnimationFrame(frame);
    }

    // ── the cold snap ─────────────────────────────────────
    let snapResolve = null;
    const SNAP = { grow: 1400, hold: 3400, thaw: 1300 };

    function startSnap() {
      if (snapping) return Promise.resolve();
      layer.resize();
      const now = performance.now();
      snapping = { phase: 'grow', t0: now, depth: 0 };
      if (reduceMotion.matches) {
        layer.fillAll(1);
      } else {
        layer.seedEdges(18, Math.min(layer.w, layer.h) * 0.55, now, 1.6);
        for (let i = 0; i < 8; i++) {
          layer.seedDendrite(rand(0.1, 0.9) * layer.w, rand(0.1, 0.9) * layer.h, rand(0, TAU), Math.min(layer.w, layer.h) * rand(0.18, 0.32), now + rand(200, 900), 1.4);
        }
      }
      document.body.classList.add('is-frozen');
      schedule();
      return new Promise(function (res) { snapResolve = res; });
    }

    function stepSnap(now) {
      const s = snapping;
      const el = now - s.t0;
      if (s.phase === 'grow') {
        const t = clamp(el / SNAP.grow, 0, 1);
        const maxD = Math.max(layer.w, layer.h) * 0.65;
        const target = easeOutCubic(t) * maxD;
        while (s.depth < target) {
          s.depth += 9;
          layer.creep(s.depth, 7, 0.3);
        }
        layer.drawDendrites(now);
        if (t >= 1) {
          layer.fillAll(0.7);
          s.phase = 'hold'; s.t0 = now;
        }
      } else if (s.phase === 'hold') {
        layer.drawDendrites(now);
        if (el >= SNAP.hold) {
          s.phase = 'thaw'; s.t0 = now;
          document.body.classList.remove('is-frozen');
          document.body.classList.add('is-thawing');
        }
      } else if (s.phase === 'thaw') {
        const t = clamp(el / SNAP.thaw, 0, 1);
        const r = easeOutCubic(t) * Math.hypot(layer.w, layer.h) * 0.62;
        layer.meltRing(layer.w / 2, layer.h / 2, r + 10, 140);
        if (t >= 1) {
          layer.clear();
          cover = 0;
          chillLevel = 0;
          snapping = null;
          document.body.classList.remove('is-thawing');
          if (snapResolve) { snapResolve(); snapResolve = null; }
        }
      }
    }

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) { lastTick = 0; schedule(); }
    });

    let resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (layer.resize()) { cover = 0; schedule(); }
      }, 160);
    });

    return {
      snap: startSnap,
      chill: function (level) { chillLevel = clamp(level, 0, 1); schedule(); },
      get frozen() { return Boolean(snapping); }
    };
  }

  // ─────────────────────────────────────────────── boot
  function boot() {
    const page = initPagePane();
    window.CS_FROST = {
      snap: function () { return page ? page.snap() : Promise.resolve(); },
      chill: function (level) { if (page) page.chill(level); },
      get frozen() { return page ? page.frozen : false; }
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
