import React from "react";
import { RoadmapVariant } from "../../model/types";
import { RoadmapVariantCard } from "./RoadmapVariantCard";

interface VariantSelectionProps {
  variants: RoadmapVariant[];
  selectedVariant: RoadmapVariant | null;
  error: string | null;
  onSelect: (variant: RoadmapVariant) => void;
  onConfirm: () => void;
  onAdjustPreferences: () => void;
}

export const VariantSelection: React.FC<VariantSelectionProps> = ({
  variants,
  selectedVariant,
  error,
  onSelect,
  onConfirm,
  onAdjustPreferences,
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 pb-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
          Choose Your Path
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          We've generated {variants.length} personalized roadmaps based on your
          goals
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Variant cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {variants.map((variant) => (
          <RoadmapVariantCard
            key={variant.id}
            variant={variant}
            isSelected={selectedVariant?.id === variant.id}
            onSelect={onSelect}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <button
          onClick={onAdjustPreferences}
          className="px-6 py-3 text-gray-600 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          ← Adjust Preferences
        </button>

        <button
          onClick={onConfirm}
          disabled={!selectedVariant}
          className={`px-8 py-3 rounded-xl font-bold transition-all ${
            selectedVariant
              ? "bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white shadow-lg shadow-brand-500/25"
              : "bg-gray-200 dark:bg-dark-bg text-gray-400 dark:text-gray-600 cursor-not-allowed"
          }`}
        >
          Start {selectedVariant?.name || "Selected"} Path →
        </button>
      </div>
    </div>
  );
};
