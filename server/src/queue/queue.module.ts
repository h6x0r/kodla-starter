import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CodeExecutionProcessor } from "./code-execution.processor";
import { CodeExecutionService } from "./code-execution.service";
import { DeadLetterService } from "./dead-letter.service";
import { ShutdownService } from "./shutdown.service";
import { Judge0Module } from "../judge0/judge0.module";
import { CODE_EXECUTION_QUEUE, DEAD_LETTER_QUEUE } from "./constants";

@Module({
  imports: [
    ConfigModule,
    Judge0Module,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get("REDIS_HOST") || "redis",
          port: parseInt(configService.get("REDIS_PORT") || "6379", 10),
          password: configService.get("REDIS_PASSWORD") || undefined,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      {
        name: CODE_EXECUTION_QUEUE,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 5000, // 5s → 10s → 20s (covers ~15s Judge0 restart)
          },
          removeOnComplete: {
            count: 100, // Keep last 100 completed jobs
            age: 3600, // Remove jobs older than 1 hour
          },
          removeOnFail: false, // Keep failed jobs for DLQ processing
        },
        // Rate limiting is handled by PlaygroundThrottlerGuard at controller level
        // BullMQ processor concurrency is set to 4 in code-execution.processor.ts
      },
      {
        name: DEAD_LETTER_QUEUE,
        defaultJobOptions: {
          removeOnComplete: {
            count: 500, // Keep more DLQ jobs for analysis
            age: 604800, // 7 days
          },
          removeOnFail: {
            count: 100,
            age: 604800, // 7 days
          },
        },
      },
    ),
  ],
  providers: [
    CodeExecutionProcessor,
    CodeExecutionService,
    DeadLetterService,
    ShutdownService,
  ],
  exports: [CodeExecutionService, DeadLetterService, ShutdownService],
})
export class QueueModule {}
