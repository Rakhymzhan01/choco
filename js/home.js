/* home.js – home page */
(function () {
  const user = Auth.current();
  const deals = Store.deals();

  // user info bar
  const ub = document.getElementById('userbar');
  const cta = document.getElementById('cta');
  if (user) {
    ub.hidden = false;
    ub.innerHTML = `<div class="container userbar-inner">
      ${UI.avatar(user, 'sm')}
      <div class="userbar-text"><strong>Welcome back, ${UI.esc(user.firstName)}!</strong><span>${UI.esc(user.email)}</span></div>
      <div class="userbar-actions"><a class="btn btn-outline btn-sm" href="profile.html">My profile</a><button class="btn btn-dark btn-sm" id="ub-logout" type="button">Logout</button></div>
    </div>`;
    document.getElementById('ub-logout').addEventListener('click', () => { Auth.logout(); location.href = 'login.html?loggedout=1'; });
    cta.textContent = 'Browse deals';
    cta.href = 'pages/deals.html';
  } else {
    cta.textContent = 'Get started';
    cta.href = 'register.html';
  }

  // hero search
  document.getElementById('hero-search').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = e.target.q.value.trim();
    location.href = 'pages/deals.html' + (q ? '?q=' + encodeURIComponent(q) : '');
  });

  // categories
  document.getElementById('cat-grid').innerHTML = CATEGORIES.map((c) => {
    const n = deals.filter((d) => d.category === c.id).length;
    return `<a class="cat-tile" href="pages/deals.html?category=${c.id}"><span class="cat-icon">${c.icon}</span><strong>${UI.esc(c.name)}</strong><small>${n} deal${n === 1 ? '' : 's'}</small></a>`;
  }).join('');

  // hot deals
  const hot = deals.slice().sort((a, b) => b.bought - a.bought).slice(0, 8);
  const grid = document.getElementById('hot-deals');
  grid.innerHTML = hot.map(UI.card).join('');
  UI.bindCardActions(grid);

  // stats
  document.getElementById('stat-deals').textContent = deals.length;
  document.getElementById('stat-users').textContent = Store.users().length;
  document.getElementById('stat-orders').textContent = Store.orders().length;
})();
