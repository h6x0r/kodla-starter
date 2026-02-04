import React from "react";
import { useUITranslation, useLanguage } from "@/contexts/LanguageContext";
import { CourseAnalyticsItem } from "../../api/adminService";

interface CoursePopularityTableProps {
  courses: CourseAnalyticsItem[];
}

/**
 * Course popularity table with rankings
 */
const CoursePopularityTable: React.FC<CoursePopularityTableProps> = ({
  courses,
}) => {
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

  const sortedCourses = [...courses].sort((a, b) => {
    if (b.totalEnrolled !== a.totalEnrolled) {
      return b.totalEnrolled - a.totalEnrolled;
    }
    return b.completionRate - a.completionRate;
  });

  return (
    <div
      className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm flex flex-col"
      style={{ height: "420px" }}
    >
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex-shrink-0">
        {tUI("admin.coursePopularity")}
      </h2>
      {courses.length > 0 ? (
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Header Row */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-border pb-3 mb-2 pr-4">
            <div className="flex items-center gap-4">
              <div className="w-10" />
              <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {tUI("admin.course")}
              </div>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="w-20 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {tUI("admin.enrolled")}
              </div>
              <div className="w-24 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {tUI("admin.completed")}
              </div>
            </div>
          </div>
          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <div className="divide-y divide-gray-100 dark:divide-dark-border">
              {sortedCourses.map((course, index) => {
                const medal =
                  index === 0
                    ? "🥇"
                    : index === 1
                      ? "🥈"
                      : index === 2
                        ? "🥉"
                        : null;
                return (
                  <div
                    key={course.courseId}
                    className="flex items-center justify-between py-3 hover:bg-gray-50 dark:hover:bg-dark-bg/30 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                          index < 3
                            ? "bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 text-amber-700 dark:text-amber-400"
                            : "bg-gray-100 dark:bg-dark-bg text-gray-500"
                        }`}
                      >
                        {medal || index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {getLocalizedTitle(course)}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {course.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="w-20 text-center text-lg font-bold text-brand-500">
                        {course.totalEnrolled}
                      </div>
                      <div
                        className={`w-24 text-center text-lg font-bold ${
                          course.completionRate >= 50
                            ? "text-green-500"
                            : "text-amber-500"
                        }`}
                      >
                        {course.completionRate.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          {tUI("admin.noEnrollmentData")}
        </div>
      )}
    </div>
  );
};

export default CoursePopularityTable;
