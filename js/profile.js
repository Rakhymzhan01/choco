/* profile.js – personal account (Step 10) */
(function () {
  let user = Auth.current();
  if (!user) return;

  const info = document.getElementById('profile-info');
  const editBox = document.getElementById('edit-box');
  const form = document.getElementById('edit-form');
  const pwForm = document.getElementById('pw-form');
  const ordersBox = document.getElementById('orders-box');

  function renderInfo() {
    user = Auth.current();
    info.innerHTML = `
      ${UI.avatar(user, 'lg')}
      <div class="profile-meta">
        <h1>${UI.esc(user.firstName)} ${UI.esc(user.lastName)}</h1>
        <p>✉ ${UI.esc(user.email)}</p>
        <p>📞 ${UI.esc(user.phone || 'Phone not set')}</p>
        <p>🎂 ${user.dob ? UI.esc(UI.fmtDate(user.dob)) : 'Date of birth not set'}</p>
        <p><span class="status status-${user.role === 'admin' ? 'confirmed' : 'pending'}">${user.role === 'admin' ? 'Administrator' : 'Customer'}</span> · Member since ${UI.esc(UI.fmtDate(user.createdAt))}</p>
        <div class="profile-actions">
          <button class="btn btn-primary btn-sm" id="edit-btn" type="button">Edit profile</button>
          <button class="btn btn-dark btn-sm" id="profile-logout" type="button">Logout</button>
        </div>
      </div>`;
    document.getElementById('edit-btn').addEventListener('click', openEdit);
    document.getElementById('profile-logout').addEventListener('click', () => { Auth.logout(); location.href = 'login.html?loggedout=1'; });
  }

  function openEdit() {
    editBox.hidden = false;
    form.firstName.value = user.firstName; form.lastName.value = user.lastName;
    form.phone.value = user.phone || ''; form.dob.value = user.dob || '';
    form.photo.value = '';
    editBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  document.getElementById('edit-cancel').addEventListener('click', () => { editBox.hidden = true; });

  const R = {
    firstName: [V.required('First name'), V.name('First name'), V.minLength(2, 'First name')],
    lastName: [V.required('Last name'), V.name('Last name'), V.minLength(2, 'Last name')],
    phone: [V.phone()], dob: [V.birthDate()], photo: [V.imageFile(2)]
  };
  V.live(form, R);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!V.validateForm(form, R)) return;
    const data = { firstName: form.firstName.value, lastName: form.lastName.value, phone: form.phone.value, dob: form.dob.value };
    const f = form.photo.files[0];
    if (f) { try { data.photo = await UI.readImage(f, 200); } catch (err) { V.setError(form.photo, 'Could not read this image.'); return; } }
    Auth.updateProfile(user.id, data);
    editBox.hidden = true;
    renderInfo();
    UI.toast('Profile updated ✓');
  });

  const PR = {
    oldPassword: [V.required('Current password')],
    newPassword: [V.required('New password'), V.password()],
    confirmNewPassword: [V.required('Confirm new password'), V.match('newPassword', 'Passwords do not match.')]
  };
  V.live(pwForm, PR);
  pwForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!V.validateForm(pwForm, PR)) return;
    const res = Auth.changePassword(user.id, pwForm.oldPassword.value, pwForm.newPassword.value);
    if (!res.ok) { V.setError(pwForm.elements[res.field], res.error); return; }
    pwForm.reset();
    UI.toast('Password changed ✓');
  });

  /* ---- orders ---- */
  function renderOrders() {
    const orders = Store.orders().filter((o) => o.userId === user.id).sort((a, b) => b.id - a.id);
    if (!orders.length) {
      ordersBox.innerHTML = `<div class="empty"><div class="empty-icon">🎟️</div><p>You have no bookings yet.</p><a class="btn btn-primary" href="pages/deals.html">Find a deal</a></div>`;
      return;
    }
    ordersBox.innerHTML = `<div class="table-wrap"><table class="table">
      <thead><tr><th>ID</th><th>Deal</th><th>Visit date</th><th>Total</th><th>Status</th><th></th></tr></thead>
      <tbody>${orders.map((o) => `<tr>
        <td data-label="ID">#${o.id}</td>
        <td data-label="Deal">${o.items.map((i) => `${UI.esc(i.title)} × ${i.qty}`).join('<br>')}
          <details><summary>Coupon codes</summary>${o.items.map((i) => i.codes.map((c) => `<code>${UI.esc(c)}</code>`).join(' ')).join(' ')}</details></td>
        <td data-label="Visit date">${UI.esc(UI.fmtDate(o.usageDate))} ${UI.esc(o.usageTime)}</td>
        <td data-label="Total">${UI.fmt(o.total)}</td>
        <td data-label="Status"><span class="status status-${o.status.toLowerCase()}">${o.status}</span></td>
        <td>${o.status === 'Pending' ? `<button class="btn btn-danger btn-sm" data-cancel="${o.id}" type="button">Cancel</button>` : ''}</td>
      </tr>`).join('')}</tbody></table></div>`;
  }
  ordersBox.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cancel]');
    if (!b || !confirm('Cancel this booking?')) return;
    const orders = Store.orders();
    const o = orders.find((x) => x.id === Number(b.dataset.cancel));
    if (o) { o.status = 'Cancelled'; Store.saveOrders(orders); }
    renderOrders();
    UI.toast('Booking cancelled', 'info');
  });

  renderInfo();
  renderOrders();
})();
