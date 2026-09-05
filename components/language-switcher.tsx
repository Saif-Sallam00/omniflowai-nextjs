"use client";

import { usePathname } from "next/navigation";
import {
  getAgnosticPath,
  getCounterpartPath,
  getLanguagePath,
  resolveLanguageFromPathname,
} from "@/lib/language";
import { useLanguageAlternate } from "@/lib/language-alternate-context";

const LANGUAGE_LABEL: Record<"en" | "ar", string> = {
  en: "EN",
  ar: "العربية",
};

// Hardcoded literals in the source design, not i18n keys.
const A11Y_SWITCH_LABEL: Record<"en" | "ar", string> = {
  en: "Switch to English",
  ar: "التبديل إلى العربية",
};

export function LanguageSwitcher({ fullWidth = false }: { fullWidth?: boolean }) {
  const pathname = usePathname();
  const language = resolveLanguageFromPathname(pathname);
  const otherLanguage = language === "en" ? "ar" : "en";
  const { override } = useLanguageAlternate();

  let otherHref: string;
  if (override === undefined) {
    otherHref = getCounterpartPath(getAgnosticPath(pathname), language);
  } else if (override === null) {
    otherHref = getLanguagePath("/articles", otherLanguage);
  } else {
    otherHref = override;
  }

  return (
    <div
      className={`inline-flex items-center rounded-full border border-slate-700 bg-slate-900/60 p-1 ${
        fullWidth ? "h-12 w-full" : ""
      }`}
    >
      {(["ar", "en"] as const).map((lang) => {
        const segmentClasses = `flex items-center justify-center rounded-full text-sm transition-colors ${
          fullWidth ? "h-full flex-1" : "px-3.5 py-1.5"
        }`;

        if (lang === language) {
          return (
            <span
              key={lang}
              className={`${segmentClasses} bg-primary font-semibold text-primary-foreground`}
            >
              {LANGUAGE_LABEL[lang]}
            </span>
          );
        }

        return (
          <a
            key={lang}
            href={otherHref}
            aria-label={A11Y_SWITCH_LABEL[lang]}
            className={`${segmentClasses} font-medium text-slate-400 hover:text-white`}
          >
            {LANGUAGE_LABEL[lang]}
          </a>
        );
      })}
    </div>
  );
}
