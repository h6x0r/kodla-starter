import { Task } from '../../tasks/model/types';

export type CourseCategory = 'language' | 'cs' | 'interview';

export interface Course {
  id: string;
  category: CourseCategory;
  title: string;
  description: string;
  icon: string; // Emoji or icon name (URLs are fine from backend)
  progress: number;
  totalTopics: number;
  estimatedTime: string; // e.g. "56h"
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string; // e.g. "2h"
  tasks: Task[]; // Hierarchy: Course -> Topic -> Task
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  section?: 'core' | 'frameworks' | 'interview' | 'projects'; // New categorization
  topics: Topic[];
}

export interface Track {
  id: string;
  courseId: string; // Link to parent course
  title: string;
  description: string;
  progress: number; // 0-100
  totalTasks: number;
  completedTasks: number;
}
