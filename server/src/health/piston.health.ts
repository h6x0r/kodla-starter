import { Injectable } from "@nestjs/common";
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from "@nestjs/terminus";
import { PistonService, PistonLimits } from "../piston/piston.service";

/**
 * Health indicator for Piston code execution service
 * Checks availability and reports current limits
 */
@Injectable()
export class PistonHealthIndicator extends HealthIndicator {
  constructor(private readonly pistonService: PistonService) {
    super();
  }

  /**
   * Check if Piston is healthy and available
   */
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const isHealthy = await this.pistonService.checkHealth();
    const limits = this.pistonService.getPistonLimits();

    const details = {
      available: isHealthy,
      limits: {
        compileTimeout: `${limits.compileTimeout}ms`,
        runTimeout: `${limits.runTimeout}ms`,
        memoryLimit: `${Math.round(limits.memoryLimit / 1024 / 1024)}MB`,
        detected: limits.detected,
      },
      message: isHealthy ? "Piston is available" : "Piston is unavailable",
    };

    if (isHealthy) {
      return this.getStatus(key, true, details);
    }

    throw new HealthCheckError(
      "Piston health check failed",
      this.getStatus(key, false, details),
    );
  }

  /**
   * Get Piston limits (for dedicated endpoint)
   */
  getLimits(): PistonLimits {
    return this.pistonService.getPistonLimits();
  }
}
