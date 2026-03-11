const express = require('express');
const Watchlist = require('../models/Watchlist');
const Stock = require('../models/Stock');
const { protect } = require('../middleware/auth');
const { validateWatchlist } = require('../middleware/validation');
const {
  sendSuccessResponse,
  sendErrorResponse
} = require('../utils/helpers');

const router = express.Router();

// @route   GET /api/watchlist
// @desc    Get user's watchlist
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let watchlist = await Watchlist.findOne({ user: req.user._id })
      .populate('stocks.stock', 'symbol name currentPrice previousClose dayHigh dayLow volume sector');
    
    if (!watchlist) {
      // Create empty watchlist if it doesn't exist
      watchlist = new Watchlist({ user: req.user._id, stocks: [] });
      await watchlist.save();
    }
    
    // Calculate price changes for each stock
    const watchlistWithChanges = watchlist.stocks.map(item => {
      const stock = item.stock;
      const priceChange = stock.currentPrice - stock.previousClose;
      const priceChangePercent = stock.previousClose > 0 ? 
        (priceChange / stock.previousClose * 100) : 0;
      
      return {
        id: item._id,
        stock: {
          id: stock._id,
          symbol: stock.symbol,
          name: stock.name,
          currentPrice: stock.currentPrice,
          previousClose: stock.previousClose,
          dayHigh: stock.dayHigh,
          dayLow: stock.dayLow,
          volume: stock.volume,
          sector: stock.sector
        },
        addedAt: item.addedAt,
        notes: item.notes,
        alertPrice: item.alertPrice,
        alertType: item.alertType,
        priceChange,
        priceChangePercent,
        isAlertTriggered: item.alertType !== 'none' && item.alertPrice && 
          ((item.alertType === 'above' && stock.currentPrice >= item.alertPrice) ||
           (item.alertType === 'below' && stock.currentPrice <= item.alertPrice))
      };
    });
    
    // Sort by added date (newest first)
    watchlistWithChanges.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
    
    sendSuccessResponse(res, 200, 'Watchlist retrieved successfully', { 
      watchlist: watchlistWithChanges 
    });
    
  } catch (error) {
    console.error('Get watchlist error:', error);
    sendErrorResponse(res, 500, 'Server error while fetching watchlist', error);
  }
});

// @route   POST /api/watchlist/add
// @desc    Add stock to watchlist
// @access  Private
router.post('/add', protect, validateWatchlist, async (req, res) => {
  try {
    const { stock: stockId, notes, alertPrice, alertType } = req.body;
    
    // Validate stock exists
    const stock = await Stock.findById(stockId);
    if (!stock || !stock.isActive) {
      return sendErrorResponse(res, 404, 'Stock not found or inactive');
    }
    
    // Get or create watchlist
    let watchlist = await Watchlist.findOne({ user: req.user._id });
    if (!watchlist) {
      watchlist = new Watchlist({ user: req.user._id, stocks: [] });
    }
    
    // Check if stock is already in watchlist
    const existingStock = watchlist.stocks.find(
      s => s.stock.toString() === stockId.toString()
    );
    
    if (existingStock) {
      return sendErrorResponse(res, 400, 'Stock is already in your watchlist');
    }
    
    // Add stock to watchlist
    watchlist.stocks.push({
      stock: stockId,
      notes: notes || '',
      alertPrice: alertPrice || null,
      alertType: alertType || 'none'
    });
    
    await watchlist.save();
    
    // Populate stock details for response
    await watchlist.populate('stocks.stock', 'symbol name currentPrice previousClose sector');
    
    const addedItem = watchlist.stocks[watchlist.stocks.length - 1];
    const stockData = addedItem.stock;
    const priceChange = stockData.currentPrice - stockData.previousClose;
    const priceChangePercent = stockData.previousClose > 0 ? 
      (priceChange / stockData.previousClose * 100) : 0;
    
    const responseItem = {
      id: addedItem._id,
      stock: {
        id: stockData._id,
        symbol: stockData.symbol,
        name: stockData.name,
        currentPrice: stockData.currentPrice,
        previousClose: stockData.previousClose,
        sector: stockData.sector
      },
      addedAt: addedItem.addedAt,
      notes: addedItem.notes,
      alertPrice: addedItem.alertPrice,
      alertType: addedItem.alertType,
      priceChange,
      priceChangePercent
    };
    
    sendSuccessResponse(res, 201, 'Stock added to watchlist successfully', { 
      item: responseItem 
    });
    
  } catch (error) {
    console.error('Add to watchlist error:', error);
    sendErrorResponse(res, 500, 'Server error while adding stock to watchlist', error);
  }
});

// @route   DELETE /api/watchlist/:stockId
// @desc    Remove stock from watchlist
// @access  Private
router.delete('/:stockId', protect, async (req, res) => {
  try {
    const { stockId } = req.params;
    
    const watchlist = await Watchlist.findOne({ user: req.user._id });
    if (!watchlist) {
      return sendErrorResponse(res, 404, 'Watchlist not found');
    }
    
    // Find and remove stock
    const stockIndex = watchlist.stocks.findIndex(
      s => s.stock.toString() === stockId.toString()
    );
    
    if (stockIndex === -1) {
      return sendErrorResponse(res, 404, 'Stock not found in watchlist');
    }
    
    const removedItem = watchlist.stocks[stockIndex];
    watchlist.stocks.splice(stockIndex, 1);
    
    await watchlist.save();
    
    sendSuccessResponse(res, 200, 'Stock removed from watchlist successfully', {
      removedStockId: stockId
    });
    
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    sendErrorResponse(res, 500, 'Server error while removing stock from watchlist', error);
  }
});

