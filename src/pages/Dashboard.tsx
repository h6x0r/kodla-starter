import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AuthContext } from '../components/Layout';
import { courseService } from '../features/courses/api/courseService';
import { taskService } from '../features/tasks/api/taskService';
import { getCourseTheme } from '../utils/themeUtils';
import { IconCheckCircle, IconClock, IconPlay, IconChart } from '../components/Icons';
import { Course, Task } from '../types';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState<Course[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Data via Services
  useEffect(() => {
    if (user) {
        setLoading(true);
        Promise.all([
            courseService.getAllCourses(),
            taskService.getRecentTasks()
        ]).then(([coursesData, tasksData]) => {
            setCourses(coursesData);
            setRecentTasks(tasksData);
            setLoading(false);
        });
    }
  }, [user]);

  const chartData = [
    { name: 'Mon', solved: 4 },
    { name: 'Tue', solved: 3 },
    { name: 'Wed', solved: 7 },
    { name: 'Thu', solved: 5 },
    { name: 'Fri', solved: 8 },
    { name: 'Sat', solved: 12 },
    { name: 'Sun', solved: 9 },
  ];

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="bg-white dark:bg-dark-surface p-12 rounded-3xl shadow-xl max-w-2xl border border-gray-100 dark:border-dark-border">
          <div className="w-20 h-20 bg-brand-100 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl">
            🚀
          </div>
          <h1 className="text-4xl font-display font-bold mb-4 text-gray-900 dark:text-white">Welcome to KODLA</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
            The ultimate platform to master Engineering. Java, Go, System Design, and Algorithms - all in one place.
          </p>
          <div className="flex gap-4 justify-center">
             <Link to="/courses" className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg hover:shadow-brand-500/25 transition-all transform hover:-translate-y-1">
               Browse Catalog
             </Link>
             <Link to="/login" className="px-8 py-3 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-border text-gray-700 dark:text-white font-bold rounded-xl transition-all">
               Log In
             </Link>
          </div>
        </div>
      </div>
    );
  }

  const pendingTasks = recentTasks.filter(t => t.status === 'pending');
  const completedTasks = recentTasks.filter(t => t.status === 'completed');

  if (loading) {
      return <div className="p-10 text-center text-gray-500 animate-pulse">Loading Dashboard...</div>;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Dashboard</h1>
           <p className="text-gray-500 dark:text-gray-400 mt-1">Track your progress and keep the momentum.</p>
        </div>
        <div className="text-right hidden md:block">
           <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Current Streak</div>
           <div className="text-3xl font-display font-bold text-orange-500">🔥 12 Days</div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Solved', val: '142', sub: '+12 this week', color: 'text-brand-500', bg: 'bg-brand-500/10' },
          { label: 'Hours Spent', val: '48h', sub: '2.5h avg/day', color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Global Rank', val: '#842', sub: 'Top 5%', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Skill Points', val: '3.2k', sub: 'Level 14', color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-dark-surface p-5 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                <IconChart className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-1">{stat.val}</div>
            <div className="flex justify-between items-center">
              <div className="text-xs font-bold text-gray-400 uppercase">{stat.label}</div>
              <div className="text-xs font-medium text-green-500">{stat.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Activity Overview</h2>
            <select className="bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border text-xs rounded-lg px-2 py-1 outline-none dark:text-gray-300">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" strokeOpacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', color: '#fff'}}
                  itemStyle={{color: '#fff'}}
                />
                <Area type="monotone" dataKey="solved" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorSolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Lists */}
        <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* Pending Section */}
            {pendingTasks.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <IconClock className="w-3 h-3" /> Pending
                </h3>
                <div className="space-y-2">
                  {pendingTasks.map(task => (
                    <Link to={`/task/${task.slug}`} key={task.id} className="group flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border hover:border-brand-300 transition-colors cursor-pointer">
                       <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                         <div>
                           <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors">{task.title}</div>
                           <div className="text-xs text-gray-500">{task.difficulty} • {task.tags[0]}</div>
                         </div>
                       </div>
                       <IconPlay className="w-4 h-4 text-gray-300 group-hover:text-brand-500" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Section */}
            {completedTasks.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <IconCheckCircle className="w-3 h-3" /> Completed
                </h3>
                <div className="space-y-2">
                  {completedTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 opacity-75">
                       <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-green-500"></div>
                         <div>
                           <div className="text-sm font-medium text-gray-900 dark:text-white line-through decoration-gray-400">{task.title}</div>
                           <div className="text-xs text-gray-500">Score: 100</div>
                         </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
      
      {/* Active Courses row */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Your Active Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           {courses.slice(0, 2).map(course => {
             const theme = getCourseTheme(course.id);
             return (
               <div key={course.id} className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-gray-100 dark:border-dark-border flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-gradient-to-br ${theme.from} ${theme.to} text-white shadow-lg`}>
                   {course.icon}
                 </div>
                 <div className="flex-1">
                   <h3 className="font-bold text-sm text-gray-900 dark:text-white">{course.title}</h3>
                   <div className="w-full h-1.5 bg-gray-100 dark:bg-dark-bg rounded-full mt-2 overflow-hidden">
                     <div className={`h-full bg-gradient-to-r ${theme.from} ${theme.to}`} style={{width: `${course.progress}%`}}></div>
                   </div>
                   <div className="text-xs text-gray-500 mt-1">{course.progress}% Completed</div>
                 </div>
               </div>
             );
           })}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;