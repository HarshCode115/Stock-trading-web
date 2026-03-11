const express = require('express');
const Stock = require('../models/Stock');
const { protect, optionalAuth } = require('../middleware/auth');
const { validateStock } = require('../middleware/validation');
const {
  getPagination,
  getPagingData,
  sendSuccessResponse,
  sendErrorResponse
} = require('../utils/helpers');

const router = express.Router();

// @route   GET /api/stocks
// @desc    Get all stocks with pagination and filtering
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page, size, sector, search, sortBy, sortOrder } = req.query;
    
    const { limit, offset } = getPagination(page, size);
    
    // Build filter conditions
    const where = { isActive: true };
    
    if (sector) {
      where.sector = sector;
    }
    
    if (search) {
      where.$or = [
        { symbol: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort conditions
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.symbol = 1; // Default sort by symbol
    }
    
    const { count, rows } = await Stock.findAndCountAll({
      where,
      limit,
      offset,
      order: [sort],
      include: [{
        model: Stock,
        as: 'priceHistory',
        required: false
      }]
    });
    
    const response = getPagingData({ count, rows }, page, limit);
    
    sendSuccessResponse(res, 200, 'Stocks retrieved successfully', response);
    
  } catch (error) {
    console.error('Get stocks error:', error);
    sendErrorResponse(res, 500, 'Server error while fetching stocks', error);
  }
});

// @route   GET /api/stocks/:id
// @desc    Get stock by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    
    if (!stock) {
      return sendErrorResponse(res, 404, 'Stock not found');
    }
    
    if (!stock.isActive) {
      return sendErrorResponse(res, 404, 'Stock is not active');
    }
    
    sendSuccessResponse(res, 200, 'Stock retrieved successfully', { stock });
    
  } catch (error) {
    console.error('Get stock error:', error);
    sendErrorResponse(res, 500, 'Server error while fetching stock', error);
  }
});

// @route   GET /api/stocks/symbol/:symbol
// @desc    Get stock by symbol
// @access  Public
router.get('/symbol/:symbol', optionalAuth, async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const stock = await Stock.findOne({ symbol, isActive: true });
    
    if (!stock) {
      return sendErrorResponse(res, 404, 'Stock not found');
    }
    
    sendSuccessResponse(res, 200, 'Stock retrieved successfully', { stock });
    
  } catch (error) {
    console.error('Get stock by symbol error:', error);
    sendErrorResponse(res, 500, 'Server error while fetching stock', error);
  }
});

// @route   GET /api/stocks/sectors
// @desc    Get all available sectors
// @access  Public
router.get('/sectors/list', async (req, res) => {
  try {
    const sectors = await Stock.distinct('sector', { isActive: true });
    
    sendSuccessResponse(res, 200, 'Sectors retrieved successfully', { sectors });
    
  } catch (error) {
    console.error('Get sectors error:', error);
    sendErrorResponse(res, 500, 'Server error while fetching sectors', error);
  }
});

// @route   GET /api/stocks/trending
// @desc    Get trending stocks (most traded)
// @access  Public
router.get('/trending/list', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const trendingStocks = await Stock.find({ isActive: true })
      .sort({ volume: -1 })
      .limit(parseInt(limit));
    
    sendSuccessResponse(res, 200, 'Trending stocks retrieved successfully', { 
      stocks: trendingStocks 
    });
    
  } catch (error) {
    console.error('Get trending stocks error:', error);
    sendErrorResponse(res, 500, 'Server error while fetching trending stocks', error);
  }
});

// @route   GET /api/stocks/gainers
// @desc    Get top gainers
// @access  Public
router.get('/gainers/list', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const stocks = await Stock.find({ isActive: true });
    
    // Calculate price change percentage and sort
    const gainers = stocks
      .map(stock => ({
        ...stock.toObject(),
        priceChangePercent: ((stock.currentPrice - stock.previousClose) / stock.previousClose * 100)
      }))
      .filter(stock => stock.priceChangePercent > 0)
      .sort((a, b) => b.priceChangePercent - a.priceChangePercent)
      .slice(0, parseInt(limit));
    
    sendSuccessResponse(res, 200, 'Top gainers retrieved successfully', { stocks: gainers });
    
  } catch (error) {
    console.error('Get gainers error:', error);
    sendErrorResponse(res, 500, 'Server error while fetching gainers', error);
  }
});

