/**
 * Solutions Fixture
 *
 * Provides access to task solutions for E2E tests.
 * Solutions are extracted from seed files at build time.
 */

import { test as base } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

export interface TaskSolution {
  slug: string;
  courseSlug: string;
  moduleTitle: string;
  topicTitle: string;
  language: string;
  difficulty: "easy" | "medium" | "hard";
  isPremium: boolean;
  solutionCode: string;
  initialCode: string;
  testCode?: string;
  taskType?: string;
  title: string;
  hint1?: string;
  hint2?: string;
  description: string;
  whyItMatters?: string;
}

/**
 * Load solutions from JSON file
 */
function loadSolutions(): TaskSolution[] {
  // Handle ESM __dirname equivalent
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const solutionsPath = path.join(__dirname, "../data/solutions.json");

  if (!fs.existsSync(solutionsPath)) {
    console.warn(
      "Solutions file not found. Run: npm run e2e:extract-solutions",
    );
    return [];
  }

  const data = fs.readFileSync(solutionsPath, "utf-8");
  return JSON.parse(data) as TaskSolution[];
}

/**
 * Solutions helper class
 */
export class SolutionsHelper {
  private solutions: TaskSolution[];

  constructor() {
    this.solutions = loadSolutions();
  }

  /**
   * Get all solutions
   */
  getAll(): TaskSolution[] {
    return this.solutions;
  }

  /**
   * Get solution by slug
   */
  getBySlug(slug: string): TaskSolution | undefined {
    return this.solutions.find((s) => s.slug === slug);
  }

  /**
   * Get solutions by language
   */
  getByLanguage(language: string): TaskSolution[] {
    return this.solutions.filter((s) => s.language === language);
  }

  /**
   * Get solutions by course
   */
  getByCourse(courseSlug: string): TaskSolution[] {
    return this.solutions.filter((s) => s.courseSlug === courseSlug);
  }

  /**
   * Get solutions by difficulty
   */
  getByDifficulty(difficulty: "easy" | "medium" | "hard"): TaskSolution[] {
    return this.solutions.filter((s) => s.difficulty === difficulty);
  }

  /**
   * Get free (non-premium) solutions
   */
  getFree(): TaskSolution[] {
    return this.solutions.filter((s) => !s.isPremium);
  }

  /**
   * Get premium solutions
   */
  getPremium(): TaskSolution[] {
    return this.solutions.filter((s) => s.isPremium);
  }

  /**
   * Get random sample of solutions
   */
  getSample(count: number, language?: string): TaskSolution[] {
    let pool = language ? this.getByLanguage(language) : this.solutions;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Get solutions for a specific tier
   */
  getForTier(
    tier: "QUICK" | "DAILY" | "FULL",
    languages?: string[],
  ): TaskSolution[] {
    let filtered = languages
      ? this.solutions.filter((s) => languages.includes(s.language))
      : this.solutions;

    switch (tier) {
      case "QUICK":
        // 20 tasks for PR checks
        return this.getSampleFromFiltered(filtered, 20);
      case "DAILY":
        // 250 tasks for daily CI
        return this.getSampleFromFiltered(filtered, 250);
      case "FULL":
        // All tasks
        return filtered;
      default:
        return filtered;
    }
  }

  private getSampleFromFiltered(
    filtered: TaskSolution[],
    count: number,
  ): TaskSolution[] {
    if (filtered.length <= count) return filtered;
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Get statistics
   */
  getStats(): {
    total: number;
    byLanguage: Record<string, number>;
    byDifficulty: Record<string, number>;
    premium: number;
    free: number;
  } {
    const stats = {
      total: this.solutions.length,
      byLanguage: {} as Record<string, number>,
      byDifficulty: {} as Record<string, number>,
      premium: 0,
      free: 0,
    };

    for (const s of this.solutions) {
      stats.byLanguage[s.language] = (stats.byLanguage[s.language] || 0) + 1;
      stats.byDifficulty[s.difficulty] =
        (stats.byDifficulty[s.difficulty] || 0) + 1;
      if (s.isPremium) stats.premium++;
      else stats.free++;
    }

    return stats;
  }
}

/**
 * Extended test fixture with solutions helper
 */
export const test = base.extend<{ solutions: SolutionsHelper }>({
  solutions: async ({}, use) => {
    const helper = new SolutionsHelper();
    await use(helper);
  },
});

export { expect } from "@playwright/test";
