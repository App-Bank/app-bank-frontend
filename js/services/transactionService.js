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
    const needAccounts = this._accountsMap.size === 0;
    let currentAccountId = (typeof AppState !== 'undefined' && AppState.accountId != null) ? AppState.accountId : null;

    const [rawActivities = [], rawTransfers = [], myAcc, accountsRes] = await Promise.all([
      ApiService.getActivityHistory(),
      ApiService.getTransferHistory().catch(() => []),
      currentAccountId == null ? ApiService.getAccount().catch(() => null) : null,
      needAccounts ? ApiService.getAccounts().catch(() => []) : null
    ]);

    const transfersMap = new Map();
    if (Array.isArray(rawTransfers)) {
      rawTransfers.forEach(tx => {
        if (tx && tx.id != null) transfersMap.set(Number(tx.id), tx);
      });
    }

    if (currentAccountId == null) {
      if (myAcc && myAcc.id != null) {
        currentAccountId = Number(myAcc.id);
      } else if (Array.isArray(rawActivities)) {
        const actWithAcc = rawActivities.find(a => a && a.account_id != null);
        if (actWithAcc) currentAccountId = Number(actWithAcc.account_id);
      }
      if (currentAccountId != null && typeof AppState !== 'undefined') {
        AppState.accountId = currentAccountId;
      }
    }

    if (Array.isArray(accountsRes)) {
      accountsRes.forEach(acc => {
        if (acc && acc.id != null) this._accountsMap.set(Number(acc.id), acc.iban);
      });
    }

    const now = new Date();
    const todayKeyStr = dayKey(now);

    const hasActivities = Array.isArray(rawActivities) && rawActivities.length > 0;
    const sourceList = hasActivities ? rawActivities : (Array.isArray(rawTransfers) ? rawTransfers : []);

    const allRecords = sourceList.map(item => {
      const isSender = hasActivities
        ? (Number(item.activity_type_id) === 1 || item.activity_type === 'debit')
        : (currentAccountId != null && Number(item.sender_account_id) === currentAccountId);

      const tx = hasActivities ? transfersMap.get(Number(item.transfer_id)) : item;
      const conceptValue = (tx?.concept && tx.concept.trim()) || '';

      let displayIban = 'No disponible';
      if (tx) {
        const counterpartyId = isSender ? Number(tx.recipient_account_id) : Number(tx.sender_account_id);
        const rawIban = this._accountsMap.get(counterpartyId);
        if (rawIban) displayIban = window.formatIban(rawIban);
      }

      const amountNum = Math.abs(Number(item.amount) || 0);
      const dateRaw = item.succeeded_in || item.created_at || null;
      const d = parseApiDate(dateRaw);
      const isToday = d ? (dayKey(d) === todayKeyStr) : false;
      const dateSubtitle = isToday
        ? 'Hoy'
        : (d ? d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'Fecha no disponible');

      const displayTitle = conceptValue || (isSender ? 'Transferencia enviada' : 'Transferencia recibida');
      const displaySubtitle = `${isSender ? 'Transferencia emitida' : 'Transferencia recibida'} · ${dateSubtitle}`;

      return {
        id: `act-${item.id}`,
        backendId: item.id,
        transferId: item.transfer_id || item.id,
        concept: conceptValue || displayTitle,
        title: displayTitle,
        subtitle: displaySubtitle,
        amount: isSender ? -amountNum : amountNum,
        type: isSender ? 'expense' : 'income',
        category: 'Transferencia',
        accountNumber: displayIban,
        date: dateRaw,
        timestamp: d ? d.getTime() : null,
        status: 'completed',
        reference: `ACT-${String(item.id).padStart(6, '0')}`
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
    const sId = String(id);
    return this._cache.find(item =>
      String(item.id) === sId ||
      String(item.backendId) === sId ||
      (item.transferId != null && String(item.transferId) === sId) ||
      `act-${item.backendId}` === sId ||
      `tx-${item.backendId}` === sId ||
      (item.transferId != null && `tx-${item.transferId}` === sId)
    ) || null;
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
