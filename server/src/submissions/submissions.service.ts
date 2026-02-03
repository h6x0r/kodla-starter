import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { Prisma, TaskType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CodeExecutionService } from "../queue/code-execution.service";
import { CacheService } from "../cache/cache.service";
import { ExecutionResult, LANGUAGES } from "../judge0/judge0.service";
import { AccessControlService } from "../subscriptions/access-control.service";
import { GamificationService } from "../gamification/gamification.service";
import { SecurityValidationService } from "../security/security-validation.service";
import { TestParserService, TestCaseResult } from "./test-parser.service";
import { ResultFormatterService } from "./result-formatter.service";
import {
  AiService,
  PromptEvaluationResult,
  PromptTestResult,
} from "../ai/ai.service";

// Re-export TestCaseResult for backward compatibility
export { TestCaseResult };

export interface SubmissionDto {
  code: string;
  taskId?: string;
  language?: string;
  stdin?: string;
}

export interface SubmissionResult {
  id: string;
  status: string;
  score: number;
  runtime: string;
  memory: string;
  message: string;
  stdout: string;
  stderr: string;
  compileOutput: string;
  createdAt: string;
  // Test case details
  testsPassed?: number;
  testsTotal?: number;
  testCases?: TestCaseResult[];
  // Gamification rewards
  xpEarned?: number;
  totalXp?: number;
  level?: number;
  leveledUp?: boolean;
  newBadges?: Array<{ slug: string; name: string; icon: string }>;
}

/**
 * Result for prompt engineering submissions
 */
export interface PromptSubmissionResult {
  id: string;
  status: string;
  score: number;
  message: string;
  createdAt: string;
  // Prompt-specific results
  scenarioResults: PromptTestResult[];
  summary: string;
  // Gamification rewards
  xpEarned?: number;
  totalXp?: number;
  level?: number;
  leveledUp?: boolean;
  newBadges?: Array<{ slug: string; name: string; icon: string }>;
}

/**
 * SubmissionsService
 *
 * Orchestrates code submission and execution flow.
 * Refactored to delegate to specialized services:
 * - SecurityValidationService: Code security scanning
 * - TestParserService: Test output parsing
 * - ResultFormatterService: Output formatting
 */
@Injectable()
export class SubmissionsService {
  private readonly logger = new Logger(SubmissionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly codeExecutionService: CodeExecutionService,
    private readonly cacheService: CacheService,
    private readonly accessControlService: AccessControlService,
    private readonly gamificationService: GamificationService,
    private readonly securityValidation: SecurityValidationService,
    private readonly testParser: TestParserService,
    private readonly resultFormatter: ResultFormatterService,
    private readonly aiService: AiService,
  ) {}

