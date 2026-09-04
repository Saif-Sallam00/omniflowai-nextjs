import Link from "next/link";
import { getLanguagePath } from "@/lib/language";
import type { Language } from "@/lib/language";
import { formatArticleDate } from "@/lib/article-date";
import type { RelatedArticleCard } from "@/lib/db/articles";

const HEADING: Record<Language, string> = {
  en: "Continue reading",
  ar: "تابع القراءة",
};

export function RelatedArticles({
  articles,
  language,
}: {
  articles: RelatedArticleCard[];
  language: Language;
}) {
  if (articles.length === 0) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-6 md:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary rtl:font-sans rtl:normal-case rtl:tracking-normal">
          {HEADING[language]}
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {articles.map((article) => (
            <Link key={article.slug} href={getLanguagePath(`/articles/${article.slug}`, language)}>
              <article className="card-lift group h-full cursor-pointer rounded-xl border border-slate-800 bg-slate-950/60 p-5 hover:border-slate-700">
                {article.publishedAt && (
                  <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500 ltr:font-mono rtl:normal-case rtl:tracking-normal">
                    {formatArticleDate(article.publishedAt, language)}
                  </p>
                )}
                <p className="mt-2 font-display text-base font-semibold text-white transition-colors group-hover:text-primary">
                  {article.title}
                </p>
                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-400">
                  {article.excerpt}
                </p>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
