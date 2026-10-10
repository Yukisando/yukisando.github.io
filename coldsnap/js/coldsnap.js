/**
 * ColdSnap - Site JavaScript
 *
 * Nav, the project viewer, shelf and filters, the project popup, the physics card table in the
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
  const media = field('media');
  let galleryHTML = '';
  if (media && media.length > 0) {
    totalSlides = media.length;
    
    zoomImages = media.filter(m => !m.endsWith('.mp4') && !m.endsWith('.webm'));

    const slides = media.map((item, index) => {
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
    
    const dots = media.map((_, index) => 
      `<button class="carousel-dot ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></button>`
    ).join('');
    
    galleryHTML = `
      <div class="modal-carousel">
        <div class="carousel-container">
          ${slides}
          ${media.length > 1 ? `
            <button class="carousel-btn prev" onclick="prevSlide()"><i class="fa fa-chevron-left"></i></button>
            <button class="carousel-btn next" onclick="nextSlide()"><i class="fa fa-chevron-right"></i></button>
          ` : ''}
        </div>
        ${media.length > 1 ? `
          <div class="carousel-dots">${dots}</div>
          <div class="carousel-counter">1 / ${media.length}</div>
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
  if (media && media.length > 0) {
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

// ============================================================
// Work: project viewer + shelf
// ============================================================
// The viewer shows one project in full: media you can flick through, the story,
// figures and every link. The shelf below holds all the projects as cards;
// clicking one deals it into the viewer. The shelf starts folded, fading out
// under its first row, until you ask for the rest.
// (Cards on the hero table still open the popup, with their book animation.)

const CATEGORY_ICONS = {
  'Interactive Installations': 'fa-desktop',
  'Games': 'fa-gamepad',
  'Flutter Apps': 'fa-mobile',
  'Web Platforms': 'fa-globe',
  'Open Source': 'fa-code'
};
let activeFilter = 'all';
let activeProjectId = null;
let viewerMedia = [];
let viewerMediaIndex = 0;
let viewerFlip = 0;
let viewerExpanded = false;
let shelfOpen = false;

const isVideo = src => /\.(mp4|webm)$/i.test(src);
// Light copies made by tools/coldsnap-media.py; the originals are kept for the zoom.
const mediaVariant = (src, suffix) => src.replace(/\.[a-z0-9]+$/i, '-' + suffix);

// A project can swap in its own French screenshots (fr.media, fr.thumbnail).
function projectMedia(project) {
  const media = i18n.field(project, 'media');
  const thumbnail = i18n.field(project, 'thumbnail');
  if (media && media.length) {
    return media.map(src => isVideo(src)
      ? { video: true, src: mediaVariant(src, 'view.mp4'), full: src, view: mediaVariant(src, 'view.webp'), mini: mediaVariant(src, 'mini.webp') }
      : { src, full: src, view: mediaVariant(src, 'view.webp'), mini: mediaVariant(src, 'mini.webp') });
  }
  return thumbnail ? [{ src: thumbnail, full: thumbnail, view: thumbnail, mini: thumbnail }] : [];
}

function visibleProjects() {
  return COLDSNAP_PROJECTS.filter(p => activeFilter === 'all' || p.category === activeFilter);
}

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
  const list = visibleProjects();
  if (list.some(p => p.id === activeProjectId)) {
    renderViewer();
  } else if (list.length) {
    showProject((list.find(p => p.featured) || list[0]).id, { animate: true });
  }
  renderShelf();
}

// Builds the viewer and shelf once; later calls (language change) just refill them.
function renderWork() {
  const container = document.getElementById('projects-container');
  if (!container) return;

  if (typeof COLDSNAP_PROJECTS === 'undefined' || COLDSNAP_PROJECTS.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa fa-folder-open-o"></i>
        <h3>No projects yet</h3>
      </div>
    `;
    return;
  }

  if (!document.getElementById('projectViewer')) {
    container.innerHTML = `
      <article class="viewer" id="projectViewer" tabindex="-1"></article>
      <div class="shelf" id="projectShelf">
        <div class="project-grid" id="projectGrid"></div>
        <div class="shelf__fold">
          <button type="button" class="btn btn--ghost shelf__toggle" id="shelfToggle" aria-expanded="false" aria-controls="projectGrid"></button>
        </div>
      </div>
    `;
    initViewer();
    initShelf();
  }

  if (!activeProjectId) {
    const asked = new URLSearchParams(location.search).get('project');
    const start = COLDSNAP_PROJECTS.find(p => p.id === asked)
      || COLDSNAP_PROJECTS.find(p => p.featured)
      || COLDSNAP_PROJECTS[0];
    activeProjectId = start.id;
    if (start.id === asked) {
      requestAnimationFrame(() => document.getElementById('work').scrollIntoView());
    }
  }
  renderViewer();
  renderShelf();
}

function showProject(id, { animate = false, scroll = false, direction = 1 } = {}) {
  const project = COLDSNAP_PROJECTS.find(p => p.id === id);
  const viewer = document.getElementById('projectViewer');
  if (!project || !viewer) return;
  const changed = id !== activeProjectId;
  activeProjectId = id;
  viewerMediaIndex = 0;
  if (changed) viewerExpanded = false;
  markActiveCard();

  // ?project=<id> makes the current project shareable.
  const url = new URL(location.href);
  url.searchParams.set('project', id);
  history.replaceState(null, '', url);

  if (scroll) {
    const top = viewer.getBoundingClientRect().top;
    if (top < 0 || top > innerHeight * 0.35) {
      viewer.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    }
  }

  // Keep keyboard focus on the pager when stepping through projects with it.
  const step = document.activeElement && viewer.contains(document.activeElement)
    ? document.activeElement.dataset.step
    : null;
  const swap = () => {
    renderViewer();
    if (step) {
      const again = viewer.querySelector(`[data-step="${step}"]`);
      if (again) again.focus();
    }
  };

  if (!animate || !changed || prefersReducedMotion() || !viewer.animate) {
    swap();
    return;
  }

  // Deal the new project like a card: the viewer turns over and comes back up with the new face.
  const token = ++viewerFlip;
  viewer.getAnimations().forEach(a => a.cancel());
  const turn = deg => `perspective(2600px) rotateY(${deg}deg)`;
  const comeBack = () => {
    if (token !== viewerFlip) return;
    viewerFlip++;
    swap();
    viewer.animate([
      { transform: turn(80 * direction), opacity: 0.2 },
      { transform: turn(0), opacity: 1 }
    ], { duration: 380, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });
  };
  viewer.animate([
    { transform: turn(0), opacity: 1 },
    { transform: turn(-80 * direction), opacity: 0.2 }
  ], { duration: 200, easing: 'cubic-bezier(0.5, 0, 0.9, 0.5)' }).finished.then(comeBack, () => {});
  // Animations stall in a tab that isn't painting; the new project must still show up.
  setTimeout(comeBack, 320);
}

function renderViewer() {
  const viewer = document.getElementById('projectViewer');
  const project = COLDSNAP_PROJECTS.find(p => p.id === activeProjectId);
  if (!viewer || !project) return;
  const field = name => i18n.field(project, name);
  const list = visibleProjects();
  const index = list.findIndex(p => p.id === project.id);

  viewerMedia = projectMedia(project);
  viewerMediaIndex = Math.min(viewerMediaIndex, Math.max(0, viewerMedia.length - 1));

  const strip = viewerMedia.length > 1 ? `
    <div class="viewer__strip">
      ${viewerMedia.map((m, i) => `
        <button type="button" class="viewer__thumb" data-media="${i}" aria-label="${i + 1} / ${viewerMedia.length}">
          <img src="${escapeAttr(m.mini)}" data-fallback="${escapeAttr(m.full)}" alt="" loading="lazy" draggable="false">
          ${m.video ? '<i class="fa fa-play" aria-hidden="true"></i>' : ''}
        </button>
      `).join('')}
    </div>` : '';

  const stats = (project.stats || []).map(s => `
    <div class="viewer__stat">
      <strong>${s.value}</strong>
      <span>${i18n.lang === 'fr' && s.fr ? s.fr : s.label}</span>
    </div>
  `).join('');

  const features = field('features');
  const links = (project.links || []).map(link => {
    const external = !link.href.startsWith('mailto:');
    return `
      <a href="${escapeAttr(resolveHref(link.href))}" class="modal-link ${link.style ? link.style : (link.secondary ? 'secondary' : '')}"${external ? ' target="_blank" rel="noopener"' : ''}>
        ${link.icon ? `<i class="fa ${link.icon}" aria-hidden="true"></i>` : ''}
        ${i18n.lang === 'fr' && link.labelFr ? link.labelFr : link.label}
      </a>
    `;
  }).join('');

  // The summary shows a few lines; the full story, features and tech fold out on demand.
  const description = field('description') || field('shortDescription') || '';
  const extra = [
    features && features.length ? `<ul class="viewer__features">${features.map(f => `<li>${f}</li>`).join('')}</ul>` : '',
    project.tech && project.tech.length ? `<div class="viewer__tech">${project.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}</div>` : ''
  ].join('');
  const foldable = Boolean(extra) || description.length > 260;

  viewer.classList.toggle('is-foldable', foldable);
  viewer.classList.toggle('is-expanded', viewerExpanded);
  viewer.setAttribute('aria-label', project.title);
  viewer.innerHTML = `
    <div class="viewer__media">
      <div class="viewer__stage" id="viewerStage"></div>
      ${strip}
    </div>
    <div class="viewer__body">
      <div class="viewer__top">
        <span class="viewer__type"><i class="fa ${CATEGORY_ICONS[project.category] || 'fa-folder'}" aria-hidden="true"></i> ${field('type') || ''}</span>
        ${list.length > 1 && index !== -1 ? `
          <div class="viewer__pager">
            <button type="button" class="viewer__step" data-step="-1" aria-label="${escapeAttr(i18n.t('viewer.prev'))}"><i class="fa fa-chevron-left" aria-hidden="true"></i></button>
            <span class="viewer__index">${index + 1} / ${list.length}</span>
            <button type="button" class="viewer__step" data-step="1" aria-label="${escapeAttr(i18n.t('viewer.next'))}"><i class="fa fa-chevron-right" aria-hidden="true"></i></button>
          </div>` : ''}
      </div>
      <h3 class="viewer__title">${project.title}</h3>
      <p class="viewer__desc">${description}</p>
      ${stats ? `<div class="viewer__stats">${stats}</div>` : ''}
      ${extra ? `<div class="viewer__extra" id="viewerExtra">${extra}</div>` : ''}
      ${foldable ? `
        <button type="button" class="viewer__toggle" data-toggle aria-expanded="${viewerExpanded}" aria-controls="viewerExtra">
          ${i18n.t(viewerExpanded ? 'viewer.less' : 'viewer.more')} <i class="fa fa-chevron-${viewerExpanded ? 'up' : 'down'}" aria-hidden="true"></i>
        </button>` : ''}
      ${links ? `<div class="viewer__links">${links}</div>` : ''}
    </div>
  `;
  renderStage();
}

function renderStage() {
  const stage = document.getElementById('viewerStage');
  if (!stage) return;
  const project = COLDSNAP_PROJECTS.find(p => p.id === activeProjectId);
  const item = viewerMedia[viewerMediaIndex];
  const many = viewerMedia.length > 1;

  let shot;
  if (!item) {
    shot = `<div class="viewer__placeholder">${project.icon || '🎮'}</div>`;
  } else if (item.video) {
    shot = `<video class="viewer__shot" src="${escapeAttr(item.src)}" data-fallback="${escapeAttr(item.full)}" poster="${escapeAttr(item.view)}" autoplay muted loop playsinline controls preload="metadata"></video>`;
  } else {
    shot = `
      <button type="button" class="viewer__zoom" aria-label="${escapeAttr(i18n.t('viewer.zoom'))}">
        <img class="viewer__shot" src="${escapeAttr(item.view)}" data-fallback="${escapeAttr(item.full)}" alt="${escapeAttr(project.title)}" draggable="false">
      </button>`;
  }

  stage.innerHTML = `
    ${item ? `<img class="viewer__backdrop" src="${escapeAttr(item.view)}" data-fallback="${escapeAttr(item.full)}" alt="" aria-hidden="true">` : ''}
    ${shot}
    ${many ? `
      <button type="button" class="viewer__arrow prev" data-media-step="-1" aria-label="${escapeAttr(i18n.t('viewer.prevMedia'))}"><i class="fa fa-chevron-left" aria-hidden="true"></i></button>
      <button type="button" class="viewer__arrow next" data-media-step="1" aria-label="${escapeAttr(i18n.t('viewer.nextMedia'))}"><i class="fa fa-chevron-right" aria-hidden="true"></i></button>
      <span class="viewer__count">${viewerMediaIndex + 1} / ${viewerMedia.length}</span>
    ` : ''}
  `;

  document.querySelectorAll('#projectViewer .viewer__thumb').forEach((thumb, i) => {
    thumb.classList.toggle('is-active', i === viewerMediaIndex);
    if (i === viewerMediaIndex) thumb.setAttribute('aria-current', 'true');
    else thumb.removeAttribute('aria-current');
  });
}

function stepMedia(step) {
  if (viewerMedia.length < 2) return;
  viewerMediaIndex = (viewerMediaIndex + step + viewerMedia.length) % viewerMedia.length;
  renderStage();
}

function stepProject(step) {
  const list = visibleProjects();
  const index = list.findIndex(p => p.id === activeProjectId);
  if (list.length < 2 || index === -1) return;
  showProject(list[(index + step + list.length) % list.length].id, { animate: true, direction: step });
}

// One set of listeners on the viewer survives every re-render.
function initViewer() {
  const viewer = document.getElementById('projectViewer');

  viewer.addEventListener('click', e => {
    const target = e.target.closest('button');
    if (!target || !viewer.contains(target)) return;
    if (target.hasAttribute('data-toggle')) {
      viewerExpanded = !viewerExpanded;
      renderViewer();
      const toggle = viewer.querySelector('[data-toggle]');
      if (toggle) toggle.focus();
    }
    else if (target.dataset.step) stepProject(Number(target.dataset.step));
    else if (target.dataset.mediaStep) stepMedia(Number(target.dataset.mediaStep));
    else if (target.dataset.media) { viewerMediaIndex = Number(target.dataset.media); renderStage(); }
    else if (target.classList.contains('viewer__zoom')) {
      zoomImages = viewerMedia.filter(m => !m.video).map(m => m.full);
      openZoom(viewerMedia[viewerMediaIndex].full);
    }
  });

  // A light copy that isn't there yet falls back to the original file.
  viewer.addEventListener('error', e => {
    const el = e.target;
    if (el.dataset && el.dataset.fallback) {
      const next = el.dataset.fallback;
      delete el.dataset.fallback;
      el.src = next;
    }
  }, true);

  viewer.addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (e.target.closest('video, a')) return;
    e.preventDefault();
    const step = e.key === 'ArrowRight' ? 1 : -1;
    if (e.target.closest('.viewer__body')) stepProject(step);
    else stepMedia(step);
  });

  // Swipe through the media on touch screens.
  let touchX = null;
  viewer.addEventListener('touchstart', e => {
    touchX = e.target.closest('.viewer__stage') ? e.touches[0].clientX : null;
  }, { passive: true });
  viewer.addEventListener('touchend', e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 40) stepMedia(dx < 0 ? 1 : -1);
  }, { passive: true });
}

// ── Shelf ──────────────────────────────────────────────────
function renderShelf() {
  const grid = document.getElementById('projectGrid');
  if (!grid) return;
  grid.innerHTML = visibleProjects().map(createProjectCard).join('');
  updateShelfFold();
}

function markActiveCard() {
  document.querySelectorAll('#projectGrid .project-card').forEach(card => {
    const active = card.dataset.project === activeProjectId;
    card.classList.toggle('is-active', active);
    if (active) card.setAttribute('aria-current', 'true');
    else card.removeAttribute('aria-current');
  });
}

// Folded, the shelf shows its first row and a faded slice of the second.
function foldedHeight(grid) {
  const cards = [...grid.children];
  const secondRow = cards.find(c => c.offsetTop > cards[0].offsetTop);
  if (!secondRow) return Infinity;
  return secondRow.offsetTop + secondRow.offsetHeight * 0.5;
}

function updateShelfFold() {
  const shelf = document.getElementById('projectShelf');
  const grid = document.getElementById('projectGrid');
  const toggle = document.getElementById('shelfToggle');
  if (!shelf || !grid || !grid.children.length) return;
  const current = grid.style.maxHeight;
  grid.style.maxHeight = 'none';
  const full = grid.scrollHeight;
  const folded = foldedHeight(grid);
  grid.style.maxHeight = current;
  const foldable = full > folded + 60;
  const open = shelfOpen || !foldable;

  shelf.classList.toggle('is-foldable', foldable);
  shelf.classList.toggle('is-open', open);
  // Set on the next frame so the change from the old height animates.
  requestAnimationFrame(() => { grid.style.maxHeight = (open ? full : folded) + 'px'; });
  toggle.hidden = !foldable;
  toggle.setAttribute('aria-expanded', String(open));
  toggle.innerHTML = open
    ? `${i18n.t('work.less')} <i class="fa fa-chevron-up" aria-hidden="true"></i>`
    : `${i18n.t('work.more').replace('{n}', grid.children.length)} <i class="fa fa-chevron-down" aria-hidden="true"></i>`;
}

function setShelfOpen(open) {
  shelfOpen = open;
  updateShelfFold();
  if (!open) {
    const shelf = document.getElementById('projectShelf');
    if (shelf.getBoundingClientRect().top < 0) {
      shelf.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    }
  }
}

function initShelf() {
  const grid = document.getElementById('projectGrid');
  document.getElementById('shelfToggle').addEventListener('click', () => setShelfOpen(!shelfOpen));

  grid.addEventListener('click', e => {
    const card = e.target.closest('[data-project]');
    if (card) showProject(card.dataset.project, { animate: true, scroll: true });
  });

  // Tabbing into the faded part unfolds the shelf.
  grid.addEventListener('focusin', e => {
    const card = e.target.closest('.project-card');
    if (!shelfOpen && card && card.offsetTop + card.offsetHeight > grid.clientHeight) setShelfOpen(true);
  });

  // Cards tilt towards the pointer and catch the light, like a holo card.
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReducedMotion()) {
    grid.addEventListener('pointermove', e => {
      const card = e.target.closest('.project-card');
      if (!card) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--rx', ((0.5 - y) * 10).toFixed(2) + 'deg');
      card.style.setProperty('--ry', ((x - 0.5) * 12).toFixed(2) + 'deg');
      card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    });
    grid.addEventListener('pointerout', e => {
      const card = e.target.closest('.project-card');
      if (card && !card.contains(e.relatedTarget)) {
        card.style.removeProperty('--rx');
        card.style.removeProperty('--ry');
      }
    });
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateShelfFold, 150);
  });
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

    const thumbnail = i18n.field(project, 'thumbnail');
    const thumb = thumbnail
      ? `<img src="${thumbnail}" alt="" draggable="false">`
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

  // When the window settles on a new size, the deck is dealt again across the new table:
  // each card is lifted and tossed towards a fresh random spot (and they knock into each other).
  function redeal() {
    if (frozen) return;
    cards.forEach(card => {
      if (!card.active || card.isDragging || card.el.classList.contains('is-driven-away')) return;
      const tx = Math.random() * Math.max(0, W - CARD_W);
      const ty = Math.random() * Math.max(0, H - CARD_H);
      // With AIR_DAMP friction a card coasts v / (1 - AIR_DAMP) px, so this lands it near its spot.
      card.vx = (tx - card.x) * (1 - AIR_DAMP);
      card.vy = (ty - card.y) * (1 - AIR_DAMP);
      card.angularVel = (Math.random() - 0.5) * 24;
      card.scale = 1.18;
      card.targetScale = 1.0;
    });
  }

  let resizeTimer = null;
  let dealtW = W;
  let dealtH = H;
  window.addEventListener('resize', () => {
    if (window.matchMedia(HERO_TABLE_QUERY).matches) return;
    W = table.clientWidth;
    H = table.clientHeight;
    cards.forEach(card => {
      if (!card.active) return;
      card.x = Math.min(card.x, W - CARD_W);
      card.y = Math.min(card.y, H - CARD_H);
    });
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (W === dealtW && H === dealtH) return;
      dealtW = W;
      dealtH = H;
      redeal();
    }, 180);
  });
}

// A card on the shelf; clicking it deals the project into the viewer.
function createProjectCard(project, i) {
  const field = name => i18n.field(project, name);
  const active = project.id === activeProjectId;
  const thumbnail = field('thumbnail');
  const thumbnailContent = thumbnail
    ? `<img src="${thumbnail}" alt="" loading="lazy" draggable="false">`
    : `<span class="project-placeholder">${project.icon || '🎮'}</span>`;
  const icon = CATEGORY_ICONS[project.category] || 'fa-folder';

  return `
    <button type="button" class="project-card${active ? ' is-active' : ''}" data-project="${project.id}"${active ? ' aria-current="true"' : ''} style="--i: ${i}">
      <span class="project-thumbnail">
        ${thumbnailContent}
        <span class="project-card__now">${i18n.t('work.showing')}</span>
      </span>
      <span class="project-info">
        <span class="project-type"><i class="fa ${icon}" aria-hidden="true"></i> ${field('type') || 'Project'}</span>
        <span class="project-title">${project.title}</span>
        <span class="project-desc">${field('shortDescription') || ''}</span>
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

  // The logo goes back to the top by hand: following #top (the fixed nav) let some
  // browsers jump to the project viewer instead, which broke the five-tap cold snap.
  document.querySelector('.cs-nav__brand').addEventListener('click', e => {
    e.preventDefault();
    if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  });

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
  renderWork();
  initHeroCards();
  initCounters();
  initReveal();

  i18n.onChange(() => {
    renderFilters();
    renderWork();
  });
});
