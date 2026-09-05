import Link from "next/link";
import { getLanguagePath, type Language } from "@/lib/language";
import { SERVICE_SHARED_STRINGS } from "@/lib/services/shared-strings";

export function ServiceFinalCta({
  heading,
  body,
  language,
}: {
  heading: string;
  body: string;
  language: Language;
}) {
  const strings = SERVICE_SHARED_STRINGS[language];

  return (
    <section className="relative overflow-hidden bg-slate-950 py-20 text-center text-slate-300 md:py-24">
      <div className="pointer-events-none absolute -bottom-52 left-1/2 h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-primary/[0.13] blur-3xl" />
      <div className="relative mx-auto max-w-3xl px-6 md:px-8">
        <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
          {heading}
        </h2>
        <p className="mx-auto mt-4 max-w-[56ch] leading-relaxed text-slate-400">{body}</p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={getLanguagePath("/solutions", language)}>
            <span className="inline-flex rounded-lg border border-primary bg-primary px-7 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
              {strings.primaryCta}
            </span>
          </Link>
          <Link href={getLanguagePath("/contact", language)}>
            <span className="inline-flex rounded-lg border border-slate-700 px-7 py-3 text-sm font-medium text-white transition-colors hover:border-slate-600 hover:bg-white/5">
              {strings.bookCallCta}
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
