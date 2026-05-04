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

  // Utility functions
  function isVideo(src) {
    return src.toLowerCase().includes('.mp4') || src.toLowerCase().includes('.webm') || src.toLowerCase().includes('.ogg');
  }

  function isAudio(src) {
    return src.toLowerCase().includes('.mp3') || src.toLowerCase().includes('.wav') || src.toLowerCase().includes('.ogg') || src.toLowerCase().includes('.m4a');
  }

  function createNavigationButton(direction, onClick) {
    const isNext = direction === 'next';
    const button = create('button', {
      innerHTML: `<i class="fa fa-chevron-${isNext ? 'right' : 'left'}"></i>`,
      style: {
        position: 'absolute',
        [isNext ? 'right' : 'left']: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'rgba(240, 95, 64, 0.8)',
        border: 'none',
        color: 'white',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        cursor: 'pointer',
        fontSize: '1.2rem',
        zIndex: '10'
      }
    });

    button.addEventListener('click', (e) => {
      e.stopPropagation();
      onClick();
    });

    return button;
  }

  function createCompactAudioPlayer(src, title) {
    // Create hidden HTML5 audio element
    const audio = create('audio', {
      src,
      preload: 'metadata'
    });

    // Compact player container
    const playerContainer = create('div', {
      style: {
        width: '100%',
        maxWidth: '100%',
        background: '#1a1a1a',
        borderRadius: '8px',
        padding: '15px',
        border: '1px solid #444',
        boxSizing: 'border-box'
      }
    });

    // Audio icon and title row
    const headerRow = create('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '12px'
      }
    });

    const audioIcon = create('div', {
      style: {
        fontSize: '1.5rem',
        color: '#F05F40'
      },
      innerHTML: '<i class="fa fa-podcast"></i>'
    });

    const episodeLabel = create('div', {
      style: {
        color: '#ccc',
        fontSize: '0.9rem',
        fontWeight: '500'
      }
    }, 'Podcast Episode');

    headerRow.appendChild(audioIcon);
    headerRow.appendChild(episodeLabel);

    // Progress bar container
    const progressContainer = create('div', {
      style: {
        width: '100%',
        height: '6px',
        background: '#333',
        borderRadius: '3px',
        marginBottom: '12px',
        cursor: 'pointer',
        position: 'relative'
      }
    });

    const progressBar = create('div', {
      style: {
        width: '0%',
        height: '100%',
        background: 'linear-gradient(90deg, #F05F40, #d44e34)',
        borderRadius: '3px',
        transition: 'width 0.1s ease'
      }
    });

    progressContainer.appendChild(progressBar);

    // Controls row
    const controlsRow = create('div', {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        boxSizing: 'border-box'
      }
    });

    // Play/Pause button (smaller)
    const playPauseBtn = create('button', {
      innerHTML: '<i class="fa fa-play"></i>',
      style: {
        background: '#F05F40',
        border: 'none',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        color: 'white',
        fontSize: '1rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease'
      }
    });

    // Time display (smaller)
    const timeDisplay = create('div', {
      style: {
        color: '#ccc',
        fontSize: '0.75rem',
        fontFamily: 'monospace',
        minWidth: '75px',
        textAlign: 'center',
        flex: '0 0 auto'
      }
    }, '0:00 / 0:00');

    // Volume container (smaller)
    const volumeContainer = create('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        flex: '0 0 auto'
      }
    });

    const volumeIcon = create('div', {
      style: {
        color: '#ccc',
        fontSize: '0.9rem'
      },
      innerHTML: '<i class="fa fa-volume-up"></i>'
    });

    const volumeSlider = create('input', {
      type: 'range',
      min: '0',
      max: '100',
      value: '80',
      style: {
        width: '50px',
        height: '4px',
        background: '#333',
        outline: 'none',
        borderRadius: '2px',
        flexShrink: '0'
      }
    });

    // Set initial volume
    audio.volume = 0.8;

    // Player functionality
    let isPlaying = false;
    let duration = 0;

    // Format time helper
    function formatTime(seconds) {
      if (isNaN(seconds)) return '0:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Update progress and time
    function updateProgress() {
      if (audio.duration) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
        timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
      }
    }

    // Play/pause functionality
    playPauseBtn.addEventListener('click', () => {
      if (isPlaying) {
        audio.pause();
        playPauseBtn.innerHTML = '<i class="fa fa-play"></i>';
        playPauseBtn.style.background = '#F05F40';
      } else {
        audio.play();
        playPauseBtn.innerHTML = '<i class="fa fa-pause"></i>';
        playPauseBtn.style.background = '#d44e34';
      }
      isPlaying = !isPlaying;
    });

    // Progress bar click
    progressContainer.addEventListener('click', (e) => {
      if (audio.duration) {
        const rect = progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickRatio = clickX / rect.width;
        audio.currentTime = clickRatio * audio.duration;
      }
    });

    // Volume control
    volumeSlider.addEventListener('input', (e) => {
      audio.volume = e.target.value / 100;
      const volumeLevel = e.target.value;
      if (volumeLevel == 0) {
        volumeIcon.innerHTML = '<i class="fa fa-volume-off"></i>';
      } else if (volumeLevel < 50) {
        volumeIcon.innerHTML = '<i class="fa fa-volume-down"></i>';
      } else {
        volumeIcon.innerHTML = '<i class="fa fa-volume-up"></i>';
      }
    });

    // Audio event listeners
    audio.addEventListener('loadedmetadata', () => {
      duration = audio.duration;
      timeDisplay.textContent = `0:00 / ${formatTime(duration)}`;
    });

    audio.addEventListener('timeupdate', updateProgress);

    audio.addEventListener('ended', () => {
      isPlaying = false;
      playPauseBtn.innerHTML = '<i class="fa fa-play"></i>';
      playPauseBtn.style.background = '#F05F40';
    });

    // Assemble controls
    volumeContainer.appendChild(volumeIcon);
    volumeContainer.appendChild(volumeSlider);
    
    controlsRow.appendChild(playPauseBtn);
    controlsRow.appendChild(timeDisplay);
    controlsRow.appendChild(volumeContainer);

    playerContainer.appendChild(headerRow);
    playerContainer.appendChild(progressContainer);
    playerContainer.appendChild(controlsRow);
    playerContainer.appendChild(audio); // Hidden audio element
    
    return playerContainer;
  }

  function createMediaElement(src, title) {
    if (isVideo(src)) {
      const video = create('video', {
        src,
        autoplay: true,
        loop: true,
        muted: true,
        playsInline: true,
        style: {
          width: '100%',
          maxHeight: '400px',
          objectFit: 'contain',
          display: 'block'
        }
      });
      
      video.addEventListener('loadeddata', () => {
        video.play().catch(e => console.log('Video autoplay failed:', e));
      });
      
      return video;
    } else if (isAudio(src)) {
      // Create custom audio player
      const audioContainer = create('div', {
        style: {
          width: '100%',
          maxHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #2c2c2c, #3a3a3a)',
          borderRadius: '8px',
          padding: '30px 20px',
          gap: '25px'
        }
      });

      // Audio icon
      const audioIcon = create('div', {
        style: {
          fontSize: '4rem',
          color: '#F05F40',
          marginBottom: '10px'
        },
        innerHTML: '<i class="fa fa-podcast"></i>'
      });

      // Create hidden HTML5 audio element
      const audio = create('audio', {
        src,
        preload: 'metadata'
      });

      // Custom player controls container
      const playerContainer = create('div', {
        style: {
          width: '100%',
          maxWidth: '500px',
          background: '#1a1a1a',
          borderRadius: '15px',
          padding: '20px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
        }
      });

      // Progress bar container
      const progressContainer = create('div', {
        style: {
          width: '100%',
          height: '8px',
          background: '#333',
          borderRadius: '4px',
          marginBottom: '15px',
          cursor: 'pointer',
          position: 'relative'
        }
      });

      const progressBar = create('div', {
        style: {
          width: '0%',
          height: '100%',
          background: 'linear-gradient(90deg, #F05F40, #d44e34)',
          borderRadius: '4px',
          transition: 'width 0.1s ease'
        }
      });

      progressContainer.appendChild(progressBar);

      // Controls row
      const controlsRow = create('div', {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '15px'
        }
      });

      // Play/Pause button
      const playPauseBtn = create('button', {
        innerHTML: '<i class="fa fa-play"></i>',
        style: {
          background: '#F05F40',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          color: 'white',
          fontSize: '1.2rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease'
        }
      });

      // Time display
      const timeDisplay = create('div', {
        style: {
          color: '#ccc',
          fontSize: '0.9rem',
          fontFamily: 'monospace',
          minWidth: '100px'
        }
      }, '0:00 / 0:00');

      // Volume container
      const volumeContainer = create('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }
      });

      const volumeIcon = create('div', {
        style: {
          color: '#ccc',
          fontSize: '1rem'
        },
        innerHTML: '<i class="fa fa-volume-up"></i>'
      });

      const volumeSlider = create('input', {
        type: 'range',
        min: '0',
        max: '100',
        value: '80',
        className: 'custom-audio-slider',
        style: {
          width: '80px'
        }
      });

      // Set initial volume
      audio.volume = 0.8;

      // Player functionality
      let isPlaying = false;
      let duration = 0;

      // Format time helper
      function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      }

      // Update progress and time
      function updateProgress() {
        if (audio.duration) {
          const progressPercent = (audio.currentTime / audio.duration) * 100;
          progressBar.style.width = `${progressPercent}%`;
          timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
        }
      }

      // Play/pause functionality
      playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
          audio.pause();
          playPauseBtn.innerHTML = '<i class="fa fa-play"></i>';
          playPauseBtn.style.background = '#F05F40';
        } else {
          audio.play();
          playPauseBtn.innerHTML = '<i class="fa fa-pause"></i>';
          playPauseBtn.style.background = '#d44e34';
        }
        isPlaying = !isPlaying;
      });

      // Progress bar click
      progressContainer.addEventListener('click', (e) => {
        if (audio.duration) {
          const rect = progressContainer.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const clickRatio = clickX / rect.width;
          audio.currentTime = clickRatio * audio.duration;
        }
      });

      // Volume control
      volumeSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value / 100;
        const volumeLevel = e.target.value;
        if (volumeLevel == 0) {
          volumeIcon.innerHTML = '<i class="fa fa-volume-off"></i>';
        } else if (volumeLevel < 50) {
          volumeIcon.innerHTML = '<i class="fa fa-volume-down"></i>';
        } else {
          volumeIcon.innerHTML = '<i class="fa fa-volume-up"></i>';
        }
      });

      // Audio event listeners
      audio.addEventListener('loadedmetadata', () => {
        duration = audio.duration;
        timeDisplay.textContent = `0:00 / ${formatTime(duration)}`;
      });

      audio.addEventListener('timeupdate', updateProgress);

      audio.addEventListener('ended', () => {
        isPlaying = false;
        playPauseBtn.innerHTML = '<i class="fa fa-play"></i>';
        playPauseBtn.style.background = '#F05F40';
      });

      // Assemble controls
      volumeContainer.appendChild(volumeIcon);
      volumeContainer.appendChild(volumeSlider);
      
      controlsRow.appendChild(playPauseBtn);
      controlsRow.appendChild(timeDisplay);
      controlsRow.appendChild(volumeContainer);

      playerContainer.appendChild(progressContainer);
      playerContainer.appendChild(controlsRow);

      audioContainer.appendChild(audioIcon);
      audioContainer.appendChild(playerContainer);
      audioContainer.appendChild(audio); // Hidden audio element
      
      return audioContainer;
    } else {
      return create('img', {
        alt: title,
        style: {
          width: '100%',
          maxHeight: '400px',
          objectFit: 'contain',
          display: 'block',
          transition: 'opacity 0.2s ease'
        }
      });
    }
  }

  function stopMediaPlayback(container, reset = false) {
    if (!container) return;

    container.querySelectorAll('video, audio').forEach((media) => {
      media.pause();
      if (reset) {
        media.currentTime = 0;
      }
    });
  }

  function syncMediaPlayback(container) {
    if (!container) return;

    container.querySelectorAll('video, audio').forEach((media) => {
      const slide = media.closest('.carousel-slide');
      const isVisible = !slide || slide.style.opacity === '1' || slide.classList.contains('active');

      if (!isVisible) {
        media.pause();
        media.currentTime = 0;
        return;
      }

      if (media.tagName === 'VIDEO') {
        media.play().catch((error) => console.log('Video autoplay failed:', error));
      }
    });
  }

  function createGallery(item) {
    let currentIndex = 0;
    const totalSlides = item.media.length;
    
    const galleryContainer = create('div', {
      className: 'portfolio-carousel',
      style: {
        position: 'relative',
        textAlign: 'center'
      }
    });

    // Fixed height carousel container
    const carouselContainer = create('div', {
      style: {
        position: 'relative',
        width: '100%',
        height: '350px',
        overflow: 'hidden',
        borderRadius: '8px',
        background: '#1a1a1a'
      }
    });

    // Create all slides
    const slidesWrapper = create('div', {
      className: 'slides-wrapper',
      style: {
        position: 'relative',
        width: '100%',
        height: '100%'
      }
    });

    // Create slides for each media item
    item.media.forEach((mediaSrc, index) => {
      const slide = create('div', {
        className: 'carousel-slide',
        style: {
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          opacity: index === 0 ? '1' : '0',
          transition: 'opacity 0.4s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      });

      if (isVideo(mediaSrc)) {
        const video = create('video', {
          src: mediaSrc,
          autoplay: true,
          loop: true,
          muted: true,
          playsInline: true,
          style: {
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
          }
        });
        video.addEventListener('loadeddata', () => {
          video.play().catch(e => console.log('Video autoplay failed:', e));
        });
        slide.appendChild(video);
      } else if (isAudio(mediaSrc)) {
        const audioContainer = create('div', {
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #2c2c2c, #3a3a3a)',
            padding: '20px'
          }
        });
        const audioIcon = create('div', {
          style: { fontSize: '4rem', color: '#F05F40', marginBottom: '20px' },
          innerHTML: '<i class="fa fa-podcast"></i>'
        });
        const audioPlayer = createCompactAudioPlayer(mediaSrc, item.title);
        audioContainer.appendChild(audioIcon);
        audioContainer.appendChild(audioPlayer);
        slide.appendChild(audioContainer);
      } else {
        const img = create('img', {
          src: mediaSrc,
          alt: item.title,
          style: {
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            cursor: 'pointer',
            transition: 'transform 0.3s ease'
          }
        });
        // Click to zoom
        img.addEventListener('click', (e) => {
          e.stopPropagation();
          openImageZoom(mediaSrc);
        });
        img.addEventListener('mouseenter', () => {
          img.style.transform = 'scale(1.02)';
        });
        img.addEventListener('mouseleave', () => {
          img.style.transform = 'scale(1)';
        });
        slide.appendChild(img);
      }

      slidesWrapper.appendChild(slide);
    });

    carouselContainer.appendChild(slidesWrapper);

    // Navigation buttons (only if multiple items)
    if (totalSlides > 1) {
      const prevBtn = create('button', {
        innerHTML: '<i class="fa fa-chevron-left"></i>',
        style: {
          position: 'absolute',
          left: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          border: 'none',
          width: '45px',
          height: '45px',
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: '1.2rem',
          zIndex: '10',
          transition: 'background 0.3s ease'
        }
      });

      const nextBtn = create('button', {
        innerHTML: '<i class="fa fa-chevron-right"></i>',
        style: {
          position: 'absolute',
          right: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          border: 'none',
          width: '45px',
          height: '45px',
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: '1.2rem',
          zIndex: '10',
          transition: 'background 0.3s ease'
        }
      });

      prevBtn.addEventListener('mouseenter', () => { prevBtn.style.background = '#F05F40'; });
      prevBtn.addEventListener('mouseleave', () => { prevBtn.style.background = 'rgba(0, 0, 0, 0.7)'; });
      nextBtn.addEventListener('mouseenter', () => { nextBtn.style.background = '#F05F40'; });
      nextBtn.addEventListener('mouseleave', () => { nextBtn.style.background = 'rgba(0, 0, 0, 0.7)'; });

      function updateSlides() {
        const slides = slidesWrapper.querySelectorAll('.carousel-slide');
        slides.forEach((slide, index) => {
          slide.style.opacity = index === currentIndex ? '1' : '0';
        });
        syncMediaPlayback(slidesWrapper);
        counter.textContent = `${currentIndex + 1} / ${totalSlides}`;
        // Update dots
        dots.forEach((dot, index) => {
          dot.style.background = index === currentIndex ? '#F05F40' : 'rgba(255, 255, 255, 0.3)';
          dot.style.width = index === currentIndex ? '30px' : '10px';
        });
      }

      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateSlides();
      });

      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % totalSlides;
        updateSlides();
      });

      carouselContainer.appendChild(prevBtn);
      carouselContainer.appendChild(nextBtn);
    }

    galleryContainer.appendChild(carouselContainer);

    // Dots navigation
    const dotsContainer = create('div', {
      style: {
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '15px'
      }
    });

    const dots = [];
    if (totalSlides > 1) {
      item.media.forEach((_, index) => {
        const dot = create('button', {
          style: {
            width: index === 0 ? '30px' : '10px',
            height: '10px',
            borderRadius: '5px',
            background: index === 0 ? '#F05F40' : 'rgba(255, 255, 255, 0.3)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            padding: '0'
          }
        });
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          currentIndex = index;
          const slides = slidesWrapper.querySelectorAll('.carousel-slide');
          slides.forEach((slide, i) => {
            slide.style.opacity = i === currentIndex ? '1' : '0';
          });
          syncMediaPlayback(slidesWrapper);
          counter.textContent = `${currentIndex + 1} / ${totalSlides}`;
          dots.forEach((d, i) => {
            d.style.background = i === currentIndex ? '#F05F40' : 'rgba(255, 255, 255, 0.3)';
            d.style.width = i === currentIndex ? '30px' : '10px';
          });
        });
        dots.push(dot);
        dotsContainer.appendChild(dot);
      });
      galleryContainer.appendChild(dotsContainer);
    }

    // Counter
    const counter = create('div', {
      style: {
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: '0.85rem',
        marginTop: '10px'
      }
    }, `1 / ${totalSlides}`);
    
    if (totalSlides > 1) {
      galleryContainer.appendChild(counter);
    }

    syncMediaPlayback(slidesWrapper);
    
    return galleryContainer;
  }

  // Image zoom modal function
  function openImageZoom(imageSrc) {
    // Remove any existing zoom modal
    const existingZoom = document.querySelector('.image-zoom-modal');
    if (existingZoom) existingZoom.remove();

    const zoomOverlay = create('div', {
      className: 'image-zoom-modal',
      style: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '20000',
        cursor: 'zoom-out',
        opacity: '0',
        transition: 'opacity 0.3s ease'
      }
    });

    const closeBtn = create('button', {
      innerHTML: '&times;',
      style: {
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(255, 255, 255, 0.1)',
        border: 'none',
        color: 'white',
        fontSize: '2rem',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        cursor: 'pointer',
        transition: 'background 0.3s ease',
        zIndex: '10'
      }
    });

    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = '#F05F40';
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = 'rgba(255, 255, 255, 0.1)';
    });

    const zoomImage = create('img', {
      src: imageSrc,
      alt: 'Zoomed image',
      style: {
        maxWidth: '95vw',
        maxHeight: '95vh',
        objectFit: 'contain',
        borderRadius: '8px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
      }
    });

    zoomOverlay.appendChild(closeBtn);
    zoomOverlay.appendChild(zoomImage);
    document.body.appendChild(zoomOverlay);

    // Animate in
    requestAnimationFrame(() => {
      zoomOverlay.style.opacity = '1';
    });

    // Close handlers
    const closeZoom = () => {
      zoomOverlay.style.opacity = '0';
      setTimeout(() => zoomOverlay.remove(), 300);
    };

    zoomOverlay.addEventListener('click', closeZoom);
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeZoom();
    });

    // Escape key to close
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeZoom();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  function createPodcastCard(item) {
    const card = create('div', { 
      className: 'podcast-card',
      style: {
        background: '#2c2c2c',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        border: '2px solid transparent',
        position: 'relative',
        padding: '20px',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
      }
    });

    // Title (smaller)
    const title = create('h3', {
      style: {
        color: '#F05F40',
        fontSize: '1.2rem',
        fontWeight: '600',
        margin: '0 0 15px 0',
        textAlign: 'center',
        lineHeight: '1.3'
      }
    }, item.title);

    // Description section (full width, above player) - flex-grow to push player down
    const descriptionSection = create('div', {
      className: 'podcast-description',
      style: {
        width: '100%',
        marginBottom: '20px',
        flex: '1 1 auto'
      }
    });

    const description = create('div', {
      style: {
        color: '#ddd',
        lineHeight: '1.5',
        fontSize: '0.95rem',
        whiteSpace: 'pre-line'
      }
    });
    
    description.innerHTML = item.description
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #F05F40;">$1</strong>')
      .replace(/\n/g, '<br>');

    descriptionSection.appendChild(description);

    // Audio player section (below description, centered) - anchored to bottom
    const audioSection = create('div', {
      className: 'podcast-audio',
      style: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        marginTop: 'auto',
        paddingTop: '15px',
        flex: '0 0 auto'
      }
    });

    // Create the compact audio player
    if (item.media && item.media.length > 0) {
      const audioPlayer = createCompactAudioPlayer(item.media[0], item.title);
      audioSection.appendChild(audioPlayer);
    }

    card.appendChild(title);
    card.appendChild(descriptionSection);
    card.appendChild(audioSection);

    // Add responsive CSS to the document head if not already added
    const styleId = 'podcast-responsive-styles';
    if (!document.querySelector(`#${styleId}`)) {
      const style = create('style', { id: styleId });
      style.textContent = `
        .podcast-card {
          box-sizing: border-box;
        }
        .podcast-card * {
          box-sizing: border-box;
        }
        @media (max-width: 767px) {
          .podcast-card {
            margin: 0 5px;
            padding: 18px !important;
          }
          .portfolio-grid[data-podcast-grid="true"] {
            grid-template-columns: 1fr !important;
            padding: 0 15px !important;
            gap: 25px !important;
          }
        }
        @media (max-width: 650px) {
          .portfolio-grid {
            padding: 0 10px !important;
          }
          .podcast-card {
            padding: 15px !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Hover effects
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-2px)';
      card.style.borderColor = '#F05F40';
      card.style.boxShadow = '0 6px 20px rgba(240, 95, 64, 0.12)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.borderColor = 'transparent';
      card.style.boxShadow = 'none';
    });

    return card;
  }

  function createCard(item) {
    // Use special layout for audio/podcast items
    if (item.kind === 'audio') {
      return createPodcastCard(item);
    }

    // Direct link cards: no modal, no thumbnail, just go straight to the URL
    if (item.kind === 'link') {
      const targetHref = item.href || (item.links && item.links[0] && item.links[0].href);
      const linkCard = create('a', {
        className: 'portfolio-card portfolio-card--link',
        href: targetHref || '#',
        target: '_blank',
        rel: 'noopener',
        style: {
          background: '#2c2c2c',
          borderRadius: '12px',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          border: '2px solid transparent',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80px',
          padding: '18px 20px',
          textDecoration: 'none',
          textAlign: 'center'
        }
      });

      const inner = create('div', {
        style: {
          color: '#F05F40',
          fontSize: '1.2rem',
          fontWeight: '600'
        }
      }, item.title);
      linkCard.appendChild(inner);

      linkCard.addEventListener('mouseenter', () => {
        linkCard.style.transform = 'translateY(-3px)';
        linkCard.style.borderColor = '#F05F40';
        linkCard.style.boxShadow = '0 6px 20px rgba(240, 95, 64, 0.18)';
      });
      linkCard.addEventListener('mouseleave', () => {
        linkCard.style.transform = 'translateY(0)';
        linkCard.style.borderColor = 'transparent';
        linkCard.style.boxShadow = 'none';
      });

      return linkCard;
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

    // Always use first media item with blur effect (with safety check)
    if (item.media && item.media.length > 0) {
      const img = create('img', {
        src: item.media[0],
        alt: item.title,
        style: {
          width: '100%',
          height: '200px',
          objectFit: 'cover',
          display: 'block',
          filter: 'blur(1.5px)',
          transition: 'filter 0.3s ease'
        }
      });
      card.appendChild(img);
    } else {
      // Placeholder for items without media
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
    const cardImg = card.querySelector('img');
    
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-5px)';
      card.style.borderColor = '#F05F40';
      card.style.boxShadow = '0 10px 30px rgba(240, 95, 64, 0.2)';
      if (cardImg) {
        cardImg.style.filter = 'blur(0px)';
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.borderColor = 'transparent';
      card.style.boxShadow = 'none';
      if (cardImg) {
        cardImg.style.filter = 'blur(1.5px)';
      }
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
      stopMediaPlayback(existingModal, true);
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

      if (item.kind === 'pdf' || item.kind === 'doc') {
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
            bottom: '30px',
            right: '30px',
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
      } else if (item.media.length > 1) {
        // Multiple media items - use gallery
        mediaContainer.appendChild(createGallery(item));
      } else {
        // Single media item (image or video)
        const singleMedia = createMediaElement(item.media[0], item.title);
        singleMedia.style.borderRadius = '8px';
        // For single images, ensure src is set properly
        if (singleMedia.tagName === 'IMG') {
          singleMedia.src = item.media[0];
        }
        mediaContainer.appendChild(singleMedia);
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
          fontSize: '1.1rem',
          whiteSpace: 'pre-line' // This will handle \n as line breaks
        }
      });
      // Set innerHTML to handle markdown-style formatting
      description.innerHTML = item.description
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #F05F40;">$1</strong>')
        .replace(/\n/g, '<br>');
      body.appendChild(description);
    }

    // Links
    if (item.links && item.links.length > 0) {
      const linksContainer = create('div', {
        style: {
          display: 'flex',
          justifyContent: 'center',
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
      syncMediaPlayback(backdrop);
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
    stopMediaPlayback(backdrop, true);
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
    
    // Define the desired order of categories
    const categoryOrder = ['Research', 'Highlighted Projects', 'Podcast - Spiritual Journeys', 'Podcast - Faith & Family'];
    
    // Render categories in the specified order
    categoryOrder.forEach(category => {
      const items = groups[category];
      if (!items || items.length === 0) return;

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

      // Use different grid layout for podcast categories
      const isPodcastCategory = category.includes('Podcast');
      
      const grid = create('div', {
        className: 'portfolio-grid',
        style: {
          display: 'grid',
          gridTemplateColumns: isPodcastCategory 
            ? 'repeat(auto-fill, minmax(min(500px, 100%), 1fr))' 
            : 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '25px',
          padding: '0 30px',
          maxWidth: '1200px',
          margin: '0 auto'
        }
      });

      // Add data attribute for podcast categories
      if (isPodcastCategory) {
        grid.setAttribute('data-podcast-grid', 'true');
      }

      items.forEach(item => {
        grid.appendChild(createCard(item));
      });

      section.appendChild(title);
      section.appendChild(divider);
      section.appendChild(grid);
      container.appendChild(section);
    });
    
    // Render any remaining categories not in the specified order
    Object.entries(groups).forEach(([category, items]) => {
      if (categoryOrder.includes(category)) return;
      
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

      // Use different grid layout for podcast categories
      const isPodcastCategory = category.includes('Podcast');
      
      const grid = create('div', {
        className: 'portfolio-grid',
        style: {
          display: 'grid',
          gridTemplateColumns: isPodcastCategory 
            ? 'repeat(auto-fill, minmax(min(500px, 100%), 1fr))' 
            : 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '25px',
          padding: '0 30px',
          maxWidth: '1200px',
          margin: '0 auto'
        }
      });

      // Add data attribute for podcast categories
      if (isPodcastCategory) {
        grid.setAttribute('data-podcast-grid', 'true');
      }

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
