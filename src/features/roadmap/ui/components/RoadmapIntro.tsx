import React from "react";
import {
  IconMap,
  IconSparkles,
  IconTarget,
  IconTrophy,
} from "@/components/Icons";
import { useUITranslation } from "@/contexts/LanguageContext";

interface RoadmapIntroProps {
  onStart: () => void;
  onResume?: () => void;
  hasProgress?: boolean;
}

export const RoadmapIntro: React.FC<RoadmapIntroProps> = ({
  onStart,
  onResume,
  hasProgress,
}) => {
  const { tUI } = useUITranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] max-w-2xl mx-auto px-4">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-purple-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-brand-500/25">
          <IconMap className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
          {tUI("roadmap.introTitle")}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed max-w-lg mx-auto">
          {tUI("roadmap.introDescription")}
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <FeatureCard
            icon={<IconSparkles className="w-5 h-5 text-brand-600 dark:text-brand-400" />}
            iconBg="bg-brand-100 dark:bg-brand-900/30"
            title={tUI("roadmap.featureAI")}
            description={tUI("roadmap.featureAIDesc")}
          />
          <FeatureCard
            icon={<IconTarget className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
            iconBg="bg-purple-100 dark:bg-purple-900/30"
            title={tUI("roadmap.featurePersonal")}
            description={tUI("roadmap.featurePersonalDesc")}
          />
          <FeatureCard
            icon={<IconTrophy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
            iconBg="bg-emerald-100 dark:bg-emerald-900/30"
            title={tUI("roadmap.featureProgress")}
            description={tUI("roadmap.featureProgressDesc")}
          />
        </div>

        {/* Resume banner if there's saved progress */}
        {hasProgress && onResume && (
          <div className="mb-6 p-4 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-xl">
            <p className="text-sm text-brand-700 dark:text-brand-300 mb-3">
              {tUI("roadmap.resumeProgress") ||
                "You have unfinished progress. Would you like to continue?"}
            </p>
            <button
              onClick={onResume}
              className="px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg text-sm transition-colors"
            >
              {tUI("roadmap.resumeButton") || "Resume Wizard"}
            </button>
          </div>
        )}

        <button
          onClick={onStart}
          className="px-8 py-3 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 transition-all transform hover:-translate-y-0.5"
        >
          {hasProgress
            ? tUI("roadmap.startOver") || "Start Over"
            : tUI("roadmap.startButton")}
        </button>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  iconBg,
  title,
  description,
}) => (
  <div className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-gray-100 dark:border-dark-border">
    <div
      className={`w-10 h-10 ${iconBg} rounded-lg mx-auto mb-3 flex items-center justify-center`}
    >
      {icon}
    </div>
    <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
      {title}
    </h3>
    <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
  </div>
);
