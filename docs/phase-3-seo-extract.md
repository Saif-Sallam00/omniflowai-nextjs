# Phase 3 SEO/AEO/Ops Extract — Current State

Read-only audit of the codebase as it exists today. All claims are cited with file paths and line numbers. Where something was searched for and not found, that is stated explicitly rather than inferred. This document describes what IS, not what should be — no solutions or specs are proposed here.

---

## 1. Public Route Inventory

All public routes render via Route Handlers/Pages under `app/(en)/(public)/**` (EN, no URL prefix) and `app/ar/(public)/**` (AR, `/ar` prefix), per `lib/language.ts:9-12` (`LANGUAGES.en.prefix = ""`, `LANGUAGES.ar.prefix = "/ar"`).

| Route (EN) | Route (AR) | File (EN) | File (AR) | Rendering | generateStaticParams | revalidate |
|---|---|---|---|---|---|---|
| `/` | `/ar` | `app/(en)/(public)/page.tsx` | `app/ar/(public)/page.tsx` | Static (no `revalidate` export; default full static generation) | n/a | not set |
| `/about` | `/ar/about` | `app/(en)/(public)/about/page.tsx` | `app/ar/(public)/about/page.tsx` | Static | n/a | not set |
| `/solutions` | `/ar/solutions` | `app/(en)/(public)/solutions/page.tsx` | `app/ar/(public)/solutions/page.tsx` | Static | n/a | not set |
| `/contact` | `/ar/contact` | `app/(en)/(public)/contact/page.tsx` | `app/ar/(public)/contact/page.tsx` | Dynamic — default-exported function is `async` and reads `searchParams` (`app/(en)/(public)/contact/page.tsx:18-24`, `app/ar/(public)/contact/page.tsx` equivalent) | n/a | not set |
| `/articles` | `/ar/articles` | `app/(en)/(public)/articles/page.tsx` | `app/ar/(public)/articles/page.tsx` | ISR | n/a | `export const revalidate = 3600;` at `app/(en)/(public)/articles/page.tsx:10` / `app/ar/(public)/articles/page.tsx:10` |
| `/articles/[slug]` | `/ar/articles/[slug]` | `app/(en)/(public)/articles/[slug]/page.tsx` | `app/ar/(public)/articles/[slug]/page.tsx` | ISR + static params | `generateStaticParams` at `app/(en)/(public)/articles/[slug]/page.tsx:25-28` (calls `getPublishedArticleSlugs("en")`), AR equivalent at `app/ar/(public)/articles/[slug]/page.tsx:25-28` (`getPublishedArticleSlugs("ar")`) | `revalidate = 3600` at line 16 (both) |
| `/portfolio` | `/ar/portfolio` | `app/(en)/(public)/portfolio/page.tsx` | `app/ar/(public)/portfolio/page.tsx` | ISR | n/a | `revalidate = 3600` at line 7 (both) |
| `/portfolio/[slug]` | `/ar/portfolio/[slug]` | `app/(en)/(public)/portfolio/[slug]/page.tsx` | `app/ar/(public)/portfolio/[slug]/page.tsx` | ISR + static params | `generateStaticParams` at `app/(en)/(public)/portfolio/[slug]/page.tsx:20-23` (calls `getPortfolioSlugs()` — no language argument), AR equivalent at `app/ar/(public)/portfolio/[slug]/page.tsx:19-22` (same, no language argument) | `revalidate = 3600` at line 12 (both) |

No other public pages were found under `app/(en)/(public)/**` or `app/ar/(public)/**`. `/services` exists only as a permanent redirect to `/solutions` (`next.config.ts:6-10`), not a route file.

Layouts: `app/(en)/layout.tsx` and `app/ar/layout.tsx` are the language-scoped HTML roots (`<html lang>`/`dir` from `LANGUAGES`); `app/(en)/(public)/layout.tsx` and `app/ar/(public)/layout.tsx` wrap public pages in `<SiteShell>`. Neither layout defines `generateStaticParams` or `revalidate`.

