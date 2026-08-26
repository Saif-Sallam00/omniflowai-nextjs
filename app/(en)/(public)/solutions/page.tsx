import Link from "next/link";
import { buildPageMetadata } from "@/lib/metadata";
import { getLanguagePath } from "@/lib/language";
import { Disclosure } from "@/components/disclosure";
import { HexGlyph } from "@/components/hex-glyph";
import {
  SolutionsInteractive,
  type SolutionsCopy,
} from "@/components/solutions-interactive";
import { ltrNames } from "@/lib/ltr-names";
import { BusinessDiagnostic } from "@/components/business-diagnostic";

const LANGUAGE = "en" as const;

export function generateMetadata() {
  return buildPageMetadata({
    path: "/solutions",
    language: "en",
    title: "Build the systems behind your next stage of growth.",
    description:
      "Your business already works. What it needs now is the infrastructure to scale. We find what's blocking growth, then build the marketing, technology, and AI systems that remove it.",
  });
}

const DIAG_COPY = {
  title: "Business diagnosis",
  systemTitle: "Growth operating system",
  summary: "{s} signals · {c} root constraints",
  hint: "Select any signal to reveal what it's really connected to.",
  trace: "{n} of {s} signals trace to this constraint",
  buildLabel: "We build",
  showSystem: "Show the system",
  showSignals: "Back to the signals",
  rootLabel: "Root constraint",
  strategyLabel: "Strategy",
  strategyBody:
    "The business diagnosis decides which of the three you need, and in what order.",
  thesis: "Most growth problems are symptoms of one missing system.",
  signals: [
    { label: "Inconsistent growth", text: "Growth is inconsistent, not compounding." },
    { label: "Untraceable spend", text: "Spend can't be traced to revenue." },
    { label: "Handoff delays", text: "Work stalls at every handoff." },
    { label: "Manual reporting", text: "Every report is rebuilt by hand." },
    {
      label: "Founder-dependent decisions",
      text: "Decisions route through a few people.",
    },
    {
      label: "Headcount-bound capacity",
      text: "More volume still means more headcount.",
    },
    { label: "Stalled AI adoption", text: "AI is discussed, never operational." },
  ],
  constraints: [
    {
      name: "Demand isn't a system.",
      impact:
        "Revenue depends on effort, so it can't be forecast or compounded.",
    },
    {
      name: "The business runs on people, not systems.",
      impact:
        "Every process needs a person inside it, so complexity grows faster than output.",
    },
    {
      name: "Capacity only scales by hiring.",
      impact:
        "Output is capped by headcount — the slowest and most expensive way to grow.",
    },
  ],
};

