/* auth.js – registration, login, session and access control (client-side, localStorage) */
const Auth = (function () {
  const base = document.body.dataset.base || '';

  function current() {
    const id = Store.sessionUserId();
    if (!id) return null;
    const u = Store.users().find((x) => x.id === id);
    if (!u) { Store.clearSession(); return null; }
    return u;
  }

  function currentPath() {
    const file = location.pathname.split('/').pop() || 'index.html';
    return (base ? 'pages/' : '') + file + location.search;
  }

  function loginUrl(next) {
    return base + 'login.html' + (next ? '?next=' + encodeURIComponent(next) : '');
  }

  // Only allow redirects to our own html pages
  function safeNext(n) {
    return /^(pages\/)?[\w-]+\.html(\?[\w=&%.\-]*)?$/.test(n || '') ? n : null;
  }

  // Guard: redirect when the visitor may not see the page. role: 'user' | 'admin'
  function require(role) {
    const u = current();
    if (!u) { location.replace(loginUrl(currentPath())); return null; }
    if (role === 'admin' && u.role !== 'admin') { location.replace(base + 'index.html'); return null; }
    return u;
  }

  function register(d) {
    const email = d.email.trim().toLowerCase();
    const users = Store.users();
    if (users.some((u) => u.email === email)) {
      return { ok: false, field: 'email', error: 'An account with this email already exists.' };
    }
    const user = {
      id: Store.nextId(users),
      firstName: d.firstName.trim(), lastName: d.lastName.trim(), email,
      passwordHash: Store.hash(d.password), role: 'user',
      phone: (d.phone || '').trim(), dob: d.dob || '', photo: d.photo || '',
      createdAt: new Date().toISOString()
    };
    users.push(user);
    Store.saveUsers(users);
    return { ok: true, user };
  }

  function login(email, password) {
    const u = Store.users().find((x) => x.email === email.trim().toLowerCase());
    if (!u) return { ok: false, field: 'email', error: 'No account found with this email. Please register first.' };
    if (u.passwordHash !== Store.hash(password)) return { ok: false, field: 'password', error: 'Incorrect password. Please try again.' };
    Store.setSession(u.id);
    return { ok: true, user: u };
  }

  function logout() { Store.clearSession(); }

  function updateProfile(id, data) {
    const users = Store.users();
    const u = users.find((x) => x.id === id);
    if (!u) return { ok: false, error: 'User not found.' };
    u.firstName = data.firstName.trim();
    u.lastName = data.lastName.trim();
    u.phone = (data.phone || '').trim();
    u.dob = data.dob || '';
    if (data.photo !== undefined) u.photo = data.photo;
    Store.saveUsers(users);
    return { ok: true, user: u };
  }

  function changePassword(id, oldPw, newPw) {
    const users = Store.users();
    const u = users.find((x) => x.id === id);
    if (!u) return { ok: false, error: 'User not found.' };
    if (u.passwordHash !== Store.hash(oldPw)) return { ok: false, field: 'oldPassword', error: 'Current password is incorrect.' };
    u.passwordHash = Store.hash(newPw);
    Store.saveUsers(users);
    return { ok: true };
  }

  return { current, require, register, login, logout, updateProfile, changePassword, safeNext, loginUrl, currentPath };
})();
