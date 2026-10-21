// SECTION: Login Controller
function initLogin(options = {}) {
  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const emailBox = document.getElementById('email-box');
  const emailError = document.getElementById('email-error');
  const btnClearEmail = document.getElementById('btn-clear-email');

  const passwordInput = document.getElementById('password');
  const passwordBox = document.getElementById('password-box');
  const passwordError = document.getElementById('password-error');
  const btnTogglePassword = document.getElementById('btn-toggle-password');
  const eyeShow = document.getElementById('eye-show');
  const eyeHide = document.getElementById('eye-hide');

  const btnSubmit = document.getElementById('btn-submit');

  // SECTION: Helper to Toggle Field Error State
  const setFieldError = (input, box, errorEl, message = '') => {
    const hasErr = Boolean(message);
    if (box) box.classList.toggle('has-error', hasErr);
    if (input) input.setAttribute('aria-invalid', String(hasErr));
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.toggle('is-visible', hasErr);
    }
    return hasErr;
  };

  // SECTION: Input Field Controls
  const updateClearButton = () => {
    if (btnClearEmail && emailInput) {
      btnClearEmail.classList.toggle('is-hidden', emailInput.value.length === 0);
    }
  };

  if (emailInput && btnClearEmail) {
    emailInput.addEventListener('input', () => {
      updateClearButton();
      setFieldError(emailInput, emailBox, emailError, '');
    });

    btnClearEmail.addEventListener('click', () => {
      emailInput.value = '';
      updateClearButton();
      emailInput.focus();
    });

    updateClearButton();
  }

  if (btnTogglePassword && passwordInput) {
    btnTogglePassword.addEventListener('click', () => {
      const isPass = passwordInput.type === 'password';
      passwordInput.type = isPass ? 'text' : 'password';
      if (eyeShow) eyeShow.classList.toggle('is-hidden', isPass);
      if (eyeHide) eyeHide.classList.toggle('is-hidden', !isPass);
      btnTogglePassword.setAttribute('aria-label', isPass ? 'Ocultar contraseña' : 'Mostrar contraseña');
      btnTogglePassword.setAttribute('aria-pressed', String(isPass));
      passwordInput.focus();
    });

    passwordInput.addEventListener('input', () => {
      setFieldError(passwordInput, passwordBox, passwordError, '');
    });
  }

  // SECTION: Form Validation & Authentication Handler
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = emailInput ? emailInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value : '';

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const emailMsg = !email ? 'Por favor, ingresa tu correo.' : (!emailRegex.test(email) ? 'El correo no tiene un formato válido.' : '');
      const passMsg = (!password || !password.trim()) ? 'Por favor, ingresa tu contraseña.' : '';

      const hasEmailErr = setFieldError(emailInput, emailBox, emailError, emailMsg);
      const hasPassErr = setFieldError(passwordInput, passwordBox, passwordError, passMsg);

      if (hasEmailErr || hasPassErr) {
        window.showToast('Verifica tus credenciales', 'error');
        return;
      }

      btnSubmit.classList.add('is-loading');
      if (emailInput) emailInput.disabled = true;
      if (passwordInput) passwordInput.disabled = true;

      window.showToast('Accediendo a la cuenta...', 'info');

      try {
        const handler = options.onSubmit;
        if (typeof handler === 'function') {
          await handler({ email, password });
        }
      } catch (err) {
        console.error('[LoginController] Authentication error:', err);
        window.showToast(err.message || 'Error de autenticación', 'error');
      } finally {
        btnSubmit.classList.remove('is-loading');
        if (emailInput) emailInput.disabled = false;
        if (passwordInput) passwordInput.disabled = false;
      }
    });
  }
}
