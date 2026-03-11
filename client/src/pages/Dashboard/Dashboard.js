import React, { useEffect, useState, useCallback } from 'react';
import tradingService from '../../services/tradingService';
import useToast from '../../hooks/useToast';

// Components
import QuickActions from '../../components/Dashboard/QuickActions';

const Dashboard = () => {
  const { showToast } = useToast();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [portfolioSummary, setPortfolioSummary] = useState(null);
  const [todayPerformance, setTodayPerformance] = useState(null);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    // Load initial data from trading service
    const summary = tradingService.getPortfolioSummary();
    const performance = tradingService.getTodayPerformance();
    const currentBalance = tradingService.getBalance();
    
    setPortfolioSummary(summary);
    setTodayPerformance(performance);
    setBalance(currentBalance);
    
    // Listen for balance changes
    tradingService.onBalanceChange((newBalance) => {
      setBalance(newBalance);
    });
  }, []);

  const loadDashboardData = useCallback(async () => {
    setRefreshing(true);
    try {
      // Load fresh data
      const summary = tradingService.getPortfolioSummary();
      const performance = tradingService.getTodayPerformance();
      const currentBalance = tradingService.getBalance();
      
      setPortfolioSummary(summary);
      setTodayPerformance(performance);
      setBalance(currentBalance);
      
      showToast.success('Dashboard data refreshed');
    } catch (error) {
      showToast.error('Failed to refresh dashboard data');
    } finally {
      setRefreshing(false);
    }
  }, [showToast]);

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

  const isLoading = portfolioSummary || todayPerformance || refreshing;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Balance: {formatCurrency(balance)}</span>
          <button
            onClick={loadDashboardData}
            disabled={isLoading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Portfolio Summary */}
      {portfolioSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="card">
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Portfolio Value</h3>
              <div className="text-3xl font-bold text-gray-900">
                {formatCurrency(portfolioSummary.totalValue)}
              </div>
              <div className={`text-sm mt-2 ${
                portfolioSummary.totalProfitLoss >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {formatPercentage(portfolioSummary.totalProfitLossPercent)} overall
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Invested</h3>
              <div className="text-3xl font-bold text-gray-900">
                {formatCurrency(portfolioSummary.totalCost)}
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Profit/Loss</h3>
              <div className={`text-3xl font-bold ${
                portfolioSummary.totalProfitLoss >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {formatCurrency(portfolioSummary.totalProfitLoss)}
              </div>
              <div className={`text-sm mt-2 ${
                portfolioSummary.totalProfitLoss >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                ({formatPercentage(portfolioSummary.totalProfitLossPercent)})
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Available Balance</h3>
              <div className="text-3xl font-bold text-primary-600">
                {formatCurrency(balance)}
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Holdings</h3>
              <div className="text-3xl font-bold text-gray-900">
                {portfolioSummary.holdings}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Today's Performance */}
      {todayPerformance && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="card">
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Today's Transactions</h3>
              <div className="text-3xl font-bold text-gray-900">
                {todayPerformance.totalTransactions}
              </div>
              <div className="text-sm text-gray-600">
                {todayPerformance.buys} buys, {todayPerformance.sells} sells
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Today's Bought</h3>
              <div className="text-3xl font-bold text-primary-600">
                {formatCurrency(todayPerformance.totalBought)}
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Today's Sold</h3>
              <div className="text-3xl font-bold text-danger-600">
                {formatCurrency(todayPerformance.totalSold)}
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Net Activity</h3>
              <div className={`text-3xl font-bold ${
                todayPerformance.totalSold - todayPerformance.totalBought >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {formatCurrency(todayPerformance.totalSold - todayPerformance.totalBought)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <QuickActions 
        onBuyStock={() => window.location.href = '/stocks'}
        onViewPortfolio={() => window.location.href = '/portfolio'}
        onViewTransactions={() => window.location.href = '/transactions'}
        onViewWatchlist={() => window.location.href = '/watchlist'}
      />
    </div>
  );
};

export default Dashboard;
