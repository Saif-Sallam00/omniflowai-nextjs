import Link from "next/link";
import { Award, Shield, Target, Users } from "lucide-react";
import { buildPageMetadata } from "@/lib/metadata";
import { getLanguagePath } from "@/lib/language";

const LANGUAGE = "en" as const;

export function generateMetadata() {
  return buildPageMetadata({
    path: "/about",
    language: "en",
    title: "Engineers who understand business.",
    description:
      "OmniflowAI is a digital transformation partner built around one belief: most companies don't need more tools — they need the right systems, built well and connected properly.",
  });
}

const VALUES = [
  {
    icon: Shield,
    title: "Systems over services",
    desc: "We don't sell isolated deliverables. Everything we build is designed to connect and compound.",
  },
  {
    icon: Target,
    title: "You own it",
    desc: "Full source code and IP transfer on every build. What you pay for is yours.",
  },
  {
    icon: Users,
    title: "Engineering-led",
    desc: "You work directly with the people building your systems, not an account manager relaying messages.",
  },
  {
    icon: Award,
    title: "Measured by outcomes",
    desc: "We tie our work to business results — revenue, efficiency, acquisition — not hours logged or assets shipped.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-950 pt-20 text-white">
      {/* 1. Hero */}
      <section className="relative overflow-hidden py-20 md:py-24">
        <div className="pointer-events-none absolute right-0 top-0 h-[60%] w-[50%] bg-gradient-to-bl from-orange-950/30 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center md:px-8">
          <div className="mx-auto max-w-4xl">
            <span className="mb-6 inline-block rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-brand-400">
              Who we are
            </span>
            <h1 className="mb-8 font-display text-4xl font-bold leading-tight text-white md:text-6xl">
              Engineers who understand <span className="text-brand-400">business.</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl leading-relaxed text-slate-400">
              OmniflowAI is a digital transformation partner built around one
              belief: most companies don&apos;t need more tools — they need
              the right systems, built well and connected properly.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Story */}
      <section className="border-y border-slate-800/30 bg-slate-900/30 py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div className="group relative">
              <div className="absolute inset-0 translate-x-2 translate-y-2 rotate-2 transform rounded-xl bg-brand-500 opacity-20 transition-opacity group-hover:opacity-30" />
              {/* No team photo asset exists yet — structural placeholder for @/assets/team_images. */}
              <div className="relative flex aspect-video w-full items-center justify-center rounded-xl border border-slate-800 bg-slate-900 object-cover shadow-elevated">
                <Users className="h-12 w-12 text-slate-700" />
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
                We started OmniflowAI to close a gap.
              </h2>
              <div className="prose prose-lg space-y-6 text-slate-400">
                <p>
                  Too many businesses are sold disconnected pieces — a
                  website here, an ad campaign there, a tool nobody
                  integrates — and left to stitch them together themselves.
                  The result is expensive fragmentation: software that
                  doesn&apos;t talk, marketing that doesn&apos;t convert, and
                  no clear view of what&apos;s working.
                </p>
                <p>
                  We do the opposite. We start from how your business
                  actually operates, then design and build the systems that
                  fit it — software, marketing, and automation that work as
                  one. You own everything we build. No lock-in, no
                  dependency, no black boxes.
                </p>
                <p>
                  We work like engineers, not order-takers: we care about
                  outcomes you can measure, systems that outlast the
                  engagement, and giving you the keys at the end.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Values */}
      <section className="border-y border-slate-800/30 bg-slate-900/30 py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-card transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/60"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">{value.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CTA */}
      <section className="relative overflow-hidden py-24 text-center md:py-32">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-orange-950/20 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto max-w-3xl px-6 md:px-8">
          <h2 className="mb-6 font-display text-3xl font-bold text-white">
            Let&apos;s map your systems
          </h2>
          <p className="mb-8 text-lg text-slate-400">
            We don&apos;t hand over deliverables and walk away. We build
            systems that keep working after we&apos;re gone.
          </p>
          <Link href={getLanguagePath("/contact", LANGUAGE)}>
            <span className="inline-flex rounded-full bg-primary px-8 py-6 text-lg font-bold text-primary-foreground shadow-sm">
              Book a strategy call
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
