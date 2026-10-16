// SECTION: View - History Screen (Database Connected)
function renderHistoryView(container) {
  let currentSearch = '';
  let currentFilter = 'all'; // 'all', 'income', 'expense'
  let currentPeriod = 'all'; // 'all', 'daily', 'weekly', 'monthly'

  // Helper: Format amount with +/- prefix and European currency notation
  function formatAmount(amount) {
    if (typeof window.formatCurrency === 'function') {
      return window.formatCurrency(amount, { includeSign: true });
    }
    const num = Number(amount);
    const absVal = Math.abs(num).toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `${num > 0 ? '+' : '-'}${absVal} €`;
  }

  // Render base shell structure
  container.innerHTML = `
    <div class="aurora" aria-hidden="true"></div>
    <section class="history-view" aria-labelledby="history-heading">

      <!-- SECTION: Header (Branding & Titles) -->
      <header class="history-header">
        <div class="app-top">
          <a href="#/dashboard" class="app-brand">
            <span class="logo-mark" aria-hidden="true"></span>
            <span>AURA NEO-BANKING</span>
          </a>
        </div>
        <h1 id="history-heading" class="screen-title">Historial</h1>
      </header>

      <!-- SECTION: Search & Filters Bar -->
      <section class="history-search-container" aria-label="Búsqueda y filtros de movimientos">
        <div class="history-search-bar" id="history-search-box">
          <span class="history-search-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>

          <input 
            type="search" 
            id="history-search-input" 
            class="history-search-input" 
            placeholder="Buscar movimientos..." 
            aria-label="Buscar movimientos por nombre, categoría o concepto"
            autocomplete="off"
            spellcheck="false"
          >

          <button 
            type="button" 
            id="btn-history-clear-search" 
            class="history-search-clear is-hidden" 
            aria-label="Borrar búsqueda"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="history-filter-row">
          <button type="button" class="btn-filter-pill" id="btn-toggle-filters" aria-expanded="false" aria-controls="filter-options-container" aria-label="Mostrar u ocultar filtros">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            <span>Filtros</span>
          </button>

          <!-- Filter options hidden by default until toggled -->
          <div id="filter-options-container" class="filter-options-container is-hidden" role="group" aria-label="Opciones de filtro">
            <div class="filter-group-block">
              <span class="filter-group-label">Periodo</span>
              <div class="filter-chips-row">
                <button type="button" class="filter-chip-option active" data-period="all">Todos</button>
                <button type="button" class="filter-chip-option" data-period="daily">Diario</button>
                <button type="button" class="filter-chip-option" data-period="weekly">Semanal</button>
                <button type="button" class="filter-chip-option" data-period="monthly">Mensual</button>
              </div>
            </div>

            <div class="filter-group-block">
              <span class="filter-group-label">Tipo</span>
              <div class="filter-chips-row">
                <button type="button" class="filter-chip-option active" data-type="all">Todos</button>
                <button type="button" class="filter-chip-option" data-type="income">Ingresos (+)</button>
                <button type="button" class="filter-chip-option" data-type="expense">Gastos (-)</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SECTION: Timeline of Transactions (Fed dynamically from Database) -->
      <section class="history-timeline" id="history-timeline-container" aria-label="Listado de movimientos">
        <!-- Dynamic transaction groups mount here via loadTransactions() -->
      </section>

      <!-- SECTION: Transaction Details Modal Bottom Sheet -->
      <div id="transaction-modal" class="transaction-modal" role="dialog" aria-modal="true" aria-labelledby="modal-tx-title" aria-hidden="true">
        <div class="transaction-modal-sheet">
          <div class="modal-drag-handle"></div>
          <header class="modal-header">
            <div>
              <h2 id="modal-tx-title" class="modal-title">Detalle del Movimiento</h2>
            </div>
            <div id="modal-tx-amount" class="modal-amount">0,00 €</div>
          </header>

          <div class="modal-details-grid">
            <div class="modal-detail-row" id="modal-tx-account-row">
              <span class="modal-detail-label">Número de cuenta</span>
              <span id="modal-tx-account" class="modal-detail-value">-</span>
            </div>
            <div class="modal-detail-row">
              <span class="modal-detail-label">Concepto</span>
              <span id="modal-tx-concept" class="modal-detail-value">-</span>
            </div>
            <div class="modal-detail-row">
              <span class="modal-detail-label">Fecha y hora</span>
              <span id="modal-tx-date" class="modal-detail-value">-</span>
            </div>
            <div class="modal-detail-row">
              <span class="modal-detail-label">Estado</span>
              <span class="modal-detail-value" style="color: #34d399;">● Completado</span>
            </div>
          </div>

          <button type="button" id="btn-close-modal" class="modal-close-btn">Cerrar</button>
        </div>
      </div>

      <!-- SECTION: Bottom Navigation Bar Component Mount -->
      <div id="bottom-nav-container"></div>

    </section>
  `;

  // DOM Elements
  const timelineContainer = document.getElementById('history-timeline-container');
  const searchInput = document.getElementById('history-search-input');
  const btnClearSearch = document.getElementById('btn-history-clear-search');
  const btnToggleFilters = document.getElementById('btn-toggle-filters');
  const filterOptionsContainer = document.getElementById('filter-options-container');
  const periodChips = container.querySelectorAll('.filter-chip-option[data-period]');
  const typeChips = container.querySelectorAll('.filter-chip-option[data-type]');
  const txModal = document.getElementById('transaction-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');

  // SECTION: Render Transactions from Database
  async function loadTransactions() {
    timelineContainer.innerHTML = `
      <div class="history-empty-state">
        <span>Cargando movimientos de la base de datos...</span>
      </div>
    `;

    const groups = await TransactionService.getTransactions({
      search: currentSearch,
      filter: currentFilter,
      period: currentPeriod
    });

    if (!groups || groups.length === 0) {
      timelineContainer.innerHTML = `
        <div class="history-empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <div class="history-empty-title">Sin movimientos en la base de datos</div>
          <p class="history-empty-desc">No hay operaciones que coincidan con la búsqueda o la base de datos está vacía.</p>
        </div>
      `;
      return;
    }

    timelineContainer.innerHTML = '';

    groups.forEach(group => {
      const groupElem = document.createElement('article');
      groupElem.className = 'history-group';

      const totalClass = group.total < 0 ? 'negative' : 'positive';
      const formattedTotal = formatAmount(group.total);

      let itemsHtml = '';
      group.items.forEach(item => {
        const isExpense = item.type === 'expense';
        const formattedItemAmount = formatAmount(item.amount);

        const iconSvg = isExpense 
          ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
               <line x1="12" y1="19" x2="12" y2="5"></line>
               <polyline points="5 12 12 5 19 12"></polyline>
             </svg>`
          : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
               <line x1="12" y1="5" x2="12" y2="19"></line>
               <polyline points="19 12 12 19 5 12"></polyline>
             </svg>`;

        itemsHtml += `
          <div class="history-item ${item.type}" data-id="${item.id}" tabindex="0" role="button" aria-label="${item.title}: ${formattedItemAmount}">
            <div class="history-item-left">
              <div class="history-item-icon" aria-hidden="true">
                ${iconSvg}
              </div>
              <div class="history-item-details">
                <span class="history-item-title">${item.title}</span>
                <span class="history-item-subtitle">${item.subtitle}</span>
              </div>
            </div>
            <div class="history-item-amount">${formattedItemAmount}</div>
          </div>
        `;
      });

      groupElem.innerHTML = `
        <header class="history-group-header">
          <span class="history-group-title">${group.groupLabel}</span>
          <span class="history-group-total ${totalClass}">${formattedTotal}</span>
        </header>
        <div class="history-items-list">
          ${itemsHtml}
        </div>
      `;

      timelineContainer.appendChild(groupElem);
    });

    // Attach click listeners to transaction items for detail modal
    const items = timelineContainer.querySelectorAll('.history-item');
    items.forEach(itemElem => {
      itemElem.addEventListener('click', () => {
        const txId = itemElem.getAttribute('data-id');
        openTransactionModal(txId);
      });
      itemElem.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const txId = itemElem.getAttribute('data-id');
          openTransactionModal(txId);
        }
      });
    });
  }

  // SECTION: Details Modal Logic
  function openTransactionModal(txId) {
    const foundItem = TempDB.getById(txId);
    if (!foundItem) return;

    document.getElementById('modal-tx-title').textContent = foundItem.title;
    const amountElem = document.getElementById('modal-tx-amount');
    amountElem.textContent = formatAmount(foundItem.amount);
    amountElem.style.color = foundItem.type === 'expense' ? '#f87171' : '#34d399';

    // Set Account Number
    const accountRow = document.getElementById('modal-tx-account-row');
    const accountElem = document.getElementById('modal-tx-account');
    const accountNumber = foundItem.accountNumber || `ES91 2100 0418 4502 000${(foundItem.id || '0000').slice(-4)}`;
    accountElem.textContent = accountNumber;
    accountRow.classList.remove('is-hidden');

    // Set Concept
    const concept = foundItem.subtitle ? foundItem.subtitle.split(' · ')[0] : (foundItem.category || '-');
    document.getElementById('modal-tx-concept').textContent = concept;

    document.getElementById('modal-tx-date').textContent = new Date(foundItem.date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

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

  // SECTION: Search and Filter Event Handlers
  if (btnToggleFilters && filterOptionsContainer) {
    btnToggleFilters.addEventListener('click', () => {
      const isHidden = filterOptionsContainer.classList.toggle('is-hidden');
      btnToggleFilters.classList.toggle('active', !isHidden);
      btnToggleFilters.setAttribute('aria-expanded', String(!isHidden));
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentSearch = searchInput.value;
      if (currentSearch.length > 0) {
        btnClearSearch.classList.remove('is-hidden');
      } else {
        btnClearSearch.classList.add('is-hidden');
      }
      loadTransactions();
    });

    searchInput.addEventListener('search', () => {
      currentSearch = searchInput.value;
      if (currentSearch.length === 0) {
        btnClearSearch.classList.add('is-hidden');
      }
      loadTransactions();
    });
  }

  if (btnClearSearch) {
    btnClearSearch.addEventListener('click', () => {
      searchInput.value = '';
      currentSearch = '';
      btnClearSearch.classList.add('is-hidden');
      searchInput.focus();
      loadTransactions();
    });
  }

  periodChips.forEach(chip => {
    chip.addEventListener('click', () => {
      periodChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentPeriod = chip.getAttribute('data-period');
      loadTransactions();
    });
  });

  typeChips.forEach(chip => {
    chip.addEventListener('click', () => {
      typeChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.getAttribute('data-type');
      loadTransactions();
    });
  });

  // Initial render from database
  loadTransactions();

  // SECTION: Mount Reusable Bottom Navigation Component
  if (typeof BottomNavComponent !== 'undefined') {
    BottomNavComponent.render('#bottom-nav-container', 'history');
  }
}
