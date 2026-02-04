import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/components/Layout";
import { RoadmapUI, RoadmapVariant, RoadmapGenerationInput } from "../../model/types";
import { roadmapService, SelectVariantParams } from "../../api/roadmapService";
import { createLogger } from "@/lib/logger";
import {
  WizardState,
  initialWizardState,
  RoadmapStep,
  saveWizardToStorage,
  loadWizardFromStorage,
  clearWizardStorage,
} from "../types";
import { WIZARD_STEPS } from "../constants";

const log = createLogger("Roadmap");

export const useRoadmapWizard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Core state
  const [step, setStep] = useState<RoadmapStep | "loading">("loading");
  const [wizardStep, setWizardStep] = useState(() => {
    const saved = loadWizardFromStorage();
    return saved?.step ?? 0;
  });
  const [wizardState, setWizardState] = useState<WizardState>(() => {
    const saved = loadWizardFromStorage();
    return saved?.state ?? initialWizardState;
  });
  const [hasRestoredWizard, setHasRestoredWizard] = useState(false);

  // Roadmap state
  const [variants, setVariants] = useState<RoadmapVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<RoadmapVariant | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapUI | null>(null);

  // UI state
  const [loadingText, setLoadingText] = useState("Loading...");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [interestsError, setInterestsError] = useState(false);

  // Save wizard state to localStorage
  useEffect(() => {
    if (step === "wizard") {
      saveWizardToStorage(wizardState, wizardStep);
    }
  }, [wizardState, wizardStep, step]);

  // Check for existing roadmap on mount
  useEffect(() => {
    const checkExistingRoadmap = async () => {
      if (!user) {
        const saved = loadWizardFromStorage();
        if (saved && saved.step > 0) setHasRestoredWizard(true);
        setStep("intro");
        return;
      }

      try {
        const existing = await roadmapService.getUserRoadmap();
        if (existing) {
          setRoadmap(existing);
          clearWizardStorage();
          setStep("result");
        } else {
          const saved = loadWizardFromStorage();
          if (saved && saved.step > 0) {
            setHasRestoredWizard(true);
            setStep("wizard");
          } else {
            setStep("intro");
          }
        }
      } catch (e) {
        log.error("Failed to load roadmap", e);
        setStep("intro");
      }
    };
    checkExistingRoadmap();
  }, [user]);

  // Wizard handlers
  const handleToggleLanguage = (langId: string) => {
    setWizardState((prev) => ({
      ...prev,
      knownLanguages: prev.knownLanguages.includes(langId)
        ? prev.knownLanguages.filter((l) => l !== langId)
        : [...prev.knownLanguages, langId],
    }));
  };

  const handleSetExperience = (years: number) => {
    const expMap: Record<number, string> = { 0: "0", 1: "<1", 2: "1-2", 3: "3-5", 5: "5+" };
    setWizardState((prev) => ({ ...prev, experience: expMap[years] || "1-2" }));
  };

  const handleToggleInterest = (interestId: string) => {
    if (interestsError) setInterestsError(false);
    setWizardState((prev) => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter((i) => i !== interestId)
        : [...prev.interests, interestId],
    }));
  };

  const handleSetGoal = (goal: string) => setWizardState((prev) => ({ ...prev, goal }));
  const handleSetHours = (hours: number) => setWizardState((prev) => ({ ...prev, hoursPerWeek: hours }));
  const handleSetMonths = (months: number) => setWizardState((prev) => ({ ...prev, targetMonths: months }));

  const handleWizardNext = () => {
    if (wizardStep === 2 && wizardState.interests.length === 0) {
      setInterestsError(true);
      return;
    }
    setInterestsError(false);

    if (wizardStep < WIZARD_STEPS.length - 1) {
      setWizardStep((prev) => prev + 1);
    } else {
      startVariantGeneration();
    }
  };

  const handleWizardBack = () => {
    if (wizardStep > 0) setWizardStep((prev) => prev - 1);
  };

  // Generation flow
  const startVariantGeneration = async () => {
    setStep("generating");
    setError(null);

    const phases = [
      "Analyzing your profile...",
      "Scanning available courses...",
      "Matching tasks to your goals...",
      "Generating personalized paths...",
      "Preparing variants...",
    ];

    for (let i = 0; i < phases.length; i++) {
      setLoadingText(phases[i]);
      setLoadingProgress((i + 1) * (100 / phases.length));
      await new Promise((r) => setTimeout(r, 600));
    }

    try {
      const expToYears: Record<string, number> = { "0": 0, "<1": 1, "1-2": 2, "3-5": 3, "5+": 5 };
      const input: RoadmapGenerationInput = {
        knownLanguages: wizardState.knownLanguages,
        yearsOfExperience: expToYears[wizardState.experience] ?? 2,
        interests: wizardState.interests,
        goal: wizardState.goal as RoadmapGenerationInput["goal"],
        hoursPerWeek: wizardState.hoursPerWeek,
        targetMonths: wizardState.targetMonths,
      };

      const response = await roadmapService.generateVariants(input);
      setVariants(response.variants);
      setStep("variants");
    } catch (e: unknown) {
      log.error("Failed to generate variants", e);
      if (e && typeof e === "object" && "status" in e && e.status === 403) {
        setError("Regeneration requires Premium. Upgrade to create unlimited personalized roadmaps.");
      } else {
        setError("Failed to generate roadmap variants. Please try again.");
      }
      setStep("wizard");
    }
  };

  const handleVariantSelect = (variant: RoadmapVariant) => setSelectedVariant(variant);

  const confirmVariantSelection = async () => {
    if (!selectedVariant) return;

    setStep("loading");
    setLoadingText("Creating your roadmap...");
    setLoadingProgress(50);

    try {
      const params: SelectVariantParams = {
        variantId: selectedVariant.id,
        name: selectedVariant.name,
        description: selectedVariant.description,
        totalTasks: selectedVariant.totalTasks,
        estimatedHours: selectedVariant.estimatedHours,
        estimatedMonths: selectedVariant.estimatedMonths,
        targetRole: selectedVariant.targetRole,
        difficulty: selectedVariant.difficulty,
        phases: selectedVariant.phases || [],
      };

      const result = await roadmapService.selectVariant(params);
      setRoadmap(result);
      setLoadingProgress(100);
      clearWizardStorage();
      setStep("result");
    } catch (e) {
      log.error("Failed to select variant", e);
      setError("Failed to create roadmap. Please try again.");
      setStep("variants");
    }
  };

  const resetToWizard = () => {
    setStep("wizard");
    setWizardStep(0);
    setWizardState(initialWizardState);
    setVariants([]);
    setSelectedVariant(null);
  };

  const handleStartWizard = (startFresh = false) => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: "/roadmap" } } });
      return;
    }
    if (startFresh) {
      clearWizardStorage();
      setWizardStep(0);
      setWizardState(initialWizardState);
      setHasRestoredWizard(false);
    }
    setStep("wizard");
  };

  const handleResumeWizard = () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: "/roadmap" } } });
      return;
    }
    setStep("wizard");
  };

  return {
    // State
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
    // Wizard handlers
    handleToggleLanguage,
    handleSetExperience,
    handleToggleInterest,
    handleSetGoal,
    handleSetHours,
    handleSetMonths,
    handleWizardNext,
    handleWizardBack,
    // Flow handlers
    handleVariantSelect,
    confirmVariantSelection,
    resetToWizard,
    handleStartWizard,
    handleResumeWizard,
  };
};
