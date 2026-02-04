import { Test, TestingModule } from "@nestjs/testing";
import { SettingsController } from "./settings.controller";
import { SettingsService } from "./settings.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../../auth/guards/admin.guard";
import { ThrottlerGuard } from "@nestjs/throttler";

describe("SettingsController", () => {
  let controller: SettingsController;
  let settingsService: SettingsService;

  const mockSettingsService = {
    getAiSettings: jest.fn(),
    updateAiSettings: jest.fn(),
  };

  const mockAiSettings = {
    enabled: true,
    limits: {
      free: 5,
      course: 30,
      premium: 100,
      promptEngineering: 100,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [{ provide: SettingsService, useValue: mockSettingsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SettingsController>(SettingsController);
    settingsService = module.get<SettingsService>(SettingsService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getAiSettings", () => {
    it("should return AI settings", async () => {
      mockSettingsService.getAiSettings.mockResolvedValue(mockAiSettings);

      const result = await controller.getAiSettings();

      expect(result).toEqual(mockAiSettings);
      expect(mockSettingsService.getAiSettings).toHaveBeenCalled();
    });
  });

  describe("updateAiSettings", () => {
    it("should update and return AI settings", async () => {
      const updateDto = { enabled: false };
      const updatedSettings = { ...mockAiSettings, enabled: false };
      mockSettingsService.updateAiSettings.mockResolvedValue(updatedSettings);

      const mockRequest = { user: { userId: "admin-123" } };
      const result = await controller.updateAiSettings(
        updateDto,
        mockRequest as any,
      );

      expect(result).toEqual(updatedSettings);
      expect(mockSettingsService.updateAiSettings).toHaveBeenCalledWith(
        updateDto,
        "admin-123",
      );
    });

    it("should update limits", async () => {
      const updateDto = { limits: { free: 10 } };
      const updatedSettings = {
        ...mockAiSettings,
        limits: { ...mockAiSettings.limits, free: 10 },
      };
      mockSettingsService.updateAiSettings.mockResolvedValue(updatedSettings);

      const mockRequest = { user: { userId: "admin-456" } };
      const result = await controller.updateAiSettings(
        updateDto,
        mockRequest as any,
      );

      expect(result.limits.free).toBe(10);
      expect(mockSettingsService.updateAiSettings).toHaveBeenCalledWith(
        updateDto,
        "admin-456",
      );
    });

    it("should update both enabled and limits", async () => {
      const updateDto = {
        enabled: true,
        limits: { free: 15, course: 50, premium: 200, promptEngineering: 200 },
      };
      mockSettingsService.updateAiSettings.mockResolvedValue({
        enabled: true,
        limits: updateDto.limits,
      });

      const mockRequest = { user: { userId: "admin-789" } };
      const result = await controller.updateAiSettings(
        updateDto,
        mockRequest as any,
      );

      expect(result.enabled).toBe(true);
      expect(result.limits).toEqual(updateDto.limits);
    });
  });
});
