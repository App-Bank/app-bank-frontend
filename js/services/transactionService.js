// SECTION: Transaction Service
const TransactionService = {
  _cache: [],
  _accountsMap: new Map(),

  // SECTION: Query Transactions
  async getTransactions(params = {}) {
    let rawTransfers = [];

    const needAccounts = this._accountsMap.size === 0;
    const tasks = [
      ApiService.getTransferHistory().catch(e => {
        console.warn('[TransactionService] Failed to fetch transfers:', e);
        return [];
      })
    ];

    if (needAccounts) {
      tasks.push(ApiService.getAccounts().catch(e => {
        console.warn('[TransactionService] Failed to fetch accounts:', e);
        return [];
      }));
    }

    const [transfersRes, accountsRes] = await Promise.all(tasks);
    rawTransfers = transfersRes || [];

    if (needAccounts && Array.isArray(accountsRes)) {
      accountsRes.forEach(acc => {
        if (acc && acc.id) this._accountsMap.set(Number(acc.id), acc.iban);
      });
    }

    const currentAccountId = ApiService.config.defaultAccountId || 1;

    const allRecords = (rawTransfers || []).map(tx => {
      const isSender = Number(tx.sender_account_id) === currentAccountId;
      const amountNum = Math.abs(Number(tx.amount) || 0);

      const d = new Date(tx.created_at);
      const isToday = !isNaN(d) && (new Date().toDateString() === d.toDateString());
      const dateSubtitle = isToday
        ? 'Hoy'
        : (!isNaN(d) ? d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'Reciente');

      const counterpartyId = isSender ? Number(tx.recipient_account_id) : Number(tx.sender_account_id);
      const rawIban = this._accountsMap.get(counterpartyId);
      const displayIban = rawIban ? window.formatIban(rawIban) : `ES91 2100 0418 4502 000${String(counterpartyId).padStart(4, '0')}`;

      const conceptValue = (tx.concept && tx.concept.trim()) ? tx.concept.trim() : '';
      const displayTitle = conceptValue || (isSender ? 'Transferencia enviada' : 'Transferencia recibida');
      const displaySubtitle = `${isSender ? 'Transferencia emitida' : 'Transferencia recibida'} · ${dateSubtitle}`;

      return {
        id: `tx-${tx.id}`,
        backendId: tx.id,
        concept: conceptValue || displayTitle,
        title: displayTitle,
        subtitle: displaySubtitle,
        amount: isSender ? -amountNum : amountNum,
        type: isSender ? 'expense' : 'income',
        category: 'Transferencia',
        accountNumber: displayIban,
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

    const filtered = allRecords.filter(item => {
      const conceptText = (item.concept || item.title || '').toLowerCase().trim();
      const matchesSearch = !query || conceptText.includes(query);
      const matchesType = filter === 'all' || item.type === filter;

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

  // SECTION: Query Single Item by ID
  getById(id) {
    return this._cache.find(item => String(item.id) === String(id) || String(item.backendId) === String(id)) || null;
  },

  // SECTION: Dynamic Grouping & Computation
  groupTransactions(items) {
    const groupsMap = new Map();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    items.forEach(item => {
      const datePart = (item.date || '').split('T')[0];
      const d = new Date(item.date);
      let groupLabel = 'Otras fechas';

      if (datePart === todayStr) {
        groupLabel = 'Hoy, ' + now.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
      } else if (datePart === yesterdayStr) {
        groupLabel = 'Ayer, ' + yesterday.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
      } else if (!isNaN(d)) {
        groupLabel = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
      }

      if (!groupsMap.has(groupLabel)) {
        groupsMap.set(groupLabel, {
          groupLabel,
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
