import { Test, TestingModule } from "@nestjs/testing";
import { AdminService } from "./admin.service";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "./audit/audit.service";

describe("AdminService", () => {
  let service: AdminService;
  let prisma: PrismaService;

  const mockAuditService = {
    log: jest.fn(),
    getAuditLogs: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    course: {
      findMany: jest.fn(),
    },
    userCourse: {
      groupBy: jest.fn(),
    },
    task: {
      findMany: jest.fn(),
    },
    submission: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    subscription: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    subscriptionPlan: {
      findMany: jest.fn(),
    },
    payment: {
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
    aiUsage: {
      aggregate: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // ============================================
  // getDashboardStats()
  // ============================================
  describe("getDashboardStats()", () => {
    beforeEach(() => {
      mockPrismaService.user.count.mockResolvedValue(100);
    });

    it("should return total users count", async () => {
      const result = await service.getDashboardStats();

      expect(result.totalUsers).toBe(100);
    });

    it("should return new users in last 30 days", async () => {
      mockPrismaService.user.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(20) // new users
        .mockResolvedValueOnce(10) // DAU
        .mockResolvedValueOnce(50) // WAU
        .mockResolvedValueOnce(80) // MAU
        .mockResolvedValueOnce(15); // premium

      const result = await service.getDashboardStats();

      expect(result.newUsers).toBe(20);
    });

    it("should return active users stats (DAU/WAU/MAU)", async () => {
      mockPrismaService.user.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(20) // new
        .mockResolvedValueOnce(10) // DAU
        .mockResolvedValueOnce(50) // WAU
        .mockResolvedValueOnce(80) // MAU
        .mockResolvedValueOnce(15); // premium

      const result = await service.getDashboardStats();

      expect(result.activeUsers.daily).toBe(10);
      expect(result.activeUsers.weekly).toBe(50);
      expect(result.activeUsers.monthly).toBe(80);
    });

    it("should return premium users count", async () => {
      mockPrismaService.user.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(80)
        .mockResolvedValueOnce(15);

      const result = await service.getDashboardStats();

      expect(result.premiumUsers).toBe(15);
    });
  });

  // ============================================
  // getCourseAnalytics()
  // ============================================
  describe("getCourseAnalytics()", () => {
    beforeEach(() => {
      mockPrismaService.course.findMany.mockResolvedValue([
        {
          id: "course-1",
          slug: "go-basics",
          title: "Go Basics",
          category: "go",
        },
        {
          id: "course-2",
          slug: "java-basics",
          title: "Java Basics",
          category: "java",
        },
      ]);
    });

    it("should return course statistics", async () => {
      mockPrismaService.userCourse.groupBy
        .mockResolvedValueOnce([
          {
            courseSlug: "go-basics",
            _count: { _all: 50 },
            _avg: { progress: 75 },
          },
          {
            courseSlug: "java-basics",
            _count: { _all: 30 },
            _avg: { progress: 60 },
          },
        ])
        .mockResolvedValueOnce([
          { courseSlug: "go-basics", _count: { _all: 20 } },
          { courseSlug: "java-basics", _count: { _all: 10 } },
        ]);

      const result = await service.getCourseAnalytics();

      expect(result.courses).toHaveLength(2);
      expect(result.totalCourses).toBe(2);
    });

    it("should calculate completion rate correctly", async () => {
      mockPrismaService.userCourse.groupBy
        .mockResolvedValueOnce([
          {
            courseSlug: "go-basics",
            _count: { _all: 100 },
            _avg: { progress: 50 },
          },
        ])
        .mockResolvedValueOnce([
          { courseSlug: "go-basics", _count: { _all: 25 } },
        ]);

      const result = await service.getCourseAnalytics();

      const goCourse = result.courses.find((c) => c.courseSlug === "go-basics");
      expect(goCourse?.completionRate).toBe(25); // 25/100 * 100
    });

    it("should sort by popularity", async () => {
      mockPrismaService.userCourse.groupBy
        .mockResolvedValueOnce([
          {
            courseSlug: "go-basics",
            _count: { _all: 30 },
            _avg: { progress: 50 },
          },
          {
            courseSlug: "java-basics",
            _count: { _all: 50 },
            _avg: { progress: 60 },
          },
        ])
        .mockResolvedValueOnce([]);

      const result = await service.getCourseAnalytics();

      expect(result.courses[0].courseSlug).toBe("java-basics"); // More popular
    });

    it("should handle courses with no enrollments", async () => {
      mockPrismaService.userCourse.groupBy
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.getCourseAnalytics();

      expect(result.courses[0].totalEnrolled).toBe(0);
      expect(result.courses[0].completionRate).toBe(0);
    });
  });

  // ============================================
  // getTaskAnalytics()
  // ============================================
  describe("getTaskAnalytics()", () => {
    beforeEach(() => {
      mockPrismaService.task.findMany.mockResolvedValue([
        {
          id: "task-1",
          slug: "hello-world",
          title: "Hello World",
          difficulty: "easy",
          isPremium: false,
        },
        {
          id: "task-2",
          slug: "fizz-buzz",
          title: "Fizz Buzz",
          difficulty: "medium",
          isPremium: true,
        },
      ]);
    });

    it("should return task statistics", async () => {
      mockPrismaService.submission.groupBy
        .mockResolvedValueOnce([
          { taskId: "task-1", _count: { _all: 100 } },
          { taskId: "task-2", _count: { _all: 50 } },
        ])
        .mockResolvedValueOnce([
          { taskId: "task-1", _count: { _all: 80 } },
          { taskId: "task-2", _count: { _all: 20 } },
        ])
        .mockResolvedValueOnce([
          { taskId: "task-1", userId: "user-1" },
          { taskId: "task-1", userId: "user-2" },
          { taskId: "task-2", userId: "user-1" },
        ]);

      const result = await service.getTaskAnalytics();

      expect(result.totalTasks).toBe(2);
      expect(result.tasksWithSubmissions).toBeGreaterThanOrEqual(0);
    });

    it("should calculate pass rate correctly", async () => {
      mockPrismaService.submission.groupBy
        .mockResolvedValueOnce([{ taskId: "task-1", _count: { _all: 100 } }])
        .mockResolvedValueOnce([{ taskId: "task-1", _count: { _all: 60 } }])
        .mockResolvedValueOnce([{ taskId: "task-1", userId: "user-1" }]);

      const result = await service.getTaskAnalytics();

      const hardestTask = result.hardestTasks.find(
        (t) => t.taskId === "task-1",
      );
      if (hardestTask) {
        expect(hardestTask.passRate).toBe(60); // 60/100 * 100
      }
    });

    it("should return hardest tasks (lowest pass rate)", async () => {
      mockPrismaService.submission.groupBy
        .mockResolvedValueOnce([
          { taskId: "task-1", _count: { _all: 100 } },
          { taskId: "task-2", _count: { _all: 100 } },
        ])
        .mockResolvedValueOnce([
          { taskId: "task-1", _count: { _all: 90 } }, // 90% pass
          { taskId: "task-2", _count: { _all: 20 } }, // 20% pass
        ])
        .mockResolvedValueOnce([]);

      const result = await service.getTaskAnalytics();

      expect(result.hardestTasks[0]?.taskId).toBe("task-2");
    });

    it("should return most popular tasks", async () => {
      mockPrismaService.submission.groupBy
        .mockResolvedValueOnce([
          { taskId: "task-1", _count: { _all: 100 } },
          { taskId: "task-2", _count: { _all: 50 } },
        ])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          { taskId: "task-1", userId: "user-1" },
          { taskId: "task-1", userId: "user-2" },
          { taskId: "task-1", userId: "user-3" },
          { taskId: "task-2", userId: "user-1" },
        ]);

      const result = await service.getTaskAnalytics();

      expect(result.mostPopularTasks[0]?.taskId).toBe("task-1");
    });
  });

  // ============================================
  // getSubmissionStats()
  // ============================================
  describe("getSubmissionStats()", () => {
    it("should return total submissions", async () => {
      mockPrismaService.submission.count
        .mockResolvedValueOnce(1000)
        .mockResolvedValueOnce(200);
      mockPrismaService.submission.groupBy
        .mockResolvedValueOnce([
          { status: "passed", _count: { status: 800 } },
          { status: "failed", _count: { status: 200 } },
        ])
        .mockResolvedValueOnce([]);

      const result = await service.getSubmissionStats();

      expect(result.totalSubmissions).toBe(1000);
      expect(result.recentSubmissions).toBe(200);
    });

    it("should return submissions by status with percentages", async () => {
      mockPrismaService.submission.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(50);
      mockPrismaService.submission.groupBy
        .mockResolvedValueOnce([
          { status: "passed", _count: { status: 70 } },
          { status: "failed", _count: { status: 30 } },
        ])
        .mockResolvedValueOnce([]);

      const result = await service.getSubmissionStats();

      expect(result.byStatus).toHaveLength(2);
      const passedStat = result.byStatus.find((s) => s.status === "passed");
      expect(passedStat?.percentage).toBe(70);
    });

    it("should return daily submissions", async () => {
      mockPrismaService.submission.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(50);
      mockPrismaService.submission.groupBy
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          { createdAt: new Date("2025-01-01"), _count: { id: 10 } },
          { createdAt: new Date("2025-01-02"), _count: { id: 15 } },
        ]);

      const result = await service.getSubmissionStats();

      expect(result.dailySubmissions).toBeDefined();
    });
  });

  // ============================================
  // getSubscriptionStats()
  // ============================================
  describe("getSubscriptionStats()", () => {
    it("should return active subscriptions count", async () => {
      mockPrismaService.subscription.count
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(10);
      mockPrismaService.subscription.groupBy.mockResolvedValue([]);
      mockPrismaService.subscriptionPlan.findMany.mockResolvedValue([]);
      mockPrismaService.payment.count.mockResolvedValue(100);
      mockPrismaService.payment.aggregate.mockResolvedValue({
        _sum: { amount: 50000 },
      });

      const result = await service.getSubscriptionStats();

      expect(result.activeSubscriptions).toBe(50);
      expect(result.newSubscriptionsThisMonth).toBe(10);
    });

    it("should calculate monthly revenue", async () => {
      mockPrismaService.subscription.count
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(10);
      mockPrismaService.subscription.groupBy.mockResolvedValue([
        { planId: "plan-1", _count: { planId: 20 } },
      ]);
      mockPrismaService.subscriptionPlan.findMany.mockResolvedValue([
        {
          id: "plan-1",
          name: "Premium",
          slug: "premium",
          type: "global",
          priceMonthly: 999,
        },
      ]);
      mockPrismaService.payment.count.mockResolvedValue(100);
      mockPrismaService.payment.aggregate.mockResolvedValue({
        _sum: { amount: 50000 },
      });

      const result = await service.getSubscriptionStats();

      expect(result.totalMonthlyRevenue).toBe(19980); // 20 * 999
    });

    it("should return payment statistics", async () => {
      mockPrismaService.subscription.count.mockResolvedValue(50);
      mockPrismaService.subscription.groupBy.mockResolvedValue([]);
      mockPrismaService.subscriptionPlan.findMany.mockResolvedValue([]);
      mockPrismaService.payment.count.mockResolvedValue(150);
      mockPrismaService.payment.aggregate.mockResolvedValue({
        _sum: { amount: 100000 },
      });

      const result = await service.getSubscriptionStats();

      expect(result.completedPayments).toBe(150);
      expect(result.totalRevenue).toBe(100000);
    });
  });

  // ============================================
  // getAiUsageStats()
  // ============================================
  describe("getAiUsageStats()", () => {
    it("should return total AI usage", async () => {
      mockPrismaService.aiUsage.aggregate.mockResolvedValue({
        _sum: { count: 500 },
      });
      mockPrismaService.aiUsage.findMany
        .mockResolvedValueOnce([
          { date: "2025-01-01", count: 10 },
          { date: "2025-01-02", count: 15 },
        ])
        .mockResolvedValueOnce([{ userId: "user-1" }, { userId: "user-2" }]);

      const result = await service.getAiUsageStats();

      expect(result.totalUsage).toBe(500);
    });

    it("should return unique users count", async () => {
      mockPrismaService.aiUsage.aggregate.mockResolvedValue({
        _sum: { count: 100 },
      });
      mockPrismaService.aiUsage.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          { userId: "user-1" },
          { userId: "user-2" },
          { userId: "user-3" },
        ]);

      const result = await service.getAiUsageStats();

      expect(result.uniqueUsers).toBe(3);
    });

    it("should calculate average usage per user", async () => {
      mockPrismaService.aiUsage.aggregate.mockResolvedValue({
        _sum: { count: 100 },
      });
      mockPrismaService.aiUsage.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ userId: "user-1" }, { userId: "user-2" }]);

      const result = await service.getAiUsageStats();

      expect(result.averageUsagePerUser).toBe(50); // 100 / 2
    });

    it("should return daily usage breakdown", async () => {
      mockPrismaService.aiUsage.aggregate.mockResolvedValue({
        _sum: { count: 25 },
      });
      mockPrismaService.aiUsage.findMany
        .mockResolvedValueOnce([
          { date: "2025-01-01", count: 10 },
          { date: "2025-01-02", count: 15 },
        ])
        .mockResolvedValueOnce([]);

      const result = await service.getAiUsageStats();

      expect(result.dailyUsage).toHaveLength(2);
      expect(result.dailyUsage[0].date).toBe("2025-01-01");
    });

    it("should handle zero usage", async () => {
      mockPrismaService.aiUsage.aggregate.mockResolvedValue({
        _sum: { count: null },
      });
      mockPrismaService.aiUsage.findMany.mockResolvedValue([]);

      const result = await service.getAiUsageStats();

      expect(result.totalUsage).toBe(0);
      expect(result.averageUsagePerUser).toBe(0);
    });
  });

  // ============================================
  // getAnalyticsTimeline()
  // ============================================
  describe("getAnalyticsTimeline()", () => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    beforeEach(() => {
      // Mock user groupBy for new users
      mockPrismaService.user.groupBy.mockResolvedValue([
        { createdAt: today, _count: { id: 5 } },
      ]);

      // Mock payment groupBy for revenue
      mockPrismaService.payment.groupBy.mockResolvedValue([
        { createdAt: today, _sum: { amount: 10000 }, _count: { id: 2 } },
      ]);

      // Mock subscription groupBy for new subs
      mockPrismaService.subscription.groupBy.mockResolvedValue([
        { createdAt: today, _count: { id: 3 } },
      ]);
    });

    it("should return timeline data for specified days", async () => {
      const result = await service.getAnalyticsTimeline(7);

      expect(result.timeline).toBeDefined();
      expect(result.timeline.length).toBe(8); // 7 days + today
      expect(result.summary).toBeDefined();
      expect(result.summary.period).toBe(7);
    });

    it("should return summary with totals", async () => {
      const result = await service.getAnalyticsTimeline(7);

      expect(result.summary.totalNewUsers).toBe(5);
      expect(result.summary.totalRevenue).toBe(10000);
      expect(result.summary.totalPayments).toBe(2);
      expect(result.summary.totalNewSubscriptions).toBe(3);
    });

    it("should include all timeline fields", async () => {
      const result = await service.getAnalyticsTimeline(7);

      const lastDay = result.timeline[result.timeline.length - 1];
      expect(lastDay).toHaveProperty("date");
      expect(lastDay).toHaveProperty("dau");
      expect(lastDay).toHaveProperty("newUsers");
      expect(lastDay).toHaveProperty("revenue");
      expect(lastDay).toHaveProperty("payments");
      expect(lastDay).toHaveProperty("newSubscriptions");
    });

    it("should handle empty data", async () => {
      mockPrismaService.user.groupBy.mockResolvedValue([]);
      mockPrismaService.payment.groupBy.mockResolvedValue([]);
      mockPrismaService.subscription.groupBy.mockResolvedValue([]);

      const result = await service.getAnalyticsTimeline(7);

      expect(result.summary.totalNewUsers).toBe(0);
      expect(result.summary.totalRevenue).toBe(0);
      expect(result.summary.totalPayments).toBe(0);
    });

    it("should default to 30 days", async () => {
      const result = await service.getAnalyticsTimeline();

      expect(result.timeline.length).toBe(31); // 30 days + today
      expect(result.summary.period).toBe(30);
    });
  });
});
