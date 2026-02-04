import React from "react";
import { useUITranslation, useLanguage } from "@/contexts/LanguageContext";
import { TaskAnalyticsItem, CourseAnalyticsItem } from "../../api/adminService";

interface HardestTasksTableProps {
  tasks: TaskAnalyticsItem[];
}

/**
 * Hardest tasks table - sorted by pass rate (ascending)
 */
export const HardestTasksTable: React.FC<HardestTasksTableProps> = ({
  tasks,
}) => {
  const { tUI } = useUITranslation();

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.passRate !== b.passRate) {
      return a.passRate - b.passRate;
    }
    return b.totalSubmissions - a.totalSubmissions;
  });

  return (
    <div
      className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm flex flex-col"
      style={{ height: "380px" }}
    >
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex-shrink-0">
        {tUI("admin.hardestTasks")}
      </h2>
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header Row */}
        <div className="flex items-center border-b border-gray-100 dark:border-dark-border pb-3 mb-2">
          <div className="flex-1 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {tUI("admin.task")}
          </div>
          <div className="w-24 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {tUI("admin.submissions")}
          </div>
          <div className="w-28 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {tUI("admin.passRate")}
          </div>
        </div>
        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <div className="divide-y divide-gray-100 dark:divide-dark-border">
            {sortedTasks.map((task) => (
              <div
                key={task.taskId}
                className="flex items-center py-3 hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors -mx-2 px-2 rounded-lg"
              >
                <div className="flex-1 text-sm text-gray-900 dark:text-white font-medium truncate pr-4">
                  {task.taskTitle}
                </div>
                <div className="w-24 text-center text-sm text-gray-600 dark:text-gray-300">
                  {task.totalSubmissions}
                </div>
                <div className="w-28 text-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                      task.passRate < 30
                        ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                        : task.passRate < 60
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                          : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    }`}
                  >
                    {task.passRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface TopCoursesByCompletionTableProps {
  courses: CourseAnalyticsItem[];
}

/**
 * Top courses by completion rate table
 */
export const TopCoursesByCompletionTable: React.FC<
  TopCoursesByCompletionTableProps
> = ({ courses }) => {
  const { tUI } = useUITranslation();
  const { language } = useLanguage();

  const getLocalizedTitle = (course: CourseAnalyticsItem): string => {
    if (language === "en") return course.courseTitle;
    const translations = course.translations;
    if (translations && translations[language]?.title) {
      return translations[language].title;
    }
    return course.courseTitle;
  };

  const sortedCourses = [...courses].sort(
    (a, b) => b.completionRate - a.completionRate
  );

  return (
    <div
      className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm flex flex-col"
      style={{ height: "380px" }}
    >
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex-shrink-0">
        {tUI("admin.topCoursesByCompletion")}
      </h2>
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header Row */}
        <div className="flex items-center border-b border-gray-100 dark:border-dark-border pb-3 mb-2">
          <div className="flex-1 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {tUI("admin.course")}
          </div>
          <div className="w-24 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {tUI("admin.completions")}
          </div>
          <div className="w-24 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {tUI("admin.rate")}
          </div>
        </div>
        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <div className="divide-y divide-gray-100 dark:divide-dark-border">
            {sortedCourses.map((course) => (
              <div
                key={course.courseId}
                className="flex items-center py-3 hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors -mx-2 px-2 rounded-lg"
              >
                <div className="flex-1 text-sm text-gray-900 dark:text-white font-medium truncate pr-4">
                  {getLocalizedTitle(course)}
                </div>
                <div className="w-24 text-center text-sm text-gray-600 dark:text-gray-300">
                  {course.completed}
                </div>
                <div className="w-24 text-center">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                    {course.completionRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface TaskAnalyticsTablesRowProps {
  hardestTasks: TaskAnalyticsItem[];
  courses: CourseAnalyticsItem[];
}

/**
 * Combined row with both tables
 */
const TaskAnalyticsTablesRow: React.FC<TaskAnalyticsTablesRowProps> = ({
  hardestTasks,
  courses,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <TopCoursesByCompletionTable courses={courses} />
      <HardestTasksTable tasks={hardestTasks} />
    </div>
  );
};

export default TaskAnalyticsTablesRow;
