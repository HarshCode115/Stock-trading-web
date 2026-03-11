import React, { useState, useEffect } from 'react';
import tradingService from '../../services/tradingService';
import stockApiService from '../../services/stockApiService';
import useToast from '../../hooks/useToast';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistWithData, setWatchlistWithData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const loadWatchlistData = async () => {
    const currentWatchlist = tradingService.getWatchlist();
    setWatchlist(currentWatchlist);

    // Fetch real-time data for each stock in watchlist
    if (currentWatchlist.length > 0) {
      const stocksWithData = await Promise.all(
        currentWatchlist.map(async (item) => {
          try {
            const data = await stockApiService.getStockData(item.symbol);
            return { ...item, ...data };
          } catch (error) {
            return { ...item, price: 0, change: 0, changePercent: 0 };
          }
        })
      );
      setWatchlistWithData(stocksWithData);
    } else {
      setWatchlistWithData([]);
    }
  };

  useEffect(() => {
    loadWatchlistData();

    // Set up real-time updates
    const symbols = tradingService.getWatchlist().map(item => item.symbol);
    if (symbols.length > 0) {
      const unsubscribe = stockApiService.startRealTimeUpdates(() => {
        loadWatchlistData();
      }, symbols);
      return () => unsubscribe();
    }
  }, []);

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

  const handleAddToWatchlist = async (symbol) => {
    try {
      const result = tradingService.addToWatchlist(symbol);
      if (result.success) {
        showToast.success(result.message);
        loadWatchlistData();
        setSearchQuery('');
        setSearchResults([]);
      } else {
        showToast.error(result.error);
      }
    } catch (error) {
      showToast.error(error.message);
    }
  };

  const handleRemoveFromWatchlist = async (symbol) => {
    try {
      const result = tradingService.removeFromWatchlist(symbol);
      if (result.success) {
        showToast.success(result.message);
        loadWatchlistData();
      } else {
        showToast.error(result.error);
      }
    } catch (error) {
      showToast.error(error.message);
    }
  };

  const handleQuickBuy = (symbol) => {
    // Navigate to stocks page with selected stock
    window.location.href = `/stocks?symbol=${symbol}`;
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
        <h1 className="text-2xl font-bold text-gray-900">Watchlist</h1>
        <button onClick={loadWatchlistData} className="text-sm text-primary-600 hover:text-primary-700">
          Refresh
        </button>
      </div>

      {/* Search and Add */}
      <div className="card">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add to Watchlist</h2>
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
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4">
              <h3 className="text-md font-semibold text-gray-900 mb-3">Search Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchResults.map((stock) => (
                  <div key={stock.symbol} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium text-gray-900">{stock.symbol}</div>
                        <div className="text-sm text-gray-600">{stock.name}</div>
                      </div>
                      <button
                        onClick={() => handleAddToWatchlist(stock.symbol)}
                        className="px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 text-sm"
                      >
                        Add
                      </button>
                    </div>
                    <div className="text-sm text-gray-600">
                      Current Price: {formatCurrency(stock.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Current Watchlist */}
      <div className="card">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Your Watchlist ({watchlist.length})
          </h2>
          
          {watchlistWithData.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 6.364L12 7.636l-7.318 7.682z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No stocks in watchlist</h3>
              <p className="mt-1 text-sm text-gray-500">Add stocks to track their performance!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {watchlistWithData.map((item) => (
                <div key={item.symbol} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.symbol}</div>
                      <div className="text-sm text-gray-600">{item.name}</div>
                    </div>
                    <div className="text-right mr-4">
                      <div className="font-medium text-primary-600">
                        {formatCurrency(item.price)}
                      </div>
                      <div className={`text-sm ${
                        item.change >= 0 ? 'text-success-600' : 'text-danger-600'
                      }`}>
                        {item.change >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuickBuy(item.symbol)}
                        className="px-3 py-1 bg-success-600 text-white rounded hover:bg-success-700 text-sm"
                      >
                        Buy
                      </button>
                      <button
                        onClick={() => handleRemoveFromWatchlist(item.symbol)}
                        className="px-3 py-1 bg-danger-600 text-white rounded hover:bg-danger-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Added:</span>
                      <span className="font-medium">
                        {new Date(item.addedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Volume:</span>
                      <span className="font-medium">
                        {item.volume ? item.volume.toLocaleString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Watchlist;
