import type { ReactNode } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getLanguagePath, type Language } from "@/lib/language";
import { resolveHeroEyebrow } from "@/lib/country-personalization";
import { InteractiveSystemMap, type InteractiveNode } from "@/components/interactive-system-map";
import { HexGridSubstrate } from "@/components/systems/hex-grid-substrate";

type HomeHeroProps = {
  language: Language;
  headline: ReactNode;
  subhead: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  systemMapCenterLabel: string;
  systemMapAriaLabel: string;
  systemMapNodes: InteractiveNode[];
  isRTL: boolean;
};

export async function HomeHero({
  language,
  headline,
  subhead,
  primaryCtaLabel,
  secondaryCtaLabel,
  systemMapCenterLabel,
  systemMapAriaLabel,
  systemMapNodes,
  isRTL,
}: HomeHeroProps) {
  const requestHeaders = await headers();
  const eyebrow = resolveHeroEyebrow(requestHeaders.get("cf-ipcountry"), language);

  return (
    <section className="relative mt-16 flex min-h-[80vh] items-center overflow-hidden py-20 md:mt-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-orange-950/10 via-transparent to-transparent" />
      <HexGridSubstrate className="absolute inset-0" opacity={0.035} fade="radial" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 md:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10">
          <div className="text-center lg:text-start">
            <p className="mb-4 flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary lg:justify-start">
              {eyebrow}
            </p>
            <h1 className="text-4xl font-black leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              {headline}
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl lg:mx-0">
              {subhead}
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <Link href={getLanguagePath("/contact", language)}>
                <span className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground shadow-sm transition hover:brightness-110 sm:w-auto md:h-14">
                  {primaryCtaLabel} <ArrowRight className="ms-2 h-5 w-5" />
                </span>
              </Link>
              <Link href={getLanguagePath("/portfolio", language)}>
                <span className="inline-flex h-12 w-full items-center justify-center rounded-full border border-slate-700 px-8 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white sm:w-auto md:h-14">
                  {secondaryCtaLabel}
                </span>
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-sm lg:max-w-none">
            <InteractiveSystemMap
              centerLabel={systemMapCenterLabel}
              nodes={systemMapNodes}
              ariaLabel={systemMapAriaLabel}
              isRTL={isRTL}
              width={480}
              height={460}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
