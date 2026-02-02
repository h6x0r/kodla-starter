import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for Task Workspace
 */
export class TaskPage {
  readonly page: Page;

  // Task description panel
  readonly taskTitle: Locator;
  readonly taskDescription: Locator;
  readonly difficultyBadge: Locator;

  // Code editor
  readonly codeEditor: Locator;

  // Action buttons
  readonly runButton: Locator;
  readonly submitButton: Locator;
  readonly resetButton: Locator;

  // Tabs
  readonly descriptionTab: Locator;
  readonly resultsTab: Locator;
  readonly solutionTab: Locator;
  readonly aiTutorTab: Locator;
  readonly tabsContainer: Locator;

  // Results panel
  readonly testResults: Locator;
  readonly stdout: Locator;
  readonly stderr: Locator;

  // Navigation
  readonly prevTaskButton: Locator;
  readonly nextTaskButton: Locator;
  readonly backToCourseButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Task description
    this.taskTitle = page.getByTestId('task-title');
    this.taskDescription = page.getByTestId('task-description');
    this.difficultyBadge = page.getByTestId('difficulty-badge');

    // Code editor - Monaco editor container
    this.codeEditor = page.locator('.monaco-editor');

    // Action buttons
    this.runButton = page.getByTestId('run-button');
    this.submitButton = page.getByTestId('submit-button');
    this.resetButton = page.getByTestId('reset-code-button');

    // Tabs
    this.descriptionTab = page.getByTestId('description-tab');
    this.resultsTab = page.getByTestId('results-tab');
    this.solutionTab = page.locator('button:has(svg.text-green-500, svg.text-amber-500)').first();
    this.aiTutorTab = page.locator('button:has(svg.text-purple-500)').first();
    this.tabsContainer = page.locator('[data-testid="description-tab"]').locator('..');

    // Results panel
    this.testResults = page.getByTestId('test-results');
    this.stdout = page.getByTestId('stdout');
    this.stderr = page.getByTestId('stderr');

    // Navigation
    this.prevTaskButton = page.getByTestId('prev-task-button');
    this.nextTaskButton = page.getByTestId('next-task-button');
    this.backToCourseButton = page.getByTestId('back-to-course-button');
  }

  async goto(courseSlug: string, taskSlug: string) {
    await this.page.goto(`/course/${courseSlug}/task/${taskSlug}`);
    await this.page.waitForSelector('.monaco-editor', { timeout: 30000 });
    // Wait for Monaco to be fully initialized and exposed on window
    await this.page.waitForFunction(
      () => {
        const editor = (window as any).monacoEditor;
        return editor !== undefined && typeof editor.setValue === 'function';
      },
      { timeout: 15000 },
    );
  }

  async gotoById(taskSlug: string) {
    await this.page.goto(`/task/${taskSlug}`);
    await this.page.waitForSelector('.monaco-editor', { timeout: 30000 });
  }

  /**
   * Type code into Monaco editor
   */
  async typeCode(code: string) {
    // Focus editor and clear existing content
    await this.codeEditor.click();
    await this.page.keyboard.press('Meta+a'); // Select all (Mac)
    await this.page.keyboard.press('Backspace');

    // Type new code
    await this.page.keyboard.type(code, { delay: 10 });
  }

  /**
   * Set code via clipboard (faster for long code)
   */
  async setCode(code: string) {
    await this.page.evaluate((code) => {
      // Access Monaco editor instance
      const editor = (window as any).monacoEditor;
      if (editor) {
        editor.setValue(code);
      }
    }, code);
  }

  /**
   * Run code without submitting
   */
  async runCode() {
    await this.runButton.click();
    // Wait for results
    await this.page.waitForSelector('[data-testid="test-results"]', { timeout: 30000 });
  }

  /**
   * Submit code for full evaluation
   */
  async submitCode() {
    await this.submitButton.click();
    // Wait for submission result
    await this.page.waitForSelector('[data-testid="submission-result"]', { timeout: 60000 });
  }

  /**
   * Reset code to initial template
   */
  async resetCode() {
    await this.resetButton.click();
    // Confirm reset if dialog appears
    const confirmButton = this.page.getByTestId('confirm-reset');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
  }

  /**
   * Get test results
   */
  async getTestResults() {
    await this.resultsTab.click();
    const results = await this.testResults.textContent();
    return results;
  }

  /**
   * Check if task passed
   */
  async isPassed(): Promise<boolean> {
    const passedIndicator = this.page.getByTestId('passed-indicator');
    return passedIndicator.isVisible();
  }

  /**
   * Navigate to next task
   */
  async goToNextTask() {
    await this.nextTaskButton.click();
    await this.page.waitForSelector('.monaco-editor');
  }

  /**
   * Navigate to previous task
   */
  async goToPrevTask() {
    await this.prevTaskButton.click();
    await this.page.waitForSelector('.monaco-editor');
  }

  /**
   * Check if tabs are in compact mode (icons only, no text)
   */
  async areTabsCompact(): Promise<boolean> {
    // In compact mode, description tab should have only an icon, no span with text
    const descriptionTabSpan = this.descriptionTab.locator('span');
    const spanCount = await descriptionTabSpan.count();
    return spanCount === 0;
  }

  /**
   * Get tab labels text (returns empty array if in compact mode)
   */
  async getTabLabels(): Promise<string[]> {
    const labels: string[] = [];

    // In compact mode, spans don't exist. Use count() to check first.
    // Note: Results tab may have a status indicator span, so we filter for text-containing spans
    const descSpanCount = await this.descriptionTab.locator('span').count();

    if (descSpanCount > 0) {
      const descText = await this.descriptionTab.locator('span').first().textContent({ timeout: 1000 });
      if (descText && descText.trim()) labels.push(descText);
    }

    // For results tab, find span with actual text content (not the status dot)
    const resultsSpans = this.resultsTab.locator('span');
    const resultsSpanCount = await resultsSpans.count();

    for (let i = 0; i < resultsSpanCount; i++) {
      const span = resultsSpans.nth(i);
      const text = await span.textContent({ timeout: 1000 });
      // Only add if span has text content (skip status indicator dots)
      if (text && text.trim()) {
        labels.push(text);
        break; // Only need the first text span
      }
    }

    return labels;
  }

  /**
   * Resize the left panel (description panel) by dragging the resize handle
   */
  async resizeLeftPanel(deltaX: number) {
    const resizeHandle = this.page.locator('[data-testid="resize-handle"]').first();
    if (await resizeHandle.isVisible()) {
      const box = await resizeHandle.boundingBox();
      if (box) {
        await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await this.page.mouse.down();
        await this.page.mouse.move(box.x + box.width / 2 + deltaX, box.y + box.height / 2);
        await this.page.mouse.up();
      }
    }
  }
}
