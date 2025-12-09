/**
 * PaginationService - Implements pagination functionality
 * 
 * Divides data into fixed-size pages
 * Provides metadata for navigation
 */

class PaginationService {
  /**
   * Paginates data into pages
   * @param {Array} data - Array of items to paginate
   * @param {number} page - Current page number (1-based)
   * @param {number} pageSize - Number of items per page
   * @returns {Object} Paginated data with metadata
   */
  paginate(data, page = 1, pageSize = 10) {
    // Validate inputs
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }

    const parsedPage = this.validatePage(page);
    const parsedPageSize = this.validatePageSize(pageSize);

    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / parsedPageSize);

    // Ensure page is within valid range
    const validPage = Math.max(1, Math.min(parsedPage, totalPages || 1));

    // Calculate slice indices
    const startIndex = (validPage - 1) * parsedPageSize;
    const endIndex = startIndex + parsedPageSize;

    // Extract page items
    const items = data.slice(startIndex, endIndex);

    return {
      items,
      pagination: {
        currentPage: validPage,
        pageSize: parsedPageSize,
        totalItems,
        totalPages: totalPages || 0,
        hasNextPage: validPage < totalPages,
        hasPreviousPage: validPage > 1,
        startIndex: totalItems > 0 ? startIndex + 1 : 0,
        endIndex: Math.min(endIndex, totalItems)
      }
    };
  }

  /**
   * Validates and parses page number
   * @param {*} page - Page number to validate
   * @returns {number} Valid page number
   */
  validatePage(page) {
    const parsed = parseInt(page);
    
    if (isNaN(parsed) || parsed < 1) {
      return 1;
    }
    
    return parsed;
  }

  /**
   * Validates and parses page size
   * @param {*} pageSize - Page size to validate
   * @returns {number} Valid page size
   */
  validatePageSize(pageSize) {
    const parsed = parseInt(pageSize);
    
    if (isNaN(parsed) || parsed < 1) {
      return 10; // Default page size
    }
    
    // Cap at maximum
    const MAX_PAGE_SIZE = 100;
    return Math.min(parsed, MAX_PAGE_SIZE);
  }

  /**
   * Gets page information without slicing data
   * @param {number} totalItems - Total number of items
   * @param {number} page - Current page
   * @param {number} pageSize - Items per page
   * @returns {Object} Pagination metadata
   */
  getPageInfo(totalItems, page, pageSize) {
    const parsedPage = this.validatePage(page);
    const parsedPageSize = this.validatePageSize(pageSize);
    const totalPages = Math.ceil(totalItems / parsedPageSize);
    const validPage = Math.max(1, Math.min(parsedPage, totalPages || 1));

    return {
      currentPage: validPage,
      pageSize: parsedPageSize,
      totalItems,
      totalPages: totalPages || 0,
      hasNextPage: validPage < totalPages,
      hasPreviousPage: validPage > 1
    };
  }

  /**
   * Calculates which items are visible on current page
   * @param {number} page - Current page
   * @param {number} pageSize - Items per page
   * @returns {Object} Start and end indices
   */
  getPageRange(page, pageSize) {
    const parsedPage = this.validatePage(page);
    const parsedPageSize = this.validatePageSize(pageSize);
    
    const startIndex = (parsedPage - 1) * parsedPageSize;
    const endIndex = startIndex + parsedPageSize;

    return {
      startIndex,
      endIndex
    };
  }
}

// Export singleton instance
const paginationService = new PaginationService();
export default paginationService;

