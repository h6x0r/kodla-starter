import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { COURSES } from '../data/mockData';
import { getCourseTheme } from '../../../utils/themeUtils';
import { CourseCategory } from '../../../types';
import { IconClock, IconCode, IconBook, IconLayers } from '../../../components/Icons';

const CoursesPage = () => {
  const navigate = useNavigate();
  const [startedCourses, setStartedCourses] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | CourseCategory>('all');

  useEffect(() => {
    const saved = localStorage.getItem('kodla_started_courses');
    if (saved) {
      setStartedCourses(JSON.parse(saved));
    }
  }, []);

  const handleStartCourse = (e: React.MouseEvent, courseId: string) => {
    // Prevent bubbling if wrapped in link
    e.preventDefault();
    e.stopPropagation();
    
    if (!startedCourses.includes(courseId)) {
      const updated = [...startedCourses, courseId];
      setStartedCourses(updated);
      localStorage.setItem('kodla_started_courses', JSON.stringify(updated));
    }
    navigate(`/course/${courseId}`);
  };

  const filteredCourses = activeTab === 'all' 
    ? COURSES 
    : COURSES.filter(c => c.category === activeTab);

  const tabs = [
    { id: 'all', label: 'All Tracks' },
    { id: 'language', label: 'Programming Languages' },
    { id: 'cs', label: 'Computer Science' },
    { id: 'interview', label: 'Interview Prep' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white dark:bg-dark-surface rounded-3xl p-10 border border-gray-100 dark:border-dark-border shadow-sm">
        <div className="relative z-10">
          <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">Learning Catalog</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
            Structured learning paths designed by principal engineers. 
            Choose a language track to master its ecosystem, or dive into core computer science concepts.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar relative z-20">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-lg'
                : 'bg-white dark:bg-dark-surface text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-border border border-gray-200 dark:border-dark-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCourses.map(course => {
          const isStarted = startedCourses.includes(course.id);
          const theme = getCourseTheme(course.id);
          return (
            <div 
              key={course.id} 
              className="group relative flex flex-col bg-white dark:bg-dark-surface rounded-3xl p-1 border border-gray-100 dark:border-dark-border hover:border-brand-200 dark:hover:border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-brand-900/5"
            >
              {/* Card Content Wrapper */}
              <div className="p-7 flex flex-col h-full rounded-[20px] bg-white dark:bg-dark-surface overflow-hidden relative z-10">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-6 relative z-10 pointer-events-none">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${theme.from} ${theme.to} text-white flex items-center justify-center text-3xl shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    {course.icon}
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                     <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                        course.category === 'language' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-900/30' :
                        'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/10 dark:text-purple-400 dark:border-purple-900/30'
                     }`}>
                        {course.category === 'language' ? 'Language Track' : 'CS Core'}
                     </span>
                  </div>
                </div>

                <Link to={`/course/${course.id}`} className="block relative z-20">
                    <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {course.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-8 flex-1">
                    {course.description}
                    </p>
                </Link>

                {/* Metrics */}
                <Link to={`/course/${course.id}`} className="grid grid-cols-2 gap-4 mb-8 relative z-20 cursor-pointer">
                   <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-bg rounded-xl">
                      <div className="bg-white dark:bg-dark-surface p-1.5 rounded-lg text-gray-400 shadow-sm">
                        <IconLayers className="w-4 h-4"/>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">{course.totalTopics}</div>
                        <div className="text-[10px] uppercase font-bold text-gray-400">Topics</div>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-bg rounded-xl">
                      <div className="bg-white dark:bg-dark-surface p-1.5 rounded-lg text-gray-400 shadow-sm">
                        <IconClock className="w-4 h-4"/>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">{course.estimatedTime}</div>
                        <div className="text-[10px] uppercase font-bold text-gray-400">Duration</div>
                      </div>
                   </div>
                </Link>

                {/* Action - High Z-Index to prevent click blocking */}
                <div className="mt-auto pt-6 border-t border-gray-100 dark:border-dark-border flex items-center justify-between relative z-30">
                   {isStarted ? (
                     <div className="flex items-center gap-2 text-green-500 font-bold text-sm">
                       <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                       In Progress ({course.progress}%)
                     </div>
                   ) : (
                     <div className="text-sm font-bold text-gray-400">Not Started</div>
                   )}

                   {isStarted ? (
                      <Link 
                        to={`/course/${course.id}`}
                        className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
                      >
                        Resume
                      </Link>
                   ) : (
                      <button 
                        onClick={(e) => handleStartCourse(e, course.id)}
                        className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 transition-all transform hover:-translate-y-0.5"
                      >
                        Start Learning
                      </button>
                   )}
                </div>

              </div>
              
              {/* Background Decor - Explicitly Z-0 to stay behind */}
              <div className={`absolute -bottom-12 -right-12 w-48 h-48 bg-gradient-to-br ${theme.from} ${theme.to} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity z-0 pointer-events-none`}></div>
            </div>
          );
        })}
      </div>
      
      {filteredCourses.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-dark-surface rounded-3xl border border-gray-100 dark:border-dark-border border-dashed">
              <div className="text-4xl mb-4">🚧</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Coming Soon</h3>
              <p className="text-gray-500">We are crafting new premium content for this category.</p>
          </div>
      )}
    </div>
  );
};

export default CoursesPage;