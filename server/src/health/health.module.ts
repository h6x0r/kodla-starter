import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "./health.controller";
import { PrismaHealthIndicator } from "./prisma.health";
import { RedisHealthIndicator } from "./redis.health";
import { Judge0HealthIndicator } from "./judge0.health";
import { PrismaModule } from "../prisma/prisma.module";
import { CacheModule } from "../cache/cache.module";
import { Judge0Module } from "../judge0/judge0.module";
import { MetricsService } from "./metrics.service";

@Module({
  imports: [TerminusModule, PrismaModule, CacheModule, Judge0Module],
  controllers: [HealthController],
  providers: [
    PrismaHealthIndicator,
    RedisHealthIndicator,
    Judge0HealthIndicator,
    MetricsService,
  ],
  exports: [MetricsService],
})
export class HealthModule {}
