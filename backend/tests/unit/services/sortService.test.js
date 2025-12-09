import sortService from '../../../src/services/sortService.js';
import { sampleTransactions } from '../../fixtures/sampleData.js';

describe('SortService', () => {
  describe('sortTransactions', () => {
    it('should return empty array for empty input', () => {
      const result = sortService.sortTransactions([]);
      expect(result).toEqual([]);
    });

    it('should return original data for invalid sortBy field', () => {
      const result = sortService.sortTransactions(sampleTransactions, 'invalidField');
      expect(result).toEqual(sampleTransactions);
    });

    it('should not mutate original array', () => {
      const original = [...sampleTransactions];
      sortService.sortTransactions(sampleTransactions, 'quantity');
      expect(sampleTransactions).toEqual(original);
    });

    it('should return original data for non-array input', () => {
      const result = sortService.sortTransactions('not an array');
      expect(result).toBe('not an array');
    });

    it('should use default sortBy (date) when not specified', () => {
      const result = sortService.sortTransactions(sampleTransactions);
      // Should be sorted by date newest first
      for (let i = 0; i < result.length - 1; i++) {
        expect(new Date(result[i].date) >= new Date(result[i + 1].date)).toBe(true);
      }
    });

    it('should use default sortOrder (desc) when not specified', () => {
      const result = sortService.sortTransactions(sampleTransactions, 'date');
      // Should be sorted newest first (descending)
      for (let i = 0; i < result.length - 1; i++) {
        expect(new Date(result[i].date) >= new Date(result[i + 1].date)).toBe(true);
      }
    });
  });

  describe('sortByDate', () => {
    it('should sort by date newest first (desc)', () => {
      const result = sortService.sortByDate([...sampleTransactions], 'desc');
      
      for (let i = 0; i < result.length - 1; i++) {
        const dateA = new Date(result[i].date);
        const dateB = new Date(result[i + 1].date);
        expect(dateA >= dateB).toBe(true);
      }
    });

    it('should sort by date oldest first (asc)', () => {
      const result = sortService.sortByDate([...sampleTransactions], 'asc');
      
      for (let i = 0; i < result.length - 1; i++) {
        const dateA = new Date(result[i].date);
        const dateB = new Date(result[i + 1].date);
        expect(dateA <= dateB).toBe(true);
      }
    });

    it('should handle same dates correctly', () => {
      const dataWithSameDates = [
        { ...sampleTransactions[0], date: '2025-01-15T10:00:00.000Z' },
        { ...sampleTransactions[1], date: '2025-01-15T10:00:00.000Z' }
      ];
      const result = sortService.sortByDate(dataWithSameDates, 'desc');
      
      expect(result).toHaveLength(2);
    });

    it('should use desc as default order', () => {
      const result = sortService.sortByDate([...sampleTransactions]);
      
      // Default should be newest first
      for (let i = 0; i < result.length - 1; i++) {
        expect(new Date(result[i].date) >= new Date(result[i + 1].date)).toBe(true);
      }
    });
  });

  describe('sortByQuantity', () => {
    it('should sort by quantity ascending', () => {
      const result = sortService.sortByQuantity([...sampleTransactions], 'asc');
      
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].quantity <= result[i + 1].quantity).toBe(true);
      }
    });

    it('should sort by quantity descending', () => {
      const result = sortService.sortByQuantity([...sampleTransactions], 'desc');
      
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].quantity >= result[i + 1].quantity).toBe(true);
      }
    });

    it('should handle missing quantity values', () => {
      const dataWithMissing = [
        { ...sampleTransactions[0], quantity: undefined },
        { ...sampleTransactions[1], quantity: 5 },
        { ...sampleTransactions[2], quantity: null }
      ];
      const result = sortService.sortByQuantity(dataWithMissing, 'asc');
      
      expect(result).toHaveLength(3);
      // Missing values should be treated as 0
    });

    it('should use asc as default order', () => {
      const result = sortService.sortByQuantity([...sampleTransactions]);
      
      // Default should be lowest first
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].quantity <= result[i + 1].quantity).toBe(true);
      }
    });
  });

  describe('sortByCustomerName', () => {
    it('should sort by customer name A-Z (asc)', () => {
      const result = sortService.sortByCustomerName([...sampleTransactions], 'asc');
      
      for (let i = 0; i < result.length - 1; i++) {
        const nameA = result[i].customerName.toLowerCase();
        const nameB = result[i + 1].customerName.toLowerCase();
        expect(nameA.localeCompare(nameB) <= 0).toBe(true);
      }
    });

    it('should sort by customer name Z-A (desc)', () => {
      const result = sortService.sortByCustomerName([...sampleTransactions], 'desc');
      
      for (let i = 0; i < result.length - 1; i++) {
        const nameA = result[i].customerName.toLowerCase();
        const nameB = result[i + 1].customerName.toLowerCase();
        expect(nameA.localeCompare(nameB) >= 0).toBe(true);
      }
    });

    it('should be case-insensitive', () => {
      const dataWithMixedCase = [
        { customerName: 'alice' },
        { customerName: 'BOB' },
        { customerName: 'Charlie' }
      ];
      const result = sortService.sortByCustomerName(dataWithMixedCase, 'asc');
      
      expect(result[0].customerName.toLowerCase()).toBe('alice');
      expect(result[1].customerName.toLowerCase()).toBe('bob');
      expect(result[2].customerName.toLowerCase()).toBe('charlie');
    });

    it('should handle empty/missing customer names', () => {
      const dataWithMissing = [
        { customerName: 'John' },
        { customerName: '' },
        { customerName: undefined },
        { customerName: 'Alice' }
      ];
      const result = sortService.sortByCustomerName(dataWithMissing, 'asc');
      
      expect(result).toHaveLength(4);
    });

    it('should use asc as default order', () => {
      const result = sortService.sortByCustomerName([...sampleTransactions]);
      
      // Default should be A-Z
      for (let i = 0; i < result.length - 1; i++) {
        const nameA = result[i].customerName.toLowerCase();
        const nameB = result[i + 1].customerName.toLowerCase();
        expect(nameA.localeCompare(nameB) <= 0).toBe(true);
      }
    });
  });

  describe('getSortOptions', () => {
    it('should return available sort fields', () => {
      const options = sortService.getSortOptions();
      
      expect(Array.isArray(options.fields)).toBe(true);
      expect(options.fields).toHaveLength(3);
    });

    it('should include date, quantity, and customerName fields', () => {
      const options = sortService.getSortOptions();
      const fieldValues = options.fields.map(f => f.value);
      
      expect(fieldValues).toContain('date');
      expect(fieldValues).toContain('quantity');
      expect(fieldValues).toContain('customerName');
    });

    it('should include field labels', () => {
      const options = sortService.getSortOptions();
      
      options.fields.forEach(field => {
        expect(field).toHaveProperty('value');
        expect(field).toHaveProperty('label');
        expect(field).toHaveProperty('defaultOrder');
      });
    });

    it('should return available sort orders', () => {
      const options = sortService.getSortOptions();
      
      expect(Array.isArray(options.orders)).toBe(true);
      expect(options.orders).toHaveLength(2);
    });

    it('should include asc and desc orders', () => {
      const options = sortService.getSortOptions();
      const orderValues = options.orders.map(o => o.value);
      
      expect(orderValues).toContain('asc');
      expect(orderValues).toContain('desc');
    });

    it('should have correct default orders for each field', () => {
      const options = sortService.getSortOptions();
      
      const dateField = options.fields.find(f => f.value === 'date');
      const quantityField = options.fields.find(f => f.value === 'quantity');
      const nameField = options.fields.find(f => f.value === 'customerName');
      
      expect(dateField.defaultOrder).toBe('desc'); // Newest first
      expect(quantityField.defaultOrder).toBe('asc'); // Lowest first
      expect(nameField.defaultOrder).toBe('asc'); // A-Z
    });
  });

  describe('isValidSort', () => {
    it('should return true for valid sort field and order', () => {
      expect(sortService.isValidSort('date', 'asc')).toBe(true);
      expect(sortService.isValidSort('quantity', 'desc')).toBe(true);
      expect(sortService.isValidSort('customerName', 'asc')).toBe(true);
    });

    it('should return false for invalid sort field', () => {
      expect(sortService.isValidSort('invalidField', 'asc')).toBe(false);
    });

    it('should return false for invalid sort order', () => {
      expect(sortService.isValidSort('date', 'invalid')).toBe(false);
    });

    it('should return true when sortBy is undefined', () => {
      expect(sortService.isValidSort(undefined, 'asc')).toBe(true);
    });

    it('should return true when sortOrder is undefined', () => {
      expect(sortService.isValidSort('date', undefined)).toBe(true);
    });

    it('should return true when both are undefined', () => {
      expect(sortService.isValidSort(undefined, undefined)).toBe(true);
    });

    it('should return false when both are invalid', () => {
      expect(sortService.isValidSort('invalid', 'invalid')).toBe(false);
    });
  });
});

