import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AskAiDto } from './dto/ai.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @UseGuards(JwtAuthGuard)
  @Post('tutor')
  // TODO: RE-ENABLE AFTER E2E TESTING - restore: limit: 1, ttl: 5000
  @Throttle({ default: { limit: 10000, ttl: 5000 } }) // DISABLED FOR E2E
  async askTutor(
    @Request() req,
    @Body() body: AskAiDto
  ) {
    return this.aiService.askTutor(
        req.user.userId,
        body.taskId,
        body.taskTitle,
        body.userCode,
        body.question,
        body.language,
        body.uiLanguage || 'en'
    );
  }
}