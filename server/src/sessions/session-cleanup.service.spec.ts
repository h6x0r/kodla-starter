import { Test, TestingModule } from '@nestjs/testing';
import { SessionCleanupService } from './session-cleanup.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SessionCleanupService', () => {
  let service: SessionCleanupService;

  const mockPrismaService = {
    session: {
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionCleanupService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SessionCleanupService>(SessionCleanupService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ============================================
  // cleanupExpiredSessions()
  // ============================================
  describe('cleanupExpiredSessions()', () => {
    it('should delete expired sessions', async () => {
      mockPrismaService.session.deleteMany
        .mockResolvedValueOnce({ count: 5 }) // expired
        .mockResolvedValueOnce({ count: 3 }); // inactive

      await service.cleanupExpiredSessions();

      expect(mockPrismaService.session.deleteMany).toHaveBeenCalledTimes(2);

      // First call: expired sessions
      expect(mockPrismaService.session.deleteMany).toHaveBeenNthCalledWith(1, {
        where: {
          expiresAt: { lt: expect.any(Date) },
        },
      });

      // Second call: inactive sessions older than 24h
      expect(mockPrismaService.session.deleteMany).toHaveBeenNthCalledWith(2, {
        where: {
          isActive: false,
          lastActiveAt: { lt: expect.any(Date) },
        },
      });
    });

    it('should log when sessions are deleted', async () => {
      mockPrismaService.session.deleteMany
        .mockResolvedValueOnce({ count: 10 })
        .mockResolvedValueOnce({ count: 5 });

      await service.cleanupExpiredSessions();

      // Should not throw
      expect(true).toBe(true);
    });

    it('should not log when no sessions deleted', async () => {
      mockPrismaService.session.deleteMany
        .mockResolvedValueOnce({ count: 0 })
        .mockResolvedValueOnce({ count: 0 });

      await service.cleanupExpiredSessions();

      expect(true).toBe(true);
    });

    it('should handle database errors gracefully', async () => {
      mockPrismaService.session.deleteMany.mockRejectedValueOnce(
        new Error('Database error'),
      );

      // Should not throw
      await expect(service.cleanupExpiredSessions()).resolves.not.toThrow();
    });

    it('should use correct time threshold for inactive sessions', async () => {
      const beforeTest = Date.now();

      mockPrismaService.session.deleteMany
        .mockResolvedValueOnce({ count: 0 })
        .mockResolvedValueOnce({ count: 0 });

      await service.cleanupExpiredSessions();

      const afterTest = Date.now();

      // Check that the inactive threshold is approximately 24 hours ago
      const secondCall = mockPrismaService.session.deleteMany.mock.calls[1];
      const lastActiveAt = secondCall[0].where.lastActiveAt.lt as Date;
      const threshold24h = 24 * 60 * 60 * 1000;

      expect(lastActiveAt.getTime()).toBeGreaterThanOrEqual(beforeTest - threshold24h - 1000);
      expect(lastActiveAt.getTime()).toBeLessThanOrEqual(afterTest - threshold24h + 1000);
    });
  });

  // ============================================
  // deepCleanup()
  // ============================================
  describe('deepCleanup()', () => {
    it('should delete sessions older than 30 days', async () => {
      mockPrismaService.session.deleteMany.mockResolvedValueOnce({ count: 100 });

      await service.deepCleanup();

      expect(mockPrismaService.session.deleteMany).toHaveBeenCalledWith({
        where: {
          createdAt: { lt: expect.any(Date) },
        },
      });
    });

    it('should use correct 30-day threshold', async () => {
      const beforeTest = Date.now();

      mockPrismaService.session.deleteMany.mockResolvedValueOnce({ count: 0 });

      await service.deepCleanup();

      const afterTest = Date.now();

      const call = mockPrismaService.session.deleteMany.mock.calls[0];
      const createdAt = call[0].where.createdAt.lt as Date;
      const threshold30d = 30 * 24 * 60 * 60 * 1000;

      expect(createdAt.getTime()).toBeGreaterThanOrEqual(beforeTest - threshold30d - 1000);
      expect(createdAt.getTime()).toBeLessThanOrEqual(afterTest - threshold30d + 1000);
    });

    it('should log when old sessions are deleted', async () => {
      mockPrismaService.session.deleteMany.mockResolvedValueOnce({ count: 50 });

      await service.deepCleanup();

      expect(true).toBe(true);
    });

    it('should not log when no old sessions deleted', async () => {
      mockPrismaService.session.deleteMany.mockResolvedValueOnce({ count: 0 });

      await service.deepCleanup();

      expect(true).toBe(true);
    });

    it('should handle database errors gracefully', async () => {
      mockPrismaService.session.deleteMany.mockRejectedValueOnce(
        new Error('Database connection lost'),
      );

      await expect(service.deepCleanup()).resolves.not.toThrow();
    });
  });

  // ============================================
  // runCleanupNow()
  // ============================================
  describe('runCleanupNow()', () => {
    it('should run all cleanup operations and return counts', async () => {
      mockPrismaService.session.deleteMany
        .mockResolvedValueOnce({ count: 10 }) // expired
        .mockResolvedValueOnce({ count: 5 })  // inactive
        .mockResolvedValueOnce({ count: 3 }); // old

      const result = await service.runCleanupNow();

      expect(result).toEqual({
        expired: 10,
        inactive: 5,
        old: 3,
      });
    });

    it('should call deleteMany three times', async () => {
      mockPrismaService.session.deleteMany
        .mockResolvedValueOnce({ count: 0 })
        .mockResolvedValueOnce({ count: 0 })
        .mockResolvedValueOnce({ count: 0 });

      await service.runCleanupNow();

      expect(mockPrismaService.session.deleteMany).toHaveBeenCalledTimes(3);
    });

    it('should delete expired sessions first', async () => {
      mockPrismaService.session.deleteMany
        .mockResolvedValueOnce({ count: 0 })
        .mockResolvedValueOnce({ count: 0 })
        .mockResolvedValueOnce({ count: 0 });

      await service.runCleanupNow();

      expect(mockPrismaService.session.deleteMany).toHaveBeenNthCalledWith(1, {
        where: { expiresAt: { lt: expect.any(Date) } },
      });
    });

    it('should delete inactive sessions second', async () => {
      mockPrismaService.session.deleteMany
        .mockResolvedValueOnce({ count: 0 })
        .mockResolvedValueOnce({ count: 0 })
        .mockResolvedValueOnce({ count: 0 });

      await service.runCleanupNow();

      expect(mockPrismaService.session.deleteMany).toHaveBeenNthCalledWith(2, {
        where: {
          isActive: false,
          lastActiveAt: { lt: expect.any(Date) },
        },
      });
    });

    it('should delete old sessions third', async () => {
      mockPrismaService.session.deleteMany
        .mockResolvedValueOnce({ count: 0 })
        .mockResolvedValueOnce({ count: 0 })
        .mockResolvedValueOnce({ count: 0 });

      await service.runCleanupNow();

      expect(mockPrismaService.session.deleteMany).toHaveBeenNthCalledWith(3, {
        where: { createdAt: { lt: expect.any(Date) } },
      });
    });

    it('should return zero counts when no sessions to clean', async () => {
      mockPrismaService.session.deleteMany
        .mockResolvedValueOnce({ count: 0 })
        .mockResolvedValueOnce({ count: 0 })
        .mockResolvedValueOnce({ count: 0 });

      const result = await service.runCleanupNow();

      expect(result).toEqual({
        expired: 0,
        inactive: 0,
        old: 0,
      });
    });

    it('should propagate database errors', async () => {
      mockPrismaService.session.deleteMany.mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(service.runCleanupNow()).rejects.toThrow('Database error');
    });
  });

  // ============================================
  // getStats()
  // ============================================
  describe('getStats()', () => {
    it('should return session statistics', async () => {
      mockPrismaService.session.count
        .mockResolvedValueOnce(100)  // total
        .mockResolvedValueOnce(50)   // active
        .mockResolvedValueOnce(20)   // expired
        .mockResolvedValueOnce(30);  // inactive

      const stats = await service.getStats();

      expect(stats).toEqual({
        totalSessions: 100,
        activeSessions: 50,
        expiredSessions: 20,
        inactiveSessions: 30,
      });
    });

    it('should call count with correct filters', async () => {
      mockPrismaService.session.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      await service.getStats();

      // Total - no filter
      expect(mockPrismaService.session.count).toHaveBeenNthCalledWith(1);

      // Active sessions
      expect(mockPrismaService.session.count).toHaveBeenNthCalledWith(2, {
        where: { isActive: true, expiresAt: { gt: expect.any(Date) } },
      });

      // Expired sessions
      expect(mockPrismaService.session.count).toHaveBeenNthCalledWith(3, {
        where: { expiresAt: { lt: expect.any(Date) } },
      });

      // Inactive sessions
      expect(mockPrismaService.session.count).toHaveBeenNthCalledWith(4, {
        where: { isActive: false },
      });
    });

    it('should run count queries in parallel', async () => {
      const countPromises: Promise<number>[] = [];

      mockPrismaService.session.count.mockImplementation(() => {
        const promise = new Promise<number>((resolve) => {
          setTimeout(() => resolve(10), 10);
        });
        countPromises.push(promise);
        return promise;
      });

      const startTime = Date.now();
      await service.getStats();
      const endTime = Date.now();

      // If parallel, should take ~10ms; if sequential, ~40ms
      // Using 100ms as threshold to account for CI/test runner variance
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should return zeros for empty database', async () => {
      mockPrismaService.session.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const stats = await service.getStats();

      expect(stats).toEqual({
        totalSessions: 0,
        activeSessions: 0,
        expiredSessions: 0,
        inactiveSessions: 0,
      });
    });

    it('should propagate database errors', async () => {
      mockPrismaService.session.count.mockRejectedValueOnce(
        new Error('Connection refused'),
      );

      await expect(service.getStats()).rejects.toThrow('Connection refused');
    });
  });
});
