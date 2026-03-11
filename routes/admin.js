const express = require('express');
const User = require('../models/User');
const Stock = require('../models/Stock');
const Transaction = require('../models/Transaction');
const Portfolio = require('../models/Portfolio');
const { protect, admin } = require('../middleware/auth');
const { validateStock } = require('../middleware/validation');
const {
  getPagination,
  getPagingData,
  sendSuccessResponse,
  sendErrorResponse
} = require('../utils/helpers');

const router = express.Router();

// Apply admin middleware to all routes
router.use(protect);
router.use(admin);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/dashboard', async (req, res) => {
  try {
    // Get basic statistics
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalStocks = await Stock.countDocuments({ isActive: true });
    const totalTransactions = await Transaction.countDocuments({ status: 'completed' });
    const totalPortfolios = await Portfolio.countDocuments();
    
    // Get transaction statistics
    const buyTransactions = await Transaction.countDocuments({ type: 'buy', status: 'completed' });
    const sellTransactions = await Transaction.countDocuments({ type: 'sell', status: 'completed' });
    
    // Calculate total volume
    const volumeAgg = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalVolume: { $sum: '$totalAmount' } } }
    ]);
    const totalVolume = volumeAgg.length > 0 ? volumeAgg[0].totalVolume : 0;
    
    // Get recent users
    const recentUsers = await User.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username email role virtualBalance createdAt');
    
    // Get recent transactions
    const recentTransactions = await Transaction.find({ status: 'completed' })
      .populate('user', 'username')
      .populate('stock', 'symbol name')
      .sort({ executedAt: -1 })
      .limit(10);
    
    // Get top stocks by volume
    const topStocks = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { 
          _id: '$stock', 
          totalVolume: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }},
      { $sort: { totalVolume: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'stocks', localField: '_id', foreignField: '_id', as: 'stockInfo' }},
      { $unwind: '$stockInfo' }
    ]);
    
    sendSuccessResponse(res, 200, 'Dashboard data retrieved successfully', {
      statistics: {
        totalUsers,
        totalStocks,
        totalTransactions,
        totalPortfolios,
        buyTransactions,
        sellTransactions,
        totalVolume
      },
      recentUsers,
      recentTransactions,
      topStocks
    });
    
  } catch (error) {
    console.error('Get dashboard error:', error);
    sendErrorResponse(res, 500, 'Server error while fetching dashboard data', error);
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const { page, size, search, role, isActive, sortBy, sortOrder } = req.query;
    
    const { limit, offset } = getPagination(page, size);
    
    // Build filter conditions
    const where = {};
    
    if (search) {
      where.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      where.role = role;
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    // Build sort conditions
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }
    
    const users = await User.find(where)
      .select('-password')
      .sort(sort)
      .limit(limit)
      .skip(offset);
    
    const total = await User.countDocuments(where);
    
    const response = getPagingData({ count: total, rows: users }, page, limit);
    
    sendSuccessResponse(res, 200, 'Users retrieved successfully', response);
    
  } catch (error) {
    console.error('Get users error:', error);
    sendErrorResponse(res, 500, 'Server error while fetching users', error);
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return sendErrorResponse(res, 404, 'User not found');
    }
    
    // Get user's portfolio
    const portfolio = await Portfolio.findOne({ user: req.params.id })
      .populate('holdings.stock', 'symbol name currentPrice');
    
    // Get user's recent transactions
    const transactions = await Transaction.find({ user: req.params.id })
      .populate('stock', 'symbol name')
      .sort({ executedAt: -1 })
      .limit(10);
    
    sendSuccessResponse(res, 200, 'User retrieved successfully', {
      user,
      portfolio,
      recentTransactions: transactions
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    sendErrorResponse(res, 500, 'Server error while fetching user', error);
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Private/Admin
router.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return sendErrorResponse(res, 404, 'User not found');
    }
    
    const allowedFields = [
      'username', 'email', 'role', 'virtualBalance', 'isActive', 'profile'
    ];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'profile') {
          user.profile = { ...user.profile, ...req.body[field] };
        } else {
          user[field] = req.body[field];
        }
      }
    });
    
    await user.save();
    
    sendSuccessResponse(res, 200, 'User updated successfully', { user });
    
  } catch (error) {
    console.error('Update user error:', error);
    sendErrorResponse(res, 500, 'Server error while updating user', error);
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Deactivate user
// @access  Private/Admin
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return sendErrorResponse(res, 404, 'User not found');
    }
    
    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString()) {
      return sendErrorResponse(res, 400, 'You cannot deactivate your own account');
    }
    
    user.isActive = false;
    await user.save();
    
    sendSuccessResponse(res, 200, 'User deactivated successfully');
    
  } catch (error) {
    console.error('Deactivate user error:', error);
    sendErrorResponse(res, 500, 'Server error while deactivating user', error);
  }
});

