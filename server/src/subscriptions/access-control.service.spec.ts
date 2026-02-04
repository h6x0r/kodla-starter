import { Test, TestingModule } from "@nestjs/testing";
import { AccessControlService } from "./access-control.service";
import { PrismaService } from "../prisma/prisma.service";

describe("AccessControlService", () => {
  let service: AccessControlService;
  let prisma: PrismaService;

  const mockGlobalSubscription = {
    id: "sub-global",
    userId: "user-premium",
    planId: "plan-global",
    status: "active",
    endDate: new Date("2025-12-31"),
    plan: { type: "global", courseId: null },
  };

  const mockCourseSubscription = {
    id: "sub-course",
    userId: "user-course",
    planId: "plan-go",
    status: "active",
    endDate: new Date("2025-12-31"),
    plan: { type: "course", courseId: "course-go" },
  };

  const mockTask = {
    id: "task-123",
    slug: "hello-world",
    topicId: "topic-123",
    order: 1,
    topic: {
      id: "topic-123",
      module: {
        courseId: "course-go",
        course: { id: "course-go", slug: "go-basics" },
      },
    },
  };

  const mockFirstTask = {
    id: "task-first",
    slug: "first-task",
    topicId: "topic-123",
    order: 0,
  };

  const mockPrismaService = {
    subscription: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    task: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    courseAccess: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessControlService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AccessControlService>(AccessControlService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();

    // Default: no one-time course purchase (CourseAccess)
    mockPrismaService.courseAccess.findUnique.mockResolvedValue(null);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // ============================================
  // hasGlobalAccess()
  // ============================================
  describe("hasGlobalAccess()", () => {
    it("should return true for user with active global subscription", async () => {
      mockPrismaService.subscription.findFirst.mockResolvedValue(
        mockGlobalSubscription,
      );

      const result = await service.hasGlobalAccess("user-premium");

      expect(result).toBe(true);
    });

    it("should return false for user without global subscription", async () => {
      mockPrismaService.subscription.findFirst.mockResolvedValue(null);

      const result = await service.hasGlobalAccess("user-free");

      expect(result).toBe(false);
    });

    it("should check for active status and valid end date", async () => {
      mockPrismaService.subscription.findFirst.mockResolvedValue(null);

      await service.hasGlobalAccess("user-123");

      expect(mockPrismaService.subscription.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: "active",
            endDate: { gte: expect.any(Date) },
            plan: { type: "global" },
          }),
        }),
      );
    });
  });

  // ============================================
  // hasCourseAccess()
  // ============================================
  describe("hasCourseAccess()", () => {
    it("should return true for user with global subscription", async () => {
      mockPrismaService.subscription.findFirst.mockResolvedValue(
        mockGlobalSubscription,
      );

      const result = await service.hasCourseAccess("user-premium", "course-go");

      expect(result).toBe(true);
    });

    it("should return true for user with course-specific subscription", async () => {
      mockPrismaService.subscription.findFirst
        .mockResolvedValueOnce(null) // No global subscription
        .mockResolvedValueOnce(mockCourseSubscription); // Has course subscription

      const result = await service.hasCourseAccess("user-course", "course-go");

      expect(result).toBe(true);
    });

    it("should return false for user without any subscription", async () => {
      mockPrismaService.subscription.findFirst.mockResolvedValue(null);

      const result = await service.hasCourseAccess("user-free", "course-go");

      expect(result).toBe(false);
    });

    it("should return false for user with subscription to different course", async () => {
      mockPrismaService.subscription.findFirst.mockResolvedValue(null);

      const result = await service.hasCourseAccess(
        "user-course",
        "course-java",
      );

      expect(result).toBe(false);
    });
  });

  // ============================================
  // getQueuePriority()
  // ============================================
  describe("getQueuePriority()", () => {
    it("should return high priority (1) for premium users", async () => {
      mockPrismaService.subscription.findFirst.mockResolvedValue(
        mockGlobalSubscription,
      );

      const result = await service.getQueuePriority(
        "user-premium",
        "course-go",
      );

      expect(result).toBe(1);
    });

    it("should return low priority (10) for free users", async () => {
      mockPrismaService.subscription.findFirst.mockResolvedValue(null);

      const result = await service.getQueuePriority("user-free", "course-go");

      expect(result).toBe(10);
    });

    it("should consider course-specific subscription for priority", async () => {
      mockPrismaService.subscription.findFirst
        .mockResolvedValueOnce(null) // No global
        .mockResolvedValueOnce(mockCourseSubscription); // Has course sub

      const result = await service.getQueuePriority("user-course", "course-go");

      expect(result).toBe(1);
    });
  });

  // ============================================
  // canSeeSolution()
  // ============================================
  describe("canSeeSolution()", () => {
    it("should return true for premium user on any task", async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.subscription.findFirst.mockResolvedValue(
        mockGlobalSubscription,
      );

      const result = await service.canSeeSolution("user-premium", "task-123");

      expect(result).toBe(true);
    });

    it("should return true for free user on first task in topic", async () => {
      const firstTask = { ...mockTask, id: "task-first", order: 0 };
      mockPrismaService.task.findUnique.mockResolvedValue(firstTask);
      mockPrismaService.subscription.findFirst.mockResolvedValue(null);
      mockPrismaService.task.findFirst.mockResolvedValue(firstTask);

      const result = await service.canSeeSolution("user-free", "task-first");

      expect(result).toBe(true);
    });

    it("should return false for free user on non-first task", async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.subscription.findFirst.mockResolvedValue(null);
      mockPrismaService.task.findFirst.mockResolvedValue(mockFirstTask);

      const result = await service.canSeeSolution("user-free", "task-123");

      expect(result).toBe(false);
    });

    it("should return false if task not found", async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      const result = await service.canSeeSolution("user-123", "nonexistent");

      expect(result).toBe(false);
    });

    it("should return false if task has no topic", async () => {
      mockPrismaService.task.findUnique.mockResolvedValue({
        ...mockTask,
        topic: null,
      });

      const result = await service.canSeeSolution("user-123", "task-123");

      expect(result).toBe(false);
    });
  });

  // ============================================
  // canUseAiTutor()
  // ============================================
  describe("canUseAiTutor()", () => {
    it("should return true for premium user", async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.subscription.findFirst.mockResolvedValue(
        mockGlobalSubscription,
      );

      const result = await service.canUseAiTutor("user-premium", "task-123");

      expect(result).toBe(true);
    });

    it("should return false for free user", async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.subscription.findFirst.mockResolvedValue(null);

      const result = await service.canUseAiTutor("user-free", "task-123");

      expect(result).toBe(false);
    });

    it("should return false if task not found", async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      const result = await service.canUseAiTutor("user-123", "nonexistent");

      expect(result).toBe(false);
    });

    it("should check course-specific subscription", async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.subscription.findFirst
        .mockResolvedValueOnce(null) // No global
        .mockResolvedValueOnce(mockCourseSubscription); // Has course sub

      const result = await service.canUseAiTutor("user-course", "task-123");

      expect(result).toBe(true);
    });
  });

  // ============================================
  // getTaskAccess()
  // ============================================
  describe("getTaskAccess()", () => {
    it("should return full access for premium user", async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.subscription.findFirst.mockResolvedValue(
        mockGlobalSubscription,
      );
      mockPrismaService.task.findFirst.mockResolvedValue(mockFirstTask);

      const result = await service.getTaskAccess("user-premium", "task-123");

      expect(result.canView).toBe(true);
      expect(result.canRun).toBe(true);
      expect(result.canSubmit).toBe(true);
      expect(result.canSeeSolution).toBe(true);
      expect(result.canUseAiTutor).toBe(true);
      expect(result.queuePriority).toBe(1);
    });

    it("should return limited access for free user", async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.subscription.findFirst.mockResolvedValue(null);
      mockPrismaService.task.findFirst.mockResolvedValue(mockFirstTask);

      const result = await service.getTaskAccess("user-free", "task-123");

      expect(result.canView).toBe(true);
      expect(result.canRun).toBe(true);
      expect(result.canSubmit).toBe(true);
      expect(result.canSeeSolution).toBe(false); // Not first task
      expect(result.canUseAiTutor).toBe(false);
      expect(result.queuePriority).toBe(10);
    });

    it("should return no access if task not found", async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      const result = await service.getTaskAccess("user-123", "nonexistent");

      expect(result.canView).toBe(false);
      expect(result.canRun).toBe(false);
      expect(result.canSubmit).toBe(false);
      expect(result.canSeeSolution).toBe(false);
      expect(result.canUseAiTutor).toBe(false);
    });
  });

  // ============================================
  // getCourseAccess()
  // ============================================
  describe("getCourseAccess()", () => {
    it("should return full access for subscribed user", async () => {
      mockPrismaService.subscription.findFirst.mockResolvedValue(
        mockGlobalSubscription,
      );

      const result = await service.getCourseAccess("user-premium", "course-go");

      expect(result.hasAccess).toBe(true);
      expect(result.queuePriority).toBe(1);
      expect(result.canUseAiTutor).toBe(true);
    });

    it("should return limited access for free user", async () => {
      mockPrismaService.subscription.findFirst.mockResolvedValue(null);

      const result = await service.getCourseAccess("user-free", "course-go");

      expect(result.hasAccess).toBe(false);
      expect(result.queuePriority).toBe(10);
      expect(result.canUseAiTutor).toBe(false);
    });
  });

  // ============================================
  // Grace Period Tests
  // ============================================
  describe("Grace Period (3 days)", () => {
    it("should grant access during grace period (1 day after expiry)", async () => {
      // Subscription expired 1 day ago
      const expiredYesterday = new Date();
      expiredYesterday.setDate(expiredYesterday.getDate() - 1);

      const expiredSubscription = {
        ...mockGlobalSubscription,
        endDate: expiredYesterday,
      };
      mockPrismaService.subscription.findFirst.mockResolvedValue(
        expiredSubscription,
      );

      const result = await service.hasGlobalAccess("user-premium");

      expect(result).toBe(true);
    });

    it("should grant access during grace period (2 days after expiry)", async () => {
      // Subscription expired 2 days ago
      const expiredTwoDaysAgo = new Date();
      expiredTwoDaysAgo.setDate(expiredTwoDaysAgo.getDate() - 2);

      const expiredSubscription = {
        ...mockGlobalSubscription,
        endDate: expiredTwoDaysAgo,
      };
      mockPrismaService.subscription.findFirst.mockResolvedValue(
        expiredSubscription,
      );

      const result = await service.hasGlobalAccess("user-premium");

      expect(result).toBe(true);
    });

    it("should deny access after grace period (4 days after expiry)", async () => {
      // Subscription expired 4 days ago - beyond 3-day grace period
      mockPrismaService.subscription.findFirst.mockResolvedValue(null);

      const result = await service.hasGlobalAccess("user-premium");

      expect(result).toBe(false);
    });

    it("should apply grace period to course subscriptions", async () => {
      // Course subscription expired 2 days ago
      const expiredTwoDaysAgo = new Date();
      expiredTwoDaysAgo.setDate(expiredTwoDaysAgo.getDate() - 2);

      const expiredCourseSubscription = {
        ...mockCourseSubscription,
        endDate: expiredTwoDaysAgo,
      };

      mockPrismaService.subscription.findFirst
        .mockResolvedValueOnce(null) // No global subscription
        .mockResolvedValueOnce(expiredCourseSubscription); // Has expired course subscription within grace

      const result = await service.hasCourseAccess("user-course", "course-go");

      expect(result).toBe(true);
    });

    it("should query with grace period cutoff date", async () => {
      mockPrismaService.subscription.findFirst.mockResolvedValue(null);

      await service.hasGlobalAccess("user-123");

      // The query should use a date 3 days in the past
      const call = mockPrismaService.subscription.findFirst.mock.calls[0][0];
      const queryDate = call.where.endDate.gte;

      // Check that the query date is approximately 3 days ago
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      // Allow 1 second tolerance for test timing
      expect(queryDate.getTime()).toBeGreaterThanOrEqual(
        threeDaysAgo.getTime() - 1000,
      );
      expect(queryDate.getTime()).toBeLessThanOrEqual(
        threeDaysAgo.getTime() + 1000,
      );
    });

    it("should include grace period subscriptions in getUserSubscriptions", async () => {
      // Subscription expired 2 days ago
      const expiredTwoDaysAgo = new Date();
      expiredTwoDaysAgo.setDate(expiredTwoDaysAgo.getDate() - 2);

      const expiredSubscription = {
        ...mockGlobalSubscription,
        endDate: expiredTwoDaysAgo,
      };
      mockPrismaService.subscription.findMany.mockResolvedValue([
        expiredSubscription,
      ]);

      const result = await service.getUserSubscriptions("user-premium");

      expect(result).toHaveLength(1);
    });
  });

  // ============================================
  // getUserSubscriptions()
  // ============================================
  describe("getUserSubscriptions()", () => {
    it("should return user active subscriptions", async () => {
      mockPrismaService.subscription.findMany.mockResolvedValue([
        mockGlobalSubscription,
      ]);

      const result = await service.getUserSubscriptions("user-premium");

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockGlobalSubscription);
    });

    it("should filter by active status and valid end date", async () => {
      mockPrismaService.subscription.findMany.mockResolvedValue([]);

      await service.getUserSubscriptions("user-123");

      expect(mockPrismaService.subscription.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: "active",
            endDate: { gte: expect.any(Date) },
          }),
        }),
      );
    });

    it("should include plan details", async () => {
      mockPrismaService.subscription.findMany.mockResolvedValue([]);

      await service.getUserSubscriptions("user-123");

      expect(mockPrismaService.subscription.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { plan: true },
        }),
      );
    });

    it("should return empty array if no subscriptions", async () => {
      mockPrismaService.subscription.findMany.mockResolvedValue([]);

      const result = await service.getUserSubscriptions("user-free");

      expect(result).toEqual([]);
    });
  });

  // ============================================
  // verifyAccessAtExecutionTime()
  // ============================================
  describe("verifyAccessAtExecutionTime()", () => {
    it("should return hasAccess true with high priority for subscribed user", async () => {
      mockPrismaService.subscription.findFirst.mockResolvedValue(
        mockGlobalSubscription,
      );

      const result = await service.verifyAccessAtExecutionTime(
        "user-premium",
        "course-go",
      );

      expect(result.hasAccess).toBe(true);
      expect(result.priority).toBe(1); // PRIORITY_HIGH
    });

    it("should return hasAccess false with low priority for non-subscribed user", async () => {
      mockPrismaService.subscription.findFirst.mockResolvedValue(null);

      const result = await service.verifyAccessAtExecutionTime(
        "user-free",
        "course-go",
      );

      expect(result.hasAccess).toBe(false);
      expect(result.priority).toBe(10); // PRIORITY_LOW
    });

    it("should verify course-specific subscription", async () => {
      mockPrismaService.subscription.findFirst.mockResolvedValue(
        mockCourseSubscription,
      );

      const result = await service.verifyAccessAtExecutionTime(
        "user-course",
        "course-go",
      );

      expect(result.hasAccess).toBe(true);
      expect(result.priority).toBe(1);
      expect(mockPrismaService.subscription.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: "user-course",
            status: "active",
            OR: expect.arrayContaining([
              { plan: { type: "global" } },
              { plan: { type: "course", courseId: "course-go" } },
            ]),
          }),
        }),
      );
    });

    it("should apply grace period during verification", async () => {
      // Expired 1 day ago but within grace period
      const expiredYesterday = new Date();
      expiredYesterday.setDate(expiredYesterday.getDate() - 1);

      mockPrismaService.subscription.findFirst.mockResolvedValue({
        ...mockGlobalSubscription,
        endDate: expiredYesterday,
      });

      const result = await service.verifyAccessAtExecutionTime(
        "user-premium",
        "course-go",
      );

      expect(result.hasAccess).toBe(true);
    });
  });
});
