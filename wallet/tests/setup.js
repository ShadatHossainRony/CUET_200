/**
 * Jest Test Setup
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/mock_wallet_test';
process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests
process.env.PAYMENT_SERVICE_URL = 'http://localhost:3002';

// Suppress console logs during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   info: jest.fn(),
//   debug: jest.fn(),
// };
