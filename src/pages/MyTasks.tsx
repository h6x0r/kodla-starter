
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseService } from '../features/courses/api/courseService';
import { getCourseTheme } from '../utils/themeUtils';
import { Course } from '../types';
import { IconPlay, IconBook } from '../components/Icons';
import { STORAGE_KEYS } from '../config/constants';

const MyTasksPage = () => {
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
        setLoading(true);
        const allCourses = await courseService.getAllCourses();
        const savedIds = JSON.parse(localStorage.getItem(STORAGE_KEYS.STARTED_COURSES) || '[]');
        const filtered = allCourses.filter(c => savedIds.includes(c.id));
        setMyCourses(filtered);
        setLoading(false);
    };
    fetchCourses();
  }, []);

  if (loading) {
      return <div className="text-center pt-20 text-gray-500 animate-pulse">Loading Progress...</div>;
  }

  if (myCourses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-24 h-24 bg-gray-100 dark:bg-dark-surface rounded-full flex items-center justify-center mb-6">
          <IconBook className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No active courses</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
          You haven't started any courses yet. Visit the catalog to begin your journey.
        </p>
        <Link 
          to="/courses" 
          className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg transition-all"
        >
          Browse Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">My Tasks</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Continue where you left off.</p>
      </div>

      <div className="space-y-4">
        {myCourses.map(course => {
          const theme = getCourseTheme(course.id);
          return (
            <div key={course.id} className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-100 dark:border-dark-border flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm">
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${theme.from} ${theme.to} flex items-center justify-center text-3xl shadow-lg text-white flex-shrink-0`}>
                {course.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{course.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{course.description}</p>
                
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-dark-bg rounded-full overflow-hidden max-w-xs">
                    <div className={`h-full bg-gradient-to-r ${theme.from} ${theme.to}`} style={{width: `${course.progress}%`}}></div>
                  </div>
                  <span className="text-xs font-bold text-gray-500">{course.progress}%</span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                <Link 
                  to={`/course/${course.id}`}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  <IconPlay className="w-4 h-4" />
                  Continue Learning
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyTasksPage;
