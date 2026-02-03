import { Injectable } from "@nestjs/common";
import { ExecutionResult } from "../judge0/judge0.service";

/**
 * Formatted execution metrics
 */
export interface FormattedMetrics {
  runtime: string;
  memory: string;
}

/**
 * ResultFormatterService
 *
 * Formats execution results for display.
 * Extracted from SubmissionsService to follow Single Responsibility Principle.
 *
 * Responsibilities:
 * - Format runtime in milliseconds
 * - Format memory in MB
 * - Format error messages
 */
@Injectable()
export class ResultFormatterService {
  /**
   * Format runtime from seconds to milliseconds string
   *
   * @param time - Time in seconds (string) or '-'
   * @returns Formatted runtime string (e.g., "125ms" or "-")
   */
  formatRuntime(time: string | number): string {
    if (time === "-" || time === "" || time === null || time === undefined) {
      return "-";
    }

    const timeNum = typeof time === "string" ? parseFloat(time) : time;
    if (isNaN(timeNum)) {
      return "-";
    }

    return `${Math.round(timeNum * 1000)}ms`;
  }

  /**
   * Format memory from bytes to MB string
   * Returns '-' if memory is 0 or unrealistically high (>1GB)
   *
   * @param memoryBytes - Memory usage in bytes
   * @returns Formatted memory string (e.g., "12.5MB" or "-")
   */
  formatMemory(memoryBytes: number | undefined): string {
    if (!memoryBytes || memoryBytes === 0) {
      return "-";
    }

    const memoryMB = memoryBytes / (1024 * 1024);

    // Judge0 sometimes returns unrealistically high values
    if (memoryMB > 1024) {
      return "-";
    }

    return `${memoryMB.toFixed(1)}MB`;
  }

  /**
   * Format both runtime and memory from execution result
   */
  formatMetrics(result: ExecutionResult): FormattedMetrics {
    return {
      runtime: this.formatRuntime(result.time),
      memory: this.formatMemory(result.memory),
    };
  }

  /**
   * Format execution result into readable message
   * Returns concise error information only - the UI handles detailed display
   *
   * @param result - Execution result from Judge0
   * @returns Formatted message string
   */
  formatMessage(result: ExecutionResult): string {
    // For passed submissions, no message needed (UI shows status badge)
    if (result.status === "passed") {
      return "";
    }

    // For compile errors, include compile output
    if (result.status === "compileError") {
      return result.compileOutput || "Compilation failed";
    }

    // For timeout
    if (result.status === "timeout") {
      return "Time limit exceeded";
    }

    // For runtime errors, include stderr
    if (result.status === "error") {
      if (result.stderr) {
        return result.stderr;
      }
      return result.message || "Runtime error";
    }

    // For failed tests, the UI uses testCases for detailed display
    if (result.status === "failed") {
      return result.message || "Tests failed";
    }

    return "";
  }

  /**
   * Get status label for display
   */
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      passed: "PASSED",
      failed: "FAILED",
      timeout: "TIMEOUT",
      compileError: "COMPILE_ERROR",
      error: "ERROR",
    };
    return labels[status] || "UNKNOWN";
  }

  /**
   * Get XP reward for task difficulty
   */
  getXpForDifficulty(difficulty: string): number {
    const XP_REWARDS: Record<string, number> = {
      easy: 10,
      medium: 25,
      hard: 50,
      expert: 100,
    };
    return XP_REWARDS[difficulty] || XP_REWARDS.easy;
  }
}