// @route   GET /api/admin/stocks
// @desc    Get all stocks for admin
// @access  Private/Admin
router.get('/stocks', async (req, res) => {
  try {
    const { page, size, search, sector, isActive, sortBy, sortOrder } = req.query;
    
    const { limit, offset } = getPagination(page, size);
    
    // Build filter conditions
    const where = {};
    
    if (search) {
      where.$or = [
        { symbol: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (sector) {
      where.sector = sector;
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    // Build sort conditions
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.symbol = 1;
    }
    
    const stocks = await Stock.find(where)
      .sort(sort)
      .limit(limit)
      .skip(offset);
    
    const total = await Stock.countDocuments(where);
    
    const response = getPagingData({ count: total, rows: stocks }, page, limit);
    
    sendSuccessResponse(res, 200, 'Stocks retrieved successfully', response);
    
  } catch (error) {
    console.error('Get admin stocks error:', error);
    sendErrorResponse(res, 500, 'Server error while fetching stocks', error);
  }
});

// @route   POST /api/admin/stocks
// @desc    Create new stock
// @access  Private/Admin
router.post('/stocks', validateStock, async (req, res) => {
  try {
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

// @route   PUT /api/admin/stocks/:id
// @desc    Update stock
// @access  Private/Admin
router.put('/stocks/:id', async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    
    if (!stock) {
      return sendErrorResponse(res, 404, 'Stock not found');
    }
    
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

// @route   DELETE /api/admin/stocks/:id
// @desc    Delete stock
// @access  Private/Admin
router.delete('/stocks/:id', async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    
    if (!stock) {
      return sendErrorResponse(res, 404, 'Stock not found');
    }
    
    // Check if stock has any transactions
    const transactionCount = await Transaction.countDocuments({ stock: req.params.id });
    
    if (transactionCount > 0) {
      // Soft delete instead of hard delete
      stock.isActive = false;
      await stock.save();
      
      sendSuccessResponse(res, 200, 'Stock deactivated successfully (has existing transactions)');
    } else {
      // Hard delete if no transactions exist
      await Stock.findByIdAndDelete(req.params.id);
      sendSuccessResponse(res, 200, 'Stock deleted successfully');
    }
    
  } catch (error) {
    console.error('Delete stock error:', error);
    sendErrorResponse(res, 500, 'Server error while deleting stock', error);
  }
});

// @route   GET /api/admin/transactions
// @desc    Get all transactions for admin
// @access  Private/Admin
router.get('/transactions', async (req, res) => {
  try {
    const { page, size, type, status, userId, sortBy, sortOrder } = req.query;
    
    const { limit, offset } = getPagination(page, size);
    
    // Build filter conditions
    const where = {};
    
    if (type) {
      where.type = type;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (userId) {
      where.user = userId;
    }
    
    // Build sort conditions
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.executedAt = -1;
    }
    
    const transactions = await Transaction.find(where)
      .populate('user', 'username email')
      .populate('stock', 'symbol name')
      .sort(sort)
      .limit(limit)
      .skip(offset);
    
    const total = await Transaction.countDocuments(where);
    
    const response = getPagingData({ count: total, rows: transactions }, page, limit);
    
    sendSuccessResponse(res, 200, 'Transactions retrieved successfully', response);
    
  } catch (error) {
    console.error('Get admin transactions error:', error);
    sendErrorResponse(res, 500, 'Server error while fetching transactions', error);
  }
});

// @route   GET /api/admin/analytics
// @desc    Get platform analytics
// @access  Private/Admin
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }
    
    // User analytics
    const newUsers = await User.countDocuments({ 
      createdAt: { $gte: startDate } 
    });
    
    const activeUsers = await User.distinct('_id', {
      lastLogin: { $gte: startDate }
    });
    
    // Transaction analytics
    const transactionStats = await Transaction.aggregate([
      { $match: { executedAt: { $gte: startDate }, status: 'completed' } },
      { $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalVolume: { $sum: '$totalAmount' },
          buyTransactions: {
            $sum: { $cond: [{ $eq: ['$type', 'buy'] }, 1, 0] }
          },
          sellTransactions: {
            $sum: { $cond: [{ $eq: ['$type', 'sell'] }, 1, 0] }
          }
        }
      }
    ]);
    
    // Top performing stocks
    const topStocks = await Transaction.aggregate([
      { $match: { executedAt: { $gte: startDate }, status: 'completed' } },
      { $group: {
          _id: '$stock',
          transactionCount: { $sum: 1 },
          totalVolume: { $sum: '$totalAmount' }
        }},
      { $sort: { totalVolume: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'stocks', localField: '_id', foreignField: '_id', as: 'stockInfo' }},
      { $unwind: '$stockInfo' }
    ]);
    
    // Daily transaction volume
    const dailyVolume = await Transaction.aggregate([
      { $match: { executedAt: { $gte: startDate }, status: 'completed' } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$executedAt' } },
          volume: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }},
      { $sort: { _id: 1 } }
    ]);
    
    const stats = transactionStats.length > 0 ? transactionStats[0] : {
      totalTransactions: 0,
      totalVolume: 0,
      buyTransactions: 0,
      sellTransactions: 0
    };
    
    sendSuccessResponse(res, 200, 'Analytics retrieved successfully', {
      period,
      userAnalytics: {
        newUsers,
        activeUsers: activeUsers.length
      },
      transactionAnalytics: stats,
      topStocks,
      dailyVolume
    });
    
  } catch (error) {
    console.error('Get analytics error:', error);
    sendErrorResponse(res, 500, 'Server error while fetching analytics', error);
  }
});

module.exports = router;
