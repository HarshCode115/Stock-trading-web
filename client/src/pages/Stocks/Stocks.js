import React, { useState, useEffect } from 'react';
import tradingService from '../../services/tradingService';
import stockApiService from '../../services/stockApiService';
import useToast from '../../hooks/useToast';

const Stocks = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allStocks, setAllStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [portfolio, setPortfolio] = useState([]);
  const [balance, setBalance] = useState(0);
  const [activeTab, setActiveTab] = useState('search');
  const [selectedSector, setSelectedSector] = useState('all');
  const [sectors, setSectors] = useState([]);
  const { showToast } = useToast();

  useEffect(() => {
    // Load initial data
    setPortfolio(tradingService.getPortfolio());
    setBalance(tradingService.getBalance());

    // Listen for balance changes
    tradingService.onBalanceChange((newBalance) => {
      setBalance(newBalance);
    });
  }, []);

  const loadAllStocks = async () => {
    setLoading(true);
    try {
      const stocks = await stockApiService.getAllStocks();
      setAllStocks(stocks);
      // Extract unique sectors
      const uniqueSectors = [...new Set(stocks.map(s => s.sector).filter(Boolean))];
      setSectors(['all', ...uniqueSectors]);
    } catch (error) {
      showToast.error('Failed to load stocks');
    } finally {
      setLoading(false);
    }
  };

  const filteredStocks = selectedSector === 'all'
    ? allStocks
    : allStocks.filter(s => s.sector === selectedSector);

  useEffect(() => {
    if (activeTab === 'browse') {
      loadAllStocks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await tradingService.searchStocks(searchQuery);
      setSearchResults(results);
    } catch (error) {
      showToast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStockSelect = async (stock) => {
    setLoading(true);
    try {
      const stockData = await tradingService.getStockData(stock.symbol);
      setSelectedStock(stockData);
    } catch (error) {
      showToast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!selectedStock || quantity <= 0) {
      showToast.error('Please select a stock and enter quantity');
      return;
    }

    setLoading(true);
    try {
      const result = await tradingService.buyStock(selectedStock.symbol, quantity);
      if (result.success) {
        showToast.success(result.message);
        setSelectedStock(null);
        setQuantity(1);
        setSearchQuery('');
        setSearchResults([]);
        setPortfolio(tradingService.getPortfolio());
      } else {
        showToast.error(result.error);
      }
    } catch (error) {
      showToast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = (symbol) => {
    try {
      const result = tradingService.addToWatchlist(symbol);
      if (result.success) {
        showToast.success(result.message);
      } else {
        showToast.error(result.error);
      }
    } catch (error) {
      showToast.error(error.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Stock Market</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Balance: {formatCurrency(balance)}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['search', 'browse', 'portfolio'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="card">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Stocks</h2>
              <p className="text-sm text-gray-600 mb-4">Search from over {allStocks.length || 400} available stocks</p>
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by symbol or company name..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="card">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Results</h3>
                <div className="space-y-3">
                  {searchResults.map((stock) => (
                    <div
                      key={stock.symbol}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleStockSelect(stock)}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{stock.symbol}</div>
                        <div className="text-sm text-gray-600">{stock.name}</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToWatchlist(stock.symbol);
                        }}
                        className="p-2 text-primary-600 hover:text-primary-700"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 006.364 6.364L12 20.364l7.318-7.682a4.5 4.5 0 00-6.364 6.364L12 3.636l-7.318 7.682z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Stock Details and Buy */}
          {selectedStock && (
            <div className="card">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {selectedStock.symbol} - {selectedStock.name}
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Price</label>
                    <div className="text-2xl font-bold text-primary-600">
                      {formatCurrency(selectedStock.price)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Day Change</label>
                    <div className={`text-lg font-semibold ${
                      selectedStock.change >= 0 ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {selectedStock.change >= 0 ? '+' : ''}{formatCurrency(selectedStock.change)}
                      ({selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%)
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost</label>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(selectedStock.price * quantity)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Remaining Balance</label>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(balance - (selectedStock.price * quantity))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleBuy}
                    disabled={loading || balance < selectedStock.price * quantity}
                    className="w-full px-6 py-3 bg-success-600 text-white rounded-lg hover:bg-success-700 focus:ring-2 focus:ring-success-500 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : `Buy ${quantity} Share${quantity > 1 ? 's' : ''}`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Browse All Stocks Tab */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          <div className="card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">All Available Stocks</h2>
                <button
                  onClick={loadAllStocks}
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              {/* Sector Filter */}
              {sectors.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Sector</label>
                  <select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {sectors.map(sector => (
                      <option key={sector} value={sector}>
                        {sector === 'all' ? 'All Sectors' : sector}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {loading && allStocks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading stocks...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
                  {filteredStocks.slice(0, 100).map((stock) => (
                    <div
                      key={stock.symbol}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedStock(stock);
                        setActiveTab('search');
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{stock.symbol}</div>
                          <div className="text-sm text-gray-600 truncate max-w-[150px]">{stock.name}</div>
                          <div className="text-xs text-gray-500">{stock.sector}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-primary-600">
                            ${stock.price?.toFixed(2)}
                          </div>
                          <div className={`text-xs ${
                            stock.change >= 0 ? 'text-success-600' : 'text-danger-600'
                          }`}>
                            {stock.change >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-4 text-sm text-gray-500 text-center">
                Showing {Math.min(100, filteredStocks.length)} of {filteredStocks.length} stocks{selectedSector !== 'all' ? ` in ${selectedSector}` : ''}. Use search for more.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Tab */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6">
          <div className="card">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Portfolio</h2>
              {portfolio.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v-7a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v-7a2 2 0 00-2-2H6a2 2 0 00-2 2v7" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No stocks in portfolio</h3>
                  <p className="mt-1 text-sm text-gray-500">Start buying stocks to build your portfolio!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {portfolio.map((holding) => (
                    <div key={holding.symbol} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
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
                            ({holding.profitLossPercent >= 0 ? '+' : ''}{holding.profitLossPercent.toFixed(2)}%)
                          </div>
                        </div>
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
        </div>
      )}
    </div>
  );
};

export default Stocks;
