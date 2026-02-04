import { api } from "@/lib/api";
import type { AiSettings, UpdateAiSettingsDto } from "../types";

export const adminSettingsService = {
  getAiSettings: async (): Promise<AiSettings> => {
    return await api.get<AiSettings>("/admin/settings/ai");
  },

  updateAiSettings: async (dto: UpdateAiSettingsDto): Promise<AiSettings> => {
    return await api.put<AiSettings>("/admin/settings/ai", dto);
  },
};
