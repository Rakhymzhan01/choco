/* details.js – single deal page (Step 7) */
(function () {
  const id = Number(new URLSearchParams(location.search).get('id'));
  const deal = Store.deals().find((d) => d.id === id);
  const box = document.getElementById('details');

  if (!deal) {
    box.innerHTML = `<div class="empty"><h2>Deal not found</h2><p>This offer does not exist or was removed.</p><a class="btn btn-primary" href="deals.html">Back to all deals</a></div>`;
    return;
  }
  document.title = deal.title + ' | Choco';
  const qtyOpts = Array.from({ length: Cart.MAX_QTY }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('');

  box.innerHTML = `
    <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="../index.html">Home</a> › <a href="deals.html">Deals</a> › <a href="deals.html?category=${deal.category}">${UI.esc(UI.catName(deal.category))}</a></nav>
    <div class="details-grid">
      <div class="details-media"><img src="${UI.esc(UI.img(deal.image))}" alt="${UI.esc(deal.title)}"><span class="badge-discount big">-${UI.discount(deal)}%</span></div>
      <div class="details-info">
        <p class="merchant">${UI.catIcon(deal.category)} ${UI.esc(UI.catName(deal.category))} · 📍 ${UI.esc(deal.district)}, Almaty</p>
        <h1>${UI.esc(deal.title)}</h1>
        <p class="meta"><span class="stars">${UI.stars(deal.rating)}</span> <strong>${deal.rating.toFixed(1)}</strong> (${deal.reviews} reviews) · ${deal.bought} bought</p>
        <p class="merchant-name">${UI.esc(deal.merchant)}</p>
        <div class="price-box">
          <span class="price big">${UI.fmt(deal.price)}</span><s class="old-price">${UI.fmt(deal.oldPrice)}</s>
          <span class="save">You save ${UI.fmt(deal.oldPrice - deal.price)}</span>
        </div>
        <p class="valid">⏳ Valid until ${UI.esc(UI.fmtDate(deal.validUntil))}</p>
        <div class="buy-row">
          <label for="qty">Quantity</label>
          <select id="qty">${qtyOpts}</select>
          <button class="btn btn-primary btn-lg" id="buy-now" type="button">Book now</button>
          <button class="btn btn-outline btn-lg" id="add-cart" type="button">🛒 Add to cart</button>
        </div>
      </div>
    </div>
    <div class="details-body">
      <section><h2>About this deal</h2><p>${UI.esc(deal.description)}</p></section>
      <section><h2>What's included</h2><ul class="check-list">${deal.features.map((x) => `<li>${UI.esc(x)}</li>`).join('')}</ul></section>
      <section><h2>Conditions</h2><p>${UI.esc(deal.conditions)}</p></section>
    </div>`;

  function act(go) {
    if (!Auth.current()) { location.href = Auth.loginUrl(Auth.currentPath()); return; }
    Cart.add(deal.id, Number(document.getElementById('qty').value));
    if (go) location.href = 'checkout.html'; else UI.toast('Added to cart 🛒');
  }
  document.getElementById('buy-now').addEventListener('click', () => act(true));
  document.getElementById('add-cart').addEventListener('click', () => act(false));

  // related
  const rel = Store.deals().filter((d) => d.category === deal.category && d.id !== deal.id).slice(0, 4);
  const others = rel.length ? rel : Store.deals().filter((d) => d.id !== deal.id).slice(0, 4);
  const relBox = document.getElementById('related');
  relBox.innerHTML = others.map(UI.card).join('');
  UI.bindCardActions(relBox);
})();
