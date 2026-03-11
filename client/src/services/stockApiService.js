// Free stock API service using comprehensive stock database
// Includes ~1000 stocks from various sectors

import { stocks, generateStockData, searchStocks as searchStockDatabase, getStockBySymbol } from '../data/stocks';

class StockApiService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds cache for demo
  }

  // Get stock data by symbol
  getMockStockData(symbol) {
    const stock = getStockBySymbol(symbol);
    if (!stock) {
      return null;
    }
    return generateStockData(stock);
  }

  // Search stocks by symbol or name
  async searchStocks(query) {
    if (!query || query.length < 1) {
      return [];
    }

    const results = searchStockDatabase(query);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    return results.slice(0, 20); // Return up to 20 results
  }

  // Get stock data by symbol
  async getStockData(symbol) {
    if (!symbol) {
      throw new Error('Stock symbol is required');
    }

    // Check cache first
    const cacheKey = symbol.toUpperCase();
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    // Get mock data
    const data = this.getMockStockData(symbol);
    if (!data) {
      throw new Error(`Stock ${symbol} not found`);
    }

    // Cache the result
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return data;
  }

  // Get multiple stocks data
  async getMultipleStocks(symbols) {
    if (!symbols || symbols.length === 0) {
      return [];
    }

    const promises = symbols.map(symbol => this.getStockData(symbol));
    const results = await Promise.allSettled(promises);

    return results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);
  }

  // Get all stocks (for admin/stocks page)
  async getAllStocks() {
    const allStocks = stocks.map(stock => generateStockData(stock));
    return allStocks;
  }

  // Get stocks by sector
  async getStocksBySector(sector) {
    const sectorStocks = stocks.filter(s => s.sector === sector);
    return sectorStocks.map(stock => generateStockData(stock));
  }

  // Get all sectors
  getSectors() {
    return [...new Set(stocks.map(s => s.sector))];
  }

  // Simulate real-time price updates
  startRealTimeUpdates(callback, symbols) {
    const interval = setInterval(async () => {
      try {
        const updatedStocks = await this.getMultipleStocks(symbols);
        callback(updatedStocks);
      } catch (error) {
        console.error('Real-time update error:', error);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }
}

const stockApiService = new StockApiService();
export default stockApiService;
