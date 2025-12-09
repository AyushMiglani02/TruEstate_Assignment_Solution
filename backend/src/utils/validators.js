/**
 * Validation utilities for request parameters
 */

/**
 * Validates pagination parameters
 * @param {number} page - Page number
 * @param {number} pageSize - Items per page
 * @returns {Object} Validation result with isValid and errors
 */
export const validatePagination = (page, pageSize) => {
  const errors = [];

  if (page !== undefined) {
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1) {
      errors.push('Page number must be a positive integer');
    }
  }

  if (pageSize !== undefined) {
    const pageSizeNum = parseInt(pageSize);
    if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 100) {
      errors.push('Page size must be between 1 and 100');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates sort parameters
 * @param {string} sortBy - Field to sort by
 * @param {string} sortOrder - Sort direction
 * @returns {Object} Validation result
 */
export const validateSort = (sortBy, sortOrder) => {
  const errors = [];
  const validSortFields = ['date', 'quantity', 'customerName'];
  const validSortOrders = ['asc', 'desc'];

  if (sortBy && !validSortFields.includes(sortBy)) {
    errors.push(`Invalid sortBy field. Must be one of: ${validSortFields.join(', ')}`);
  }

  if (sortOrder && !validSortOrders.includes(sortOrder)) {
    errors.push(`Invalid sortOrder. Must be one of: ${validSortOrders.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates filter parameters
 * @param {Object} filters - Filter object
 * @returns {Object} Validation result
 */
export const validateFilters = (filters) => {
  const errors = [];

  if (filters.ageRange) {
    const { min, max } = filters.ageRange;
    if (min !== undefined && max !== undefined && min > max) {
      errors.push('Age range min cannot be greater than max');
    }
    if (min !== undefined && (isNaN(min) || min < 0)) {
      errors.push('Age range min must be a non-negative number');
    }
    if (max !== undefined && (isNaN(max) || max < 0)) {
      errors.push('Age range max must be a non-negative number');
    }
  }

  if (filters.dateRange) {
    const { start, end } = filters.dateRange;
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (isNaN(startDate.getTime())) {
        errors.push('Invalid start date format');
      }
      if (isNaN(endDate.getTime())) {
        errors.push('Invalid end date format');
      }
      if (startDate > endDate) {
        errors.push('Start date cannot be after end date');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

