/**
 * Transaction Slice - Manages transaction data and state
 */

import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { fetchTransactions as apiFetchTransactions } from '../../services/api';

// Initial state
const initialState = {
  items: [],
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  },
  aggregateStats: {
    totalUnits: 0,
    totalAmount: 0,
    totalDiscount: 0,
    recordCount: 0
  },
  loading: false,
  error: null,
  search: '',
  sortBy: 'date',
  sortOrder: 'desc'
};

/**
 * Async thunk to fetch transactions
 */
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (params, { rejectWithValue }) => {
    try {
      const data = await apiFetchTransactions(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Transaction slice
 */
const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    // Set search term
    setSearch: (state, action) => {
      state.search = action.payload;
    },
    
    // Set sort parameters
    setSort: (state, action) => {
      state.sortBy = action.payload.sortBy || state.sortBy;
      state.sortOrder = action.payload.sortOrder || state.sortOrder;
    },
    
    // Set page
    setPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    
    // Set page size
    setPageSize: (state, action) => {
      state.pagination.pageSize = action.payload;
      state.pagination.currentPage = 1; // Reset to first page
    },
    
    // Clear transactions
    clearTransactions: (state) => {
      state.items = [];
      state.pagination = initialState.pagination;
    },
    
    // Reset to initial state
    resetTransactionState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // Fetch transactions pending
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Fetch transactions fulfilled
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.pagination = action.payload.pagination;
        state.aggregateStats = action.payload.aggregateStats || initialState.aggregateStats;
      })
      // Fetch transactions rejected
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch transactions';
      });
  }
});

// Export actions
export const {
  setSearch,
  setSort,
  setPage,
  setPageSize,
  clearTransactions,
  resetTransactionState
} = transactionSlice.actions;

// Selectors
export const selectTransactions = (state) => state.transactions.items;
export const selectPagination = (state) => state.transactions.pagination;
export const selectAggregateStats = (state) => state.transactions.aggregateStats;
export const selectLoading = (state) => state.transactions.loading;
export const selectError = (state) => state.transactions.error;
export const selectSearch = (state) => state.transactions.search;

// Memoized selector for sort parameters
const selectSortBy = (state) => state.transactions.sortBy;
const selectSortOrder = (state) => state.transactions.sortOrder;

export const selectSort = createSelector(
  [selectSortBy, selectSortOrder],
  (sortBy, sortOrder) => ({
    sortBy,
    sortOrder
  })
);

export default transactionSlice.reducer;

