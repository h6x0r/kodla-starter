// Wizard state types

export interface WizardState {
  knownLanguages: string[];
  experience: string;
  interests: string[];
  goal: string;
  hoursPerWeek: number;
  targetMonths: number;
}

export const initialWizardState: WizardState = {
  knownLanguages: [],
  experience: "1-2",
  interests: [],
  goal: "",
  hoursPerWeek: 10,
  targetMonths: 6,
};

export type RoadmapStep =
  | "intro"
  | "wizard"
  | "generating"
  | "variants"
  | "result"
  | "payment";

export interface PersistedWizardState {
  state: WizardState;
  step: number;
  savedAt: number;
}

// Wizard storage utilities
export const WIZARD_STORAGE_KEY = "practix_roadmap_wizard";

export const saveWizardToStorage = (state: WizardState, step: number) => {
  try {
    const data: PersistedWizardState = {
      state,
      step,
      savedAt: Date.now(),
    };
    localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // Ignore storage errors
  }
};

export const loadWizardFromStorage = (): PersistedWizardState | null => {
  try {
    const saved = localStorage.getItem(WIZARD_STORAGE_KEY);
    if (!saved) return null;

    const data: PersistedWizardState = JSON.parse(saved);
    // Expire after 24 hours
    const isExpired = Date.now() - data.savedAt > 24 * 60 * 60 * 1000;
    if (isExpired) {
      localStorage.removeItem(WIZARD_STORAGE_KEY);
      return null;
    }
    return data;
  } catch (e) {
    return null;
  }
};

export const clearWizardStorage = () => {
  try {
    localStorage.removeItem(WIZARD_STORAGE_KEY);
  } catch (e) {
    // Ignore
  }
};
