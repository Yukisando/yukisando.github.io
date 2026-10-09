/**
 * ColdSnap - Site JavaScript
 *
 * Nav, project rendering + filters, project modal, the physics card table in the
 * hero, and small scroll effects. Text comes from js/i18n.js (CS_I18N).
 */

const i18n = window.CS_I18N;

// Privacy policies and other /apps/ pages live on nathandecastro.com, not coldsnap.fr.
function resolveHref(href) {
  return href.startsWith('/apps/') ? 'https://nathandecastro.com' + href : href;
}

function escapeAttr(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;');
}

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

// Card ⇄ popup animation
// A hero card flies up to the viewer and its cover swings open like a book to
// reveal the popup; closing plays it backwards and the card lands on its spot.
let modalCard = null;       // hero physics card the popup was opened from
let modalClosing = false;
let cardAnimations = [];

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function stopCardAnimations() {
  cardAnimations.forEach(animation => animation.cancel());
  cardAnimations = [];
  document.querySelectorAll('.card-flight').forEach(el => el.remove());
}

// Stand-in for the card that flies above the popup: its cover shows the
// project face, and the card back as the inside of the cover.
function buildCardFlight(cardEl) {
  const flight = document.createElement('div');
  flight.className = 'card-flight';
  flight.innerHTML = `
    <div class="card-flight-cover">
      <div class="physics-card-face physics-card-front">${cardEl.querySelector('.physics-card-front').innerHTML}</div>
      <div class="physics-card-face physics-card-back">${cardEl.querySelector('.physics-card-back').innerHTML}</div>
    </div>
  `;
  document.body.appendChild(flight);
  return flight;
}

// Transform that lays the stand-in exactly over the card on the table.
function cardTableTransform(card) {
  const rect = card.el.getBoundingClientRect();
  const x = rect.left + rect.width / 2 - card.el.offsetWidth / 2;
  const y = rect.top + rect.height / 2 - card.el.offsetHeight / 2;
  const angle = ((card.angle % 360) + 540) % 360 - 180;
  return `translate(${x}px, ${y}px) rotate(${angle}deg) scale(${card.scale})`;
}

// Where the card is held up in front of the viewer: centred and upright.
function cardStage(card) {
  const w = card.el.offsetWidth;
  const h = card.el.offsetHeight;
  const scale = Math.min(1.8, innerHeight * 0.5 / h, innerWidth * 0.5 / w);
  return {
    scale,
    transform: `translate(${innerWidth / 2 - w / 2}px, ${innerHeight / 2 - h / 2}px) rotate(0deg) scale(${scale})`,
  };
}

// Clips the popup down to the held-up card, so it reads as the card's inside.
function cardClipPath(panel, card, stage) {
  const rect = panel.getBoundingClientRect();
  const w = card.el.offsetWidth * stage.scale;
  const h = card.el.offsetHeight * stage.scale;
  const left = Math.max(0, innerWidth / 2 - w / 2 - rect.left);
  const top = Math.max(0, innerHeight / 2 - h / 2 - rect.top);
  const right = Math.max(0, rect.width - left - w);
  const bottom = Math.max(0, rect.height - top - h);
  return `inset(${top}px ${right}px ${bottom}px ${left}px round ${14 * stage.scale}px)`;
}

