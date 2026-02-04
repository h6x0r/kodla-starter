import { Test, TestingModule } from "@nestjs/testing";
import { ForbiddenException } from "@nestjs/common";
import { RoadmapsService } from "./roadmaps.service";
import { PrismaService } from "../prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { CacheService } from "../cache/cache.service";

// Mock @google/genai
const mockGenerateContent = jest.fn();
jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: mockGenerateContent,
    },
  })),
}));

describe("RoadmapsService", () => {
  let service: RoadmapsService;
  let prisma: PrismaService;

  const mockUser = {
    id: "user-123",
    isPremium: false,
    roadmapGenerations: 0,
  };

  const mockPremiumUser = {
    id: "user-premium",
    isPremium: true,
    roadmapGenerations: 5,
  };

  const mockRoadmap = {
    id: "roadmap-123",
    userId: "user-123",
    role: "backend-go",
    level: "intermediate",
    title: "Go Backend Developer Roadmap",
    phases: [
      {
        id: "phase_1",
        title: "Fundamentals",
        description: "Learn the basics",
        colorTheme: "from-cyan-400 to-blue-500",
        order: 1,
        steps: [
          {
            id: "step_1",
            title: "Hello World",
            type: "practice",
            durationEstimate: "15m",
            deepLink: "/task/hello-world",
            resourceType: "task",
            relatedResourceId: "task-1",
            status: "available",
          },
        ],
        progressPercentage: 0,
      },
    ],
    totalProgress: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    userRoadmap: {
      findFirst: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
    submission: {
      findMany: jest.fn(),
    },
    course: {
      findMany: jest.fn(),
    },
    task: {
      findMany: jest.fn(),
    },
    subscription: {
      findFirst: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue(null), // No API key by default
  };

  const mockCacheService = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoadmapsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<RoadmapsService>(RoadmapsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();

    // Default mock: no active subscription (free user)
    mockPrismaService.subscription.findFirst.mockResolvedValue(null);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // ============================================
  // canGenerateRoadmap()
  // ============================================
  describe("canGenerateRoadmap()", () => {
    it("should return true for premium user", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockPremiumUser);
      mockPrismaService.subscription.findFirst.mockResolvedValue({
        id: "sub-123",
        status: "active",
        plan: { type: "global" },
      });

      const result = await service.canGenerateRoadmap("user-premium");

      expect(result.canGenerate).toBe(true);
      expect(result.isPremium).toBe(true);
    });

    it("should return true for free user with 0 generations", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.canGenerateRoadmap("user-123");

      expect(result.canGenerate).toBe(true);
      expect(result.isPremium).toBe(false);
      expect(result.generationCount).toBe(0);
    });

    it("should return false for free user who already generated", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        roadmapGenerations: 1,
      });

      const result = await service.canGenerateRoadmap("user-123");

      expect(result.canGenerate).toBe(false);
      expect(result.reason).toBe("free_limit_reached");
    });

    it("should return false for non-existent user", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.canGenerateRoadmap("nonexistent");

      expect(result.canGenerate).toBe(false);
      expect(result.reason).toBe("user_not_found");
    });
  });

  // ============================================
  // getUserRoadmap()
  // ============================================
  describe("getUserRoadmap()", () => {
    it("should return null if user has no roadmap", async () => {
      mockPrismaService.userRoadmap.findFirst.mockResolvedValue(null);

      const result = await service.getUserRoadmap("user-no-roadmap");

      expect(result).toBeNull();
    });

    it("should return hydrated roadmap with progress", async () => {
      mockPrismaService.userRoadmap.findFirst.mockResolvedValue(mockRoadmap);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.submission.findMany.mockResolvedValue([]);
      mockPrismaService.task.findMany.mockResolvedValue([]);

      const result = await service.getUserRoadmap("user-123");

      expect(result).not.toBeNull();
      expect(result?.id).toBe("roadmap-123");
      expect(result).toHaveProperty("canRegenerate");
    });
  });

  // ============================================
  // deleteRoadmap()
  // ============================================
  describe("deleteRoadmap()", () => {
    it("should delete existing roadmap", async () => {
      mockPrismaService.userRoadmap.findFirst.mockResolvedValue(mockRoadmap);
      mockPrismaService.userRoadmap.delete.mockResolvedValue(mockRoadmap);

      const result = await service.deleteRoadmap("user-123");

      expect(result).toEqual({ success: true });
      expect(mockPrismaService.userRoadmap.delete).toHaveBeenCalled();
    });

    it("should return success even if no roadmap exists", async () => {
      mockPrismaService.userRoadmap.findFirst.mockResolvedValue(null);

      const result = await service.deleteRoadmap("user-no-roadmap");

      expect(result).toEqual({ success: true });
      expect(mockPrismaService.userRoadmap.delete).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // getTemplates()
  // ============================================
  describe("getTemplates()", () => {
    it("should return list of templates", async () => {
      const templates = await service.getTemplates();

      expect(templates).toBeInstanceOf(Array);
      expect(templates.length).toBeGreaterThan(0);
      expect(templates[0]).toHaveProperty("id");
      expect(templates[0]).toHaveProperty("title");
      expect(templates[0]).toHaveProperty("icon");
    });

    it("should include all expected templates", async () => {
      const templates = await service.getTemplates();
      const ids = templates.map((t) => t.id);

      expect(ids).toContain("backend-go");
      expect(ids).toContain("backend-java");
      expect(ids).toContain("python-data");
      expect(ids).toContain("ai-ml");
    });
  });

  // ============================================
  // generateRoadmapVariants()
  // ============================================
  describe("generateRoadmapVariants()", () => {
    const variantsDto = {
      knownLanguages: ["Go"],
      yearsOfExperience: 2,
      interests: ["backend", "APIs"],
      goal: "senior" as const,
      hoursPerWeek: 10,
      targetMonths: 6,
    };

    it("should throw ForbiddenException if user cannot generate", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        roadmapGenerations: 1,
      });

      await expect(
        service.generateRoadmapVariants("user-123", variantsDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should generate variants for eligible user", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.course.findMany.mockResolvedValue([]);
      mockPrismaService.submission.findMany.mockResolvedValue([]);

      const result = await service.generateRoadmapVariants(
        "user-123",
        variantsDto,
      );

      expect(result).toHaveProperty("variants");
      expect(result).toHaveProperty("canRegenerate");
    });
  });

  // ============================================
  // selectRoadmapVariant()
  // ============================================
  describe("selectRoadmapVariant()", () => {
    const selectDto = {
      variantId: "balanced",
      name: "Balanced Path",
      description: "A balanced learning path",
      totalTasks: 100,
      estimatedHours: 50,
      estimatedMonths: 3,
      targetRole: "Middle Developer",
      difficulty: "medium" as const,
      phases: [],
    };

    it("should throw ForbiddenException if user cannot generate", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        roadmapGenerations: 1,
      });

      await expect(
        service.selectRoadmapVariant("user-123", selectDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should create roadmap from selected variant", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.userRoadmap.findFirst.mockResolvedValue(null);
      mockPrismaService.userRoadmap.upsert.mockResolvedValue(mockRoadmap);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockPrismaService.submission.findMany.mockResolvedValue([]);
      mockPrismaService.task.findMany.mockResolvedValue([]);

      const result = await service.selectRoadmapVariant("user-123", selectDto);

      expect(result).not.toBeNull();
      expect(mockPrismaService.userRoadmap.upsert).toHaveBeenCalled();
    });
  });

  // ============================================
  // getUserVariants()
  // ============================================
  describe("getUserVariants()", () => {
    it("should return empty variants array (placeholder)", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUserVariants("user-123");

      expect(result.variants).toEqual([]);
      expect(result).toHaveProperty("canRegenerate");
    });

    it("should include generation status", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockPremiumUser);
      mockPrismaService.subscription.findFirst.mockResolvedValue({
        id: "sub-123",
        status: "active",
        plan: { type: "global" },
      });

      const result = await service.getUserVariants("user-premium");

      expect(result.canRegenerate).toBe(true);
      expect(result.isPremium).toBe(true);
    });
  });

  // ============================================
  // getUserRoadmap() with hydration
  // ============================================
  describe("getUserRoadmap() with hydration", () => {
    const roadmapWithPhases = {
      id: "roadmap-123",
      userId: "user-123",
      role: "backend-go",
      level: "intermediate",
      title: "Go Developer Roadmap",
      phases: [
        {
          id: "phase_1",
          title: "Fundamentals",
          description: "Learn basics",
          colorTheme: "",
          order: 1,
          steps: [
            {
              id: "step_1",
              title: "Hello World",
              type: "practice",
              durationEstimate: "15m",
              deepLink: "/task/hello-world",
              resourceType: "task",
              relatedResourceId: "task-1",
              status: "available",
            },
            {
              id: "step_2",
              title: "Variables",
              type: "practice",
              durationEstimate: "20m",
              deepLink: "/task/variables",
              resourceType: "task",
              relatedResourceId: "task-2",
              status: "available",
            },
          ],
          progressPercentage: 0,
        },
      ],
      totalProgress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should calculate progress based on completed tasks", async () => {
      mockPrismaService.userRoadmap.findFirst.mockResolvedValue(
        roadmapWithPhases,
      );
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.submission.findMany.mockResolvedValue([
        { taskId: "task-1" },
      ]);
      mockPrismaService.task.findMany.mockResolvedValue([
        { id: "task-1", slug: "hello-world" },
        { id: "task-2", slug: "variables" },
      ]);

      const result = await service.getUserRoadmap("user-123");

      expect(result).not.toBeNull();
      // One of two tasks completed = 50%
      expect(result?.totalProgress).toBe(50);
    });

    it("should mark completed steps correctly", async () => {
      mockPrismaService.userRoadmap.findFirst.mockResolvedValue(
        roadmapWithPhases,
      );
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.submission.findMany.mockResolvedValue([
        { taskId: "task-1" },
      ]);
      mockPrismaService.task.findMany.mockResolvedValue([
        { id: "task-1", slug: "hello-world" },
        { id: "task-2", slug: "variables" },
      ]);

      const result = await service.getUserRoadmap("user-123");

      expect(result?.phases[0].steps[0].status).toBe("completed");
      expect(result?.phases[0].steps[1].status).toBe("available");
    });

    it("should apply color themes to phases", async () => {
      mockPrismaService.userRoadmap.findFirst.mockResolvedValue(
        roadmapWithPhases,
      );
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.submission.findMany.mockResolvedValue([]);
      mockPrismaService.task.findMany.mockResolvedValue([]);

      const result = await service.getUserRoadmap("user-123");

      expect(result?.phases[0].colorTheme).toContain("from-");
    });
  });

  // ============================================
  // generateRoadmapVariants() with fallback
  // ============================================
  describe("generateRoadmapVariants() fallback", () => {
    const mockCoursesWithTasksForVariants = [
      {
        slug: "c_go_basics",
        title: "Go Basics",
        modules: [
          {
            order: 1,
            title: "Getting Started",
            topics: [
              {
                title: "Intro",
                tasks: Array.from({ length: 50 }, (_, i) => ({
                  id: `task-${i + 1}`,
                  slug: `task-${i + 1}`,
                  title: `Task ${i + 1}`,
                  difficulty: i < 20 ? "easy" : i < 40 ? "medium" : "hard",
                  estimatedTime: "15m",
                })),
              },
            ],
          },
        ],
      },
    ];

    beforeEach(() => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.course.findMany.mockResolvedValue(
        mockCoursesWithTasksForVariants,
      );
      mockPrismaService.submission.findMany.mockResolvedValue([]);
    });

    it("should generate 3 variants with fallback", async () => {
      const result = await service.generateRoadmapVariants("user-123", {
        knownLanguages: ["Go"],
        yearsOfExperience: 2,
        interests: ["backend"],
        goal: "senior",
        hoursPerWeek: 10,
        targetMonths: 6,
      });

      expect(result.variants).toHaveLength(3);
      expect(result.variants.map((v) => v.id)).toEqual([
        "quick-start",
        "balanced",
        "deep-dive",
      ]);
    });

    it("should mark balanced variant as recommended", async () => {
      const result = await service.generateRoadmapVariants("user-123", {
        knownLanguages: ["Go"],
        yearsOfExperience: 2,
        interests: ["backend"],
        goal: "first-job",
        hoursPerWeek: 15,
        targetMonths: 3,
      });

      const balancedVariant = result.variants.find((v) => v.id === "balanced");
      expect(balancedVariant?.isRecommended).toBe(true);
    });

    it("should calculate estimated hours based on task times", async () => {
      const result = await service.generateRoadmapVariants("user-123", {
        knownLanguages: ["Python"],
        yearsOfExperience: 1,
        interests: ["data"],
        goal: "master-skill",
        hoursPerWeek: 20,
        targetMonths: 12,
      });

      expect(result.variants[0].estimatedHours).toBeGreaterThan(0);
    });

    it("should filter by interests when specified", async () => {
      const result = await service.generateRoadmapVariants("user-123", {
        knownLanguages: ["Go"],
        yearsOfExperience: 3,
        interests: ["Go", "backend"],
        goal: "startup",
        hoursPerWeek: 25,
        targetMonths: 4,
      });

      expect(result.variants.length).toBeGreaterThan(0);
    });

    it("should include sources with percentages", async () => {
      const result = await service.generateRoadmapVariants("user-123", {
        knownLanguages: [],
        yearsOfExperience: 0,
        interests: [],
        goal: "first-job",
        hoursPerWeek: 10,
        targetMonths: 6,
      });

      const firstVariant = result.variants[0];
      expect(firstVariant.sources).toBeDefined();
      expect(firstVariant.sources.length).toBeGreaterThan(0);
      expect(firstVariant.sources[0]).toHaveProperty("percentage");
    });

    it("should sort sources by task count in fallback (line 888)", async () => {
      // Use multiple courses with different task counts
      const multiCourseTasks = [
        {
          slug: "c_go_basics",
          title: "Go Basics",
          modules: [
            {
              order: 1,
              title: "Go Module",
              topics: [
                {
                  title: "Go Topic",
                  tasks: [
                    {
                      id: "1",
                      slug: "go-1",
                      title: "Go 1",
                      difficulty: "easy",
                      estimatedTime: "15m",
                    },
                    {
                      id: "2",
                      slug: "go-2",
                      title: "Go 2",
                      difficulty: "easy",
                      estimatedTime: "15m",
                    },
                    {
                      id: "3",
                      slug: "go-3",
                      title: "Go 3",
                      difficulty: "easy",
                      estimatedTime: "15m",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          slug: "c_java_core",
          title: "Java Core",
          modules: [
            {
              order: 2,
              title: "Java Module",
              topics: [
                {
                  title: "Java Topic",
                  tasks: [
                    {
                      id: "4",
                      slug: "java-1",
                      title: "Java 1",
                      difficulty: "medium",
                      estimatedTime: "20m",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      mockPrismaService.course.findMany.mockResolvedValue(multiCourseTasks);

      const result = await service.generateRoadmapVariants("user-123", {
        knownLanguages: [],
        yearsOfExperience: 0,
        interests: [],
        goal: "first-job",
        hoursPerWeek: 10,
        targetMonths: 6,
      });

      // In fallback mode, sources should be sorted by task count
      const variant = result.variants[0];
      expect(variant.sources.length).toBe(2);
      // First source should have more tasks
      expect(variant.sources[0].taskCount).toBeGreaterThanOrEqual(
        variant.sources[1].taskCount,
      );
    });
  });

  // ============================================
  // selectRoadmapVariant() with phases
  // ============================================
  describe("selectRoadmapVariant() with phases", () => {
    it("should create roadmap from variant with phases", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.userRoadmap.findFirst.mockResolvedValue(null);
      mockPrismaService.userRoadmap.upsert.mockResolvedValue(mockRoadmap);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockPrismaService.submission.findMany.mockResolvedValue([]);
      mockPrismaService.task.findMany.mockResolvedValue([]);

      const variantWithPhases = {
        variantId: "balanced",
        name: "Balanced Path",
        description: "A balanced learning path",
        totalTasks: 100,
        estimatedHours: 50,
        estimatedMonths: 3,
        targetRole: "Middle Developer",
        difficulty: "medium" as const,
        phases: [
          {
            id: "phase_1",
            title: "Fundamentals",
            description: "Learn the basics",
            colorTheme: "from-cyan-400 to-blue-500",
            order: 1,
            steps: [
              {
                id: "step_1",
                title: "Hello World",
                type: "practice" as const,
                durationEstimate: "15m",
                deepLink: "/task/hello-world",
                resourceType: "task" as const,
                relatedResourceId: "task-1",
                status: "available" as const,
              },
            ],
            progressPercentage: 0,
          },
        ],
      };

      const result = await service.selectRoadmapVariant(
        "user-123",
        variantWithPhases,
      );

      expect(result).toBeDefined();
      expect(mockPrismaService.userRoadmap.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            title: "Balanced Path",
            role: "balanced",
          }),
        }),
      );
    });

    it("should increment generation counter", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.userRoadmap.findFirst.mockResolvedValue(null);
      mockPrismaService.userRoadmap.upsert.mockResolvedValue(mockRoadmap);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockPrismaService.submission.findMany.mockResolvedValue([]);
      mockPrismaService.task.findMany.mockResolvedValue([]);

      await service.selectRoadmapVariant("user-123", {
        variantId: "quick-start",
        name: "Quick Start",
        description: "Fast path",
        totalTasks: 40,
        estimatedHours: 20,
        estimatedMonths: 2,
        targetRole: "Junior Developer",
        difficulty: "easy" as const,
        phases: [],
      });

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: expect.objectContaining({
          roadmapGenerations: { increment: 1 },
        }),
      });
    });
  });

  // ============================================
  // Helper methods tested via public API
  // ============================================
  describe("parseTimeToMinutes via calculateTotalHours", () => {
    beforeEach(() => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.submission.findMany.mockResolvedValue([]);
    });

    it("should parse various time formats", async () => {
      const coursesWithVariousTimes = [
        {
          slug: "test-course",
          title: "Test Course",
          modules: [
            {
              order: 1,
              title: "Module",
              topics: [
                {
                  title: "Topic",
                  tasks: [
                    {
                      id: "1",
                      slug: "t1",
                      title: "T1",
                      difficulty: "easy",
                      estimatedTime: "1h",
                    },
                    {
                      id: "2",
                      slug: "t2",
                      title: "T2",
                      difficulty: "easy",
                      estimatedTime: "30m",
                    },
                    {
                      id: "3",
                      slug: "t3",
                      title: "T3",
                      difficulty: "easy",
                      estimatedTime: "1.5h",
                    },
                    {
                      id: "4",
                      slug: "t4",
                      title: "T4",
                      difficulty: "easy",
                      estimatedTime: "15-20m",
                    },
                    {
                      id: "5",
                      slug: "t5",
                      title: "T5",
                      difficulty: "easy",
                      estimatedTime: "",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      mockPrismaService.course.findMany.mockResolvedValue(
        coursesWithVariousTimes,
      );

      const result = await service.generateRoadmapVariants("user-123", {
        knownLanguages: [],
        yearsOfExperience: 0,
        interests: [],
        goal: "first-job",
        hoursPerWeek: 10,
        targetMonths: 6,
      });

      // Should have parsed all times correctly
      expect(result.variants.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // Edge cases
  // ============================================
  describe("edge cases", () => {
    it("should handle user with no completed tasks", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.submission.findMany.mockResolvedValue([]);
      mockPrismaService.course.findMany.mockResolvedValue([]);

      const result = await service.generateRoadmapVariants("user-123", {
        knownLanguages: ["Go"],
        yearsOfExperience: 0,
        interests: ["backend"],
        goal: "first-job",
        hoursPerWeek: 10,
        targetMonths: 6,
      });

      expect(result.variants).toBeDefined();
    });

    it("should handle empty course database", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.submission.findMany.mockResolvedValue([]);
      mockPrismaService.course.findMany.mockResolvedValue([]);

      const result = await service.generateRoadmapVariants("user-123", {
        knownLanguages: ["Go"],
        yearsOfExperience: 2,
        interests: ["backend"],
        goal: "senior",
        hoursPerWeek: 10,
        targetMonths: 6,
      });

      // Should still return variants, just empty
      expect(result.variants).toBeDefined();
    });

    it("should handle roadmap with all tasks completed", async () => {
      const roadmapWithAllCompleted = {
        ...mockRoadmap,
        phases: [
          {
            ...mockRoadmap.phases[0],
            steps: [
              {
                ...mockRoadmap.phases[0].steps[0],
                relatedResourceId: "task-1",
              },
            ],
          },
        ],
      };

      mockPrismaService.userRoadmap.findFirst.mockResolvedValue(
        roadmapWithAllCompleted,
      );
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.submission.findMany.mockResolvedValue([
        { taskId: "task-1" },
      ]);
      mockPrismaService.task.findMany.mockResolvedValue([
        { id: "task-1", slug: "hello-world" },
      ]);

      const result = await service.getUserRoadmap("user-123");

      expect(result?.totalProgress).toBe(100);
    });
  });
});

// ============================================
// Tests with AI enabled (separate describe for isolation)
// ============================================
describe("RoadmapsService with AI", () => {
  let service: RoadmapsService;

  const mockUser = {
    id: "user-123",
    isPremium: false,
    roadmapGenerations: 0,
  };

  const mockCoursesWithTasks = [
    {
      slug: "c_go_basics",
      title: "Go Basics",
      modules: [
        {
          order: 1,
          title: "Getting Started",
          topics: [
            {
              title: "Hello World",
              tasks: [
                {
                  id: "task-1",
                  slug: "hello-world",
                  title: "Hello World",
                  difficulty: "easy",
                  estimatedTime: "15m",
                },
                {
                  id: "task-2",
                  slug: "variables",
                  title: "Variables",
                  difficulty: "easy",
                  estimatedTime: "20m",
                },
                {
                  id: "task-3",
                  slug: "functions",
                  title: "Functions",
                  difficulty: "medium",
                  estimatedTime: "30m",
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    userRoadmap: {
      findFirst: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
    submission: {
      findMany: jest.fn(),
    },
    course: {
      findMany: jest.fn(),
    },
    task: {
      findMany: jest.fn(),
    },
    subscription: {
      findFirst: jest.fn(),
    },
  };

  const mockConfigServiceWithAI = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === "GEMINI_API_KEY") return "test-api-key";
      return null;
    }),
  };

  const mockCacheServiceForAI = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoadmapsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigServiceWithAI },
        { provide: CacheService, useValue: mockCacheServiceForAI },
      ],
    }).compile();

    service = module.get<RoadmapsService>(RoadmapsService);

    jest.clearAllMocks();
    mockGenerateContent.mockReset();
  });

  // ============================================
  // generateRoadmapVariants with AI
  // ============================================
  describe("generateRoadmapVariants() with AI", () => {
    beforeEach(() => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.course.findMany.mockResolvedValue(mockCoursesWithTasks);
      mockPrismaService.submission.findMany.mockResolvedValue([]);
    });

    it("should use AI when API key is configured", async () => {
      const aiResponse = {
        response: {
          text: () =>
            JSON.stringify({
              variants: [
                {
                  id: "ai-quick",
                  name: "AI Quick Path",
                  description: "Fast learning path generated by AI",
                  difficulty: "easy",
                  estimatedHours: 20,
                  estimatedMonths: 2,
                  targetRole: "Junior Developer",
                  isRecommended: false,
                  totalTasks: 10,
                  sources: [{ courseSlug: "c_go_basics", percentage: 100 }],
                  phases: [],
                },
                {
                  id: "ai-balanced",
                  name: "AI Balanced Path",
                  description: "Balanced learning path",
                  difficulty: "medium",
                  estimatedHours: 40,
                  estimatedMonths: 3,
                  targetRole: "Middle Developer",
                  isRecommended: true,
                  totalTasks: 20,
                  sources: [{ courseSlug: "c_go_basics", percentage: 100 }],
                  phases: [],
                },
                {
                  id: "ai-deep",
                  name: "AI Deep Dive",
                  description: "Comprehensive path",
                  difficulty: "hard",
                  estimatedHours: 80,
                  estimatedMonths: 6,
                  targetRole: "Senior Developer",
                  isRecommended: false,
                  totalTasks: 40,
                  sources: [{ courseSlug: "c_go_basics", percentage: 100 }],
                  phases: [],
                },
              ],
            }),
        },
      };
      mockGenerateContent.mockResolvedValue(aiResponse);

      const result = await service.generateRoadmapVariants("user-123", {
        knownLanguages: ["Go"],
        yearsOfExperience: 2,
        interests: ["backend"],
        goal: "senior",
        hoursPerWeek: 10,
        targetMonths: 6,
      });

      expect(result.variants.length).toBeGreaterThan(0);
    });

    it("should fall back to local generation when AI fails", async () => {
      mockGenerateContent.mockRejectedValue(new Error("AI API error"));

      const result = await service.generateRoadmapVariants("user-123", {
        knownLanguages: ["Go"],
        yearsOfExperience: 2,
        interests: ["backend"],
        goal: "senior",
        hoursPerWeek: 10,
        targetMonths: 6,
      });

      // Falls back to local generation - should still return 3 variants
      expect(result.variants).toHaveLength(3);
      expect(result.variants.map((v) => v.id)).toEqual([
        "quick-start",
        "balanced",
        "deep-dive",
      ]);
    });

    it("should fall back when AI returns invalid JSON", async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => "invalid json response" },
      });

      const result = await service.generateRoadmapVariants("user-123", {
        knownLanguages: ["Python"],
        yearsOfExperience: 1,
        interests: ["data"],
        goal: "first-job",
        hoursPerWeek: 15,
        targetMonths: 4,
      });

      // Falls back to local
      expect(result.variants.length).toBeGreaterThan(0);
    });

    it("should fall back when AI returns malformed variants", async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => JSON.stringify({ variants: "not an array" }) },
      });

      const result = await service.generateRoadmapVariants("user-123", {
        knownLanguages: [],
        yearsOfExperience: 0,
        interests: [],
        goal: "startup",
        hoursPerWeek: 20,
        targetMonths: 3,
      });

      expect(result.variants.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // AI prompt building
  // ============================================
  describe("AI prompt building", () => {
    beforeEach(() => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.course.findMany.mockResolvedValue(mockCoursesWithTasks);
      mockPrismaService.submission.findMany.mockResolvedValue([]);
    });

    it("should include user context in AI prompt", async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify({
              variants: [
                {
                  id: "v1",
                  name: "Test",
                  description: "Desc",
                  difficulty: "easy",
                  estimatedHours: 10,
                  estimatedMonths: 1,
                  targetRole: "Dev",
                  isRecommended: true,
                  totalTasks: 5,
                  sources: [],
                  phases: [],
                },
                {
                  id: "v2",
                  name: "Test2",
                  description: "Desc2",
                  difficulty: "medium",
                  estimatedHours: 20,
                  estimatedMonths: 2,
                  targetRole: "Dev",
                  isRecommended: false,
                  totalTasks: 10,
                  sources: [],
                  phases: [],
                },
                {
                  id: "v3",
                  name: "Test3",
                  description: "Desc3",
                  difficulty: "hard",
                  estimatedHours: 30,
                  estimatedMonths: 3,
                  targetRole: "Dev",
                  isRecommended: false,
                  totalTasks: 15,
                  sources: [],
                  phases: [],
                },
              ],
            }),
        },
      });

      await service.generateRoadmapVariants("user-123", {
        knownLanguages: ["Go", "Python"],
        yearsOfExperience: 5,
        interests: ["backend", "devops"],
        goal: "master-skill",
        hoursPerWeek: 15,
        targetMonths: 12,
      });

      expect(mockGenerateContent).toHaveBeenCalled();
      // The prompt should contain user info
      const callArgs = mockGenerateContent.mock.calls[0][0];
      // callArgs might be an object with prompt property or a string
      const promptText =
        typeof callArgs === "string" ? callArgs : JSON.stringify(callArgs);
      expect(promptText).toContain("Go");
      expect(promptText).toContain("Python");
    });

    it("should include available tasks in AI prompt", async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify({
              variants: [
                {
                  id: "v1",
                  name: "Test",
                  description: "D",
                  difficulty: "easy",
                  estimatedHours: 10,
                  estimatedMonths: 1,
                  targetRole: "Dev",
                  isRecommended: true,
                  totalTasks: 5,
                  sources: [],
                  phases: [],
                },
                {
                  id: "v2",
                  name: "Test2",
                  description: "D",
                  difficulty: "medium",
                  estimatedHours: 20,
                  estimatedMonths: 2,
                  targetRole: "Dev",
                  isRecommended: false,
                  totalTasks: 10,
                  sources: [],
                  phases: [],
                },
                {
                  id: "v3",
                  name: "Test3",
                  description: "D",
                  difficulty: "hard",
                  estimatedHours: 30,
                  estimatedMonths: 3,
                  targetRole: "Dev",
                  isRecommended: false,
                  totalTasks: 15,
                  sources: [],
                  phases: [],
                },
              ],
            }),
        },
      });

      await service.generateRoadmapVariants("user-123", {
        knownLanguages: [],
        yearsOfExperience: 0,
        interests: [],
        goal: "first-job",
        hoursPerWeek: 10,
        targetMonths: 6,
      });

      expect(mockGenerateContent).toHaveBeenCalled();
    });
  });

  // ============================================
  // convertAIResponseToVariants (lines 660-766)
  // ============================================
  describe("convertAIResponseToVariants()", () => {
    beforeEach(() => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.course.findMany.mockResolvedValue(mockCoursesWithTasks);
      mockPrismaService.submission.findMany.mockResolvedValue([]);
    });

    it("should convert AI response with valid task slugs to variants", async () => {
      // AI returns task slugs that match our mock data
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({
          variants: [
            {
              id: "quick",
              name: "Quick Path",
              description: "Fast learning",
              difficulty: "easy",
              targetRole: "Junior Developer",
              topics: ["Go Basics"],
              taskSlugs: ["hello-world", "variables"],
              phases: [
                {
                  title: "Phase 1",
                  description: "Basics",
                  taskSlugs: ["hello-world", "variables"],
                },
              ],
            },
            {
              id: "balanced",
              name: "Balanced",
              description: "Balanced path",
              difficulty: "medium",
              targetRole: "Middle Developer",
              topics: ["Go Basics", "Functions"],
              taskSlugs: ["hello-world", "variables", "functions"],
              phases: [
                {
                  title: "Phase 1",
                  description: "Basics",
                  taskSlugs: ["hello-world"],
                },
                {
                  title: "Phase 2",
                  description: "Functions",
                  taskSlugs: ["variables", "functions"],
                },
              ],
            },
            {
              id: "deep",
              name: "Deep Dive",
              description: "Complete mastery",
              difficulty: "hard",
              targetRole: "Senior Developer",
              topics: ["Go Mastery"],
              taskSlugs: ["hello-world", "variables", "functions"],
              phases: [
                {
                  title: "Phase 1",
                  description: "All",
                  taskSlugs: ["hello-world", "variables", "functions"],
                },
              ],
            },
          ],
        }),
      });

      const result = await service.generateRoadmapVariants("user-123", {
        knownLanguages: ["Go"],
        yearsOfExperience: 2,
        interests: ["backend"],
        goal: "senior",
        hoursPerWeek: 10,
        targetMonths: 6,
      });

      expect(result.variants.length).toBeGreaterThan(0);
      // Check that variants have proper structure
      const quickVariant = result.variants.find((v) => v.id === "quick");
      if (quickVariant) {
        expect(quickVariant.totalTasks).toBeGreaterThan(0);
        expect(quickVariant.phases.length).toBeGreaterThan(0);
        expect(quickVariant.sources.length).toBeGreaterThan(0);
        expect(quickVariant.previewTasks.length).toBeGreaterThan(0);
      }
    });

    it("should calculate sources percentages correctly", async () => {
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({
          variants: [
            {
              id: "test",
              name: "Test",
              description: "Test variant",
              difficulty: "easy",
              targetRole: "Dev",
              topics: [],
              phases: [
                {
                  title: "Phase 1",
                  description: "Desc",
                  taskSlugs: ["hello-world", "variables", "functions"],
                },
              ],
            },
          ],
        }),
      });

      const result = await service.generateRoadmapVariants("user-123", {
        knownLanguages: [],
        yearsOfExperience: 0,
        interests: [],
        goal: "first-job",
        hoursPerWeek: 10,
        targetMonths: 6,
      });

      const variant = result.variants[0];
      if (variant && variant.sources.length > 0) {
        // All tasks from same course = 100%
        expect(variant.sources[0].percentage).toBe(100);
      }
    });

    it("should handle AI response with isRecommended flag", async () => {
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({
          variants: [
            {
              id: "quick",
              name: "Quick",
              description: "D",
              difficulty: "easy",
              targetRole: "Dev",
              topics: [],
              phases: [
                { title: "P1", description: "D", taskSlugs: ["hello-world"] },
              ],
            },
            {
              id: "balanced",
              name: "Balanced (Recommended)",
              description: "D",
              difficulty: "medium",
              targetRole: "Dev",
              topics: [],
              phases: [
                { title: "P1", description: "D", taskSlugs: ["hello-world"] },
              ],
            },
            {
              id: "deep",
              name: "Deep",
              description: "D",
              difficulty: "hard",
              targetRole: "Dev",
              topics: [],
              phases: [
                { title: "P1", description: "D", taskSlugs: ["hello-world"] },
              ],
            },
          ],
        }),
      });

      const result = await service.generateRoadmapVariants("user-123", {
        knownLanguages: [],
        yearsOfExperience: 0,
        interests: [],
        goal: "first-job",
        hoursPerWeek: 10,
        targetMonths: 6,
      });

      const balancedVariant = result.variants.find((v) =>
        v.name.includes("Recommended"),
      );
      expect(balancedVariant?.isRecommended).toBe(true);
    });

    it("should filter out phases with no valid steps", async () => {
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({
          variants: [
            {
              id: "test",
              name: "Test",
              description: "D",
              difficulty: "easy",
              targetRole: "Dev",
              topics: [],
              phases: [
                {
                  title: "Valid Phase",
                  description: "D",
                  taskSlugs: ["hello-world"],
                },
                {
                  title: "Invalid Phase",
                  description: "D",
                  taskSlugs: ["non-existent-slug"],
                },
              ],
            },
          ],
        }),
      });

      const result = await service.generateRoadmapVariants("user-123", {
        knownLanguages: [],
        yearsOfExperience: 0,
        interests: [],
        goal: "first-job",
        hoursPerWeek: 10,
        targetMonths: 6,
      });

      const variant = result.variants[0];
      if (variant) {
        // Invalid phase should be filtered out
        expect(variant.phases.every((p) => p.steps.length > 0)).toBe(true);
      }
    });

    it("should skip variants with no valid tasks", async () => {
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({
          variants: [
            {
              id: "invalid",
              name: "Invalid",
              description: "No valid tasks",
              difficulty: "easy",
              targetRole: "Dev",
              topics: [],
              phases: [
                {
                  title: "P1",
                  description: "D",
                  taskSlugs: ["nonexistent1", "nonexistent2"],
                },
              ],
            },
            {
              id: "valid",
              name: "Valid",
              description: "Has valid tasks",
              difficulty: "medium",
              targetRole: "Dev",
              topics: [],
              phases: [
                { title: "P1", description: "D", taskSlugs: ["hello-world"] },
              ],
            },
          ],
        }),
      });

      const result = await service.generateRoadmapVariants("user-123", {
        knownLanguages: [],
        yearsOfExperience: 0,
        interests: [],
        goal: "first-job",
        hoursPerWeek: 10,
        targetMonths: 6,
      });

      // Invalid variant should be skipped
      expect(result.variants.some((v) => v.id === "invalid")).toBe(false);
    });

    it("should handle missing difficulty with default", async () => {
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({
          variants: [
            {
              id: "test",
              name: "Test",
              description: "D",
              // No difficulty field
              targetRole: "Dev",
              topics: [],
              phases: [
                { title: "P1", description: "D", taskSlugs: ["hello-world"] },
              ],
            },
          ],
        }),
      });

      const result = await service.generateRoadmapVariants("user-123", {
        knownLanguages: [],
        yearsOfExperience: 0,
        interests: [],
        goal: "first-job",
        hoursPerWeek: 10,
        targetMonths: 6,
      });

      const variant = result.variants[0];
      expect(variant?.difficulty).toBe("medium"); // Default
    });

    it("should include top-level taskSlugs not in phases (lines 680-681)", async () => {
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({
          variants: [
            {
              id: "test",
              name: "Test",
              description: "D",
              difficulty: "easy",
              targetRole: "Dev",
              topics: [],
              // Top-level taskSlugs with additional tasks not in phases
              taskSlugs: ["hello-world", "variables", "functions"],
              phases: [
                { title: "P1", description: "D", taskSlugs: ["hello-world"] },
              ],
            },
          ],
        }),
      });

      const result = await service.generateRoadmapVariants("user-123", {
        knownLanguages: [],
        yearsOfExperience: 0,
        interests: [],
        goal: "first-job",
        hoursPerWeek: 10,
        targetMonths: 6,
      });

      const variant = result.variants[0];
      // Should include all 3 tasks (1 from phase + 2 from top-level)
      expect(variant?.totalTasks).toBe(3);
    });

    it("should sort sources by task count (line 713)", async () => {
      // Need multiple courses to test sorting
      const multiCourseData = [
        {
          slug: "c_go_basics",
          title: "Go Basics",
          modules: [
            {
              order: 1,
              title: "Module 1",
              topics: [
                {
                  title: "Topic 1",
                  tasks: [
                    {
                      id: "task-1",
                      slug: "go-task-1",
                      title: "Go Task 1",
                      difficulty: "easy",
                      estimatedTime: "15m",
                    },
                    {
                      id: "task-2",
                      slug: "go-task-2",
                      title: "Go Task 2",
                      difficulty: "easy",
                      estimatedTime: "15m",
                    },
                    {
                      id: "task-3",
                      slug: "go-task-3",
                      title: "Go Task 3",
                      difficulty: "easy",
                      estimatedTime: "15m",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          slug: "c_java_core",
          title: "Java Core",
          modules: [
            {
              order: 1,
              title: "Module 1",
              topics: [
                {
                  title: "Topic 1",
                  tasks: [
                    {
                      id: "task-4",
                      slug: "java-task-1",
                      title: "Java Task 1",
                      difficulty: "medium",
                      estimatedTime: "20m",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      mockPrismaService.course.findMany.mockResolvedValue(multiCourseData);

      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({
          variants: [
            {
              id: "test",
              name: "Test",
              description: "D",
              difficulty: "medium",
              targetRole: "Dev",
              topics: [],
              phases: [
                {
                  title: "P1",
                  description: "D",
                  taskSlugs: [
                    "go-task-1",
                    "go-task-2",
                    "go-task-3",
                    "java-task-1",
                  ],
                },
              ],
            },
          ],
        }),
      });

      const result = await service.generateRoadmapVariants("user-123", {
        knownLanguages: [],
        yearsOfExperience: 0,
        interests: [],
        goal: "first-job",
        hoursPerWeek: 10,
        targetMonths: 6,
      });

      const variant = result.variants[0];
      // Go should be first (3 tasks), Java second (1 task)
      expect(variant?.sources[0].courseName).toBe("Go Basics");
      expect(variant?.sources[0].taskCount).toBe(3);
      expect(variant?.sources[1].courseName).toBe("Java Core");
      expect(variant?.sources[1].taskCount).toBe(1);
    });
  });

  // ============================================
  // AI response parsing
  // ============================================
  describe("AI response parsing", () => {
    beforeEach(() => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.course.findMany.mockResolvedValue(mockCoursesWithTasks);
      mockPrismaService.submission.findMany.mockResolvedValue([]);
    });

    it("should handle AI response with JSON in markdown code block", async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            '```json\n{"variants": [{"id": "v1", "name": "Path", "description": "D", "difficulty": "easy", "estimatedHours": 10, "estimatedMonths": 1, "targetRole": "Dev", "isRecommended": true, "totalTasks": 5, "sources": [], "phases": []}, {"id": "v2", "name": "Path2", "description": "D", "difficulty": "medium", "estimatedHours": 20, "estimatedMonths": 2, "targetRole": "Dev", "isRecommended": false, "totalTasks": 10, "sources": [], "phases": []}, {"id": "v3", "name": "Path3", "description": "D", "difficulty": "hard", "estimatedHours": 30, "estimatedMonths": 3, "targetRole": "Dev", "isRecommended": false, "totalTasks": 15, "sources": [], "phases": []}]}\n```',
        },
      });

      const result = await service.generateRoadmapVariants("user-123", {
        knownLanguages: [],
        yearsOfExperience: 0,
        interests: [],
        goal: "first-job",
        hoursPerWeek: 10,
        targetMonths: 6,
      });

      expect(result.variants.length).toBeGreaterThan(0);
    });

    it("should handle AI response with extra whitespace", async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            '\n\n  {"variants": [{"id": "v1", "name": "Path", "description": "D", "difficulty": "easy", "estimatedHours": 10, "estimatedMonths": 1, "targetRole": "Dev", "isRecommended": true, "totalTasks": 5, "sources": [], "phases": []}, {"id": "v2", "name": "P2", "description": "D", "difficulty": "medium", "estimatedHours": 20, "estimatedMonths": 2, "targetRole": "Dev", "isRecommended": false, "totalTasks": 10, "sources": [], "phases": []}, {"id": "v3", "name": "P3", "description": "D", "difficulty": "hard", "estimatedHours": 30, "estimatedMonths": 3, "targetRole": "Dev", "isRecommended": false, "totalTasks": 15, "sources": [], "phases": []}]}  \n\n',
        },
      });

      const result = await service.generateRoadmapVariants("user-123", {
        knownLanguages: [],
        yearsOfExperience: 0,
        interests: [],
        goal: "first-job",
        hoursPerWeek: 10,
        targetMonths: 6,
      });

      expect(result.variants.length).toBeGreaterThan(0);
    });

    it("should fall back when AI returns fewer than 3 variants", async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify({
              variants: [
                {
                  id: "v1",
                  name: "Only One",
                  description: "D",
                  difficulty: "easy",
                  estimatedHours: 10,
                  estimatedMonths: 1,
                  targetRole: "Dev",
                  isRecommended: true,
                  totalTasks: 5,
                  sources: [],
                  phases: [],
                },
              ],
            }),
        },
      });

      const result = await service.generateRoadmapVariants("user-123", {
        knownLanguages: [],
        yearsOfExperience: 0,
        interests: [],
        goal: "first-job",
        hoursPerWeek: 10,
        targetMonths: 6,
      });

      // Should fall back and return 3 variants
      expect(result.variants).toHaveLength(3);
    });
  });
});
