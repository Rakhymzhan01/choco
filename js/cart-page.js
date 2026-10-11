/* cart-page.js – cart page */
(function () {
  const user = Auth.current();
  if (!user) return;
  const box = document.getElementById('cart-box');

  function render() {
    const rows = Cart.detailed();
    if (!rows.length) {
      box.innerHTML = `<div class="empty"><div class="empty-icon">🛒</div><h2>Your cart is empty</h2><p>Find a great deal and add it to your cart.</p><a class="btn btn-primary" href="deals.html">Browse deals</a></div>`;
      return;
    }
    const opts = (sel) => Array.from({ length: Cart.MAX_QTY }, (_, i) => `<option value="${i + 1}"${i + 1 === sel ? ' selected' : ''}>${i + 1}</option>`).join('');
    box.innerHTML = `<div class="cart-grid">
      <div class="cart-list">${rows.map((r) => `
        <div class="cart-item">
          <a href="details.html?id=${r.deal.id}"><img src="${UI.esc(UI.img(r.deal.image))}" alt=""></a>
          <div class="cart-item-info">
            <h3><a href="details.html?id=${r.deal.id}">${UI.esc(r.deal.title)}</a></h3>
            <p class="merchant">${UI.esc(r.deal.merchant)}</p>
            <p class="price">${UI.fmt(r.deal.price)} <s class="old-price">${UI.fmt(r.deal.oldPrice)}</s></p>
          </div>
          <div class="cart-item-actions">
            <label class="sr-only" for="q${r.deal.id}">Quantity</label>
            <select id="q${r.deal.id}" data-qty="${r.deal.id}">${opts(r.qty)}</select>
            <strong>${UI.fmt(r.deal.price * r.qty)}</strong>
            <button class="btn btn-danger btn-sm" type="button" data-remove="${r.deal.id}">Remove</button>
          </div>
        </div>`).join('')}</div>
      <aside class="summary card-flat">
        <h2>Order summary</h2>
        <p class="sum-row"><span>Items</span><span>${Cart.count()}</span></p>
        <p class="sum-row"><span>Total</span><strong class="price">${UI.fmt(Cart.total())}</strong></p>
        <a class="btn btn-primary btn-block" href="checkout.html">Proceed to checkout</a>
        <a class="btn btn-outline btn-block" href="deals.html">Continue shopping</a>
      </aside></div>`;
  }

  box.addEventListener('change', (e) => {
    const s = e.target.closest('[data-qty]');
    if (s) { Cart.setQty(Number(s.dataset.qty), Number(s.value)); render(); }
  });
  box.addEventListener('click', (e) => {
    const b = e.target.closest('[data-remove]');
    if (b) { Cart.remove(Number(b.dataset.remove)); UI.toast('Item removed', 'info'); render(); }
  });
  render();
})();
