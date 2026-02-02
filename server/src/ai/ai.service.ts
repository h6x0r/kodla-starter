import { Injectable, ForbiddenException, ServiceUnavailableException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from "@google/genai";
import { AccessControlService } from '../subscriptions/access-control.service';
import { DEFAULT_AI_MODEL, AI_DAILY_LIMITS } from './ai.config';

/**
 * Prompt test scenario result
 */
export interface PromptTestResult {
  scenarioIndex: number;
  input: string;
  output: string;
  score: number;
  feedback: string;
  passed: boolean;
}

/**
 * Overall prompt evaluation result
 */
export interface PromptEvaluationResult {
  passed: boolean;
  score: number;
  scenarioResults: PromptTestResult[];
  summary: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenAI;

  // Daily request limits by subscription type
  private readonly LIMIT_COURSE_SUBSCRIPTION = 30; // Course subscription
  private readonly LIMIT_GLOBAL_PREMIUM = 50; // Global premium subscription

  // Optimized prompt for Flash-Lite: concise, instruction-following
  private readonly PROMPT_TEMPLATE = `You are PRACTIX AI Tutor for \${language}.

RULES:
- NEVER give complete solution code
- Respond in \${uiLanguage} only
- Be concise (under 250 words)
- One code example max (2-3 lines)

CONTEXT:
Task: "\${taskTitle}"
Language: \${language}

Student's Code:
\`\`\`\${language}
\${userCode}
\`\`\`

Question: "\${question}"

RESPONSE FORMAT:
1. Brief acknowledgment (1 sentence)
2. Explain the issue conceptually
3. One small hint or pseudo-code snippet
4. End with ONE guiding question

Languages: en=English, ru=Russian, uz=Uzbek`;

  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private configService: ConfigService,
    private accessControlService: AccessControlService
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY') || this.configService.get<string>('API_KEY');
    if (apiKey) {
        this.genAI = new GoogleGenAI({ apiKey });
    }
  }

  async askTutor(userId: string, taskId: string, taskTitle: string, userCode: string, question: string, language: string, uiLanguage: string = 'en') {
    if (!this.genAI) {
        throw new ServiceUnavailableException('AI Service is not configured (Missing API Key).');
    }

    // 1. Check subscription access (AI Tutor is premium-only)
    const canUseAiTutor = await this.accessControlService.canUseAiTutor(userId, taskId);
    if (!canUseAiTutor) {
      throw new ForbiddenException('AI Tutor requires a subscription. Upgrade to Premium to access this feature.');
    }

    // 2. Determine limit based on subscription type (global vs course)
    const hasGlobalAccess = await this.accessControlService.hasGlobalAccess(userId);
    const limit = hasGlobalAccess
      ? this.LIMIT_GLOBAL_PREMIUM   // 50/day for global premium
      : this.LIMIT_COURSE_SUBSCRIPTION; // 30/day for course subscription

    // 3. Check Rate Limit with atomic transaction to prevent race conditions
    const today = new Date().toISOString().split('T')[0];

    const usageResult = await this.prisma.$transaction(async (tx) => {
      // Create or get usage record
      const usage = await tx.aiUsage.upsert({
        where: { userId_date: { userId, date: today } },
        create: { userId, date: today, count: 0 },
        update: {}, // No update, just ensure exists
      });

      // Check limit BEFORE incrementing
      if (usage.count >= limit) {
        return { exceeded: true, count: usage.count, limit };
      }

      // Atomic increment - only succeeds if count still < limit
      const updated = await tx.aiUsage.updateMany({
        where: {
          userId,
          date: today,
          count: { lt: limit },
        },
        data: { count: { increment: 1 } },
      });

      // If no rows were updated, another request beat us
      if (updated.count === 0) {
        return { exceeded: true, count: limit, limit };
      }

      return { exceeded: false, count: usage.count + 1, limit };
    });

    if (usageResult.exceeded) {
      // Don't expose exact numbers - cleaner error message
      throw new ForbiddenException('Daily AI Tutor limit reached. Try again tomorrow.');
    }

    const currentCount = usageResult.count;

    // 4. Prepare Prompt with language mapping
    const languageNames: Record<string, string> = {
      en: 'English',
      ru: 'Russian',
      uz: 'Uzbek'
    };
    const uiLangFull = languageNames[uiLanguage] || 'English';

    const prompt = this.PROMPT_TEMPLATE
        .replace(/\${language}/g, language || 'General')
        .replace(/\${taskTitle}/g, taskTitle || 'Unknown Task')
        .replace(/\${userCode}/g, userCode || '')
        .replace(/\${question}/g, question)
        .replace(/\${uiLanguage}/g, uiLangFull);

    try {
        // 5. Call Gemini Flash-Lite (cost-efficient, faster, better for hints)
        const response = await this.genAI.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: prompt,
        });

        const text = response.text;

        // Return remaining requests count for UI
        return {
          answer: text,
          remaining: usageResult.limit - currentCount,
          isGlobalPremium: hasGlobalAccess,
        };

    } catch (error) {
        this.logger.error('Gemini API call failed', error instanceof Error ? error.stack : String(error));

        // Rollback the usage increment on failure
        // Use exact count match to prevent race conditions:
        // - Won't decrement below 0
        // - Won't decrement if another request already decremented
        // - Only affects our specific increment
        await this.prisma.aiUsage.updateMany({
          where: { userId, date: today, count: currentCount },
          data: { count: { decrement: 1 } },
        }).catch((rollbackError) => {
          // Log rollback failures for debugging, but don't block
          this.logger.warn(`Usage rollback failed: ${rollbackError.message}`);
        });

        throw new ServiceUnavailableException("AI is currently overloaded. Please try again.");
    }
  }

  /**
   * Evaluate a prompt engineering submission
   * Runs the student's prompt against test scenarios and uses AI-as-Judge
   */
  async evaluatePrompt(
    userId: string,
    studentPrompt: string,
    promptConfig: {
      testScenarios: Array<{
        input: string;
        expectedCriteria: string[];
        rubric?: string;
      }>;
      judgePrompt: string;
      passingScore: number;
    },
  ): Promise<PromptEvaluationResult> {
    if (!this.genAI) {
      throw new ServiceUnavailableException('AI Service is not configured (Missing API Key).');
    }

    const scenarioResults: PromptTestResult[] = [];
    let totalScore = 0;

    // Process each test scenario
    for (let i = 0; i < promptConfig.testScenarios.length; i++) {
      const scenario = promptConfig.testScenarios[i];

      try {
        // Step 1: Execute student's prompt with scenario input
        const populatedPrompt = studentPrompt.replace(/\{\{INPUT\}\}/gi, scenario.input);

        const aiModel = this.configService.get<string>('AI_MODEL_NAME') || DEFAULT_AI_MODEL;
        const executionResponse = await this.genAI.models.generateContent({
          model: aiModel,
          contents: populatedPrompt,
        });

        const output = executionResponse.text || '';

        // Step 2: Use AI Judge to evaluate the output
        const judgePromptPopulated = promptConfig.judgePrompt
          .replace(/\{\{OUTPUT\}\}/gi, output)
          .replace(/\{\{CRITERIA\}\}/gi, scenario.expectedCriteria.join('\n- '))
          .replace(/\{\{RUBRIC\}\}/gi, scenario.rubric || 'Score based on criteria match');

        const judgeSystemPrompt = `You are an AI Judge evaluating prompt engineering outputs.
Evaluate the following output against the given criteria.
Respond ONLY with valid JSON in this exact format:
{"score": <number 1-10>, "feedback": "<brief explanation>"}

Do not include any other text, markdown, or formatting.`;

        const judgeResponse = await this.genAI.models.generateContent({
          model: aiModel,
          contents: `${judgeSystemPrompt}\n\n${judgePromptPopulated}`,
        });

        const judgeText = judgeResponse.text || '{"score": 0, "feedback": "Failed to evaluate"}';

        // Parse judge response
        let score = 0;
        let feedback = 'Failed to parse evaluation';

        try {
          // Extract JSON from response (handle potential markdown wrapping)
          const jsonMatch = judgeText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            score = Math.min(10, Math.max(0, Number(parsed.score) || 0));
            feedback = parsed.feedback || 'No feedback provided';
          }
        } catch (parseError) {
          this.logger.warn(`Failed to parse judge response: ${judgeText}`);
          feedback = 'Evaluation parsing failed';
        }

        scenarioResults.push({
          scenarioIndex: i,
          input: scenario.input.substring(0, 200) + (scenario.input.length > 200 ? '...' : ''),
          output: output.substring(0, 500) + (output.length > 500 ? '...' : ''),
          score,
          feedback,
          passed: score >= promptConfig.passingScore,
        });

        totalScore += score;

      } catch (error) {
        this.logger.error(`Scenario ${i} failed: ${error instanceof Error ? error.message : String(error)}`);
        scenarioResults.push({
          scenarioIndex: i,
          input: scenario.input.substring(0, 200),
          output: '',
          score: 0,
          feedback: 'Execution failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
          passed: false,
        });
      }
    }

    // Calculate average score
    const averageScore = promptConfig.testScenarios.length > 0
      ? totalScore / promptConfig.testScenarios.length
      : 0;

    const passedScenarios = scenarioResults.filter(r => r.passed).length;
    const totalScenarios = scenarioResults.length;
    const overallPassed = averageScore >= promptConfig.passingScore;

    return {
      passed: overallPassed,
      score: Math.round(averageScore * 10) / 10, // Round to 1 decimal
      scenarioResults,
      summary: overallPassed
        ? `Passed! ${passedScenarios}/${totalScenarios} scenarios met criteria. Average score: ${averageScore.toFixed(1)}/10`
        : `Not passed. ${passedScenarios}/${totalScenarios} scenarios met criteria. Average score: ${averageScore.toFixed(1)}/10. Need ${promptConfig.passingScore}/10 to pass.`,
    };
  }

  /**
   * Count AI calls needed for prompt evaluation
   * Used for rate limiting checks
   */
  getPromptEvaluationCost(scenarioCount: number): number {
    // 2 calls per scenario: 1 for execution, 1 for judging
    return scenarioCount * 2;
  }
}