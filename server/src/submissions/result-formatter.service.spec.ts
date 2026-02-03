import { ResultFormatterService } from './result-formatter.service';
import { ExecutionResult } from '../judge0/judge0.service';

// Helper to create ExecutionResult with required fields
const createResult = (partial: Partial<ExecutionResult>): ExecutionResult => ({
  status: 'passed',
  statusId: 3,
  description: 'Accepted',
  stdout: '',
  stderr: '',
  compileOutput: '',
  time: '0.01',
  memory: 0,
  exitCode: 0,
  message: '',
  ...partial,
});

describe('ResultFormatterService', () => {
  let service: ResultFormatterService;

  beforeEach(() => {
    service = new ResultFormatterService();
  });

  describe('formatRuntime()', () => {
    it('should convert seconds to milliseconds', () => {
      expect(service.formatRuntime('0.125')).toBe('125ms');
    });

    it('should handle numeric input', () => {
      expect(service.formatRuntime(0.05)).toBe('50ms');
    });

    it('should round to nearest millisecond', () => {
      expect(service.formatRuntime('0.1234')).toBe('123ms');
    });

    it('should return "-" for dash input', () => {
      expect(service.formatRuntime('-')).toBe('-');
    });

    it('should return "-" for empty string', () => {
      expect(service.formatRuntime('')).toBe('-');
    });

    it('should return "-" for null', () => {
      expect(service.formatRuntime(null as any)).toBe('-');
    });

    it('should return "-" for undefined', () => {
      expect(service.formatRuntime(undefined as any)).toBe('-');
    });

    it('should return "-" for invalid number string', () => {
      expect(service.formatRuntime('invalid')).toBe('-');
    });

    it('should handle zero', () => {
      expect(service.formatRuntime('0')).toBe('0ms');
    });

    it('should handle very small values', () => {
      expect(service.formatRuntime('0.001')).toBe('1ms');
    });
  });

  describe('formatMemory()', () => {
    it('should convert bytes to MB', () => {
      expect(service.formatMemory(10485760)).toBe('10.0MB'); // 10 MB
    });

    it('should show one decimal place', () => {
      expect(service.formatMemory(13107200)).toBe('12.5MB'); // 12.5 MB
    });

    it('should return "-" for zero', () => {
      expect(service.formatMemory(0)).toBe('-');
    });

    it('should return "-" for undefined', () => {
      expect(service.formatMemory(undefined)).toBe('-');
    });

    it('should return "-" for unrealistically high values (>1GB)', () => {
      expect(service.formatMemory(2 * 1024 * 1024 * 1024)).toBe('-'); // 2 GB
    });

    it('should handle small memory values', () => {
      expect(service.formatMemory(1048576)).toBe('1.0MB'); // 1 MB
    });
  });

  describe('formatMetrics()', () => {
    it('should format both runtime and memory', () => {
      const result = createResult({
        time: '0.05',
        memory: 10485760,
      });

      const metrics = service.formatMetrics(result);

      expect(metrics.runtime).toBe('50ms');
      expect(metrics.memory).toBe('10.0MB');
    });

    it('should handle missing metrics', () => {
      const result = createResult({
        time: '-',
        memory: 0,
      });

      const metrics = service.formatMetrics(result);

      expect(metrics.runtime).toBe('-');
      expect(metrics.memory).toBe('-');
    });
  });

  describe('formatMessage()', () => {
    it('should return empty string for passed status', () => {
      const result = createResult({
        status: 'passed',
        stdout: 'output',
      });

      expect(service.formatMessage(result)).toBe('');
    });

    it('should return compile output for compile errors', () => {
      const result = createResult({
        status: 'compileError',
        compileOutput: 'syntax error on line 5',
      });

      expect(service.formatMessage(result)).toBe('syntax error on line 5');
    });

    it('should return default message for compile error without output', () => {
      const result = createResult({
        status: 'compileError',
        compileOutput: '',
      });

      expect(service.formatMessage(result)).toBe('Compilation failed');
    });

    it('should return timeout message', () => {
      const result = createResult({
        status: 'timeout',
      });

      expect(service.formatMessage(result)).toBe('Time limit exceeded');
    });

    it('should return stderr for runtime errors', () => {
      const result = createResult({
        status: 'error',
        stderr: 'panic: index out of range',
      });

      expect(service.formatMessage(result)).toBe('panic: index out of range');
    });

    it('should return message for runtime errors without stderr', () => {
      const result = createResult({
        status: 'error',
        stderr: '',
        message: 'Execution failed',
      });

      expect(service.formatMessage(result)).toBe('Execution failed');
    });

    it('should return default for runtime errors without message or stderr', () => {
      const result = createResult({
        status: 'error',
        stderr: '',
        message: '',
      });

      expect(service.formatMessage(result)).toBe('Runtime error');
    });

    it('should return message for failed tests', () => {
      const result = createResult({
        status: 'failed',
        message: '3 of 5 tests failed',
      });

      expect(service.formatMessage(result)).toBe('3 of 5 tests failed');
    });

    it('should return default for failed tests without message', () => {
      const result = createResult({
        status: 'failed',
        message: '',
      });

      expect(service.formatMessage(result)).toBe('Tests failed');
    });
  });

  describe('getStatusLabel()', () => {
    it('should return correct labels for all statuses', () => {
      expect(service.getStatusLabel('passed')).toBe('PASSED');
      expect(service.getStatusLabel('failed')).toBe('FAILED');
      expect(service.getStatusLabel('timeout')).toBe('TIMEOUT');
      expect(service.getStatusLabel('compileError')).toBe('COMPILE_ERROR');
      expect(service.getStatusLabel('error')).toBe('ERROR');
    });

    it('should return UNKNOWN for unknown status', () => {
      expect(service.getStatusLabel('unknown')).toBe('UNKNOWN');
    });
  });

  describe('getXpForDifficulty()', () => {
    it('should return correct XP for each difficulty', () => {
      expect(service.getXpForDifficulty('easy')).toBe(10);
      expect(service.getXpForDifficulty('medium')).toBe(25);
      expect(service.getXpForDifficulty('hard')).toBe(50);
      expect(service.getXpForDifficulty('expert')).toBe(100);
    });

    it('should return easy XP for unknown difficulty', () => {
      expect(service.getXpForDifficulty('unknown')).toBe(10);
    });
  });
});
