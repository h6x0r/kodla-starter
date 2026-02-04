import React from "react";
import { IconCheck } from "@/components/Icons";
import { GOAL_OPTIONS } from "../../constants";
import type { WizardState } from "../../types";

interface GoalStepProps {
  wizardState: WizardState;
  onSetGoal: (goal: string) => void;
}

export const GoalStep: React.FC<GoalStepProps> = ({
  wizardState,
  onSetGoal,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {GOAL_OPTIONS.map((goal) => (
        <button
          key={goal.id}
          onClick={() => onSetGoal(goal.id)}
          className={`group relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
            wizardState.goal === goal.id
              ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
              : "border-gray-200 dark:border-dark-border hover:border-brand-300"
          }`}
        >
          <div
            className={`w-14 h-14 rounded-xl bg-gradient-to-br ${goal.color} flex items-center justify-center text-2xl shadow-md`}
          >
            {goal.icon}
          </div>
          <span className="font-bold text-gray-800 dark:text-gray-200">
            {goal.label}
          </span>
          <span className="text-xs text-gray-500 text-center">{goal.desc}</span>
          {wizardState.goal === goal.id && (
            <div className="absolute top-3 right-3 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
              <IconCheck className="w-3 h-3 text-white" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
};
