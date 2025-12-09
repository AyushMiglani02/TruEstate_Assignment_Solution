import { useDispatch, useSelector } from 'react-redux';
import { setPage, setPageSize, selectPagination } from '../../store/slices/transactionSlice';
import './Pagination.css';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/**
 * Pagination component for navigating through pages
 * @returns {JSX.Element}
 */
export function Pagination() {
  const dispatch = useDispatch();
  const pagination = useSelector(selectPagination);

  const {
    currentPage = 1,
    pageSize = 10,
    totalItems = 0,
    totalPages = 0,
    hasNextPage = false,
    hasPreviousPage = false,
  } = pagination;

  const handlePrevious = () => {
    if (hasPreviousPage) {
      dispatch(setPage(currentPage - 1));
    }
  };

  const handleNext = () => {
    if (hasNextPage) {
      dispatch(setPage(currentPage + 1));
    }
  };

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    dispatch(setPageSize(newSize));
    dispatch(setPage(1)); // Reset to first page when changing page size
  };

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalItems === 0) {
    return (
      <div className="pagination">
        <p className="pagination-info">No results found</p>
      </div>
    );
  }

  return (
    <div className="pagination" role="navigation" aria-label="Pagination">
      <div className="pagination-info">
        <span>
          Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of{' '}
          <strong>{totalItems.toLocaleString()}</strong> results
        </span>
      </div>

      <div className="pagination-controls">
        <div className="page-size-selector">
          <label htmlFor="page-size-select" className="page-size-label">
            Per page:
          </label>
          <select
            id="page-size-select"
            className="page-size-select"
            value={pageSize}
            onChange={handlePageSizeChange}
            aria-label="Results per page"
          >
            {PAGE_SIZE_OPTIONS.map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="page-navigation">
          <button
            type="button"
            className="pagination-button"
            onClick={handlePrevious}
            disabled={!hasPreviousPage}
            aria-label="Go to previous page"
          >
            ← Previous
          </button>

          <span className="page-indicator" aria-current="page">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>

          <button
            type="button"
            className="pagination-button"
            onClick={handleNext}
            disabled={!hasNextPage}
            aria-label="Go to next page"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

