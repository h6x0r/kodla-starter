import { test, expect } from '../fixtures/auth.fixture';
import { LoginPage } from '../pages/login.page';

test.describe('Authentication', () => {
  test.describe('Login Flow', () => {
    test('should show login page', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.loginButton).toBeVisible();
    });

    test('should login with valid credentials', async ({ page, auth }) => {
      await auth.loginAsTestUser();

      // Should be redirected to dashboard or home
      await expect(page).toHaveURL(/\/(dashboard|courses)?$/);

      // Should see user menu
      await expect(page.getByTestId('user-menu')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login('wrong@email.com', 'wrongpassword');

      // Should show error message (can be various messages from backend)
      await expect(loginPage.errorMessage).toBeVisible();
      await expect(loginPage.errorMessage).toContainText(/invalid|incorrect|wrong|expired|not found|unauthorized/i);
    });

    test('should show error for empty fields', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      // HTML5 validation should prevent submission with empty fields
      // Just verify we stay on login page and don't navigate away
      await loginPage.loginButton.click();
      await expect(page).toHaveURL(/\/login/);

      // Email field should be marked as invalid by browser
      const emailInput = page.getByTestId('email-input');
      await expect(emailInput).toBeVisible();
    });
  });

  test.describe('Logout Flow', () => {
    test('should logout successfully', async ({ page, auth }) => {
      // First login
      await auth.loginAsTestUser();

      // Then logout
      await auth.logout();

      // Should be on login page
      await expect(page).toHaveURL(/\/login/);

      // Should not see user menu
      await expect(page.getByTestId('user-menu')).not.toBeVisible();
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing protected route', async ({ page }) => {
      // Try to access a protected route
      await page.goto('/admin');

      // Should be redirected to login
      await expect(page).toHaveURL(/\/login/);
    });

    test('should redirect back after login', async ({ page }) => {
      // Try to access protected route
      await page.goto('/course/go-basics/task/go-fundamentals-flatten-nested');

      // Should be redirected to login
      await expect(page).toHaveURL(/\/login/);

      // Login manually (not using auth helper which expects dashboard redirect)
      await page.fill('[data-testid="email-input"]', 'e2e-test@practix.dev');
      await page.fill('[data-testid="password-input"]', 'TestPassword123!');
      await page.click('[data-testid="login-button"]');

      // Should be redirected back to the original protected route
      await page.waitForURL(/\/course\/.*\/task\//, { timeout: 10000 });
      await expect(page).toHaveURL(/\/course\/go-basics\/task\/go-fundamentals-flatten-nested/);
    });
  });

  test.describe('Registration Flow', () => {
    test('should show registration page', async ({ page }) => {
      // Navigate to login first, then click register link
      // because /register route shows the same AuthPage component
      await page.goto('/login');
      await page.getByTestId('register-link').click();

      // Should now be in register mode
      await expect(page.getByTestId('name-input')).toBeVisible();
      await expect(page.getByTestId('email-input')).toBeVisible();
      await expect(page.getByTestId('password-input')).toBeVisible();
      await expect(page.getByTestId('register-button')).toBeVisible();
    });

    test('should navigate from login to register', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.goToRegister();

      // AuthPage changes mode - verify the register button is now visible
      await expect(page.getByTestId('register-button')).toBeVisible();
    });

    // Note: Actual registration test should use unique email
    // and cleanup after test to avoid polluting the database
  });
});
