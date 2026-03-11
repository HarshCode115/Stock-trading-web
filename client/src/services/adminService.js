import api from './api';

const adminService = {
  // Get admin dashboard data
  getDashboardData: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // User management
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  deactivateUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Stock management
  getStocks: async (params = {}) => {
    const response = await api.get('/admin/stocks', { params });
    return response.data;
  },

  createStock: async (stockData) => {
    const response = await api.post('/admin/stocks', stockData);
    return response.data;
  },

  updateStock: async (id, stockData) => {
    const response = await api.put(`/admin/stocks/${id}`, stockData);
    return response.data;
  },

  deleteStock: async (id) => {
    const response = await api.delete(`/admin/stocks/${id}`);
    return response.data;
  },

  // Transaction management
  getTransactions: async (params = {}) => {
    const response = await api.get('/admin/transactions', { params });
    return response.data;
  },

  // Analytics
  getAnalytics: async (period = '30d') => {
    const response = await api.get('/admin/analytics', { 
      params: { period } 
    });
    return response.data;
  },
};

export default adminService;
