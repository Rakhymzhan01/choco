/* auth-pages.js – login, register, forgot-password pages */
(function () {
  const which = document.body.dataset.page;
  const form = document.getElementById('auth-form');
  if (!form) return;

  // Already signed in? go home
  if (Auth.current() && which !== 'forgot') { location.replace('index.html'); return; }

  const params = new URLSearchParams(location.search);
  const info = document.getElementById('info-alert');
  function showInfo(msg, type) { info.className = 'alert alert-' + type; info.textContent = msg; info.hidden = false; }

  /* ---------------- LOGIN ---------------- */
  if (which === 'login') {
    if (params.get('registered')) showInfo('✓ Account created! Please log in.', 'success');
    if (params.get('loggedout')) showInfo('You have been logged out.', 'info');
    const R = {
      email: [V.required('Email'), V.email()],
      password: [V.required('Password')]
    };
    V.live(form, R);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!V.validateForm(form, R)) return;
      const res = Auth.login(form.email.value, form.password.value);
      if (!res.ok) { V.setError(form.elements[res.field], res.error); form.elements[res.field].focus(); return; }
      const next = Auth.safeNext(params.get('next'));
      location.href = next || 'index.html';
    });
    document.querySelectorAll('[data-fill]').forEach((b) => b.addEventListener('click', () => {
      form.email.value = b.dataset.fill; form.password.value = b.dataset.pw;
    }));
  }

  /* ---------------- REGISTER ---------------- */
  if (which === 'register') {
    const R = {
      firstName: [V.required('First name'), V.name('First name'), V.minLength(2, 'First name')],
      lastName: [V.required('Last name'), V.name('Last name'), V.minLength(2, 'Last name')],
      email: [V.required('Email'), V.email()],
      password: [V.required('Password'), V.password()],
      confirmPassword: [V.required('Confirm password'), V.match('password', 'Passwords do not match.')],
      phone: [V.phone()],
      dob: [V.birthDate()],
      photo: [V.imageFile(2)]
    };
    V.live(form, R);
    form.password.addEventListener('input', () => { if (form.confirmPassword.dataset.touched) V.checkField(form, 'confirmPassword', R.confirmPassword); });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!V.validateForm(form, R)) return;
      let photo = '';
      const f = form.photo.files[0];
      if (f) { try { photo = await UI.readImage(f, 200); } catch (err) { V.setError(form.photo, 'Could not read this image.'); return; } }
      const res = Auth.register({
        firstName: form.firstName.value, lastName: form.lastName.value, email: form.email.value,
        password: form.password.value, phone: form.phone.value, dob: form.dob.value, photo
      });
      if (!res.ok) { V.setError(form.elements[res.field], res.error); form.elements[res.field].focus(); return; }
      location.href = 'login.html?registered=1';
    });
  }

  /* ---------------- FORGOT PASSWORD ---------------- */
  if (which === 'forgot') {
    const R = { email: [V.required('Email'), V.email()] };
    V.live(form, R);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!V.validateForm(form, R)) return;
      showInfo('If an account exists for ' + form.email.value.trim() + ', a reset link has been sent (demo – no real email is sent).', 'success');
      form.reset();
    });
  }
})();
