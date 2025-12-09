import { validateTransactionQuery } from '../../../src/middleware/validationMiddleware.js';
import { ValidationError } from '../../../src/utils/errorHandler.js';

// Helper to create mock functions
const createMockFn = () => {
  const calls = [];
  const fn = function(...args) {
    calls.push(args);
    return fn;
  };
  fn.calls = calls;
  fn.mock = { calls };
  return fn;
};

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      query: {}
    };
    res = {};
    next = createMockFn();
  });

  describe('validateTransactionQuery', () => {
    it('should pass validation for valid query parameters', () => {
      req.query = {
        page: '1',
        pageSize: '10',
        sortBy: 'date',
        sortOrder: 'desc'
      };

      validateTransactionQuery(req, res, next);

      expect(next.calls).toHaveLength(1);
      expect(next.calls[0][0]).toBeUndefined();
    });

    it('should pass validation when no parameters provided', () => {
      req.query = {};

      validateTransactionQuery(req, res, next);

      expect(next.calls).toHaveLength(1);
      expect(next.calls[0][0]).toBeUndefined();
    });

    it('should fail validation for invalid page number', () => {
      req.query = { page: '-1' };

      validateTransactionQuery(req, res, next);

      expect(next.calls).toHaveLength(1);
      const error = next.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Invalid pagination parameters');
      expect(error.errors).toContain('Page number must be a positive integer');
    });

    it('should fail validation for invalid page size', () => {
      req.query = { pageSize: '101' };

      validateTransactionQuery(req, res, next);

      const error = next.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.errors).toContain('Page size must be between 1 and 100');
    });

    it('should fail validation for invalid sortBy field', () => {
      req.query = { sortBy: 'invalidField' };

      validateTransactionQuery(req, res, next);

      const error = next.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Invalid sort parameters');
    });

    it('should fail validation for invalid sortOrder', () => {
      req.query = { sortOrder: 'invalid' };

      validateTransactionQuery(req, res, next);

      const error = next.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should validate filters when provided as JSON string', () => {
      req.query = {
        filters: JSON.stringify({
          customerRegion: ['North'],
          ageRange: { min: 25, max: 50 }
        })
      };

      validateTransactionQuery(req, res, next);

      expect(next.calls[0][0]).toBeUndefined();
    });

    it('should fail validation for invalid filter format', () => {
      req.query = { filters: 'invalid-json' };

      validateTransactionQuery(req, res, next);

      const error = next.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Invalid filter format. Must be valid JSON');
    });

    it('should fail validation for invalid age range in filters', () => {
      req.query = {
        filters: JSON.stringify({
          ageRange: { min: 50, max: 25 }
        })
      };

      validateTransactionQuery(req, res, next);

      const error = next.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Invalid filter parameters');
      expect(error.errors).toContain('Age range min cannot be greater than max');
    });

    it('should fail validation for invalid date range in filters', () => {
      req.query = {
        filters: JSON.stringify({
          dateRange: { start: '2025-12-31', end: '2025-01-01' }
        })
      };

      validateTransactionQuery(req, res, next);

      const error = next.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.errors).toContain('Start date cannot be after end date');
    });

    it('should handle filters as object instead of string', () => {
      req.query = {
        filters: {
          customerRegion: ['North']
        }
      };

      validateTransactionQuery(req, res, next);

      expect(next.calls[0][0]).toBeUndefined();
    });

    it('should catch and pass through validation errors', () => {
      req.query = {
        page: 'abc',
        pageSize: 'xyz'
      };

      validateTransactionQuery(req, res, next);

      const error = next.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
    });
  });
});

