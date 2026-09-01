import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";
import { buildPageMetadata } from "@/lib/metadata";
import { getLanguagePath } from "@/lib/language";
import { getPortfolioDetailBySlug, getPortfolioSlugs } from "@/lib/db/portfolio";
import { normalizeSlugParam } from "@/lib/slug-param";
import { SystemCardIcon } from "@/components/system-card-icon";
import { ltrNames } from "@/lib/ltr-names";

const LANGUAGE = "en" as const;

export const revalidate = 3600;

const CTA_DEFAULT = {
  headline: "Your reporting might be lying to you too.",
  subtext:
    "We diagnose before we build. Start with a Foundation diagnosis and see what your numbers are hiding.",
};

export async function generateStaticParams() {
  const slugs = await getPortfolioSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = normalizeSlugParam(rawSlug);
  const project = await getPortfolioDetailBySlug(slug, LANGUAGE);

  if (!project) {
    return {
      ...buildPageMetadata({
        path: `/portfolio/${slug}`,
        language: LANGUAGE,
        title: "Portfolio",
        description: "OmniflowAI case study.",
      }),
      robots: { index: false, follow: false },
    };
  }

  return buildPageMetadata({
    path: `/portfolio/${slug}`,
    language: LANGUAGE,
    title: project.title,
    description: project.description,
    imageUrl: project.coverImage,
  });
}

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = normalizeSlugParam(rawSlug);
  const project = await getPortfolioDetailBySlug(slug, LANGUAGE);
  if (!project) notFound();

  const clientFields = [
    project.clientName,
    project.clientSector,
    project.clientCountry,
    project.clientModel,
  ].filter(Boolean);

  const ctaHeadline = project.ctaHeadline?.trim() || CTA_DEFAULT.headline;
  const ctaSubtext = project.ctaSubtext?.trim() || CTA_DEFAULT.subtext;

  return (
    <main className="min-h-screen bg-slate-950 pt-20 text-slate-300">
      {/* Back-link + Hero */}
      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <Link href={getLanguagePath("/portfolio", LANGUAGE)}>
            <span className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-brand-400">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to portfolio
            </span>
          </Link>

          <div className="mt-8 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
            <div className="flex flex-col justify-center gap-4">
              <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
                {project.categoryLabel || project.category}
              </span>
              <h1 className="font-display text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-4xl md:text-5xl">
                {project.title}
              </h1>
              <p className="max-w-[60ch] leading-relaxed text-slate-400">{project.description}</p>
            </div>

            <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/40 p-6">
              <div className="flex min-h-[130px] flex-1 items-center justify-center rounded-lg bg-slate-950">
                {project.logo ? (
                  <img
                    src={project.logo}
                    alt={project.title}
                    className="max-h-24 max-w-[70%] object-contain"
                  />
                ) : (
                  <span className="text-xs uppercase tracking-widest text-slate-600">
                    Client logo
                  </span>
                )}
              </div>
              {clientFields.length > 0 && (
                <div dir="ltr" className="mt-4 text-center text-[11px] leading-relaxed text-slate-500">
                  {clientFields.join(" · ")}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 01 · The Problem */}
      <section className="py-14 md:py-16">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <span className="text-xs font-medium uppercase tracking-widest text-primary">
            01 · The Problem
          </span>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {project.problemHeadline}
          </h2>
          <p className="mt-3 max-w-[70ch] leading-relaxed text-slate-400">{project.problemBody}</p>
        </div>
      </section>

      {/* 02 · The Diagnosis */}
      <section className="border-y border-slate-800/30 bg-slate-900/30 py-14 md:py-16">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <span className="text-xs font-medium uppercase tracking-widest text-primary">
            02 · The Diagnosis
          </span>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {project.diagnosisHeadline}
          </h2>
          <p className="mt-3 max-w-[70ch] leading-relaxed text-slate-400">
            {project.diagnosisBody}
          </p>
        </div>
      </section>

      {/* 03 · The System */}
      <section className="py-14 md:py-16">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <span className="text-xs font-medium uppercase tracking-widest text-primary">
            03 · The System
          </span>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {project.systemHeadline}
          </h2>
          {project.systemCards.length > 0 && (
            <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
              {project.systemCards.map((card, i) => (
                <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <SystemCardIcon icon={card.icon} className="h-5 w-5 text-primary" />
                  <div className="mt-2.5 text-sm font-semibold text-white">{card.title}</div>
                  <div className="mt-1 text-xs leading-relaxed text-slate-400">
                    {card.description}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Case study media */}
      <section className="border-y border-slate-800/30 bg-slate-900/30 py-14 md:py-16">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
            Case study media
          </span>
          {project.mediaImage ? (
            <div className="mt-6 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              <img
                src={project.mediaImage}
                alt={project.mediaCaption || project.title}
                className="w-full object-contain"
              />
            </div>
          ) : (
            <div className="mt-6 flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-900/60">
              <ImageIcon className="h-6 w-6 text-slate-600" />
              <span className="text-xs text-slate-500">
                Case study media will appear here once added.
              </span>
            </div>
          )}
          {project.mediaCaption && (
            <p className="mt-3 text-center text-xs text-slate-500">{project.mediaCaption}</p>
          )}
        </div>
      </section>

      {/* Results */}
      {project.results.length > 0 && (
        <section className="py-14 md:py-16">
          <div className="mx-auto max-w-6xl px-6 md:px-8">
            <span className="text-xs font-medium uppercase tracking-widest text-primary">
              The results
            </span>
            <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4">
              {project.results.map((metric, i) => (
                <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                  <div className="font-display text-3xl font-black tracking-tight text-primary sm:text-4xl">
                    {metric.value}
                  </div>
                  <div className="mt-2 text-xs leading-relaxed text-slate-400">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tech stack */}
      {project.technologies.length > 0 && (
        <section className="border-y border-slate-800/30 bg-slate-900/30 py-14 md:py-16">
          <div className="mx-auto max-w-6xl px-6 md:px-8">
            <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
              Tech stack
            </span>
            <div className="mt-5 flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative overflow-hidden py-20 text-center md:py-24">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-primary/[0.13] blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-6 md:px-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
            {ltrNames(ctaHeadline)}
          </h2>
          <p className="mx-auto mt-4 max-w-[56ch] leading-relaxed text-slate-400">
            {ltrNames(ctaSubtext)}
          </p>
          <Link href={getLanguagePath("/contact", LANGUAGE)}>
            <span className="mt-7 inline-block rounded-lg border border-primary bg-primary px-7 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
              Start your project
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
