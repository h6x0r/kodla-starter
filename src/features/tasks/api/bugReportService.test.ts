import { describe, it, expect, beforeEach, vi } from 'vitest';
import { bugReportService } from './bugReportService';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  }),
}));

import { api } from '@/lib/api';

describe('bugReportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('submit', () => {
    it('should submit a bug report', async () => {
      const mockReport = {
        id: 'report-1',
        title: 'Test bug',
        description: 'Something is broken',
        category: 'editor' as const,
        severity: 'medium' as const,
        userId: 'user-1',
        status: 'open',
        createdAt: '2025-01-16T00:00:00Z',
        updatedAt: '2025-01-16T00:00:00Z',
      };

      vi.mocked(api.post).mockResolvedValueOnce(mockReport);

      const result = await bugReportService.submit({
        title: 'Test bug',
        description: 'Something is broken',
        category: 'editor',
        severity: 'medium',
      });

      expect(api.post).toHaveBeenCalledWith('/bugreports', {
        title: 'Test bug',
        description: 'Something is broken',
        category: 'editor',
        severity: 'medium',
      });
      expect(result.id).toBe('report-1');
      expect(result.status).toBe('open');
    });

    it('should submit bug report with task context', async () => {
      const mockReport = {
        id: 'report-2',
        title: 'Task description error',
        description: 'Wrong expected output',
        category: 'description' as const,
        severity: 'high' as const,
        taskId: 'task-123',
        userId: 'user-1',
        status: 'open',
        createdAt: '2025-01-16T00:00:00Z',
        updatedAt: '2025-01-16T00:00:00Z',
        task: { title: 'Hello World', slug: 'hello-world' },
      };

      vi.mocked(api.post).mockResolvedValueOnce(mockReport);

      const result = await bugReportService.submit({
        title: 'Task description error',
        description: 'Wrong expected output',
        category: 'description',
        severity: 'high',
        taskId: 'task-123',
      });

      expect(api.post).toHaveBeenCalledWith('/bugreports', expect.objectContaining({
        taskId: 'task-123',
      }));
      expect(result.task?.slug).toBe('hello-world');
    });

    it('should submit bug report with metadata', async () => {
      const mockReport = {
        id: 'report-3',
        title: 'Editor crash',
        description: 'Editor freezes on paste',
        category: 'editor' as const,
        severity: 'high' as const,
        userId: 'user-1',
        status: 'open',
        createdAt: '2025-01-16T00:00:00Z',
        updatedAt: '2025-01-16T00:00:00Z',
        metadata: {
          userCode: 'console.log("test")',
          browserInfo: 'Chrome 120',
          url: 'https://practix.dev/tasks/hello-world',
        },
      };

      vi.mocked(api.post).mockResolvedValueOnce(mockReport);

      await bugReportService.submit({
        title: 'Editor crash',
        description: 'Editor freezes on paste',
        category: 'editor',
        severity: 'high',
        metadata: {
          userCode: 'console.log("test")',
          browserInfo: 'Chrome 120',
          url: 'https://practix.dev/tasks/hello-world',
        },
      });

      expect(api.post).toHaveBeenCalledWith('/bugreports', expect.objectContaining({
        metadata: expect.objectContaining({
          userCode: 'console.log("test")',
        }),
      }));
    });

    it('should throw on API error', async () => {
      vi.mocked(api.post).mockRejectedValueOnce(new Error('Server error'));

      await expect(bugReportService.submit({
        title: 'Test',
        description: 'Test',
        category: 'other',
        severity: 'low',
      })).rejects.toThrow('Server error');
    });
  });

  describe('getMyReports', () => {
    it('should fetch user bug reports', async () => {
      const mockReports = [
        {
          id: 'report-1',
          title: 'Bug 1',
          description: 'Description 1',
          category: 'editor' as const,
          severity: 'medium' as const,
          status: 'open',
          createdAt: '2025-01-15T00:00:00Z',
          updatedAt: '2025-01-15T00:00:00Z',
        },
        {
          id: 'report-2',
          title: 'Bug 2',
          description: 'Description 2',
          category: 'solution' as const,
          severity: 'low' as const,
          status: 'resolved',
          createdAt: '2025-01-10T00:00:00Z',
          updatedAt: '2025-01-12T00:00:00Z',
        },
      ];

      vi.mocked(api.get).mockResolvedValueOnce(mockReports);

      const result = await bugReportService.getMyReports();

      expect(api.get).toHaveBeenCalledWith('/bugreports/my');
      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('open');
      expect(result[1].status).toBe('resolved');
    });

    it('should return empty array for no reports', async () => {
      vi.mocked(api.get).mockResolvedValueOnce([]);

      const result = await bugReportService.getMyReports();

      expect(result).toHaveLength(0);
    });

    it('should throw on API error', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Unauthorized'));

      await expect(bugReportService.getMyReports()).rejects.toThrow('Unauthorized');
    });
  });
});
