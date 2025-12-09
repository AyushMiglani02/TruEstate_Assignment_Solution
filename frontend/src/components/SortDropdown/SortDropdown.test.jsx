import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, beforeEach } from 'vitest';
import { SortDropdown } from './SortDropdown';
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

describe('SortDropdown', () => {
  let store;

  beforeEach(() => {
    store = createMockStore();
  });

  describe('Rendering', () => {
    it('should render sort dropdown with label', () => {
      render(
        <Provider store={store}>
          <SortDropdown />
        </Provider>
      );

      expect(screen.getByText('Sort By')).toBeInTheDocument();
      expect(screen.getByLabelText(/sort transactions/i)).toBeInTheDocument();
    });

    it('should render all sort options', () => {
      render(
        <Provider store={store}>
          <SortDropdown />
        </Provider>
      );

      expect(screen.getByText('Date (Newest First)')).toBeInTheDocument();
      expect(screen.getByText('Date (Oldest First)')).toBeInTheDocument();
      expect(screen.getByText('Quantity (High to Low)')).toBeInTheDocument();
      expect(screen.getByText('Quantity (Low to High)')).toBeInTheDocument();
      expect(screen.getByText('Customer Name (A-Z)')).toBeInTheDocument();
      expect(screen.getByText('Customer Name (Z-A)')).toBeInTheDocument();
    });

    it('should have default selection (date-desc)', () => {
      render(
        <Provider store={store}>
          <SortDropdown />
        </Provider>
      );

      const select = screen.getByLabelText(/sort transactions/i);
      expect(select).toHaveValue('date-desc');
    });

    it('should render with custom initial sort state', () => {
      const customStore = createMockStore({
        transactions: {
          items: [],
          pagination: {},
          loading: false,
          error: null,
          search: '',
          sortBy: 'quantity',
          sortOrder: 'asc',
        },
      });

      render(
        <Provider store={customStore}>
          <SortDropdown />
        </Provider>
      );

      const select = screen.getByLabelText(/sort transactions/i);
      expect(select).toHaveValue('quantity-asc');
    });
  });

  describe('User Interaction', () => {
    it('should change selection on user input', () => {
      render(
        <Provider store={store}>
          <SortDropdown />
        </Provider>
      );

      const select = screen.getByLabelText(/sort transactions/i);
      
      fireEvent.change(select, { target: { value: 'quantity-desc' } });
      expect(select).toHaveValue('quantity-desc');
    });

    it('should update Redux store when selection changes', () => {
      render(
        <Provider store={store}>
          <SortDropdown />
        </Provider>
      );

      const select = screen.getByLabelText(/sort transactions/i);
      
      fireEvent.change(select, { target: { value: 'quantity-asc' } });

      const state = store.getState().transactions;
      expect(state.sortBy).toBe('quantity');
      expect(state.sortOrder).toBe('asc');
    });

    it('should handle multiple selection changes', () => {
      render(
        <Provider store={store}>
          <SortDropdown />
        </Provider>
      );

      const select = screen.getByLabelText(/sort transactions/i);
      
      // Change to quantity desc
      fireEvent.change(select, { target: { value: 'quantity-desc' } });
      expect(store.getState().transactions.sortBy).toBe('quantity');
      expect(store.getState().transactions.sortOrder).toBe('desc');

      // Change to customer name asc
      fireEvent.change(select, { target: { value: 'customerName-asc' } });
      expect(store.getState().transactions.sortBy).toBe('customerName');
      expect(store.getState().transactions.sortOrder).toBe('asc');

      // Change to date asc
      fireEvent.change(select, { target: { value: 'date-asc' } });
      expect(store.getState().transactions.sortBy).toBe('date');
      expect(store.getState().transactions.sortOrder).toBe('asc');
    });
  });

  describe('Redux Integration', () => {
    it('should dispatch setSort action with correct payload', () => {
      render(
        <Provider store={store}>
          <SortDropdown />
        </Provider>
      );

      const select = screen.getByLabelText(/sort transactions/i);
      
      fireEvent.change(select, { target: { value: 'customerName-desc' } });

      const state = store.getState().transactions;
      expect(state.sortBy).toBe('customerName');
      expect(state.sortOrder).toBe('desc');
    });

    it('should sync with store when sort is updated externally', () => {
      const { rerender } = render(
        <Provider store={store}>
          <SortDropdown />
        </Provider>
      );

      const select = screen.getByLabelText(/sort transactions/i);
      expect(select).toHaveValue('date-desc');

      // Update store externally
      store.dispatch({ 
        type: 'transactions/setSort', 
        payload: { sortBy: 'quantity', sortOrder: 'asc' }
      });

      // Force rerender
      rerender(
        <Provider store={store}>
          <SortDropdown />
        </Provider>
      );

      expect(select).toHaveValue('quantity-asc');
    });

    it('should handle all sort options correctly', () => {
      render(
        <Provider store={store}>
          <SortDropdown />
        </Provider>
      );

      const select = screen.getByLabelText(/sort transactions/i);
      
      const testCases = [
        { value: 'date-desc', sortBy: 'date', sortOrder: 'desc' },
        { value: 'date-asc', sortBy: 'date', sortOrder: 'asc' },
        { value: 'quantity-desc', sortBy: 'quantity', sortOrder: 'desc' },
        { value: 'quantity-asc', sortBy: 'quantity', sortOrder: 'asc' },
        { value: 'customerName-asc', sortBy: 'customerName', sortOrder: 'asc' },
        { value: 'customerName-desc', sortBy: 'customerName', sortOrder: 'desc' },
      ];

      testCases.forEach(({ value, sortBy, sortOrder }) => {
        fireEvent.change(select, { target: { value } });
        const state = store.getState().transactions;
        expect(state.sortBy).toBe(sortBy);
        expect(state.sortOrder).toBe(sortOrder);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper label association', () => {
      render(
        <Provider store={store}>
          <SortDropdown />
        </Provider>
      );

      const select = screen.getByLabelText(/sort transactions/i);
      expect(select).toHaveAttribute('id', 'sort-select');
    });

    it('should have aria-label', () => {
      render(
        <Provider store={store}>
          <SortDropdown />
        </Provider>
      );

      const select = screen.getByLabelText(/sort transactions/i);
      expect(select).toHaveAttribute('aria-label', 'Sort transactions');
    });

    it('should be keyboard accessible', () => {
      render(
        <Provider store={store}>
          <SortDropdown />
        </Provider>
      );

      const select = screen.getByLabelText(/sort transactions/i);
      
      // Should be focusable
      select.focus();
      expect(document.activeElement).toBe(select);
    });

    it('should have unique option values', () => {
      render(
        <Provider store={store}>
          <SortDropdown />
        </Provider>
      );

      const options = screen.getAllByRole('option');
      const values = options.map(opt => opt.getAttribute('value'));
      const uniqueValues = new Set(values);
      
      expect(uniqueValues.size).toBe(values.length);
    });
  });
});

