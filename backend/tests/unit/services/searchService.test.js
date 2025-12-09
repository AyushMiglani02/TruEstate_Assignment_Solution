import searchService from '../../../src/services/searchService.js';
import { sampleTransactions } from '../../fixtures/sampleData.js';

describe('SearchService', () => {
  describe('searchTransactions', () => {
    it('should return all data when search term is empty string', () => {
      const result = searchService.searchTransactions(sampleTransactions, '');
      expect(result).toEqual(sampleTransactions);
      expect(result).toHaveLength(5);
    });

    it('should return all data when search term is null', () => {
      const result = searchService.searchTransactions(sampleTransactions, null);
      expect(result).toEqual(sampleTransactions);
    });

    it('should return all data when search term is undefined', () => {
      const result = searchService.searchTransactions(sampleTransactions, undefined);
      expect(result).toEqual(sampleTransactions);
    });

    it('should return all data when search term is only whitespace', () => {
      const result = searchService.searchTransactions(sampleTransactions, '   ');
      expect(result).toEqual(sampleTransactions);
    });

    it('should search customer name case-insensitively', () => {
      const result = searchService.searchTransactions(sampleTransactions, 'john');
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.some(t => t.customerName === 'John Doe')).toBe(true);
    });

    it('should search customer name with uppercase', () => {
      const result = searchService.searchTransactions(sampleTransactions, 'ALICE');
      expect(result).toHaveLength(1);
      expect(result[0].customerName).toBe('Alice Johnson');
    });

    it('should search customer name with mixed case', () => {
      const result = searchService.searchTransactions(sampleTransactions, 'BoB');
      expect(result).toHaveLength(1);
      expect(result[0].customerName).toBe('Bob Smith');
    });

    it('should search by partial customer name', () => {
      const result = searchService.searchTransactions(sampleTransactions, 'Jo');
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.some(t => t.customerName.includes('Jo'))).toBe(true);
    });

    it('should search by phone number exactly', () => {
      const result = searchService.searchTransactions(sampleTransactions, '1234567890');
      expect(result).toHaveLength(1);
      expect(result[0].phoneNumber).toBe('1234567890');
    });

    it('should search by partial phone number', () => {
      const result = searchService.searchTransactions(sampleTransactions, '555');
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.every(t => t.phoneNumber.includes('555'))).toBe(true);
    });

    it('should return empty array when no matches found', () => {
      const result = searchService.searchTransactions(sampleTransactions, 'NonExistentName');
      expect(result).toEqual([]);
    });

    it('should match either customer name or phone number', () => {
      const result = searchService.searchTransactions(sampleTransactions, '123');
      // Should find transactions with '123' in phone or name
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle special characters in search term', () => {
      const dataWithSpecialChars = [
        { customerName: 'O\'Brien', phoneNumber: '1234567890' },
        { customerName: 'John Doe', phoneNumber: '9876543210' }
      ];
      const result = searchService.searchTransactions(dataWithSpecialChars, "O'Brien");
      expect(result).toHaveLength(1);
    });

    it('should trim whitespace from search term', () => {
      const result = searchService.searchTransactions(sampleTransactions, '  John  ');
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.some(t => t.customerName === 'John Doe')).toBe(true);
    });

    it('should handle transactions with missing customerName', () => {
      const dataWithMissing = [
        { phoneNumber: '1234567890' },
        { customerName: 'John Doe', phoneNumber: '9876543210' }
      ];
      const result = searchService.searchTransactions(dataWithMissing, 'John');
      expect(result).toHaveLength(1);
    });

    it('should handle transactions with missing phoneNumber', () => {
      const dataWithMissing = [
        { customerName: 'John Doe' },
        { customerName: 'Alice Johnson', phoneNumber: '9876543210' }
      ];
      const result = searchService.searchTransactions(dataWithMissing, '987');
      expect(result).toHaveLength(1);
    });

    it('should return all data for non-string search term', () => {
      const result = searchService.searchTransactions(sampleTransactions, 123);
      expect(result).toEqual(sampleTransactions);
    });

    it('should handle empty data array', () => {
      const result = searchService.searchTransactions([], 'John');
      expect(result).toEqual([]);
    });

    it('should handle search term with numbers', () => {
      const result = searchService.searchTransactions(sampleTransactions, '987');
      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('isValidSearchTerm', () => {
    it('should return true for valid search term', () => {
      expect(searchService.isValidSearchTerm('John')).toBe(true);
    });

    it('should return true for empty string', () => {
      expect(searchService.isValidSearchTerm('')).toBe(true);
    });

    it('should return true for null', () => {
      expect(searchService.isValidSearchTerm(null)).toBe(true);
    });

    it('should return true for undefined', () => {
      expect(searchService.isValidSearchTerm(undefined)).toBe(true);
    });

    it('should return false for non-string types', () => {
      expect(searchService.isValidSearchTerm(123)).toBe(false);
      expect(searchService.isValidSearchTerm({})).toBe(false);
      expect(searchService.isValidSearchTerm([])).toBe(false);
    });

    it('should return false for very long search terms', () => {
      const longTerm = 'a'.repeat(101);
      expect(searchService.isValidSearchTerm(longTerm)).toBe(false);
    });

    it('should return true for search term at max length', () => {
      const maxTerm = 'a'.repeat(100);
      expect(searchService.isValidSearchTerm(maxTerm)).toBe(true);
    });

    it('should trim before validating length', () => {
      const termWithSpaces = '  ' + 'a'.repeat(100) + '  ';
      expect(searchService.isValidSearchTerm(termWithSpaces)).toBe(true);
    });
  });

  describe('getSearchStats', () => {
    it('should return correct statistics', () => {
      const filtered = sampleTransactions.slice(0, 2);
      const stats = searchService.getSearchStats(sampleTransactions, filtered, 'test');

      expect(stats.searchTerm).toBe('test');
      expect(stats.totalRecords).toBe(5);
      expect(stats.matchedRecords).toBe(2);
      expect(stats.matchPercentage).toBe('40.00');
    });

    it('should handle 100% match', () => {
      const stats = searchService.getSearchStats(sampleTransactions, sampleTransactions, '');

      expect(stats.matchedRecords).toBe(stats.totalRecords);
      expect(stats.matchPercentage).toBe('100.00');
    });

    it('should handle 0% match', () => {
      const stats = searchService.getSearchStats(sampleTransactions, [], 'nonexistent');

      expect(stats.matchedRecords).toBe(0);
      expect(stats.matchPercentage).toBe('0.00');
    });

    it('should format percentage to 2 decimal places', () => {
      const filtered = sampleTransactions.slice(0, 1);
      const stats = searchService.getSearchStats(sampleTransactions, filtered, 'test');

      expect(stats.matchPercentage).toBe('20.00');
    });
  });
});

