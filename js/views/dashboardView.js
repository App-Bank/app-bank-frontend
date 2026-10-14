// SECTION: View - Dashboard (Temporary Placeholder)
function renderDashboardView(container) {
  const userName = AppState.user || 'admin@admin.com';
  const formattedBalance = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(AppState.balance);

  container.innerHTML = `
    <section class="dashboard-view" style="padding-bottom: 90px;">
      <header class="dashboard-header">
        <div>
          <span class="dashboard-subtitle">Cuenta Principal</span>
          <h2 class="dashboard-username">${userName}</h2>
        </div>
        <button id="btn-logout-spa" class="dashboard-logout-btn">
          Salir
        </button>
      </header>

      <div class="dashboard-card">
        <span class="dashboard-balance-label">BALANCE DISPONIBLE</span>
        <div class="dashboard-balance-amount">${formattedBalance}</div>
        <div class="dashboard-status-badge">
          ● Bóveda Activa y Segura
        </div>
      </div>

      <!-- Quick access to Historial screen -->
      <a href="#/history" style="display: flex; align-items: center; justify-content: space-between; background: #111622; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; color: #fff; text-decoration: none; margin-top: 16px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 38px; height: 38px; border-radius: 50%; background: rgba(56, 189, 248, 0.15); color: #38bdf8; display: flex; align-items: center; justify-content: center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
          </div>
          <div>
            <div style="font-size: 14.5px; font-weight: 600;">Ver Historial de Movimientos</div>
            <div style="font-size: 12px; color: var(--text-muted);">Gastos, ingresos y transferencias</div>
          </div>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted);"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </a>

      <!-- SECTION: Bottom Navigation Bar Component Mount -->
      <div id="bottom-nav-container"></div>
    </section>
  `;

  const btnLogout = document.getElementById('btn-logout-spa');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      AppState.isAuthenticated = false;
      window.appRouter.navigate('/login');
    });
  }

  // SECTION: Mount Reusable Bottom Navigation Component
  if (typeof BottomNavComponent !== 'undefined') {
    BottomNavComponent.render('#bottom-nav-container', 'dashboard');
  }
}
