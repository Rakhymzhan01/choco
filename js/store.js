/* Store: tiny "database" on top of localStorage */
const Store = (function () {
  const K = {
    users: 'choco_users', deals: 'choco_deals', orders: 'choco_orders',
    session: 'choco_session', cart: 'choco_cart_', seed: 'choco_seeded_v1',
    seq: 'choco_order_seq', messages: 'choco_messages'
  };

  function read(key, def) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch (e) { return def; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch (e) { return false; }
  }

  // Demo-grade salted hash (NOT for production – a real site hashes on the server)
  function hash(str) {
    const s = 'choco::' + str;
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 2654435761);
      h2 = Math.imul(h2 ^ c, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
  }

  function couponCode() {
    return 'DL-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  }

  function seed() {
    if (localStorage.getItem(K.seed)) return;
    const now = new Date().toISOString();
    write(K.deals, DEFAULT_DEALS);
    write(K.users, [
      { id: 1, firstName: 'Admin', lastName: 'Choco', email: 'admin@Choco.kz', passwordHash: hash('Admin123'), role: 'admin', phone: '+7 701 000 00 00', dob: '', photo: '', createdAt: now },
      { id: 2, firstName: 'Aruzhan', lastName: 'Sadykova', email: 'demo@Choco.kz', passwordHash: hash('Demo1234'), role: 'user', phone: '+7 777 123 45 67', dob: '2002-05-14', photo: '', createdAt: now }
    ]);
    write(K.orders, [
      {
        id: 10234, userId: 2, status: 'Confirmed', createdAt: '2026-09-10T10:15:00.000Z', usageDate: '2026-09-15', usageTime: '18:00', people: 2,
        phone: '+7 777 123 45 67', comment: '', payment: 'Online (demo)', total: 12000,
        items: [{ dealId: 3, title: DEFAULT_DEALS[2].title, merchant: DEFAULT_DEALS[2].merchant, price: 12000, qty: 1, codes: ['DL-7QK2-M9XA'] }]
      },
      {
        id: 10235, userId: 2, status: 'Pending', createdAt: '2026-10-02T14:40:00.000Z', usageDate: '2026-10-20', usageTime: '12:00', people: 2,
        phone: '+7 777 123 45 67', comment: 'Window table if possible', payment: 'Pay at venue (demo)', total: 11000,
        items: [{ dealId: 9, title: DEFAULT_DEALS[8].title, merchant: DEFAULT_DEALS[8].merchant, price: 5500, qty: 2, codes: ['DL-P3LN-8ZTC', 'DL-C5RW-1HDE'] }]
      }
    ]);
    write(K.seq, 10236);
    localStorage.setItem(K.seed, '1');
  }
  seed();

  return {
    hash, couponCode,
    users: () => read(K.users, []),
    saveUsers: (u) => write(K.users, u),
    deals: () => read(K.deals, []),
    saveDeals: (d) => write(K.deals, d),
    orders: () => read(K.orders, []),
    saveOrders: (o) => write(K.orders, o),
    messages: () => read(K.messages, []),
    saveMessages: (m) => write(K.messages, m),
    nextId: (list) => list.reduce((m, x) => Math.max(m, x.id), 0) + 1,
    nextOrderNumber: () => { const n = read(K.seq, 10236); write(K.seq, n + 1); return n; },
    sessionUserId: () => { const s = read(K.session, null); return s ? s.userId : null; },
    setSession: (userId) => write(K.session, { userId, at: Date.now() }),
    clearSession: () => { try { localStorage.removeItem(K.session); } catch (e) { /* ignore */ } },
    getCart: (uid) => read(K.cart + uid, []),
    saveCart: (uid, c) => write(K.cart + uid, c),
    resetAll: () => {
      Object.keys(localStorage).filter(k => k.indexOf('choco') === 0).forEach(k => localStorage.removeItem(k));
    }
  };
})();
