const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  holdings: [{
    stock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stock',
      required: [true, 'Stock ID is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative']
    },
    averageBuyPrice: {
      type: Number,
      required: [true, 'Average buy price is required'],
      min: [0, 'Average buy price cannot be negative']
    },
    totalInvested: {
      type: Number,
      required: [true, 'Total invested is required'],
      min: [0, 'Total invested cannot be negative']
    },
    firstPurchaseDate: {
      type: Date,
      default: Date.now
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  totalValue: {
    type: Number,
    default: 0,
    min: [0, 'Total value cannot be negative']
  },
  totalInvested: {
    type: Number,
    default: 0,
    min: [0, 'Total invested cannot be negative']
  },
  totalGainLoss: {
    type: Number,
    default: 0
  },
  totalGainLossPercent: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Method to update holding
PortfolioSchema.methods.updateHolding = async function(stockId, quantity, price, action) {
  const existingHoldingIndex = this.holdings.findIndex(
    holding => holding.stock.toString() === stockId.toString()
  );

  if (action === 'buy') {
    if (existingHoldingIndex !== -1) {
      // Update existing holding
      const existingHolding = this.holdings[existingHoldingIndex];
      const totalQuantity = existingHolding.quantity + quantity;
      const totalCost = (existingHolding.averageBuyPrice * existingHolding.quantity) + (price * quantity);
      
      this.holdings[existingHoldingIndex].quantity = totalQuantity;
      this.holdings[existingHoldingIndex].averageBuyPrice = totalCost / totalQuantity;
      this.holdings[existingHoldingIndex].totalInvested = totalCost;
      this.holdings[existingHoldingIndex].lastUpdated = new Date();
    } else {
      // Add new holding
      this.holdings.push({
        stock: stockId,
        quantity: quantity,
        averageBuyPrice: price,
        totalInvested: price * quantity,
        firstPurchaseDate: new Date(),
        lastUpdated: new Date()
      });
    }
  } else if (action === 'sell') {
    if (existingHoldingIndex !== -1) {
      const existingHolding = this.holdings[existingHoldingIndex];
      existingHolding.quantity -= quantity;
      existingHolding.lastUpdated = new Date();
      
      // Remove holding if quantity is zero
      if (existingHolding.quantity <= 0) {
        this.holdings.splice(existingHoldingIndex, 1);
      }
    }
  }
};

// Method to calculate portfolio value
PortfolioSchema.methods.calculatePortfolioValue = async function() {
  const Stock = mongoose.model('Stock');
  let totalValue = 0;
  let totalInvested = 0;

  for (const holding of this.holdings) {
    const stock = await Stock.findById(holding.stock);
    if (stock && stock.isActive) {
      totalValue += holding.quantity * stock.currentPrice;
      totalInvested += holding.totalInvested;
    }
  }

  this.totalValue = totalValue;
  this.totalInvested = totalInvested;
  this.totalGainLoss = totalValue - totalInvested;
  this.totalGainLossPercent = totalInvested > 0 ? 
    ((this.totalGainLoss / totalInvested) * 100) : 0;

  return this.save();
};

// Index for faster queries
PortfolioSchema.index({ user: 1 });

module.exports = mongoose.model('Portfolio', PortfolioSchema);
