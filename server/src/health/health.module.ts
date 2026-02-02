import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "./health.controller";
import { PrismaHealthIndicator } from "./prisma.health";
import { RedisHealthIndicator } from "./redis.health";
import { PistonHealthIndicator } from "./piston.health";
import { PrismaModule } from "../prisma/prisma.module";
import { CacheModule } from "../cache/cache.module";
import { PistonModule } from "../piston/piston.module";
import { MetricsService } from "./metrics.service";

@Module({
  imports: [TerminusModule, PrismaModule, CacheModule, PistonModule],
  controllers: [HealthController],
  providers: [
    PrismaHealthIndicator,
    RedisHealthIndicator,
    PistonHealthIndicator,
    MetricsService,
  ],
  exports: [MetricsService],
})
export class HealthModule {}
