/**
 * ColdSnap - Project Navigation JavaScript
 * 
 * This file handles all the dynamic functionality for the ColdSnap page
 */

// Current carousel state
let currentSlide = 0;
let totalSlides = 0;

// Zoom state
let zoomImages = [];
let currentZoomIndex = 0;

function stopProjectModalMedia(reset = false) {
  const modal = document.getElementById('projectModal');
  if (!modal) return;

  modal.querySelectorAll('video').forEach((video) => {
    video.pause();
    if (reset) {
      video.currentTime = 0;
    }
  });
}

function syncProjectModalMedia() {
  const slides = document.querySelectorAll('.carousel-slide');

  slides.forEach((slide, index) => {
    const video = slide.querySelector('video');
    if (!video) return;

    if (index === currentSlide) {
      video.play().catch((error) => console.log('Video autoplay failed:', error));
    } else {
      video.pause();
      video.currentTime = 0;
    }
  });
}

// Carousel functions
function initCarousel() {
  currentSlide = 0;
  updateCarousel();
}

function updateCarousel() {
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  const counter = document.querySelector('.carousel-counter');
  
  slides.forEach((slide, index) => {
    slide.classList.toggle('active', index === currentSlide);
  });

  syncProjectModalMedia();
  
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentSlide);
  });
  
  if (counter) {
    counter.textContent = `${currentSlide + 1} / ${totalSlides}`;
  }
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  updateCarousel();
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  updateCarousel();
}

function goToSlide(index) {
  currentSlide = index;
  updateCarousel();
}

// Zoom functions
function openZoom(imageSrc) {
  currentZoomIndex = zoomImages.indexOf(imageSrc);
  if (currentZoomIndex === -1) currentZoomIndex = 0;

  const zoomModal = document.getElementById('zoomModal');
  const zoomImage = document.getElementById('zoomImage');
  zoomImage.src = imageSrc;
  zoomModal.classList.add('active');
  document.body.style.overflow = 'hidden';

  const showNav = zoomImages.length > 1;
  document.querySelectorAll('.zoom-nav-btn').forEach(btn => {
    btn.style.display = showNav ? '' : 'none';
  });
}

function closeZoom() {
  const zoomModal = document.getElementById('zoomModal');
  zoomModal.classList.remove('active');
  // Only restore overflow if project modal is not open
  const projectModal = document.getElementById('projectModal');
  if (!projectModal.classList.contains('active')) {
    document.body.style.overflow = '';
  }
}

function nextZoom() {
  if (zoomImages.length <= 1) return;
  currentZoomIndex = (currentZoomIndex + 1) % zoomImages.length;
  document.getElementById('zoomImage').src = zoomImages[currentZoomIndex];
}

function prevZoom() {
  if (zoomImages.length <= 1) return;
  currentZoomIndex = (currentZoomIndex - 1 + zoomImages.length) % zoomImages.length;
  document.getElementById('zoomImage').src = zoomImages[currentZoomIndex];
}

