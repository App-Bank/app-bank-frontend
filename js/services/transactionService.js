// SECTION: Transaction Service
function parseApiDate(dateStr) {
  if (!dateStr) return null;
  const hasTz = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(dateStr);
  const d = new Date(hasTz ? dateStr : dateStr + 'Z');
  return isNaN(d.getTime()) ? null : d;
}

function dayKey(d) {
  if (!d) return 'unknown';
  const dateObj = d instanceof Date ? d : parseApiDate(d);
  if (!dateObj) return 'unknown';
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const TransactionService = {
  _cache: [],
  _accountsMap: new Map(),

  // SECTION: Cache & State Reset
  reset() {
    this._cache = [];
    this._accountsMap.clear();
  },

  clearCache() {
    this.reset();
  },

  // SECTION: Query Transactions
  async getTransactions(params = {}) {
    let rawTransfers = [];
    const needAccounts = this._accountsMap.size === 0;

    let currentAccountId = (typeof AppState !== 'undefined' && AppState.accountId != null) ? AppState.accountId : null;
    const tasks = [
      ApiService.getTransferHistory()
    ];

    if (currentAccountId == null) {
      tasks.push(ApiService.getAccount());
    }

    if (needAccounts) {
      tasks.push(ApiService.getAccounts().catch(e => {
        console.warn('[TransactionService] Failed to fetch accounts:', e);
        return [];
      }));
    }

    const results = await Promise.all(tasks);
    rawTransfers = results[0] || [];

    let resultIndex = 1;
    if (currentAccountId == null) {
      const myAcc = results[resultIndex++];
      if (myAcc && myAcc.id != null) {
        currentAccountId = Number(myAcc.id);
        if (typeof AppState !== 'undefined') AppState.accountId = currentAccountId;
      }
    }

    if (currentAccountId == null) {
      throw new Error('No se pudo identificar tu cuenta (falta "id" en /accounts/me)');
    }

    if (needAccounts) {
      const accountsRes = results[resultIndex];
      if (Array.isArray(accountsRes)) {
        accountsRes.forEach(acc => {
          if (acc && acc.id != null) this._accountsMap.set(Number(acc.id), acc.iban);
        });
      }
    }

    const now = new Date();
    const todayKeyStr = dayKey(now);

    const allRecords = (rawTransfers || []).map(tx => {
      const isSender = Number(tx.sender_account_id) === currentAccountId;
      const amountNum = Math.abs(Number(tx.amount) || 0);

      const d = parseApiDate(tx.created_at);
      const isToday = d ? (dayKey(d) === todayKeyStr) : false;
      const dateSubtitle = isToday
        ? 'Hoy'
        : (d ? d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'Fecha no disponible');

      const counterpartyId = isSender ? Number(tx.recipient_account_id) : Number(tx.sender_account_id);
      const rawIban = this._accountsMap.get(counterpartyId);
      const displayIban = rawIban ? window.formatIban(rawIban) : 'No disponible';

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
        date: tx.created_at || null,
        timestamp: d ? d.getTime() : null,
        status: 'completed',
        reference: `TX-${String(tx.id).padStart(6, '0')}`
      };
    });

    allRecords.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    this._cache = allRecords;

    const { search = '', filter = 'all', period = 'all' } = params;
    const query = search.toLowerCase().trim();

    const filtered = allRecords.filter(item => {
      const conceptText = (item.concept || item.title || '').toLowerCase().trim();
      const matchesSearch = !query || conceptText.includes(query);
      const matchesType = filter === 'all' || item.type === filter;

      let matchesPeriod = true;
      if (period !== 'all') {
        const itemDate = item.timestamp ? new Date(item.timestamp) : parseApiDate(item.date);
        const itemDateKey = itemDate ? dayKey(itemDate) : 'unknown';
        const isToday = itemDateKey === todayKeyStr;

        if (period === 'daily') {
          matchesPeriod = isToday;
        } else if (period === 'weekly') {
          const diffMs = itemDate ? (now.getTime() - itemDate.getTime()) : -1;
          const diffDays = diffMs / (1000 * 60 * 60 * 24);
          matchesPeriod = isToday || (diffDays >= 0 && diffDays <= 7);
        } else if (period === 'monthly') {
          const isSameMonth = itemDate && itemDate.getFullYear() === now.getFullYear() && itemDate.getMonth() === now.getMonth();
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
    const todayKeyStr = dayKey(now);

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKeyStr = dayKey(yesterday);

    items.forEach(item => {
      const d = item.timestamp ? new Date(item.timestamp) : parseApiDate(item.date);
      const itemKeyStr = d ? dayKey(d) : 'unknown';
      let groupLabel = 'Fecha no disponible';

      if (d) {
        if (itemKeyStr === todayKeyStr) {
          groupLabel = 'Hoy, ' + now.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
        } else if (itemKeyStr === yesterdayKeyStr) {
          groupLabel = 'Ayer, ' + yesterday.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
        } else {
          const hasDifferentYear = d.getFullYear() !== now.getFullYear();
          groupLabel = d.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            ...(hasDifferentYear && { year: 'numeric' })
          });
        }
      }

      if (!groupsMap.has(itemKeyStr)) {
        groupsMap.set(itemKeyStr, {
          groupLabel,
          items: [],
          total: 0
        });
      }

      const grp = groupsMap.get(itemKeyStr);
      grp.items.push(item);
      grp.total += Number(item.amount);
    });

    return Array.from(groupsMap.values());
  }
};

window.TransactionService = TransactionService;
