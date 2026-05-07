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

  function activateDemolitionCar(e) {
    if (document.getElementById('demolition-car-el')) return;

    // ---------- tunables ----------
    const CAR_SIZE     = 64;       // square (PNG is top-down)
    const HITBOX_W     = 46;       // tighter than the sprite for fairer collisions
    const HITBOX_H     = 46;
    const MAX_FWD      = 11;       // top forward speed (px/frame @ 60fps)
    const MAX_REV      = -5;
    const ACCEL_FWD    = 0.32;
    const ACCEL_REV    = 0.22;
    const COAST_DRAG   = 0.04;     // when no input
    const BRAKE_DRAG   = 0.55;     // when actively braking (opposite input)
    const TURN_BASE    = 0.055;    // rad / frame at low speed
    const TURN_FAST    = 0.085;    // rad / frame near max speed
    const GRIP         = 0.18;     // 0 = pure ice, 1 = on rails (we want some slide)
    const HANDBRAKE_GRIP = 0.04;   // when SHIFT held — proper drift
    const EXIT_MARGIN  = 200;
    // ------------------------------

    document.body.style.userSelect = 'none';

    const noClickStyle = document.createElement('style');
    noClickStyle.id = 'demolition-no-click';
    noClickStyle.textContent = `
      * { pointer-events: none !important; cursor: crosshair !important; }
      [data-demolition-ui], [data-demolition-ui] * {
        pointer-events: auto !important;
        cursor: auto !important;
      }
      @keyframes dm-bounce-in {
        0%   { transform: translate(-50%, -120%) scale(0.6); opacity: 0; }
        70%  { transform: translate(-50%, 0)     scale(1.05); opacity: 1; }
        100% { transform: translate(-50%, 0)     scale(1);     opacity: 1; }
      }
      @keyframes dm-shake {
        0%, 100% { transform: translate(0,0); }
        25%      { transform: translate(-2px, 1px); }
        50%      { transform: translate(2px, -1px); }
        75%      { transform: translate(-1px, 2px); }
      }
      @keyframes dm-explode {
        0%   { transform: translate(-50%,-50%) scale(0.4) rotate(0deg);  opacity: 1; }
        60%  { transform: translate(-50%,-50%) scale(1.6) rotate(15deg); opacity: 1; }
        100% { transform: translate(-50%,-50%) scale(2.2) rotate(25deg); opacity: 0; }
      }
      @keyframes dm-debris {
        0%   { transform: translate(0,0) rotate(0deg); opacity: 1; }
        100% { transform: translate(var(--dx), var(--dy)) rotate(var(--dr)); opacity: 0; }
      }
    `;
    document.head.appendChild(noClickStyle);

    // ---------- state ----------
    let carX = (e && e.clientX != null ? e.clientX : window.innerWidth / 2)  + window.scrollX - CAR_SIZE / 2;
    let carY = (e && e.clientY != null ? e.clientY : window.innerHeight / 2) + window.scrollY - CAR_SIZE / 2;
    let carAngle = -Math.PI / 2;            // facing up at spawn
    let mouseX = (e && e.clientX != null) ? e.clientX : window.innerWidth / 2;
    let mouseY = (e && e.clientY != null) ? e.clientY : window.innerHeight / 2;
    let speed = 0;
    let velX = 0, velY = 0;
    let throttle = 0;       // -1 reverse · 0 coast · +1 forward
    let handbrake = false;
    let killCount = 0;
    let smokeFrame = 0;
    let shakeUntil = 0;
    let animId = null;
    // ---------------------------

    // ---------- car element (PNG sprite) ----------
    const carEl = document.createElement('div');
    carEl.id = 'demolition-car-el';
    carEl.dataset.demolitionUi = 'true';
    Object.assign(carEl.style, {
      position: 'absolute',
      width: CAR_SIZE + 'px',
      height: CAR_SIZE + 'px',
      zIndex: '99999',
      pointerEvents: 'none',
      transformOrigin: '50% 50%',
      left: carX + 'px',
      top: carY + 'px',
      filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.55))',
      backgroundImage: 'url("/stuff/car.png")',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      willChange: 'transform, left, top'
    });

    // ---------- HUD ----------
    const hud = document.createElement('div');
    hud.id = 'demolition-counter';
    hud.dataset.demolitionUi = 'true';
    Object.assign(hud.style, {
      position: 'fixed',
      top: '18px',
      left: '50%',
      zIndex: '99999',
      background: 'rgba(15,15,18,0.88)',
      color: '#fff',
      padding: '10px 22px',
      borderRadius: '999px',
      fontFamily: 'Comfortaa, Segoe UI, sans-serif',
      fontWeight: '700',
      fontSize: '0.95rem',
      border: '1px solid rgba(240,95,64,0.6)',
      boxShadow: '0 6px 30px rgba(0,0,0,0.45)',
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
      animation: 'dm-bounce-in 0.45s cubic-bezier(.34,1.56,.64,1) both'
    });

    // ---------- help / controls ----------
    const help = document.createElement('div');
    help.dataset.demolitionUi = 'true';
    Object.assign(help.style, {
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      zIndex: '99999',
      background: 'rgba(15,15,18,0.85)',
      color: '#ddd',
      padding: '10px 14px',
      borderRadius: '12px',
      fontFamily: 'Comfortaa, Segoe UI, sans-serif',
      fontSize: '0.78rem',
      lineHeight: '1.55',
      border: '1px solid rgba(255,255,255,0.08)',
      pointerEvents: 'none',
      boxShadow: '0 6px 30px rgba(0,0,0,0.4)'
    });
    help.innerHTML = `
      <div style="color:#F05F40;font-weight:700;margin-bottom:4px">Controls</div>
      <div><b>Mouse</b> · steer toward cursor</div>
      <div><b>Left&nbsp;click</b> · throttle · <b>Right click</b> · reverse</div>
      <div><b>Shift</b> · handbrake / drift</div>
      <div><b>Esc</b> · quit</div>
    `;

    const stopBtn = document.createElement('button');
    stopBtn.textContent = '✕ Stop (Esc)';
    stopBtn.dataset.demolitionUi = 'true';
    Object.assign(stopBtn.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: '99999',
      background: '#F05F40',
      color: '#fff',
      border: 'none',
      borderRadius: '999px',
      padding: '10px 18px',
      fontFamily: 'Comfortaa, Segoe UI, sans-serif',
      fontWeight: '700',
      fontSize: '0.85rem',
      cursor: 'pointer',
      boxShadow: '0 6px 18px rgba(240,95,64,0.45)',
      transition: 'background 0.2s ease, transform 0.15s ease'
    });
    stopBtn.addEventListener('mouseenter', () => { stopBtn.style.background = '#c84b15'; stopBtn.style.transform = 'translateY(-1px)'; });
    stopBtn.addEventListener('mouseleave', () => { stopBtn.style.background = '#F05F40'; stopBtn.style.transform = 'none'; });
    stopBtn.addEventListener('click', () => stop(true));

    // ---------- destroyable scan ----------
    const DESTROY_SELECTOR = [
      'h1','h2','h3','h4','h5','h6',
      'p','li','blockquote',
      'img','video',
      '.podcast-description','.podcast-audio',
      '.card-title',
      '.portfolio-card','.portfolio-card--easter-egg',
      '.contact-card'
    ].join(', ');

    function isVisible(el) {
      if (!el || !el.isConnected) return false;
      if (el.dataset.demolished) return false;
      if (el.closest('[data-demolition-ui]')) return false;
      if (el.closest('[data-site-nav]')) return false;        // site-nav drawer items
      const cs = window.getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility !== 'visible' || cs.opacity === '0') return false;
      const r = el.getBoundingClientRect();
      // require meaningful, on-document size
      if (r.width < 24 || r.height < 18) return false;
      return true;
    }

    function scanDestroyables() {
      const all = Array.from(document.querySelectorAll(DESTROY_SELECTOR)).filter(isVisible);
      // de-dupe nested: drop any that have a destroyable ancestor in the same set
      const set = new Set(all);
      return all.filter(el => {
        let p = el.parentElement;
        while (p) { if (set.has(p)) return false; p = p.parentElement; }
        return true;
      });
    }

    let destroyables = scanDestroyables();
    const totalDestroyable = destroyables.length;

    function setHud(text, accent) {
      hud.style.color = accent || '#fff';
      hud.textContent = text;
    }
    setHud(`🎯 ${totalDestroyable} targets · 0 destroyed`);

    // ---------- input ----------
    function onMouseMove(ev) { mouseX = ev.clientX; mouseY = ev.clientY; }
    function onMouseDown(ev) {
      if (ev.button === 0) throttle = 1;
      else if (ev.button === 2) throttle = -1;
    }
    function onMouseUp(ev) {
      if (ev.button === 0 && throttle === 1) throttle = 0;
      else if (ev.button === 2 && throttle === -1) throttle = 0;
    }
    function onContextMenu(ev) { ev.preventDefault(); }
    function onKeyDown(ev) {
      if (ev.key === 'Escape') stop(true);
      else if (ev.key === 'Shift') handbrake = true;
    }
    function onKeyUp(ev) {
      if (ev.key === 'Shift') handbrake = false;
    }
    function onBlur() { throttle = 0; handbrake = false; }

    // ---------- effects ----------
    function spawnExplosion(cx, cy, size) {
      const burst = document.createElement('div');
      burst.dataset.demolitionUi = 'true';
      const fs = Math.max(1.4, Math.min(4.5, Math.sqrt(size) / 5));
      Object.assign(burst.style, {
        position: 'fixed',
        left: cx + 'px',
        top: cy + 'px',
        fontSize: fs + 'rem',
        zIndex: '100000',
        pointerEvents: 'none',
        transform: 'translate(-50%,-50%)',
        animation: 'dm-explode 0.55s ease-out forwards',
        textShadow: '0 0 20px rgba(255,180,80,0.8)'
      });
      burst.textContent = '💥';
      document.body.appendChild(burst);
      setTimeout(() => burst.remove(), 600);

      // debris
      const colors = ['#F05F40','#ffb347','#ffe66d','#fff'];
      const count = Math.min(10, Math.max(4, Math.floor(size / 3000)));
      for (let i = 0; i < count; i++) {
        const d = document.createElement('div');
        d.dataset.demolitionUi = 'true';
        const ang = Math.random() * Math.PI * 2;
        const dist = 40 + Math.random() * 80;
        const sz = 4 + Math.random() * 6;
        Object.assign(d.style, {
          position: 'fixed',
          left: cx + 'px',
          top: cy + 'px',
          width: sz + 'px',
          height: sz + 'px',
          borderRadius: '2px',
          background: colors[(Math.random() * colors.length) | 0],
          zIndex: '100000',
          pointerEvents: 'none',
          animation: 'dm-debris 0.7s ease-out forwards'
        });
        d.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
        d.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
        d.style.setProperty('--dr', (Math.random() * 720 - 360) + 'deg');
        document.body.appendChild(d);
        setTimeout(() => d.remove(), 750);
      }
    }

    function spawnSmoke(px, py, intensity) {
      const el = document.createElement('div');
      el.dataset.demolitionUi = 'true';
      const size = 8 + Math.random() * 8 + intensity * 4;
      Object.assign(el.style, {
        position: 'absolute',
        left: (px - size / 2) + 'px',
        top: (py - size / 2) + 'px',
        width: size + 'px',
        height: size + 'px',
        borderRadius: '50%',
        background: 'rgba(180,180,180,0.55)',
        zIndex: '99997',
        pointerEvents: 'none',
        transition: 'transform 0.9s ease-out, opacity 0.9s ease-out',
        filter: 'blur(1px)'
      });
      document.body.appendChild(el);
      requestAnimationFrame(() => {
        el.style.transform = 'scale(' + (3 + intensity) + ')';
        el.style.opacity = '0';
      });
      setTimeout(() => el.remove(), 900);
    }

    function demolish(el) {
      if (el.dataset.demolished) return;
      el.dataset.demolished = 'true';
      const rect = el.getBoundingClientRect();
      const sz = rect.width * rect.height;
      // Visual: shrink-out instead of just hiding, so users *see* it die.
      el.style.transition = 'transform 0.22s ease-in, opacity 0.22s ease-in';
      el.style.transformOrigin = '50% 50%';
      el.style.transform = 'scale(0.6) rotate(' + (Math.random() * 30 - 15) + 'deg)';
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
      setTimeout(() => { el.style.visibility = 'hidden'; }, 220);

      spawnExplosion(rect.left + rect.width / 2, rect.top + rect.height / 2, sz);
      shakeUntil = performance.now() + 220;

      killCount++;
      const remaining = totalDestroyable - killCount;
      if (remaining > 0) {
        setHud(`💥 ${killCount} destroyed · ${remaining} to go`, '#F05F40');
      } else {
        setHud(`🏆 Total demolition! Reloading…`, '#ffe66d');
        setTimeout(() => stop(true), 1600);
      }
    }

    function rectsOverlap(ax, ay, aw, ah, b) {
      return ax < b.right && ax + aw > b.left && ay < b.bottom && ay + ah > b.top;
    }

    // ---------- camera ----------
    function followCamera() {
      const targetX = carX + CAR_SIZE / 2 - window.innerWidth / 2;
      const targetY = carY + CAR_SIZE / 2 - window.innerHeight / 2;
      const docW = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);
      const docH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      const maxX = Math.max(0, docW - window.innerWidth);
      const maxY = Math.max(0, docH - window.innerHeight);
      window.scrollTo({
        left: Math.min(maxX, Math.max(0, targetX)),
        top:  Math.min(maxY, Math.max(0, targetY)),
        behavior: 'instant'
      });
    }

    // ---------- main loop ----------
    let lastT = performance.now();
    function loop(now) {
      const dt = Math.min(2, (now - lastT) / 16.667); // normalise to ~60fps
      lastT = now;

      // --- speed update ---
      if (throttle > 0) {
        speed += ACCEL_FWD * dt;
        if (speed > MAX_FWD) speed = MAX_FWD;
      } else if (throttle < 0) {
        speed -= ACCEL_REV * dt;
        if (speed < MAX_REV) speed = MAX_REV;
      } else {
        // coast
        speed *= Math.pow(1 - COAST_DRAG, dt);
        if (Math.abs(speed) < 0.05) speed = 0;
      }
      // braking (throttle opposite to current motion) → quick stop
      if ((throttle > 0 && speed < 0) || (throttle < 0 && speed > 0)) {
        speed *= Math.pow(1 - BRAKE_DRAG, dt);
      }

      // --- steering: heading toward mouse, turn rate scaled by speed ---
      const carCenterVX = carX - window.scrollX + CAR_SIZE / 2;
      const carCenterVY = carY - window.scrollY + CAR_SIZE / 2;
      const desiredAngle = Math.atan2(mouseY - carCenterVY, mouseX - carCenterVX);
      let diff = desiredAngle - carAngle;
      while (diff >  Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      const speedRatio = Math.min(1, Math.abs(speed) / MAX_FWD);
      const turnRate = TURN_BASE + (TURN_FAST - TURN_BASE) * speedRatio;
      // when reversing, invert steering (so cursor still drags the nose)
      const steerSign = speed < 0 ? -1 : 1;
      // tiny dead-zone so the car doesn't jitter when mouse sits on it
      if (Math.abs(diff) > 0.02 && Math.abs(speed) > 0.05) {
        carAngle += steerSign * Math.sign(diff) * Math.min(Math.abs(diff), turnRate * dt);
      }

      // --- arcade drift physics ---
      // intended velocity along heading
      const intX = Math.cos(carAngle) * speed;
      const intY = Math.sin(carAngle) * speed;
      // grip: blend lateral velocity toward forward, leave forward almost untouched.
      // decompose current vel into forward / lateral wrt heading
      const cosA = Math.cos(carAngle), sinA = Math.sin(carAngle);
      const fwd = velX * cosA + velY * sinA;
      const lat = -velX * sinA + velY * cosA;
      const grip = handbrake ? HANDBRAKE_GRIP : GRIP;
      const newFwd = fwd + (speed - fwd) * Math.min(1, 0.6 * dt); // strong forward tracking
      const newLat = lat * Math.pow(1 - grip, dt);                // gradual side-grip
      velX = cosA * newFwd - sinA * newLat;
      velY = sinA * newFwd + cosA * newLat;
      carX += velX * dt;
      carY += velY * dt;

      // --- smoke / drift trail ---
      smokeFrame++;
      const velMag = Math.hypot(velX, velY);
      const driftMag = Math.abs(newLat);
      if (velMag > 1.5 && (handbrake || driftMag > 0.6) && smokeFrame % 2 === 0) {
        const rearOff = CAR_SIZE * 0.38;
        const wheelOff = CAR_SIZE * 0.28;
        const rxL = carX + CAR_SIZE / 2 - cosA * rearOff - (-sinA) * wheelOff;
        const ryL = carY + CAR_SIZE / 2 - sinA * rearOff - ( cosA) * wheelOff;
        const rxR = carX + CAR_SIZE / 2 - cosA * rearOff + (-sinA) * wheelOff;
        const ryR = carY + CAR_SIZE / 2 - sinA * rearOff + ( cosA) * wheelOff;
        const intensity = Math.min(1, driftMag / 6);
        spawnSmoke(rxL, ryL, intensity);
        spawnSmoke(rxR, ryR, intensity);
      }

      // --- render ---
      // sprite faces UP, our angle 0 = right; rotate +90° so nose follows heading.
      const renderDeg = (carAngle * 180 / Math.PI) + 90;
      let shakeX = 0, shakeY = 0;
      if (now < shakeUntil) {
        const k = (shakeUntil - now) / 220;
        shakeX = (Math.random() - 0.5) * 6 * k;
        shakeY = (Math.random() - 0.5) * 6 * k;
      }
      carEl.style.left = carX + 'px';
      carEl.style.top  = carY + 'px';
      carEl.style.transform = `translate(${shakeX}px, ${shakeY}px) rotate(${renderDeg}deg)`;

      followCamera();

      // --- bounds check ---
      const docW = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);
      const docH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      if (
        carX + CAR_SIZE < -EXIT_MARGIN ||
        carX > docW + EXIT_MARGIN ||
        carY + CAR_SIZE < -EXIT_MARGIN ||
        carY > docH + EXIT_MARGIN
      ) {
        stop(true);
        return;
      }

      // --- collisions (against viewport rects) ---
      destroyables = destroyables.filter(el => !el.dataset.demolished && el.isConnected);
      const hbX = (carX - window.scrollX) + (CAR_SIZE - HITBOX_W) / 2;
      const hbY = (carY - window.scrollY) + (CAR_SIZE - HITBOX_H) / 2;
      for (let i = 0; i < destroyables.length; i++) {
        const el = destroyables[i];
        const r = el.getBoundingClientRect();
        if (r.width < 16 || r.height < 12) continue;
        if (rectsOverlap(hbX, hbY, HITBOX_W, HITBOX_H, r)) {
          demolish(el);
          // small bounce — bleed some forward speed on impact
          speed *= 0.78;
        }
      }

      animId = requestAnimationFrame(loop);
    }

    function stop(andReload) {
      cancelAnimationFrame(animId);
      document.body.style.userSelect = '';
      const ncs = document.getElementById('demolition-no-click');
      if (ncs) ncs.remove();
      carEl.remove();
      hud.remove();
      help.remove();
      stopBtn.remove();
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup',   onMouseUp);
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup',   onKeyUp);
      window.removeEventListener('blur', onBlur);
      if (andReload) location.reload();
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup',   onMouseUp);
    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup',   onKeyUp);
    window.addEventListener('blur', onBlur);

    document.body.appendChild(carEl);
    document.body.appendChild(hud);
    document.body.appendChild(help);
    document.body.appendChild(stopBtn);

    animId = requestAnimationFrame(loop);
  }

  function createCard(item) {
    // Demolition Mode easter egg
    if (item.id === 'demolition-car') {
      const demoCard = create('div', {
        className: 'portfolio-card portfolio-card--easter-egg',
        style: {
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2a1810 100%)',
          borderRadius: '16px',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
          border: '2px solid #333',
          minHeight: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '10px',
          padding: '24px 20px',
          position: 'relative',
          userSelect: 'none'
        }
      });

      const icon = create('div', { style: { fontSize: '2.5rem', lineHeight: '1' } });
      icon.textContent = '🚗';

      const label = create('div', {
        style: {
          color: '#F05F40',
          fontWeight: '700',
          fontSize: '1.1rem',
          textAlign: 'center',
          letterSpacing: '0.02em'
        }
      }, 'Demolition Mode');

      const hint = create('div', {
        style: {
          color: '#666',
          fontSize: '0.8rem',
          textAlign: 'center'
        }
      }, 'drive with your mouse · destroy everything');

      demoCard.appendChild(icon);
      demoCard.appendChild(label);
      demoCard.appendChild(hint);

      demoCard.addEventListener('mouseenter', () => {
        demoCard.style.transform = 'translateY(-5px)';
        demoCard.style.borderColor = '#F05F40';
        demoCard.style.boxShadow = '0 10px 30px rgba(240, 95, 64, 0.25)';
      });
      demoCard.addEventListener('mouseleave', () => {
        demoCard.style.transform = 'translateY(0)';
        demoCard.style.borderColor = '#333';
        demoCard.style.boxShadow = 'none';
      });
      demoCard.addEventListener('click', (e) => activateDemolitionCar(e));

      return demoCard;
    }

    // Use special layout for audio/podcast items
    if (item.kind === 'audio') {
      return createPodcastCard(item);
    }

    // Direct link cards: no modal, no thumbnail, just go straight to the URL
    if (item.kind === 'link') {
      const targetHref = item.href || (item.links && item.links[0] && item.links[0].href);

      // Special Blizzard Armory-style card for the Yükisan Fan Club
      if (item.id === 'yukisan-fan-club') {
        const armoryCard = create('a', {
          className: 'portfolio-card portfolio-card--armory',
          href: targetHref || '#',
          target: '_blank',
          rel: 'noopener',
          style: {
            display: 'block',
            position: 'relative',
            background: '#111',
            borderRadius: '16px',
            overflow: 'hidden',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
            border: '1px solid #2e2e2e',
            minHeight: '300px'
          }
        });

        const portrait = create('img', {
          src: '/img/yuki_portrait.png',
          alt: 'Yükisan',
          style: {
            position: 'absolute',
            right: '0',
            bottom: '0',
            height: '100%',
            width: '65%',
            objectFit: 'cover',
            objectPosition: 'top center',
            display: 'block'
          }
        });

        const overlay = create('div', {
          style: {
            position: 'absolute',
            inset: '0',
            background: 'linear-gradient(to right, rgba(17,17,17,1) 38%, rgba(17,17,17,0.55) 65%, rgba(17,17,17,0.1) 100%)',
            pointerEvents: 'none'
          }
        });

        const content = create('div', {
          style: {
            position: 'absolute',
            inset: '0',
            padding: '22px 22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }
        });

        const topSection = create('div', {});

        const armoryLabel = create('div', {
          style: {
            color: '#F05F40',
            fontSize: '0.7rem',
            fontWeight: '700',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: '10px'
          }
        }, 'Lore & Armory');

        const charName = create('div', {
          style: {
            color: '#ffffff',
            fontSize: '1.9rem',
            fontWeight: '700',
            lineHeight: '1.1',
            marginBottom: '8px',
            textShadow: '0 2px 8px rgba(0,0,0,0.6)'
          }
        }, 'Yükisan');

        const serverInfo = create('div', {
          style: {
            color: '#999',
            fontSize: '0.85rem',
            fontWeight: '500'
          }
        }, 'Dalaran · EU');

        topSection.appendChild(armoryLabel);
        topSection.appendChild(charName);
        topSection.appendChild(serverInfo);

        const openLink = create('div', {
          style: {
            color: '#F05F40',
            fontSize: '0.85rem',
            fontWeight: '600',
            letterSpacing: '0.02em'
          }
        }, 'Got to Yükisan Fan Club →');

        content.appendChild(topSection);
        content.appendChild(openLink);

        armoryCard.appendChild(portrait);
        armoryCard.appendChild(overlay);
        armoryCard.appendChild(content);

        armoryCard.addEventListener('mouseenter', () => {
          armoryCard.style.transform = 'translateY(-5px)';
          armoryCard.style.borderColor = '#F05F40';
          armoryCard.style.boxShadow = '0 12px 32px rgba(240, 95, 64, 0.25)';
        });
        armoryCard.addEventListener('mouseleave', () => {
          armoryCard.style.transform = 'translateY(0)';
          armoryCard.style.borderColor = '#2e2e2e';
          armoryCard.style.boxShadow = 'none';
        });

        return armoryCard;
      }

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
