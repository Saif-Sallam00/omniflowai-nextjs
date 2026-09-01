# Implementation Plan: SEO Metadata Correctness + Article Slug-Pairing Fix + OG Images

**Branch**: `008-seo-metadata-correctness` | **Date**: 2026-09-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/008-seo-metadata-correctness/spec.md`

## Summary

Phase 3, Slice 3a. Fixes one real correctness bug (article hreflang/language-switcher assumes EN and AR slugs are identical, but articles are actually linked by `translation_group_id` with independent per-language slugs — `lib/metadata.ts:19-20`, `components/language-switcher.tsx:30`) and closes one uniform gap (no page emits an Open Graph image, `lib/metadata.ts:33-37`), plus marks unpublished/draft detail pages `noindex` and removes leftover "Foundation"/"Phase 0" placeholder copy from the root layout fallback metadata. This is a read-side and metadata-only change: one new public DAL read (`getPublishedCounterpartSlug` in `lib/db/articles.ts`), two new optional parameters on the single shared `buildPageMetadata` builder (`lib/metadata.ts`), edits to the two detail pages' `generateMetadata`, one new small client Context to carry the server-resolved counterpart to the client-side language switcher, and a copy fix on the two root layouts. No schema change, no migration, no change to static-page or project hreflang behavior (both already correct).

## Technical Context

**Language/Version**: TypeScript (strict mode), Next.js 16.3.1, React 19.2.8

**Primary Dependencies**: Drizzle ORM 0.45.2 (existing `lib/db/articles.ts`/`lib/db/portfolio.ts` DAL pattern), Zod 4.4.3 (env validation only, unaffected), React `cache()` (existing dedup pattern used by every read in `lib/db/articles.ts`)

**Storage**: PostgreSQL (Neon) via the existing `articles` and `projects`/`project_translations` tables — read-only for this feature, no schema change

**Testing**: Manual verification via `quickstart.md` scenarios against rendered HTML `<head>` output and the language switcher UI; project has no existing automated test suite for metadata output, and this slice does not introduce one (no automated-test requirement was specified in the source spec beyond the `npm run check`/`lint`/`build` quality gate)

**Target Platform**: Next.js Server Components rendering on Replit Autoscale (unchanged deployment target)

**Project Type**: Web application (Next.js App Router, single repo) — this feature touches `lib/db/`, `lib/`, two route segments under `app/(en)/(public)/` + `app/ar/(public)/`, and `components/`

**Performance Goals**: No new performance target — the new DAL read adds at most one additional indexed query per article-detail request (deduped via `cache()` between `generateMetadata` and the page body, per `research.md` §1), consistent with the existing per-request query budget for that route

**Constraints**: No schema change, no migration (FR-013/AC-8); `buildPageMetadata`'s signature growth limited to exactly two new optional parameters (operator-pinned); static-page and project hreflang output must be byte-for-byte unchanged (FR-004/FR-007/AC-6)

**Scale/Scope**: Two route files' `generateMetadata` (article, project detail, both EN+AR — 4 files), one DAL file, one shared metadata builder, one client component + one new context file, two root layout files. No new routes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design below.*

| Principle / Constraint | Assessment |
|---|---|
| **P-03 — every public page ships per-page metadata** | Already satisfied for all routes (confirmed by prior audit); this feature does not weaken it — it corrects the *cross-language linking* of that metadata for articles and adds the missing OG image field. **PASS** |
| **P-04 — HTTP responses correctly signal indexability; draft/private content returns `noindex`** | Currently a gap for article/project detail pages (no `robots` directive on unpublished/not-found). This feature closes it (FR-5, AC-5). **PASS (feature directly implements this gate)** |
| **Principle VII — Bilingual by architecture; every public page emits correct hreflang alternates in the initial HTTP response** | Currently violated for articles with differing slugs (the bug this feature fixes) — hreflang is server-rendered in `generateMetadata` today and remains so; the fix stays entirely within `generateMetadata`/`buildPageMetadata`, no client-only fallback is introduced for the crawler-facing signal. **PASS (feature directly implements this gate)** |
| **Schema frozen for this slice (constitution: Database / Migrations — commit migrations only when schema changes)** | No table/column/index/constraint is added, changed, or removed; `translation_group_id` already exists and is only newly *selected*. No `drizzle-kit generate` output expected. **PASS** |
| **Standing rule 002 — URL Preservation as default** | No public URL is added, removed, or redirected by this feature. The fix changes which URL a *hreflang alternate* and a *switcher navigation* point to (correcting a broken pointer to a real one) — it does not change any page's own canonical URL. This is corrective, not a URL change requiring an exception entry. **PASS** |
| **P-05 — direct DB access from Server Components, no JSON API layer** | The new read (`getPublishedCounterpartSlug`) is a direct Drizzle query called from `generateMetadata`/the page body (Server Components), following the exact pattern of every existing read in `lib/db/articles.ts`. **PASS** |
| **Scope Discipline (Principle IV)** | Sitemap, robots.txt, JSON-LD/llms.txt, structured-logging gaps, the OG default asset, legacy redirects, and AR footer copy are all explicitly out of scope per the source spec and are not touched here. **PASS** |

No violations requiring justification — Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/008-seo-metadata-correctness/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md         # Phase 1 output
├── contracts/
│   └── metadata-contract.md
└── tasks.md              # Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
lib/
├── db/
│   └── articles.ts                    # + getPublishedCounterpartSlug; Article type + getArticleBySlug gain translationGroupId
├── metadata.ts                        # PageMetadataInput + buildPageMetadata gain languageAlternates / imageUrl
└── language-alternate-context.tsx     # NEW — client Context + provider for the switcher override

components/
├── site-shell.tsx                     # wraps SiteHeader + {children} in <LanguageAlternateProvider>
├── language-switcher.tsx              # reads the context; naive fallback unchanged for non-article pages
└── article-language-alternate.tsx     # NEW — tiny client component; publishes the resolved counterpart href on mount

app/
├── (en)/
│   ├── layout.tsx                     # root fallback metadata copy fixed
│   └── (public)/
│       ├── articles/[slug]/page.tsx   # generateMetadata resolves counterpart, passes languageAlternates + imageUrl + robots; renders <ArticleLanguageAlternate>
│       └── portfolio/[slug]/page.tsx  # generateMetadata passes imageUrl + robots (not-found branch only)
└── ar/
    ├── layout.tsx                     # root fallback metadata copy fixed (AR)
    └── (public)/
        ├── articles/[slug]/page.tsx   # AR mirror of the EN article-detail change
        └── portfolio/[slug]/page.tsx  # AR mirror of the EN project-detail change
```

**Structure Decision**: Single Next.js App Router project (no separate frontend/backend split — matches every prior slice in this repo). Changes are additive within the existing flat `lib/db/<entity>.ts` DAL convention and the existing `lib/metadata.ts` single-builder convention; no new top-level directory is introduced except the two small new files under `lib/` and `components/` needed for the switcher-override mechanism (research.md §3).

## Complexity Tracking

*No Constitution Check violations — this table is intentionally empty.*
