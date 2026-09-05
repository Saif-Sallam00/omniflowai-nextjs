import Link from "next/link";
import { getLanguagePath, type Language } from "@/lib/language";
import { SERVICE_SHARED_STRINGS } from "@/lib/services/shared-strings";
import type { ServiceDetailContent } from "@/lib/services/types";
import { ServiceDiagram } from "@/components/services/service-diagram";

export function ServiceHero({
  content,
  language,
}: {
  content: ServiceDetailContent;
  language: Language;
}) {
  const strings = SERVICE_SHARED_STRINGS[language];
  const isRTL = language === "ar";

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="pointer-events-none absolute -top-40 end-[-120px] h-[520px] w-[520px] rounded-full bg-primary/[0.13] blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 md:px-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <span className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            {content.eyebrow}
            <span aria-hidden="true" className="h-px flex-1 bg-slate-800" />
          </span>
          <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl">
            {content.title}
          </h1>
          <p className="mt-5 max-w-[52ch] leading-relaxed text-slate-300">{content.lead}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href={getLanguagePath("/solutions", language)} className="w-full sm:w-auto">
              <span className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary bg-primary px-6 py-3 text-center text-sm font-semibold text-slate-950 transition-colors hover:bg-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
                {strings.primaryCta}
                <span aria-hidden="true" className={isRTL ? "rotate-180" : ""}>
                  →
                </span>
              </span>
            </Link>
            <Link href={getLanguagePath("/portfolio", language)} className="w-full sm:w-auto">
              <span className="flex w-full items-center justify-center rounded-lg border border-slate-700 px-6 py-3 text-center text-sm font-medium text-white transition-colors hover:border-slate-600 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {strings.secondaryCta}
              </span>
            </Link>
          </div>
        </div>

        <ServiceDiagram variant={content.slug} />
      </div>
    </section>
  );
}
