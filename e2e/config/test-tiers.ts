/**
 * E2E Test Tiers Configuration
 *
 * Defines different test tiers for various CI/CD scenarios.
 *
 * Usage:
 *   E2E_TIER=QUICK npm run e2e:test
 *   E2E_TIER=DAILY npm run e2e:test
 *   E2E_TIER=FULL npm run e2e:test
 */

export type TestTier = "QUICK" | "DAILY" | "FULL";

export interface TierConfig {
  name: TestTier;
  description: string;
  maxTasks: number;
  languages: string[];
  timeout: number; // Per-test timeout in ms
  workers: number; // Parallel workers
  retries: number; // Retry count on failure
  useCase: string;
}

/**
 * Test tier configurations
 */
export const TIER_CONFIGS: Record<TestTier, TierConfig> = {
  QUICK: {
    name: "QUICK",
    description: "Quick validation for PR checks",
    maxTasks: 20,
    languages: ["python", "go"], // Fastest languages
    timeout: 200_000, // Go 1.21+ on ARM needs ~180s
    workers: 2,
    retries: 1,
    useCase: "PR checks, pre-commit hooks (~10 min)",
  },

  DAILY: {
    name: "DAILY",
    description: "Extended validation for daily CI",
    maxTasks: 250,
    languages: ["python", "go", "java", "javascript", "typescript"],
    timeout: 200_000, // Go/Java need longer timeout on ARM
    workers: 4,
    retries: 2,
    useCase: "Daily CI runs, nightly builds (~1 hour)",
  },

  FULL: {
    name: "FULL",
    description: "Complete validation of all tasks",
    maxTasks: Infinity, // All tasks
    languages: ["python", "go", "java", "javascript", "typescript", "unknown"],
    timeout: 240_000, // Extended timeout for all languages
    workers: 4,
    retries: 2,
    useCase: "Weekly runs, release validation (~4-6 hours)",
  },
};

/**
 * Get current tier from environment variable
 */
export function getCurrentTier(): TestTier {
  const tier = process.env.E2E_TIER?.toUpperCase() as TestTier;
  if (tier && TIER_CONFIGS[tier]) {
    return tier;
  }
  return "QUICK"; // Default to QUICK for safety
}

/**
 * Get configuration for current tier
 */
export function getCurrentTierConfig(): TierConfig {
  return TIER_CONFIGS[getCurrentTier()];
}

/**
 * Check if language is enabled for current tier
 */
export function isLanguageEnabled(language: string): boolean {
  const config = getCurrentTierConfig();
  return config.languages.includes(language);
}

/**
 * Get max tasks for current tier
 */
export function getMaxTasks(): number {
  return getCurrentTierConfig().maxTasks;
}

/**
 * Print tier info for debugging
 */
export function printTierInfo(): void {
  const config = getCurrentTierConfig();
  console.log(`
=== E2E Test Tier: ${config.name} ===
Description: ${config.description}
Max Tasks: ${config.maxTasks === Infinity ? "All" : config.maxTasks}
Languages: ${config.languages.join(", ")}
Timeout: ${config.timeout}ms
Workers: ${config.workers}
Retries: ${config.retries}
Use Case: ${config.useCase}
`);
}

/**
 * Language-specific execution timeouts (for Submit mode - all 10 tests)
 * Note: Go/Java require longer timeout due to compilation overhead
 */
export const LANGUAGE_TIMEOUTS: Record<string, number> = {
  python: 30_000, // Python is fast, 30s for 10 tests
  go: 180_000, // Go compilation + 10 tests needs up to 3 min
  javascript: 20_000, // Node.js is fast
  typescript: 30_000, // TypeScript transpilation + Node.js
  java: 120_000, // Java/JVM compilation is slow, 2 min for 10 tests
  unknown: 60_000, // Default
};

/**
 * Get timeout for specific language
 */
export function getLanguageTimeout(language: string): number {
  return LANGUAGE_TIMEOUTS[language] || LANGUAGE_TIMEOUTS.unknown;
}
