// Homepage Drive Mode — Navigate the page by driving a car
// Spawns a drivable car at the button location and allows users to
// drive around the page, highlighting interactive elements and pressing E to interact
(function () {
  'use strict';

  var isActive = false;
  var carElement = null;
  var uiContainer = null;
  var carState = null;
  var inputState = null;
  var inputHandlers = null;
  var animationFrameId = null;
  var lastTime = null;

  var interactiveElements = [];
  var nearestElement = null;
  var interactHint = null;

  var originalButton = null;
  var hadokenButton = null;
  var carStartScreenX = 0;
  var carStartScreenY = 0;

  // ========== ELEMENT COLLECTION ==========
  function collectInteractiveElements() {
    var elements = [];

    // Collect all links and buttons (except navigation)
    document.querySelectorAll('a.btn, a[href]:not([data-site-nav] a)').forEach(function (el) {
      // Skip navigation and trigger button
      if (el.closest('[data-site-nav]')) return;
      if (el.id === 'main-button') return;
      if (el.closest('#homepage-drive-ui')) return;
      // Skip button-link elements (like yuki_bg button)
      if (el.classList.contains('button-link')) return;
      if (el.closest('.button-link')) return;
      // Skip Hadoken button
      if (el.href && el.href.includes('#services') && el.textContent.includes('Hadoken')) return;
      // Skip sections - they're not interactive
      if (el.tagName === 'SECTION') return;
      // Skip anchors without href
      if (!el.href) return;

      var rect = el.getBoundingClientRect();
      var pageY = rect.top + window.scrollY;
      var pageX = rect.left + window.scrollX;

      elements.push({
        el: el,
        centerX: pageX + rect.width / 2,
        centerY: pageY + rect.height / 2,
        width: rect.width,
        height: rect.height,
        originalOutline: el.style.outline,
        type: determineElementType(el),
        action: determineElementAction(el)
      });
    });

    return elements;
  }

  function determineElementType(el) {
    if (el.tagName === 'SECTION') return 'section';
    if (el.classList.contains('btn')) return 'button';
    if (el.href && el.href.startsWith('#')) return 'anchor';
    return 'link';
  }

  function determineElementAction(el) {
    var href = el.href || '';
    if (href.startsWith('#')) return 'scroll-to';
    if (href.startsWith(window.location.origin)) return 'navigate-internal';
    if (href.startsWith('http')) return 'navigate-external';
    if (href.startsWith('mailto:') || href.startsWith('tel:')) return 'trigger-click';
    return 'unknown';
  }

  // ========== SCROLL PREVENTION ==========
  function preventUserScroll(e) {
    if (isActive) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  function preventScrollKeys(e) {
    if (!isActive) return;

    var scrollKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'];
    if (scrollKeys.includes(e.key)) {
      e.preventDefault();
    }
  }

  function attachScrollPrevention() {
    window.addEventListener('wheel', preventUserScroll, { passive: false });
    window.addEventListener('keydown', preventScrollKeys, { passive: false });
    window.addEventListener('touchmove', preventUserScroll, { passive: false });
  }

  function detachScrollPrevention() {
    window.removeEventListener('wheel', preventUserScroll);
    window.removeEventListener('keydown', preventScrollKeys);
    window.removeEventListener('touchmove', preventUserScroll);
  }

  // ========== UI CREATION ==========
  function createUI() {
    var container = document.createElement('div');
    container.id = 'homepage-drive-ui';
    container.innerHTML =
      '<div id="drive-interact-hint" class="hidden">Press E</div>' +
      '<button id="drive-exit-btn">✕ Exit (Esc)</button>';

    document.body.appendChild(container);

    interactHint = document.getElementById('drive-interact-hint');
    document.getElementById('drive-exit-btn').addEventListener('click', deactivate);

    return container;
  }

  // ========== CAR SPAWN ==========
  function spawnCar(buttonElement) {
    // Get button position
    var rect = buttonElement.getBoundingClientRect();
    carStartScreenX = rect.left + rect.width / 2;
    carStartScreenY = rect.top + rect.height / 2;

    // Hide button
    originalButton = buttonElement;
    buttonElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    buttonElement.style.opacity = '0';
    buttonElement.style.transform = 'scale(0.8)';

    // Create car element
    carElement = document.createElement('div');
    carElement.id = 'homepage-drive-car';
    carElement.style.cssText =
      'position: fixed;' +
      'width: 64px;' +
      'height: 64px;' +
      'left: ' + (carStartScreenX - 32) + 'px;' +
      'top: ' + (carStartScreenY - 32) + 'px;' +
      'background: url(\'/stuff/car.png\') center/contain no-repeat;' +
      'filter: drop-shadow(0 6px 8px rgba(0,0,0,.55));' +
      'will-change: transform;' +
      'transform-origin: 50% 50%;' +
      'pointer-events: none;' +
      'z-index: 99999;' +
      'opacity: 0;' +
      'transition: opacity 0.3s ease;';

    document.body.appendChild(carElement);

    // Initialize car state at spawn position
    // Car X/Y are in page coordinates
    carState = window.CarPhysics.createCarState(
      carStartScreenX - window.scrollX, // pageX at spawn
      carStartScreenY + window.scrollY, // pageY at spawn
      Math.PI / 2 // facing down
    );

    // Fade in car
    setTimeout(function () {
      if (carElement) carElement.style.opacity = '1';
    }, 50);
  }

  // ========== PROXIMITY DETECTION ==========
  function updateElementProximity(carScreenX, carScreenY) {
    var INTERACT_RANGE = 120;

    var nearest = null;
    var nearestDist = Infinity;

    for (var i = 0; i < interactiveElements.length; i++) {
      var elem = interactiveElements[i];
      var elemScreenX = elem.centerX - window.scrollX;
      var elemScreenY = elem.centerY - window.scrollY;

      // Skip if off-screen
      if (elemScreenY < -200 || elemScreenY > window.innerHeight + 200) {
        elem.el.classList.remove('drive-highlight', 'drive-near');
        continue;
      }

      var dx = carScreenX - elemScreenX;
      var dy = carScreenY - elemScreenY;
      var dist = Math.hypot(dx, dy);

      var hitboxRadius = INTERACT_RANGE + Math.max(elem.width, elem.height) / 2;

      if (dist < hitboxRadius) {
        elem.el.classList.add('drive-highlight');

        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = elem;
        }
      } else {
        elem.el.classList.remove('drive-highlight', 'drive-near');
      }
    }

    // Update nearest element
    if (nearest && nearestDist < INTERACT_RANGE) {
      if (nearestElement !== nearest) {
        if (nearestElement) nearestElement.el.classList.remove('drive-near');
        nearest.el.classList.add('drive-near');
      }
      nearestElement = nearest;
      if (interactHint) interactHint.classList.remove('hidden');
    } else {
      if (nearestElement) nearestElement.el.classList.remove('drive-near');
      nearestElement = null;
      if (interactHint) interactHint.classList.add('hidden');
    }
  }

  // ========== INTERACTION ==========
  function handleInteraction() {
    if (!nearestElement) return;

    var elem = nearestElement;

    // Flash element
    elem.el.style.transition = 'transform 0.2s ease';
    elem.el.style.transform = 'scale(1.08)';
    setTimeout(function () {
      elem.el.style.transform = '';
    }, 200);

    // Execute action
    switch (elem.action) {
      case 'scroll-to':
        // Animate car to section
        animateCarToPosition(elem.centerY, 1000);
        break;

      case 'navigate-internal':
        // Exit drive mode, then navigate
        deactivate(function () {
          window.location.href = elem.el.href;
        });
        break;

      case 'navigate-external':
        // Open in new tab, stay in drive mode
        window.open(elem.el.href, '_blank');
        showToast('Opened in new tab');
        break;

      case 'trigger-click':
        // Exit drive mode, then click
        deactivate(function () {
          setTimeout(function () {
            elem.el.click();
          }, 100);
        });
        break;
    }
  }

  function animateCarToPosition(targetY, duration) {
    var startY = carState.y;
    var distance = targetY - startY;
    var actualDuration = Math.min(duration, Math.abs(distance) * 2);
    var startTime = performance.now();

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function animate(now) {
      if (!isActive) return;

      var elapsed = now - startTime;
      var progress = Math.min(1, elapsed / actualDuration);
      var eased = easeInOutCubic(progress);

      carState.y = startY + distance * eased;

      // Update scroll
      var targetScrollY = carState.y - (window.innerHeight * 0.5);
      var clampedScrollY = Math.max(0, Math.min(
        document.body.scrollHeight - window.innerHeight,
        targetScrollY
      ));
      window.scrollTo({ top: clampedScrollY, behavior: 'instant' });

      // Update car screen position for proximity check
      var carScreenX = carState.x + window.scrollX;
      var carScreenY = carState.y - window.scrollY;
      updateElementProximity(carScreenX, carScreenY);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }

  function showToast(message) {
    var toast = document.createElement('div');
    toast.className = 'drive-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(function () {
      toast.classList.add('show');
    }, 50);

    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () {
        toast.remove();
      }, 250);
    }, 1500);
  }

  // ========== PHYSICS LOOP ==========
  function update(now) {
    if (!isActive) return;

    var dt = lastTime ? Math.min(2, (now - lastTime) / 16.667) : 1;
    lastTime = now;

    // Calculate desired angle
    var desiredAngle;
    var carScreenX = carState.x + window.scrollX;
    var carScreenY = carState.y - window.scrollY;

    if (inputState.useKeyboardSteering) {
      // Keyboard mode: only steer when left/right pressed, otherwise maintain angle
      if (inputState.arrowLeft && !inputState.arrowRight) {
        var turnSpeed = 0.08; // Radians per frame at full lock
        desiredAngle = carState.angle - turnSpeed * dt;
      } else if (inputState.arrowRight && !inputState.arrowLeft) {
        var turnSpeed = 0.08;
        desiredAngle = carState.angle + turnSpeed * dt;
      } else {
        desiredAngle = carState.angle; // Maintain current heading
      }
    } else {
      // Mouse steering: point toward cursor
      var dx = inputState.mouseX - carScreenX;
      var dy = inputState.mouseY - carScreenY;
      desiredAngle = Math.atan2(dy, dx);
    }

    // Update physics
    var physicsResult = window.CarPhysics.updatePhysics(carState, inputState, dt, desiredAngle);

    // Update car position (page coordinates)
    carState.x += carState.velX * dt;
    carState.y += carState.velY * dt;

    // Drift smoke trail (positioned in page coordinates)
    var smokeParticles = window.CarPhysics.createDriftSmoke(
      carState,
      physicsResult,
      carState.x + window.scrollX, // car page X
      carState.y // car page Y
    );
    if (smokeParticles) {
      smokeParticles.forEach(function (smoke) {
        window.CarPhysics.renderSmokeParticle(smoke);
      });
    }

    // Clamp X to viewport bounds (in page coordinates)
    var minX = -window.scrollX;
    var maxX = -window.scrollX + window.innerWidth;
    if (carState.x < minX) carState.x = minX;
    if (carState.x > maxX) carState.x = maxX;

    // Clamp Y to page bounds
    var maxY = document.body.scrollHeight;
    if (carState.y < 0) carState.y = 0;
    if (carState.y > maxY) carState.y = maxY;

    // Smooth camera follow with deadzone
    var viewportHeight = window.innerHeight;
    var deadZoneTop = viewportHeight * 0.3; // 30% from top
    var deadZoneBottom = viewportHeight * 0.7; // 70% from top

    var carScreenYCurrent = carState.y - window.scrollY;
    var targetScrollY = window.scrollY;

    // Only scroll if car leaves deadzone
    if (carScreenYCurrent < deadZoneTop) {
      // Car too high, scroll up
      targetScrollY = carState.y - deadZoneTop;
    } else if (carScreenYCurrent > deadZoneBottom) {
      // Car too low, scroll down
      targetScrollY = carState.y - deadZoneBottom;
    }

    // Smooth scroll interpolation
    var currentScrollY = window.scrollY;
    var scrollDelta = targetScrollY - currentScrollY;
    var smoothScrollY = currentScrollY + scrollDelta * 0.15; // Smooth damping

    // Clamp scroll to page bounds
    var clampedScrollY = Math.max(0, Math.min(
      document.body.scrollHeight - viewportHeight,
      smoothScrollY
    ));
    window.scrollTo({ top: clampedScrollY, behavior: 'instant' });

    // Calculate car screen position for rendering
    carScreenX = carState.x + window.scrollX;
    carScreenY = carState.y - window.scrollY;

    // Render car at screen position
    carElement.style.left = (carScreenX - 32) + 'px';
    carElement.style.top = (carScreenY - 32) + 'px';

    var transform = window.CarPhysics.calculateCarTransform(carState, 1, now);
    window.CarPhysics.applyCarTransform(carElement, transform);

    // Update element proximity
    updateElementProximity(carScreenX, carScreenY);

    // Position interact hint above car (always upright)
    if (interactHint && !interactHint.classList.contains('hidden')) {
      interactHint.style.left = carScreenX + 'px';
      interactHint.style.top = (carScreenY - 80) + 'px';
    }

    animationFrameId = requestAnimationFrame(update);
  }

  // ========== ACTIVATION ==========
  function activate(buttonElement) {
    if (isActive) return;
    isActive = true;

    // Add body class for cursor styling
    document.body.classList.add('drive-mode-active');

    // Find and hide Hadoken button
    var hadokenLinks = document.querySelectorAll('a[href="#services"]');
    for (var i = 0; i < hadokenLinks.length; i++) {
      if (hadokenLinks[i].textContent.includes('Hadoken')) {
        hadokenButton = hadokenLinks[i];
        hadokenButton.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        hadokenButton.style.opacity = '0';
        hadokenButton.style.transform = 'scale(0.8)';
        break;
      }
    }

    // Collect interactive elements
    interactiveElements = collectInteractiveElements();

    // Create UI
    uiContainer = createUI();

    // Spawn car
    spawnCar(buttonElement);

    // Setup input
    inputState = window.CarPhysics.createInputState();
    inputHandlers = window.CarPhysics.createInputHandlers(inputState, {
      onEscape: deactivate,
      onInteract: handleInteraction
    });
    window.CarPhysics.attachInputHandlers(inputHandlers);

    // Attach scroll prevention
    attachScrollPrevention();

    // Start physics loop
    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(update);
  }

  // ========== DEACTIVATION ==========
  function deactivate(callback) {
    if (!isActive) return;
    isActive = false;

    // Remove body class
    document.body.classList.remove('drive-mode-active');

    // Stop physics loop
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    // Fade out car and UI
    if (carElement) {
      carElement.style.transition = 'opacity 0.4s ease';
      carElement.style.opacity = '0';
    }

    if (uiContainer) {
      uiContainer.style.transition = 'opacity 0.3s ease';
      uiContainer.style.opacity = '0';
    }

    // Remove element highlights
    interactiveElements.forEach(function (elem) {
      elem.el.classList.remove('drive-highlight', 'drive-near');
      elem.el.style.outline = elem.originalOutline;
    });

    // Cleanup after animation
    setTimeout(function () {
      // Remove elements
      if (carElement) {
        carElement.remove();
        carElement = null;
      }
      if (uiContainer) {
        uiContainer.remove();
        uiContainer = null;
      }

      // Remove event listeners
      if (inputHandlers) {
        window.CarPhysics.detachInputHandlers(inputHandlers);
        inputHandlers = null;
      }
      detachScrollPrevention();

      // Restore button
      if (originalButton) {
        originalButton.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        originalButton.style.opacity = '1';
        originalButton.style.transform = 'scale(1)';
      }

      // Restore Hadoken button
      if (hadokenButton) {
        hadokenButton.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        hadokenButton.style.opacity = '1';
        hadokenButton.style.transform = 'scale(1)';
        hadokenButton = null;
      }

      // Reset state
      carState = null;
      inputState = null;
      interactiveElements = [];
      nearestElement = null;
      interactHint = null;

      // Execute callback
      if (typeof callback === 'function') {
        callback();
      }
    }, 400);
  }

  // ========== EXPORTS ==========
  window.HomepageDrive = {
    activate: activate,
    deactivate: deactivate
  };
})();
