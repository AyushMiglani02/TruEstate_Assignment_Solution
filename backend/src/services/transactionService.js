/**
 * TransactionService - Main orchestrator for transaction operations
 * 
 * Combines search, filter, sort, and pagination services
 * Provides a single entry point for all transaction queries
 */

import dataLoader from '../utils/dataLoader.js';
import searchService from './searchService.js';
import filterService from './filterService.js';
import sortService from './sortService.js';
import paginationService from './paginationService.js';

class TransactionService {
  /**
   * Gets transactions with search, filter, sort, and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Paginated and filtered transactions with aggregate stats
   */
  async getTransactions(params = {}) {
    try {
      // Load data from cache or file
      let data = dataLoader.getData();
      
      if (!data) {
        throw new Error('Data not loaded. Please restart the server.');
      }

      // Extract parameters
      const {
        search = '',
        filters = {},
        sortBy = 'date',
        sortOrder = 'desc',
        page = 1,
        pageSize = 10
      } = params;

      // Apply search
      data = searchService.searchTransactions(data, search);

      // Apply filters
      data = filterService.applyFilters(data, filters);

      // Calculate aggregate statistics from filtered data BEFORE pagination
      const aggregateStats = this.calculateAggregateStats(data);

      // Apply sorting
      data = sortService.sortTransactions(data, sortBy, sortOrder);

      // Apply pagination
      const result = paginationService.paginate(data, page, pageSize);

      // Add aggregate statistics to the result
      result.aggregateStats = aggregateStats;

      return result;
    } catch (error) {
      throw new Error(`Failed to get transactions: ${error.message}`);
    }
  }

  /**
   * Calculates aggregate statistics from a dataset
   * @param {Array} data - Transaction data array
   * @returns {Object} Aggregate statistics
   */
  calculateAggregateStats(data) {
    if (!data || data.length === 0) {
      return {
        totalUnits: 0,
        totalAmount: 0,
        totalDiscount: 0,
        recordCount: 0
      };
    }

    const totalUnits = data.reduce((sum, t) => sum + (parseInt(t.quantity) || 0), 0);
    const totalAmount = data.reduce((sum, t) => sum + (parseFloat(t.totalAmount || t.finalAmount) || 0), 0);
    const totalDiscount = data.reduce((sum, t) => {
      const total = parseFloat(t.totalAmount || 0);
      const final = parseFloat(t.finalAmount || 0);
      return sum + (total - final);
    }, 0);

    return {
      totalUnits,
      totalAmount,
      totalDiscount,
      recordCount: data.length
    };
  }

  /**
   * Gets filter options based on current search and filters
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Available filter options
   */
  async getFilterOptions(params = {}) {
    try {
      let data = dataLoader.getData();
      
      if (!data) {
        throw new Error('Data not loaded. Please restart the server.');
      }

      // Extract parameters
      const { search = '', filters = {} } = params;

      // Apply search to get relevant subset
      if (search) {
        data = searchService.searchTransactions(data, search);
      }

      // Get available options from current dataset
      const options = filterService.getFilterOptions(data);

      return options;
    } catch (error) {
      throw new Error(`Failed to get filter options: ${error.message}`);
    }
  }

  /**
   * Gets transaction statistics
   * @returns {Promise<Object>} Transaction statistics
   */
  async getStatistics() {
    try {
      const data = dataLoader.getData();
      
      if (!data) {
        throw new Error('Data not loaded. Please restart the server.');
      }

      return {
        totalTransactions: data.length,
        uniqueCustomers: new Set(data.map(t => t.customerId)).size,
        uniqueProducts: new Set(data.map(t => t.productId)).size,
        totalRevenue: data.reduce((sum, t) => sum + (t.finalAmount || 0), 0),
        averageOrderValue: data.reduce((sum, t) => sum + (t.finalAmount || 0), 0) / data.length
      };
    } catch (error) {
      throw new Error(`Failed to get statistics: ${error.message}`);
    }
  }

  /**
   * Validates query parameters
   * @param {Object} params - Parameters to validate
   * @returns {Object} Validation result with isValid and errors
   */
  validateParams(params) {
    const errors = [];

    // Validate search
    if (params.search && !searchService.isValidSearchTerm(params.search)) {
      errors.push('Invalid search term');
    }

    // Validate sort
    if (!sortService.isValidSort(params.sortBy, params.sortOrder)) {
      errors.push('Invalid sort parameters');
    }

    // Validate pagination
    const page = params.page ? parseInt(params.page) : 1;
    const pageSize = params.pageSize ? parseInt(params.pageSize) : 10;

    if (isNaN(page) || page < 1) {
      errors.push('Page must be a positive integer');
    }

    if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
      errors.push('Page size must be between 1 and 100');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
const transactionService = new TransactionService();
export default transactionService;

