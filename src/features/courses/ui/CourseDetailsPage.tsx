
import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { courseService } from '../api/courseService';
import { getCourseTheme } from '../../../utils/themeUtils';
import { IconChevronDown, IconPlay, IconCheckCircle, IconLock, IconClock, IconLayers, IconCpu } from '../../../components/Icons';
import { Course, CourseModule } from '../../../types';

const CourseDetailsPage = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const [course, setCourse] = useState<Course | undefined>(undefined);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'core' | 'frameworks' | 'interview' | 'projects'>('core');

  // Fetch course details and structure
  useEffect(() => {
      if (courseId) {
          setLoading(true);
          Promise.all([
            courseService.getCourseById(courseId),
            courseService.getCourseStructure(courseId)
          ]).then(([c, m]) => {
              setCourse(c);
              setModules(m);
              setLoading(false);
          }).catch(() => setLoading(false));
      }
  }, [courseId]);

  // Update Page Title
  useEffect(() => {
    if (course) {
      document.title = `${course.title} - KODLA`;
    }
  }, [course]);

  const availableSections = Array.from(new Set(modules.map(m => m.section || 'core')));
  const showTabs = availableSections.length > 1;

  const filteredModules = modules.filter(m => (m.section || 'core') === activeSection);

  useEffect(() => {
    if (location.hash && modules.length > 0) {
      const topicId = location.hash.replace('#', '');
      const parentModule = modules.find(m => m.topics.some(t => t.id === topicId));
      if (parentModule) {
        if (parentModule.section) setActiveSection(parentModule.section);
        setExpandedModuleId(parentModule.id);
        
        setTimeout(() => {
            const el = document.getElementById(topicId);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 400);
      }
    }
  }, [location.hash, modules]);

  if (loading) {
      return <div className="p-10 text-center text-gray-500 animate-pulse">Loading Course Details...</div>;
  }

  if (!course) {
    return <div className="p-8 text-center text-gray-500">Course not found.</div>;
  }

  const theme = getCourseTheme(course.id);
  const sectionLabels: Record<string, string> = {
      core: 'Core Curriculum',
      frameworks: 'Frameworks & Libs',
      interview: 'Interview Prep',
      projects: 'Capstone Projects'
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      
      {/* 1. Modern Header */}
      <div className="relative bg-white dark:bg-dark-surface rounded-[2rem] overflow-hidden border border-gray-100 dark:border-dark-border shadow-lg">
         {/* Background Gradient Mesh */}
         <div className={`absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br ${theme.from} ${theme.to} opacity-10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none`}></div>
         
         <div className="relative z-10 p-10 flex flex-col md:flex-row gap-10 items-center md:items-start">
            <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${theme.from} ${theme.to} text-white flex items-center justify-center text-6xl shadow-2xl transform rotate-3 flex-shrink-0`}>
              {course.icon}
            </div>
            
            <div className="flex-1 text-center md:text-left">
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                  <span className="px-3 py-1 bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-gray-400 text-xs font-bold rounded-full border border-gray-200 dark:border-dark-border uppercase tracking-wide">
                     {course.category === 'language' ? 'Language Track' : 'CS Fundamental'}
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-gray-400 text-xs font-bold rounded-full border border-gray-200 dark:border-dark-border">
                     <IconLayers className="w-3 h-3"/> {modules.length} Modules
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-gray-400 text-xs font-bold rounded-full border border-gray-200 dark:border-dark-border">
                     <IconClock className="w-3 h-3"/> {course.estimatedTime}
                  </span>
               </div>
               
               <h1 className="text-5xl font-display font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                 {course.title}
               </h1>
               <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
                 {course.description}
               </p>

               <div className="mt-8 max-w-md w-full mx-auto md:mx-0">
                   <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                     <span>Track Progress</span>
                     <span>{course.progress}%</span>
                   </div>
                   <div className="h-3 bg-gray-100 dark:bg-dark-bg rounded-full overflow-hidden shadow-inner">
                      <div className={`h-full bg-gradient-to-r ${theme.from} ${theme.to}`} style={{width: `${course.progress}%`}}></div>
                   </div>
               </div>
            </div>
         </div>
      </div>

      {/* 2. Section Tabs (If applicable) */}
      {showTabs && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar relative z-20">
           {availableSections.map(sec => (
             <button
               key={sec}
               onClick={() => setActiveSection(sec as any)}
               className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                 activeSection === sec
                   ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-lg'
                   : 'bg-white dark:bg-dark-surface text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-border border border-gray-200 dark:border-dark-border'
               }`}
             >
               {sectionLabels[sec] || sec}
             </button>
           ))}
        </div>
      )}

      {/* 3. Modules Grid (Bento Style) */}
      <div>
        <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-6 pl-2">
            {showTabs ? sectionLabels[activeSection] : 'Curriculum Modules'}
        </h2>
        
        {filteredModules.length === 0 && (
            <div className="text-center py-20 text-gray-400">No content available for this section yet.</div>
        )}

        <div className="grid grid-cols-1 gap-6">
           {filteredModules.map((module, index) => {
             const isExpanded = expandedModuleId === module.id;
             // Calculate module progress based on topics/tasks
             const totalTasks = module.topics.reduce((acc, t) => acc + t.tasks.length, 0);
             const completedTasks = module.topics.reduce((acc, t) => acc + t.tasks.filter(tk => tk.status === 'completed').length, 0);
             const moduleProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
             
             return (
               <div key={module.id} className={`bg-white dark:bg-dark-surface rounded-3xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-brand-500 ring-4 ring-brand-500/10 shadow-xl' : 'border-gray-100 dark:border-dark-border shadow-sm hover:border-gray-300 dark:hover:border-gray-600'}`}>
                  
                  {/* Module Header */}
                  <div 
                    onClick={() => setExpandedModuleId(isExpanded ? null : module.id)}
                    className="p-6 md:p-8 cursor-pointer flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10 group/card"
                  >
                     <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-colors ${isExpanded ? `bg-brand-500 text-white` : 'bg-gray-50 dark:bg-dark-bg text-gray-400 group-hover/card:bg-gray-100 dark:group-hover/card:bg-dark-border'}`}>
                        <IconCpu className="w-8 h-8"/>
                     </div>
                     
                     <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className={`text-xl font-bold transition-colors ${isExpanded ? 'text-brand-600 dark:text-brand-400' : 'text-gray-900 dark:text-white'}`}>
                            {module.title}
                          </h3>
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-dark-bg text-gray-500 text-[10px] font-bold uppercase rounded border border-gray-200 dark:border-dark-border">
                            {module.topics.length} Topics
                          </span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">{module.description}</p>
                     </div>

                     <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                        <div className="w-24 hidden md:block">
                           <div className="h-1.5 bg-gray-100 dark:bg-dark-bg rounded-full overflow-hidden">
                             <div className="h-full bg-green-500" style={{width: `${moduleProgress}%`}}></div>
                           </div>
                           <div className="text-[10px] text-right text-gray-400 mt-1 font-bold">{moduleProgress}% Done</div>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isExpanded ? 'bg-brand-100 text-brand-600 rotate-180' : 'bg-gray-50 dark:bg-dark-bg text-gray-400'}`}>
                           <IconChevronDown className="w-5 h-5"/>
                        </div>
                     </div>
                  </div>

                  {/* Expanded Content (Topics List) */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-black/20 p-4 md:p-8 relative z-0">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {module.topics.map((topic, i) => (
                             <div key={topic.id} id={topic.id} className="bg-white dark:bg-dark-surface p-5 rounded-2xl border border-gray-200 dark:border-dark-border hover:border-brand-300 dark:hover:border-gray-600 transition-colors group">
                                <div className="flex justify-between items-start mb-3">
                                   <div className={`px-2 py-1 text-[10px] font-bold uppercase rounded border ${
                                      topic.difficulty === 'easy' ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/10 dark:text-green-400 dark:border-green-900/30' :
                                      topic.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-600 border-yellow-100 dark:bg-yellow-900/10 dark:text-yellow-400 dark:border-yellow-900/30' :
                                      'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/30'
                                   }`}>
                                      {topic.difficulty}
                                   </div>
                                   {/* Tasks Count & Time */}
                                   <div className="flex items-center gap-2">
                                       <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-dark-bg text-[10px] font-bold text-gray-400">
                                            <IconClock className="w-3 h-3"/> {topic.estimatedTime}
                                       </div>
                                       <div className="text-[10px] font-bold text-gray-400">{topic.tasks.length} Tasks</div>
                                   </div>
                                </div>
                                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1 group-hover:text-brand-600 transition-colors">
                                  {topic.title}
                                </h4>
                                <p className="text-xs text-gray-500 mb-4 line-clamp-2">{topic.description}</p>
                                
                                <div className="space-y-2">
                                   {topic.tasks.map(task => (
                                     <Link 
                                       to={`/course/${course.id}/task/${task.slug}`}
                                       key={task.id} 
                                       className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-dark-bg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors cursor-pointer group/task relative z-10"
                                     >
                                        <div className="flex items-center gap-2 overflow-hidden flex-1">
                                           <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${task.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                           <span className={`text-xs font-medium truncate ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
                                             {task.title}
                                           </span>
                                        </div>
                                        <div className="flex items-center gap-2 pl-2">
                                            <span className="text-[10px] text-gray-400 font-mono hidden group-hover/task:block">{task.estimatedTime}</span>
                                            {task.isPremium && <IconLock className="w-3 h-3 text-amber-500 flex-shrink-0"/>}
                                        </div>
                                     </Link>
                                   ))}
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                  )}
               </div>
             );
           })}
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;
