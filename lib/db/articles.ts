import { cache } from "react";
import { and, desc, eq, sql } from "drizzle-orm";
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
  translationGroupId: string;
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
        translationGroupId: articles.translationGroupId,
      })
      .from(articles)
      .where(and(eq(articles.slug, slug), eq(articles.language, language)))
      .limit(1);

    return rows[0] ?? null;
  },
);

export const getPublishedCounterpartSlug = cache(
  async (translationGroupId: string, targetLanguage: Language): Promise<string | null> => {
    const rows = await db
      .select({ slug: articles.slug })
      .from(articles)
      .where(
        and(
          eq(articles.translationGroupId, translationGroupId),
          eq(articles.language, targetLanguage),
          eq(articles.published, true),
        ),
      )
      .limit(1);

    return rows[0]?.slug ?? null;
  },
);

// --- Admin (write) side. Everything below is used only by the admin CRUD
// (app/(en)/admin/(protected)/articles/**), never by public rendering. ---

export type ArticleRow = typeof articles.$inferSelect;

export async function getArticleById(id: number): Promise<ArticleRow | null> {
  const [row] = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  return row ?? null;
}

export async function getArticleByTranslationGroupAndLanguage(
  translationGroupId: string,
  language: Language,
): Promise<ArticleRow | null> {
  const [row] = await db
    .select()
    .from(articles)
    .where(
      and(eq(articles.translationGroupId, translationGroupId), eq(articles.language, language)),
    )
    .limit(1);
  return row ?? null;
}

// Fixed, known set of related-solution ids (application-level convention, no
// DB enum) — matches the ids already hardcoded in the public article detail
// pages' own SOLUTION_NAMES display map.
export const RELATED_SOLUTIONS = [
  "foundation",
  "growth-engine",
  "scale-infrastructure",
  "custom",
] as const;
export type RelatedSolution = (typeof RELATED_SOLUTIONS)[number];

export type CreateArticleInput = {
  translationGroupId?: string; // present only when creating a counterpart
  language: Language;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImage: string;
  published: boolean;
  publishedAt?: Date; // explicit admin-supplied value only; never null here
  relatedProjectId: number | null;
  relatedSolution: string | null;
};

export type UpdateArticleInput = Partial<Omit<CreateArticleInput, "translationGroupId">>;

// Ported verbatim from the old app's own invariant (server/storage.ts) — an
// explicit publishedAt always wins; otherwise stamp once on the first
// transition to published; otherwise leave publishedAt as it already is.
function stampPublishedAt(
  update: { published?: boolean; publishedAt?: Date },
  current?: ArticleRow,
): Date | null | undefined {
  if (update.publishedAt !== undefined) return update.publishedAt;
  const willBePublished = update.published ?? current?.published ?? false;
  if (!willBePublished) return current ? current.publishedAt : null;
  return current?.publishedAt ?? new Date();
}

export async function createArticle(input: CreateArticleInput): Promise<ArticleRow> {
  const [row] = await db
    .insert(articles)
    .values({
      ...(input.translationGroupId ? { translationGroupId: input.translationGroupId } : {}),
      language: input.language,
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      body: input.body,
      coverImage: input.coverImage,
      published: input.published,
      publishedAt: stampPublishedAt(input),
      relatedProjectId: input.relatedProjectId,
      relatedSolution: input.relatedSolution,
    })
    .returning();
  return row;
}

export async function updateArticle(
  id: number,
  input: UpdateArticleInput,
): Promise<ArticleRow | null> {
  const current = await getArticleById(id);
  if (!current) return null;

  const [row] = await db
    .update(articles)
    .set({
      ...input,
      publishedAt: stampPublishedAt(input, current),
      updatedAt: sql`now()`,
    })
    .where(eq(articles.id, id))
    .returning();
  return row ?? null;
}

export async function deleteArticle(id: number): Promise<ArticleRow | null> {
  const [row] = await db.delete(articles).where(eq(articles.id, id)).returning();
  return row ?? null;
}

export type ArticleGroupRow = {
  id: number;
  slug: string;
  title: string;
  published: boolean;
  updatedAt: Date;
};

export type ArticleGroup = {
  translationGroupId: string;
  updatedAt: Date;
  en: ArticleGroupRow | null;
  ar: ArticleGroupRow | null;
};

export async function listArticleGroups(): Promise<ArticleGroup[]> {
  const rows = await db
    .select({
      id: articles.id,
      translationGroupId: articles.translationGroupId,
      language: articles.language,
      slug: articles.slug,
      title: articles.title,
      published: articles.published,
      updatedAt: articles.updatedAt,
    })
    .from(articles)
    .orderBy(desc(articles.updatedAt));

  const groups = new Map<string, ArticleGroup>();
  for (const row of rows) {
    const groupRow: ArticleGroupRow = {
      id: row.id,
      slug: row.slug,
      title: row.title,
      published: row.published,
      updatedAt: row.updatedAt,
    };

    const existing = groups.get(row.translationGroupId);
    if (existing) {
      existing[row.language] = groupRow;
      if (groupRow.updatedAt > existing.updatedAt) existing.updatedAt = groupRow.updatedAt;
    } else {
      groups.set(row.translationGroupId, {
        translationGroupId: row.translationGroupId,
        updatedAt: groupRow.updatedAt,
        en: row.language === "en" ? groupRow : null,
        ar: row.language === "ar" ? groupRow : null,
      });
    }
  }

  return Array.from(groups.values()).sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
  );
}
