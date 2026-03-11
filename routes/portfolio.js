const express = require('express');
const Portfolio = require('../models/Portfolio');
const Stock = require('../models/Stock');
const { protect } = require('../middleware/auth');
const {
  sendSuccessResponse,
  sendErrorResponse,
  calculatePortfolioMetrics
} = require('../utils/helpers');

const router = express.Router();

// @route   GET /api/portfolio
// @desc    Get user's portfolio
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ user: req.user._id })
      .populate('holdings.stock', 'symbol name currentPrice sector');
    
    if (!portfolio) {
      // Create empty portfolio if it doesn't exist
      portfolio = new Portfolio({ user: req.user._id });
      await portfolio.save();
    }
    
    // Calculate current values and metrics
    const currentPrices = {};
    portfolio.holdings.forEach(holding => {
      if (holding.stock) {
        currentPrices[holding.stock._id.toString()] = holding.stock.currentPrice;
      }
    });
    
    const metrics = calculatePortfolioMetrics(portfolio.holdings, currentPrices);
    
    // Update portfolio with current values
    portfolio.totalValue = metrics.totalValue;
    portfolio.totalInvested = metrics.totalInvested;
    portfolio.totalGainLoss = metrics.totalGainLoss;
    portfolio.totalGainLossPercent = metrics.totalGainLossPercent;
    
    await portfolio.save();
    
    sendSuccessResponse(res, 200, 'Portfolio retrieved successfully', {
      portfolio: {
        ...portfolio.toObject(),
        holdings: metrics.holdings,
        totalValue: metrics.totalValue,
        totalInvested: metrics.totalInvested,
        totalGainLoss: metrics.totalGainLoss,
        totalGainLossPercent: metrics.totalGainLossPercent
      }
    });
    
  } catch (error) {
    console.error('Get portfolio error:', error);
    sendErrorResponse(res, 500, 'Server error while fetching portfolio', error);
  }
});

// @route   GET /api/portfolio/summary
// @desc    Get portfolio summary
// @access  Private
router.get('/summary', protect, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user._id });
    
    if (!portfolio) {
      return sendSuccessResponse(res, 200, 'Portfolio summary retrieved successfully', {
        totalValue: 0,
        totalInvested: 0,
        totalGainLoss: 0,
        totalGainLossPercent: 0,
        holdingsCount: 0
      });
    }
    
    // Calculate current portfolio value
    await portfolio.calculatePortfolioValue();
    
    const summary = {
      totalValue: portfolio.totalValue,
      totalInvested: portfolio.totalInvested,
      totalGainLoss: portfolio.totalGainLoss,
      totalGainLossPercent: portfolio.totalGainLossPercent,
      holdingsCount: portfolio.holdings.length
    };
    
    sendSuccessResponse(res, 200, 'Portfolio summary retrieved successfully', { summary });
    
  } catch (error) {
    console.error('Get portfolio summary error:', error);
    sendErrorResponse(res, 500, 'Server error while fetching portfolio summary', error);
  }
});