// Modal functions
function openModal(projectId) {
  const project = COLDSNAP_PROJECTS.find(p => p.id === projectId);
  if (!project) return;
  
  const modal = document.getElementById('projectModal');
  const modalBody = document.getElementById('modalBody');
  const modalFooter = document.getElementById('modalFooter');

  stopProjectModalMedia(true);
  
  // Build carousel HTML for media
  let galleryHTML = '';
  if (project.media && project.media.length > 0) {
    totalSlides = project.media.length;
    
    zoomImages = project.media.filter(m => !m.endsWith('.mp4') && !m.endsWith('.webm'));

    const slides = project.media.map((item, index) => {
      if (item.endsWith('.mp4') || item.endsWith('.webm')) {
        return `<div class="carousel-slide ${index === 0 ? 'active' : ''}">
          <video src="${item}" controls autoplay muted loop playsinline preload="metadata"></video>
        </div>`;
      } else {
        return `<div class="carousel-slide ${index === 0 ? 'active' : ''}">
          <img src="${item}" alt="${project.title}" loading="lazy" onclick="openZoom('${item}')">
        </div>`;
      }
    }).join('');
    
    const dots = project.media.map((_, index) => 
      `<button class="carousel-dot ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></button>`
    ).join('');
    
    galleryHTML = `
      <div class="modal-carousel">
        <div class="carousel-container">
          ${slides}
          ${project.media.length > 1 ? `
            <button class="carousel-btn prev" onclick="prevSlide()"><i class="fa fa-chevron-left"></i></button>
            <button class="carousel-btn next" onclick="nextSlide()"><i class="fa fa-chevron-right"></i></button>
          ` : ''}
        </div>
        ${project.media.length > 1 ? `
          <div class="carousel-dots">${dots}</div>
          <div class="carousel-counter">1 / ${project.media.length}</div>
        ` : ''}
      </div>
    `;
  }
  
  let techHTML = '';
  if (project.tech && project.tech.length > 0) {
    techHTML = `
      <h3>Technologies</h3>
      <div class="modal-tech-stack">
        ${project.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
      </div>
    `;
  }
  
  let linksHTML = '';
  if (project.links && project.links.length > 0) {
    linksHTML = `
      <div class="modal-links">
        ${project.links.map((link, i) => `
          <a href="${link.href}" class="modal-link ${link.style ? link.style : (link.secondary ? 'secondary' : '')}" target="_blank" rel="noopener">
            ${link.icon ? `<i class="fa ${link.icon}"></i>` : ''}
            ${link.label}
          </a>
        `).join('')}
      </div>
    `;
  }
  
  modalBody.innerHTML = `
    <div class="modal-header">
      <span class="project-type">${project.type}</span>
      <h2>${project.title}</h2>
    </div>
    ${galleryHTML}
    <div class="modal-body">
      ${project.description ? `<p>${project.description}</p>` : ''}
      ${project.features ? `
        <h3>Features</h3>
        <ul>
          ${project.features.map(f => `<li>${f}</li>`).join('')}
        </ul>
      ` : ''}
      ${techHTML}
    </div>
  `;

  if (modalFooter) {
    modalFooter.innerHTML = linksHTML;
    modalFooter.classList.toggle('is-empty', !linksHTML);
  }
  
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // Initialize carousel
  if (project.media && project.media.length > 0) {
    initCarousel();
  }
}

function closeModal(event) {
  if (event && event.target !== event.currentTarget) return;
  
  const modal = document.getElementById('projectModal');
  stopProjectModalMedia(true);
  modal.classList.remove('active');
  const modalBody = document.getElementById('modalBody');
  const modalFooter = document.getElementById('modalFooter');
  if (modalBody) {
    modalBody.innerHTML = '';
  }
  if (modalFooter) {
    modalFooter.innerHTML = '';
    modalFooter.classList.add('is-empty');
  }
  document.body.style.overflow = '';
  currentSlide = 0;
  totalSlides = 0;
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
  const zoomActive = document.getElementById('zoomModal').classList.contains('active');

  if (event.key === 'Escape') {
    if (zoomActive) closeZoom();
    else closeModal();
  }
  if (event.key === 'ArrowRight') {
    if (zoomActive) nextZoom();
    else nextSlide();
  }
  if (event.key === 'ArrowLeft') {
    if (zoomActive) prevZoom();
    else prevSlide();
  }
});

