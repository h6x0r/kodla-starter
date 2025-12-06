
import React, { useState, useEffect, useContext } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { analyticsService } from '../features/analytics/api/analyticsService';
import { AuthContext } from '../components/Layout';
import { Link } from 'react-router-dom';

const AnalyticsPage = () => {
  const { user } = useContext(AuthContext);
  const [weekOffset, setWeekOffset] = useState(0);
  const [hoveredCell, setHoveredCell] = useState<{date: string, count: number, x: number, y: number} | null>(null);
  
  // Data States
  const [weeklyData, setWeeklyData] = useState<{ name: string; tasks: number }[]>([]);
  const [yearlyData, setYearlyData] = useState<{ date: string; intensity: number; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
        setLoading(true);
        Promise.all([
            analyticsService.getWeeklyStats(weekOffset),
            analyticsService.getYearlyContributions()
        ]).then(([week, year]) => {
            setWeeklyData(week);
            setYearlyData(year);
            setLoading(false);
        });
    }
  }, [user, weekOffset]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
         <div className="w-16 h-16 bg-gray-100 dark:bg-dark-surface rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
         </div>
         <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Login to view Analytics</h2>
         <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">Track your daily progress, heatmaps, and skill growth over time.</p>
         <Link to="/login" className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-colors">
            Sign In
         </Link>
      </div>
    );
  }

  // Helper to calculate date range string (e.g. "Nov 20 - Nov 26")
  const getDateRangeLabel = (offset: number) => {
    const today = new Date();
    // Move to the target week
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - (offset * 7));

    // Calculate Monday of that week
    const day = targetDate.getDay(); // 0 is Sunday
    const diffToMon = targetDate.getDate() - day + (day === 0 ? -6 : 1); 
    const monday = new Date(targetDate);
    monday.setDate(diffToMon);

    // Calculate Sunday
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    return `${fmt(monday)} - ${fmt(sunday)}`;
  };

  const formatHeatmapDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handlePrevWeek = () => setWeekOffset(prev => prev + 1);
  const handleNextWeek = () => setWeekOffset(prev => Math.max(0, prev - 1));

  const handleCellHover = (e: React.MouseEvent, day: {date: string, count: number}) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredCell({
      date: day.date,
      count: day.count,
      x: rect.left + rect.width / 2,
      y: rect.top - 8 // Offset above cell
    });
  };

  const handleCellLeave = () => {
    setHoveredCell(null);
  };

  if (loading) {
      return <div className="p-10 text-center text-gray-500 animate-pulse">Loading Analytics Engine...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Deep dive into your performance metrics and skill growth.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Weekly Activity Bar Chart (with Navigation) */}
        <div className="bg-white dark:bg-dark-surface p-8 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold text-gray-900 dark:text-white">Weekly Activity</h2>
             
             {/* Simple Navigation */}
             <div className="flex items-center gap-3 bg-gray-50 dark:bg-dark-bg p-1 rounded-lg">
                <button onClick={handlePrevWeek} className="p-1 hover:bg-white dark:hover:bg-dark-surface rounded shadow-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300 min-w-[100px] text-center select-none">
                  {getDateRangeLabel(weekOffset)}
                </span>
                <button 
                  onClick={handleNextWeek} 
                  disabled={weekOffset === 0}
                  className={`p-1 rounded shadow-sm text-gray-500 ${weekOffset === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white dark:hover:bg-dark-surface'}`}
                >
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
             </div>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" strokeOpacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', color: '#fff'}}
                />
                <Bar dataKey="tasks" fill="#0ea5e9" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center text-sm text-gray-500">
             {weekOffset === 0 
               ? <span>You are on fire! <span className="text-brand-500 font-bold">61 tasks</span> solved this week.</span>
               : <span>Historical data for the week of {getDateRangeLabel(weekOffset)}.</span>
             }
          </div>
        </div>

        {/* Contribution Heatmap (GitHub Style) */}
        <div className="bg-white dark:bg-dark-surface p-8 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm flex flex-col relative">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Yearly Contributions</h2>
          <div className="flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-[repeat(53,1fr)] gap-1">
              {yearlyData.slice(0, 364).map((day, i) => (
                 <div 
                   key={i} 
                   onMouseEnter={(e) => handleCellHover(e, day)}
                   onMouseLeave={handleCellLeave}
                   className={`w-full aspect-square rounded-[2px] cursor-pointer transition-colors ${
                     day.intensity === 0 ? 'bg-gray-100 dark:bg-dark-bg/50' :
                     day.intensity === 1 ? 'bg-green-200 dark:bg-green-900/40' :
                     day.intensity === 2 ? 'bg-green-400 dark:bg-green-700' :
                     day.intensity === 3 ? 'bg-green-500 dark:bg-green-600' :
                     'bg-green-600 dark:bg-green-500'
                   } hover:ring-2 ring-gray-400 dark:ring-gray-500`}
                 ></div>
              ))}
            </div>
            
            <div className="flex justify-end items-center gap-2 mt-4 text-xs text-gray-400">
              <span>Less</span>
              <div className="w-3 h-3 bg-gray-100 dark:bg-dark-bg/50 rounded-[2px]"></div>
              <div className="w-3 h-3 bg-green-200 dark:bg-green-900/40 rounded-[2px]"></div>
              <div className="w-3 h-3 bg-green-400 dark:bg-green-700 rounded-[2px]"></div>
              <div className="w-3 h-3 bg-green-600 dark:bg-green-500 rounded-[2px]"></div>
              <span>More</span>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-dark-border grid grid-cols-3 text-center">
               <div>
                 <div className="text-2xl font-bold text-gray-900 dark:text-white">1,240</div>
                 <div className="text-xs text-gray-400 uppercase font-bold mt-1">Total Submissions</div>
               </div>
               <div>
                 <div className="text-2xl font-bold text-gray-900 dark:text-white">342</div>
                 <div className="text-xs text-gray-400 uppercase font-bold mt-1">Max Streak</div>
               </div>
               <div>
                 <div className="text-2xl font-bold text-gray-900 dark:text-white">42</div>
                 <div className="text-xs text-gray-400 uppercase font-bold mt-1">Current Streak</div>
               </div>
            </div>
          </div>

          {/* Floating Tooltip */}
          {hoveredCell && (
            <div 
              className="fixed z-50 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full whitespace-nowrap"
              style={{ left: hoveredCell.x, top: hoveredCell.y }}
            >
               <div className="font-bold">{hoveredCell.count === 0 ? 'No activity' : `${hoveredCell.count} tasks completed`}</div>
               <div className="text-gray-400 text-[10px] uppercase font-bold mt-0.5">{formatHeatmapDate(hoveredCell.date)}</div>
               {/* Arrow */}
               <div className="absolute left-1/2 -bottom-1 w-2 h-2 bg-gray-900 transform -translate-x-1/2 rotate-45"></div>
            </div>
          )}

        </div>

      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Completion Rate', val: '84%', color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Avg. Runtime', val: '12ms', color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Total XP', val: '14,200', color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-100 dark:border-dark-border flex items-center justify-between">
            <div>
              <div className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{s.label}</div>
              <div className="text-3xl font-display font-bold text-gray-900 dark:text-white">{s.val}</div>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${s.bg} ${s.color}`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsPage;
