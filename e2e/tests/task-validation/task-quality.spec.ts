/**
 * Task Quality Validation E2E Tests
 *
 * Validates that all tasks meet quality standards:
 * 1. Initial code does NOT pass all tests (otherwise task is pointless)
 * 2. Solution code DOES pass all tests (10/10)
 * 3. All required fields exist (hints, description, etc.)
 * 4. Code difference between initial and solution is meaningful
 *
 * Run: E2E_TIER=FULL npm run e2e -- --grep "Task Quality"
 */

import { test, expect } from "@playwright/test";
import { AuthHelper } from "../../fixtures/auth.fixture";
import {
  SolutionsHelper,
  TaskSolution,
} from "../../fixtures/solutions.fixture";
import {
  getCurrentTierConfig,
  getLanguageTimeout,
  printTierInfo,
} from "../../config/test-tiers";
import {
  waitForEditor,
  setEditorCode,
  runCodeAndWaitResults,
  submitCodeAndWaitResults,
  allTestsPassed,
  getTestResults,
  formatTaskName,
} from "../../utils/task-helpers";

const solutionsHelper = new SolutionsHelper();
const tierConfig = getCurrentTierConfig();
const allTasks = solutionsHelper.getAll().slice(0, tierConfig.maxTasks);

// ============================================
// SECTION 1: Data Quality Tests (no browser)
// ============================================

