/* layout.js – shared UI helpers (UI) + navbar / category bar / footer rendering */
const UI = (function () {
  const body = document.body;
  const base = body.dataset.base || '';
  const pageKey = body.dataset.page || '';

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const root = (p) => base + p;
  const page = (p) => (base === '' ? 'pages/' : '') + p;
  const img = (src) => (/^(https?:|data:)/.test(src) ? src : base + src);
  const fmt = (n) => Number(n).toLocaleString('ru-RU').replace(/ /g, ' ') + ' ₸';
  const stars = (r) => { const f = Math.round(r); return '★'.repeat(f) + '☆'.repeat(5 - f); };
  const discount = (d) => Math.round((1 - d.price / d.oldPrice) * 100);
  const catName = (id) => { const c = CATEGORIES.find((x) => x.id === id); return c ? c.name : id; };
  const catIcon = (id) => { const c = CATEGORIES.find((x) => x.id === id); return c ? c.icon : '🏷️'; };
  const fmtDate = (iso) => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }); };
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

  function avatar(user, cls) {
    if (user && user.photo) return `<img class="avatar ${cls || ''}" src="${esc(user.photo)}" alt="">`;
    const ini = user ? (user.firstName[0] + (user.lastName[0] || '')).toUpperCase() : '?';
    return `<span class="avatar ${cls || ''}" aria-hidden="true">${esc(ini)}</span>`;
  }

  function toast(msg, type) {
    let box = document.getElementById('toasts');
    if (!box) { box = document.createElement('div'); box.id = 'toasts'; box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    const t = document.createElement('div');
    t.className = 'toast toast-' + (type || 'success');
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(() => { t.classList.add('hide'); setTimeout(() => t.remove(), 300); }, 2800);
  }

  // Resize an image file to a small square-ish data URL (for avatars)
  function readImage(file, size) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onerror = reject;
      fr.onload = () => {
        const im = new Image();
        im.onerror = reject;
        im.onload = () => {
          const s = Math.min(size / im.width, size / im.height, 1);
          const c = document.createElement('canvas');
          c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
          c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
          resolve(c.toDataURL('image/jpeg', 0.85));
        };
        im.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }

  /* ---- deal card (Step 6) ---- */
  function card(d) {
    return `<article class="card deal-card">
      <a class="card-img" href="${page('details.html')}?id=${d.id}" aria-label="${esc(d.title)}">
        <img src="${esc(img(d.image))}" alt="${esc(d.title)}" loading="lazy">
        <span class="badge-discount">-${discount(d)}%</span>
        <span class="badge-district">📍 ${esc(d.district)}</span>
      </a>
      <div class="card-body">
        <p class="merchant">${esc(d.merchant)}</p>
        <h3 class="card-title"><a href="${page('details.html')}?id=${d.id}">${esc(d.title)}</a></h3>
        <p class="meta"><span class="stars" title="${d.rating} / 5">${stars(d.rating)}</span> <span>${d.rating.toFixed(1)} (${d.reviews})</span> · <span>${d.bought} bought</span></p>
        <div class="price-row"><span class="price">${fmt(d.price)}</span><s class="old-price">${fmt(d.oldPrice)}</s></div>
        <div class="card-actions">
          <a class="btn btn-primary btn-sm" href="${page('details.html')}?id=${d.id}">View details</a>
          <button class="btn btn-outline btn-sm" type="button" data-add-cart="${d.id}" title="Add to cart">🛒 Add</button>
        </div>
      </div></article>`;
  }

  // delegated "Add to cart" buttons inside a container
  function bindCardActions(container) {
    container.addEventListener('click', (e) => {
      const b = e.target.closest('[data-add-cart]');
      if (!b) return;
      if (!Auth.current()) { location.href = Auth.loginUrl(Auth.currentPath()); return; }
      Cart.add(Number(b.dataset.addCart), 1);
      toast('Added to cart 🛒');
    });
  }

  /* ---- layout rendering ---- */
  function renderHeader() {
    const user = Auth.current();
    const link = (key, href, label) => `<a href="${href}" class="${pageKey === key ? 'active' : ''}"${pageKey === key ? ' aria-current="page"' : ''}>${label}</a>`;
    let links = link('home', root('index.html'), 'Home') + link('deals', page('deals.html'), 'Deals') +
      link('about', page('about.html'), 'About') + link('contact', page('contact.html'), 'Contact');
    if (user) {
      links += link('cart', page('cart.html'), `🛒 Cart <span class="cart-badge" id="cart-count">${Cart.count()}</span>`) +
        link('profile', root('profile.html'), 'Profile');
      if (user.role === 'admin') links += link('admin', root('admin.html'), 'Admin');
      links += `<button type="button" class="btn btn-outline btn-sm" id="logout-btn">Logout</button>`;
    } else {
      links += link('login', root('login.html'), 'Login') + `<a class="btn btn-primary btn-sm" href="${root('register.html')}">Register</a>`;
    }
    const params = new URLSearchParams(location.search);
    const activeCat = pageKey === 'deals' ? params.get('category') : null;
    const cats = CATEGORIES.map((c) => `<a href="${page('deals.html')}?category=${c.id}" class="${activeCat === c.id ? 'active' : ''}">${c.icon} ${esc(c.name)}</a>`).join('');

    const header = document.getElementById('site-header');
    header.innerHTML = `
      <div class="container nav">
        <a class="logo" href="${root('index.html')}" aria-label="Choco home"><img src="${root('images/logo.svg')}" alt="" width="34" height="34"><span>Choco</span></a>
        <button class="nav-toggle" id="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="nav-links">☰</button>
        <nav class="nav-links" id="nav-links" aria-label="Main navigation">${links}</nav>
      </div>
      <div class="cat-bar"><div class="container cat-bar-inner">${cats}</div></div>`;

    document.getElementById('nav-toggle').addEventListener('click', (e) => {
      const nav = document.getElementById('nav-links');
      const open = nav.classList.toggle('open');
      e.currentTarget.setAttribute('aria-expanded', open);
      e.currentTarget.textContent = open ? '✕' : '☰';
    });
    const lo = document.getElementById('logout-btn');
    if (lo) lo.addEventListener('click', () => { Auth.logout(); location.href = root('login.html?loggedout=1'); });
  }

  function renderFooter() {
    const f = document.getElementById('site-footer');
    f.innerHTML = `<div class="container footer-grid">
      <div><a class="logo logo-light" href="${root('index.html')}"><img src="${root('images/logo.svg')}" alt="" width="30" height="30"><span>Choco</span></a>
        <p class="footer-text">Coupons and discounts at the best places in Almaty. A web programming student project.</p></div>
      <div><h4>Company</h4><ul><li><a href="${page('about.html')}">About</a></li><li><a href="${page('contact.html')}">Contact</a></li><li><a href="${page('privacy.html')}">Privacy</a></li><li><a href="${page('terms.html')}">Terms</a></li></ul></div>
      <div><h4>Customers</h4><ul><li><a href="${page('deals.html')}">All deals</a></li><li><a href="${root('profile.html')}">My account</a></li><li><a href="${page('cart.html')}">Cart</a></li></ul></div>
      <div><h4>Follow us</h4><ul class="social"><li><a href="https://instagram.com" target="_blank" rel="noopener">Instagram</a></li><li><a href="https://facebook.com" target="_blank" rel="noopener">Facebook</a></li><li><a href="https://t.me" target="_blank" rel="noopener">Telegram</a></li></ul></div>
    </div><div class="footer-bottom"><div class="container">© 2026 Choco · Student Project</div></div>`;
  }

  if (body.dataset.guard) Auth.require(body.dataset.guard);   // redirect visitors without access
  renderHeader();
  renderFooter();

  return { base, esc, root, page, img, fmt, stars, discount, catName, catIcon, fmtDate, today, avatar, toast, readImage, card, bindCardActions };
})();
