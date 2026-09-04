import type { Language } from "@/lib/language";

const WORDS_PER_MINUTE: Record<Language, number> = { en: 225, ar: 180 };

function toPlainText(body: string): string {
  return body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`[^`]*`/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/[*_~`>#|-]/g, " ");
}

export function getArticleReadingMinutes(body: string, language: Language): number {
  const words = toPlainText(body)
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE[language]));
}

export function formatReadingTime(minutes: number, language: Language): string {
  if (language === "ar") {
    return `${minutes} ${minutes === 1 ? "دقيقة" : "دقائق"} قراءة`;
  }
  return `${minutes} min read`;
}
