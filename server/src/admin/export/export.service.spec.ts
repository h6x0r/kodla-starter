import { Test, TestingModule } from "@nestjs/testing";
import { ExportService } from "./export.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("ExportService", () => {
  let service: ExportService;
  let prisma: jest.Mocked<PrismaService>;

  const mockUsers = [
    {
      id: "user-1",
      email: "user1@test.com",
      name: "User One",
      role: "USER",
      isPremium: true,
      isBanned: false,
      bannedAt: null,
      bannedReason: null,
      xp: 1500,
      level: 5,
      currentStreak: 7,
      maxStreak: 14,
      createdAt: new Date("2024-01-01"),
      lastActivityAt: new Date("2024-01-15"),
      _count: { submissions: 50, courses: 3 },
    },
  ];

  const mockPayments = [
    {
      id: "payment-1",
      amount: 9900,
      currency: "UZS",
      status: "completed",
      provider: "payme",
      providerTxId: "tx-123",
      createdAt: new Date("2024-01-10"),
      updatedAt: new Date("2024-01-10"),
      subscription: {
        user: { email: "user1@test.com", name: "User One" },
        plan: { name: "Premium Monthly", slug: "premium-monthly" },
      },
    },
  ];

  const mockSubscriptions = [
    {
      id: "sub-1",
      status: "active",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-02-01"),
      autoRenew: true,
      createdAt: new Date("2024-01-01"),
      user: { id: "user-1", email: "user1@test.com", name: "User One" },
      plan: {
        id: "plan-1",
        name: "Premium",
        slug: "premium",
        type: "global",
      },
      _count: { payments: 1 },
    },
  ];

  const mockAuditLogs = [
    {
      id: "log-1",
      action: "user_ban",
      entity: "user",
      entityId: "user-2",
      details: { reason: "Spam" },
      ipAddress: "192.168.1.1",
      createdAt: new Date("2024-01-15"),
      admin: { email: "admin@test.com", name: "Admin" },
    },
  ];

  beforeEach(async () => {
    const mockPrisma = {
      user: { findMany: jest.fn() },
      payment: { findMany: jest.fn() },
      subscription: { findMany: jest.fn() },
      auditLog: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ExportService>(ExportService);
    prisma = module.get(PrismaService);
  });

  describe("exportData", () => {
    it("should export users as JSON", async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const result = await service.exportData({
        format: "json",
        entity: "users",
      });

      const parsed = JSON.parse(result);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].email).toBe("user1@test.com");
      expect(parsed[0].submissionsCount).toBe(50);
    });

    it("should export users as CSV", async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const result = await service.exportData({
        format: "csv",
        entity: "users",
      });

      expect(result).toContain("id,email,name");
      expect(result).toContain("user1@test.com");
    });

    it("should export payments as JSON", async () => {
      (prisma.payment.findMany as jest.Mock).mockResolvedValue(mockPayments);

      const result = await service.exportData({
        format: "json",
        entity: "payments",
      });

      const parsed = JSON.parse(result);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].amount).toBe(9900);
      expect(parsed[0].provider).toBe("payme");
    });

    it("should export payments as CSV", async () => {
      (prisma.payment.findMany as jest.Mock).mockResolvedValue(mockPayments);

      const result = await service.exportData({
        format: "csv",
        entity: "payments",
      });

      expect(result).toContain("id,amount,currency,status");
      expect(result).toContain("9900");
    });

    it("should export subscriptions as JSON", async () => {
      (prisma.subscription.findMany as jest.Mock).mockResolvedValue(
        mockSubscriptions,
      );

      const result = await service.exportData({
        format: "json",
        entity: "subscriptions",
      });

      const parsed = JSON.parse(result);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].status).toBe("active");
      expect(parsed[0].planName).toBe("Premium");
    });

    it("should export audit logs as JSON", async () => {
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue(mockAuditLogs);

      const result = await service.exportData({
        format: "json",
        entity: "auditLogs",
      });

      const parsed = JSON.parse(result);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].action).toBe("user_ban");
      expect(parsed[0].adminEmail).toBe("admin@test.com");
    });

    it("should apply date filters", async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

      await service.exportData({
        format: "json",
        entity: "users",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-31"),
      });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            createdAt: {
              gte: new Date("2024-01-01"),
              lte: new Date("2024-01-31"),
            },
          },
        }),
      );
    });

    it("should apply limit", async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

      await service.exportData({
        format: "json",
        entity: "users",
        limit: 100,
      });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        }),
      );
    });

    it("should return empty string for empty CSV", async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.exportData({
        format: "csv",
        entity: "users",
      });

      expect(result).toBe("");
    });

    it("should escape CSV values with commas", async () => {
      const userWithComma = [
        {
          ...mockUsers[0],
          name: "User, One",
        },
      ];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(userWithComma);

      const result = await service.exportData({
        format: "csv",
        entity: "users",
      });

      expect(result).toContain('"User, One"');
    });
  });
});
