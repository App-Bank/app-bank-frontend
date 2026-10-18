// SECTION: Home View
function renderHomeView(container) {
  const userName = (typeof AppState !== 'undefined' && AppState.user) ? AppState.user.split('@')[0] : 'Mateo';
  const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);

  const now = new Date();
  const rawDate = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const formattedDate = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);
  const currentMonth = now.toLocaleDateString('es-ES', { month: 'long' });
  const formattedMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

  const fmt = (n) => window.formatCurrency(n, { noSymbol: true });

  const currentBal = (typeof AppState !== 'undefined' && AppState.balance != null) ? Number(AppState.balance) : 0;
  const initialBalFormatted = currentBal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const initialBalParts = initialBalFormatted.split(',');

  function getMovementIconInfo(item) {
    const text = `${item.category || ''} ${item.title || ''}`.toLowerCase();
    const isIncome = Number(item.amount) > 0 || item.type === 'income';
    if (/nómina|salario/.test(text)) return { icon: '💵', cls: 'icon-salary' };
    if (/super|aliment|mercadona|compra/.test(text)) return { icon: '🛒', cls: 'icon-shopping' };
    if (/bizum|transf/.test(text)) return { icon: '⇆', cls: 'icon-transfer' };
    if (/suministro|electric|factura|luz/.test(text)) return { icon: '⚡', cls: 'icon-shopping' };
    if (/transporte|gasolina/.test(text)) return { icon: '⛽', cls: 'icon-shopping' };
    return isIncome ? { icon: '💰', cls: 'icon-salary' } : { icon: '💳', cls: 'icon-shopping' };
  }

  container.innerHTML = `
    <div class="aurora" aria-hidden="true"></div>
    <div class="app-container">
      <header class="app-header">
        <div class="app-top">
          <a href="#/dashboard" class="app-brand"><span class="logo-mark" aria-hidden="true"></span><span>AURA NEO-BANKING</span></a>
          <button type="button" id="btn-home-logout" class="btn-logout" aria-label="Cerrar sesión" title="Cerrar sesión">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span>Salir</span>
          </button>
        </div>
        <div class="user-welcome">
          <h1 id="home-welcome-title">Hola, <span id="home-welcome-name">${displayName}</span> <span class="hand-emoji">👋</span></h1>
          <time class="current-date" id="home-current-date" datetime="${now.toISOString().slice(0, 10)}">${formattedDate}</time>
        </div>
      </header>

      <main class="app-main">
        <section class="account-section">
          <h2 class="section-title">Mi Cuenta</h2>
          <div class="card position-card">
            <div class="card-header">
              <span class="position-label">POSICIÓN GLOBAL</span>
              <div class="iban-container">
                <span class="iban-label">IBAN</span>
                <span class="iban-value" id="home-iban">ES91 •••• 1332</span>
              </div>
              <button type="button" class="btn-icon" id="btn-toggle-home-iban" aria-label="Mostrar IBAN completo" title="Mostrar IBAN completo">👁️</button>
            </div>
            
            <div class="balance-display">
              <span class="balance-amount" id="home-balance-amount">${initialBalParts[0]}<span class="balance-decimals">,${initialBalParts[1]}</span></span>
              <span class="balance-currency">€</span>
            </div>
            <p class="balance-subtitle">Patrimonio total disponible</p>
            
            <div class="metrics-pills">
              <div class="pill pill-positive" id="home-pill-badge">📈 Activo</div>
              <div class="pill pill-generated" id="home-pill-count">Operativa conectada</div>
            </div>
          </div>
        </section>

        <section class="metrics-section">
          <div class="section-header-inline">
            <h2 class="section-title">📊 Métricas del Mes</h2>
            <span class="month-label">${formattedMonth}</span>
          </div>
          <div class="metrics-grid">
            <div class="metric-box box-income"><span class="box-label">↑ Ingresos</span><span class="box-value" id="home-metric-income">0,00 €</span></div>
            <div class="metric-box box-expense"><span class="box-label">↓ Gastos</span><span class="box-value" id="home-metric-expense">0,00 €</span></div>
          </div>
        </section>

        <section class="movements-section">
          <div class="section-header-inline">
            <h2 class="section-title">Últimos Movimientos</h2>
            <a href="#/history" class="see-all">Ver todo ➔</a>
          </div>
          <div class="movements-list" id="home-movements-list">
            <div style="text-align: center; padding: 24px 16px; color: var(--text-muted); font-size: 13.5px;">No hay movimientos registrados</div>
          </div>
        </section>
      </main>

      <div id="bottom-nav-container"></div>
    </div>
  `;

  const balanceAmountEl = container.querySelector('#home-balance-amount');
  const toggleIbanBtn = container.querySelector('#btn-toggle-home-iban');
  const ibanEl = container.querySelector('#home-iban');

  let isIbanHidden = true;
  let currentRawIban = 'ES9121000418450200051332';

  const formatFullIban = (iban) => (typeof window.formatIban === 'function') ? window.formatIban(iban) : iban;

  function formatMaskedIban(iban) {
    if (!iban) return 'ES-- •••• ----';
    const clean = iban.replace(/\s+/g, '');
    const prefix = clean.slice(0, 4) || 'ES91';
    const suffix = clean.slice(-4) || '1332';
    return `${prefix} •••• ${suffix}`;
  }

  function updateIbanDisplay() {
    if (!ibanEl) return;
    if (isIbanHidden) {
      ibanEl.textContent = formatMaskedIban(currentRawIban);
      if (toggleIbanBtn) {
        toggleIbanBtn.textContent = '👁️';
        toggleIbanBtn.setAttribute('aria-label', 'Mostrar IBAN completo');
        toggleIbanBtn.setAttribute('title', 'Mostrar IBAN completo');
      }
    } else {
      ibanEl.textContent = formatFullIban(currentRawIban);
      if (toggleIbanBtn) {
        toggleIbanBtn.textContent = '🔒';
        toggleIbanBtn.setAttribute('aria-label', 'Ocultar IBAN');
        toggleIbanBtn.setAttribute('title', 'Ocultar IBAN');
      }
    }
  }

  if (toggleIbanBtn) {
    toggleIbanBtn.addEventListener('click', () => {
      isIbanHidden = !isIbanHidden;
      updateIbanDisplay();
    });
  }

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

  // SECTION: Backend Data Synchronization
  async function syncHomeWithBackend() {
    if (typeof ApiService === 'undefined') return;

    const [accountRes, userRes, txRes] = await Promise.allSettled([
      ApiService.getAccount(1),
      ApiService.getUser(1),
      typeof TransactionService !== 'undefined' ? TransactionService.getTransactions() : Promise.resolve([])
    ]);

    if (accountRes.status === 'fulfilled' && accountRes.value) {
      const account = accountRes.value;
      const balNum = Number(account.balance) || 0;
      const balFormatted = balNum.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const balParts = balFormatted.split(',');
      if (balanceAmountEl) {
        balanceAmountEl.innerHTML = `${balParts[0]}<span class="balance-decimals">,${balParts[1]}</span>`;
      }
      if (account.iban) {
        currentRawIban = account.iban;
        updateIbanDisplay();
      }
      if (typeof AppState !== 'undefined') AppState.balance = balNum;
    } else {
      console.warn('[HomeView] Could not fetch account from backend:', accountRes.reason);
      if (balanceAmountEl) {
        balanceAmountEl.innerHTML = '<span style="color: #f87171; font-weight: 700; font-size: 26px;">ERROR</span>';
      }
      const pillBadge = container.querySelector('#home-pill-badge');
      if (pillBadge) {
        pillBadge.textContent = '⚠️ Sin conexión API';
        pillBadge.style.color = '#f87171';
        pillBadge.style.background = 'rgba(239, 68, 68, 0.12)';
      }
      currentRawIban = '';
      updateIbanDisplay();
    }

    if (userRes.status === 'fulfilled' && userRes.value && userRes.value.name) {
      const nameEl = container.querySelector('#home-welcome-name');
      if (nameEl) nameEl.textContent = userRes.value.name;
    }

    if (txRes.status === 'fulfilled' && Array.isArray(txRes.value)) {
      const allItems = txRes.value.flatMap(g => g.items || []);
      if (allItems.length > 0) {
        const recent = allItems.slice(0, 3);
        const movementsContainer = container.querySelector('#home-movements-list');
        if (movementsContainer) {
          movementsContainer.innerHTML = recent.map(item => {
            const num = Number(item.amount);
            const isPositive = num > 0;
            const formattedAmt = `${isPositive ? '+' : '-'}${fmt(num)} €`;
            const iconInfo = getMovementIconInfo(item);

            return `
              <a href="#/history" class="movement-item" aria-label="${item.title}: ${formattedAmt}">
                <div class="movement-icon ${iconInfo.cls}" aria-hidden="true">${iconInfo.icon}</div>
                <div class="movement-details">
                  <h3>${item.title}</h3>
                  <p>${item.subtitle || 'Operación bancaria'}</p>
                </div>
                <div class="movement-amount ${isPositive ? 'positive' : 'negative'}">
                  <span>${formattedAmt}</span>
                  <span class="status">Completado</span>
                </div>
              </a>
            `;
          }).join('');
        }

        const inc = allItems.filter(r => Number(r.amount) > 0).reduce((acc, r) => acc + Number(r.amount), 0);
        const exp = allItems.filter(r => Number(r.amount) < 0).reduce((acc, r) => acc + Math.abs(Number(r.amount)), 0);
        const incEl = container.querySelector('#home-metric-income');
        const expEl = container.querySelector('#home-metric-expense');
        if (incEl) incEl.textContent = `${fmt(inc)} €`;
        if (expEl) expEl.textContent = `${fmt(exp)} €`;
      }
    }
  }

  syncHomeWithBackend();

  if (typeof BottomNavComponent !== 'undefined') {
    BottomNavComponent.render('#bottom-nav-container', 'dashboard');
  }
}