// Render all projects
function renderProjects() {
  const container = document.getElementById('projects-container');
  
  // Check if projects data exists
  if (typeof COLDSNAP_PROJECTS === 'undefined' || COLDSNAP_PROJECTS.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa fa-folder-open-o"></i>
        <h3>No projects yet</h3>
        <p>Projects will appear here once added to the data file.</p>
      </div>
    `;
    return;
  }
  
  // Group projects by category
  const categories = {};
  COLDSNAP_PROJECTS.forEach(project => {
    const cat = project.category || 'Other';
    if (!categories[cat]) {
      categories[cat] = [];
    }
    categories[cat].push(project);
  });
  
  // Define section icons
  const sectionIcons = {
    'Interactive Installations': 'fa-desktop',
    'Games': 'fa-gamepad',
    'Flutter Apps': 'fa-mobile',
    'Web Platforms': 'fa-globe',
    'Open Source': 'fa-code',
    'Other': 'fa-folder'
  };
  
  // Define section descriptions
  const sectionDescriptions = {
    'Interactive Installations': 'Museum kiosks, training centre exhibits and large-format touchscreen experiences',
    'Games': 'PC and mobile games built for fun',
    'Flutter Apps': 'Cross-platform mobile, web, and desktop applications',
    'Web Platforms': 'Full-stack web applications and internal tools',
    'Open Source': 'Public tools, libraries and plugins'
  };
  
  // Build HTML for each category
  let html = '';
  
  Object.keys(categories).forEach(category => {
    const icon = sectionIcons[category] || 'fa-folder';
    const description = sectionDescriptions[category] || '';
    const sectionId = category.toLowerCase().replace(/\s+/g, '-');
    
    html += `
      <section class="project-section" id="${sectionId}">
        <div class="section-header">
          <h2><i class="fa ${icon}"></i> ${category}</h2>
          ${description ? `<p>${description}</p>` : ''}
        </div>
        <div class="project-grid">
          ${categories[category].map(project => createProjectCard(project)).join('')}
        </div>
      </section>
    `;
  });
  
  container.innerHTML = html;
}

// ============================================================
// Hero — Physics Card Table
// ============================================================

function initHeroCards() {
  if (window.matchMedia('(max-width: 768px)').matches) return;

  const table = document.getElementById('card-table');
  if (!table || typeof COLDSNAP_PROJECTS === 'undefined' || COLDSNAP_PROJECTS.length === 0) return;

  const CARD_W = 148;
  const CARD_H = 212;
  const BOUNCE = 0.15;
  const AIR_DAMP = 0.942;
  const ANG_DAMP = 0.86;
  const COLLISION_BOUNCE = 0.18;
  const COLLISION_MIN_SPEED = 0.75;
  const COLLISION_REST_SPEED = 1.35;
  const STACK_SETTLE_SPEED = 0.9;

  let W = table.clientWidth;
  let H = table.clientHeight;
  const launchTime = Date.now();
  const cards = [];
  let animId = null;
  let lastTs = 0;

  // ── Build cards ──────────────────────────────────────────
  COLDSNAP_PROJECTS.forEach((project, i) => {
    const el = document.createElement('div');
    el.className = 'physics-card is-face-down';
    el.dataset.projectId = project.id;
    el.title = `${project.title} — click to reveal`;

    const thumb = project.thumbnail
      ? `<img src="${project.thumbnail}" alt="${project.title}" draggable="false">`
      : `<div class="physics-card-icon">${project.icon || '🎮'}</div>`;

    el.innerHTML = `
      <div class="physics-card-inner">
        <div class="physics-card-face physics-card-back">
          <img src="/coldsnap/assets/coldnsap_logo.png" alt="" class="physics-card-back-mark" draggable="false">
        </div>
        <div class="physics-card-face physics-card-front">
          <div class="physics-card-thumb">${thumb}</div>
          <div class="physics-card-meta">
            <span class="physics-card-type">${project.type}</span>
            <h3 class="physics-card-title">${project.title}</h3>
          </div>
          <div class="physics-card-shine"></div>
        </div>
      </div>
    `;

    table.appendChild(el);

    const spreadAngle = Math.random() * Math.PI * 2;
    const speed = 9 + Math.random() * 7;
    const startX = W / 2 - CARD_W / 2 + (Math.random() - 0.5) * 40;
    const startY = H / 2 - CARD_H / 2 + (Math.random() - 0.5) * 40;
    const startAngle = (Math.random() - 0.5) * 50;

    const card = {
      el, project,
      x: startX,
      y: startY,
      vx: Math.cos(spreadAngle) * speed,
      vy: Math.sin(spreadAngle) * speed,
      angle: startAngle,
      angularVel: (Math.random() - 0.5) * 8,
      scale: 1.0,
      targetScale: 1.0,
      isDragging: false,
      targetX: startX, targetY: startY,
      dragOffX: 0, dragOffY: 0,
      grabX: CARD_W / 2, grabY: CARD_H / 2,
      originX: CARD_W / 2, originY: CARD_H / 2,
      prevDragVx: 0, prevDragVy: 0,
      revealed: false,
      delayMs: i * 55,
      active: false,
      zIndex: i + 1,
    };

    el.style.cssText = `left:${card.x}px;top:${card.y}px;z-index:${card.zIndex};transform:rotate(${card.angle}deg)`;
    cards.push(card);

    // ── Drag + click ─────────────────────────────────────
    let hasMoved = false;
    let dragStartX = 0, dragStartY = 0;

    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      card.isDragging = true;
      card.active = true;
      hasMoved = false;
      dragStartX = e.clientX;
      dragStartY = e.clientY;

      const tr = table.getBoundingClientRect();
      const localGrab = pointerToCardLocal(card, e.clientX - tr.left, e.clientY - tr.top);
      const oldTopLeft = localOffset(card, 0, 0);
      card.grabX = localGrab.x;
      card.grabY = localGrab.y;
      card.originX = localGrab.x;
      card.originY = localGrab.y;
      const newTopLeft = localOffset(card, 0, 0);
      card.dragOffX = localGrab.x;
      card.dragOffY = localGrab.y;
      card.x += oldTopLeft.x - newTopLeft.x;
      card.y += oldTopLeft.y - newTopLeft.y;
      card.targetX = card.x;
      card.targetY = card.y;
      card.vx = 0;
      card.vy = 0;
      card.angularVel = 0;
      card.prevDragVx = 0;
      card.prevDragVy = 0;
      card.targetScale = 1.15;
      el.style.transformOrigin = `${card.originX}px ${card.originY}px`;

      const maxZ = Math.max(...cards.map(c => c.zIndex));
      card.zIndex = maxZ + 1;
      el.style.zIndex = card.zIndex;
      el.classList.add('is-dragging');
    });

    el.addEventListener('pointermove', (e) => {
      if (!card.isDragging) return;
      if (Math.abs(e.clientX - dragStartX) > 5 || Math.abs(e.clientY - dragStartY) > 5) {
        hasMoved = true;
      }
      const tr = table.getBoundingClientRect();
      card.targetX = e.clientX - tr.left - card.dragOffX;
      card.targetY = e.clientY - tr.top - card.dragOffY;
    });

    const onRelease = () => {
      if (!card.isDragging) return;
      card.isDragging = false;
      el.classList.remove('is-dragging');

      if (!hasMoved) {
        resetCardOriginToCenter(card);
        card.targetScale = 1.0;
        if (!card.revealed) {
          card.revealed = true;
          el.classList.add('is-revealed');
          el.classList.remove('is-face-down');
          el.title = `${card.project.title} — click to open`;
          return;
        }
        openModal(card.project.id);
        return;
      }
      // Dampen throw momentum and add angular spin from direction
      resetCardOriginToCenter(card);
      card.vx *= 0.38;
      card.vy *= 0.38;
      card.angularVel += (card.vx * (CARD_H / 2 - card.grabY) - card.vy * (CARD_W / 2 - card.grabX)) * 0.01;
      card.angularVel += card.vx * 0.18;
      card.angularVel = clamp(card.angularVel, -18, 18);
      card.targetScale = 1.0;
    };

    el.addEventListener('pointerup', onRelease);
    el.addEventListener('pointercancel', onRelease);
  });

  // ── Hint ─────────────────────────────────────────────────
  const hint = document.createElement('div');
  hint.className = 'card-table-hint';
  hint.textContent = 'drag  ·  click to reveal';
  table.appendChild(hint);
  const hintDelay = COLDSNAP_PROJECTS.length * 130 + 2400;
  setTimeout(() => {
    hint.classList.add('visible');
    setTimeout(() => hint.classList.remove('visible'), 3200);
  }, hintDelay);

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function rotatePoint(x, y, angleDeg, scale) {
    const rad = angleDeg * Math.PI / 180;
    const cos = Math.cos(rad) * scale;
    const sin = Math.sin(rad) * scale;
    return {
      x: x * cos - y * sin,
      y: x * sin + y * cos,
    };
  }

  function localOffset(card, localX, localY) {
    const rotated = rotatePoint(
      localX - card.originX,
      localY - card.originY,
      card.angle,
      card.scale
    );
    return {
      x: card.originX + rotated.x,
      y: card.originY + rotated.y,
    };
  }

  function pointerToCardLocal(card, pointerX, pointerY) {
    const dx = pointerX - card.x - card.originX;
    const dy = pointerY - card.y - card.originY;
    const inv = rotatePoint(dx / card.scale, dy / card.scale, -card.angle, 1);
    return {
      x: clamp(card.originX + inv.x, 0, CARD_W),
      y: clamp(card.originY + inv.y, 0, CARD_H),
    };
  }

  function resetCardOriginToCenter(card) {
    const centerOffset = localOffset(card, CARD_W / 2, CARD_H / 2);
    card.x = card.x + centerOffset.x - CARD_W / 2;
    card.y = card.y + centerOffset.y - CARD_H / 2;
    card.originX = CARD_W / 2;
    card.originY = CARD_H / 2;
    card.targetX = card.x;
    card.targetY = card.y;
    card.el.style.transformOrigin = '50% 50%';
  }

  function renderCard(card) {
    card.el.style.left = card.x + 'px';
    card.el.style.top = card.y + 'px';
    card.el.style.transform = `rotate(${card.angle}deg) scale(${card.scale})`;
  }

  function cardSpeed(card) {
    return Math.hypot(card.vx, card.vy) + Math.abs(card.angularVel) * 0.08;
  }

  function cardCorners(card) {
    const points = [
      [0, 0],
      [CARD_W, 0],
      [CARD_W, CARD_H],
      [0, CARD_H],
    ];
    return points.map(([x, y]) => {
      const offset = localOffset(card, x, y);
      return {
        x: card.x + offset.x,
        y: card.y + offset.y,
      };
    });
  }

  function normalizeAxis(x, y) {
    const length = Math.hypot(x, y) || 1;
    return { x: x / length, y: y / length };
  }

  function collisionAxes(aCorners, bCorners) {
    return [
      normalizeAxis(aCorners[1].x - aCorners[0].x, aCorners[1].y - aCorners[0].y),
      normalizeAxis(aCorners[3].x - aCorners[0].x, aCorners[3].y - aCorners[0].y),
      normalizeAxis(bCorners[1].x - bCorners[0].x, bCorners[1].y - bCorners[0].y),
      normalizeAxis(bCorners[3].x - bCorners[0].x, bCorners[3].y - bCorners[0].y),
    ];
  }

  function projectCorners(corners, axis) {
    let min = Infinity;
    let max = -Infinity;
    corners.forEach(point => {
      const value = point.x * axis.x + point.y * axis.y;
      min = Math.min(min, value);
      max = Math.max(max, value);
    });
    return { min, max };
  }

  function resolveCardCollisions(dt) {
    for (let i = 0; i < cards.length; i++) {
      const a = cards[i];
      if (!a.active) continue;

      for (let j = i + 1; j < cards.length; j++) {
        const b = cards[j];
        if (!b.active) continue;

        const aSpeed = cardSpeed(a);
        const bSpeed = cardSpeed(b);
        const aMoving = a.isDragging || aSpeed > STACK_SETTLE_SPEED;
        const bMoving = b.isDragging || bSpeed > STACK_SETTLE_SPEED;
        if (!aMoving && !bMoving) continue;

        const aCorners = cardCorners(a);
        const bCorners = cardCorners(b);
        const axes = collisionAxes(aCorners, bCorners);
        let depth = Infinity;
        let normal = null;

        for (const axis of axes) {
          const aProjection = projectCorners(aCorners, axis);
          const bProjection = projectCorners(bCorners, axis);
          const overlap = Math.min(aProjection.max, bProjection.max) - Math.max(aProjection.min, bProjection.min);
          if (overlap <= 0) {
            normal = null;
            break;
          }
          if (overlap < depth) {
            depth = overlap;
            normal = axis;
          }
        }
        if (!normal) continue;

        const ax = a.x + CARD_W / 2;
        const ay = a.y + CARD_H / 2;
        const bx = b.x + CARD_W / 2;
        const by = b.y + CARD_H / 2;
        if ((bx - ax) * normal.x + (by - ay) * normal.y < 0) {
          normal = { x: -normal.x, y: -normal.y };
        }

        const invA = a.isDragging ? 0 : 1;
        const invB = b.isDragging ? 0 : 1;
        const invTotal = invA + invB;
        if (invTotal === 0) continue;

        const relVx = b.vx - a.vx;
        const relVy = b.vy - a.vy;
        const normalVel = relVx * normal.x + relVy * normal.y;
        if (normalVel > -COLLISION_MIN_SPEED) continue;

        const movingEnergy = Math.max(aSpeed, bSpeed);
        const restSoftener = movingEnergy < COLLISION_REST_SPEED ? 0.35 : 1;
        const impulse = -(1 + COLLISION_BOUNCE) * normalVel * restSoftener / invTotal;
        a.vx -= impulse * normal.x * invA;
        a.vy -= impulse * normal.y * invA;
        b.vx += impulse * normal.x * invB;
        b.vy += impulse * normal.y * invB;

        const tangentVel = relVx * -normal.y + relVy * normal.x;
        const spin = clamp(tangentVel * 0.08 + impulse * 0.018, -3.8, 3.8);
        a.angularVel -= spin * invA;
        b.angularVel += spin * invB;

        if (a.isDragging || b.isDragging) {
          const pushed = a.isDragging ? b : a;
          pushed.angularVel += (a.isDragging ? 1 : -1) * spin * 0.35 * dt;
        }
      }
    }
  }

  // ── Physics loop ─────────────────────────────────────────
  function loop(ts) {
    animId = requestAnimationFrame(loop);

    if (lastTs === 0) { lastTs = ts; return; }
    const rawDt = ts - lastTs;
    lastTs = ts;
    const dt = Math.min(rawDt / 16.67, 3);

    W = table.clientWidth;
    H = table.clientHeight;
    const elapsed = Date.now() - launchTime;

    cards.forEach((card) => {
      if (!card.active) {
        if (elapsed >= card.delayMs) card.active = true;
        else return;
      }

      // Spring drag — card follows mouse loosely
      if (card.isDragging) {
        const prevX = card.x;
        const prevY = card.y;
        const k = Math.min(0.38 * dt, 1);
        card.x += (card.targetX - card.x) * k;
        card.y += (card.targetY - card.y) * k;
        card.vx = (card.x - prevX) / dt;
        card.vy = (card.y - prevY) / dt;

        const accelX = card.vx - card.prevDragVx;
        const accelY = card.vy - card.prevDragVy;
        const lever = rotatePoint(CARD_W / 2 - card.grabX, CARD_H / 2 - card.grabY, card.angle, 1);
        const torque = lever.x * accelY - lever.y * accelX;
        card.angularVel += torque * 0.018;
        card.angularVel *= Math.pow(0.82, dt);
        card.angularVel = clamp(card.angularVel, -16, 16);
        card.angle += card.angularVel * dt;
        card.prevDragVx = card.vx;
        card.prevDragVy = card.vy;

        card.scale += (card.targetScale - card.scale) * Math.min(0.18 * dt, 1);
        return;
      }

      card.vx *= Math.pow(AIR_DAMP, dt);
      card.vy *= Math.pow(AIR_DAMP, dt);
      card.angularVel *= Math.pow(ANG_DAMP, dt);

      card.x += card.vx * dt;
      card.y += card.vy * dt;
      card.angle += card.angularVel * dt;

      // Top wall
      if (card.y < 0) {
        card.y = 0;
        card.vy = Math.abs(card.vy) * BOUNCE;
        card.angularVel *= -0.5;
      }
      // Bottom wall
      if (card.y + CARD_H > H) {
        card.y = H - CARD_H;
        card.vy = -Math.abs(card.vy) * BOUNCE;
        card.angularVel *= -0.5;
      }
      // Left wall
      if (card.x < 0) {
        card.x = 0;
        card.vx = Math.abs(card.vx) * BOUNCE;
        card.angularVel *= -0.5;
      }
      // Right wall
      if (card.x + CARD_W > W) {
        card.x = W - CARD_W;
        card.vx = -Math.abs(card.vx) * BOUNCE;
        card.angularVel *= -0.5;
      }

      if (Math.abs(card.angle) > 1080) card.angle %= 360;
      card.scale += (card.targetScale - card.scale) * Math.min(0.18 * dt, 1);
    });

    resolveCardCollisions(dt);
    cards.forEach(renderCard);
  }

  animId = requestAnimationFrame(loop);

  // Pause when hero is out of view
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      if (!animId) { lastTs = 0; animId = requestAnimationFrame(loop); }
    } else {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }, { threshold: 0 });
  observer.observe(table);

  window.addEventListener('resize', () => {
    if (window.matchMedia('(max-width: 768px)').matches) return;
    W = table.clientWidth;
    H = table.clientHeight;
    cards.forEach(card => {
      if (!card.active) return;
      card.x = Math.min(card.x, W - CARD_W);
      card.y = Math.min(card.y, H - CARD_H);
    });
  });
}

// Create a project card
function createProjectCard(project) {
  let thumbnailContent = '';
  
  if (project.thumbnail) {
    thumbnailContent = `<img src="${project.thumbnail}" alt="${project.title}" loading="lazy">`;
  } else if (project.icon) {
    thumbnailContent = `<div class="project-placeholder">${project.icon}</div>`;
  } else {
    thumbnailContent = `<div class="project-placeholder">🎮</div>`;
  }
  
  const techTags = project.tech ? 
    project.tech.slice(0, 3).map(t => `<span class="tech-tag">${t}</span>`).join('') : '';
  
  return `
    <div class="project-card" onclick="openModal('${project.id}')">
      <div class="project-thumbnail">
        ${thumbnailContent}
        <span class="project-type-badge">${project.type || 'Project'}</span>
      </div>
      <div class="project-info">
        <h3>${project.title}</h3>
        <p>${project.shortDescription || project.description?.substring(0, 120) + '...' || 'Click to learn more'}</p>
        <div class="project-tech">
          ${techTags}
        </div>
      </div>
    </div>
  `;
}
