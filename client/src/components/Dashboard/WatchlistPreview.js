import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchWatchlist } from '../../store/slices/watchlistSlice';

const WatchlistPreview = ({ formatCurrency, formatPercentage }) => {
  const dispatch = useDispatch();
  const { watchlist, loading } = useSelector((state) => state?.watchlist || {});
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    dispatch(fetchWatchlist());
  }, [dispatch]);

  const displayItems = showAll ? watchlist || [] : (watchlist || [])?.slice(0, 3);

  if (loading) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Watchlist</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Watchlist</h3>
        <Link
          to="/watchlist"
          className="text-sm text-primary-600 hover:text-primary-500 font-medium"
        >
          Manage →
        </Link>
      </div>

      {watchlist && Array.isArray(watchlist) && watchlist.length > 0 ? (
        <div className="space-y-3">
          {displayItems.map((item) => (
            <Link
              key={item.id}
              to={`/stocks/${item.stock.id}`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-600">
                    {item.stock.symbol?.charAt(0) || 'S'}
                  </span>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900">{item.stock.symbol}</p>
                  <p className="text-sm text-gray-600 truncate max-w-[120px]">
                    {item.stock.name}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-medium text-gray-900">
                  {formatCurrency(item.stock.currentPrice)}
                </p>
                <p className={`text-sm font-medium ${
                  item.priceChange >= 0 ? 'text-success-600' : 'text-danger-600'
                }`}>
                  {formatPercentage(item.priceChangePercent)}
                </p>
              </div>
            </Link>
          ))}

          {/* Show More/Less Button */}
          {watchlist && Array.isArray(watchlist) && watchlist.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full text-center py-2 text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              {showAll ? 'Show Less' : `Show ${watchlist.length - 3} More`}
            </button>
          )}

          {/* Alert Indicator */}
          {watchlist && Array.isArray(watchlist) && watchlist.some(item => item.isAlertTriggered) && (
            <div className="mt-3 p-3 bg-warning-50 border border-warning-200 rounded-lg">
              <div className="flex items-center">
                <svg className="h-4 w-4 text-warning-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="text-sm text-warning-800">
                  {watchlist.filter(item => item.isAlertTriggered).length} price alert(s) triggered
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p className="mt-2 text-sm text-gray-600">No stocks in watchlist</p>
          <p className="text-xs text-gray-500 mt-1">Add stocks to track their performance</p>
          <Link
            to="/stocks"
            className="mt-3 inline-flex items-center text-sm text-primary-600 hover:text-primary-500 font-medium"
          >
            Browse Stocks →
          </Link>
        </div>
      )}

      {/* Watchlist Stats */}
      {watchlist && Array.isArray(watchlist) && watchlist.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total stocks</span>
              <span className="font-medium text-gray-900">{watchlist.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active alerts</span>
              <span className="font-medium text-gray-900">
                {watchlist.filter(item => item.alertType !== 'none').length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchlistPreview;
