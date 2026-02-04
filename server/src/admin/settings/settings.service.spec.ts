import { Test, TestingModule } from "@nestjs/testing";
import {
  SettingsService,
  AiSettings,
  DEFAULT_AI_LIMITS,
} from "./settings.service";
import { PrismaService } from "../../prisma/prisma.service";
import { CacheService } from "../../cache/cache.service";

describe("SettingsService", () => {
  let service: SettingsService;

  const mockPrismaService = {
    platformSetting: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getAiSettings", () => {
    it("should return cached settings if available", async () => {
      const cachedSettings = {
        enabled: true,
        "limits.free": 10,
        "limits.course": 40,
      };
      mockCacheService.get.mockResolvedValue(cachedSettings);

      const result = await service.getAiSettings();

      expect(result.enabled).toBe(true);
      expect(result.limits.free).toBe(10);
      expect(mockCacheService.get).toHaveBeenCalledWith("settings:ai");
    });

    it("should return default settings when no DB records exist", async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockPrismaService.platformSetting.findMany.mockResolvedValue([]);

      const result = await service.getAiSettings();

      expect(result).toEqual({
        enabled: true,
        limits: DEFAULT_AI_LIMITS,
      });
    });

    it("should return settings from DB when not cached", async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockPrismaService.platformSetting.findMany.mockResolvedValue([
        { key: "enabled", value: "false" },
        { key: "limits.free", value: "15" },
        { key: "limits.course", value: "50" },
      ]);

      const result = await service.getAiSettings();

      expect(result.enabled).toBe(false);
      expect(result.limits.free).toBe(15);
      expect(result.limits.course).toBe(50);
      expect(result.limits.premium).toBe(DEFAULT_AI_LIMITS.premium);
    });

    it("should cache the result after fetching from DB", async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockPrismaService.platformSetting.findMany.mockResolvedValue([]);

      await service.getAiSettings();

      expect(mockCacheService.set).toHaveBeenCalled();
    });
  });

  describe("updateAiSettings", () => {
    beforeEach(() => {
      mockPrismaService.$transaction.mockImplementation((ops) =>
        Promise.all(ops),
      );
      mockPrismaService.platformSetting.upsert.mockResolvedValue({});
      mockCacheService.get.mockResolvedValue(null);
      mockPrismaService.platformSetting.findMany.mockResolvedValue([]);
    });

    it("should update enabled status", async () => {
      await service.updateAiSettings({ enabled: false }, "admin-123");

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(mockCacheService.delete).toHaveBeenCalledWith("settings:ai");
    });

    it("should update limits", async () => {
      await service.updateAiSettings(
        { limits: { free: 20, course: 60 } },
        "admin-123",
      );

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it("should invalidate cache after update", async () => {
      await service.updateAiSettings({ enabled: true }, "admin-123");

      expect(mockCacheService.delete).toHaveBeenCalledWith("settings:ai");
    });

    it("should return updated settings", async () => {
      const result = await service.updateAiSettings(
        { enabled: true },
        "admin-123",
      );

      expect(result).toHaveProperty("enabled");
      expect(result).toHaveProperty("limits");
    });
  });

  describe("getAiLimit", () => {
    it("should return correct limit for each tier", async () => {
      mockCacheService.get.mockResolvedValue({
        enabled: true,
        "limits.free": 5,
        "limits.course": 30,
        "limits.premium": 100,
        "limits.promptEngineering": 100,
      });

      expect(await service.getAiLimit("free")).toBe(5);
      expect(await service.getAiLimit("course")).toBe(30);
      expect(await service.getAiLimit("premium")).toBe(100);
      expect(await service.getAiLimit("promptEngineering")).toBe(100);
    });

    it("should return default limits when not in cache", async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockPrismaService.platformSetting.findMany.mockResolvedValue([]);

      const freeLimit = await service.getAiLimit("free");

      expect(freeLimit).toBe(DEFAULT_AI_LIMITS.free);
    });
  });

  describe("isAiEnabled", () => {
    it("should return true when AI is enabled", async () => {
      mockCacheService.get.mockResolvedValue({ enabled: true });

      const result = await service.isAiEnabled();

      expect(result).toBe(true);
    });

    it("should return false when AI is disabled", async () => {
      mockCacheService.get.mockResolvedValue({ enabled: false });

      const result = await service.isAiEnabled();

      expect(result).toBe(false);
    });

    it("should return true by default", async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockPrismaService.platformSetting.findMany.mockResolvedValue([]);

      const result = await service.isAiEnabled();

      expect(result).toBe(true);
    });
  });
});
