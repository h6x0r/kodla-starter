import React from "react";
import { EXPERIENCE_OPTIONS } from "../../constants";
import type { WizardState } from "../../types";

interface ExperienceStepProps {
  wizardState: WizardState;
  onSetExperience: (yearsOfExperience: number) => void;
}

export const ExperienceStep: React.FC<ExperienceStepProps> = ({
  wizardState,
  onSetExperience,
}) => {
  // Map string experience to numeric value for comparison
  const experienceToNumber = (exp: string): number => {
    switch (exp) {
      case "0":
        return 0;
      case "<1":
        return 1;
      case "1-2":
        return 2;
      case "3-5":
        return 3;
      default:
        return 5;
    }
  };

  const currentExp = experienceToNumber(wizardState.experience);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {EXPERIENCE_OPTIONS.map((exp) => (
        <button
          key={exp.id}
          onClick={() => onSetExperience(exp.id)}
          className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all ${
            currentExp === exp.id
              ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
              : "border-gray-200 dark:border-dark-border hover:border-brand-300"
          }`}
        >
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {exp.label}
          </span>
          <span className="text-sm text-gray-500">{exp.desc}</span>
        </button>
      ))}
    </div>
  );
};
