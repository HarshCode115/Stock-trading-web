const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Stock = require('../models/Stock');

// Sample stock data
const sampleStocks = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    currentPrice: 178.50,
    previousClose: 175.80,
    openPrice: 176.20,
    dayHigh: 179.80,
    dayLow: 175.50,
    volume: 52340000,
    marketCap: 2800000000000,
    sector: 'Technology',
    description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.'
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    currentPrice: 378.90,
    previousClose: 375.20,
    openPrice: 376.50,
    dayHigh: 380.20,
    dayLow: 374.80,
    volume: 21450000,
    marketCap: 2815000000000,
    sector: 'Technology',
    description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.'
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    currentPrice: 139.80,
    previousClose: 138.20,
    openPrice: 138.50,
    dayHigh: 140.50,
    dayLow: 137.80,
    volume: 18920000,
    marketCap: 1760000000000,
    sector: 'Technology',
    description: 'Alphabet Inc. provides online advertising services in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America.'
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    currentPrice: 145.30,
    previousClose: 143.80,
    openPrice: 144.20,
    dayHigh: 146.80,
    dayLow: 143.50,
    volume: 41230000,
    marketCap: 1510000000000,
    sector: 'Consumer Goods',
    description: 'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions in North America and internationally.'
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    currentPrice: 248.90,
    previousClose: 252.30,
    openPrice: 250.80,
    dayHigh: 254.20,
    dayLow: 247.50,
    volume: 98760000,
    marketCap: 790000000000,
    sector: 'Technology',
    description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems in the United States, China, and internationally.'
  },
  {
    symbol: 'META',
    name: 'Meta Platforms, Inc.',
    currentPrice: 325.40,
    previousClose: 322.10,
    openPrice: 323.50,
    dayHigh: 327.80,
    dayLow: 321.20,
    volume: 15670000,
    marketCap: 835000000000,
    sector: 'Technology',
    description: 'Meta Platforms, Inc. develops products that enable people to connect and share with friends and family through mobile devices, personal computers, virtual reality headsets, and wearables worldwide.'
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    currentPrice: 485.60,
    previousClose: 478.20,
    openPrice: 480.50,
    dayHigh: 489.30,
    dayLow: 477.80,
    volume: 23450000,
    marketCap: 1200000000000,
    sector: 'Technology',
    description: 'NVIDIA Corporation provides graphics, and compute and networking solutions in the United States, Taiwan, China, and internationally.'
  },
  {
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    currentPrice: 148.70,
    previousClose: 147.20,
    openPrice: 147.80,
    dayHigh: 149.50,
    dayLow: 146.90,
    volume: 8230000,
    marketCap: 430000000000,
    sector: 'Finance',
    description: 'JPMorgan Chase & Co. operates as a financial services company worldwide.'
  },
  {
    symbol: 'JNJ',
    name: 'Johnson & Johnson',
    currentPrice: 162.40,
    previousClose: 161.80,
    openPrice: 162.00,
    dayHigh: 163.20,
    dayLow: 161.50,
    volume: 5430000,
    marketCap: 400000000000,
    sector: 'Healthcare',
    description: 'Johnson & Johnson researches and develops, manufactures, and sells pharmaceutical products and medical devices worldwide.'
  },
  {
    symbol: 'V',
    name: 'Visa Inc.',
    currentPrice: 248.30,
    previousClose: 246.80,
    openPrice: 247.50,
    dayHigh: 249.20,
    dayLow: 246.20,
    volume: 6780000,
    marketCap: 520000000000,
    sector: 'Finance',
    description: 'Visa Inc. operates as a payments technology company worldwide.'
  },
  {
    symbol: 'WMT',
    name: 'Walmart Inc.',
    currentPrice: 165.80,
    previousClose: 164.20,
    openPrice: 164.80,
    dayHigh: 166.50,
    dayLow: 163.90,
    volume: 7650000,
    marketCap: 440000000000,
    sector: 'Consumer Goods',
    description: 'Walmart Inc. engages in the operation of retail, wholesale, and other units worldwide.'
  },
  {
    symbol: 'PG',
    name: 'Procter & Gamble Co.',
    currentPrice: 155.60,
    previousClose: 154.80,
    openPrice: 155.20,
    dayHigh: 156.30,
    dayLow: 154.50,
    volume: 4560000,
    marketCap: 380000000000,
    sector: 'Consumer Goods',
    description: 'The Procter & Gamble Company provides branded consumer packaged goods worldwide.'
  },
  {
    symbol: 'UNH',
    name: 'UnitedHealth Group Incorporated',
    currentPrice: 523.40,
    previousClose: 520.80,
    openPrice: 521.50,
    dayHigh: 525.20,
    dayLow: 519.80,
    volume: 3450000,
    marketCap: 480000000000,
    sector: 'Healthcare',
    description: 'UnitedHealth Group Incorporated provides healthcare services and products in the United States.'
  },
  {
    symbol: 'HD',
    name: 'The Home Depot, Inc.',
    currentPrice: 334.70,
    previousClose: 332.50,
    openPrice: 333.20,
    dayHigh: 336.80,
    dayLow: 331.90,
    volume: 5670000,
    marketCap: 340000000000,
    sector: 'Consumer Goods',
    description: 'The Home Depot, Inc. operates as a home improvement retailer.'
  },
  {
    symbol: 'MA',
    name: 'Mastercard Incorporated',
    currentPrice: 398.50,
    previousClose: 395.80,
    openPrice: 396.50,
    dayHigh: 400.20,
    dayLow: 395.20,
    volume: 2340000,
    marketCap: 380000000000,
    sector: 'Finance',
    description: 'Mastercard Incorporated operates as a technology company worldwide.'
  }
];

