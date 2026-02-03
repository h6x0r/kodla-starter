import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue, QueueEvents } from "bullmq";
import { ConfigService } from "@nestjs/config";
import { CODE_EXECUTION_QUEUE } from "./constants";
import {
  CodeExecutionJob,
  CodeExecutionResult,
} from "./code-execution.processor";
import {
  Judge0Service,
  ExecutionResult,
  LanguageConfig,
} from "../judge0/judge0.service";

@Injectable()
export class CodeExecutionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CodeExecutionService.name);
  private queueEvents: QueueEvents;

  constructor(
    @InjectQueue(CODE_EXECUTION_QUEUE)
    private readonly executionQueue: Queue<
      CodeExecutionJob,
      CodeExecutionResult
    >,
    private readonly judge0Service: Judge0Service,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    // Create QueueEvents for job completion tracking
    const queueEvents = new QueueEvents(CODE_EXECUTION_QUEUE, {
      connection: {
        host: this.configService.get("REDIS_HOST") || "redis",
        port: parseInt(this.configService.get("REDIS_PORT") || "6379", 10),
      },
    });

    try {
      await queueEvents.waitUntilReady();
      this.queueEvents = queueEvents;
      this.logger.log("QueueEvents connected");
    } catch (error) {
      // Clean up the connection if initialization fails
      await queueEvents.close().catch(() => {});
      this.logger.error("Failed to initialize QueueEvents", error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.queueEvents) {
      try {
        await this.queueEvents.close();
        this.logger.log("QueueEvents closed");
      } catch (error) {
        this.logger.error("Error closing QueueEvents", error);
      }
    }
  }

  /**
   * Execute code synchronously (for playground - waits for result)
   */
  async executeSync(
    code: string,
    language: string,
    stdin?: string,
  ): Promise<ExecutionResult> {
    this.logger.debug(`Sync execution: ${language}`);
    return this.judge0Service.execute(code, language, stdin);
  }

  /**
   * Execute code with tests synchronously (for submissions)
   * @param maxTests - Optional limit on number of tests to run (for quick mode)
   */
  async executeSyncWithTests(
    solutionCode: string,
    testCode: string,
    language: string,
    maxTests?: number,
  ): Promise<ExecutionResult> {
    this.logger.debug(
      `Sync execution with tests: ${language}, maxTests=${maxTests || "all"}`,
    );
    return this.judge0Service.executeWithTests(
      solutionCode,
      testCode,
      language,
      maxTests,
    );
  }

  /**
   * Execute code via queue (for submissions - returns job ID)
   */
  async executeAsync(
    code: string,
    language: string,
    options?: {
      stdin?: string;
      expectedOutput?: string;
      taskId?: string;
      userId?: string;
      priority?: number;
    },
  ): Promise<{ jobId: string }> {
    const job = await this.executionQueue.add(
      "execute",
      {
        code,
        language,
        stdin: options?.stdin,
        expectedOutput: options?.expectedOutput,
        taskId: options?.taskId,
        userId: options?.userId,
      },
      {
        priority: options?.priority || 0,
      },
    );

    this.logger.debug(`Job ${job.id} added to queue`);
    return { jobId: job.id! };
  }

  /**
   * Execute and wait for result (combines add + wait)
   */
  async executeAndWait(
    code: string,
    language: string,
    options?: {
      stdin?: string;
      expectedOutput?: string;
      taskId?: string;
      userId?: string;
      timeout?: number;
    },
  ): Promise<CodeExecutionResult> {
    const job = await this.executionQueue.add("execute", {
      code,
      language,
      stdin: options?.stdin,
      expectedOutput: options?.expectedOutput,
      taskId: options?.taskId,
      userId: options?.userId,
    });

    this.logger.debug(`Waiting for job ${job.id} to complete`);

    // Wait for job completion
    const result = await job.waitUntilFinished(
      this.queueEvents,
      options?.timeout || 30000,
    );

    return result;
  }

  /**
   * Get job status by ID
   */
  async getJobStatus(jobId: string): Promise<{
    status: string;
    result?: CodeExecutionResult;
    progress?: number;
    failedReason?: string;
  }> {
    const job = await this.executionQueue.getJob(jobId);

    if (!job) {
      return { status: "not_found" };
    }

    const state = await job.getState();
    const result = job.returnvalue;
    const failedReason = job.failedReason;

    return {
      status: state,
      result: result || undefined,
      failedReason,
    };
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.executionQueue.getWaitingCount(),
      this.executionQueue.getActiveCount(),
      this.executionQueue.getCompletedCount(),
      this.executionQueue.getFailedCount(),
      this.executionQueue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  }

  /**
   * Check if execution engine is available
   */
  async checkHealth(): Promise<{ available: boolean; queueReady: boolean }> {
    const judge0Available = await this.judge0Service.checkHealth();

    // Check if queue is connected
    let queueReady = false;
    try {
      await this.executionQueue.getWaitingCount();
      queueReady = true;
    } catch {
      queueReady = false;
    }

    return {
      available: judge0Available,
      queueReady,
    };
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): LanguageConfig[] {
    return this.judge0Service.getSupportedLanguages();
  }
}
