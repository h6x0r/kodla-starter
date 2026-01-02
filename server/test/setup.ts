/**
 * E2E Test Setup
 * Handles test database cleanup and environment configuration
 */

// Set test environment
process.env.NODE_ENV = 'test';

// Set required environment variables for e2e tests
// Use a secure test JWT_SECRET (32+ characters required)
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-e2e-tests-minimum-32-chars';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
process.env.REDIS_HOST = process.env.REDIS_HOST || 'localhost';
process.env.REDIS_PORT = process.env.REDIS_PORT || '6379';
process.env.PISTON_URL = process.env.PISTON_URL || 'http://localhost:2000';

// Increase timeout for E2E tests
jest.setTimeout(30000);

// Suppress console logs during tests (optional)
// global.console.log = jest.fn();
// global.console.debug = jest.fn();
