import React from "react";
import { IconCheck } from "@/components/Icons";
import { INTEREST_OPTIONS } from "../../constants";
import { useUITranslation } from "@/contexts/LanguageContext";
import type { WizardState } from "../../types";

interface InterestsStepProps {
  wizardState: WizardState;
  onToggleInterest: (interestId: string) => void;
  showError: boolean;
}

export const InterestsStep: React.FC<InterestsStepProps> = ({
  wizardState,
  onToggleInterest,
  showError,
}) => {
  const { tUI } = useUITranslation();

  return (
    <div>
      <p
        className={`text-center text-sm mb-4 ${showError ? "text-red-500 font-medium" : "text-gray-500"}`}
      >
        {showError
          ? tUI("roadmap.interestsError") ||
            "Please select at least one area of interest to continue"
          : tUI("roadmap.interestsHint") ||
            "Select at least one area of interest"}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {INTEREST_OPTIONS.map((interest) => (
          <button
            key={interest.id}
            onClick={() => onToggleInterest(interest.id)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              wizardState.interests.includes(interest.id)
                ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                : "border-gray-200 dark:border-dark-border hover:border-brand-300"
            }`}
          >
            <span className="text-2xl">{interest.icon}</span>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
              {interest.label}
            </span>
            <span className="text-xs text-gray-500 text-center">
              {interest.desc}
            </span>
            {wizardState.interests.includes(interest.id) && (
              <IconCheck className="w-4 h-4 text-brand-500" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