const SOLUTIONS_COPY: SolutionsCopy = {
  router: {
    eyebrow: "Business diagnostic",
    heading: "Find your growth constraint.",
    sub: "Pick what sounds closest to your business. We'll point you to the right starting point.",
    questions: [
      "We have customers, but growth is inconsistent.",
      "Our growth depends on adding more people instead of better systems.",
      "We have tools, but nothing is connected.",
      "We know AI matters but don't know where to start.",
      "We're not sure what's actually broken.",
      "We have a unique challenge that needs a tailored approach.",
    ],
    resultLabel: "Recommended starting point",
    results: [
      "Your acquisition needs to become a system before more technology gets built on top of it.",
      "Headcount-driven growth is an infrastructure limit. The systems have to carry that load instead.",
      "Disconnected tools is an infrastructure problem, not a marketing one.",
      "Start by finding where AI actually pays off inside your workflows.",
      "That's exactly what the diagnosis is for. Nobody should build before that answer exists.",
      "Then the answer is a system designed around your constraints, not a predefined scope.",
    ],
    unsure: "Rather just talk it through? Book a strategy call.",
  },
  grid: {
    heading: "Three ways in. One business diagnosis behind all of them.",
    sub: "These aren't tiers. They're different starting points for different constraints. The business diagnosis decides which one fits.",
    recommendedNote:
      "Marked against the growth constraint selected above. Change the constraint and the recommendation changes with it.",
    recommendedBadge: "Recommended",
    bestForLabel: "Best for",
    problemLabel: "The problem",
    includedLabel: "What's included",
    outcomeLabel: "Outcome",
    priceFromLabel: "Starting from",
  },
  bookCallLabel: "Book a strategy call",
  cards: [
    {
      id: "foundation",
      name: "Foundation",
      statement: "You know growth is stuck. You don't yet know why.",
      outcomeShort: "Find the constraint before spending on solutions.",
      tagline: "Discover what's blocking your next stage of growth.",
      bestFor:
        "Companies that know something is limiting growth but can't name it — and don't want to commit to a build before they can.",
      problem:
        "Your business is growing, but the reason it's slowing isn't obvious from the inside. Every proposal you receive assumes an answer nobody has actually verified.",
      includes: [
        {
          title: "Business Diagnosis",
          body: "How the company runs today — where work moves, where it stops, and why.",
          items: [
            "Processes, workflows and operational structure",
            "Marketing performance and the customer acquisition journey",
            "The current technology stack and its limits",
            "Data visibility and reporting gaps",
          ],
        },
        {
          title: "Growth and bottleneck assessment",
          body: "The specific points where growth is being capped, and what each one is costing.",
          items: [
            "Where opportunities are being lost",
            "Which processes are slowing growth",
            "Which manual work is capping scale",
            "The highest-impact areas to address first",
          ],
        },
        {
          title: "Marketing and technology opportunity map",
          body: "Where each capability would pay off in this business — and in what order.",
          items: [
            "SEO and organic growth",
            "Paid acquisition and media buying",
            "Funnel and conversion",
            "CRM and customer management",
            "Business automation",
            "Custom software and platforms",
          ],
        },
        {
          title: "AI opportunity identification",
          body: "Which workflows are genuinely worth applying AI to, and which aren't.",
          items: [
            "Which departments benefit first",
            "Which workflows should be automated",
            "Where AI creates measurable impact",
          ],
        },
      ],
      outcome:
        "A clear roadmap showing where technology, AI, and systems create measurable business impact.",
      note: "Foundation produces a decision, not a deliverable. If you build with us afterwards, the work carries forward.",
      credit:
        "Move forward with implementation within 90 days and your Foundation fee is credited toward the project.",
      priceFloor: "$1,000",
      priceNote: "Final scope is determined after the business diagnosis.",
    },
    {
      id: "growth-engine",
      name: "Growth Engine",
      statement: "You have demand. Growth is unpredictable.",
      outcomeShort: "Build a measurable acquisition system your team runs with AI.",
      tagline: "Turn growth into a system you can measure.",
      bestFor:
        "Companies with real demand, held back by inconsistent acquisition, scattered marketing, and manual follow-through.",
      problem:
        "Revenue is growing, but growth depends on disconnected campaigns, manual processes, and people pushing everything forward.",
      includes: [
        {
          title: "Marketing Systems",
          body: "The acquisition engine — planned, built and measured as one system rather than separate campaigns.",
          items: [
            "Marketing strategy and plan",
            "SEO and organic growth",
            "Media buying and paid campaigns",
            "Funnel strategy and conversion optimization",
            "Performance tracking and attribution",
          ],
        },
        {
          title: "Conversion assets",
          body: "What the funnel points at — the pages the acquisition system needs in order to convert.",
          items: ["CMS website", "Landing pages", "Campaign pages"],
        },
        {
          title: "Revenue operations",
          body: "CRM set up for lead management across the commercial team, with the follow-through automated.",
          items: [
            "CRM for lead capture and pipeline",
            "Lead routing and follow-up automation",
            "The handoff from marketing to sales",
            "Data connected across the tools already in use",
          ],
        },
        {
          title: "AI Enablement",
          body: "AI inside the daily work of the commercial teams — not a training deck.",
          items: [
            "Department-specific use cases",
            "Employee AI training",
            "AI-assisted workflows inside existing processes",
          ],
        },
      ],
      outcome:
        "More qualified opportunities, clearer visibility, and a team operating with AI inside real workflows.",
      priceFloor: "$7,000",
      priceNote: "Not a monthly retainer. A system your business owns.",
    },
    {
      id: "scale-infrastructure",
      name: "Scale Infrastructure",
      statement: "Your business has outgrown the systems running it.",
      outcomeShort: "Build the operating infrastructure for scale.",
      tagline: "Build the systems required for operational scale.",
      bestFor:
        "Companies where growth has outgrown the operation — complexity is rising and the current systems can't carry it.",
      problem:
        "Growth creates complexity. Disconnected tools, manual operations, and limited visibility start slowing the business down — and adding people stops helping.",
      alwaysLabel: "Always included",
      always:
        "The visibility layer: measurement, reporting, and business data connection — so the decisions after the build are made on evidence, not instinct.",
      expandsLabel: "Then expands, based on the business diagnosis, into:",
      includes: [
        {
          title: "Core business systems",
          body: "The systems of record the business runs on, integrated rather than stacked side by side.",
          items: [
            "CRM as the system of record across departments",
            "ERP platforms",
            "Business development performance management",
            "Integration between the core systems",
          ],
        },
        {
          title: "Custom applications",
          body: "Software built for how this business works, where nothing off the shelf fits.",
          items: [
            "Internal business applications",
            "Custom software solutions",
            "B2B mobile applications",
            "Customer portals and internal tools",
          ],
        },
        {
          title: "Advanced automation and AI",
          body: "Automation across departments, and AI embedded in the systems rather than bolted beside them.",
          items: [
            "Cross-department workflow automation",
            "AI embedded in the business systems",
            "Intelligent reporting and decision support",
            "Org-wide AI adoption and employee training",
          ],
        },
        {
          title: "Operational enablement",
          body: "The change work that makes new systems stick after handover.",
          items: [
            "Process redesign",
            "Adoption support",
            "Continuous optimization after handover",
          ],
        },
      ],
      outcome:
        "A scalable business infrastructure built around how your company actually operates.",
      priceFloor: "$30,000",
      priceNote: "Not a monthly retainer. A system your business owns.",
    },
  ],
  custom: {
    eyebrow: "The escape hatch",
    heading: "Not every business fits a pattern.",
    body: "Strong sales with broken operations. AI adoption across every department at once. A combination no standard scope covers. When the business diagnosis points somewhere none of the three fit, the answer isn't a package — it's a system designed around your reality.",
    name: "Custom Transformation",
    price: "Priced after the business diagnosis.",
  },
  solutionNames: {
    foundation: "Foundation",
    "growth-engine": "Growth Engine",
    "scale-infrastructure": "Scale Infrastructure",
    custom: "Custom Transformation",
  },
};

