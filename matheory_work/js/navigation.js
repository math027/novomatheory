/* ============================================================
   js/navigation.js — Page transitions between universes
   MATHEORY © 2024
   ============================================================ */

const Navigation = (() => {
  let currentPage = 'home';
  const overlay    = document.getElementById('transition-overlay');
  const overlayLbl = document.getElementById('transition-label');

  const UNIVERSE_NAMES = {
    geek:    'MATHEORY GEEK',
    esporte: 'MATHEORY ESPORTE',
    crista:  'MATHEORY CRISTÃ',
    street:  'MATHEORY STREET',
    home:    'MATHEORY',
  };

  function _showOverlay(label) {
    overlayLbl.textContent = label;
    overlayLbl.style.animation = 'none';
    // force reflow
    void overlayLbl.offsetHeight;
    overlayLbl.style.animation = 'fadeInOut 0.85s ease forwards';
    overlay.classList.add('active');
  }

  function _hideOverlay() {
    overlay.classList.remove('active');
  }

  function enterUniverse(universe) {
    if (currentPage === universe) return;

    _showOverlay(UNIVERSE_NAMES[universe] || 'MATHEORY');

    // Slide current page up
    const fromPage = document.getElementById(`page-${currentPage}`);
    if (fromPage) {
      fromPage.classList.add('slide-out');
      setTimeout(() => {
        fromPage.classList.remove('active', 'slide-out');
      }, 700);
    }

    // Bring in target page
    setTimeout(() => {
      const toPage = document.getElementById(`page-${universe}`);
      if (toPage) {
        toPage.scrollTop = 0;
        toPage.classList.add('active');
      }
      currentPage = universe;
      _hideOverlay();
    }, 600);
  }

  function goHome() {
    enterUniverse('home');
  }

  function current() {
    return currentPage;
  }

  // Expose hero parallax update for store pages
  function bindStoreParallax() {
    window.addEventListener('mousemove', (e) => {
      if (currentPage === 'home') return;
      const bg = document.querySelector(`#page-${currentPage} .store-hero-bg`);
      if (!bg) return;
      const mx = (e.clientX / window.innerWidth  - 0.5) * 12;
      const my = (e.clientY / window.innerHeight - 0.5) * 8;
      bg.style.transform = `scale(1.05) translate(${mx}px, ${my}px)`;
    });
  }

  return { enterUniverse, goHome, current, bindStoreParallax };
})();
