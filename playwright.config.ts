import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Practix E2E Tests
 * @see https://playwright.dev/docs/test-configuration
 *
 * Test Tiers (set via E2E_TIER env variable):
 * - QUICK: 20 tasks, 2 workers, ~5 min (PR checks)
 * - DAILY: 250 tasks, 4 workers, ~30 min (daily CI)
 * - FULL: All tasks, 4 workers, ~2-3 hours (weekly/release)
 */

// Get tier-specific configuration
type TestTier = 'QUICK' | 'DAILY' | 'FULL';
const tier = (process.env.E2E_TIER?.toUpperCase() || 'QUICK') as TestTier;

const tierConfigs: Record<TestTier, { workers: number; timeout: number; retries: number }> = {
  QUICK: { workers: 2, timeout: 180_000, retries: 1 },   // Go 1.21 on ARM needs ~60s
  DAILY: { workers: 4, timeout: 180_000, retries: 2 },   // Java/Go need longer timeout
  FULL: { workers: 4, timeout: 240_000, retries: 2 },    // Extended for all languages
};

const currentTierConfig = tierConfigs[tier] || tierConfigs.QUICK;

export default defineConfig({
  // Test directory
  testDir: './e2e/tests',

  // Global setup/teardown
  globalSetup: './e2e/global-setup.ts',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retries based on tier configuration
  retries: process.env.CI ? currentTierConfig.retries : 0,

  // Workers based on tier (task-validation tests can run in parallel)
  // Use 1 worker for regular tests to avoid session conflicts
  workers: process.env.E2E_TIER ? currentTierConfig.workers : 1,

  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    // Add JSON reporter for CI
    ...(process.env.CI ? [['json', { outputFile: 'playwright-results/results.json' }] as const] : []),
  ],

  // Shared settings for all the projects below
  use: {
    // Base URL for the application (Docker: 3000, dev: 5173)
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Capture screenshot on failure
    screenshot: 'only-on-failure',

    // Video recording
    video: 'on-first-retry',

    // Viewport size
    viewport: { width: 1280, height: 720 },
  },

  // Configure projects for major browsers
  projects: [
    // Main test project
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // Task validation project with parallel execution
    {
      name: 'task-validation',
      testMatch: '**/task-validation/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // Uncomment for cross-browser testing
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // Mobile viewports
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  // Local development server
  // Skip webServer - ALWAYS use Docker containers (port 3000)
  // Set E2E_DEV_MODE=true only for local dev without Docker
  webServer: process.env.E2E_DEV_MODE ? {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  } : undefined,

  // Output folder for test artifacts
  outputDir: 'playwright-results',

  // Global timeout based on tier (Java needs more time)
  timeout: currentTierConfig.timeout,

  // Expect timeout
  expect: {
    timeout: 5 * 1000,
  },
});
