import Link from "next/link";
import { ArrowRight, Mail, MapPin, Send } from "lucide-react";
import { getLanguagePath, type Language } from "@/lib/language";
import { SiteHeader } from "@/components/site-header";

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
    tagline: "We build the systems behind business growth.",
    stayConnected: "Stay Connected",
    connectShort: "Connect",
    newsletterText:
      "Practical notes on AI, marketing, and the systems that connect them — straight to your inbox.",
    newsletterPlaceholder: "Enter your email",
    location: "Wyoming, USA",
    copyright: "Omniflowai LLC",
  },
  ar: {
    tagline: "نبني الأنظمة التي تقف خلف نمو الأعمال.",
    stayConnected: "ابقَ على تواصل",
    connectShort: "تواصل",
    newsletterText:
      "ملاحظات عملية حول الذكاء الاصطناعي والتسويق والأنظمة التي تربطها — إلى بريدك مباشرة.",
    newsletterPlaceholder: "أدخل بريدك الإلكتروني",
    location: "وايومنغ، الولايات المتحدة الأمريكية",
    copyright: "شركة OmniflowAI LLC. جميع الحقوق محفوظة.",
  },
} satisfies Record<Language, Record<string, string>>;

const CONTACT_EMAIL = "contact@omniflowai.net";

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link href={href}>
        <span className="group flex cursor-pointer items-center gap-2 text-slate-400 transition-colors hover:text-brand-400">
          <ArrowRight className="hidden h-3 w-3 -ms-5 opacity-0 transition-all duration-300 group-hover:ms-0 group-hover:opacity-100 md:block" />
          {children}
        </span>
      </Link>
    </li>
  );
}

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
      <SiteHeader
        language={language}
        navLinks={NAV_LINKS[language]}
        bookCallLabel={BOOK_CALL_LABEL[language]}
      />
      {children}
      <footer className="relative overflow-hidden border-t border-slate-800 bg-slate-950 text-slate-300">
        <div className="pointer-events-none absolute left-1/4 top-0 h-96 w-96 rounded-full bg-brand-500/5 blur-[60px]" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-brand-700/5 blur-[60px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 pb-10 pt-12 md:px-8 md:pt-24">
          <div className="mb-12 grid grid-cols-2 gap-x-4 gap-y-8 md:mb-16 md:gap-12 lg:grid-cols-4">
            <div className="col-span-2 space-y-4 text-center md:col-span-1 md:space-y-6 md:text-start">
              <Link href={getLanguagePath("/", language)}>
                <span className="flex cursor-pointer items-center justify-center gap-2 font-display text-2xl font-bold text-white md:justify-start">
                  {language === "ar" ? <span dir="ltr">OmniflowAI</span> : "OmniflowAI"}
                  <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
                </span>
              </Link>
              <p className="text-sm leading-relaxed text-slate-400 md:text-base">
                {footerText.tagline}
              </p>
            </div>

            <div className="col-span-1">
              <ul className="space-y-3 text-xs md:space-y-4 md:text-sm">
                {FOOTER_SERVICE_LINKS[language].map((link) => (
                  <FooterLink key={link.path} href={getLanguagePath(link.path, language)}>
                    {link.label}
                  </FooterLink>
                ))}
              </ul>
            </div>

            <div className="col-span-1">
              <ul className="space-y-3 text-xs md:space-y-4 md:text-sm">
                {FOOTER_COMPANY_LINKS[language].map((link) => (
                  <FooterLink key={link.path} href={getLanguagePath(link.path, language)}>
                    {link.label}
                  </FooterLink>
                ))}
              </ul>
            </div>

            <div className="col-span-2 space-y-4 md:col-span-1 md:space-y-6">
              <h3 className="mb-4 text-xs font-bold uppercase text-white md:mb-6 md:text-base md:normal-case">
                <span className="md:hidden">{footerText.connectShort}</span>
                <span className="hidden md:inline">{footerText.stayConnected}</span>
              </h3>
              <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                <p className="text-xs text-slate-400">{footerText.newsletterText}</p>
                <form className="flex gap-2">
                  <input
                    type="email"
                    name="email"
                    placeholder={footerText.newsletterPlaceholder}
                    className="h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  />
                  <button
                    type="submit"
                    aria-label={footerText.newsletterPlaceholder}
                    className="flex h-10 w-10 flex-none items-center justify-center rounded-md bg-primary text-primary-foreground"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
              <div className="space-y-3 pt-0 md:pt-2">
                <div className="flex items-center gap-3 text-xs text-slate-400 md:text-sm">
                  <Mail className="h-4 w-4 flex-shrink-0 text-brand-500" />
                  <a href={`mailto:${CONTACT_EMAIL}`} className="break-all">
                    {CONTACT_EMAIL}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 md:text-sm">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-brand-500" />
                  <span>{footerText.location}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 h-px bg-slate-800" />

          <div className="flex flex-col items-center justify-between gap-4 text-center text-xs text-slate-400 md:flex-row md:text-start">
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
          </div>
        </div>
      </footer>
    </>
  );
}