// Generate price history for stocks
const generatePriceHistory = (currentPrice, days = 30) => {
  const history = [];
  let basePrice = currentPrice * 0.9; // Start 10% below current price
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Generate random price movement
    const volatility = 0.02; // 2% daily volatility
    const change = (Math.random() - 0.5) * 2 * volatility;
    basePrice = basePrice * (1 + change);
    
    // Ensure price doesn't go negative
    basePrice = Math.max(1, basePrice);
    
    const open = basePrice * (1 + (Math.random() - 0.5) * 0.01);
    const close = basePrice;
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    const volume = Math.floor(Math.random() * 50000000) + 1000000;
    
    history.push({
      date,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume
    });
  }
  
  return history;
};

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stock-trading');
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Stock.deleteMany({});
    await User.deleteMany({});

    // Create admin user
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const adminUser = new User({
      username: 'admin',
      email: 'admin@stocksim.com',
      password: hashedPassword,
      role: 'admin',
      profile: {
        firstName: 'Admin',
        lastName: 'User'
      }
    });
    await adminUser.save();

    // Create demo user
    console.log('Creating demo user...');
    const demoPassword = await bcrypt.hash('demo123', 12);
    const demoUser = new User({
      username: 'demo',
      email: 'demo@example.com',
      password: demoPassword,
      role: 'user',
      profile: {
        firstName: 'Demo',
        lastName: 'User'
      }
    });
    await demoUser.save();

    // Create stocks with price history
    console.log('Creating stocks...');
    for (const stockData of sampleStocks) {
      const stock = new Stock({
        ...stockData,
        priceHistory: generatePriceHistory(stockData.currentPrice)
      });
      await stock.save();
      console.log(`Created stock: ${stockData.symbol}`);
    }

    console.log('Database seeded successfully!');
    console.log('\n=== Login Credentials ===');
    console.log('Admin User:');
    console.log('  Email: admin@stocksim.com');
    console.log('  Password: admin123');
    console.log('\nDemo User:');
    console.log('  Email: demo@example.com');
    console.log('  Password: demo123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function
seedDatabase();
