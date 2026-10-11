/* validation.js – reusable form validation (V) */
const V = (function () {
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /* ---------- rule factories: each returns fn(value, form) => error message ('' = OK) ---------- */
  const rules = {
    required: (label) => (v) => (v === '' || v === false || v == null ? `${label} is required.` : ''),
    email: () => (v) => (v && !EMAIL_RE.test(v) ? 'Please enter a valid email (e.g. name@example.com).' : ''),
    minLength: (n, label) => (v) => (v && v.length < n ? `${label} must be at least ${n} characters.` : ''),
    maxLength: (n, label) => (v) => (v && v.length > n ? `${label} must be at most ${n} characters.` : ''),
    name: (label) => (v) => (v && !/^[A-Za-zА-Яа-яЁёӘәІіҢңҒғҮүҰұҚқӨөҺһ'\- ]+$/.test(v) ? `${label} may contain only letters.` : ''),
    password: () => (v) => {
      if (!v) return '';
      if (v.length < 8) return 'Password must be at least 8 characters.';
      if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) return 'Password must contain at least one letter and one digit.';
      return '';
    },
    match: (otherName, msg) => (v, form) => (v !== form.elements[otherName].value ? (msg || 'Values do not match.') : ''),
    phone: () => (v) => {
      if (!v) return '';
      if (!/^\+?[0-9\s\-()]+$/.test(v)) return 'Phone may contain only digits, spaces, +, - and ().';
      const d = v.replace(/\D/g, '');
      return d.length < 10 || d.length > 12 ? 'Please enter a valid phone number (10–12 digits).' : '';
    },
    intRange: (min, max, label) => (v) => {
      if (v === '' || v == null) return '';
      const n = Number(v);
      if (!Number.isInteger(n) || n < min || n > max) return `${label} must be a whole number from ${min} to ${max}.`;
      return '';
    },
    positiveNumber: (label) => (v) => {
      if (v === '' || v == null) return '';
      const n = Number(v);
      return isNaN(n) || n <= 0 ? `${label} must be a number greater than 0.` : '';
    },
    futureDate: (label) => (v) => {
      if (!v) return '';
      const d = new Date(v + 'T00:00:00');
      if (isNaN(d)) return `${label} is not a valid date.`;
      const today = new Date(); today.setHours(0, 0, 0, 0);
      return d < today ? `${label} cannot be in the past.` : '';
    },
    birthDate: () => (v) => {
      if (!v) return '';
      const d = new Date(v + 'T00:00:00');
      if (isNaN(d)) return 'Date of birth is not a valid date.';
      const now = new Date();
      if (d > now) return 'Date of birth cannot be in the future.';
      const age = (now - d) / (365.25 * 24 * 3600 * 1000);
      return age < 14 ? 'You must be at least 14 years old.' : age > 110 ? 'Please enter a valid date of birth.' : '';
    },
    custom: (fn) => fn,
    imageFile: (maxMb) => (v, form, el) => {
      const f = el && el.files && el.files[0];
      if (!f) return '';
      if (!/^image\/(png|jpe?g|webp|gif)$/.test(f.type)) return 'Photo must be a PNG, JPG, WEBP or GIF image.';
      return f.size > maxMb * 1024 * 1024 ? `Photo must be smaller than ${maxMb} MB.` : '';
    }
  };

  /* ---------- DOM helpers ---------- */
  function errorBox(el) {
    const wrap = el.closest('.field') || el.parentElement;
    return wrap ? wrap.querySelector('.error') : null;
  }
  function setError(el, msg) {
    el.classList.add('invalid');
    el.setAttribute('aria-invalid', 'true');
    const box = errorBox(el);
    if (box) { box.textContent = '⚠ ' + msg; box.classList.add('show'); }
  }
  function clearError(el) {
    el.classList.remove('invalid');
    el.removeAttribute('aria-invalid');
    const box = errorBox(el);
    if (box) { box.textContent = ''; box.classList.remove('show'); }
  }
  function valueOf(el) {
    if (el.type === 'checkbox') return el.checked;
    if (el.type === 'password' || el.type === 'file') return el.value;
    return el.value.trim();
  }
  function checkField(form, name, fns) {
    const el = form.elements[name];
    if (!el) return true;
    const val = valueOf(el);
    for (const fn of fns) {
      const msg = fn(val, form, el);
      if (msg) { setError(el, msg); return false; }
    }
    clearError(el);
    return true;
  }
  function formAlert(form, msg) {
    let box = form.querySelector('.form-alert');
    if (!box) {
      box = document.createElement('div');
      box.className = 'form-alert alert alert-error';
      box.setAttribute('role', 'alert');
      form.insertBefore(box, form.firstChild);
    }
    if (msg) { box.textContent = '⚠ ' + msg; box.hidden = false; } else { box.hidden = true; }
  }

  /* Validate a whole form. fieldRules = { fieldName: [ruleFn, ...] } */
  function validateForm(form, fieldRules) {
    const names = Object.keys(fieldRules);
    let ok = true, firstBad = null;
    names.forEach((n) => {
      const good = checkField(form, n, fieldRules[n]);
      if (!good) { ok = false; if (!firstBad) firstBad = form.elements[n]; }
    });
    const textNames = names.filter((n) => form.elements[n] && form.elements[n].type !== 'checkbox' && form.elements[n].type !== 'file');
    const allEmpty = textNames.length > 1 && textNames.every((n) => valueOf(form.elements[n]) === '' || form.elements[n].tagName === 'SELECT' && !form.elements[n].value);
    formAlert(form, allEmpty ? 'The form is empty. Please fill in the required fields.' : '');
    if (firstBad) firstBad.focus();
    return ok;
  }

  /* Live validation: on blur, then on input once the field has been touched */
  function live(form, fieldRules) {
    Object.keys(fieldRules).forEach((n) => {
      const el = form.elements[n];
      if (!el) return;
      const run = () => checkField(form, n, fieldRules[n]);
      el.addEventListener('blur', () => { el.dataset.touched = '1'; run(); });
      el.addEventListener('input', () => { if (el.dataset.touched) run(); });
      el.addEventListener('change', () => { if (el.dataset.touched || el.type === 'file') run(); });
    });
  }

  return Object.assign({ EMAIL_RE, setError, clearError, validateForm, live, formAlert, checkField }, rules);
})();
