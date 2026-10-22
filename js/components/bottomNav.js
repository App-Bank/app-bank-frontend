const BottomNavComponent = {
  template: `
    <nav class="bottom-nav-bar" aria-label="Navegación principal de la app">
      <a href="#/dashboard" class="bottom-nav-item" data-page="dashboard" aria-label="Ir a Inicio">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z"/>
        </svg>
        <span>Inicio</span>
      </a>
      <a href="#/transfer" class="bottom-nav-item" data-page="transfer" aria-label="Ir a Transferir">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/>
        </svg>
        <span>Transferir</span>
      </a>

      <a href="#/history" class="bottom-nav-item" data-page="history" aria-label="Ir a Historial">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>
        <span>Historial</span>
      </a>
    </nav>
  `,

  render(target, activePage = '') {
    const el = target;
    if (!el) return;

    el.innerHTML = this.template;

    if (activePage) {
      const activeLink = el.querySelector(`.bottom-nav-item[data-page="${activePage}"]`);
      if (activeLink) {
        activeLink.classList.add('active');
        activeLink.setAttribute('aria-current', 'page');
      }
    }
  }
};