/**
 * FilterService - Implements multi-select and range-based filtering
 * 
 * Supports:
 * - Multi-select filters (OR within category, AND across categories)
 * - Range filters (age, date)
 * - Combination of filters
 */

class FilterService {
  /**
   * Applies all filters to transaction data
   * @param {Array} data - Array of transaction objects
   * @param {Object} filters - Filter criteria
   * @returns {Array} Filtered array of transactions
   */
  applyFilters(data, filters) {
    if (!filters || typeof filters !== 'object') {
      return data;
    }

    let result = data;

    // Apply each filter type
    if (filters.customerRegion && filters.customerRegion.length > 0) {
      result = this.filterByCustomerRegion(result, filters.customerRegion);
    }

    if (filters.gender && filters.gender.length > 0) {
      result = this.filterByGender(result, filters.gender);
    }

    if (filters.ageRange) {
      result = this.filterByAgeRange(result, filters.ageRange);
    }

    if (filters.productCategory && filters.productCategory.length > 0) {
      result = this.filterByProductCategory(result, filters.productCategory);
    }

    if (filters.tags && filters.tags.length > 0) {
      result = this.filterByTags(result, filters.tags);
    }

    if (filters.paymentMethod && filters.paymentMethod.length > 0) {
      result = this.filterByPaymentMethod(result, filters.paymentMethod);
    }

    if (filters.dateRange) {
      result = this.filterByDateRange(result, filters.dateRange);
    }

    return result;
  }

  /**
   * Filters by customer region (multi-select with OR logic)
   * @param {Array} data - Transaction data
   * @param {Array} regions - Array of regions to filter by
   * @returns {Array} Filtered data
   */
  filterByCustomerRegion(data, regions) {
    if (!Array.isArray(regions) || regions.length === 0) {
      return data;
    }

    return data.filter(transaction => 
      regions.includes(transaction.customerRegion)
    );
  }

  /**
   * Filters by gender (multi-select with OR logic)
   * @param {Array} data - Transaction data
   * @param {Array} genders - Array of genders to filter by
   * @returns {Array} Filtered data
   */
  filterByGender(data, genders) {
    if (!Array.isArray(genders) || genders.length === 0) {
      return data;
    }

    return data.filter(transaction => 
      genders.includes(transaction.gender)
    );
  }

  /**
   * Filters by age range
   * @param {Array} data - Transaction data
   * @param {Object} range - Age range with min and max
   * @returns {Array} Filtered data
   */
  filterByAgeRange(data, range) {
    if (!range || typeof range !== 'object') {
      return data;
    }

    const { min, max } = range;

    return data.filter(transaction => {
      const age = transaction.age;
      
      if (min !== undefined && max !== undefined) {
        return age >= min && age <= max;
      } else if (min !== undefined) {
        return age >= min;
      } else if (max !== undefined) {
        return age <= max;
      }
      
      return true;
    });
  }

  /**
   * Filters by product category (multi-select with OR logic)
   * @param {Array} data - Transaction data
   * @param {Array} categories - Array of categories to filter by
   * @returns {Array} Filtered data
   */
  filterByProductCategory(data, categories) {
    if (!Array.isArray(categories) || categories.length === 0) {
      return data;
    }

    return data.filter(transaction => 
      categories.includes(transaction.productCategory)
    );
  }

  /**
   * Filters by tags (multi-select with OR logic)
   * Tags can be an array or a single value in transaction
   * @param {Array} data - Transaction data
   * @param {Array} filterTags - Array of tags to filter by
   * @returns {Array} Filtered data
   */
  filterByTags(data, filterTags) {
    if (!Array.isArray(filterTags) || filterTags.length === 0) {
      return data;
    }

    return data.filter(transaction => {
      const transactionTags = Array.isArray(transaction.tags) 
        ? transaction.tags 
        : [];
      
      // Check if any filter tag is in transaction tags
      return filterTags.some(tag => transactionTags.includes(tag));
    });
  }

  /**
   * Filters by payment method (multi-select with OR logic)
   * @param {Array} data - Transaction data
   * @param {Array} methods - Array of payment methods to filter by
   * @returns {Array} Filtered data
   */
  filterByPaymentMethod(data, methods) {
    if (!Array.isArray(methods) || methods.length === 0) {
      return data;
    }

    return data.filter(transaction => 
      methods.includes(transaction.paymentMethod)
    );
  }

  /**
   * Filters by date range
   * @param {Array} data - Transaction data
   * @param {Object} range - Date range with start and end
   * @returns {Array} Filtered data
   */
  filterByDateRange(data, range) {
    if (!range || typeof range !== 'object') {
      return data;
    }

    const { start, end } = range;

    return data.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      
      if (start && end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        return transactionDate >= startDate && transactionDate <= endDate;
      } else if (start) {
        const startDate = new Date(start);
        return transactionDate >= startDate;
      } else if (end) {
        const endDate = new Date(end);
        return transactionDate <= endDate;
      }
      
      return true;
    });
  }

  /**
   * Gets unique filter options from data
   * @param {Array} data - Transaction data
   * @returns {Object} Available filter options
   */
  getFilterOptions(data) {
    const options = {
      regions: new Set(),
      genders: new Set(),
      categories: new Set(),
      tags: new Set(),
      paymentMethods: new Set()
    };

    data.forEach(transaction => {
      if (transaction.customerRegion) {
        options.regions.add(transaction.customerRegion);
      }
      if (transaction.gender) {
        options.genders.add(transaction.gender);
      }
      if (transaction.productCategory) {
        options.categories.add(transaction.productCategory);
      }
      if (Array.isArray(transaction.tags)) {
        transaction.tags.forEach(tag => options.tags.add(tag));
      }
      if (transaction.paymentMethod) {
        options.paymentMethods.add(transaction.paymentMethod);
      }
    });

    // Convert sets to sorted arrays
    return {
      regions: Array.from(options.regions).sort(),
      genders: Array.from(options.genders).sort(),
      categories: Array.from(options.categories).sort(),
      tags: Array.from(options.tags).sort(),
      paymentMethods: Array.from(options.paymentMethods).sort()
    };
  }
}

// Export singleton instance
const filterService = new FilterService();
export default filterService;

