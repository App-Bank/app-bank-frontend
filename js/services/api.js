// SECTION: Backend API Configuration
const API_CONFIG = {
  baseUrl: 'http://127.0.0.1:8000',
  defaultTimezoneId: 1
};

// SECTION: Axios Instance
const apiClient = axios.create({
  baseURL: API_CONFIG.baseUrl,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 8000
});

// SECTION: Axios Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = sessionStorage.getItem('aura_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (_) {}
    return config;
  },
  (error) => Promise.reject(error)
);

// SECTION: Axios Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      ApiService.resetClientState();

      if (window.location.hash && !window.location.hash.includes('login')) {
        if (typeof window.showToast === 'function') {
          window.showToast('Sesión expirada. Por favor, inicia sesión.', 'error');
        }
        if (window.appRouter) {
          window.appRouter.navigate('/login');
        } else {
          window.location.hash = '#/login';
        }
      }
    }

    const data = error.response?.data;
    const errorDetail = (typeof data?.detail === 'string')
      ? data.detail
      : Array.isArray(data?.detail)
        ? data.detail.map(d => d.msg || d.message || JSON.stringify(d)).join(', ')
        : data?.message || error.message || 'Error de conexión con el backend';

    return Promise.reject(new Error(errorDetail));
  }
);

// SECTION: Backend API Service Client
const ApiService = {
  config: API_CONFIG,
  client: apiClient,

  getToken() {
    try {
      return sessionStorage.getItem('aura_token');
    } catch (_) {
      return null;
    }
  },

  setToken(token) {
    try {
      if (token) {
        sessionStorage.setItem('aura_token', token);
      } else {
        sessionStorage.removeItem('aura_token');
      }
    } catch (_) {}
  },

  async login(email, password) {
    this.resetClientState();
    const response = await apiClient.post('/auth/login', {
      email: (email || '').trim(),
      password: password || ''
    });
    const data = response.data;
    if (data && data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  },

  resetClientState() {
    this.setToken(null);
    try {
      sessionStorage.removeItem('aura_user');
      sessionStorage.removeItem('aura_user_name');
    } catch (_) {}
    if (typeof AppState !== 'undefined') {
      Object.assign(AppState, {
        user: null,
        userName: null,
        isAuthenticated: false,
        token: null,
        accountId: null,
        balance: null,
        lastTransfer: null
      });
    }
    if (typeof TransactionService !== 'undefined') {
      TransactionService.reset?.();
    }
  },

  logout() {
    this.resetClientState();
    if (window.appRouter) {
      window.appRouter.navigate('/login');
    } else {
      window.location.hash = '#/login';
    }
  },

  async getUser() {
    const response = await apiClient.get('/user/me');
    return response.data;
  },

  async getAccounts() {
    try {
      const response = await apiClient.get('/accounts/');
      return response.data;
    } catch (_) {
      try {
        const myAcc = await this.getAccount();
        return myAcc ? [myAcc] : [];
      } catch (err) {
        return [];
      }
    }
  },

  async getAccount() {
    const response = await apiClient.get('/accounts/me');
    if (response.data && typeof AppState !== 'undefined') {
      AppState.accountId = response.data.id != null ? Number(response.data.id) : null;
      AppState.balance = Number(response.data.balance) || 0;
    }
    return response.data;
  },

  async getAccountByIban(iban) {
    const clean = (iban || '').replace(/\s+/g, '').toUpperCase();
    const response = await apiClient.get(`/transfers/accounts/${clean}`);
    return response.data;
  },

  async getActivityHistory(params = {}) {
    const response = await apiClient.get('/activity', { params });
    return response.data;
  },

  async getActivities(params = {}) {
    return this.getActivityHistory(params);
  },

  async getTransferHistory() {
    const response = await apiClient.get('/transfers/history');
    return response.data;
  },

  async createTransfer(transferData) {
    const response = await apiClient.post('/transfers/', {
      recipient_account_id: Number(transferData.recipient_account_id),
      amount: parseFloat(transferData.amount),
      concept: transferData.concept || 'Transferencia',
      timezone_id: Number(transferData.timezone_id || API_CONFIG.defaultTimezoneId)
    });
    return response.data;
  }
};

window.ApiService = ApiService;
