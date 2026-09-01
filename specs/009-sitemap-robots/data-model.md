# Data Model: Sitemap + Production Robots

No schema change, no migration. This feature introduces no new persisted entities. It only reads existing data through existing DAL functions and shapes the results into two Next.js file-convention outputs.

## Entities (transient, in-memory — not persisted)

### Sitemap entry

Represents one `<url>` element in the generated `/sitemap.xml`. Constructed at request time from existing DAL reads; never stored.

| Field | Type | Source | Notes |
|---|---|---|---|
| `url` | `string` | Computed | Absolute URL: `${siteUrl}${languagePath}` |
| `lastModified` | `Date \| undefined` | `articles.publishedAt` (articles only) | Present for articles when `publishedAt` is non-null; omitted for static pages and projects (see [research.md](./research.md) §2) |

Populated from three sources, all read directly via existing DAL functions (P-05, no new API layer):

- **Static pages** — hardcoded list of route paths (`/`, `/about`, `/solutions`, `/contact`, `/articles`, `/portfolio`), expanded to both languages via `getLanguagePath`. No DB read.
- **Published articles** — `getPublishedArticles("en")` and `getPublishedArticles("ar")` (`lib/db/articles.ts`). Each `ArticleListItem` contributes one entry per language at its real per-language `slug`, with `lastModified` from `publishedAt`.
- **Projects** — `getPortfolioSlugs()` (`lib/db/portfolio.ts`), one slug per project, expanded to both languages (shared slug across languages, per existing convention). No `lastModified`.

### Robots rule set

Represents the `MetadataRoute.Robots` object returned by `app/robots.ts`. Two mutually exclusive shapes, selected by `process.env.INDEXING_ENABLED`:

**Staging (`INDEXING_ENABLED` unset)** — unchanged from today:

| Field | Value |
|---|---|
| `rules.userAgent` | `"*"` |
| `rules.disallow` | `"/"` |

**Production (`INDEXING_ENABLED === "true"`)**:

| Field | Value |
|---|---|
| `rules[0]` | `{ userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] }` (unchanged) |
| `rules[1..n]` | one rule per AI-crawler token (see [research.md](./research.md) §3), each `{ userAgent: <token>, allow: "/", disallow: ["/admin/", "/api/"] }` |
| `sitemap` | absolute `${siteUrl}/sitemap.xml` |

### X-Robots-Tag header rule

Represents one entry in `next.config.ts` `headers()`'s returned array. Two mutually exclusive shapes, selected by the same flag:

**Staging** — unchanged: one rule, `source: "/(.*)"`, header `X-Robots-Tag: noindex, nofollow`.

**Production**: two rules, `source: "/admin/:path*"` and `source: "/api/:path*"`, each header `X-Robots-Tag: noindex`. No rule for any other path.

## Relationships

None — all three outputs (sitemap, robots, headers) are independently derived read-side views over the same existing `articles` and `projects`/`project_translations` tables and the same `INDEXING_ENABLED` flag. No new foreign keys, no new joins beyond what `getPublishedArticles` and `getPortfolioSlugs` already perform.

## Validation rules

- A sitemap entry's `url` is always absolute and built off `siteUrl` (`env.BETTER_AUTH_URL`) — never a relative path.
- No sitemap entry is ever produced for: unpublished/draft articles, `/admin/*`, `/api/*`, or `/services`.
- The sitemap array is empty (`[]`) whenever `INDEXING_ENABLED !== "true"` — no entry of any kind is produced in that mode.
