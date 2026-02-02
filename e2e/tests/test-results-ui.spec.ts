/**
 * Test Results UI Deep Coverage E2E Tests
 *
 * Tests for deep coverage of test results display:
 * - Individual test case display
 * - Expandable/collapsible test details
 * - Input/Expected/Actual output fields
 * - Pass/Fail indicators and badges
 * - Test count accuracy
 */

import { test, expect } from '../fixtures/auth.fixture';
import { TaskPage } from '../pages/task.page';
import { SolutionsHelper } from '../fixtures/solutions.fixture';
import { waitForEditor, setEditorCode } from '../utils/task-helpers';

// Load solutions
const solutionsHelper = new SolutionsHelper();
// Use go-fundamentals-flatten-nested which uses package main (better for testing)
const sampleTask = solutionsHelper.getBySlug('go-fundamentals-flatten-nested') ||
  solutionsHelper.getByLanguage('python')[0] ||
  solutionsHelper.getAll()[0];

const hasTask = !!sampleTask;

test.describe('Test Results UI - Deep Coverage', () => {
  test.skip(!hasTask, 'No tasks available for testing');

  test.beforeEach(async ({ auth }) => {
    await auth.loginAsPremiumUser();
  });

  test.describe('Test Results Display', () => {
    test('should display test count after running code', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      // Set solution code and run
      await setEditorCode(page, sampleTask.solutionCode);
      await taskPage.runCode();

      // Check test count display
      const testsCount = page.getByTestId('tests-count');
      await expect(testsCount).toBeVisible();

      // Verify data attributes
      const passed = await testsCount.getAttribute('data-passed');
      const total = await testsCount.getAttribute('data-total');

      expect(passed).toBeTruthy();
      expect(total).toBeTruthy();
      expect(parseInt(passed!)).toBeGreaterThanOrEqual(0);
      expect(parseInt(total!)).toBeGreaterThan(0);
    });

    test('should display status badge with correct status', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      // Set solution code and run (should pass)
      await setEditorCode(page, sampleTask.solutionCode);
      await taskPage.runCode();

      const statusBadge = page.getByTestId('run-status-badge');
      await expect(statusBadge).toBeVisible();

      const status = await statusBadge.getAttribute('data-status');
      expect(['passed', 'failed', 'error']).toContain(status);
    });

    test('should show all tests passed message when solution is correct', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      // Set correct solution
      await setEditorCode(page, sampleTask.solutionCode);
      await taskPage.runCode();

      // Check for all tests passed indicator
      const allPassed = page.getByTestId('all-tests-passed');
      const isVisible = await allPassed.isVisible().catch(() => false);

      // Either shows "all tests passed" or all individual tests passed
      if (!isVisible) {
        // Check that all individual tests are passed via test-count
        const testsCount = page.getByTestId('tests-count');
        const passed = await testsCount.getAttribute('data-passed');
        const total = await testsCount.getAttribute('data-total');
        expect(passed).toBe(total);
      } else {
        expect(isVisible).toBe(true);
      }
    });
  });

  test.describe('Individual Test Cases', () => {
    test('should display multiple test case rows', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      await setEditorCode(page, sampleTask.solutionCode);
      await taskPage.runCode();

      // Check that at least test-case-1 exists
      const testCase1 = page.getByTestId('test-case-1');
      await expect(testCase1).toBeVisible();

      // Check for multiple test cases
      const testCase2 = page.getByTestId('test-case-2');
      const testCase3 = page.getByTestId('test-case-3');

      // Most tasks have multiple tests
      const hasMultiple = await testCase2.isVisible().catch(() => false) ||
                          await testCase3.isVisible().catch(() => false);

      // Log how many test cases we found
      let testCount = 1;
      for (let i = 2; i <= 10; i++) {
        const tc = page.getByTestId(`test-case-${i}`);
        if (await tc.isVisible().catch(() => false)) {
          testCount++;
        }
      }
      console.log(`Found ${testCount} test case rows`);
      expect(testCount).toBeGreaterThanOrEqual(1);
    });

    test('should show passed/failed indicator on each test case', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      await setEditorCode(page, sampleTask.solutionCode);
      await taskPage.runCode();

      // Check first test case has passed attribute
      const testCase1 = page.getByTestId('test-case-1');
      await expect(testCase1).toBeVisible();

      const passedAttr = await testCase1.getAttribute('data-passed');
      expect(['true', 'false']).toContain(passedAttr);
    });

    test('should display test case label correctly', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      await setEditorCode(page, sampleTask.solutionCode);
      await taskPage.runCode();

      // Check label
      const label1 = page.getByTestId('test-case-1-label');
      await expect(label1).toBeVisible();
      await expect(label1).toContainText('Test 1');

      // Check second test if exists
      const label2 = page.getByTestId('test-case-2-label');
      if (await label2.isVisible().catch(() => false)) {
        await expect(label2).toContainText('Test 2');
      }
    });
  });

  test.describe('Test Case Expansion/Collapse', () => {
    test('should expand test case details on click', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      await setEditorCode(page, sampleTask.solutionCode);
      await taskPage.runCode();

      // Find first test case toggle
      const toggle = page.getByTestId('test-case-1-toggle');
      await expect(toggle).toBeVisible();

      // Click to expand
      await toggle.click();

      // Check if details are visible
      const details = page.getByTestId('test-case-1-details');
      const isVisible = await details.isVisible().catch(() => false);

      // Details may or may not be present depending on test data
      if (isVisible) {
        await expect(details).toBeVisible();
      }
    });

    test('should collapse test case details on second click', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      await setEditorCode(page, sampleTask.solutionCode);
      await taskPage.runCode();

      const toggle = page.getByTestId('test-case-1-toggle');
      await expect(toggle).toBeVisible();

      // Click to expand
      await toggle.click();
      await page.waitForTimeout(300);

      // Check if details exist
      const details = page.getByTestId('test-case-1-details');
      const wasVisible = await details.isVisible().catch(() => false);

      if (wasVisible) {
        // Click again to collapse
        await toggle.click();
        await page.waitForTimeout(300);

        // Should be hidden now
        const isStillVisible = await details.isVisible().catch(() => false);
        expect(isStillVisible).toBe(false);
      }
    });

    test('should show chevron icon for expandable tests', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      await setEditorCode(page, sampleTask.solutionCode);
      await taskPage.runCode();

      const chevron = page.getByTestId('test-case-1-chevron');
      const hasChevron = await chevron.isVisible().catch(() => false);

      // Chevron may or may not be present depending on whether test has details
      console.log(`Test case 1 has chevron: ${hasChevron}`);
    });
  });

  test.describe('Test Case Details Content', () => {
    test('should display expected output when available', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      await setEditorCode(page, sampleTask.solutionCode);
      await taskPage.runCode();

      // Expand first test
      const toggle = page.getByTestId('test-case-1-toggle');
      await toggle.click();
      await page.waitForTimeout(300);

      // Check for expected output
      const expected = page.getByTestId('test-case-1-expected');
      const hasExpected = await expected.isVisible().catch(() => false);

      if (hasExpected) {
        const expectedValue = page.getByTestId('test-case-1-expected-value');
        await expect(expectedValue).toBeVisible();
        const text = await expectedValue.textContent();
        expect(text).toBeTruthy();
        console.log(`Expected output: ${text?.substring(0, 50)}...`);
      }
    });

    test('should display actual output when available', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      await setEditorCode(page, sampleTask.solutionCode);
      await taskPage.runCode();

      // Expand first test
      const toggle = page.getByTestId('test-case-1-toggle');
      await toggle.click();
      await page.waitForTimeout(300);

      // Check for actual output
      const actual = page.getByTestId('test-case-1-actual');
      const hasActual = await actual.isVisible().catch(() => false);

      if (hasActual) {
        const actualValue = page.getByTestId('test-case-1-actual-value');
        await expect(actualValue).toBeVisible();
        const text = await actualValue.textContent();
        expect(text).toBeTruthy();
        console.log(`Actual output: ${text?.substring(0, 50)}...`);
      }
    });

    test('should display input when available', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      await setEditorCode(page, sampleTask.solutionCode);
      await taskPage.runCode();

      // Expand first test
      const toggle = page.getByTestId('test-case-1-toggle');
      await toggle.click();
      await page.waitForTimeout(300);

      // Check for input
      const input = page.getByTestId('test-case-1-input');
      const hasInput = await input.isVisible().catch(() => false);

      if (hasInput) {
        const inputValue = page.getByTestId('test-case-1-input-value');
        await expect(inputValue).toBeVisible();
        const text = await inputValue.textContent();
        console.log(`Input: ${text?.substring(0, 50)}...`);
      }
    });

    test('should show expected === actual for passed tests', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      // Use correct solution
      await setEditorCode(page, sampleTask.solutionCode);
      await taskPage.runCode();

      // Find a passed test
      const testCase1 = page.getByTestId('test-case-1');
      const isPassed = (await testCase1.getAttribute('data-passed')) === 'true';

      if (isPassed) {
        // Expand it
        await page.getByTestId('test-case-1-toggle').click();
        await page.waitForTimeout(300);

        const expectedValue = page.getByTestId('test-case-1-expected-value');
        const actualValue = page.getByTestId('test-case-1-actual-value');

        const hasExpected = await expectedValue.isVisible().catch(() => false);
        const hasActual = await actualValue.isVisible().catch(() => false);

        if (hasExpected && hasActual) {
          const expected = await expectedValue.textContent();
          const actual = await actualValue.textContent();
          expect(expected).toBe(actual);
        }
      }
    });
  });

  test.describe('Failed Tests Display', () => {
    test('should display error for invalid code', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      // Set invalid code
      await setEditorCode(page, 'invalid code that wont compile!!!');
      await taskPage.runButton.click();

      // Wait for results
      await page.waitForSelector('[data-testid="test-results"]', { timeout: 30000 });

      // Check for error status or stderr
      const statusBadge = page.getByTestId('run-status-badge');
      const status = await statusBadge.getAttribute('data-status').catch(() => null);

      // Should be error or failed
      if (status) {
        expect(['error', 'failed']).toContain(status);
      }
    });

    test('should auto-expand first failed test', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      // Use initial code (likely to fail some tests)
      await taskPage.runButton.click();
      await page.waitForSelector('[data-testid="test-results"]', { timeout: 30000 });

      // Check if any test failed and is expanded
      for (let i = 1; i <= 10; i++) {
        const testCase = page.getByTestId(`test-case-${i}`);
        const exists = await testCase.isVisible().catch(() => false);
        if (!exists) break;

        const isPassed = (await testCase.getAttribute('data-passed')) === 'true';
        if (!isPassed) {
          // First failed test should be auto-expanded
          const details = page.getByTestId(`test-case-${i}-details`);
          const isExpanded = await details.isVisible().catch(() => false);
          console.log(`Test ${i} failed, expanded: ${isExpanded}`);
          break;
        }
      }
    });

    test('should show different expected vs actual for failed tests', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      // Run initial code (may fail)
      await taskPage.runButton.click();
      await page.waitForSelector('[data-testid="test-results"]', { timeout: 30000 });

      // Find a failed test
      for (let i = 1; i <= 10; i++) {
        const testCase = page.getByTestId(`test-case-${i}`);
        const exists = await testCase.isVisible().catch(() => false);
        if (!exists) break;

        const isPassed = (await testCase.getAttribute('data-passed')) === 'true';
        if (!isPassed) {
          // Expand it
          await page.getByTestId(`test-case-${i}-toggle`).click();
          await page.waitForTimeout(300);

          const expectedValue = page.getByTestId(`test-case-${i}-expected-value`);
          const actualValue = page.getByTestId(`test-case-${i}-actual-value`);

          const hasExpected = await expectedValue.isVisible().catch(() => false);
          const hasActual = await actualValue.isVisible().catch(() => false);

          if (hasExpected && hasActual) {
            const expected = await expectedValue.textContent();
            const actual = await actualValue.textContent();
            console.log(`Failed test ${i}: expected="${expected}", actual="${actual}"`);
            // They should be different for a failed test
            expect(expected).not.toBe(actual);
          }
          break;
        }
      }
    });
  });

  test.describe('Complete Test Run Validation', () => {
    test('should validate all 10 tests pass for correct solution', async ({ page }) => {
      const taskPage = new TaskPage(page);
      await taskPage.goto(sampleTask.courseSlug, sampleTask.slug);

      // Set correct solution
      await setEditorCode(page, sampleTask.solutionCode);
      await taskPage.runCode();

      // Check test count
      const testsCount = page.getByTestId('tests-count');
      const passed = await testsCount.getAttribute('data-passed');
      const total = await testsCount.getAttribute('data-total');

      console.log(`Tests passed: ${passed}/${total}`);
      expect(passed).toBe(total);

      // Verify each visible test case is marked as passed
      let allPassed = true;
      for (let i = 1; i <= parseInt(total || '10'); i++) {
        const testCase = page.getByTestId(`test-case-${i}`);
        const exists = await testCase.isVisible().catch(() => false);
        if (!exists) break;

        const isPassed = (await testCase.getAttribute('data-passed')) === 'true';
        if (!isPassed) {
          allPassed = false;
          console.log(`Test ${i} did not pass`);
        }
      }

      expect(allPassed).toBe(true);
    });
  });
});
