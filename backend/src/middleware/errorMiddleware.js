import { formatErrorResponse } from '../utils/errorHandler.js';

/**
 * Global error handling middleware
 */
export const errorMiddleware = (err, req, res, next) => {
  console.error('Error:', err);

  const errorResponse = formatErrorResponse(err);
  res.status(errorResponse.statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
};

