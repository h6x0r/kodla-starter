import en from "./en.json";
import ru from "./ru.json";
import uz from "./uz.json";

export type Language = "en" | "ru" | "uz";

export type TranslationKey = keyof typeof en;

export const translations: Record<Language, Record<string, string>> = {
  en,
  ru,
  uz,
};

// Time format translations
export const TIME_FORMATS: Record<
  Language,
  { h: string; m: string; s: string }
> = {
  en: { h: "h", m: "m", s: "s" },
  ru: { h: "ч", m: "м", s: "с" },
  uz: { h: "s", m: "d", s: "s" },
};

// Month names
export const MONTHS: Record<Language, Record<string, string>> = {
  en: {
    jan: "Jan",
    feb: "Feb",
    mar: "Mar",
    apr: "Apr",
    may: "May",
    jun: "Jun",
    jul: "Jul",
    aug: "Aug",
    sep: "Sep",
    oct: "Oct",
    nov: "Nov",
    dec: "Dec",
  },
  ru: {
    jan: "Янв",
    feb: "Фев",
    mar: "Мар",
    apr: "Апр",
    may: "Май",
    jun: "Июн",
    jul: "Июл",
    aug: "Авг",
    sep: "Сен",
    oct: "Окт",
    nov: "Ноя",
    dec: "Дек",
  },
  uz: {
    jan: "Yan",
    feb: "Fev",
    mar: "Mar",
    apr: "Apr",
    may: "May",
    jun: "Iyun",
    jul: "Iyul",
    aug: "Avg",
    sep: "Sen",
    oct: "Okt",
    nov: "Noy",
    dec: "Dek",
  },
};

// Difficulty labels
export const DIFFICULTY_LABELS: Record<
  Language,
  { easy: string; medium: string; hard: string }
> = {
  en: { easy: "Easy", medium: "Medium", hard: "Hard" },
  ru: { easy: "Легко", medium: "Средне", hard: "Сложно" },
  uz: { easy: "Oson", medium: "O'rtacha", hard: "Qiyin" },
};
