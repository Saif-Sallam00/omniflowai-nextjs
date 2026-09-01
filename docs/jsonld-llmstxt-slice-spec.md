# JSON-LD Structured Data + Dynamic llms.txt — Phase 3, Slice 3c

**Status:** Draft (pending approval)
**Version:** 0.1
**Related decisions:** 001–013, P-03 (per-page metadata), P-04 (indexability), P-05 (direct DAL reads), Principle VII (bilingual)
**Related slices:** 3a (per-page metadata correctness — this slice reuses its computed values), 3b (sitemap + robots + `INDEXING_ENABLED` gating pattern), 005 (`/api/image` — cover images), 006/007 (article/project content)
**Authoritative audit:** `docs/phase-3-seo-extract.md` (§6 AEO surfaces — JSON-LD and `llms.txt` confirmed absent, hook points located)

## Overview

Third and final Phase 3 code slice. Add the AEO (Answer Engine Optimization) surfaces that make the site's content citable by AI answer engines: JSON-LD structured data (`Organization` site-wide, `Article` on article detail pages, a case-study structured type on project detail pages) and a dynamic `llms.txt` (a curated header plus an auto-generated index of published content). Both reuse the now-correct metadata and DAL reads established in 3a/3b, are bilingual-aware, and are gated for staging safety. No schema change, no migration.

This is the payoff of the AEO decision folded into Phase 3: 3b told AI crawlers they're welcome and where the sitemap is; 3c gives them the machine-readable structure and content index that make the site's expertise citable.

## Problem statement

The audit (§6) confirmed zero JSON-LD/`schema.org` anywhere in the codebase, no `llms.txt`, and located the exact hook points for each. Without structured data, search and AI engines must infer the meaning of each page from prose alone; with it, an article is explicitly an `Article` with a headline, date, and publisher, and the organization is explicitly identified — which is what answer engines use to attribute and cite. `llms.txt` is an emerging convention giving AI agents a clean, plain-text index of the site's content.

## Decisions settled before this spec (do not reopen)

- **JSON-LD scope is FULL**: `Organization` (site-wide) + `Article` (article detail pages) + a case-study structured type (project detail pages). All three (operator decision).
- **`llms.txt` is DYNAMIC**: a hand-written curated header (org name, one-line description, primary-language note) plus an auto-generated list of published articles and projects with titles + absolute URLs, both languages (operator decision).
- Both surfaces are **gated by `INDEXING_ENABLED`** (same staging-safety invariant as the sitemap): neither advertises content on a `noindex` staging deployment.
- Structured data reuses **3a's now-correct per-page metadata values** (title/description/canonical/image) — it must not recompute or inherit a generic fallback.
- Draft/unpublished detail pages (which 3a marks `noindex`) MUST NOT emit indexable structured data.
- No schema change, no migration. Uses existing DAL reads (`getPublishedArticles`, `getPortfolioSlugs`, and the article/project detail reads already used by the pages).

## User stories

### US-1 — An AI/search engine understands the organization
As an answer engine crawling any public page, I find `Organization` structured data (name, URL, logo, description) so I can correctly attribute and describe OmniflowAI when citing its content.

### US-2 — An answer engine can cite an article precisely
As an answer engine fetching a published article, I find `Article` structured data (headline, description, image, publish date, language, publisher) so I can cite the article with correct title, date, and attribution.

### US-3 — An answer engine can cite a case study precisely
As an answer engine fetching a published project (case study), I find structured data describing it (title, description, image, language, publisher) so I can reference the work accurately.

### US-4 — Drafts emit no indexable structured data
As the operator, an unpublished/draft detail page does not emit `Article`/case-study structured data that could be indexed or cited, consistent with its `noindex` treatment.

### US-5 — An AI agent gets a clean content index
As an AI agent, I can fetch `/llms.txt` and get a concise, plain-text description of the site plus a current list of its published articles and case studies (titles + absolute URLs, both languages), so I have a low-noise index of what the site offers.

### US-6 — Staging stays clean
As the operator, on a `noindex` staging deployment, `/llms.txt` does not advertise the site's content, and structured data does not promote staging pages — consistent with the sitemap's staging behavior.

## Functional requirements

