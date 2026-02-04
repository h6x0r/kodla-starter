/**
 * Python Tasks E2E Validation
 *
 * Validates that all Python task solutions pass their tests.
 * Run: E2E_TIER=QUICK npm run e2e -- --grep "Python Tasks"
 */

import { test, expect } from "@playwright/test";
import { AuthHelper, PREMIUM_USER } from "../../fixtures/auth.fixture";
import {
  SolutionsHelper,
  TaskSolution,
} from "../../fixtures/solutions.fixture";
import {
  getCurrentTierConfig,
  isLanguageEnabled,
  getLanguageTimeout,
  printTierInfo,
} from "../../config/test-tiers";
import {
  waitForEditor,
  setEditorCode,
  runCodeAndWaitResults,
  allTestsPassed,
  getTestResults,
  formatTaskName,
} from "../../utils/task-helpers";

// Load solutions
const solutionsHelper = new SolutionsHelper();
const tierConfig = getCurrentTierConfig();

// Skip if Python not enabled for this tier
const pythonEnabled = isLanguageEnabled("python");
const pythonTasks = pythonEnabled
  ? solutionsHelper.getByLanguage("python").slice(0, tierConfig.maxTasks)
  : [];

test.describe("Python Tasks Validation", () => {
  test.beforeAll(() => {
    printTierInfo();
    console.log(`Python tasks to validate: ${pythonTasks.length}`);
  });

  // Login as premium user before all tests (has access to all tasks)
  test.beforeEach(async ({ page }) => {
    const auth = new AuthHelper(page);
    await auth.loginAsPremiumUser();
  });

  // Skip entire suite if no Python tasks
  test.skip(pythonTasks.length === 0, "No Python tasks to validate");

  // Generate a test for each Python task
  for (const task of pythonTasks) {
    test(`${formatTaskName(task)} - solution passes all tests`, async ({
      page,
    }) => {
      // Set timeout for this specific test
      test.setTimeout(getLanguageTimeout("python"));

      // Navigate to task
      await page.goto(`/course/${task.courseSlug}/task/${task.slug}`);
      await waitForEditor(page);

      // Set solution code
      await setEditorCode(page, task.solutionCode);

      // Run code
      await runCodeAndWaitResults(page, "python");

      // Verify all tests pass
      const passed = await allTestsPassed(page);

      if (!passed) {
        const results = await getTestResults(page);
        console.error(
          `Task ${task.slug} failed: ${results.passed}/${results.total} tests passed`,
        );
      }

      expect(passed).toBe(true);
    });
  }
});

// Summary test that runs after all task validations
test.describe("Python Tasks Summary", () => {
  test.skip(pythonTasks.length === 0, "No Python tasks");

  test("should report validation statistics", async () => {
    const stats = solutionsHelper.getStats();
    console.log(`
=== Python Tasks Summary ===
Total Python Tasks: ${stats.byLanguage["python"] || 0}
Validated in this run: ${pythonTasks.length}
Tier: ${tierConfig.name}
`);
    expect(pythonTasks.length).toBeGreaterThan(0);
  });
});
