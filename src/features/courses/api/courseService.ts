import { Course, CourseModule } from '../../../types';
import { api } from '../../../services/api';

export const courseService = {
  
  getAllCourses: async (): Promise<Course[]> => {
    return api.get<Course[]>('/courses');
  },

  getCourseById: async (id: string): Promise<Course | undefined> => {
    return api.get<Course>(`/courses/${id}`);
  },

  getCourseStructure: async (courseId: string): Promise<CourseModule[]> => {
    return api.get<CourseModule[]>(`/courses/${courseId}/structure`);
  }
};