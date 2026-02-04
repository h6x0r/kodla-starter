import React from "react";
import { HOURS_OPTIONS, MONTHS_OPTIONS } from "../../constants";
import type { WizardState } from "../../types";

interface TimeStepProps {
  wizardState: WizardState;
  onSetHours: (hours: number) => void;
  onSetMonths: (months: number) => void;
}

export const TimeStep: React.FC<TimeStepProps> = ({
  wizardState,
  onSetHours,
  onSetMonths,
}) => {
  return (
    <div className="space-y-6">
      {/* Hours per week */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
          Hours per week
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {HOURS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSetHours(opt.value)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                wizardState.hoursPerWeek === opt.value
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                  : "border-gray-200 dark:border-dark-border hover:border-brand-300"
              }`}
            >
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {opt.label}
              </span>
              <span className="text-xs text-gray-500">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Target months */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
          Target timeline
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {MONTHS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSetMonths(opt.value)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                wizardState.targetMonths === opt.value
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                  : "border-gray-200 dark:border-dark-border hover:border-brand-300"
              }`}
            >
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {opt.label}
              </span>
              <span className="text-xs text-gray-500">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
