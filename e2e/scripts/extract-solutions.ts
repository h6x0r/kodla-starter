/**
 * Extract Solutions Script
 *
 * Extracts solution code from seed files for E2E testing.
 * Run from root: npm run e2e:extract-solutions
 *
 * Output: e2e/data/solutions.json (gitignored)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { ALL_COURSES } from '../prisma/seeds/courses/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TaskSolution {
  slug: string;
  courseSlug: string;
  moduleTitle: string;
  topicTitle: string;
  language: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isPremium: boolean;
  solutionCode: string;
  testCode?: string;
  taskType?: string;
}

interface Task {
  slug: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  isPremium: boolean;
  solutionCode: string;
  testCode?: string;
  taskType?: string;
}

interface Topic {
  title: string;
  tasks?: Task[];
}

interface Module {
  title: string;
  topics: Topic[];
}

interface Course {
  slug: string;
  title: string;
  modules: Module[];
}

/**
 * Detect programming language from task tags
 */
function detectLanguage(tags: string[]): string {
  const languageTags = ['python', 'go', 'java', 'javascript', 'typescript', 'c'];
  for (const tag of tags) {
    const lowerTag = tag.toLowerCase();
    if (languageTags.includes(lowerTag)) {
      return lowerTag;
    }
  }
  // Check for language-specific patterns in tags
  if (tags.some((t: string) => t.includes('py') || t.includes('ml'))) return 'python';
  if (tags.some((t: string) => t.includes('go'))) return 'go';
  if (tags.some((t: string) => t.includes('java'))) return 'java';
  if (tags.some((t: string) => t.includes('js') || t.includes('node'))) return 'javascript';

  return 'unknown';
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
        if (task.taskType === 'PROMPT') continue;

        tasks.push({
          slug: task.slug,
          courseSlug: course.slug,
          moduleTitle: module.title,
          topicTitle: topic.title,
          language: detectLanguage(task.tags),
          difficulty: task.difficulty,
          isPremium: task.isPremium,
          solutionCode: task.solutionCode,
          testCode: task.testCode,
          taskType: task.taskType || 'CODE',
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
  console.log('Extracting solutions from seed files...\n');

  const allTasks: TaskSolution[] = [];
  const stats = {
    courses: 0,
    tasks: 0,
    byLanguage: {} as Record<string, number>,
    byDifficulty: {} as Record<string, number>,
    premium: 0,
    free: 0,
  };

  for (const course of ALL_COURSES as Course[]) {
    const courseTasks = extractTasks(course);
    allTasks.push(...courseTasks);

    stats.courses++;
    stats.tasks += courseTasks.length;

    for (const task of courseTasks) {
      stats.byLanguage[task.language] = (stats.byLanguage[task.language] || 0) + 1;
      stats.byDifficulty[task.difficulty] = (stats.byDifficulty[task.difficulty] || 0) + 1;
      if (task.isPremium) stats.premium++;
      else stats.free++;
    }

    console.log(`  ${course.slug}: ${courseTasks.length} tasks`);
  }

  // Write output - ensure directory exists
  const outputDir = path.resolve(__dirname, '../data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, 'solutions.json');
  fs.writeFileSync(outputPath, JSON.stringify(allTasks, null, 2));

  // Print summary
  console.log('\n=== Extraction Complete ===');
  console.log(`Courses: ${stats.courses}`);
  console.log(`Total Tasks: ${stats.tasks}`);
  console.log('\nBy Language:');
  Object.entries(stats.byLanguage)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .forEach(([lang, count]) => console.log(`  ${lang}: ${count}`));
  console.log('\nBy Difficulty:');
  Object.entries(stats.byDifficulty).forEach(([diff, count]) => console.log(`  ${diff}: ${count}`));
  console.log(`\nPremium: ${stats.premium}, Free: ${stats.free}`);
  console.log(`\nOutput: ${outputPath}`);
}

main();
