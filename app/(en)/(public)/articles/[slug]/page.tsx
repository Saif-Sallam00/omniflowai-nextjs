import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/metadata";
import { getLanguagePath } from "@/lib/language";
import {
  getArticleBySlug,
  getPublishedArticleSlugs,
  getPublishedCounterpartSlug,
} from "@/lib/db/articles";
import { getRelatedProjectCard } from "@/lib/db/portfolio";
import { formatCategoryLabel } from "@/lib/category-label";
import { formatArticleDate } from "@/lib/article-date";
import { normalizeSlugParam } from "@/lib/slug-param";
import { FallbackImage } from "@/components/fallback-image";
import { ArticleMarkdown } from "@/components/article-markdown";
import { ArticleLanguageAlternate } from "@/components/article-language-alternate";
import { auth } from "@/lib/auth";

const LANGUAGE = "en" as const;

export const revalidate = 3600;

const SOLUTION_NAMES: Record<string, string> = {
  foundation: "Foundation",
  "growth-engine": "Growth Engine",
  "scale-infrastructure": "Scale Infrastructure",
  custom: "Custom Transformation",
};

export async function generateStaticParams() {
  const slugs = await getPublishedArticleSlugs(LANGUAGE);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = normalizeSlugParam(rawSlug);
  const article = await getArticleBySlug(slug, LANGUAGE);

  if (!article || !article.published) {
    return {
      ...buildPageMetadata({
        path: `/articles/${slug}`,
        language: LANGUAGE,
        title: "Articles",
        description: "OmniflowAI articles.",
      }),
      robots: { index: false, follow: false },
    };
  }

  const counterpartSlug = await getPublishedCounterpartSlug(article.translationGroupId, "ar");

  return buildPageMetadata({
    path: `/articles/${slug}`,
    language: LANGUAGE,
    title: article.title,
    description: article.excerpt,
    languageAlternates: {
      en: `/articles/${slug}`,
      ar: counterpartSlug ? `/articles/${counterpartSlug}` : null,
    },
    imageUrl: article.coverImage,
  });
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = normalizeSlugParam(rawSlug);
  const article = await getArticleBySlug(slug, LANGUAGE);
  if (!article) notFound();

  if (!article.published) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) notFound();
  }

  const relatedProject = article.relatedProjectId
    ? await getRelatedProjectCard(article.relatedProjectId, LANGUAGE)
    : null;

  const counterpartSlug = article.published
    ? await getPublishedCounterpartSlug(article.translationGroupId, "ar")
    : null;

  return (
    <div className="min-h-screen bg-slate-950 pt-20 text-slate-300">
      <ArticleLanguageAlternate
        href={counterpartSlug ? getLanguagePath(`/articles/${counterpartSlug}`, "ar") : null}
      />
      <article>
        {/* === HEADER === */}
        <header className="relative overflow-hidden py-12 md:py-16">
          <div className="pointer-events-none absolute -top-40 end-[-120px] h-[420px] w-[420px] rounded-full bg-primary/[0.10] blur-3xl" />
          <div className="relative mx-auto max-w-3xl px-6 md:px-8">
            <Link href={getLanguagePath("/articles", LANGUAGE)}>
              <span className="mb-8 inline-block cursor-pointer font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400 transition-colors hover:text-white">
                All articles
              </span>
            </Link>

            {!article.published && (
              <p className="mb-4 inline-block rounded-full border border-primary px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
                Draft
              </p>
            )}

            <h1 className="font-display text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl">
              {article.title}
            </h1>
            {article.publishedAt && (
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-slate-400">
                {formatArticleDate(article.publishedAt, LANGUAGE)}
              </p>
            )}
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-6 md:px-8">
          <FallbackImage
            src={article.coverImage}
            alt=""
            decoding="async"
            className="aspect-[16/9] w-full rounded-xl border border-slate-800 object-cover"
          />
        </div>

        {/* === BODY === */}
        <div className="mx-auto max-w-3xl px-6 py-12 md:px-8 md:py-16">
          <ArticleMarkdown body={article.body} />
        </div>

        {/* === NEXT STEP === */}
        {(relatedProject || article.relatedSolution) && (
          <section className="border-y border-slate-800 bg-slate-900/30 py-12 md:py-16">
            <div className="mx-auto max-w-3xl px-6 md:px-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                Next step
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {relatedProject && (
                  <Link href={getLanguagePath(`/portfolio/${relatedProject.slug}`, LANGUAGE)}>
                    <div className="card-lift group h-full cursor-pointer rounded-xl border border-slate-800 bg-slate-950/60 p-5 hover:border-slate-700">
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
                        Related project
                      </p>
                      <p className="mt-2 font-display text-base font-semibold text-white transition-colors group-hover:text-primary">
                        {relatedProject.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {relatedProject.categoryLabel || formatCategoryLabel(relatedProject.category)}
                      </p>
                    </div>
                  </Link>
                )}

                {article.relatedSolution && (
                  <Link href={`${getLanguagePath("/solutions", LANGUAGE)}#${article.relatedSolution}`}>
                    <div className="card-lift group h-full cursor-pointer rounded-xl border border-slate-800 bg-slate-950/60 p-5 hover:border-slate-700">
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
                        Related solution
                      </p>
                      <p
                        dir="ltr"
                        className="mt-2 font-display text-base font-semibold text-white transition-colors group-hover:text-primary rtl:text-end"
                      >
                        {SOLUTION_NAMES[article.relatedSolution] || article.relatedSolution}
                      </p>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

        {/* === CTA === */}
        <section className="relative overflow-hidden py-16 text-center md:py-20">
          <div className="pointer-events-none absolute -bottom-52 left-1/2 h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-primary/[0.10] blur-3xl" />
          <div className="relative mx-auto max-w-2xl px-6 md:px-8">
            <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Want to talk about this?
            </h2>
            <p className="mx-auto mt-4 max-w-[52ch] leading-relaxed text-slate-400">
              Book a strategy call — we&apos;ll tell you honestly whether this applies to your
              business.
            </p>
            <Link href={getLanguagePath("/contact", LANGUAGE)}>
              <span className="mt-7 inline-block cursor-pointer rounded-lg border border-primary bg-primary px-7 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-brand-400">
                Book a strategy call
              </span>
            </Link>
          </div>
        </section>
      </article>
    </div>
  );
}
