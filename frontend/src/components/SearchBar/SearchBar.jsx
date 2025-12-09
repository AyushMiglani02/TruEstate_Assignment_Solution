import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSearch, selectSearch } from '../../store/slices/transactionSlice';
import { useDebounce } from '../../hooks/useDebounce';
import './SearchBar.css';

/**
 * SearchBar component with debounced search functionality
 * @returns {JSX.Element}
 */
export function SearchBar() {
  const dispatch = useDispatch();
  const searchFromStore = useSelector(selectSearch);
  const [localSearch, setLocalSearch] = useState(searchFromStore);
  const debouncedSearch = useDebounce(localSearch, 300);

  // Update Redux when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== searchFromStore) {
      dispatch(setSearch(debouncedSearch));
    }
  }, [debouncedSearch, dispatch, searchFromStore]);

  // Sync local state with store (for external changes)
  useEffect(() => {
    if (searchFromStore !== localSearch && searchFromStore !== debouncedSearch) {
      setLocalSearch(searchFromStore);
    }
  }, [searchFromStore, localSearch, debouncedSearch]);

  const handleClear = () => {
    setLocalSearch('');
    dispatch(setSearch(''));
  };

  return (
    <div className="search-bar" role="search">
      <label htmlFor="search-input" className="search-label">
        Search Transactions
      </label>
      <div className="search-input-wrapper">
        <input
          id="search-input"
          type="text"
          className="search-input"
          placeholder="Search by customer name, product, or category..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          aria-label="Search transactions"
          aria-describedby="search-help"
        />
        {localSearch && (
          <button
            type="button"
            className="search-clear"
            onClick={handleClear}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
      <p id="search-help" className="search-help">
        Search across customer names, product names, and categories
      </p>
    </div>
  );
}

