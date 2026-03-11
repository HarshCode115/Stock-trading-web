import api from './api';

const watchlistService = {
  // Get user's watchlist
  getWatchlist: async () => {
    const response = await api.get('/watchlist');
    return response.data;
  },

  // Add stock to watchlist
  addToWatchlist: async (watchlistData) => {
    const response = await api.post('/watchlist/add', watchlistData);
    return response.data;
  },

  // Remove stock from watchlist
  removeFromWatchlist: async (stockId) => {
    const response = await api.delete(`/watchlist/${stockId}`);
    return response.data;
  },

  // Update price alert for watchlist item
  updatePriceAlert: async (stockId, alertData) => {
    const response = await api.put(`/watchlist/${stockId}/alert`, alertData);
    return response.data;
  },

  // Update notes for watchlist item
  updateWatchlistNotes: async (stockId, notesData) => {
    const response = await api.put(`/watchlist/${stockId}/notes`, notesData);
    return response.data;
  },

  // Check for triggered price alerts
  checkAlerts: async () => {
    const response = await api.get('/watchlist/alerts/check');
    return response.data;
  },

  // Get watchlist statistics
  getWatchlistStats: async () => {
    const response = await api.get('/watchlist/stats');
    return response.data;
  },
};

export default watchlistService;
