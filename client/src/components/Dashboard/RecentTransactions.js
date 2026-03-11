import React from 'react';
import { Link } from 'react-router-dom';

const RecentTransactions = ({ transactions, loading, formatCurrency }) => {
  if (loading) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between">
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
            </div>
          ))}
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        <Link
          to="/transactions"
          className="text-sm text-primary-600 hover:text-primary-500 font-medium"
        >
          View All →
        </Link>
      </div>

      {transactions && transactions.length > 0 ? (
        <div className="space-y-3">
          {transactions.slice(0, 5).map((transaction) => (
            <Link
              key={transaction._id}
              to={`/transactions/${transaction._id}`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  transaction.type === 'buy' 
                    ? 'bg-success-100' 
                    : 'bg-danger-100'
                }`}>
                  <svg className={`h-4 w-4 ${
                    transaction.type === 'buy' 
                      ? 'text-success-600' 
                      : 'text-danger-600'
                  }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {transaction.type === 'buy' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    )}
                  </svg>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900 capitalize">
                    {transaction.type} {transaction.stock?.symbol || 'Stock'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {transaction.quantity} shares @ {formatCurrency(transaction.price)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className={`font-medium ${
                  transaction.type === 'buy' 
                    ? 'text-danger-600' 
                    : 'text-success-600'
                }`}>
                  {transaction.type === 'buy' ? '-' : '+'}
                  {formatCurrency(transaction.totalAmount)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(transaction.executedAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <p className="mt-2 text-sm text-gray-600">No transactions yet</p>
          <p className="text-xs text-gray-500 mt-1">Start trading to see your transaction history</p>
        </div>
      )}

      {/* Transaction Summary */}
      {transactions && transactions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Total transactions</span>
            <span className="font-medium text-gray-900">{transactions.length}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
