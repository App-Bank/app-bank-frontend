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
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');

  let toastTimer = null;

  // SECTION: Toast Notification Utility
  function showToast(message, type = 'info') {
    if (!toast || !toastText) return;
    if (toastTimer) clearTimeout(toastTimer);

    toast.className = `mobile-toast ${type} show`;
    toastText.textContent = message;

    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  // SECTION: Input Field Controls
  function updateClearButton() {
    if (!btnClearEmail || !emailInput) return;
    if (emailInput.value.length > 0) {
      btnClearEmail.classList.remove('is-hidden');
    } else {
      btnClearEmail.classList.add('is-hidden');
    }
  }

  if (emailInput && btnClearEmail) {
    emailInput.addEventListener('input', () => {
      updateClearButton();
      if (emailBox) emailBox.classList.remove('has-error');
      if (emailError) emailError.classList.remove('is-visible');
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
      const isPassword = passwordInput.type === 'password';

      if (isPassword) {
        passwordInput.type = 'text';
        if (eyeShow) eyeShow.classList.add('is-hidden');
        if (eyeHide) eyeHide.classList.remove('is-hidden');
        btnTogglePassword.setAttribute('aria-label', 'Ocultar contraseña');
        btnTogglePassword.setAttribute('aria-pressed', 'true');
      } else {
        passwordInput.type = 'password';
        if (eyeShow) eyeShow.classList.remove('is-hidden');
        if (eyeHide) eyeHide.classList.add('is-hidden');
        btnTogglePassword.setAttribute('aria-label', 'Mostrar contraseña');
        btnTogglePassword.setAttribute('aria-pressed', 'false');
      }
      passwordInput.focus();
    });

    passwordInput.addEventListener('input', () => {
      if (passwordBox) passwordBox.classList.remove('has-error');
      if (passwordError) passwordError.classList.remove('is-visible');
    });
  }

  // SECTION: Form Validation & Authentication Handler
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = emailInput ? emailInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value : '';

      let hasErrors = false;

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        if (emailBox) emailBox.classList.add('has-error');
        if (emailInput) emailInput.setAttribute('aria-invalid', 'true');
        if (emailError) {
          emailError.textContent = !email ? 'Por favor, ingresa tu correo.' : 'El correo no tiene un formato válido.';
          emailError.classList.add('is-visible');
        }
        hasErrors = true;
      } else {
        if (emailInput) emailInput.setAttribute('aria-invalid', 'false');
      }

      if (!password || password.length < 3) {
        if (passwordBox) passwordBox.classList.add('has-error');
        if (passwordInput) passwordInput.setAttribute('aria-invalid', 'true');
        if (passwordError) {
          passwordError.textContent = !password ? 'Por favor, ingresa tu contraseña.' : 'Mínimo 3 caracteres.';
          passwordError.classList.add('is-visible');
        }
        hasErrors = true;
      } else {
        if (passwordInput) passwordInput.setAttribute('aria-invalid', 'false');
      }

      if (hasErrors) {
        showToast('Verifica tus credenciales', 'error');
        return;
      }

      btnSubmit.classList.add('is-loading');
      if (emailInput) emailInput.disabled = true;
      if (passwordInput) passwordInput.disabled = true;

      showToast('Accediendo a la cuenta...', 'info');

      // TODO / FUTURE: Replace simulation timeout with real backend API request (e.g., fetch('/api/v1/auth/login'))
      setTimeout(() => {
        btnSubmit.classList.remove('is-loading');
        if (emailInput) emailInput.disabled = false;
        if (passwordInput) passwordInput.disabled = false;

        showToast('¡Inicio de sesión exitoso!', 'success');

        // TODO / FUTURE: Store session authentication token (JWT / HttpOnly cookie)
        if (typeof options.onSuccess === 'function') {
          options.onSuccess({ email });
        }
      }, 1200);
    });
  }
}

// SECTION: Standalone Initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initLogin());
} else {
  initLogin();
}
