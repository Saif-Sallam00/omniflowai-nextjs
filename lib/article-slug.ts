import type { Language } from "@/lib/language";

// Lowercase Latin, digits, single hyphens between words — the old app's exact rule.
export const SLUG_PATTERN_EN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Core Arabic block (U+0600-U+06FF) with the Arabic-Indic (U+0660-U+0669) and
// Extended Arabic-Indic (U+06F0-U+06F9) digit ranges carved out, plus ASCII
// digits only — research.md Item 1 deliberately excludes Arabic-Indic digits.
// No case distinction in Arabic, so no case-folding rule applies here.
const ARABIC_SLUG_CHAR = "؀-ٟ٪-ۯۺ-ۿ0-9";
export const SLUG_PATTERN_AR = new RegExp(
  `^[${ARABIC_SLUG_CHAR}]+(?:-[${ARABIC_SLUG_CHAR}]+)*$`,
);

// Arabic diacritics (harakat: U+0610-U+061A, U+064B-U+065F, U+0670,
// U+06D6-U+06ED) — stripped so a title typed with or without them produces
// the same slug, mirroring what NFKD-stripping does for Latin.
const ARABIC_DIACRITICS = /[ؐ-ًؚ-ٰٟۖ-ۭ]/g;

// Any character outside the allowed Arabic-slug class (spaces, punctuation,
// Arabic-Indic digits included).
const NON_ARABIC_SLUG_CHARS = new RegExp(`[^${ARABIC_SLUG_CHAR}]+`, "g");

function slugifyEn(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function slugifyAr(title: string): string {
  return title
    .replace(ARABIC_DIACRITICS, "")
    .replace(NON_ARABIC_SLUG_CHARS, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function slugifyForLanguage(title: string, language: Language): string {
  return language === "ar" ? slugifyAr(title) : slugifyEn(title);
}

export function slugPatternForLanguage(language: Language): RegExp {
  return language === "ar" ? SLUG_PATTERN_AR : SLUG_PATTERN_EN;
}
