import { ValidationError, NotFoundError, InternalError, formatErrorResponse } from '../../../src/utils/errorHandler.js';

describe('ErrorHandler', () => {
  describe('ValidationError', () => {
    it('should create a validation error with message and errors', () => {
      const error = new ValidationError('Validation failed', ['Error 1', 'Error 2']);
      
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.errors).toEqual(['Error 1', 'Error 2']);
    });

    it('should create a validation error without errors array', () => {
      const error = new ValidationError('Validation failed');
      
      expect(error.errors).toEqual([]);
    });
  });

  describe('NotFoundError', () => {
    it('should create a not found error', () => {
      const error = new NotFoundError('Resource not found');
      
      expect(error.name).toBe('NotFoundError');
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('InternalError', () => {
    it('should create an internal server error', () => {
      const error = new InternalError('Server error');
      
      expect(error.name).toBe('InternalError');
      expect(error.message).toBe('Server error');
      expect(error.statusCode).toBe(500);
    });
  });

  describe('formatErrorResponse', () => {
    it('should format ValidationError correctly', () => {
      const error = new ValidationError('Invalid input', ['Field is required']);
      const response = formatErrorResponse(error);
      
      expect(response).toEqual({
        success: false,
        error: 'Invalid input',
        errors: ['Field is required'],
        statusCode: 400
      });
    });

    it('should format NotFoundError correctly', () => {
      const error = new NotFoundError('Resource not found');
      const response = formatErrorResponse(error);
      
      expect(response).toEqual({
        success: false,
        error: 'Resource not found',
        statusCode: 404
      });
    });

    it('should format InternalError correctly', () => {
      const error = new InternalError('Server error');
      const response = formatErrorResponse(error);
      
      expect(response).toEqual({
        success: false,
        error: 'Server error',
        statusCode: 500
      });
    });

    it('should format generic Error correctly', () => {
      const error = new Error('Unknown error');
      const response = formatErrorResponse(error);
      
      expect(response).toEqual({
        success: false,
        error: 'Unknown error',
        statusCode: 500
      });
    });

    it('should handle errors with custom statusCode', () => {
      const error = new Error('Custom error');
      error.statusCode = 403;
      const response = formatErrorResponse(error);
      
      expect(response.statusCode).toBe(403);
    });

    it('should handle errors without message', () => {
      const error = new Error();
      const response = formatErrorResponse(error);
      
      expect(response.error).toBe('Internal server error');
    });
  });
});

