/**
 * Extract Solutions Script
 *
 * Extracts solution code from seed files for E2E testing.
 * Run: cd server && npx ts-node prisma/extract-solutions.ts
 *
 * Output: ../e2e/data/solutions.json
 */

import * as fs from "fs";
import * as path from "path";
import { ALL_COURSES } from "./seeds/courses";
import { Course, Task } from "./seeds/types";

interface TaskSolution {
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
  description: string;
  hint1?: string;
  hint2?: string;
  whyItMatters?: string;
}

/**
 * Detect programming language from task tags and course slug
 */
function detectLanguage(tags: string[], courseSlug: string): string {
  const languageTags = [
    "python",
    "go",
    "java",
    "javascript",
    "typescript",
    "c",
  ];

  // 1. Check explicit language tags first
  for (const tag of tags) {
    const lowerTag = tag.toLowerCase();
    if (languageTags.includes(lowerTag)) {
      return lowerTag;
    }
  }

  // 2. Check for language-specific patterns in tags
  if (tags.some((t) => t.toLowerCase().includes("python"))) return "python";
  if (tags.some((t) => t.toLowerCase().includes("golang"))) return "go";

  // 3. Fallback: detect from course slug
  const courseLower = courseSlug.toLowerCase();
  if (courseLower.startsWith("python-") || courseLower.includes("-python"))
    return "python";
  if (courseLower.startsWith("go-") || courseLower.includes("-go")) return "go";
  if (courseLower.startsWith("java-") || courseLower.includes("-java"))
    return "java";
  if (courseLower.startsWith("js-") || courseLower.startsWith("javascript-"))
    return "javascript";
  if (courseLower.startsWith("ts-") || courseLower.startsWith("typescript-"))
    return "typescript";
  if (courseLower.startsWith("c_") || courseLower.startsWith("c-")) return "c";
  if (courseLower.includes("algo")) return "python"; // algo-fundamentals uses Python
  if (courseLower.includes("math-for-ds")) return "python"; // math-for-ds uses Python

  // 4. Last resort
  return "unknown";
}

/**
 * Flatten course hierarchy to extract all tasks
 */
function extractTasks(course: Course): TaskSolution[] {
  const tasks: TaskSolution[] = [];

  for (const module of course.modules) {
    for (const topic of module.topics) {
      if (!topic.tasks) continue;

      for (const task of topic.tasks) {
        // Skip PROMPT type tasks (they don't have runnable solution code)
        if (task.taskType === "PROMPT") continue;

        tasks.push({
          slug: task.slug,
          courseSlug: course.slug,
          moduleTitle: module.title,
          topicTitle: topic.title,
          language: detectLanguage(task.tags, course.slug),
          difficulty: task.difficulty,
          isPremium: task.isPremium,
          solutionCode: task.solutionCode,
          initialCode: task.initialCode,
          testCode: task.testCode,
          taskType: task.taskType || "CODE",
          title: task.title,
          description: task.description,
          hint1: task.hint1,
          hint2: task.hint2,
          whyItMatters: task.whyItMatters,
        });
      }
    }
  }

  return tasks;
}

/**
 * Main extraction function
 */
function main() {
  console.log("Extracting solutions from seed files...\n");

  const allTasks: TaskSolution[] = [];
  const stats = {
    courses: 0,
    tasks: 0,
    byLanguage: {} as Record<string, number>,
    byDifficulty: {} as Record<string, number>,
    premium: 0,
    free: 0,
  };

  for (const course of ALL_COURSES) {
    const courseTasks = extractTasks(course);
    allTasks.push(...courseTasks);

    stats.courses++;
    stats.tasks += courseTasks.length;

    for (const task of courseTasks) {
      stats.byLanguage[task.language] =
        (stats.byLanguage[task.language] || 0) + 1;
      stats.byDifficulty[task.difficulty] =
        (stats.byDifficulty[task.difficulty] || 0) + 1;
      if (task.isPremium) stats.premium++;
      else stats.free++;
    }

    console.log(`  ${course.slug}: ${courseTasks.length} tasks`);
  }

  // Write output - ensure directory exists
  const outputDir = path.resolve(__dirname, "../../e2e/data");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, "solutions.json");
  fs.writeFileSync(outputPath, JSON.stringify(allTasks, null, 2));

  // Print summary
  console.log("\n=== Extraction Complete ===");
  console.log(`Courses: ${stats.courses}`);
  console.log(`Total Tasks: ${stats.tasks}`);
  console.log("\nBy Language:");
  Object.entries(stats.byLanguage)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .forEach(([lang, count]) => console.log(`  ${lang}: ${count}`));
  console.log("\nBy Difficulty:");
  Object.entries(stats.byDifficulty).forEach(([diff, count]) =>
    console.log(`  ${diff}: ${count}`),
  );
  console.log(`\nPremium: ${stats.premium}, Free: ${stats.free}`);
  console.log(`\nOutput: ${outputPath}`);
}

main();
