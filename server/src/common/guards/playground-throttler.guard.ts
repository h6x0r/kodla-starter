import {
  Injectable,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../../cache/cache.service';
import { AccessControlService } from '../../subscriptions/access-control.service';
import { Request } from 'express';

/**
 * Rate Limit Response for frontend handling
 */
export interface RateLimitResponse {
  statusCode: 429;
  message: string;
  error: 'TooManyRequests';
  retryAfter: number; // seconds until next allowed request
  isPremium: boolean;
  rateLimitSeconds: number; // the rate limit for this user type
}

/**
 * Custom rate limiter for playground/code execution
 * - Free/Unauthorized users: 10 seconds between runs
 * - Authenticated users: 10 seconds between runs
 * - Premium users (global or course subscription): 5 seconds between runs
 */
@Injectable()
export class PlaygroundThrottlerGuard {
  private readonly RATE_LIMIT_FREE: number;
  private readonly RATE_LIMIT_AUTH: number;
  private readonly RATE_LIMIT_PREMIUM: number;

  constructor(
    private configService: ConfigService,
    private cacheService: CacheService,
    @Inject(AccessControlService)
    private accessControlService: AccessControlService,
  ) {
    // Load rate limits from config (in seconds)
    // TODO: RE-ENABLE AFTER E2E TESTING - restore defaults: FREE=10, AUTH=10, PREMIUM=5
    this.RATE_LIMIT_FREE = this.configService.get<number>('RATE_LIMIT_RUN_FREE', 0);
    this.RATE_LIMIT_AUTH = this.configService.get<number>('RATE_LIMIT_RUN_AUTH', 0);
    this.RATE_LIMIT_PREMIUM = this.configService.get<number>('RATE_LIMIT_RUN_PREMIUM', 0);
  }

  /**
   * Check if request should be throttled
   * @returns null if allowed, RateLimitResponse if throttled
   */
  async checkRateLimit(
    context: ExecutionContext,
  ): Promise<RateLimitResponse | null> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user;
    const clientIp = this.getClientIp(request);

    // Determine rate limit based on user status
    let rateLimitSeconds: number;
    let isPremium = false;
    let cacheKey: string;

    if (user?.userId) {
      // Check if user has premium access (global subscription)
      isPremium = await this.accessControlService.hasGlobalAccess(user.userId);
      rateLimitSeconds = isPremium ? this.RATE_LIMIT_PREMIUM : this.RATE_LIMIT_AUTH;
      cacheKey = `playground_rate:user:${user.userId}`;
    } else {
      // Unauthenticated user - rate limit by IP
      rateLimitSeconds = this.RATE_LIMIT_FREE;
      cacheKey = `playground_rate:ip:${clientIp}`;
    }

    // Check last execution time from cache
    const lastExecutionTime = await this.cacheService.get<number>(cacheKey);
    const now = Date.now();

    if (lastExecutionTime) {
      const elapsedSeconds = (now - lastExecutionTime) / 1000;
      const remainingSeconds = Math.ceil(rateLimitSeconds - elapsedSeconds);

      if (remainingSeconds > 0) {
        return {
          statusCode: 429,
          message: `Rate limit exceeded. Please wait ${remainingSeconds} seconds before running code again.`,
          error: 'TooManyRequests',
          retryAfter: remainingSeconds,
          isPremium,
          rateLimitSeconds,
        };
      }
    }

    // Update last execution time (TTL in seconds)
    await this.cacheService.set(cacheKey, now, rateLimitSeconds);

    return null; // Allowed
  }

  /**
   * Execute rate limit check and throw if throttled
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rateLimitResponse = await this.checkRateLimit(context);

    if (rateLimitResponse) {
      const response = context.switchToHttp().getResponse();
      response.setHeader('Retry-After', rateLimitResponse.retryAfter.toString());
      response.setHeader('X-RateLimit-Limit', rateLimitResponse.rateLimitSeconds.toString());
      response.setHeader('X-RateLimit-Remaining', '0');
      response.setHeader('X-RateLimit-Reset', (Date.now() + rateLimitResponse.retryAfter * 1000).toString());

      throw new HttpException(rateLimitResponse, HttpStatus.TOO_MANY_REQUESTS);
    }

    return true;
  }

  /**
   * Extract client IP from request, handling proxies
   */
  private getClientIp(request: Request): string {
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) {
      const ips = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor.split(',')[0];
      return ips.trim();
    }

    const realIp = request.headers['x-real-ip'];
    if (realIp) {
      return Array.isArray(realIp) ? realIp[0] : realIp;
    }

    return request.ip || request.socket.remoteAddress || 'unknown';
  }

  /**
   * Get rate limit info for a user (for UI display)
   */
  async getRateLimitInfo(userId?: string): Promise<{
    rateLimitSeconds: number;
    isPremium: boolean;
  }> {
    if (userId) {
      const isPremium = await this.accessControlService.hasGlobalAccess(userId);
      return {
        rateLimitSeconds: isPremium ? this.RATE_LIMIT_PREMIUM : this.RATE_LIMIT_AUTH,
        isPremium,
      };
    }

    return {
      rateLimitSeconds: this.RATE_LIMIT_FREE,
      isPremium: false,
    };
  }
}
