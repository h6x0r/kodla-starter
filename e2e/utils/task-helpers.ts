/**
 * Task Helpers
 *
 * Shared utilities for task validation E2E tests.
 */

import { Page, expect } from "@playwright/test";
import { TaskSolution } from "../fixtures/solutions.fixture";
import { getLanguageTimeout } from "../config/test-tiers";

/**
 * Wait for Monaco editor to be ready
 */
export async function waitForEditor(
  page: Page,
  timeout = 30_000,
): Promise<void> {
  await page.waitForSelector(".monaco-editor", { timeout });
  // Wait for Monaco to initialize and be exposed on window
  await page.waitForFunction(
    () => {
      const editor = (window as any).monacoEditor;
      return editor !== undefined && typeof editor.setValue === "function";
    },
    { timeout: 15_000 },
  );
}

/**
 * Set code in Monaco editor using its API (faster than typing)
 */
export async function setEditorCode(page: Page, code: string): Promise<void> {
  // First ensure editor is ready
  await waitForEditor(page);

  // Set the code
  await page.evaluate((code) => {
    const editor = (window as any).monacoEditor;
    if (editor) {
      editor.setValue(code);
    }
  }, code);

  // Small delay to ensure Monaco processes the change
  await page.waitForTimeout(100);

  // Verify the code was set correctly
  const currentCode = await page.evaluate(() => {
    const editor = (window as any).monacoEditor;
    return editor ? editor.getValue() : "";
  });

  if (!currentCode.includes(code.substring(0, 50))) {
    throw new Error(
      "Failed to set editor code - code was not applied correctly",
    );
  }
}

/**
 * Get code from Monaco editor
 */
export async function getEditorCode(page: Page): Promise<string> {
  return page.evaluate(() => {
    const editor = (window as any).monacoEditor;
    return editor ? editor.getValue() : "";
  });
}

/**
 * Run code and wait for results (quick mode - only 5 tests)
 */
export async function runCodeAndWaitResults(
  page: Page,
  language: string,
): Promise<void> {
  const timeout = getLanguageTimeout(language);

  // Get the current result text before running (to detect change)
  const previousResultText = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="test-results"]');
    return el?.textContent || "";
  });

  // Click run button
  await page.click('[data-testid="run-button"]');

  // Wait for "Running..." indicator to appear (execution started)
  try {
    await page.waitForSelector("text=Running...", { timeout: 5000 });
  } catch {
    // If "Running..." doesn't appear quickly, execution might have finished instantly
  }

  // Wait for "Running..." to disappear (execution finished)
  await page.waitForSelector("text=Running...", { state: "hidden", timeout });

  // Wait for results to update (content should change from previous)
  await page.waitForFunction(
    (prevText) => {
      const el = document.querySelector('[data-testid="test-results"]');
      const currentText = el?.textContent || "";
      // Results must actually change from previous state
      return currentText !== prevText && currentText.length > 0;
    },
    previousResultText,
    { timeout: 15000 },
  );

  // Additional delay to ensure React has finished rendering
  await page.waitForTimeout(1000);

  // Ensure test results are visible
  await page.waitForSelector('[data-testid="test-results"]', { timeout: 5000 });
}

/**
 * Submit code and wait for results (full mode - all 10 tests)
 * Use this for task validation to ensure all tests pass
 */
export async function submitCodeAndWaitResults(
  page: Page,
  language: string,
): Promise<void> {
  const timeout = getLanguageTimeout(language);

  // Click submit button (runs all tests, not just 5)
  await page.click('[data-testid="submit-button"]');

  // Wait for "Submitting..." or similar indicator
  try {
    await page.waitForSelector("text=Submitting...", { timeout: 5000 });
  } catch {
    // May show different text or finish quickly
  }

  // Wait for submission to complete
  await page.waitForSelector("text=Submitting...", {
    state: "hidden",
    timeout,
  });

  // Wait for submission result to appear
  await page.waitForSelector('[data-testid="submission-result"]', {
    timeout: 30000,
  });

  // Additional delay to ensure React has finished rendering
  await page.waitForTimeout(1000);
}

