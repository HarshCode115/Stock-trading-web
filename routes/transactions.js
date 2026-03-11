const express = require('express');
const Transaction = require('../models/Transaction');
const Stock = require('../models/Stock');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const { protect } = require('../middleware/auth');
const { validateTransaction } = require('../middleware/validation');
const {
  getPagination,
  getPagingData,
  sendSuccessResponse,
  sendErrorResponse
} = require('../utils/helpers');

const router = express.Router();

// @route   GET /api/transactions
// @desc    Get user's transaction history
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page, size, type, status, sortBy, sortOrder } = req.query;
    
    const { limit, offset } = getPagination(page, size);
    
    // Build filter conditions
    const where = { user: req.user._id };
    
    if (type) {
      where.type = type;
    }
    
    if (status) {
      where.status = status;
    }
    
    // Build sort conditions
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.executedAt = -1; // Default sort by execution date (newest first)
    }
    
    const transactions = await Transaction.find(where)
      .populate('stock', 'symbol name currentPrice')
      .sort(sort)
      .limit(limit)
      .skip(offset);
    
    const total = await Transaction.countDocuments(where);
    
    const response = getPagingData({ count: total, rows: transactions }, page, limit);
    
    sendSuccessResponse(res, 200, 'Transactions retrieved successfully', response);
    
  } catch (error) {
    console.error('Get transactions error:', error);
    sendErrorResponse(res, 500, 'Server error while fetching transactions', error);
  }
});

// @route   GET /api/transactions/:id
// @desc    Get transaction by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('stock', 'symbol name currentPrice')
      .populate('user', 'username email');
    
    if (!transaction) {
      return sendErrorResponse(res, 404, 'Transaction not found');
    }
    
    // Check if transaction belongs to user or user is admin
    if (transaction.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendErrorResponse(res, 403, 'Access denied');
    }
    
    sendSuccessResponse(res, 200, 'Transaction retrieved successfully', { transaction });
    
  } catch (error) {
    console.error('Get transaction error:', error);
    sendErrorResponse(res, 500, 'Server error while fetching transaction', error);
  }
});

// @route   POST /api/transactions/buy
// @desc    Execute buy transaction
// @access  Private
router.post('/buy', protect, validateTransaction, async (req, res) => {
  try {
    const { stock: stockId, quantity, price, notes } = req.body;
    
    // Get stock and validate
    const stock = await Stock.findById(stockId);
    if (!stock || !stock.isActive) {
      return sendErrorResponse(res, 404, 'Stock not found or inactive');
    }
    
    // Get user
    const user = await User.findById(req.user._id);
    if (!user) {
      return sendErrorResponse(res, 404, 'User not found');
    }
    
    // Calculate total amount
    const totalAmount = quantity * price;
    
    // Check if user has sufficient balance
    if (user.virtualBalance < totalAmount) {
      return sendErrorResponse(res, 400, 'Insufficient balance for this transaction');
    }
    
    // Create transaction
    const transaction = new Transaction({
      user: req.user._id,
      stock: stockId,
      type: 'buy',
      quantity,
      price,
      totalAmount,
      notes,
      balanceBefore: user.virtualBalance,
      status: 'pending'
    });
    
    try {
      // Execute transaction
      await transaction.execute(user.virtualBalance);
      
      // Populate stock details for response
      await transaction.populate('stock', 'symbol name currentPrice');
      
      sendSuccessResponse(res, 201, 'Buy transaction executed successfully', { 
        transaction,
        newBalance: user.virtualBalance - totalAmount
      });
      
    } catch (transactionError) {
      console.error('Transaction execution error:', transactionError);
      return sendErrorResponse(res, 400, transactionError.message);
    }
    
  } catch (error) {
    console.error('Buy transaction error:', error);
    sendErrorResponse(res, 500, 'Server error while processing buy transaction', error);
  }
});

