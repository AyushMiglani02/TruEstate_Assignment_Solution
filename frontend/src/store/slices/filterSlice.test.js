import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import filterReducer, {
  setCustomerRegion,
  setGender,
  setAgeRange,
  setProductCategory,
  setTags,
  setPaymentMethod,
  setDateRange,
  clearAllFilters,
  resetFilterState,
  fetchFilterOptions,
  selectActiveFilters,
  selectFilterOptions,
  selectHasActiveFilters
} from './filterSlice';

describe('filterSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        filters: filterReducer
      }
    });
  });

  describe('reducers', () => {
    it('should handle setCustomerRegion', () => {
      store.dispatch(setCustomerRegion(['North', 'South']));
      
      const state = store.getState().filters;
      expect(state.customerRegion).toEqual(['North', 'South']);
    });

    it('should handle setGender', () => {
      store.dispatch(setGender(['Male', 'Female']));
      
      const state = store.getState().filters;
      expect(state.gender).toEqual(['Male', 'Female']);
    });

    it('should handle setAgeRange', () => {
      store.dispatch(setAgeRange({ min: 25, max: 50 }));
      
      const state = store.getState().filters;
      expect(state.ageRange).toEqual({ min: 25, max: 50 });
    });

    it('should handle setProductCategory', () => {
      store.dispatch(setProductCategory(['Electronics']));
      
      const state = store.getState().filters;
      expect(state.productCategory).toEqual(['Electronics']);
    });

    it('should handle setTags', () => {
      store.dispatch(setTags(['tech', 'mobile']));
      
      const state = store.getState().filters;
      expect(state.tags).toEqual(['tech', 'mobile']);
    });

    it('should handle setPaymentMethod', () => {
      store.dispatch(setPaymentMethod(['Credit Card']));
      
      const state = store.getState().filters;
      expect(state.paymentMethod).toEqual(['Credit Card']);
    });

    it('should handle setDateRange', () => {
      const dateRange = { start: '2025-01-01', end: '2025-12-31' };
      store.dispatch(setDateRange(dateRange));
      
      const state = store.getState().filters;
      expect(state.dateRange).toEqual(dateRange);
    });

    it('should handle clearAllFilters', () => {
      // First set some filters
      store.dispatch(setCustomerRegion(['North']));
      store.dispatch(setGender(['Male']));
      store.dispatch(setAgeRange({ min: 25, max: 50 }));
      
      // Then clear
      store.dispatch(clearAllFilters());
      
      const state = store.getState().filters;
      expect(state.customerRegion).toEqual([]);
      expect(state.gender).toEqual([]);
      expect(state.ageRange).toEqual({ min: 0, max: 100 });
    });

    it('should handle resetFilterState', () => {
      // First modify state
      store.dispatch(setCustomerRegion(['North']));
      
      // Then reset
      store.dispatch(resetFilterState());
      
      const state = store.getState().filters;
      expect(state.customerRegion).toEqual([]);
      expect(state.options).toEqual({
        regions: [],
        genders: [],
        categories: [],
        tags: [],
        paymentMethods: []
      });
    });
  });

  describe('async thunks', () => {
    it('should handle fetchFilterOptions.pending', () => {
      store.dispatch(fetchFilterOptions.pending());
      
      const state = store.getState().filters;
      expect(state.optionsLoading).toBe(true);
      expect(state.optionsError).toBe(null);
    });

    it('should handle fetchFilterOptions.fulfilled', () => {
      const mockOptions = {
        regions: ['North', 'South'],
        genders: ['Male', 'Female'],
        categories: ['Electronics'],
        tags: ['tech'],
        paymentMethods: ['Credit Card']
      };

      store.dispatch(fetchFilterOptions.fulfilled(mockOptions));
      
      const state = store.getState().filters;
      expect(state.optionsLoading).toBe(false);
      expect(state.options).toEqual(mockOptions);
    });

    it('should handle fetchFilterOptions.rejected', () => {
      const errorMessage = 'Network error';
      store.dispatch(fetchFilterOptions.rejected(null, '', {}, errorMessage));
      
      const state = store.getState().filters;
      expect(state.optionsLoading).toBe(false);
      expect(state.optionsError).toBe(errorMessage);
    });
  });

  describe('selectors', () => {
    it('selectActiveFilters should return all active filters', () => {
      store.dispatch(setCustomerRegion(['North']));
      store.dispatch(setGender(['Male']));
      
      const filters = selectActiveFilters(store.getState());
      expect(filters.customerRegion).toEqual(['North']);
      expect(filters.gender).toEqual(['Male']);
    });

    it('selectFilterOptions should return options', () => {
      const options = selectFilterOptions(store.getState());
      expect(options).toHaveProperty('regions');
      expect(options).toHaveProperty('genders');
    });

    it('selectHasActiveFilters should return false initially', () => {
      const hasFilters = selectHasActiveFilters(store.getState());
      expect(hasFilters).toBe(false);
    });

    it('selectHasActiveFilters should return true when filters are set', () => {
      store.dispatch(setCustomerRegion(['North']));
      
      const hasFilters = selectHasActiveFilters(store.getState());
      expect(hasFilters).toBe(true);
    });

    it('selectHasActiveFilters should detect age range changes', () => {
      store.dispatch(setAgeRange({ min: 25, max: 100 }));
      
      const hasFilters = selectHasActiveFilters(store.getState());
      expect(hasFilters).toBe(true);
    });

    it('selectHasActiveFilters should detect date range changes', () => {
      store.dispatch(setDateRange({ start: '2025-01-01', end: null }));
      
      const hasFilters = selectHasActiveFilters(store.getState());
      expect(hasFilters).toBe(true);
    });
  });
});

