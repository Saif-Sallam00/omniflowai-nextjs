"use client";

import { Globe } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  getAgnosticPath,
  getCounterpartPath,
  resolveLanguageFromPathname,
} from "@/lib/language";

const SWITCHER_LABEL: Record<"en" | "ar", string> = {
  en: "English",
  ar: "العربية",
};

// Hardcoded literals in the source design, not i18n keys.
const A11Y_TOGGLE_LABEL: Record<"en" | "ar", string> = {
  en: "التبديل إلى العربية",
  ar: "Switch to English",
};

export function LanguageSwitcher({
  variant = "label",
}: {
  variant?: "label" | "icon";
}) {
  const pathname = usePathname();
  const language = resolveLanguageFromPathname(pathname);
  const otherLanguage = language === "en" ? "ar" : "en";
  const href = getCounterpartPath(getAgnosticPath(pathname), language);

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
