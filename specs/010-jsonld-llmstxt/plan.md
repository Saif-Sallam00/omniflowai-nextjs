# Implementation Plan: JSON-LD Structured Data + Dynamic llms.txt

**Branch**: `010-jsonld-llmstxt` | **Date**: 2026-09-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/010-jsonld-llmstxt/spec.md`, authoritative slice source `docs/jsonld-llmstxt-slice-spec.md`, grounding audit `docs/phase-3-seo-extract.md` (§6)

## Summary

Add `Organization` JSON-LD once site-wide (emitted from `SiteShell`, language-aware, absent on admin/API), `Article` JSON-LD on published article detail pages, and `CreativeWork` JSON-LD on project detail pages — all three reusing the exact fields and URL-building utility `generateMetadata` already computes, so structured data can never diverge from a page's own metadata. Draft/not-found detail pages emit no `Article`/`CreativeWork` block, reusing the same published/not-found check `generateMetadata` already makes. Add a new `GET /llms.txt` route: a curated header plus an auto-generated bilingual list of published articles and projects in production mode, header-only in staging mode (same `INDEXING_ENABLED` gate pattern as Slice 3b's sitemap). No schema change, no new API layer, no flip of `INDEXING_ENABLED`.

## Technical Context

**Language/Version**: TypeScript (strict), Next.js 16.3.1 (App Router, Server Components + Route Handlers)

**Primary Dependencies**: None new — reuses existing DAL functions (`getArticleBySlug`, `getPortfolioDetailBySlug`, `getPublishedArticles`, `getPortfolioListItems`) and the existing `lib/metadata.ts`/`lib/site.ts`/`lib/language.ts` utilities

**Storage**: Existing Postgres (Neon) tables `articles`, `projects`, `project_translations` — read-only, via existing exported DAL functions; no schema change, no migration

**Testing**: Manual verification via local two-mode production build (`npm run build && npm run start`, with and without `INDEXING_ENABLED=true`) per [quickstart.md](./quickstart.md); `npm run check`, `npm run lint` as the existing quality gate — no new automated test infrastructure (matches FR-8's scope: quality-gate commands, not new test suites)

**Target Platform**: Replit Autoscale (`next build` / `next start`), same as the rest of the app

**Project Type**: Web application (Next.js App Router, single repo) — this slice touches detail-page components, one shared layout component, one new module, and one new route

**Performance Goals**: N/A beyond existing defaults — the two detail pages are already `revalidate = 3600` cached; JSON-LD adds a small amount of server-rendered markup with no new data fetches (reuses the already-cached DAL call). `/llms.txt` is a new Route Handler with no special caching requirement stated.

**Constraints**: No schema change, no migration; JSON-LD must not alter visible rendered output (FR-018); structured data must never diverge from `generateMetadata`'s computed values (FR-005/FR-008); `/llms.txt` gated by `INDEXING_ENABLED` exactly like `sitemap.xml`/`robots.txt`; `INDEXING_ENABLED` not flipped; no logging code touched.

**Scale/Scope**: Small, additive edits to 4 existing files (2 detail pages × 2 languages... actually 4 page files: EN/AR article detail, EN/AR portfolio detail) + `components/site-shell.tsx` + `lib/metadata.ts` (1 new export) + 1 new file `lib/structured-data.ts` + 1 new route `app/llms.txt/route.ts`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle / Constraint | Assessment |
|---|---|
| **P-03 — Per-page metadata, extended to structured data** | ✅ This slice is a direct extension of P-03's intent: every public page already ships per-page title/description/canonical/OG (3a); this slice adds the structured-data equivalent, built from the *same* computed values (research.md §2), never a generic fallback. |
| **P-04 — Indexability signalling correct, drafts suppressed** | ✅ Draft/unpublished/not-found detail pages emit no `Article`/`CreativeWork` block (FR-009), reusing the exact same published/not-found determination already driving those pages' `noindex` metadata branch — no second suppression mechanism introduced. `/llms.txt` is gated by `INDEXING_ENABLED` the same way `sitemap.xml`/`robots.txt` already are. |
| **P-05 — One database, direct access, no JSON API layer** | ✅ `app/llms.txt/route.ts` reads `getPublishedArticles`/`getPortfolioListItems` directly; the JSON-LD builders read the same already-fetched `article`/`project` objects the pages already hold — no intermediate API route introduced anywhere. |
| **Schema frozen for this slice** (Migration Constraints / FR-017) | ✅ Zero new DAL functions; `getPortfolioListItems(language)` (pre-existing) is substituted for `getPortfolioSlugs()` in the one place `llms.txt` needs titles, not a new query. Zero-diff on `schema.ts`/`drizzle/` is a stated acceptance check (AC-8 / quickstart Part C). |
| **Staging-safe-by-default** (Deployment & Ops, Core Principle V spirit) | ✅ `INDEXING_ENABLED` is not flipped by this slice. `/llms.txt`'s content list is absent when the flag is unset (research.md §6); structured data's own suppression is orthogonal to the flag and governed by publish status, so no combination of flag state + draft content can advertise unpublished/staging content. |
| **Core Principle VII — Bilingual by architecture** | ✅ The Organization block is language-aware per FR-002 (EN root/description on EN pages, AR on AR); Article/CreativeWork blocks carry `inLanguage` matching the page's own language constant; `/llms.txt` lists both languages' articles and projects symmetrically. |
| **Core Principle IV — Scope Discipline** | ✅ Mechanism choices (case-study `@type`, shared-value builder, Organization emission point, logo omission, `/llms.txt` route + staging shape, verification approach) were resolved in research.md strictly against the settled spec. Out-of-scope items (`BreadcrumbList`/`FAQ`/`WebSite` schema, brand asset creation, AEO content rewriting, flipping the flag) are untouched. |
| **Verify Before Declaring Done** (Core Principle III) | ✅ Quality gate reused as-is: `npm run check`, `npm run lint`, `npm run build` (FR-8.1), plus the quickstart's local two-mode production-build verification for AC-1..AC-8. |

**Result**: PASS — no violations, no entries needed in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/010-jsonld-llmstxt/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── structured-data-and-llms.md
└── tasks.md             # Phase 2 output (/speckit-tasks — not created by this command)
```

