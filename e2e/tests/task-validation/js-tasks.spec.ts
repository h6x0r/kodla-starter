/**
 * JavaScript Tasks E2E Validation
 *
 * Validates that all JavaScript task solutions pass their tests.
 * Run: E2E_TIER=DAILY npm run e2e -- --grep "JavaScript Tasks"
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

// Skip if JavaScript not enabled for this tier
const jsEnabled = isLanguageEnabled('javascript');
const jsTasks = jsEnabled
  ? solutionsHelper.getByLanguage('javascript').slice(0, tierConfig.maxTasks)
  : [];

test.describe('JavaScript Tasks Validation', () => {
  test.beforeAll(() => {
    printTierInfo();
    console.log(`JavaScript tasks to validate: ${jsTasks.length}`);
  });

  // Login as premium user before all tests (has access to all tasks)
  test.beforeEach(async ({ page }) => {
    const auth = new AuthHelper(page);
    await auth.loginAsPremiumUser();
  });

  // Skip entire suite if no JavaScript tasks
  test.skip(jsTasks.length === 0, 'No JavaScript tasks to validate');

  // Generate a test for each JavaScript task
  for (const task of jsTasks) {
    test(
      `${formatTaskName(task)} - solution passes all tests`,
      async ({ page }) => {
        // Set timeout for this specific test
        test.setTimeout(getLanguageTimeout('javascript'));

        // Navigate to task
        await page.goto(`/course/${task.courseSlug}/task/${task.slug}`);
        await waitForEditor(page);

        // Set solution code
        await setEditorCode(page, task.solutionCode);

        // Run code
        await runCodeAndWaitResults(page, 'javascript');

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
test.describe('JavaScript Tasks Summary', () => {
  test.skip(jsTasks.length === 0, 'No JavaScript tasks');

  test('should report validation statistics', async () => {
    const stats = solutionsHelper.getStats();
    console.log(`
=== JavaScript Tasks Summary ===
Total JavaScript Tasks: ${stats.byLanguage['javascript'] || 0}
Validated in this run: ${jsTasks.length}
Tier: ${tierConfig.name}
`);
    expect(jsTasks.length).toBeGreaterThan(0);
  });
});
