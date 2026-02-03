/**
 * Java Tasks E2E Validation
 *
 * Validates that all Java task solutions pass their tests.
 * Run: E2E_TIER=DAILY npm run e2e -- --grep "Java Tasks"
 *
 * Note: Java tasks have longer timeout due to JVM compilation.
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
  submitCodeAndWaitResults,
  allTestsPassed,
  getTestResults,
  formatTaskName,
} from "../../utils/task-helpers";

// Load solutions
const solutionsHelper = new SolutionsHelper();
const tierConfig = getCurrentTierConfig();

// Skip if Java not enabled for this tier
const javaEnabled = isLanguageEnabled("java");
const javaTasks = javaEnabled
  ? solutionsHelper.getByLanguage("java").slice(0, tierConfig.maxTasks)
  : [];

test.describe("Java Tasks Validation", () => {
  test.beforeAll(() => {
    printTierInfo();
    console.log(`Java tasks to validate: ${javaTasks.length}`);
  });

  // Login as premium user before all tests (has access to all tasks)
  test.beforeEach(async ({ page }) => {
    const auth = new AuthHelper(page);
    await auth.loginAsPremiumUser();
  });

  // Skip entire suite if no Java tasks
  test.skip(javaTasks.length === 0, "No Java tasks to validate");

  // Generate a test for each Java task
  for (const task of javaTasks) {
    test(`${formatTaskName(task)} - solution passes all tests`, async ({
      page,
    }) => {
      // Set longer timeout for Java (JVM compilation is slow)
      test.setTimeout(getLanguageTimeout("java"));

      // Navigate to task
      await page.goto(`/course/${task.courseSlug}/task/${task.slug}`);
      await waitForEditor(page);

      // Set solution code
      await setEditorCode(page, task.solutionCode);

      // Run code - Java needs more time for compilation
      await submitCodeAndWaitResults(page, "java");

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
test.describe("Java Tasks Summary", () => {
  test.skip(javaTasks.length === 0, "No Java tasks");

  test("should report validation statistics", async () => {
    const stats = solutionsHelper.getStats();
    console.log(`
=== Java Tasks Summary ===
Total Java Tasks: ${stats.byLanguage["java"] || 0}
Validated in this run: ${javaTasks.length}
Tier: ${tierConfig.name}
`);
    expect(javaTasks.length).toBeGreaterThan(0);
  });
});
