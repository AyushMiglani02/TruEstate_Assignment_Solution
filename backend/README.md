# Retail Sales Management System - Backend

Backend API for the Retail Sales Management System built with Node.js and Express.

## Tech Stack

- **Node.js 18+** - Runtime environment
- **Express.js** - Web framework
- **Jest** - Testing framework
- **Supertest** - API testing
- **CSV Parser** - Data loading
- **Helmet** - Security middleware
- **Morgan** - Request logging
- **CORS** - Cross-origin resource sharing

## Project Structure

```
backend/
├── src/
│   ├── controllers/       # Request handlers
│   ├── services/          # Business logic
│   ├── utils/             # Helper functions
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   └── index.js           # Server entry point
├── tests/
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── fixtures/          # Test data
├── data/                  # Data files
└── package.json
```

## Installation

```bash
cd backend
npm install
```

## Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:5000`

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests for CI

```bash
npm run test:ci
```

## API Endpoints

### Health Check

```http
GET /health
```

Returns server health status.

### API Root

```http
GET /api
```

Returns API information and available endpoints.

### Transactions (Coming Soon)

```http
GET /api/transactions
```

### Filter Options (Coming Soon)

```http
GET /api/filters/options
```

## Development Guidelines

1. **Code Style**: Follow clean code principles
2. **Testing**: Write tests for all new features (80% coverage minimum)
3. **Error Handling**: Use custom error classes
4. **Validation**: Validate all inputs
5. **Documentation**: Document all functions with JSDoc

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
NODE_ENV=development
```

## Current Status

✅ Phase 1: Infrastructure Complete

- [x] Project structure initialized
- [x] Express server configured
- [x] Data loader implemented
- [x] Middleware setup
- [x] Basic tests written
- [x] Error handling implemented

⏳ Phase 2: Services (Coming Next)

- [ ] Search service
- [ ] Filter service
- [ ] Sort service
- [ ] Pagination service

## Testing Strategy

- **Unit Tests**: Test individual functions and methods
- **Integration Tests**: Test API endpoints with real services
- **Coverage Target**: Minimum 80% across all modules

## License

ISC
