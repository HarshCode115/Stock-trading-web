import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import watchlistService from '../../services/watchlistService';

// Async thunks
export const fetchWatchlist = createAsyncThunk(
  'watchlist/fetchWatchlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await watchlistService.getWatchlist();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch watchlist'
      );
    }
  }
);

export const addToWatchlist = createAsyncThunk(
  'watchlist/addToWatchlist',
  async (watchlistData, { rejectWithValue }) => {
    try {
      const response = await watchlistService.addToWatchlist(watchlistData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add to watchlist'
      );
    }
  }
);

export const removeFromWatchlist = createAsyncThunk(
  'watchlist/removeFromWatchlist',
  async (stockId, { rejectWithValue }) => {
    try {
      await watchlistService.removeFromWatchlist(stockId);
      return stockId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove from watchlist'
      );
    }
  }
);

export const updatePriceAlert = createAsyncThunk(
  'watchlist/updatePriceAlert',
  async ({ stockId, alertPrice, alertType }, { rejectWithValue }) => {
    try {
      const response = await watchlistService.updatePriceAlert(stockId, { alertPrice, alertType });
      return { stockId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update price alert'
      );
    }
  }
);

export const updateWatchlistNotes = createAsyncThunk(
  'watchlist/updateWatchlistNotes',
  async ({ stockId, notes }, { rejectWithValue }) => {
    try {
      const response = await watchlistService.updateWatchlistNotes(stockId, { notes });
      return { stockId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update notes'
      );
    }
  }
);

export const checkAlerts = createAsyncThunk(
  'watchlist/checkAlerts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await watchlistService.checkAlerts();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to check alerts'
      );
    }
  }
);

export const fetchWatchlistStats = createAsyncThunk(
  'watchlist/fetchWatchlistStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await watchlistService.getWatchlistStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch watchlist stats'
      );
    }
  }
);

const initialState = {
  watchlist: [],
  alerts: [],
  stats: null,
  loading: false,
  error: null,
};

const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateWatchlistPrices: (state, action) => {
      const priceUpdates = action.payload;
      state.watchlist.forEach(item => {
        const update = priceUpdates[item.stock.id];
        if (update) {
          item.stock.currentPrice = update.newPrice;
          item.priceChange = update.newPrice - item.stock.previousClose;
          item.priceChangePercent = item.stock.previousClose > 0 ? 
            (item.priceChange / item.stock.previousClose * 100) : 0;
          item.isAlertTriggered = item.alertType !== 'none' && item.alertPrice && 
            ((item.alertType === 'above' && update.newPrice >= item.alertPrice) ||
             (item.alertType === 'below' && update.newPrice <= item.alertPrice));
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch watchlist
      .addCase(fetchWatchlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWatchlist.fulfilled, (state, action) => {
        state.loading = false;
        state.watchlist = action.payload.watchlist;
        state.error = null;
      })
      .addCase(fetchWatchlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add to watchlist
      .addCase(addToWatchlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWatchlist.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.item) {
          state.watchlist.unshift(action.payload.item);
        }
        state.error = null;
      })
      .addCase(addToWatchlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove from watchlist
      .addCase(removeFromWatchlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWatchlist.fulfilled, (state, action) => {
        state.loading = false;
        state.watchlist = state.watchlist.filter(
          item => item.stock.id !== action.payload
        );
        state.error = null;
      })
      .addCase(removeFromWatchlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update price alert
      .addCase(updatePriceAlert.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePriceAlert.fulfilled, (state, action) => {
        state.loading = false;
        const { stockId, alertPrice, alertType } = action.payload;
        const item = state.watchlist.find(w => w.stock.id === stockId);
        if (item) {
          item.alertPrice = alertPrice;
          item.alertType = alertType;
        }
        state.error = null;
      })
      .addCase(updatePriceAlert.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update watchlist notes
      .addCase(updateWatchlistNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWatchlistNotes.fulfilled, (state, action) => {
        state.loading = false;
        const { stockId, notes } = action.payload;
        const item = state.watchlist.find(w => w.stock.id === stockId);
        if (item) {
          item.notes = notes;
        }
        state.error = null;
      })
      .addCase(updateWatchlistNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Check alerts
      .addCase(checkAlerts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.alerts = action.payload.alerts;
        state.error = null;
      })
      .addCase(checkAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch watchlist stats
      .addCase(fetchWatchlistStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWatchlistStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.error = null;
      })
      .addCase(fetchWatchlistStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, updateWatchlistPrices } = watchlistSlice.actions;
export default watchlistSlice.reducer;
