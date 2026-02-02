import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SessionsService } from '../sessions/sessions.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { LoginDto, RegisterDto } from '../common/dto';
import { User, DeviceType } from '@prisma/client';
import { parseDeviceType } from '../common/utils/device-parser';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private sessionsService: SessionsService,
    private jwtService: JwtService,
  ) {}

  async register(
    registerDto: RegisterDto,
    userAgent?: string,
    ipAddress?: string,
  ) {
    // Check if user exists
    const existing = await this.usersService.findOne(registerDto.email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user (isPremium defaults to false, computed from subscriptions)
    const user = await this.usersService.create({
      email: registerDto.email,
      name: registerDto.name,
      password: hashedPassword,
      preferences: {
        editorFontSize: 14,
        editorMinimap: false,
        editorTheme: 'vs-dark',
        editorLineNumbers: true,
        notifications: {
          emailDigest: true,
          newCourses: true,
        },
      },
    });

    const token = this.generateToken(user);

    // Parse device type from User-Agent
    const deviceType = parseDeviceType(userAgent);

    // Create session with device type (new user, no need to invalidate existing)
    await this.sessionsService.createSession(
      user.id,
      token,
      deviceType,
      userAgent,
      ipAddress,
    );

    // Compute isPremium and plan from active subscriptions
    const isPremium = await this.usersService.isPremiumUser(user.id);
    const plan = await this.usersService.getActivePlan(user.id);

    // Transform to DTO
    return { user: this.transformUser(user, isPremium, plan), token };
  }

  async login(
    loginDto: LoginDto,
    userAgent?: string,
    ipAddress?: string,
  ) {
    // Use findOneForAuth to get password for verification
    const user = await this.usersService.findOneForAuth(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Parse device type from User-Agent
    const deviceType = parseDeviceType(userAgent);

    // Invalidate only sessions of the SAME device type
    // This allows 1 mobile + 1 desktop session simultaneously
    await this.sessionsService.invalidateUserSessionsByDevice(user.id, deviceType);

    const token = this.generateToken(user);

    // Create new session with device type
    await this.sessionsService.createSession(
      user.id,
      token,
      deviceType,
      userAgent,
      ipAddress,
    );

    // Compute isPremium and plan from active subscriptions
    const isPremium = await this.usersService.isPremiumUser(user.id);
    const plan = await this.usersService.getActivePlan(user.id);

    // Transform to DTO
    return { user: this.transformUser(user, isPremium, plan), token };
  }

  /**
   * Logout - invalidate the current session
   */
  async logout(token: string): Promise<void> {
    const session = await this.sessionsService.validateSession(token);
    if (session) {
      await this.sessionsService.invalidateSession(session.id);
    }
  }

  private generateToken(user: User) {
    // Include jti (JWT ID) to ensure each token is unique
    // This prevents session collision when same user logs in multiple times
    const payload = { email: user.email, sub: user.id, jti: crypto.randomUUID() };
    return this.jwtService.sign(payload);
  }

  /**
   * Shapes the DB entity into the Frontend DTO.
   * Overrides isPremium and plan with computed values from active subscriptions.
   */
  private transformUser(user: User, isPremium?: boolean, plan?: { name: string; expiresAt: string } | null) {
    const { password, ...result } = user;

    // Override with computed values if provided
    if (isPremium !== undefined) {
      result.isPremium = isPremium;
    }
    if (plan !== undefined) {
      result.plan = plan;
    }

    return result;
  }
}