Admin (`app/(en)/admin/**`) and API (`app/api/**`) routes exist but are explicitly out of scope per the task brief and are only referenced here where relevant to indexing/robots (§5) and image serving (§2, §7).

---

## 2. Current Per-Page Metadata Audit

Every public page/route calls `buildPageMetadata()` from `lib/metadata.ts:16-44` inside its own `generateMetadata` (static pages export a plain, non-async `generateMetadata` function; dynamic pages export an `async` one). `buildPageMetadata` (full source):

```ts
// lib/metadata.ts:16-44
export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const { path, language, title, description } = input;
  const canonicalUrl = buildAbsoluteUrl(getLanguagePath(path, language));
  const enUrl = buildAbsoluteUrl(getLanguagePath(path, "en"));
  const arUrl = buildAbsoluteUrl(getLanguagePath(path, "ar"));

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: { en: enUrl, ar: arUrl, "x-default": enUrl },
    },
    openGraph: { title, description, url: canonicalUrl },
    twitter: { card: "summary_large_image", title, description },
  };
}
```

`siteUrl` (used for absolute URLs) = `env.BETTER_AUTH_URL` (`lib/site.ts:3`) — i.e. canonical/hreflang/OG URLs are built off the auth base URL env var, not a dedicated `SITE_URL`/`NEXT_PUBLIC_SITE_URL` variable. `lib/env.ts:16-19` requires `BETTER_AUTH_URL` to be a valid URL.

### Field-presence matrix

| Route | title | description | canonical | OG (title/desc/url) | OG image | twitter | hreflang (en/ar/x-default) |
|---|---|---|---|---|---|---|---|
| `/` (EN/AR) | Present, per-page (`page.tsx:18`/AR `:18`) | Present, per-page | Present | Present | **Absent** | Present (no image) | Present |
| `/about` (EN/AR) | Present, per-page | Present, per-page | Present | Present | **Absent** | Present | Present |
| `/solutions` (EN/AR) | Present, per-page | Present, per-page | Present | Present | **Absent** | Present | Present |
| `/contact` (EN/AR) | Present, per-page | Present, per-page | Present | Present | **Absent** | Present | Present |
| `/articles` (EN/AR) | Present, static string `"Articles"`/`"المقالات"` | Present, static | Present | Present | **Absent** | Present | Present |
| `/articles/[slug]` (EN/AR) | **Partial** — real article title only if `article.published`; unpublished/not-found falls back to generic `"Articles"`/`"المقالات"` (`app/(en)/(public)/articles/[slug]/page.tsx:38-45`) | Same partial pattern — falls back to `"OmniflowAI articles."` (or `"مقالات OmniflowAI."`) | Present (always built from the requested slug path) | Present, mirrors title/description | **Absent** | Present | Present, but see §3 — the `ar`/`en` URLs are naive path-substitutions, not verified counterparts |
| `/portfolio` (EN/AR) | Present, static | Present, static | Present | Present | **Absent** | Present | Present |
| `/portfolio/[slug]` (EN/AR) | **Partial** — same not-found fallback pattern (`app/(en)/(public)/portfolio/[slug]/page.tsx:33-40`), generic `"Portfolio"`/`"أعمالنا"` and `"OmniflowAI case study."`/`"دراسة حالة من OmniflowAI."` | Same partial pattern | Present | Present | **Absent** | Present | Present, but see §3 — same caveat, though empirically safer since slug is shared |

### Flags

