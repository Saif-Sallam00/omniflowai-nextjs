export type Language = "en" | "ar";

export type LanguageConfig = {
  prefix: "" | "/ar";
  dir: "ltr" | "rtl";
  htmlLang: "en" | "ar";
};

export const LANGUAGES: Record<Language, LanguageConfig> = {
  en: { prefix: "", dir: "ltr", htmlLang: "en" },
  ar: { prefix: "/ar", dir: "rtl", htmlLang: "ar" },
};

export function resolveLanguageFromPathname(pathname: string): Language {
  return pathname === "/ar" || pathname.startsWith("/ar/") ? "ar" : "en";
}

export function getLanguagePath(path: string, language: Language): string {
  const prefix = LANGUAGES[language].prefix;
  if (path === "/") return prefix === "" ? "/" : prefix;
  return `${prefix}${path}`;
}

export function getCounterpartPath(path: string, language: Language): string {
  const otherLanguage: Language = language === "en" ? "ar" : "en";
  return getLanguagePath(path, otherLanguage);
}

export function getAgnosticPath(pathname: string): string {
  if (pathname === "/ar") return "/";
  if (pathname.startsWith("/ar/")) return pathname.slice(3);
  return pathname;
}
