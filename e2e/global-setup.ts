import { FullConfig } from '@playwright/test';

/**
 * Global Setup for E2E Tests
 * Runs once before all tests
 *
 * Prerequisites:
 * - Backend server must be running (npm run dev in server/)
 * - Frontend must be running (npm run dev in root)
 * - Database must be seeded with E2E test users (npm run seed in server/)
 *
 * E2E Test Users (created by npm run seed):
 * - e2e-test@practix.dev / TestPassword123! (free user)
 * - e2e-premium@practix.dev / PremiumPassword123! (premium user)
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test setup...');

  // Get base URL from config
  const baseURL = config.projects[0].use.baseURL || 'http://localhost:5173';
  console.log(`📍 Base URL: ${baseURL}`);

  // Verify backend is available (Docker: 8080, dev: 3001)
  const backendURL = process.env.E2E_API_URL || 'http://localhost:8080';
  console.log(`📡 Backend URL: ${backendURL}`);

  try {
    // Health check - verify backend is running
    const healthCheck = await fetch(`${backendURL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Origin': baseURL,
      },
    });

    if (!healthCheck.ok) {
      console.error('❌ Backend health check failed!');
      console.error(`   Status: ${healthCheck.status}`);
      console.error('   Make sure the backend server is running: cd server && npm run dev');
      // Don't throw - let tests try anyway
      console.warn('   Continuing anyway...');
    } else {
      const healthData = await healthCheck.json();
      console.log(`✅ Backend is healthy: ${healthData.status || 'ok'}`);
    }

    // Note: We don't do a login check here because it creates sessions
    // that can conflict with actual test logins. The tests themselves
    // will fail with clear error messages if the test users don't exist.
    console.log('📝 Test users should be seeded: e2e-test@practix.dev, e2e-premium@practix.dev');

  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch failed')) {
      console.error('❌ Cannot connect to backend!');
      console.error('   Make sure the backend server is running:');
      console.error('   cd server && npm run dev');
      console.error('');
      console.error('   Or if using Docker:');
      console.error('   docker compose up -d');
    } else {
      console.error('❌ Setup error:', error);
    }
    // Don't throw - let tests fail with proper error messages
  }

  console.log('✅ E2E test setup complete\n');
}

export default globalSetup;
