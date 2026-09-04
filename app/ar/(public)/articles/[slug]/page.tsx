import Link from "next/link";
import { notFound } from "next/navigation";
import { buildPageMetadata, buildAbsoluteUrl } from "@/lib/metadata";
import { getLanguagePath } from "@/lib/language";
import {
  getArticleBySlug,
  getPublishedArticleSlugs,
  getPublishedCounterpartSlug,
  getRelatedArticles,
} from "@/lib/db/articles";
import { getRelatedProjectCard } from "@/lib/db/portfolio";
import { formatArticleDate, isUpdateMeaningful } from "@/lib/article-date";
import { getArticleReadingMinutes, formatReadingTime } from "@/lib/article-reading-time";
import { extractArticleHeadings } from "@/lib/article-headings";
import { normalizeSlugParam } from "@/lib/slug-param";
import { buildArticleJsonLd } from "@/lib/structured-data";
import { FallbackImage } from "@/components/fallback-image";
import { ArticleMarkdown } from "@/components/article-markdown";
import { ArticleLanguageAlternate } from "@/components/article-language-alternate";
import { ArticleHero } from "@/components/article/article-hero";
import { ArticleToc } from "@/components/article/article-toc";
import { ArticleShare } from "@/components/article/article-share";
import { ArticleNextStep } from "@/components/article/article-next-step";
import { RelatedArticles } from "@/components/article/related-articles";

const LANGUAGE = "ar" as const;

export const revalidate = 3600;

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
        title: "المقالات",
        description: "مقالات OmniflowAI.",
      }),
      robots: { index: false, follow: false },
    };
  }

  const counterpartSlug = await getPublishedCounterpartSlug(article.translationGroupId, "en");

  return buildPageMetadata({
    path: `/articles/${slug}`,
    language: LANGUAGE,
    title: article.title,
    description: article.excerpt,
    languageAlternates: {
      en: counterpartSlug ? `/articles/${counterpartSlug}` : null,
      ar: `/articles/${slug}`,
    },
    imageUrl: article.coverImage,
    ogType: "article",
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
  if (!article || !article.published) notFound();

  const [relatedProject, counterpartSlug, relatedArticles] = await Promise.all([
    article.relatedProjectId
      ? getRelatedProjectCard(article.relatedProjectId, LANGUAGE)
      : Promise.resolve(null),
    getPublishedCounterpartSlug(article.translationGroupId, "en"),
    getRelatedArticles(LANGUAGE, article.slug, article.relatedSolution),
  ]);

  const articleJsonLd = buildArticleJsonLd(article, LANGUAGE);
  const headings = extractArticleHeadings(article.body);
  const readingMinutes = getArticleReadingMinutes(article.body, LANGUAGE);
  const showUpdated = isUpdateMeaningful(article.publishedAt, article.updatedAt);
  const canonicalUrl = buildAbsoluteUrl(getLanguagePath(`/articles/${article.slug}`, LANGUAGE));

  return (
    <div className="min-h-screen bg-slate-950 pt-20 text-slate-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <ArticleLanguageAlternate
        href={counterpartSlug ? getLanguagePath(`/articles/${counterpartSlug}`, "en") : null}
      />
      <article>
        <ArticleHero
          backHref={getLanguagePath("/articles", LANGUAGE)}
          backLabel="كل المقالات"
          readingTimeLabel={formatReadingTime(readingMinutes, LANGUAGE)}
          title={article.title}
          excerpt={article.excerpt}
          publishedLabel={
            article.publishedAt ? `نُشر في ${formatArticleDate(article.publishedAt, LANGUAGE)}` : null
          }
          updatedLabel={
            showUpdated ? `آخر تحديث ${formatArticleDate(article.updatedAt, LANGUAGE)}` : null
          }
        />

        <div className="mx-auto max-w-5xl px-6 md:px-8">
          <FallbackImage
            src={article.coverImage}
            alt={article.title}
            decoding="async"
            className="aspect-[16/9] w-full rounded-xl border border-slate-800 object-cover"
          />
        </div>

        <div className="mx-auto max-w-5xl px-6 py-12 md:px-8 md:py-16">
          <div
            className={
              headings.length >= 2
                ? "lg:grid lg:grid-cols-[200px_minmax(0,760px)] lg:justify-center lg:gap-12"
                : ""
            }
          >
            {headings.length >= 2 && (
              <ArticleToc headings={headings} label="في هذا المقال" mobileLabel="في هذا المقال" />
            )}
            <div className="mx-auto max-w-3xl lg:mx-0">
              <ArticleMarkdown body={article.body} language={LANGUAGE} />

              <div className="mt-10 flex items-center justify-between border-t border-slate-800 pt-6">
                <p className="text-xs text-slate-500">مشاركة</p>
                <ArticleShare url={canonicalUrl} language={LANGUAGE} />
              </div>
            </div>
          </div>
        </div>

        <ArticleNextStep
          relatedProject={relatedProject}
          relatedSolution={article.relatedSolution}
          language={LANGUAGE}
        />

        <RelatedArticles articles={relatedArticles} language={LANGUAGE} />

        {/* === دعوة لاتخاذ إجراء === */}
        <section className="relative overflow-hidden py-16 text-center md:py-20">
          <div className="pointer-events-none absolute -bottom-52 left-1/2 h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-primary/[0.10] blur-3xl" />
          <div className="relative mx-auto max-w-2xl px-6 md:px-8">
            <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              الأداة نادرًا ما تكون الجزء الأصعب
            </h2>
            <p className="mx-auto mt-4 max-w-[52ch] leading-relaxed text-slate-400">
              الجزء الأصعب هو تحديد أين يتموضع الذكاء الاصطناعي داخل طريقة عمل شركتك الفعلية.
              احجز مكالمة استراتيجية — سنخبرك بصراحة إن كان هذا ينطبق على أعمالك.
            </p>
            <Link href={getLanguagePath("/contact", LANGUAGE)}>
              <span className="mt-7 inline-block cursor-pointer rounded-lg border border-primary bg-primary px-7 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-brand-400">
                احجز مكالمة استراتيجية
              </span>
            </Link>
          </div>
        </section>
      </article>
    </div>
  );
}
