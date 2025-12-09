/**
 * Custom error classes for better error handling
 */

export class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.errors = errors;
  }
}

export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

export class InternalError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InternalError';
    this.statusCode = 500;
  }
}

/**
 * Formats error response
 * @param {Error} error - Error object
 * @returns {Object} Formatted error response
 */
export const formatErrorResponse = (error) => {
  if (error instanceof ValidationError) {
    return {
      success: false,
      error: error.message,
      errors: error.errors,
      statusCode: error.statusCode
    };
  }

  if (error instanceof NotFoundError) {
    return {
      success: false,
      error: error.message,
      statusCode: error.statusCode
    };
  }

  return {
    success: false,
    error: error.message || 'Internal server error',
    statusCode: error.statusCode || 500
  };
};