// @route   POST /api/transactions/sell
// @desc    Execute sell transaction
// @access  Private
router.post('/sell', protect, validateTransaction, async (req, res) => {
  try {
    const { stock: stockId, quantity, price, notes } = req.body;
    
    // Get stock and validate
    const stock = await Stock.findById(stockId);
    if (!stock || !stock.isActive) {
      return sendErrorResponse(res, 404, 'Stock not found or inactive');
    }
    
    // Get user
    const user = await User.findById(req.user._id);
    if (!user) {
      return sendErrorResponse(res, 404, 'User not found');
    }
    
    // Get user's portfolio
    const portfolio = await Portfolio.findOne({ user: req.user._id });
    if (!portfolio) {
      return sendErrorResponse(res, 400, 'No portfolio found for user');
    }
    
    // Check if user has sufficient holdings
    const holding = portfolio.holdings.find(
      h => h.stock.toString() === stockId.toString()
    );
    
    if (!holding || holding.quantity < quantity) {
      return sendErrorResponse(res, 400, 'Insufficient holdings for this transaction');
    }
    
    // Calculate total amount
    const totalAmount = quantity * price;
    
    // Create transaction
    const transaction = new Transaction({
      user: req.user._id,
      stock: stockId,
      type: 'sell',
      quantity,
      price,
      totalAmount,
      notes,
      balanceBefore: user.virtualBalance,
      status: 'pending'
    });
    
    try {
      // Execute transaction
      await transaction.execute(user.virtualBalance);
      
      // Populate stock details for response
      await transaction.populate('stock', 'symbol name currentPrice');
      
      sendSuccessResponse(res, 201, 'Sell transaction executed successfully', { 
        transaction,
        newBalance: user.virtualBalance + totalAmount
      });
      
    } catch (transactionError) {
      console.error('Transaction execution error:', transactionError);
      return sendErrorResponse(res, 400, transactionError.message);
    }
    
  } catch (error) {
    console.error('Sell transaction error:', error);
    sendErrorResponse(res, 500, 'Server error while processing sell transaction', error);
  }
});

// @route   GET /api/transactions/summary
// @desc    Get transaction summary for user
// @access  Private
router.get('/summary/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get transaction statistics
    const totalTransactions = await Transaction.countDocuments({ 
      user: userId, 
      status: 'completed' 
    });
    
    const buyTransactions = await Transaction.countDocuments({ 
      user: userId, 
      type: 'buy', 
      status: 'completed' 
    });
    
    const sellTransactions = await Transaction.countDocuments({ 
      user: userId, 
      type: 'sell', 
      status: 'completed' 
    });
    
    // Calculate total invested and total returns
    const buyAgg = await Transaction.aggregate([
      { $match: { user: userId, type: 'buy', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const sellAgg = await Transaction.aggregate([
      { $match: { user: userId, type: 'sell', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const totalInvested = buyAgg.length > 0 ? buyAgg[0].total : 0;
    const totalReturns = sellAgg.length > 0 ? sellAgg[0].total : 0;
    const netProfit = totalReturns - totalInvested;
    
    // Get recent transactions
    const recentTransactions = await Transaction.find({ 
      user: userId, 
      status: 'completed' 
    })
      .populate('stock', 'symbol name')
      .sort({ executedAt: -1 })
      .limit(5);
    
    sendSuccessResponse(res, 200, 'Transaction summary retrieved successfully', {
      summary: {
        totalTransactions,
        buyTransactions,
        sellTransactions,
        totalInvested,
        totalReturns,
        netProfit,
        profitPercentage: totalInvested > 0 ? (netProfit / totalInvested * 100) : 0
      },
      recentTransactions
    });
    
  } catch (error) {
    console.error('Get transaction summary error:', error);
    sendErrorResponse(res, 500, 'Server error while fetching transaction summary', error);
  }
});

// @route   GET /api/transactions/stock/:stockId
// @desc    Get transactions for a specific stock
// @access  Private
router.get('/stock/:stockId', protect, async (req, res) => {
  try {
    const { stockId } = req.params;
    const { page, size } = req.query;
    
    const { limit, offset } = getPagination(page, size);
    
    // Validate stock exists
    const stock = await Stock.findById(stockId);
    if (!stock) {
      return sendErrorResponse(res, 404, 'Stock not found');
    }
    
    const where = { 
      user: req.user._id, 
      stock: stockId,
      status: 'completed'
    };
    
    const transactions = await Transaction.find(where)
      .sort({ executedAt: -1 })
      .limit(limit)
      .skip(offset);
    
    const total = await Transaction.countDocuments(where);
    
    const response = getPagingData({ count: total, rows: transactions }, page, limit);
    
    sendSuccessResponse(res, 200, 'Stock transactions retrieved successfully', response);
    
  } catch (error) {
    console.error('Get stock transactions error:', error);
    sendErrorResponse(res, 500, 'Server error while fetching stock transactions', error);
  }
});

// @route   CANCEL /api/transactions/:id/cancel
// @desc    Cancel pending transaction
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return sendErrorResponse(res, 404, 'Transaction not found');
    }
    
    // Check if transaction belongs to user
    if (transaction.user.toString() !== req.user._id.toString()) {
      return sendErrorResponse(res, 403, 'Access denied');
    }
    
    // Check if transaction can be cancelled
    if (transaction.status !== 'pending') {
      return sendErrorResponse(res, 400, 'Only pending transactions can be cancelled');
    }
    
    transaction.status = 'cancelled';
    await transaction.save();
    
    sendSuccessResponse(res, 200, 'Transaction cancelled successfully', { transaction });
    
  } catch (error) {
    console.error('Cancel transaction error:', error);
    sendErrorResponse(res, 500, 'Server error while cancelling transaction', error);
  }
});

module.exports = router;
