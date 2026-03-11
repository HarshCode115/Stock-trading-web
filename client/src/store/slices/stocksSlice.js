import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import stocksService from '../../services/stocksService';

// Async thunks
export const fetchStocks = createAsyncThunk(
  'stocks/fetchStocks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await stocksService.getStocks(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch stocks'
      );
    }
  }
);

export const fetchStockById = createAsyncThunk(
  'stocks/fetchStockById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await stocksService.getStockById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch stock'
      );
    }
  }
);

export const fetchStockBySymbol = createAsyncThunk(
  'stocks/fetchStockBySymbol',
  async (symbol, { rejectWithValue }) => {
    try {
      const response = await stocksService.getStockBySymbol(symbol);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch stock'
      );
    }
  }
);

export const fetchStockHistory = createAsyncThunk(
  'stocks/fetchStockHistory',
  async ({ id, period = '1M' }, { rejectWithValue }) => {
    try {
      const response = await stocksService.getStockHistory(id, period);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch stock history'
      );
    }
  }
);

export const fetchTrendingStocks = createAsyncThunk(
  'stocks/fetchTrendingStocks',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await stocksService.getTrendingStocks(limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch trending stocks'
      );
    }
  }
);

export const fetchTopGainers = createAsyncThunk(
  'stocks/fetchTopGainers',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await stocksService.getTopGainers(limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch top gainers'
      );
    }
  }
);

export const fetchTopLosers = createAsyncThunk(
  'stocks/fetchTopLosers',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await stocksService.getTopLosers(limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch top losers'
      );
    }
  }
);

export const fetchSectors = createAsyncThunk(
  'stocks/fetchSectors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await stocksService.getSectors();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch sectors'
      );
    }
  }
);

const initialState = {
  stocks: [],
  currentStock: null,
  stockHistory: {},
  trendingStocks: [],
  topGainers: [],
  topLosers: [],
  sectors: [],
  loading: false,
  error: null,
  pagination: {
    page: 0,
    size: 10,
    totalItems: 0,
    totalPages: 0,
  },
};

const stocksSlice = createSlice({
  name: 'stocks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentStock: (state) => {
      state.currentStock = null;
    },
    updateStockPrice: (state, action) => {
      const { id, newPrice } = action.payload;
      const stock = state.stocks.find(s => s._id === id);
      if (stock) {
        stock.previousClose = stock.currentPrice;
        stock.currentPrice = newPrice;
      }
      if (state.currentStock && state.currentStock._id === id) {
        state.currentStock.previousClose = state.currentStock.currentPrice;
        state.currentStock.currentPrice = newPrice;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch stocks
      .addCase(fetchStocks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStocks.fulfilled, (state, action) => {
        state.loading = false;
        state.stocks = action.payload.stocks || [];
        state.pagination = {
          page: action.payload.currentPage || 0,
          size: action.payload.items?.length || 10,
          totalItems: action.payload.totalItems || 0,
          totalPages: action.payload.totalPages || 0,
        };
        state.error = null;
      })
      .addCase(fetchStocks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch stock by ID
      .addCase(fetchStockById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStockById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStock = action.payload.stock;
        state.error = null;
      })
      .addCase(fetchStockById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch stock by symbol
      .addCase(fetchStockBySymbol.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStockBySymbol.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStock = action.payload.stock;
        state.error = null;
      })
      .addCase(fetchStockBySymbol.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch stock history
      .addCase(fetchStockHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStockHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.stockHistory[action.payload.id] = action.payload.data.priceHistory;
        state.error = null;
      })
      .addCase(fetchStockHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch trending stocks
      .addCase(fetchTrendingStocks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrendingStocks.fulfilled, (state, action) => {
        state.loading = false;
        state.trendingStocks = action.payload.stocks;
        state.error = null;
      })
      .addCase(fetchTrendingStocks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch top gainers
      .addCase(fetchTopGainers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopGainers.fulfilled, (state, action) => {
        state.loading = false;
        state.topGainers = action.payload.stocks;
        state.error = null;
      })
      .addCase(fetchTopGainers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch top losers
      .addCase(fetchTopLosers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopLosers.fulfilled, (state, action) => {
        state.loading = false;
        state.topLosers = action.payload.stocks;
        state.error = null;
      })
      .addCase(fetchTopLosers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch sectors
      .addCase(fetchSectors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSectors.fulfilled, (state, action) => {
        state.loading = false;
        state.sectors = action.payload.sectors;
        state.error = null;
      })
      .addCase(fetchSectors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentStock, updateStockPrice } = stocksSlice.actions;
export default stocksSlice.reducer;
