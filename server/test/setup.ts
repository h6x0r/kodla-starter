/**
 * E2E Test Setup
 * Handles test database cleanup and environment configuration
 */

// Load .env file first
import * as dotenv from "dotenv";
dotenv.config();

// Set test environment
process.env.NODE_ENV = "test";

// Set required environment variables for e2e tests
// Use a secure test JWT_SECRET (32+ characters required)
process.env.JWT_SECRET =
  process.env.JWT_SECRET || "test-jwt-secret-for-e2e-tests-minimum-32-chars";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

// Database - use existing .env DATABASE_URL or default to Docker container
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://practix_user:practix_secure_password@localhost:5432/practix_db?schema=public";

// Redis configuration
process.env.REDIS_HOST = process.env.REDIS_HOST || "localhost";
process.env.REDIS_PORT = process.env.REDIS_PORT || "6379";
process.env.REDIS_PASSWORD =
  process.env.REDIS_PASSWORD || "practix_redis_secure_password_2025";

// Judge0 code execution engine
process.env.JUDGE0_URL = process.env.JUDGE0_URL || "http://localhost:2358";

// Increase timeout for E2E tests
jest.setTimeout(30000);

// Suppress console logs during tests (optional)
// global.console.log = jest.fn();
// global.console.debug = jest.fn();
