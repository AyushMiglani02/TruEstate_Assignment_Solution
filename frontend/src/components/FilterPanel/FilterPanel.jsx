import { useDispatch, useSelector } from 'react-redux';
import {
  setCustomerRegion,
  setGender,
  setAgeRange,
  setProductCategory,
  setTags,
  setPaymentMethod,
  setDateRange,
  clearAllFilters,
  selectActiveFilters,
  selectFilterOptions,
  selectHasActiveFilters,
} from '../../store/slices/filterSlice';
import './FilterPanel.css';

/**
 * FilterPanel component for advanced filtering
 * @returns {JSX.Element}
 */
export function FilterPanel() {
  const dispatch = useDispatch();
  const activeFilters = useSelector(selectActiveFilters);
  const filterOptions = useSelector(selectFilterOptions);
  const hasActiveFilters = useSelector(selectHasActiveFilters);

  const handleClearAll = () => {
    dispatch(clearAllFilters());
  };

  const handleRegionToggle = (region) => {
    const newRegions = activeFilters.customerRegion.includes(region)
      ? activeFilters.customerRegion.filter(r => r !== region)
      : [...activeFilters.customerRegion, region];
    dispatch(setCustomerRegion(newRegions));
  };

  const handleGenderToggle = (gender) => {
    const newGenders = activeFilters.gender.includes(gender)
      ? activeFilters.gender.filter(g => g !== gender)
      : [...activeFilters.gender, gender];
    dispatch(setGender(newGenders));
  };

  const handleCategoryToggle = (category) => {
    const newCategories = activeFilters.productCategory.includes(category)
      ? activeFilters.productCategory.filter(c => c !== category)
      : [...activeFilters.productCategory, category];
    dispatch(setProductCategory(newCategories));
  };

  const handlePaymentToggle = (method) => {
    const newMethods = activeFilters.paymentMethod.includes(method)
      ? activeFilters.paymentMethod.filter(m => m !== method)
      : [...activeFilters.paymentMethod, method];
    dispatch(setPaymentMethod(newMethods));
  };

  const handleAgeRangeChange = (field, value) => {
    dispatch(setAgeRange({
      ...activeFilters.ageRange,
      [field]: Number(value),
    }));
  };

  return (
    <div className="filter-panel" role="region" aria-label="Filters">
      <div className="filter-header">
        <h2 className="filter-title">Filters</h2>
        {hasActiveFilters && (
          <button
            type="button"
            className="clear-filters-button"
            onClick={handleClearAll}
            aria-label="Clear all filters"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Customer Region Filter */}
      <div className="filter-group">
        <h3 className="filter-group-title">Customer Region</h3>
        <div className="filter-options" role="group" aria-label="Customer region filters">
          {['North', 'South', 'East', 'West'].map(region => (
            <label key={region} className="filter-checkbox-label">
              <input
                type="checkbox"
                className="filter-checkbox"
                checked={activeFilters.customerRegion.includes(region)}
                onChange={() => handleRegionToggle(region)}
                aria-label={`Filter by ${region} region`}
              />
              <span>{region}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Gender Filter */}
      <div className="filter-group">
        <h3 className="filter-group-title">Gender</h3>
        <div className="filter-options" role="group" aria-label="Gender filters">
          {['Male', 'Female', 'Other'].map(gender => (
            <label key={gender} className="filter-checkbox-label">
              <input
                type="checkbox"
                className="filter-checkbox"
                checked={activeFilters.gender.includes(gender)}
                onChange={() => handleGenderToggle(gender)}
                aria-label={`Filter by ${gender}`}
              />
              <span>{gender}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Age Range Filter */}
      <div className="filter-group">
        <h3 className="filter-group-title">Age Range</h3>
        <div className="age-range-inputs" role="group" aria-label="Age range filters">
          <div className="age-input-group">
            <label htmlFor="age-min" className="age-label">Min</label>
            <input
              id="age-min"
              type="number"
              className="age-input"
              min="0"
              max="100"
              value={activeFilters.ageRange.min}
              onChange={(e) => handleAgeRangeChange('min', e.target.value)}
              aria-label="Minimum age"
            />
          </div>
          <div className="age-input-group">
            <label htmlFor="age-max" className="age-label">Max</label>
            <input
              id="age-max"
              type="number"
              className="age-input"
              min="0"
              max="100"
              value={activeFilters.ageRange.max}
              onChange={(e) => handleAgeRangeChange('max', e.target.value)}
              aria-label="Maximum age"
            />
          </div>
        </div>
      </div>

      {/* Product Category Filter */}
      <div className="filter-group">
        <h3 className="filter-group-title">Product Category</h3>
        <div className="filter-options" role="group" aria-label="Product category filters">
          {['Electronics', 'Clothing', 'Home', 'Sports', 'Books'].map(category => (
            <label key={category} className="filter-checkbox-label">
              <input
                type="checkbox"
                className="filter-checkbox"
                checked={activeFilters.productCategory.includes(category)}
                onChange={() => handleCategoryToggle(category)}
                aria-label={`Filter by ${category} category`}
              />
              <span>{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Payment Method Filter */}
      <div className="filter-group">
        <h3 className="filter-group-title">Payment Method</h3>
        <div className="filter-options" role="group" aria-label="Payment method filters">
          {['Credit Card', 'Debit Card', 'Cash', 'PayPal'].map(method => (
            <label key={method} className="filter-checkbox-label">
              <input
                type="checkbox"
                className="filter-checkbox"
                checked={activeFilters.paymentMethod.includes(method)}
                onChange={() => handlePaymentToggle(method)}
                aria-label={`Filter by ${method}`}
              />
              <span>{method}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

