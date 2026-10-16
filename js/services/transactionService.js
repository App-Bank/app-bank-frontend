// SECTION: Transaction Service (Backend Interface)
const TransactionService = {
  _cache: [],

  // SECTION: Query Transactions (Loads from Backend API)
  async getTransactions(params = {}) {
    let rawTransfers = [];

    if (typeof ApiService !== 'undefined' && typeof ApiService.getTransferHistory === 'function') {
      try {
        rawTransfers = await ApiService.getTransferHistory();
      } catch (error) {
        console.warn('[TransactionService] Failed to fetch transfers from backend:', error);
      }
    }

    const currentAccountId = (typeof ApiService !== 'undefined' && ApiService.config)
      ? ApiService.config.defaultAccountId
      : 1;

    // Transform backend transfers into frontend view model
    const allRecords = (rawTransfers || []).map(tx => {
      const isSender = Number(tx.sender_account_id) === currentAccountId;
      const amountNum = Math.abs(Number(tx.amount) || 0);

      const d = new Date(tx.created_at);
      const isToday = !isNaN(d) && (new Date().toDateString() === d.toDateString());
      const dateSubtitle = isToday
        ? 'Hoy'
        : (!isNaN(d) ? d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'Reciente');

      return {
        id: `tx-${tx.id}`,
        backendId: tx.id,
        title: isSender 
          ? (tx.concept || `Transferencia a cuenta #${tx.recipient_account_id}`)
          : `Transferencia recibida (cta #${tx.sender_account_id})`,
        subtitle: `${tx.concept ? tx.concept + ' · ' : ''}${dateSubtitle}`,
        amount: isSender ? -amountNum : amountNum,
        type: isSender ? 'expense' : 'income',
        category: 'Transferencia',
        accountNumber: isSender ? `Cuenta #${tx.recipient_account_id}` : `Cuenta #${tx.sender_account_id}`,
        date: tx.created_at || new Date().toISOString(),
        status: 'completed',
        reference: `TX-${String(tx.id).padStart(6, '0')}`
      };
    });

    this._cache = allRecords;

    const { search = '', filter = 'all', period = 'all' } = params;
    const query = search.toLowerCase().trim();
    const now = new Date();
    const realTodayOnly = now.toISOString().split('T')[0];

    // Filter backend records by search query, transaction type, and time period
    const filtered = allRecords.filter(item => {
      // 1. Text search
      const matchesSearch = !query ||
        item.title.toLowerCase().includes(query) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(query)) ||
        (item.category && item.category.toLowerCase().includes(query)) ||
        (item.reference && item.reference.toLowerCase().includes(query));

      // 2. Type filter (all, income, expense)
      const matchesType = filter === 'all' || item.type === filter;

      // 3. Period filter (all, daily, weekly, monthly)
      let matchesPeriod = true;
      if (period !== 'all') {
        const itemDate = new Date(item.date);
        const itemDateOnly = (item.date || '').split('T')[0];
        const isToday = (itemDateOnly === realTodayOnly);

        if (period === 'daily') {
          matchesPeriod = isToday;
        } else if (period === 'weekly') {
          const diffDays = Math.abs((now - itemDate) / (1000 * 60 * 60 * 24));
          matchesPeriod = isToday || diffDays <= 7;
        } else if (period === 'monthly') {
          const isSameMonth = itemDate.getFullYear() === now.getFullYear() && itemDate.getMonth() === now.getMonth();
          matchesPeriod = isToday || isSameMonth;
        }
      }

      return matchesSearch && matchesType && matchesPeriod;
    });

    return this.groupTransactions(filtered);
  },

  // SECTION: Query single item by ID for Modal
  getById(id) {
    return this._cache.find(item => String(item.id) === String(id) || String(item.backendId) === String(id)) || null;
  },

  // SECTION: Mutation Methods
  async createTransaction(transactionData) {
    if (typeof ApiService !== 'undefined' && typeof ApiService.createTransfer === 'function') {
      return await ApiService.createTransfer(transactionData);
    }
    throw new Error('ApiService unavailable');
  },

  // SECTION: Dynamic Grouping & Sum Computation
  groupTransactions(items) {
    const groupsMap = new Map();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    items.forEach(item => {
      const datePart = (item.date || '').split('T')[0];
      let groupLabel = 'Otras fechas';

      if (datePart === todayStr) {
        groupLabel = 'Hoy, ' + now.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
      } else if (datePart === yesterdayStr) {
        groupLabel = 'Ayer, ' + yesterday.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
      } else {
        const d = new Date(item.date);
        groupLabel = !isNaN(d)
          ? d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })
          : 'Otras fechas';
      }

      if (!groupsMap.has(groupLabel)) {
        groupsMap.set(groupLabel, {
          groupLabel: groupLabel,
          items: [],
          total: 0
        });
      }

      const grp = groupsMap.get(groupLabel);
      grp.items.push(item);
      grp.total += Number(item.amount);
    });

    return Array.from(groupsMap.values());
  }
};

window.TransactionService = TransactionService;
