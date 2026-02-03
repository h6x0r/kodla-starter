import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CodeExecutionProcessor, CodeExecutionJob, CodeExecutionResult } from './code-execution.processor';
import { Judge0Service, ExecutionResult } from '../judge0/judge0.service';
import { DEAD_LETTER_QUEUE } from './constants';

describe('CodeExecutionProcessor', () => {
  let processor: CodeExecutionProcessor;
  let judge0Service: Judge0Service;

  const mockJudge0Service = {
    execute: jest.fn(),
  };

  const mockDeadLetterQueue = {
    add: jest.fn(),
  };

  const createMockJob = (data: Partial<CodeExecutionJob>): Job<CodeExecutionJob> => {
    return {
      id: 'job-123',
      data: {
        code: data.code || 'print("hello")',
        language: data.language || 'python',
        stdin: data.stdin,
        expectedOutput: data.expectedOutput,
        taskId: data.taskId,
        userId: data.userId,
      },
      opts: {
        attempts: 3,
      },
      attemptsMade: 0,
      getState: jest.fn().mockResolvedValue('waiting'), // Not completed
      returnvalue: null,
    } as unknown as Job<CodeExecutionJob>;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CodeExecutionProcessor,
        { provide: Judge0Service, useValue: mockJudge0Service },
        { provide: getQueueToken(DEAD_LETTER_QUEUE), useValue: mockDeadLetterQueue },
      ],
    }).compile();

    processor = module.get<CodeExecutionProcessor>(CodeExecutionProcessor);
    judge0Service = module.get<Judge0Service>(Judge0Service);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  // ============================================
  // process()
  // ============================================
  describe('process()', () => {
    it('should execute code and return result', async () => {
      const executionResult: ExecutionResult = {
        status: 'passed',
        statusId: 3,
        description: 'Accepted',
        stdout: 'Hello, World!',
        stderr: '',
        time: '0.05',
        memory: 2048,
        compileOutput: '',
        exitCode: 0,
      };
      mockJudge0Service.execute.mockResolvedValue(executionResult);

      const job = createMockJob({ code: 'print("Hello, World!")', language: 'python' });
      const result = await processor.process(job);

      expect(result.status).toBe('passed');
      expect(result.stdout).toBe('Hello, World!');
      expect(result.jobId).toBe('job-123');
    });

    it('should pass stdin to Judge0Service', async () => {
      mockJudge0Service.execute.mockResolvedValue({
        status: 'passed',
        statusId: 3,
        description: 'Accepted',
        stdout: 'received input',
        stderr: '',
        time: '0.01',
        memory: 1024,
      });

      const job = createMockJob({
        code: 'input()',
        language: 'python',
        stdin: 'test input',
      });
      await processor.process(job);

      expect(mockJudge0Service.execute).toHaveBeenCalledWith(
        'input()',
        'python',
        'test input',
      );
    });

    it('should include taskId and userId in result', async () => {
      mockJudge0Service.execute.mockResolvedValue({
        status: 'passed',
        statusId: 3,
        description: 'Accepted',
        stdout: 'output',
        stderr: '',
        time: '0.01',
        memory: 1024,
      });

      const job = createMockJob({
        code: 'code',
        language: 'go',
        taskId: 'task-abc',
        userId: 'user-xyz',
      });
      const result = await processor.process(job);

      expect(result.taskId).toBe('task-abc');
      expect(result.userId).toBe('user-xyz');
    });

    it('should mark as failed when output does not match expected', async () => {
      mockJudge0Service.execute.mockResolvedValue({
        status: 'passed',
        statusId: 3,
        description: 'Accepted',
        stdout: 'wrong output',
        stderr: '',
        time: '0.01',
        memory: 1024,
      });

      const job = createMockJob({
        code: 'print("wrong output")',
        language: 'python',
        expectedOutput: 'correct output',
      });
      const result = await processor.process(job);

      expect(result.status).toBe('failed');
      expect(result.statusId).toBe(4);
      expect(result.description).toBe('Wrong Answer');
      expect(result.message).toBe('Output does not match expected result');
    });

    it('should pass when output matches expected (with trimming)', async () => {
      mockJudge0Service.execute.mockResolvedValue({
        status: 'passed',
        statusId: 3,
        description: 'Accepted',
        stdout: '  correct output  \n',
        stderr: '',
        time: '0.01',
        memory: 1024,
      });

      const job = createMockJob({
        code: 'code',
        language: 'python',
        expectedOutput: 'correct output',
      });
      const result = await processor.process(job);

      expect(result.status).toBe('passed');
    });

    it('should not check expected output on error', async () => {
      mockJudge0Service.execute.mockResolvedValue({
        status: 'error',
        statusId: 5,
        description: 'Runtime Error',
        stdout: 'wrong',
        stderr: 'some error',
        time: '0.01',
        memory: 1024,
      });

      const job = createMockJob({
        code: 'invalid code',
        language: 'python',
        expectedOutput: 'correct output',
      });
      const result = await processor.process(job);

      // Status should remain 'error', not 'failed'
      expect(result.status).toBe('error');
    });

    it('should handle compilation errors', async () => {
      mockJudge0Service.execute.mockResolvedValue({
        status: 'compileError',
        statusId: 6,
        description: 'Compilation Error',
        stdout: '',
        stderr: '',
        compileOutput: 'syntax error: unexpected EOF',
        time: '0.00',
        memory: 0,
      });

      const job = createMockJob({ code: 'invalid go code', language: 'go' });
      const result = await processor.process(job);

      expect(result.status).toBe('compileError');
      expect(result.compileOutput).toContain('syntax error');
    });

    it('should handle timeout', async () => {
      mockJudge0Service.execute.mockResolvedValue({
        status: 'timeout',
        statusId: 7,
        description: 'Timeout',
        stdout: '',
        stderr: 'Execution timed out',
        time: '30.00',
        memory: 0,
      });

      const job = createMockJob({ code: 'while True: pass', language: 'python' });
      const result = await processor.process(job);

      expect(result.status).toBe('timeout');
    });

    it('should handle memory limit exceeded', async () => {
      mockJudge0Service.execute.mockResolvedValue({
        status: 'error',
        statusId: 8,
        description: 'Memory Limit Exceeded',
        stdout: '',
        stderr: 'Out of memory',
        time: '0.50',
        memory: 268435456,
      });

      const job = createMockJob({ code: 'x = [0] * 10**9', language: 'python' });
      const result = await processor.process(job);

      expect(result.status).toBe('error');
      expect(result.description).toBe('Memory Limit Exceeded');
    });
  });

  // ============================================
  // Worker Events (logging)
  // ============================================
  describe('worker events', () => {
    it('should have onCompleted handler', () => {
      const job = createMockJob({ code: 'code', language: 'python' });

      // Should not throw
      expect(() => processor.onCompleted(job)).not.toThrow();
    });

    it('should have onFailed handler', () => {
      const job = createMockJob({ code: 'code', language: 'python' });
      const error = new Error('Test error');

      // Should not throw
      expect(() => processor.onFailed(job, error)).not.toThrow();
    });

    it('should have onActive handler', () => {
      const job = createMockJob({ code: 'code', language: 'python' });

      // Should not throw
      expect(() => processor.onActive(job)).not.toThrow();
    });

    it('should have onStalled handler', () => {
      // Should not throw
      expect(() => processor.onStalled('job-stalled')).not.toThrow();
    });
  });
});
