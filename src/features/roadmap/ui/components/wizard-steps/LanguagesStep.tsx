import React from "react";
import { IconCheck } from "@/components/Icons";
import { LANGUAGE_OPTIONS } from "../../constants";
import type { WizardState } from "../../types";

interface LanguagesStepProps {
  wizardState: WizardState;
  onToggleLanguage: (langId: string) => void;
}

export const LanguagesStep: React.FC<LanguagesStepProps> = ({
  wizardState,
  onToggleLanguage,
}) => {
  return (
    <div>
      <p className="text-center text-sm text-gray-500 mb-4">
        Select all that apply (or skip if you're a complete beginner)
      </p>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {LANGUAGE_OPTIONS.map((lang) => (
          <button
            key={lang.id}
            onClick={() => onToggleLanguage(lang.id)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              wizardState.knownLanguages.includes(lang.id)
                ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                : "border-gray-200 dark:border-dark-border hover:border-brand-300"
            }`}
          >
            <span className="text-2xl">{lang.icon}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {lang.label}
            </span>
            {wizardState.knownLanguages.includes(lang.id) && (
              <IconCheck className="w-4 h-4 text-brand-500" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
