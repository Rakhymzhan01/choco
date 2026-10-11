/* confirmation.js – order success page (Step 9) */
(function () {
  const user = Auth.current();
  if (!user) return;
  const id = Number(new URLSearchParams(location.search).get('id'));
  const order = Store.orders().find((o) => o.id === id && (o.userId === user.id || user.role === 'admin'));
  const box = document.getElementById('confirm-box');

  if (!order) {
    box.innerHTML = `<div class="empty"><h2>Order not found</h2><a class="btn btn-primary" href="../profile.html#orders">View my orders</a></div>`;
    return;
  }
  box.innerHTML = `
    <div class="success-card">
      <div class="success-icon" aria-hidden="true">✓</div>
      <h1>Success!</h1>
      <p class="lead">Your booking is confirmed! We saved it to your account.</p>
      <dl class="details-list">
        <div><dt>Booking ID</dt><dd>#${order.id}</dd></div>
        <div><dt>Date</dt><dd>${UI.esc(UI.fmtDate(order.usageDate))}</dd></div>
        <div><dt>Time</dt><dd>${UI.esc(order.usageTime)}</dd></div>
        <div><dt>People</dt><dd>${order.people}</dd></div>
        <div><dt>Total</dt><dd>${UI.fmt(order.total)}</dd></div>
        <div><dt>Status</dt><dd><span class="status status-${order.status.toLowerCase()}">${order.status}</span></dd></div>
      </dl>
      <h2 class="small-h">Your coupons</h2>
      <ul class="coupon-list">${order.items.map((i) => `<li><strong>${UI.esc(i.title)}</strong> × ${i.qty}<br>${i.codes.map((c) => `<code>${UI.esc(c)}</code>`).join(' ')}</li>`).join('')}</ul>
      <div class="success-actions">
        <a class="btn btn-primary" href="../profile.html#orders">View my bookings</a>
        <a class="btn btn-outline" href="deals.html">Keep shopping</a>
      </div>
    </div>`;
})();
