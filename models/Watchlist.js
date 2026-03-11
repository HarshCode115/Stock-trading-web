const mongoose = require('mongoose');

const WatchlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  stocks: [{
    stock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stock',
      required: [true, 'Stock ID is required']
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      maxlength: [100, 'Notes cannot exceed 100 characters']
    },
    alertPrice: {
      type: Number,
      min: [0, 'Alert price cannot be negative']
    },
    alertType: {
      type: String,
      enum: ['above', 'below', 'none'],
      default: 'none'
    }
  }]
}, {
  timestamps: true
});

// Method to add stock to watchlist
WatchlistSchema.methods.addStock = function(stockId, notes = '', alertPrice = null, alertType = 'none') {
  // Check if stock is already in watchlist
  const existingStock = this.stocks.find(
    s => s.stock.toString() === stockId.toString()
  );
  
  if (existingStock) {
    throw new Error('Stock is already in watchlist');
  }
  
  this.stocks.push({
    stock: stockId,
    notes: notes,
    alertPrice: alertPrice,
    alertType: alertType
  });
  
  return this.save();
};

// Method to remove stock from watchlist
WatchlistSchema.methods.removeStock = function(stockId) {
  const stockIndex = this.stocks.findIndex(
    s => s.stock.toString() === stockId.toString()
  );
  
  if (stockIndex === -1) {
    throw new Error('Stock not found in watchlist');
  }
  
  this.stocks.splice(stockIndex, 1);
  return this.save();
};

// Method to update stock alert
WatchlistSchema.methods.updateAlert = function(stockId, alertPrice, alertType) {
  const stock = this.stocks.find(
    s => s.stock.toString() === stockId.toString()
  );
  
  if (!stock) {
    throw new Error('Stock not found in watchlist');
  }
  
  stock.alertPrice = alertPrice;
  stock.alertType = alertType;
  
  return this.save();
};

// Method to check for price alerts
WatchlistSchema.methods.checkAlerts = async function() {
  const Stock = mongoose.model('Stock');
  const alerts = [];
  
  for (const watchlistItem of this.stocks) {
    if (watchlistItem.alertType === 'none' || !watchlistItem.alertPrice) {
      continue;
    }
    
    const stock = await Stock.findById(watchlistItem.stock);
    if (!stock) continue;
    
    const currentPrice = stock.currentPrice;
    const alertPrice = watchlistItem.alertPrice;
    const alertType = watchlistItem.alertType;
    
    if ((alertType === 'above' && currentPrice >= alertPrice) ||
        (alertType === 'below' && currentPrice <= alertPrice)) {
      alerts.push({
        stock: stock,
        currentPrice: currentPrice,
        alertPrice: alertPrice,
        alertType: alertType,
        message: `${stock.symbol} is ${alertType} your alert price of $${alertPrice.toFixed(2)}`
      });
    }
  }
  
  return alerts;
};

// Index for faster queries
WatchlistSchema.index({ user: 1 });
WatchlistSchema.index({ 'stocks.stock': 1 });

module.exports = mongoose.model('Watchlist', WatchlistSchema);
