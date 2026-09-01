# Sitemap + Production Robots — Phase 3, Slice 3b

**Status:** Draft (pending approval)
**Version:** 0.1
**Related decisions:** 001–013, standing rule 002 (URL preservation), P-04 (indexability signalling), Principle VII (bilingual)
**Related slices:** Phase 0 (`robots.ts` + `INDEXING_ENABLED` gating, `next.config.ts` headers), Phase 1 (public read path + DAL slug reads), 3a (article slug-pairing fix — sitemap depends on it), the Arabic-slug routing fix (AR URLs now resolve)
**Authoritative audit:** `docs/phase-3-seo-extract.md` (§4 sitemap, §5 robots/indexing, §6 AI-crawler rules)

## Overview

Second of three Phase 3 slices. Add a dynamic, DB-driven `sitemap.xml` covering every public URL in both languages, and upgrade the production `robots.txt` to reference that sitemap, explicitly allow AI crawlers (AEO), and harden `/admin`/`/api` indexing protection with a response header even in production-indexable mode. This depends on Slice 3a (correct article slug-pairing) and the Arabic-slug routing fix (AR article URLs now actually resolve), which is why it comes after them — the sitemap can now list AR article URLs that work.

No schema change; one small DB read may be added for project `lastmod` (a `/plan` decision).

## Problem statement

The audit found: (1) **no sitemap exists at all** (`app/sitemap.ts` absent), so search and AI crawlers have no index of the site's URLs; (2) the production `robots.txt` (when `INDEXING_ENABLED=true`) references no sitemap and has only a single generic `User-agent: *` rule — **no explicit AI-crawler rules**; (3) in production-indexable mode, `/admin` and `/api` are protected from crawling only by `robots.txt`'s soft `Disallow` — **no `X-Robots-Tag` header** reinforces it (the existing header rule in `next.config.ts` applies only in staging/noindex mode, blanket across all routes). Slice 3c (JSON-LD, `llms.txt`) and cutover both assume a working sitemap and correct production robots.

## Decisions settled before this spec (do not reopen)

- **All named AI crawlers are ALLOWED** in production robots (operator decision — maximize AEO citation). This slice adds explicit allow rules for them; it does not block any.
- **Logging gaps (§7) are OUT of scope** for 3b — deferred to Phase 3c/Phase 4 empirical checks (decide `/api/health` + `/api/image` logging with real traffic data). This slice touches no logging code.
- No schema change. At most one small additive public DAL read for project `lastmod` (decided in `/plan`).
- The sitemap and production-robots behavior are gated by the existing `INDEXING_ENABLED` flag — a sitemap MUST NOT advertise URLs on a deployment that is itself `noindex`.

## User stories

### US-1 — A crawler can discover every public URL
As a search or AI crawler, I can fetch `/sitemap.xml` and get every public page of the site — all static pages and all published articles and projects, in both English and Arabic, as absolute URLs — so I can discover and index the whole site.

### US-2 — The sitemap reflects real, resolvable URLs
As a crawler, every URL in the sitemap resolves to a real 200 page — including Arabic-script article URLs and each language's real per-article slug (not a naive same-slug guess) — so I never waste crawl budget on 404s.

### US-3 — Production robots points to the sitemap and welcomes AI crawlers
As an AI crawler (GPTBot, ClaudeBot, CCBot, PerplexityBot, Google-Extended, and other named AI agents), the production `robots.txt` explicitly allows me and references the sitemap, so the site is discoverable and citable by answer engines.

### US-4 — Admin/API stay out of the index even in production
As the operator, `/admin/*` and `/api/*` are protected from indexing in production not only by a `robots.txt` `Disallow` (a soft directive) but also by an `X-Robots-Tag: noindex` response header (a stronger per-response signal), so admin and API surfaces never appear in search results.

### US-5 — Staging stays fully deindexed
As the operator, none of the above weakens the staging protection: when `INDEXING_ENABLED` is unset, the whole site remains `noindex` (header + `Disallow: /`) and the sitemap does not advertise indexable URLs.

## Functional requirements

