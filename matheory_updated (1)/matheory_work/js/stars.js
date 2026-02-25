/* ============================================================
   js/stars.js — Animated star field for the home page
   MATHEORY © 2024
   ============================================================ */

(function () {
  const canvas = document.getElementById('stars-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let stars = [];
  let raf;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    initStars();
  }

  function initStars() {
    const count = Math.floor((canvas.width * canvas.height) / 6000);
    stars = Array.from({ length: count }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      r:     Math.random() * 1.15 + 0.15,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.4 + 0.15,
    }));
  }

  function draw(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const t = time * 0.001;
    stars.forEach(s => {
      const alpha = 0.25 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(147, 210, 255, ${alpha})`;
      ctx.fill();
    });
    raf = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  raf = requestAnimationFrame(draw);

  // Parallax on mouse move (home page only)
  const heroBg = document.querySelector('.hero-bg');
  window.addEventListener('mousemove', (e) => {
    if (!heroBg) return;
    const mx = (e.clientX / window.innerWidth  - 0.5) * 14;
    const my = (e.clientY / window.innerHeight - 0.5) * 8;
    heroBg.style.transform = `scale(1.04) translate(${mx}px, ${my}px)`;
  });
})();
