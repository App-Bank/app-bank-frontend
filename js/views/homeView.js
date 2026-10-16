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
  const fmt = (n) => (typeof window.formatCurrency === 'function')
    ? window.formatCurrency(n).replace(' €', '')
    : Math.abs(n).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // SECTION: Connect with History / Database (TempDB)
  // Retrieve transactions directly from the database shared with Historial
  const allRecords = (typeof TempDB !== 'undefined' && typeof TempDB.getAll === 'function') 
    ? TempDB.getAll() 
    : [];

  // Take the 3 most recent movements that appear in Historial
  const recentMovements = allRecords.slice(0, 3);

  // Calculate monthly metrics dynamically from real database records
  let monthlyIncome = 4200.00;
  let monthlyExpense = 1860.50;
  if (allRecords.length > 0) {
    const inc = allRecords.filter(r => Number(r.amount) > 0).reduce((acc, r) => acc + Number(r.amount), 0);
    const exp = allRecords.filter(r => Number(r.amount) < 0).reduce((acc, r) => acc + Math.abs(Number(r.amount)), 0);
    if (inc > 0) monthlyIncome = inc;
    if (exp > 0) monthlyExpense = exp;
  }

  // Icon classifier based on transaction category/title
  function getMovementIconInfo(item) {
    const cat = (item.category || '').toLowerCase();
    const title = (item.title || '').toLowerCase();
    const isIncome = Number(item.amount) > 0 || item.type === 'income';

    if (cat.includes('nómina') || title.includes('nómina') || cat.includes('salario')) {
      return { icon: '💵', cls: 'icon-salary' };
    } else if (cat.includes('super') || cat.includes('aliment') || title.includes('supermercado') || title.includes('mercadona') || title.includes('compra')) {
      return { icon: '🛒', cls: 'icon-shopping' };
    } else if (cat.includes('bizum') || cat.includes('transf') || title.includes('transferencia') || title.includes('bizum')) {
      return { icon: '⇆', cls: 'icon-transfer' };
    } else if (cat.includes('suministro') || cat.includes('electric') || title.includes('factura') || title.includes('luz')) {
      return { icon: '⚡', cls: 'icon-shopping' };
    } else if (cat.includes('transporte') || cat.includes('gasolina') || title.includes('gasolinera')) {
      return { icon: '⛽', cls: 'icon-shopping' };
    } else if (isIncome) {
      return { icon: '💰', cls: 'icon-salary' };
    } else {
      return { icon: '💳', cls: 'icon-shopping' };
    }
  }

  // Generate dynamic movements HTML
  let movementsHtml = '';
  if (recentMovements.length > 0) {
    movementsHtml = recentMovements.map(item => {
      const num = Number(item.amount);
      const isPositive = num > 0;
      const formattedAmount = `${isPositive ? '+' : '-'}${fmt(num)} €`;
      const amountClass = isPositive ? 'positive' : 'negative';
      const iconInfo = getMovementIconInfo(item);

      return `
        <div class="movement-item" style="cursor: pointer;" onclick="window.location.hash='#/history'" aria-label="${item.title}: ${formattedAmount}">
          <div class="movement-icon ${iconInfo.cls}">${iconInfo.icon}</div>
          <div class="movement-details">
            <h3>${item.title}</h3>
            <p>${item.subtitle || 'Operación bancaria'}</p>
          </div>
          <div class="movement-amount ${amountClass}">
            <span>${formattedAmount}</span>
            <span class="status">Completado</span>
          </div>
        </div>
      `;
    }).join('');
  } else {
    movementsHtml = `
      <div style="text-align: center; padding: 24px 16px; color: var(--text-muted); font-size: 13.5px;">
        No hay movimientos registrados
      </div>
    `;
  }

  container.innerHTML = `
    <!-- Aurora background glow matching Transfer & History -->
    <div class="aurora" aria-hidden="true"></div>

    <div class="app-container">
      <!-- Header -->
      <header class="app-header">
        <div class="app-top">
          <a href="#/dashboard" class="app-brand">
            <span class="logo-mark" aria-hidden="true"></span>
            <span>AURA NEO-BANKING</span>
          </a>
          <button type="button" id="btn-home-logout" class="btn-logout" aria-label="Cerrar sesión" title="Cerrar sesión">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Salir</span>
          </button>
        </div>
        <div class="user-welcome">
          <h1>Hola, ${displayName} <span class="hand-emoji">👋</span></h1>
          <p class="current-date" id="home-current-date">${formattedDate}</p>
        </div>
      </header>

      <!-- Main Content: Original single-column vertical flow -->
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

        <!-- Section: Últimos Movimientos (Connected with Historial) -->
        <section class="movements-section">
          <div class="section-header-inline">
            <h2 class="section-title">Últimos Movimientos</h2>
            <a href="#/history" class="see-all">Ver todo ➔</a>
          </div>
          
          <div class="movements-list">
            ${movementsHtml}
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

  // Logout button: Clear auth state and redirect to login
  const logoutBtn = container.querySelector('#btn-home-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (typeof AppState !== 'undefined') {
        AppState.user = null;
        AppState.isAuthenticated = false;
      }
      if (typeof window.showToast === 'function') {
        window.showToast('Sesión cerrada correctamente', 'info');
      }
      if (window.appRouter) {
        window.appRouter.navigate('/login');
      } else {
        window.location.hash = '#/login';
      }
    });
  }

  // Mount Unified Bottom Navigation Component
  if (typeof BottomNavComponent !== 'undefined') {
    BottomNavComponent.render('#bottom-nav-container', 'dashboard');
  }
}
