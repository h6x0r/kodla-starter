import React from "react";
import { Link } from "react-router-dom";
import {
  IconCheck,
  IconTrophy,
  IconRefresh,
  IconPlay,
  IconLock,
} from "@/components/Icons";
import { useUITranslation } from "@/contexts/LanguageContext";
import { RoadmapUI } from "../../model/types";

interface RoadmapResultProps {
  roadmap: RoadmapUI;
  onRegenerate: () => void;
}

export const RoadmapResult: React.FC<RoadmapResultProps> = ({
  roadmap,
  onRegenerate,
}) => {
  const { tUI } = useUITranslation();

  const canRegenerate = roadmap.canRegenerate ?? true;
  const isPremium = roadmap.isPremium ?? false;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Premium regeneration gate */}
      {!canRegenerate && !isPremium && (
        <PremiumGateBanner tUI={tUI} />
      )}

      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
            {tUI("roadmap.yourPersonalRoadmap") || "Your Personal Roadmap"}
          </h1>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-bold rounded-full uppercase">
              {roadmap.roleTitle || roadmap.role}
            </span>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full uppercase">
              {roadmap.targetLevel || roadmap.level}
            </span>
          </div>
        </div>
        <RegenerateButton
          canRegenerate={canRegenerate}
          isPremium={isPremium}
          onRegenerate={onRegenerate}
          tUI={tUI}
        />
      </div>

      <div className="relative space-y-12">
        {/* Vertical Line */}
        <div className="absolute left-6 top-4 bottom-4 w-1 bg-gray-200 dark:bg-dark-border rounded-full" />

        {roadmap.phases.map((phase) => (
          <PhaseCard key={phase.id} phase={phase} />
        ))}

        {/* End Node */}
        <div className="relative pl-16">
          <div className="absolute left-2 top-0 w-9 h-9 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg z-10 border-4 border-white dark:border-dark-bg">
            <IconTrophy className="w-4 h-4" />
          </div>
          <div className="py-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Goal Achieved
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Ready for {roadmap.roleTitle || "your next step"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PremiumGateBannerProps {
  tUI: (key: string) => string;
}

const PremiumGateBanner: React.FC<PremiumGateBannerProps> = ({ tUI }) => (
  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
    <div className="flex items-center gap-3">
      <IconLock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-bold text-amber-800 dark:text-amber-200">
          {tUI("roadmap.regeneratePremiumTitle") ||
            "Regeneration requires Premium"}
        </p>
        <p className="text-sm text-amber-600 dark:text-amber-400">
          {tUI("roadmap.regeneratePremiumDesc") ||
            "Upgrade to create unlimited personalized roadmaps"}
        </p>
      </div>
      <Link
        to="/premium"
        className="px-4 py-2 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold rounded-lg text-sm whitespace-nowrap"
      >
        {tUI("common.upgrade") || "Upgrade"}
      </Link>
    </div>
  </div>
);

interface RegenerateButtonProps {
  canRegenerate: boolean;
  isPremium: boolean;
  onRegenerate: () => void;
  tUI: (key: string) => string;
}

const RegenerateButton: React.FC<RegenerateButtonProps> = ({
  canRegenerate,
  isPremium,
  onRegenerate,
  tUI,
}) => (
  <button
    onClick={onRegenerate}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
      canRegenerate || isPremium
        ? "bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:text-brand-600"
        : "bg-gray-100 dark:bg-dark-bg border border-gray-200 dark:border-dark-border text-gray-400 dark:text-gray-500"
    }`}
  >
    {canRegenerate || isPremium ? (
      <>
        <IconRefresh className="w-4 h-4" />{" "}
        {tUI("roadmap.regenerate") || "Regenerate"}
      </>
    ) : (
      <>
        <IconLock className="w-4 h-4" />{" "}
        {tUI("roadmap.regeneratePremium") || "Regenerate (Premium)"}
      </>
    )}
  </button>
);

interface PhaseCardProps {
  phase: RoadmapUI["phases"][0];
}

const PhaseCard: React.FC<PhaseCardProps> = ({ phase }) => (
  <div className="relative pl-16">
    {/* Phase Node */}
    <div
      className={`absolute left-2.5 top-0 w-8 h-8 rounded-full border-4 border-white dark:border-dark-bg bg-gradient-to-br ${phase.colorTheme} shadow-lg z-10`}
    />

    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-1">
        <h3
          className={`text-lg font-bold bg-gradient-to-r ${phase.colorTheme} bg-clip-text text-transparent`}
        >
          {phase.title}
        </h3>
        <span className="text-xs font-bold text-gray-400">
          {Math.round(phase.progressPercentage || 0)}% Done
        </span>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {phase.description}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {phase.steps.map((step) => (
          <StepItem key={step.id} step={step} />
        ))}
      </div>
    </div>
  </div>
);

interface StepItemProps {
  step: RoadmapUI["phases"][0]["steps"][0];
}

const StepItem: React.FC<StepItemProps> = ({ step }) => {
  const isCompleted = step.status === "completed";

  return (
    <Link
      to={step.deepLink}
      className={`group flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer hover:shadow-sm ${
        isCompleted
          ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30 shadow-sm"
          : "bg-gray-50 dark:bg-dark-bg border-gray-100 dark:border-dark-border hover:border-brand-200 dark:hover:border-brand-800"
      }`}
    >
      <div
        className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
          isCompleted
            ? "bg-green-500 text-white scale-110"
            : "bg-gray-200 dark:bg-gray-700 text-gray-500"
        }`}
      >
        {isCompleted ? (
          <IconCheck className="w-3 h-3" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-gray-400" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div
            className={`text-sm font-bold ${
              isCompleted
                ? "text-gray-900 dark:text-white line-through decoration-gray-400"
                : "text-gray-900 dark:text-white"
            }`}
          >
            {step.title}
          </div>
          {!isCompleted && (
            <IconPlay className="w-4 h-4 text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 bg-white dark:bg-dark-surface px-1.5 py-0.5 rounded border border-gray-100 dark:border-dark-border">
            {step.type}
          </span>
          <span className="text-xs text-gray-500">{step.durationEstimate}</span>
        </div>
      </div>
    </Link>
  );
};
