// SECTION: Backend API Service Client
const API_CONFIG = {
  baseUrl: 'http://127.0.0.1:8000',
  defaultUserId: 1,
  defaultAccountId: 1,
  defaultTimezoneId: 1
};

const ApiService = {
  config: API_CONFIG,

  getClient() {
    if (typeof axios !== 'undefined') {
      return axios.create({
        baseURL: this.config.baseUrl,
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 8000
      });
    }
    return null;
  },

  async request(method, endpoint, data = null, options = {}) {
    const client = this.getClient();
    const url = `${this.config.baseUrl}${endpoint}`;

    if (client) {
      try {
        const response = await client({
          method,
          url: endpoint,
          data,
          ...options
        });
        return response.data;
      } catch (error) {
        const errorDetail = error.response?.data?.detail 
          || error.response?.data?.message 
          || error.message 
          || 'Error de conexión con el backend';
        console.warn(`[Axios API Error] ${method.toUpperCase()} ${endpoint}:`, errorDetail);
        throw new Error(errorDetail);
      }
    }

    try {
      const fetchOptions = {
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      };
      if (data && ['POST', 'PUT', 'PATCH'].includes(fetchOptions.method)) {
        fetchOptions.body = JSON.stringify(data);
      }
      const res = await fetch(url, fetchOptions);
      if (!res.ok) {
        let errBody = null;
        try { errBody = await res.json(); } catch (_) { errBody = { detail: res.statusText }; }
        throw new Error((errBody && (errBody.detail || errBody.message)) || `Error ${res.status}`);
      }
      if (res.status === 204) return null;
      return await res.json();
    } catch (err) {
      console.warn(`[API Fallback Error] ${method.toUpperCase()} ${url}:`, err.message);
      throw err;
    }
  },

  async checkHealth() {
    return this.request('get', '/');
  },

  async getUser(userId = API_CONFIG.defaultUserId) {
    return this.request('get', `/user/${userId}`);
  },

  async getAccounts() {
    return this.request('get', '/accounts/');
  },

  async getAccount(accountId = API_CONFIG.defaultAccountId) {
    return this.request('get', `/accounts/${accountId}`);
  },

  async getTimezones() {
    return this.request('get', '/timezones/');
  },

  async getTransferHistory() {
    return this.request('get', '/transfers/history');
  },

  async createTransfer(transferData) {
    return this.request('post', '/transfers/', {
      recipient_account_id: Number(transferData.recipient_account_id),
      amount: parseFloat(transferData.amount),
      concept: transferData.concept || 'Transferencia',
      timezone_id: Number(transferData.timezone_id || API_CONFIG.defaultTimezoneId)
    });
  },

  async getActivities(skip = 0, limit = 50) {
    return this.request('get', '/activity', null, { params: { skip, limit } });
  }
};

window.ApiService = ApiService;
window.api = ApiService;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiService;
}