  /**
   * Create a new code submission and execute it
   * Requires user to have passed 5 tests via Run first (run validation)
   */
  async create(
    userId: string,
    taskIdentifier: string,
    code: string,
    language: string,
    ip?: string,
  ): Promise<SubmissionResult> {
    // 1. Security: Validate code for malicious patterns
    await this.securityValidation.validateCode(code, language, { ip, userId });

    // 2. Resolve Task with topic/module/course info for priority
    const task = await this.findTaskByIdentifier(taskIdentifier);

    // 3. Check task access - premium tasks require subscription
    const taskAccess = await this.accessControlService.getTaskAccess(
      userId,
      task.id,
    );
    if (!taskAccess.canSubmit) {
      throw new ForbiddenException(
        "This task requires an active subscription. Upgrade to access premium content.",
      );
    }

    // 4. Check run validation - user must pass 5 tests via Run first
    const runValidation = await this.cacheService.getRunValidation(
      userId,
      task.id,
    );
    if (!runValidation) {
      throw new ForbiddenException(
        "Please run your code first and pass at least 5 tests before submitting.",
      );
    }

    // 5. Validate language
    this.validateLanguage(language);

    // 6. Get queue priority based on user's subscription
    const courseId = task.topic?.module?.courseId;
    const queuePriority = courseId
      ? await this.accessControlService.getQueuePriority(userId, courseId)
      : 10;

    this.logger.log(
      `Submission: user=${userId}, task=${task.slug}, lang=${language}, hasTests=${!!task.testCode}, priority=${queuePriority}, runValidated=${runValidation.testsPassed}`,
    );

    // 7. Execute code
    const result = await this.executeCode(code, language, task.testCode);

    // 8. Parse test output
    const testOutput = this.testParser.parseTestOutput(
      result.stdout,
      result.stderr,
    );

    // 9. Determine final status and score
    const finalStatus = this.testParser.determineStatus(
      result.status,
      testOutput.passed,
      testOutput.total,
    );
    const score = this.testParser.calculateScore(
      testOutput.passed,
      testOutput.total,
      finalStatus,
    );

    // 10. Format output metrics
    const { runtime, memory } = this.resultFormatter.formatMetrics(result);
    const message = this.resultFormatter.formatMessage(result);

    // 11. Save submission to database
    const submission = await this.prisma.submission.create({
      data: {
        userId,
        taskId: task.id,
        code,
        status: finalStatus,
        score,
        runtime,
        memory,
        message,
        testsPassed: testOutput.total > 0 ? testOutput.passed : null,
        testsTotal: testOutput.total > 0 ? testOutput.total : null,
        testCases:
          testOutput.testCases.length > 0
            ? JSON.parse(JSON.stringify(testOutput.testCases))
            : undefined,
      },
    });

    // 12. Award XP for first completion (only if all tests passed)
    const gamificationResult = await this.awardXpIfFirstCompletion(
      userId,
      task.id,
      task.slug,
      task.difficulty,
      finalStatus,
    );

    // 13. Clear run validation after successful submission
    if (finalStatus === "passed") {
      await this.cacheService.clearRunValidation(userId, task.id);
    }

    return {
      id: submission.id,
      status: finalStatus,
      score,
      runtime,
      memory,
      message,
      stdout: result.stdout,
      stderr: result.stderr,
      compileOutput: result.compileOutput,
      testsPassed: testOutput.total > 0 ? testOutput.passed : undefined,
      testsTotal: testOutput.total > 0 ? testOutput.total : undefined,
      testCases:
        testOutput.testCases.length > 0 ? testOutput.testCases : undefined,
      createdAt: submission.createdAt.toISOString(),
      xpEarned: gamificationResult?.xpEarned,
      totalXp: gamificationResult?.totalXp,
      level: gamificationResult?.level,
      leveledUp: gamificationResult?.leveledUp,
      newBadges: gamificationResult?.newBadges,
    };
  }

  /**
   * Execute code without saving (for "Run" button)
   * Uses caching to avoid re-executing identical code
   */
  async runCode(
    code: string,
    language: string,
    stdin?: string,
    ip?: string,
    userId?: string,
  ): Promise<ExecutionResult> {
    // Validate language
    this.validateLanguage(language);

    // Security: Validate code for malicious patterns
    await this.securityValidation.validateCode(code, language, { ip, userId });

    // Check cache first
    const cached = await this.cacheService.getExecutionResult<ExecutionResult>(
      code,
      language,
      stdin,
      userId,
    );
    if (cached) {
      this.logger.log(`Cache hit: lang=${language}, user=${userId}`);
      return cached;
    }

    this.logger.log(
      `Run code: lang=${language}, stdin=${stdin ? "yes" : "no"}, user=${userId}`,
    );

    // Execute code
    const result = await this.codeExecutionService.executeSync(
      code,
      language,
      stdin,
    );

    // Cache the result
    await this.cacheService.setExecutionResult(
      code,
      language,
      stdin,
      result,
      userId,
    );

    return result;
  }

