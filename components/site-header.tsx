"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Hexagon, Menu, X } from "lucide-react";
import { getLanguagePath, type Language } from "@/lib/language";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useFocusTrap } from "@/lib/hooks/use-focus-trap";

type NavLink = { path: string; label: string };

// Hardcoded literals in the source design, not i18n keys (matches the
// existing pattern in language-switcher.tsx's A11Y_TOGGLE_LABEL).
const MOBILE_NAV_LABEL: Record<Language, string> = {
  en: "Site navigation",
  ar: "التنقل في الموقع",
};

export function SiteHeader({
  language,
  navLinks,
  bookCallLabel,
}: {
  language: Language;
  navLinks: NavLink[];
  bookCallLabel: string;
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isRTL = language === "ar";
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleEscape = () => {
    setIsMobileMenuOpen(false);
    toggleButtonRef.current?.focus();
  };

  useFocusTrap(toggleButtonRef, overlayRef, isMobileMenuOpen, handleEscape);

  const handleToggleClick = () => {
    const willOpen = !isMobileMenuOpen;
    setIsMobileMenuOpen(willOpen);
    if (!willOpen) {
      // Closing via the toggle itself: explicitly restore focus rather than
      // assuming the click already left it focused (Safari doesn't always
      // focus a button on click).
      toggleButtonRef.current?.focus();
    }
  };

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 border-b transition-all duration-300 ${
        isScrolled
          ? "border-slate-800/50 bg-slate-950/90 py-2 backdrop-blur-md"
          : "border-transparent bg-slate-950/0 py-4"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href={getLanguagePath("/", language)}>
            <span className="group flex cursor-pointer items-center gap-3">
              <span
                dir="ltr"
                className="flex items-center font-display text-4xl font-bold tracking-tight transition-colors"
              >
                <Hexagon className="me-1 h-9 w-9 rotate-90 stroke-[3] text-brand-500 transition-colors group-hover:text-brand-400" />
                <span className="text-white transition-colors group-hover:text-brand-400">
                  Omniflow
                </span>
                <span className="text-brand-500 transition-colors group-hover:text-brand-400">
                  AI
                </span>
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => {
              const href = getLanguagePath(link.path, language);
              const isActive = pathname === href;
              return (
                <Link key={link.path} href={href}>
                  <span
                    className={`cursor-pointer text-sm font-medium transition-colors ${
                      isActive ? "text-brand-400" : "text-slate-300 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <LanguageSwitcher variant="icon" />
            <Link href={getLanguagePath("/contact", language)}>
              <span className="flex items-center whitespace-nowrap rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 lg:px-6">
                {bookCallLabel}
                <ArrowRight className={`h-4 w-4 ${isRTL ? "mr-2" : "ml-2"}`} />
              </span>
            </Link>
          </div>

          <button
            ref={toggleButtonRef}
            type="button"
            className="rounded-md p-2.5 text-slate-300 hover:bg-white/10 hover:text-white md:hidden"
            onClick={handleToggleClick}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label={MOBILE_NAV_LABEL[language]}
          className="absolute left-0 right-0 top-full h-screen border-t border-slate-800 bg-slate-950 md:hidden"
        >
          <div className="space-y-4 px-6 py-6">
            {navLinks.map((link) => {
              const href = getLanguagePath(link.path, language);
              const isActive = pathname === href;
              return (
                <Link key={link.path} href={href} onClick={() => setIsMobileMenuOpen(false)}>
                  <span
                    className={`block cursor-pointer rounded-xl px-4 py-4 text-lg font-medium transition-colors ${
                      isActive
                        ? "bg-brand-500/10 text-brand-400"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </span>
                </Link>
              );
            })}
            <div className="mt-8 space-y-3">
              <Link
                href={getLanguagePath("/contact", language)}
                className="block"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="flex h-12 w-full items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                  {bookCallLabel}
                </span>
              </Link>
              <LanguageSwitcher variant="label" />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
