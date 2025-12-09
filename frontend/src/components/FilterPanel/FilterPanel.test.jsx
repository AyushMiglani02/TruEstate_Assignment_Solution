import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, beforeEach } from 'vitest';
import { FilterPanel } from './FilterPanel';
import transactionReducer from '../../store/slices/transactionSlice';
import filterReducer from '../../store/slices/filterSlice';

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      transactions: transactionReducer,
      filters: filterReducer,
    },
    preloadedState: initialState,
  });
};

describe('FilterPanel', () => {
  let store;

  beforeEach(() => {
    store = createMockStore();
  });

  describe('Rendering', () => {
    it('should render filter panel with title', () => {
      render(
        <Provider store={store}>
          <FilterPanel />
        </Provider>
      );

      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('should render all filter groups', () => {
      render(
        <Provider store={store}>
          <FilterPanel />
        </Provider>
      );

      expect(screen.getByText('Customer Region')).toBeInTheDocument();
      expect(screen.getByText('Gender')).toBeInTheDocument();
      expect(screen.getByText('Age Range')).toBeInTheDocument();
      expect(screen.getByText('Product Category')).toBeInTheDocument();
      expect(screen.getByText('Payment Method')).toBeInTheDocument();
    });

    it('should render region filter options', () => {
      render(
        <Provider store={store}>
          <FilterPanel />
        </Provider>
      );

      expect(screen.getByText('North')).toBeInTheDocument();
      expect(screen.getByText('South')).toBeInTheDocument();
      expect(screen.getByText('East')).toBeInTheDocument();
      expect(screen.getByText('West')).toBeInTheDocument();
    });

    it('should render gender filter options', () => {
      render(
        <Provider store={store}>
          <FilterPanel />
        </Provider>
      );

      expect(screen.getByText('Male')).toBeInTheDocument();
      expect(screen.getByText('Female')).toBeInTheDocument();
      expect(screen.getByText('Other')).toBeInTheDocument();
    });

    it('should render age range inputs', () => {
      render(
        <Provider store={store}>
          <FilterPanel />
        </Provider>
      );

      expect(screen.getByLabelText(/minimum age/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/maximum age/i)).toBeInTheDocument();
    });

    it('should not show "Clear All" button when no filters are active', () => {
      render(
        <Provider store={store}>
          <FilterPanel />
        </Provider>
      );

      expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
    });

    it('should show "Clear All" button when filters are active', () => {
      const storeWithFilters = createMockStore({
        filters: {
          customerRegion: ['North'],
          gender: [],
          ageRange: { min: 0, max: 100 },
          productCategory: [],
          tags: [],
          paymentMethod: [],
          dateRange: { start: null, end: null },
          options: {},
          optionsLoading: false,
          optionsError: null,
        },
      });

      render(
        <Provider store={storeWithFilters}>
          <FilterPanel />
        </Provider>
      );

      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });
  });

  describe('User Interaction - Region Filter', () => {
    it('should toggle region filter on checkbox click', () => {
      render(
        <Provider store={store}>
          <FilterPanel />
        </Provider>
      );

      const northCheckbox = screen.getByLabelText(/filter by north region/i);
      fireEvent.click(northCheckbox);

      expect(store.getState().filters.customerRegion).toContain('North');

      fireEvent.click(northCheckbox);
      expect(store.getState().filters.customerRegion).not.toContain('North');
    });

    it('should allow multiple region selections', () => {
      render(
        <Provider store={store}>
          <FilterPanel />
        </Provider>
      );

      fireEvent.click(screen.getByLabelText(/filter by north region/i));
      fireEvent.click(screen.getByLabelText(/filter by south region/i));

      const regions = store.getState().filters.customerRegion;
      expect(regions).toContain('North');
      expect(regions).toContain('South');
      expect(regions).toHaveLength(2);
    });
  });

  describe('User Interaction - Gender Filter', () => {
    it('should toggle gender filter on checkbox click', () => {
      render(
        <Provider store={store}>
          <FilterPanel />
        </Provider>
      );

      const maleCheckbox = screen.getByLabelText(/filter by male/i);
      fireEvent.click(maleCheckbox);

      expect(store.getState().filters.gender).toContain('Male');

      fireEvent.click(maleCheckbox);
      expect(store.getState().filters.gender).not.toContain('Male');
    });

    it('should allow multiple gender selections', () => {
      render(
        <Provider store={store}>
          <FilterPanel />
        </Provider>
      );

      fireEvent.click(screen.getByLabelText(/filter by male/i));
      fireEvent.click(screen.getByLabelText(/filter by female/i));

      const genders = store.getState().filters.gender;
      expect(genders).toContain('Male');
      expect(genders).toContain('Female');
      expect(genders).toHaveLength(2);
    });
  });

  describe('User Interaction - Age Range', () => {
    it('should update minimum age', () => {
      render(
        <Provider store={store}>
          <FilterPanel />
        </Provider>
      );

      const minInput = screen.getByLabelText(/minimum age/i);
      fireEvent.change(minInput, { target: { value: '25' } });

      expect(store.getState().filters.ageRange.min).toBe(25);
    });

    it('should update maximum age', () => {
      render(
        <Provider store={store}>
          <FilterPanel />
        </Provider>
      );

      const maxInput = screen.getByLabelText(/maximum age/i);
      fireEvent.change(maxInput, { target: { value: '50' } });

      expect(store.getState().filters.ageRange.max).toBe(50);
    });

    it('should update both min and max age', () => {
      render(
        <Provider store={store}>
          <FilterPanel />
        </Provider>
      );

      const minInput = screen.getByLabelText(/minimum age/i);
      const maxInput = screen.getByLabelText(/maximum age/i);

      fireEvent.change(minInput, { target: { value: '18' } });
      fireEvent.change(maxInput, { target: { value: '65' } });

      const ageRange = store.getState().filters.ageRange;
      expect(ageRange.min).toBe(18);
      expect(ageRange.max).toBe(65);
    });
  });

  describe('User Interaction - Category Filter', () => {
    it('should toggle category filter on checkbox click', () => {
      render(
        <Provider store={store}>
          <FilterPanel />
        </Provider>
      );

      const electronicsCheckbox = screen.getByLabelText(/filter by electronics category/i);
      fireEvent.click(electronicsCheckbox);

      expect(store.getState().filters.productCategory).toContain('Electronics');

      fireEvent.click(electronicsCheckbox);
      expect(store.getState().filters.productCategory).not.toContain('Electronics');
    });
  });

  describe('User Interaction - Payment Method Filter', () => {
    it('should toggle payment method filter on checkbox click', () => {
      render(
        <Provider store={store}>
          <FilterPanel />
        </Provider>
      );

      const creditCardCheckbox = screen.getByLabelText(/filter by credit card/i);
      fireEvent.click(creditCardCheckbox);

      expect(store.getState().filters.paymentMethod).toContain('Credit Card');

      fireEvent.click(creditCardCheckbox);
      expect(store.getState().filters.paymentMethod).not.toContain('Credit Card');
    });
  });

  describe('Redux Integration', () => {
    it('should clear all filters when "Clear All" is clicked', () => {
      const storeWithFilters = createMockStore({
        filters: {
          customerRegion: ['North', 'South'],
          gender: ['Male'],
          ageRange: { min: 25, max: 50 },
          productCategory: ['Electronics'],
          tags: [],
          paymentMethod: ['Credit Card'],
          dateRange: { start: null, end: null },
          options: {},
          optionsLoading: false,
          optionsError: null,
        },
      });

      render(
        <Provider store={storeWithFilters}>
          <FilterPanel />
        </Provider>
      );

      const clearButton = screen.getByText('Clear All');
      fireEvent.click(clearButton);

      const state = storeWithFilters.getState().filters;
      expect(state.customerRegion).toHaveLength(0);
      expect(state.gender).toHaveLength(0);
      expect(state.productCategory).toHaveLength(0);
      expect(state.paymentMethod).toHaveLength(0);
      expect(state.ageRange).toEqual({ min: 0, max: 100 });
    });

    it('should sync with store state', () => {
      const storeWithFilters = createMockStore({
        filters: {
          customerRegion: ['North'],
          gender: ['Female'],
          ageRange: { min: 30, max: 60 },
          productCategory: ['Books'],
          tags: [],
          paymentMethod: ['PayPal'],
          dateRange: { start: null, end: null },
          options: {},
          optionsLoading: false,
          optionsError: null,
        },
      });

      render(
        <Provider store={storeWithFilters}>
          <FilterPanel />
        </Provider>
      );

      expect(screen.getByLabelText(/filter by north region/i)).toBeChecked();
      expect(screen.getByLabelText(/filter by female/i)).toBeChecked();
      expect(screen.getByLabelText(/filter by books category/i)).toBeChecked();
      expect(screen.getByLabelText(/filter by paypal/i)).toBeChecked();
      expect(screen.getByLabelText(/minimum age/i)).toHaveValue(30);
      expect(screen.getByLabelText(/maximum age/i)).toHaveValue(60);
    });
  });

  describe('Accessibility', () => {
    it('should have region role', () => {
      render(
        <Provider store={store}>
          <FilterPanel />
        </Provider>
      );

      expect(screen.getByRole('region', { name: /filters/i })).toBeInTheDocument();
    });

    it('should have group roles for filter sections', () => {
      render(
        <Provider store={store}>
          <FilterPanel />
        </Provider>
      );

      expect(screen.getByRole('group', { name: /customer region filters/i })).toBeInTheDocument();
      expect(screen.getByRole('group', { name: /gender filters/i })).toBeInTheDocument();
      expect(screen.getByRole('group', { name: /age range filters/i })).toBeInTheDocument();
    });

    it('should have aria-labels on all checkboxes', () => {
      render(
        <Provider store={store}>
          <FilterPanel />
        </Provider>
      );

      expect(screen.getByLabelText(/filter by north region/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/filter by male/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/filter by electronics category/i)).toBeInTheDocument();
    });

    it('should have aria-label on clear button', () => {
      const storeWithFilters = createMockStore({
        filters: {
          customerRegion: ['North'],
          gender: [],
          ageRange: { min: 0, max: 100 },
          productCategory: [],
          tags: [],
          paymentMethod: [],
          dateRange: { start: null, end: null },
          options: {},
          optionsLoading: false,
          optionsError: null,
        },
      });

      render(
        <Provider store={storeWithFilters}>
          <FilterPanel />
        </Provider>
      );

      const clearButton = screen.getByLabelText(/clear all filters/i);
      expect(clearButton).toHaveAttribute('aria-label', 'Clear all filters');
    });

    it('should be keyboard accessible', () => {
      render(
        <Provider store={store}>
          <FilterPanel />
        </Provider>
      );

      const northCheckbox = screen.getByLabelText(/filter by north region/i);
      northCheckbox.focus();
      expect(document.activeElement).toBe(northCheckbox);

      const minAgeInput = screen.getByLabelText(/minimum age/i);
      minAgeInput.focus();
      expect(document.activeElement).toBe(minAgeInput);
    });
  });
});