// @route   PUT /api/watchlist/:stockId/alert
// @desc    Update price alert for watchlist item
// @access  Private
router.put('/:stockId/alert', protect, async (req, res) => {
  try {
    const { stockId } = req.params;
    const { alertPrice, alertType } = req.body;
    
    // Validate alert type
    if (alertType && !['above', 'below', 'none'].includes(alertType)) {
      return sendErrorResponse(res, 400, 'Invalid alert type');
    }
    
    const watchlist = await Watchlist.findOne({ user: req.user._id });
    if (!watchlist) {
      return sendErrorResponse(res, 404, 'Watchlist not found');
    }
    
    // Find stock in watchlist
    const watchlistItem = watchlist.stocks.find(
      s => s.stock.toString() === stockId.toString()
    );
    
    if (!watchlistItem) {
      return sendErrorResponse(res, 404, 'Stock not found in watchlist');
    }
    
    // Update alert
    watchlistItem.alertPrice = alertPrice || null;
    watchlistItem.alertType = alertType || 'none';
    
    await watchlist.save();
    
    sendSuccessResponse(res, 200, 'Price alert updated successfully', {
      stockId,
      alertPrice: watchlistItem.alertPrice,
      alertType: watchlistItem.alertType
    });
    
  } catch (error) {
    console.error('Update alert error:', error);
    sendErrorResponse(res, 500, 'Server error while updating price alert', error);
  }
});

// @route   PUT /api/watchlist/:stockId/notes
// @desc    Update notes for watchlist item
// @access  Private
router.put('/:stockId/notes', protect, async (req, res) => {
  try {
    const { stockId } = req.params;
    const { notes } = req.body;
    
    const watchlist = await Watchlist.findOne({ user: req.user._id });
    if (!watchlist) {
      return sendErrorResponse(res, 404, 'Watchlist not found');
    }
    
    // Find stock in watchlist
    const watchlistItem = watchlist.stocks.find(
      s => s.stock.toString() === stockId.toString()
    );
    
    if (!watchlistItem) {
      return sendErrorResponse(res, 404, 'Stock not found in watchlist');
    }
    
    // Update notes
    watchlistItem.notes = notes || '';
    
    await watchlist.save();
    
    sendSuccessResponse(res, 200, 'Notes updated successfully', {
      stockId,
      notes: watchlistItem.notes
    });
    
  } catch (error) {
    console.error('Update notes error:', error);
    sendErrorResponse(res, 500, 'Server error while updating notes', error);
  }
});

// @route   GET /api/watchlist/alerts
// @desc    Check for triggered price alerts
// @access  Private
router.get('/alerts/check', protect, async (req, res) => {
  try {
    const watchlist = await Watchlist.findOne({ user: req.user._id })
      .populate('stocks.stock', 'symbol name currentPrice');
    
    if (!watchlist || watchlist.stocks.length === 0) {
      return sendSuccessResponse(res, 200, 'No alerts found', { alerts: [] });
    }
    
    // Check for triggered alerts
    const alerts = await watchlist.checkAlerts();
    
    sendSuccessResponse(res, 200, 'Alerts checked successfully', { alerts });
    
  } catch (error) {
    console.error('Check alerts error:', error);
    sendErrorResponse(res, 500, 'Server error while checking alerts', error);
  }
});

// @route   GET /api/watchlist/stats
// @desc    Get watchlist statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const watchlist = await Watchlist.findOne({ user: req.user._id });
    
    if (!watchlist) {
      return sendSuccessResponse(res, 200, 'Watchlist stats retrieved successfully', {
        totalStocks: 0,
        activeAlerts: 0,
        sectors: []
      });
    }
    
    const totalStocks = watchlist.stocks.length;
    const activeAlerts = watchlist.stocks.filter(s => s.alertType !== 'none' && s.alertPrice).length;
    
    // Get sector distribution
    const watchlistWithStocks = await Watchlist.findOne({ user: req.user._id })
      .populate('stocks.stock', 'sector');
    
    const sectors = {};
    watchlistWithStocks.stocks.forEach(item => {
      const sector = item.stock.sector || 'Other';
      sectors[sector] = (sectors[sector] || 0) + 1;
    });
    
    const sectorList = Object.entries(sectors).map(([sector, count]) => ({
      sector,
      count,
      percentage: totalStocks > 0 ? (count / totalStocks * 100) : 0
    }));
    
    sendSuccessResponse(res, 200, 'Watchlist stats retrieved successfully', {
      totalStocks,
      activeAlerts,
      sectors: sectorList
    });
    
  } catch (error) {
    console.error('Get watchlist stats error:', error);
    sendErrorResponse(res, 500, 'Server error while fetching watchlist stats', error);
  }
});

module.exports = router;
