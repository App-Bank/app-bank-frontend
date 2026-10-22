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

    reset() {
    this._cache = [];
  },

    async getTransactions(params = {}) {
    let currentAccountId = (typeof AppState !== 'undefined' && AppState.accountId != null) ? AppState.accountId : null;

    const [rawActivities = [], rawTransfers = [], myAcc] = await Promise.all([
      ApiService.getActivityHistory(),
      ApiService.getTransferHistory().catch(() => []),
      currentAccountId == null ? ApiService.getAccount().catch(() => null) : null
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

      const rawIban = item.account_iban || item.iban || null;
      const displayIban = rawIban ? window.formatIban(rawIban) : 'No disponible';

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
        concept: conceptValue || displayTitle,
        title: displayTitle,
        subtitle: displaySubtitle,
        amount: isSender ? -amountNum : amountNum,
        type: isSender ? 'expense' : 'income',
        category: 'Transferencia',
        accountNumber: displayIban,
        date: dateRaw,
        timestamp: d ? d.getTime() : null
      };
    });

    allRecords.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    this._cache = allRecords;

    const { search = '', filter = 'all', period = 'all' } = params;
    const query = search.toLowerCase().trim();

    const filtered = allRecords.filter(item => {
      const conceptText = `${item.concept || ''} ${item.title || ''} ${item.accountNumber || ''}`.toLowerCase().trim();
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

    getById(id) {
    return this._cache.find(i => i.id === String(id)) || null;
  },

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