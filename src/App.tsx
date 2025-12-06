
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User } from './types';
import { authService } from './features/auth/api/authService';
import { setupInterceptors } from './services/api';
import { STORAGE_KEYS } from './config/constants';

// Layout & Contexts
import { Layout, ThemeContext, AuthContext } from './components/Layout';
import { ToastProvider } from './components/Toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

// Route Config
import { routes } from './config/routes';

const App = () => {
  const [isDark, setIsDark] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Theme Init
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Auth Init & Interceptor Setup
  useEffect(() => {
    // 1. Setup global 401 handler
    setupInterceptors(() => {
        console.warn("401 Unauthorized detected. Logging out...");
        authService.logout();
        setUser(null);
    });

    // 2. Check current session
    const initAuth = async () => {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
        } catch (error) {
          console.error("Session expired or invalid", error);
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Optimize context value to prevent unnecessary re-renders
  const authValue = useMemo(() => ({
    user,
    login: async (u: User) => {
        setUser(u);
    },
    logout: () => {
        authService.logout();
        setUser(null);
    },
    upgrade: async () => {
        try {
            const updatedUser = await authService.upgrade();
            setUser(updatedUser);
        } catch (e) {
            console.error("Upgrade failed", e);
        }
    },
    updateUser: (u: User) => {
        setUser(u);
    }
  }), [user]);

  if (loading) {
      return <div className="min-h-screen bg-black flex items-center justify-center text-white font-mono animate-pulse">Initializing KODLA Engine...</div>;
  }

  return (
    <ErrorBoundary>
      <ThemeContext.Provider value={{ isDark, toggleTheme: () => setIsDark(!isDark) }}>
        <ToastProvider>
          <AuthContext.Provider value={authValue}>
              <HashRouter>
              <Routes>
                  {routes.map((route, index) => {
                  // 1. Wrap in Layout if needed
                  let content = route.layout ? (
                      <Layout>{route.element}</Layout>
                  ) : (
                      route.element
                  );

                  // 2. Wrap in ProtectedRoute if needed
                  if (route.protected) {
                      content = <ProtectedRoute>{content}</ProtectedRoute>;
                  }

                  return <Route key={index} path={route.path} element={content} />;
                  })}
                  
                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" />} />
              </Routes>
              </HashRouter>
          </AuthContext.Provider>
        </ToastProvider>
      </ThemeContext.Provider>
    </ErrorBoundary>
  );
};

export default App;
