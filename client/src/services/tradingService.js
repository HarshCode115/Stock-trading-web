import stockApiService from './stockApiService';

class TradingService {
  constructor() {
    this.portfolio = this.loadPortfolio();
    this.transactions = this.loadTransactions();
    this.watchlist = this.loadWatchlist();
    this.balance = this.loadBalance();
    this.listeners = new Set();
  }

  // Local storage helpers
  loadPortfolio() {
    try {
      const saved = localStorage.getItem('trading_portfolio');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading portfolio:', error);
      return [];
    }
  }

  savePortfolio(portfolio) {
    try {
      localStorage.setItem('trading_portfolio', JSON.stringify(portfolio));
    } catch (error) {
      console.error('Error saving portfolio:', error);
    }
  }

  loadTransactions() {
    try {
      const saved = localStorage.getItem('trading_transactions');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading transactions:', error);
      return [];
    }
  }

  saveTransactions(transactions) {
    try {
      localStorage.setItem('trading_transactions', JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  }

  loadWatchlist() {
    try {
      const saved = localStorage.getItem('trading_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading watchlist:', error);
      return [];
    }
  }

  saveWatchlist(watchlist) {
    try {
      localStorage.setItem('trading_watchlist', JSON.stringify(watchlist));
    } catch (error) {
      console.error('Error saving watchlist:', error);
    }
  }

  loadBalance() {
    try {
      const saved = localStorage.getItem('trading_balance');
      return saved ? parseFloat(saved) : 10000; // Default $10,000 virtual balance
    } catch (error) {
      console.error('Error loading balance:', error);
      return 10000;
    }
  }

  saveBalance(balance) {
    try {
      localStorage.setItem('trading_balance', balance.toString());
      this.notifyBalanceChange();
    } catch (error) {
      console.error('Error saving balance:', error);
    }
  }

  // Event listeners
  onBalanceChange(callback) {
    this.listeners.add(callback);
  }

  offBalanceChange(callback) {
    this.listeners.delete(callback);
  }

  notifyBalanceChange() {
    this.listeners.forEach(callback => {
      try {
        callback(this.balance);
      } catch (error) {
        console.error('Error in balance change listener:', error);
      }
    });
  }

  // Stock search
  async searchStocks(query) {
    try {
      return await stockApiService.searchStocks(query);
    } catch (error) {
      console.error('Error searching stocks:', error);
      throw error;
    }
  }

  // Get stock data
  async getStockData(symbol) {
    try {
      return await stockApiService.getStockData(symbol);
    } catch (error) {
      console.error('Error getting stock data:', error);
      throw error;
    }
  }

  // Get all stocks
  async getAllStocks() {
    try {
      return await stockApiService.getAllStocks();
    } catch (error) {
      console.error('Error getting all stocks:', error);
      throw error;
    }
  }

  // Buy stock
  async buyStock(symbol, quantity, orderType = 'market') {
    try {
      if (!symbol || !quantity || quantity <= 0) {
        throw new Error('Symbol and quantity are required');
      }

      const stockData = await stockApiService.getStockData(symbol);
      const totalCost = stockData.price * quantity;

      if (this.balance < totalCost) {
        throw new Error(`Insufficient balance. Need $${totalCost.toFixed(2)}, have $${this.balance.toFixed(2)}`);
      }

      // Create transaction
      const transaction = {
        id: Date.now().toString(),
        symbol: symbol.toUpperCase(),
        name: stockData.name,
        type: 'buy',
        orderType,
        quantity,
        price: stockData.price,
        totalCost,
        timestamp: new Date().toISOString(),
        status: 'completed'
      };

      // Update portfolio
      const existingHolding = this.portfolio.find(holding => holding.symbol === symbol.toUpperCase());
      if (existingHolding) {
        // Update existing holding
        const totalShares = existingHolding.quantity + quantity;
        const totalCostBasis = (existingHolding.averagePrice * existingHolding.quantity) + totalCost;
        existingHolding.quantity = totalShares;
        existingHolding.averagePrice = totalCostBasis / totalShares;
      } else {
        // Add new holding
        this.portfolio.push({
          symbol: symbol.toUpperCase(),
          name: stockData.name,
          quantity,
          averagePrice: stockData.price,
          currentPrice: stockData.price,
          totalValue: totalCost
        });
      }

      // Update balance and save
      this.balance -= totalCost;
      this.transactions.unshift(transaction);
      this.savePortfolio(this.portfolio);
      this.saveTransactions(this.transactions);
      this.saveBalance(this.balance);

      return {
        success: true,
        transaction,
        newBalance: this.balance,
        message: `Successfully bought ${quantity} shares of ${symbol} at $${stockData.price.toFixed(2)}`
      };
    } catch (error) {
      console.error('Error buying stock:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Sell stock
  async sellStock(symbol, quantity, orderType = 'market') {
    try {
      if (!symbol || !quantity || quantity <= 0) {
        throw new Error('Symbol and quantity are required');
      }

      const holding = this.portfolio.find(h => h.symbol === symbol.toUpperCase());
      if (!holding) {
        throw new Error(`You don't own any shares of ${symbol}`);
      }

      if (holding.quantity < quantity) {
        throw new Error(`Insufficient shares. You own ${holding.quantity} shares, trying to sell ${quantity}`);
      }

      const stockData = await stockApiService.getStockData(symbol);
      const totalRevenue = stockData.price * quantity;

      // Create transaction
      const transaction = {
        id: Date.now().toString(),
        symbol: symbol.toUpperCase(),
        name: stockData.name,
        type: 'sell',
        orderType,
        quantity,
        price: stockData.price,
        totalRevenue,
        timestamp: new Date().toISOString(),
        status: 'completed'
      };

      // Update portfolio
      const remainingQuantity = holding.quantity - quantity;
      if (remainingQuantity === 0) {
        // Remove holding completely
        this.portfolio = this.portfolio.filter(h => h.symbol !== symbol.toUpperCase());
      } else {
        // Update holding
        holding.quantity = remainingQuantity;
        holding.currentPrice = stockData.price;
        holding.totalValue = remainingQuantity * stockData.price;
      }

      // Update balance and save
      this.balance += totalRevenue;
      this.transactions.unshift(transaction);
      this.savePortfolio(this.portfolio);
      this.saveTransactions(this.transactions);
      this.saveBalance(this.balance);

      return {
        success: true,
        transaction,
        newBalance: this.balance,
        message: `Successfully sold ${quantity} shares of ${symbol} at $${stockData.price.toFixed(2)}`
      };
    } catch (error) {
      console.error('Error selling stock:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get portfolio
  getPortfolio() {
    return this.portfolio.map(holding => {
      const currentValue = holding.quantity * holding.currentPrice;
      const costBasis = holding.quantity * holding.averagePrice;
      const profitLoss = currentValue - costBasis;
      const profitLossPercent = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0;

      return {
        ...holding,
        currentValue,
        costBasis,
        profitLoss,
        profitLossPercent
      };
    });
  }

  // Get portfolio summary
  getPortfolioSummary() {
    const portfolio = this.getPortfolio();
    const totalValue = portfolio.reduce((sum, holding) => sum + holding.currentValue, 0);
    const totalCost = portfolio.reduce((sum, holding) => sum + holding.costBasis, 0);
    const totalProfitLoss = totalValue - totalCost;
    const totalProfitLossPercent = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;

    return {
      totalValue,
      totalCost,
      totalProfitLoss,
      totalProfitLossPercent,
      holdings: portfolio.length,
      balance: this.balance
    };
  }

  // Get transactions
  getTransactions(limit = 50) {
    return this.transactions.slice(0, limit);
  }

  // Add to watchlist
  addToWatchlist(symbol) {
    try {
      const stockData = stockApiService.getMockStockData(symbol);
      if (!stockData) {
        throw new Error('Stock not found');
      }

      if (!this.watchlist.find(item => item.symbol === symbol.toUpperCase())) {
        this.watchlist.push({
          symbol: symbol.toUpperCase(),
          name: stockData.name,
          addedAt: new Date().toISOString()
        });
        this.saveWatchlist(this.watchlist);
      }

      return { success: true, message: `${symbol} added to watchlist` };
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      return { success: false, error: error.message };
    }
  }

  // Remove from watchlist
  removeFromWatchlist(symbol) {
    try {
      this.watchlist = this.watchlist.filter(item => item.symbol !== symbol.toUpperCase());
      this.saveWatchlist(this.watchlist);
      return { success: true, message: `${symbol} removed from watchlist` };
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      return { success: false, error: error.message };
    }
  }

  // Get watchlist
  getWatchlist() {
    return this.watchlist;
  }

  // Get current balance
  getBalance() {
    return this.balance;
  }

  // Reset all data (for testing)
  resetData() {
    this.portfolio = [];
    this.transactions = [];
    this.watchlist = [];
    this.balance = 10000;
    this.savePortfolio(this.portfolio);
    this.saveTransactions(this.transactions);
    this.saveWatchlist(this.watchlist);
    this.saveBalance(this.balance);
  }

  // Get today's performance
  getTodayPerformance() {
    const today = new Date().toDateString();
    const todayTransactions = this.transactions.filter(t => 
      new Date(t.timestamp).toDateString() === today
    );

    const todayBuys = todayTransactions.filter(t => t.type === 'buy');
    const todaySells = todayTransactions.filter(t => t.type === 'sell');

    return {
      totalTransactions: todayTransactions.length,
      buys: todayBuys.length,
      sells: todaySells.length,
      totalBought: todayBuys.reduce((sum, t) => sum + t.totalCost, 0),
      totalSold: todaySells.reduce((sum, t) => sum + t.totalRevenue, 0)
    };
  }
}

const tradingService = new TradingService();
export default tradingService;
