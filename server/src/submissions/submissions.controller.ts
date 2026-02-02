import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ThrottlerGuard, Throttle, SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';
import { SubmissionsService } from './submissions.service';
import { CodeExecutionService } from '../queue/code-execution.service';
import { PlaygroundThrottlerGuard } from '../common/guards/playground-throttler.guard';
import { CreateSubmissionDto, RunCodeDto, RunTestsDto, SubmitPromptDto } from './dto/submissions.dto';

@Controller('submissions')
@UseGuards(ThrottlerGuard)
export class SubmissionsController {
  constructor(
    private readonly submissionsService: SubmissionsService,
    private readonly codeExecutionService: CodeExecutionService,
    private readonly playgroundThrottler: PlaygroundThrottlerGuard,
  ) {}

  /**
   * Extract client IP from request (considering proxies)
   */
  private getClientIp(req: ExpressRequest): string {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (typeof forwardedFor === 'string') {
      const ips = forwardedFor.split(',').map((ip: string) => ip.trim());
      return ips[0];
    }
    return req.ip || req.socket?.remoteAddress || 'unknown';
  }

  /**
   * POST /submissions
   * Submit code for a task (requires auth, saves to DB)
   * Rate limit: 10 submissions per minute
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.OK)
  // TODO: RE-ENABLE AFTER E2E TESTING - restore: limit: 10, ttl: 60000
  @Throttle({ default: { limit: 10000, ttl: 60000 } }) // DISABLED FOR E2E
  async create(@Request() req, @Body() body: CreateSubmissionDto) {
    const ip = this.getClientIp(req);
    return this.submissionsService.create(
      req.user.userId,
      body.taskId,
      body.code,
      body.language,
      ip
    );
  }

  /**
   * POST /submissions/prompt
   * Submit a prompt for a prompt engineering task (requires auth, saves to DB)
   * Uses AI-as-Judge for evaluation
   * Rate limit: 5 submissions per minute (AI calls are expensive)
   */
  @UseGuards(JwtAuthGuard)
  @Post('prompt')
  @HttpCode(HttpStatus.OK)
  // TODO: RE-ENABLE AFTER E2E TESTING - restore: limit: 5, ttl: 60000
  @Throttle({ default: { limit: 10000, ttl: 60000 } }) // DISABLED FOR E2E
  async submitPrompt(@Request() req, @Body() body: SubmitPromptDto) {
    return this.submissionsService.submitPrompt(
      req.user.userId,
      body.taskId,
      body.prompt
    );
  }

  /**
   * POST /submissions/run
   * Run code without saving (playground mode)
   * Requires authentication - only logged-in users can execute code
   * Custom rate limit based on subscription:
   * - Authenticated: 10 seconds between runs
   * - Premium: 5 seconds between runs
   */
  @Post('run')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @SkipThrottle() // Using custom throttler instead
  async runCode(@Request() req, @Body() body: RunCodeDto) {
    // Apply custom rate limiting
    await this.playgroundThrottler.canActivate({
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => req.res,
      }),
    } as any);

    const ip = this.getClientIp(req);
    const userId = req.user.userId;
    return this.submissionsService.runCode(body.code, body.language, body.stdin, ip, userId);
  }

  /**
   * POST /submissions/run-tests
   * Run quick tests (5 tests) without saving to database
   * Used for "Run Code" button - fast feedback without full submission
   * Requires authentication - only logged-in users can execute code
   * Custom rate limit based on subscription (same as /run)
   */
  @Post('run-tests')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @SkipThrottle() // Using custom throttler instead
  async runTests(@Request() req, @Body() body: RunTestsDto) {
    // Apply custom rate limiting
    await this.playgroundThrottler.canActivate({
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => req.res,
      }),
    } as any);

    const ip = this.getClientIp(req);
    const userId = req.user.userId;
    return this.submissionsService.runQuickTests(
      body.taskId,
      body.code,
      body.language,
      ip,
      userId
    );
  }

  /**
   * GET /submissions/rate-limit-info
   * Get rate limit configuration for the current user
   * Used by frontend to display cooldown timers
   */
  @Get('rate-limit-info')
  @UseGuards(OptionalJwtAuthGuard)
  @SkipThrottle()
  async getRateLimitInfo(@Request() req) {
    const userId = req.user?.userId;
    return this.playgroundThrottler.getRateLimitInfo(userId);
  }

  /**
   * GET /submissions/judge/status
   * Get execution engine health and queue status
   */
  @Get('judge/status')
  @SkipThrottle() // No rate limit for status checks
  async getJudgeStatus() {
    return this.submissionsService.getJudgeStatus();
  }

  /**
   * GET /submissions/languages
   * Get list of supported languages
   */
  @Get('languages')
  @SkipThrottle() // No rate limit for language list
  getLanguages() {
    return {
      languages: this.codeExecutionService.getSupportedLanguages(),
      default: 'go',
    };
  }

  /**
   * GET /submissions/user/recent
   * Get user's recent submissions (requires auth)
   */
  @UseGuards(JwtAuthGuard)
  @Get('user/recent')
  async getUserRecent(@Request() req, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.submissionsService.findRecentByUser(req.user.userId, limitNum);
  }

  /**
   * GET /submissions/task/:taskId
   * Get user's submissions for a specific task (requires auth)
   */
  @UseGuards(JwtAuthGuard)
  @Get('task/:taskId')
  async getByTask(@Request() req, @Param('taskId') taskId: string) {
    return this.submissionsService.findByUserAndTask(req.user.userId, taskId);
  }

  /**
   * GET /submissions/run-result/:taskId
   * Get the latest run result for a specific task (requires auth)
   * Returns the last "Run Code" result to restore state after page reload
   * Returns { data: null } if no run result exists (NestJS returns empty body for raw null)
   */
  @UseGuards(JwtAuthGuard)
  @Get('run-result/:taskId')
  async getRunResult(@Request() req, @Param('taskId') taskId: string) {
    const result = await this.submissionsService.getRunResult(req.user.userId, taskId);
    // Wrap in object to avoid NestJS empty body issue with null
    return { data: result };
  }

  /**
   * GET /submissions/:id
   * Get submission by ID (requires auth, owner only)
   * NOTE: Must be LAST - catches all paths not matched above
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const submission = await this.submissionsService.findOne(id);

    // Check ownership - users can only access their own submissions
    if (submission.userId !== req.user.userId) {
      throw new ForbiddenException('You can only access your own submissions');
    }

    return submission;
  }
}
