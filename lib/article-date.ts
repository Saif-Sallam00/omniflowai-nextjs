import type { Language } from "@/lib/language";

export function formatArticleDate(value: string | Date, language: Language): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(language === "ar" ? "ar-EG-u-nu-latn" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

const MEANINGFUL_UPDATE_THRESHOLD_MS = 24 * 60 * 60 * 1000;

// An update is only worth showing separately from the publish date once it's
// clearly a later edit, not creation/save noise a few seconds or minutes apart.
export function isUpdateMeaningful(publishedAt: Date | null, updatedAt: Date | null): boolean {
  if (!publishedAt || !updatedAt) return false;
  return updatedAt.getTime() - publishedAt.getTime() >= MEANINGFUL_UPDATE_THRESHOLD_MS;
}
