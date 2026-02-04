import { Test, TestingModule } from "@nestjs/testing";
import { AuditService } from "./audit.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("AuditService", () => {
  let service: AuditService;

  const mockPrismaService = {
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    jest.clearAllMocks();
  });

  describe("log", () => {
    it("should create an audit log entry", async () => {
      mockPrismaService.auditLog.create.mockResolvedValue({
        id: "audit-1",
        adminId: "admin-1",
        action: "user_ban",
        entity: "user",
        entityId: "user-123",
        details: { reason: "Spam" },
        createdAt: new Date(),
      });

      await service.log({
        adminId: "admin-1",
        action: "user_ban",
        entity: "user",
        entityId: "user-123",
        details: { reason: "Spam" },
      });

      expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith({
        data: {
          adminId: "admin-1",
          action: "user_ban",
          entity: "user",
          entityId: "user-123",
          details: { reason: "Spam" },
          ipAddress: null,
          userAgent: null,
        },
      });
    });

    it("should handle missing optional fields", async () => {
      mockPrismaService.auditLog.create.mockResolvedValue({
        id: "audit-2",
        adminId: "admin-1",
        action: "settings_update",
        entity: "settings",
        entityId: null,
        details: null,
        createdAt: new Date(),
      });

      await service.log({
        adminId: "admin-1",
        action: "settings_update",
        entity: "settings",
      });

      expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith({
        data: {
          adminId: "admin-1",
          action: "settings_update",
          entity: "settings",
          entityId: null,
          details: undefined,
          ipAddress: null,
          userAgent: null,
        },
      });
    });

    it("should not throw on error", async () => {
      mockPrismaService.auditLog.create.mockRejectedValue(
        new Error("Database error")
      );

      // Should not throw
      await expect(
        service.log({
          adminId: "admin-1",
          action: "user_ban",
          entity: "user",
        })
      ).resolves.toBeUndefined();
    });
  });

  describe("getLogs", () => {
    const mockLogs = [
      {
        id: "audit-1",
        adminId: "admin-1",
        action: "user_ban",
        entity: "user",
        entityId: "user-123",
        details: { reason: "Spam" },
        ipAddress: null,
        userAgent: null,
        createdAt: new Date(),
        admin: { email: "admin@test.com", name: "Admin" },
      },
      {
        id: "audit-2",
        adminId: "admin-1",
        action: "settings_update",
        entity: "settings",
        entityId: "ai",
        details: { changes: { enabled: false } },
        ipAddress: null,
        userAgent: null,
        createdAt: new Date(),
        admin: { email: "admin@test.com", name: "Admin" },
      },
    ];

    it("should return paginated logs", async () => {
      mockPrismaService.auditLog.findMany.mockResolvedValue(mockLogs);
      mockPrismaService.auditLog.count.mockResolvedValue(2);

      const result = await service.getLogs({}, 1, 50);

      expect(result.logs).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.logs[0].adminEmail).toBe("admin@test.com");
    });

    it("should filter by action", async () => {
      mockPrismaService.auditLog.findMany.mockResolvedValue([mockLogs[0]]);
      mockPrismaService.auditLog.count.mockResolvedValue(1);

      await service.getLogs({ action: "user_ban" }, 1, 50);

      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { action: "user_ban" },
        })
      );
    });

    it("should filter by entity", async () => {
      mockPrismaService.auditLog.findMany.mockResolvedValue([mockLogs[1]]);
      mockPrismaService.auditLog.count.mockResolvedValue(1);

      await service.getLogs({ entity: "settings" }, 1, 50);

      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { entity: "settings" },
        })
      );
    });

    it("should filter by date range", async () => {
      const startDate = new Date("2026-01-01");
      const endDate = new Date("2026-01-31");
      mockPrismaService.auditLog.findMany.mockResolvedValue([]);
      mockPrismaService.auditLog.count.mockResolvedValue(0);

      await service.getLogs({ startDate, endDate }, 1, 50);

      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { createdAt: { gte: startDate, lte: endDate } },
        })
      );
    });

    it("should apply pagination", async () => {
      mockPrismaService.auditLog.findMany.mockResolvedValue([]);
      mockPrismaService.auditLog.count.mockResolvedValue(100);

      await service.getLogs({}, 3, 20);

      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 40,
          take: 20,
        })
      );
    });
  });

  describe("getRecentLogs", () => {
    it("should return recent logs with default limit", async () => {
      mockPrismaService.auditLog.findMany.mockResolvedValue([]);
      mockPrismaService.auditLog.count.mockResolvedValue(0);

      await service.getRecentLogs();

      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        })
      );
    });

    it("should use custom limit", async () => {
      mockPrismaService.auditLog.findMany.mockResolvedValue([]);
      mockPrismaService.auditLog.count.mockResolvedValue(0);

      await service.getRecentLogs(5);

      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
        })
      );
    });
  });
});
