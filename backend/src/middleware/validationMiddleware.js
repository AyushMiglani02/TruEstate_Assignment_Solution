import { validatePagination, validateSort, validateFilters } from '../utils/validators.js';
import { ValidationError } from '../utils/errorHandler.js';

/**
 * Validates query parameters for transaction endpoints
 */
export const validateTransactionQuery = (req, res, next) => {
  try {
    const { page, pageSize, sortBy, sortOrder, filters } = req.query;

    // Validate pagination
    const paginationValidation = validatePagination(page, pageSize);
    if (!paginationValidation.isValid) {
      throw new ValidationError('Invalid pagination parameters', paginationValidation.errors);
    }

    // Validate sort
    const sortValidation = validateSort(sortBy, sortOrder);
    if (!sortValidation.isValid) {
      throw new ValidationError('Invalid sort parameters', sortValidation.errors);
    }

    // Validate filters if provided
    if (filters) {
      try {
        const parsedFilters = typeof filters === 'string' ? JSON.parse(filters) : filters;
        const filterValidation = validateFilters(parsedFilters);
        if (!filterValidation.isValid) {
          throw new ValidationError('Invalid filter parameters', filterValidation.errors);
        }
      } catch (error) {
        if (error instanceof ValidationError) {
          throw error;
        }
        throw new ValidationError('Invalid filter format. Must be valid JSON');
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