**(a) Generic/fallback title-description instead of per-page content:**
- `/articles/[slug]` and `/portfolio/[slug]` fall back to a generic site-wide-style title/description ("Articles"/"Portfolio" + boilerplate sentence) whenever the slug doesn't resolve to a published item — `app/(en)/(public)/articles/[slug]/page.tsx:38-45`, `app/(en)/(public)/portfolio/[slug]/page.tsx:33-40` (and AR equivalents). This is a deliberate 404-adjacent fallback (the page itself then calls `notFound()` for non-existent articles, or serves an auth-gated draft), not a bug in the happy path, but it does mean any transient DB/query failure or race would also emit this generic metadata.
- All other routes (`/`, `/about`, `/solutions`, `/contact`, `/articles`, `/portfolio`) hard-code a distinct, per-page title/description string directly in their `generateMetadata` calls — none of them reads from `app/(en)/layout.tsx`'s or `app/(en)/(public)/layout.tsx`'s `metadata` export. Those layout-level `metadata` exports (`app/(en)/layout.tsx:6-9` = `{ title: "OmniflowAI — Foundation", description: "Phase 0 foundation deployment." }`; `app/(en)/(public)/layout.tsx:4-7` = `{ title: "OmniflowAI", description: "OmniflowAI — AI-powered solutions." }`; AR equivalents are the same in English/Arabic) function only as a fallback for any page that does NOT define its own metadata — no current public page relies on that fallback. Note the root layout's title/description still reads "Foundation" / "Phase 0 foundation deployment" — leftover placeholder copy from the Phase 0 slice, present in code but never actually surfaced on a real page today.

**(b) Missing/incorrect canonical URLs:** None found — every route builds a canonical URL via `buildPageMetadata`, and it is always derived from the actual requested `path`/`language`, not hard-coded.

**(c) Missing hreflang alternates between EN/AR counterparts:** Not missing in the sense of the `alternates.languages` object always being emitted (`lib/metadata.ts:26-29`) — every page emits `en`, `ar`, and `x-default` links. However, correctness of the AR/EN link value for dynamic routes is a separate question — see §3. For all six static routes the hreflang pair is verifiably correct (same `path` string, just prefixed differently by `getLanguagePath`).

**(d) OG image sourcing:** `buildPageMetadata`'s `openGraph` object (`lib/metadata.ts:33-37`) has no `images` key at all — grepped the whole function body; no reference to `/api/image/{id}` or any other image URL. **No route sets an OG image.** This applies uniformly to all 8 routes × 2 languages. (Cover images ARE used inline on `/articles`, `/articles/[slug]`, `/portfolio/[slug]` via `<FallbackImage src={article.coverImage}>`/`project.coverImage`, which store `/api/image/{id}` paths per `app/api/image/route.ts:44` — but that plumbing is never wired into `generateMetadata`.)

---

## 3. hreflang / EN↔AR Linking Mechanics

**Static pages** (`/`, `/about`, `/solutions`, `/contact`, `/articles`, `/portfolio`): the EN↔AR mapping is a fixed 1:1 route-structure convention — `getLanguagePath(path, language)` (`lib/language.ts:18-22`) just prepends/removes the `/ar` prefix on an identical `path` string. Confirmed correct: `buildPageMetadata` computes both `enUrl` and `arUrl` from the very same `path` argument each page passes in (e.g., `/about` in both `app/(en)/(public)/about/page.tsx:10` and `app/ar/(public)/about/page.tsx:10`).

**Projects (portfolio) — confirmed: one shared slug across languages.** Schema: `projects` (`lib/db/schema.ts:21-39`) holds one row per project with a single `slug` column (`unique()`), no `language` column. Per-language content lives in a separate `project_translations` table (`lib/db/schema.ts:93-130`) joined by `project_id` + `language`, with a `(project_id, language)` unique constraint (lines 124-127) — i.e., exactly one EN row and one AR row per project, both pointing at the same `projects.slug`. Query confirmation: `getPortfolioSlugs()` (`lib/db/portfolio.ts:72-75`) selects `slug` from `projects` alone, with **no language filter** — the same slug list feeds `generateStaticParams` for both `app/(en)/(public)/portfolio/[slug]/page.tsx:20-23` and `app/ar/(public)/portfolio/[slug]/page.tsx:19-22`. So a given EN project URL `/portfolio/foo` and its AR counterpart `/ar/portfolio/foo` are guaranteed by the schema itself to refer to the same project — the hreflang link `buildPageMetadata` emits for `/portfolio/[slug]` is therefore reliably correct (`app/(en)/(public)/portfolio/[slug]/page.tsx:42-47` passes the identical `slug` through to `path`).

