/* ============================================================
   js/modal.js — Product detail modal logic
   MATHEORY © 2024
   ============================================================ */

const Modal = (() => {
  let selectedSize   = null;
  let selectedColor  = null;
  let qty            = 1;
  let currentProduct = null;

  // ---- Open Modal ----
  // Populates every section of the modal box, then makes it visible.
  function open(product) {
    currentProduct = product;
    // Default selections: first available size and first color
    const firstAvailableSize = product.sizes.find(s => !product.sizesOff.includes(s)) || product.sizes[0];
    selectedSize  = firstAvailableSize;
    selectedColor = product.colors[0];
    qty           = 1;

    const universe = Navigation.current();
    const backdrop = document.getElementById(`modal-backdrop-${universe}`);
    if (!backdrop) return;

    // ---- Gallery ----
    // Main hero image
    const mainImg = backdrop.querySelector('.modal-main-img');
    mainImg.src = `https://picsum.photos/700/880?random=${product.imgSeed}`;
    mainImg.alt = product.name;

    // Four thumbnail images using offset seeds so they look like alternate angles/details.
    // Seeds are spaced apart so they don't accidentally repeat the main image.
    const thumbSeeds = [
      product.imgSeed + 100,
      product.imgSeed + 200,
      product.imgSeed + 300,
      product.imgSeed + 400,
    ];
    const thumbsContainer = backdrop.querySelector('.modal-thumbs');
    thumbsContainer.innerHTML = thumbSeeds.map((seed, i) => `
      <div class="modal-thumb${i === 0 ? ' modal-thumb--active' : ''}"
           onclick="Modal.switchImage(this, 'https://picsum.photos/700/880?random=${seed}')">
        <img src="https://picsum.photos/120/150?random=${seed}" alt="Ângulo ${i + 2}" loading="lazy" />
      </div>
    `).join('');

    // Also reset the first "active" thumb to point at the main image seed
    // so switching back to first thumb restores the hero image.
    // We prepend a thumb for the hero image itself.
    thumbsContainer.innerHTML = `
      <div class="modal-thumb modal-thumb--active"
           onclick="Modal.switchImage(this, 'https://picsum.photos/700/880?random=${product.imgSeed}')">
        <img src="https://picsum.photos/120/150?random=${product.imgSeed}" alt="${product.name}" loading="lazy" />
      </div>
    ` + thumbSeeds.map((seed, i) => `
      <div class="modal-thumb"
           onclick="Modal.switchImage(this, 'https://picsum.photos/700/880?random=${seed}')">
        <img src="https://picsum.photos/120/150?random=${seed}" alt="Ângulo ${i + 2}" loading="lazy" />
      </div>
    `).join('');

    // ---- Badge ----
    const badge = backdrop.querySelector('.modal-img-badge');
    if (product.badge) {
      badge.textContent = product.badge;
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }

    // ---- Text content ----
    backdrop.querySelector('.modal-category-tag').textContent   = `✦ ${product.category}`;
    backdrop.querySelector('.modal-product-name').textContent   = product.name;
    backdrop.querySelector('.modal-product-meta').textContent   = product.meta;
    backdrop.querySelector('.modal-price').textContent          = `R$ ${product.price.toLocaleString('pt-BR')}`;

    const oldEl = backdrop.querySelector('.modal-price-old');
    if (product.priceOld) {
      oldEl.textContent    = `R$ ${product.priceOld.toLocaleString('pt-BR')}`;
      oldEl.style.display  = 'inline';
    } else {
      oldEl.style.display  = 'none';
    }

    // Installment calculation: 12× without interest
    const installments = Math.ceil(product.price / 12);
    backdrop.querySelector('.modal-price-installments').textContent =
      `ou 12× de R$ ${installments.toLocaleString('pt-BR')} sem juros`;

    // ---- Description ----
    backdrop.querySelector('.modal-description p').textContent = product.desc;

    // ---- Product features list ----
    // Build a simple characteristic breakdown from the meta string
    const features = _buildFeatures(product);
    backdrop.querySelector('.modal-features-list').innerHTML = features;

    // ---- Sizes ----
    _renderSizes(backdrop, product);

    // ---- Colors ----
    _renderColors(backdrop, product);

    // ---- Quantity reset ----
    backdrop.querySelector('.modal-qty-value').textContent = '1';

    // ---- Related products ----
    _renderRelated(backdrop, product);

    // ---- Open ----
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  // Switches the main gallery image when a thumbnail is clicked.
  function switchImage(thumbEl, newSrc) {
    // Find the modal-gallery-col ancestor to scope the queries
    const galleryCol = thumbEl.closest('.modal-gallery-col');
    if (!galleryCol) return;

    // Update main image src
    const mainImg = galleryCol.querySelector('.modal-main-img');
    if (mainImg) mainImg.src = newSrc;

    // Update active thumb highlight
    galleryCol.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('modal-thumb--active'));
    thumbEl.classList.add('modal-thumb--active');
  }

  // Renders size buttons inside the modal.
  // The first available (non-off) size starts pre-selected.
  function _renderSizes(backdrop, product) {
    const container = backdrop.querySelector('.modal-sizes');
    container.innerHTML = product.sizes.map(size => {
      const unavail    = product.sizesOff.includes(size);
      const isSelected = size === selectedSize;
      return `<button
        class="size-btn${isSelected ? ' selected' : ''}${unavail ? ' unavailable' : ''}"
        ${unavail ? 'disabled' : ''}
        onclick="Modal._selectSize(this, '${size}')">${size}</button>`;
    }).join('');
  }

  // Renders color swatches inside the modal.
  function _renderColors(backdrop, product) {
    const container = backdrop.querySelector('.modal-colors');
    container.innerHTML = product.colors.map((color, i) => `
      <div class="color-swatch${i === 0 ? ' selected' : ''}"
           style="background:${color}"
           title="${color}"
           onclick="Modal._selectColor(this, '${color}')"></div>
    `).join('');
  }

  // Renders related products — up to 4 items from the same universe,
  // excluding the product currently being viewed.
  function _renderRelated(backdrop, product) {
    const relatedSection = backdrop.querySelector('.modal-related');
    if (!relatedSection) return;

    // Get all products from the same universe, excluding the current one
    const universe        = product.universe;
    const allInUniverse   = PRODUCTS[universe] || [];
    const related         = allInUniverse.filter(p => p.id !== product.id).slice(0, 4);

    if (related.length === 0) {
      relatedSection.style.display = 'none';
      return;
    }

    relatedSection.style.display = '';
    const grid = backdrop.querySelector('.modal-related-grid');
    grid.innerHTML = related.map(p => {
      const price = p.price.toLocaleString('pt-BR');
      return `
        <div class="modal-related-card" onclick="Modal.open(Renderer.getProduct('${p.id}'))">
          <div class="modal-related-img-wrap">
            <img src="https://picsum.photos/240/300?random=${p.imgSeed}" alt="${p.name}" loading="lazy" />
            ${p.badge ? `<span class="modal-related-badge">${p.badge}</span>` : ''}
          </div>
          <div class="modal-related-info">
            <p class="modal-related-name">${p.name}</p>
            <p class="modal-related-meta">${p.meta}</p>
            <div class="modal-related-price-row">
              <span class="modal-related-price">R$ ${price}</span>
              <button class="modal-related-add-btn"
                onclick="event.stopPropagation(); Modal.open(Renderer.getProduct('${p.id}'))"
                aria-label="Ver ${p.name}">
                <i class="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  // Builds a small HTML list of product characteristics extracted from its data.
  function _buildFeatures(product) {
    const items = [];
    if (product.meta) items.push(`<li><i class="fas fa-check-circle"></i> ${product.meta}</li>`);
    if (product.sizes && product.sizes.length) {
      items.push(`<li><i class="fas fa-ruler"></i> Tamanhos: ${product.sizes.filter(s => !product.sizesOff.includes(s)).join(', ')}</li>`);
    }
    if (product.colors && product.colors.length) {
      items.push(`<li><i class="fas fa-palette"></i> ${product.colors.length} opção${product.colors.length > 1 ? 'ões' : ''} de cor</li>`);
    }
    items.push(`<li><i class="fas fa-shield-alt"></i> Garantia de qualidade MATHEORY</li>`);
    items.push(`<li><i class="fas fa-truck"></i> Frete grátis acima de R$ 299</li>`);
    return `<ul class="modal-features">${items.join('')}</ul>`;
  }

  // ---- Internal Selection Handlers ----

  function _selectSize(btn, size) {
    selectedSize = size;
    const container = btn.closest('.modal-sizes');
    container.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  }

  function _selectColor(swatch, color) {
    selectedColor = color;
    const container = swatch.closest('.modal-colors');
    container.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
    swatch.classList.add('selected');
  }

  // Changes the quantity counter up or down, clamped at minimum 1.
  function changeQty(delta) {
    const universe = Navigation.current();
    const el = document.querySelector(`#modal-backdrop-${universe} .modal-qty-value`);
    if (!el) return;
    qty = Math.max(1, qty + delta);
    el.textContent = qty;
  }

  // Adds the current product to the cart with the selected size, color, and quantity.
  function addToCart() {
    if (!currentProduct) return;
    Cart.addItem(currentProduct, selectedSize, selectedColor, qty);
    close();
  }

  // ---- Close ----
  function close() {
    document.querySelectorAll('.modal-backdrop').forEach(el => el.classList.remove('open'));
    document.body.style.overflow = '';
  }

  // Close when clicking directly on the dark backdrop (outside the modal box)
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) close();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  return { open, close, addToCart, changeQty, switchImage, _selectSize, _selectColor };
})();