### FR-1 — Organization JSON-LD (site-wide)
- FR-1.1: Every public page MUST emit `Organization` JSON-LD (via `application/ld+json` script), placed once at a site-wide level (the public layout or `SiteShell`), covering: `name`, `url` (the language-appropriate site root), `logo`, and a `description`.
- FR-1.2: The Organization block MUST be language-aware — the EN pages reference the EN root/description, the AR pages the AR root/description (`inLanguage` set appropriately).
- FR-1.3: It MUST NOT be emitted on admin or API routes (those are not public and are `noindex`).

### FR-2 — Article JSON-LD (article detail)
- FR-2.1: A published article detail page (`/articles/[slug]`, both languages) MUST emit `Article` JSON-LD including at least: `headline` (the article title), `description` (the excerpt/meta description), `image` (the absolute cover-image URL — the same `/api/image/{id}` value 3a uses for OG), `datePublished` (from `published_at`), `inLanguage`, and `publisher` (referencing the Organization).
- FR-2.2: These values MUST come from the same source the page's `generateMetadata` already computes (3a) — no divergent recomputation, no generic fallback.
- FR-2.3: The canonical `url`/`mainEntityOfPage` MUST be the article's real current-language URL.

### FR-3 — Case-study JSON-LD (project detail)
- FR-3.1: A project detail page (`/portfolio/[slug]`, both languages) MUST emit structured data describing the case study — at minimum: a title, description, `image` (absolute cover URL), `inLanguage`, and `publisher` (the Organization). The exact `schema.org` type best fitting a portfolio case study (`CreativeWork` vs `Article` vs another) is selected during `/plan` against current schema.org / Google rich-results guidance.
- FR-3.2: Values MUST come from the project detail read the page already performs and the metadata 3a computes — no divergent recomputation.

### FR-4 — Draft/unpublished safety
- FR-4.1: An unpublished/draft article, or a not-found detail page, MUST NOT emit `Article`/case-study structured data. This reuses the same published/not-found determination the page's `generateMetadata` already makes for the `noindex` branch (3a) — structured data is emitted only on the published/happy path.

### FR-5 — Dynamic llms.txt
- FR-5.1: Add an `/llms.txt` route (Next.js file-convention route or route handler) serving `text/plain` (or markdown) content.
- FR-5.2: In production-indexable mode, `/llms.txt` MUST contain: a curated header (organization name, a one-line description of what OmniflowAI does, and a note on the primary/available languages), followed by an auto-generated list of published articles and projects — each as a title + absolute URL — in both languages, read directly from existing DAL functions (`getPublishedArticles`, `getPortfolioSlugs`).
- FR-5.3: The absolute URLs MUST be built off `siteUrl` (same base as sitemap/canonical) and MUST be the real per-language article slugs and shared project slugs (resolvable — as fixed in 3a and the slug-routing fix).
- FR-5.4: `/llms.txt` MUST read the DB directly (P-05), no intermediate API layer.

### FR-6 — llms.txt staging gate
- FR-6.1: On a `noindex` staging deployment (`INDEXING_ENABLED` unset), `/llms.txt` MUST NOT advertise the site's content — mirroring the sitemap gate (either empty/minimal, or the curated header with no content list). The exact staging shape is a `/plan` decision, but the invariant is: a `noindex` staging deployment never publishes a populated content index via `llms.txt`.
- FR-6.2: In production-indexable mode (`INDEXING_ENABLED=true`), `/llms.txt` is fully populated per FR-5.

### FR-7 — No regressions / no schema change
- FR-7.1: No existing public route's rendering, canonical/hreflang/OG metadata, or the sitemap/robots behavior from 3a/3b is changed by this slice. 3c adds JSON-LD script blocks and one new `/llms.txt` route.
- FR-7.2: No existing table/column/index/constraint is modified. No migration is generated.
- FR-7.3: The JSON-LD additions MUST NOT alter the visible rendered page (they are non-visual `<script type="application/ld+json">` blocks).

### FR-8 — Quality gate
- FR-8.1: `npm run check`, `npm run lint`, `npm run build` MUST all pass with zero errors.

## Out of scope (other phases)

