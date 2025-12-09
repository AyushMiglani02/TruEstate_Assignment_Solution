/**
 * Filter Slice - Manages filter state
 */

import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { fetchFilterOptions as apiFetchFilterOptions } from '../../services/api';

// Initial state
const initialState = {
  // Active filters
  customerRegion: [],
  gender: [],
  ageRange: { min: 0, max: 100 },
  productCategory: [],
  tags: [],
  paymentMethod: [],
  dateRange: { start: null, end: null },
  
  // Available options
  options: {
    regions: [],
    genders: [],
    categories: [],
    tags: [],
    paymentMethods: []
  },
  
  // Loading state for options
  optionsLoading: false,
  optionsError: null
};

/**
 * Async thunk to fetch filter options
 */
export const fetchFilterOptions = createAsyncThunk(
  'filters/fetchFilterOptions',
  async (params, { rejectWithValue }) => {
    try {
      const data = await apiFetchFilterOptions(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Filter slice
 */
const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    // Set customer region filter
    setCustomerRegion: (state, action) => {
      state.customerRegion = action.payload;
    },
    
    // Set gender filter
    setGender: (state, action) => {
      state.gender = action.payload;
    },
    
    // Set age range filter
    setAgeRange: (state, action) => {
      state.ageRange = action.payload;
    },
    
    // Set product category filter
    setProductCategory: (state, action) => {
      state.productCategory = action.payload;
    },
    
    // Set tags filter
    setTags: (state, action) => {
      state.tags = action.payload;
    },
    
    // Set payment method filter
    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    
    // Set date range filter
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
    },
    
    // Clear all filters
    clearAllFilters: (state) => {
      state.customerRegion = [];
      state.gender = [];
      state.ageRange = { min: 0, max: 100 };
      state.productCategory = [];
      state.tags = [];
      state.paymentMethod = [];
      state.dateRange = { start: null, end: null };
    },
    
    // Reset to initial state
    resetFilterState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // Fetch filter options pending
      .addCase(fetchFilterOptions.pending, (state) => {
        state.optionsLoading = true;
        state.optionsError = null;
      })
      // Fetch filter options fulfilled
      .addCase(fetchFilterOptions.fulfilled, (state, action) => {
        state.optionsLoading = false;
        state.options = action.payload;
      })
      // Fetch filter options rejected
      .addCase(fetchFilterOptions.rejected, (state, action) => {
        state.optionsLoading = false;
        state.optionsError = action.payload || 'Failed to fetch filter options';
      });
  }
});

// Export actions
export const {
  setCustomerRegion,
  setGender,
  setAgeRange,
  setProductCategory,
  setTags,
  setPaymentMethod,
  setDateRange,
  clearAllFilters,
  resetFilterState
} = filterSlice.actions;

// Selectors
const selectCustomerRegionFilter = (state) => state.filters.customerRegion;
const selectGenderFilter = (state) => state.filters.gender;
const selectAgeRangeFilter = (state) => state.filters.ageRange;
const selectProductCategoryFilter = (state) => state.filters.productCategory;
const selectTagsFilter = (state) => state.filters.tags;
const selectPaymentMethodFilter = (state) => state.filters.paymentMethod;
const selectDateRangeFilter = (state) => state.filters.dateRange;

// Memoized selector for active filters
export const selectActiveFilters = createSelector(
  [
    selectCustomerRegionFilter,
    selectGenderFilter,
    selectAgeRangeFilter,
    selectProductCategoryFilter,
    selectTagsFilter,
    selectPaymentMethodFilter,
    selectDateRangeFilter
  ],
  (customerRegion, gender, ageRange, productCategory, tags, paymentMethod, dateRange) => ({
    customerRegion,
    gender,
    ageRange,
    productCategory,
    tags,
    paymentMethod,
    dateRange
  })
);

export const selectFilterOptions = (state) => state.filters.options;
export const selectOptionsLoading = (state) => state.filters.optionsLoading;
export const selectOptionsError = (state) => state.filters.optionsError;

// Selector to check if any filters are active
export const selectHasActiveFilters = (state) => {
  const filters = state.filters;
  return (
    filters.customerRegion.length > 0 ||
    filters.gender.length > 0 ||
    filters.ageRange.min > 0 ||
    filters.ageRange.max < 100 ||
    filters.productCategory.length > 0 ||
    filters.tags.length > 0 ||
    filters.paymentMethod.length > 0 ||
    filters.dateRange.start !== null ||
    filters.dateRange.end !== null
  );
};

export default filterSlice.reducer;

