// Road Trip — vertical-highway minigame
// The whole page transforms into a long highway with pit stops built from
// existing page elements. Drive a car between them, dodge emoji obstacles,
// press E at a pit stop to enter / play it.
// Exposed as window.RoadTrip = { activate }
// Backward-compat alias: window.DemolitionCar = { activate }
(function () {
  'use strict';

  function isMobileDevice() {
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return true;
    if ('ontouchstart' in window && window.innerWidth < 900) return true;
    return /Android|iPhone|iPad|iPod|Mobile|Opera Mini/i.test(navigator.userAgent || '');
  }

  function showDesktopOnlyToast() {
    if (document.getElementById('roadtrip-toast')) return;
    var t = document.createElement('div');
    t.id = 'roadtrip-toast';
    t.innerHTML =
      '<div style="font-size:1.6rem;margin-bottom:6px">🖥️</div>' +
      '<div style="font-weight:700;color:#F05F40;margin-bottom:4px">Desktop-only minigame</div>' +
      '<div style="color:#ccc;font-size:0.85rem;line-height:1.45">' +
      'Road Trip needs a mouse and keyboard.<br>Open this on a desktop browser to play!</div>';
    Object.assign(t.style, {
      position: 'fixed', left: '50%', bottom: '24px',
      transform: 'translate(-50%, 30px)', zIndex: '99999',
      background: 'rgba(15,15,18,0.95)', color: '#fff',
      padding: '14px 20px', borderRadius: '14px',
      maxWidth: 'min(360px, calc(100vw - 32px))',
      textAlign: 'center', fontFamily: 'Comfortaa, Segoe UI, sans-serif',
      border: '1px solid rgba(240,95,64,0.5)',
      boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
      opacity: '0',
      transition: 'transform 0.35s cubic-bezier(.34,1.56,.64,1), opacity 0.35s ease'
    });
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.style.transform = 'translate(-50%, 0)'; t.style.opacity = '1'; });
    setTimeout(function () {
      t.style.transform = 'translate(-50%, 30px)'; t.style.opacity = '0';
      setTimeout(function () { t.remove(); }, 400);
    }, 3500);
  }

  function activate(/* e */) {
    if (document.getElementById('roadtrip-stage')) return;
    if (isMobileDevice()) { showDesktopOnlyToast(); return; }

    // ---------- tunables ----------
    var CAR_SIZE              = 64;
    var HITBOX_W              = 44;
    var ROAD_WIDTH            = 720;

    var MAX_FWD = 3;
    var STOP_SPACING          = 5500; // Much longer distances between pit stops
    var MAX_REV               = -5;   // Infinite top speed with asymptotic acceleration
    var ACCEL_FWD_BASE        = 0.18;
    var ACCEL_FWD_TOP_FALLOFF = 2.5; // Higher = harder to reach top speeds (asymptotic) - 300km/h is achievable but challenging
    var ACCEL_REV             = 0.15;
    var COAST_DRAG            = 0.04;
    var BRAKE_DRAG            = 0.8;
    var TURN_BASE             = 0.055;
    var TURN_FAST             = 0.090;
    var HANDBRAKE_TURN_BOOST  = 1.1;
    var GRIP                  = 0.22;
    var HANDBRAKE_GRIP        = 0.012;
    var FWD_TRACK             = 0.55;
    var HANDBRAKE_FWD_TRACK   = 0.10;
    var DRIFT_RECOVER         = 0.075;
    var BUMP_RESTITUTION      = 0.55;
    var INTERACT_RANGE        = 260;
    var OBSTACLE_RADIUS       = 30;
    var IDLE_VIBRATION_AMOUNT = .4; // Subtle engine idle vibration

    var prevBodySelect    = document.body.style.userSelect;
    var prevHtmlOverflow  = document.documentElement.style.overflow;
    var prevBodyOverflow  = document.body.style.overflow;
    document.body.style.userSelect = 'none';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    // ---------- styles ----------
    var styleEl = document.createElement('style');
    styleEl.id = 'roadtrip-style';
    styleEl.textContent =
      "@keyframes rt-stage-in { from{opacity:0} to{opacity:1} }" +
      "@keyframes rt-stage-out { from{opacity:1} to{opacity:0} }" +
      "@keyframes rt-bounce-in { 0%{transform:translate(-50%,-120%) scale(.6);opacity:0} 70%{transform:translate(-50%,0) scale(1.05);opacity:1} 100%{transform:translate(-50%,0) scale(1);opacity:1} }" +
      "@keyframes rt-pit-fade { from { opacity:0 } to { opacity:1 } }" +
      "@keyframes rt-arrow-pulse { 0%,100% { transform:scale(1); opacity:.85 } 50% { transform:scale(1.1); opacity:1 } }" +
      "@keyframes rt-smoke-out { from { opacity:.55; transform:translate(-50%,-50%) scale(1) } to { opacity:0; transform:translate(-50%,-50%) scale(3.4) } }" +
      "@keyframes rt-overlay-in { 0%{opacity:0; transform:translate(-50%,-50%) scale(.85)} 100%{opacity:1; transform:translate(-50%,-50%) scale(1)} }" +
      "@keyframes rt-overlay-out { 0%{opacity:1; transform:translate(-50%,-50%) scale(1)} 100%{opacity:0; transform:translate(-50%,-50%) scale(.94)} }" +
      "@keyframes rt-loadbar { 0%{width:0%} 100%{width:100%} }" +
      "@keyframes rt-page-shrink { from { transform:scale(1); opacity:1; filter:blur(0) } to { transform:scale(.92); opacity:0; filter:blur(3px) } }" +
      "#roadtrip-stage { position:fixed; inset:0; z-index:99990; background:linear-gradient(180deg,#0d0f12 0%, #0a0c0f 100%); overflow:hidden; cursor:crosshair; opacity:0; animation: rt-stage-in 0.55s ease forwards; }" +
      "#roadtrip-world { position:absolute; left:50%; top:0; will-change:transform; }" +
      "#roadtrip-world .rt-road { position:absolute; left:0; top:0; width:100%; height:100%; background:#202428; border-left:6px solid #2a2e35; border-right:6px solid #2a2e35; box-shadow:0 0 60px rgba(0,0,0,.6) inset; }" +
      "#roadtrip-world .rt-stripes { position:absolute; left:50%; top:0; width:8px; transform:translateX(-50%); background-image:linear-gradient(#ffe66d 0 50%, transparent 50% 100%); background-size:100% 80px; opacity:.85; }" +
      "#roadtrip-world .rt-shoulder { position:absolute; top:0; width:6px; background-image:linear-gradient(#fff 0 60%, transparent 60% 100%); background-size:100% 40px; opacity:.45; }" +
      "#roadtrip-world .rt-shoulder.rt-l { left:18px; }" +
      "#roadtrip-world .rt-shoulder.rt-r { right:18px; }" +
      ".rt-pit { position:absolute; transform:translate(-50%,-50%); display:flex; flex-direction:column; align-items:center; gap:8px; pointer-events:none; opacity:0; animation: rt-pit-fade .55s ease forwards; }" +
      ".rt-pad { position:absolute; transform:translate(-50%,-50%); width:240px; height:160px; background:linear-gradient(180deg,#2a2e35 0%, #20242a 100%); border-radius:18px; border:2px solid rgba(255,255,255,.08); box-shadow:0 12px 32px rgba(0,0,0,.5), inset 0 0 0 6px rgba(255,255,255,.03); pointer-events:none; }" +
      ".rt-pad::after { content:''; position:absolute; inset:14px; border:1px dashed rgba(255,230,109,.25); border-radius:12px; }" +
      ".rt-smoke { position:absolute; width:18px; height:18px; border-radius:50%; background:rgba(200,200,200,.55); filter:blur(3px); pointer-events:none; transform:translate(-50%,-50%) scale(1); animation: rt-smoke-out .9s ease-out forwards; }" +
      ".rt-pit-sign { background:#2a1810; color:#F05F40; padding:6px 14px; border-radius:999px; font:700 .85rem Comfortaa,sans-serif; border:2px solid #F05F40; white-space:nowrap; box-shadow:0 6px 18px rgba(240,95,64,.35); }" +
      ".rt-pit-card { background:#1a1a1a; color:#fff; padding:12px 18px; border-radius:14px; border:2px solid #444; max-width:360px; min-width:240px; text-align:center; font:600 .9rem Comfortaa,sans-serif; box-shadow:0 12px 32px rgba(0,0,0,.5); transition:border-color .25s ease, transform .25s ease, box-shadow .25s ease; }" +
      ".rt-pit.rt-near .rt-pit-card { border-color:#F05F40; box-shadow:0 14px 40px rgba(240,95,64,.4); }" +
      ".rt-pit-thumb { display:block; max-width:240px; max-height:130px; border-radius:10px; margin:0 auto 6px; object-fit:cover; }" +
      ".rt-pit-arrow { color:#F05F40; font-weight:700; font-size:.85rem; opacity:0; transition:opacity .2s ease; }" +
      ".rt-pit.rt-near .rt-pit-arrow { opacity:1; animation: rt-arrow-pulse 1s ease-in-out infinite; }" +
      ".rt-obstacle { position:absolute; transform:translate(-50%,-50%); font-size:46px; line-height:1; pointer-events:none; user-select:none; filter:drop-shadow(0 4px 6px rgba(0,0,0,.5)); }" +
      "@keyframes rt-knock { 0%{transform:translate(-50%,-50%) rotate(0deg) scale(1)} 100%{transform:translate(calc(-50% + var(--kx,0px)), calc(-50% + var(--ky,40px))) rotate(var(--kr,360deg)) scale(.55); opacity:0} }" +
      ".rt-obstacle.rt-hit { animation: rt-knock .55s ease forwards; }" +
      "#roadtrip-car { position:absolute; width:64px; height:64px; background:url('/stuff/car.png') center/contain no-repeat; filter:drop-shadow(0 6px 8px rgba(0,0,0,.55)); will-change:transform; transform-origin:50% 50%; pointer-events:none; }" +
      "#rt-hud { position:fixed; top:18px; left:50%; transform:translate(-50%,0); background:rgba(15,15,18,.88); color:#fff; padding:10px 22px; border-radius:999px; font:700 .95rem Comfortaa,sans-serif; border:1px solid rgba(240,95,64,.6); box-shadow:0 6px 30px rgba(0,0,0,.45); z-index:99999; animation:rt-bounce-in .45s cubic-bezier(.34,1.56,.64,1) both; pointer-events:none; }" +
      "#rt-speed { position:fixed; top:18px; right:20px; background:rgba(15,15,18,.75); color:#ddd; padding:8px 16px; border-radius:12px; font:.78rem Comfortaa,sans-serif; border:1px solid rgba(255,255,255,.08); box-shadow:0 4px 20px rgba(0,0,0,.35); z-index:99999; pointer-events:none; opacity:.85; }" +
      "#rt-speed .rt-speed-label { color:#888; font-size:.65rem; margin-bottom:2px; }" +
      "#rt-speed .rt-speed-value { color:#F05F40; font-weight:700; font-size:.9rem; }" +
      "#rt-speed .rt-speed-top { color:#ffe66d; font-size:.7rem; margin-top:3px; }" +
      "#rt-help { position:fixed; bottom:20px; left:20px; background:rgba(15,15,18,.85); color:#ddd; padding:10px 14px; border-radius:12px; font:.78rem/1.55 Comfortaa,sans-serif; border:1px solid rgba(255,255,255,.08); box-shadow:0 6px 30px rgba(0,0,0,.4); z-index:99999; pointer-events:none; }" +
      "#rt-help b { color:#fff; }" +
      "#rt-help .rt-help-title { color:#F05F40; font-weight:700; margin-bottom:4px; }" +
      "#rt-stop { position:fixed; bottom:20px; right:20px; background:#F05F40; color:#fff; border:none; border-radius:999px; padding:10px 18px; font:700 .85rem Comfortaa,sans-serif; cursor:pointer; box-shadow:0 6px 18px rgba(240,95,64,.45); z-index:99999; transition:background .15s ease, transform .15s ease; }" +
      "#rt-stop:hover { background:#c84b15; transform:translateY(-1px); }" +
      "#rt-interact { position:fixed; left:50%; top:64%; transform:translate(-50%,0); background:rgba(15,15,18,.92); color:#F05F40; padding:10px 22px; border-radius:999px; border:1px solid #F05F40; font:700 .95rem Comfortaa,sans-serif; z-index:99999; pointer-events:none; opacity:0; transition:opacity .2s ease; }" +
      "#rt-interact.rt-show { opacity:1; }" +
      "#rt-minimap { position:fixed; right:20px; top:50%; transform:translate(0,-50%); width:46px; height:62vh; max-height:560px; background:rgba(15,15,18,.85); border-radius:24px; border:1px solid rgba(255,255,255,.1); box-shadow:0 6px 30px rgba(0,0,0,.4); z-index:99999; pointer-events:none; font-family:Comfortaa,sans-serif; }" +
      "#rt-minimap .rt-mm-track { position:absolute; left:50%; top:14px; bottom:14px; width:4px; background:#2a2e35; border-radius:2px; transform:translateX(-50%); }" +
      ".rt-mm-stop { position:absolute; left:50%; width:14px; height:14px; transform:translate(-50%,-50%); background:#444; border-radius:50%; border:2px solid #1a1d22; transition:background .2s ease, box-shadow .2s ease; }" +
      ".rt-mm-stop.rt-near { background:#F05F40; box-shadow:0 0 10px #F05F40; }" +
      ".rt-mm-car { position:absolute; left:50%; transform:translate(-50%,-50%); width:18px; height:18px; background:#F05F40; border-radius:50%; box-shadow:0 0 10px rgba(240,95,64,.9); border:2px solid #fff; }" +
      ".rt-mm-distance { position:absolute; left:50%; bottom:-26px; transform:translateX(-50%); font:600 .7rem Comfortaa,sans-serif; color:#bbb; white-space:nowrap; }" +
      "#rt-overlay { position:fixed; left:50%; top:50%; transform:translate(-50%,-50%); z-index:100000; background:rgba(15,15,18,.96); color:#fff; padding:24px 28px 22px; border-radius:18px; border:2px solid #F05F40; box-shadow:0 24px 80px rgba(0,0,0,.6), 0 0 60px rgba(240,95,64,.25); font-family:Comfortaa,sans-serif; min-width:300px; max-width:440px; text-align:center; pointer-events:none; }" +
      "#rt-overlay .rt-ov-icon { font-size:2.2rem; margin-bottom:6px; }" +
      "#rt-overlay .rt-ov-title { font-weight:700; color:#F05F40; font-size:1.05rem; margin-bottom:4px; }" +
      "#rt-overlay .rt-ov-action { color:#ddd; font-size:.85rem; margin-bottom:14px; }" +
      "#rt-overlay .rt-ov-bar { height:6px; background:#2a2e35; border-radius:999px; overflow:hidden; margin-bottom:10px; }" +
      "#rt-overlay .rt-ov-bar > div { height:100%; background:linear-gradient(90deg,#F05F40,#ffe66d); border-radius:999px; animation: rt-loadbar 1.2s ease-out forwards; }" +
      "#rt-overlay .rt-ov-tag { color:#888; font-size:.72rem; font-style:italic; }";
    document.head.appendChild(styleEl);

    // ---------- collect pit-stop sources from current page ----------
    var entries = [];
    function pushIfUseful(el, kind) {
      if (!el) return;
      if (el.closest('[data-site-nav]')) return;
      if (el.closest('[data-roadtrip-ui]')) return;
      if (el.classList && el.classList.contains('portfolio-card--easter-egg')) return;
      // Skip anything in/around the road-trip minigame card itself.
      if (el.querySelector && el.querySelector('.portfolio-card--easter-egg')) return;
      if (kind === 'heading') {
        var txt = (el.textContent || '').toLowerCase();
        if (/road\s*trip|drive\s*minigame|demolition/.test(txt)) return;
      }
      var r = el.getBoundingClientRect();
      if (r.width < 24 || r.height < 18) return;
      entries.push({ kind: kind, el: el });
    }
    document.querySelectorAll('h2.section-heading, h2').forEach(function (el) { pushIfUseful(el, 'heading'); });
    document.querySelectorAll('.portfolio-card, .contact-card').forEach(function (el) { pushIfUseful(el, 'card'); });

    entries.sort(function (a, b) {
      var ra = a.el.getBoundingClientRect().top + window.scrollY;
      var rb = b.el.getBoundingClientRect().top + window.scrollY;
      return ra - rb;
    });

    // Remove heading sections - only keep actual content cards
    entries = entries.filter(function (e) { return e.kind !== 'heading'; });

    // Always add a "Home base" pit stop at the very start of the road.
    entries.unshift({ kind: 'home' });

    // ---------- generate road spline (organic curves) ----------
    var roadSpline = [];
    var numCurvePoints = Math.max(8, Math.floor((entries.length + 1) * 1.2));
    // Generate seamless looping curve
    for (var sp = 0; sp < numCurvePoints; sp++) {
      var yPos = (sp / numCurvePoints) * STOP_SPACING * (entries.length + 1);
      // Use the same seed for the sinusoidal pattern to ensure seamless loop
      var freq1 = 0.0003, freq2 = 0.0008;
      var amp1 = 180, amp2 = 120;
      var xOffset = Math.sin(yPos * freq1) * amp1 + Math.sin(yPos * freq2) * amp2;
      roadSpline.push({ y: yPos, x: xOffset });
    }
    // Add a duplicate of the first point at the end to ensure seamless wrapping
    roadSpline.push({ y: WORLD_HEIGHT, x: roadSpline[0].x });

    // Catmull-Rom spline interpolation helper with seamless wrapping
    function getRoadOffset(y) {
      if (roadSpline.length < 2) return 0;
      // Wrap y position to create seamless loop
      var wrappedY = ((y % WORLD_HEIGHT) + WORLD_HEIGHT) % WORLD_HEIGHT;

      // Find surrounding points
      var i = 0;
      while (i < roadSpline.length - 1 && roadSpline[i + 1].y < wrappedY) i++;

      // Handle wrapping for interpolation
      var p0, p1, p2, p3;
      if (i === 0) {
        p0 = roadSpline[roadSpline.length - 2];
        p1 = roadSpline[i];
        p2 = roadSpline[i + 1];
        p3 = roadSpline[Math.min(i + 2, roadSpline.length - 1)];
      } else if (i >= roadSpline.length - 2) {
        p0 = roadSpline[Math.max(0, i - 1)];
        p1 = roadSpline[i];
        p2 = roadSpline[0]; // Wrap to start
        p3 = roadSpline[1];
      } else {
        p0 = roadSpline[i - 1];
        p1 = roadSpline[i];
        p2 = roadSpline[i + 1];
        p3 = roadSpline[Math.min(i + 2, roadSpline.length - 1)];
      }

      var t = (wrappedY - p1.y) / ((i >= roadSpline.length - 2 ? WORLD_HEIGHT : p2.y) - p1.y);
      var t2 = t * t, t3 = t2 * t;

      // Catmull-Rom spline formula
      return 0.5 * (
        (2 * p1.x) +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
      );
    }

    // ---------- build stage ----------
    var stage = document.createElement('div');
    stage.id = 'roadtrip-stage';
    stage.dataset.roadtripUi = 'true';

    var world = document.createElement('div');
    world.id = 'roadtrip-world';
    world.dataset.roadtripUi = 'true';

    // Widen world to accommodate pit stops on both sides with margins
    var PIT_PAD_EXTENT = 120; // Half width of pit pad (240px / 2)
    var WORLD_WIDTH = ROAD_WIDTH + ((ROAD_WIDTH / 2) + 240 + PIT_PAD_EXTENT + 100) * 2; // Accommodate SIDE_OFFSET + pad + margin on both sides
    var ROAD_LEFT_OFFSET = (WORLD_WIDTH - ROAD_WIDTH) / 2; // Center road in wider world

    world.style.width = WORLD_WIDTH + 'px';
    var WORLD_HEIGHT = STOP_SPACING * (entries.length + 1);
    world.style.height = WORLD_HEIGHT + 'px';

    var road = document.createElement('div'); road.className = 'rt-road';
    road.style.left = ROAD_LEFT_OFFSET + 'px';
    road.style.width = ROAD_WIDTH + 'px';
    var stripes = document.createElement('div'); stripes.className = 'rt-stripes';
    stripes.style.left = (ROAD_LEFT_OFFSET + ROAD_WIDTH / 2) + 'px';
    stripes.style.height = WORLD_HEIGHT + 'px';
    var sL = document.createElement('div'); sL.className = 'rt-shoulder rt-l'; sL.style.left = (ROAD_LEFT_OFFSET + 18) + 'px'; sL.style.height = WORLD_HEIGHT + 'px';
    var sR = document.createElement('div'); sR.className = 'rt-shoulder rt-r'; sR.style.left = (ROAD_LEFT_OFFSET + ROAD_WIDTH - 18) + 'px'; sR.style.height = WORLD_HEIGHT + 'px';
    world.appendChild(road);
    world.appendChild(stripes);
    world.appendChild(sL);
    world.appendChild(sR);

    // ---------- pit stops (alternating side, like real highway petrol stations) ----------
    var SIDE_OFFSET = (ROAD_WIDTH / 2) + 240; // Distance from road center to pit center - keeps pits visible on narrow screens
    var pitStops = entries.map(function (entry, i) {
      var y = STOP_SPACING * (i + 0.6);
      var side = (i % 2 === 0) ? -1 : 1; // -1 left, +1 right
      // Position pits at fixed offset from road center (no road offset adjustment)
      // This makes them follow the visual road curve as the world transforms
      var pitCenterX = ROAD_LEFT_OFFSET + (ROAD_WIDTH / 2) + side * SIDE_OFFSET;
      // enterX is road-relative (for collision detection with carX) - positioned near the pit stop
      var enterX = side * (SIDE_OFFSET - 80); // Interaction zone near the pit stop

      // parking pad only (no off-ramp connector)
      var pad = document.createElement('div');
      pad.className = 'rt-pad';
      pad.style.top = y + 'px';
      pad.style.left = pitCenterX + 'px';
      world.appendChild(pad);

      var node = document.createElement('div');
      node.className = 'rt-pit';
      node.style.top = y + 'px';
      node.style.left = pitCenterX + 'px';
      node.style.animationDelay = (0.06 * i) + 's';

      var sign = document.createElement('div'); sign.className = 'rt-pit-sign';
      var card = document.createElement('div'); card.className = 'rt-pit-card';
      var arrow = document.createElement('div'); arrow.className = 'rt-pit-arrow';
      arrow.textContent = '⏵ Press E';

      function getTitle(el) {
        var t = el.querySelector && el.querySelector('.card-title, h3, h4, .portfolio-card-title');
        return ((t && t.textContent) || el.textContent || '').trim();
      }

      if (entry.kind === 'home') {
        sign.textContent = '🏠 Home base';
        card.innerHTML =
          '<div style="font-weight:700;color:#F05F40;margin-bottom:4px">🏡 Home page</div>' +
          '<div style="font-size:.78rem;color:#aaa">Press E to peek inside</div>';
      } else if (entry.kind === 'heading') {
        var ht = (entry.el.textContent || '').trim().slice(0, 60);
        sign.textContent = '📍 ' + (ht || 'Section');
        card.innerHTML =
          '<div style="font-weight:700;color:#F05F40;margin-bottom:4px">' + (ht || 'Section') + '</div>' +
          '<div style="font-size:.78rem;color:#aaa">A scenic viewpoint along the road</div>';
      } else {
        var title = getTitle(entry.el).slice(0, 60) || 'Stop';
        sign.textContent = '🛑 ' + title;
        var img = entry.el.querySelector('img');
        if (img && img.src) {
          var thumb = document.createElement('img');
          thumb.className = 'rt-pit-thumb';
          thumb.src = img.src;
          thumb.alt = '';
          card.appendChild(thumb);
        }
        var titleEl = document.createElement('div');
        titleEl.style.cssText = 'font-weight:700;color:#F05F40;margin-bottom:4px';
        titleEl.textContent = title;
        card.appendChild(titleEl);
        var hasAudio = !!entry.el.querySelector('audio');
        var actionEl = document.createElement('div');
        actionEl.style.cssText = 'font-size:.78rem;color:#aaa';
        actionEl.textContent = hasAudio ? 'Press E to play / pause' : 'Press E to open';
        card.appendChild(actionEl);
      }

      node.appendChild(sign);
      node.appendChild(card);
      node.appendChild(arrow);
      world.appendChild(node);
      return { y: y, node: node, entry: entry, enterX: enterX, side: side };
    });

    // ---------- obstacles ----------
    var obstacles = [];
    var emojis = ['🛢️', '🚧', '🪨', '🛞', '🚲', '🪵'];
    for (var k = 0; k < pitStops.length - 1; k++) {
      var segStart = pitStops[k].y + 240;
      var segEnd   = pitStops[k + 1].y - 240;
      if (segEnd <= segStart) continue;
      var n = 1 + Math.floor(Math.random() * 3);
      for (var j = 0; j < n; j++) {
        var oy = segStart + ((j + Math.random()) / n) * (segEnd - segStart);
        var ox = (Math.random() - 0.5) * (ROAD_WIDTH - 110);
        var roadOffsetAtObstacle = getRoadOffset(oy);
        var em = emojis[Math.floor(Math.random() * emojis.length)];
        var oEl = document.createElement('div');
        oEl.className = 'rt-obstacle';
        oEl.textContent = em;
        oEl.style.left = (ROAD_LEFT_OFFSET + (ROAD_WIDTH / 2) + ox + roadOffsetAtObstacle) + 'px';
        oEl.style.top  = oy + 'px';
        world.appendChild(oEl);
        obstacles.push({ x: ox, y: oy, el: oEl, hit: false });
      }
    }

    // ---------- car ----------
    var carEl = document.createElement('div');
    carEl.id = 'roadtrip-car';
    carEl.dataset.roadtripUi = 'true';
    world.appendChild(carEl);

    // ---------- HUD / help / stop / interact / minimap ----------
    var hud = document.createElement('div'); hud.id = 'rt-hud'; hud.dataset.roadtripUi = 'true';
    hud.textContent = '🛣️ Road trip · ' + pitStops.length + ' stops';

    var speedHud = document.createElement('div'); speedHud.id = 'rt-speed'; speedHud.dataset.roadtripUi = 'true';
    speedHud.innerHTML =
      '<div class="rt-speed-label">SPEED</div>' +
      '<div class="rt-speed-value">0 mph</div>' +
      '<div class="rt-speed-top">Top: 0 mph</div>';

    var help = document.createElement('div'); help.id = 'rt-help'; help.dataset.roadtripUi = 'true';
    help.innerHTML =
      '<div class="rt-help-title">Controls</div>' +
      '<div><b>Mouse</b> · steer toward cursor</div>' +
      '<div><b>Left&nbsp;click</b> · drive forward &nbsp;·&nbsp; <b>Right&nbsp;click</b> · reverse (mirrored)</div>' +
      '<div><b>Space</b> · handbrake / drift</div>' +
      '<div><b>E</b> · enter pit stop &nbsp;·&nbsp; <b>Esc</b> · quit</div>';

    var stopBtn = document.createElement('button'); stopBtn.id = 'rt-stop'; stopBtn.dataset.roadtripUi = 'true';
    stopBtn.textContent = '✕ Stop (Esc)';

    var interactHint = document.createElement('div'); interactHint.id = 'rt-interact'; interactHint.dataset.roadtripUi = 'true';
    interactHint.textContent = '⏵ Press E to enter';

    var minimap = document.createElement('div'); minimap.id = 'rt-minimap'; minimap.dataset.roadtripUi = 'true';
    var mmTrack = document.createElement('div'); mmTrack.className = 'rt-mm-track';
    minimap.appendChild(mmTrack);
    var mmStops = pitStops.map(function () {
      var d = document.createElement('div'); d.className = 'rt-mm-stop';
      mmTrack.appendChild(d);
      return d;
    });
    var mmCar = document.createElement('div'); mmCar.className = 'rt-mm-car';
    mmTrack.appendChild(mmCar);
    var mmDist = document.createElement('div'); mmDist.className = 'rt-mm-distance';
    mmDist.textContent = '0 m';
    minimap.appendChild(mmDist);

    function layoutMinimap() {
      var trackRect = mmTrack.getBoundingClientRect();
      var usable = trackRect.height;
      mmStops.forEach(function (d, idx) {
        d.style.top = ((pitStops[idx].y / WORLD_HEIGHT) * usable) + 'px';
      });
    }

    // Create drivable area boundaries that follow the road curve
    var halfScreenWidth = window.innerWidth / 2;
    var minCarX = -halfScreenWidth + CAR_SIZE;
    var maxCarX = halfScreenWidth - CAR_SIZE;
    var BOUNDARY_VISUAL_OFFSET = 20; // Visual lines offset from actual collision boundary

    // Create SVG boundaries that curve with the road
    var svgNS = 'http://www.w3.org/2000/svg';

    // Left boundary
    var svgLeft = document.createElementNS(svgNS, 'svg');
    svgLeft.style.position = 'absolute';
    svgLeft.style.left = '0';
    svgLeft.style.top = '0';
    svgLeft.style.width = WORLD_WIDTH + 'px';
    svgLeft.style.height = WORLD_HEIGHT + 'px';
    svgLeft.style.pointerEvents = 'none';
    svgLeft.style.zIndex = '1';
    var pathLeft = document.createElementNS(svgNS, 'path');
    var dLeft = 'M';
    for (var i = 0; i <= WORLD_HEIGHT; i += 40) {
      var offset = getRoadOffset(i);
      var x = ROAD_LEFT_OFFSET + (ROAD_WIDTH / 2) + minCarX - BOUNDARY_VISUAL_OFFSET + offset;
      dLeft += (i === 0 ? '' : ' L') + x + ',' + i;
    }
    pathLeft.setAttribute('d', dLeft);
    pathLeft.setAttribute('stroke', 'rgba(240,95,64,0.5)');
    pathLeft.setAttribute('stroke-width', '4');
    pathLeft.setAttribute('fill', 'none');
    pathLeft.setAttribute('filter', 'drop-shadow(0 0 20px rgba(240,95,64,0.4))');
    svgLeft.appendChild(pathLeft);
    world.appendChild(svgLeft);

    // Right boundary
    var svgRight = document.createElementNS(svgNS, 'svg');
    svgRight.style.position = 'absolute';
    svgRight.style.left = '0';
    svgRight.style.top = '0';
    svgRight.style.width = WORLD_WIDTH + 'px';
    svgRight.style.height = WORLD_HEIGHT + 'px';
    svgRight.style.pointerEvents = 'none';
    svgRight.style.zIndex = '1';
    var pathRight = document.createElementNS(svgNS, 'path');
    var dRight = 'M';
    for (var j = 0; j <= WORLD_HEIGHT; j += 40) {
      var offsetR = getRoadOffset(j);
      var xR = ROAD_LEFT_OFFSET + (ROAD_WIDTH / 2) + maxCarX + BOUNDARY_VISUAL_OFFSET + offsetR;
      dRight += (j === 0 ? '' : ' L') + xR + ',' + j;
    }
    pathRight.setAttribute('d', dRight);
    pathRight.setAttribute('stroke', 'rgba(240,95,64,0.5)');
    pathRight.setAttribute('stroke-width', '4');
    pathRight.setAttribute('fill', 'none');
    pathRight.setAttribute('filter', 'drop-shadow(0 0 20px rgba(240,95,64,0.4))');
    svgRight.appendChild(pathRight);
    world.appendChild(svgRight);

    document.body.appendChild(stage);
    stage.appendChild(world);
    document.body.appendChild(hud);
    document.body.appendChild(speedHud);
    document.body.appendChild(help);
    document.body.appendChild(stopBtn);
    document.body.appendChild(interactHint);
    document.body.appendChild(minimap);
    requestAnimationFrame(layoutMinimap);

    // ---------- state ----------
    var carX = 0;
    var carY = WORLD_HEIGHT - STOP_SPACING * 0.35; // Start near bottom
    var carAngle = -Math.PI / 2; // facing up the road (negative y)
    var speed = 0, velX = 0, velY = 0;
    var topSpeed = 0; // Track highest speed reached
    var throttle = 0, handbrake = false, driftBlend = 0;
    var shakeUntil = 0;
    var animId = null;
    var nearStop = null;
    var mouseX = window.innerWidth / 2;
    var mouseY = window.innerHeight / 2;
    // Keyboard controls
    var arrowUp = false, arrowDown = false, arrowLeft = false, arrowRight = false;
    var useKeyboardSteering = false;
    var steeringInput = 0; // Gradual steering (-1 to +1)

    // ---------- input ----------
    function onMouseMove(ev) {
      mouseX = ev.clientX;
      mouseY = ev.clientY;
      // Show cursor on mouse movement
      if (useKeyboardSteering) {
        stage.style.cursor = 'crosshair';
      }
    }
    function onMouseDown(ev) {
      if (ev.button === 0) {
        throttle = 1;
        useKeyboardSteering = false; // Switch to mouse mode
        stage.style.cursor = 'crosshair'; // Restore cursor
      } else if (ev.button === 2) {
        throttle = -1;
        useKeyboardSteering = false; // Switch to mouse mode
        stage.style.cursor = 'crosshair'; // Restore cursor
      }
    }
    function onMouseUp(ev) {
      if (ev.button === 0 && throttle === 1) throttle = 0;
      else if (ev.button === 2 && throttle === -1) throttle = 0;
    }
    function onContextMenu(ev) { ev.preventDefault(); }
    function onKeyDown(ev) {
      if (ev.key === 'Escape') { stop(); return; }
      if (ev.code === 'Space' || ev.key === ' ') { handbrake = true; ev.preventDefault(); return; }
      if ((ev.key === 'e' || ev.key === 'E') && nearStop) { interact(nearStop); ev.preventDefault(); }
      // Arrow key controls
      if (ev.key === 'ArrowUp') {
        arrowUp = true;
        useKeyboardSteering = true;
        stage.style.cursor = 'none'; // Hide cursor in keyboard mode
        ev.preventDefault();
      }
      if (ev.key === 'ArrowDown') {
        arrowDown = true;
        useKeyboardSteering = true;
        stage.style.cursor = 'none'; // Hide cursor in keyboard mode
        ev.preventDefault();
      }
      if (ev.key === 'ArrowLeft') {
        arrowLeft = true;
        useKeyboardSteering = true;
        stage.style.cursor = 'none'; // Hide cursor in keyboard mode
        ev.preventDefault();
      }
      if (ev.key === 'ArrowRight') {
        arrowRight = true;
        useKeyboardSteering = true;
        stage.style.cursor = 'none'; // Hide cursor in keyboard mode
        ev.preventDefault();
      }
    }
    function onKeyUp(ev) {
      if (ev.code === 'Space' || ev.key === ' ') { handbrake = false; ev.preventDefault(); }
      // Arrow key controls
      if (ev.key === 'ArrowUp') { arrowUp = false; ev.preventDefault(); }
      if (ev.key === 'ArrowDown') { arrowDown = false; ev.preventDefault(); }
      if (ev.key === 'ArrowLeft') { arrowLeft = false; ev.preventDefault(); }
      if (ev.key === 'ArrowRight') { arrowRight = false; ev.preventDefault(); }
    }
    function onBlur() {
      throttle = 0;
      handbrake = false;
      arrowUp = false;
      arrowDown = false;
      arrowLeft = false;
      arrowRight = false;
    }
    function onResize() { layoutMinimap(); }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    window.addEventListener('resize', onResize);
    stopBtn.addEventListener('click', function () { stop(); });

    // ---------- interact ----------
    function flashPit(pit) {
      var card = pit.node.querySelector('.rt-pit-card');
      if (!card) return;
      card.style.transition = 'transform .2s ease';
      card.style.transform = 'scale(1.08)';
      setTimeout(function () { card.style.transform = ''; }, 220);
    }
    function getPitDisplay(pit) {
      var entry = pit.entry;
      if (entry.kind === 'home')    return { icon: '🏡', title: 'Home base' };
      if (entry.kind === 'heading') {
        var ht = (entry.el.textContent || '').trim().slice(0, 60);
        return { icon: '📍', title: ht || 'Section' };
      }
      var t = entry.el.querySelector && entry.el.querySelector('.card-title, h3, h4, .portfolio-card-title');
      var title = ((t && t.textContent) || entry.el.textContent || 'Stop').trim().slice(0, 60);
      if (entry.el.querySelector('audio')) return { icon: '🎧', title: title };
      if (entry.el.querySelector('video')) return { icon: '🎬', title: title };
      return { icon: '🌐', title: title };
    }
    function showAudioToast(pit, playing) {
      var info = getPitDisplay(pit);
      var existing = document.getElementById('rt-audio-toast');
      if (existing) existing.remove();
      var t = document.createElement('div');
      t.id = 'rt-audio-toast';
      t.dataset.roadtripUi = 'true';
      Object.assign(t.style, {
        position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%) scale(.9)',
        zIndex: '100000', background: 'rgba(15,15,18,.95)', color: '#fff',
        padding: '18px 26px', borderRadius: '16px', border: '2px solid #F05F40',
        boxShadow: '0 18px 60px rgba(0,0,0,.5), 0 0 50px rgba(240,95,64,.25)',
        fontFamily: 'Comfortaa,sans-serif', textAlign: 'center', minWidth: '260px',
        opacity: '0', transition: 'opacity .2s ease, transform .25s cubic-bezier(.34,1.56,.64,1)',
        pointerEvents: 'none'
      });
      t.innerHTML =
        '<div style="font-size:1.8rem;margin-bottom:4px">' + info.icon + '</div>' +
        '<div style="font-weight:700;color:#F05F40;font-size:.95rem;margin-bottom:2px"></div>' +
        '<div style="color:#ddd;font-size:.8rem">' + (playing ? '▶ Playing in the background' : '⏸ Paused') + '</div>';
      t.children[1].textContent = info.title;
      document.body.appendChild(t);
      requestAnimationFrame(function () {
        t.style.opacity = '1';
        t.style.transform = 'translate(-50%,-50%) scale(1)';
      });
      setTimeout(function () {
        t.style.opacity = '0';
        t.style.transform = 'translate(-50%,-50%) scale(.94)';
        setTimeout(function () { t.remove(); }, 250);
      }, 1100);
    }
    var interactBusy = false;
    function interact(pit) {
      if (interactBusy) return;
      flashPit(pit);
      var entry = pit.entry;

      // Audio: toggle play/pause inline, stay in the game so you can keep cruising.
      if (entry.el && entry.el.querySelector) {
        var audio = entry.el.querySelector('audio');
        if (audio) {
          if (audio.paused) { audio.play().catch(function () {}); showAudioToast(pit, true); }
          else { audio.pause(); showAudioToast(pit, false); }
          return;
        }
      }

      // Home base: leave the road and return to the home page.
      if (entry.kind === 'home') {
        interactBusy = true;
        stop(true, '/');
        return;
      }

      // Heading: scroll the underlying page to that section, then exit the game.
      if (entry.kind === 'heading') {
        interactBusy = true;
        var headingEl = entry.el;
        stop(false, null, function () {
          try { headingEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) {}
        });
        return;
      }

      // Cards (PDF/embed/link/etc): exit the game and click the underlying card so
      // the real modal opens on the actual page.
      interactBusy = true;
      var targetEl = entry.el;
      stop(false, null, function () {
        try {
          targetEl.scrollIntoView({ behavior: 'auto', block: 'center' });
          targetEl.click();
        } catch (_) {}
      });
    }

    // ---------- main loop ----------
    var lastT = performance.now();
    function loop(now) {
      var dt = Math.min(2, (now - lastT) / 16.667);
      lastT = now;

      // Update gradual steering input for keyboard
      var STEERING_SPEED = 0.8; // How fast steering responds (lower = slower, more realistic)
      var targetSteering = 0;
      if (arrowLeft && !arrowRight) {
        targetSteering = -1;
      } else if (arrowRight && !arrowLeft) {
        targetSteering = 1;
      }
      // Smoothly interpolate steering input
      var steeringDelta = targetSteering - steeringInput;
      steeringInput += steeringDelta * Math.min(1, STEERING_SPEED * dt);
      // Snap to zero when very close
      if (Math.abs(steeringInput) < 0.01) {
        steeringInput = 0;
      }

      // Keyboard arrow keys take precedence over mouse for throttle
      var currentThrottle = throttle;
      if (arrowUp || arrowDown) {
        if (arrowUp && !arrowDown) {
          currentThrottle = 1;
        } else if (arrowDown && !arrowUp) {
          currentThrottle = -1;
        } else {
          currentThrottle = 0; // Both pressed = cancel out
        }
      }

      // throttle / speed — asymptotic acceleration: no hard cap, just gets harder
      if (currentThrottle > 0) {
        var baseSpeed = 18; // Reference speed for acceleration curve
        // Use abs(speed) to handle negative speeds properly when switching from reverse
        var headroom = 1 / (1 + Math.pow(Math.abs(speed) / baseSpeed, ACCEL_FWD_TOP_FALLOFF));
        speed += ACCEL_FWD_BASE * headroom * dt;
      }
      else if (currentThrottle < 0) { speed -= ACCEL_REV * dt; if (speed < MAX_REV) speed = MAX_REV; }
      else {
        speed *= Math.pow(1 - COAST_DRAG, dt);
        if (Math.abs(speed) < 0.05) speed = 0;
      }
      if ((currentThrottle > 0 && speed < 0) || (currentThrottle < 0 && speed > 0)) {
        speed *= Math.pow(1 - BRAKE_DRAG, dt);
      }

      // Track top speed
      if (speed > topSpeed) topSpeed = speed;

      // drift blend
      var targetBlend = handbrake ? 1 : 0;
      var blendRate = handbrake ? 0.35 : DRIFT_RECOVER;
      driftBlend += (targetBlend - driftBlend) * Math.min(1, blendRate * dt);
      if (driftBlend < 0.001) driftBlend = 0;

      // car screen position - include road offset for accurate cursor tracking
      var roadOffsetAtCar = getRoadOffset(carY);
      var worldRect = world.getBoundingClientRect();
      var carScreenX = worldRect.left + ROAD_LEFT_OFFSET + (ROAD_WIDTH / 2) + carX + roadOffsetAtCar;
      var carScreenY = worldRect.top + carY;

      // steering — keyboard or mouse
      var desiredAngle;
      if (useKeyboardSteering) {
        // Keyboard mode: use gradual steering input with drift boost
        var BASE_TURN_RATE = 0.035;
        var driftBoost = 1 + (HANDBRAKE_TURN_BOOST - 1) * driftBlend;
        var MAX_TURN_RATE = BASE_TURN_RATE * driftBoost;
        var turnAmount = steeringInput * MAX_TURN_RATE * dt;
        desiredAngle = carAngle + turnAmount;
      } else {
        // Mouse steering: desired heading is always toward the cursor
        var dxm = mouseX - carScreenX;
        var dym = mouseY - carScreenY;
        desiredAngle = Math.atan2(dym, dxm);
      }
      var diff = desiredAngle - carAngle;
      while (diff >  Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      var speedRatio = Math.min(1, Math.abs(speed) / MAX_FWD);
      var turnRate = (TURN_BASE + (TURN_FAST - TURN_BASE) * speedRatio)
                     * (1 + (HANDBRAKE_TURN_BOOST - 1) * driftBlend);
      // Allow steering in keyboard mode even when coasting, or in mouse mode when throttling
      var canSteer = useKeyboardSteering || currentThrottle !== 0;
      var diffThreshold = useKeyboardSteering ? 0.001 : 0.02; // Lower threshold for gradual keyboard input

      if (canSteer && Math.abs(speed) > 0.05 && Math.abs(diff) > diffThreshold) {
        carAngle += Math.sign(diff) * Math.min(Math.abs(diff), turnRate * dt);
      }

      // drift physics
      var cosA = Math.cos(carAngle), sinA = Math.sin(carAngle);
      var fwd =  velX * cosA + velY * sinA;
      var lat = -velX * sinA + velY * cosA;
      var grip = GRIP + (HANDBRAKE_GRIP - GRIP) * driftBlend;
      var fwdTrack = FWD_TRACK + (HANDBRAKE_FWD_TRACK - FWD_TRACK) * driftBlend;
      var newFwd = fwd + (speed - fwd) * Math.min(1, fwdTrack * dt);
      var newLat = lat * Math.pow(1 - grip, dt);
      velX = cosA * newFwd - sinA * newLat;
      velY = sinA * newFwd + cosA * newLat;

      var nx = carX + velX * dt;
      var ny = carY + velY * dt;

      // Screen-edge horizontal boundaries - can drive as far as viewport allows
      var halfScreenWidth = window.innerWidth / 2;
      var minCarX = -halfScreenWidth + CAR_SIZE;
      var maxCarX = halfScreenWidth - CAR_SIZE;
      if (nx < minCarX) {
        nx = minCarX;
        velX *= -BUMP_RESTITUTION;
      } else if (nx > maxCarX) {
        nx = maxCarX;
        velX *= -BUMP_RESTITUTION;
      }

      // vertical wrap — seamless loop with road continuing
      if (ny < 0) {
        ny = ny + WORLD_HEIGHT;
      } else if (ny > WORLD_HEIGHT) {
        ny = ny - WORLD_HEIGHT;
      }

      // obstacle collisions - much more impactful
      for (var i = 0; i < obstacles.length; i++) {
        var ob = obstacles[i];
        if (ob.hit) continue;
        var ddx = nx - ob.x, ddy = ny - ob.y;
        var distSq = ddx * ddx + ddy * ddy;
        var rad = OBSTACLE_RADIUS + HITBOX_W / 2;
        if (distSq < rad * rad) {
          ob.hit = true;
          var mag = Math.hypot(velX, velY) || 1;
          ob.el.style.setProperty('--kx', (velX / mag * 90) + 'px');
          ob.el.style.setProperty('--ky', (velY / mag * 90 + 50) + 'px');
          ob.el.style.setProperty('--kr', (Math.random() * 720 - 360) + 'deg');
          ob.el.classList.add('rt-hit');
          (function (el) { setTimeout(function () { el.remove(); }, 580); }(ob.el));
          var d = Math.sqrt(distSq) || 1;
          nx -= (ddx / d) * 4;
          ny -= (ddy / d) * 4;
          // Much stronger impact - nearly stop the car
          speed *= 0.15;
          velX *= 0.2; velY *= 0.2;
          shakeUntil = now + 350;
        }
      }

      carX = nx; carY = ny;

      // drift smoke trail at rear wheels
      var velMag = Math.hypot(velX, velY);
      var driftMag = Math.abs(newLat);
      if (velMag > 1.5 && (handbrake || driftMag > 0.6)) {
        // throttle spawn rate
        if (!loop._smokeFrame) loop._smokeFrame = 0;
        loop._smokeFrame++;
        if (loop._smokeFrame % 2 === 0) {
          var rearOff  = CAR_SIZE * 0.38;
          var wheelOff = CAR_SIZE * 0.28;
          var smokeRoadOffset = getRoadOffset(carY);
          var bx = ROAD_LEFT_OFFSET + (ROAD_WIDTH / 2) + carX + smokeRoadOffset;
          var by = carY;
          var rxL = bx - cosA * rearOff - (-sinA) * wheelOff;
          var ryL = by - sinA * rearOff - ( cosA) * wheelOff;
          var rxR = bx - cosA * rearOff + (-sinA) * wheelOff;
          var ryR = by - sinA * rearOff + ( cosA) * wheelOff;
          var sz  = 8 + Math.random() * 8 + Math.min(6, driftMag);
          [[rxL, ryL], [rxR, ryR]].forEach(function (p) {
            var s = document.createElement('div');
            s.className = 'rt-smoke';
            s.style.left = p[0] + 'px';
            s.style.top  = p[1] + 'px';
            s.style.width = sz + 'px';
            s.style.height = sz + 'px';
            world.appendChild(s);
            setTimeout(function () { s.remove(); }, 920);
          });
        }
      }

      // render car with idle vibration
      var renderDeg = (carAngle * 180 / Math.PI) + 90;
      var shakeX = 0, shakeY = 0;
      if (now < shakeUntil) {
        var s = (shakeUntil - now) / 220;
        shakeX = (Math.random() - 0.5) * 6 * s;
        shakeY = (Math.random() - 0.5) * 6 * s;
      }
      // Add subtle idle vibration when stationary
      if (Math.abs(speed) < 0.5 && currentThrottle === 0) {
        var idleFreq = now * 0.015;
        shakeX += Math.sin(idleFreq) * IDLE_VIBRATION_AMOUNT;
        shakeY += Math.cos(idleFreq * 1.3) * IDLE_VIBRATION_AMOUNT * 0.7;
      }

      // Apply road curve offset to car position
      var roadOffsetAtCar = getRoadOffset(carY);
      carEl.style.left = (ROAD_LEFT_OFFSET + (ROAD_WIDTH / 2) + carX + roadOffsetAtCar - CAR_SIZE / 2) + 'px';
      carEl.style.top  = (carY - CAR_SIZE / 2) + 'px';
      carEl.style.transform = 'translate(' + shakeX + 'px,' + shakeY + 'px) rotate(' + renderDeg + 'deg)';

      // Update speed display
      var displaySpeed = Math.abs(speed);
      var mph = Math.round(displaySpeed * 5); // Scale to mph-like values
      speedHud.querySelector('.rt-speed-value').textContent = mph + ' mph';
      speedHud.querySelector('.rt-speed-top').textContent = 'Top: ' + Math.round(topSpeed * 5) + ' mph';

      // camera: keep car centered on screen, following both vertical and horizontal movement
      var camY = Math.max(0, Math.min(WORLD_HEIGHT - window.innerHeight, carY - window.innerHeight * 0.5));
      // Pan camera to keep car centered horizontally, accounting for road curves
      var camX = -carX - roadOffsetAtCar;
      world.style.transform = 'translate(calc(-50% + ' + camX + 'px), ' + (-camY) + 'px)';

      // pit-stop proximity (use each pit's on-road entry x, since pits sit off-road)
      var nearest = null, nearestDist = Infinity;
      for (var p = 0; p < pitStops.length; p++) {
        var pit = pitStops[p];
        var pdx = pit.enterX - carX;
        var pdy = pit.y - carY;
        var dd = Math.hypot(pdx, pdy);
        if (dd < INTERACT_RANGE) pit.node.classList.add('rt-near');
        else pit.node.classList.remove('rt-near');
        if (dd < nearestDist) { nearestDist = dd; nearest = pit; }
      }
      if (nearestDist < INTERACT_RANGE) {
        nearStop = nearest;
        interactHint.classList.add('rt-show');
      } else {
        nearStop = null;
        interactHint.classList.remove('rt-show');
      }

      // minimap
      var trackRect = mmTrack.getBoundingClientRect();
      var usable = trackRect.height;
      var carPct = Math.max(0, Math.min(1, carY / WORLD_HEIGHT));
      mmCar.style.top = (carPct * usable) + 'px';
      // distance to next pit stop ahead of car
      var ahead = null;
      for (var q = 0; q < pitStops.length; q++) {
        if (pitStops[q].y > carY + 10 && (!ahead || pitStops[q].y < ahead.y)) ahead = pitStops[q];
      }
      mmStops.forEach(function (d, idx) { d.classList.toggle('rt-near', pitStops[idx] === nearStop); });
      if (ahead) mmDist.textContent = Math.max(0, Math.round((ahead.y - carY) / 10)) + ' m';
      else if (pitStops.length) mmDist.textContent = Math.max(0, Math.round((pitStops[0].y + WORLD_HEIGHT - carY) / 10)) + ' m ↻';
      else mmDist.textContent = '';

      animId = requestAnimationFrame(loop);
    }
    animId = requestAnimationFrame(loop);

    // ---------- stop ----------
    var stopped = false;
    function stop(navigateAway, dest, onAfter) {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(animId);
      stage.style.animation = 'rt-stage-out 0.4s ease forwards';
      hud.style.transition = 'opacity .3s ease'; hud.style.opacity = '0';
      speedHud.style.transition = 'opacity .3s ease'; speedHud.style.opacity = '0';
      help.style.transition = 'opacity .3s ease'; help.style.opacity = '0';
      stopBtn.style.transition = 'opacity .3s ease'; stopBtn.style.opacity = '0';
      interactHint.style.transition = 'opacity .3s ease'; interactHint.style.opacity = '0';
      minimap.style.transition = 'opacity .3s ease'; minimap.style.opacity = '0';
      setTimeout(function () {
        stage.remove(); hud.remove(); speedHud.remove(); help.remove(); stopBtn.remove();
        interactHint.remove(); minimap.remove(); styleEl.remove();
        var leftover = document.getElementById('rt-overlay');
        if (leftover) leftover.remove();
        var toast = document.getElementById('rt-audio-toast');
        if (toast) toast.remove();
        document.body.style.userSelect = prevBodySelect;
        document.documentElement.style.overflow = prevHtmlOverflow;
        document.body.style.overflow = prevBodyOverflow;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mousedown', onMouseDown);
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('contextmenu', onContextMenu);
        document.removeEventListener('keydown', onKeyDown);
        document.removeEventListener('keyup', onKeyUp);
        window.removeEventListener('blur', onBlur);
        window.removeEventListener('resize', onResize);
        if (typeof onAfter === 'function') {
          try { onAfter(); } catch (_) {}
        }
        if (navigateAway && dest) window.location.href = dest;
      }, 420);
    }
  }

  window.RoadTrip = { activate: activate };
  // Backward-compat alias for old call sites that still reference DemolitionCar.
  window.DemolitionCar = { activate: activate };
})();
