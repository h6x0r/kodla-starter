import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { AiModule } from './ai/ai.module';
import { CoursesModule } from './courses/courses.module';
import { UserCoursesModule } from './user-courses/user-courses.module';
import { RoadmapsModule } from './roadmaps/roadmaps.module';
import { BugReportsModule } from './bugreports/bugreports.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { PaymentsModule } from './payments/payments.module';
import { GamificationModule } from './gamification/gamification.module';
import { SessionsModule } from './sessions/sessions.module';
import { AdminModule } from './admin/admin.module';
import { SentryModule } from './common/sentry/sentry.module';
import { LoggerModule } from './common/logger/logger.module';
import { SecurityModule } from './security/security.module';
import { SecurityMiddleware } from './security/middleware/security.middleware';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(), // Enable scheduled tasks (session cleanup, etc.)
    LoggerModule,
    SentryModule,
    SecurityModule, // Security features (IP ban, code scanner, activity logger)
    // Rate limiting configuration
    // TODO: RE-ENABLE AFTER E2E TESTING - restore original limits:
    // short: ttl=1000, limit=3 | medium: ttl=10000, limit=20 | long: ttl=60000, limit=60
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10000,  // DISABLED FOR E2E TESTING
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 10000,  // DISABLED FOR E2E TESTING
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 10000,  // DISABLED FOR E2E TESTING
      },
    ]),
    PrismaModule,
    CacheModule,
    AuthModule,
    UsersModule,
    TasksModule,
    SubmissionsModule,
    AiModule,
    CoursesModule,
    UserCoursesModule,
    RoadmapsModule,
    BugReportsModule,
    SubscriptionsModule,
    PaymentsModule,
    GamificationModule,
    SessionsModule,
    AdminModule,
    HealthModule, // Health checks and Prometheus metrics
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply security middleware to all routes
    consumer.apply(SecurityMiddleware).forRoutes('*');
  }
}
