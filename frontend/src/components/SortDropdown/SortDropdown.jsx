import { useDispatch, useSelector } from 'react-redux';
import { setSort, selectSort } from '../../store/slices/transactionSlice';
import './SortDropdown.css';

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Date (Newest First)', sortBy: 'date', sortOrder: 'desc' },
  { value: 'date-asc', label: 'Date (Oldest First)', sortBy: 'date', sortOrder: 'asc' },
  { value: 'quantity-desc', label: 'Quantity (High to Low)', sortBy: 'quantity', sortOrder: 'desc' },
  { value: 'quantity-asc', label: 'Quantity (Low to High)', sortBy: 'quantity', sortOrder: 'asc' },
  { value: 'customerName-asc', label: 'Customer Name (A-Z)', sortBy: 'customerName', sortOrder: 'asc' },
  { value: 'customerName-desc', label: 'Customer Name (Z-A)', sortBy: 'customerName', sortOrder: 'desc' },
];

/**
 * SortDropdown component for changing sort order
 * @returns {JSX.Element}
 */
export function SortDropdown() {
  const dispatch = useDispatch();
  const { sortBy, sortOrder } = useSelector(selectSort);

  const currentValue = `${sortBy}-${sortOrder}`;

  const handleChange = (e) => {
    const selected = SORT_OPTIONS.find(opt => opt.value === e.target.value);
    if (selected) {
      dispatch(setSort({
        sortBy: selected.sortBy,
        sortOrder: selected.sortOrder,
      }));
    }
  };

  return (
    <div className="sort-dropdown">
      <label htmlFor="sort-select" className="sort-label">
        Sort By
      </label>
      <select
        id="sort-select"
        className="sort-select"
        value={currentValue}
        onChange={handleChange}
        aria-label="Sort transactions"
      >
        {SORT_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

