import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getLanguagePath, type Language } from "@/lib/language";
import { SERVICE_SHARED_STRINGS } from "@/lib/services/shared-strings";
import type { ServiceRelatedProject } from "@/lib/services/related-projects";

// Renders nothing when there are no verified matching projects — no
// placeholder, no fabricated proof (see lib/services/related-projects.ts).
export function ServiceProof({
  projects,
  language,
}: {
  projects: ServiceRelatedProject[];
  language: Language;
}) {
  if (projects.length === 0) return null;

  const strings = SERVICE_SHARED_STRINGS[language];

  return (
    <section className="bg-slate-950 py-16 text-slate-300 md:py-24">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-14">
          <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">
            {strings.proofHeading}
          </h2>
          <Link
            href={getLanguagePath("/portfolio", language)}
            className="text-sm font-medium text-primary hover:text-brand-400"
          >
            {strings.proofCta}
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.slug}
              href={getLanguagePath(`/portfolio/${project.slug}`, language)}
              className="card-lift group flex flex-col gap-4"
            >
              <div className="shadow-card relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-800 bg-slate-900 transition-colors group-hover:border-slate-700">
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                <div className="absolute end-4 top-4 z-20 -translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-sm">
                    <ArrowUpRight className="h-5 w-5 text-primary-foreground" />
                  </div>
                </div>
                <img
                  src={project.coverImage}
                  alt={project.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="px-1 text-lg font-bold text-white transition-colors group-hover:text-primary">
                {project.title}
                {project.categoryLabel ? (
                  <span className="ms-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                    {project.categoryLabel}
                  </span>
                ) : null}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

