import { Course, Topic, CourseModule } from '../../../types';
import { GO_TOPICS, JAVA_TOPICS, ALGO_TOPICS, SYS_TOPICS } from '../../tasks/data/mockData';

export const COURSES: Course[] = [
  { 
    id: 'c_go',
    category: 'language',
    title: 'Go Language', 
    description: 'Master Go from syntax to high-performance concurrency patterns.',
    icon: '🐹', 
    progress: 12,
    totalTopics: 26,
    estimatedTime: '56h'
  },
  { 
    id: 'c_java', 
    category: 'language',
    title: 'Java Ecology', 
    description: 'Enterprise grade Java, Spring Boot, and JVM internals.',
    icon: '☕', 
    progress: 45,
    totalTopics: 14,
    estimatedTime: '64h'
  },
  { 
    id: 'c_algo', 
    category: 'cs',
    title: 'Algorithms & DS', 
    description: 'Ace your technical interview with core computer science concepts.',
    icon: '⚡', 
    progress: 75,
    totalTopics: 12,
    estimatedTime: '40h'
  },
  { 
    id: 'c_sys', 
    category: 'cs',
    title: 'System Design', 
    description: 'Learn to design scalable, reliable, and maintainable systems.',
    icon: '🏗️', 
    progress: 0,
    totalTopics: 8,
    estimatedTime: '25h'
  },
];

// Helper to get raw topics
export const getTopicsForCourse = (courseId: string): Topic[] => {
  if (courseId === 'c_go') return GO_TOPICS;
  if (courseId === 'c_java') return JAVA_TOPICS;
  if (courseId === 'c_algo') return ALGO_TOPICS;
  if (courseId === 'c_sys') return SYS_TOPICS;
  return [];
};