import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import {
  fetchTransactions,
  fetchFilterOptions,
  fetchStatistics,
  checkHealth
} from './api';

// Mock axios
vi.mock('axios');

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchTransactions', () => {
    it('should fetch transactions without parameters', async () => {
      const mockData = {
        data: {
          success: true,
          data: {
            items: [{ id: 1 }],
            pagination: { currentPage: 1 }
          }
        }
      };

      axios.create = vi.fn(() => ({
        get: vi.fn().mockResolvedValue(mockData),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }));

      // Re-import to get mocked instance
      const { fetchTransactions } = await import('./api');
      const result = await fetchTransactions();

      expect(result).toBeDefined();
    });

    it('should build query string with all parameters', async () => {
      const mockGet = vi.fn().mockResolvedValue({
        data: { data: { items: [], pagination: {} } }
      });

      axios.create = vi.fn(() => ({
        get: mockGet,
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }));

      const params = {
        search: 'test',
        sortBy: 'date',
        sortOrder: 'desc',
        page: 2,
        pageSize: 20,
        filters: { gender: ['Male'] }
      };

      const { fetchTransactions } = await import('./api');
      await fetchTransactions(params);

      expect(mockGet).toHaveBeenCalled();
      const callArg = mockGet.mock.calls[0][0];
      expect(callArg).toContain('search=test');
      expect(callArg).toContain('sortBy=date');
      expect(callArg).toContain('page=2');
    });

    it('should handle filters parameter', async () => {
      const mockGet = vi.fn().mockResolvedValue({
        data: { data: { items: [], pagination: {} } }
      });

      axios.create = vi.fn(() => ({
        get: mockGet,
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }));

      const params = {
        filters: { gender: ['Male'], ageRange: { min: 25, max: 50 } }
      };

      const { fetchTransactions } = await import('./api');
      await fetchTransactions(params);

      const callArg = mockGet.mock.calls[0][0];
      expect(callArg).toContain('filters=');
    });

    it('should skip empty parameters', async () => {
      const mockGet = vi.fn().mockResolvedValue({
        data: { data: { items: [], pagination: {} } }
      });

      axios.create = vi.fn(() => ({
        get: mockGet,
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }));

      const { fetchTransactions } = await import('./api');
      await fetchTransactions({});

      const callArg = mockGet.mock.calls[0][0];
      expect(callArg).toBe('/api/transactions?');
    });
  });

  describe('fetchFilterOptions', () => {
    it('should fetch filter options', async () => {
      const mockGet = vi.fn().mockResolvedValue({
        data: {
          data: {
            regions: ['North', 'South'],
            genders: ['Male', 'Female']
          }
        }
      });

      axios.create = vi.fn(() => ({
        get: mockGet,
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }));

      const { fetchFilterOptions } = await import('./api');
      const result = await fetchFilterOptions();

      expect(mockGet).toHaveBeenCalledWith('/api/filters/options?');
    });

    it('should include search parameter if provided', async () => {
      const mockGet = vi.fn().mockResolvedValue({
        data: { data: {} }
      });

      axios.create = vi.fn(() => ({
        get: mockGet,
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }));

      const { fetchFilterOptions } = await import('./api');
      await fetchFilterOptions({ search: 'test' });

      const callArg = mockGet.mock.calls[0][0];
      expect(callArg).toContain('search=test');
    });
  });

  describe('fetchStatistics', () => {
    it('should fetch statistics', async () => {
      const mockGet = vi.fn().mockResolvedValue({
        data: {
          data: {
            totalTransactions: 1000,
            uniqueCustomers: 500
          }
        }
      });

      axios.create = vi.fn(() => ({
        get: mockGet,
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }));

      const { fetchStatistics } = await import('./api');
      const result = await fetchStatistics();

      expect(mockGet).toHaveBeenCalledWith('/api/statistics');
    });
  });

  describe('checkHealth', () => {
    it('should check server health', async () => {
      const mockGet = vi.fn().mockResolvedValue({
        data: { success: true, message: 'Server is running' }
      });

      axios.create = vi.fn(() => ({
        get: mockGet,
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }));

      const { checkHealth } = await import('./api');
      const result = await checkHealth();

      expect(mockGet).toHaveBeenCalledWith('/health');
    });
  });
});

