/**
 * API Routes - Defines all API endpoints
 */

import express from 'express';
import { validateTransactionQuery } from '../middleware/validationMiddleware.js';
import {
  getTransactions,
  getFilterOptions,
  getStatistics
} from '../controllers/transactionController.js';

const router = express.Router();

/**
 * @route   GET /api/transactions
 * @desc    Get paginated, filtered, and sorted transactions
 * @access  Public
 * @query   search, filters, sortBy, sortOrder, page, pageSize
 */
router.get('/transactions', validateTransactionQuery, getTransactions);

/**
 * @route   GET /api/filters/options
 * @desc    Get available filter options
 * @access  Public
 * @query   search, filters
 */
router.get('/filters/options', getFilterOptions);

/**
 * @route   GET /api/statistics
 * @desc    Get transaction statistics
 * @access  Public
 */
router.get('/statistics', getStatistics);

export default router;

