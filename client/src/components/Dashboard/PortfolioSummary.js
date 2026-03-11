import React from 'react';
import { Link } from 'react-router-dom';

const PortfolioSummary = ({ summary, virtualBalance, loading, formatCurrency, formatPercentage }) => {
  const totalValue = (summary?.totalValue || 0) + (virtualBalance || 0);
  const totalInvested = summary?.totalInvested || 0;
  const totalGainLoss = totalValue - totalInvested;
  const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested * 100) : 0;

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Portfolio Summary</h2>
        <Link
          to="/portfolio"
          className="text-sm text-primary-600 hover:text-primary-500 font-medium"
        >
          View Details →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Portfolio Value */}
        <div>
          <p className="text-sm font-medium text-gray-600">Total Value</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalValue)}
          </p>
        </div>

        {/* Total Invested */}
        <div>
          <p className="text-sm font-medium text-gray-600">Total Invested</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalInvested)}
          </p>
        </div>

        {/* Total Gain/Loss */}
        <div>
          <p className="text-sm font-medium text-gray-600">Total Gain/Loss</p>
          <p className={`text-2xl font-bold ${
            totalGainLoss >= 0 ? 'text-success-600' : 'text-danger-600'
          }`}>
            {formatCurrency(totalGainLoss)}
          </p>
        </div>

        {/* Gain/Loss Percentage */}
        <div>
          <p className="text-sm font-medium text-gray-600">Return %</p>
          <p className={`text-2xl font-bold ${
            totalGainLossPercent >= 0 ? 'text-success-600' : 'text-danger-600'
          }`}>
            {formatPercentage(totalGainLossPercent)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Portfolio Performance</span>
          <span>{formatPercentage(totalGainLossPercent)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              totalGainLossPercent >= 0 ? 'bg-success-500' : 'bg-danger-500'
            }`}
            style={{
              width: `${Math.min(Math.max(totalGainLossPercent + 50, 0), 100)}%`
            }}
          ></div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">Available Cash</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatCurrency(virtualBalance)}
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">Stocks Value</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatCurrency(summary?.totalValue || 0)}
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">Holdings</p>
          <p className="text-sm font-semibold text-gray-900">
            {summary?.holdingsCount || 0}
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">Today's Change</p>
          <p className={`text-sm font-semibold ${
            totalGainLoss >= 0 ? 'text-success-600' : 'text-danger-600'
          }`}>
            {formatCurrency(totalGainLoss)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;
