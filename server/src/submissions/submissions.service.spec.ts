import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, TaskType } from '@prisma/client';
import { SubmissionsService } from './submissions.service';
import { PrismaService } from '../prisma/prisma.service';
import { CodeExecutionService } from '../queue/code-execution.service';
import { CacheService } from '../cache/cache.service';
import { AccessControlService } from '../subscriptions/access-control.service';
import { GamificationService } from '../gamification/gamification.service';
import { SecurityValidationService } from '../security/security-validation.service';
import { TestParserService } from './test-parser.service';
import { ResultFormatterService } from './result-formatter.service';
import { AiService } from '../ai/ai.service';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';

// Helper to create Prisma errors for testing
function createPrismaError(code: string): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('Unique constraint violation', {
    code,
    clientVersion: '5.0.0',
  });
}

describe('SubmissionsService', () => {
  let service: SubmissionsService;
  let prisma: PrismaService;
  let codeExecutionService: CodeExecutionService;
  let cacheService: CacheService;
  let accessControlService: AccessControlService;
  let gamificationService: GamificationService;

  // Mock data
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    isPremium: false,
  };

  const mockTask = {
    id: 'task-123',
    slug: 'hello-world',
    title: 'Hello World',
    description: 'Print Hello World',
    difficulty: 'easy',
    testCode: `
      func TestHelloWorld(t *testing.T) {
        result := HelloWorld()
        if result != "Hello, World!" {
          t.Errorf("expected Hello, World!, got %s", result)
        }
      }
    `,
    topic: {
      id: 'topic-123',
      module: {
        courseId: 'course-123',
      },
    },
  };

  const mockTaskNoTests = {
    id: 'task-456',
    slug: 'simple-print',
    title: 'Simple Print',
    description: 'Print something',
    difficulty: 'easy',
    testCode: null,
    topic: null,
  };

  const mockSubmission = {
    id: 'submission-123',
    userId: 'user-123',
    taskId: 'task-123',
    code: 'func HelloWorld() string { return "Hello, World!" }',
    status: 'passed',
    score: 100,
    runtime: '10ms',
    memory: '-',
    message: '',
    testsPassed: 1,
    testsTotal: 1,
    testCases: null,
    createdAt: new Date(),
  };

  const mockExecutionResult = {
    status: 'passed',
    stdout: '{"tests":[{"name":"TestHelloWorld","passed":true}],"passed":1,"total":1}',
    stderr: '',
    compileOutput: '',
    time: '0.01',
    memory: 0,
    message: '',
  };

  const mockPrismaService = {
    task: {
      findFirst: jest.fn(),
    },
    submission: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    taskCompletion: {
      create: jest.fn(),
    },
    runResult: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockCodeExecutionService = {
    executeSync: jest.fn(),
    executeSyncWithTests: jest.fn(),
    checkHealth: jest.fn(),
    getQueueStats: jest.fn(),
  };

  const mockCacheService = {
    getExecutionResult: jest.fn(),
    setExecutionResult: jest.fn(),
    getStats: jest.fn(),
    getRunValidation: jest.fn().mockResolvedValue({ passed: true, testsPassed: 5 }),
    setRunValidation: jest.fn(),
    setRunValidated: jest.fn(),
    clearRunValidation: jest.fn().mockResolvedValue(undefined),
  };

  const mockAccessControlService = {
    getQueuePriority: jest.fn(),
    getTaskAccess: jest.fn().mockResolvedValue({ canSubmit: true, reason: null }),
  };

  const mockGamificationService = {
    awardTaskXp: jest.fn(),
  };

  const mockSecurityValidationService = {
    validateCode: jest.fn().mockResolvedValue(undefined),
  };

  const mockTestParserService = {
    parseTestOutput: jest.fn().mockReturnValue({
      testCases: [{ name: 'TestHelloWorld', passed: true }],
      passed: 1,
      total: 1,
    }),
    determineStatus: jest.fn().mockReturnValue('passed'),
    calculateScore: jest.fn().mockReturnValue(100),
  };

  const mockResultFormatterService = {
    formatRuntime: jest.fn().mockReturnValue('10ms'),
    formatMemory: jest.fn().mockReturnValue('-'),
    formatMetrics: jest.fn().mockReturnValue({ runtime: '10ms', memory: '-' }),
    formatMessage: jest.fn().mockReturnValue(''),
    getXpForDifficulty: jest.fn().mockReturnValue(10),
    getStatusLabel: jest.fn().mockReturnValue('PASSED'),
  };

  const mockAiService = {
    evaluatePrompt: jest.fn(),
    getPromptEvaluationCost: jest.fn().mockReturnValue(2),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CodeExecutionService, useValue: mockCodeExecutionService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: AccessControlService, useValue: mockAccessControlService },
        { provide: GamificationService, useValue: mockGamificationService },
        { provide: SecurityValidationService, useValue: mockSecurityValidationService },
        { provide: TestParserService, useValue: mockTestParserService },
        { provide: ResultFormatterService, useValue: mockResultFormatterService },
        { provide: AiService, useValue: mockAiService },
      ],
    }).compile();

    service = module.get<SubmissionsService>(SubmissionsService);
    prisma = module.get<PrismaService>(PrismaService);
    codeExecutionService = module.get<CodeExecutionService>(CodeExecutionService);
    cacheService = module.get<CacheService>(CacheService);
    accessControlService = module.get<AccessControlService>(AccessControlService);
    gamificationService = module.get<GamificationService>(GamificationService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ============================================
  // create() - Main submission flow
  // ============================================
  describe('create()', () => {
    describe('happy paths', () => {
      it('should create submission for valid task and code', async () => {
        mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
        mockAccessControlService.getQueuePriority.mockResolvedValue(1);
        mockCodeExecutionService.executeSyncWithTests.mockResolvedValue(mockExecutionResult);
        mockPrismaService.submission.create.mockResolvedValue(mockSubmission);
        mockPrismaService.submission.count.mockResolvedValue(0);
        mockGamificationService.awardTaskXp.mockResolvedValue({
          xpEarned: 10,
          totalXp: 10,
          level: 1,
          leveledUp: false,
          newBadges: [],
        });

        const result = await service.create(
          'user-123',
          'task-123',
          'func HelloWorld() string { return "Hello, World!" }',
          'go'
        );

        expect(result).toBeDefined();
        expect(result.status).toBe('passed');
        expect(result.id).toBe('submission-123');
        expect(mockPrismaService.submission.create).toHaveBeenCalled();
      });

      it('should execute code via Judge0 service with tests', async () => {
        mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
        mockAccessControlService.getQueuePriority.mockResolvedValue(1);
        mockCodeExecutionService.executeSyncWithTests.mockResolvedValue(mockExecutionResult);
        mockPrismaService.submission.create.mockResolvedValue(mockSubmission);
        mockPrismaService.submission.count.mockResolvedValue(0);
        mockGamificationService.awardTaskXp.mockResolvedValue({
          xpEarned: 10,
          totalXp: 10,
          level: 1,
          leveledUp: false,
          newBadges: [],
        });

        await service.create('user-123', 'task-123', 'code', 'go');

        expect(mockCodeExecutionService.executeSyncWithTests).toHaveBeenCalledWith(
          'code',
          mockTask.testCode,
          'go',
          undefined
        );
      });

      it('should save submission to database', async () => {
        mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
        mockAccessControlService.getQueuePriority.mockResolvedValue(1);
        mockCodeExecutionService.executeSyncWithTests.mockResolvedValue(mockExecutionResult);
        mockPrismaService.submission.create.mockResolvedValue(mockSubmission);
        mockPrismaService.submission.count.mockResolvedValue(0);
        mockGamificationService.awardTaskXp.mockResolvedValue({
          xpEarned: 10,
          totalXp: 10,
          level: 1,
          leveledUp: false,
          newBadges: [],
        });

        await service.create('user-123', 'task-123', 'code', 'go');

        expect(mockPrismaService.submission.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              userId: 'user-123',
              taskId: 'task-123',
              code: 'code',
              status: 'passed',
            }),
          })
        );
      });

      it('should return test results with pass/fail status', async () => {
        mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
        mockAccessControlService.getQueuePriority.mockResolvedValue(1);
        mockCodeExecutionService.executeSyncWithTests.mockResolvedValue(mockExecutionResult);
        mockPrismaService.submission.create.mockResolvedValue(mockSubmission);
        mockPrismaService.submission.count.mockResolvedValue(0);
        mockGamificationService.awardTaskXp.mockResolvedValue({
          xpEarned: 10,
          totalXp: 10,
          level: 1,
          leveledUp: false,
          newBadges: [],
        });

        const result = await service.create('user-123', 'task-123', 'code', 'go');

        expect(result.testsPassed).toBe(1);
        expect(result.testsTotal).toBe(1);
        expect(result.testCases).toBeDefined();
      });

      it('should award XP on first successful submission', async () => {
        mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
        mockAccessControlService.getQueuePriority.mockResolvedValue(1);
        mockCodeExecutionService.executeSyncWithTests.mockResolvedValue(mockExecutionResult);
        mockPrismaService.submission.create.mockResolvedValue(mockSubmission);
        mockPrismaService.taskCompletion.create.mockResolvedValue({}); // First completion
        mockGamificationService.awardTaskXp.mockResolvedValue({
          xpEarned: 10,
          totalXp: 10,
          level: 1,
          leveledUp: false,
          newBadges: [],
        });

        const result = await service.create('user-123', 'task-123', 'code', 'go');

        expect(mockGamificationService.awardTaskXp).toHaveBeenCalledWith('user-123', 'easy');
        expect(result.xpEarned).toBe(10);
      });

      it('should not award XP on subsequent successful submissions (unique constraint violation)', async () => {
        mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
        mockAccessControlService.getQueuePriority.mockResolvedValue(1);
        mockCodeExecutionService.executeSyncWithTests.mockResolvedValue(mockExecutionResult);
        mockPrismaService.submission.create.mockResolvedValue(mockSubmission);
        // Simulate unique constraint violation (P2002) - task already completed
        mockPrismaService.taskCompletion.create.mockRejectedValue(createPrismaError('P2002'));

        const result = await service.create('user-123', 'task-123', 'code', 'go');

        expect(mockGamificationService.awardTaskXp).not.toHaveBeenCalled();
        expect(result.xpEarned).toBeUndefined();
      });

      it('should get queue priority based on subscription', async () => {
        mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
        mockAccessControlService.getQueuePriority.mockResolvedValue(1);
        mockCodeExecutionService.executeSyncWithTests.mockResolvedValue(mockExecutionResult);
        mockPrismaService.submission.create.mockResolvedValue(mockSubmission);
        mockPrismaService.submission.count.mockResolvedValue(0);
        mockPrismaService.taskCompletion.create.mockResolvedValue({ id: 'tc-1' }); // Reset from previous test
        mockGamificationService.awardTaskXp.mockResolvedValue({
          xpEarned: 10,
          totalXp: 10,
          level: 1,
          leveledUp: false,
          newBadges: [],
        });

        await service.create('user-123', 'task-123', 'code', 'go');

        expect(mockAccessControlService.getQueuePriority).toHaveBeenCalledWith(
          'user-123',
          'course-123'
        );
      });

      it('should resolve task by id or slug using OR query', async () => {
        mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
        mockAccessControlService.getQueuePriority.mockResolvedValue(1);
        mockCodeExecutionService.executeSyncWithTests.mockResolvedValue(mockExecutionResult);
        mockPrismaService.submission.create.mockResolvedValue(mockSubmission);
        mockPrismaService.submission.count.mockResolvedValue(0);
        mockPrismaService.taskCompletion.create.mockResolvedValue({});
        mockGamificationService.awardTaskXp.mockResolvedValue({
          xpEarned: 10,
          totalXp: 10,
          level: 1,
          leveledUp: false,
          newBadges: [],
        });

        await service.create('user-123', 'hello-world', 'code', 'go');

        expect(mockPrismaService.task.findFirst).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              OR: [{ id: 'hello-world' }, { slug: 'hello-world' }],
            },
          })
        );
      });
    });

    describe('edge cases', () => {
      it('should throw NotFoundException when task not found', async () => {
        mockPrismaService.task.findFirst.mockResolvedValue(null);

        await expect(
          service.create('user-123', 'nonexistent-task', 'code', 'go')
        ).rejects.toThrow(NotFoundException);
      });

      it('should throw BadRequestException for unsupported language', async () => {
        mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
        mockAccessControlService.getQueuePriority.mockResolvedValue(1);

        await expect(
          service.create('user-123', 'task-123', 'code', 'unsupported')
        ).rejects.toThrow(BadRequestException);
      });

      it('should handle code execution timeout', async () => {
        mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
        mockAccessControlService.getQueuePriority.mockResolvedValue(1);
        mockCodeExecutionService.executeSyncWithTests.mockResolvedValue({
          status: 'timeout',
          stdout: '',
          stderr: 'Time limit exceeded',
          compileOutput: '',
          time: '-',
          memory: 0,
          message: 'Time limit exceeded',
        });
        mockTestParserService.parseTestOutput.mockReturnValue({ testCases: [], passed: 0, total: 0 });
        mockTestParserService.determineStatus.mockReturnValue('error');
        mockResultFormatterService.formatMessage.mockReturnValue('Time limit exceeded');
        mockPrismaService.submission.create.mockResolvedValue({
          ...mockSubmission,
          status: 'error',
          message: 'Time limit exceeded',
        });

        const result = await service.create('user-123', 'task-123', 'code', 'go');

        expect(result.status).toBe('error');
        expect(result.message).toContain('Time limit exceeded');
      });

      it('should handle compile errors gracefully', async () => {
        mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
        mockAccessControlService.getQueuePriority.mockResolvedValue(1);
        mockCodeExecutionService.executeSyncWithTests.mockResolvedValue({
          status: 'compileError',
          stdout: '',
          stderr: '',
          compileOutput: 'syntax error: unexpected token',
          time: '-',
          memory: 0,
          message: 'Compilation failed',
        });
        mockTestParserService.parseTestOutput.mockReturnValue({ testCases: [], passed: 0, total: 0 });
        mockTestParserService.determineStatus.mockReturnValue('error');
        mockResultFormatterService.formatMessage.mockReturnValue('syntax error: unexpected token');
        mockPrismaService.submission.create.mockResolvedValue({
          ...mockSubmission,
          status: 'error',
          message: 'syntax error: unexpected token',
        });

        const result = await service.create('user-123', 'task-123', 'invalid code', 'go');

        expect(result.status).toBe('error');
        expect(result.message).toContain('syntax error');
      });

      it('should handle runtime errors', async () => {
        mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
        mockAccessControlService.getQueuePriority.mockResolvedValue(1);
        mockCodeExecutionService.executeSyncWithTests.mockResolvedValue({
          status: 'error',
          stdout: '',
          stderr: 'panic: runtime error',
          compileOutput: '',
          time: '-',
          memory: 0,
          message: 'Runtime error',
        });
        mockTestParserService.parseTestOutput.mockReturnValue({ testCases: [], passed: 0, total: 0 });
        mockTestParserService.determineStatus.mockReturnValue('error');
        mockResultFormatterService.formatMessage.mockReturnValue('panic: runtime error');
        mockPrismaService.submission.create.mockResolvedValue({
          ...mockSubmission,
          status: 'error',
          message: 'panic: runtime error',
        });

        const result = await service.create('user-123', 'task-123', 'code', 'go');

        expect(result.status).toBe('error');
        expect(result.message).toContain('runtime error');
      });

      it('should execute code without tests if task has no testCode', async () => {
        mockPrismaService.task.findFirst.mockResolvedValue(mockTaskNoTests);
        mockCodeExecutionService.executeSync.mockResolvedValue({
          status: 'passed',
          stdout: 'Hello, World!',
          stderr: '',
          compileOutput: '',
          time: '0.01',
          memory: 0,
          message: '',
        });
        mockPrismaService.submission.create.mockResolvedValue({
          ...mockSubmission,
          taskId: 'task-456',
        });

        await service.create('user-123', 'task-456', 'code', 'go');

        expect(mockCodeExecutionService.executeSync).toHaveBeenCalledWith('code', 'go');
        expect(mockCodeExecutionService.executeSyncWithTests).not.toHaveBeenCalled();
      });

      it('should use default priority if task has no course', async () => {
        mockPrismaService.task.findFirst.mockResolvedValue(mockTaskNoTests);
        mockCodeExecutionService.executeSync.mockResolvedValue({
          status: 'passed',
          stdout: 'Hello',
          stderr: '',
          compileOutput: '',
          time: '0.01',
          memory: 0,
          message: '',
        });
        mockPrismaService.submission.create.mockResolvedValue(mockSubmission);

        await service.create('user-123', 'task-456', 'code', 'go');

        expect(mockAccessControlService.getQueuePriority).not.toHaveBeenCalled();
      });
    });

    describe('test result parsing', () => {
      it('should delegate test parsing to TestParserService', async () => {
        mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
        mockAccessControlService.getQueuePriority.mockResolvedValue(1);
        mockCodeExecutionService.executeSyncWithTests.mockResolvedValue({
          status: 'passed',
          stdout: '{"tests":[{"name":"Test1","passed":true},{"name":"Test2","passed":true}],"passed":2,"total":2}',
          stderr: '',
          compileOutput: '',
          time: '0.01',
          memory: 0,
          message: '',
        });
        mockTestParserService.parseTestOutput.mockReturnValue({
          testCases: [
            { name: 'Test1', passed: true },
            { name: 'Test2', passed: true },
          ],
          passed: 2,
          total: 2,
        });
        mockPrismaService.submission.create.mockResolvedValue(mockSubmission);
        mockPrismaService.taskCompletion.create.mockResolvedValue({});
        mockGamificationService.awardTaskXp.mockResolvedValue({
          xpEarned: 10,
          totalXp: 10,
          level: 1,
          leveledUp: false,
          newBadges: [],
        });

        const result = await service.create('user-123', 'task-123', 'code', 'go');

        expect(mockTestParserService.parseTestOutput).toHaveBeenCalled();
        expect(result.testsPassed).toBe(2);
        expect(result.testsTotal).toBe(2);
        expect(result.testCases).toHaveLength(2);
      });

      it('should delegate status determination to TestParserService', async () => {
        mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
        mockAccessControlService.getQueuePriority.mockResolvedValue(1);
        mockCodeExecutionService.executeSyncWithTests.mockResolvedValue({
          status: 'passed',
          stdout: '=== RUN TestHello\n--- PASS: TestHello\nRESULT: 1/1',
          stderr: '',
          compileOutput: '',
          time: '0.01',
          memory: 0,
          message: '',
        });
        mockPrismaService.submission.create.mockResolvedValue(mockSubmission);
        mockPrismaService.taskCompletion.create.mockResolvedValue({});
        mockGamificationService.awardTaskXp.mockResolvedValue({
          xpEarned: 10,
          totalXp: 10,
          level: 1,
          leveledUp: false,
          newBadges: [],
        });

        await service.create('user-123', 'task-123', 'code', 'go');

        expect(mockTestParserService.determineStatus).toHaveBeenCalled();
        expect(mockTestParserService.calculateScore).toHaveBeenCalled();
      });

      it('should handle failed tests and not award XP', async () => {
        mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
        mockAccessControlService.getQueuePriority.mockResolvedValue(1);
        mockCodeExecutionService.executeSyncWithTests.mockResolvedValue({
          status: 'passed',
          stdout: '{"tests":[{"name":"Test1","passed":true},{"name":"Test2","passed":false}],"passed":1,"total":2}',
          stderr: '',
          compileOutput: '',
          time: '0.01',
          memory: 0,
          message: '',
        });
        mockTestParserService.parseTestOutput.mockReturnValue({
          testCases: [
            { name: 'Test1', passed: true },
            { name: 'Test2', passed: false, error: 'expected 2, got 1' },
          ],
          passed: 1,
          total: 2,
        });
        mockTestParserService.determineStatus.mockReturnValue('failed');
        mockTestParserService.calculateScore.mockReturnValue(50);
        mockPrismaService.submission.create.mockResolvedValue({
          ...mockSubmission,
          status: 'failed',
          score: 50,
        });

        const result = await service.create('user-123', 'task-123', 'code', 'go');

        expect(result.status).toBe('failed');
        expect(result.score).toBe(50);
        expect(mockGamificationService.awardTaskXp).not.toHaveBeenCalled();
      });
    });
  });

  // ============================================
  // runCode() - Quick execution without saving
  // ============================================
  describe('runCode()', () => {
    it('should execute code and return result', async () => {
      mockCacheService.getExecutionResult.mockResolvedValue(null);
      mockCodeExecutionService.executeSync.mockResolvedValue({
        status: 'passed',
        stdout: 'Hello, World!',
        stderr: '',
        compileOutput: '',
        time: '0.01',
        memory: 0,
        message: '',
      });
      mockCacheService.setExecutionResult.mockResolvedValue(undefined);

      const result = await service.runCode('code', 'go');

      expect(result.stdout).toBe('Hello, World!');
      expect(mockCodeExecutionService.executeSync).toHaveBeenCalledWith('code', 'go', undefined);
    });

    it('should return cached result if available', async () => {
      const cachedResult = {
        status: 'passed',
        stdout: 'Cached result',
        stderr: '',
        compileOutput: '',
        time: '0.01',
        memory: 0,
        message: '',
      };
      mockCacheService.getExecutionResult.mockResolvedValue(cachedResult);

      const result = await service.runCode('code', 'go');

      expect(result.stdout).toBe('Cached result');
      expect(mockCodeExecutionService.executeSync).not.toHaveBeenCalled();
    });

    it('should cache new execution results', async () => {
      mockCacheService.getExecutionResult.mockResolvedValue(null);
      const executionResult = {
        status: 'passed',
        stdout: 'Hello',
        stderr: '',
        compileOutput: '',
        time: '0.01',
        memory: 0,
        message: '',
      };
      mockCodeExecutionService.executeSync.mockResolvedValue(executionResult);
      mockCacheService.setExecutionResult.mockResolvedValue(undefined);

      await service.runCode('code', 'go');

      expect(mockCacheService.setExecutionResult).toHaveBeenCalledWith(
        'code',
        'go',
        undefined,
        executionResult,
        undefined
      );
    });

    it('should throw BadRequestException for unsupported language', async () => {
      await expect(service.runCode('code', 'unsupported')).rejects.toThrow(
        BadRequestException
      );
    });

    it('should pass stdin to execution', async () => {
      mockCacheService.getExecutionResult.mockResolvedValue(null);
      mockCodeExecutionService.executeSync.mockResolvedValue({
        status: 'passed',
        stdout: 'output',
        stderr: '',
        compileOutput: '',
        time: '0.01',
        memory: 0,
        message: '',
      });
      mockCacheService.setExecutionResult.mockResolvedValue(undefined);

      await service.runCode('code', 'go', 'input data');

      expect(mockCodeExecutionService.executeSync).toHaveBeenCalledWith(
        'code',
        'go',
        'input data'
      );
    });
  });

  // ============================================
  // runQuickTests() - Quick tests without saving
  // ============================================
  describe('runQuickTests()', () => {
    it('should run limited tests (5) for quick mode', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
      mockCodeExecutionService.executeSyncWithTests.mockResolvedValue(mockExecutionResult);

      await service.runQuickTests('task-123', 'code', 'go');

      expect(mockCodeExecutionService.executeSyncWithTests).toHaveBeenCalledWith(
        'code',
        mockTask.testCode,
        'go',
        5 // Max 5 tests
      );
    });

    it('should not save to database', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
      mockCodeExecutionService.executeSyncWithTests.mockResolvedValue(mockExecutionResult);

      await service.runQuickTests('task-123', 'code', 'go');

      expect(mockPrismaService.submission.create).not.toHaveBeenCalled();
    });

    it('should return partial results', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
      mockCodeExecutionService.executeSyncWithTests.mockResolvedValue(mockExecutionResult);

      const result = await service.runQuickTests('task-123', 'code', 'go');

      expect(result.testsPassed).toBeDefined();
      expect(result.testsTotal).toBeDefined();
      expect(result.status).toBeDefined();
    });

    it('should handle compilation errors gracefully', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
      mockCodeExecutionService.executeSyncWithTests.mockResolvedValue({
        status: 'compileError',
        stdout: '',
        stderr: '',
        compileOutput: 'syntax error',
        time: '-',
        memory: 0,
        message: 'Compilation failed',
      });
      mockTestParserService.parseTestOutput.mockReturnValue({ testCases: [], passed: 0, total: 0 });
      mockTestParserService.determineStatus.mockReturnValue('error');

      const result = await service.runQuickTests('task-123', 'invalid code', 'go');

      expect(result.status).toBe('error');
    });

    it('should throw NotFoundException for invalid task', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue(null);

      await expect(
        service.runQuickTests('nonexistent', 'code', 'go')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for unsupported language', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue(mockTask);

      await expect(
        service.runQuickTests('task-123', 'code', 'unsupported')
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ============================================
  // findByUserAndTask() - Get user submissions
  // ============================================
  describe('findByUserAndTask()', () => {
    it('should return user submissions for task', async () => {
      const submissions = [mockSubmission, { ...mockSubmission, id: 'submission-456' }];
      mockPrismaService.submission.findMany.mockResolvedValue(submissions);

      const result = await service.findByUserAndTask('user-123', 'task-123');

      expect(result).toHaveLength(2);
      expect(mockPrismaService.submission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-123', taskId: 'task-123' },
        })
      );
    });

    it('should order by createdAt desc', async () => {
      mockPrismaService.submission.findMany.mockResolvedValue([]);

      await service.findByUserAndTask('user-123', 'task-123');

      expect(mockPrismaService.submission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should limit to 10 submissions', async () => {
      mockPrismaService.submission.findMany.mockResolvedValue([]);

      await service.findByUserAndTask('user-123', 'task-123');

      expect(mockPrismaService.submission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        })
      );
    });
  });

  // ============================================
  // findRecentByUser() - Get recent submissions
  // ============================================
  describe('findRecentByUser()', () => {
    it('should return recent submissions with default limit', async () => {
      mockPrismaService.submission.findMany.mockResolvedValue([mockSubmission]);

      const result = await service.findRecentByUser('user-123');

      expect(result).toHaveLength(1);
      expect(mockPrismaService.submission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-123' },
          take: 10,
        })
      );
    });

    it('should respect custom limit', async () => {
      mockPrismaService.submission.findMany.mockResolvedValue([]);

      await service.findRecentByUser('user-123', 5);

      expect(mockPrismaService.submission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
        })
      );
    });

    it('should include task info', async () => {
      mockPrismaService.submission.findMany.mockResolvedValue([]);

      await service.findRecentByUser('user-123');

      expect(mockPrismaService.submission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { task: { select: { slug: true, title: true } } },
        })
      );
    });
  });

  // ============================================
  // findOne() - Get single submission
  // ============================================
  describe('findOne()', () => {
    it('should return submission by id', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(mockSubmission);

      const result = await service.findOne('submission-123');

      expect(result).toEqual(mockSubmission);
    });

    it('should throw NotFoundException if submission not found', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  // ============================================
  // getJudgeStatus() - System health check
  // ============================================
  describe('getJudgeStatus()', () => {
    it('should return execution engine health status', async () => {
      mockCodeExecutionService.checkHealth.mockResolvedValue({
        available: true,
        queueReady: true,
      });
      mockCodeExecutionService.getQueueStats.mockResolvedValue({
        waiting: 0,
        active: 0,
        completed: 100,
        failed: 2,
      });
      mockCacheService.getStats.mockResolvedValue({
        connected: true,
        keys: 50,
      });

      const result = await service.getJudgeStatus();

      expect(result.available).toBe(true);
      expect(result.queueReady).toBe(true);
      expect(result.queue.completed).toBe(100);
      expect(result.cache.connected).toBe(true);
      expect(result.languages).toContain('go');
    });

    it('should handle service unavailable', async () => {
      mockCodeExecutionService.checkHealth.mockResolvedValue({
        available: false,
        queueReady: false,
      });
      mockCodeExecutionService.getQueueStats.mockResolvedValue({
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
      });
      mockCacheService.getStats.mockResolvedValue({
        connected: false,
      });

      const result = await service.getJudgeStatus();

      expect(result.available).toBe(false);
      expect(result.cache.connected).toBe(false);
    });
  });

  // ============================================
  // Access Control Tests - Premium/Subscription
  // ============================================
  describe('Access Control', () => {
    describe('create() - canSubmit access', () => {
      it('should throw ForbiddenException when canSubmit is false', async () => {
        mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
        mockAccessControlService.getTaskAccess.mockResolvedValue({
          canSubmit: false,
          canRun: true,
          reason: 'Premium required',
        });

        await expect(
          service.create('user-123', 'task-123', 'code', 'go')
        ).rejects.toThrow(ForbiddenException);
      });
    });

    describe('create() - run validation', () => {
      it('should throw ForbiddenException when no run validation exists', async () => {
        mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
        mockAccessControlService.getTaskAccess.mockResolvedValue({ canSubmit: true });
        mockCacheService.getRunValidation.mockResolvedValue(null);

        await expect(
          service.create('user-123', 'task-123', 'code', 'go')
        ).rejects.toThrow(ForbiddenException);
      });
    });

    describe('runQuickTests() - canRun access', () => {
      it('should throw ForbiddenException when canRun is false', async () => {
        mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
        mockAccessControlService.getTaskAccess.mockResolvedValue({
          canSubmit: true,
          canRun: false,
          reason: 'Premium required',
        });

        await expect(
          service.runQuickTests('task-123', 'code', 'go', undefined, 'user-123')
        ).rejects.toThrow(ForbiddenException);
      });
    });
  });

  // ============================================
  // runQuickTests() - Run validation and persistence
  // ============================================
  describe('runQuickTests() - validation and persistence', () => {
    it('should mark task as validated when user passes 5 tests', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
      mockAccessControlService.getTaskAccess.mockResolvedValue({ canRun: true });
      mockCodeExecutionService.executeSyncWithTests.mockResolvedValue(mockExecutionResult);
      mockTestParserService.parseTestOutput.mockReturnValue({
        testCases: Array(5).fill({ name: 'Test', passed: true }),
        passed: 5,
        total: 5,
      });
      mockPrismaService.runResult.upsert.mockResolvedValue({});

      const result = await service.runQuickTests('task-123', 'code', 'go', undefined, 'user-123');

      expect(result.runValidated).toBe(true);
      expect(mockCacheService.setRunValidated).toHaveBeenCalledWith('user-123', 'task-123', 5);
    });

    it('should not mark as validated when fewer than 5 tests pass', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
      mockAccessControlService.getTaskAccess.mockResolvedValue({ canRun: true });
      mockCodeExecutionService.executeSyncWithTests.mockResolvedValue(mockExecutionResult);
      mockTestParserService.parseTestOutput.mockReturnValue({
        testCases: Array(4).fill({ name: 'Test', passed: true }),
        passed: 4,
        total: 5,
      });

      const result = await service.runQuickTests('task-123', 'code', 'go', undefined, 'user-123');

      expect(result.runValidated).toBe(false);
      expect(mockCacheService.setRunValidated).not.toHaveBeenCalled();
    });

    it('should save run result to database', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
      mockAccessControlService.getTaskAccess.mockResolvedValue({ canRun: true });
      mockCodeExecutionService.executeSyncWithTests.mockResolvedValue(mockExecutionResult);
      mockPrismaService.runResult.upsert.mockResolvedValue({});

      await service.runQuickTests('task-123', 'code', 'go', undefined, 'user-123');

      expect(mockPrismaService.runResult.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId_taskId: {
              userId: 'user-123',
              taskId: 'task-123',
            },
          },
        })
      );
    });

    it('should continue even if run result save fails', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
      mockAccessControlService.getTaskAccess.mockResolvedValue({ canRun: true });
      mockCodeExecutionService.executeSyncWithTests.mockResolvedValue(mockExecutionResult);
      mockPrismaService.runResult.upsert.mockRejectedValue(new Error('DB error'));

      const result = await service.runQuickTests('task-123', 'code', 'go', undefined, 'user-123');

      // Should not throw, just continue
      expect(result.status).toBeDefined();
    });

    it('should not save run result when no userId provided', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
      mockCodeExecutionService.executeSyncWithTests.mockResolvedValue(mockExecutionResult);

      await service.runQuickTests('task-123', 'code', 'go');

      expect(mockPrismaService.runResult.upsert).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // getRunResult() - Get saved run results
  // ============================================
  describe('getRunResult()', () => {
    const mockRunResult = {
      status: 'passed',
      testsPassed: 5,
      testsTotal: 5,
      testCases: [{ name: 'Test1', passed: true }],
      runtime: '10ms',
      message: '',
      code: 'test code',
      updatedAt: new Date(),
    };

    it('should return run result for valid task', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue({ id: 'task-123' });
      mockPrismaService.runResult.findUnique.mockResolvedValue(mockRunResult);

      const result = await service.getRunResult('user-123', 'task-123');

      expect(result).toEqual(mockRunResult);
    });

    it('should return null when task not found', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue(null);

      const result = await service.getRunResult('user-123', 'nonexistent');

      expect(result).toBeNull();
    });

    it('should return null when no run result exists', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue({ id: 'task-123' });
      mockPrismaService.runResult.findUnique.mockResolvedValue(null);

      const result = await service.getRunResult('user-123', 'task-123');

      expect(result).toBeNull();
    });

    it('should resolve task by slug', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue({ id: 'task-123' });
      mockPrismaService.runResult.findUnique.mockResolvedValue(mockRunResult);

      await service.getRunResult('user-123', 'hello-world');

      expect(mockPrismaService.task.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [{ id: 'hello-world' }, { slug: 'hello-world' }],
          },
        })
      );
    });
  });

  // ============================================
  // submitPrompt() - Prompt engineering submissions
  // ============================================
  describe('submitPrompt()', () => {
    const mockPromptTask = {
      id: 'prompt-task-123',
      slug: 'prompt-basics',
      title: 'Prompt Basics',
      difficulty: 'easy',
      taskType: TaskType.PROMPT,
      promptConfig: {
        testScenarios: [
          { input: 'test input', expectedCriteria: ['criterion1'], rubric: 'test rubric' },
        ],
        judgePrompt: 'evaluate this',
        passingScore: 70,
      },
      topic: { module: { courseId: 'course-123' } },
    };

    const mockEvaluation = {
      passed: true,
      score: 8.5,
      summary: 'Good prompt!',
      scenarioResults: [
        { scenarioIndex: 0, input: 'test input', passed: true, score: 8, feedback: 'Good' },
      ],
    };

    it('should evaluate and save prompt submission', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue(mockPromptTask);
      mockAccessControlService.getTaskAccess.mockResolvedValue({ canSubmit: true });
      mockAiService.evaluatePrompt.mockResolvedValue(mockEvaluation);
      mockPrismaService.submission.create.mockResolvedValue({
        id: 'submission-123',
        createdAt: new Date(),
      });
      mockPrismaService.taskCompletion.create.mockResolvedValue({});
      mockGamificationService.awardTaskXp.mockResolvedValue({
        xpEarned: 10,
        totalXp: 10,
        level: 1,
        leveledUp: false,
        newBadges: [],
      });

      const result = await service.submitPrompt('user-123', 'prompt-task-123', 'My prompt');

      expect(result.status).toBe('passed');
      expect(result.score).toBe(85);
      expect(result.scenarioResults).toBeDefined();
      expect(mockAiService.evaluatePrompt).toHaveBeenCalledWith(
        'user-123',
        'My prompt',
        mockPromptTask.promptConfig
      );
    });

    it('should throw NotFoundException for nonexistent task', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue(null);

      await expect(
        service.submitPrompt('user-123', 'nonexistent', 'prompt')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for non-PROMPT task type', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue({
        ...mockPromptTask,
        taskType: TaskType.CODE,
      });

      await expect(
        service.submitPrompt('user-123', 'prompt-task-123', 'prompt')
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for task without promptConfig', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue({
        ...mockPromptTask,
        promptConfig: null,
      });

      await expect(
        service.submitPrompt('user-123', 'prompt-task-123', 'prompt')
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException when canSubmit is false', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue(mockPromptTask);
      mockAccessControlService.getTaskAccess.mockResolvedValue({
        canSubmit: false,
        reason: 'Premium required',
      });

      await expect(
        service.submitPrompt('user-123', 'prompt-task-123', 'prompt')
      ).rejects.toThrow(ForbiddenException);
    });

    it('should handle failed evaluation', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue(mockPromptTask);
      mockAccessControlService.getTaskAccess.mockResolvedValue({ canSubmit: true });
      mockAiService.evaluatePrompt.mockResolvedValue({
        passed: false,
        score: 4.0,
        summary: 'Needs improvement',
        scenarioResults: [
          { scenarioIndex: 0, input: 'test', passed: false, score: 4, feedback: 'Bad' },
        ],
      });
      mockPrismaService.submission.create.mockResolvedValue({
        id: 'submission-123',
        createdAt: new Date(),
      });

      const result = await service.submitPrompt('user-123', 'prompt-task-123', 'prompt');

      expect(result.status).toBe('failed');
      expect(result.score).toBe(40);
    });
  });

  // ============================================
  // awardXpIfFirstCompletion - error handling
  // ============================================
  describe('awardXpIfFirstCompletion() - error handling', () => {
    it('should rethrow non-P2002 errors', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
      mockAccessControlService.getTaskAccess.mockResolvedValue({ canSubmit: true });
      mockAccessControlService.getQueuePriority.mockResolvedValue(1);
      mockCacheService.getRunValidation.mockResolvedValue({ passed: true, testsPassed: 5 });
      mockCodeExecutionService.executeSyncWithTests.mockResolvedValue(mockExecutionResult);
      mockPrismaService.submission.create.mockResolvedValue(mockSubmission);
      // Reset the test mocks to return passed status
      mockTestParserService.parseTestOutput.mockReturnValue({
        testCases: [{ name: 'TestHelloWorld', passed: true }],
        passed: 1,
        total: 1,
      });
      mockTestParserService.determineStatus.mockReturnValue('passed');
      mockTestParserService.calculateScore.mockReturnValue(100);
      // Simulate a different Prisma error (not P2002)
      mockPrismaService.taskCompletion.create.mockRejectedValue(
        new Error('Connection error')
      );

      await expect(
        service.create('user-123', 'task-123', 'code', 'go')
      ).rejects.toThrow('Connection error');
    });
  });
});
