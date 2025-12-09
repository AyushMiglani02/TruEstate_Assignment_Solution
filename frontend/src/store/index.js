/**
 * Redux Store Configuration
 */

import { configureStore } from '@reduxjs/toolkit';
import transactionReducer from './slices/transactionSlice';
import filterReducer from './slices/filterSlice';

export const store = configureStore({
  reducer: {
    transactions: transactionReducer,
    filters: filterReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['transactions/fetchTransactions/pending'],
      },
    }),
});

// Export store types for TypeScript support
export const getState = () => store.getState();
export const dispatch = (action) => store.dispatch(action);

export default store;

