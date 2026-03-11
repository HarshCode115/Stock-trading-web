import React from 'react';

const StockDetail = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Stock Details</h1>
      </div>
      
      <div className="card">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Stock details coming soon</h3>
          <p className="mt-1 text-sm text-gray-500">Detailed stock information and trading will be available here.</p>
        </div>
      </div>
    </div>
  );
};

export default StockDetail;
