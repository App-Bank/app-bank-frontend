// SECTION: History View
function renderHistoryView(container) {
  let currentSearch = '';
  let currentFilter = 'all';
  let currentPeriod = 'all';

  const formatAmount = (amount) => (typeof window.formatCurrency === 'function')
    ? window.formatCurrency(amount, { includeSign: true })
    : `${Number(amount) > 0 ? '+' : '-'}${Math.abs(Number(amount)).toFixed(2)} €`;

  container.innerHTML = `
    <div class="aurora" aria-hidden="true"></div>
    <section class="history-view" aria-labelledby="history-heading">
      <header class="history-header">
        <div class="app-top">
          <a href="#/dashboard" class="app-brand"><span class="logo-mark" aria-hidden="true"></span><span>AURA NEO-BANKING</span></a>
        </div>
        <h1 id="history-heading" class="screen-title">Historial</h1>
      </header>

      <search class="history-search-container" aria-label="Búsqueda y filtros de movimientos">
        <div class="history-search-bar" id="history-search-box">
          <span class="history-search-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <input type="search" id="history-search-input" class="history-search-input" placeholder="Buscar movimientos..." aria-label="Buscar movimientos por nombre, categoría o concepto" autocomplete="off" spellcheck="false">
          <button type="button" id="btn-history-clear-search" class="history-search-clear is-hidden" aria-label="Borrar búsqueda">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="history-filter-row">
          <button type="button" class="btn-filter-pill" id="btn-toggle-filters" aria-expanded="false" aria-controls="filter-options-container" aria-label="Mostrar u ocultar filtros">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            <span>Filtros</span>
          </button>

          <div id="filter-options-container" class="filter-options-container is-hidden" role="group" aria-label="Opciones de filtro">
            <div class="filter-group-block">
              <span class="filter-group-label">Periodo</span>
              <div class="filter-chips-row">
                <button type="button" class="filter-chip-option active" data-period="all" aria-pressed="true">Todos</button>
                <button type="button" class="filter-chip-option" data-period="daily" aria-pressed="false">Diario</button>
                <button type="button" class="filter-chip-option" data-period="weekly" aria-pressed="false">Semanal</button>
                <button type="button" class="filter-chip-option" data-period="monthly" aria-pressed="false">Mensual</button>
              </div>
            </div>
            <div class="filter-group-block">
              <span class="filter-group-label">Tipo</span>
              <div class="filter-chips-row">
                <button type="button" class="filter-chip-option active" data-type="all" aria-pressed="true">Todos</button>
                <button type="button" class="filter-chip-option" data-type="income" aria-pressed="false">Ingresos (+)</button>
                <button type="button" class="filter-chip-option" data-type="expense" aria-pressed="false">Gastos (-)</button>
              </div>
            </div>
          </div>
        </div>
      </search>

      <section class="history-timeline" id="history-timeline-container" aria-label="Listado de movimientos"></section>

      <div id="transaction-modal" class="transaction-modal" role="dialog" aria-modal="true" aria-labelledby="modal-tx-title" aria-hidden="true">
        <div class="transaction-modal-sheet">
          <div class="modal-drag-handle"></div>
          <header class="modal-header">
            <div><h2 id="modal-tx-title" class="modal-title">Detalle del Movimiento</h2></div>
            <div id="modal-tx-amount" class="modal-amount">0,00 €</div>
          </header>
          <dl class="modal-details-grid">
            <div class="modal-detail-row" id="modal-tx-account-row"><dt class="modal-detail-label">Número de cuenta</dt><dd id="modal-tx-account" class="modal-detail-value">-</dd></div>
            <div class="modal-detail-row"><dt class="modal-detail-label">Concepto</dt><dd id="modal-tx-concept" class="modal-detail-value">-</dd></div>
            <div class="modal-detail-row"><dt class="modal-detail-label">Fecha y hora</dt><dd class="modal-detail-value"><time id="modal-tx-date">-</time></dd></div>
            <div class="modal-detail-row"><dt class="modal-detail-label">Estado</dt><dd class="modal-detail-value" style="color: #34d399;">● Completado</dd></div>
          </dl>
          <button type="button" id="btn-close-modal" class="modal-close-btn">Cerrar</button>
        </div>
      </div>

      <div id="bottom-nav-container"></div>
    </section>
  `;

  const timelineContainer = container.querySelector('#history-timeline-container');
  const searchInput = container.querySelector('#history-search-input');
  const btnClearSearch = container.querySelector('#btn-history-clear-search');
  const btnToggleFilters = container.querySelector('#btn-toggle-filters');
  const filterOptionsContainer = container.querySelector('#filter-options-container');
  const txModal = container.querySelector('#transaction-modal');
  const btnCloseModal = container.querySelector('#btn-close-modal');

  const expIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>';
  const incIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>';

  // SECTION: Transaction Timeline Rendering
  async function loadTransactions() {
    timelineContainer.innerHTML = '<div class="history-empty-state"><span>Cargando movimientos de la base de datos...</span></div>';

    const groups = await TransactionService.getTransactions({
      search: currentSearch,
      filter: currentFilter,
      period: currentPeriod
    });

    if (!groups || groups.length === 0) {
      timelineContainer.innerHTML = `
        <div class="history-empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <div class="history-empty-title">Sin movimientos en la base de datos</div>
          <p class="history-empty-desc">No hay operaciones que coincidan con la búsqueda o la base de datos está vacía.</p>
        </div>
      `;
      return;
    }

    timelineContainer.innerHTML = groups.map(group => {
      const totalClass = group.total < 0 ? 'negative' : 'positive';
      const itemsHtml = group.items.map(item => {
        const formattedAmt = formatAmount(item.amount);
        return `
          <button type="button" class="history-item ${item.type}" data-id="${item.id}" aria-label="${item.title}: ${formattedAmt}">
            <div class="history-item-left">
              <div class="history-item-icon" aria-hidden="true">${item.type === 'expense' ? expIcon : incIcon}</div>
              <div class="history-item-details">
                <span class="history-item-title">${item.title}</span>
                <span class="history-item-subtitle">${item.subtitle}</span>
              </div>
            </div>
            <div class="history-item-amount">${formattedAmt}</div>
          </button>
        `;
      }).join('');

      return `
        <article class="history-group">
          <header class="history-group-header">
            <h2 class="history-group-title">${group.groupLabel}</h2>
            <span class="history-group-total ${totalClass}">${formatAmount(group.total)}</span>
          </header>
          <div class="history-items-list">${itemsHtml}</div>
        </article>
      `;
    }).join('');
  }

  timelineContainer.addEventListener('click', (e) => {
    const itemElem = e.target.closest('.history-item');
    if (itemElem) openTransactionModal(itemElem.getAttribute('data-id'));
  });

  timelineContainer.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const itemElem = e.target.closest('.history-item');
      if (itemElem) {
        e.preventDefault();
        openTransactionModal(itemElem.getAttribute('data-id'));
      }
    }
  });

  // SECTION: Transaction Details Modal Logic
  function openTransactionModal(txId) {
    const item = (typeof TransactionService !== 'undefined' && typeof TransactionService.getById === 'function')
      ? TransactionService.getById(txId)
      : null;
    if (!item) return;

    container.querySelector('#modal-tx-title').textContent = item.title;
    const amountElem = container.querySelector('#modal-tx-amount');
    amountElem.textContent = formatAmount(item.amount);
    amountElem.style.color = item.type === 'expense' ? '#f87171' : '#34d399';

    container.querySelector('#modal-tx-account').textContent = item.accountNumber || `ES91 2100 0418 4502 000${(item.id || '0000').slice(-4)}`;
    container.querySelector('#modal-tx-concept').textContent = item.concept || item.title || (item.category || '-');
    const dateObj = new Date(item.date);
    const dateElem = container.querySelector('#modal-tx-date');
    if (dateElem) {
      dateElem.textContent = dateObj.toLocaleDateString('es-ES', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      dateElem.setAttribute('datetime', !isNaN(dateObj.getTime()) ? dateObj.toISOString() : '');
    }

    txModal.classList.add('show');
    txModal.setAttribute('aria-hidden', 'false');
  }

  function closeTransactionModal() {
    txModal.classList.remove('show');
    txModal.setAttribute('aria-hidden', 'true');
  }

  if (btnCloseModal) btnCloseModal.addEventListener('click', closeTransactionModal);
  if (txModal) {
    txModal.addEventListener('click', (e) => {
      if (e.target === txModal) closeTransactionModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && txModal && txModal.classList.contains('show')) {
      closeTransactionModal();
    }
  });

  // SECTION: Search and Filter Handlers
  if (btnToggleFilters && filterOptionsContainer) {
    btnToggleFilters.addEventListener('click', () => {
      const isHidden = filterOptionsContainer.classList.toggle('is-hidden');
      btnToggleFilters.classList.toggle('active', !isHidden);
      btnToggleFilters.setAttribute('aria-expanded', String(!isHidden));
    });
  }

  if (searchInput) {
    const handleSearch = () => {
      currentSearch = searchInput.value;
      if (btnClearSearch) btnClearSearch.classList.toggle('is-hidden', currentSearch.length === 0);
      loadTransactions();
    };
    searchInput.addEventListener('input', handleSearch);
    searchInput.addEventListener('search', handleSearch);
  }

  if (btnClearSearch) {
    btnClearSearch.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      currentSearch = '';
      btnClearSearch.classList.add('is-hidden');
      if (searchInput) searchInput.focus();
      loadTransactions();
    });
  }

  function setupChips(selector, onSelect) {
    const chips = container.querySelectorAll(selector);
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => {
          c.classList.remove('active');
          c.setAttribute('aria-pressed', 'false');
        });
        chip.classList.add('active');
        chip.setAttribute('aria-pressed', 'true');
        onSelect(chip);
        loadTransactions();
      });
    });
  }

  setupChips('.filter-chip-option[data-period]', chip => currentPeriod = chip.getAttribute('data-period'));
  setupChips('.filter-chip-option[data-type]', chip => currentFilter = chip.getAttribute('data-type'));

  loadTransactions();

  // SECTION: Bottom Navigation Bar
  if (typeof BottomNavComponent !== 'undefined') {
    BottomNavComponent.render('#bottom-nav-container', 'history');
  }
}