const HOW_WE_WORK = {
  heading: "How we work",
  strategyLabel: "Strategy",
  strategyBody:
    "We diagnose the business, identify the constraints, and define the roadmap. Strategy isn't something we sell — it's how everything else gets decided.",
  divider: "Three capabilities deliver the transformation",
  capabilities: [
    {
      glyph: "marketing",
      href: "/services/digital-marketing",
      title: "Marketing Systems",
      body: "Build measurable acquisition systems — search, paid, conversion, and tracking wired together instead of run separately.",
    },
    {
      glyph: "tech",
      href: "/services/software",
      title: "Business Technology",
      body: "Build and connect the systems the business runs on — ERP, CRM, web and mobile platforms, and the automation between them.",
    },
    {
      glyph: "ai",
      href: "/services/ai-training",
      title: "AI Enablement",
      body: "Embed AI into real workflows so teams actually use it, inside the work they already do.",
    },
  ],
};

// Flat dict for BusinessDiagnostic's t(key) lookups (solutions.diag.* plus the
// three solutions.work.*.title build targets its CONSTRAINTS reference).
const DIAG_DICT: Record<string, string> = {
  "solutions.diag.title": DIAG_COPY.title,
  "solutions.diag.systemTitle": DIAG_COPY.systemTitle,
  "solutions.diag.summary": DIAG_COPY.summary,
  "solutions.diag.hint": DIAG_COPY.hint,
  "solutions.diag.trace": DIAG_COPY.trace,
  "solutions.diag.buildLabel": DIAG_COPY.buildLabel,
  "solutions.diag.showSystem": DIAG_COPY.showSystem,
  "solutions.diag.showSignals": DIAG_COPY.showSignals,
  "solutions.diag.rootLabel": DIAG_COPY.rootLabel,
  "solutions.diag.strategyLabel": DIAG_COPY.strategyLabel,
  "solutions.diag.strategyBody": DIAG_COPY.strategyBody,
  "solutions.diag.thesis": DIAG_COPY.thesis,
  ...Object.fromEntries(
    DIAG_COPY.signals.flatMap((s, i) => [
      [`solutions.diag.s${i + 1}.label`, s.label],
      [`solutions.diag.s${i + 1}.text`, s.text],
    ]),
  ),
  ...Object.fromEntries(
    DIAG_COPY.constraints.flatMap((c, i) => [
      [`solutions.diag.c${i + 1}.name`, c.name],
      [`solutions.diag.c${i + 1}.impact`, c.impact],
    ]),
  ),
  "solutions.work.marketing.title": HOW_WE_WORK.capabilities[0].title,
  "solutions.work.tech.title": HOW_WE_WORK.capabilities[1].title,
  "solutions.work.ai.title": HOW_WE_WORK.capabilities[2].title,
};

const FAQ_ITEMS = [
  {
    q: "How do we know which solution we need?",
    a: "Most companies don't, and that's fine. The business diagnosis exists to answer that question before anyone commits to a build.",
  },
  {
    q: "Do we have to start with Foundation?",
    a: "No. Foundation is for companies that can't yet name the constraint. If it's already clear, we start where the problem is. Every solution includes a business diagnosis phase either way.",
  },
  {
    q: 'Why is pricing "starting from"?',
    a: "Because scope depends on what the business diagnosis finds. The figure shown is the floor. The final number comes with the proposal.",
  },
  {
    q: "Is this a monthly retainer?",
    a: "No. These are systems you own — source code, platforms, and data. Ongoing support is a separate agreement if you want one.",
  },
  {
    q: "Do we own what you build?",
    a: "Yes. Full source code and IP transfer on completion. No lock-in, no fee to access your own system.",
  },
  {
    q: "What happens to the Foundation fee if we implement?",
    a: "It's credited toward the project, provided implementation starts within 90 days and is based on that diagnosis. It isn't a refund — you bought a roadmap, and you keep it whether you build with us or not.",
  },
  {
    q: "Is AI training sold separately?",
    a: "No. AI enablement is built into every solution, because training that isn't attached to a real workflow doesn't survive the month after it ends.",
  },
];

