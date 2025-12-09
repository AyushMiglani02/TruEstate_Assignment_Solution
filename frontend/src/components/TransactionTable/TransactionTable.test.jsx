import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, beforeEach } from 'vitest';
import { TransactionTable } from './TransactionTable';
import transactionReducer from '../../store/slices/transactionSlice';
import filterReducer from '../../store/slices/filterSlice';

const mockTransactions = [
  {
    transactionId: 'TXN001',
    date: '2024-01-15',
    customerName: 'John Doe',
    customerRegion: 'North',
    gender: 'Male',
    age: 35,
    productName: 'Laptop',
    productCategory: 'Electronics',
    quantity: 1,
    paymentMethod: 'Credit Card',
  },
  {
    transactionId: 'TXN002',
    date: '2024-01-16',
    customerName: 'Jane Smith',
    customerRegion: 'South',
    gender: 'Female',
    age: 28,
    productName: 'Smartphone',
    productCategory: 'Electronics',
    quantity: 2,
    paymentMethod: 'Debit Card',
  },
];

const createMockStore = (transactionState = {}) => {
  return configureStore({
    reducer: {
      transactions: transactionReducer,
      filters: filterReducer,
    },
    preloadedState: {
      transactions: {
        items: [],
        pagination: {},
        loading: false,
        error: null,
        search: '',
        sortBy: 'date',
        sortOrder: 'desc',
        ...transactionState,
      },
    },
  });
};

