import React, { useState } from "react";
import {
  RoadmapIntro,
  WizardContainer,
  GeneratingLoader,
  VariantSelection,
  RegenerateModal,
  RoadmapResult,
} from "./components";
import { useRoadmapWizard, useRegeneratePayment } from "./hooks";

const RoadmapPage: React.FC = () => {
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);

  const {
    step,
    wizardStep,
    wizardState,
    hasRestoredWizard,
    variants,
    selectedVariant,
    roadmap,
    loadingText,
    loadingProgress,
    error,
    interestsError,
    handleToggleLanguage,
    handleSetExperience,
    handleToggleInterest,
    handleSetGoal,
    handleSetHours,
    handleSetMonths,
    handleWizardNext,
    handleWizardBack,
    handleVariantSelect,
    confirmVariantSelection,
    resetToWizard,
    handleStartWizard,
    handleResumeWizard,
  } = useRoadmapWizard();

  const {
    paymentProviders,
    selectedProvider,
    setSelectedProvider,
    checkoutLoading,
    checkoutError,
    handlePurchase,
    clearError,
  } = useRegeneratePayment(showRegenerateModal);

  const handleRegenerate = () => {
    if (!roadmap?.canRegenerate && !roadmap?.isPremium) {
      setShowRegenerateModal(true);
      return;
    }
    resetToWizard();
  };

  const handleCloseModal = () => {
    setShowRegenerateModal(false);
    clearError();
  };

  // Render based on step
  if (step === "loading") {
    return <GeneratingLoader loadingText="Loading..." loadingProgress={0} />;
  }

  if (step === "intro") {
    return (
      <RoadmapIntro
        onStart={() => handleStartWizard(hasRestoredWizard)}
        onResume={handleResumeWizard}
        hasProgress={hasRestoredWizard}
      />
    );
  }

  if (step === "wizard") {
    return (
      <WizardContainer
        wizardStep={wizardStep}
        wizardState={wizardState}
        error={error}
        interestsError={interestsError}
        onNext={handleWizardNext}
        onBack={handleWizardBack}
        onToggleLanguage={handleToggleLanguage}
        onSetExperience={handleSetExperience}
        onToggleInterest={handleToggleInterest}
        onSetGoal={handleSetGoal}
        onSetHours={handleSetHours}
        onSetMonths={handleSetMonths}
      />
    );
  }

  if (step === "generating") {
    return (
      <GeneratingLoader
        loadingText={loadingText}
        loadingProgress={loadingProgress}
      />
    );
  }

  if (step === "variants") {
    return (
      <VariantSelection
        variants={variants}
        selectedVariant={selectedVariant}
        error={error}
        onSelect={handleVariantSelect}
        onConfirm={confirmVariantSelection}
        onAdjustPreferences={resetToWizard}
      />
    );
  }

  if (step === "result" && roadmap) {
    return (
      <>
        <RegenerateModal
          isOpen={showRegenerateModal}
          onClose={handleCloseModal}
          onPurchase={handlePurchase}
          paymentProviders={paymentProviders}
          selectedProvider={selectedProvider}
          onSelectProvider={setSelectedProvider}
          checkoutLoading={checkoutLoading}
          checkoutError={checkoutError}
        />
        <RoadmapResult roadmap={roadmap} onRegenerate={handleRegenerate} />
      </>
    );
  }

  return null;
};

export default RoadmapPage;
