import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import transactionReducer, {
  setSearch,
  setSort,
  setPage,
  setPageSize,
  clearTransactions,
  resetTransactionState,
  fetchTransactions,
  selectTransactions,
  selectPagination,
  selectLoading,
  selectError,
  selectSearch,
  selectSort
} from './transactionSlice';

describe('transactionSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        transactions: transactionReducer
      }
    });
  });

  describe('reducers', () => {
    it('should handle setSearch', () => {
      store.dispatch(setSearch('test query'));
      
      const state = store.getState().transactions;
      expect(state.search).toBe('test query');
    });

    it('should handle setSort', () => {
      store.dispatch(setSort({ sortBy: 'quantity', sortOrder: 'asc' }));
      
      const state = store.getState().transactions;
      expect(state.sortBy).toBe('quantity');
      expect(state.sortOrder).toBe('asc');
    });

    it('should handle setPage', () => {
      store.dispatch(setPage(5));
      
      const state = store.getState().transactions;
      expect(state.pagination.currentPage).toBe(5);
    });

    it('should handle setPageSize', () => {
      store.dispatch(setPageSize(20));
      
      const state = store.getState().transactions;
      expect(state.pagination.pageSize).toBe(20);
      expect(state.pagination.currentPage).toBe(1); // Should reset to page 1
    });

    it('should handle clearTransactions', () => {
      // First set some data
      store.dispatch(setSearch('test'));
      store.dispatch(clearTransactions());
      
      const state = store.getState().transactions;
      expect(state.items).toEqual([]);
      expect(state.pagination.currentPage).toBe(1);
    });

    it('should handle resetTransactionState', () => {
      // First modify state
      store.dispatch(setSearch('test'));
      store.dispatch(setPage(3));
      
      // Then reset
      store.dispatch(resetTransactionState());
      
      const state = store.getState().transactions;
      expect(state.search).toBe('');
      expect(state.pagination.currentPage).toBe(1);
      expect(state.sortBy).toBe('date');
    });
  });

  describe('async thunks', () => {
    it('should handle fetchTransactions.pending', () => {
      store.dispatch(fetchTransactions.pending());
      
      const state = store.getState().transactions;
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle fetchTransactions.fulfilled', () => {
      const mockData = {
        items: [{ id: 1, customerName: 'John Doe' }],
        pagination: {
          currentPage: 1,
          pageSize: 10,
          totalItems: 1,
          totalPages: 1
        }
      };

      store.dispatch(fetchTransactions.fulfilled(mockData));
      
      const state = store.getState().transactions;
      expect(state.loading).toBe(false);
      expect(state.items).toEqual(mockData.items);
      expect(state.pagination).toEqual(mockData.pagination);
    });

    it('should handle fetchTransactions.rejected', () => {
      const errorMessage = 'Network error';
      store.dispatch(fetchTransactions.rejected(null, '', {}, errorMessage));
      
      const state = store.getState().transactions;
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('selectors', () => {
    it('selectTransactions should return items', () => {
      const mockItems = [{ id: 1 }];
      store.dispatch(fetchTransactions.fulfilled({
        items: mockItems,
        pagination: {}
      }));
      
      const items = selectTransactions(store.getState());
      expect(items).toEqual(mockItems);
    });

    it('selectPagination should return pagination', () => {
      const pagination = selectPagination(store.getState());
      expect(pagination).toHaveProperty('currentPage');
      expect(pagination).toHaveProperty('pageSize');
    });

    it('selectLoading should return loading state', () => {
      const loading = selectLoading(store.getState());
      expect(typeof loading).toBe('boolean');
    });

    it('selectError should return error', () => {
      const error = selectError(store.getState());
      expect(error).toBe(null);
    });

    it('selectSearch should return search term', () => {
      store.dispatch(setSearch('test'));
      const search = selectSearch(store.getState());
      expect(search).toBe('test');
    });

    it('selectSort should return sort state', () => {
      store.dispatch(setSort({ sortBy: 'quantity', sortOrder: 'asc' }));
      const sort = selectSort(store.getState());
      expect(sort).toEqual({ sortBy: 'quantity', sortOrder: 'asc' });
    });
  });
});