- **Flipping `INDEXING_ENABLED=true`** — cutover action (Phase 4/5).
- **Logging gaps, Neon flakiness, `after()`-on-Autoscale** — Phase 3c-adjacent *empirical* checks done against a real Replit deploy, tracked separately; not code in this slice.
- **`BreadcrumbList`, `FAQ`, `WebSite`/sitelinks-searchbox, or other additional schema types** — this slice ships Organization + Article + case-study only; further types are a later enhancement if warranted.
- **A brand OG image asset, AR footer headings** — tracked elsewhere.
- **Legacy id→slug redirects** — Phase 4.
- **Content rewriting for AEO (question-led headings, etc.)** — a content task, not this code slice; this slice provides the structured-data layer, not the prose.

## Assumptions (settled by the audit — do not reopen)

- Zero JSON-LD/`schema.org` and no `llms.txt` exist today (`docs/phase-3-seo-extract.md` §6). Hook points: JSON-LD site-wide → public layout/`SiteShell`; per-page → the two `[slug]` detail pages (which already load the `article`/`project` object); `llms.txt` → a new file-convention route analogous to `robots.ts`.
- 3a made per-page metadata correct (title/description/canonical/OG image, article hreflang) and added `noindex` on drafts — 3c reuses those computed values and the same published/not-found determination.
- `siteUrl = env.BETTER_AUTH_URL` is the absolute-URL base; `INDEXING_ENABLED` gates staging vs production (read directly from `process.env`).
- Existing DAL reads expose everything needed: `getPublishedArticles(language)` (title, slug, publishedAt, coverImage), `getPortfolioSlugs()`, and the article/project detail reads the pages already call.
- Article slugs (incl. Arabic-script) resolve correctly as of the slug-routing fix — so `llms.txt` and structured-data URLs point to real pages.

## Acceptance criteria

1. **AC-1:** Every public page (both languages) emits valid `Organization` JSON-LD with name/url/logo/description and correct `inLanguage`; admin/API routes do not.
2. **AC-2:** A published article detail page (both languages) emits valid `Article` JSON-LD with headline, description, absolute image URL, `datePublished`, `inLanguage`, and publisher — values matching what the page's own metadata computes (no generic fallback).
3. **AC-3:** A published project detail page (both languages) emits valid case-study structured data (title, description, absolute image URL, `inLanguage`, publisher).
4. **AC-4:** An unpublished/draft article or not-found detail page emits NO `Article`/case-study structured data.
5. **AC-5:** All emitted JSON-LD validates (well-formed JSON, correct `@context`/`@type`) — spot-checked with a structured-data validator or by parsing the `application/ld+json` blocks.
6. **AC-6:** In production mode, `GET /llms.txt` returns the curated header plus a current list of published articles and projects (titles + absolute URLs, both languages), and every listed URL resolves to 200 (incl. an Arabic-script article URL).
7. **AC-7:** In staging mode (`INDEXING_ENABLED` unset), `/llms.txt` does not advertise the site's content (empty/header-only per the `/plan` decision), and structured data does not promote staging content beyond what the noindex deployment already suppresses.
8. **AC-8:** No existing public route's rendering/metadata/canonical/hreflang, and no sitemap/robots behavior, changed; the JSON-LD blocks are non-visual. `npm run check`/`lint`/`build` exit zero; no migration produced and no existing schema object modified (zero-diff on `schema.ts`/`drizzle/`).

## Notes for `/plan` (mechanism details deferred)

- The exact `schema.org` type for project case studies (FR-3.1) — `CreativeWork` vs `Article` vs another — chosen against current schema.org / Google rich-results guidance.
- How the JSON-LD blocks reuse the values `generateMetadata` already computes without duplicating the computation (a shared helper that both `generateMetadata` and the page body call, or a small structured-data builder fed the same inputs) — and where the site-wide Organization block is emitted (public layout vs `SiteShell`) for both language roots.
- The `/llms.txt` route mechanism (a `route.ts` handler at `app/llms.txt/route.ts`, or another file-convention approach) and its `INDEXING_ENABLED` staging shape (empty vs header-only).
- Whether the Organization `logo` references an existing asset or the (deferred) brand image — if no logo asset exists, `/plan` decides a defensible interim (omit `logo`, or use an existing image) without pulling the brand-asset task into scope.
- How AC-6/AC-7's llms.txt behavior is verified via the local two-mode production build (mirroring 3b), without toggling the flag on staging.
