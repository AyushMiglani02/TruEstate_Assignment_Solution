# E2E Tests Directory

This directory contains end-to-end tests for the Retail Sales Management System frontend.

## Test Files

### search.spec.js
Tests the complete search workflow including:
- Search input functionality
- Debouncing behavior
- Clear button
- Results display
- No results handling
- Keyboard accessibility

### filter.spec.js
Tests the filtering functionality including:
- Multi-select filters (Region, Gender, Category, Payment)
- Range filters (Age)
- Clear all filters
- Filter combinations
- Integration with search

### pagination.spec.js
Tests pagination including:
- Page navigation (Previous/Next)
- Page size selection
- Page indicators
- Item count display
- Button states (enabled/disabled)
- Integration with other features

### combined.spec.js
Tests complex user workflows:
- Search + Filter + Sort + Pagination together
- State persistence across navigation
- Rapid state changes
- Clearing partial state
- Real-world user scenarios

### error-states.spec.js
Tests error handling and edge cases:
- Empty results
- Invalid inputs
- Special characters
- Rapid interactions
- Mobile responsiveness
- Accessibility

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in UI mode
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

## Prerequisites

Before running tests, ensure:
1. Backend server is running on `http://localhost:5000`
2. Frontend dev server is running on `http://localhost:3000`

Or let Playwright start them automatically (configured in `playwright.config.js`).

## Test Strategy

- **Parallel execution** for faster test runs
- **Retry on failure** in CI environment
- **Screenshots** captured on failure
- **Videos** recorded for failed tests
- **Traces** available for debugging

## Browser Coverage

Tests run on:
- Chromium (Desktop)
- Firefox (Desktop)
- WebKit (Safari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

## Total Tests

- Search: ~10 tests
- Filter: ~15 tests
- Pagination: ~18 tests
- Combined: ~13 tests
- Error States: ~20 tests

**Total: ~76 E2E tests**

