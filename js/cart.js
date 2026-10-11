/* cart.js – shopping cart stored per user */
const Cart = (function () {
  const MAX_QTY = 10;
  const uid = () => { const u = Auth.current(); return u ? u.id : null; };

  function items() { const id = uid(); return id ? Store.getCart(id) : []; }
  function save(list) { const id = uid(); if (id) Store.saveCart(id, list); badge(); }

  function add(dealId, qty) {
    if (!uid()) return false;
    qty = qty || 1;
    const list = items();
    const it = list.find((i) => i.dealId === dealId);
    if (it) it.qty = Math.min(MAX_QTY, it.qty + qty); else list.push({ dealId, qty: Math.min(MAX_QTY, qty) });
    save(list);
    return true;
  }
  function setQty(dealId, qty) {
    const list = items();
    const it = list.find((i) => i.dealId === dealId);
    if (it) it.qty = Math.max(1, Math.min(MAX_QTY, qty));
    save(list);
  }
  function remove(dealId) { save(items().filter((i) => i.dealId !== dealId)); }
  function clear() { save([]); }
  function count() { return items().reduce((s, i) => s + i.qty, 0); }

  // cart rows joined with current deal data (deleted deals are dropped)
  function detailed() {
    const deals = Store.deals();
    return items().map((i) => ({ deal: deals.find((d) => d.id === i.dealId), qty: i.qty })).filter((r) => r.deal);
  }
  function total() { return detailed().reduce((s, r) => s + r.deal.price * r.qty, 0); }
  function badge() {
    const el = document.getElementById('cart-count');
    if (el) el.textContent = count();
  }

  return { MAX_QTY, add, setQty, remove, clear, count, detailed, total, badge };
})();
