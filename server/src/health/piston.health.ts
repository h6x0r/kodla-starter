import { Injectable } from "@nestjs/common";
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from "@nestjs/terminus";
import { Judge0Service } from "../piston/judge0.service";

/**
 * Health indicator for Judge0 code execution service
 * Checks availability
 */
@Injectable()
export class PistonHealthIndicator extends HealthIndicator {
  constructor(private readonly judge0Service: Judge0Service) {
    super();
  }

  /**
   * Check if Judge0 is healthy and available
   */
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const isHealthy = await this.judge0Service.checkHealth();

    const details = {
      available: isHealthy,
      engine: "judge0",
      message: isHealthy ? "Judge0 is available" : "Judge0 is unavailable",
    };

    if (isHealthy) {
      return this.getStatus(key, true, details);
    }

    throw new HealthCheckError(
      "Judge0 health check failed",
      this.getStatus(key, false, details),
    );
  }
}
