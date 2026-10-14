// SECTION: Temporary Test Database (Local Storage & JSON-backed)
const TempDB = {
  storageKey: 'novabank_test_transactions',

  // Initial seed dataset for the test database
  defaultRecords: [
    {
      id: 'tx-001',
      title: 'Ingreso de Nómina',
      subtitle: 'Abono en cuenta corriente · Hoy',
      amount: 1850.00,
      type: 'income',
      category: 'Nómina',
      date: '2026-10-24T09:00:00',
      status: 'completed',
      reference: 'TX-NOM-20261024'
    },
    {
      id: 'tx-002',
      title: 'Supermercado Central',
      subtitle: 'Compra con tarjeta · Hoy',
      amount: -84.35,
      type: 'expense',
      category: 'Alimentación',
      date: '2026-10-24T13:45:00',
      status: 'completed',
      reference: 'TX-SUP-20261024'
    },
    {
      id: 'tx-003',
      title: 'Factura Electricidad',
      subtitle: 'Domiciliación bancaria · Ayer',
      amount: -62.40,
      type: 'expense',
      category: 'Suministros',
      date: '2026-10-23T10:15:00',
      status: 'completed',
      reference: 'TX-ELEC-20261023'
    },
    {
      id: 'tx-004',
      title: 'Bizum de Carlos',
      subtitle: 'Cena compartida · Ayer',
      amount: 25.00,
      type: 'income',
      category: 'Bizum',
      date: '2026-10-23T22:30:00',
      status: 'completed',
      reference: 'TX-BIZ-20261023'
    },
    {
      id: 'tx-005',
      title: 'Gasolinera Express',
      subtitle: 'Pago combustible · Esta semana',
      amount: -55.00,
      type: 'expense',
      category: 'Transporte',
      date: '2026-10-21T18:20:00',
      status: 'completed',
      reference: 'TX-GAS-20261021'
    }
  ],

  // SECTION: Database Initialization
  init() {
    try {
      const existing = localStorage.getItem(this.storageKey);
      if (!existing) {
        localStorage.setItem(this.storageKey, JSON.stringify(this.defaultRecords));
      }
    } catch (e) {
      console.warn('LocalStorage unavailable, running in-memory', e);
    }
  },

  // SECTION: Query Operations
  getAll() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [...this.defaultRecords];
    } catch (e) {
      return [...this.defaultRecords];
    }
  },

  getById(id) {
    const list = this.getAll();
    return list.find(item => item.id === id) || null;
  },

  // SECTION: Mutation Operations
  insert(transaction) {
    const list = this.getAll();
    const newRecord = {
      id: transaction.id || `tx-${Date.now().toString(36)}`,
      title: transaction.title || 'Movimiento',
      subtitle: transaction.subtitle || 'Operación bancaria',
      amount: parseFloat(transaction.amount) || 0,
      type: transaction.type || (transaction.amount < 0 ? 'expense' : 'income'),
      category: transaction.category || 'Varios',
      date: transaction.date || new Date().toISOString(),
      status: 'completed',
      reference: transaction.reference || `TX-${Math.floor(100000 + Math.random() * 900000)}`
    };

    list.unshift(newRecord);
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
    return newRecord;
  },

  delete(id) {
    let list = this.getAll();
    list = list.filter(item => item.id !== id);
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
    return list;
  },

  reset() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.defaultRecords));
    } catch (e) {
      console.warn('Failed to reset localStorage', e);
    }
    return [...this.defaultRecords];
  },

  // SECTION: Dynamic Grouping & Sum Computation
  groupTransactions(items) {
    const groupsMap = new Map();

    const todayStr = '2026-10-24'; // Base test date reference
    const yesterdayStr = '2026-10-23';

    items.forEach(item => {
      const datePart = (item.date || '').split('T')[0];
      let groupLabel = 'Otras fechas';

      if (datePart === todayStr) {
        groupLabel = 'Hoy, 24 de Octubre';
      } else if (datePart === yesterdayStr) {
        groupLabel = 'Ayer, 23 de Octubre';
      } else if (datePart >= '2026-10-18' && datePart < yesterdayStr) {
        groupLabel = 'Esta semana';
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
      // Dynamically calculate the group balance total from actual DB numbers
      grp.total += Number(item.amount);
    });

    return Array.from(groupsMap.values());
  }
};

// Initialize the database on load
TempDB.init();
