import React from "react";

interface GeneratingLoaderProps {
  loadingText: string;
  loadingProgress: number;
}

export const GeneratingLoader: React.FC<GeneratingLoaderProps> = ({
  loadingText,
  loadingProgress,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="w-full max-w-sm">
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute inset-0 border-4 border-gray-200 dark:border-dark-border rounded-full opacity-20"></div>
          <div className="absolute inset-0 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          {loadingProgress > 0 && (
            <div className="absolute inset-0 flex items-center justify-center font-display font-bold text-xl text-brand-500 animate-pulse">
              {Math.round(loadingProgress)}%
            </div>
          )}
        </div>
        <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2 transition-all duration-300">
          {loadingText}
        </h2>
        {loadingProgress > 0 && (
          <div className="w-full h-2 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden mt-6">
            <div
              className="h-full bg-gradient-to-r from-brand-400 to-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
