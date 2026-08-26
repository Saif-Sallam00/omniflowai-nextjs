import Link from "next/link";
import { buildPageMetadata } from "@/lib/metadata";
import { getLanguagePath } from "@/lib/language";
import { getPublishedArticles } from "@/lib/db/articles";
import { formatArticleDate } from "@/lib/article-date";
import { FallbackImage } from "@/components/fallback-image";

const LANGUAGE = "en" as const;

export const revalidate = 3600;

export function generateMetadata() {
  return buildPageMetadata({
    path: "/articles",
    language: "en",
    title: "Articles",
    description:
      "Practical notes on AI, marketing, and the systems that connect them.",
  });
}

export default async function ArticlesPage() {
  const articleList = await getPublishedArticles(LANGUAGE);

  return (
    <div className="min-h-screen bg-slate-950 pt-20 text-slate-300">
      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="pointer-events-none absolute -top-40 end-[-120px] h-[420px] w-[420px] rounded-full bg-primary/[0.10] blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6 md:px-8">
          <span className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            Articles
            <span aria-hidden="true" className="h-px flex-1 bg-slate-800" />
          </span>
          <h1 className="max-w-[20ch] font-display text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl">
            Practical notes on AI, marketing, and the systems that connect them.
          </h1>
          <p className="mt-5 max-w-[62ch] leading-relaxed text-slate-400">
            Field notes from the systems we build — what we&apos;re learning, testing, and
            shipping for clients.
          </p>
        </div>
      </section>

      <section className="border-t border-slate-800/40 py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          {articleList.length === 0 ? (
            <p className="max-w-[52ch] leading-relaxed text-slate-400">
              No articles published yet. The first ones are on the way.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {articleList.map((article) => (
                <Link key={article.slug} href={getLanguagePath(`/articles/${article.slug}`, LANGUAGE)}>
                  <article className="group cursor-pointer">
                    <div className="card-lift relative mb-4 aspect-[16/9] overflow-hidden rounded-xl border border-slate-800 bg-slate-900 hover:border-slate-700">
                      <FallbackImage
                        src={article.coverImage}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full transform object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    {article.publishedAt && (
                      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">
                        {formatArticleDate(article.publishedAt, LANGUAGE)}
                      </p>
                    )}
                    <h2 className="mt-2 font-display text-lg font-semibold leading-snug tracking-tight text-white transition-colors group-hover:text-primary">
                      {article.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      {article.excerpt}
                    </p>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
