/* deals.js – catalog with search, filters and sorting (Step 14) */
(function () {
  const all = Store.deals();
  const f = {
    q: document.getElementById('f-q'), category: document.getElementById('f-category'),
    district: document.getElementById('f-district'), price: document.getElementById('f-price'),
    rating: document.getElementById('f-rating'), sort: document.getElementById('f-sort')
  };
  const grid = document.getElementById('deals-grid');
  const count = document.getElementById('result-count');
  const empty = document.getElementById('empty-state');

  f.category.innerHTML = '<option value="">All categories</option>' + CATEGORIES.map((c) => `<option value="${c.id}">${c.icon} ${UI.esc(c.name)}</option>`).join('');
  f.district.innerHTML = '<option value="">All districts</option>' + DISTRICTS.map((d) => `<option>${UI.esc(d)}</option>`).join('');

  const params = new URLSearchParams(location.search);
  if (params.get('q')) f.q.value = params.get('q');
  if (params.get('category')) f.category.value = params.get('category');

  function render() {
    const q = f.q.value.trim().toLowerCase();
    const maxPrice = Number(f.price.value) || Infinity;
    const minRating = Number(f.rating.value) || 0;
    let list = all.filter((d) =>
      (!q || (d.title + ' ' + d.merchant + ' ' + d.description + ' ' + UI.catName(d.category)).toLowerCase().includes(q)) &&
      (!f.category.value || d.category === f.category.value) &&
      (!f.district.value || d.district === f.district.value) &&
      d.price <= maxPrice && d.rating >= minRating);

    const s = f.sort.value;
    list.sort((a, b) =>
      s === 'price-asc' ? a.price - b.price :
      s === 'price-desc' ? b.price - a.price :
      s === 'discount' ? UI.discount(b) - UI.discount(a) :
      s === 'rating' ? b.rating - a.rating : b.bought - a.bought);

    grid.innerHTML = list.map(UI.card).join('');
    count.textContent = list.length + ' deal' + (list.length === 1 ? '' : 's') + ' found';
    empty.hidden = list.length > 0;

    // category chips
    document.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c.dataset.cat === f.category.value));
  }

  document.getElementById('chips').innerHTML =
    `<button class="chip" type="button" data-cat="">All</button>` +
    CATEGORIES.map((c) => `<button class="chip" type="button" data-cat="${c.id}">${c.icon} ${UI.esc(c.name)}</button>`).join('');
  document.getElementById('chips').addEventListener('click', (e) => {
    const b = e.target.closest('.chip'); if (!b) return;
    f.category.value = b.dataset.cat; render();
  });

  Object.values(f).forEach((el) => { el.addEventListener('input', render); el.addEventListener('change', render); });
  document.getElementById('filters').addEventListener('submit', (e) => { e.preventDefault(); render(); });
  document.getElementById('reset-filters').addEventListener('click', () => {
    f.q.value = ''; f.category.value = ''; f.district.value = ''; f.price.value = ''; f.rating.value = ''; f.sort.value = 'popular'; render();
  });
  UI.bindCardActions(grid);
  render();
})();
