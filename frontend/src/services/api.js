/**
 * API Service Layer
 * Handles all HTTP requests to the backend
 */

import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 60000, // 60 seconds to handle large dataset queries
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle errors globally
    const errorMessage = error.response?.data?.error || error.message || 'An error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

/**
 * Fetches transactions with query parameters
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Transaction data with pagination
 */
export const fetchTransactions = async (params = {}) => {
  const { search, filters, sortBy, sortOrder, page, pageSize } = params;

  const queryParams = new URLSearchParams();

  if (search) queryParams.append('search', search);
  if (sortBy) queryParams.append('sortBy', sortBy);
  if (sortOrder) queryParams.append('sortOrder', sortOrder);
  if (page) queryParams.append('page', page.toString());
  if (pageSize) queryParams.append('pageSize', pageSize.toString());
  if (filters && Object.keys(filters).length > 0) {
    queryParams.append('filters', JSON.stringify(filters));
  }

  const response = await api.get(`/api/transactions?${queryParams.toString()}`);
  return response.data.data;
};

/**
 * Fetches available filter options
 * @param {Object} params - Optional search/filter params
 * @returns {Promise<Object>} Filter options
 */
export const fetchFilterOptions = async (params = {}) => {
  const { search } = params;

  const queryParams = new URLSearchParams();
  if (search) queryParams.append('search', search);

  const response = await api.get(`/api/filters/options?${queryParams.toString()}`);
  return response.data.data;
};

/**
 * Fetches transaction statistics
 * @returns {Promise<Object>} Statistics data
 */
export const fetchStatistics = async () => {
  const response = await api.get('/api/statistics');
  return response.data.data;
};

/**
 * Health check endpoint
 * @returns {Promise<Object>} Server health status
 */
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;

