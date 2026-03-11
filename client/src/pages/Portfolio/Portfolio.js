import React, { useState, useEffect } from 'react';
import tradingService from '../../services/tradingService';
import useToast from '../../hooks/useToast';

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [balance, setBalance] = useState(0);
  const [selectedStock, setSelectedStock] = useState(null);
  const [sellQuantity, setSellQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [portfolioSummary, setPortfolioSummary] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    // Load initial data
    const currentPortfolio = tradingService.getPortfolio();
    const currentBalance = tradingService.getBalance();
    const summary = tradingService.getPortfolioSummary();
    
    setPortfolio(currentPortfolio);
    setBalance(currentBalance);
    setPortfolioSummary(summary);
    
    // Listen for balance changes
    tradingService.onBalanceChange((newBalance) => {
      setBalance(newBalance);
    });
  }, []);

  const handleSell = async () => {
    if (!selectedStock || sellQuantity <= 0) {
      showToast.error('Please select a stock and enter quantity');
      return;
    }

    setLoading(true);
    try {
      const result = await tradingService.sellStock(selectedStock.symbol, sellQuantity);
      if (result.success) {
        showToast.success(result.message);
        setSelectedStock(null);
        setSellQuantity(1);
        setPortfolio(tradingService.getPortfolio());
        setPortfolioSummary(tradingService.getPortfolioSummary());
      } else {
        showToast.error(result.error);
      }
    } catch (error) {
      showToast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Portfolio</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Balance: {formatCurrency(balance)}</span>
        </div>
      </div>

      {/* Portfolio Summary */}
      {portfolioSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Value</h3>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(portfolioSummary.totalValue)}
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Invested</h3>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(portfolioSummary.totalCost)}
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Profit/Loss</h3>
              <div className={`text-2xl font-bold ${
                portfolioSummary.totalProfitLoss >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {formatCurrency(portfolioSummary.totalProfitLoss)}
              </div>
              <div className={`text-sm mt-1 ${
                portfolioSummary.totalProfitLoss >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                ({formatPercentage(portfolioSummary.totalProfitLossPercent)})
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Holdings</h3>
              <div className="text-2xl font-bold text-gray-900">
                {portfolioSummary.holdings}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Holdings */}
      <div className="card">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Holdings</h2>
          
          {portfolio.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v-7a2 2 0 00-2-2H6a2 2 0 00-2 2v7" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No stocks in portfolio</h3>
              <p className="mt-1 text-sm text-gray-500">Start buying stocks to build your portfolio!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {portfolio.map((holding) => (
                <div key={holding.symbol} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-medium text-gray-900">{holding.symbol}</div>
                      <div className="text-sm text-gray-600">{holding.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(holding.currentValue)}
                      </div>
                      <div className={`text-sm ${
                        holding.profitLoss >= 0 ? 'text-success-600' : 'text-danger-600'
                      }`}>
                        {holding.profitLoss >= 0 ? '+' : ''}{formatCurrency(holding.profitLoss)}
                        ({formatPercentage(holding.profitLossPercent)})
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setSelectedStock(holding)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500"
                    >
                      Sell
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Shares:</span>
                      <span className="font-medium">{holding.quantity}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Avg Price:</span>
                      <span className="font-medium">{formatCurrency(holding.averagePrice)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Current:</span>
                      <span className="font-medium">{formatCurrency(holding.currentPrice)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Cost:</span>
                      <span className="font-medium">{formatCurrency(holding.costBasis)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sell Modal */}
      {selectedStock && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Sell {selectedStock.symbol}
                </h3>
                <button
                  onClick={() => setSelectedStock(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Price</label>
                  <div className="text-2xl font-bold text-primary-600">
                    {formatCurrency(selectedStock.currentPrice)}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shares Owned</label>
                  <div className="text-lg font-semibold text-gray-900">
                    {selectedStock.quantity}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Sell</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedStock.quantity}
                    value={sellQuantity}
                    onChange={(e) => setSellQuantity(Math.min(selectedStock.quantity, Math.max(1, parseInt(e.target.value) || 0)))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Revenue</label>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(selectedStock.currentPrice * sellQuantity)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Remaining Shares</label>
                    <div className="text-lg font-semibold text-gray-900">
                      {selectedStock.quantity - sellQuantity}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setSelectedStock(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSell}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-danger-600 text-white rounded-lg hover:bg-danger-700 focus:ring-2 focus:ring-danger-500 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : `Sell ${sellQuantity} Share${sellQuantity > 1 ? 's' : ''}`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
