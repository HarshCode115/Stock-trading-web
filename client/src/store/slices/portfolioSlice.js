import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import portfolioService from '../../services/portfolioService';

// Async thunks
export const fetchPortfolio = createAsyncThunk(
  'portfolio/fetchPortfolio',
  async (_, { rejectWithValue }) => {
    try {
      const response = await portfolioService.getPortfolio();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch portfolio'
      );
    }
  }
);

export const fetchPortfolioSummary = createAsyncThunk(
  'portfolio/fetchPortfolioSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await portfolioService.getPortfolioSummary();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch portfolio summary'
      );
    }
  }
);

export const fetchHoldings = createAsyncThunk(
  'portfolio/fetchHoldings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await portfolioService.getHoldings();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch holdings'
      );
    }
  }
);

export const fetchPerformance = createAsyncThunk(
  'portfolio/fetchPerformance',
  async (period = '1M', { rejectWithValue }) => {
    try {
      const response = await portfolioService.getPerformance(period);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch performance data'
      );
    }
  }
);

export const fetchAllocation = createAsyncThunk(
  'portfolio/fetchAllocation',
  async (_, { rejectWithValue }) => {
    try {
      const response = await portfolioService.getAllocation();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch allocation data'
      );
    }
  }
);

export const fetchDiversification = createAsyncThunk(
  'portfolio/fetchDiversification',
  async (_, { rejectWithValue }) => {
    try {
      const response = await portfolioService.getDiversification();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch diversification data'
      );
    }
  }
);

const initialState = {
  portfolio: null,
  summary: null,
  holdings: [],
  performance: [],
  allocation: [],
  diversification: null,
  loading: false,
  error: null,
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updatePortfolioValue: (state, action) => {
      if (state.portfolio) {
        state.portfolio.totalValue = action.payload.totalValue;
        state.portfolio.totalGainLoss = action.payload.totalGainLoss;
        state.portfolio.totalGainLossPercent = action.payload.totalGainLossPercent;
      }
    },
    updateHoldingPrice: (state, action) => {
      const { stockId, newPrice } = action.payload;
      const holding = state.holdings.find(h => h.stock.id === stockId);
      if (holding) {
        const oldValue = holding.currentValue;
        holding.currentValue = holding.quantity * newPrice;
        holding.gainLoss = holding.currentValue - holding.totalInvested;
        holding.gainLossPercent = holding.totalInvested > 0 ? 
          (holding.gainLoss / holding.totalInvested * 100) : 0;
        
        // Update portfolio total
        if (state.portfolio) {
          state.portfolio.totalValue += (holding.currentValue - oldValue);
          state.portfolio.totalGainLoss = state.portfolio.totalValue - state.portfolio.totalInvested;
          state.portfolio.totalGainLossPercent = state.portfolio.totalInvested > 0 ? 
            (state.portfolio.totalGainLoss / state.portfolio.totalInvested * 100) : 0;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch portfolio
      .addCase(fetchPortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPortfolio.fulfilled, (state, action) => {
        state.loading = false;
        state.portfolio = action.payload.portfolio;
        state.error = null;
      })
      .addCase(fetchPortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch portfolio summary
      .addCase(fetchPortfolioSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPortfolioSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.summary;
        state.error = null;
      })
      .addCase(fetchPortfolioSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch holdings
      .addCase(fetchHoldings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHoldings.fulfilled, (state, action) => {
        state.loading = false;
        state.holdings = action.payload.holdings;
        state.error = null;
      })
      .addCase(fetchHoldings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch performance
      .addCase(fetchPerformance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPerformance.fulfilled, (state, action) => {
        state.loading = false;
        state.performance = action.payload.performance;
        state.error = null;
      })
      .addCase(fetchPerformance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch allocation
      .addCase(fetchAllocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllocation.fulfilled, (state, action) => {
        state.loading = false;
        state.allocation = action.payload.allocation;
        state.error = null;
      })
      .addCase(fetchAllocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch diversification
      .addCase(fetchDiversification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiversification.fulfilled, (state, action) => {
        state.loading = false;
        state.diversification = action.payload.metrics;
        state.error = null;
      })
      .addCase(fetchDiversification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, updatePortfolioValue, updateHoldingPrice } = portfolioSlice.actions;
export default portfolioSlice.reducer;
