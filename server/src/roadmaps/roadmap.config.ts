/**
 * Roadmap Configuration
 * Centralized configuration for roadmap generation and display
 */

// Cache TTL for roadmap variants (24 hours)
export const VARIANTS_CACHE_TTL = 86400;

// Default salary ranges by experience level (USD)
const DEFAULT_SALARY_RANGES: Record<string, { min: number; max: number }> = {
  junior: { min: 800, max: 1500 },
  "junior-plus": { min: 1200, max: 2500 },
  middle: { min: 2000, max: 4000 },
  "middle-plus": { min: 3000, max: 5000 },
  senior: { min: 3500, max: 6000 },
  "senior-plus": { min: 5000, max: 8000 },
};

/**
 * Get salary ranges from env or use defaults
 * Env format: JSON string like {"junior":{"min":800,"max":1500},...}
 */
function getSalaryRanges(): Record<string, { min: number; max: number }> {
  const envValue = process.env.SALARY_RANGES;
  if (!envValue) {
    return DEFAULT_SALARY_RANGES;
  }

  try {
    const parsed = JSON.parse(envValue);
    // Validate structure
    for (const [key, value] of Object.entries(parsed)) {
      const range = value as { min?: number; max?: number };
      if (typeof range.min !== "number" || typeof range.max !== "number") {
        console.warn(`Invalid salary range for ${key}, using default`);
        return DEFAULT_SALARY_RANGES;
      }
    }
    return { ...DEFAULT_SALARY_RANGES, ...parsed };
  } catch (e) {
    console.warn("Failed to parse SALARY_RANGES env, using defaults:", e);
    return DEFAULT_SALARY_RANGES;
  }
}

// Salary ranges by experience level (USD) - loaded from env or defaults
export const SALARY_RANGES = getSalaryRanges();

// Course icons for UI display
export const COURSE_ICONS: Record<string, string> = {
  c_go_basics: "🐹",
  c_go_concurrency: "🐹",
  c_go_web_apis: "🐹",
  c_go_production: "🐹",
  c_go_design_patterns: "🐹",
  c_java_core: "☕",
  c_java_modern: "☕",
  c_java_advanced: "☕",
  c_java_design_patterns: "☕",
  c_python_ml_fundamentals: "🐍",
  c_python_deep_learning: "🐍",
  c_python_llm: "🐍",
  c_java_ml: "☕",
  c_java_nlp: "☕",
  c_go_ml_inference: "🐹",
  "software-engineering": "🏗️",
  "algo-fundamentals": "🧮",
  "algo-advanced": "🧮",
};

// Phase color palettes for UI (Tailwind gradient classes)
export const PHASE_PALETTES = [
  "from-cyan-400 to-blue-500",
  "from-emerald-400 to-green-500",
  "from-orange-400 to-red-500",
  "from-purple-400 to-indigo-500",
  "from-pink-400 to-rose-500",
  "from-amber-400 to-yellow-500",
  "from-teal-400 to-cyan-500",
  "from-fuchsia-400 to-purple-600",
];

// Default AI model for roadmap generation (can be overridden via env)
export const DEFAULT_AI_MODEL = "gemini-2.0-flash";
