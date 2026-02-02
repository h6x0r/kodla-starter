import { Controller, Post, Body, HttpCode, HttpStatus, Req, UseGuards, Headers } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from '../common/dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

// TODO: RE-ENABLE after E2E testing - temporarily increased for bulk testing (was 3 and 5)
const REGISTER_RATE_LIMIT = parseInt(process.env.RATE_LIMIT_REGISTER || '3', 10);
const LOGIN_RATE_LIMIT = parseInt(process.env.RATE_LIMIT_LOGIN || '5', 10);

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Strict rate limiting: 3 registrations per minute per IP (configurable via env)
  @Throttle({ default: { limit: REGISTER_RATE_LIMIT, ttl: 60000 } })
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Headers('user-agent') userAgent?: string,
    @Req() req?: Request
  ) {
    const ipAddress = req?.ip || req?.socket?.remoteAddress;
    return this.authService.register(registerDto, userAgent, ipAddress);
  }

  // Strict rate limiting: 5 login attempts per minute per IP (configurable via env)
  @Throttle({ default: { limit: LOGIN_RATE_LIMIT, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Headers('user-agent') userAgent?: string,
    @Req() req?: Request
  ) {
    const ipAddress = req?.ip || req?.socket?.remoteAddress;
    return this.authService.login(loginDto, userAgent, ipAddress);
  }

  // Logout - invalidate current session
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    if (token) {
      await this.authService.logout(token);
    }
    return { message: 'Logged out successfully' };
  }
}