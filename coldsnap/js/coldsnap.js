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

  let W = table.clientWidth;
  let H = table.clientHeight;
  const launchTime = Date.now();
  const cards = [];
  let animId = null;
  let lastTs = 0;

  // ── Build cards ──────────────────────────────────────────
  COLDSNAP_PROJECTS.forEach((project, i) => {
    const el = document.createElement('div');
    el.className = 'physics-card';
    el.dataset.projectId = project.id;
    el.title = `${project.title} — click to open`;

    const thumb = project.thumbnail
      ? `<img src="${project.thumbnail}" alt="${project.title}" draggable="false">`
      : `<div class="physics-card-icon">${project.icon || '🎮'}</div>`;

    el.innerHTML = `
      <div class="physics-card-thumb">${thumb}</div>
      <div class="physics-card-meta">
        <span class="physics-card-type">${project.type}</span>
        <h3 class="physics-card-title">${project.title}</h3>
      </div>
      <div class="physics-card-shine"></div>
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
      card.dragOffX = e.clientX - tr.left - card.x;
      card.dragOffY = e.clientY - tr.top - card.y;
      card.targetX = card.x;
      card.targetY = card.y;
      card.vx = 0;
      card.vy = 0;
      card.angularVel = 0;
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
      card.targetX = e.clientX - tr.left - card.dragOffX;
      card.targetY = e.clientY - tr.top - card.dragOffY;
    });

    const onRelease = () => {
      if (!card.isDragging) return;
      card.isDragging = false;
      el.classList.remove('is-dragging');

      if (!hasMoved) {
        card.targetScale = 1.0;
        openModal(card.project.id);
        return;
      }
      // Dampen throw momentum and add angular spin from direction
      card.vx *= 0.38;
      card.vy *= 0.38;
      card.angularVel = card.vx * 0.4;
      card.targetScale = 1.0;
    };

    el.addEventListener('pointerup', onRelease);
    el.addEventListener('pointercancel', onRelease);
  });

  // ── Hint ─────────────────────────────────────────────────
  const hint = document.createElement('div');
  hint.className = 'card-table-hint';
  hint.textContent = 'drag  ·  click to open';
  table.appendChild(hint);
  const hintDelay = COLDSNAP_PROJECTS.length * 130 + 2400;
  setTimeout(() => {
    hint.classList.add('visible');
    setTimeout(() => hint.classList.remove('visible'), 3200);
  }, hintDelay);

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
        card.scale += (card.targetScale - card.scale) * Math.min(0.18 * dt, 1);
        card.el.style.left = card.x + 'px';
        card.el.style.top = card.y + 'px';
        card.el.style.transform = `rotate(${card.angle}deg) scale(${card.scale})`;
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

      card.el.style.left = card.x + 'px';
      card.el.style.top = card.y + 'px';
      card.el.style.transform = `rotate(${card.angle}deg) scale(${card.scale})`;
    });
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
