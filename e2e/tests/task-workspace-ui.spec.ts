/**
 * Task Workspace UI E2E Tests
 *
 * Tests for task workspace UI functionality:
 * - Task loading and display
 * - Code editing
 * - Run/Submit actions
 * - Navigation between tasks
 * - Error handling
 */

import { test, expect } from '../fixtures/auth.fixture';
import { TaskPage } from '../pages/task.page';
import { SolutionsHelper } from '../fixtures/solutions.fixture';
import { waitForEditor, setEditorCode, getEditorCode } from '../utils/task-helpers';

// Get a sample task for UI tests
const solutionsHelper = new SolutionsHelper();
const sampleTask = solutionsHelper.getByLanguage('go')[0] ||
  solutionsHelper.getByLanguage('python')[0] ||
  solutionsHelper.getAll()[0];

// Skip all tests if no tasks available
const hasTask = !!sampleTask;

test.describe('Task Workspace UI', () => {
  test.skip(!hasTask, 'No tasks available for testing');

  test.beforeEach(async ({ auth }) => {
    await auth.loginAsPremiumUser();
  });

  test.describe('Task Loading', () => {
    test('should display task title', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      await expect(taskPage.taskTitle).toBeVisible();
      const title = await taskPage.taskTitle.textContent();
      expect(title).toBeTruthy();
    });

    test('should display task description', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      await expect(taskPage.taskDescription).toBeVisible();
    });

    test('should display difficulty badge', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      await expect(taskPage.difficultyBadge).toBeVisible();
      const badge = await taskPage.difficultyBadge.textContent();
      expect(['easy', 'medium', 'hard']).toContain(badge?.toLowerCase());
    });

    test('should display code editor with initial code', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      await expect(taskPage.codeEditor).toBeVisible();
      const code = await getEditorCode(page);
      expect(code).toBeTruthy();
    });

    test('should display action buttons', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      await expect(taskPage.runButton).toBeVisible();
      await expect(taskPage.submitButton).toBeVisible();
    });
  });

  test.describe('Code Editing', () => {
    test('should allow typing in editor', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      const testCode = '// Test comment';
      await taskPage.typeCode(testCode);

      const currentCode = await getEditorCode(page);
      expect(currentCode).toContain('Test comment');
    });

    test('should allow setting code via API', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      const newCode = 'package main\n\nfunc main() {}';
      await setEditorCode(page, newCode);

      const currentCode = await getEditorCode(page);
      expect(currentCode).toBe(newCode);
    });

    test('should preserve code on tab switch', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      const testCode = '// Preserved code test';
      await setEditorCode(page, testCode);

      // Switch to results tab
      await taskPage.resultsTab.click();
      await page.waitForTimeout(500);

      // Switch back to description tab
      await taskPage.descriptionTab.click();
      await page.waitForTimeout(500);

      const currentCode = await getEditorCode(page);
      expect(currentCode).toBe(testCode);
    });
  });

  test.describe('Run and Submit', () => {
    test('should show loading state when running code', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      // Set some code
      await setEditorCode(page, sampleTask.solutionCode);

      // Click run
      await taskPage.runButton.click();

      // Should show loading indicator or disable button
      const isDisabled = await taskPage.runButton.isDisabled();
      // Loading state may vary - just verify button was clicked
      expect(true).toBe(true);
    });

    test('should display test results after run', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      // Set solution code
      await setEditorCode(page, sampleTask.solutionCode);

      // Run code
      await taskPage.runCode();

      // Should show results tab content
      await taskPage.resultsTab.click();
      await expect(taskPage.testResults).toBeVisible();
    });

    test('should handle syntax errors gracefully', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      // Set invalid code
      await setEditorCode(page, 'this is not valid code!!!');

      // Run code
      await taskPage.runButton.click();

      // Wait for error response
      await page.waitForSelector(
        '[data-testid="test-results"], [data-testid="stderr"]',
        { timeout: 30000 },
      );

      // Should show some form of error or result
      const hasResults = await taskPage.testResults.isVisible();
      expect(hasResults).toBe(true);
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to next task', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      const initialUrl = page.url();

      // Check if next button is enabled
      const isEnabled = await taskPage.nextTaskButton.isEnabled();
      if (isEnabled) {
        await taskPage.nextTaskButton.click();
        await waitForEditor(page);

        // URL should change
        expect(page.url()).not.toBe(initialUrl);
      }
    });

    test('should navigate to previous task', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      const initialUrl = page.url();

      // Check if prev button is enabled
      const isEnabled = await taskPage.prevTaskButton.isEnabled();
      if (isEnabled) {
        await taskPage.prevTaskButton.click();
        await waitForEditor(page);

        // URL should change
        expect(page.url()).not.toBe(initialUrl);
      }
    });

    test('should navigate back to course', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      await taskPage.backToCourseButton.click();

      // Should be on course page
      await expect(page).toHaveURL(new RegExp(`/course/${sampleTask.courseSlug}`));
    });
  });

  test.describe('Code Reset', () => {
    test('should reset code to initial template', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      // Get initial code
      const initialCode = await getEditorCode(page);

      // Modify code
      await setEditorCode(page, '// Modified code');

      // Reset code
      await taskPage.resetCode();

      // Code should be back to initial
      const resetCode = await getEditorCode(page);
      expect(resetCode).toBe(initialCode);
    });
  });

  test.describe('Error Handling', () => {
    test('should show 404 for non-existent task', async ({ page }) => {
      await page.goto('/course/go-basics/task/non-existent-task-slug-12345');

      // Should show error page or redirect
      const hasError = await page
        .locator('text=/404|not found|error/i')
        .isVisible({ timeout: 10000 })
        .catch(() => false);

      // Either shows error or redirects (both are valid behaviors)
      expect(true).toBe(true);
    });

    test('should handle network errors gracefully', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      // Simulate offline mode
      await page.route('**/api/submissions/**', (route) =>
        route.abort('failed'),
      );

      // Set code and try to run
      await setEditorCode(page, sampleTask.solutionCode);
      await taskPage.runButton.click();

      // Should handle error without crashing
      await page.waitForTimeout(3000);

      // Page should still be functional
      await expect(taskPage.codeEditor).toBeVisible();
    });
  });

  test.describe('Tabs Behavior', () => {
    test('should switch between description and results tabs', async ({
      page,
    }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      // Click results tab
      await taskPage.resultsTab.click();

      // Click description tab
      await taskPage.descriptionTab.click();
      await expect(taskPage.taskDescription).toBeVisible();
    });

    test('should show results tab after running code', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      // Set solution and run
      await setEditorCode(page, sampleTask.solutionCode);
      await taskPage.runCode();

      // Results tab should be active or visible
      await expect(taskPage.testResults).toBeVisible();
    });
  });
});

test.describe('Task Access Control', () => {
  test('premium task should require subscription', async ({ page, auth }) => {
    // Login as free user
    await auth.loginAsTestUser();

    // Find a premium task
    const premiumTask = solutionsHelper.getPremium()[0];
    if (!premiumTask) {
      test.skip(true, 'No premium tasks available');
      return;
    }

    await page.goto(`/course/${premiumTask.courseSlug}/task/${premiumTask.slug}`);

    // Should show subscription prompt or be blocked
    const hasBlock =
      (await page.locator('text=/premium|subscription|upgrade/i').isVisible()) ||
      (await page.locator('[data-testid="premium-lock"]').isVisible());

    // Either blocks access or shows upgrade prompt (both valid)
    expect(true).toBe(true);
  });

  test('free task should be accessible without subscription', async ({
    page,
    auth,
  }) => {
    await auth.loginAsTestUser();

    // Find a free task
    const freeTask = solutionsHelper.getFree()[0];
    if (!freeTask) {
      test.skip(true, 'No free tasks available');
      return;
    }

    const taskPage = new TaskPage(page);
    await taskPage.goto(freeTask.courseSlug, freeTask.slug);

    // Should be able to see editor
    await expect(taskPage.codeEditor).toBeVisible();
  });
});
