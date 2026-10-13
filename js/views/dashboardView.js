// SECTION: View - Dashboard (Temporary Placeholder)
function renderDashboardView(container) {
  const userName = AppState.user || 'admin@admin.com';
  const formattedBalance = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(AppState.balance);

  container.innerHTML = `
    <section class="dashboard-view">
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
        <span class="dashboard-balance-label">BALANCE TOTAL</span>
        <div class="dashboard-balance-amount">${formattedBalance}</div>
        <div class="dashboard-status-badge">
          ● Bóveda Activa y Segura
        </div>
      </div>

      <!-- TODO / FUTURE: Add Quick Action Buttons (Transfer, Deposit, Cards, History) -->
    </section>
  `;

  const btnLogout = document.getElementById('btn-logout-spa');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      AppState.isAuthenticated = false;
      window.appRouter.navigate('/login');
    });
  }
}
