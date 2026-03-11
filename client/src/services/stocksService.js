import api from './api';

const stocksService = {
  // Get all stocks with pagination and filtering
  getStocks: async (params = {}) => {
    const response = await api.get('/stocks', { params });
    return response.data;
  },

  // Get stock by ID
  getStockById: async (id) => {
    const response = await api.get(`/stocks/${id}`);
    return response.data;
  },

  // Get stock by symbol
  getStockBySymbol: async (symbol) => {
    const response = await api.get(`/stocks/symbol/${symbol}`);
    return response.data;
  },

  // Get stock price history
  getStockHistory: async (id, period = '1M') => {
    const response = await api.get(`/stocks/${id}/history`, { 
      params: { period } 
    });
    return response.data;
  },

  // Get trending stocks
  getTrendingStocks: async (limit = 10) => {
    const response = await api.get('/stocks/trending/list', { 
      params: { limit } 
    });
    return response.data;
  },

  // Get top gainers
  getTopGainers: async (limit = 10) => {
    const response = await api.get('/stocks/gainers/list', { 
      params: { limit } 
    });
    return response.data;
  },

  // Get top losers
  getTopLosers: async (limit = 10) => {
    const response = await api.get('/stocks/losers/list', { 
      params: { limit } 
    });
    return response.data;
  },

  // Get available sectors
  getSectors: async () => {
    const response = await api.get('/stocks/sectors/list');
    return response.data;
  },

  // Create new stock (admin only)
  createStock: async (stockData) => {
    const response = await api.post('/stocks', stockData);
    return response.data;
  },

  // Update stock (admin only)
  updateStock: async (id, stockData) => {
    const response = await api.put(`/stocks/${id}`, stockData);
    return response.data;
  },

  // Delete stock (admin only)
  deleteStock: async (id) => {
    const response = await api.delete(`/stocks/${id}`);
    return response.data;
  },
};

export default stocksService;
