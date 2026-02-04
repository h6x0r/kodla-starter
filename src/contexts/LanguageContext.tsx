import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { storage } from "../lib/storage";
import {
  translations,
  TIME_FORMATS,
  MONTHS,
  DIFFICULTY_LABELS,
  Language,
} from "../locales";

export type { Language };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: <T extends TranslatableEntity>(
    entity: T | null | undefined,
  ) => TranslatedFields<T>;
}

// Entities that have translations field
interface TranslatableEntity {
  translations?: {
    ru?: Record<string, unknown>;
    uz?: Record<string, unknown>;
  } | null;
  [key: string]: unknown;
}

// Return type preserves the entity but with translated string fields
type TranslatedFields<T> = T;

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

// Get translated value for a specific field
function getTranslatedField<T>(
  entity: TranslatableEntity,
  field: string,
  language: Language,
): T {
  if (language === "en") {
    return entity[field] as T;
  }

  const entityTranslations = entity.translations;
  if (
    entityTranslations &&
    entityTranslations[language] &&
    entityTranslations[language][field] !== undefined
  ) {
    return entityTranslations[language][field] as T;
  }

  // Fallback to English (default field value)
  return entity[field] as T;
}

// Fields that should be translated
const TRANSLATABLE_FIELDS = [
  "title",
  "description",
  "hint1",
  "hint2",
  "solutionExplanation",
  "solutionCode",
  "whyItMatters",
];

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = storage.getLanguage();
      if (saved && ["en", "ru", "uz"].includes(saved)) {
        return saved as Language;
      }
    }
    return "en";
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    storage.setLanguage(lang);
  }, []);

  // Translation function that works with any entity having translations field
  const t = useCallback(
    <T extends TranslatableEntity>(
      entity: T | null | undefined,
    ): TranslatedFields<T> => {
      if (!entity) {
        return entity as TranslatedFields<T>;
      }

      // If language is English, return entity as-is (English is default)
      if (language === "en") {
        return entity as TranslatedFields<T>;
      }

      // Create a new object with translated fields
      const translated = { ...entity };

      for (const field of TRANSLATABLE_FIELDS) {
        if (field in entity) {
          (translated as Record<string, unknown>)[field] = getTranslatedField(
            entity,
            field,
            language,
          );
        }
      }

      return translated as TranslatedFields<T>;
    },
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// ===================== PLURALIZATION RULES =====================

// Russian pluralization forms: [singular, few (2-4), many (5+)]
const PLURAL_FORMS: Record<Language, Record<string, string[]>> = {
  en: {
    task: ["task", "tasks"],
    module: ["module", "modules"],
    topic: ["topic", "topics"],
    day: ["day", "days"],
    hour: ["hour", "hours"],
    minute: ["minute", "minutes"],
  },
  ru: {
    task: ["задача", "задачи", "задач"],
    module: ["модуль", "модуля", "модулей"],
    topic: ["тема", "темы", "тем"],
    day: ["день", "дня", "дней"],
    hour: ["час", "часа", "часов"],
    minute: ["минута", "минуты", "минут"],
  },
  uz: {
    task: ["vazifa"],
    module: ["modul"],
    topic: ["mavzu"],
    day: ["kun"],
    hour: ["soat"],
    minute: ["daqiqa"],
  },
};

function getRussianPluralForm(count: number): number {
  const abs = Math.abs(count);
  const lastTwo = abs % 100;
  const lastOne = abs % 10;

  if (lastTwo >= 11 && lastTwo <= 19) return 2; // many
  if (lastOne === 1) return 0; // singular
  if (lastOne >= 2 && lastOne <= 4) return 1; // few
  return 2; // many
}

function getEnglishPluralForm(count: number): number {
  return count === 1 ? 0 : 1;
}

// ===================== UI TRANSLATION HOOKS =====================

/**
 * Hook for translating UI strings
 * Usage: const { tUI, plural, difficulty, formatTimeLocalized } = useUITranslation();
 */
export function useUITranslation() {
  const { language } = useLanguage();

  const tUI = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const langTranslations = translations[language];
      let text = langTranslations[key] || translations.en[key] || key;

      // Replace parameters like {count}, {date}, etc.
      if (params) {
        Object.entries(params).forEach(([paramKey, value]) => {
          text = text.replace(
            new RegExp(`\\{${paramKey}\\}`, "g"),
            String(value),
          );
        });
      }

      return text;
    },
    [language],
  );

  const formatTimeLocalized = useCallback(
    (time: string): string => {
      if (!time) return "";
      const timeFormat = TIME_FORMATS[language];
      return time
        .replace(/(\d+)h/g, `$1${timeFormat.h}`)
        .replace(/(\d+)m/g, `$1${timeFormat.m}`)
        .replace(/(\d+)s/g, `$1${timeFormat.s}`);
    },
    [language],
  );

  const plural = useCallback(
    (count: number, word: string): string => {
      const forms = PLURAL_FORMS[language]?.[word];
      if (!forms) {
        // Fallback: just append count
        return `${count} ${word}`;
      }

      let form: string;
      if (language === "ru") {
        const index = getRussianPluralForm(count);
        form = forms[index] || forms[0];
      } else if (language === "uz") {
        // Uzbek has no plural forms
        form = forms[0];
      } else {
        // English
        const index = getEnglishPluralForm(count);
        form = forms[index] || forms[0];
      }

      return `${count} ${form}`;
    },
    [language],
  );

  const difficulty = useCallback(
    (level: string): string => {
      const labels = DIFFICULTY_LABELS[language];
      return labels[level as keyof typeof labels] || level;
    },
    [language],
  );

  const monthName = useCallback(
    (month: string): string => {
      const months = MONTHS[language];
      return months[month.toLowerCase() as keyof typeof months] || month;
    },
    [language],
  );

  return { tUI, language, formatTimeLocalized, plural, difficulty, monthName };
}

/**
 * Hook for time format translations (h, m, s)
 */
export function useTimeFormat() {
  const { language } = useLanguage();
  return TIME_FORMATS[language];
}

/**
 * Hook for month name translations
 */
export function useMonthNames() {
  const { language } = useLanguage();
  return MONTHS[language];
}

/**
 * Hook for difficulty label translations
 */
export function useDifficultyLabels() {
  const { language } = useLanguage();
  return DIFFICULTY_LABELS[language];
}
