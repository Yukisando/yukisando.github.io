(function(){
  const DATA_URL = 'data/projects.json';

  function el(tag, attrs={}, ...children){
    const node = document.createElement(tag);
    for(const [k,v] of Object.entries(attrs||{})){
      if(k === 'class') node.className = v;
      else if(k === 'html') node.innerHTML = v;
      else if(k.startsWith('on') && typeof v === 'function') node.addEventListener(k.substring(2), v);
      else node.setAttribute(k, v);
    }
    for(const child of children){
      if(child == null) continue;
      if(Array.isArray(child)) node.append(...child);
      else if(child instanceof Node) node.appendChild(child);
      else node.appendChild(document.createTextNode(String(child)));
    }
    return node;
  }

  function groupBy(arr, key){
    return arr.reduce((acc, item)=>{
      const k = item[key] || 'Others';
      (acc[k] ||= []).push(item);
      return acc;
    }, {});
  }

  function buildCard(item){
    const linkAttrs = item.kind === 'doc' ? { href: item.href, target: '_blank', rel: 'noopener' } : { href: `#${item.id}`, 'data-toggle':'modal' };
    
    // Use existing thumbnail first, fallback to first media image if available
    const thumbnailSrc = item.thumbnail || ((item.media && item.media.length > 0) ? item.media[0] : '');
    
    // Only apply blur if we're using a media image as thumbnail
    const useBlur = !item.thumbnail && item.media && item.media.length > 0;
    const blurStyle = useBlur ? 'filter: blur(2px); transition: filter 0.3s ease;' : '';
    
    const img = el('img', { 
      src: thumbnailSrc, 
      alt: item.title, 
      class: 'img-responsive portfolio-thumb', 
      loading: 'lazy',
      style: blurStyle
    });
    
    const title = el('div', { class: 'centered' }, el('h3', { class: 'portfolio-title' }, item.title));
    
    // Caption with different icons for different types
    let iconClass = 'fa fa-search-plus fa-2x';
    if (item.kind === 'video') iconClass = 'fa fa-play fa-2x';
    else if (item.kind === 'gallery') iconClass = 'fa fa-image fa-2x';
    else if (item.kind === 'doc') iconClass = 'fa fa-file-text fa-2x';
    
    const cap = el('div', { class: 'caption' }, el('div', { class: 'caption-content' }, el('i', { class: iconClass })));
    
    // Add category badge
    const badge = el('div', { class: 'category-badge' }, item.category);
    
    const inner = el('div', { class: 'thumb-wrapper' }, img, badge);
    const anchor = el('a', { 
      class: 'portfolio-link', 
      'aria-label': item.title, 
      'data-kind': item.kind,
      ...linkAttrs 
    }, title, cap, inner);
    
    const card = el('div', { class: 'portfolio-item', 'data-kind': item.kind }, anchor);
    
    // Add hover effects only if using blur
    if (useBlur) {
      anchor.addEventListener('mouseenter', () => {
        img.style.filter = 'blur(0px)';
      });
      
      anchor.addEventListener('mouseleave', () => {
        img.style.filter = 'blur(2px)';
      });
    }
    
    return card;
  }

  function buildModal(item){
    if(item.kind === 'doc') return null;
    
    const mediaElement = createMediaElement(item);
    const contentSection = createContentSection(item);
    
    // Determine layout based on content
    const hasMedia = item.media && item.media.length > 0;
    const hasContent = item.description || (item.links && item.links.length > 0);
    
    let bodyClass = 'modal-body';
    let bodyChildren = [];
    
    if (hasMedia && hasContent) {
      // Two-column layout: media on left, content on right
      bodyChildren = [mediaElement, contentSection];
    } else if (hasMedia) {
      // Full-width media only
      bodyClass += ' single-column';
      if (mediaElement) {
        mediaElement.classList.add('full-width');
      }
      bodyChildren = [mediaElement];
    } else if (hasContent) {
      // Content only
      bodyClass += ' single-column';
      bodyChildren = [contentSection];
    }

    const modal = el('div', { 
      class: 'portfolio-modal modal fade', 
      id: item.id, 
      tabindex: '-1', 
      role: 'dialog', 
      'aria-hidden': 'true',
      'data-backdrop': 'true',
      'data-keyboard': 'true'
    },
      el('div', { class: 'modal-dialog', role: 'document' },
        el('div', { class: 'modal-content' },
          el('h2', { class: 'modal-title' }, item.title),
          el('div', { class: 'modal-header' }, el('hr')),
          el('div', { class: bodyClass }, ...bodyChildren),
          el('div', { class: 'modal-footer' }, 
            el('button', { 
              type: 'button', 
              class: 'btn btn-primary', 
              'data-dismiss': 'modal'
            }, 'Close')
          )
        )
      )
    );
    
    return modal;
  }
  
  function createMediaElement(item) {
    if (!item.media || item.media.length === 0) return null;
    
    if(item.kind === 'video') {
      const videoContainer = el('div', { class: 'modal-media-container' });
      const video = el('video', { 
        class: 'modal-media', 
        src: item.media[0], 
        controls: true,
        muted: true
      });
      videoContainer.appendChild(video);
      return videoContainer;
      
    } else if(item.kind === 'gallery') {
      const galleryContainer = el('div', { class: 'modal-media-container gallery-container' });
      
      const img = el('img', { 
        id: `${item.id}-gallery`, 
        class: 'modal-media', 
        src: item.media[0], 
        alt: item.title
      });
      
      // Gallery navigation controls
      const prevBtn = el('button', { 
        class: 'gallery-nav gallery-prev',
        innerHTML: '<i class="fa fa-chevron-left"></i>'
      });
      
      const nextBtn = el('button', { 
        class: 'gallery-nav gallery-next',
        innerHTML: '<i class="fa fa-chevron-right"></i>'
      });
      
      const counter = el('div', { 
        class: 'gallery-counter'
      }, `1 / ${item.media.length}`);
      
      galleryContainer.append(img, prevBtn, nextBtn, counter);
      
      // Gallery functionality
      let currentIndex = 0;
      
      function updateGallery() {
        img.style.opacity = '0.7';
        setTimeout(() => {
          img.src = item.media[currentIndex];
          counter.textContent = `${currentIndex + 1} / ${item.media.length}`;
          img.style.opacity = '1';
        }, 150);
      }
      
      nextBtn.onclick = (e) => {
        e.preventDefault();
        currentIndex = (currentIndex + 1) % item.media.length;
        updateGallery();
      };
      
      prevBtn.onclick = (e) => {
        e.preventDefault();
        currentIndex = currentIndex > 0 ? currentIndex - 1 : item.media.length - 1;
        updateGallery();
      };
      
      // Auto-advance (slower)
      let autoAdvanceInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % item.media.length;
        updateGallery();
      }, 6000);
      
      // Stop auto-advance when user interacts
      [prevBtn, nextBtn].forEach(btn => {
        btn.addEventListener('click', () => {
          clearInterval(autoAdvanceInterval);
        });
      });
      
      return galleryContainer;
      
    } else if(item.kind === 'image') {
      const imageContainer = el('div', { class: 'modal-media-container' });
      const img = el('img', { 
        class: 'modal-media', 
        src: item.media[0], 
        alt: item.title
      });
      imageContainer.appendChild(img);
      return imageContainer;
    }
    
    return null;
  }
  
  function createContentSection(item) {
    const contentChildren = [];
    
    // Description
    if(item.description) {
      contentChildren.push(el('div', { 
        class: 'modal-description'
      }, item.description));
    }
    
    // Links
    if(item.links && item.links.length > 0){
      const linkElements = item.links.map(l => el('a', { 
        href: l.href, 
        target: '_blank', 
        rel: 'noopener', 
        class: 'btn modal-link-btn'
      }, l.label));
      contentChildren.push(el('div', { class: 'modal-links' }, ...linkElements));
    }
    
    if (contentChildren.length === 0) return null;
    
    return el('div', { class: 'modal-content-section' }, ...contentChildren);
  }

  function render(data){
    const container = document.getElementById('portfolio-root');
    const modalContainer = document.getElementById('portfolio-modals');
    if(!container) return;

    // Clean up any existing content and modals
    container.innerHTML = '';
    modalContainer.innerHTML = '';
    
    // Clear any stuck modal backdrops
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());
    
    // Reset body modal classes
    document.body.classList.remove('modal-open');
    document.body.style.paddingRight = '';

    const groups = groupBy(data, 'category');
    
    Object.entries(groups).forEach(([category, items]) => {
      // Section header with clean styling
      const section = el('div', { class: 'container-fluid portfolio-section' },
        el('h2', { class: 'text-center' }, category),
        el('hr', { class: 'star-primary' }),
        el('div', { class: 'portfolio-grid' }, ...items.map(buildCard))
      );
      
      container.append(section);
      
      // Modals for items in this group
      items.forEach(item => {
        const modal = buildModal(item);
        if(modal) modalContainer.appendChild(modal);
      });
    });

    // Hide loading overlay
    hideLoadingOverlay();
  }

  function fetchJSON(url){
    return fetch(url, { cache: 'no-store' }).then(r => {
      if(!r.ok) throw new Error('Failed to load projects');
      return r.json();
    });
  }

  function showSkeleton(count=6){
    const root = document.getElementById('portfolio-root');
    if(!root) return;
    const wrap = el('div', { class: 'container-fluid portfolio-section' },
      el('h2', { 
        class: 'text-center', 
        style: 'color: #F05F40;'
      }, 'Loading Projects...'),
      el('hr', { class: 'star-primary' }),
      el('div', { class: 'portfolio-grid' },
        ...Array.from({length: count}, () => el('div', { class: 'portfolio-item' },
          el('div', { class: 'skeleton-card' },
            el('div', { class: 'skeleton-thumb' }),
            el('div', { class: 'skeleton-title' })
          )
        ))
      )
    );
    root.innerHTML = '';
    root.appendChild(wrap);
  }

  function showLoadingOverlay() {
    const overlay = el('div', { 
      id: 'loading-overlay',
      style: `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(34, 34, 34, 0.95);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 1;
        transition: opacity 0.5s ease;
        cursor: pointer;
      `
    },
      el('div', { 
        style: 'text-align: center; color: white;' 
      },
        el('div', { 
          style: `
            width: 60px;
            height: 60px;
            border: 4px solid rgba(240, 95, 64, 0.3);
            border-top: 4px solid #F05F40;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          `
        }),
        el('h3', { 
          style: 'font-size: 1.5rem; font-weight: 600; margin: 0; color: #F05F40;' 
        }, 'Loading Portfolio...'),
        el('p', { 
          style: 'margin: 10px 0 0; color: #888; font-size: 1rem;' 
        }, 'Please wait while we fetch your projects')
      )
    );

    // Add click to dismiss functionality
    overlay.onclick = () => hideLoadingOverlay();

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(overlay);
  }

  function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none'; // Immediately disable pointer events
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 500);
    }
    
    // Additional cleanup - remove any orphaned overlays
    const allOverlays = document.querySelectorAll('#loading-overlay');
    allOverlays.forEach(o => {
      if (o.parentNode) {
        o.style.pointerEvents = 'none';
        o.parentNode.removeChild(o);
      }
    });
  }

  function setupReveals(){
    // Removed - no more scroll animations
  }

  // Emergency function to remove any stuck overlays
  window.clearLoadingOverlay = function() {
    const overlays = document.querySelectorAll('#loading-overlay');
    overlays.forEach(overlay => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    });
    console.log('Loading overlays cleared');
  };

  // Emergency function to clear modal backdrops
  window.clearModalBackdrops = function() {
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => {
      if (backdrop.parentNode) {
        backdrop.parentNode.removeChild(backdrop);
      }
    });
    
    // Also remove any stuck modals
    const modals = document.querySelectorAll('.modal.fade.show, .modal.in');
    modals.forEach(modal => {
      modal.classList.remove('show', 'in');
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    });
    
    // Remove modal-open class from body
    document.body.classList.remove('modal-open');
    document.body.style.paddingRight = '';
    console.log('Modal backdrops and stuck modals cleared');
  };

  // Combined emergency cleanup
  window.emergencyCleanup = function() {
    clearLoadingOverlay();
    clearModalBackdrops();
    console.log('Emergency cleanup complete');
  };

  document.addEventListener('DOMContentLoaded', function(){
    // Clean up any pre-existing elements
    emergencyCleanup();
    
    showLoadingOverlay();
    
    // Fallback to remove overlay after 10 seconds no matter what
    setTimeout(() => {
      hideLoadingOverlay();
    }, 10000);
    
    fetchJSON(DATA_URL)
      .then(render)
      .catch(err => {
        console.error(err);
        const root = document.getElementById('portfolio-root');
        if(root) root.innerHTML = '<p style="text-align:center;color:#c00">Failed to load portfolio.</p>';
        hideLoadingOverlay();
      });
  });
})();
