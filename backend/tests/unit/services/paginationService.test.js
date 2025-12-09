import paginationService from '../../../src/services/paginationService.js';
import { sampleTransactions } from '../../fixtures/sampleData.js';

describe('PaginationService', () => {
  describe('paginate', () => {
    it('should paginate data correctly for first page', () => {
      const result = paginationService.paginate(sampleTransactions, 1, 2);
      
      expect(result.items).toHaveLength(2);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.pageSize).toBe(2);
      expect(result.pagination.totalItems).toBe(5);
      expect(result.pagination.totalPages).toBe(3);
    });

    it('should paginate data correctly for middle page', () => {
      const result = paginationService.paginate(sampleTransactions, 2, 2);
      
      expect(result.items).toHaveLength(2);
      expect(result.pagination.currentPage).toBe(2);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.hasPreviousPage).toBe(true);
    });

    it('should paginate data correctly for last page', () => {
      const result = paginationService.paginate(sampleTransactions, 3, 2);
      
      expect(result.items).toHaveLength(1); // Last page has only 1 item
      expect(result.pagination.currentPage).toBe(3);
      expect(result.pagination.hasNextPage).toBe(false);
      expect(result.pagination.hasPreviousPage).toBe(true);
    });

    it('should use default page size of 10 when not specified', () => {
      const result = paginationService.paginate(sampleTransactions);
      
      expect(result.pagination.pageSize).toBe(10);
    });

    it('should use page 1 when not specified', () => {
      const result = paginationService.paginate(sampleTransactions, undefined, 2);
      
      expect(result.pagination.currentPage).toBe(1);
    });

    it('should handle page number exceeding total pages', () => {
      const result = paginationService.paginate(sampleTransactions, 999, 2);
      
      // Should return last page
      expect(result.pagination.currentPage).toBe(3);
      expect(result.items).toHaveLength(1);
    });

    it('should handle negative page number', () => {
      const result = paginationService.paginate(sampleTransactions, -1, 2);
      
      // Should default to page 1
      expect(result.pagination.currentPage).toBe(1);
    });

    it('should handle zero page number', () => {
      const result = paginationService.paginate(sampleTransactions, 0, 2);
      
      expect(result.pagination.currentPage).toBe(1);
    });

    it('should handle empty data array', () => {
      const result = paginationService.paginate([], 1, 10);
      
      expect(result.items).toEqual([]);
      expect(result.pagination.totalItems).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
      expect(result.pagination.hasNextPage).toBe(false);
      expect(result.pagination.hasPreviousPage).toBe(false);
    });

    it('should throw error for non-array input', () => {
      expect(() => {
        paginationService.paginate('not an array', 1, 10);
      }).toThrow('Data must be an array');
    });

    it('should calculate hasNextPage correctly', () => {
      const result1 = paginationService.paginate(sampleTransactions, 1, 2);
      const result2 = paginationService.paginate(sampleTransactions, 3, 2);
      
      expect(result1.pagination.hasNextPage).toBe(true);
      expect(result2.pagination.hasNextPage).toBe(false);
    });

    it('should calculate hasPreviousPage correctly', () => {
      const result1 = paginationService.paginate(sampleTransactions, 1, 2);
      const result2 = paginationService.paginate(sampleTransactions, 2, 2);
      
      expect(result1.pagination.hasPreviousPage).toBe(false);
      expect(result2.pagination.hasPreviousPage).toBe(true);
    });

    it('should include startIndex and endIndex in pagination metadata', () => {
      const result = paginationService.paginate(sampleTransactions, 2, 2);
      
      expect(result.pagination.startIndex).toBe(3); // 1-based
      expect(result.pagination.endIndex).toBe(4);
    });

    it('should handle single item page', () => {
      const result = paginationService.paginate(sampleTransactions, 1, 1);
      
      expect(result.items).toHaveLength(1);
      expect(result.pagination.totalPages).toBe(5);
    });

    it('should handle page size larger than data length', () => {
      const result = paginationService.paginate(sampleTransactions, 1, 100);
      
      expect(result.items).toHaveLength(5);
      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.hasNextPage).toBe(false);
    });

    it('should cap page size at maximum (100)', () => {
      const result = paginationService.paginate(sampleTransactions, 1, 200);
      
      expect(result.pagination.pageSize).toBe(100);
    });

    it('should handle string page numbers', () => {
      const result = paginationService.paginate(sampleTransactions, '2', '3');
      
      expect(result.pagination.currentPage).toBe(2);
      expect(result.pagination.pageSize).toBe(3);
    });
  });

  describe('validatePage', () => {
    it('should return valid page number', () => {
      expect(paginationService.validatePage(5)).toBe(5);
    });

    it('should return 1 for negative numbers', () => {
      expect(paginationService.validatePage(-5)).toBe(1);
    });

    it('should return 1 for zero', () => {
      expect(paginationService.validatePage(0)).toBe(1);
    });

    it('should return 1 for NaN', () => {
      expect(paginationService.validatePage('abc')).toBe(1);
    });

    it('should parse string numbers', () => {
      expect(paginationService.validatePage('10')).toBe(10);
    });

    it('should return 1 for null', () => {
      expect(paginationService.validatePage(null)).toBe(1);
    });

    it('should return 1 for undefined', () => {
      expect(paginationService.validatePage(undefined)).toBe(1);
    });
  });

  describe('validatePageSize', () => {
    it('should return valid page size', () => {
      expect(paginationService.validatePageSize(20)).toBe(20);
    });

    it('should return 10 for negative numbers', () => {
      expect(paginationService.validatePageSize(-5)).toBe(10);
    });

    it('should return 10 for zero', () => {
      expect(paginationService.validatePageSize(0)).toBe(10);
    });

    it('should return 10 for NaN', () => {
      expect(paginationService.validatePageSize('abc')).toBe(10);
    });

    it('should cap at maximum (100)', () => {
      expect(paginationService.validatePageSize(150)).toBe(100);
    });

    it('should parse string numbers', () => {
      expect(paginationService.validatePageSize('25')).toBe(25);
    });

    it('should return 10 for null', () => {
      expect(paginationService.validatePageSize(null)).toBe(10);
    });

    it('should return 10 for undefined', () => {
      expect(paginationService.validatePageSize(undefined)).toBe(10);
    });
  });

  describe('getPageInfo', () => {
    it('should return pagination metadata without data', () => {
      const info = paginationService.getPageInfo(50, 2, 10);
      
      expect(info.currentPage).toBe(2);
      expect(info.pageSize).toBe(10);
      expect(info.totalItems).toBe(50);
      expect(info.totalPages).toBe(5);
      expect(info.hasNextPage).toBe(true);
      expect(info.hasPreviousPage).toBe(true);
    });

    it('should handle first page', () => {
      const info = paginationService.getPageInfo(50, 1, 10);
      
      expect(info.hasPreviousPage).toBe(false);
      expect(info.hasNextPage).toBe(true);
    });

    it('should handle last page', () => {
      const info = paginationService.getPageInfo(50, 5, 10);
      
      expect(info.hasNextPage).toBe(false);
      expect(info.hasPreviousPage).toBe(true);
    });

    it('should handle empty results', () => {
      const info = paginationService.getPageInfo(0, 1, 10);
      
      expect(info.totalPages).toBe(0);
      expect(info.hasNextPage).toBe(false);
      expect(info.hasPreviousPage).toBe(false);
    });
  });

  describe('getPageRange', () => {
    it('should return correct range for first page', () => {
      const range = paginationService.getPageRange(1, 10);
      
      expect(range.startIndex).toBe(0);
      expect(range.endIndex).toBe(10);
    });

    it('should return correct range for middle page', () => {
      const range = paginationService.getPageRange(3, 10);
      
      expect(range.startIndex).toBe(20);
      expect(range.endIndex).toBe(30);
    });

    it('should handle different page sizes', () => {
      const range = paginationService.getPageRange(2, 25);
      
      expect(range.startIndex).toBe(25);
      expect(range.endIndex).toBe(50);
    });

    it('should validate page number', () => {
      const range = paginationService.getPageRange(-1, 10);
      
      expect(range.startIndex).toBe(0); // Defaults to page 1
    });

    it('should validate page size', () => {
      const range = paginationService.getPageRange(1, 200);
      
      expect(range.endIndex).toBe(100); // Capped at 100
    });
  });
});

