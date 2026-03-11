const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: [true, 'Stock symbol is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [10, 'Stock symbol cannot exceed 10 characters']
  },
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  currentPrice: {
    type: Number,
    required: [true, 'Current price is required'],
    min: [0, 'Price cannot be negative']
  },
  previousClose: {
    type: Number,
    required: [true, 'Previous close price is required'],
    min: [0, 'Price cannot be negative']
  },
  openPrice: {
    type: Number,
    required: [true, 'Open price is required'],
    min: [0, 'Price cannot be negative']
  },
  dayHigh: {
    type: Number,
    required: [true, 'Day high is required'],
    min: [0, 'Price cannot be negative']
  },
  dayLow: {
    type: Number,
    required: [true, 'Day low is required'],
    min: [0, 'Price cannot be negative']
  },
  volume: {
    type: Number,
    default: 0,
    min: [0, 'Volume cannot be negative']
  },
  marketCap: {
    type: Number,
    default: 0,
    min: [0, 'Market cap cannot be negative']
  },
  sector: {
    type: String,
    enum: [
      'Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer Goods',
      'Industrial', 'Real Estate', 'Utilities', 'Materials', 'Communication',
      'Other'
    ],
    default: 'Other'
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priceHistory: [{
    date: {
      type: Date,
      required: true
    },
    open: {
      type: Number,
      required: true,
      min: 0
    },
    high: {
      type: Number,
      required: true,
      min: 0
    },
    low: {
      type: Number,
      required: true,
      min: 0
    },
    close: {
      type: Number,
      required: true,
      min: 0
    },
    volume: {
      type: Number,
      default: 0,
      min: 0
    }
  }]
}, {
  timestamps: true
});

// Virtual for price change
StockSchema.virtual('priceChange').get(function() {
  return this.currentPrice - this.previousClose;
});

// Virtual for price change percentage
StockSchema.virtual('priceChangePercent').get(function() {
  if (this.previousClose === 0) return 0;
  return ((this.currentPrice - this.previousClose) / this.previousClose * 100).toFixed(2);
});

// Index for faster queries
StockSchema.index({ symbol: 1 });
StockSchema.index({ sector: 1 });
StockSchema.index({ isActive: 1 });

module.exports = mongoose.model('Stock', StockSchema);
