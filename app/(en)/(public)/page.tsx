import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Bot, Target, Layers } from "lucide-react";
import { buildPageMetadata } from "@/lib/metadata";
import { getLanguagePath } from "@/lib/language";
import { Reveal } from "@/components/reveal";
import { ValuePropReveal } from "@/components/value-prop-reveal";
import { HowWeWorkTimeline } from "@/components/how-we-work-timeline";
import { LogoMarquee } from "@/components/logo-marquee";
import { InteractiveSystemMap, type InteractiveNode } from "@/components/interactive-system-map";
import { HexGridSubstrate } from "@/components/systems/hex-grid-substrate";
import { CLIENTS } from "@/lib/clients";

const LANGUAGE = "en" as const;

export function generateMetadata() {
  return buildPageMetadata({
    path: "/",
    language: "en",
    title: "Most teams buy the tool first. We diagnose first.",
    description:
      "AI, marketing, software, automation — we only build what the diagnosis supports. We look before we touch, so what we build fits how your business actually runs.",
  });
}

const SYSTEM_MAP_CENTER = "Business System";
const SYSTEM_MAP_ARIA =
  "A connected business system: AI enablement, marketing systems, business technology, automation, CRM and strategy all connecting into one central system.";

// Icons resolved inside InteractiveSystemMap (id → icon fallback map) — a
// server component can't pass icon components as client-component props.
const heroSystemNodes: InteractiveNode[] = [
  { id: "ai-training", label: "AI Enablement" },
  { id: "marketing", label: "Marketing Systems" },
  { id: "software", label: "Business Technology" },
  { id: "automation", label: "Automation" },
  { id: "crm", label: "CRM" },
  { id: "strategy", label: "Strategy" },
];

const PILLARS = [
  {
    href: "/solutions",
    icon: Bot,
    title: "AI Enablement",
    body: "We run structured AI adoption programs for teams and leadership — from executive strategy sessions to hands-on workflow integration. The goal isn't awareness, it's operational capability: your people using AI on real work, not watching a demo.",
  },
  {
    href: "/solutions",
    icon: Target,
    title: "Marketing Systems",
    body: "SEO, paid campaigns, and conversion strategy wired into one engine that targets qualified buyers — not vanity traffic. Every stage is tracked, so you know what a lead actually costs and where revenue comes from.",
  },
  {
    href: "/solutions",
    icon: Layers,
    title: "Business Technology",
    body: "The systems your business runs on — ERP and CRM platforms, customer-facing web, mobile apps, and the automation that connects them. Built to own, integrate, and scale, not to rent.",
    subcaps: "Business Systems (ERP/CRM) · Web Platforms · Mobile Apps · Automation & AI",
  },
];

const TRANSFORM_BEFORE = [
  "Tools that don't talk to each other",
  "Marketing disconnected from operations",
  "Manual work slowing everything down",
  "No clear view of what's actually working",
];

const TRANSFORM_AFTER = [
  "One integrated business system",
  "Acquisition, conversion, and operations connected",
  "Automated workflows across the business",
  "Real-time visibility into performance",
];

