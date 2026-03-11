import api from './api';

const transactionsService = {
  // Get user's transactions
  getTransactions: async (params = {}) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  // Get transaction by ID
  getTransactionById: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  // Execute buy transaction
  buyStock: async (transactionData) => {
    const response = await api.post('/transactions/buy', transactionData);
    return response.data;
  },

  // Execute sell transaction
  sellStock: async (transactionData) => {
    const response = await api.post('/transactions/sell', transactionData);
    return response.data;
  },

  // Get transaction summary
  getTransactionSummary: async () => {
    const response = await api.get('/transactions/summary/stats');
    return response.data;
  },

  // Get transactions for a specific stock
  getStockTransactions: async (stockId, params = {}) => {
    const response = await api.get(`/transactions/stock/${stockId}`, { params });
    return response.data;
  },

  // Cancel pending transaction
  cancelTransaction: async (id) => {
    const response = await api.put(`/transactions/${id}/cancel`);
    return response.data;
  },
};

export default transactionsService;
