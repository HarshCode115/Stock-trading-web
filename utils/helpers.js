// Generate JWT token
const generateToken = (id) => {
  return require('jsonwebtoken').sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Format currency
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Format percentage
const formatPercentage = (value, decimals = 2) => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

// Format large numbers
const formatLargeNumber = (num) => {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
};

// Calculate compound annual growth rate (CAGR)
const calculateCAGR = (beginningValue, endingValue, years) => {
  if (beginningValue <= 0 || endingValue <= 0 || years <= 0) {
    return 0;
  }
  return Math.pow(endingValue / beginningValue, 1 / years) - 1;
};

// Calculate moving average
const calculateMovingAverage = (prices, period) => {
  if (prices.length < period) {
    return null;
  }
  
  const sum = prices.slice(-period).reduce((acc, price) => acc + price, 0);
  return sum / period;
};

// Calculate exponential moving average
const calculateEMA = (prices, period) => {
  if (prices.length === 0) return null;
  
  const multiplier = 2 / (period + 1);
  let ema = prices[0];
  
  for (let i = 1; i < prices.length; i++) {
    ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
  }
  
  return ema;
};

// Calculate relative strength index (RSI)
const calculateRSI = (prices, period = 14) => {
  if (prices.length < period + 1) return null;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = 1; i <= period; i++) {
    const difference = prices[i] - prices[i - 1];
    if (difference >= 0) {
      gains += difference;
    } else {
      losses -= difference;
    }
  }
  
  const averageGain = gains / period;
  const averageLoss = losses / period;
  
  if (averageLoss === 0) return 100;
  
  const rs = averageGain / averageLoss;
  return 100 - (100 / (1 + rs));
};

// Generate random stock price (for simulation)
const generateRandomPrice = (basePrice, volatility = 0.02) => {
  const randomChange = (Math.random() - 0.5) * 2 * volatility;
  const newPrice = basePrice * (1 + randomChange);
  return Math.max(0.01, newPrice); // Ensure price doesn't go below 0.01
};

// Calculate portfolio metrics
const calculatePortfolioMetrics = (holdings, currentPrices) => {
  let totalValue = 0;
  let totalInvested = 0;
  let totalGainLoss = 0;
  
  const holdingDetails = holdings.map(holding => {
    const currentPrice = currentPrices[holding.stock.toString()] || holding.averageBuyPrice;
    const currentValue = holding.quantity * currentPrice;
    const gainLoss = currentValue - holding.totalInvested;
    const gainLossPercent = holding.totalInvested > 0 ? 
      (gainLoss / holding.totalInvested) * 100 : 0;
    
    totalValue += currentValue;
    totalInvested += holding.totalInvested;
    totalGainLoss += gainLoss;
    
    return {
      ...holding.toObject(),
      currentPrice,
      currentValue,
      gainLoss,
      gainLossPercent
    };
  });
  
  const totalGainLossPercent = totalInvested > 0 ? 
    (totalGainLoss / totalInvested) * 100 : 0;
  
  return {
    holdings: holdingDetails,
    totalValue,
    totalInvested,
    totalGainLoss,
    totalGainLossPercent
  };
};

// Pagination helper
const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page ? page * limit : 0;
  
  return { limit, offset };
};

// Pagination response helper
const getPagingData = (data, page, limit) => {
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(data.count / limit);
  
  return {
    totalItems: data.count,
    items: data.rows,
    totalPages,
    currentPage,
    hasNextPage: currentPage < totalPages - 1,
    hasPreviousPage: currentPage > 0
  };
};

// Error response helper
const sendErrorResponse = (res, statusCode, message, error = null) => {
  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: error?.message || error })
  };
  
  return res.status(statusCode).json(response);
};

// Success response helper
const sendSuccessResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message,
    ...(data && { data })
  };
  
  return res.status(statusCode).json(response);
};

module.exports = {
  generateToken,
  formatCurrency,
  formatPercentage,
  formatLargeNumber,
  calculateCAGR,
  calculateMovingAverage,
  calculateEMA,
  calculateRSI,
  generateRandomPrice,
  calculatePortfolioMetrics,
  getPagination,
  getPagingData,
  sendErrorResponse,
  sendSuccessResponse
};
