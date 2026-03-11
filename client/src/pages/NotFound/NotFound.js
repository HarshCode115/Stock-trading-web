import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* 404 Illustration */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="text-9xl font-bold text-primary-200">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="h-20 w-20 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Page not found
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            to="/dashboard"
            className="w-full btn-primary inline-flex justify-center py-3 px-4 text-sm font-medium"
          >
            Go to Dashboard
          </Link>
          
          <div className="text-sm text-gray-600">
            Or{' '}
            <Link to="/stocks" className="text-primary-600 hover:text-primary-500 font-medium">
              browse stocks
            </Link>{' '}
            to start trading
          </div>
        </div>

        {/* Help Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4">
            You might be looking for:
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Link
              to="/dashboard"
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/stocks"
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Stocks
            </Link>
            <Link
              to="/portfolio"
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Portfolio
            </Link>
            <Link
              to="/transactions"
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Transactions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
