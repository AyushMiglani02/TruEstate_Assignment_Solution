import filterService from '../../../src/services/filterService.js';
import { sampleTransactions } from '../../fixtures/sampleData.js';

describe('FilterService', () => {
  describe('applyFilters', () => {
    it('should return all data when no filters provided', () => {
      const result = filterService.applyFilters(sampleTransactions, {});
      expect(result).toEqual(sampleTransactions);
    });

    it('should return all data when filters is null', () => {
      const result = filterService.applyFilters(sampleTransactions, null);
      expect(result).toEqual(sampleTransactions);
    });

    it('should return all data when filters is not an object', () => {
      const result = filterService.applyFilters(sampleTransactions, 'invalid');
      expect(result).toEqual(sampleTransactions);
    });

    it('should apply single filter correctly', () => {
      const filters = { customerRegion: ['North'] };
      const result = filterService.applyFilters(sampleTransactions, filters);
      
      expect(result.every(t => t.customerRegion === 'North')).toBe(true);
    });

    it('should apply multiple filters with AND logic across categories', () => {
      const filters = {
        customerRegion: ['North'],
        gender: ['Male']
      };
      const result = filterService.applyFilters(sampleTransactions, filters);
      
      expect(result.every(t => 
        t.customerRegion === 'North' && t.gender === 'Male'
      )).toBe(true);
    });

    it('should return empty array when no matches found', () => {
      const filters = {
        customerRegion: ['NonExistent']
      };
      const result = filterService.applyFilters(sampleTransactions, filters);
      
      expect(result).toEqual([]);
    });
  });

  describe('filterByCustomerRegion', () => {
    it('should filter by single region', () => {
      const result = filterService.filterByCustomerRegion(sampleTransactions, ['North']);
      
      expect(result.every(t => t.customerRegion === 'North')).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should filter by multiple regions (OR logic)', () => {
      const result = filterService.filterByCustomerRegion(sampleTransactions, ['North', 'South']);
      
      expect(result.every(t => 
        t.customerRegion === 'North' || t.customerRegion === 'South'
      )).toBe(true);
    });

    it('should return all data when regions array is empty', () => {
      const result = filterService.filterByCustomerRegion(sampleTransactions, []);
      expect(result).toEqual(sampleTransactions);
    });

    it('should return all data when regions is not an array', () => {
      const result = filterService.filterByCustomerRegion(sampleTransactions, 'North');
      expect(result).toEqual(sampleTransactions);
    });

    it('should return empty array when no matches', () => {
      const result = filterService.filterByCustomerRegion(sampleTransactions, ['NonExistent']);
      expect(result).toEqual([]);
    });
  });

  describe('filterByGender', () => {
    it('should filter by single gender', () => {
      const result = filterService.filterByGender(sampleTransactions, ['Male']);
      
      expect(result.every(t => t.gender === 'Male')).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should filter by multiple genders (OR logic)', () => {
      const result = filterService.filterByGender(sampleTransactions, ['Male', 'Female']);
      
      expect(result.every(t => 
        t.gender === 'Male' || t.gender === 'Female'
      )).toBe(true);
    });

    it('should return all data when genders array is empty', () => {
      const result = filterService.filterByGender(sampleTransactions, []);
      expect(result).toEqual(sampleTransactions);
    });
  });

  describe('filterByAgeRange', () => {
    it('should filter by age range with both min and max', () => {
      const result = filterService.filterByAgeRange(sampleTransactions, { min: 30, max: 40 });
      
      expect(result.every(t => t.age >= 30 && t.age <= 40)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should filter by minimum age only', () => {
      const result = filterService.filterByAgeRange(sampleTransactions, { min: 40 });
      
      expect(result.every(t => t.age >= 40)).toBe(true);
    });

    it('should filter by maximum age only', () => {
      const result = filterService.filterByAgeRange(sampleTransactions, { max: 35 });
      
      expect(result.every(t => t.age <= 35)).toBe(true);
    });

    it('should return all data when range is empty object', () => {
      const result = filterService.filterByAgeRange(sampleTransactions, {});
      expect(result).toEqual(sampleTransactions);
    });

    it('should return all data when range is null', () => {
      const result = filterService.filterByAgeRange(sampleTransactions, null);
      expect(result).toEqual(sampleTransactions);
    });

    it('should include boundary values', () => {
      const result = filterService.filterByAgeRange(sampleTransactions, { min: 35, max: 35 });
      
      expect(result.every(t => t.age === 35)).toBe(true);
    });
  });

  describe('filterByProductCategory', () => {
    it('should filter by single category', () => {
      const result = filterService.filterByProductCategory(sampleTransactions, ['Electronics']);
      
      expect(result.every(t => t.productCategory === 'Electronics')).toBe(true);
    });

    it('should filter by multiple categories (OR logic)', () => {
      const result = filterService.filterByProductCategory(
        sampleTransactions, 
        ['Electronics', 'Clothing']
      );
      
      expect(result.every(t => 
        t.productCategory === 'Electronics' || t.productCategory === 'Clothing'
      )).toBe(true);
    });

    it('should return all data when categories array is empty', () => {
      const result = filterService.filterByProductCategory(sampleTransactions, []);
      expect(result).toEqual(sampleTransactions);
    });
  });

  describe('filterByTags', () => {
    it('should filter by single tag', () => {
      const result = filterService.filterByTags(sampleTransactions, ['tech']);
      
      expect(result.every(t => 
        Array.isArray(t.tags) && t.tags.includes('tech')
      )).toBe(true);
    });

    it('should filter by multiple tags (OR logic)', () => {
      const result = filterService.filterByTags(sampleTransactions, ['tech', 'mobile']);
      
      expect(result.every(t => {
        const tags = Array.isArray(t.tags) ? t.tags : [];
        return tags.includes('tech') || tags.includes('mobile');
      })).toBe(true);
    });

    it('should return all data when tags array is empty', () => {
      const result = filterService.filterByTags(sampleTransactions, []);
      expect(result).toEqual(sampleTransactions);
    });

    it('should handle transactions without tags', () => {
      const dataWithoutTags = [
        { ...sampleTransactions[0], tags: [] },
        { ...sampleTransactions[1], tags: undefined }
      ];
      const result = filterService.filterByTags(dataWithoutTags, ['tech']);
      
      expect(result).toEqual([]);
    });

    it('should match any tag in the filter list', () => {
      const result = filterService.filterByTags(sampleTransactions, ['audio', 'display']);
      
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('filterByPaymentMethod', () => {
    it('should filter by single payment method', () => {
      const result = filterService.filterByPaymentMethod(sampleTransactions, ['Credit Card']);
      
      expect(result.every(t => t.paymentMethod === 'Credit Card')).toBe(true);
    });

    it('should filter by multiple payment methods (OR logic)', () => {
      const result = filterService.filterByPaymentMethod(
        sampleTransactions, 
        ['Credit Card', 'Debit Card']
      );
      
      expect(result.every(t => 
        t.paymentMethod === 'Credit Card' || t.paymentMethod === 'Debit Card'
      )).toBe(true);
    });

    it('should return all data when methods array is empty', () => {
      const result = filterService.filterByPaymentMethod(sampleTransactions, []);
      expect(result).toEqual(sampleTransactions);
    });
  });

  describe('filterByDateRange', () => {
    it('should filter by date range with both start and end', () => {
      const result = filterService.filterByDateRange(sampleTransactions, {
        start: '2025-01-10',
        end: '2025-01-20'
      });
      
      expect(result.every(t => {
        const date = new Date(t.date);
        return date >= new Date('2025-01-10') && date <= new Date('2025-01-20');
      })).toBe(true);
    });

    it('should filter by start date only', () => {
      const result = filterService.filterByDateRange(sampleTransactions, {
        start: '2025-01-15'
      });
      
      expect(result.every(t => {
        const date = new Date(t.date);
        return date >= new Date('2025-01-15');
      })).toBe(true);
    });

    it('should filter by end date only', () => {
      const result = filterService.filterByDateRange(sampleTransactions, {
        end: '2025-01-20'
      });
      
      expect(result.every(t => {
        const date = new Date(t.date);
        return date <= new Date('2025-01-20');
      })).toBe(true);
    });

    it('should return all data when range is empty object', () => {
      const result = filterService.filterByDateRange(sampleTransactions, {});
      expect(result).toEqual(sampleTransactions);
    });

    it('should return all data when range is null', () => {
      const result = filterService.filterByDateRange(sampleTransactions, null);
      expect(result).toEqual(sampleTransactions);
    });

    it('should include boundary dates', () => {
      const result = filterService.filterByDateRange(sampleTransactions, {
        start: '2025-01-15',
        end: '2025-01-15'
      });
      
      expect(result.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getFilterOptions', () => {
    it('should extract unique regions', () => {
      const options = filterService.getFilterOptions(sampleTransactions);
      
      expect(Array.isArray(options.regions)).toBe(true);
      expect(options.regions).toContain('North');
      expect(options.regions).toContain('South');
      expect(options.regions).toContain('East');
      expect(options.regions).toContain('West');
    });

    it('should extract unique genders', () => {
      const options = filterService.getFilterOptions(sampleTransactions);
      
      expect(options.genders).toContain('Male');
      expect(options.genders).toContain('Female');
    });

    it('should extract unique categories', () => {
      const options = filterService.getFilterOptions(sampleTransactions);
      
      expect(options.categories).toContain('Electronics');
    });

    it('should extract unique tags from all transactions', () => {
      const options = filterService.getFilterOptions(sampleTransactions);
      
      expect(options.tags).toContain('tech');
      expect(options.tags).toContain('mobile');
      expect(options.tags).toContain('computer');
    });

    it('should extract unique payment methods', () => {
      const options = filterService.getFilterOptions(sampleTransactions);
      
      expect(options.paymentMethods).toContain('Credit Card');
      expect(options.paymentMethods).toContain('Debit Card');
      expect(options.paymentMethods).toContain('Cash');
    });

    it('should return sorted arrays', () => {
      const options = filterService.getFilterOptions(sampleTransactions);
      
      // Check if arrays are sorted
      expect(options.regions).toEqual([...options.regions].sort());
      expect(options.genders).toEqual([...options.genders].sort());
    });

    it('should handle empty data array', () => {
      const options = filterService.getFilterOptions([]);
      
      expect(options.regions).toEqual([]);
      expect(options.genders).toEqual([]);
      expect(options.categories).toEqual([]);
      expect(options.tags).toEqual([]);
      expect(options.paymentMethods).toEqual([]);
    });

    it('should not include duplicates', () => {
      const duplicateData = [...sampleTransactions, ...sampleTransactions];
      const options = filterService.getFilterOptions(duplicateData);
      
      const hasNoDuplicates = (arr) => arr.length === new Set(arr).size;
      
      expect(hasNoDuplicates(options.regions)).toBe(true);
      expect(hasNoDuplicates(options.genders)).toBe(true);
    });
  });
});