// @route   GET /api/stocks/losers
// @desc    Get top losers
// @access  Public
router.get('/losers/list', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const stocks = await Stock.find({ isActive: true });
    
    // Calculate price change percentage and sort
    const losers = stocks
      .map(stock => ({
        ...stock.toObject(),
        priceChangePercent: ((stock.currentPrice - stock.previousClose) / stock.previousClose * 100)
      }))
      .filter(stock => stock.priceChangePercent < 0)
      .sort((a, b) => a.priceChangePercent - b.priceChangePercent)
      .slice(0, parseInt(limit));
    
    sendSuccessResponse(res, 200, 'Top losers retrieved successfully', { stocks: losers });
    
  } catch (error) {
    console.error('Get losers error:', error);
    sendErrorResponse(res, 500, 'Server error while fetching losers', error);
  }
});

// @route   GET /api/stocks/:id/history
// @desc    Get stock price history
// @access  Public
router.get('/:id/history', async (req, res) => {
  try {
    const { period = '1M' } = req.query;
    
    const stock = await Stock.findById(req.params.id);
    
    if (!stock) {
      return sendErrorResponse(res, 404, 'Stock not found');
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
    
    const priceHistory = stock.priceHistory
      .filter(entry => entry.date >= startDate)
      .sort((a, b) => a.date - b.date);
    
    sendSuccessResponse(res, 200, 'Price history retrieved successfully', { 
      priceHistory,
      currentPrice: stock.currentPrice,
      symbol: stock.symbol
    });
    
  } catch (error) {
    console.error('Get price history error:', error);
    sendErrorResponse(res, 500, 'Server error while fetching price history', error);
  }
});

// @route   POST /api/stocks
// @desc    Create new stock (Admin only)
// @access  Private/Admin
router.post('/', protect, validateStock, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return sendErrorResponse(res, 403, 'Admin access required');
    }
    
    const {
      symbol,
      name,
      currentPrice,
      previousClose,
      openPrice,
      dayHigh,
      dayLow,
      volume,
      marketCap,
      sector,
      description
    } = req.body;
    
    // Check if stock already exists
    const existingStock = await Stock.findOne({ symbol: symbol.toUpperCase() });
    
    if (existingStock) {
      return sendErrorResponse(res, 400, 'Stock with this symbol already exists');
    }
    
    const stock = new Stock({
      symbol: symbol.toUpperCase(),
      name,
      currentPrice,
      previousClose,
      openPrice,
      dayHigh,
      dayLow,
      volume,
      marketCap,
      sector,
      description
    });
    
    await stock.save();
    
    sendSuccessResponse(res, 201, 'Stock created successfully', { stock });
    
  } catch (error) {
    console.error('Create stock error:', error);
    sendErrorResponse(res, 500, 'Server error while creating stock', error);
  }
});

// @route   PUT /api/stocks/:id
// @desc    Update stock (Admin only)
// @access  Private/Admin
router.put('/:id', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return sendErrorResponse(res, 403, 'Admin access required');
    }
    
    const stock = await Stock.findById(req.params.id);
    
    if (!stock) {
      return sendErrorResponse(res, 404, 'Stock not found');
    }
    
    // Update stock fields
    const allowedFields = [
      'name', 'currentPrice', 'previousClose', 'openPrice', 
      'dayHigh', 'dayLow', 'volume', 'marketCap', 'sector', 'description', 'isActive'
    ];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        stock[field] = req.body[field];
      }
    });
    
    await stock.save();
    
    sendSuccessResponse(res, 200, 'Stock updated successfully', { stock });
    
  } catch (error) {
    console.error('Update stock error:', error);
    sendErrorResponse(res, 500, 'Server error while updating stock', error);
  }
});

// @route   DELETE /api/stocks/:id
// @desc    Delete stock (Admin only)
// @access  Private/Admin
router.delete('/:id', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return sendErrorResponse(res, 403, 'Admin access required');
    }
    
    const stock = await Stock.findById(req.params.id);
    
    if (!stock) {
      return sendErrorResponse(res, 404, 'Stock not found');
    }
    
    // Soft delete by setting isActive to false
    stock.isActive = false;
    await stock.save();
    
    sendSuccessResponse(res, 200, 'Stock deleted successfully');
    
  } catch (error) {
    console.error('Delete stock error:', error);
    sendErrorResponse(res, 500, 'Server error while deleting stock', error);
  }
});

module.exports = router;