### FR-1 — Sitemap route
- FR-1.1: Add `app/sitemap.ts` (Next.js sitemap file convention) producing `/sitemap.xml`.
- FR-1.2: The sitemap MUST include, as absolute URLs built off `siteUrl` (`env.BETTER_AUTH_URL`, the same base the metadata layer uses):
  - All static public pages in **both** languages: `/`, `/about`, `/solutions`, `/contact`, `/articles`, `/portfolio` and their `/ar` equivalents. (`/services` is a redirect, not a route — it MUST be excluded.)
  - All **published** articles in both languages, each at its real per-language slug (EN via `getPublishedArticleSlugs("en")` / AR via `getPublishedArticleSlugs("ar")`, or the richer `getPublishedArticles(language)` where `publishedAt` is needed for `lastmod`).
  - All projects in both languages, at the shared slug (`getPortfolioSlugs()`).
- FR-1.3: Article entries SHOULD carry a `lastmod` derived from `published_at` (available via `getPublishedArticles`).
- FR-1.4: Project `lastmod` handling is a `/plan` decision: either add a small additive public read exposing a project timestamp (e.g. `updatedAt`), or omit `lastmod` for project entries. No schema change either way.
- FR-1.5: The sitemap MUST NOT include unpublished/draft articles, admin routes, API routes, or the `/services` redirect.
- FR-1.6: The sitemap reads the DB directly via existing DAL functions (P-05) — no intermediate API layer.

### FR-2 — Sitemap ↔ indexing gate
- FR-2.1: The sitemap's content MUST respect `INDEXING_ENABLED`: on a deployment where indexing is disabled (staging default), the sitemap MUST NOT advertise the site's indexable URLs (it is either empty, or effectively unused because the whole deployment is `noindex`). The exact mechanism (empty sitemap vs. gate) is selected in `/plan`, but the invariant is: a `noindex` staging deployment never publishes a populated public sitemap.
- FR-2.2: In production-indexable mode (`INDEXING_ENABLED=true`), the sitemap is fully populated per FR-1.

### FR-3 — Robots: sitemap reference + AI crawlers
- FR-3.1: In production-indexable mode, `app/robots.ts` MUST emit a `sitemap` reference pointing at the absolute `/sitemap.xml` URL.
- FR-3.2: In production-indexable mode, `robots.ts` MUST emit explicit **allow** rules for named AI crawlers — at minimum `GPTBot`, `ClaudeBot`, `CCBot`, `PerplexityBot`, `Google-Extended` (and any other well-known AI agent tokens chosen at implementation time) — allowing them to crawl the public site (`Allow: /`) while keeping the same `/admin/`, `/api/` disallows the generic rule already applies.
- FR-3.3: The existing generic `User-agent: *` production rule (`Allow: /`, `Disallow: /admin/`, `/api/`) MUST be preserved. AI-crawler rules are additive, not a replacement.
- FR-3.4: In staging/noindex mode (`INDEXING_ENABLED` unset), `robots.txt` MUST remain the blanket `Disallow: /` for all user agents — unchanged from today. AI-crawler allow rules apply ONLY in production-indexable mode.

### FR-4 — Robots header hardening for /admin and /api (production mode)
- FR-4.1: In production-indexable mode, all `/admin/*` and `/api/*` responses MUST additionally carry an `X-Robots-Tag: noindex` header (a stronger signal than the soft `robots.txt` `Disallow`). This is added via `next.config.ts` `headers()`, scoped to those path prefixes, active only when `INDEXING_ENABLED=true`.
- FR-4.2: This MUST NOT collide with or weaken the existing staging-mode rule: today, when `INDEXING_ENABLED` is unset, `next.config.ts` sets `X-Robots-Tag: noindex, nofollow` on **all** routes (`/(.*)`). That blanket staging rule MUST remain. FR-4.1 adds a *separate*, narrower rule that applies only in production mode to only `/admin`/`/api`. The two modes are mutually exclusive (one flag), so exactly one rule set is active at a time.
- FR-4.3: In production mode, public routes (everything except `/admin`/`/api`) MUST NOT carry any `X-Robots-Tag: noindex` header — they are meant to be indexed.

### FR-5 — No regressions
- FR-5.1: The staging deindex behavior (blanket `noindex` header + `Disallow: /` robots) MUST be verifiably unchanged when `INDEXING_ENABLED` is unset.
- FR-5.2: No existing public route's rendering, metadata, or canonical/hreflang output is changed by this slice — 3b adds `sitemap.ts`, edits `robots.ts`, and adds one `next.config.ts` header rule (and at most one small DAL read).
- FR-5.3: No schema change, no migration.

