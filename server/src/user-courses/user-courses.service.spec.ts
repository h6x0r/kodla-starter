import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserCoursesService } from './user-courses.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UserCoursesService', () => {
  let service: UserCoursesService;
  let prisma: PrismaService;

  const mockCourse = {
    id: 'course-123',
    slug: 'go-basics',
    title: 'Go Basics',
    description: 'Learn Go fundamentals',
    category: 'go',
    icon: '🐹',
    estimatedTime: '20h',
    translations: {},
  };

  const mockUserCourse = {
    id: 'uc-123',
    userId: 'user-123',
    courseSlug: 'go-basics',
    progress: 50,
    startedAt: new Date('2025-01-01'),
    lastAccessedAt: new Date('2025-01-15'),
    completedAt: null,
  };

  const mockPrismaService = {
    userCourse: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
    course: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserCoursesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UserCoursesService>(UserCoursesService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ============================================
  // getUserCourses()
  // ============================================
  describe('getUserCourses()', () => {
    it('should return user courses with details', async () => {
      mockPrismaService.userCourse.findMany.mockResolvedValue([mockUserCourse]);
      mockPrismaService.course.findMany.mockResolvedValue([mockCourse]);

      const result = await service.getUserCourses('user-123');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: mockCourse.id,
        slug: mockCourse.slug,
        title: mockCourse.title,
        progress: mockUserCourse.progress,
      });
    });

    it('should return empty array for user with no courses', async () => {
      mockPrismaService.userCourse.findMany.mockResolvedValue([]);

      const result = await service.getUserCourses('user-no-courses');

      expect(result).toEqual([]);
    });

    it('should filter out courses that no longer exist', async () => {
      mockPrismaService.userCourse.findMany.mockResolvedValue([mockUserCourse]);
      mockPrismaService.course.findMany.mockResolvedValue([]); // Course not found

      const result = await service.getUserCourses('user-123');

      expect(result).toEqual([]);
    });

    it('should order by lastAccessedAt desc', async () => {
      mockPrismaService.userCourse.findMany.mockResolvedValue([]);

      await service.getUserCourses('user-123');

      expect(mockPrismaService.userCourse.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { lastAccessedAt: 'desc' },
      });
    });

    it('should log and rethrow database errors', async () => {
      const dbError = new Error('Database connection failed');
      mockPrismaService.userCourse.findMany.mockRejectedValue(dbError);

      await expect(service.getUserCourses('user-123')).rejects.toThrow('Database connection failed');
    });

    it('should handle non-Error objects in catch block', async () => {
      mockPrismaService.userCourse.findMany.mockRejectedValue('String error');

      await expect(service.getUserCourses('user-123')).rejects.toBe('String error');
    });
  });

  // ============================================
  // startCourse()
  // ============================================
  describe('startCourse()', () => {
    it('should start a new course for user', async () => {
      mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);
      mockPrismaService.userCourse.upsert.mockResolvedValue(mockUserCourse);

      const result = await service.startCourse('user-123', 'go-basics');

      expect(result).toMatchObject({
        id: mockCourse.id,
        slug: mockCourse.slug,
        title: mockCourse.title,
        progress: mockUserCourse.progress,
      });
    });

    it('should throw NotFoundException if course does not exist', async () => {
      mockPrismaService.course.findUnique.mockResolvedValue(null);

      await expect(
        service.startCourse('user-123', 'nonexistent-course'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update lastAccessedAt for existing course', async () => {
      mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);
      mockPrismaService.userCourse.upsert.mockResolvedValue(mockUserCourse);

      await service.startCourse('user-123', 'go-basics');

      expect(mockPrismaService.userCourse.upsert).toHaveBeenCalledWith({
        where: {
          userId_courseSlug: {
            userId: 'user-123',
            courseSlug: 'go-basics',
          },
        },
        update: expect.objectContaining({
          lastAccessedAt: expect.any(Date),
        }),
        create: expect.objectContaining({
          userId: 'user-123',
          courseSlug: 'go-basics',
          progress: 0,
        }),
      });
    });
  });

  // ============================================
  // updateProgress()
  // ============================================
  describe('updateProgress()', () => {
    it('should update course progress', async () => {
      mockPrismaService.userCourse.findUnique.mockResolvedValue(mockUserCourse);
      mockPrismaService.userCourse.update.mockResolvedValue({
        ...mockUserCourse,
        progress: 75,
      });

      const result = await service.updateProgress('user-123', 'go-basics', 75);

      expect(result.progress).toBe(75);
    });

    it('should throw error for invalid progress value (negative)', async () => {
      await expect(
        service.updateProgress('user-123', 'go-basics', -10),
      ).rejects.toThrow('Progress must be between 0 and 100');
    });

    it('should throw error for invalid progress value (over 100)', async () => {
      await expect(
        service.updateProgress('user-123', 'go-basics', 150),
      ).rejects.toThrow('Progress must be between 0 and 100');
    });

    it('should throw NotFoundException if user has not started course', async () => {
      mockPrismaService.userCourse.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProgress('user-123', 'not-started-course', 50),
      ).rejects.toThrow(NotFoundException);
    });

    it('should set completedAt when progress is 100%', async () => {
      mockPrismaService.userCourse.findUnique.mockResolvedValue(mockUserCourse);
      mockPrismaService.userCourse.update.mockResolvedValue({
        ...mockUserCourse,
        progress: 100,
        completedAt: new Date(),
      });

      await service.updateProgress('user-123', 'go-basics', 100);

      expect(mockPrismaService.userCourse.update).toHaveBeenCalledWith({
        where: expect.any(Object),
        data: expect.objectContaining({
          progress: 100,
          completedAt: expect.any(Date),
        }),
      });
    });

    it('should clear completedAt when progress is not 100%', async () => {
      mockPrismaService.userCourse.findUnique.mockResolvedValue(mockUserCourse);
      mockPrismaService.userCourse.update.mockResolvedValue({
        ...mockUserCourse,
        progress: 50,
        completedAt: null,
      });

      await service.updateProgress('user-123', 'go-basics', 50);

      expect(mockPrismaService.userCourse.update).toHaveBeenCalledWith({
        where: expect.any(Object),
        data: expect.objectContaining({
          progress: 50,
          completedAt: null,
        }),
      });
    });
  });

  // ============================================
  // updateLastAccessed()
  // ============================================
  describe('updateLastAccessed()', () => {
    it('should update lastAccessedAt for existing course', async () => {
      mockPrismaService.userCourse.upsert.mockResolvedValue({
        ...mockUserCourse,
        lastAccessedAt: new Date(),
      });

      const result = await service.updateLastAccessed('user-123', 'go-basics');

      expect(result).toHaveProperty('lastAccessedAt');
    });

    it('should create new record if course not started', async () => {
      mockPrismaService.userCourse.upsert.mockResolvedValue({
        ...mockUserCourse,
        progress: 0,
      });

      await service.updateLastAccessed('user-123', 'new-course');

      expect(mockPrismaService.userCourse.upsert).toHaveBeenCalledWith({
        where: {
          userId_courseSlug: {
            userId: 'user-123',
            courseSlug: 'new-course',
          },
        },
        update: expect.objectContaining({
          lastAccessedAt: expect.any(Date),
        }),
        create: expect.objectContaining({
          userId: 'user-123',
          courseSlug: 'new-course',
          progress: 0,
        }),
      });
    });

    it('should log and rethrow database errors', async () => {
      const dbError = new Error('Database connection lost');
      mockPrismaService.userCourse.upsert.mockRejectedValue(dbError);

      await expect(
        service.updateLastAccessed('user-123', 'go-basics')
      ).rejects.toThrow('Database connection lost');
    });

    it('should handle non-Error objects in catch block', async () => {
      mockPrismaService.userCourse.upsert.mockRejectedValue('Unexpected error');

      await expect(
        service.updateLastAccessed('user-123', 'go-basics')
      ).rejects.toBe('Unexpected error');
    });
  });

  // ============================================
  // Error handling edge cases
  // ============================================
  describe('error handling', () => {
    it('should log and rethrow errors in startCourse', async () => {
      mockPrismaService.course.findUnique.mockRejectedValue(new Error('DB Error'));

      await expect(
        service.startCourse('user-123', 'go-basics')
      ).rejects.toThrow('DB Error');
    });

    it('should handle non-Error in startCourse catch', async () => {
      mockPrismaService.course.findUnique.mockRejectedValue({ code: 'P2025' });

      await expect(
        service.startCourse('user-123', 'go-basics')
      ).rejects.toEqual({ code: 'P2025' });
    });

    it('should log and rethrow errors in updateProgress', async () => {
      mockPrismaService.userCourse.findUnique.mockRejectedValue(new Error('Connection timeout'));

      await expect(
        service.updateProgress('user-123', 'go-basics', 50)
      ).rejects.toThrow('Connection timeout');
    });

    it('should handle non-Error in updateProgress catch', async () => {
      mockPrismaService.userCourse.findUnique.mockRejectedValue('Query failed');

      await expect(
        service.updateProgress('user-123', 'go-basics', 50)
      ).rejects.toBe('Query failed');
    });
  });
});
