import api from './api';

const portfolioService = {
  // Get user's portfolio
  getPortfolio: async () => {
    const response = await api.get('/portfolio');
    return response.data;
  },

  // Get portfolio summary
  getPortfolioSummary: async () => {
    const response = await api.get('/portfolio/summary');
    return response.data;
  },

  // Get detailed holdings
  getHoldings: async () => {
    const response = await api.get('/portfolio/holdings');
    return response.data;
  },

  // Get portfolio performance data
  getPerformance: async (period = '1M') => {
    const response = await api.get('/portfolio/performance', { 
      params: { period } 
    });
    return response.data;
  },

  // Get portfolio allocation by sector
  getAllocation: async () => {
    const response = await api.get('/portfolio/allocation');
    return response.data;
  },

  // Get diversification metrics
  getDiversification: async () => {
    const response = await api.get('/portfolio/diversification');
    return response.data;
  },
};

export default portfolioService;
