import React from 'react';
import { Link } from 'react-router-dom';

const QuickActions = () => {
  const actions = [
    {
      title: 'Buy Stocks',
      description: 'Purchase stocks with virtual funds',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      color: 'success',
      link: '/stocks',
    },
    {
      title: 'Sell Stocks',
      description: 'Sell stocks from your portfolio',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      ),
      color: 'danger',
      link: '/portfolio',
    },
    {
      title: 'Watchlist',
      description: 'Track your favorite stocks',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      color: 'warning',
      link: '/watchlist',
    },
    {
      title: 'Transactions',
      description: 'View your trading history',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      color: 'primary',
      link: '/transactions',
    },
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      primary: {
        bg: 'bg-primary-100',
        text: 'text-primary-600',
        hover: 'hover:bg-primary-50',
      },
      success: {
        bg: 'bg-success-100',
        text: 'text-success-600',
        hover: 'hover:bg-success-50',
      },
      danger: {
        bg: 'bg-danger-100',
        text: 'text-danger-600',
        hover: 'hover:bg-danger-50',
      },
      warning: {
        bg: 'bg-warning-100',
        text: 'text-warning-600',
        hover: 'hover:bg-warning-50',
      },
    };
    return colorMap[color] || colorMap.primary;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => {
        const colorClasses = getColorClasses(action.color);
        
        return (
          <Link
            key={action.title}
            to={action.link}
            className={`card p-6 text-center transition-all duration-200 hover:shadow-lg ${colorClasses.hover} cursor-pointer group`}
          >
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${colorClasses.bg} mb-4 group-hover:scale-110 transition-transform duration-200`}>
              <div className={colorClasses.text}>
                {action.icon}
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
              {action.title}
            </h3>
            
            <p className="text-sm text-gray-600">
              {action.description}
            </p>
            
            <div className="mt-4">
              <svg className="h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default QuickActions;
