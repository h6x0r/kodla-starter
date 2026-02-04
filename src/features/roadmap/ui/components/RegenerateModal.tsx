import React from "react";
import { Link } from "react-router-dom";
import { IconRefresh, IconCheck } from "@/components/Icons";
import { useUITranslation } from "@/contexts/LanguageContext";
import { PaymentProvider } from "@/features/payments/api/paymentService";

interface RegenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: () => void;
  paymentProviders: PaymentProvider[];
  selectedProvider: "payme" | "click" | null;
  onSelectProvider: (provider: "payme" | "click") => void;
  checkoutLoading: boolean;
  checkoutError: string | null;
}

export const RegenerateModal: React.FC<RegenerateModalProps> = ({
  isOpen,
  onClose,
  onPurchase,
  paymentProviders,
  selectedProvider,
  onSelectProvider,
  checkoutLoading,
  checkoutError,
}) => {
  const { tUI } = useUITranslation();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-dark-surface rounded-3xl border border-gray-200 dark:border-dark-border shadow-2xl transform animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <IconRefresh className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {tUI("roadmap.regenerateModalTitle") ||
                "Regenerate Your Roadmap"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {tUI("roadmap.regenerateModalDesc") ||
                "Create a new personalized learning path based on updated preferences"}
            </p>
          </div>

          {/* Price */}
          <div className="bg-gray-50 dark:bg-dark-bg rounded-2xl p-6 mb-6 text-center">
            <div className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-1">
              $4.99
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {tUI("roadmap.oneTimePayment") || "One-time payment"}
            </div>
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-6">
            <FeatureItem
              text={
                tUI("roadmap.regenerateFeature1") ||
                "AI-powered personalized path generation"
              }
            />
            <FeatureItem
              text={
                tUI("roadmap.regenerateFeature2") ||
                "Choose from multiple path variants"
              }
            />
            <FeatureItem
              text={
                tUI("roadmap.regenerateFeature3") ||
                "Adjust goals and time commitments"
              }
            />
          </ul>

          {/* Payment Provider Selection */}
          {paymentProviders.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {tUI("roadmap.selectPaymentMethod") || "Select Payment Method"}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {paymentProviders.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() =>
                      onSelectProvider(provider.id as "payme" | "click")
                    }
                    data-testid={`provider-${provider.id}`}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedProvider === provider.id
                        ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                        : "border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <span className="font-medium text-gray-900 dark:text-white">
                      {provider.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Checkout Error */}
          {checkoutError && (
            <div
              className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400"
              data-testid="checkout-error"
            >
              {checkoutError}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={onPurchase}
              disabled={checkoutLoading || !selectedProvider}
              data-testid="purchase-button"
              className={`w-full py-3 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 transition-all ${
                checkoutLoading || !selectedProvider
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {checkoutLoading
                ? tUI("common.loading") || "Processing..."
                : tUI("roadmap.purchaseRegenerate") || "Purchase Regeneration"}
            </button>
            <button
              onClick={onClose}
              disabled={checkoutLoading}
              className="w-full py-3 text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              {tUI("common.cancel") || "Cancel"}
            </button>
          </div>

          {/* Premium upsell */}
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-dark-border text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {tUI("roadmap.unlimitedWith") || "Want unlimited regenerations?"}
            </p>
            <Link
              to="/premium"
              className="text-sm font-bold text-brand-600 hover:text-brand-500 transition-colors"
            >
              {tUI("roadmap.upgradeToPremium") || "Upgrade to Premium →"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureItem: React.FC<{ text: string }> = ({ text }) => (
  <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
    <IconCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
    {text}
  </li>
);
