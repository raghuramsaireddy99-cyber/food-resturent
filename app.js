// ─── CART STORE ────────────────────────────────────
const Cart = {
  items: JSON.parse(localStorage.getItem('fd_cart') || '[]'),

  save() {
    localStorage.setItem('fd_cart', JSON.stringify(this.items));
    this.render();
    this.updateBadge();
  },

  add(id, name, price, emoji) {
    const existing = this.items.find(i => i.id === id);
    if (existing) {
      existing.qty++;
    } else {
      this.items.push({ id, name, price, emoji, qty: 1 });
    }
    this.save();
    showToast(`${emoji} ${name} added to cart!`, 'info');
  },

  remove(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.save();
  },

  updateQty(id, delta) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) this.remove(id);
    else this.save();
  },

  clear() {
    this.items = [];
    this.save();
  },

  get total() {
    return this.items.reduce((s, i) => s + i.price * i.qty, 0);
  },

  get count() {
    return this.items.reduce((s, i) => s + i.qty, 0);
  },

  get subtotal() { return this.total; },
  get delivery() { return this.total > 0 ? 40 : 0; },
  get tax() { return Math.round(this.total * 0.05); },
  get grand() { return this.subtotal + this.delivery + this.tax; },

  render() {
    const body = document.getElementById('cartBody');
    const footer = document.getElementById('cartFooter');
    if (!body) return;

    if (this.items.length === 0) {
      body.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-emoji">🛒</div>
          <p style="font-weight:600;color:#1A1A1A;margin-bottom:0.3rem">Your cart is empty</p>
          <p style="font-size:0.85rem">Add some delicious items!</p>
        </div>`;
      if (footer) footer.style.display = 'none';
      return;
    }

    if (footer) footer.style.display = 'block';
    body.innerHTML = this.items.map(item => `
      <div class="cart-item" id="ci-${item.id}">
        <div class="cart-item-emoji">${item.emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">₹${(item.price * item.qty).toFixed(0)}</div>
        </div>
        <div class="qty-ctrl">
          <button class="qty-btn" onclick="Cart.updateQty('${item.id}', -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="Cart.updateQty('${item.id}', 1)">+</button>
        </div>
      </div>
    `).join('');

    if (footer) {
      footer.innerHTML = `
        <div class="cart-total-row"><span>Subtotal</span><span>₹${this.subtotal}</span></div>
        <div class="cart-total-row"><span>Delivery fee</span><span>₹${this.delivery}</span></div>
        <div class="cart-total-row"><span>Taxes (5%)</span><span>₹${this.tax}</span></div>
        <div class="cart-total-row grand"><span>Total</span><span style="color:var(--flame)">₹${this.grand}</span></div>
        <button class="checkout-btn" onclick="window.location.href='checkout.html'">
          Proceed to Checkout →
        </button>`;
    }
  },

  updateBadge() {
    document.querySelectorAll('.cart-badge').forEach(el => {
      el.textContent = this.count;
      el.style.display = this.count === 0 ? 'none' : 'inline';
    });
  }
};

// ─── CART SIDEBAR ────────────────────────────────
function openCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  if (sidebar) { sidebar.classList.add('open'); overlay.classList.add('show'); }
}
function closeCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  if (sidebar) { sidebar.classList.remove('open'); overlay.classList.remove('show'); }
}

// ─── TOAST ────────────────────────────────────────
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast-item ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 2800);
}

// ─── NAVBAR SCROLL ────────────────────────────────
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.navbar');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
});

// ─── CATEGORY FILTER ─────────────────────────────
function filterCategory(cat, btn) {
  document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  const cards = document.querySelectorAll('[data-category]');
  cards.forEach(card => {
    const col = card.closest('.food-col') || card;
    if (cat === 'all' || card.dataset.category === cat) {
      col.style.display = '';
      col.style.animation = 'fadeIn 0.3s ease';
    } else {
      col.style.display = 'none';
    }
  });
}

// ─── MENU SEARCH ─────────────────────────────────
function searchMenu(val) {
  const q = val.toLowerCase();
  document.querySelectorAll('[data-name]').forEach(card => {
    const col = card.closest('.food-col') || card;
    col.style.display = card.dataset.name.includes(q) ? '' : 'none';
  });
}

// ─── FAVORITES ────────────────────────────────────
let favs = JSON.parse(localStorage.getItem('fd_favs') || '[]');
function toggleFav(id, btn) {
  if (favs.includes(id)) {
    favs = favs.filter(f => f !== id);
    btn.textContent = '🤍';
    btn.classList.remove('active');
  } else {
    favs.push(id);
    btn.textContent = '❤️';
    btn.classList.add('active');
    showToast('Added to favourites!', 'success');
  }
  localStorage.setItem('fd_favs', JSON.stringify(favs));
}

// ─── PROMO CODE ───────────────────────────────────
const promoCodes = { 'FIRST50': 50, 'SPICY20': 20, 'SAVE100': 100 };
function applyPromo() {
  const input = document.getElementById('promoInput');
  const result = document.getElementById('promoResult');
  if (!input || !result) return;
  const code = input.value.trim().toUpperCase();
  if (promoCodes[code]) {
    const disc = promoCodes[code];
    result.innerHTML = `<span style="color:#27AE60;font-weight:600">✅ Promo applied! You save ₹${disc}</span>`;
    showToast(`Promo code applied! ₹${disc} off`, 'success');
  } else {
    result.innerHTML = `<span style="color:#dc3545;font-weight:600">❌ Invalid promo code</span>`;
  }
}

// ─── FORM VALIDATION ─────────────────────────────
function validateCheckout() {
  const fields = ['fullName','email','phone','address','city','pincode'];
  let valid = true;
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (!el.value.trim()) {
      el.classList.add('is-invalid');
      valid = false;
    } else {
      el.classList.remove('is-invalid');
    }
  });
  if (!valid) { showToast('Please fill all required fields', 'info'); return; }

  const paymentSelected = document.querySelector('.payment-option.selected');
  if (!paymentSelected) { showToast('Please select a payment method', 'info'); return; }

  // Success
  Cart.clear();
  showOrderSuccess();
}

function showOrderSuccess() {
  const main = document.querySelector('main') || document.body;
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(26,26,26,0.85);z-index:9998;
    display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);
  `;
  overlay.innerHTML = `
    <div style="background:white;border-radius:24px;padding:3rem 2.5rem;max-width:440px;text-align:center;animation:fadeIn 0.4s ease;">
      <div style="font-size:5rem;margin-bottom:1rem">🎉</div>
      <h2 style="font-family:'Playfair Display',serif;font-size:1.8rem;margin-bottom:0.5rem;">Order Placed!</h2>
      <p style="color:#6B6B6B;margin-bottom:0.3rem">Your food is being prepared with love.</p>
      <p style="color:#6B6B6B;margin-bottom:2rem;font-size:0.9rem">Estimated delivery: <strong>30-45 mins</strong></p>
      <div style="background:#FFF8F0;border-radius:12px;padding:1rem;margin-bottom:1.5rem;font-size:0.88rem;color:#6B6B6B;">
        Order ID: <strong style="color:#FF4500">#FD${Date.now().toString().slice(-6)}</strong>
      </div>
      <a href="index.html" style="display:inline-block;background:linear-gradient(135deg,#FF4500,#FF6B35);color:white;padding:0.85rem 2.5rem;border-radius:50px;font-weight:600;text-decoration:none;">
        Back to Home
      </a>
    </div>`;
  document.body.appendChild(overlay);
}

// ─── SORT MENU ────────────────────────────────────
function sortMenu(val) {
  const grid = document.getElementById('menuGrid');
  if (!grid) return;
  const cols = Array.from(grid.querySelectorAll('.food-col'));
  cols.sort((a, b) => {
    const ca = a.querySelector('[data-price]'), cb = b.querySelector('[data-price]');
    const pa = ca ? +ca.dataset.price : 0, pb = cb ? +cb.dataset.price : 0;
    const ra = ca ? +ca.dataset.rating : 0, rb = cb ? +cb.dataset.rating : 0;
    if (val === 'price-asc') return pa - pb;
    if (val === 'price-desc') return pb - pa;
    if (val === 'rating') return rb - ra;
    return 0;
  });
  cols.forEach(c => grid.appendChild(c));
}

// ─── PAYMENT OPTION SELECT ───────────────────────
document.addEventListener('click', e => {
  const opt = e.target.closest('.payment-option');
  if (opt) {
    document.querySelectorAll('.payment-option').forEach(p => p.classList.remove('selected'));
    opt.classList.add('selected');
    opt.querySelector('input[type="radio"]').checked = true;
  }
});

// ─── INIT ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Cart.render();
  Cart.updateBadge();

  // highlight active nav
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(l => {
    if (l.getAttribute('href') === path) l.classList.add('active');
  });

  // Fade-in on load
  document.querySelectorAll('.food-card, .restaurant-card').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.4s ${i * 0.06}s, transform 0.4s ${i * 0.06}s`;
    setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, 50);
  });
});

// CSS animation keyframe injection
const style = document.createElement('style');
style.textContent = `@keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`;
document.head.appendChild(style);
