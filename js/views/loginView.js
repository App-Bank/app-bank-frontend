// SECTION: Login View
function renderLoginView(container) {
  container.innerHTML = `
    <div class="aurora" aria-hidden="true"></div>
    <section class="login-view" aria-labelledby="login-heading">
      <header class="login-header">
        <div class="login-avatar-circle" role="img" aria-label="Logo Aura Neo-Banking">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
            <rect x="3" y="3" width="18" height="18" rx="4"></rect>
            <circle cx="12" cy="12" r="4"></circle>
            <line x1="12" y1="8" x2="12" y2="9"></line>
            <line x1="12" y1="15" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="9" y2="12"></line>
            <line x1="15" y1="12" x2="16" y2="12"></line>
          </svg>
        </div>

        <h1 id="login-heading" class="login-title">Inicia sesión</h1>
        <p id="login-subheading" class="login-subtitle">Ingresa tus credenciales para acceder</p>
      </header>

      <form 
        id="login-form" 
        class="login-form" 
        action="#" 
        method="post" 
        aria-labelledby="login-heading" 
        aria-describedby="login-subheading" 
        novalidate
      >
        <fieldset class="login-fieldset">
          <legend class="sr-only">Credenciales de inicio de sesión</legend>

          <div class="field-group">
            <label for="email" class="field-label">CORREO</label>
            <div class="field-input-box" id="email-box">
              <span class="field-icon-left" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false">
                  <rect x="2" y="4" width="20" height="16" rx="3"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
              </span>
              <input 
                type="email" 
                id="email" 
                name="email" 
                class="field-input" 
                value="admin@admin.com" 
                placeholder="admin@admin.com"
                autocomplete="username"
                autocapitalize="none"
                autocorrect="off"
                spellcheck="false"
                enterkeyhint="next"
                aria-required="true"
                aria-describedby="email-error"
                required
              >
              <button 
                type="button" 
                id="btn-clear-email" 
                class="field-btn-action" 
                aria-label="Borrar texto del correo"
                aria-controls="email"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <p id="email-error" class="field-error-text" role="alert" aria-live="polite">Ingresa un correo electrónico válido</p>
          </div>

          <div class="field-group">
            <label for="password" class="field-label">CONTRASEÑA</label>
            <div class="field-input-box" id="password-box">
              <span class="field-icon-left" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <input 
                type="password" 
                id="password" 
                name="password" 
                class="field-input" 
                value="admin" 
                placeholder="admin"
                autocomplete="current-password"
                autocapitalize="none"
                autocorrect="off"
                spellcheck="false"
                enterkeyhint="done"
                aria-required="true"
                aria-describedby="password-error"
                required
              >
              <button 
                type="button" 
                id="btn-toggle-password" 
                class="field-btn-action" 
                aria-label="Mostrar contraseña" 
                aria-controls="password"
                aria-pressed="false"
              >
                <svg id="eye-show" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg id="eye-hide" class="is-hidden" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                  <line x1="2" y1="2" x2="22" y2="22"></line>
                </svg>
              </button>
            </div>
            <p id="password-error" class="field-error-text" role="alert" aria-live="polite">Ingresa tu contraseña</p>
          </div>
        </fieldset>

        <footer class="form-actions">
          <button type="submit" id="btn-submit" class="btn-login" aria-label="Iniciar sesión">
            <span class="btn-text">Iniciar Sesión</span>
            <span class="btn-arrow-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" focusable="false">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </span>
            <span class="btn-spinner" aria-hidden="true"></span>
          </button>
        </footer>
      </form>
    </section>
  `;

  initLogin({
    onSuccess: (data) => {
      AppState.user = data.email;
      AppState.isAuthenticated = true;
      if (window.appRouter) {
        window.appRouter.navigate('/dashboard');
      } else {
        window.location.hash = '#/dashboard';
      }
    }
  });
}
