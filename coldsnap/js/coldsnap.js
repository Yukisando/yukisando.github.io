/**
 * ColdSnap - Project Navigation JavaScript
 * 
 * This file handles all the dynamic functionality for the ColdSnap page
 */

// Current carousel state
let currentSlide = 0;
let totalSlides = 0;

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
  const zoomModal = document.getElementById('zoomModal');
  const zoomImage = document.getElementById('zoomImage');
  zoomImage.src = imageSrc;
  zoomModal.classList.add('active');
  document.body.style.overflow = 'hidden';
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

// Modal functions
function openModal(projectId) {
  const project = COLDSNAP_PROJECTS.find(p => p.id === projectId);
  if (!project) return;
  
  const modal = document.getElementById('projectModal');
  const modalBody = document.getElementById('modalBody');

  stopProjectModalMedia(true);
  
  // Build carousel HTML for media
  let galleryHTML = '';
  if (project.media && project.media.length > 0) {
    totalSlides = project.media.length;
    
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
          <a href="${link.href}" class="modal-link ${(link.secondary || i > 0) ? 'secondary' : ''}" target="_blank" rel="noopener">
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
      ${linksHTML}
    </div>
  `;
  
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
  if (modalBody) {
    modalBody.innerHTML = '';
  }
  document.body.style.overflow = '';
  currentSlide = 0;
  totalSlides = 0;
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeZoom();
    closeModal();
  }
  // Arrow keys for carousel
  if (event.key === 'ArrowRight') {
    nextSlide();
  }
  if (event.key === 'ArrowLeft') {
    prevSlide();
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
    'Flutter Apps': 'Cross-platform mobile and desktop applications',
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
