// Shared Car Physics Engine
// Used by both roadtrip.js (highway minigame) and homepage-drive.js (homepage navigation)
(function () {
  'use strict';

  // ========== MOBILE DETECTION ==========
  function isMobileDevice() {
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return true;
    if ('ontouchstart' in window && window.innerWidth < 900) return true;
    return /Android|iPhone|iPad|iPod|Mobile|Opera Mini/i.test(navigator.userAgent || '');
  }

  // ========== PHYSICS CONSTANTS ==========
  // These can be overridden per-instance for different "levels"
  var DEFAULT_PHYSICS = {
    // Speed limits
    MAX_FWD: 1.2,
    MAX_REV: -5,

    // Acceleration
    ACCEL_FWD_BASE: 0.08,
    ACCEL_FWD_TOP_FALLOFF: 2.5, // Higher = harder to reach top speeds
    ACCEL_REV: 0.15,

    // Drag
    COAST_DRAG: 0.04,
    BRAKE_DRAG: 0.8,

    // Steering
    TURN_BASE: 0.055,
    TURN_FAST: 0.090,
    HANDBRAKE_TURN_BOOST: 2,

    // Drift physics
    GRIP: 0.22,
    HANDBRAKE_GRIP: 0.012,
    FWD_TRACK: 0.55,
    HANDBRAKE_FWD_TRACK: 0.10,
    DRIFT_RECOVER: 0.075,

    // Collision
    BUMP_RESTITUTION: 0.55,

    // Visual
    IDLE_VIBRATION_AMOUNT: 0.4,
    CAR_SIZE: 64
  };

  // ========== CAR STATE FACTORY ==========
  function createCarState(x, y, angle, physicsOverrides) {
    var physics = Object.assign({}, DEFAULT_PHYSICS, physicsOverrides || {});

    return {
      // Position & rotation
      x: x || 0,
      y: y || 0,
      angle: angle || Math.PI / 2, // Default facing down (positive Y)

      // Velocity
      velX: 0,
      velY: 0,
      speed: 0,
      topSpeed: 0,

      // Controls
      throttle: 0,
      handbrake: false,
      driftBlend: 0,

      // Physics constants
      physics: physics,

      // Visual effects
      shakeUntil: 0
    };
  }

  // ========== INPUT STATE ==========
  function createInputState() {
    return {
      mouseX: window.innerWidth / 2,
      mouseY: window.innerHeight / 2,
      throttle: 0,
      handbrake: false,
      // Keyboard arrow keys
      arrowUp: false,
      arrowDown: false,
      arrowLeft: false,
      arrowRight: false,
      useKeyboardSteering: false,
      // Gradual steering input (-1 to +1, 0 = center)
      steeringInput: 0
    };
  }

  // ========== PHYSICS UPDATE ==========
  function updatePhysics(carState, inputState, dt, desiredAngleOverride) {
    var p = carState.physics;

    // Update gradual steering input for keyboard
    var STEERING_SPEED = 0.8; // How fast steering responds (lower = slower, more realistic)
    var targetSteering = 0;
    if (inputState.arrowLeft && !inputState.arrowRight) {
      targetSteering = -1;
    } else if (inputState.arrowRight && !inputState.arrowLeft) {
      targetSteering = 1;
    }
    // Smoothly interpolate steering input
    var steeringDelta = targetSteering - inputState.steeringInput;
    inputState.steeringInput += steeringDelta * Math.min(1, STEERING_SPEED * dt);
    // Snap to zero when very close to prevent drift
    if (Math.abs(inputState.steeringInput) < 0.01) {
      inputState.steeringInput = 0;
    }

    // Update controls from input
    // Keyboard arrow keys take precedence over mouse for throttle
    if (inputState.arrowUp || inputState.arrowDown) {
      if (inputState.arrowUp && !inputState.arrowDown) {
        carState.throttle = 1;
      } else if (inputState.arrowDown && !inputState.arrowUp) {
        carState.throttle = -1;
      } else {
        carState.throttle = 0; // Both pressed = cancel out
      }
    } else {
      carState.throttle = inputState.throttle;
    }
    carState.handbrake = inputState.handbrake;

    // ===== Speed / Throttle =====
    if (carState.throttle > 0) {
      // Forward acceleration with asymptotic top speed
      var baseSpeed = 18;
      var headroom = 1 / (1 + Math.pow(Math.abs(carState.speed) / baseSpeed, p.ACCEL_FWD_TOP_FALLOFF));

      // Drift penalty: reduce acceleration when drifting
      var driftPenalty = 1 - (carState.driftBlend * 0.3); // 30% reduction at full drift

      carState.speed += p.ACCEL_FWD_BASE * headroom * driftPenalty * dt;
    } else if (carState.throttle < 0) {
      // Reverse
      carState.speed -= p.ACCEL_REV * dt;
      if (carState.speed < p.MAX_REV) carState.speed = p.MAX_REV;
    } else {
      // Coast
      carState.speed *= Math.pow(1 - p.COAST_DRAG, dt);
      if (Math.abs(carState.speed) < 0.05) carState.speed = 0;
    }

    // Additional drift drag: slow down while drifting hard
    if (carState.driftBlend > 0.3) {
      var driftDrag = 0.02 * carState.driftBlend;
      carState.speed *= Math.pow(1 - driftDrag, dt);
    }

    // Braking when switching direction
    if ((carState.throttle > 0 && carState.speed < 0) || (carState.throttle < 0 && carState.speed > 0)) {
      carState.speed *= Math.pow(1 - p.BRAKE_DRAG, dt);
    }

    // Track top speed
    if (carState.speed > carState.topSpeed) carState.topSpeed = carState.speed;

    // ===== Drift Blend =====
    var targetBlend = carState.handbrake ? 1 : 0;
    var blendRate = carState.handbrake ? 0.35 : p.DRIFT_RECOVER;
    carState.driftBlend += (targetBlend - carState.driftBlend) * Math.min(1, blendRate * dt);
    if (carState.driftBlend < 0.001) carState.driftBlend = 0;

    // ===== Steering =====
    var desiredAngle;
    if (inputState.useKeyboardSteering) {
      // Keyboard mode: apply gradual steering with drift boost
      var BASE_TURN_RATE = 0.035; // Base maximum turn rate
      var driftBoost = 1 + (p.HANDBRAKE_TURN_BOOST - 1) * carState.driftBlend;
      var MAX_TURN_RATE = BASE_TURN_RATE * driftBoost;
      var turnAmount = inputState.steeringInput * MAX_TURN_RATE * dt;
      desiredAngle = carState.angle + turnAmount;
    } else if (desiredAngleOverride !== undefined) {
      // Mouse mode: use provided angle
      desiredAngle = desiredAngleOverride;
    } else {
      // Default: no change
      desiredAngle = carState.angle;
    }

    var diff = desiredAngle - carState.angle;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;

    var speedRatio = Math.min(1, Math.abs(carState.speed) / p.MAX_FWD);
    var turnRate = (p.TURN_BASE + (p.TURN_FAST - p.TURN_BASE) * speedRatio) *
                   (1 + (p.HANDBRAKE_TURN_BOOST - 1) * carState.driftBlend);

    // Allow steering in keyboard mode even when coasting, or in mouse mode when throttling
    var canSteer = inputState.useKeyboardSteering || carState.throttle !== 0;
    var diffThreshold = inputState.useKeyboardSteering ? 0.001 : 0.02; // Lower threshold for gradual keyboard input

    if (canSteer && Math.abs(carState.speed) > 0.05 && Math.abs(diff) > diffThreshold) {
      carState.angle += Math.sign(diff) * Math.min(Math.abs(diff), turnRate * dt);
    }

    // ===== Drift Physics =====
    var cosA = Math.cos(carState.angle);
    var sinA = Math.sin(carState.angle);
    var fwd = carState.velX * cosA + carState.velY * sinA;
    var lat = -carState.velX * sinA + carState.velY * cosA;

    var grip = p.GRIP + (p.HANDBRAKE_GRIP - p.GRIP) * carState.driftBlend;
    var fwdTrack = p.FWD_TRACK + (p.HANDBRAKE_FWD_TRACK - p.FWD_TRACK) * carState.driftBlend;

    var newFwd = fwd + (carState.speed - fwd) * Math.min(1, fwdTrack * dt);
    var newLat = lat * Math.pow(1 - grip, dt);

    carState.velX = cosA * newFwd - sinA * newLat;
    carState.velY = sinA * newFwd + cosA * newLat;

    return {
      newLat: newLat, // For drift smoke detection
      velMag: Math.hypot(carState.velX, carState.velY)
    };
  }

  // ========== INPUT HANDLERS ==========
  function createInputHandlers(inputState, callbacks) {
    var handlers = {
      onMouseMove: function (ev) {
        inputState.mouseX = ev.clientX;
        inputState.mouseY = ev.clientY;
        // Show cursor on mouse movement (remove keyboard mode class)
        if (inputState.useKeyboardSteering) {
          document.body.classList.remove('keyboard-mode');
        }
      },
      onMouseDown: function (ev) {
        if (ev.button === 0) {
          inputState.throttle = 1;
          inputState.useKeyboardSteering = false; // Switch to mouse mode
          document.body.classList.remove('keyboard-mode'); // Show cursor
        } else if (ev.button === 2) {
          inputState.throttle = -1;
          inputState.useKeyboardSteering = false; // Switch to mouse mode
          document.body.classList.remove('keyboard-mode'); // Show cursor
        }
      },
      onMouseUp: function (ev) {
        if (ev.button === 0 && inputState.throttle === 1) inputState.throttle = 0;
        else if (ev.button === 2 && inputState.throttle === -1) inputState.throttle = 0;
      },
      onContextMenu: function (ev) {
        ev.preventDefault();
      },
      onKeyDown: function (ev) {
        if (ev.key === 'Escape') {
          if (callbacks && callbacks.onEscape) callbacks.onEscape();
          return;
        }
        if (ev.code === 'Space' || ev.key === ' ') {
          inputState.handbrake = true;
          ev.preventDefault();
          return;
        }
        if ((ev.key === 'e' || ev.key === 'E')) {
          if (callbacks && callbacks.onInteract) callbacks.onInteract();
          ev.preventDefault();
        }
        // Arrow key controls
        if (ev.key === 'ArrowUp') {
          inputState.arrowUp = true;
          inputState.useKeyboardSteering = true;
          document.body.classList.add('keyboard-mode'); // Hide cursor
          ev.preventDefault();
        }
        if (ev.key === 'ArrowDown') {
          inputState.arrowDown = true;
          inputState.useKeyboardSteering = true;
          document.body.classList.add('keyboard-mode'); // Hide cursor
          ev.preventDefault();
        }
        if (ev.key === 'ArrowLeft') {
          inputState.arrowLeft = true;
          inputState.useKeyboardSteering = true;
          document.body.classList.add('keyboard-mode'); // Hide cursor
          ev.preventDefault();
        }
        if (ev.key === 'ArrowRight') {
          inputState.arrowRight = true;
          inputState.useKeyboardSteering = true;
          document.body.classList.add('keyboard-mode'); // Hide cursor
          ev.preventDefault();
        }
      },
      onKeyUp: function (ev) {
        if (ev.code === 'Space' || ev.key === ' ') {
          inputState.handbrake = false;
          ev.preventDefault();
        }
        // Arrow key controls
        if (ev.key === 'ArrowUp') {
          inputState.arrowUp = false;
          ev.preventDefault();
        }
        if (ev.key === 'ArrowDown') {
          inputState.arrowDown = false;
          ev.preventDefault();
        }
        if (ev.key === 'ArrowLeft') {
          inputState.arrowLeft = false;
          ev.preventDefault();
        }
        if (ev.key === 'ArrowRight') {
          inputState.arrowRight = false;
          ev.preventDefault();
        }
      },
      onBlur: function () {
        inputState.throttle = 0;
        inputState.handbrake = false;
        inputState.arrowUp = false;
        inputState.arrowDown = false;
        inputState.arrowLeft = false;
        inputState.arrowRight = false;
      }
    };

    return handlers;
  }

  function attachInputHandlers(handlers) {
    document.addEventListener('mousemove', handlers.onMouseMove);
    document.addEventListener('mousedown', handlers.onMouseDown);
    document.addEventListener('mouseup', handlers.onMouseUp);
    document.addEventListener('contextmenu', handlers.onContextMenu);
    document.addEventListener('keydown', handlers.onKeyDown);
    document.addEventListener('keyup', handlers.onKeyUp);
    window.addEventListener('blur', handlers.onBlur);
  }

  function detachInputHandlers(handlers) {
    document.removeEventListener('mousemove', handlers.onMouseMove);
    document.removeEventListener('mousedown', handlers.onMouseDown);
    document.removeEventListener('mouseup', handlers.onMouseUp);
    document.removeEventListener('contextmenu', handlers.onContextMenu);
    document.removeEventListener('keydown', handlers.onKeyDown);
    document.removeEventListener('keyup', handlers.onKeyUp);
    window.removeEventListener('blur', handlers.onBlur);
  }

  // ========== CAR RENDERING ==========
  function calculateCarTransform(carState, shakeAmount, now) {
    var renderDeg = (carState.angle * 180 / Math.PI) + 90;
    var shakeX = 0, shakeY = 0;

    // Collision shake
    if (now < carState.shakeUntil) {
      var s = (carState.shakeUntil - now) / 220;
      shakeX = (Math.random() - 0.5) * 6 * s;
      shakeY = (Math.random() - 0.5) * 6 * s;
    }

    // Idle vibration when stationary
    if (Math.abs(carState.speed) < 0.5 && carState.throttle === 0) {
      var idleFreq = now * 0.015;
      shakeX += Math.sin(idleFreq) * carState.physics.IDLE_VIBRATION_AMOUNT;
      shakeY += Math.cos(idleFreq * 1.3) * carState.physics.IDLE_VIBRATION_AMOUNT * 0.7;
    }

    return {
      rotation: renderDeg,
      shakeX: shakeX,
      shakeY: shakeY
    };
  }

  function applyCarTransform(carElement, transform) {
    carElement.style.transform =
      'translate(' + transform.shakeX + 'px,' + transform.shakeY + 'px) rotate(' + transform.rotation + 'deg)';
  }

  // ========== DRIFT SMOKE ==========
  var smokeFrameCounter = 0;

  function createDriftSmoke(carState, physicsResult, carPageX, carPageY) {
    var velMag = physicsResult.velMag;
    var driftMag = Math.abs(physicsResult.newLat);

    if (velMag > 1.5 && (carState.handbrake || driftMag > 0.6)) {
      smokeFrameCounter++;
      if (smokeFrameCounter % 2 === 0) {
        var CAR_SIZE = carState.physics.CAR_SIZE;
        var rearOff = CAR_SIZE * 0.38;
        var wheelOff = CAR_SIZE * 0.28;
        var cosA = Math.cos(carState.angle);
        var sinA = Math.sin(carState.angle);

        var bx = carPageX;
        var by = carPageY;
        var rxL = bx - cosA * rearOff - (-sinA) * wheelOff;
        var ryL = by - sinA * rearOff - cosA * wheelOff;
        var rxR = bx - cosA * rearOff + (-sinA) * wheelOff;
        var ryR = by - sinA * rearOff + cosA * wheelOff;
        var sz = 8 + Math.random() * 8 + Math.min(6, driftMag);

        return [
          { x: rxL, y: ryL, size: sz },
          { x: rxR, y: ryR, size: sz }
        ];
      }
    }
    return null;
  }

  function renderSmokeParticle(smoke) {
    var smokeEl = document.createElement('div');
    smokeEl.className = 'rt-smoke';
    smokeEl.style.cssText =
      'position: absolute;' +
      'width: ' + smoke.size + 'px;' +
      'height: ' + smoke.size + 'px;' +
      'left: ' + smoke.x + 'px;' +
      'top: ' + smoke.y + 'px;' +
      'border-radius: 50%;' +
      'background: rgba(200, 200, 200, 0.55);' +
      'filter: blur(3px);' +
      'pointer-events: none;' +
      'transform: translate(-50%, -50%) scale(1);' +
      'z-index: 99998;' +
      'opacity: 0.55;';

    document.body.appendChild(smokeEl);

    // Animate and remove
    requestAnimationFrame(function () {
      smokeEl.style.transition = 'opacity 0.9s ease-out, transform 0.9s ease-out';
      smokeEl.style.opacity = '0';
      smokeEl.style.transform = 'translate(-50%, -50%) scale(3.4)';
    });

    setTimeout(function () {
      smokeEl.remove();
    }, 920);
  }

  // ========== EXPORTS ==========
  window.CarPhysics = {
    isMobileDevice: isMobileDevice,
    DEFAULT_PHYSICS: DEFAULT_PHYSICS,
    createCarState: createCarState,
    createInputState: createInputState,
    updatePhysics: updatePhysics,
    createInputHandlers: createInputHandlers,
    attachInputHandlers: attachInputHandlers,
    detachInputHandlers: detachInputHandlers,
    calculateCarTransform: calculateCarTransform,
    applyCarTransform: applyCarTransform,
    createDriftSmoke: createDriftSmoke,
    renderSmokeParticle: renderSmokeParticle
  };
})();