const FINAL_CTA = {
  heading: "Not sure what's blocking you?",
  body: "Book a strategy call. We'll tell you honestly where the constraint is — and if we're not the right partner, we'll say that too.",
};

export default function SolutionsPage() {
  return (
    <main className="min-h-screen bg-slate-950 pt-20 text-slate-300">
      {/* 1. Hero */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="pointer-events-none absolute -top-40 end-[-120px] h-[520px] w-[520px] rounded-full bg-primary/[0.13] blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 md:px-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              Solutions
              <span aria-hidden="true" className="h-px flex-1 bg-slate-800" />
            </span>
            <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl">
              Build the systems behind{" "}
              <span className="text-primary">your next stage of growth.</span>
            </h1>
            <p className="mt-5 max-w-[46ch] leading-relaxed text-slate-300">
              Your business already works. What it needs now is the
              infrastructure to scale. We find what&apos;s blocking growth,
              then build the marketing, technology, and AI systems that
              remove it.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href={getLanguagePath("/contact", LANGUAGE)} className="w-full sm:w-auto">
                <span className="block w-full rounded-lg border border-primary bg-primary px-6 py-3 text-center text-sm font-semibold text-slate-950 transition-colors hover:bg-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
                  Book a strategy call
                </span>
              </Link>
              <a
                href="#router"
                className="w-full rounded-lg border border-slate-700 px-6 py-3 text-center text-sm font-medium text-white transition-colors hover:border-slate-600 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto"
              >
                Find your constraint
              </a>
            </div>
          </div>

          <BusinessDiagnostic copy={DIAG_DICT} />
        </div>
      </section>

      <SolutionsInteractive language={LANGUAGE} copy={SOLUTIONS_COPY} />

      {/* 5. How we work */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">
            {HOW_WE_WORK.heading}
          </h2>

          <div className="relative mt-7 overflow-hidden rounded-e-xl border border-slate-800 bg-slate-900/40 p-6">
            <span aria-hidden="true" className="absolute inset-y-0 start-0 w-[2px] bg-primary" />
            <h3 className="font-display text-lg font-semibold text-white">
              {HOW_WE_WORK.strategyLabel}
            </h3>
            <p className="mt-2 max-w-[80ch] leading-relaxed text-slate-400">
              {HOW_WE_WORK.strategyBody}
            </p>
          </div>

          <p className="my-6 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
            {HOW_WE_WORK.divider}
          </p>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {HOW_WE_WORK.capabilities.map((c) => (
              <Link key={c.glyph} href={getLanguagePath(c.href, LANGUAGE)}>
                <div className="card-lift group h-full cursor-pointer rounded-xl border border-slate-800 bg-slate-900/40 p-6 hover:border-slate-700">
                  <HexGlyph size={26} glyph={c.glyph} />
                  <h3 className="mt-3.5 font-display text-base font-semibold text-white transition-colors group-hover:text-primary">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{c.body}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="border-y border-slate-800 bg-slate-900/30 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">
            Common questions
          </h2>
          <div className="mt-6 border-t border-slate-800/40">
            {FAQ_ITEMS.map((item, n) => (
              <Disclosure
                key={item.q}
                id={`faq-${n + 1}`}
                label={ltrNames(item.q)}
                labelClassName="font-display text-base font-medium text-white"
              >
                <p className="max-w-[80ch] pb-4 text-sm leading-relaxed text-slate-400">
                  {ltrNames(item.a)}
                </p>
              </Disclosure>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Final CTA */}
      <section className="relative overflow-hidden py-20 text-center md:py-24">
        <div className="pointer-events-none absolute -bottom-52 left-1/2 h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-primary/[0.13] blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-6 md:px-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
            {FINAL_CTA.heading}
          </h2>
          <p className="mx-auto mt-4 max-w-[56ch] leading-relaxed text-slate-400">
            {FINAL_CTA.body}
          </p>
          <Link href={getLanguagePath("/contact", LANGUAGE)}>
            <span className="mt-7 inline-block rounded-lg border border-primary bg-primary px-7 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
              Book a strategy call
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
