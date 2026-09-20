/**
 * Ambient dot-particle background for <canvas data-dot-particles> elements.
 * Ported from a React canvas component into vanilla JS for this Liquid theme.
 * Canvas fills its positioned parent, sits behind content (pointer-events: none),
 * and drifts a field of soft dots that fade in/out and wrap at the edges.
 */
(function () {
  function initDotParticles(canvas) {
    if (canvas.dataset.dotParticlesInitialized === 'true') return;
    canvas.dataset.dotParticlesInitialized = 'true';

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var particleColor = canvas.dataset.particleColor || '120, 105, 90';
    var density = parseFloat(canvas.dataset.density) || 0.00012;
    var maxParticles = parseInt(canvas.dataset.maxParticles, 10) || 90;
    var speed = parseFloat(canvas.dataset.speed) || 0.15;
    var maxAlpha = parseFloat(canvas.dataset.maxAlpha) || 0.45;
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var dpr = 1;
    var width = 0;
    var height = 0;
    var particles = [];
    var time = 0;

    function randomParticle() {
      var angle = Math.random() * Math.PI * 2;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * speed * (0.5 + Math.random()),
        vy: Math.sin(angle) * speed * (0.5 + Math.random()),
        size: 0.8 + Math.random() * 1.8,
        angle: angle,
        life: 0,
        maxLife: 6000 + Math.random() * 6000,
      };
    }

    function seedParticles() {
      var area = width * height;
      var count = Math.min(maxParticles, Math.max(20, Math.round(area * density)));
      particles = [];
      for (var i = 0; i < count; i++) {
        var particle = randomParticle();
        particle.life = Math.random() * particle.maxLife;
        particles.push(particle);
      }
    }

    function resize() {
      var parent = canvas.parentElement;
      if (!parent) return;

      dpr = window.devicePixelRatio || 1;
      var rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      seedParticles();
    }

    function drawParticle(particle, alpha) {
      ctx.fillStyle = 'rgba(' + particleColor + ', ' + alpha + ')';
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawStaticFrame() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(function (particle) {
        drawParticle(particle, maxAlpha * 0.6);
      });
    }

    function animate() {
      if (!canvas.isConnected) return;

      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      particles.forEach(function (particle) {
        particle.life += 16;
        particle.x += particle.vx + Math.sin(time + particle.angle) * 0.15;
        particle.y += particle.vy + Math.cos(time + particle.angle * 0.7) * 0.1;

        if (particle.x < -10) particle.x = width + 10;
        if (particle.x > width + 10) particle.x = -10;
        if (particle.y < -10) particle.y = height + 10;
        if (particle.y > height + 10) particle.y = -10;

        var lifeProgress = particle.life / particle.maxLife;
        var fade = 1;
        if (lifeProgress < 0.1) {
          fade = lifeProgress / 0.1;
        } else if (lifeProgress > 0.9) {
          fade = (1 - lifeProgress) / 0.1;
        }
        var alpha = Math.max(0, Math.min(1, fade)) * maxAlpha;

        drawParticle(particle, alpha);

        if (particle.life >= particle.maxLife) {
          Object.assign(particle, randomParticle());
        }
      });

      requestAnimationFrame(animate);
    }

    resize();

    if (prefersReducedMotion) {
      drawStaticFrame();
    } else {
      requestAnimationFrame(animate);
    }

    if ('ResizeObserver' in window) {
      new ResizeObserver(function () {
        resize();
      }).observe(canvas.parentElement);
    } else {
      window.addEventListener('resize', resize);
    }
  }

  function initAll() {
    document.querySelectorAll('canvas[data-dot-particles]').forEach(initDotParticles);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  document.addEventListener('shopify:section:load', initAll);
})();
