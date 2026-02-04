import { Injectable, ForbiddenException, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { CacheService } from "../cache/cache.service";
import { UserRoadmap } from "@prisma/client";
import {
  GenerateRoadmapVariantsDto,
  SelectRoadmapVariantDto,
} from "./dto/roadmaps.dto";
import { GoogleGenAI } from "@google/genai";
import {
  VARIANTS_CACHE_TTL,
  SALARY_RANGES,
  COURSE_ICONS,
  PHASE_PALETTES,
  DEFAULT_AI_MODEL,
} from "./roadmap.config";

export interface RoadmapPhase {
  id: string;
  title: string;
  description: string;
  colorTheme: string;
  order: number;
  steps: RoadmapStep[];
  progressPercentage: number;
}

export interface RoadmapStep {
  id: string;
  title: string;
  type: "practice" | "video" | "project" | "reading";
  durationEstimate: string;
  deepLink: string;
  resourceType: "task" | "topic" | "module";
  relatedResourceId: string;
  status: "available" | "completed" | "locked";
}

interface TaskInfo {
  id: string;
  slug: string;
  title: string;
  difficulty: string;
  estimatedTime: string;
  topicTitle: string;
  moduleTitle: string;
}

// Extended task info with course data
interface TaskWithCourseInfo extends TaskInfo {
  courseSlug: string;
  courseTitle: string;
  courseIcon: string;
}

// Roadmap variant data structure (exported for controller return type)
export interface RoadmapVariantData {
  id: string;
  name: string;
  description: string;
  isRecommended: boolean;
  totalTasks: number;
  estimatedHours: number;
  estimatedMonths: number;
  salaryRange: { min: number; max: number };
  targetRole: string;
  difficulty: "easy" | "medium" | "hard";
  topics: string[];
  sources: {
    courseSlug: string;
    courseName: string;
    icon: string;
    taskCount: number;
    percentage: number;
  }[];
  previewTasks: {
    title: string;
    difficulty: string;
    fromCourse: string;
  }[];
  phases: RoadmapPhase[];
}

/**
 * AI response interfaces for type safety
 */
interface AIPhaseResponse {
  title: string;
  description: string;
  taskSlugs: string[];
}

interface AIVariantResponse {
  id?: string;
  name: string;
  description: string;
  isRecommended?: boolean;
  difficulty: "easy" | "medium" | "hard";
  targetRole: string;
  topics: string[];
  taskSlugs?: string[];
  phases?: AIPhaseResponse[];
}

interface AIVariantsResponse {
  variants: AIVariantResponse[];
}

interface AIPhasesResponse {
  phases: AIPhaseResponse[];
}

@Injectable()
export class RoadmapsService {
  private readonly logger = new Logger(RoadmapsService.name);
  private genAI: GoogleGenAI | null = null;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private cacheService: CacheService,
  ) {
    const apiKey =
      this.configService.get<string>("GEMINI_API_KEY") ||
      this.configService.get<string>("API_KEY");
    if (apiKey) {
      this.genAI = new GoogleGenAI({ apiKey });
    }
  }

  /**
   * Get cache key for user's roadmap variants
   */
  private getVariantsCacheKey(userId: string): string {
    return `roadmap:variants:${userId}`;
  }

  /**
   * Check if user can generate a new roadmap
   */
  async canGenerateRoadmap(userId: string): Promise<{
    canGenerate: boolean;
    reason?: string;
    isPremium: boolean;
    generationCount: number;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { roadmapGenerations: true },
    });

    if (!user) {
      return {
        canGenerate: false,
        reason: "user_not_found",
        isPremium: false,
        generationCount: 0,
      };
    }

    // Compute isPremium from active subscriptions (not cached field)
    const activeSubscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: "active",
        endDate: { gt: new Date() },
      },
    });
    const isPremium = !!activeSubscription;

    // Premium users have unlimited generations
    if (isPremium) {
      return {
        canGenerate: true,
        isPremium: true,
        generationCount: user.roadmapGenerations,
      };
    }

    // Free users get 1 free generation
    if (user.roadmapGenerations === 0) {
      return { canGenerate: true, isPremium: false, generationCount: 0 };
    }

    return {
      canGenerate: false,
      reason: "free_limit_reached",
      isPremium: false,
      generationCount: user.roadmapGenerations,
    };
  }

  /**
   * Get user's active roadmap
   */
  async getUserRoadmap(userId: string) {
    const roadmap = await this.prisma.userRoadmap.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    if (!roadmap) {
      return null;
    }

    // Get generation status
    const canGenStatus = await this.canGenerateRoadmap(userId);

    // Hydrate with user progress
    const hydratedRoadmap = await this.hydrateRoadmap(roadmap, userId);

    return {
      ...hydratedRoadmap,
      canRegenerate: canGenStatus.canGenerate,
      isPremium: canGenStatus.isPremium,
      generationCount: canGenStatus.generationCount,
    };
  }

  /**
   * Delete user's roadmap
   */
  async deleteRoadmap(userId: string) {
    const roadmap = await this.prisma.userRoadmap.findFirst({
      where: { userId },
    });

    if (roadmap) {
      await this.prisma.userRoadmap.delete({
        where: { id: roadmap.id },
      });
    }

    // Clear cached variants when roadmap is deleted
    await this.clearUserVariants(userId);

    return { success: true };
  }

  /**
   * Get all available roadmap templates
   */
  async getTemplates() {
    return [
      {
        id: "backend-go",
        title: "Go Backend",
        description: "APIs, microservices, concurrency",
        icon: "🐹",
        gradient: "from-cyan-400 to-blue-500",
      },
      {
        id: "backend-java",
        title: "Java Backend",
        description: "Enterprise, Spring, production",
        icon: "☕",
        gradient: "from-orange-400 to-red-500",
      },
      {
        id: "python-data",
        title: "Python & Data",
        description: "ML basics, data analysis, algorithms",
        icon: "🐍",
        gradient: "from-green-400 to-emerald-500",
      },
      {
        id: "ai-ml",
        title: "AI & Machine Learning",
        description: "Deep learning, LLMs, inference",
        icon: "🤖",
        gradient: "from-purple-400 to-pink-500",
      },
      {
        id: "software-design",
        title: "Software Design",
        description: "SOLID, patterns, architecture",
        icon: "🏗️",
        gradient: "from-amber-400 to-orange-500",
      },
      {
        id: "algorithms",
        title: "Algorithms & DS",
        description: "Problem solving, interviews",
        icon: "🧮",
        gradient: "from-indigo-400 to-purple-500",
      },
      {
        id: "fullstack",
        title: "Fullstack",
        description: "Combined frontend + backend",
        icon: "🌐",
        gradient: "from-teal-400 to-cyan-500",
      },
    ];
  }

  // ============================================================================
  // NEW: Generate Multiple Roadmap Variants (v2 API)
  // ============================================================================

  /**
   * Generate 3-5 roadmap variants based on user preferences
   */
  async generateRoadmapVariants(
    userId: string,
    dto: GenerateRoadmapVariantsDto,
  ) {
    // Check if user can generate
    const canGenStatus = await this.canGenerateRoadmap(userId);

    if (!canGenStatus.canGenerate) {
      throw new ForbiddenException(
        "Regeneration requires Premium subscription. Upgrade to create unlimited personalized roadmaps.",
      );
    }

    // Get all tasks from database with course info
    const allTasksWithCourses = await this.getAllTasksWithCourseInfo();

    // Get user's completed tasks
    const completedTaskIds = await this.getUserCompletedTasks(userId);

    // Filter out completed tasks
    const availableTasks = allTasksWithCourses.filter(
      (t) => !completedTaskIds.has(t.id),
    );

    // Generate variants using AI or fallback
    let variants: RoadmapVariantData[];

    if (this.genAI && availableTasks.length > 0) {
      try {
        variants = await this.generateVariantsWithAI(dto, availableTasks);
      } catch (error) {
        this.logger.warn("AI variant generation failed, using fallback", error);
        variants = this.generateVariantsFallback(dto, availableTasks);
      }
    } else {
      variants = this.generateVariantsFallback(dto, availableTasks);
    }

    // Store variants in Redis cache (24h TTL) for retrieval
    await this.cacheService.set(
      this.getVariantsCacheKey(userId),
      variants,
      VARIANTS_CACHE_TTL,
    );
    this.logger.log(`Cached ${variants.length} variants for user ${userId}`);

    return {
      variants,
      canRegenerate: canGenStatus.canGenerate,
      isPremium: canGenStatus.isPremium,
      generationCount: canGenStatus.generationCount,
    };
  }

  /**
   * Select a variant and create the actual roadmap
   * Variant data is sent from frontend (phases are included in DTO)
   */
  async selectRoadmapVariant(userId: string, dto: SelectRoadmapVariantDto) {
    // Check if user can generate
    const canGenStatus = await this.canGenerateRoadmap(userId);

    if (!canGenStatus.canGenerate) {
      throw new ForbiddenException(
        "Regeneration requires Premium subscription.",
      );
    }

    // Create phases from DTO
    const phases: RoadmapPhase[] = dto.phases || [];

    // Create or update user roadmap
    const roadmap = await this.prisma.userRoadmap.upsert({
      where: {
        id: (await this.findExistingRoadmapId(userId)) || "new",
      },
      create: {
        userId,
        role: dto.variantId,
        level: dto.difficulty,
        title: dto.name,
        phases: phases as unknown as any,
        totalProgress: 0,
      },
      update: {
        role: dto.variantId,
        level: dto.difficulty,
        title: dto.name,
        phases: phases as unknown as any,
        totalProgress: 0,
        updatedAt: new Date(),
      },
    });

    // Increment generation counter
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        roadmapGenerations: { increment: 1 },
        lastRoadmapGeneration: new Date(),
      },
    });

    // Clear cached variants after selection
    await this.clearUserVariants(userId);

    const hydratedRoadmap = await this.hydrateRoadmap(roadmap, userId);
    const newStatus = await this.canGenerateRoadmap(userId);

    return {
      ...hydratedRoadmap,
      canRegenerate: newStatus.canGenerate,
      isPremium: newStatus.isPremium,
      generationCount: newStatus.generationCount,
    };
  }

  /**
   * Get user's saved variants from Redis cache
   * Variants are stored for 24 hours after generation
   */
  async getUserVariants(userId: string) {
    const canGenStatus = await this.canGenerateRoadmap(userId);

    // Try to get cached variants
    const cachedVariants = await this.cacheService.get<RoadmapVariantData[]>(
      this.getVariantsCacheKey(userId),
    );

    return {
      variants: cachedVariants || [],
      canRegenerate: canGenStatus.canGenerate,
      isPremium: canGenStatus.isPremium,
      generationCount: canGenStatus.generationCount,
    };
  }

  /**
   * Clear user's cached variants (called after variant selection or roadmap deletion)
   */
  async clearUserVariants(userId: string): Promise<void> {
    await this.cacheService.delete(this.getVariantsCacheKey(userId));
    this.logger.log(`Cleared cached variants for user ${userId}`);
  }

  /**
   * Get all tasks with course information
   */
  private async getAllTasksWithCourseInfo(): Promise<TaskWithCourseInfo[]> {
    const courses = await this.prisma.course.findMany({
      include: {
        modules: {
          include: {
            topics: {
              include: {
                tasks: {
                  select: {
                    id: true,
                    slug: true,
                    title: true,
                    difficulty: true,
                    estimatedTime: true,
                  },
                },
              },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    const tasks: TaskWithCourseInfo[] = [];

    for (const course of courses) {
      for (const module of course.modules) {
        for (const topic of module.topics) {
          for (const task of topic.tasks) {
            tasks.push({
              id: task.id,
              slug: task.slug,
              title: task.title,
              difficulty: task.difficulty,
              estimatedTime: task.estimatedTime,
              topicTitle: topic.title,
              moduleTitle: module.title,
              courseSlug: course.slug,
              courseTitle: course.title,
              courseIcon: COURSE_ICONS[course.slug] || "📚",
            });
          }
        }
      }
    }

    return tasks;
  }

  /**
   * Generate variants using AI
   */
  private async generateVariantsWithAI(
    dto: GenerateRoadmapVariantsDto,
    tasks: TaskWithCourseInfo[],
  ): Promise<RoadmapVariantData[]> {
    const prompt = this.buildVariantsPrompt(dto, tasks);

    const aiModel =
      this.configService.get<string>("AI_MODEL_NAME") || DEFAULT_AI_MODEL;
    const response = await this.genAI!.models.generateContent({
      model: aiModel,
      contents: prompt,
    });

    const text = response.text || "";

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON in AI response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Create task lookup map
    const taskMap = new Map(tasks.map((t) => [t.slug, t]));

    // Convert AI response to variants
    return this.convertAIResponseToVariants(parsed, taskMap, dto);
  }

  /**
   * Build prompt for generating multiple variants
   */
  private buildVariantsPrompt(
    dto: GenerateRoadmapVariantsDto,
    tasks: TaskWithCourseInfo[],
  ): string {
    const goalDescriptions: Record<string, string> = {
      "first-job":
        "Looking for first IT job, needs interview prep and portfolio",
      senior:
        "Wants promotion to senior/lead, needs architecture and best practices",
      startup: "Building a startup/product, needs full-stack and MVP skills",
      "master-skill": "Deep expertise in specific technology",
    };

    // Sample tasks (max 300 for context)
    const sampledTasks = tasks.slice(0, 300);

    // Group tasks by course for context
    const courseGroups = new Map<string, number>();
    for (const task of tasks) {
      courseGroups.set(
        task.courseTitle,
        (courseGroups.get(task.courseTitle) || 0) + 1,
      );
    }

    return `
You are creating personalized learning roadmap VARIANTS for a developer.

USER PROFILE:
- Known Languages: ${dto.knownLanguages.join(", ") || "None specified"}
- Years of Experience: ${dto.yearsOfExperience}
- Interested Areas: ${dto.interests.join(", ")}
- Main Goal: ${dto.goal} (${goalDescriptions[dto.goal] || dto.goal})
- Available Time: ${dto.hoursPerWeek} hours/week
- Target Timeline: ${dto.targetMonths} months

AVAILABLE COURSES (${courseGroups.size} courses, ${tasks.length} total tasks):
${Array.from(courseGroups.entries())
  .map(([name, count]) => `- ${name}: ${count} tasks`)
  .join("\n")}

SAMPLE TASKS (${sampledTasks.length} of ${tasks.length}):
${sampledTasks.map((t) => `- ${t.slug}: "${t.title}" [${t.difficulty}] (${t.estimatedTime}) from ${t.courseTitle}`).join("\n")}

Generate 3-5 DIFFERENT roadmap variants. Each variant should be a distinct learning path:

1. "Quick Start" - Minimal path to achieve goal fast (fewer tasks, essential only)
2. "Balanced" - Recommended path with good coverage (medium tasks)
3. "Deep Dive" - Comprehensive path for thorough learning (more tasks)
4. (Optional) "Specialized" - Focus on specific area from interests
5. (Optional) "Interview Ready" - If goal is job, focus on interview topics

Each variant should:
- Mix tasks from DIFFERENT courses based on interests
- Order tasks by logical progression (fundamentals → advanced)
- Consider user's experience level
- Estimate realistic completion time

Return ONLY valid JSON (no markdown):
{
  "variants": [
    {
      "id": "quick-start",
      "name": "Quick Start",
      "description": "Fast track to your goal - essential skills only",
      "targetRole": "Junior Go Developer",
      "difficulty": "easy",
      "taskSlugs": ["task-slug-1", "task-slug-2", ...],
      "topics": ["Go Basics", "REST APIs", "SQL Fundamentals"],
      "phases": [
        {
          "title": "Phase 1: Foundations",
          "description": "Core language fundamentals",
          "taskSlugs": ["slug1", "slug2"]
        }
      ]
    }
  ]
}

IMPORTANT:
- Use EXACT task slugs from the list above
- Each variant should have 3-6 phases
- Quick variant: 30-60 tasks, Balanced: 80-150, Deep: 150-250
- Ensure good variety - don't repeat the same tasks in different variants
`;
  }

  /**
   * Convert AI response to structured variants
   */
  private convertAIResponseToVariants(
    parsed: AIVariantsResponse,
    taskMap: Map<string, TaskWithCourseInfo>,
    dto: GenerateRoadmapVariantsDto,
  ): RoadmapVariantData[] {
    const variants: RoadmapVariantData[] = [];

    for (const variant of parsed.variants || []) {
      // Collect all tasks for this variant
      const variantTasks: TaskWithCourseInfo[] = [];
      const allTaskSlugs = new Set<string>();

      // Gather task slugs from phases
      for (const phase of variant.phases || []) {
        for (const slug of phase.taskSlugs || []) {
          if (taskMap.has(slug) && !allTaskSlugs.has(slug)) {
            variantTasks.push(taskMap.get(slug)!);
            allTaskSlugs.add(slug);
          }
        }
      }

      // Also check top-level taskSlugs
      for (const slug of variant.taskSlugs || []) {
        if (taskMap.has(slug) && !allTaskSlugs.has(slug)) {
          variantTasks.push(taskMap.get(slug)!);
          allTaskSlugs.add(slug);
        }
      }

      if (variantTasks.length === 0) continue;

      // Calculate metrics
      const totalTasks = variantTasks.length;
      const estimatedHours = this.calculateTotalHours(variantTasks);
      const estimatedMonths = Math.ceil(
        estimatedHours / (dto.hoursPerWeek * 4),
      );

      // Determine salary range based on difficulty
      const salaryKey =
        variant.difficulty === "easy"
          ? "junior-plus"
          : variant.difficulty === "hard"
            ? "senior"
            : "middle";
      const salaryRange = SALARY_RANGES[salaryKey] || SALARY_RANGES["middle"];

      // Calculate sources (which courses contribute)
      const sourceMap = new Map<
        string,
        { count: number; title: string; icon: string }
      >();
      for (const task of variantTasks) {
        const existing = sourceMap.get(task.courseSlug) || {
          count: 0,
          title: task.courseTitle,
          icon: task.courseIcon,
        };
        existing.count++;
        sourceMap.set(task.courseSlug, existing);
      }

      const sources = Array.from(sourceMap.entries())
        .map(([slug, data]) => ({
          courseSlug: slug,
          courseName: data.title,
          icon: data.icon,
          taskCount: data.count,
          percentage: Math.round((data.count / totalTasks) * 100),
        }))
        .sort((a, b) => b.taskCount - a.taskCount);

      // Build phases
      const phases: RoadmapPhase[] = (variant.phases || [])
        .map((phase: AIPhaseResponse, index: number) => {
          const phaseTasks = (phase.taskSlugs || [])
            .map((slug: string) => taskMap.get(slug))
            .filter(Boolean) as TaskWithCourseInfo[];

          return {
            id: `phase_${index + 1}`,
            title: phase.title,
            description: phase.description,
            colorTheme: PHASE_PALETTES[index % PHASE_PALETTES.length],
            order: index + 1,
            steps: phaseTasks.map((task) => ({
              id: `step_${task.id}`,
              title: task.title,
              type: "practice" as const,
              durationEstimate: task.estimatedTime,
              deepLink: `/task/${task.slug}`,
              resourceType: "task" as const,
              relatedResourceId: task.id,
              status: "available" as const,
            })),
            progressPercentage: 0,
          };
        })
        .filter((p: RoadmapPhase) => p.steps.length > 0);

      // Preview tasks (first 5)
      const previewTasks = variantTasks.slice(0, 5).map((t) => ({
        title: t.title,
        difficulty: t.difficulty,
        fromCourse: t.courseTitle,
      }));

      const variantId = variant.id || `variant_${variants.length + 1}`;
      variants.push({
        id: variantId,
        name: variant.name,
        description: variant.description,
        isRecommended:
          variantId === "balanced" ||
          variant.name?.toLowerCase().includes("recommend"),
        totalTasks,
        estimatedHours,
        estimatedMonths,
        salaryRange,
        targetRole: variant.targetRole || "Developer",
        difficulty: variant.difficulty || "medium",
        topics: variant.topics || [],
        sources,
        previewTasks,
        phases,
      });
    }

    return variants;
  }

  /**
   * Fallback variant generation (non-AI)
   */
  private generateVariantsFallback(
    dto: GenerateRoadmapVariantsDto,
    tasks: TaskWithCourseInfo[],
  ): RoadmapVariantData[] {
    // Sort tasks by difficulty
    const difficultyOrder = { easy: 0, medium: 1, hard: 2 };
    const sortedTasks = [...tasks].sort(
      (a, b) =>
        (difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 1) -
        (difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 1),
    );

    // Filter by interests if specified
    let relevantTasks = sortedTasks;
    if (dto.interests.length > 0) {
      const interestPatterns = dto.interests.map((i) => new RegExp(i, "i"));
      relevantTasks = sortedTasks.filter((t) =>
        interestPatterns.some(
          (p) =>
            p.test(t.courseSlug) ||
            p.test(t.courseTitle) ||
            p.test(t.moduleTitle),
        ),
      );
      // If too few, use all
      if (relevantTasks.length < 30) relevantTasks = sortedTasks;
    }

    // Generate 3 variants
    const variants: RoadmapVariantData[] = [];

    // Variant 1: Quick Start (30-50 tasks)
    const quickTasks = relevantTasks.slice(0, 45);
    variants.push(
      this.buildVariantFromTasks(
        "quick-start",
        "Quick Start",
        "Fast track to your goal with essential skills",
        quickTasks,
        dto,
        "easy",
        "junior-plus",
      ),
    );

    // Variant 2: Balanced (80-120 tasks)
    const balancedTasks = relevantTasks.slice(0, 100);
    variants.push(
      this.buildVariantFromTasks(
        "balanced",
        "Balanced Path",
        "Recommended path with comprehensive coverage",
        balancedTasks,
        dto,
        "medium",
        "middle",
      ),
    );

    // Variant 3: Deep Dive (150+ tasks)
    const deepTasks = relevantTasks.slice(0, 180);
    variants.push(
      this.buildVariantFromTasks(
        "deep-dive",
        "Deep Dive",
        "Thorough learning path for complete mastery",
        deepTasks,
        dto,
        "hard",
        "senior",
      ),
    );

    // Mark balanced as recommended
    variants[1].isRecommended = true;

    return variants;
  }

  /**
   * Build a variant from a list of tasks
   */
  private buildVariantFromTasks(
    id: string,
    name: string,
    description: string,
    tasks: TaskWithCourseInfo[],
    dto: GenerateRoadmapVariantsDto,
    difficulty: "easy" | "medium" | "hard",
    salaryKey: string,
  ): RoadmapVariantData {
    const totalTasks = tasks.length;
    const estimatedHours = this.calculateTotalHours(tasks);
    const estimatedMonths = Math.ceil(estimatedHours / (dto.hoursPerWeek * 4));
    const salaryRange = SALARY_RANGES[salaryKey] || SALARY_RANGES["middle"];

    // Group by module for phases
    const moduleGroups = new Map<string, TaskWithCourseInfo[]>();
    for (const task of tasks) {
      const key = task.moduleTitle;
      if (!moduleGroups.has(key)) moduleGroups.set(key, []);
      moduleGroups.get(key)!.push(task);
    }

    // Create phases
    const phases: RoadmapPhase[] = [];
    let phaseIndex = 0;
    for (const [moduleTitle, moduleTasks] of moduleGroups) {
      if (phaseIndex >= 6) break;

      phases.push({
        id: `phase_${phaseIndex + 1}`,
        title: moduleTitle,
        description: `Master ${moduleTitle.toLowerCase()} concepts`,
        colorTheme: PHASE_PALETTES[phaseIndex % PHASE_PALETTES.length],
        order: phaseIndex + 1,
        steps: moduleTasks.slice(0, 12).map((task) => ({
          id: `step_${task.id}`,
          title: task.title,
          type: "practice" as const,
          durationEstimate: task.estimatedTime,
          deepLink: `/task/${task.slug}`,
          resourceType: "task" as const,
          relatedResourceId: task.id,
          status: "available" as const,
        })),
        progressPercentage: 0,
      });
      phaseIndex++;
    }

    // Calculate sources
    const sourceMap = new Map<
      string,
      { count: number; title: string; icon: string }
    >();
    for (const task of tasks) {
      const existing = sourceMap.get(task.courseSlug) || {
        count: 0,
        title: task.courseTitle,
        icon: task.courseIcon,
      };
      existing.count++;
      sourceMap.set(task.courseSlug, existing);
    }

    const sources = Array.from(sourceMap.entries())
      .map(([slug, data]) => ({
        courseSlug: slug,
        courseName: data.title,
        icon: data.icon,
        taskCount: data.count,
        percentage: Math.round((data.count / totalTasks) * 100),
      }))
      .sort((a, b) => b.taskCount - a.taskCount);

    // Extract topics from modules
    const topics = Array.from(moduleGroups.keys()).slice(0, 8);

    // Target role based on difficulty
    const targetRoles: Record<string, string> = {
      easy: "Junior Developer",
      medium: "Middle Developer",
      hard: "Senior Developer",
    };

    return {
      id,
      name,
      description,
      isRecommended: false,
      totalTasks,
      estimatedHours,
      estimatedMonths,
      salaryRange,
      targetRole: targetRoles[difficulty] || "Developer",
      difficulty,
      topics,
      sources,
      previewTasks: tasks.slice(0, 5).map((t) => ({
        title: t.title,
        difficulty: t.difficulty,
        fromCourse: t.courseTitle,
      })),
      phases,
    };
  }

  /**
   * Calculate total hours from tasks
   */
  private calculateTotalHours(tasks: TaskWithCourseInfo[]): number {
    let totalMinutes = 0;
    for (const task of tasks) {
      totalMinutes += this.parseTimeToMinutes(task.estimatedTime);
    }
    return Math.round(totalMinutes / 60);
  }

  /**
   * Parse time string to minutes
   */
  private parseTimeToMinutes(time: string): number {
    if (!time) return 15;
    let total = 0;
    const hourMatch = time.match(/(\d+(?:\.\d+)?)\s*h/i);
    const minMatch = time.match(/(\d+)(?:-\d+)?\s*m/i);
    if (hourMatch) total += parseFloat(hourMatch[1]) * 60;
    if (minMatch) total += parseInt(minMatch[1]);
    return total || 15;
  }

  // ============ PRIVATE HELPERS ============

  /**
   * Get user's completed task IDs
   */
  private async getUserCompletedTasks(userId: string): Promise<Set<string>> {
    const completedSubmissions = await this.prisma.submission.findMany({
      where: {
        userId,
        status: "passed",
      },
      select: { taskId: true },
    });
    return new Set(completedSubmissions.map((s) => s.taskId));
  }

  private async findExistingRoadmapId(userId: string): Promise<string | null> {
    const existing = await this.prisma.userRoadmap.findFirst({
      where: { userId },
      select: { id: true },
    });
    return existing?.id || null;
  }

  private getRoleTitle(role: string): string {
    const titles: Record<string, string> = {
      "backend-go": "Go Backend Developer",
      "backend-java": "Java Backend Developer",
      "python-data": "Python & Data Scientist",
      "ai-ml": "AI/ML Engineer",
      "software-design": "Software Architect",
      algorithms: "Algorithm Specialist",
      fullstack: "Fullstack Developer",
    };
    return titles[role] || "Developer";
  }

  private async hydrateRoadmap(roadmap: UserRoadmap, userId: string) {
    // Get user's completed tasks
    const completedSubmissions = await this.prisma.submission.findMany({
      where: {
        userId,
        status: "passed",
      },
      select: { taskId: true },
    });

    const completedTaskIds = new Set(completedSubmissions.map((s) => s.taskId));

    // Get all tasks to map slugs to IDs
    const allTasks = await this.prisma.task.findMany({
      select: { id: true, slug: true },
    });
    const taskSlugToId = new Map(allTasks.map((t) => [t.slug, t.id]));

    // Hydrate phases with completion status
    const phases = (roadmap.phases as unknown as RoadmapPhase[]).map(
      (phase, index) => {
        let completedCount = 0;

        const hydratedSteps = phase.steps.map((step) => {
          // Check if step's related resource is completed
          let isCompleted = false;

          if (step.resourceType === "task") {
            // Check by task ID or slug
            const taskId =
              taskSlugToId.get(step.relatedResourceId) ||
              step.relatedResourceId;
            isCompleted = completedTaskIds.has(taskId);
          }

          if (isCompleted) completedCount++;

          return {
            ...step,
            status: isCompleted ? "completed" : "available",
          };
        });

        return {
          ...phase,
          colorTheme: PHASE_PALETTES[index % PHASE_PALETTES.length],
          steps: hydratedSteps,
          progressPercentage:
            phase.steps.length > 0
              ? (completedCount / phase.steps.length) * 100
              : 0,
        };
      },
    );

    // Calculate total progress
    const totalSteps = phases.reduce((sum, p) => sum + p.steps.length, 0);
    const completedSteps = phases.reduce(
      (sum, p) => sum + p.steps.filter((s) => s.status === "completed").length,
      0,
    );

    return {
      id: roadmap.id,
      userId: roadmap.userId,
      role: roadmap.role,
      roleTitle: this.getRoleTitle(roadmap.role),
      level: roadmap.level,
      targetLevel: roadmap.level,
      title: roadmap.title,
      phases,
      totalProgress: totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0,
      createdAt: roadmap.createdAt,
      updatedAt: roadmap.updatedAt,
    };
  }
}
