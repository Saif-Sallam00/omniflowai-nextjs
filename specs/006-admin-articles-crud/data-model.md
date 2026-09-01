# Data Model: Admin Articles CRUD (Phase 2, Slice 2b)

**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Research**: [research.md](./research.md)

This slice introduces **no schema change and no migration**. The `articles` table (`lib/db/schema.ts:56-91`) is frozen and matches Phase 0 FR-3.1 verbatim (re-confirmed by `docs/articles-crud-extract.md` §1) — every shape below is built entirely on top of that existing table, plus one new function in the existing `lib/db/portfolio.ts` module.

## `articles` table (existing — unchanged)

```ts
export const articles = pgTable(
  "articles",
  {
    id: serial("id").primaryKey(),
    translationGroupId: uuid("translation_group_id").notNull().default(sql`gen_random_uuid()`),
    language: languageEnum("language").notNull(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull(),
    body: text("body").notNull(),
    coverImage: text("cover_image").notNull(),
    published: boolean("published").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    relatedProjectId: integer("related_project_id").references(() => projects.id, { onDelete: "set null" }),
    relatedSolution: text("related_solution"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("articles_language_slug_unique").on(table.language, table.slug),
    unique("articles_translation_group_id_language_unique").on(table.translationGroupId, table.language),
    index("articles_language_published_published_at_idx").on(table.language, table.published, table.publishedAt.desc()),
    index("articles_translation_group_id_idx").on(table.translationGroupId),
  ],
);
```

Zero columns/constraints/indexes added, removed, or altered by this slice.

## Data-access module — `lib/db/articles.ts` (extended, not replaced)

Existing exports (`ArticleListItem`, `Article`, `getPublishedArticles`, `getPublishedArticleSlugs`, `getArticleBySlug`) are **unchanged**. New exports:

```ts
// Full row shape for admin use (edit form, grouped list) — unlike the public
// `Article` type, includes id, translationGroupId, language, createdAt/updatedAt.
export type ArticleRow = typeof articles.$inferSelect;

export type CreateArticleInput = {
  translationGroupId?: string; // present only when creating a counterpart (Research Item 3)
  language: Language;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImage: string;
  published: boolean;
  publishedAt?: Date | null; // explicit admin-supplied value; see stamping rule below
  relatedProjectId: number | null;
  relatedSolution: string | null;
};

export async function createArticle(input: CreateArticleInput): Promise<ArticleRow> {
  // 1. Insert values: translationGroupId included only if input.translationGroupId
  //    is set (letting the column default generate one otherwise — Research Item 3).
  // 2. publishedAt = stampPublishedAt(input) — see below.
  // 3. .returning() → the created row.
}

export type UpdateArticleInput = Partial<
  Omit<CreateArticleInput, "translationGroupId">
>;

export async function updateArticle(id: number, input: UpdateArticleInput): Promise<ArticleRow | null> {
  // 1. Read the current row first (needed for first-publish-only stamping —
  //    matches the old app's own `stampPublishedAt(update, current)` shape,
  //    extraction §5.2, server/storage.ts:218-237).
  // 2. .update(articles).set({ ...input, publishedAt: stampPublishedAt(input, current),
  //    updatedAt: sql`now()` }).where(eq(articles.id, id)).returning()
  //    (Research Item 4: explicit updatedAt bump, not .$onUpdate).
  // 3. Returns null if no row matched `id` (leads-precedent null-on-miss).
}

export async function deleteArticle(id: number): Promise<ArticleRow | null> {
  // Single DELETE ... RETURNING, null-on-miss — identical shape to lib/db/leads.ts's deleteLead.
}

export async function getArticleById(id: number): Promise<ArticleRow | null> {
  // SELECT * WHERE id = ? LIMIT 1, null-on-miss — feeds the edit page's pre-fill.
}

export type ArticleGroupRow = {
  slug: string;
  title: string;
  published: boolean;
  updatedAt: Date;
} & { id: number };

export type ArticleGroup = {
  translationGroupId: string;
  updatedAt: Date; // max(en?.updatedAt, ar?.updatedAt) — the group's own sort key (FR-1.4)
  en: ArticleGroupRow | null;
  ar: ArticleGroupRow | null;
};

export async function listArticleGroups(): Promise<ArticleGroup[]> {
  // 1. SELECT id, translationGroupId, language, slug, title, published, updatedAt
  //    FROM articles ORDER BY updatedAt DESC (flat, ungrouped — Research Item 2).
  // 2. Group by translationGroupId into a Map<string, ArticleGroup> in one pass.
  // 3. Sort the resulting array by each group's own `updatedAt` (max of its
  //    present rows' updatedAt) descending.
}
```

### `publishedAt` stamping (`stampPublishedAt`, internal helper — not exported)

Ported directly from the old app's proven invariant (extraction §5.2, `server/storage.ts:245-258`), adapted to this table's field names:

