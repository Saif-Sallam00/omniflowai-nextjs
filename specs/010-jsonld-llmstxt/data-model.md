# Data Model: JSON-LD Structured Data + Dynamic llms.txt

No schema change, no migration. This feature introduces no new persisted entities. It only reads existing data through existing DAL functions (`getArticleBySlug`, `getPortfolioDetailBySlug`, `getPublishedArticles`, `getPortfolioSlugs`) and shapes the results into three kinds of transient, in-memory output: JSON-LD script blocks and a plain-text index.

## Entities (transient, in-memory — not persisted)

### Organization structured-data block

One site-wide `application/ld+json` block, emitted by `components/site-shell.tsx`, present on every public page and absent on admin/API routes (by construction — `SiteShell` is not rendered there).

| Field | Type | Source | Notes |
|---|---|---|---|
| `@type` | `"Organization"` | Fixed | |
| `name` | `string` | Fixed curated value ("OmniflowAI") | |
| `url` | `string` | Computed: `siteUrl` + language root path | EN → `siteUrl`, AR → `siteUrl + "/ar"` |
| `description` | `string` | Fixed curated value, per language | Reuses the same description text already used in `app/(en)/(public)/layout.tsx` / `app/ar/(public)/layout.tsx`'s `<meta description>` |
| `inLanguage` | `"en" \| "ar"` | `language` prop already passed to `SiteShell` | |
| `logo` | *(omitted)* | — | No brand asset exists (research.md §4) — property is left out entirely, not set to a placeholder |

### Article structured-data block

One `application/ld+json` block per published article detail page (`/articles/[slug]`, both languages), built by `lib/structured-data.ts`'s `buildArticleJsonLd`. Absent when the article is unpublished or not found (FR-009).

| Field | Type | Source | Notes |
|---|---|---|---|
| `@type` | `"Article"` | Fixed | |
| `headline` | `string` | `article.title` | Same field `generateMetadata` passes as `title` to `buildPageMetadata` |
| `description` | `string` | `article.excerpt` | Same field passed as `description` |
| `image` | `string` | `buildAbsoluteUrl(article.coverImage)` | Same shared utility `buildPageMetadata` uses for its OG/Twitter image |
| `datePublished` | `string` (ISO) | `article.publishedAt` | Only present when non-null |
| `inLanguage` | `"en" \| "ar"` | Page's `LANGUAGE` constant | |
| `url` / `mainEntityOfPage` | `string` | `buildAbsoluteUrl(getLanguagePath(\`/articles/${slug}\`, language))` | Same canonical-URL computation `buildPageMetadata` performs internally |
| `publisher` | `object` | Reference to the Organization block's `name`/`url` | `{ "@type": "Organization", "name": ..., "url": ... }` |

### Case-study (CreativeWork) structured-data block

One `application/ld+json` block per project detail page (`/portfolio/[slug]`, both languages), built by `lib/structured-data.ts`'s `buildCaseStudyJsonLd`. Absent when the project is not found — projects have no separate published/draft state (research.md §1: `projects` table has no `published` column, so "exists" is the only gate, matching what `generateMetadata`'s not-found branch already checks).

| Field | Type | Source | Notes |
|---|---|---|---|
| `@type` | `"CreativeWork"` | Fixed (research.md §1) | |
| `name` | `string` | `project.title` | Same field passed as `title` to `buildPageMetadata` |
| `description` | `string` | `project.description` | Same field passed as `description` |
| `image` | `string` | `buildAbsoluteUrl(project.coverImage)` | Same shared utility used for OG/Twitter image |
| `inLanguage` | `"en" \| "ar"` | Page's `LANGUAGE` constant | |
| `url` | `string` | `buildAbsoluteUrl(getLanguagePath(\`/portfolio/${slug}\`, language))` | Same canonical-URL computation |
| `publisher` | `object` | Reference to the Organization block | Same shape as the Article block's `publisher` |

### llms.txt content index

The plain-text body returned by `GET /llms.txt`. Two shapes, selected by `process.env.INDEXING_ENABLED` (research.md §6):

**Staging** (`INDEXING_ENABLED` unset): header only.

| Section | Content |
|---|---|
| Header | Organization name, one-line description, a note on available languages (EN/AR) |
| Content list | *(absent)* |

**Production** (`INDEXING_ENABLED === "true"`): header + populated list.

| Section | Content |
|---|---|
| Header | Same as staging |
| Articles | One line per published article per language: title + absolute URL, via `getPublishedArticles("en")` / `getPublishedArticles("ar")` |
| Projects | One line per project per language: title + absolute URL, via `getPortfolioSlugs()` (title sourced from... see note below) |

Note: `getPortfolioSlugs()` returns slugs only (no title). Listing projects by title requires either `getPortfolioListItems(language)` (already exists, returns `title` + `slug` + other fields per language) in place of `getPortfolioSlugs()` for this specific read, or a language-paired title lookup. This is a small, existing-function substitution (no new DAL function), left as an implementation detail for `/tasks` — both `getPortfolioSlugs()` and `getPortfolioListItems(language)` are pre-existing, direct DAL reads (P-05 compliant either way).

## Relationships

None new — all four transient entities above are read-side views over the same existing `articles`, `projects`, and `project_translations` tables already used by the sitemap (Slice 3b) and the detail pages' own `generateMetadata`. The Article and CreativeWork blocks each reference the Organization block by `publisher`, but this is a JSON-LD-internal reference (`@type`/`name`/`url` inlined), not a new data relationship.

## Validation rules

- No `Article`/`CreativeWork` block is ever produced for: an unpublished article, or a not-found article/project.
- Every URL in every structured-data block and in `/llms.txt` is absolute, built via the same shared `buildAbsoluteUrl` utility already used by `generateMetadata` — never a relative path, never independently re-implemented string concatenation.
- `/llms.txt`'s article/project list is present if and only if `INDEXING_ENABLED === "true"`.
- The Organization block is present on every response from `SiteShell`-wrapped routes and absent everywhere else — no route-by-route conditional is needed or added.
