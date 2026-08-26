import { cache } from "react";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import type { Language } from "@/lib/language";

export type ArticleListItem = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  publishedAt: Date | null;
};

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  body: string;
  published: boolean;
  publishedAt: Date | null;
  relatedProjectId: number | null;
  relatedSolution: string | null;
};

export const getPublishedArticles = cache(
  async (language: Language): Promise<ArticleListItem[]> => {
    return db
      .select({
        slug: articles.slug,
        title: articles.title,
        excerpt: articles.excerpt,
        coverImage: articles.coverImage,
        publishedAt: articles.publishedAt,
      })
      .from(articles)
      .where(and(eq(articles.language, language), eq(articles.published, true)))
      .orderBy(desc(articles.publishedAt));
  },
);

export const getPublishedArticleSlugs = cache(
  async (language: Language): Promise<string[]> => {
    const rows = await db
      .select({ slug: articles.slug })
      .from(articles)
      .where(and(eq(articles.language, language), eq(articles.published, true)));
    return rows.map((row) => row.slug);
  },
);

export const getArticleBySlug = cache(
  async (slug: string, language: Language): Promise<Article | null> => {
    const rows = await db
      .select({
        slug: articles.slug,
        title: articles.title,
        excerpt: articles.excerpt,
        coverImage: articles.coverImage,
        body: articles.body,
        published: articles.published,
        publishedAt: articles.publishedAt,
        relatedProjectId: articles.relatedProjectId,
        relatedSolution: articles.relatedSolution,
      })
      .from(articles)
      .where(and(eq(articles.slug, slug), eq(articles.language, language)))
      .limit(1);

    return rows[0] ?? null;
  },
);