/**
 * Get test results from the page (works for both Run and Submit)
 */
export async function getTestResults(page: Page): Promise<{
  passed: number;
  failed: number;
  total: number;
  allPassed: boolean;
}> {
  // Click results tab to ensure visibility
  await page.click('[data-testid="results-tab"]');

  const results = await page.evaluate(() => {
    // First try to get from data attributes on tests-count (Run results)
    const testsCount = document.querySelector('[data-testid="tests-count"]');
    if (testsCount) {
      const passed = parseInt(
        testsCount.getAttribute("data-passed") || "0",
        10,
      );
      const total = parseInt(testsCount.getAttribute("data-total") || "0", 10);
      return {
        passed,
        failed: total - passed,
        total,
        allPassed: passed === total && total > 0,
      };
    }

    // Try submission-result (Submit results)
    const submissionResult = document.querySelector(
      '[data-testid="submission-result"]',
    );
    if (submissionResult) {
      const text = submissionResult.textContent || "";
      const match = text.match(/(\d+)\s*\/\s*(\d+)/);
      if (match) {
        const passed = parseInt(match[1], 10);
        const total = parseInt(match[2], 10);
        return {
          passed,
          failed: total - passed,
          total,
          allPassed: passed === total && total > 0,
        };
      }
    }

    // Fallback: try test-results container
    const container = document.querySelector('[data-testid="test-results"]');
    if (!container) return { passed: 0, failed: 0, total: 0, allPassed: false };

    const text = container.textContent || "";

    // Try to parse "X/Y tests passed" pattern
    const match = text.match(/(\d+)\s*\/\s*(\d+)/);
    if (match) {
      const passed = parseInt(match[1], 10);
      const total = parseInt(match[2], 10);
      return {
        passed,
        failed: total - passed,
        total,
        allPassed: passed === total,
      };
    }

    // Check for "all tests passed" indicator
    const allPassed =
      container.querySelector('[data-testid="all-tests-passed"]') !== null ||
      text.toLowerCase().includes("all tests passed");

    return { passed: 0, failed: 0, total: 0, allPassed };
  });

  return results;
}

/**
 * Check if all tests passed
 */
export async function allTestsPassed(page: Page): Promise<boolean> {
  const results = await getTestResults(page);
  return (
    results.allPassed || (results.total > 0 && results.passed === results.total)
  );
}

/**
 * Navigate to task page
 */
export async function navigateToTask(
  page: Page,
  courseSlug: string,
  taskSlug: string,
): Promise<void> {
  await page.goto(`/course/${courseSlug}/task/${taskSlug}`);
  await waitForEditor(page);
}

/**
 * Run solution and verify all tests pass
 */
export async function validateSolution(
  page: Page,
  task: TaskSolution,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Navigate to task
    await navigateToTask(page, task.courseSlug, task.slug);

    // Set solution code
    await setEditorCode(page, task.solutionCode);

    // Run code
    await runCodeAndWaitResults(page, task.language);

    // Check results
    const passed = await allTestsPassed(page);

    if (!passed) {
      const results = await getTestResults(page);
      return {
        success: false,
        error: `Tests failed: ${results.passed}/${results.total} passed`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Format task name for test display
 */
export function formatTaskName(task: TaskSolution): string {
  return `[${task.language}] ${task.slug} (${task.difficulty})`;
}

/**
 * Get CSS selector for test result status
 */
export function getResultStatusSelector(passed: boolean): string {
  return passed
    ? '[data-testid="test-passed"], .text-green-500, .bg-green-500'
    : '[data-testid="test-failed"], .text-red-500, .bg-red-500';
}

/**
 * Check if error message indicates compilation/syntax error
 */
export function isCompilationError(errorText: string): boolean {
  const compilationPatterns = [
    "syntax error",
    "compile error",
    "compilation failed",
    "cannot find symbol",
    "undefined:",
    "SyntaxError",
    "IndentationError",
    "unexpected token",
  ];

  const lowerError = errorText.toLowerCase();
  return compilationPatterns.some((pattern) =>
    lowerError.includes(pattern.toLowerCase()),
  );
}

/**
 * Retry operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