**Articles — confirmed: NOT a shared slug, linked instead by `translation_group_id`.** Schema: `articles` (`lib/db/schema.ts:56-91`) has both `language` and `slug` columns, with the unique constraint on `(language, slug)` (line 79) — i.e., slugs are scoped per language and are **not required to match** across EN/AR. Cross-language linkage exists via `translationGroupId` (a `uuid`, line 60-62), with a unique constraint on `(translation_group_id, language)` (lines 80-83) and an index (line 89) — this is the mechanism used by the *admin* CRUD (`getArticleByTranslationGroupAndLanguage`, `lib/db/articles.ts:85-97`, and `listArticleGroups`, lines 198-239, used to pair EN/AR rows in the admin article list).

**Gap: the public article-detail page and `buildPageMetadata` never use `translationGroupId` at all.** `app/(en)/(public)/articles/[slug]/page.tsx` and its AR counterpart only call `getArticleBySlug(slug, LANGUAGE)` (line 61) and `getPublishedArticleSlugs(LANGUAGE)` (line 26) — both scoped to a single language, with no lookup of the sibling language's slug. The `hreflang`/`alternates.languages` value emitted by `buildPageMetadata` for an article page (`lib/metadata.ts:19-20`) is computed purely as `getLanguagePath(path, "en"/"ar")` on the **same slug string** used for the current language — i.e., it assumes the AR slug is textually identical to the EN slug. Nothing in the schema or the admin write path (`lib/db/articles.ts:110-122`, `CreateArticleInput`) enforces that assumption; slugs are entered independently per language. So: for an article whose EN and AR slugs happen to be identical, the emitted hreflang link happens to resolve correctly; for any article where they differ, `generateMetadata` on the EN page would emit an `ar` hreflang URL pointing at a slug that doesn't necessarily exist in the AR `articles` table (and vice versa).

**Client-side language switcher works the same way for everything, including articles.** `components/language-switcher.tsx:30`: `getCounterpartPath(getAgnosticPath(pathname), language)` — this strips/re-adds the `/ar` prefix on the *current URL's path string* with no DB lookup at all (`getCounterpartPath`, `lib/language.ts:24-27`; `getAgnosticPath`, lines 29-33). For `/portfolio/[slug]` this is safe (shared slug, confirmed above). For `/articles/[slug]` this carries the same identical-slug assumption as the metadata hreflang, but with no fallback if it's wrong — clicking "switch to Arabic" on an EN article whose AR slug differs would 404.

---

## 4. Sitemap — Current State

Searched for `app/sitemap.ts`, `app/sitemap.xml`, or any file/route containing "sitemap" (case-insensitive) across the whole repo (excluding `node_modules`/`.next`): **not found.** No sitemap route, static file, or generator exists anywhere in the codebase today.

