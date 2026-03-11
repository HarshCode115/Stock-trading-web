import React, { useState, useEffect } from 'react';
import tradingService from '../../services/tradingService';
import useToast from '../../hooks/useToast';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [todayPerformance, setTodayPerformance] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    // Load initial data
    const currentTransactions = tradingService.getTransactions();
    const performance = tradingService.getTodayPerformance();
    
    setTransactions(currentTransactions);
    setTodayPerformance(performance);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    if (filter === 'buy') return transaction.type === 'buy';
    if (filter === 'sell') return transaction.type === 'sell';
    return true;
  });

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const currentTransactions = tradingService.getTransactions();
      setTransactions(currentTransactions);
      showToast.success('Transactions refreshed');
    } catch (error) {
      showToast.error('Error refreshing transactions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Today's Performance */}
      {todayPerformance && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="card">
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Today's Activity</h3>
              <div className="text-2xl font-bold text-gray-900">
                {todayPerformance.totalTransactions}
              </div>
              <div className="text-sm text-gray-600">Transactions</div>
            </div>
          </div>
          
          <div className="card">
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Buys</h3>
              <div className="text-2xl font-bold text-primary-600">
                {todayPerformance.buys}
              </div>
              <div className="text-sm text-gray-600">
                {formatCurrency(todayPerformance.totalBought)}
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Sells</h3>
              <div className="text-2xl font-bold text-danger-600">
                {todayPerformance.sells}
              </div>
              <div className="text-sm text-gray-600">
                {formatCurrency(todayPerformance.totalSold)}
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Net Activity</h3>
              <div className={`text-2xl font-bold ${
                todayPerformance.totalSold - todayPerformance.totalBought >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {formatCurrency(todayPerformance.totalSold - todayPerformance.totalBought)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="p-6">
          <div className="flex space-x-4">
            {['all', 'buy', 'sell'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === type
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Transaction History ({filteredTransactions.length})
          </h2>
          
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
              <p className="mt-1 text-sm text-gray-500">Start trading to see your transaction history!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium text-gray-900">{transaction.symbol}</div>
                      <div className="text-sm text-gray-600">{transaction.name}</div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.type === 'buy' 
                          ? 'bg-success-100 text-success-800' 
                          : 'bg-danger-100 text-danger-800'
                      }`}>
                        {transaction.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">{formatCurrency(transaction.price)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium">{transaction.quantity}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total:</span>
                      <span className="font-medium">
                        {formatCurrency(transaction.type === 'buy' ? transaction.totalCost : transaction.totalRevenue)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{formatDate(transaction.timestamp)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${
                        transaction.status === 'completed' 
                          ? 'text-success-600' 
                          : 'text-warning-600'
                      }`}>
                        {transaction.status}
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

export default Transactions;
