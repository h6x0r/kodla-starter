import { Controller, Get, Header, Res } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import {
  HealthCheck,
  HealthCheckService,
  DiskHealthIndicator,
  MemoryHealthIndicator,
} from "@nestjs/terminus";
import { Response } from "express";
import { PrismaHealthIndicator } from "./prisma.health";
import { RedisHealthIndicator } from "./redis.health";
import { Judge0HealthIndicator } from "./judge0.health";
import { MetricsService } from "./metrics.service";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private redisHealth: RedisHealthIndicator,
    private judge0Health: Judge0HealthIndicator,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
    private metricsService: MetricsService,
  ) {}

  /**
   * Liveness probe - is the service alive?
   */
  @Get("live")
  @ApiOperation({ summary: "Liveness probe" })
  @ApiResponse({ status: 200, description: "Service is alive" })
  live() {
    return { status: "ok", timestamp: new Date().toISOString() };
  }

  /**
   * Readiness probe - is the service ready to accept traffic?
   */
  @Get("ready")
  @HealthCheck()
  @ApiOperation({ summary: "Readiness probe - checks all dependencies" })
  @ApiResponse({ status: 200, description: "Service is ready" })
  @ApiResponse({ status: 503, description: "Service is not ready" })
  ready() {
    return this.health.check([
      () => this.prismaHealth.isHealthy("database"),
      () => this.redisHealth.isHealthy("redis"),
    ]);
  }

  /**
   * Full health check - detailed status of all components
   */
  @Get()
  @HealthCheck()
  @ApiOperation({ summary: "Full health check with all components" })
  @ApiResponse({ status: 200, description: "All health checks passed" })
  @ApiResponse({ status: 503, description: "One or more health checks failed" })
  check() {
    return this.health.check([
      () => this.prismaHealth.isHealthy("database"),
      () => this.redisHealth.isHealthy("redis"),
      () =>
        this.disk.checkStorage("storage", { path: "/", thresholdPercent: 0.9 }),
      () => this.memory.checkHeap("memory_heap", 300 * 1024 * 1024),
      () => this.memory.checkRSS("memory_rss", 500 * 1024 * 1024),
    ]);
  }

  /**
   * Code execution service status (Judge0)
   */
  @Get("judge0")
  @ApiOperation({ summary: "Judge0 code execution service status" })
  @ApiResponse({ status: 200, description: "Judge0 status" })
  async judge0Status() {
    const healthResult = await this.judge0Health.isHealthy("judge0");
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      engine: "judge0",
      health: healthResult,
    };
  }

  /**
   * Prometheus metrics endpoint
   */
  @Get("metrics")
  @Header("Content-Type", "text/plain")
  @ApiOperation({ summary: "Prometheus metrics" })
  @ApiResponse({ status: 200, description: "Metrics in Prometheus format" })
  async metrics(@Res() res: Response) {
    const metrics = await this.metricsService.getMetrics();
    res.set("Content-Type", "text/plain");
    res.send(metrics);
  }
}
