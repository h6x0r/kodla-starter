import { test as base, Page } from '@playwright/test';

/**
 * Test user credentials for E2E tests
 */
export const TEST_USER = {
  email: 'e2e-test@practix.dev',
  password: 'TestPassword123!',
  name: 'E2E Test User',
};

export const PREMIUM_USER = {
  email: 'e2e-premium@practix.dev',
  password: 'PremiumPassword123!',
  name: 'E2E Premium User',
};

export const ADMIN_USER = {
  email: 'e2e-admin@practix.dev',
  password: 'AdminPassword123!',
  name: 'E2E Admin User',
};

/**
 * Authentication helpers
 */
export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Login with credentials
   */
  async login(email: string, password: string) {
    await this.page.goto('/login');
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.click('[data-testid="login-button"]');
    // Wait for redirect to dashboard or home
    await this.page.waitForURL(/\/(dashboard|courses)?$/);
  }

  /**
   * Login as test user
   */
  async loginAsTestUser() {
    await this.login(TEST_USER.email, TEST_USER.password);
  }

  /**
   * Login as premium user
   */
  async loginAsPremiumUser() {
    await this.login(PREMIUM_USER.email, PREMIUM_USER.password);
  }

  /**
   * Login as admin user
   */
  async loginAsAdmin() {
    await this.login(ADMIN_USER.email, ADMIN_USER.password);
  }

  /**
   * Logout
   */
  async logout() {
    // Logout button is always visible when logged in (no dropdown)
    await this.page.click('[data-testid="logout-button"]');
    await this.page.waitForURL(/\/login/);
  }

  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    const userMenu = await this.page.$('[data-testid="user-menu"]');
    return userMenu !== null;
  }

  /**
   * Register a new user
   */
  async register(email: string, password: string, name: string) {
    await this.page.goto('/register');
    await this.page.fill('[data-testid="name-input"]', name);
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.click('[data-testid="register-button"]');
    await this.page.waitForURL(/\/(dashboard|courses)?$/);
  }
}

/**
 * Extended test fixture with auth helper
 */
export const test = base.extend<{ auth: AuthHelper }>({
  auth: async ({ page }, use) => {
    const auth = new AuthHelper(page);
    await use(auth);
  },
});

export { expect } from '@playwright/test';
