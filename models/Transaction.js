const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  stock: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stock',
    required: [true, 'Stock ID is required']
  },
  type: {
    type: String,
    enum: ['buy', 'sell'],
    required: [true, 'Transaction type is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0.01, 'Price must be at least 0.01']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0.01, 'Total amount must be at least 0.01']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  executedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: [200, 'Notes cannot exceed 200 characters']
  },
  balanceBefore: {
    type: Number,
    required: [true, 'Balance before transaction is required']
  },
  balanceAfter: {
    type: Number,
    required: [true, 'Balance after transaction is required']
  }
}, {
  timestamps: true
});

// Virtual for profit/loss (only applicable for sell transactions)
TransactionSchema.virtual('profitLoss').get(function() {
  if (this.type === 'sell') {
    // This would need to reference the original buy price
    // For now, we'll calculate based on the transaction price
    return this.totalAmount; // This is a simplified calculation
  }
  return 0;
});

// Method to execute transaction
TransactionSchema.methods.execute = async function(userBalance) {
  const User = mongoose.model('User');
  const Portfolio = mongoose.model('Portfolio');
  
  try {
    const user = await User.findById(this.user);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user has sufficient balance for buy transactions
    if (this.type === 'buy' && user.virtualBalance < this.totalAmount) {
      this.status = 'failed';
      throw new Error('Insufficient balance');
    }

    // Get or create user portfolio
    let portfolio = await Portfolio.findOne({ user: this.user });
    if (!portfolio) {
      portfolio = new Portfolio({ user: this.user });
    }

    if (this.type === 'buy') {
      // Update user balance
      user.virtualBalance -= this.totalAmount;
      
      // Update portfolio
      await portfolio.updateHolding(this.stock, this.quantity, this.price, 'buy');
      
    } else if (this.type === 'sell') {
      // Check if user has sufficient holdings
      const holding = portfolio.holdings.find(
        h => h.stock.toString() === this.stock.toString()
      );
      
      if (!holding || holding.quantity < this.quantity) {
        this.status = 'failed';
        throw new Error('Insufficient holdings');
      }
      
      // Update user balance
      user.virtualBalance += this.totalAmount;
      
      // Update portfolio
      await portfolio.updateHolding(this.stock, this.quantity, this.price, 'sell');
    }

    // Save changes
    await user.save();
    await portfolio.calculatePortfolioValue();
    
    this.status = 'completed';
    this.balanceAfter = user.virtualBalance;
    
    return await this.save();
    
  } catch (error) {
    this.status = 'failed';
    await this.save();
    throw error;
  }
};

// Index for faster queries
TransactionSchema.index({ user: 1, executedAt: -1 });
TransactionSchema.index({ stock: 1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ type: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
