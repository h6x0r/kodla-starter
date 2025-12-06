
import React, { createContext, useContext, useState, useCallback } from 'react';
import { IconCheckCircle, IconX, IconSparkles } from './Icons';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 animate-slide-in min-w-[300px] ${
              toast.type === 'success' 
                ? 'bg-white/90 dark:bg-dark-surface/90 border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400'
                : toast.type === 'error'
                ? 'bg-white/90 dark:bg-dark-surface/90 border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400'
                : 'bg-white/90 dark:bg-dark-surface/90 border-brand-200 dark:border-brand-900/30 text-brand-700 dark:text-brand-400'
            }`}
          >
            <div className={`p-1 rounded-full ${
               toast.type === 'success' ? 'bg-green-100 dark:bg-green-900/50' :
               toast.type === 'error' ? 'bg-red-100 dark:bg-red-900/50' : 'bg-brand-100 dark:bg-brand-900/50'
            }`}>
                {toast.type === 'success' && <IconCheckCircle className="w-4 h-4" />}
                {toast.type === 'error' && <IconX className="w-4 h-4" />}
                {toast.type === 'info' && <IconSparkles className="w-4 h-4" />}
            </div>
            <p className="text-sm font-bold flex-1">{toast.message}</p>
            <button 
              onClick={() => removeToast(toast.id)} 
              className="opacity-50 hover:opacity-100"
            >
              <IconX className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
