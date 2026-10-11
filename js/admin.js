/* admin.js – admin panel: dashboard, users, deals CRUD, orders (Steps 11 & 12) */
(function () {
  const admin = Auth.current();
  if (!admin || admin.role !== 'admin') return;
  const STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
  const $ = (id) => document.getElementById(id);

  /* ---------- sections ---------- */
  function show(name) {
    document.querySelectorAll('.admin-sec').forEach((s) => { s.hidden = s.id !== 'sec-' + name; });
    document.querySelectorAll('.admin-side [data-section]').forEach((b) => b.classList.toggle('active', b.dataset.section === name));
    if (name === 'dashboard') renderDashboard();
    if (name === 'users') renderUsers();
    if (name === 'deals') renderDeals();
    if (name === 'orders') renderOrders();
    history.replaceState(null, '', '#' + name);
  }
  document.querySelector('.admin-side').addEventListener('click', (e) => {
    const b = e.target.closest('[data-section]');
    if (b) show(b.dataset.section);
  });
  $('admin-logout').addEventListener('click', () => { Auth.logout(); location.href = 'login.html?loggedout=1'; });

  /* ---------- dashboard ---------- */
  function renderDashboard() {
    const users = Store.users(), deals = Store.deals(), orders = Store.orders();
    const revenue = orders.filter((o) => o.status !== 'Cancelled').reduce((s, o) => s + o.total, 0);
    $('dash-cards').innerHTML = [
      ['Users', users.length, '👥'], ['Bookings', orders.length, '📦'], ['Products', deals.length, '🏷️'], ['Revenue', UI.fmt(revenue), '💰']
    ].map((c) => `<div class="stat-card"><span class="stat-ico">${c[2]}</span><strong>${c[1]}</strong><small>${c[0]}</small></div>`).join('');

    const max = Math.max(1, ...STATUSES.map((s) => orders.filter((o) => o.status === s).length));
    $('dash-status').innerHTML = STATUSES.map((s) => {
      const n = orders.filter((o) => o.status === s).length;
      return `<div class="bar-row"><span>${s}</span><div class="bar"><i class="status-${s.toLowerCase()}" style="width:${(n / max) * 100}%"></i></div><b>${n}</b></div>`;
    }).join('');

    const recent = orders.slice().sort((a, b) => b.id - a.id).slice(0, 5);
    $('dash-recent').innerHTML = recent.length ? recent.map((o) => {
      const u = users.find((x) => x.id === o.userId);
      return `<li><span>#${o.id} · ${u ? UI.esc(u.firstName + ' ' + u.lastName) : 'Deleted user'}</span><span>${UI.fmt(o.total)} <span class="status status-${o.status.toLowerCase()}">${o.status}</span></span></li>`;
    }).join('') : '<li>No bookings yet.</li>';
  }

  /* ---------- users ---------- */
  function renderUsers() {
    const q = $('user-search').value.trim().toLowerCase();
    const orders = Store.orders();
    const list = Store.users().filter((u) => !q || (u.firstName + ' ' + u.lastName + ' ' + u.email).toLowerCase().includes(q));
    $('users-body').innerHTML = list.map((u) => `<tr>
      <td data-label="ID">${u.id}</td>
      <td data-label="Name">${UI.esc(u.firstName)} ${UI.esc(u.lastName)}</td>
      <td data-label="Email">${UI.esc(u.email)}</td>
      <td data-label="Phone">${UI.esc(u.phone || '—')}</td>
      <td data-label="Role"><span class="status status-${u.role === 'admin' ? 'confirmed' : 'pending'}">${u.role}</span></td>
      <td data-label="Bookings">${orders.filter((o) => o.userId === u.id).length}</td>
      <td data-label="Registered">${UI.esc(UI.fmtDate(u.createdAt))}</td>
      <td>${u.role === 'admin' ? '' : `<button class="btn btn-danger btn-sm" data-del-user="${u.id}" type="button">Delete</button>`}</td></tr>`).join('') ||
      '<tr><td colspan="8">No users found.</td></tr>';
  }
  $('user-search').addEventListener('input', renderUsers);
  $('users-body').addEventListener('click', (e) => {
    const b = e.target.closest('[data-del-user]'); if (!b) return;
    const id = Number(b.dataset.delUser);
    if (!confirm('Delete this user and all their bookings?')) return;
    Store.saveUsers(Store.users().filter((u) => u.id !== id));
    Store.saveOrders(Store.orders().filter((o) => o.userId !== id));
    UI.toast('User deleted', 'info');
    renderUsers();
  });

  /* ---------- deals CRUD ---------- */
  const modal = $('deal-modal');
  const form = $('deal-form');
  form.category.innerHTML = CATEGORIES.map((c) => `<option value="${c.id}">${UI.esc(c.name)}</option>`).join('');
  form.district.innerHTML = DISTRICTS.map((d) => `<option>${UI.esc(d)}</option>`).join('');
  form.imagePreset.innerHTML = IMAGE_PRESETS.map((p) => `<option value="${p.file}">${UI.esc(p.label)}</option>`).join('');

  const R = {
    title: [V.required('Title'), V.minLength(5, 'Title'), V.maxLength(120, 'Title')],
    merchant: [V.required('Merchant'), V.minLength(2, 'Merchant')],
    category: [V.required('Category')],
    district: [V.required('District')],
    oldPrice: [V.required('Regular price'), V.positiveNumber('Regular price')],
    price: [V.required('Deal price'), V.positiveNumber('Deal price'),
      (v, f) => (v && Number(v) >= Number(f.elements.oldPrice.value) ? 'Deal price must be lower than the regular price.' : '')],
    validUntil: [V.required('Valid until'), V.futureDate('Valid until')],
    imageUrl: [(v) => (v && !/^https?:\/\/\S+$/i.test(v) ? 'Image URL must start with http:// or https://' : '')],
    description: [V.required('Description'), V.minLength(20, 'Description')],
    features: [V.required('Features')],
    conditions: [V.required('Conditions')]
  };
  V.live(form, R);

  function openForm(deal) {
    form.reset();
    form.querySelectorAll('.invalid').forEach(V.clearError);
    V.formAlert(form, '');
    $('deal-modal-title').textContent = deal ? 'Edit deal #' + deal.id : 'Add new deal';
    form.dealId.value = deal ? deal.id : '';
    if (deal) {
      ['title', 'merchant', 'category', 'district', 'oldPrice', 'price', 'validUntil', 'description', 'conditions'].forEach((k) => { form.elements[k].value = deal[k]; });
      form.features.value = deal.features.join('\n');
      const preset = IMAGE_PRESETS.find((p) => p.file === deal.image);
      if (preset) form.imagePreset.value = preset.file; else form.imageUrl.value = deal.image;
    }
    modal.hidden = false;
    form.elements.title.focus();
  }
  function closeForm() { modal.hidden = true; }
  $('add-deal').addEventListener('click', () => openForm(null));
  $('deal-cancel').addEventListener('click', closeForm);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeForm(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeForm(); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!V.validateForm(form, R)) return;
    const deals = Store.deals();
    const id = Number(form.dealId.value);
    const data = {
      title: form.elements.title.value.trim(), merchant: form.merchant.value.trim(), category: form.category.value, district: form.district.value,
      oldPrice: Number(form.oldPrice.value), price: Number(form.price.value), validUntil: form.validUntil.value,
      image: form.imageUrl.value.trim() || form.imagePreset.value,
      description: form.description.value.trim(),
      features: form.features.value.split('\n').map((s) => s.trim()).filter(Boolean),
      conditions: form.conditions.value.trim()
    };
    if (id) {
      const d = deals.find((x) => x.id === id);
      Object.assign(d, data);                                   // UPDATE
      UI.toast('Deal updated ✓');
    } else {
      deals.push(Object.assign({ id: Store.nextId(deals), rating: 4.5, reviews: 0, bought: 0 }, data)); // CREATE
      UI.toast('Deal added ✓');
    }
    Store.saveDeals(deals);
    closeForm();
    renderDeals();
  });

  function renderDeals() {
    const q = $('deal-search').value.trim().toLowerCase();
    const list = Store.deals().filter((d) => !q || (d.title + ' ' + d.merchant).toLowerCase().includes(q));
    $('deals-body').innerHTML = list.map((d) => `<tr>
      <td data-label="Image"><img class="thumb" src="${UI.esc(UI.img(d.image))}" alt=""></td>
      <td data-label="Title"><strong>${UI.esc(d.title)}</strong><br><small>${UI.esc(d.merchant)}</small></td>
      <td data-label="Category">${UI.esc(UI.catName(d.category))}</td>
      <td data-label="Price">${UI.fmt(d.price)} <s>${UI.fmt(d.oldPrice)}</s></td>
      <td data-label="Discount">-${UI.discount(d)}%</td>
      <td data-label="Bought">${d.bought}</td>
      <td class="row-actions"><button class="btn btn-outline btn-sm" data-edit="${d.id}" type="button">Edit</button>
        <button class="btn btn-danger btn-sm" data-del="${d.id}" type="button">Delete</button></td></tr>`).join('') ||
      '<tr><td colspan="7">No deals found.</td></tr>';
  }
  $('deal-search').addEventListener('input', renderDeals);
  $('deals-body').addEventListener('click', (e) => {
    const ed = e.target.closest('[data-edit]');
    const del = e.target.closest('[data-del]');
    if (ed) openForm(Store.deals().find((d) => d.id === Number(ed.dataset.edit)));
    if (del && confirm('Delete this deal permanently?')) {          // DELETE
      Store.saveDeals(Store.deals().filter((d) => d.id !== Number(del.dataset.del)));
      UI.toast('Deal deleted', 'info');
      renderDeals();
    }
  });

  /* ---------- orders ---------- */
  function renderOrders() {
    const st = $('order-filter').value;
    const users = Store.users();
    const list = Store.orders().filter((o) => !st || o.status === st).sort((a, b) => b.id - a.id);
    $('orders-body').innerHTML = list.map((o) => {
      const u = users.find((x) => x.id === o.userId);
      return `<tr>
      <td data-label="ID">#${o.id}</td>
      <td data-label="Customer">${u ? UI.esc(u.firstName + ' ' + u.lastName) + '<br><small>' + UI.esc(u.email) + '</small>' : '<em>Deleted user</em>'}</td>
      <td data-label="Items">${o.items.map((i) => UI.esc(i.title) + ' × ' + i.qty).join('<br>')}</td>
      <td data-label="Visit">${UI.esc(UI.fmtDate(o.usageDate))} ${UI.esc(o.usageTime)}<br><small>${o.people} people</small></td>
      <td data-label="Total">${UI.fmt(o.total)}</td>
      <td data-label="Status"><select data-status="${o.id}" aria-label="Status of order ${o.id}">${STATUSES.map((s) => `<option${s === o.status ? ' selected' : ''}>${s}</option>`).join('')}</select></td></tr>`;
    }).join('') || '<tr><td colspan="6">No bookings found.</td></tr>';
  }
  $('order-filter').addEventListener('change', renderOrders);
  $('orders-body').addEventListener('change', (e) => {
    const s = e.target.closest('[data-status]'); if (!s) return;
    const orders = Store.orders();
    const o = orders.find((x) => x.id === Number(s.dataset.status));
    if (o) { o.status = s.value; Store.saveOrders(orders); UI.toast('Status of #' + o.id + ' → ' + o.status); }
  });

  const start = location.hash.replace('#', '');
  show(['dashboard', 'users', 'deals', 'orders'].includes(start) ? start : 'dashboard');
})();
