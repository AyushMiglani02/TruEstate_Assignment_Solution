/**
 * SortService - Implements sorting functionality for transactions
 * 
 * Supports sorting by:
 * - date (newest first by default)
 * - quantity (ascending/descending)
 * - customerName (alphabetical A-Z)
 */

class SortService {
  /**
   * Sorts transactions by specified field and order
   * @param {Array} data - Array of transaction objects
   * @param {string} sortBy - Field to sort by
   * @param {string} sortOrder - Sort direction ('asc' or 'desc')
   * @returns {Array} Sorted array of transactions
   */
  sortTransactions(data, sortBy = 'date', sortOrder = 'desc') {
    // Return original data if empty or invalid
    if (!Array.isArray(data) || data.length === 0) {
      return data;
    }

    // Validate sortBy field
    const validSortFields = ['date', 'quantity', 'customerName'];
    if (!validSortFields.includes(sortBy)) {
      return data;
    }

    // Create a copy to avoid mutating original array
    const sorted = [...data];

    // Sort based on field
    switch (sortBy) {
      case 'date':
        return this.sortByDate(sorted, sortOrder);
      
      case 'quantity':
        return this.sortByQuantity(sorted, sortOrder);
      
      case 'customerName':
        return this.sortByCustomerName(sorted, sortOrder);
      
      default:
        return sorted;
    }
  }

  /**
   * Sorts by date (default: newest first)
   * @param {Array} data - Transaction data
   * @param {string} sortOrder - Sort direction
   * @returns {Array} Sorted data
   */
  sortByDate(data, sortOrder = 'desc') {
    return data.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      if (sortOrder === 'asc') {
        return dateA - dateB; // Oldest first
      } else {
        return dateB - dateA; // Newest first
      }
    });
  }

  /**
   * Sorts by quantity
   * @param {Array} data - Transaction data
   * @param {string} sortOrder - Sort direction
   * @returns {Array} Sorted data
   */
  sortByQuantity(data, sortOrder = 'asc') {
    return data.sort((a, b) => {
      const quantityA = a.quantity || 0;
      const quantityB = b.quantity || 0;

      if (sortOrder === 'asc') {
        return quantityA - quantityB; // Lowest first
      } else {
        return quantityB - quantityA; // Highest first
      }
    });
  }

  /**
   * Sorts by customer name (alphabetical)
   * @param {Array} data - Transaction data
   * @param {string} sortOrder - Sort direction
   * @returns {Array} Sorted data
   */
  sortByCustomerName(data, sortOrder = 'asc') {
    return data.sort((a, b) => {
      const nameA = (a.customerName || '').toLowerCase();
      const nameB = (b.customerName || '').toLowerCase();

      const comparison = nameA.localeCompare(nameB);

      if (sortOrder === 'asc') {
        return comparison; // A-Z
      } else {
        return -comparison; // Z-A
      }
    });
  }

  /**
   * Gets available sort options
   * @returns {Object} Available sort fields and orders
   */
  getSortOptions() {
    return {
      fields: [
        { value: 'date', label: 'Date', defaultOrder: 'desc' },
        { value: 'quantity', label: 'Quantity', defaultOrder: 'asc' },
        { value: 'customerName', label: 'Customer Name', defaultOrder: 'asc' }
      ],
      orders: [
        { value: 'asc', label: 'Ascending' },
        { value: 'desc', label: 'Descending' }
      ]
    };
  }

  /**
   * Validates sort parameters
   * @param {string} sortBy - Field to sort by
   * @param {string} sortOrder - Sort direction
   * @returns {boolean} True if valid
   */
  isValidSort(sortBy, sortOrder) {
    const validFields = ['date', 'quantity', 'customerName'];
    const validOrders = ['asc', 'desc'];

    const isValidField = !sortBy || validFields.includes(sortBy);
    const isValidOrder = !sortOrder || validOrders.includes(sortOrder);

    return isValidField && isValidOrder;
  }
}

// Export singleton instance
const sortService = new SortService();
export default sortService;

