// SECTION: View - Home Screen (Inicio)
function renderHomeView(container) {
  const userName = (typeof AppState !== 'undefined' && AppState.user) ? AppState.user.split('@')[0] : 'Mateo';
  const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);

  // Dynamic Date Formatting
  const now = new Date();
  const rawDate = now.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  const formattedDate = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);
  const currentMonth = now.toLocaleDateString('es-ES', { month: 'long' });
  const formattedMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

  // Currency helper
  const fmt = (n) => Math.abs(n).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Compute metrics dynamically from database if available
  let monthlyIncome = 4200.00;
  let monthlyExpense = 1860.50;
  if (typeof TempDB !== 'undefined' && typeof TempDB.getAll === 'function') {
    const allRecords = TempDB.getAll();
    const inc = allRecords.filter(r => Number(r.amount) > 0).reduce((acc, r) => acc + Number(r.amount), 0);
    const exp = allRecords.filter(r => Number(r.amount) < 0).reduce((acc, r) => acc + Math.abs(Number(r.amount)), 0);
    if (inc > 0) monthlyIncome = inc;
    if (exp > 0) monthlyExpense = exp;
  }

  container.innerHTML = `
    <!-- Aurora background glow matching Transfer & History -->
    <div class="aurora" aria-hidden="true"></div>

    <div class="app-container">
      <!-- Header -->
      <header class="app-header">
        <div class="brand">
          <div class="brand-logo"></div>
          <div class="brand-info">
            <span class="brand-name">AURA NEO-BANKING</span>
            <span class="brand-page">Inicio</span>
          </div>
        </div>
        <div class="user-welcome">
          <h1>Hola, ${displayName} <span class="hand-emoji">👋</span></h1>
          <p class="current-date" id="home-current-date">${formattedDate}</p>
        </div>
      </header>

      <!-- Main Content: Original vertical stack -->
      <main class="app-main">
        <!-- Section: Mi Cuenta -->
        <section class="account-section">
          <h2 class="section-title">Mi Cuenta</h2>
          
          <div class="card position-card">
            <div class="card-header">
              <span class="position-label">POSICIÓN GLOBAL</span>
              <div class="iban-container">
                <span class="iban-label">IBAN</span>
                <span class="iban-value" id="home-iban">ES91 •••• 4820</span>
              </div>
              <button type="button" class="btn-icon" id="btn-toggle-home-balance" aria-label="Ocultar saldo">👁️</button>
            </div>
            
            <div class="balance-display">
              <span class="balance-amount" id="home-balance-amount">34.850<span class="balance-decimals">,40</span></span>
              <span class="balance-currency">€</span>
            </div>
            <p class="balance-subtitle">Patrimonio total disponible</p>
            
            <div class="metrics-pills">
              <div class="pill pill-positive">📈 +3.4% este mes</div>
              <div class="pill pill-generated">+1.140,20 € generados</div>
            </div>
          </div>
        </section>

        <!-- Section: Métricas del Mes -->
        <section class="metrics-section">
          <div class="section-header-inline">
            <h2 class="section-title">📊 Métricas del Mes</h2>
            <span class="month-label">${formattedMonth}</span>
          </div>
          
          <div class="metrics-grid">
            <div class="metric-box box-income">
              <span class="box-label">↑ Ingresos</span>
              <span class="box-value">${fmt(monthlyIncome)} €</span>
            </div>
            <div class="metric-box box-expense">
              <span class="box-label">↓ Gastos</span>
              <span class="box-value">${fmt(monthlyExpense)} €</span>
            </div>
          </div>
        </section>

        <!-- Section: Últimos Movimientos -->
        <section class="movements-section">
          <div class="section-header-inline">
            <h2 class="section-title">Últimos Movimientos</h2>
            <a href="#/history" class="see-all">Ver todo ➔</a>
          </div>
          
          <div class="movements-list">
            <!-- Item 1 -->
            <div class="movement-item" style="cursor: pointer;" onclick="window.location.hash='#/history'">
              <div class="movement-icon icon-salary">💵</div>
              <div class="movement-details">
                <h3>Nómina TechCorp</h3>
                <p>Ayer • Abono directo</p>
              </div>
              <div class="movement-amount positive">
                <span>+3.200,00 €</span>
                <span class="status">Completado</span>
              </div>
            </div>
            
            <!-- Item 2 -->
            <div class="movement-item" style="cursor: pointer;" onclick="window.location.hash='#/history'">
              <div class="movement-icon icon-shopping">🛒</div>
              <div class="movement-details">
                <h3>Supermercado Mercadona</h3>
                <p>22 Oct • Tarjeta física</p>
              </div>
              <div class="movement-amount negative">
                <span>-64,20 €</span>
                <span class="status">Completado</span>
              </div>
            </div>
            
            <!-- Item 3 -->
            <div class="movement-item" style="cursor: pointer;" onclick="window.location.hash='#/history'">
              <div class="movement-icon icon-transfer">⇆</div>
              <div class="movement-details">
                <h3>Transferencia a Sofía</h3>
                <p>21 Oct • Bizum instantáneo</p>
              </div>
              <div class="movement-amount negative">
                <span>-150,00 €</span>
                <span class="status">Completado</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- Bottom Navigation Bar Component Mount -->
      <div id="bottom-nav-container"></div>
    </div>
  `;

  // Eye button: Toggle balance visibility
  const toggleBalanceBtn = container.querySelector('#btn-toggle-home-balance');
  const balanceAmountEl = container.querySelector('#home-balance-amount');

  if (toggleBalanceBtn && balanceAmountEl) {
    let balanceHidden = false;
    const originalBalanceHTML = balanceAmountEl.innerHTML;

    toggleBalanceBtn.addEventListener('click', () => {
      balanceHidden = !balanceHidden;
      if (balanceHidden) {
        balanceAmountEl.textContent = '••••••';
        toggleBalanceBtn.textContent = '🔒';
        toggleBalanceBtn.setAttribute('aria-label', 'Mostrar saldo');
      } else {
        balanceAmountEl.innerHTML = originalBalanceHTML;
        toggleBalanceBtn.textContent = '👁️';
        toggleBalanceBtn.setAttribute('aria-label', 'Ocultar saldo');
      }
    });
  }

  // Mount Unified Bottom Navigation Component
  if (typeof BottomNavComponent !== 'undefined') {
    BottomNavComponent.render('#bottom-nav-container', 'dashboard');
  }
}
