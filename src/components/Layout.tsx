
import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  IconDashboard, IconBook, IconCode, IconChart, IconSettings, 
  IconMoon, IconSun, IconSparkles, IconCreditCard, IconMap
} from './Icons';
import { User, NavItemConfig } from '../types';
import { configService } from '../features/config/api/configService';

export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}
export const ThemeContext = React.createContext<ThemeContextType>({ isDark: false, toggleTheme: () => {} });

export interface AuthContextType {
  user: User | null;
  login: (user: User) => Promise<void>;
  logout: () => void;
  upgrade: () => Promise<void>;
  updateUser: (user: User) => void;
}
// Default no-op
export const AuthContext = React.createContext<AuthContextType>({ 
    user: null, 
    login: async () => {}, 
    logout: () => {}, 
    upgrade: async () => {},
    updateUser: () => {} 
});

// Icon Mapping Registry
const ICON_MAP: Record<string, React.FC<{className?: string}>> = {
  dashboard: IconDashboard,
  book: IconBook,
  map: IconMap,
  code: IconCode,
  chart: IconChart,
  creditCard: IconCreditCard,
  settings: IconSettings
};

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [navItems, setNavItems] = useState<NavItemConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Navigation Configuration
  useEffect(() => {
    configService.getNavigation().then(items => {
        setNavItems(items);
        setIsLoading(false);
    });
  }, []);

  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  
  return (
    <div 
      className={`${isCollapsed ? 'w-20' : 'w-64'} flex-shrink-0 bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-dark-border flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out z-20`}
    >
      <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
        {/* Logo Area */}
        {!isCollapsed ? (
          <Link to="/" className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black font-display font-black text-lg shadow-lg flex-shrink-0">
              K
            </div>
            <span className="text-xl font-display font-bold tracking-tight text-gray-900 dark:text-white">KODLA</span>
          </Link>
        ) : (
          <Link to="/" className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black font-display font-black text-lg shadow-lg">
             K
          </Link>
        )}

        {/* Toggle Button */}
        {!isCollapsed && (
          <button onClick={() => setIsCollapsed(true)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
             </svg>
          </button>
        )}
      </div>

      {/* Toggle Button for Collapsed State */}
      {isCollapsed && (
        <div className="flex justify-center mb-2">
           <button onClick={() => setIsCollapsed(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-2">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
             </svg>
           </button>
        </div>
      )}
      
      <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {isLoading ? (
            // Skeleton Loader for Nav
            Array.from({length: 5}).map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 dark:bg-dark-bg/50 rounded-xl animate-pulse mb-2 mx-1"></div>
            ))
        ) : (
            navItems.map((item) => {
                const IconComponent = ICON_MAP[item.iconKey] || IconCode; // Fallback icon
                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        title={isCollapsed ? item.label : undefined}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all group ${
                        isActive(item.path)
                            ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-100 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-border/50 hover:text-gray-900 dark:hover:text-gray-200'
                        } ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <IconComponent className={`w-5 h-5 flex-shrink-0 ${isActive(item.path) ? 'text-brand-600 dark:text-brand-400' : ''}`} />
                        
                        {!isCollapsed && (
                        <span className="whitespace-nowrap transition-opacity duration-300 opacity-100">
                            {item.label}
                        </span>
                        )}
                    </Link>
                );
            })
        )}
      </nav>

      {/* User Mini Profile */}
      <div className={`p-4 border-t border-gray-200 dark:border-dark-border ${isCollapsed ? 'flex justify-center' : ''}`}>
        {!isCollapsed ? (
           <div className="text-xs text-gray-400 text-center">v2.4.0 • KODLA Inc.</div>
        ) : (
           <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
        )}
      </div>
    </div>
  );
};

const Header = () => {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const [lang, setLang] = useState<'EN' | 'RU' | 'UZ'>('EN');
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/courses')) return 'Courses';
    if (path.startsWith('/course/')) return 'Course Details';
    if (path.startsWith('/roadmap')) return 'Roadmap';
    if (path.startsWith('/analytics')) return 'Analytics';
    if (path.startsWith('/payments') || path.startsWith('/premium')) return 'Payments & Plans';
    if (path.startsWith('/settings')) return 'Settings';
    if (path.startsWith('/my-tasks')) return 'My Tasks';
    if (path.startsWith('/learn')) return 'Learning Space';
    if (path.startsWith('/task')) return 'Task Workspace';
    return 'Platform';
  };

  // Update document title based on generic page title
  // Specific pages (TaskWorkspace, CourseDetails) can override this with more specific data
  useEffect(() => {
    document.title = `${getPageTitle()} - KODLA`;
  }, [location.pathname]);

  return (
    <header className="h-16 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border-b border-gray-200 dark:border-dark-border flex items-center justify-between px-6 transition-colors duration-300 sticky top-0 z-10">
      <div className="flex items-center text-gray-400 text-sm font-medium">
        <span className="text-gray-500 dark:text-gray-500 hidden sm:inline">Platform</span>
        <span className="mx-2 text-gray-300 dark:text-gray-700 hidden sm:inline">/</span>
        <span className="text-gray-900 dark:text-white font-semibold">{getPageTitle()}</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Premium CTA */}
        {!user?.isPremium && (
          <Link to="/premium" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
            <IconSparkles className="w-3 h-3" />
            GO PREMIUM
          </Link>
        )}

        {/* Language Switcher */}
        <div className="hidden sm:flex bg-gray-100 dark:bg-black/20 rounded-lg p-1 border border-transparent dark:border-dark-border">
          {['UZ', 'RU', 'EN'].map((l) => (
            <button
              key={l}
              onClick={() => setLang(l as any)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                lang === l
                  ? 'bg-white dark:bg-dark-border shadow-sm text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border rounded-full transition-colors"
        >
          {isDark ? <IconSun className="w-5 h-5" /> : <IconMoon className="w-5 h-5" />}
        </button>

        {/* User Auth */}
        {user ? (
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-dark-border">
            <div className="text-right hidden md:block">
              <div className="text-sm font-bold text-gray-900 dark:text-white leading-none">{user.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-end gap-1">
                {user.isPremium ? (
                    <span className="text-amber-500 font-bold flex items-center gap-1">
                        <IconSparkles className="w-2.5 h-2.5" /> 
                        Pro
                    </span>
                ) : 'Free Plan'}
              </div>
            </div>
            {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-9 h-9 rounded-full ring-2 ring-gray-100 dark:ring-dark-border" />
            ) : (
                <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold">{user.name.charAt(0)}</div>
            )}
            
            <button onClick={logout} className="ml-2 text-xs text-red-500 hover:text-red-600 font-bold">Sign Out</button>
          </div>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-lg transition-colors shadow-brand-500/20 shadow-lg"
          >
            Log In
          </Link>
        )}
      </div>
    </header>
  );
};

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-dark-text transition-colors duration-300 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto p-6 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
};