(function () {
  const API = '/api/subscribe.php';

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  async function submitForm(form) {
    const btn = qs('[type="submit"]', form);
    const container = form.closest('.form-box') || form.parentElement;
    const errEl = qs('.form-error', container);
    const successEl = qs('.form-success', container);
    const formWrap = qs('.form-wrap', container) || form;

    const payload = {
      tag: form.dataset.tag || 'general',
      name: (qs('[name="name"]', form)?.value || '').trim(),
      email: (qs('[name="email"]', form)?.value || '').trim(),
      source: form.dataset.source || window.location.pathname,
      fields: {},
    };

    form.querySelectorAll('[data-field]').forEach((el) => {
      payload.fields[el.name || el.dataset.field] = el.value.trim();
    });

    if (!payload.email || !payload.email.includes('@')) {
      if (errEl) {
        errEl.textContent = 'Please enter a valid email.';
        errEl.classList.add('visible');
      }
      return;
    }

    if (errEl) errEl.classList.remove('visible');
    if (btn) {
      btn.disabled = true;
      btn.dataset.originalText = btn.textContent;
      btn.textContent = 'Sending…';
    }

    try {
      const r = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      });
      const body = await r.json().catch(() => ({}));

      if (r.ok && body.ok) {
        formWrap.classList.add('hidden');
        if (successEl) {
          successEl.classList.add('visible');
          const dl = qs('[data-download]', successEl);
          if (dl && body.download) dl.href = body.download;
        }
        return;
      }
      throw new Error(body.error || 'Subscribe failed');
    } catch (e) {
      if (errEl) {
        errEl.textContent = e.message || 'Something went wrong. Try again.';
        errEl.classList.add('visible');
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = btn.dataset.originalText || 'Submit';
      }
    }
  }

  document.querySelectorAll('form[data-fi-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitForm(form);
    });
  });
})();
