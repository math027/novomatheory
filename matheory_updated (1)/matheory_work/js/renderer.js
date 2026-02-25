/* ============================================================
   js/renderer.js — Builds store pages from data + nav filters
   MATHEORY © 2024
   ============================================================ */

const Renderer = (() => {

  const CAT_GRADIENTS = {
    geek:    [
      'linear-gradient(135deg,#060f1f,#0d2150)',
      'linear-gradient(135deg,#0d052a,#2a0a66)',
      'linear-gradient(135deg,#03101e,#0b2e50)',
      'linear-gradient(135deg,#020810,#0f2840)',
    ],
    esporte: [
      'linear-gradient(135deg,#1a0800,#3d1800)',
      'linear-gradient(135deg,#1a0c00,#3a1a00)',
      'linear-gradient(135deg,#0d0800,#282000)',
      'linear-gradient(135deg,#100a00,#241400)',
    ],
    crista:  [
      'linear-gradient(135deg,#1a0e00,#3d2800)',
      'linear-gradient(135deg,#1a1000,#3a2400)',
      'linear-gradient(135deg,#100c00,#281e00)',
      'linear-gradient(135deg,#0e0900,#221500)',
    ],
    street:  [
      'linear-gradient(135deg,#1a0000,#3d0000)',
      'linear-gradient(135deg,#150000,#300000)',
      'linear-gradient(135deg,#0f0000,#240000)',
      'linear-gradient(135deg,#0a0000,#1a0000)',
    ],
  };

  // Tracks the active filter per universe (null = show all)
  const _activeFilter = { geek: null, esporte: null, crista: null, street: null };

  // ---- Product Card HTML ----
  function _productCard(product) {
    const priceFormatted = product.price.toLocaleString('pt-BR');
    const oldFormatted   = product.priceOld
      ? `<span class="product-price-old">R$ ${product.priceOld.toLocaleString('pt-BR')}</span>`
      : '';

    const availableSizes = product.sizes.filter(s => !product.sizesOff.includes(s));
    const sizeBtns = availableSizes.map(s =>
      `<button
        class="card-size-btn"
        data-size="${s}"
        onclick="event.stopPropagation(); Renderer.selectCardSize(this, '${product.id}', '${s}')"
      >${s}</button>`
    ).join('');

    return `
      <div
        class="product-card"
        data-product-id="${product.id}"
        data-category="${product.category}"
        data-selected-size=""
        onclick="Renderer.handleCardClick(event, '${product.id}')"
      >
        <div class="product-img-wrap">
          <img
            src="https://picsum.photos/400/500?random=${product.imgSeed}"
            alt="${product.name}"
            loading="lazy"
          />
          ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}

          <button
            class="product-wishlist-btn"
            onclick="event.stopPropagation(); this.classList.toggle('active'); Toast.show('♥ Adicionado aos favoritos');"
            aria-label="Adicionar aos favoritos"
          >
            <i class="fas fa-heart"></i>
          </button>

          <div class="product-hover-overlay">
            <div class="card-sizes-row">
              ${sizeBtns}
            </div>
            <button
              class="product-quick-add product-quick-add--disabled"
              id="quick-add-${product.id}"
              onclick="event.stopPropagation(); Renderer.quickAdd('${product.id}')"
            >
              <i class="fas fa-bag-shopping"></i> Adicionar ao Carrinho
            </button>
          </div>
        </div>

        <div class="product-info">
          <p class="product-name">${product.name}</p>
          <p class="product-meta-label">${product.meta}</p>
          <div class="product-price-row">
            <div class="price-group">
              <span class="product-price">R$ ${priceFormatted}</span>
              ${oldFormatted}
            </div>
            <button
              class="product-add-small"
              onclick="event.stopPropagation(); Modal.open(Renderer.getProduct('${product.id}'))"
              aria-label="Ver detalhes do produto"
            >
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
      </div>`;
  }

  // ---- Category Card HTML ----
  function _catCard(label, gradient) {
    return `
      <div class="cat-card">
        <div class="cat-card-bg" style="background:${gradient}"></div>
        <div class="cat-card-overlay"></div>
        <span class="cat-card-label">${label}</span>
      </div>`;
  }

  // ---- Build Nav ----
  // Each link gets an onclick that filters the product grid.
  // "Início" (index 0) resets the filter showing all products.
  // Other links filter by matching category name.
  function _buildNav(universe) {
    const el = document.getElementById(`nav-${universe}`);
    if (!el) return;
    el.innerHTML = STORE_NAV[universe].map((item, i) => {
      const isFirst    = i === 0;
      // The first item is always "Início" / all products
      const onclick    = isFirst
        ? `Renderer.filterProducts('${universe}', null, this)`
        : `Renderer.filterProducts('${universe}', '${item}', this)`;
      return `<a href="#" class="${isFirst ? 'active' : ''}" onclick="event.preventDefault(); ${onclick}">${item}</a>`;
    }).join('');
  }

  // ---- Build Hero ----
  function _buildHero(universe) {
    const copy    = HERO_COPY[universe];
    const content = document.getElementById(`hero-content-${universe}`);
    if (!content || !copy) return;
    content.innerHTML = `
      <p class="hero-eyebrow-tag">${copy.tag}</p>
      <h1 class="hero-main-title">${copy.title}</h1>
      <p class="hero-main-desc">${copy.desc}</p>
      <button class="hero-cta-btn" onclick="Toast.show('Explorando a coleção...')">
        ${copy.btnLabel} <i class="fas fa-arrow-right"></i>
      </button>`;
  }

  // ---- Build Products ----
  function _buildProducts(universe) {
    const el = document.getElementById(`products-${universe}`);
    if (!el) return;
    el.innerHTML = PRODUCTS[universe].map(_productCard).join('');
  }

  // ---- Build Banner ----
  function _buildBanner(universe) {
    const el   = document.getElementById(`banner-${universe}`);
    const copy = BANNER_COPY[universe];
    if (!el || !copy) return;
    el.innerHTML = `
      <div class="banner-strip-deco"></div>
      <div class="banner-strip-content">
        <p class="banner-tag">${copy.tag}</p>
        <h2 class="banner-title">${copy.title}</h2>
        <button class="banner-btn" onclick="Toast.show('Carregando coleção especial...')">
          ${copy.btn} <i class="fas fa-arrow-right"></i>
        </button>
      </div>`;
  }

  // ---- Build Categories ----
  function _buildCategories(universe) {
    const el    = document.getElementById(`categories-${universe}`);
    if (!el) return;
    const cats  = CATEGORIES[universe];
    const grads = CAT_GRADIENTS[universe];
    el.innerHTML = cats.map((c, i) => _catCard(c, grads[i])).join('');
  }

  // ---- Public API ----
  function buildAll() {
    ['geek', 'esporte', 'crista', 'street'].forEach(u => {
      _buildNav(u);
      _buildHero(u);
      _buildProducts(u);
      _buildBanner(u);
      _buildCategories(u);
    });
  }

  // Returns a product by ID across all universes.
  function getProduct(id) {
    for (const u of Object.keys(PRODUCTS)) {
      const found = PRODUCTS[u].find(p => p.id === id);
      if (found) return found;
    }
    return null;
  }

  // ---- Nav Filter ----
  // category === null means "show all" (Início).
  // category string filters cards by their data-category attribute.
  // Shows an empty-state message if no products match the chosen category.
  function filterProducts(universe, category, clickedLink) {
    _activeFilter[universe] = category;

    // Update nav active state
    const navEl = document.getElementById(`nav-${universe}`);
    if (navEl) {
      navEl.querySelectorAll('a').forEach(a => a.classList.remove('active'));
      if (clickedLink) clickedLink.classList.add('active');
    }

    const grid    = document.getElementById(`products-${universe}`);
    if (!grid) return;

    const cards   = grid.querySelectorAll('.product-card');
    let   visible = 0;

    cards.forEach(card => {
      const cardCategory = card.dataset.category || '';
      // Show card if no filter active, or if category matches (case-insensitive)
      const matches = !category || cardCategory.toLowerCase() === category.toLowerCase();
      card.style.display = matches ? '' : 'none';
      if (matches) visible++;
    });

    // Remove any existing empty-state before potentially re-adding
    const existingEmpty = grid.querySelector('.filter-empty-state');
    if (existingEmpty) existingEmpty.remove();

    if (visible === 0 && category) {
      // Show a helpful empty-state message when no products exist for this nav tab
      const msg = document.createElement('div');
      msg.className = 'filter-empty-state';
      msg.innerHTML = `
        <i class="fas fa-box-open"></i>
        <p>Nenhum produto em <strong>${category}</strong> no momento.</p>
        <button onclick="Renderer.filterProducts('${universe}', null, document.querySelector('#nav-${universe} a:first-child'))">
          Ver todos os produtos
        </button>`;
      grid.appendChild(msg);
    }

    // Scroll the section into view smoothly
    const section = grid.closest('.store-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ---- Card: select a size ----
  function selectCardSize(btn, productId, size) {
    const card = document.querySelector(`.product-card[data-product-id="${productId}"]`);
    if (!card) return;

    card.querySelectorAll('.card-size-btn').forEach(b => b.classList.remove('card-size-btn--selected'));
    btn.classList.add('card-size-btn--selected');
    card.dataset.selectedSize = size;

    const addBtn = card.querySelector('.product-quick-add');
    if (addBtn) addBtn.classList.remove('product-quick-add--disabled');
  }

  // ---- Card: quick add to cart ----
  function quickAdd(productId) {
    const card = document.querySelector(`.product-card[data-product-id="${productId}"]`);
    if (!card) return;

    const size = card.dataset.selectedSize;
    if (!size) {
      Toast.show('⚠ Selecione um tamanho primeiro');
      return;
    }

    const product = getProduct(productId);
    if (!product) return;

    Cart.addItem(product, size, product.colors[0], 1);

    // Reset card selection state
    card.dataset.selectedSize = '';
    card.querySelectorAll('.card-size-btn').forEach(b => b.classList.remove('card-size-btn--selected'));
    const addBtn = card.querySelector('.product-quick-add');
    if (addBtn) addBtn.classList.add('product-quick-add--disabled');
  }

  // ---- Card: handle card click ----
  // Opens modal unless the click was on a button element.
  function handleCardClick(event, productId) {
    if (event.target.closest('button')) return;
    if (event.target.closest('.card-size-btn')) return;
    const product = getProduct(productId);
    if (product) Modal.open(product);
  }

  return { buildAll, getProduct, filterProducts, selectCardSize, quickAdd, handleCardClick };
})();