// @route   GET /api/portfolio/holdings
// @desc    Get detailed holdings information
// @access  Private
router.get('/holdings', protect, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user._id })
      .populate('holdings.stock', 'symbol name currentPrice previousClose sector marketCap');
    
    if (!portfolio || portfolio.holdings.length === 0) {
      return sendSuccessResponse(res, 200, 'Holdings retrieved successfully', { holdings: [] });
    }
    
    // Calculate detailed metrics for each holding
    const detailedHoldings = portfolio.holdings.map(holding => {
      const stock = holding.stock;
      const currentValue = holding.quantity * stock.currentPrice;
      const gainLoss = currentValue - holding.totalInvested;
      const gainLossPercent = holding.totalInvested > 0 ? 
        (gainLoss / holding.totalInvested * 100) : 0;
      
      const dayGainLoss = holding.quantity * (stock.currentPrice - stock.previousClose);
      const dayGainLossPercent = stock.previousClose > 0 ? 
        ((stock.currentPrice - stock.previousClose) / stock.previousClose * 100) : 0;
      
      return {
        id: holding._id,
        stock: {
          id: stock._id,
          symbol: stock.symbol,
          name: stock.name,
          currentPrice: stock.currentPrice,
          previousClose: stock.previousClose,
          sector: stock.sector,
          marketCap: stock.marketCap
        },
        quantity: holding.quantity,
        averageBuyPrice: holding.averageBuyPrice,
        totalInvested: holding.totalInvested,
        currentValue,
        gainLoss,
        gainLossPercent,
        dayGainLoss,
        dayGainLossPercent,
        firstPurchaseDate: holding.firstPurchaseDate,
        lastUpdated: holding.lastUpdated
      };
    });
    
    // Sort by current value (descending)
    detailedHoldings.sort((a, b) => b.currentValue - a.currentValue);
    
    sendSuccessResponse(res, 200, 'Holdings retrieved successfully', { 
      holdings: detailedHoldings 
    });
    
  } catch (error) {
    console.error('Get holdings error:', error);
    sendErrorResponse(res, 500, 'Server error while fetching holdings', error);
  }
});

// @route   GET /api/portfolio/performance
// @desc    Get portfolio performance metrics
// @access  Private
router.get('/performance', protect, async (req, res) => {
  try {
    const { period = '1M' } = req.query;
    
    const portfolio = await Portfolio.findOne({ user: req.user._id })
      .populate('holdings.stock', 'symbol name currentPrice priceHistory');
    
    if (!portfolio || portfolio.holdings.length === 0) {
      return sendSuccessResponse(res, 200, 'Performance data retrieved successfully', {
        performance: [],
        totalReturn: 0,
        totalReturnPercent: 0
      });
    }
    
    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '1D':
        startDate.setDate(now.getDate() - 1);
        break;
      case '1W':
        startDate.setDate(now.getDate() - 7);
        break;
      case '1M':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6M':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1Y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }
    
    // Calculate portfolio value over time
    const performanceData = [];
    const totalInvested = portfolio.totalInvested;
    
    // For simplicity, we'll calculate based on current holdings
    // In a real app, you'd track historical portfolio values
    portfolio.holdings.forEach(holding => {
      const stock = holding.stock;
      const historicalData = stock.priceHistory
        .filter(entry => entry.date >= startDate)
        .sort((a, b) => a.date - b.date);
      
      historicalData.forEach(entry => {
        const date = entry.date.toISOString().split('T')[0];
        const value = holding.quantity * entry.close;
        
        const existingEntry = performanceData.find(p => p.date === date);
        if (existingEntry) {
          existingEntry.value += value;
        } else {
          performanceData.push({
            date,
            value,
            invested: totalInvested
          });
        }
      });
    });
    
    // Sort by date
    performanceData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calculate returns
    const currentValue = portfolio.totalValue;
    const totalReturn = currentValue - totalInvested;
    const totalReturnPercent = totalInvested > 0 ? 
      (totalReturn / totalInvested * 100) : 0;
    
    sendSuccessResponse(res, 200, 'Performance data retrieved successfully', {
      performance: performanceData,
      totalReturn,
      totalReturnPercent,
      currentValue,
      totalInvested
    });
    
  } catch (error) {
    console.error('Get performance error:', error);
    sendErrorResponse(res, 500, 'Server error while fetching performance data', error);
  }
});

