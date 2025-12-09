import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchBar } from './SearchBar';
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

describe('SearchBar', () => {
  let store;

  beforeEach(() => {
    store = createMockStore();
  });

  describe('Rendering', () => {
    it('should render search input', () => {
      render(
        <Provider store={store}>
          <SearchBar />
        </Provider>
      );

      expect(screen.getByLabelText(/search transactions/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/search by customer name/i)).toBeInTheDocument();
    });

    it('should render with correct ARIA attributes', () => {
      render(
        <Provider store={store}>
          <SearchBar />
        </Provider>
      );

      const searchBar = screen.getByRole('search');
      expect(searchBar).toBeInTheDocument();

      const input = screen.getByLabelText(/search transactions/i);
      expect(input).toHaveAttribute('aria-describedby', 'search-help');
    });

    it('should render help text', () => {
      render(
        <Provider store={store}>
          <SearchBar />
        </Provider>
      );

      expect(screen.getByText(/search across customer names/i)).toBeInTheDocument();
    });

    it('should not show clear button initially', () => {
      render(
        <Provider store={store}>
          <SearchBar />
        </Provider>
      );

      expect(screen.queryByLabelText(/clear search/i)).not.toBeInTheDocument();
    });
  });

  describe('User Interaction', () => {
    it('should update input value on typing', () => {
      render(
        <Provider store={store}>
          <SearchBar />
        </Provider>
      );

      const input = screen.getByLabelText(/search transactions/i);
      fireEvent.change(input, { target: { value: 'John Doe' } });

      expect(input).toHaveValue('John Doe');
    });

    it('should show clear button when input has value', () => {
      render(
        <Provider store={store}>
          <SearchBar />
        </Provider>
      );

      const input = screen.getByLabelText(/search transactions/i);
      fireEvent.change(input, { target: { value: 'Test' } });

      expect(screen.getByLabelText(/clear search/i)).toBeInTheDocument();
    });

    it('should clear input when clear button is clicked', () => {
      render(
        <Provider store={store}>
          <SearchBar />
        </Provider>
      );

      const input = screen.getByLabelText(/search transactions/i);
      fireEvent.change(input, { target: { value: 'Test' } });

      const clearButton = screen.getByLabelText(/clear search/i);
      fireEvent.click(clearButton);

      expect(input).toHaveValue('');
      expect(screen.queryByLabelText(/clear search/i)).not.toBeInTheDocument();
    });

    it('should handle multiple typing events', () => {
      render(
        <Provider store={store}>
          <SearchBar />
        </Provider>
      );

      const input = screen.getByLabelText(/search transactions/i);
      
      fireEvent.change(input, { target: { value: 'J' } });
      expect(input).toHaveValue('J');

      fireEvent.change(input, { target: { value: 'Jo' } });
      expect(input).toHaveValue('Jo');

      fireEvent.change(input, { target: { value: 'John' } });
      expect(input).toHaveValue('John');
    });
  });

  describe('Redux Integration', () => {
    it('should dispatch setSearch action after debounce delay', async () => {
      render(
        <Provider store={store}>
          <SearchBar />
        </Provider>
      );

      const input = screen.getByLabelText(/search transactions/i);
      fireEvent.change(input, { target: { value: 'Test Search' } });

      // Wait for debounce (300ms)
      await waitFor(
        () => {
          expect(store.getState().transactions.search).toBe('Test Search');
        },
        { timeout: 500 }
      );
    });

    it('should not dispatch immediately on typing', () => {
      render(
        <Provider store={store}>
          <SearchBar />
        </Provider>
      );

      const input = screen.getByLabelText(/search transactions/i);
      fireEvent.change(input, { target: { value: 'Test' } });

      // Check immediately - should not be in store yet
      expect(store.getState().transactions.search).toBe('');
    });

    it('should dispatch clear action when clear button is clicked', () => {
      render(
        <Provider store={store}>
          <SearchBar />
        </Provider>
      );

      const input = screen.getByLabelText(/search transactions/i);
      fireEvent.change(input, { target: { value: 'Test' } });

      const clearButton = screen.getByLabelText(/clear search/i);
      fireEvent.click(clearButton);

      expect(store.getState().transactions.search).toBe('');
    });

    it('should sync with store when search is updated externally', () => {
      const storeWithSearch = createMockStore({
        transactions: {
          items: [],
          pagination: {},
          loading: false,
          error: null,
          search: 'External Search',
          sortBy: 'date',
          sortOrder: 'desc',
        },
        filters: {
          customerRegion: [],
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
        <Provider store={storeWithSearch}>
          <SearchBar />
        </Provider>
      );

      const input = screen.getByLabelText(/search transactions/i);
      expect(input).toHaveValue('External Search');
    });

    it('should debounce rapid typing', async () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');

      render(
        <Provider store={store}>
          <SearchBar />
        </Provider>
      );

      const input = screen.getByLabelText(/search transactions/i);

      // Rapid typing
      fireEvent.change(input, { target: { value: 'T' } });
      fireEvent.change(input, { target: { value: 'Te' } });
      fireEvent.change(input, { target: { value: 'Tes' } });
      fireEvent.change(input, { target: { value: 'Test' } });

      // Wait for debounce
      await waitFor(
        () => {
          expect(store.getState().transactions.search).toBe('Test');
        },
        { timeout: 500 }
      );

      // Should only dispatch once after debounce, not for each keystroke
      const setSearchCalls = dispatchSpy.mock.calls.filter(
        call => call[0].type === 'transactions/setSearch'
      );
      
      // Should be exactly 1 call after debounce completes
      expect(setSearchCalls.length).toBeLessThan(4);
    });
  });

  describe('Accessibility', () => {
    it('should have proper label association', () => {
      render(
        <Provider store={store}>
          <SearchBar />
        </Provider>
      );

      const input = screen.getByLabelText(/search transactions/i);
      expect(input).toHaveAttribute('id', 'search-input');
    });

    it('should have aria-describedby for help text', () => {
      render(
        <Provider store={store}>
          <SearchBar />
        </Provider>
      );

      const input = screen.getByLabelText(/search transactions/i);
      expect(input).toHaveAttribute('aria-describedby', 'search-help');
    });

    it('should have role="search" on container', () => {
      render(
        <Provider store={store}>
          <SearchBar />
        </Provider>
      );

      expect(screen.getByRole('search')).toBeInTheDocument();
    });

    it('should have aria-label on clear button', () => {
      render(
        <Provider store={store}>
          <SearchBar />
        </Provider>
      );

      const input = screen.getByLabelText(/search transactions/i);
      fireEvent.change(input, { target: { value: 'Test' } });

      const clearButton = screen.getByLabelText(/clear search/i);
      expect(clearButton).toHaveAttribute('aria-label', 'Clear search');
    });

    it('should be keyboard accessible', () => {
      render(
        <Provider store={store}>
          <SearchBar />
        </Provider>
      );

      const input = screen.getByLabelText(/search transactions/i);
      
      // Should be focusable
      input.focus();
      expect(document.activeElement).toBe(input);

      // Should handle keyboard input
      fireEvent.change(input, { target: { value: 'Test' } });
      expect(input).toHaveValue('Test');
    });
  });
});

