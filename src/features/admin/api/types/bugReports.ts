export type BugCategory =
  | "description"
  | "solution"
  | "editor"
  | "hints"
  | "ai-tutor"
  | "other";
export type BugSeverity = "low" | "medium" | "high";
export type BugStatus =
  | "open"
  | "in-progress"
  | "resolved"
  | "closed"
  | "wont-fix";

export interface BugReport {
  id: string;
  userId: string;
  taskId: string | null;
  category: BugCategory;
  severity: BugSeverity;
  status: BugStatus;
  title: string;
  description: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  user: { name: string; email: string };
  task: { title: string; slug: string } | null;
}
