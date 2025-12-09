import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, beforeEach } from 'vitest';
import { Pagination } from './Pagination';
import transactionReducer from '../../store/slices/transactionSlice';
import filterReducer from '../../store/slices/filterSlice';

const createMockStore = (paginationState = {}) => {
  return configureStore({
    reducer: {
      transactions: transactionReducer,
      filters: filterReducer,
    },
    preloadedState: {
      transactions: {
        items: [],
        pagination: {
          currentPage: 1,
          pageSize: 10,
          totalItems: 100,
          totalPages: 10,
          hasNextPage: true,
          hasPreviousPage: false,
          ...paginationState,
        },
        loading: false,
        error: null,
        search: '',
        sortBy: 'date',
        sortOrder: 'desc',
      },
    },
  });
};

describe('Pagination', () => {
  describe('Rendering', () => {
    it('should render pagination info', () => {
      const store = createMockStore();
      
      render(
        <Provider store={store}>
          <Pagination />
        </Provider>
      );

      expect(screen.getByText(/showing/i)).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText(/100/)).toBeInTheDocument();
    });

    it('should render page navigation buttons', () => {
      const store = createMockStore();
      
      render(
        <Provider store={store}>
          <Pagination />
        </Provider>
      );

      expect(screen.getByLabelText(/previous page/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/next page/i)).toBeInTheDocument();
    });

    it('should render page size selector', () => {
      const store = createMockStore();
      
      render(
        <Provider store={store}>
          <Pagination />
        </Provider>
      );

      expect(screen.getByLabelText(/results per page/i)).toBeInTheDocument();
      expect(screen.getByText(/per page:/i)).toBeInTheDocument();
    });

    it('should render current page indicator', () => {
      const store = createMockStore();
      
      render(
        <Provider store={store}>
          <Pagination />
        </Provider>
      );

      expect(screen.getByText(/page/i)).toBeInTheDocument();
    });

    it('should show "No results found" when totalItems is 0', () => {
      const store = createMockStore({
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });
      
      render(
        <Provider store={store}>
          <Pagination />
        </Provider>
      );

      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/previous page/i)).not.toBeInTheDocument();
    });

    it('should display correct item range', () => {
      const store = createMockStore({
        currentPage: 3,
        pageSize: 25,
        totalItems: 100,
      });
      
      render(
        <Provider store={store}>
          <Pagination />
        </Provider>
      );

      // Page 3 with 25 per page: items 51-75
      expect(screen.getByText('51')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
    });

    it('should handle last page correctly', () => {
      const store = createMockStore({
        currentPage: 10,
        pageSize: 10,
        totalItems: 95,
        totalPages: 10,
        hasNextPage: false,
        hasPreviousPage: true,
      });
      
      render(
        <Provider store={store}>
          <Pagination />
        </Provider>
      );

      // Last page: items 91-95 (not 100)
      expect(screen.getByText('91')).toBeInTheDocument();
      expect(screen.getByText('95')).toBeInTheDocument();
    });
  });

  describe('User Interaction', () => {
    it('should navigate to next page', () => {
      const store = createMockStore({
        currentPage: 1,
        hasNextPage: true,
      });
      
      render(
        <Provider store={store}>
          <Pagination />
        </Provider>
      );

      const nextButton = screen.getByLabelText(/next page/i);
      fireEvent.click(nextButton);

      expect(store.getState().transactions.pagination.currentPage).toBe(2);
    });

    it('should navigate to previous page', () => {
      const store = createMockStore({
        currentPage: 3,
        hasPreviousPage: true,
      });
      
      render(
        <Provider store={store}>
          <Pagination />
        </Provider>
      );

      const prevButton = screen.getByLabelText(/previous page/i);
      fireEvent.click(prevButton);

      expect(store.getState().transactions.pagination.currentPage).toBe(2);
    });

    it('should change page size', () => {
      const store = createMockStore();
      
      render(
        <Provider store={store}>
          <Pagination />
        </Provider>
      );

      const pageSizeSelect = screen.getByLabelText(/results per page/i);
      fireEvent.change(pageSizeSelect, { target: { value: '25' } });

      expect(store.getState().transactions.pagination.pageSize).toBe(25);
    });

    it('should reset to page 1 when changing page size', () => {
      const store = createMockStore({
        currentPage: 5,
      });
      
      render(
        <Provider store={store}>
          <Pagination />
        </Provider>
      );

      const pageSizeSelect = screen.getByLabelText(/results per page/i);
      fireEvent.change(pageSizeSelect, { target: { value: '50' } });

      expect(store.getState().transactions.pagination.currentPage).toBe(1);
    });

    it('should not navigate when previous is disabled', () => {
      const store = createMockStore({
        currentPage: 1,
        hasPreviousPage: false,
      });
      
      render(
        <Provider store={store}>
          <Pagination />
        </Provider>
      );

      const prevButton = screen.getByLabelText(/previous page/i);
      expect(prevButton).toBeDisabled();
      
      fireEvent.click(prevButton);
      expect(store.getState().transactions.pagination.currentPage).toBe(1);
    });

    it('should not navigate when next is disabled', () => {
      const store = createMockStore({
        currentPage: 10,
        hasNextPage: false,
      });
      
      render(
        <Provider store={store}>
          <Pagination />
        </Provider>
      );

      const nextButton = screen.getByLabelText(/next page/i);
      expect(nextButton).toBeDisabled();
      
      fireEvent.click(nextButton);
      expect(store.getState().transactions.pagination.currentPage).toBe(10);
    });
  });

  describe('Redux Integration', () => {
    it('should dispatch setPage action on navigation', () => {
      const store = createMockStore({
        currentPage: 2,
        hasNextPage: true,
        hasPreviousPage: true,
      });
      
      render(
        <Provider store={store}>
          <Pagination />
        </Provider>
      );

      const nextButton = screen.getByLabelText(/next page/i);
      fireEvent.click(nextButton);

      expect(store.getState().transactions.pagination.currentPage).toBe(3);

      const prevButton = screen.getByLabelText(/previous page/i);
      fireEvent.click(prevButton);

      expect(store.getState().transactions.pagination.currentPage).toBe(2);
    });

    it('should dispatch setPageSize and setPage(1) on page size change', () => {
      const store = createMockStore({
        currentPage: 5,
        pageSize: 10,
      });
      
      render(
        <Provider store={store}>
          <Pagination />
        </Provider>
      );

      const pageSizeSelect = screen.getByLabelText(/results per page/i);
      fireEvent.change(pageSizeSelect, { target: { value: '100' } });

      const state = store.getState().transactions.pagination;
      expect(state.pageSize).toBe(100);
      expect(state.currentPage).toBe(1);
    });

    it('should sync with store pagination state', () => {
      const store = createMockStore({
        currentPage: 7,
        pageSize: 50,
        totalItems: 500,
        totalPages: 10,
      });
      
      render(
        <Provider store={store}>
          <Pagination />
        </Provider>
      );

      expect(screen.getByText(/page/i).textContent).toContain('7');
      expect(screen.getByText(/page/i).textContent).toContain('10');
    });
  });

  describe('Accessibility', () => {
    it('should have navigation role', () => {
      const store = createMockStore();
      
      render(
        <Provider store={store}>
          <Pagination />
        </Provider>
      );

      const nav = screen.getByRole('navigation', { name: /pagination/i });
      expect(nav).toBeInTheDocument();
    });

    it('should have aria-labels on buttons', () => {
      const store = createMockStore();
      
      render(
        <Provider store={store}>
          <Pagination />
        </Provider>
      );

      expect(screen.getByLabelText(/previous page/i)).toHaveAttribute('aria-label');
      expect(screen.getByLabelText(/next page/i)).toHaveAttribute('aria-label');
    });

    it('should have aria-label on page size select', () => {
      const store = createMockStore();
      
      render(
        <Provider store={store}>
          <Pagination />
        </Provider>
      );

      const select = screen.getByLabelText(/results per page/i);
      expect(select).toHaveAttribute('aria-label', 'Results per page');
    });

    it('should have aria-current on page indicator', () => {
      const store = createMockStore();
      
      render(
        <Provider store={store}>
          <Pagination />
        </Provider>
      );

      const pageIndicator = screen.getByText(/page/i).closest('.page-indicator');
      expect(pageIndicator).toHaveAttribute('aria-current', 'page');
    });

    it('should be keyboard accessible', () => {
      const store = createMockStore({
        hasNextPage: true,
        hasPreviousPage: true,
      });
      
      render(
        <Provider store={store}>
          <Pagination />
        </Provider>
      );

      const nextButton = screen.getByLabelText(/next page/i);
      nextButton.focus();
      expect(document.activeElement).toBe(nextButton);

      const prevButton = screen.getByLabelText(/previous page/i);
      prevButton.focus();
      expect(document.activeElement).toBe(prevButton);
    });

    it('should render all page size options', () => {
      const store = createMockStore();
      
      render(
        <Provider store={store}>
          <Pagination />
        </Provider>
      );

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(4); // 10, 25, 50, 100
      expect(options.map(opt => opt.value)).toEqual(['10', '25', '50', '100']);
    });
  });
});

