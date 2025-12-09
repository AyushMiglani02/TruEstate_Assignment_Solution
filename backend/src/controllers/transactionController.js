/**
 * Transaction Controller - Handles HTTP requests for transactions
 */

import transactionServiceMongo from '../services/transactionServiceMongo.js';
import { ValidationError } from '../utils/errorHandler.js';

/**
 * Gets transactions with search, filter, sort, and pagination
 * GET /api/transactions
 */
export const getTransactions = async (req, res, next) => {
  try {
    const { search, filters, sortBy, sortOrder, page, pageSize } = req.query;

    // Parse filters if provided as JSON string
    let parsedFilters = {};
    if (filters) {
      try {
        parsedFilters = typeof filters === 'string' ? JSON.parse(filters) : filters;
      } catch (error) {
        throw new ValidationError('Invalid filters format. Must be valid JSON');
      }
    }

    // Get transactions from MongoDB
    const result = await transactionServiceMongo.getTransactions({
      search,
      filters: parsedFilters,
      sortBy,
      sortOrder,
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Gets available filter options
 * GET /api/filters/options
 */
export const getFilterOptions = async (req, res, next) => {
  try {
    const { search, filters } = req.query;

    // Parse filters if provided
    let parsedFilters = {};
    if (filters) {
      try {
        parsedFilters = typeof filters === 'string' ? JSON.parse(filters) : filters;
      } catch (error) {
        throw new ValidationError('Invalid filters format');
      }
    }

    const options = await transactionServiceMongo.getFilterOptions({
      search,
      filters: parsedFilters
    });

    res.json({
      success: true,
      data: options
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Gets transaction statistics
 * GET /api/statistics
 */
export const getStatistics = async (req, res, next) => {
  try {
    const stats = await transactionServiceMongo.getStatistics();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