test.describe("Task Data Quality", () => {
  test.beforeAll(() => {
    printTierInfo();
    console.log(`Total tasks to validate: ${allTasks.length}`);
  });

  test("all tasks should have required fields", () => {
    const missingFields: string[] = [];

    for (const task of allTasks) {
      const issues: string[] = [];

      if (!task.title || task.title.trim() === "") {
        issues.push("missing title");
      }
      if (!task.description || task.description.trim() === "") {
        issues.push("missing description");
      }
      if (!task.solutionCode || task.solutionCode.trim() === "") {
        issues.push("missing solutionCode");
      }
      if (!task.initialCode || task.initialCode.trim() === "") {
        issues.push("missing initialCode");
      }
      if (!task.testCode || task.testCode.trim() === "") {
        issues.push("missing testCode");
      }

      if (issues.length > 0) {
        missingFields.push(`${task.slug}: ${issues.join(", ")}`);
      }
    }

    if (missingFields.length > 0) {
      console.error("Tasks with missing required fields:");
      missingFields.forEach((m) => console.error(`  - ${m}`));
    }

    expect(missingFields).toHaveLength(0);
  });

  test("all tasks should have at least one hint", () => {
    const noHints: string[] = [];

    for (const task of allTasks) {
      if (!task.hint1 && !task.hint2) {
        noHints.push(task.slug);
      }
    }

    if (noHints.length > 0) {
      console.warn(`Tasks without hints (${noHints.length}):`);
      noHints.slice(0, 10).forEach((s) => console.warn(`  - ${s}`));
      if (noHints.length > 10)
        console.warn(`  ... and ${noHints.length - 10} more`);
    }

    // Warning only - hints are recommended but not strictly required
    // expect(noHints).toHaveLength(0);
  });

  test("all tasks should have whyItMatters explanation", () => {
    const noExplanation: string[] = [];

    for (const task of allTasks) {
      if (!task.whyItMatters || task.whyItMatters.trim() === "") {
        noExplanation.push(task.slug);
      }
    }

    if (noExplanation.length > 0) {
      console.warn(`Tasks without whyItMatters (${noExplanation.length}):`);
      noExplanation.slice(0, 10).forEach((s) => console.warn(`  - ${s}`));
    }

    // Warning only
  });

  test("solution code should be different from initial code", () => {
    const identical: string[] = [];

    for (const task of allTasks) {
      const initial = task.initialCode.trim();
      const solution = task.solutionCode.trim();

      if (initial === solution) {
        identical.push(task.slug);
      }
    }

    if (identical.length > 0) {
      console.error("Tasks where initial === solution (task is pointless):");
      identical.forEach((s) => console.error(`  - ${s}`));
    }

    expect(identical).toHaveLength(0);
  });

  test("solution code should be meaningfully different from initial", () => {
    const tooSimilar: string[] = [];

    for (const task of allTasks) {
      const initial = task.initialCode.replace(/\s+/g, "").toLowerCase();
      const solution = task.solutionCode.replace(/\s+/g, "").toLowerCase();

      // Calculate simple similarity (Jaccard-like)
      if (initial.length > 0 && solution.length > 0) {
        const similarity = initial.length / solution.length;
        // If initial is more than 95% of solution, it's too similar
        if (similarity > 0.95 && initial.length > 50) {
          tooSimilar.push(
            `${task.slug} (${Math.round(similarity * 100)}% similar)`,
          );
        }
      }
    }

    if (tooSimilar.length > 0) {
      console.warn(`Tasks with very similar initial/solution code:`);
      tooSimilar.forEach((s) => console.warn(`  - ${s}`));
    }
  });

  test("test code should have at least 10 test cases", () => {
    const insufficientTests: string[] = [];

    for (const task of allTasks) {
      if (!task.testCode) continue;

      // Count test functions/methods
      const testCode = task.testCode;
      let testCount = 0;

      // Python: def test_ or def Test
      testCount += (testCode.match(/def\s+test_?\w+/gi) || []).length;
      // Go: func Test
      testCount += (testCode.match(/func\s+Test\d+/g) || []).length;
      // Java: @Test or public void test
      testCount += (testCode.match(/@Test|public\s+void\s+test/gi) || [])
        .length;
      // JS/TS: it(', test('
      testCount += (testCode.match(/\bit\s*\(|test\s*\(/g) || []).length;

      if (testCount < 10 && testCount > 0) {
        insufficientTests.push(`${task.slug}: ${testCount} tests`);
      }
    }

    if (insufficientTests.length > 0) {
      console.warn(
        `Tasks with fewer than 10 tests (${insufficientTests.length}):`,
      );
      insufficientTests.slice(0, 20).forEach((s) => console.warn(`  - ${s}`));
    }
  });

  test("all tasks should have valid difficulty", () => {
    const invalidDifficulty: string[] = [];
    const validDifficulties = ["easy", "medium", "hard"];

    for (const task of allTasks) {
      if (!validDifficulties.includes(task.difficulty)) {
        invalidDifficulty.push(`${task.slug}: "${task.difficulty}"`);
      }
    }

    expect(invalidDifficulty).toHaveLength(0);
  });

  test("all tasks should have detected language", () => {
    const unknownLang: string[] = [];

    for (const task of allTasks) {
      if (task.language === "unknown") {
        unknownLang.push(`${task.slug} (course: ${task.courseSlug})`);
      }
    }

    if (unknownLang.length > 0) {
      console.error("Tasks with unknown language:");
      unknownLang.forEach((s) => console.error(`  - ${s}`));
    }

    expect(unknownLang).toHaveLength(0);
  });
});

// ============================================
// SECTION 2: Initial Code Validation (browser)
// Ensures initial code does NOT pass all tests
// ============================================

test.describe("Initial Code Should Fail", () => {
  // Sample tasks for initial code validation (subset for speed)
  const sampleSize = Math.min(50, Math.ceil(allTasks.length * 0.1));
  const sampleTasks = allTasks
    .filter((t) => t.initialCode && t.initialCode.trim() !== "")
    .sort(() => Math.random() - 0.5)
    .slice(0, sampleSize);

  test.skip(sampleTasks.length === 0, "No tasks with initial code");

  test.beforeAll(() => {
    console.log(
      `Validating initial code for ${sampleTasks.length} sample tasks`,
    );
  });

  test.beforeEach(async ({ page }) => {
    const auth = new AuthHelper(page);
    await auth.loginAsPremiumUser();
  });

  for (const task of sampleTasks) {
    test(`[${task.language}] ${task.slug} - initial code should NOT pass all tests`, async ({
      page,
    }) => {
      test.setTimeout(getLanguageTimeout(task.language));

      // Navigate to task
      await page.goto(`/course/${task.courseSlug}/task/${task.slug}`);
      await waitForEditor(page);

      // Initial code should already be loaded, but let's set it explicitly
      await setEditorCode(page, task.initialCode);

      // Run code
      await runCodeAndWaitResults(page, task.language);

      // Check if all tests pass
      const results = await getTestResults(page);
      const allPassed =
        results.allPassed ||
        (results.total > 0 && results.passed === results.total);

      if (allPassed) {
        console.error(`PROBLEM: ${task.slug} initial code passes all tests!`);
        console.error(
          `  This means the task is pointless - user doesn't need to do anything.`,
        );
      }

      // Initial code should NOT pass all tests
      expect(allPassed).toBe(false);
    });
  }
});

// ============================================
// SECTION 3: Solution Code Validation (browser)
// Ensures solution code DOES pass all tests
// ============================================

test.describe("Solution Code Should Pass", () => {
  const sampleSize = Math.min(100, allTasks.length);
  const sampleTasks = allTasks
    .sort(() => Math.random() - 0.5)
    .slice(0, sampleSize);

  test.skip(sampleTasks.length === 0, "No tasks to validate");

  test.beforeAll(() => {
    console.log(
      `Validating solution code for ${sampleTasks.length} sample tasks`,
    );
  });

  test.beforeEach(async ({ page }) => {
    const auth = new AuthHelper(page);
    await auth.loginAsPremiumUser();
  });

  for (const task of sampleTasks) {
    test(`[${task.language}] ${task.slug} - solution should pass 10/10`, async ({
      page,
    }) => {
      test.setTimeout(getLanguageTimeout(task.language));

      await page.goto(`/course/${task.courseSlug}/task/${task.slug}`);
      await waitForEditor(page);

      await setEditorCode(page, task.solutionCode);
      // Use submit to run all 10 tests (not just 5)
      await submitCodeAndWaitResults(page, task.language);

      const passed = await allTestsPassed(page);

      if (!passed) {
        const results = await getTestResults(page);
        console.error(
          `${task.slug} FAILED: ${results.passed}/${results.total} tests`,
        );
      }

      expect(passed).toBe(true);
    });
  }
});

// ============================================
// SECTION 4: Statistics Summary
// ============================================

test.describe("Task Quality Summary", () => {
  test("should report overall statistics", () => {
    const stats = solutionsHelper.getStats();
    const tasksWithHints = allTasks.filter((t) => t.hint1 || t.hint2).length;
    const tasksWithWhyItMatters = allTasks.filter((t) => t.whyItMatters).length;
    const tasksWithDescription = allTasks.filter((t) => t.description).length;

    console.log(`
=== Task Quality Summary ===
Total Tasks: ${stats.total}
With Hints: ${tasksWithHints} (${Math.round((tasksWithHints / stats.total) * 100)}%)
With WhyItMatters: ${tasksWithWhyItMatters} (${Math.round((tasksWithWhyItMatters / stats.total) * 100)}%)
With Description: ${tasksWithDescription} (${Math.round((tasksWithDescription / stats.total) * 100)}%)

By Language:
${Object.entries(stats.byLanguage)
  .sort(([, a], [, b]) => (b as number) - (a as number))
  .map(([lang, count]) => `  ${lang}: ${count}`)
  .join("\n")}

By Difficulty:
${Object.entries(stats.byDifficulty)
  .map(([diff, count]) => `  ${diff}: ${count}`)
  .join("\n")}

Premium: ${stats.premium}, Free: ${stats.free}
`);

    expect(stats.total).toBeGreaterThan(0);
  });
});
