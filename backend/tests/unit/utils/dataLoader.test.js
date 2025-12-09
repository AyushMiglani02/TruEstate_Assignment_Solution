import dataLoader from '../../../src/utils/dataLoader.js';
import fs from 'fs';
import path from 'path';

describe('DataLoader', () => {
  beforeEach(() => {
    // Clear cache before each test
    dataLoader.clearCache();
  });

  describe('parseNumber', () => {
    it('should parse valid number strings', () => {
      expect(dataLoader.parseNumber('123')).toBe(123);
      expect(dataLoader.parseNumber('45.67')).toBe(45.67);
    });

    it('should return 0 for invalid values', () => {
      expect(dataLoader.parseNumber('')).toBe(0);
      expect(dataLoader.parseNumber(null)).toBe(0);
      expect(dataLoader.parseNumber(undefined)).toBe(0);
      expect(dataLoader.parseNumber('abc')).toBe(0);
    });

    it('should handle negative numbers', () => {
      expect(dataLoader.parseNumber('-10')).toBe(-10);
    });
  });

  describe('parseTags', () => {
    it('should parse comma-separated string tags', () => {
      const result = dataLoader.parseTags('tag1, tag2, tag3');
      expect(result).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should return array if already an array', () => {
      const input = ['tag1', 'tag2'];
      expect(dataLoader.parseTags(input)).toEqual(input);
    });

    it('should return empty array for empty string', () => {
      expect(dataLoader.parseTags('')).toEqual([]);
    });

    it('should filter out empty tags', () => {
      const result = dataLoader.parseTags('tag1, , tag2');
      expect(result).toEqual(['tag1', 'tag2']);
    });
  });

  describe('parseDate', () => {
    it('should parse valid date strings to ISO format', () => {
      const result = dataLoader.parseDate('2025-01-01');
      expect(result).toBeTruthy();
      expect(new Date(result).toISOString()).toBe(result);
    });

    it('should return ISO date for empty value', () => {
      const result = dataLoader.parseDate('');
      expect(result).toBeTruthy();
      expect(() => new Date(result)).not.toThrow();
    });

    it('should handle invalid dates gracefully', () => {
      const result = dataLoader.parseDate('invalid-date');
      expect(result).toBeTruthy();
      expect(() => new Date(result)).not.toThrow();
    });
  });

  describe('parseTransaction', () => {
    it('should parse a complete transaction row', () => {
      const row = {
        customerId: 'C001',
        customerName: 'John Doe',
        phoneNumber: '1234567890',
        gender: 'Male',
        age: '35',
        customerRegion: 'North',
        customerType: 'Regular',
        productId: 'P001',
        productName: 'Laptop',
        brand: 'Dell',
        productCategory: 'Electronics',
        tags: 'computer, tech',
        quantity: '2',
        pricePerUnit: '1000',
        discountPercentage: '10',
        totalAmount: '2000',
        finalAmount: '1800',
        date: '2025-01-01',
        paymentMethod: 'Credit Card',
        orderStatus: 'Completed',
        deliveryType: 'Standard',
        storeId: 'S001',
        storeLocation: 'New York',
        salespersonId: 'SP001',
        employeeName: 'Jane Smith'
      };

      const result = dataLoader.parseTransaction(row);

      expect(result.customerId).toBe('C001');
      expect(result.customerName).toBe('John Doe');
      expect(result.age).toBe(35);
      expect(result.quantity).toBe(2);
      expect(result.tags).toEqual(['computer', 'tech']);
    });

    it('should handle missing optional fields', () => {
      const row = {
        customerId: 'C001',
        customerName: 'John Doe'
      };

      const result = dataLoader.parseTransaction(row);

      expect(result.customerId).toBe('C001');
      expect(result.phoneNumber).toBe('');
      expect(result.age).toBe(0);
      expect(result.tags).toEqual([]);
    });
  });

  describe('loadData', () => {
    it('should reject with error for non-existent file', async () => {
      await expect(
        dataLoader.loadData('non-existent-file.csv')
      ).rejects.toThrow('File not found');
    });

    it('should cache loaded data', async () => {
      // Create a temporary test CSV file
      const testData = `customerId,customerName,phoneNumber,age
C001,John Doe,1234567890,35
C002,Jane Smith,0987654321,28`;

      const tempFile = path.join(process.cwd(), 'test-temp.csv');
      fs.writeFileSync(tempFile, testData);

      try {
        // First load
        const data1 = await dataLoader.loadData(tempFile);
        expect(data1.length).toBe(2);

        // Second load should return cached data
        const data2 = await dataLoader.loadData(tempFile);
        expect(data2).toBe(data1); // Same reference
      } finally {
        // Cleanup
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }
    });
  });

  describe('getData', () => {
    it('should return null when no data is loaded', () => {
      expect(dataLoader.getData()).toBeNull();
    });
  });

  describe('clearCache', () => {
    it('should clear cached data', () => {
      dataLoader.data = [{ test: 'data' }];
      dataLoader.isLoaded = true;

      dataLoader.clearCache();

      expect(dataLoader.getData()).toBeNull();
      expect(dataLoader.isLoaded).toBe(false);
    });
  });
});

