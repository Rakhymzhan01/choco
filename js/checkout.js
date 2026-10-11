/* checkout.js – booking / order form (Step 8) */
(function () {
  const user = Auth.current();
  if (!user) return;
  const rows = Cart.detailed();
  if (!rows.length) { location.replace('cart.html'); return; }

  const form = document.getElementById('checkout-form');
  document.getElementById('order-items').innerHTML = rows.map((r) =>
    `<li><span>${UI.esc(r.deal.title)} <small>× ${r.qty}</small></span><strong>${UI.fmt(r.deal.price * r.qty)}</strong></li>`).join('');
  document.getElementById('order-total').textContent = UI.fmt(Cart.total());

  form.usageDate.min = UI.today();
  form.phone.value = user.phone || '';

  const R = {
    usageDate: [V.required('Date'), V.futureDate('Date')],
    usageTime: [V.required('Time')],
    people: [V.required('Number of people'), V.intRange(1, 10, 'Number of people')],
    phone: [V.required('Phone number'), V.phone()],
    payment: [V.required('Payment method')],
    comment: [V.maxLength(300, 'Additional information')],
    terms: [V.required('Please accept the terms')]
  };
  R.terms = [(v) => (v ? '' : 'You must accept the Terms to continue.')];
  V.live(form, R);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!V.validateForm(form, R)) return;
    const items = rows.map((r) => ({
      dealId: r.deal.id, title: r.deal.title, merchant: r.deal.merchant, price: r.deal.price, qty: r.qty,
      codes: Array.from({ length: r.qty }, () => Store.couponCode())
    }));
    const order = {
      id: Store.nextOrderNumber(), userId: user.id, items, total: Cart.total(),
      usageDate: form.usageDate.value, usageTime: form.usageTime.value, people: Number(form.people.value),
      phone: form.phone.value.trim(), comment: form.comment.value.trim(), payment: form.payment.value,
      status: 'Pending', createdAt: new Date().toISOString()
    };
    const orders = Store.orders(); orders.push(order); Store.saveOrders(orders);

    // update "bought" counters
    const deals = Store.deals();
    rows.forEach((r) => { const d = deals.find((x) => x.id === r.deal.id); if (d) d.bought += r.qty; });
    Store.saveDeals(deals);

    Cart.clear();
    location.href = 'confirmation.html?id=' + order.id;
  });
})();
