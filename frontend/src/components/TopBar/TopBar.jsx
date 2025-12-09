import { useDispatch, useSelector } from 'react-redux';
import {
  setCustomerRegion,
  setGender,
  setAgeRange,
  setProductCategory,
  setTags,
  setPaymentMethod,
  setDateRange,
  selectActiveFilters,
} from '../../store/slices/filterSlice';
import { setSort, selectSort } from '../../store/slices/transactionSlice';
import './TopBar.css';

/**
 * TopBar component with horizontal filters and search
 * @returns {JSX.Element}
 */
export function TopBar({ onRefresh, searchTerm, onSearchChange }) {
  const dispatch = useDispatch();
  const activeFilters = useSelector(selectActiveFilters);
  const sort = useSelector(selectSort);

  const handleSortChange = (e) => {
    const value = e.target.value;
    const [sortBy, sortOrder] = value.split('-');
    dispatch(setSort({ sortBy, sortOrder }));
  };

  return (
    <div className="top-bar">
      <div className="top-bar-header">
        <h1 className="page-title">Sales Management System</h1>
        
        <div className="top-bar-actions">
          <div className="search-input-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="search"
              className="search-input"
              placeholder="Name, Phone no."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search transactions"
            />
          </div>
        </div>
      </div>

      <div className="filters-bar">
        <button 
          className="refresh-button" 
          onClick={onRefresh}
          aria-label="Refresh data"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C12.7614 3 15.1355 4.67867 16.273 7M17 3V7H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Customer Region Filter */}
        <div className="filter-dropdown">
          <select
            className="filter-select"
            value={activeFilters.customerRegion[0] || ''}
            onChange={(e) => dispatch(setCustomerRegion(e.target.value ? [e.target.value] : []))}
            aria-label="Filter by customer region"
          >
            <option value="">Customer Region</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
          </select>
        </div>

        {/* Gender Filter */}
        <div className="filter-dropdown">
          <select
            className="filter-select"
            value={activeFilters.gender[0] || ''}
            onChange={(e) => dispatch(setGender(e.target.value ? [e.target.value] : []))}
            aria-label="Filter by gender"
          >
            <option value="">Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Age Range Filter */}
        <div className="filter-dropdown">
          <select
            className="filter-select"
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                const [min, max] = value.split('-').map(Number);
                dispatch(setAgeRange({ min, max }));
              } else {
                dispatch(setAgeRange({ min: 0, max: 100 }));
              }
            }}
            aria-label="Filter by age range"
          >
            <option value="">Age Range</option>
            <option value="0-20">0-20</option>
            <option value="21-30">21-30</option>
            <option value="31-40">31-40</option>
            <option value="41-50">41-50</option>
            <option value="51-100">51+</option>
          </select>
        </div>

        {/* Product Category Filter */}
        <div className="filter-dropdown">
          <select
            className="filter-select"
            value={activeFilters.productCategory[0] || ''}
            onChange={(e) => dispatch(setProductCategory(e.target.value ? [e.target.value] : []))}
            aria-label="Filter by product category"
          >
            <option value="">Product Category</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Home">Home</option>
            <option value="Sports">Sports</option>
            <option value="Books">Books</option>
            <option value="Beauty">Beauty</option>
          </select>
        </div>

        {/* Tags Filter */}
        <div className="filter-dropdown">
          <select
            className="filter-select"
            value={activeFilters.tags[0] || ''}
            onChange={(e) => dispatch(setTags(e.target.value ? [e.target.value] : []))}
            aria-label="Filter by tags"
          >
            <option value="">Tags</option>
            <option value="organic">Organic</option>
            <option value="premium">Premium</option>
            <option value="sale">Sale</option>
            <option value="new">New</option>
          </select>
        </div>

        {/* Payment Method Filter */}
        <div className="filter-dropdown">
          <select
            className="filter-select"
            value={activeFilters.paymentMethod[0] || ''}
            onChange={(e) => dispatch(setPaymentMethod(e.target.value ? [e.target.value] : []))}
            aria-label="Filter by payment method"
          >
            <option value="">Payment Method</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Cash">Cash</option>
            <option value="PayPal">PayPal</option>
            <option value="UPI">UPI</option>
          </select>
        </div>

        {/* Date Filter */}
        <div className="filter-dropdown">
          <select
            className="filter-select"
            onChange={(e) => {
              const value = e.target.value;
              const today = new Date();
              let start = null;
              
              if (value === 'today') {
                start = today.toISOString().split('T')[0];
              } else if (value === 'week') {
                const weekAgo = new Date(today);
                weekAgo.setDate(today.getDate() - 7);
                start = weekAgo.toISOString().split('T')[0];
              } else if (value === 'month') {
                const monthAgo = new Date(today);
                monthAgo.setMonth(today.getMonth() - 1);
                start = monthAgo.toISOString().split('T')[0];
              }
              
              dispatch(setDateRange({ 
                start, 
                end: start ? today.toISOString().split('T')[0] : null 
              }));
            }}
            aria-label="Filter by date"
          >
            <option value="">Date</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="filter-dropdown sort-dropdown">
          <select
            className="filter-select"
            value={`${sort.sortBy}-${sort.sortOrder}`}
            onChange={handleSortChange}
            aria-label="Sort transactions"
          >
            <option value="date-desc">Sort by: Customer Name (A-Z)</option>
            <option value="customerName-asc">Customer Name (A-Z)</option>
            <option value="customerName-desc">Customer Name (Z-A)</option>
            <option value="date-desc">Date (Newest First)</option>
            <option value="date-asc">Date (Oldest First)</option>
            <option value="quantity-desc">Quantity (High to Low)</option>
            <option value="quantity-asc">Quantity (Low to High)</option>
          </select>
        </div>
      </div>
    </div>
  );
}

