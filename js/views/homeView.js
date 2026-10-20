// SECTION: Home View
function renderHomeView(container) {
  const esc = window.escapeHtml || (s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));

  const displayName = AppState.userName || (AppState.user ? (AppState.user.split('@')[0].charAt(0).toUpperCase() + AppState.user.split('@')[0].slice(1)) : 'Usuario');

  const now = new Date();
  const rawDate = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const formattedDate = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);
  const currentMonth = now.toLocaleDateString('es-ES', { month: 'long' });
  const formattedMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

  function formatBalance(amount) {
    const formatted = (Number(amount) || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const parts = formatted.split(',');
    return {
      text: `${formatted} €`,
      html: `${parts[0]}<span class="balance-decimals">,${parts[1]}</span>`
    };
  }

  const currentBal = AppState.balance != null ? Number(AppState.balance) : 0;
  const initialBal = formatBalance(currentBal);

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

  const eyeClosedIcon = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>`;
  const eyeOpenIcon = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;

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
          <h1 id="home-welcome-title">Hola, <span id="home-welcome-name">${esc(displayName)}</span> <span class="hand-emoji">👋</span></h1>
          <time class="current-date" id="home-current-date" datetime="${now.toISOString().slice(0, 10)}">${formattedDate}</time>
        </div>
      </header>

      <main class="app-main">
        <section class="account-section">
          <h2 class="section-title">Mi Cuenta</h2>
          <div class="card position-card">
            <div class="iban-center-wrapper">
              <div class="iban-container">
                <span class="iban-label">IBAN</span>
                <span class="iban-value" id="home-iban">Cargando...</span>
                <button type="button" class="btn-icon" id="btn-toggle-home-iban" aria-label="Mostrar IBAN completo" title="Mostrar IBAN completo">${eyeClosedIcon}</button>
              </div>
            </div>
            
            <div class="balance-display">
              <span class="balance-amount" id="home-balance-amount">${initialBal.html}</span>
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
            <div class="metric-box box-position"><span class="box-label">Posición Global</span><span class="box-value" id="home-metric-position">${initialBal.text}</span></div>
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
  let currentRawIban = '';

  function formatMaskedIban(iban) {
    if (!iban) return 'No disponible';
    const clean = iban.replace(/\s+/g, '');
    const prefix = clean.slice(0, 4) || 'ES--';
    const suffix = clean.slice(-4) || '----';
    return `${prefix} •••• ${suffix}`;
  }

  function updateIbanDisplay() {
    if (!ibanEl) return;
    if (!currentRawIban) {
      ibanEl.textContent = 'No disponible';
      return;
    }
    if (isIbanHidden) {
      ibanEl.textContent = formatMaskedIban(currentRawIban);
      if (toggleIbanBtn) {
        toggleIbanBtn.innerHTML = eyeClosedIcon;
        toggleIbanBtn.setAttribute('aria-label', 'Mostrar IBAN completo');
        toggleIbanBtn.setAttribute('title', 'Mostrar IBAN completo');
      }
    } else {
      ibanEl.textContent = window.formatIban(currentRawIban);
      if (toggleIbanBtn) {
        toggleIbanBtn.innerHTML = eyeOpenIcon;
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
      window.showToast('Sesión cerrada correctamente', 'info');
      if (typeof ApiService !== 'undefined' && typeof ApiService.logout === 'function') {
        ApiService.logout();
      } else {
        AppState.user = null;
        AppState.userName = null;
        AppState.isAuthenticated = false;
        try {
          sessionStorage.removeItem('aura_token');
          sessionStorage.removeItem('aura_user');
          sessionStorage.removeItem('aura_user_name');
        } catch (_) {}
        if (window.appRouter) {
          window.appRouter.navigate('/login');
        } else {
          window.location.hash = '#/login';
        }
      }
    });
  }

  // SECTION: Backend Data Synchronization
  async function syncHomeWithBackend() {
    if (typeof ApiService === 'undefined') return;

    const needUser = !AppState.userName;
    const [accountRes, userRes] = await Promise.allSettled([
      ApiService.getAccount(),
      needUser ? ApiService.getUser() : Promise.resolve(null)
    ]);

    if (accountRes.status === 'fulfilled' && accountRes.value) {
      const account = accountRes.value;
      const balNum = Number(account.balance) || 0;
      const bal = formatBalance(balNum);
      if (balanceAmountEl) balanceAmountEl.innerHTML = bal.html;
      const posEl = container.querySelector('#home-metric-position');
      if (posEl) posEl.textContent = bal.text;
      if (account.iban) {
        currentRawIban = account.iban;
        updateIbanDisplay();
      }
      AppState.balance = balNum;
    } else {
      console.warn('[HomeView] Could not fetch account from backend:', accountRes.reason);
      if (balanceAmountEl) {
        balanceAmountEl.innerHTML = '<span style="color: #f87171; font-weight: 700; font-size: 26px;">ERROR</span>';
      }
      const posEl = container.querySelector('#home-metric-position');
      if (posEl) posEl.textContent = 'ERROR';
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
      AppState.userName = userRes.value.name;
      try { sessionStorage.setItem('aura_user_name', userRes.value.name); } catch (_) {}
      const nameEl = container.querySelector('#home-welcome-name');
      if (nameEl) nameEl.textContent = userRes.value.name;
    }

    let txRes = null;
    try {
      const groups = await TransactionService.getTransactions();
      txRes = { status: 'fulfilled', value: groups };
    } catch (err) {
      txRes = { status: 'rejected', reason: err };
    }

    const movementsContainer = container.querySelector('#home-movements-list');

    if (txRes.status === 'rejected') {
      if (movementsContainer) {
        movementsContainer.innerHTML = '<div style="text-align: center; padding: 24px 16px; color: #f87171; font-size: 13.5px;">No se pudieron cargar los movimientos</div>';
      }
      return;
    }

    if (txRes.status === 'fulfilled' && Array.isArray(txRes.value)) {
      const allItems = txRes.value.flatMap(g => g.items || []);
      if (allItems.length > 0) {
        allItems.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        const recent = allItems.slice(0, 3);
        if (movementsContainer) {
          movementsContainer.innerHTML = recent.map(item => {
            const num = Number(item.amount);
            const isPositive = num > 0;
            const formattedAmt = window.formatCurrency(num, { includeSign: true });
            const iconInfo = getMovementIconInfo(item);

            const safeTitle = esc(item.title);
            const safeSubtitle = esc(item.subtitle || 'Operación bancaria');
            const safeAmt = esc(formattedAmt);

            return `
              <a href="#/history" class="movement-item" aria-label="${safeTitle}: ${safeAmt}">
                <div class="movement-icon ${iconInfo.cls}" aria-hidden="true">${iconInfo.icon}</div>
                <div class="movement-details">
                  <h3>${safeTitle}</h3>
                  <p>${safeSubtitle}</p>
                </div>
                <div class="movement-amount ${isPositive ? 'positive' : 'negative'}">
                  <span>${safeAmt}</span>
                  <span class="status">Completado</span>
                </div>
              </a>
            `;
          }).join('');
        }

        const nowD = new Date();
        const curM = nowD.getMonth();
        const curY = nowD.getFullYear();
        let inc = 0;
        let exp = 0;
        for (const r of allItems) {
          const d = r.timestamp ? new Date(r.timestamp) : null;
          if (d && d.getMonth() === curM && d.getFullYear() === curY) {
            const val = Number(r.amount) || 0;
            if (val > 0) inc += val;
            else if (val < 0) exp += Math.abs(val);
          }
        }
        const incEl = container.querySelector('#home-metric-income');
        const expEl = container.querySelector('#home-metric-expense');
        if (incEl) incEl.textContent = window.formatCurrency(inc);
        if (expEl) expEl.textContent = window.formatCurrency(exp);
      }
    }
  }

  syncHomeWithBackend();

  BottomNavComponent.render(container.querySelector('#bottom-nav-container'), 'dashboard');
}