DAL functions that already exist and expose published-article/project slugs per language, which a sitemap implementation would need:
- `getPublishedArticleSlugs(language: Language): Promise<string[]>` — `lib/db/articles.ts:43-51` — published-only, filtered by `language`.
- `getPortfolioSlugs(): Promise<string[]>` — `lib/db/portfolio.ts:72-75` — all projects (no `published` concept exists on `projects`; every project row is public), not filtered by language (consistent with §3's shared-slug finding).
- `getPublishedArticles(language: Language): Promise<ArticleListItem[]>` — `lib/db/articles.ts:27-41` — richer than the slugs-only function (also returns `publishedAt`, useful for a sitemap `lastmod` field), published-only, filtered by `language`.
- No equivalent "list items with `updatedAt`" function exists for projects in the public-read section of `lib/db/portfolio.ts`; the closest, `listProjectsForAdmin` (lines 352-370), is explicitly commented as admin-only and includes `updatedAt`, but is not used by any public code path today.

---

## 5. Robots + Indexing Gate — Current State

`app/robots.ts` (full source, 21 lines):

```ts
// app/robots.ts:1-20
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  if (process.env.INDEXING_ENABLED === "true") {
    return {
      rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] },
    };
  }

  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
```

- Env flag: `process.env.INDEXING_ENABLED`, read directly (not through `lib/env.ts`'s Zod schema — `lib/env.ts:1-19` does not declare `INDEXING_ENABLED` at all, so it is un-validated, optional, and defaults to `undefined`/falsy).
- **When `INDEXING_ENABLED === "true"`** (intended prod/indexable mode): `robots.txt` emits `Allow: /` plus explicit `Disallow: /admin/` and `Disallow: /api/` for `User-agent: *`. No sitemap reference is emitted (consistent with §4 — there is no sitemap to reference). No AI-crawler-specific rules (see §6).
- **Any other value** (unset, `"false"`, staging default): a single blanket `Disallow: /` for `User-agent: *` — the entire site is deindexed.
- `next.config.ts:26-37` (`headers()`) mirrors the same flag for an `X-Robots-Tag` response header:

```ts
// next.config.ts:26-37
async headers() {
  if (process.env.INDEXING_ENABLED === "true") {
    return [];
  }
  return [
    { source: "/(.*)", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
  ];
},
```

  When indexing is disabled, every route (the `/(.*)` pattern matches all paths, including `/admin/*` and `/api/*`) gets a blanket `X-Robots-Tag: noindex, nofollow` response header. When indexing is enabled, no `X-Robots-Tag` header is added by this config at all — i.e., in prod/indexable mode, `/admin/*` and `/api/*` are excluded from crawling only via `robots.txt`'s `Disallow`, not via a header — nothing else in the codebase sets `X-Robots-Tag` (confirmed by repo-wide grep, no other match).

---

## 6. AEO Surfaces — Present vs Absent

Grepped the whole repo (excluding `node_modules`, `.next`) for `application/ld+json`, `schema.org`, `llms.txt`, and AI-crawler user-agent tokens (`GPTBot`, `anthropic-ai`, `ClaudeBot`, `CCBot`, `PerplexityBot`, `Google-Extended`).

- **JSON-LD / `schema.org`:** zero matches anywhere in `app/`, `components/`, `lib/`. **Absent.**
- **`llms.txt`:** no file by that name anywhere in the repo. **Absent.**
- **AI-crawler-specific robots rules:** zero matches for any of the above tokens in `app/robots.ts` or elsewhere. `app/robots.ts`'s only rule block is the generic `userAgent: "*"` shown in §5 — there is no per-bot rule (allow or block) for any named AI crawler. **Absent.**

**Where these would integrate, if added** (locations only, no design proposed):
- JSON-LD structured data: each public page's own component tree already renders full HTML — a `<script type="application/ld+json">` tag would need to be added inside one of: the six static page files listed in §1, the two `[slug]` detail pages (which already have per-item data available — `article`/`project` objects — inside their default-exported page components, e.g. `app/(en)/(public)/articles/[slug]/page.tsx:61` `const article = ...`, `app/(en)/(public)/portfolio/[slug]/page.tsx:56` `const project = ...`), or a shared layout (`app/(en)/(public)/layout.tsx` / `app/ar/(public)/layout.tsx`, or `components/site-shell.tsx`) for site-wide markup (e.g. `Organization`).
- `llms.txt`: would be a new static file/route, analogous in mechanism to `app/robots.ts` (a Next.js file convention route) — no existing file occupies that slot.
- AI-crawler robots rules: would be added as additional rule objects inside the `rules` array/object already returned by `app/robots.ts`'s default export (currently a single `userAgent: "*"` rule in each branch, lines 6-9 and 15-18).

---

## 7. Structured Logging — Current State

`lib/logger.ts` (24 lines, full file):

```ts
// lib/logger.ts:1-24
type RouteHandler = (request: Request, ctx: unknown) => Promise<Response> | Response;

export function withRequestLogging(handler: RouteHandler): RouteHandler {
  return async (request, ctx) => {
    const start = Date.now();
    const response = await handler(request, ctx);
    const duration = Date.now() - start;
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        method: request.method,
        path: new URL(request.url).pathname,
        status: response.status,
        duration,
      }),
    );
    return response;
  };
}
```

- **Format:** one JSON line per request to stdout via `console.log`, fields: `timestamp` (ISO string), `method`, `path` (pathname only, no query string), `status`, `duration` (ms). No request/response body is ever read or logged (the comment at lines 3-7 states this as a deliberate constraint). No request ID, no user/session ID, no IP.
- **Call sites** (repo-wide grep for `withRequestLogging` outside its own definition file): exactly three route handlers wrap their exports with it:
  - `app/api/image/route.ts:5` (import) / line 46 `export const POST = withRequestLogging(withErrorHandling(uploadImage));`
  - `app/api/image/[id]/route.ts:3` (import) / line 33 `export const GET = withRequestLogging(withErrorHandling(serveImage));`
  - `app/api/auth/[...auth]/route.ts:3` (import; not re-read in full here, but the import confirms usage).
- **`/api/health` is excluded from logging:** confirmed — `app/api/health/route.ts` (5 lines, full file) has no import of `lib/logger` and its `GET` export is not wrapped: `export function GET() { return Response.json({ status: "ok", version }); }`. This matches Phase-0 spec intent (`specs/001-foundation-slice/tasks.md:137`: "no database call, no auth required" for health).
- **`/api/image` (both the upload POST and the `[id]` GET serve route) IS wrapped and DOES get a log line per request** — this is a route serving binary image bytes with a long-lived immutable cache header (`Cache-Control: public, max-age=31536000, immutable`, `app/api/image/[id]/route.ts:29`), so most repeat requests should be served from browser/CDN cache rather than hitting this route — but every cache-miss or first-load request to `/api/image/{id}` does produce a stdout log line. No throttling/sampling exists in `withRequestLogging` itself. This is noted only as a fact found in the code (the wrapping exists and is unconditional); no evidence of actual log volume in production was found or is claimable from static reading (see §8).

**FR-9 comparison** (found in `specs/001-foundation-slice/spec.md:165-169`):
- FR-9.1: "HTTP request logging for `/api/*` MUST emit structured JSON to stdout. Fields: timestamp, method, path, status, duration." — Implemented exactly as specified for the three routes listed above. **Not implemented for `/api/health`** (which is arguably still under `/api/*`) — this is a plain textual gap between the FR's literal "for `/api/*`" scope and the actual wrapped set, not evaluated here as good or bad.
- FR-9.2: "Response bodies MUST NOT be logged." — Matches; `withRequestLogging` never touches `response.body`.
- FR-9.3: "top-level error handler MUST return `{ message }` JSON... MUST NOT include stack traces in production" — handled by a separate file, `lib/error-handler.ts` (not read in full for this audit; only its import/usage alongside `withRequestLogging` was confirmed in `app/api/image/route.ts:4,46` and `app/api/image/[id]/route.ts:2,33`).
- FR-9.4: "Request-correlation IDs are NOT required in Phase 0... otherwise defer." — Matches; no correlation/request ID field exists in the logger's output, consistent with this being explicitly deferred rather than an oversight.

---

## 8. Empirical / Production-Behavior Open Items

These are open questions that static code reading cannot resolve — listed as questions, not findings.

- **Neon / WebSocket driver behavior:** `specs/001-foundation-slice/research.md:82-90` documents the decision to use `drizzle-orm/neon-serverless` (WebSocket-based) rather than `neon-http`, specifically because the app needs multi-statement transactions and runs as "a long-lived Node process on Replit Autoscale." `docs/phase-0-state-report.md:420` documents the same driver choice and pool config (`max: 10`, `idleTimeoutMillis: 30_000`, `connectionTimeoutMillis: 10_000`) as already implemented in `lib/db/index.ts`. **Open question:** no comment, spec, or doc anywhere in the repo asserts or denies WebSocket-connection flakiness under Replit Autoscale's actual runtime (autoscale can spin instances up/down, which is exactly the scenario where a persistent WebSocket pool could behave unexpectedly) — searched `specs/`, `docs/`, and code comments for "flak"/"intermittent"/"Neon"/"WebSocket" and found only the architecture-decision rationale above, no incident reports or caveats. This is unconfirmed-on-Replit / sandbox-untested by nature of a static read.
- **`getSession` behavior:** three call sites found — `lib/auth-server.ts:10,19`, `app/(en)/(public)/articles/[slug]/page.tsx:65`, `app/ar/(public)/articles/[slug]/page.tsx:65` — all call `auth.api.getSession({ headers })` from Better Auth, used to gate viewing of unpublished/draft articles. No comment or spec text anywhere flags this call as flaky or intermittent; its real-world latency/reliability under production traffic is not verifiable from source alone.
- **`after()` usage:** found twice, both in `lib/actions/leads.ts:66,96` — `after(() => notifyNewLead(lead))`, deferring a notification side-effect until after the response is sent (Next.js's background-work API). No comment in that file discusses Replit Autoscale's compatibility with `after()` (whether background work reliably completes before an autoscale instance is recycled/scaled down). No mention of "FR-9.4" in connection with `after()` was found (FR-9.4, per §7, is actually about request-correlation IDs, not `after()` — no spec text links the two). Whether `after()`'s deferred execution reliably completes on Replit Autoscale is not verifiable from static code and was not found addressed anywhere in specs/docs.
- **TODO/FIXME/deferred comments found in `app/`, `lib/`, `components/`** (repo-wide grep, `specs/` excluded):
  - `next.config.ts:13` (comment) and lines 16, 21 (values) — two hardcoded `TODO-slug-for-legacy-project-7`/`-8` placeholder redirect destinations for legacy numeric portfolio URLs, explicitly noted as needing the real slugs once projects 7 and 8 are "re-entered at Phase 4 migration." This is a redirect-correctness gap, not SEO-metadata-specific, but affects any inbound/indexed links to those legacy URLs.
  - `components/site-shell.tsx:81-84` — `TODO(ar-footer-headings)`: Arabic footer heading strings (`servicesHeading`, `companyHeading`) are left `null` because "the live site has no reachable Arabic version to confirm these against." This is a content-completeness gap in the AR footer, not metadata, but is the kind of "confirm on [production]" item worth surfacing.
  - No other TODO/FIXME/"deferred"/"confirm on" comments related to SEO/AEO/logging/production behavior were found in `app/`, `lib/`, or `components/` beyond the two above.

---

## 9. Consolidated Gap List + Slice Observations

| Area | Gap description | File/Location |
|---|---|---|
| Sitemap | No `app/sitemap.ts`/`sitemap.xml` or any sitemap-generating file exists anywhere in the repo. | n/a — confirmed absent (§4) |
| Metadata / OG | `buildPageMetadata` never emits an `openGraph.images` entry — no route (static or dynamic, EN or AR) has an OG image, despite `/api/image/{id}` cover-image URLs already existing on articles and projects. | `lib/metadata.ts:33-37` (§2) |
| Metadata / fallback content | `/articles/[slug]` and `/portfolio/[slug]` fall back to generic site-level title/description when the slug is unpublished/not found, rather than any per-item content. | `app/(en)/(public)/articles/[slug]/page.tsx:38-45`; `app/(en)/(public)/portfolio/[slug]/page.tsx:33-40` (and AR equivalents) (§2) |
| hreflang / linking | Article-detail hreflang/canonical alternates and the client-side language switcher both assume the EN and AR slug are textually identical for a given article, but the schema (`(language, slug)` unique, linked instead by `translation_group_id`) does not guarantee this. No code path resolves an article's counterpart slug via `translation_group_id` on the public side. | `lib/db/schema.ts:56-91` (schema); `app/(en)/(public)/articles/[slug]/page.tsx:26,61` (no group-based lookup); `components/language-switcher.tsx:30` (§3) |
| Robots / indexing | `robots.txt` never references a sitemap (consistent with no sitemap existing) and has no per-bot (AI-crawler) rules — only a single `userAgent: "*"` rule in either mode. | `app/robots.ts:1-20` (§5, §6) |
| Robots / headers | In indexable mode (`INDEXING_ENABLED === "true"`), no `X-Robots-Tag` header is set on `/admin/*` or `/api/*` at all — those paths rely solely on `robots.txt`'s `Disallow`, which crawlers can choose to ignore (soft directive) whereas a header is a stronger, per-response signal. | `next.config.ts:26-37` (§5) |
| AEO | No JSON-LD/`schema.org` structured data anywhere in the codebase (zero matches repo-wide). | n/a — confirmed absent (§6) |
| AEO | No `llms.txt` file anywhere in the repo. | n/a — confirmed absent (§6) |
| AEO | No AI-crawler-specific (`GPTBot`, `ClaudeBot`, `CCBot`, etc.) allow/block rules in `robots.ts`. | `app/robots.ts` (§6) |
| Logging | `/api/health` is not wrapped by `withRequestLogging`, so it produces no structured log line, unlike the three other `/api/*` routes that are wrapped. | `app/api/health/route.ts` (§7) |
| Logging | `/api/image` (both upload and serve-by-id) is wrapped by `withRequestLogging` with no sampling/throttling — every request produces a stdout line, though the immutable long-lived cache header should limit repeat hits in practice. | `app/api/image/route.ts:46`; `app/api/image/[id]/route.ts:29,33` (§7) |
| Redirects | Two legacy numeric portfolio URLs (`/portfolio/7`, `/portfolio/8`) redirect to literal placeholder slugs (`TODO-slug-for-legacy-project-7`/`-8`) that do not correspond to any real project slug yet. | `next.config.ts:11-23` (§8) |
| Content completeness (AR) | Arabic footer `servicesHeading`/`companyHeading` are `null` pending a confirmed native AR string from a reachable Arabic version of the live site. | `components/site-shell.tsx:81-84` (§8) |
| Empirical (unconfirmed) | Neon WebSocket driver behavior under Replit Autoscale's scale-up/down cycles is undocumented (no incident notes either way). | `lib/db/index.ts` (referenced), `specs/001-foundation-slice/research.md:82-90` (§8) |
| Empirical (unconfirmed) | `after()`-deferred background work (`notifyNewLead`) reliability on Replit Autoscale is undocumented. | `lib/actions/leads.ts:66,96` (§8) |

**Observations on entanglement (not a recommended slicing):**
- The sitemap gap and the hreflang gap both terminate in the same underlying data-access surface: a sitemap needs published-slug lists per language (`getPublishedArticleSlugs`, `getPortfolioSlugs`), and a correct article hreflang link needs a slug-by-translation-group lookup that doesn't currently exist. Building the sitemap without first resolving the article slug-pairing question would likely reproduce the same "assume identical slug" shortcut currently baked into `lib/metadata.ts` and `components/language-switcher.tsx`.
- The OG-image gap depends on nothing being wrong first — it's additive to `buildPageMetadata`, and the source data (`article.coverImage`/`project.coverImage`, already `/api/image/{id}` URLs) already exists and is independent of the hreflang/sitemap questions.
- JSON-LD (AEO) is the one area that plausibly depends on the metadata-correctness gaps being settled first: any `Article`/`CreativeWork` structured data for `/articles/[slug]` or `/portfolio/[slug]` would naturally reuse the same title/description/canonical values already computed by `generateMetadata` — if those are still falling back to generic strings for edge cases (§2, flag (a)), JSON-LD built from the same source would inherit the same fallback behavior.
- The robots/`X-Robots-Tag` gap and the AI-crawler-rules gap are both entirely inside `app/robots.ts` (and `next.config.ts`'s `headers()` for the header case) — self-contained, independent of the DB-backed gaps (sitemap, hreflang, AEO) and of the logging gaps.
- The two logging gaps (`/api/health` unwrapped, `/api/image` unconditionally wrapped) are independent of every SEO/AEO gap above — they only touch `lib/logger.ts` and its three call sites.
- The empirical/production-only items (§8) are independent of all static-code gaps by definition — they can only be resolved by observing a real deployment, not by further code changes alone.
