import Link from "next/link";
import { getLanguagePath } from "@/lib/language";
import type { Language } from "@/lib/language";
import { formatCategoryLabel } from "@/lib/category-label";
import { getSolutionCopy } from "@/lib/article-solutions";
import type { RelatedProjectCard } from "@/lib/db/portfolio";

const LABELS: Record<
  Language,
  { eyebrow: string; project: string; projectCta: string; solution: string; solutionCta: string }
> = {
  en: {
    eyebrow: "Next step",
    project: "See it in practice",
    projectCta: "View the project",
    solution: "Related capability",
    solutionCta: "Explore",
  },
  ar: {
    eyebrow: "الخطوة التالية",
    project: "شاهدها في الواقع",
    projectCta: "عرض المشروع",
    solution: "قدرة ذات صلة",
    solutionCta: "استكشف",
  },
};

export function ArticleNextStep({
  relatedProject,
  relatedSolution,
  language,
}: {
  relatedProject: RelatedProjectCard | null;
  relatedSolution: string | null;
  language: Language;
}) {
  const solutionCopy = relatedSolution ? getSolutionCopy(relatedSolution, language) : null;
  if (!relatedProject && !solutionCopy) return null;

  const labels = LABELS[language];
  const arrow = language === "ar" ? "←" : "→";

  return (
    <section className="border-y border-slate-800 bg-slate-900/30 py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-6 md:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary rtl:font-sans rtl:normal-case rtl:tracking-normal">
          {labels.eyebrow}
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {relatedProject && (
            <Link href={getLanguagePath(`/portfolio/${relatedProject.slug}`, language)}>
              <div className="card-lift group h-full cursor-pointer rounded-xl border border-slate-800 bg-slate-950/60 p-5 hover:border-slate-700">
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400 ltr:font-mono rtl:normal-case rtl:tracking-normal">
                  {labels.project}
                </p>
                <p className="mt-2 font-display text-base font-semibold text-white transition-colors group-hover:text-primary">
                  {relatedProject.title}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {relatedProject.categoryLabel || formatCategoryLabel(relatedProject.category)}
                </p>
                <p className="mt-3 text-sm text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  {labels.projectCta} {arrow}
                </p>
              </div>
            </Link>
          )}

          {solutionCopy && (
            <Link href={`${getLanguagePath("/solutions", language)}#${relatedSolution}`}>
              <div className="card-lift group h-full cursor-pointer rounded-xl border border-slate-800 bg-slate-950/60 p-5 hover:border-slate-700">
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400 ltr:font-mono rtl:normal-case rtl:tracking-normal">
                  {labels.solution}
                </p>
                <p
                  dir="ltr"
                  className="mt-2 font-display text-base font-semibold text-white transition-colors group-hover:text-primary rtl:text-end"
                >
                  {solutionCopy.name}
                </p>
                <p className="mt-1 text-sm text-slate-400">{solutionCopy.tagline}</p>
                <p className="mt-3 text-sm text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  {labels.solutionCta} {arrow}
                </p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
