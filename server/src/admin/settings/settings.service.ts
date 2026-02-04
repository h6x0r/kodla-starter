import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CacheService } from "../../cache/cache.service";

export interface AiLimits {
  free: number;
  course: number;
  premium: number;
  promptEngineering: number;
}

// Default AI limits (used if no setting exists)
export const DEFAULT_AI_LIMITS: AiLimits = {
  free: 5,
  course: 30,
  premium: 100,
  promptEngineering: 100,
};

const DEFAULT_AI_SETTINGS = {
  enabled: true,
  "limits.free": DEFAULT_AI_LIMITS.free,
  "limits.course": DEFAULT_AI_LIMITS.course,
  "limits.premium": DEFAULT_AI_LIMITS.premium,
  "limits.promptEngineering": DEFAULT_AI_LIMITS.promptEngineering,
};

// Cache TTL for settings (5 minutes)
const SETTINGS_CACHE_TTL = 300;

export interface AiSettings {
  enabled: boolean;
  limits: AiLimits;
}

export interface UpdateAiSettingsInput {
  enabled?: boolean;
  limits?: Partial<AiLimits>;
}

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  /**
   * Get cache key for settings category
   */
  private getCacheKey(category: string): string {
    return `settings:${category}`;
  }

  /**
   * Get all settings for a category
   */
  async getSettingsByCategory(
    category: string,
  ): Promise<Record<string, unknown>> {
    // Try cache first
    const cached = await this.cacheService.get<Record<string, unknown>>(
      this.getCacheKey(category),
    );
    if (cached) {
      return cached;
    }

    // Fetch from database
    const settings = await this.prisma.platformSetting.findMany({
      where: { category },
    });

    // Convert to key-value map
    const result: Record<string, unknown> = {};
    for (const setting of settings) {
      try {
        result[setting.key] = JSON.parse(setting.value);
      } catch {
        result[setting.key] = setting.value;
      }
    }

    // Cache the result
    await this.cacheService.set(
      this.getCacheKey(category),
      result,
      SETTINGS_CACHE_TTL,
    );

    return result;
  }

  /**
   * Get a single setting value
   */
  async getSetting<T>(
    category: string,
    key: string,
    defaultValue: T,
  ): Promise<T> {
    const settings = await this.getSettingsByCategory(category);
    return (settings[key] as T) ?? defaultValue;
  }

  /**
   * Update a single setting
   */
  async updateSetting(
    category: string,
    key: string,
    value: unknown,
    updatedBy?: string,
  ): Promise<void> {
    const serializedValue = JSON.stringify(value);

    await this.prisma.platformSetting.upsert({
      where: {
        category_key: { category, key },
      },
      create: {
        category,
        key,
        value: serializedValue,
        updatedBy,
      },
      update: {
        value: serializedValue,
        updatedBy,
      },
    });

    // Invalidate cache
    await this.cacheService.delete(this.getCacheKey(category));

    this.logger.log(
      `Setting updated: ${category}.${key} = ${serializedValue} by ${updatedBy || "system"}`,
    );
  }

  /**
   * Update multiple settings at once
   */
  async updateSettings(
    category: string,
    settings: Record<string, unknown>,
    updatedBy?: string,
  ): Promise<void> {
    const operations = Object.entries(settings).map(([key, value]) => {
      const serializedValue = JSON.stringify(value);
      return this.prisma.platformSetting.upsert({
        where: {
          category_key: { category, key },
        },
        create: {
          category,
          key,
          value: serializedValue,
          updatedBy,
        },
        update: {
          value: serializedValue,
          updatedBy,
        },
      });
    });

    await this.prisma.$transaction(operations);

    // Invalidate cache
    await this.cacheService.delete(this.getCacheKey(category));

    this.logger.log(
      `Settings updated for ${category}: ${Object.keys(settings).join(", ")} by ${updatedBy || "system"}`,
    );
  }

  // ============================================
  // AI-specific convenience methods
  // ============================================

  /**
   * Get AI settings with defaults
   */
  async getAiSettings(): Promise<AiSettings> {
    const settings = await this.getSettingsByCategory("ai");

    return {
      enabled: (settings["enabled"] as boolean) ?? DEFAULT_AI_SETTINGS.enabled,
      limits: {
        free:
          (settings["limits.free"] as number) ??
          DEFAULT_AI_SETTINGS["limits.free"],
        course:
          (settings["limits.course"] as number) ??
          DEFAULT_AI_SETTINGS["limits.course"],
        premium:
          (settings["limits.premium"] as number) ??
          DEFAULT_AI_SETTINGS["limits.premium"],
        promptEngineering:
          (settings["limits.promptEngineering"] as number) ??
          DEFAULT_AI_SETTINGS["limits.promptEngineering"],
      },
    };
  }

  /**
   * Update AI settings
   */
  async updateAiSettings(
    settings: UpdateAiSettingsInput,
    updatedBy?: string,
  ): Promise<AiSettings> {
    const updates: Record<string, unknown> = {};

    if (settings.enabled !== undefined) {
      updates["enabled"] = settings.enabled;
    }
    if (settings.limits) {
      if (settings.limits.free !== undefined) {
        updates["limits.free"] = settings.limits.free;
      }
      if (settings.limits.course !== undefined) {
        updates["limits.course"] = settings.limits.course;
      }
      if (settings.limits.premium !== undefined) {
        updates["limits.premium"] = settings.limits.premium;
      }
      if (settings.limits.promptEngineering !== undefined) {
        updates["limits.promptEngineering"] = settings.limits.promptEngineering;
      }
    }

    if (Object.keys(updates).length > 0) {
      await this.updateSettings("ai", updates, updatedBy);
    }

    return this.getAiSettings();
  }

  /**
   * Get AI limit for a specific tier
   */
  async getAiLimit(
    tier: "free" | "course" | "premium" | "promptEngineering",
  ): Promise<number> {
    const settings = await this.getAiSettings();
    return settings.limits[tier];
  }

  /**
   * Check if AI is enabled
   */
  async isAiEnabled(): Promise<boolean> {
    const settings = await this.getAiSettings();
    return settings.enabled;
  }
}