function playCardOpen(card) {
  stopCardAnimations();
  const modal = document.getElementById('projectModal');
  const panel = modal.querySelector('.modal-content');
  const flight = buildCardFlight(card.el);
  const cover = flight.querySelector('.card-flight-cover');
  const stage = cardStage(card);
  const cardClip = cardClipPath(panel, card, stage);
  const fly = 420;
  const swing = 560;
  const total = fly + swing;
  card.el.style.visibility = 'hidden';

  const animations = [
    modal.animate([{ opacity: 0 }, { opacity: 1 }], { duration: fly, easing: 'ease-out' }),
    flight.animate([
      { transform: cardTableTransform(card) },
      { transform: stage.transform },
    ], { duration: fly, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'forwards' }),
    // Fades go on the flight, not the cover: opacity on the cover would flatten
    // its 3D and show the front face mirrored instead of the card back.
    cover.animate([
      { transform: 'rotateY(0deg)' },
      { transform: 'rotateY(-180deg)', offset: 0.65 },
      { transform: 'rotateY(-180deg)' },
    ], { delay: fly, duration: swing, easing: 'cubic-bezier(0.45, 0, 0.2, 1)', fill: 'backwards' }),
    flight.animate([
      { opacity: 1 },
      { opacity: 1, offset: 0.65 },
      { opacity: 0 },
    ], { delay: fly, duration: swing, easing: 'cubic-bezier(0.45, 0, 0.2, 1)', fill: 'forwards' }),
    panel.animate([
      { opacity: 0, clipPath: cardClip },
      { opacity: 0, clipPath: cardClip, offset: fly / total },
      { opacity: 1, clipPath: cardClip, offset: fly / total },
      { opacity: 1, clipPath: cardClip, offset: (fly + swing * 0.3) / total, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
      { opacity: 1, clipPath: 'inset(0px 0px 0px 0px round 20px)' },
    ], { duration: total }),
  ];
  cardAnimations = animations;

  Promise.all(animations.map(animation => animation.finished)).then(() => {
    if (cardAnimations === animations) stopCardAnimations();
  }).catch(() => {});
}

function playCardClose(card) {
  stopCardAnimations();
  const modal = document.getElementById('projectModal');
  const panel = modal.querySelector('.modal-content');
  const flight = buildCardFlight(card.el);
  const cover = flight.querySelector('.card-flight-cover');
  const stage = cardStage(card);
  const cardClip = cardClipPath(panel, card, stage);
  const shrink = 260;
  const swing = 300;
  const fly = 380;
  const total = shrink + swing + fly;
  const shrunk = shrink / total;
  const closed = (shrink + swing) / total;
  const options = { duration: total, fill: 'both' };

  cardAnimations = [
    modal.animate([
      { opacity: 1 },
      { opacity: 1, offset: closed, easing: 'ease-in' },
      { opacity: 0 },
    ], options),
    panel.animate([
      { opacity: 1, clipPath: 'inset(0px 0px 0px 0px round 20px)', easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
      { opacity: 1, clipPath: cardClip, offset: shrunk },
      { opacity: 1, clipPath: cardClip, offset: closed },
      { opacity: 0, clipPath: cardClip, offset: closed },
      { opacity: 0, clipPath: cardClip },
    ], options),
    cover.animate([
      { transform: 'rotateY(-180deg)' },
      { transform: 'rotateY(-180deg)', offset: shrunk, easing: 'cubic-bezier(0.5, 0, 0.3, 1)' },
      { transform: 'rotateY(0deg)', offset: closed },
      { transform: 'rotateY(0deg)' },
    ], options),
    flight.animate([
      { transform: stage.transform, opacity: 0 },
      { transform: stage.transform, opacity: 0, offset: shrunk * 0.4 },
      { transform: stage.transform, opacity: 1, offset: shrunk },
      { transform: stage.transform, opacity: 1, offset: closed, easing: 'cubic-bezier(0.3, 0, 0.2, 1)' },
      { transform: cardTableTransform(card), opacity: 1 },
    ], options),
  ];

  return Promise.all(cardAnimations.map(animation => animation.finished));
}

// Modal functions
// `projectRef` is a project id, or a project object (the easter-egg wizard card isn't in the data).
function openModal(projectRef, fromCard) {
  const project = typeof projectRef === 'object'
    ? projectRef
    : COLDSNAP_PROJECTS.find(p => p.id === projectRef);
  if (!project) return;
  const field = name => i18n.field(project, name);

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
          <img src="${item}" alt="${escapeAttr(project.title)}" loading="lazy" onclick="openZoom('${escapeAttr(item)}')">
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
      <h3>${i18n.t('modal.tech')}</h3>
      <div class="modal-tech-stack">
        ${project.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
      </div>
    `;
  }
  
  let linksHTML = '';
  if (project.links && project.links.length > 0) {
    linksHTML = `
      <div class="modal-links">
        ${project.links.map(link => {
          const external = !link.href.startsWith('mailto:');
          return `
          <a href="${escapeAttr(resolveHref(link.href))}" class="modal-link ${link.style ? link.style : (link.secondary ? 'secondary' : '')}"${external ? ' target="_blank" rel="noopener"' : ''}>
            ${link.icon ? `<i class="fa ${link.icon}" aria-hidden="true"></i>` : ''}
            ${i18n.lang === 'fr' && link.labelFr ? link.labelFr : link.label}
          </a>
        `;
        }).join('')}
      </div>
    `;
  }

  const description = field('description');
  const features = field('features');

  modalBody.innerHTML = `
    <div class="modal-header">
      <span class="project-type">${field('type')}</span>
      <h2>${field('title')}</h2>
    </div>
    ${galleryHTML}
    <div class="modal-body">
      ${description ? `<p>${description}</p>` : ''}
      ${features ? `
        <h3>${i18n.t('modal.features')}</h3>
        <ul>
          ${features.map(f => `<li>${f}</li>`).join('')}
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

  modalCard = fromCard || null;
  if (modalCard && !prefersReducedMotion()) playCardOpen(modalCard);
}

function closeModal(event) {
  if (event && event.target !== event.currentTarget) return;
  if (modalClosing) return;

  const modal = document.getElementById('projectModal');
  if (!modal.classList.contains('active')) return;
  stopProjectModalMedia(true);

  const card = modalCard;
  modalCard = null;
  if (card && !prefersReducedMotion()) {
    modalClosing = true;
    playCardClose(card).then(() => {
      resetModal();
      stopCardAnimations();
    }, () => {}).finally(() => {
      modalClosing = false;
      card.el.style.visibility = '';
    });
    return;
  }
  if (card) card.el.style.visibility = '';
  stopCardAnimations();
  resetModal();
}

function resetModal() {
  const modal = document.getElementById('projectModal');
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
  const modalActive = document.getElementById('projectModal').classList.contains('active');
  if (!zoomActive && !modalActive) return;

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

// Work section: filters, featured case study and project grid
const CATEGORY_ICONS = {
  'Interactive Installations': 'fa-desktop',
  'Games': 'fa-gamepad',
  'Flutter Apps': 'fa-mobile',
  'Web Platforms': 'fa-globe',
  'Open Source': 'fa-code'
};
let activeFilter = 'all';

function renderFilters() {
  const filters = document.getElementById('workFilters');
  if (!filters) return;
  const categories = [...new Set(COLDSNAP_PROJECTS.map(p => p.category || 'Other'))];
  const counts = { all: COLDSNAP_PROJECTS.length };
  COLDSNAP_PROJECTS.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });

  filters.innerHTML = ['all', ...categories].map(cat => `
    <button type="button" class="filter${cat === activeFilter ? ' is-active' : ''}" data-filter="${escapeAttr(cat)}" aria-pressed="${cat === activeFilter}">
      ${i18n.t('filter.' + cat)} <span class="filter__count">${counts[cat]}</span>
    </button>
  `).join('');

  filters.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });
}

function setFilter(category) {
  activeFilter = category;
  renderFilters();
  renderProjects();
}

function renderProjects() {
  const container = document.getElementById('projects-container');

  if (typeof COLDSNAP_PROJECTS === 'undefined' || COLDSNAP_PROJECTS.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa fa-folder-open-o"></i>
        <h3>No projects yet</h3>
      </div>
    `;
    return;
  }

  const visible = COLDSNAP_PROJECTS.filter(p => activeFilter === 'all' || p.category === activeFilter);
  const featured = visible.find(p => p.featured);
  const rest = visible.filter(p => p !== featured);

  container.innerHTML = `
    ${featured ? createFeaturedCard(featured) : ''}
    <div class="project-grid">
      ${rest.map(createProjectCard).join('')}
    </div>
  `;
}


function createFeaturedCard(project) {
  const field = name => i18n.field(project, name);
  const stats = (project.stats || []).map(s => `
    <div class="featured__stat">
      <strong>${s.value}</strong>
      <span>${i18n.lang === 'fr' && s.fr ? s.fr : s.label}</span>
    </div>
  `).join('');

  return `
    <article class="featured" >
      <button type="button" class="featured__media" onclick="openModal('${project.id}')" aria-label="${escapeAttr(i18n.t('work.open') + ': ' + project.title)}">
        <img src="${project.thumbnail}" alt="" loading="lazy">
      </button>
      <div class="featured__body">
        <div class="featured__meta">
          <span class="featured__label">${i18n.t('work.featured')}</span>
        </div>
        <h3>${project.title}</h3>
        <p>${field('description').split('. ').slice(0, 2).join('. ')}.</p>
        <div class="featured__stats">${stats}</div>
        <button type="button" class="btn btn--ghost" onclick="openModal('${project.id}')">
          ${i18n.t('work.open')} <i class="fa fa-arrow-right" aria-hidden="true"></i>
        </button>
      </div>
    </article>
  `;
}

// ============================================================
// Hero — Physics Card Table
// ============================================================

function initHeroCards() {
  if (window.matchMedia(HERO_TABLE_QUERY).matches) return;

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
  const DRAG_SPRING = 0.16;
  const DRAG_DAMPING = 0.24;
  const DRAG_TORQUE = 0.0032;
  const heldCardCollides = false;

  let W = table.clientWidth;
  let H = table.clientHeight;
  const launchTime = Date.now();
  const cards = [];
  let animId = null;
  let lastTs = 0;

  let frozen = false;

  function cardTitle(card) {
    return `${card.project.title} — ${i18n.t(card.revealed ? 'card.open' : 'card.reveal')}`;
  }

  function revealCard(card) {
    if (card.revealed) return;
    card.revealed = true;
    card.el.classList.add('is-revealed');
    card.el.classList.remove('is-face-down');
    card.el.title = cardTitle(card);
    if (cards.every(c => c.revealed)) {
      document.dispatchEvent(new CustomEvent('coldsnap:all-revealed'));
    }
  }

  // ── Build cards ──────────────────────────────────────────
  // `delayMs` is measured from launch; `extraClass` styles special cards (the wizard).
  function spawnCard(project, delayMs, extraClass = '') {
    const el = document.createElement('div');
    el.className = `physics-card is-face-down is-airborne ${extraClass}`.trim();
    el.dataset.projectId = project.id;

    const thumb = project.thumbnail
      ? `<img src="${project.thumbnail}" alt="" draggable="false">`
      : `<div class="physics-card-icon">${project.icon || '🎮'}</div>`;

    el.innerHTML = `
      <div class="physics-card-inner">
        <div class="physics-card-face physics-card-back">
          <img src="assets/coldnsap_logo.png" alt="" class="physics-card-back-mark" draggable="false">
        </div>
        <div class="physics-card-face physics-card-front">
          <div class="physics-card-thumb">${thumb}</div>
          <div class="physics-card-meta">
            <span class="physics-card-type">${i18n.field(project, 'type')}</span>
            <h3 class="physics-card-title">${i18n.field(project, 'title')}</h3>
          </div>
          <div class="physics-card-shine"></div>
        </div>
      </div>
    `;

    table.appendChild(el);

    // Toss each card onto a random spot, lifted (scaled up) so it drops as it
    // flies off in a random direction. Paths cross, so the cards knock into
    // each other on the way.
    const startX = Math.random() * Math.max(0, W - CARD_W);
    const startY = Math.random() * Math.max(0, H - CARD_H);
    const tossAngle = Math.random() * Math.PI * 2;
    const speed = 12 + Math.random() * 10;
    const startAngle = (Math.random() - 0.5) * 70;
    const zIndex = cards.length ? Math.max(...cards.map(c => c.zIndex)) + 1 : 1;

    const card = {
      el, project,
      x: startX,
      y: startY,
      vx: Math.cos(tossAngle) * speed,
      vy: Math.sin(tossAngle) * speed,
      angle: startAngle,
      angularVel: (Math.random() - 0.5) * 16,
      scale: 1.25,
      targetScale: 1.0,
      isDragging: false,
      targetX: startX, targetY: startY,
      dragOffX: 0, dragOffY: 0,
      grabX: CARD_W / 2, grabY: CARD_H / 2,
      originX: CARD_W / 2, originY: CARD_H / 2,
      pointerX: startX + CARD_W / 2, pointerY: startY + CARD_H / 2,
      prevDragVx: 0, prevDragVy: 0,
      revealed: false,
      delayMs,
      active: false,
      zIndex,
    };

    el.title = cardTitle(card);
    el.style.cssText = `left:${card.x}px;top:${card.y}px;z-index:${card.zIndex};transform:rotate(${card.angle}deg) scale(${card.scale})`;
    cards.push(card);

    // ── Drag + click ─────────────────────────────────────
    let hasMoved = false;
    let dragStartX = 0, dragStartY = 0;

    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (frozen) return;
      el.setPointerCapture(e.pointerId);
      card.isDragging = true;
      card.active = true;
      hasMoved = false;
      dragStartX = e.clientX;
      dragStartY = e.clientY;

      const tr = table.getBoundingClientRect();
      card.pointerX = e.clientX - tr.left;
      card.pointerY = e.clientY - tr.top;
      resetCardOriginToCenter(card);
      const localGrab = pointerToCardLocal(card, card.pointerX, card.pointerY);
      card.grabX = localGrab.x;
      card.grabY = localGrab.y;
      card.dragOffX = localGrab.x;
      card.dragOffY = localGrab.y;
      updateDragTarget(card);
      card.vx = 0;
      card.vy = 0;
      card.angularVel = 0;
      card.prevDragVx = 0;
      card.prevDragVy = 0;
      card.targetScale = 1.15;

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
      card.pointerX = e.clientX - tr.left;
      card.pointerY = e.clientY - tr.top;
      updateDragTarget(card);
    });

    const onRelease = () => {
      if (!card.isDragging) return;
      card.isDragging = false;
      el.classList.remove('is-dragging');

      if (!hasMoved) {
        resetCardOriginToCenter(card);
        card.targetScale = 1.0;
        if (!card.revealed) {
          revealCard(card);
          return;
        }
        if (card.project.drive && window.CS_DRIVE) {
          window.CS_DRIVE.start(card);
          return;
        }
        openModal(card.project, card);
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
    return card;
  }

  COLDSNAP_PROJECTS.forEach((project, i) => spawnCard(project, i * 55));

  i18n.onChange(() => {
    cards.forEach(card => {
      card.el.querySelector('.physics-card-type').textContent = i18n.field(card.project, 'type');
      card.el.title = cardTitle(card);
    });
  });

  // Hooks for js/easter-eggs.js
  window.coldsnapDeck = {
    get cards() { return cards; },
    addCard(project, extraClass) {
      return spawnCard(project, Date.now() - launchTime, extraClass);
    },
    revealAll() {
      cards.forEach((card, i) => setTimeout(() => revealCard(card), i * 60));
    },
    // Fling every card in a random direction.
    shuffle() {
      if (frozen) return;
      cards.forEach(card => {
        if (card.isDragging) return;
        const angle = Math.random() * Math.PI * 2;
        const speed = 14 + Math.random() * 14;
        card.active = true;
        card.vx = Math.cos(angle) * speed;
        card.vy = Math.sin(angle) * speed;
        card.angularVel = (Math.random() - 0.5) * 30;
      });
    },
    // Shove cards near a viewport point (the drive-mode car).
    push(clientX, clientY, vx, vy, radius = 120) {
      if (frozen) return;
      const tr = table.getBoundingClientRect();
      const px = clientX - tr.left;
      const py = clientY - tr.top;
      cards.forEach(card => {
        if (card.isDragging || !card.active || card.el.classList.contains('is-driven-away')) return;
        const dx = card.x + CARD_W / 2 - px;
        const dy = card.y + CARD_H / 2 - py;
        if (Math.hypot(dx, dy) > radius) return;
        card.vx = clamp(card.vx + vx * 0.5, -22, 22);
        card.vy = clamp(card.vy + vy * 0.5, -22, 22);
        card.angularVel = clamp(card.angularVel + (Math.random() - 0.5) * 3, -14, 14);
      });
    },
    setFrozen(value) {
      frozen = value;
      cards.forEach(card => {
        card.isDragging = false;
        card.el.classList.remove('is-dragging');
        if (value) { card.vx = 0; card.vy = 0; card.angularVel = 0; }
      });
      table.classList.toggle('is-frozen', value);
    },
  };

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

  function updateDragTarget(card) {
    const grabOffset = localOffset(card, card.grabX, card.grabY);
    card.targetX = card.pointerX - grabOffset.x;
    card.targetY = card.pointerY - grabOffset.y;
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
        if (!heldCardCollides && (a.isDragging || b.isDragging)) continue;

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

    if (frozen) return;

    cards.forEach((card) => {
      if (!card.active) {
        if (elapsed < card.delayMs) return;
        card.active = true;
        card.el.classList.remove('is-airborne');
      }

      // Spring drag — card follows mouse loosely
      if (card.isDragging) {
        const prevX = card.x;
        const prevY = card.y;
        updateDragTarget(card);

        const grabOffset = localOffset(card, card.grabX, card.grabY);
        const grabWorldX = card.x + grabOffset.x;
        const grabWorldY = card.y + grabOffset.y;
        const errorX = card.pointerX - grabWorldX;
        const errorY = card.pointerY - grabWorldY;
        const forceX = errorX * DRAG_SPRING - card.vx * DRAG_DAMPING;
        const forceY = errorY * DRAG_SPRING - card.vy * DRAG_DAMPING;
        const lever = rotatePoint(
          card.grabX - CARD_W / 2,
          card.grabY - CARD_H / 2,
          card.angle,
          card.scale
        );

        card.vx += forceX * dt;
        card.vy += forceY * dt;
        card.x += card.vx * dt;
        card.y += card.vy * dt;
        card.vx = (card.x - prevX) / dt;
        card.vy = (card.y - prevY) / dt;

        const torque = lever.x * forceY - lever.y * forceX;
        card.angularVel += torque * DRAG_TORQUE * dt;
        card.angularVel *= Math.pow(0.84, dt);
        card.angularVel = clamp(card.angularVel, -14, 14);
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

  // Every few seconds one card half-turns and drops back, as if peeking at its other side.
  function teaseOneCard() {
    if (frozen || !animId || document.hidden) return;
    const idle = cards.filter(c => c.active && !c.isDragging && !c.el.classList.contains('is-driven-away'));
    if (!idle.length) return;
    const card = idle[Math.floor(Math.random() * idle.length)];
    const base = card.revealed ? 180 : 0;
    const peak = base + (Math.random() < 0.5 ? -1 : 1) * (55 + Math.random() * 15);
    card.el.querySelector('.physics-card-inner').animate([
      { transform: `rotateY(${base}deg)` },
      { transform: `rotateY(${peak}deg)`, offset: 0.4 },
      { transform: `rotateY(${base}deg)` }
    ], { duration: 1000, easing: 'ease-in-out' });
  }
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    (function scheduleNudge() {
      setTimeout(() => { teaseOneCard(); scheduleNudge(); }, 2500 + Math.random() * 3500);
    })();
  }

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
    if (window.matchMedia(HERO_TABLE_QUERY).matches) return;
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
  const field = name => i18n.field(project, name);
  const thumbnailContent = project.thumbnail
    ? `<img src="${project.thumbnail}" alt="" loading="lazy">`
    : `<div class="project-placeholder">${project.icon || '🎮'}</div>`;

  const techTags = project.tech
    ? project.tech.slice(0, 3).map(t => `<span class="tech-tag">${t}</span>`).join('')
    : '';
  const icon = CATEGORY_ICONS[project.category] || 'fa-folder';

  return `
    <button type="button" class="project-card" onclick="openModal('${project.id}')">
      <span class="project-thumbnail">
        ${thumbnailContent}
      </span>
      <span class="project-info">
        <span class="project-type"><i class="fa ${icon}" aria-hidden="true"></i> ${field('type') || 'Project'}</span>
        <span class="project-title">${project.title}</span>
        <span class="project-desc">${field('shortDescription') || ''}</span>
        <span class="project-tech">${techTags}</span>
      </span>
    </button>
  `;
}

// ============================================================
// Page wiring
// ============================================================

// Below this width the hero drops the physics table.
const HERO_TABLE_QUERY = '(max-width: 900px)';

function initNav() {
  const nav = document.querySelector('.cs-nav');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const setOpen = open => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };
  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));

  // Highlight the section in view
  const sections = [...links.querySelectorAll('a[href^="#"]')]
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.querySelectorAll('a').forEach(a => {
        a.classList.toggle('is-current', a.getAttribute('href') === '#' + entry.target.id);
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(section => spy.observe(section));

}

// Count stats up from zero the first time they scroll into view.
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const format = n => n.toLocaleString(i18n.lang === 'fr' ? 'fr-FR' : 'en-GB');
  counters.forEach(el => { el.textContent = format(Number(el.dataset.count)); });
  if (prefersReducedMotion()) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      const el = entry.target;
      const target = Number(el.dataset.count);
      const start = performance.now();
      const duration = 1200;
      const tick = now => {
        const t = Math.min(1, (now - start) / duration);
        el.textContent = format(Math.round(target * (1 - Math.pow(1 - t, 3))));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  counters.forEach(el => observer.observe(el));

  i18n.onChange(() => counters.forEach(el => { el.textContent = format(Number(el.dataset.count)); }));
}

// Fade sections in as they scroll into view.
function initReveal() {
  const targets = document.querySelectorAll('.section-head, .stat, .step, .contact__card');
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) return;
  targets.forEach(el => el.classList.add('reveal'));
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15 });
  targets.forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  initNav();
  renderFilters();
  renderProjects();
  initHeroCards();
  initCounters();
  initReveal();

  i18n.onChange(() => {
    renderFilters();
    renderProjects();
  });
});