### FR-6 — Quality gate
- FR-6.1: `npm run check`, `npm run lint`, `npm run build` MUST all pass with zero errors.

## Out of scope (later slices / other phases)

- **JSON-LD structured data + `llms.txt`** — Slice 3c (depends on this slice's sitemap + robots being in place).
- **Logging gaps** (`/api/health` unwrapped, `/api/image` unthrottled) — deferred to Phase 3c/4 empirical checks with real traffic data (operator decision).
- **Blocking any AI crawler** — out of scope by decision; all named AI crawlers are allowed.
- **Legacy id→slug redirects** (`/portfolio/7|8`) — Phase 4 cutover.
- **Actually flipping `INDEXING_ENABLED=true`** — that happens at cutover (Phase 4/5), not here. This slice makes production-mode behavior *correct*; it does not enable it on staging.
- **A site-default OG image, AR footer headings** — tracked elsewhere.

## Assumptions (settled by the audit — do not reopen)

- `app/robots.ts` today: `INDEXING_ENABLED === "true"` → `{ userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] }`; otherwise `{ userAgent: "*", disallow: "/" }` (`app/robots.ts:1-20`).
- `next.config.ts` `headers()` today: when indexing is disabled, `X-Robots-Tag: noindex, nofollow` on `/(.*)`; when enabled, no header rule at all (`next.config.ts:26-37`).
- `INDEXING_ENABLED` is read directly from `process.env` (not through Zod), optional, defaults falsy — staging-safe by default.
- Existing DAL reads: `getPublishedArticleSlugs(language)`, `getPublishedArticles(language)` (has `publishedAt`), `getPortfolioSlugs()` (no language filter — shared slug). No public project-timestamp read exists yet.
- `siteUrl = env.BETTER_AUTH_URL` (`lib/site.ts:3`) is the absolute-URL base already used for canonical/hreflang.
- Article slug-pairing is correct as of 3a; AR article URLs resolve as of the slug-param normalization fix.

## Acceptance criteria

1. **AC-1:** `GET /sitemap.xml` (production mode) returns a valid sitemap listing every static page (both languages, `/services` excluded), every published article (both languages, real per-language slugs including Arabic-script ones), and every project (both languages), as absolute URLs.
2. **AC-2:** Every URL in the sitemap resolves to a 200 (spot-checked across an EN article, an AR Arabic-slug article, a project in both languages, and a couple of static pages) — no sitemap URL 404s.
3. **AC-3:** Unpublished/draft articles, `/admin/*`, `/api/*`, and `/services` do not appear in the sitemap.
4. **AC-4:** In production mode, `robots.txt` contains a `Sitemap:` line pointing to the absolute sitemap URL, explicit `Allow` rules for the named AI crawlers, and the preserved generic `*` rule with `/admin/` and `/api/` disallowed.
5. **AC-5:** In production mode, a request to an `/admin` or `/api` path carries `X-Robots-Tag: noindex`; a request to a public route does not.
6. **AC-6:** In staging mode (`INDEXING_ENABLED` unset), `robots.txt` is still `Disallow: /` for all agents, every route still carries the blanket `X-Robots-Tag: noindex, nofollow`, and the sitemap does not advertise indexable URLs — all unchanged from before this slice.
7. **AC-7:** No existing public route's rendering/metadata/canonical/hreflang changed; `npm run check`/`lint`/`build` exit zero; no migration produced and no existing schema object modified (zero-diff on `schema.ts`/`drizzle/`).

## Notes for `/plan` (mechanism details deferred)

- Whether `sitemap.ts` reads `INDEXING_ENABLED` to return an empty sitemap in staging, or relies on the deployment being `noindex` overall (FR-2.1) — pick the cleaner, testable option.
- Project `lastmod`: add a small public read exposing a project timestamp, or omit `lastmod` for projects (FR-1.4).
- The exact `next.config.ts` `headers()` structure for the production-mode `/admin`+`/api` rule that coexists cleanly with the staging blanket rule (FR-4.2) — likely a single `headers()` that branches on the flag and returns different rule sets per mode.
- The exact set of AI-crawler user-agent tokens to enumerate (FR-3.2) — the named minimum plus any current well-known additions verified at implementation time.
- How to verify AC-5's per-path header in a local production build without toggling the flag on the reachable staging deployment (mirrors the Phase 0 local-verification approach for `INDEXING_ENABLED`).
