/**
 * SearchService - Implements full-text search functionality
 * 
 * Searches across customerName and phoneNumber fields
 * Case-insensitive matching with trim support
 */

class SearchService {
  /**
   * Searches transactions by customer name or phone number
   * @param {Array} data - Array of transaction objects
   * @param {string} searchTerm - Search term to match
   * @returns {Array} Filtered array of transactions
   */
  searchTransactions(data, searchTerm) {
    // Return all data if no search term provided
    if (!searchTerm || typeof searchTerm !== 'string') {
      return data;
    }

    // Normalize search term
    const normalizedTerm = searchTerm.toLowerCase().trim();
    
    // Empty search term after trimming
    if (normalizedTerm === '') {
      return data;
    }

    // Filter transactions that match search term
    return data.filter(transaction => {
      // Search in customer name
      const customerName = (transaction.customerName || '').toLowerCase();
      const matchesName = customerName.includes(normalizedTerm);

      // Search in phone number (exact or partial match)
      const phoneNumber = (transaction.phoneNumber || '').toString();
      const matchesPhone = phoneNumber.includes(normalizedTerm);

      // Return true if either field matches
      return matchesName || matchesPhone;
    });
  }

  /**
   * Validates search term
   * @param {string} searchTerm - Term to validate
   * @returns {boolean} True if valid
   */
  isValidSearchTerm(searchTerm) {
    if (searchTerm === null || searchTerm === undefined) {
      return true; // Null/undefined is valid (means no search)
    }

    if (typeof searchTerm !== 'string') {
      return false;
    }

    // Check for reasonable length (prevent abuse)
    const trimmed = searchTerm.trim();
    return trimmed.length <= 100;
  }

  /**
   * Gets search statistics
   * @param {Array} originalData - Original dataset
   * @param {Array} filteredData - Filtered dataset
   * @param {string} searchTerm - Search term used
   * @returns {Object} Search statistics
   */
  getSearchStats(originalData, filteredData, searchTerm) {
    return {
      searchTerm: searchTerm,
      totalRecords: originalData.length,
      matchedRecords: filteredData.length,
      matchPercentage: ((filteredData.length / originalData.length) * 100).toFixed(2)
    };
  }
}

// Export singleton instance
const searchService = new SearchService();
export default searchService;