  /**
   * Run quick tests (5 tests) without saving to database
   * Used for "Run Code" button - fast feedback
   * If user passes all 5 tests, marks task as validated for submission
   */
  async runQuickTests(
    taskIdentifier: string,
    code: string,
    language: string,
    ip?: string,
    userId?: string,
  ): Promise<{
    status: string;
    testsPassed: number;
    testsTotal: number;
    testCases: TestCaseResult[];
    runtime: string;
    message: string;
    runValidated?: boolean;
  }> {
    // Security: Validate code
    await this.securityValidation.validateCode(code, language, { ip, userId });

    // Resolve Task
    const task = await this.findTaskByIdentifier(taskIdentifier, false);

    // Check task access - premium tasks require subscription
    // userId is now always defined since authentication is required
    if (userId) {
      const taskAccess = await this.accessControlService.getTaskAccess(
        userId,
        task.id,
      );
      if (!taskAccess.canRun) {
        throw new ForbiddenException(
          "This task requires an active subscription. Upgrade to access premium content.",
        );
      }
    }

    // Validate language
    this.validateLanguage(language);

    this.logger.log(`Quick test: task=${task.slug}, lang=${language}`);

    // Execute code with tests (quick mode - only first 5 tests)
    const result = await this.executeCode(code, language, task.testCode, 5);

    // Parse test output
    const testOutput = this.testParser.parseTestOutput(
      result.stdout,
      result.stderr,
    );

    // Determine status
    const status = this.testParser.determineStatus(
      result.status,
      testOutput.passed,
      testOutput.total,
    );

    // If user passed all 5 tests, mark as validated for submission
    let runValidated = false;
    if (userId && testOutput.passed >= 5) {
      await this.cacheService.setRunValidated(
        userId,
        task.id,
        testOutput.passed,
      );
      runValidated = true;
      this.logger.log(
        `Run validated: user=${userId}, task=${task.slug}, tests=${testOutput.passed}/5`,
      );
    }

    const runResult = {
      status,
      testsPassed: testOutput.passed,
      testsTotal: testOutput.total,
      testCases: testOutput.testCases,
      runtime: this.resultFormatter.formatRuntime(result.time),
      message: this.resultFormatter.formatMessage(result),
      runValidated,
    };

    // Save run result to database (upsert - only keep latest per user+task)
    if (userId) {
      try {
        await this.prisma.runResult.upsert({
          where: {
            userId_taskId: {
              userId,
              taskId: task.id,
            },
          },
          update: {
            status: runResult.status,
            testsPassed: runResult.testsPassed,
            testsTotal: runResult.testsTotal,
            runtime: runResult.runtime,
            message: runResult.message || "",
            testCases: runResult.testCases as any,
            code,
          },
          create: {
            userId,
            taskId: task.id,
            status: runResult.status,
            testsPassed: runResult.testsPassed,
            testsTotal: runResult.testsTotal,
            runtime: runResult.runtime,
            message: runResult.message || "",
            testCases: runResult.testCases as any,
            code,
          },
        });
        this.logger.log(`RunResult saved: user=${userId}, task=${task.slug}`);
      } catch (error) {
        // Don't fail the request if saving run result fails
        this.logger.warn(`Failed to save RunResult: ${error.message}`);
      }
    }

    return runResult;
  }

