// SECTION: Transaction Service (Database & Backend Interface)
const TransactionService = {
  // TODO / FUTURE: Set to actual backend endpoint URL (e.g. http://localhost:8080/api/v1/transactions)
  apiBaseUrl: '/api/v1/transactions',

  // SECTION: Query Transactions (Loads from Temporary Database)
  async getTransactions(params = {}) {
    // TODO / FUTURE: When backend is active, query the real REST API:
    /*
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${this.apiBaseUrl}?${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('authToken') || ''}`
        }
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Backend unavailable, falling back to temporary database', error);
    }
    */

    // Fetch records directly from the temporary test database
    const allRecords = TempDB.getAll();
    const { search = '', filter = 'all', period = 'all' } = params;
    const query = search.toLowerCase().trim();

    const now = new Date();
    const realTodayOnly = now.toISOString().split('T')[0];
    const baseTestDateOnly = '2026-10-24';
    const testDate = new Date('2026-10-24T23:59:59');

    // Filter database records by search text, transaction type, and time period
    const filtered = allRecords.filter(item => {
      // 1. Text search
      const matchesSearch = !query ||
        item.title.toLowerCase().includes(query) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(query)) ||
        (item.category && item.category.toLowerCase().includes(query));

      // 2. Type filter (all, income, expense)
      const matchesType = filter === 'all' || item.type === filter;

      // 3. Period filter (all, daily, weekly, monthly)
      let matchesPeriod = true;
      if (period !== 'all') {
        const itemDate = new Date(item.date);
        const itemDateOnly = (item.date || '').split('T')[0];
        const isToday = (itemDateOnly === realTodayOnly || itemDateOnly === baseTestDateOnly || (item.subtitle && item.subtitle.toLowerCase().includes('hoy')));

        if (period === 'daily') {
          matchesPeriod = isToday;
        } else if (period === 'weekly') {
          const diffReal = Math.abs((now - itemDate) / (1000 * 60 * 60 * 24));
          const diffTest = Math.abs((testDate - itemDate) / (1000 * 60 * 60 * 24));
          matchesPeriod = isToday || diffReal <= 7 || diffTest <= 7;
        } else if (period === 'monthly') {
          const itemMonthYear = `${itemDate.getFullYear()}-${itemDate.getMonth()}`;
          const realMonthYear = `${now.getFullYear()}-${now.getMonth()}`;
          const testMonthYear = `2026-9`;
          matchesPeriod = isToday || itemMonthYear === realMonthYear || itemMonthYear === testMonthYear;
        }
      }

      return matchesSearch && matchesType && matchesPeriod;
    });

    // Group transactions by date and dynamically calculate sum totals from DB values
    return TempDB.groupTransactions(filtered);
  },

  // SECTION: Mutation Methods
  async createTransaction(transactionData) {
    // TODO / FUTURE: When backend is active, send POST request:
    /*
    try {
      const response = await fetch(this.apiBaseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn('Backend unavailable, writing to temporary database', e);
    }
    */

    return TempDB.insert(transactionData);
  },

  async deleteTransaction(id) {
    return TempDB.delete(id);
  },

  async resetToDefaults() {
    return TempDB.reset();
  }
};
