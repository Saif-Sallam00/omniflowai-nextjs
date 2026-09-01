# Implementation Plan: Sitemap + Production Robots

**Branch**: `009-sitemap-robots` | **Date**: 2026-09-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-sitemap-robots/spec.md`, authoritative slice source `docs/sitemap-robots-slice-spec.md`, grounding audit `docs/phase-3-seo-extract.md` (§4, §5, §6)

## Summary

Add a dynamic `app/sitemap.ts` that lists every public URL (static pages, published articles, projects — both languages) via existing DAL reads, gated so a noindex staging deployment never publishes a populated sitemap. Extend `app/robots.ts`'s production-mode branch to reference that sitemap and explicitly allow named AI crawlers, while leaving its staging branch and the existing generic rule untouched. Extend `next.config.ts`'s `headers()` production branch to set `X-Robots-Tag: noindex` on `/admin/*` and `/api/*` only, while leaving its staging branch untouched. No schema change, no new API layer, no flip of `INDEXING_ENABLED`.

## Technical Context

**Language/Version**: TypeScript (strict), Next.js 16.3.1 (App Router, file-convention routes)

**Primary Dependencies**: `drizzle-orm` (existing DAL functions only, no new queries beyond what's already exported), Next.js's built-in `MetadataRoute.Sitemap` / `MetadataRoute.Robots` types — no new dependency added

**Storage**: Existing Postgres (Neon) tables `articles`, `projects`, `project_translations` — read-only, via existing exported DAL functions (`getPublishedArticles`, `getPortfolioSlugs`); no schema change, no migration

**Testing**: Manual verification via local production build (`npm run build && npm run start`) per [quickstart.md](./quickstart.md); `npm run check` (tsc), `npm run lint` (eslint) as the existing quality gate — no new automated test infrastructure introduced for this slice (matches the source spec's FR-6 scope: quality-gate commands, not new test suites)

**Target Platform**: Replit Autoscale (`next build` / `next start`), same as the rest of the app

**Project Type**: Web application (Next.js App Router, single repo) — this slice touches only root-level file-convention routes and config, no new directories

**Performance Goals**: N/A beyond existing Next.js caching defaults — `sitemap.ts` and `robots.ts` remain cached Route Handlers (no request-time API used), consistent with current behavior

**Constraints**: No schema change, no migration (P-05/no-DB-write); staging deindex behavior must remain byte-for-byte unchanged (FR-4.2, FR-5.1); `INDEXING_ENABLED` is not flipped by this slice; no logging code touched

**Scale/Scope**: Small, additive edits to 2 existing files (`app/robots.ts`, `next.config.ts`) + 1 new file (`app/sitemap.ts`); no new DAL functions (see [research.md](./research.md) §2)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle / Constraint | Assessment |
|---|---|
| **P-04 — Indexability signalling correct** (Rendering & Data) | ✅ Directly satisfied: this slice is exactly "sitemap and robots.txt exist and are correct" per P-04's own wording. Production mode gets a populated sitemap + AI-crawler-aware robots + a hardened `/admin`/`/api` header; staging mode's existing noindex signalling is preserved unchanged. |
| **P-05 — One database, direct access, no JSON API layer** | ✅ `app/sitemap.ts` reads `getPublishedArticles`/`getPortfolioSlugs` directly (Route Handler-equivalent file convention, same tier as a Server Component for this purpose) — no intermediate API route introduced. FR-1.6 requires exactly this. |
| **Schema frozen for this slice** (Migration Constraints / FR-018) | ✅ No new DAL function added (research.md §2 — omit project `lastmod` rather than add a read); zero-diff on `schema.ts`/`drizzle/` is a stated acceptance check (AC-7 / quickstart Part C). |
| **Staging-safe-by-default** (Deployment & Ops, Core Principle V spirit) | ✅ `INDEXING_ENABLED` is not flipped by this slice (explicitly out of scope per FR — cutover action). Staging's existing blanket noindex header, `Disallow: /` robots, and (new) empty sitemap all remain the default when the flag is unset. |
| **Core Principle V — URL Preservation** | ✅ The sitemap only *lists* URLs that already resolve today (per Slice 3a + the Arabic-slug fix); it does not introduce, rename, or redirect any URL. No route's path changes. |
| **Core Principle IV — Scope Discipline** | ✅ Mechanism choices (sitemap gate, project `lastmod`, AI-crawler token set, `headers()` structure, local verification approach) were resolved in research.md against the settled spec, not expanded beyond it. Logging gaps and JSON-LD/`llms.txt` (Slice 3c) are explicitly out of scope and untouched. |
| **Verify Before Declaring Done** (Core Principle III) | ✅ Quality gate reused as-is: `npm run check`, `npm run lint`, `npm run build` (FR-6.1), plus the quickstart's local production-build verification for AC-1..AC-6 (no automated test framework change needed for this slice's scope). |

**Result**: PASS — no violations, no entries needed in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/009-sitemap-robots/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── crawler-endpoints.md
└── tasks.md             # Phase 2 output (/speckit-tasks — not created by this command)
```

### Source Code (repository root)

```text
app/
├── sitemap.ts            # NEW — Next.js sitemap file convention, produces /sitemap.xml
└── robots.ts              # EDIT — add sitemap reference + AI-crawler rules in production branch only

next.config.ts             # EDIT — headers() production branch: /admin/* and /api/* get X-Robots-Tag: noindex

lib/db/
├── articles.ts             # UNCHANGED — getPublishedArticles(language) already exists, reused as-is
└── portfolio.ts            # UNCHANGED — getPortfolioSlugs() already exists, reused as-is

lib/site.ts                 # UNCHANGED — siteUrl already exported, reused as-is
lib/language.ts             # UNCHANGED — getLanguagePath already exists, reused for both-language URL expansion
```

**Structure Decision**: No new directories. This is a 1-new-file, 2-edited-file change entirely within the existing Next.js App Router file-convention surface (`app/sitemap.ts`, `app/robots.ts`) and root config (`next.config.ts`), consuming only DAL functions and helpers that already exist and are already used elsewhere in the codebase for the same purpose (canonical/hreflang URL building). No client-side code, no new route segments, no new database access patterns.

## Complexity Tracking

*No violations — table intentionally empty.*
