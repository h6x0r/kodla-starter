import React from "react";
import { IconChevronLeft, IconChevronRight } from "@/components/Icons";
import { WIZARD_STEPS } from "../constants";
import type { WizardState } from "../types";
import {
  LanguagesStep,
  ExperienceStep,
  InterestsStep,
  GoalStep,
  TimeStep,
} from "./wizard-steps";

interface WizardContainerProps {
  wizardStep: number;
  wizardState: WizardState;
  error: string | null;
  interestsError: boolean;
  onNext: () => void;
  onBack: () => void;
  onToggleLanguage: (langId: string) => void;
  onSetExperience: (years: number) => void;
  onToggleInterest: (interestId: string) => void;
  onSetGoal: (goal: string) => void;
  onSetHours: (hours: number) => void;
  onSetMonths: (months: number) => void;
}

export const WizardContainer: React.FC<WizardContainerProps> = ({
  wizardStep,
  wizardState,
  error,
  interestsError,
  onNext,
  onBack,
  onToggleLanguage,
  onSetExperience,
  onToggleInterest,
  onSetGoal,
  onSetHours,
  onSetMonths,
}) => {
  const currentStep = WIZARD_STEPS[wizardStep];

  const canProceed = () => {
    switch (wizardStep) {
      case 0:
        return true; // Languages can be empty (beginner)
      case 1:
        return true; // Experience is pre-filled
      case 2:
        return wizardState.interests.length > 0;
      case 3:
        return wizardState.goal !== "";
      case 4:
        return true; // Time has defaults
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (wizardStep) {
      case 0:
        return (
          <LanguagesStep
            wizardState={wizardState}
            onToggleLanguage={onToggleLanguage}
          />
        );
      case 1:
        return (
          <ExperienceStep
            wizardState={wizardState}
            onSetExperience={onSetExperience}
          />
        );
      case 2:
        return (
          <InterestsStep
            wizardState={wizardState}
            onToggleInterest={onToggleInterest}
            showError={interestsError}
          />
        );
      case 3:
        return <GoalStep wizardState={wizardState} onSetGoal={onSetGoal} />;
      case 4:
        return (
          <TimeStep
            wizardState={wizardState}
            onSetHours={onSetHours}
            onSetMonths={onSetMonths}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] max-w-3xl mx-auto px-4">
      <div className="w-full bg-white dark:bg-dark-surface rounded-3xl p-8 border border-gray-100 dark:border-dark-border shadow-xl">
        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Progress header */}
        <div className="mb-8 text-center">
          <span className="text-xs font-bold text-brand-500 uppercase tracking-widest">
            Step {wizardStep + 1} of {WIZARD_STEPS.length}
          </span>
          <div className="w-full bg-gray-100 dark:bg-dark-bg h-1.5 mt-4 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all duration-500"
              style={{
                width: `${((wizardStep + 1) / WIZARD_STEPS.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
            {currentStep.title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {currentStep.subtitle}
          </p>
        </div>

        {/* Step content */}
        {renderStepContent()}

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={onBack}
            disabled={wizardStep === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              wizardStep === 0
                ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <IconChevronLeft className="w-4 h-4" /> Back
          </button>

          <button
            onClick={onNext}
            disabled={!canProceed()}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              canProceed()
                ? "bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white shadow-lg shadow-brand-500/25"
                : "bg-gray-200 dark:bg-dark-bg text-gray-400 dark:text-gray-600 cursor-not-allowed"
            }`}
          >
            {wizardStep === WIZARD_STEPS.length - 1
              ? "Generate Roadmaps"
              : "Continue"}
            <IconChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