const HOW_WE_WORK = [
  {
    step: "01",
    title: "Diagnose",
    desc: "We map your business model, systems, and the bottlenecks slowing growth.",
  },
  {
    step: "02",
    title: "Design",
    desc: "We design the right mix of software, marketing, and automation for how you actually operate.",
  },
  {
    step: "03",
    title: "Build",
    desc: "We develop and integrate the system, and hand you full ownership.",
  },
  {
    step: "04",
    title: "Optimize",
    desc: "We keep improving it against real business data.",
  },
];

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* 1. Hero */}
      <section className="relative mt-16 flex min-h-[80vh] items-center overflow-hidden py-20 md:mt-20 md:py-28">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-orange-950/10 via-transparent to-transparent" />
        <HexGridSubstrate className="absolute inset-0" opacity={0.035} fade="radial" />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 md:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10">
            <div className="text-center lg:text-start">
              <h1 className="text-4xl font-black leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                Most teams buy the tool first.{" "}
                <span className="text-brand-400">We diagnose first.</span>
              </h1>
              <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl lg:mx-0">
                AI, marketing, software, automation — we only build what the
                diagnosis supports. We look before we touch, so what we build
                fits how your business actually runs.
              </p>
              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                <Link href={getLanguagePath("/contact", LANGUAGE)}>
                  <span className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground shadow-sm transition hover:brightness-110 sm:w-auto md:h-14">
                    Book a strategy call <ArrowRight className="ms-2 h-5 w-5" />
                  </span>
                </Link>
                <Link href={getLanguagePath("/portfolio", LANGUAGE)}>
                  <span className="inline-flex h-12 w-full items-center justify-center rounded-full border border-slate-700 px-8 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white sm:w-auto md:h-14">
                    See our work
                  </span>
                </Link>
              </div>
            </div>

            <div className="mx-auto w-full max-w-sm lg:max-w-none">
              <InteractiveSystemMap
                centerLabel={SYSTEM_MAP_CENTER}
                nodes={heroSystemNodes}
                ariaLabel={SYSTEM_MAP_ARIA}
                isRTL={false}
                width={480}
                height={460}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trust strip + client-logo marquee */}
      <section className="overflow-hidden border-y border-black/[0.06] bg-surface py-20 md:py-24">
        <div className="mx-auto mb-16 flex max-w-4xl flex-col items-center px-6 text-center md:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
            </span>
            Trusted partners
          </span>
          <h2 className="mt-5 max-w-3xl text-balance text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Trusted by brands across the US, the GCC &amp; Egypt
          </h2>

          <dl className="mt-10 grid w-full max-w-3xl grid-cols-1 gap-8 sm:grid-cols-3 md:gap-6">
            <div className="flex flex-col items-center text-center">
              <dd className="flex min-h-[3rem] items-center justify-center text-4xl font-bold leading-tight tabular-nums text-brand-600 md:min-h-[3.5rem] md:text-5xl">
                50+
              </dd>
              <dt className="mt-3 text-sm text-slate-600 md:text-base">Projects delivered</dt>
            </div>
            <div className="flex flex-col items-center text-center">
              <dd className="flex min-h-[3rem] items-center justify-center text-4xl font-bold leading-tight tabular-nums text-brand-600 md:min-h-[3.5rem] md:text-5xl">
                8
              </dd>
              <dt className="mt-3 text-sm text-slate-600 md:text-base">Countries</dt>
            </div>
            <div className="flex flex-col items-center text-center">
              <dd className="flex min-h-[3rem] items-center justify-center text-2xl font-bold leading-tight text-brand-600 md:min-h-[3.5rem] md:text-3xl">
                Full GCC coverage
              </dd>
              <dt className="mt-3 text-sm text-slate-600 md:text-base">+ US &amp; Egypt</dt>
            </div>
          </dl>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-slate-500">
            {[
              "Egypt",
              "Saudi Arabia",
              "UAE",
              "Qatar",
              "Kuwait",
              "Bahrain",
              "Oman",
              "United States",
            ].flatMap((country, i) =>
              i === 0
                ? [<span key={country}>{country}</span>]
                : [
                    <span key={`sep-${i}`} aria-hidden="true" className="text-slate-300">
                      ·
                    </span>,
                    <span key={country}>{country}</span>,
                  ],
            )}
          </div>
        </div>

        <LogoMarquee clients={CLIENTS} />
      </section>

      {/* 3. Value proposition */}
      <section className="border-y border-white/[0.06] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-20 md:py-24">
        <ValuePropReveal
          lead="Most companies don't have a marketing problem."
          highlight="They have a systems problem."
          body="Disconnected tools, manual handoffs, and no clear line of sight from a lead to a closed deal. We connect the whole chain — how you acquire customers, how you convert them, and how you operate once they're in — so the parts work as one system you can actually measure."
        />
      </section>

      {/* 4. Pillars / Services grid */}
      <section className="border-t border-black/[0.06] bg-surface py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <h2 className="mb-12 max-w-2xl text-3xl font-bold text-slate-900 md:mb-16 md:text-4xl">
            Three capabilities. One transformation partner.
          </h2>

          <Reveal className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {PILLARS.map((pillar, index) => (
              <Link key={index} href={getLanguagePath(pillar.href, LANGUAGE)}>
                <div className="card-lift group flex h-full cursor-pointer flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-card hover:border-slate-300 md:p-8">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10">
                    <pillar.icon className="h-6 w-6 text-brand-600" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold leading-snug text-slate-900">
                    {pillar.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600 md:text-base">
                    {pillar.body}
                  </p>
                  {pillar.subcaps && (
                    <p className="mt-6 border-t border-slate-200 pt-6 text-xs font-medium text-brand-700">
                      {pillar.subcaps}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      {/* 5. Transformation (Before / After) */}
      <section className="border-y border-white/[0.06] bg-slate-950 py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-white md:mb-16 md:text-4xl">
            From scattered tools to one connected system
          </h2>

          <Reveal className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-card md:p-8">
              <p className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-400">
                Before
              </p>
              <ul className="space-y-4">
                {TRANSFORM_BEFORE.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-400">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-brand-500/20 bg-gradient-to-br from-brand-700/15 to-slate-900/50 p-6 shadow-card md:p-8">
              <p className="mb-6 text-xs font-bold uppercase tracking-widest text-brand-400">
                After
              </p>
              <ul className="space-y-4">
                {TRANSFORM_AFTER.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-200">
                    <CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-brand-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 8. How we work */}
      <section className="border-t border-black/[0.06] bg-surface py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <h2 className="mb-12 text-3xl font-bold text-slate-900 md:mb-16 md:text-4xl">
            How we work
          </h2>
          <HowWeWorkTimeline items={HOW_WE_WORK} />
        </div>
      </section>

      {/* 9. Global brand line */}
      <section className="border-y border-brand-500/10 bg-slate-950 bg-gradient-to-r from-brand-700/15 via-slate-950 to-brand-700/15 py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-brand-500/20 bg-brand-500/10">
                <Shield className="h-6 w-6 text-brand-400" />
              </div>
              <p className="max-w-2xl text-lg font-semibold text-white md:text-xl">
                We don&apos;t hand over deliverables and walk away. We build
                systems that keep working after we&apos;re gone.
              </p>
            </div>
            <Link href={getLanguagePath("/contact", LANGUAGE)}>
              <span className="flex items-center whitespace-nowrap rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors">
                Book a strategy call
                <ArrowRight className="ms-2 h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* 10. Final CTA */}
      <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-t from-orange-950/20 via-transparent to-transparent" />

        <Reveal className="relative z-10 mx-auto max-w-3xl px-6 text-center md:px-8">
          <h2 className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl">
            Ready to transform how your business runs?
          </h2>
          <p className="mb-10 text-xl leading-relaxed text-slate-400">
            Book a strategy call. We&apos;ll look at your current systems and
            show you exactly what&apos;s blocking growth — even if you
            don&apos;t work with us.
          </p>

          <Link href={getLanguagePath("/contact", LANGUAGE)}>
            <span className="inline-flex items-center rounded-full bg-primary px-10 py-7 text-lg font-semibold text-primary-foreground transition-colors">
              Book your strategy call
              <ArrowRight className="ms-2 h-5 w-5" />
            </span>
          </Link>

          <p className="mt-6 text-sm text-slate-400">No sales pitch. Just clarity.</p>
        </Reveal>
      </section>
    </main>
  );
}
