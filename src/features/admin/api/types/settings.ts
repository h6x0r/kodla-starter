// AI Settings
export interface AiLimits {
  free: number;
  course: number;
  premium: number;
  promptEngineering: number;
}

export interface AiSettings {
  enabled: boolean;
  limits: AiLimits;
}

export interface UpdateAiSettingsDto {
  enabled?: boolean;
  limits?: Partial<AiLimits>;
}
