"use client";

import { Globe } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  getAgnosticPath,
  getCounterpartPath,
  getLanguagePath,
  resolveLanguageFromPathname,
} from "@/lib/language";
import { useLanguageAlternate } from "@/lib/language-alternate-context";

const SWITCHER_LABEL: Record<"en" | "ar", string> = {
  en: "English",
  ar: "العربية",
};

// Hardcoded literals in the source design, not i18n keys.
const A11Y_TOGGLE_LABEL: Record<"en" | "ar", string> = {
  en: "Switch to Arabic",
  ar: "التبديل إلى الإنجليزية",
};

export function LanguageSwitcher({
  variant = "label",
}: {
  variant?: "label" | "icon";
}) {
  const pathname = usePathname();
  const language = resolveLanguageFromPathname(pathname);
  const otherLanguage = language === "en" ? "ar" : "en";
  const { override } = useLanguageAlternate();

  let href: string;
  if (override === undefined) {
    href = getCounterpartPath(getAgnosticPath(pathname), language);
  } else if (override === null) {
    href = getLanguagePath("/articles", otherLanguage);
  } else {
    href = override;
  }

  if (variant === "icon") {
    return (
      <a
        href={href}
        aria-label={A11Y_TOGGLE_LABEL[language]}
        className="rounded-full p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
      >
        <Globe className="h-5 w-5" />
      </a>
    );
  }

  return (
    <a
      href={href}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-slate-700 text-slate-300 transition-colors hover:text-white"
    >
      <Globe className="h-4 w-4" />
      {SWITCHER_LABEL[otherLanguage]}
    </a>
  );
}