describe('TransactionTable', () => {
  describe('Rendering - Loading State', () => {
    it('should show loading state', () => {
      const store = createMockStore({ loading: true });

      render(
        <Provider store={store}>
          <TransactionTable />
        </Provider>
      );

      expect(screen.getByText(/loading transactions/i)).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should have loading spinner', () => {
      const store = createMockStore({ loading: true });

      render(
        <Provider store={store}>
          <TransactionTable />
        </Provider>
      );

      const spinner = document.querySelector('.loading-spinner');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Rendering - Error State', () => {
    it('should show error message', () => {
      const store = createMockStore({ error: 'Failed to load transactions' });

      render(
        <Provider store={store}>
          <TransactionTable />
        </Provider>
      );

      expect(screen.getByText(/failed to load transactions/i)).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should display error icon', () => {
      const store = createMockStore({ error: 'Network error' });

      render(
        <Provider store={store}>
          <TransactionTable />
        </Provider>
      );

      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });
  });

  describe('Rendering - Empty State', () => {
    it('should show empty state when no transactions', () => {
      const store = createMockStore({ items: [] });

      render(
        <Provider store={store}>
          <TransactionTable />
        </Provider>
      );

      expect(screen.getByText(/no transactions found/i)).toBeInTheDocument();
      expect(screen.getByText(/try adjusting your filters/i)).toBeInTheDocument();
    });

    it('should display empty icon', () => {
      const store = createMockStore({ items: [] });

      render(
        <Provider store={store}>
          <TransactionTable />
        </Provider>
      );

      expect(screen.getByText('📭')).toBeInTheDocument();
    });
  });

  describe('Rendering - Table with Data', () => {
    it('should render table with transactions', () => {
      const store = createMockStore({ items: mockTransactions });

      render(
        <Provider store={store}>
          <TransactionTable />
        </Provider>
      );

      expect(screen.getByRole('region', { name: /transactions table/i })).toBeInTheDocument();
      expect(screen.getByText('TXN001')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should render all column headers', () => {
      const store = createMockStore({ items: mockTransactions });

      render(
        <Provider store={store}>
          <TransactionTable />
        </Provider>
      );

      expect(screen.getByText('Transaction ID')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Customer')).toBeInTheDocument();
      expect(screen.getByText('Region')).toBeInTheDocument();
      expect(screen.getByText('Gender')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByText('Product')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Quantity')).toBeInTheDocument();
      expect(screen.getByText('Payment Method')).toBeInTheDocument();
    });

    it('should render all transaction data', () => {
      const store = createMockStore({ items: mockTransactions });

      render(
        <Provider store={store}>
          <TransactionTable />
        </Provider>
      );

      // First transaction
      expect(screen.getByText('TXN001')).toBeInTheDocument();
      expect(screen.getByText('2024-01-15')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('North')).toBeInTheDocument();
      expect(screen.getByText('Male')).toBeInTheDocument();
      expect(screen.getByText('35')).toBeInTheDocument();
      expect(screen.getByText('Laptop')).toBeInTheDocument();
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('Credit Card')).toBeInTheDocument();

      // Second transaction
      expect(screen.getByText('TXN002')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should render footer with transaction count', () => {
      const store = createMockStore({ items: mockTransactions });

      render(
        <Provider store={store}>
          <TransactionTable />
        </Provider>
      );

      expect(screen.getByText(/displaying 2 transactions/i)).toBeInTheDocument();
    });

    it('should use singular "transaction" for count of 1', () => {
      const store = createMockStore({ items: [mockTransactions[0]] });

      render(
        <Provider store={store}>
          <TransactionTable />
        </Provider>
      );

      expect(screen.getByText(/displaying 1 transaction$/i)).toBeInTheDocument();
    });

    it('should render correct number of rows', () => {
      const store = createMockStore({ items: mockTransactions });

      render(
        <Provider store={store}>
          <TransactionTable />
        </Provider>
      );

      const rows = screen.getAllByRole('row');
      // 1 header row + 2 data rows
      expect(rows).toHaveLength(3);
    });
  });

  describe('Redux Integration', () => {
    it('should display transactions from Redux store', () => {
      const store = createMockStore({ items: mockTransactions });

      render(
        <Provider store={store}>
          <TransactionTable />
        </Provider>
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should react to loading state changes', () => {
      const store = createMockStore({ loading: true, items: [] });

      const { rerender } = render(
        <Provider store={store}>
          <TransactionTable />
        </Provider>
      );

      expect(screen.getByText(/loading transactions/i)).toBeInTheDocument();

      // Update store
      const updatedStore = createMockStore({ loading: false, items: mockTransactions });

      rerender(
        <Provider store={updatedStore}>
          <TransactionTable />
        </Provider>
      );

      expect(screen.queryByText(/loading transactions/i)).not.toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should handle empty array', () => {
      const store = createMockStore({ items: [] });

      render(
        <Provider store={store}>
          <TransactionTable />
        </Provider>
      );

      expect(screen.getByText(/no transactions found/i)).toBeInTheDocument();
    });

    it('should handle null items', () => {
      const store = createMockStore({ items: null });

      render(
        <Provider store={store}>
          <TransactionTable />
        </Provider>
      );

      expect(screen.getByText(/no transactions found/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have region role for table', () => {
      const store = createMockStore({ items: mockTransactions });

      render(
        <Provider store={store}>
          <TransactionTable />
        </Provider>
      );

      expect(screen.getByRole('region', { name: /transactions table/i })).toBeInTheDocument();
    });

    it('should have status role for loading state', () => {
      const store = createMockStore({ loading: true });

      render(
        <Provider store={store}>
          <TransactionTable />
        </Provider>
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should have alert role for error state', () => {
      const store = createMockStore({ error: 'Error message' });

      render(
        <Provider store={store}>
          <TransactionTable />
        </Provider>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should have aria-live for loading text', () => {
      const store = createMockStore({ loading: true });

      render(
        <Provider store={store}>
          <TransactionTable />
        </Provider>
      );

      const loadingElement = screen.getByRole('status');
      expect(loadingElement).toHaveAttribute('aria-live', 'polite');
    });

    it('should have aria-live for footer count', () => {
      const store = createMockStore({ items: mockTransactions });

      render(
        <Provider store={store}>
          <TransactionTable />
        </Provider>
      );

      const footer = screen.getByText(/displaying 2 transactions/i);
      expect(footer).toHaveAttribute('aria-live', 'polite');
    });

    it('should have scope on table headers', () => {
      const store = createMockStore({ items: mockTransactions });

      render(
        <Provider store={store}>
          <TransactionTable />
        </Provider>
      );

      const headers = screen.getAllByRole('columnheader');
      headers.forEach(header => {
        expect(header).toHaveAttribute('scope', 'col');
      });
    });

    it('should hide decorative icons from screen readers', () => {
      const store = createMockStore({ loading: true });

      render(
        <Provider store={store}>
          <TransactionTable />
        </Provider>
      );

      const spinner = document.querySelector('.loading-spinner');
      expect(spinner).toHaveAttribute('aria-hidden', 'true');
    });
  });
});

