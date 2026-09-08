import type { Language } from "@/lib/language";

export type CountryCode = "EG" | "SA" | "AE";

const SUPPORTED_COUNTRIES = new Set<CountryCode>(["EG", "SA", "AE"]);

function isSupportedCountry(value: string): value is CountryCode {
  return (SUPPORTED_COUNTRIES as Set<string>).has(value);
}

const HERO_EYEBROW_COPY: Record<Language, Record<CountryCode, string>> = {
  en: {
    EG: "🇪🇬 Built for businesses in Egypt",
    SA: "🇸🇦 Helping Saudi businesses build smarter systems",
    AE: "🇦🇪 AI transformation partner for UAE businesses",
  },
  ar: {
    EG: "🇪🇬 حلول ذكاء اصطناعي مصممة للشركات في مصر",
    SA: "🇸🇦 نساعد الشركات السعودية على بناء أنظمة أكثر ذكاءً",
    AE: "🇦🇪 شريك التحول بالذكاء الاصطناعي للشركات في الإمارات",
  },
};

const HERO_EYEBROW_FALLBACK: Record<Language, string> = {
  en: "AI transformation partner for ambitious businesses",
  ar: "شريك التحول بالذكاء الاصطناعي للشركات الطموحة",
};

// Covers missing header, unknown country (Cloudflare sends "XX"), VPN/Tor
// (Cloudflare sends "T1"), and any other invalid value — none match a
// supported code, so they all fall through to the generic copy.
export function resolveHeroEyebrow(rawCountry: string | null, language: Language): string {
  const normalized = rawCountry?.trim().toUpperCase() ?? "";
  if (isSupportedCountry(normalized)) {
    return HERO_EYEBROW_COPY[language][normalized];
  }
  return HERO_EYEBROW_FALLBACK[language];
}
