
import React from 'react';
import { AppRouteConfig } from '../types';

// Pages
import DashboardPage from '../pages/Dashboard';
import CoursesPage from '../features/courses/ui/CoursesPage';
import CourseDetailsPage from '../features/courses/ui/CourseDetailsPage';
import TaskWorkspace from '../features/tasks/ui/TaskWorkspace';
import PaymentsPage from '../pages/Payments';
import SettingsPage from '../pages/Settings';
import AnalyticsPage from '../pages/Analytics';
import MyTasksPage from '../pages/MyTasks';
import RoadmapPage from '../pages/Roadmap';
import AuthPage from '../features/auth/ui/AuthPage';

export const routes: AppRouteConfig[] = [
  // Auth Routes (No Layout)
  { path: '/login', element: <AuthPage />, layout: false },
  { path: '/register', element: <AuthPage />, layout: false },

  // Public/Hybrid Routes
  { path: '/', element: <DashboardPage />, layout: true },
  { path: '/courses', element: <CoursesPage />, layout: true },
  { path: '/course/:courseId', element: <CourseDetailsPage />, layout: true },
  
  // Protected Routes (Require Login)
  { path: '/my-tasks', element: <MyTasksPage />, layout: true, protected: true },
  { path: '/roadmap', element: <RoadmapPage />, layout: true, protected: true },
  
  // Task Workspace 
  { path: '/course/:courseId/task/:slug', element: <TaskWorkspace />, layout: true, protected: true },
  { path: '/task/:slug', element: <TaskWorkspace />, layout: true, protected: true },
  
  { path: '/premium', element: <PaymentsPage />, layout: true, protected: true },
  { path: '/payments', element: <PaymentsPage />, layout: true, protected: true },
  { path: '/analytics', element: <AnalyticsPage />, layout: true, protected: true },
  { path: '/settings', element: <SettingsPage />, layout: true, protected: true },
];
