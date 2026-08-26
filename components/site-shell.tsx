import { getLanguagePath, type Language } from "@/lib/language";
import { LanguageSwitcher } from "@/components/language-switcher";

type NavLink = {
  path: string;
  label: string;
};

const NAV_LINKS: Record<Language, NavLink[]> = {
  en: [
    { path: "/", label: "Home" },
    { path: "/solutions", label: "Solutions" },
    { path: "/portfolio", label: "Portfolio" },
    { path: "/articles", label: "Articles" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ],
  ar: [
    { path: "/", label: "الرئيسية" },
    { path: "/solutions", label: "الحلول" },
    { path: "/portfolio", label: "أعمالنا" },
    { path: "/articles", label: "المقالات" },
    { path: "/about", label: "من نحن" },
    { path: "/contact", label: "تواصل معنا" },
  ],
};

const BOOK_CALL_LABEL: Record<Language, string> = {
  en: "Book a strategy call",
  ar: "احجز مكالمة استراتيجية",
};

const FOOTER_SERVICE_LINKS: Record<Language, NavLink[]> = {
  en: [
    { path: "/services/ai-training", label: "AI Enablement" },
    { path: "/services/digital-marketing", label: "Marketing Systems" },
    { path: "/services/software", label: "Business Technology" },
  ],
  ar: [
    { path: "/services/ai-training", label: "تمكين الذكاء الاصطناعي" },
    { path: "/services/digital-marketing", label: "أنظمة التسويق" },
    { path: "/services/software", label: "تقنية الأعمال" },
  ],
};

const FOOTER_COMPANY_LINKS: Record<Language, NavLink[]> = {
  en: [
    { path: "/about", label: "About" },
    { path: "/portfolio", label: "Work" },
    { path: "/articles", label: "Articles" },
    { path: "/contact", label: "Contact" },
  ],
  ar: [
    { path: "/about", label: "من نحن" },
    { path: "/portfolio", label: "الأعمال" },
    { path: "/articles", label: "المقالات" },
    { path: "/contact", label: "تواصل" },
  ],
};

const FOOTER_TEXT = {
  en: {
    stayConnected: "Stay Connected",
    newsletterText:
      "Practical notes on AI, marketing, and the systems that connect them — straight to your inbox.",
    newsletterPlaceholder: "Enter your email",
    location: "Wyoming, USA",
    copyright: "Omniflowai LLC",
  },
  ar: {
    stayConnected: "ابقَ على تواصل",
    newsletterText:
      "ملاحظات عملية حول الذكاء الاصطناعي والتسويق والأنظمة التي تربطها — إلى بريدك مباشرة.",
    newsletterPlaceholder: "أدخل بريدك الإلكتروني",
    location: "وايومنغ، الولايات المتحدة الأمريكية",
    copyright: "شركة OmniflowAI LLC. جميع الحقوق محفوظة.",
  },
} satisfies Record<Language, Record<string, string>>;

const CONTACT_EMAIL = "contact@omniflowai.net";

export function SiteShell({
  language,
  children,
}: Readonly<{
  language: Language;
  children: React.ReactNode;
}>) {
  const footerText = FOOTER_TEXT[language];

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
        <a href={getLanguagePath("/contact", language)}>
          {BOOK_CALL_LABEL[language]}
        </a>
      </header>
      {children}
      <footer>
        <div>
          {language === "ar" ? <span dir="ltr">OmniflowAI</span> : "OmniflowAI"}
        </div>
        <ul>
          {FOOTER_SERVICE_LINKS[language].map((link) => (
            <li key={link.path}>
              <a href={getLanguagePath(link.path, language)}>{link.label}</a>
            </li>
          ))}
        </ul>
        <ul>
          {FOOTER_COMPANY_LINKS[language].map((link) => (
            <li key={link.path}>
              <a href={getLanguagePath(link.path, language)}>{link.label}</a>
            </li>
          ))}
        </ul>
        <div>
          <p>{footerText.stayConnected}</p>
          <form>
            <p>{footerText.newsletterText}</p>
            <input
              type="email"
              name="email"
              placeholder={footerText.newsletterPlaceholder}
            />
            <button type="submit">{"→"}</button>
          </form>
          <p>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
          <p>{footerText.location}</p>
        </div>
        <p>
          {"© "}
          {new Date().getFullYear()}
          {" "}
          {language === "ar" ? (
            <>
              {"شركة "}
              <span dir="ltr">OmniflowAI LLC.</span>
              {" جميع الحقوق محفوظة."}
            </>
          ) : (
            footerText.copyright
          )}
        </p>
      </footer>
    </>
  );
}
