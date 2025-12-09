/**
 * MongoDB Transaction Service - Replaces in-memory processing with MongoDB queries
 * 
 * Provides blazing fast queries with database indexes
 */

import Transaction from '../models/Transaction.js';

class TransactionServiceMongo {
  /**
   * Build MongoDB filter query from filter parameters
   * @param {Object} filters - Filter parameters
   * @returns {Object} MongoDB query object
   */
  buildFilterQuery(filters = {}) {
    const query = {};

    // Customer Region filter
    if (filters.customerRegion && filters.customerRegion.length > 0) {
      query.customerRegion = { $in: filters.customerRegion };
    }

    // Gender filter
    if (filters.gender && filters.gender.length > 0) {
      query.gender = { $in: filters.gender };
    }

    // Age Range filter
    if (filters.ageRange) {
      const { min, max } = filters.ageRange;
      if (min !== undefined && min > 0) {
        query.age = { ...query.age, $gte: min };
      }
      if (max !== undefined && max < 100) {
        query.age = { ...query.age, $lte: max };
      }
    }

    // Product Category filter
    if (filters.productCategory && filters.productCategory.length > 0) {
      query.productCategory = { $in: filters.productCategory };
    }

    // Tags filter (documents must contain at least one of the specified tags)
    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    // Payment Method filter
    if (filters.paymentMethod && filters.paymentMethod.length > 0) {
      query.paymentMethod = { $in: filters.paymentMethod };
    }

    // Date Range filter
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      if (start || end) {
        query.date = {};
        if (start) query.date.$gte = new Date(start);
        if (end) query.date.$lte = new Date(end);
      }
    }

    return query;
  }

  /**
   * Build search query for text search
   * @param {string} searchTerm - Search term
   * @returns {Object} MongoDB query object
   */
  buildSearchQuery(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
      return {};
    }

    const term = searchTerm.trim();
    
    // Use $or for flexible searching across multiple fields
    return {
      $or: [
        { customerName: { $regex: term, $options: 'i' } },
        { phoneNumber: { $regex: term, $options: 'i' } },
        { customerId: { $regex: term, $options: 'i' } },
        { productName: { $regex: term, $options: 'i' } },
        { transactionId: { $regex: term, $options: 'i' } }
      ]
    };
  }

  /**
   * Build sort object for MongoDB
   * @param {string} sortBy - Field to sort by
   * @param {string} sortOrder - Sort order (asc/desc)
   * @returns {Object} MongoDB sort object
   */
  buildSortQuery(sortBy = 'date', sortOrder = 'desc') {
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
    return sortObj;
  }

  /**
   * Get transactions with search, filter, sort, and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Paginated transactions with aggregate stats
   */
  async getTransactions(params = {}) {
    try {
      const {
        search = '',
        filters = {},
        sortBy = 'date',
        sortOrder = 'desc',
        page = 1,
        pageSize = 10
      } = params;

      // Build query
      const filterQuery = this.buildFilterQuery(filters);
      const searchQuery = this.buildSearchQuery(search);
      
      // Combine filter and search queries
      const combinedQuery = search 
        ? { $and: [filterQuery, searchQuery] }
        : filterQuery;

      // Build sort
      const sort = this.buildSortQuery(sortBy, sortOrder);

      // Get aggregate stats BEFORE pagination (fast with indexes!)
      const aggregateStats = await Transaction.getAggregateStats(combinedQuery);

      // Calculate pagination
      const totalItems = aggregateStats.recordCount;
      const totalPages = Math.ceil(totalItems / pageSize);
      const skip = (page - 1) * pageSize;

      // Get paginated items (indexed query = blazing fast!)
      const items = await Transaction
        .find(combinedQuery)
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .lean() // Returns plain JavaScript objects (faster)
        .select('-__v -createdAt -updatedAt'); // Exclude unnecessary fields

      // Format dates for frontend
      const formattedItems = items.map(item => ({
        ...item,
        date: item.date ? item.date.toISOString().split('T')[0] : ''
      }));

      // Return result with pagination info
      return {
        items: formattedItems,
        pagination: {
          currentPage: page,
          pageSize,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        },
        aggregateStats: {
          totalUnits: aggregateStats.totalUnits || 0,
          totalAmount: aggregateStats.totalAmount || 0,
          totalDiscount: aggregateStats.totalDiscount || 0,
          recordCount: aggregateStats.recordCount || 0
        }
      };

    } catch (error) {
      console.error('MongoDB query error:', error);
      throw new Error(`Failed to get transactions: ${error.message}`);
    }
  }

  /**
   * Get filter options based on current search and filters
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Available filter options
   */
  async getFilterOptions(params = {}) {
    try {
      const { search = '', filters = {} } = params;

      // Build base query
      const filterQuery = this.buildFilterQuery(filters);
      const searchQuery = this.buildSearchQuery(search);
      const combinedQuery = search 
        ? { $and: [filterQuery, searchQuery] }
        : filterQuery;

      // Get distinct values for each filter field (indexed = fast!)
      const [regions, genders, categories, tags, paymentMethods] = await Promise.all([
        Transaction.distinct('customerRegion', combinedQuery),
        Transaction.distinct('gender', combinedQuery),
        Transaction.distinct('productCategory', combinedQuery),
        Transaction.distinct('tags', combinedQuery),
        Transaction.distinct('paymentMethod', combinedQuery)
      ]);

      // Get age range
      const ageStats = await Transaction.aggregate([
        { $match: combinedQuery },
        {
          $group: {
            _id: null,
            minAge: { $min: '$age' },
            maxAge: { $max: '$age' }
          }
        }
      ]);

      return {
        customerRegion: regions.filter(r => r && r !== ''),
        gender: genders.filter(g => g && g !== ''),
        productCategory: categories.filter(c => c && c !== ''),
        tags: tags.filter(t => t && t !== ''),
        paymentMethod: paymentMethods.filter(p => p && p !== ''),
        ageRange: ageStats.length > 0 ? {
          min: ageStats[0].minAge || 0,
          max: ageStats[0].maxAge || 100
        } : { min: 0, max: 100 }
      };

    } catch (error) {
      console.error('MongoDB filter options error:', error);
      throw new Error(`Failed to get filter options: ${error.message}`);
    }
  }

  /**
   * Get overall statistics (for dashboard)
   * @returns {Promise<Object>} Overall statistics
   */
  async getStatistics() {
    try {
      const stats = await Transaction.getAggregateStats({});

      // Get additional stats
      const [uniqueCustomers, uniqueProducts] = await Promise.all([
        Transaction.distinct('customerId').then(ids => ids.length),
        Transaction.distinct('productId').then(ids => ids.length)
      ]);

      return {
        totalTransactions: stats.recordCount,
        uniqueCustomers,
        uniqueProducts,
        totalRevenue: stats.totalAmount,
        averageOrderValue: stats.avgOrderValue || 0,
        minOrderValue: stats.minOrderValue || 0,
        maxOrderValue: stats.maxOrderValue || 0
      };

    } catch (error) {
      console.error('MongoDB statistics error:', error);
      throw new Error(`Failed to get statistics: ${error.message}`);
    }
  }
}

// Export singleton instance
const transactionServiceMongo = new TransactionServiceMongo();
export default transactionServiceMongo;