// @route   GET /api/portfolio/allocation
// @desc    Get portfolio allocation by sector
// @access  Private
router.get('/allocation', protect, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user._id })
      .populate('holdings.stock', 'symbol name currentPrice sector');
    
    if (!portfolio || portfolio.holdings.length === 0) {
      return sendSuccessResponse(res, 200, 'Allocation data retrieved successfully', {
        allocation: [],
        totalValue: 0
      });
    }
    
    // Calculate allocation by sector
    const sectorAllocation = {};
    let totalValue = 0;
    
    portfolio.holdings.forEach(holding => {
      const sector = holding.stock.sector || 'Other';
      const value = holding.quantity * holding.stock.currentPrice;
      
      if (!sectorAllocation[sector]) {
        sectorAllocation[sector] = {
          sector,
          value: 0,
          count: 0
        };
      }
      
      sectorAllocation[sector].value += value;
      sectorAllocation[sector].count += 1;
      totalValue += value;
    });
    
    // Convert to array and calculate percentages
    const allocation = Object.values(sectorAllocation).map(item => ({
      sector: item.sector,
      value: item.value,
      percentage: totalValue > 0 ? (item.value / totalValue * 100) : 0,
      count: item.count
    }));
    
    // Sort by value (descending)
    allocation.sort((a, b) => b.value - a.value);
    
    sendSuccessResponse(res, 200, 'Allocation data retrieved successfully', {
      allocation,
      totalValue
    });
    
  } catch (error) {
    console.error('Get allocation error:', error);
    sendErrorResponse(res, 500, 'Server error while fetching allocation data', error);
  }
});

// @route   GET /api/portfolio/diversification
// @desc    Get portfolio diversification metrics
// @access  Private
router.get('/diversification', protect, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user._id })
      .populate('holdings.stock', 'symbol name currentPrice sector');
    
    if (!portfolio || portfolio.holdings.length === 0) {
      return sendSuccessResponse(res, 200, 'Diversification data retrieved successfully', {
        metrics: {
          holdingsCount: 0,
          sectorsCount: 0,
          largestHoldingPercent: 0,
          sectorConcentration: 0,
          diversificationScore: 0
        }
      });
    }
    
    const totalValue = portfolio.totalValue;
    
    // Calculate diversification metrics
    const holdingsCount = portfolio.holdings.length;
    
    // Count unique sectors
    const sectors = new Set(portfolio.holdings.map(h => h.stock.sector || 'Other'));
    const sectorsCount = sectors.size;
    
    // Find largest holding
    const largestHolding = portfolio.holdings.reduce((max, holding) => {
      const value = holding.quantity * holding.stock.currentPrice;
      const maxValue = max.quantity * max.stock.currentPrice;
      return value > maxValue ? holding : max;
    });
    
    const largestHoldingValue = largestHolding.quantity * largestHolding.stock.currentPrice;
    const largestHoldingPercent = totalValue > 0 ? (largestHoldingValue / totalValue * 100) : 0;
    
    // Calculate sector concentration
    const sectorValues = {};
    portfolio.holdings.forEach(holding => {
      const sector = holding.stock.sector || 'Other';
      const value = holding.quantity * holding.stock.currentPrice;
      sectorValues[sector] = (sectorValues[sector] || 0) + value;
    });
    
    const largestSectorValue = Math.max(...Object.values(sectorValues));
    const sectorConcentration = totalValue > 0 ? (largestSectorValue / totalValue * 100) : 0;
    
    // Calculate diversification score (0-100)
    // Higher score = more diversified
    const holdingsScore = Math.min(holdingsCount / 20 * 50, 50); // Max 50 points for holdings
    const sectorsScore = Math.min(sectorsCount / 10 * 50, 50); // Max 50 points for sectors
    const concentrationPenalty = Math.min(sectorConcentration / 100 * 20, 20); // Penalty for concentration
    const largestHoldingPenalty = Math.min(largestHoldingPercent / 100 * 10, 10); // Penalty for large single holding
    
    const diversificationScore = Math.max(0, holdingsScore + sectorsScore - concentrationPenalty - largestHoldingPenalty);
    
    const metrics = {
      holdingsCount,
      sectorsCount,
      largestHoldingPercent,
      sectorConcentration,
      diversificationScore: Math.round(diversificationScore)
    };
    
    sendSuccessResponse(res, 200, 'Diversification data retrieved successfully', { metrics });
    
  } catch (error) {
    console.error('Get diversification error:', error);
    sendErrorResponse(res, 500, 'Server error while fetching diversification data', error);
  }
});

module.exports = router;
