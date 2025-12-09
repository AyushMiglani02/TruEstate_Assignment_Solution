# Retail Sales Management System - Frontend

Frontend application for the Retail Sales Management System built with React, Redux Toolkit, and Vite.

## 🚀 Tech Stack

- **React 18** - UI library with hooks
- **Redux Toolkit** - State management
- **Vite** - Build tool and dev server
- **Vitest** - Testing framework
- **React Testing Library** - Component testing
- **Axios** - HTTP client
- **React Router** - Navigation (ready for Phase 5)

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # React components (Phase 5)
│   ├── store/               # Redux store ✅
│   │   ├── index.js         # Store configuration
│   │   └── slices/          # Redux slices
│   │       ├── transactionSlice.js  ✅
│   │       └── filterSlice.js       ✅
│   ├── services/            # API layer ✅
│   │   └── api.js           # HTTP client
│   ├── hooks/               # Custom hooks (Phase 5)
│   ├── utils/               # Utility functions (Phase 5)
│   ├── test/                # Test setup ✅
│   ├── App.jsx              # Root component ✅
│   ├── main.jsx             # Entry point ✅
│   └── index.css            # Global styles
├── index.html               # HTML template
├── vite.config.js           # Vite configuration ✅
└── package.json             # Dependencies ✅
```

## 🛠️ Installation

```bash
cd frontend
npm install
```

## 🏃 Running the App

### Development Mode

```bash
npm run dev
```

The app will start on `http://localhost:3000`

### Production Build

```bash
npm run build
npm run preview
```

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Tests with UI

```bash
npm run test:ui
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

## 📊 Redux State Structure

### Transaction Slice

```javascript
{
  items: [],              // Transaction data
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  },
  loading: false,         // Loading state
  error: null,            // Error message
  search: '',             // Search term
  sortBy: 'date',         // Sort field
  sortOrder: 'desc'       // Sort direction
}
```

### Filter Slice

```javascript
{
  // Active filters
  customerRegion: [],
  gender: [],
  ageRange: { min: 0, max: 100 },
  productCategory: [],
  tags: [],
  paymentMethod: [],
  dateRange: { start: null, end: null },

  // Available options
  options: {
    regions: [],
    genders: [],
    categories: [],
    tags: [],
    paymentMethods: []
  },

  // Loading states
  optionsLoading: false,
  optionsError: null
}
```

## 📡 API Service

The API service layer handles all HTTP requests to the backend:

```javascript
import {
  fetchTransactions,
  fetchFilterOptions,
  fetchStatistics,
} from "./services/api";

// Fetch transactions
const data = await fetchTransactions({
  search: "John",
  filters: { gender: ["Male"] },
  sortBy: "date",
  sortOrder: "desc",
  page: 1,
  pageSize: 10,
});

// Fetch filter options
const options = await fetchFilterOptions();

// Fetch statistics
const stats = await fetchStatistics();
```

## 🎯 Phase 4 Status

### ✅ Completed

- [x] React app initialized with Vite
- [x] Redux Toolkit configured
- [x] Transaction slice with async thunks
- [x] Filter slice with async thunks
- [x] API service layer
- [x] Testing configuration
- [x] Redux slice tests
- [x] API service tests
- [x] Async thunk tests

### ⏳ Phase 5 (Next)

- [ ] SearchBar component
- [ ] FilterPanel component
- [ ] TransactionTable component
- [ ] SortDropdown component
- [ ] Pagination component
- [ ] Component tests
- [ ] E2E tests

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage
npm run lint         # Lint code
```

## 🌐 Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000
```

## 📚 Redux Actions

### Transaction Actions

- `setSearch(term)` - Set search term
- `setSort({ sortBy, sortOrder })` - Set sort parameters
- `setPage(page)` - Set current page
- `setPageSize(size)` - Set page size
- `clearTransactions()` - Clear transaction data
- `resetTransactionState()` - Reset to initial state
- `fetchTransactions(params)` - Async thunk to fetch data

### Filter Actions

- `setCustomerRegion(regions)` - Set region filter
- `setGender(genders)` - Set gender filter
- `setAgeRange({ min, max })` - Set age range
- `setProductCategory(categories)` - Set category filter
- `setTags(tags)` - Set tags filter
- `setPaymentMethod(methods)` - Set payment method
- `setDateRange({ start, end })` - Set date range
- `clearAllFilters()` - Clear all filters
- `resetFilterState()` - Reset to initial state
- `fetchFilterOptions(params)` - Async thunk to fetch options

## 🎨 Styling Approach

Currently using vanilla CSS. Ready to integrate:

- CSS Modules (configured in Vite)
- Styled Components
- Tailwind CSS
- Material-UI

## 📈 Performance

- **Dev Server Start:** < 1 second
- **HMR (Hot Module Replacement):** Instant
- **Build Time:** ~10 seconds
- **Bundle Size:** TBD (after component implementation)

## 🔒 Security

- ✅ Environment variables for sensitive data
- ✅ Axios interceptors for error handling
- ✅ CORS proxy configuration
- ✅ Input sanitization (ready for implementation)

## 🤝 Contributing

1. Follow React best practices
2. Write tests for all new features
3. Maintain 80%+ test coverage
4. Update documentation

## 📄 License

ISC

---

**Status:** Phase 4 Complete ✅ - Ready for Component Development  
**Last Updated:** December 7, 2025
