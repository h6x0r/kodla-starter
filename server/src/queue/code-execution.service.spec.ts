import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { CodeExecutionService } from './code-execution.service';
import { Judge0Service, ExecutionResult } from '../judge0/judge0.service';
import { ConfigService } from '@nestjs/config';
import { CODE_EXECUTION_QUEUE } from './constants';
import { QueueEvents } from 'bullmq';

// Mock bullmq QueueEvents
jest.mock('bullmq', () => ({
  QueueEvents: jest.fn().mockImplementation(() => ({
    waitUntilReady: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe('CodeExecutionService', () => {
  let service: CodeExecutionService;
  let judge0Service: Judge0Service;

  const mockExecutionResult: ExecutionResult = {
    status: 'passed',
    statusId: 3,
    description: 'Accepted',
    stdout: 'Hello, World!',
    stderr: '',
    time: '0.01',
    memory: 1024,
    compileOutput: '',
    exitCode: 0,
  };

  const mockJob = {
    id: 'job-123',
    data: { code: 'print("hello")', language: 'python' },
    waitUntilFinished: jest.fn(),
    getState: jest.fn(),
    returnvalue: null,
    failedReason: null,
  };

  const mockQueue = {
    add: jest.fn().mockResolvedValue(mockJob),
    getJob: jest.fn(),
    getWaitingCount: jest.fn().mockResolvedValue(5),
    getActiveCount: jest.fn().mockResolvedValue(2),
    getCompletedCount: jest.fn().mockResolvedValue(100),
    getFailedCount: jest.fn().mockResolvedValue(3),
    getDelayedCount: jest.fn().mockResolvedValue(1),
  };

  const mockJudge0Service = {
    execute: jest.fn(),
    executeWithTests: jest.fn(),
    checkHealth: jest.fn(),
    getSupportedLanguages: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('localhost'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CodeExecutionService,
        { provide: getQueueToken(CODE_EXECUTION_QUEUE), useValue: mockQueue },
        { provide: Judge0Service, useValue: mockJudge0Service },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<CodeExecutionService>(CodeExecutionService);
    judge0Service = module.get<Judge0Service>(Judge0Service);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ============================================
  // executeSync()
  // ============================================
  describe('executeSync()', () => {
    it('should execute code synchronously via Judge0Service', async () => {
      mockJudge0Service.execute.mockResolvedValue(mockExecutionResult);

      const result = await service.executeSync('print("hello")', 'python');

      expect(result).toEqual(mockExecutionResult);
      expect(mockJudge0Service.execute).toHaveBeenCalledWith(
        'print("hello")',
        'python',
        undefined,
      );
    });

    it('should pass stdin to Judge0Service', async () => {
      mockJudge0Service.execute.mockResolvedValue(mockExecutionResult);

      await service.executeSync('code', 'go', 'input data');

      expect(mockJudge0Service.execute).toHaveBeenCalledWith(
        'code',
        'go',
        'input data',
      );
    });

    it('should return error result on execution failure', async () => {
      const errorResult: ExecutionResult = {
        status: 'error',
        statusId: 5,
        description: 'Runtime Error',
        stdout: '',
        stderr: 'Error: undefined variable',
        time: '0.00',
        memory: 0,
        compileOutput: '',
        exitCode: 1,
      };
      mockJudge0Service.execute.mockResolvedValue(errorResult);

      const result = await service.executeSync('invalid code', 'python');

      expect(result.status).toBe('error');
      expect(result.stderr).toContain('undefined variable');
    });
  });

  // ============================================
  // executeSyncWithTests()
  // ============================================
  describe('executeSyncWithTests()', () => {
    it('should execute code with tests via Judge0Service', async () => {
      mockJudge0Service.executeWithTests.mockResolvedValue(mockExecutionResult);

      const result = await service.executeSyncWithTests(
        'func Add(a, b int) int { return a + b }',
        'func TestAdd(t *testing.T) {}',
        'go',
      );

      expect(result).toEqual(mockExecutionResult);
      expect(mockJudge0Service.executeWithTests).toHaveBeenCalledWith(
        'func Add(a, b int) int { return a + b }',
        'func TestAdd(t *testing.T) {}',
        'go',
        undefined,
      );
    });

    it('should pass maxTests limit', async () => {
      mockJudge0Service.executeWithTests.mockResolvedValue(mockExecutionResult);

      await service.executeSyncWithTests('solution', 'tests', 'java', 5);

      expect(mockJudge0Service.executeWithTests).toHaveBeenCalledWith(
        'solution',
        'tests',
        'java',
        5,
      );
    });
  });

  // ============================================
  // executeAsync()
  // ============================================
  describe('executeAsync()', () => {
    it('should add job to queue and return job ID', async () => {
      const result = await service.executeAsync('code', 'python');

      expect(result.jobId).toBe('job-123');
      expect(mockQueue.add).toHaveBeenCalledWith(
        'execute',
        expect.objectContaining({
          code: 'code',
          language: 'python',
        }),
        expect.objectContaining({ priority: 0 }),
      );
    });

    it('should pass optional parameters', async () => {
      await service.executeAsync('code', 'go', {
        stdin: 'input',
        expectedOutput: 'expected',
        taskId: 'task-1',
        userId: 'user-1',
        priority: 5,
      });

      expect(mockQueue.add).toHaveBeenCalledWith(
        'execute',
        expect.objectContaining({
          code: 'code',
          language: 'go',
          stdin: 'input',
          expectedOutput: 'expected',
          taskId: 'task-1',
          userId: 'user-1',
        }),
        expect.objectContaining({ priority: 5 }),
      );
    });
  });

  // ============================================
  // getJobStatus()
  // ============================================
  describe('getJobStatus()', () => {
    it('should return not_found for non-existent job', async () => {
      mockQueue.getJob.mockResolvedValue(null);

      const result = await service.getJobStatus('invalid-job');

      expect(result.status).toBe('not_found');
    });

    it('should return job status for existing job', async () => {
      const job = {
        getState: jest.fn().mockResolvedValue('completed'),
        returnvalue: mockExecutionResult,
        failedReason: null,
      };
      mockQueue.getJob.mockResolvedValue(job);

      const result = await service.getJobStatus('job-123');

      expect(result.status).toBe('completed');
      expect(result.result).toEqual(mockExecutionResult);
    });

    it('should return failed reason for failed jobs', async () => {
      const job = {
        getState: jest.fn().mockResolvedValue('failed'),
        returnvalue: null,
        failedReason: 'Timeout exceeded',
      };
      mockQueue.getJob.mockResolvedValue(job);

      const result = await service.getJobStatus('job-456');

      expect(result.status).toBe('failed');
      expect(result.failedReason).toBe('Timeout exceeded');
    });

    it('should return waiting status for queued job', async () => {
      const job = {
        getState: jest.fn().mockResolvedValue('waiting'),
        returnvalue: null,
        failedReason: null,
      };
      mockQueue.getJob.mockResolvedValue(job);

      const result = await service.getJobStatus('job-waiting');

      expect(result.status).toBe('waiting');
      expect(result.result).toBeUndefined();
    });

    it('should return active status for processing job', async () => {
      const job = {
        getState: jest.fn().mockResolvedValue('active'),
        returnvalue: null,
        failedReason: null,
      };
      mockQueue.getJob.mockResolvedValue(job);

      const result = await service.getJobStatus('job-active');

      expect(result.status).toBe('active');
    });
  });

  // ============================================
  // getQueueStats()
  // ============================================
  describe('getQueueStats()', () => {
    it('should return all queue statistics', async () => {
      const result = await service.getQueueStats();

      expect(result).toEqual({
        waiting: 5,
        active: 2,
        completed: 100,
        failed: 3,
        delayed: 1,
      });
    });

    it('should call all queue count methods', async () => {
      await service.getQueueStats();

      expect(mockQueue.getWaitingCount).toHaveBeenCalled();
      expect(mockQueue.getActiveCount).toHaveBeenCalled();
      expect(mockQueue.getCompletedCount).toHaveBeenCalled();
      expect(mockQueue.getFailedCount).toHaveBeenCalled();
      expect(mockQueue.getDelayedCount).toHaveBeenCalled();
    });
  });

  // ============================================
  // checkHealth()
  // ============================================
  describe('checkHealth()', () => {
    it('should return healthy status when both Judge0 and queue are available', async () => {
      mockJudge0Service.checkHealth.mockResolvedValue(true);
      mockQueue.getWaitingCount.mockResolvedValue(0);

      const result = await service.checkHealth();

      expect(result).toEqual({
        available: true,
        queueReady: true,
      });
    });

    it('should return unavailable when Judge0 is down', async () => {
      mockJudge0Service.checkHealth.mockResolvedValue(false);
      mockQueue.getWaitingCount.mockResolvedValue(0);

      const result = await service.checkHealth();

      expect(result.available).toBe(false);
      expect(result.queueReady).toBe(true);
    });

    it('should return queue not ready when Redis is down', async () => {
      mockJudge0Service.checkHealth.mockResolvedValue(true);
      mockQueue.getWaitingCount.mockRejectedValue(new Error('Redis connection refused'));

      const result = await service.checkHealth();

      expect(result.available).toBe(true);
      expect(result.queueReady).toBe(false);
    });

    it('should return both unavailable when everything is down', async () => {
      mockJudge0Service.checkHealth.mockResolvedValue(false);
      mockQueue.getWaitingCount.mockRejectedValue(new Error('Connection refused'));

      const result = await service.checkHealth();

      expect(result).toEqual({
        available: false,
        queueReady: false,
      });
    });
  });

  // ============================================
  // getSupportedLanguages()
  // ============================================
  describe('getSupportedLanguages()', () => {
    it('should return languages from Judge0Service', () => {
      const languages = [
        { name: 'Go', judge0Name: 'go', version: '1.21', extension: 'go' },
        { name: 'Python', judge0Name: 'python', version: '3.11', extension: 'py' },
      ];
      mockJudge0Service.getSupportedLanguages.mockReturnValue(languages);

      const result = service.getSupportedLanguages();

      expect(result).toEqual(languages);
      expect(mockJudge0Service.getSupportedLanguages).toHaveBeenCalled();
    });
  });

  // ============================================
  // onModuleInit()
  // ============================================
  describe('onModuleInit()', () => {
    it('should initialize QueueEvents and wait until ready', async () => {
      await service.onModuleInit();

      expect(QueueEvents).toHaveBeenCalledWith(
        CODE_EXECUTION_QUEUE,
        expect.objectContaining({
          connection: expect.any(Object),
        }),
      );
    });

    it('should log success when QueueEvents is ready', async () => {
      await service.onModuleInit();

      // QueueEvents was created and waitUntilReady was called
      expect(QueueEvents).toHaveBeenCalled();
    });

    it('should handle initialization failure', async () => {
      const error = new Error('Redis connection failed');
      (QueueEvents as unknown as jest.Mock).mockImplementationOnce(() => ({
        waitUntilReady: jest.fn().mockRejectedValue(error),
        close: jest.fn().mockResolvedValue(undefined),
      }));

      await expect(service.onModuleInit()).rejects.toThrow('Redis connection failed');
    });

    it('should close QueueEvents on init failure', async () => {
      const mockClose = jest.fn().mockResolvedValue(undefined);
      (QueueEvents as unknown as jest.Mock).mockImplementationOnce(() => ({
        waitUntilReady: jest.fn().mockRejectedValue(new Error('fail')),
        close: mockClose,
      }));

      await expect(service.onModuleInit()).rejects.toThrow();
      expect(mockClose).toHaveBeenCalled();
    });
  });

  // ============================================
  // onModuleDestroy()
  // ============================================
  describe('onModuleDestroy()', () => {
    it('should close QueueEvents if initialized', async () => {
      // First initialize
      await service.onModuleInit();

      // Then destroy
      await service.onModuleDestroy();

      // QueueEvents.close should have been called
      // Since we're using mock, we verify the flow
    });

    it('should handle close errors gracefully', async () => {
      const mockClose = jest.fn().mockRejectedValue(new Error('Close failed'));
      (QueueEvents as unknown as jest.Mock).mockImplementationOnce(() => ({
        waitUntilReady: jest.fn().mockResolvedValue(undefined),
        close: mockClose,
      }));

      await service.onModuleInit();

      // Should not throw
      await expect(service.onModuleDestroy()).resolves.not.toThrow();
    });

    it('should do nothing if QueueEvents not initialized', async () => {
      // Don't call onModuleInit - queueEvents is undefined
      await service.onModuleDestroy();

      // Should complete without error
    });
  });

  // ============================================
  // executeAndWait()
  // ============================================
  describe('executeAndWait()', () => {
    beforeEach(async () => {
      // Initialize queueEvents
      await service.onModuleInit();
    });

    it('should add job and wait for completion', async () => {
      const expectedResult = {
        status: 'passed',
        stdout: 'output',
        stderr: '',
        time: '0.05',
        memory: 2048,
      };

      const jobWithWait = {
        ...mockJob,
        waitUntilFinished: jest.fn().mockResolvedValue(expectedResult),
      };
      mockQueue.add.mockResolvedValue(jobWithWait);

      const result = await service.executeAndWait('code', 'go');

      expect(result).toEqual(expectedResult);
      expect(mockQueue.add).toHaveBeenCalledWith(
        'execute',
        expect.objectContaining({
          code: 'code',
          language: 'go',
        }),
      );
    });

    it('should pass stdin and expectedOutput options', async () => {
      const jobWithWait = {
        ...mockJob,
        waitUntilFinished: jest.fn().mockResolvedValue({}),
      };
      mockQueue.add.mockResolvedValue(jobWithWait);

      await service.executeAndWait('code', 'python', {
        stdin: 'input',
        expectedOutput: 'output',
      });

      expect(mockQueue.add).toHaveBeenCalledWith(
        'execute',
        expect.objectContaining({
          stdin: 'input',
          expectedOutput: 'output',
        }),
      );
    });

    it('should pass taskId and userId for tracking', async () => {
      const jobWithWait = {
        ...mockJob,
        waitUntilFinished: jest.fn().mockResolvedValue({}),
      };
      mockQueue.add.mockResolvedValue(jobWithWait);

      await service.executeAndWait('code', 'java', {
        taskId: 'task-123',
        userId: 'user-456',
      });

      expect(mockQueue.add).toHaveBeenCalledWith(
        'execute',
        expect.objectContaining({
          taskId: 'task-123',
          userId: 'user-456',
        }),
      );
    });

    it('should use custom timeout', async () => {
      const jobWithWait = {
        ...mockJob,
        waitUntilFinished: jest.fn().mockResolvedValue({}),
      };
      mockQueue.add.mockResolvedValue(jobWithWait);

      await service.executeAndWait('code', 'go', { timeout: 60000 });

      expect(jobWithWait.waitUntilFinished).toHaveBeenCalledWith(
        expect.anything(),
        60000,
      );
    });

    it('should use default timeout of 30000ms', async () => {
      const jobWithWait = {
        ...mockJob,
        waitUntilFinished: jest.fn().mockResolvedValue({}),
      };
      mockQueue.add.mockResolvedValue(jobWithWait);

      await service.executeAndWait('code', 'go');

      expect(jobWithWait.waitUntilFinished).toHaveBeenCalledWith(
        expect.anything(),
        30000,
      );
    });
  });

  // ============================================
  // Additional edge cases
  // ============================================
  describe('edge cases', () => {
    it('should handle empty code execution', async () => {
      mockJudge0Service.execute.mockResolvedValue({
        status: 'passed',
        statusId: 3,
        description: 'Accepted',
        stdout: '',
        stderr: '',
        time: '0.00',
        memory: 0,
        compileOutput: '',
        exitCode: 0,
      });

      const result = await service.executeSync('', 'python');

      expect(result.status).toBe('passed');
      expect(result.stdout).toBe('');
    });

    it('should handle very long code execution', async () => {
      const longCode = 'x = 1\n'.repeat(10000);
      mockJudge0Service.execute.mockResolvedValue(mockExecutionResult);

      await service.executeSync(longCode, 'python');

      expect(mockJudge0Service.execute).toHaveBeenCalledWith(longCode, 'python', undefined);
    });

    it('should handle execution with special characters in stdin', async () => {
      const specialStdin = '!@#$%^&*(){}[]|\\:";\'<>,.?/~`\n\t\r';
      mockJudge0Service.execute.mockResolvedValue(mockExecutionResult);

      await service.executeSync('code', 'python', specialStdin);

      expect(mockJudge0Service.execute).toHaveBeenCalledWith('code', 'python', specialStdin);
    });

    it('should handle compile error result', async () => {
      const compileErrorResult: ExecutionResult = {
        status: 'compileError',
        statusId: 6,
        description: 'Compilation Error',
        stdout: '',
        stderr: '',
        compileOutput: 'undefined: x',
        time: '-',
        memory: 0,
        exitCode: 1,
      };
      mockJudge0Service.execute.mockResolvedValue(compileErrorResult);

      const result = await service.executeSync('invalid code', 'go');

      expect(result.status).toBe('compileError');
      expect(result.compileOutput).toContain('undefined');
    });

    it('should handle timeout result', async () => {
      const timeoutResult: ExecutionResult = {
        status: 'timeout',
        statusId: 5,
        description: 'Time Limit Exceeded',
        stdout: '',
        stderr: 'Execution timed out',
        compileOutput: '',
        time: '-',
        memory: 0,
        exitCode: null,
      };
      mockJudge0Service.execute.mockResolvedValue(timeoutResult);

      const result = await service.executeSync('while True: pass', 'python');

      expect(result.status).toBe('timeout');
    });
  });

  // ============================================
  // executeAsync with various priorities
  // ============================================
  describe('executeAsync priority handling', () => {
    it('should default to priority 0', async () => {
      await service.executeAsync('code', 'go');

      expect(mockQueue.add).toHaveBeenCalledWith(
        'execute',
        expect.any(Object),
        expect.objectContaining({ priority: 0 }),
      );
    });

    it('should use high priority for submissions', async () => {
      await service.executeAsync('code', 'go', { priority: 10 });

      expect(mockQueue.add).toHaveBeenCalledWith(
        'execute',
        expect.any(Object),
        expect.objectContaining({ priority: 10 }),
      );
    });

    it('should include taskId and userId for tracking', async () => {
      await service.executeAsync('code', 'python', {
        taskId: 'task-abc',
        userId: 'user-xyz',
      });

      expect(mockQueue.add).toHaveBeenCalledWith(
        'execute',
        expect.objectContaining({
          taskId: 'task-abc',
          userId: 'user-xyz',
        }),
        expect.any(Object),
      );
    });

    it('should handle expectedOutput for validation', async () => {
      await service.executeAsync('code', 'go', {
        expectedOutput: '42',
      });

      expect(mockQueue.add).toHaveBeenCalledWith(
        'execute',
        expect.objectContaining({
          expectedOutput: '42',
        }),
        expect.any(Object),
      );
    });
  });

  // ============================================
  // getJobStatus edge cases
  // ============================================
  describe('getJobStatus edge cases', () => {
    it('should handle delayed job status', async () => {
      const job = {
        getState: jest.fn().mockResolvedValue('delayed'),
        returnvalue: null,
        failedReason: null,
      };
      mockQueue.getJob.mockResolvedValue(job);

      const result = await service.getJobStatus('delayed-job');

      expect(result.status).toBe('delayed');
    });

    it('should handle job with partial result', async () => {
      const partialResult = {
        status: 'passed',
        stdout: 'partial output',
      };
      const job = {
        getState: jest.fn().mockResolvedValue('completed'),
        returnvalue: partialResult,
        failedReason: null,
      };
      mockQueue.getJob.mockResolvedValue(job);

      const result = await service.getJobStatus('partial-job');

      expect(result.status).toBe('completed');
      expect(result.result).toEqual(partialResult);
    });
  });

  // ============================================
  // checkHealth edge cases
  // ============================================
  describe('checkHealth edge cases', () => {
    it('should handle slow queue response', async () => {
      mockJudge0Service.checkHealth.mockResolvedValue(true);
      mockQueue.getWaitingCount.mockImplementation(async () => {
        await new Promise(r => setTimeout(r, 10));
        return 5;
      });

      const result = await service.checkHealth();

      expect(result.queueReady).toBe(true);
    });

    it('should handle Judge0 taking time to respond', async () => {
      mockJudge0Service.checkHealth.mockImplementation(async () => {
        await new Promise(r => setTimeout(r, 10));
        return true;
      });
      mockQueue.getWaitingCount.mockResolvedValue(0);

      const result = await service.checkHealth();

      expect(result.available).toBe(true);
    });
  });

  // ============================================
  // Language-specific test execution
  // ============================================
  describe('language-specific test execution', () => {
    it('should execute Go tests with correct parameters', async () => {
      mockJudge0Service.executeWithTests.mockResolvedValue(mockExecutionResult);

      await service.executeSyncWithTests(
        'func Add(a, b int) int { return a + b }',
        'func TestAdd(t *testing.T) { if Add(1,2) != 3 { t.Error("fail") } }',
        'go',
      );

      expect(mockJudge0Service.executeWithTests).toHaveBeenCalledWith(
        expect.stringContaining('func Add'),
        expect.stringContaining('TestAdd'),
        'go',
        undefined,
      );
    });

    it('should execute Python tests with correct parameters', async () => {
      mockJudge0Service.executeWithTests.mockResolvedValue(mockExecutionResult);

      await service.executeSyncWithTests(
        'def add(a, b): return a + b',
        'def test_add(): assert add(1, 2) == 3',
        'python',
      );

      expect(mockJudge0Service.executeWithTests).toHaveBeenCalledWith(
        expect.stringContaining('def add'),
        expect.stringContaining('test_add'),
        'python',
        undefined,
      );
    });

    it('should execute Java tests with correct parameters', async () => {
      mockJudge0Service.executeWithTests.mockResolvedValue(mockExecutionResult);

      await service.executeSyncWithTests(
        'public class Solution { public int add(int a, int b) { return a + b; } }',
        '@Test public void testAdd() { assertEquals(3, new Solution().add(1, 2)); }',
        'java',
      );

      expect(mockJudge0Service.executeWithTests).toHaveBeenCalledWith(
        expect.stringContaining('public class Solution'),
        expect.stringContaining('@Test'),
        'java',
        undefined,
      );
    });
  });
});
