import { getLanguagePath, type Language } from "@/lib/language";
import { LanguageSwitcher } from "@/components/language-switcher";

type NavLink = {
  path: string;
  label: string;
};

const NAV_LINKS: Record<Language, NavLink[]> = {
  en: [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/solutions", label: "Solutions" },
  ],
  ar: [
    { path: "/", label: "الرئيسية" },
    { path: "/about", label: "من نحن" },
    { path: "/solutions", label: "الحلول" },
  ],
};

const FOOTER_TEXT: Record<Language, string> = {
  en: "© OmniflowAI. All rights reserved.",
  ar: "© OmniflowAI. جميع الحقوق محفوظة.",
};

export function SiteShell({
  language,
  children,
}: Readonly<{
  language: Language;
  children: React.ReactNode;
}>) {
  return (
    <>
      <header>
        <nav>
          {NAV_LINKS[language].map((link) => (
            <a key={link.path} href={getLanguagePath(link.path, language)}>
              {link.label}
            </a>
          ))}
        </nav>
        <LanguageSwitcher />
      </header>
      {children}
      <footer>
        <p>{FOOTER_TEXT[language]}</p>
      </footer>
    </>
  );
}
