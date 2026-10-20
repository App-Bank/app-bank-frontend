// SECTION: Backend API Configuration
const API_CONFIG = {
  baseUrl: 'http://127.0.0.1:8000',
  defaultUserId: 1,
  defaultAccountId: 1,
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

// SECTION: Axios Interceptors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorDetail = error.response?.data?.detail 
      || error.response?.data?.message 
      || error.message 
      || 'Error de conexión con el backend';
    return Promise.reject(new Error(errorDetail));
  }
);

// SECTION: Backend API Service Client
const ApiService = {
  config: API_CONFIG,
  client: apiClient,

  async getUser(userId = API_CONFIG.defaultUserId) {
    const response = await apiClient.get(`/user/${userId}`);
    return response.data;
  },

  async getAccounts() {
    const response = await apiClient.get('/accounts/');
    return response.data;
  },

  async getAccount(accountId = API_CONFIG.defaultAccountId) {
    const response = await apiClient.get(`/accounts/${accountId}`);
    return response.data;
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
