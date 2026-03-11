import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import stocksReducer from './slices/stocksSlice';
import portfolioReducer from './slices/portfolioSlice';
import transactionsReducer from './slices/transactionsSlice';
import watchlistReducer from './slices/watchlistSlice';
import adminReducer from './slices/adminSlice';

const preloadedState = {
  auth: {
    user: null,
    token: typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  stocks: {
    stocks: [],
    currentStock: null,
    trendingStocks: [],
    topGainers: [],
    topLosers: [],
    sectors: [],
    loading: false,
    error: null,
  },
  portfolio: {
    holdings: [],
    summary: null,
    performance: null,
    allocation: null,
    diversification: null,
    loading: false,
    error: null,
  },
  transactions: {
    transactions: [],
    currentTransaction: null,
    summary: null,
    stockTransactions: [],
    pagination: null,
    loading: false,
    error: null,
  },
  watchlist: {
    watchlist: [],
    alerts: [],
    stats: null,
    loading: false,
    error: null,
  },
  admin: {
    users: [],
    stocks: [],
    transactions: [],
    dashboard: null,
    analytics: null,
    currentUser: null,
    loading: false,
    error: null,
  },
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    stocks: stocksReducer,
    portfolio: portfolioReducer,
    transactions: transactionsReducer,
    watchlist: watchlistReducer,
    admin: adminReducer,
  },
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;
