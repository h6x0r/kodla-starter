import { Processor, WorkerHost, OnWorkerEvent } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Job, Queue } from "bullmq";
import { Judge0Service, ExecutionResult } from "../judge0/judge0.service";
import { CODE_EXECUTION_QUEUE, DEAD_LETTER_QUEUE } from "./constants";

/**
 * Job payload for code execution
 */
export interface CodeExecutionJob {
  code: string;
  language: string;
  stdin?: string;
  expectedOutput?: string;
  taskId?: string;
  userId?: string;
}

/**
 * Job result after execution
 */
export interface CodeExecutionResult extends ExecutionResult {
  jobId: string;
  taskId?: string;
  userId?: string;
}

/**
 * Dead Letter Job structure
 */
interface DeadLetterJob {
  originalJobId: string;
  originalQueue: string;
  originalData: CodeExecutionJob;
  failedReason: string;
  failedAt: string;
  attemptsMade: number;
  stacktrace?: string[];
}

@Processor(CODE_EXECUTION_QUEUE, {
  concurrency: 4, // Process 4 jobs in parallel
})
export class CodeExecutionProcessor extends WorkerHost {
  private readonly logger = new Logger(CodeExecutionProcessor.name);

  constructor(
    private readonly judge0Service: Judge0Service,
    @InjectQueue(DEAD_LETTER_QUEUE)
    private readonly deadLetterQueue: Queue<DeadLetterJob>,
  ) {
    super();
    this.logger.log("Code execution processor initialized");
  }

  /**
   * Process code execution job with idempotency check
   */
  async process(job: Job<CodeExecutionJob>): Promise<CodeExecutionResult> {
    const { code, language, stdin, taskId, userId, expectedOutput } = job.data;

    this.logger.debug(
      `Processing job ${job.id}: ${language} code (task: ${taskId || "playground"})`,
    );

    // Idempotency: Check if this job was already processed
    // This prevents duplicate execution on retry after partial success
    const idempotencyKey = `job:processed:${job.id}`;
    const alreadyProcessed = await job.getState();
    if (alreadyProcessed === "completed") {
      this.logger.warn(
        `Job ${job.id} already completed, skipping duplicate execution`,
      );
      // Return cached result if available (BullMQ stores it)
      const returnValue = job.returnvalue as CodeExecutionResult;
      if (returnValue) {
        return returnValue;
      }
    }

    // Execute code via Judge0
    const result = await this.judge0Service.execute(code, language, stdin);

    // Check expected output if provided
    if (expectedOutput && result.status === "passed") {
      const normalizedOutput = result.stdout.trim();
      const normalizedExpected = expectedOutput.trim();

      if (normalizedOutput !== normalizedExpected) {
        result.status = "failed";
        result.statusId = 4;
        result.description = "Wrong Answer";
        result.message = "Output does not match expected result";
      }
    }

    return {
      ...result,
      jobId: job.id!,
      taskId,
      userId,
    };
  }

  @OnWorkerEvent("completed")
  onCompleted(job: Job<CodeExecutionJob>) {
    this.logger.debug(`Job ${job.id} completed`);
  }

  @OnWorkerEvent("failed")
  async onFailed(job: Job<CodeExecutionJob>, error: Error) {
    const maxAttempts = job.opts.attempts || 3;
    const isLastAttempt = job.attemptsMade >= maxAttempts;

    if (isLastAttempt) {
      // Move to Dead Letter Queue after all retries exhausted
      this.logger.warn(
        `Job ${job.id} permanently failed after ${job.attemptsMade} attempts, moving to DLQ`,
      );

      try {
        const deadLetterJob: DeadLetterJob = {
          originalJobId: job.id || "unknown",
          originalQueue: CODE_EXECUTION_QUEUE,
          originalData: job.data,
          failedReason: error.message || job.failedReason || "Unknown error",
          failedAt: new Date().toISOString(),
          attemptsMade: job.attemptsMade,
          stacktrace: job.stacktrace,
        };

        await this.deadLetterQueue.add("failed-job", deadLetterJob, {
          jobId: `dlq-${job.id}`,
        });

        this.logger.warn(`Job ${job.id} moved to DLQ successfully`);
      } catch (dlqError) {
        this.logger.error(`Failed to move job ${job.id} to DLQ`, dlqError);
      }
    } else {
      this.logger.error(
        `Job ${job.id} failed (attempt ${job.attemptsMade}/${maxAttempts}): ${error.message}`,
      );
    }
  }

  @OnWorkerEvent("active")
  onActive(job: Job<CodeExecutionJob>) {
    this.logger.debug(`Job ${job.id} started processing`);
  }

  @OnWorkerEvent("stalled")
  onStalled(jobId: string) {
    this.logger.warn(`Job ${jobId} stalled`);
  }
}
