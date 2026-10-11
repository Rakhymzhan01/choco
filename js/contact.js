/* contact.js – contact form with validation */
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const user = Auth.current();
  if (user) { form.elements.name.value = user.firstName + ' ' + user.lastName; form.email.value = user.email; form.phone.value = user.phone || ''; }

  const R = {
    name: [V.required('Name'), V.minLength(2, 'Name')],
    email: [V.required('Email'), V.email()],
    phone: [V.phone()],
    subject: [V.required('Subject')],
    message: [V.required('Message'), V.minLength(10, 'Message'), V.maxLength(1000, 'Message')]
  };
  V.live(form, R);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!V.validateForm(form, R)) return;
    const msgs = Store.messages();
    msgs.push({ id: Store.nextId(msgs), name: form.elements.name.value.trim(), email: form.email.value.trim(), subject: form.subject.value, message: form.message.value.trim(), createdAt: new Date().toISOString() });
    Store.saveMessages(msgs);
    const ok = document.getElementById('contact-ok');
    ok.hidden = false;
    form.reset();
    ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();
