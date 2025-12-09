import { validatePagination, validateSort, validateFilters } from '../../../src/utils/validators.js';

describe('Validators', () => {
  describe('validatePagination', () => {
    it('should pass validation for valid parameters', () => {
      const result = validatePagination(1, 10);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for negative page number', () => {
      const result = validatePagination(-1, 10);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Page number must be a positive integer');
    });

    it('should fail for zero page number', () => {
      const result = validatePagination(0, 10);
      expect(result.isValid).toBe(false);
    });

    it('should fail for page size greater than 100', () => {
      const result = validatePagination(1, 101);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Page size must be between 1 and 100');
    });

    it('should fail for non-numeric values', () => {
      const result = validatePagination('abc', 10);
      expect(result.isValid).toBe(false);
    });

    it('should pass when parameters are undefined', () => {
      const result = validatePagination(undefined, undefined);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateSort', () => {
    it('should pass validation for valid sort fields', () => {
      expect(validateSort('date', 'asc').isValid).toBe(true);
      expect(validateSort('quantity', 'desc').isValid).toBe(true);
      expect(validateSort('customerName', 'asc').isValid).toBe(true);
    });

    it('should fail for invalid sort field', () => {
      const result = validateSort('invalidField', 'asc');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Invalid sortBy field');
    });

    it('should fail for invalid sort order', () => {
      const result = validateSort('date', 'invalid');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Invalid sortOrder');
    });

    it('should pass when parameters are undefined', () => {
      const result = validateSort(undefined, undefined);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateFilters', () => {
    it('should pass validation for valid filters', () => {
      const filters = {
        customerRegion: ['North', 'South'],
        gender: ['Male'],
        ageRange: { min: 18, max: 65 }
      };
      const result = validateFilters(filters);
      expect(result.isValid).toBe(true);
    });

    it('should fail when age min is greater than max', () => {
      const filters = {
        ageRange: { min: 65, max: 18 }
      };
      const result = validateFilters(filters);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Age range min cannot be greater than max');
    });

    it('should fail for negative age values', () => {
      const filters = {
        ageRange: { min: -5, max: 65 }
      };
      const result = validateFilters(filters);
      expect(result.isValid).toBe(false);
    });

    it('should fail when start date is after end date', () => {
      const filters = {
        dateRange: { start: '2025-12-31', end: '2025-01-01' }
      };
      const result = validateFilters(filters);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Start date cannot be after end date');
    });

    it('should fail for invalid date formats', () => {
      const filters = {
        dateRange: { start: 'invalid-date', end: '2025-12-31' }
      };
      const result = validateFilters(filters);
      expect(result.isValid).toBe(false);
    });

    it('should pass for empty filters object', () => {
      const result = validateFilters({});
      expect(result.isValid).toBe(true);
    });
  });
});