```ts
function stampPublishedAt(
  update: { published?: boolean; publishedAt?: Date | null },
  current?: ArticleRow,
): Date | null | undefined {
  if (update.publishedAt !== undefined) return update.publishedAt; // explicit value always wins
  const willBePublished = update.published ?? current?.published ?? false;
  if (!willBePublished) return current ? current.publishedAt : null;
  return current?.publishedAt ?? new Date(); // stamp once, on first transition to published
}
```

Called identically from both `createArticle` (with `current` omitted — a fresh row has no prior state) and `updateArticle` (with `current` = the freshly-read existing row). This is the single enforced invariant referenced by FR-5.2/FR-5.3 — no call site outside `lib/db/articles.ts` implements or duplicates this logic.

### Slug-clash pre-check (both `createArticle` callers, i.e. the two Server Actions — not the DAL itself)

Per Research Item 2's rationale (P-15 read: a single `INSERT`/`UPDATE` statement is already atomic; the pre-check is a UX nicety, not the correctness boundary), the clash check lives in the **Server Action**, not the DAL function itself:
1. Before calling `createArticle`/`updateArticle`, the action queries for an existing row with the same `(language, slug)` — reusing `getArticleBySlug`-style lookup, or a small new `getArticleBySlugAndLanguage`-equivalent already effectively covered by extending `getArticleBySlug`'s existing `(slug, language)` filter (it already filters both — no new DAL function needed here). On update, the check excludes the row's own `id`.
2. If a clash is found pre-write, the action returns `fieldErrors: { slug: ["That slug is already in use"] }` immediately (FR-7.3), without calling the DAL at all.
3. As a correctness backstop (races), the action also catches a thrown unique-violation error (Postgres code `23505`) from the `createArticle`/`updateArticle` call itself and maps it to the same friendly `fieldErrors.slug` message — so the *authoritative* enforcement is always the DB's own unique constraint, with the pre-check existing purely to make the common case fast and friendly.

## `projects` / `project_translations` — new read (existing tables, no change)

```ts
// lib/db/portfolio.ts — new export, joins the same way getRelatedProjectCard already does
export type ProjectOption = { id: number; title: string };

export const listProjectsForSelect = cache(async (): Promise<ProjectOption[]> => {
  return db
    .select({ id: projects.id, title: projectTranslations.title })
    .from(projects)
    .innerJoin(
      projectTranslations,
      and(eq(projectTranslations.projectId, projects.id), eq(projectTranslations.language, "en")),
    )
    .orderBy(projectTranslations.title);
});
```

`language: "en"` is hardcoded (not parameterized) because the admin UI is English-only (spec Assumptions) — there is no case where this selector needs an Arabic title.

## Article form field ↔ storage mapping

| Form field | Type | Required | Storage |
|---|---|---|---|
| `language` | `"en" \| "ar"` | Yes (create only; fixed on edit) | `articles.language` |
| `title` | string | Yes | `articles.title` |
| `slug` | string, language-aware pattern (research.md Item 1) | Yes | `articles.slug` |
| `excerpt` | string | Yes | `articles.excerpt` |
| `coverImage` | string, `/api/image/{id}` (via upload control, research.md Item 6) | Yes | `articles.coverImage` |
| `body` | string, Markdown (via textarea + insert-image control) | Yes | `articles.body` |
| `published` | boolean | No (defaults `false`) | `articles.published` |
| `publishedAt` | optional explicit override | No | `articles.publishedAt` (via `stampPublishedAt`) |
| `relatedProjectId` | optional int, from `listProjectsForSelect()` | No (nullable) | `articles.relatedProjectId` |
| `relatedSolution` | optional one of 4 fixed ids | No (nullable) | `articles.relatedSolution` |
| `translationGroupId` | hidden field, present only for a counterpart create | N/A (create-time only) | `articles.translationGroupId` (override or column default) |

## Relationships

```
Article (articles table, existing, unchanged)
   ├─ grouped by → translation_group_id (shared, non-FK convention — no cascade either direction)
   ├─ optionally references → projects.id (relatedProjectId, existing FK, on delete set null — unchanged)
   ├─ optionally tags → one of 4 fixed relatedSolution ids (no DB enum, existing convention — unchanged)
   └─ cover_image / inline body image references → "/api/image/{id}" (Slice 2a's images table — read-only from this
      slice's perspective; this slice only ever writes the reference string, never touches the images table itself)

Admin Articles List (new, this slice)
   └─ reads → listArticleGroups() ──groups──> one row per translation_group_id, en/ar sub-rows

Create / Edit forms (new, this slice)
   ├─ create → createArticleAction → createArticle() → INSERT
   ├─ edit   → updateArticleAction → updateArticle() → UPDATE (one row, by id)
   └─ delete → deleteArticleAction → deleteArticle() → DELETE (one row, by id)
```

No entity in this slice has an update path outside the DAL functions above; no new table is introduced.
