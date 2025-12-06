import React from 'react';

export enum AppRoute {
  DASHBOARD = '/',
  COURSES = '/courses',
  ROADMAP = '/roadmap',
  TASK = '/task',
  PROFILE = '/profile',
  PREMIUM = '/premium',
  ANALYTICS = '/analytics',
  SETTINGS = '/settings'
}

export interface NavItemConfig {
  label: string;
  path: string;
  iconKey: string; // String key mapping to an icon component (e.g. 'dashboard', 'book')
  roles?: string[]; // RBAC: which user roles can see this
}

export interface AppRouteConfig {
  path: string;
  element: React.ReactNode;
  layout?: boolean; // Should wrap in Main Layout?
  protected?: boolean; // Requires Auth?
}
