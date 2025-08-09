// Simple, reliable portfolio system
(function() {
  'use strict';

  const DATA_URL = 'data/projects.json';
  
  // Simple element creator
  function create(tag, props, ...children) {
    const el = document.createElement(tag);
    if (props) {
      Object.entries(props).forEach(([key, value]) => {
        if (key === 'style' && typeof value === 'object') {
          Object.assign(el.style, value);
        } else if (key === 'className') {
          el.className = value;
        } else if (key === 'innerHTML') {
          el.innerHTML = value;
        } else {
          el.setAttribute(key, value);
        }
      });
    }
    children.forEach(child => {
      if (typeof child === 'string') {
        el.appendChild(document.createTextNode(child));
      } else if (child) {
        el.appendChild(child);
      }
    });
    return el;
  }

  function groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key] || 'Uncategorized';
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  }

  function createCard(item) {
    // Get thumbnail
    let thumbnail = null;
    if (item.thumbnail && item.thumbnail.trim()) {
      thumbnail = item.thumbnail;
    } else if (item.media && item.media.length > 0) {
      thumbnail = item.media[0];
    }

    const card = create('div', { 
      className: 'portfolio-card',
      style: {
        background: '#2c2c2c',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: '2px solid transparent',
        position: 'relative'
      }
    });

    // Thumbnail
    if (thumbnail) {
      const img = create('img', {
        src: thumbnail,
        alt: item.title,
        style: {
          width: '100%',
          height: '200px',
          objectFit: 'cover',
          display: 'block'
        }
      });
      card.appendChild(img);
    } else {
      const placeholder = create('div', {
        style: {
          width: '100%',
          height: '200px',
          background: 'linear-gradient(135deg, #444, #666)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: '3rem'
        },
        innerHTML: '<i class="fa fa-image"></i>'
      });
      card.appendChild(placeholder);
    }

    // Title
    const title = create('div', {
      className: 'card-title',
      style: {
        padding: '15px',
        color: '#F05F40',
        fontSize: '1.2rem',
        fontWeight: '600',
        textAlign: 'center'
      }
    }, item.title);
    card.appendChild(title);

    // Hover effects
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-5px)';
      card.style.borderColor = '#F05F40';
      card.style.boxShadow = '0 10px 30px rgba(240, 95, 64, 0.2)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.borderColor = 'transparent';
      card.style.boxShadow = 'none';
    });

    // Click handler
    card.addEventListener('click', () => {
      showModal(item);
    });

    return card;
  }

  function showModal(item) {
    // Remove any existing modal
    const existingModal = document.querySelector('.simple-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Create modal backdrop
    const backdrop = create('div', {
      className: 'simple-modal',
      style: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '10000',
        padding: '20px',
        boxSizing: 'border-box',
        opacity: '0',
        transition: 'opacity 0.3s ease'
      }
    });

    // Create modal content (larger for PDFs and docs)
    const modalContent = create('div', {
      style: {
        background: '#2c2c2c',
        borderRadius: '12px',
        maxWidth: (item.kind === 'pdf' || item.kind === 'doc') ? '95vw' : '900px',
        maxHeight: (item.kind === 'pdf' || item.kind === 'doc') ? '95vh' : '90vh',
        width: '100%',
        overflow: 'auto',
        position: 'relative',
        transform: 'scale(0.9)',
        transition: 'transform 0.3s ease'
      }
    });

    // Close button
    const closeBtn = create('button', {
      innerHTML: '&times;',
      style: {
        position: 'absolute',
        top: '15px',
        right: '20px',
        background: 'none',
        border: 'none',
        color: '#F05F40',
        fontSize: '2rem',
        cursor: 'pointer',
        zIndex: '1',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.3s ease'
      }
    });

    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = 'rgba(240, 95, 64, 0.1)';
    });

    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = 'none';
    });

    closeBtn.addEventListener('click', () => {
      closeModal(backdrop);
    });

    // Modal header
    const header = create('div', {
      style: {
        padding: '30px 30px 20px',
        borderBottom: '2px solid #F05F40'
      }
    });

    const title = create('h2', {
      style: {
        color: '#F05F40',
        fontSize: '2rem',
        margin: '0',
        paddingRight: '50px'
      }
    }, item.title);

    header.appendChild(title);

    // Modal body
    const body = create('div', {
      style: {
        padding: '20px 30px 30px'
      }
    });

    // Media section
    if ((item.media && item.media.length > 0) || (item.kind === 'doc' && item.href)) {
      const mediaContainer = create('div', {
        style: {
          marginBottom: '20px'
        }
      });

      if (item.kind === 'video') {
        const video = create('video', {
          src: item.media[0],
          controls: true,
          style: {
            width: '100%',
            maxHeight: '400px',
            borderRadius: '8px'
          }
        });
        mediaContainer.appendChild(video);
      } else if (item.kind === 'pdf' || item.kind === 'doc') {
        // Get PDF URL from either media array or href
        const pdfUrl = item.kind === 'doc' ? item.href : item.media[0];
        
        // PDF viewer with native embed
        const pdfContainer = create('div', {
          style: {
            width: '100%',
            height: 'calc(80vh - 100px)',
            minHeight: '500px',
            border: '2px solid #F05F40',
            borderRadius: '8px',
            overflow: 'hidden',
            background: '#f5f5f5',
            position: 'relative'
          }
        });

        // Use embed for better PDF support
        const pdfEmbed = create('embed', {
          src: pdfUrl + '#toolbar=1&navpanes=1&scrollbar=1&view=FitH',
          type: 'application/pdf',
          style: {
            width: '100%',
            height: '100%',
            border: 'none'
          }
        });

        // Fallback message for browsers that can't display PDFs
        const fallbackMessage = create('div', {
          style: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '40px',
            textAlign: 'center',
            color: '#666',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            zIndex: '1'
          }
        });

        const fallbackLink = create('a', {
          href: pdfUrl,
          target: '_blank',
          rel: 'noopener',
          style: {
            background: '#F05F40',
            color: 'white',
            padding: '15px 25px',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '1.1rem'
          },
          innerHTML: '<i class="fa fa-file-pdf-o"></i> View PDF Document'
        });

        fallbackMessage.appendChild(create('p', {
          style: { marginBottom: '20px', fontSize: '1.1rem' }
        }, 'PDF cannot be displayed inline in this browser.'));
        fallbackMessage.appendChild(fallbackLink);

        // Add direct link overlay for easy access
        const openLink = create('a', {
          href: pdfUrl,
          target: '_blank',
          rel: 'noopener',
          style: {
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(240, 95, 64, 0.9)',
            color: 'white',
            padding: '8px 12px',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: '600',
            borderRadius: '6px',
            zIndex: '10',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          },
          innerHTML: '<i class="fa fa-external-link"></i> Open'
        });

        pdfContainer.appendChild(pdfEmbed);
        pdfContainer.appendChild(openLink);
        
        // Check if PDF loaded, show fallback if not
        pdfEmbed.onerror = () => {
          pdfContainer.appendChild(fallbackMessage);
        };

        mediaContainer.appendChild(pdfContainer);
      } else if (item.kind === 'gallery' && item.media.length > 1) {
        // Simple gallery
        let currentIndex = 0;
        
        const galleryContainer = create('div', {
          style: {
            position: 'relative',
            textAlign: 'center'
          }
        });

        const img = create('img', {
          src: item.media[0],
          alt: item.title,
          style: {
            width: '100%',
            maxHeight: '400px',
            objectFit: 'contain',
            borderRadius: '8px'
          }
        });

        const counter = create('div', {
          style: {
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '15px',
            fontSize: '0.9rem'
          }
        }, `1 / ${item.media.length}`);

        if (item.media.length > 1) {
          const prevBtn = create('button', {
            innerHTML: '<i class="fa fa-chevron-left"></i>',
            style: {
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(240, 95, 64, 0.8)',
              border: 'none',
              color: 'white',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '1.2rem'
            }
          });

          const nextBtn = create('button', {
            innerHTML: '<i class="fa fa-chevron-right"></i>',
            style: {
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(240, 95, 64, 0.8)',
              border: 'none',
              color: 'white',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '1.2rem'
            }
          });

          prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentIndex = currentIndex > 0 ? currentIndex - 1 : item.media.length - 1;
            img.src = item.media[currentIndex];
            counter.textContent = `${currentIndex + 1} / ${item.media.length}`;
          });

          nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex + 1) % item.media.length;
            img.src = item.media[currentIndex];
            counter.textContent = `${currentIndex + 1} / ${item.media.length}`;
          });

          galleryContainer.appendChild(prevBtn);
          galleryContainer.appendChild(nextBtn);
        }

        galleryContainer.appendChild(img);
        galleryContainer.appendChild(counter);
        mediaContainer.appendChild(galleryContainer);
      } else {
        // Single image
        const img = create('img', {
          src: item.media[0],
          alt: item.title,
          style: {
            width: '100%',
            maxHeight: '400px',
            objectFit: 'contain',
            borderRadius: '8px'
          }
        });
        mediaContainer.appendChild(img);
      }

      body.appendChild(mediaContainer);
    }

    // Description
    if (item.description) {
      const description = create('div', {
        style: {
          color: '#ddd',
          lineHeight: '1.6',
          marginBottom: '20px',
          fontSize: '1.1rem'
        }
      }, item.description);
      body.appendChild(description);
    }

    // Links
    if (item.links && item.links.length > 0) {
      const linksContainer = create('div', {
        style: {
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap'
        }
      });

      item.links.forEach(link => {
        const linkBtn = create('a', {
          href: link.href,
          target: '_blank',
          rel: 'noopener',
          style: {
            background: '#F05F40',
            color: 'white',
            padding: '12px 20px',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            transition: 'background 0.3s ease',
            display: 'inline-block'
          }
        }, link.label);

        linkBtn.addEventListener('mouseenter', () => {
          linkBtn.style.background = '#d44e34';
        });

        linkBtn.addEventListener('mouseleave', () => {
          linkBtn.style.background = '#F05F40';
        });

        linksContainer.appendChild(linkBtn);
      });

      body.appendChild(linksContainer);
    }

    modalContent.appendChild(closeBtn);
    modalContent.appendChild(header);
    modalContent.appendChild(body);
    backdrop.appendChild(modalContent);
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
    document.body.appendChild(backdrop);

    // Animate in
    requestAnimationFrame(() => {
      backdrop.style.opacity = '1';
      modalContent.style.transform = 'scale(1)';
    });

    // Close on backdrop click
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop);
      }
    });

    // Close on escape
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        closeModal(backdrop);
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
  }

  function closeModal(backdrop) {
    backdrop.style.opacity = '0';
    const modalContent = backdrop.querySelector('div');
    if (modalContent) {
      modalContent.style.transform = 'scale(0.9)';
    }
    
    // Restore background scrolling
    document.body.style.overflow = '';
    
    setTimeout(() => {
      backdrop.remove();
    }, 300);
  }

  function render(data) {
    const container = document.getElementById('portfolio-root');
    if (!container) return;

    container.innerHTML = '';

    const groups = groupBy(data, 'category');

    Object.entries(groups).forEach(([category, items]) => {
      const section = create('div', {
        className: 'portfolio-section',
        style: {
          marginBottom: '60px'
        }
      });

      const title = create('h2', {
        style: {
          textAlign: 'center',
          color: '#F05F40',
          fontSize: '2.5rem',
          marginBottom: '20px',
          fontWeight: '700'
        }
      }, category);

      const divider = create('div', {
        style: {
          width: '100px',
          height: '4px',
          background: '#F05F40',
          margin: '0 auto 40px',
          borderRadius: '2px'
        }
      });

      const grid = create('div', {
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '30px',
          padding: '0 30px',
          maxWidth: '1200px',
          margin: '0 auto'
        }
      });

      items.forEach(item => {
        grid.appendChild(createCard(item));
      });

      section.appendChild(title);
      section.appendChild(divider);
      section.appendChild(grid);
      container.appendChild(section);
    });
  }

  function init() {
    fetch(DATA_URL)
      .then(response => response.json())
      .then(data => render(data))
      .catch(error => {
        console.error('Failed to load portfolio:', error);
        const container = document.getElementById('portfolio-root');
        if (container) {
          container.innerHTML = '<div style="text-align: center; color: #F05F40; padding: 50px;"><h2>Portfolio Unavailable</h2><p>Unable to load portfolio data.</p></div>';
        }
      });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
