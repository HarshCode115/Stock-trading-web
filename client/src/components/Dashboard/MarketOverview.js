import React from 'react';
import { Link } from 'react-router-dom';

const MarketOverview = ({ trendingStocks, topGainers, topLosers, loading, formatCurrency, formatPercentage }) => {
  const StockList = ({ title, stocks, type, emptyMessage }) => {
    if (loading) {
      return (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
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
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <Link
            to="/stocks"
            className="text-sm text-primary-600 hover:text-primary-500 font-medium"
          >
            View All →
          </Link>
        </div>
        
        {stocks && stocks.length > 0 ? (
          <div className="space-y-3">
            {stocks.map((stock) => {
              const priceChange = stock.currentPrice - stock.previousClose;
              const priceChangePercent = stock.previousClose > 0 
                ? (priceChange / stock.previousClose * 100) 
                : 0;

              return (
                <Link
                  key={stock._id}
                  to={`/stocks/${stock._id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-600">
                        {stock.symbol?.charAt(0) || 'S'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{stock.symbol}</p>
                      <p className="text-sm text-gray-600 truncate max-w-[150px]">
                        {stock.name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(stock.currentPrice)}
                    </p>
                    <p className={`text-sm font-medium ${
                      priceChange >= 0 ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {formatPercentage(priceChangePercent)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <p className="mt-2 text-sm text-gray-600">{emptyMessage}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <StockList
        title="🔥 Trending"
        stocks={trendingStocks}
        type="trending"
        emptyMessage="No trending stocks available"
      />
      
      <StockList
        title="📈 Top Gainers"
        stocks={topGainers}
        type="gainers"
        emptyMessage="No gainers available"
      />
      
      <StockList
        title="📉 Top Losers"
        stocks={topLosers}
        type="losers"
        emptyMessage="No losers available"
      />
    </div>
  );
};

export default MarketOverview;