### Source Code (repository root)

```text
lib/
├── structured-data.ts     # NEW — buildArticleJsonLd, buildCaseStudyJsonLd (research.md §2)
└── metadata.ts             # EDIT — export the existing (currently private) buildAbsoluteUrl

components/
└── site-shell.tsx          # EDIT — emit Organization JSON-LD, language-aware (research.md §3)

app/
├── llms.txt/
│   └── route.ts             # NEW — GET handler, INDEXING_ENABLED-gated (research.md §5, §6)
├── (en)/(public)/articles/[slug]/page.tsx    # EDIT — render Article JSON-LD when published
├── ar/(public)/articles/[slug]/page.tsx      # EDIT — render Article JSON-LD when published
├── (en)/(public)/portfolio/[slug]/page.tsx   # EDIT — render CreativeWork JSON-LD
└── ar/(public)/portfolio/[slug]/page.tsx     # EDIT — render CreativeWork JSON-LD

lib/db/
├── articles.ts              # UNCHANGED — getArticleBySlug already exists, reused as-is
└── portfolio.ts             # UNCHANGED — getPortfolioDetailBySlug, getPortfolioListItems already exist, reused as-is
```

**Structure Decision**: No new directories except the `app/llms.txt/` route segment. This is a 3-new-file (`lib/structured-data.ts`, `app/llms.txt/route.ts`, plus this feature's docs), 6-edited-file change (`lib/metadata.ts`, `components/site-shell.tsx`, 4 detail-page files) entirely within the existing App Router structure, consuming only DAL functions and helpers that already exist and are already used elsewhere in the codebase for the same underlying data. No client-side code, no new database access patterns, no new route segments beyond the single `/llms.txt` path.

## Complexity Tracking

*No violations — table intentionally empty.*