  /**
   * Submit a prompt engineering task
   * Uses AI-as-Judge for evaluation
   */
  async submitPrompt(
    userId: string,
    taskIdentifier: string,
    prompt: string,
  ): Promise<PromptSubmissionResult> {
    // 1. Get task and validate it's a PROMPT type
    const task = await this.prisma.task.findFirst({
      where: {
        OR: [{ id: taskIdentifier }, { slug: taskIdentifier }],
      },
      include: {
        topic: {
          include: {
            module: { select: { courseId: true } },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task not found: ${taskIdentifier}`);
    }

    if (task.taskType !== TaskType.PROMPT) {
      throw new BadRequestException(
        `Task ${task.slug} is not a prompt engineering task`,
      );
    }

    if (!task.promptConfig) {
      throw new BadRequestException(
        `Task ${task.slug} has no prompt configuration`,
      );
    }

    // 2. Check task access - premium tasks require subscription
    const taskAccess = await this.accessControlService.getTaskAccess(
      userId,
      task.id,
    );
    if (!taskAccess.canSubmit) {
      throw new ForbiddenException(
        "This task requires an active subscription. Upgrade to access premium content.",
      );
    }

    this.logger.log(`Prompt submission: user=${userId}, task=${task.slug}`);

    // 3. Parse promptConfig (it's stored as JSON)
    const promptConfig = task.promptConfig as {
      testScenarios: Array<{
        input: string;
        expectedCriteria: string[];
        rubric?: string;
      }>;
      judgePrompt: string;
      passingScore: number;
    };

    // 4. Evaluate prompt using AI
    const evaluation = await this.aiService.evaluatePrompt(
      userId,
      prompt,
      promptConfig,
    );

    // 5. Determine status
    const status = evaluation.passed ? "passed" : "failed";
    const score = Math.round(evaluation.score * 10); // Convert to 0-100

    // 6. Save submission to database
    const submission = await this.prisma.submission.create({
      data: {
        userId,
        taskId: task.id,
        code: prompt, // Store prompt in code field
        status,
        score,
        runtime: "0ms", // No runtime for prompt tasks
        memory: null,
        message: evaluation.summary,
        testsPassed: evaluation.scenarioResults.filter((r) => r.passed).length,
        testsTotal: evaluation.scenarioResults.length,
        testCases: evaluation.scenarioResults.map((r) => ({
          name: `Scenario ${r.scenarioIndex + 1}`,
          passed: r.passed,
          expected: r.input.substring(0, 100),
          actual: r.feedback,
        })),
      },
    });

    // 7. Award XP for first completion
    const gamificationResult = await this.awardXpIfFirstCompletion(
      userId,
      task.id,
      task.slug,
      task.difficulty,
      status,
    );

    return {
      id: submission.id,
      status,
      score,
      message: evaluation.summary,
      createdAt: submission.createdAt.toISOString(),
      scenarioResults: evaluation.scenarioResults,
      summary: evaluation.summary,
      xpEarned: gamificationResult?.xpEarned,
      totalXp: gamificationResult?.totalXp,
      level: gamificationResult?.level,
      leveledUp: gamificationResult?.leveledUp,
      newBadges: gamificationResult?.newBadges,
    };
  }

  /**
   * Get submission by ID
   */
  async findOne(id: string): Promise<any> {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: { task: true },
    });

    if (!submission) {
      throw new NotFoundException(`Submission not found: ${id}`);
    }

    return submission;
  }

  /**
   * Get user's submissions for a task
   */
  async findByUserAndTask(userId: string, taskId: string): Promise<any[]> {
    return this.prisma.submission.findMany({
      where: { userId, taskId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        status: true,
        score: true,
        runtime: true,
        memory: true,
        message: true,
        testsPassed: true,
        testsTotal: true,
        testCases: true,
        createdAt: true,
        code: true,
      },
    });
  }

  /**
   * Get the latest run result for a user+task pair
   * Accepts task slug or UUID as taskIdentifier
   * Returns null if no run result exists
   */
  async getRunResult(
    userId: string,
    taskIdentifier: string,
  ): Promise<{
    status: string;
    testsPassed: number;
    testsTotal: number;
    testCases: any;
    runtime: string;
    message: string;
    code: string;
    updatedAt: Date;
  } | null> {
    // Resolve task by slug or UUID
    const task = await this.prisma.task.findFirst({
      where: {
        OR: [{ id: taskIdentifier }, { slug: taskIdentifier }],
      },
      select: { id: true },
    });

    if (!task) {
      return null;
    }

    const runResult = await this.prisma.runResult.findUnique({
      where: {
        userId_taskId: {
          userId,
          taskId: task.id,
        },
      },
      select: {
        status: true,
        testsPassed: true,
        testsTotal: true,
        testCases: true,
        runtime: true,
        message: true,
        code: true,
        updatedAt: true,
      },
    });

    return runResult;
  }

  /**
   * Get user's recent submissions
   */
  async findRecentByUser(userId: string, limit = 10): Promise<any[]> {
    return this.prisma.submission.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { task: { select: { slug: true, title: true } } },
    });
  }

  /**
   * Get execution engine health and queue status
   */
  async getJudgeStatus(): Promise<{
    available: boolean;
    queueReady: boolean;
    queue: {
      waiting: number;
      active: number;
      completed: number;
      failed: number;
    };
    cache: { connected: boolean; keys?: number };
    languages: string[];
  }> {
    const health = await this.codeExecutionService.checkHealth();
    const queueStats = await this.codeExecutionService.getQueueStats();
    const cacheStats = await this.cacheService.getStats();
    const languages = Object.keys(LANGUAGES);

    return {
      available: health.available,
      queueReady: health.queueReady,
      queue: {
        waiting: queueStats.waiting,
        active: queueStats.active,
        completed: queueStats.completed,
        failed: queueStats.failed,
      },
      cache: cacheStats,
      languages,
    };
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  /**
   * Find task by ID or slug
   */
  private async findTaskByIdentifier(
    identifier: string,
    includeRelations = true,
  ): Promise<any> {
    const task = await this.prisma.task.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: includeRelations
        ? {
            topic: {
              include: {
                module: { select: { courseId: true } },
              },
            },
          }
        : undefined,
    });

    if (!task) {
      throw new NotFoundException(`Task not found: ${identifier}`);
    }

    return task;
  }

  /**
   * Validate language is supported
   */
  private validateLanguage(language: string): void {
    const langKey = language.toLowerCase();
    if (!LANGUAGES[langKey]) {
      throw new BadRequestException(
        `Unsupported language: ${language}. Supported: ${Object.keys(LANGUAGES).join(", ")}`,
      );
    }
  }

  /**
   * Execute code with or without tests
   */
  private async executeCode(
    code: string,
    language: string,
    testCode?: string | null,
    maxTests?: number,
  ): Promise<ExecutionResult> {
    if (testCode) {
      return this.codeExecutionService.executeSyncWithTests(
        code,
        testCode,
        language,
        maxTests,
      );
    }
    return this.codeExecutionService.executeSync(code, language);
  }

  /**
   * Award XP for first task completion
   * Uses TaskCompletion table with unique constraint for race-safe operation
   */
  private async awardXpIfFirstCompletion(
    userId: string,
    taskId: string,
    taskSlug: string,
    difficulty: string,
    status: string,
  ): Promise<{
    xpEarned: number;
    totalXp: number;
    level: number;
    leveledUp: boolean;
    newBadges: Array<{ slug: string; name: string; icon: string }>;
  } | null> {
    if (status !== "passed") {
      return null;
    }

    const xpEarned = this.resultFormatter.getXpForDifficulty(difficulty);

    try {
      // Try to create TaskCompletion record - will fail if already exists (race-safe)
      await this.prisma.taskCompletion.create({
        data: {
          userId,
          taskId,
          xpAwarded: xpEarned,
        },
      });

      // First completion - award XP
      const result = await this.gamificationService.awardTaskXp(
        userId,
        difficulty,
      );
      this.logger.log(
        `XP awarded: user=${userId}, task=${taskSlug}, xp=${result.xpEarned}, level=${result.level}, leveledUp=${result.leveledUp}`,
      );
      return result;
    } catch (error: unknown) {
      // Unique constraint violation = already completed, skip XP award
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        this.logger.debug(
          `Task already completed: user=${userId}, task=${taskSlug}`,
        );
        return null;
      }
      throw error;
    }
  }
}
