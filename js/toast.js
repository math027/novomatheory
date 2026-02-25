/* ============================================================
   js/toast.js — Toast notification utility
   MATHEORY © 2024
   ============================================================ */

const Toast = (() => {
  let timeout;
  const el = document.getElementById('toast');

  function show(message, duration = 2800) {
    if (!el) return;
    clearTimeout(timeout);
    el.textContent = message;
    el.classList.add('show');
    timeout = setTimeout(() => el.classList.remove('show'), duration);
  }

  return { show };
})();
