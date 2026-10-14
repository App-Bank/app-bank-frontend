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
    const { search = '', filter = 'all' } = params;
    const query = search.toLowerCase().trim();

    // Filter database records by search text and transaction type
    const filtered = allRecords.filter(item => {
      const matchesSearch = !query ||
        item.title.toLowerCase().includes(query) ||
        item.subtitle.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      const matchesType = filter === 'all' || item.type === filter;

      return matchesSearch && matchesType;
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
