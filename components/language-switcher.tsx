"use client";

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

export function LanguageSwitcher() {
  const pathname = usePathname();
  const language = resolveLanguageFromPathname(pathname);
  const otherLanguage = language === "en" ? "ar" : "en";
  const href = getCounterpartPath(getAgnosticPath(pathname), language);

  return <a href={href}>{SWITCHER_LABEL[otherLanguage]}</a>;
}
