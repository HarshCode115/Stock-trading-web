import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import transactionsService from '../../services/transactionsService';

// Async thunks
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await transactionsService.getTransactions(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch transactions'
      );
    }
  }
);

export const fetchTransactionById = createAsyncThunk(
  'transactions/fetchTransactionById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await transactionsService.getTransactionById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch transaction'
      );
    }
  }
);

export const executeBuyTransaction = createAsyncThunk(
  'transactions/executeBuyTransaction',
  async (transactionData, { rejectWithValue }) => {
    try {
      const response = await transactionsService.buyStock(transactionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to execute buy transaction'
      );
    }
  }
);

export const executeSellTransaction = createAsyncThunk(
  'transactions/executeSellTransaction',
  async (transactionData, { rejectWithValue }) => {
    try {
      const response = await transactionsService.sellStock(transactionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to execute sell transaction'
      );
    }
  }
);

export const fetchTransactionSummary = createAsyncThunk(
  'transactions/fetchTransactionSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await transactionsService.getTransactionSummary();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch transaction summary'
      );
    }
  }
);

export const fetchStockTransactions = createAsyncThunk(
  'transactions/fetchStockTransactions',
  async ({ stockId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await transactionsService.getStockTransactions(stockId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch stock transactions'
      );
    }
  }
);

export const cancelTransaction = createAsyncThunk(
  'transactions/cancelTransaction',
  async (id, { rejectWithValue }) => {
    try {
      const response = await transactionsService.cancelTransaction(id);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to cancel transaction'
      );
    }
  }
);

const initialState = {
  transactions: [],
  currentTransaction: null,
  summary: null,
  stockTransactions: [],
  loading: false,
  error: null,
  pagination: {
    page: 0,
    size: 10,
    totalItems: 0,
    totalPages: 0,
  },
};

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTransaction: (state) => {
      state.currentTransaction = null;
    },
    updateTransactionStatus: (state, action) => {
      const { id, status } = action.payload;
      const transaction = state.transactions.find(t => t._id === id);
      if (transaction) {
        transaction.status = status;
      }
      if (state.currentTransaction && state.currentTransaction._id === id) {
        state.currentTransaction.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.items || action.payload.transactions || [];
        state.pagination = {
          page: action.payload.currentPage || 0,
          size: action.payload.items?.length || 10,
          totalItems: action.payload.totalItems || 0,
          totalPages: action.payload.totalPages || 0,
        };
        state.error = null;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch transaction by ID
      .addCase(fetchTransactionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTransaction = action.payload.transaction;
        state.error = null;
      })
      .addCase(fetchTransactionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Execute buy transaction
      .addCase(executeBuyTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(executeBuyTransaction.fulfilled, (state, action) => {
        state.loading = false;
        // Add new transaction to the beginning of the list
        if (action.payload.transaction) {
          state.transactions.unshift(action.payload.transaction);
        }
        state.error = null;
      })
      .addCase(executeBuyTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Execute sell transaction
      .addCase(executeSellTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(executeSellTransaction.fulfilled, (state, action) => {
        state.loading = false;
        // Add new transaction to the beginning of the list
        if (action.payload.transaction) {
          state.transactions.unshift(action.payload.transaction);
        }
        state.error = null;
      })
      .addCase(executeSellTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch transaction summary
      .addCase(fetchTransactionSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.summary;
        state.error = null;
      })
      .addCase(fetchTransactionSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch stock transactions
      .addCase(fetchStockTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStockTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.stockTransactions = action.payload.items || action.payload.transactions || [];
        state.error = null;
      })
      .addCase(fetchStockTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cancel transaction
      .addCase(cancelTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelTransaction.fulfilled, (state, action) => {
        state.loading = false;
        // Update transaction status in the list
        const transaction = state.transactions.find(t => t._id === action.payload.id);
        if (transaction) {
          transaction.status = 'cancelled';
        }
        if (state.currentTransaction && state.currentTransaction._id === action.payload.id) {
          state.currentTransaction.status = 'cancelled';
        }
        state.error = null;
      })
      .addCase(cancelTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearCurrentTransaction, 
  updateTransactionStatus 
} = transactionsSlice.actions;

export default transactionsSlice.reducer;
