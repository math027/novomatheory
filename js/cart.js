/* ============================================================
   js/cart.js — Cart state management & slide-out drawer
   MATHEORY © 2024
   ============================================================ */

const Cart = (() => {
  let items = []; // { product, size, color, qty }

  // ---- State Helpers ----
  function addItem(product, size, color, qty = 1) {
    const existing = items.find(
      i => i.product.id === product.id && i.size === size && i.color === color
    );
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({ product, size, color, qty });
    }
    _updateAllBadges();
    Toast.show(`${product.name} adicionado ao carrinho 🛒`);
  }

  function removeItem(index) {
    items.splice(index, 1);
    _updateAllBadges();
    renderDrawer();
  }

  function totalItems() {
    return items.reduce((sum, i) => sum + i.qty, 0);
  }

  function totalPrice() {
    return items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  }

  function _updateAllBadges() {
    const total = totalItems();
    document.querySelectorAll('.cart-count-badge').forEach(el => {
      el.textContent = total;
      el.style.display = total > 0 ? 'flex' : 'none';
    });
  }

  // ---- Drawer Rendering ----
  function renderDrawer() {
    const universe = Navigation.current();
    const container = document.getElementById(`cart-items-${universe}`);
    const footer    = document.getElementById(`cart-footer-${universe}`);
    if (!container || !footer) return;

    if (items.length === 0) {
      container.innerHTML = `
        <div class="cart-empty-msg">
          <i class="fas fa-shopping-bag"></i>
          <p>Seu carrinho está vazio.</p>
        </div>`;
      footer.innerHTML = '';
      return;
    }

    container.innerHTML = items.map((item, idx) => `
      <div class="cart-item">
        <img class="cart-item-img"
             src="https://picsum.photos/140/175?random=${item.product.imgSeed}"
             alt="${item.product.name}"
             loading="lazy">
        <div>
          <p class="cart-item-name">${item.product.name}</p>
          <p class="cart-item-variant">Tam: ${item.size} · Qtd: ${item.qty}</p>
          <p class="cart-item-price">R$ ${(item.product.price * item.qty).toLocaleString('pt-BR')}</p>
        </div>
        <button class="cart-item-remove" onclick="Cart.removeItem(${idx})" aria-label="Remover item">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `).join('');

    footer.innerHTML = `
      <div class="cart-subtotal-row">
        <span class="cart-subtotal-label">Subtotal</span>
        <span class="cart-subtotal-value">R$ ${totalPrice().toLocaleString('pt-BR')}</span>
      </div>
      <button class="cart-checkout-btn" onclick="Toast.show('Redirecionando para o checkout...')">
        Finalizar Compra <i class="fas fa-arrow-right"></i>
      </button>
    `;
  }

  // ---- Open / Close ----
  function openDrawer() {
    renderDrawer();
    const universe = Navigation.current();
    const backdrop = document.getElementById(`cart-backdrop-${universe}`);
    if (backdrop) backdrop.classList.add('open');
  }

  function closeDrawer() {
    document.querySelectorAll('.cart-drawer-backdrop').forEach(el => el.classList.remove('open'));
  }

  return { addItem, removeItem, totalItems, totalPrice, openDrawer, closeDrawer };
})();
