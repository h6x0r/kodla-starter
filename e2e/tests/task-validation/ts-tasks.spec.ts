/**
 * TypeScript Tasks E2E Validation
 *
 * Validates that all TypeScript task solutions pass their tests.
 * Run: E2E_TIER=DAILY npm run e2e -- --grep "TypeScript Tasks"
 */

import { test, expect } from "@playwright/test";
import { AuthHelper } from "../../fixtures/auth.fixture";
import { SolutionsHelper } from "../../fixtures/solutions.fixture";
import {
  getCurrentTierConfig,
  isLanguageEnabled,
  getLanguageTimeout,
  printTierInfo,
} from "../../config/test-tiers";
import {
  waitForEditor,
  setEditorCode,
  submitCodeAndWaitResults,
  allTestsPassed,
  getTestResults,
  formatTaskName,
} from "../../utils/task-helpers";

// Load solutions
const solutionsHelper = new SolutionsHelper();
const tierConfig = getCurrentTierConfig();

// Skip if TypeScript not enabled for this tier
const tsEnabled = isLanguageEnabled("typescript");
const tsTasks = tsEnabled
  ? solutionsHelper.getByLanguage("typescript").slice(0, tierConfig.maxTasks)
  : [];

test.describe("TypeScript Tasks Validation", () => {
  test.beforeAll(() => {
    printTierInfo();
    console.log(`TypeScript tasks to validate: ${tsTasks.length}`);
  });

  // Login as premium user before all tests (has access to all tasks)
  test.beforeEach(async ({ page }) => {
    const auth = new AuthHelper(page);
    await auth.loginAsPremiumUser();
  });

  // Skip entire suite if no TypeScript tasks
  test.skip(tsTasks.length === 0, "No TypeScript tasks to validate");

  // Generate a test for each TypeScript task
  for (const task of tsTasks) {
    test(`${formatTaskName(task)} - solution passes all tests`, async ({
      page,
    }) => {
      // Set timeout for this specific test
      test.setTimeout(getLanguageTimeout("typescript"));

      // Navigate to task
      await page.goto(`/course/${task.courseSlug}/task/${task.slug}`);
      await waitForEditor(page);

      // Set solution code
      await setEditorCode(page, task.solutionCode);

      // Run code
      await submitCodeAndWaitResults(page, "typescript");

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
test.describe("TypeScript Tasks Summary", () => {
  test.skip(tsTasks.length === 0, "No TypeScript tasks");

  test("should report validation statistics", async () => {
    const stats = solutionsHelper.getStats();
    console.log(`
=== TypeScript Tasks Summary ===
Total TypeScript Tasks: ${stats.byLanguage["typescript"] || 0}
Validated in this run: ${tsTasks.length}
Tier: ${tierConfig.name}
`);
    expect(tsTasks.length).toBeGreaterThan(0);
  });
});
