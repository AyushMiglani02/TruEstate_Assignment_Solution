import { errorMiddleware, notFoundHandler } from '../../../src/middleware/errorMiddleware.js';
import { ValidationError, NotFoundError } from '../../../src/utils/errorHandler.js';

// Helper to create mock functions
const createMockFn = () => {
  const calls = [];
  const fn = function(...args) {
    calls.push(args);
    return this; // Return the parent object for chaining
  };
  fn.calls = calls;
  fn.mock = { calls };
  return fn;
};

describe('Error Middleware', () => {
  let req, res, next;
  let originalConsoleError;

  beforeEach(() => {
    req = {};
    const statusFn = createMockFn();
    const jsonFn = createMockFn();
    
    res = {
      status: function(code) {
        statusFn(code);
        return this;
      },
      json: function(data) {
        jsonFn(data);
        return this;
      },
      _statusCalls: statusFn.calls,
      _jsonCalls: jsonFn.calls
    };
    
    next = createMockFn();
    
    // Mock console.error to avoid cluttering test output
    originalConsoleError = console.error;
    console.error = () => {};
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  describe('errorMiddleware', () => {
    it('should handle ValidationError with 400 status', () => {
      const error = new ValidationError('Invalid input', ['Field required']);
      
      errorMiddleware(error, req, res, next);
      
      expect(res._statusCalls).toHaveLength(1);
      expect(res._statusCalls[0][0]).toBe(400);
      expect(res._jsonCalls).toHaveLength(1);
      expect(res._jsonCalls[0][0]).toEqual({
        success: false,
        error: 'Invalid input',
        errors: ['Field required'],
        statusCode: 400
      });
    });

    it('should handle NotFoundError with 404 status', () => {
      const error = new NotFoundError('Resource not found');
      
      errorMiddleware(error, req, res, next);
      
      expect(res._statusCalls[0][0]).toBe(404);
      expect(res._jsonCalls[0][0]).toEqual({
        success: false,
        error: 'Resource not found',
        statusCode: 404
      });
    });

    it('should handle generic Error with 500 status', () => {
      const error = new Error('Something went wrong');
      
      errorMiddleware(error, req, res, next);
      
      expect(res._statusCalls[0][0]).toBe(500);
      expect(res._jsonCalls[0][0]).toEqual({
        success: false,
        error: 'Something went wrong',
        statusCode: 500
      });
    });

    it('should handle errors with custom statusCode', () => {
      const error = new Error('Forbidden');
      error.statusCode = 403;
      
      errorMiddleware(error, req, res, next);
      
      expect(res._statusCalls[0][0]).toBe(403);
    });
  });

  describe('notFoundHandler', () => {
    it('should return 404 with error message', () => {
      notFoundHandler(req, res);
      
      expect(res._statusCalls[0][0]).toBe(404);
      expect(res._jsonCalls[0][0]).toEqual({
        success: false,
        error: 'Route not found'
      });
    });
  });
});

