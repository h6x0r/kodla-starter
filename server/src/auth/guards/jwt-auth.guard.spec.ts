import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { CacheService } from "../../cache/cache.service";

describe("JwtAuthGuard", () => {
  let guard: JwtAuthGuard;
  let cacheService: CacheService;

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
  };

  // Mock ConfigService to simulate production environment (rate limiting enabled)
  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === "NODE_ENV") return "production"; // NOT 'test' - enable rate limiting
      return undefined;
    }),
  };

  const createMockExecutionContext = (
    ip: string,
    forwardedFor?: string,
  ): ExecutionContext => {
    const mockRequest = {
      ip,
      headers: forwardedFor ? { "x-forwarded-for": forwardedFor } : {},
      socket: { remoteAddress: ip },
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;
  };

  beforeEach(async () => {
    // Save original NODE_ENV and set to production for tests
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: CacheService, useValue: mockCacheService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    cacheService = module.get<CacheService>(CacheService);

    // Restore original NODE_ENV after guard creation
    process.env.NODE_ENV = originalNodeEnv;

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  // ============================================
  // IP Extraction
  // ============================================
  describe("IP Extraction", () => {
    it("should extract IP from x-forwarded-for header", async () => {
      const context = createMockExecutionContext(
        "127.0.0.1",
        "203.0.113.195, 70.41.3.18",
      );
      mockCacheService.get.mockResolvedValue(null);

      try {
        await guard.canActivate(context);
      } catch {
        // Expected to fail without passport setup
      }

      // Check that blocked check was called with forwarded IP
      expect(mockCacheService.get).toHaveBeenCalledWith(
        "auth:blocked:203.0.113.195",
      );
    });

    it("should use request.ip when no x-forwarded-for", async () => {
      const context = createMockExecutionContext("192.168.1.1");
      mockCacheService.get.mockResolvedValue(null);

      try {
        await guard.canActivate(context);
      } catch {
        // Expected to fail
      }

      expect(mockCacheService.get).toHaveBeenCalledWith(
        "auth:blocked:192.168.1.1",
      );
    });
  });

  // ============================================
  // Rate Limiting
  // ============================================
  describe("Rate Limiting", () => {
    it("should block already rate-limited IPs", async () => {
      const context = createMockExecutionContext("192.168.1.1");
      mockCacheService.get.mockResolvedValue(true); // IP is blocked

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        "Too many authentication failures",
      );
    });

    it("should allow non-blocked IPs to proceed", async () => {
      const context = createMockExecutionContext("192.168.1.1");
      mockCacheService.get
        .mockResolvedValueOnce(null) // Not blocked
        .mockResolvedValueOnce(0); // No failed attempts

      // Note: canActivate will still fail because parent AuthGuard isn't mocked
      // But it should get past the rate limit check
      try {
        await guard.canActivate(context);
      } catch (error) {
        // Should not be rate limit error
        expect(error.message).not.toContain("Too many authentication failures");
      }
    });

    it("should track failed attempts", async () => {
      const context = createMockExecutionContext("192.168.1.1");
      mockCacheService.get
        .mockResolvedValueOnce(null) // Not blocked
        .mockResolvedValueOnce(5); // 5 previous failed attempts

      try {
        await guard.canActivate(context);
      } catch {
        // Expected to fail
      }

      // Should have tried to increment failure count
      expect(mockCacheService.set).toHaveBeenCalledWith(
        "auth:fail:192.168.1.1",
        6, // 5 + 1
        300, // 5 minute window
      );
    });

    it("should block IP after 10 failed attempts", async () => {
      const context = createMockExecutionContext("192.168.1.1");
      mockCacheService.get
        .mockResolvedValueOnce(null) // Not blocked
        .mockResolvedValueOnce(9); // 9 previous failed attempts (10th will trigger block)

      try {
        await guard.canActivate(context);
      } catch {
        // Expected to fail
      }

      // Should block the IP after 10 attempts
      expect(mockCacheService.set).toHaveBeenCalledWith(
        "auth:blocked:192.168.1.1",
        true,
        900, // 15 minute block
      );
    });

    it("should not block IP before limit is reached", async () => {
      const context = createMockExecutionContext("192.168.1.1");
      mockCacheService.get
        .mockResolvedValueOnce(null) // Not blocked
        .mockResolvedValueOnce(5); // 5 previous failed attempts

      try {
        await guard.canActivate(context);
      } catch {
        // Expected to fail
      }

      // Should NOT have called set for blocked key
      const blockedCalls = mockCacheService.set.mock.calls.filter(
        (call) => call[0] === "auth:blocked:192.168.1.1",
      );
      expect(blockedCalls.length).toBe(0);
    });
  });

  // ============================================
  // Edge Cases
  // ============================================
  describe("Edge Cases", () => {
    it("should handle missing cache service gracefully", async () => {
      // Create guard without cache service
      const guardWithoutCache = new JwtAuthGuard();
      const context = createMockExecutionContext("192.168.1.1");

      // Should not throw due to missing cache
      try {
        await guardWithoutCache.canActivate(context);
      } catch (error) {
        // Should fail due to passport, not cache
        expect(error.message).not.toContain("Cannot read");
      }
    });

    it("should handle array x-forwarded-for header", async () => {
      const mockRequest = {
        ip: "127.0.0.1",
        headers: { "x-forwarded-for": ["203.0.113.195", "70.41.3.18"] },
        socket: { remoteAddress: "127.0.0.1" },
      };

      const context = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      mockCacheService.get.mockResolvedValue(null);

      try {
        await guard.canActivate(context);
      } catch {
        // Expected to fail
      }

      // Should use first IP from array
      expect(mockCacheService.get).toHaveBeenCalledWith(
        "auth:blocked:203.0.113.195",
      );
    });

    it("should handle whitespace in x-forwarded-for", async () => {
      const context = createMockExecutionContext(
        "127.0.0.1",
        "  203.0.113.195  , 70.41.3.18",
      );
      mockCacheService.get.mockResolvedValue(null);

      try {
        await guard.canActivate(context);
      } catch {
        // Expected to fail
      }

      // Should trim whitespace
      expect(mockCacheService.get).toHaveBeenCalledWith(
        "auth:blocked:203.0.113.195",
      );
    });
  });
});
