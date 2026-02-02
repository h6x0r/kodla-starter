/**
 * Go Tasks E2E Validation
 *
 * Validates that all Go task solutions pass their tests.
 * Run: E2E_TIER=QUICK npm run e2e -- --grep "Go Tasks"
 */

import { test, expect } from '@playwright/test';
import { AuthHelper, PREMIUM_USER } from '../../fixtures/auth.fixture';
import { SolutionsHelper, TaskSolution } from '../../fixtures/solutions.fixture';
import {
  getCurrentTierConfig,
  isLanguageEnabled,
  getLanguageTimeout,
  printTierInfo,
} from '../../config/test-tiers';
import {
  waitForEditor,
  setEditorCode,
  runCodeAndWaitResults,
  allTestsPassed,
  getTestResults,
  formatTaskName,
} from '../../utils/task-helpers';

// Load solutions
const solutionsHelper = new SolutionsHelper();
const tierConfig = getCurrentTierConfig();

// Skip if Go not enabled for this tier
const goEnabled = isLanguageEnabled('go');
const goTasks = goEnabled
  ? solutionsHelper.getByLanguage('go').slice(0, tierConfig.maxTasks)
  : [];

test.describe('Go Tasks Validation', () => {
  test.beforeAll(() => {
    printTierInfo();
    console.log(`Go tasks to validate: ${goTasks.length}`);
  });

  // Login as premium user before all tests (has access to all tasks)
  test.beforeEach(async ({ page }) => {
    const auth = new AuthHelper(page);
    await auth.loginAsPremiumUser();
  });

  // Skip entire suite if no Go tasks
  test.skip(goTasks.length === 0, 'No Go tasks to validate');

  // Generate a test for each Go task
  for (const task of goTasks) {
    test(
      `${formatTaskName(task)} - solution passes all tests`,
      async ({ page }) => {
        // Set timeout for this specific test (Go needs compilation time)
        test.setTimeout(getLanguageTimeout('go'));

        // Navigate to task
        await page.goto(`/course/${task.courseSlug}/task/${task.slug}`);
        await waitForEditor(page);

        // Set solution code
        await setEditorCode(page, task.solutionCode);

        // Run code
        await runCodeAndWaitResults(page, 'go');

        // Verify all tests pass
        const passed = await allTestsPassed(page);

        if (!passed) {
          const results = await getTestResults(page);
          console.error(
            `Task ${task.slug} failed: ${results.passed}/${results.total} tests passed`,
          );
        }

        expect(passed).toBe(true);
      },
    );
  }
});

// Summary test that runs after all task validations
test.describe('Go Tasks Summary', () => {
  test.skip(goTasks.length === 0, 'No Go tasks');

  test('should report validation statistics', async () => {
    const stats = solutionsHelper.getStats();
    console.log(`
=== Go Tasks Summary ===
Total Go Tasks: ${stats.byLanguage['go'] || 0}
Validated in this run: ${goTasks.length}
Tier: ${tierConfig.name}
`);
    expect(goTasks.length).toBeGreaterThan(0);
  });
});
