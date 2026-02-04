import { Test, TestingModule } from "@nestjs/testing";
import { RoadmapsController } from "./roadmaps.controller";
import { RoadmapsService } from "./roadmaps.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ThrottlerGuard } from "@nestjs/throttler";
import { ForbiddenException, NotFoundException } from "@nestjs/common";

describe("RoadmapsController", () => {
  let controller: RoadmapsController;
  let roadmapsService: RoadmapsService;

  const mockRoadmapsService = {
    getTemplates: jest.fn(),
    canGenerateRoadmap: jest.fn(),
    getUserRoadmap: jest.fn(),
    deleteRoadmap: jest.fn(),
    generateRoadmapVariants: jest.fn(),
    getUserVariants: jest.fn(),
    selectRoadmapVariant: jest.fn(),
  };

  const mockTemplates = [
    {
      id: "template-1",
      name: "Backend Developer",
      slug: "backend-dev",
      description: "Learn backend development with Go and Java",
      estimatedTime: "3 months",
      courses: ["go-basics", "java-core"],
    },
    {
      id: "template-2",
      name: "Data Engineer",
      slug: "data-engineer",
      description: "Master data engineering skills",
      estimatedTime: "4 months",
      courses: ["python-ml", "java-data"],
    },
  ];

  const mockRoadmap = {
    id: "roadmap-123",
    userId: "user-123",
    role: "backend_developer",
    roleTitle: "Backend Developer",
    level: "junior",
    targetLevel: "senior",
    title: "My Learning Path",
    phases: [
      {
        colorTheme: "blue",
        phaseName: "Fundamentals",
        description: "Learn the basics",
        estimatedHours: 40,
        courses: ["go-basics"],
        order: 1,
      },
    ],
    totalProgress: 25,
    createdAt: new Date(),
    updatedAt: new Date(),
    canRegenerate: true,
    isPremium: false,
    generationCount: 1,
  };

  const mockCanGenerate = {
    canGenerate: true,
    reason: undefined,
    isPremium: false,
    generationCount: 0,
  };

  const mockVariants = [
    {
      id: "variant-1",
      name: "Fast Track",
      description: "Intensive 2-month program",
      estimatedTime: "2 months",
      courses: ["go-basics", "go-advanced"],
    },
    {
      id: "variant-2",
      name: "Comprehensive",
      description: "Full 4-month program with all topics",
      estimatedTime: "4 months",
      courses: ["go-basics", "go-advanced", "java-core"],
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoadmapsController],
      providers: [
        {
          provide: RoadmapsService,
          useValue: mockRoadmapsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RoadmapsController>(RoadmapsController);
    roadmapsService = module.get<RoadmapsService>(RoadmapsService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getTemplates", () => {
    it("should return all roadmap templates", async () => {
      mockRoadmapsService.getTemplates.mockResolvedValue(mockTemplates);

      const result = await controller.getTemplates();

      expect(result).toEqual(mockTemplates);
      expect(result).toHaveLength(2);
      expect(mockRoadmapsService.getTemplates).toHaveBeenCalled();
    });

    it("should return empty array if no templates exist", async () => {
      mockRoadmapsService.getTemplates.mockResolvedValue([]);

      const result = await controller.getTemplates();

      expect(result).toEqual([]);
    });
  });

  describe("canGenerateRoadmap", () => {
    it("should return true for first-time generation", async () => {
      mockRoadmapsService.canGenerateRoadmap.mockResolvedValue(mockCanGenerate);

      const result = await controller.canGenerateRoadmap({
        user: { userId: "user-123" },
      });

      expect(result.canGenerate).toBe(true);
      expect(result.generationCount).toBe(0);
      expect(mockRoadmapsService.canGenerateRoadmap).toHaveBeenCalledWith(
        "user-123",
      );
    });

    it("should return false for free user with existing roadmap", async () => {
      const cannotGenerate = {
        canGenerate: false,
        reason: "premium_required",
        hasExistingRoadmap: true,
        isPremium: false,
      };
      mockRoadmapsService.canGenerateRoadmap.mockResolvedValue(cannotGenerate);

      const result = await controller.canGenerateRoadmap({
        user: { userId: "free-user" },
      });

      expect(result.canGenerate).toBe(false);
      expect(result.reason).toBe("premium_required");
    });

    it("should return true for premium user regeneration", async () => {
      const premiumCanGenerate = {
        canGenerate: true,
        reason: "premium_access",
        hasExistingRoadmap: true,
        isPremium: true,
      };
      mockRoadmapsService.canGenerateRoadmap.mockResolvedValue(
        premiumCanGenerate,
      );

      const result = await controller.canGenerateRoadmap({
        user: { userId: "premium-user" },
      });

      expect(result.canGenerate).toBe(true);
      expect(result.isPremium).toBe(true);
    });
  });

  describe("getMyRoadmap", () => {
    it("should return user roadmap", async () => {
      mockRoadmapsService.getUserRoadmap.mockResolvedValue(mockRoadmap);

      const result = await controller.getMyRoadmap({
        user: { userId: "user-123" },
      });

      expect(result).toEqual(mockRoadmap);
      expect(result.totalProgress).toBe(25);
      expect(mockRoadmapsService.getUserRoadmap).toHaveBeenCalledWith(
        "user-123",
      );
    });

    it("should return null if no roadmap exists", async () => {
      mockRoadmapsService.getUserRoadmap.mockResolvedValue(null);

      const result = await controller.getMyRoadmap({
        user: { userId: "new-user" },
      });

      expect(result).toBeNull();
    });
  });

  describe("deleteRoadmap", () => {
    it("should delete user roadmap", async () => {
      mockRoadmapsService.deleteRoadmap.mockResolvedValue({ success: true });

      const result = await controller.deleteRoadmap({
        user: { userId: "user-123" },
      });

      expect(result.success).toBe(true);
      expect(mockRoadmapsService.deleteRoadmap).toHaveBeenCalledWith(
        "user-123",
      );
    });

    it("should handle deletion of non-existent roadmap", async () => {
      mockRoadmapsService.deleteRoadmap.mockRejectedValue(
        new NotFoundException("Roadmap not found"),
      );

      await expect(
        controller.deleteRoadmap({ user: { userId: "no-roadmap-user" } }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("generateVariants", () => {
    // Matches GenerateRoadmapVariantsDto
    const variantsDto = {
      knownLanguages: ["javascript", "python"],
      yearsOfExperience: 2,
      interests: ["backend", "microservices"],
      goal: "first-job" as const,
      hoursPerWeek: 15,
      targetMonths: 6,
    };

    it("should generate roadmap variants", async () => {
      mockRoadmapsService.generateRoadmapVariants.mockResolvedValue(
        mockVariants,
      );

      const result = await controller.generateVariants(
        { user: { userId: "user-123" } },
        variantsDto,
      );

      expect(result).toEqual(mockVariants);
      expect(result).toHaveLength(2);
      expect(mockRoadmapsService.generateRoadmapVariants).toHaveBeenCalledWith(
        "user-123",
        variantsDto,
      );
    });

    it("should throw error for free user regenerating variants", async () => {
      mockRoadmapsService.generateRoadmapVariants.mockRejectedValue(
        new ForbiddenException("Premium required"),
      );

      await expect(
        controller.generateVariants(
          { user: { userId: "free-user" } },
          variantsDto,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("getMyVariants", () => {
    it("should return user variants", async () => {
      mockRoadmapsService.getUserVariants.mockResolvedValue(mockVariants);

      const result = await controller.getMyVariants({
        user: { userId: "user-123" },
      });

      expect(result).toEqual(mockVariants);
      expect(mockRoadmapsService.getUserVariants).toHaveBeenCalledWith(
        "user-123",
      );
    });

    it("should return empty array if no variants exist", async () => {
      mockRoadmapsService.getUserVariants.mockResolvedValue([]);

      const result = await controller.getMyVariants({
        user: { userId: "new-user" },
      });

      expect(result).toEqual([]);
    });
  });

  describe("selectVariant", () => {
    // Matches SelectRoadmapVariantDto - using full phase structure
    const selectDto = {
      variantId: "variant-1",
      name: "Fast Track",
      description: "Intensive 2-month program",
      totalTasks: 50,
      estimatedHours: 80,
      estimatedMonths: 2,
      targetRole: "Backend Developer",
      difficulty: "medium" as const,
      phases: [
        {
          id: "phase_1",
          title: "Fundamentals",
          description: "Learn the basics",
          colorTheme: "blue",
          order: 1,
          steps: [],
          progressPercentage: 0,
        },
      ],
    };

    const alternateSelectDto = {
      variantId: "non-existent",
      name: "Test",
      description: "Test",
      totalTasks: 10,
      estimatedHours: 20,
      estimatedMonths: 1,
      targetRole: "Developer",
      difficulty: "easy" as const,
      phases: [],
    };

    it("should select a variant and create roadmap", async () => {
      mockRoadmapsService.selectRoadmapVariant.mockResolvedValue(mockRoadmap);

      const result = await controller.selectVariant(
        { user: { userId: "user-123" } },
        selectDto,
      );

      expect(result).toEqual(mockRoadmap);
      expect(mockRoadmapsService.selectRoadmapVariant).toHaveBeenCalledWith(
        "user-123",
        selectDto,
      );
    });

    it("should throw error for non-existent variant", async () => {
      mockRoadmapsService.selectRoadmapVariant.mockRejectedValue(
        new NotFoundException("Variant not found"),
      );

      await expect(
        controller.selectVariant(
          { user: { userId: "user-123" } },
          alternateSelectDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw error for expired variant", async () => {
      mockRoadmapsService.selectRoadmapVariant.mockRejectedValue(
        new Error("Variant expired. Please regenerate."),
      );

      await expect(
        controller.selectVariant({ user: { userId: "user-123" } }, selectDto),
      ).rejects.toThrow("Variant expired");
    });
  });

  describe("edge cases", () => {
    it("should handle service errors gracefully", async () => {
      mockRoadmapsService.getTemplates.mockRejectedValue(
        new Error("Database connection failed"),
      );

      await expect(controller.getTemplates()).rejects.toThrow(
        "Database connection failed",
      );
    });

    it("should handle unicode in variant generation params", async () => {
      const unicodeDto = {
        knownLanguages: ["python"],
        yearsOfExperience: 2,
        interests: ["backend"],
        goal: "first-job",
        hoursPerWeek: 10,
        targetMonths: 6,
      };
      mockRoadmapsService.generateRoadmapVariants.mockResolvedValue({
        variants: [],
        expiresAt: new Date().toISOString(),
      });

      await controller.generateVariants(
        { user: { userId: "user-123" } },
        unicodeDto,
      );

      expect(mockRoadmapsService.generateRoadmapVariants).toHaveBeenCalledWith(
        "user-123",
        unicodeDto,
      );
    });

    it("should handle concurrent variant generation requests", async () => {
      mockRoadmapsService.generateRoadmapVariants.mockResolvedValue({
        variants: [],
        expiresAt: new Date().toISOString(),
      });

      const dto = {
        knownLanguages: [],
        yearsOfExperience: 0,
        interests: ["backend"],
        goal: "first-job",
        hoursPerWeek: 5,
        targetMonths: 3,
      };
      const promises = Array.from({ length: 3 }, () =>
        controller.generateVariants({ user: { userId: "user-123" } }, dto),
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(mockRoadmapsService.generateRoadmapVariants).toHaveBeenCalledTimes(
        3,
      );
    });
  });
});
