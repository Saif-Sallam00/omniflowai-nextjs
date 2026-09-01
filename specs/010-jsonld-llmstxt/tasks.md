---

description: "Task list for JSON-LD Structured Data + Dynamic llms.txt (Phase 3, Slice 3c)"
---

# Tasks: JSON-LD Structured Data + Dynamic llms.txt

**Input**: Design documents from `/specs/010-jsonld-llmstxt/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/structured-data-and-llms.md](./contracts/structured-data-and-llms.md), [quickstart.md](./quickstart.md)

**Tests**: No automated test tasks — the spec's own quality gate (FR-8.1/FR-019) is `npm run check` / `npm run lint` / `npm run build`, and correctness is proven via the local two-mode production-build verification in [quickstart.md](./quickstart.md), per research.md §7. No test framework changes are in scope for this slice.

**Organization**: Tasks are grouped by user story (US1–US6 from spec.md), in priority order (P1 stories first, then P2), except where a later story's verification genuinely depends on an earlier-numbered-but-lower-priority story's implementation existing first (US5 before US6 — see Dependencies).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US6)
- Every task names its exact file path

## Non-negotiables (pinned from research.md / plan.md — do not reopen)

1. `lib/structured-data.ts` builders compute from the SAME raw fields `generateMetadata` already passes to `buildPageMetadata`, using the SAME exported `buildAbsoluteUrl` — no second URL-concatenation implementation. Case-study `@type` = `CreativeWork`.
2. The page body calls the builder with the SAME `cache()`-deduped DAL object `generateMetadata` already reads. `generateMetadata` itself is NOT modified.
3. Article/CreativeWork JSON-LD is emitted only on the published/found path — articles gate on `article.published`, projects gate on project-exists (no `published` column on `projects`) — reusing the exact branch already driving the page's `noindex` metadata, no second determination.
4. Organization JSON-LD is emitted once in `components/site-shell.tsx`, language-aware via the existing `language` prop, absent on admin/API by construction. `logo` is OMITTED.
5. `app/llms.txt/route.ts` is a plain `GET` handler, NOT wrapped in `withRequestLogging`/`withErrorHandling`. Production mode: header + articles (`getPublishedArticles`) + projects via `getPortfolioListItems` (title-bearing — NOT `getPortfolioSlugs`). Staging mode: header ONLY.
6. JSON-LD blocks are non-visual. No schema change, no migration, `INDEXING_ENABLED` never flipped, no logging code touched.

---

## Phase 1: Setup

**Purpose**: Confirm the local environment can run the two-mode production-build verification this feature depends on, with data covering every case this slice's acceptance criteria exercise.

- [x] T001 Confirm `.env.local` has every var `lib/env.ts` requires, and that the database has: at least one published article per language (including one with an Arabic-script AR slug, for the llms.txt URL-resolvability check), at least one unpublished/draft article, and at least one project. No file changes; this is a readiness check only.

**Checkpoint**: Local production builds (with and without `INDEXING_ENABLED=true`) are known to work against data covering every case (published/draft/not-found, both languages) before any code is written.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the two shared prerequisites every other story needs — a single exported URL-building utility (so no story can accidentally reimplement URL concatenation), and the `/llms.txt` route's skeleton with its staging-safety gate in place from its very first version.

**⚠️ CRITICAL**: T002 must be complete before any task in US1, US2, US3, or US5. T003 must be complete before any task in US5 or US6.

- [x] T002 [P] In `lib/metadata.ts`, change `function buildAbsoluteUrl(path: string): string` from a private (unexported) function to `export function buildAbsoluteUrl(path: string): string` — no change to its implementation. This is the single utility every structured-data builder and `llms.txt` will use for absolute URLs, matching what `buildPageMetadata` already uses internally.
- [x] T003 [P] Create `app/llms.txt/route.ts`: `export async function GET()` (no `withRequestLogging`/`withErrorHandling` wrapper — research.md §5). Define a curated header string (organization name "OmniflowAI", a one-line description reusing the same description text already in `app/(en)/(public)/layout.tsx`'s/`app/ar/(public)/layout.tsx`'s `<meta description>` for each language, and a note that the site is available in English and Arabic). If `process.env.INDEXING_ENABLED !== "true"`, return a `Response` with `Content-Type: text/plain` containing ONLY the header (research.md §6 — this is what makes staging's header-only response self-enforcing from day one). If `INDEXING_ENABLED === "true"`, return the same header for now (a placeholder — US5 fills in the content list).

**Checkpoint**: `buildAbsoluteUrl` is available to every downstream task; `app/llms.txt/route.ts` exists, compiles, and already satisfies US6's core invariant (header-only unless indexing is enabled) even before content population is added.

---

## Phase 3: User Story 1 - An AI/search engine understands the organization (Priority: P1) 🎯 MVP

**Goal**: Every public page (both languages) emits `Organization` JSON-LD; admin/API routes emit none.

**Independent Test**: Local build, request any public page in either language and confirm valid `Organization` JSON-LD; request an admin route and confirm none.

### Implementation for User Story 1

- [x] T004 [US1] In `components/site-shell.tsx`, inside `SiteShell` (above the `return`), build the Organization JSON-LD object: `{ "@context": "https://schema.org", "@type": "Organization", name: "OmniflowAI", url: buildAbsoluteUrl(getLanguagePath("/", language)), description: <the language's existing curated description>, inLanguage: language }` (no `logo` field — research.md §4). Import `buildAbsoluteUrl` from `@/lib/metadata`.
- [x] T005 [US1] In `components/site-shell.tsx`'s returned JSX, render `<script type="application/ld+json">{JSON.stringify(organizationJsonLd)}</script>` once, inside the existing `<LanguageAlternateProvider>` wrapper (or immediately adjacent to it) — since `SiteShell` is the single component both `(en)/(public)/layout.tsx` and `ar/(public)/layout.tsx` render, this single addition covers both language roots and every public page under them.
- [x] T006 [US1] Local verification: `npm run build && npm run start &`. Run `curl -s http://localhost:3000/ | grep -o '"@type":"Organization"'` (expect: found), `curl -s http://localhost:3000/ar | grep -o '"@type":"Organization"'` (expect: found), `curl -s http://localhost:3000/admin | grep -c 'application/ld+json'` (expect: `0`). Stop the server afterward.

**Checkpoint**: `Organization` JSON-LD is live on every public page and correctly absent from admin. User Story 1 is independently testable and shippable on its own.

---

## Phase 4: User Story 2 - An answer engine can cite an article precisely (Priority: P1)

**Goal**: A published article detail page (both languages) emits `Article` JSON-LD whose values match the page's own metadata exactly.

**Independent Test**: Local build, request a published article detail page in either language, confirm `Article` JSON-LD with headline/description/image/date matching the page's own `<title>`/meta description/OG image.

### Implementation for User Story 2

- [x] T007 [US2] Create `lib/structured-data.ts`. Export `buildArticleJsonLd(article: { title: string; excerpt: string; coverImage: string; publishedAt: Date | null; slug: string }, language: Language)`. Import `buildAbsoluteUrl` from `@/lib/metadata` and `getLanguagePath` from `@/lib/language`. Return `{ "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.excerpt, image: buildAbsoluteUrl(article.coverImage), ...(article.publishedAt ? { datePublished: article.publishedAt.toISOString() } : {}), inLanguage: language, url: buildAbsoluteUrl(getLanguagePath(\`/articles/${article.slug}\`, language)), mainEntityOfPage: buildAbsoluteUrl(getLanguagePath(\`/articles/${article.slug}\`, language)), publisher: { "@type": "Organization", name: "OmniflowAI", url: buildAbsoluteUrl(getLanguagePath("/", language)) } }` — every field sourced from the same raw values `generateMetadata` in the same page file already passes to `buildPageMetadata` (title→headline, excerpt→description, coverImage→image, via the identical `buildAbsoluteUrl`/`getLanguagePath` utilities).
- [x] T008 [US2] In `app/(en)/(public)/articles/[slug]/page.tsx`'s default-exported page component, inside the existing `if (article.published)` path (i.e., only when the page is NOT the draft-preview/not-found path — the same `article.published` value already gating the page's own `noindex` metadata branch), call `buildArticleJsonLd(article, "en")` and render `<script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>` within the returned JSX. Do NOT modify `generateMetadata` in this file.
- [x] T009 [P] [US2] Apply the identical change to `app/ar/(public)/articles/[slug]/page.tsx`, calling `buildArticleJsonLd(article, "ar")` under the same `article.published` condition. Do NOT modify `generateMetadata` in this file.
- [x] T010 [US2] Local verification: `npm run build && npm run start &`. `curl -s http://localhost:3000/articles/<published-slug> | grep -o '<script type="application/ld+json">[^<]*</script>'`, confirm the block includes `"@type":"Article"`, `headline`, `description`, an absolute `image` URL, `datePublished`, `inLanguage:"en"`, `publisher` — and that `headline`/`description`/`image` match the page's own `<title>`/meta description/OG image byte-for-byte. Repeat for an `/ar/articles/<slug>` published article. Stop the server afterward.

**Checkpoint**: Published articles in both languages emit correct, non-divergent `Article` JSON-LD.

---

## Phase 5: User Story 3 - An answer engine can cite a case study precisely (Priority: P1)

**Goal**: A project detail page (both languages) emits `CreativeWork` (case-study) JSON-LD whose values match the page's own metadata exactly.

**Independent Test**: Local build, request a project detail page in either language, confirm `CreativeWork` JSON-LD with title/description/image/language/publisher matching the page's own metadata.

### Implementation for User Story 3

- [x] T011 [US3] In `lib/structured-data.ts`, export `buildCaseStudyJsonLd(project: { title: string; description: string; coverImage: string }, slug: string, language: Language)`. Return `{ "@context": "https://schema.org", "@type": "CreativeWork", name: project.title, description: project.description, image: buildAbsoluteUrl(project.coverImage), inLanguage: language, url: buildAbsoluteUrl(getLanguagePath(\`/portfolio/${slug}\`, language)), publisher: { "@type": "Organization", name: "OmniflowAI", url: buildAbsoluteUrl(getLanguagePath("/", language)) } }` — every field sourced from the same raw values `generateMetadata` already passes to `buildPageMetadata` for this page (title→name, description→description, coverImage→image), via the identical shared utilities. `@type` is `CreativeWork` per research.md §1 — do not use `Article` here.
- [x] T012 [US3] In `app/(en)/(public)/portfolio/[slug]/page.tsx`'s default-exported page component, immediately after the existing `if (!project) notFound();` line (i.e., only on the found path — projects have no `published` column, so "found" is the only gate, matching what `generateMetadata`'s not-found branch already checks), call `buildCaseStudyJsonLd(project, slug, "en")` and render `<script type="application/ld+json">{JSON.stringify(caseStudyJsonLd)}</script>` within the returned JSX. Do NOT modify `generateMetadata` in this file.
- [x] T013 [P] [US3] Apply the identical change to `app/ar/(public)/portfolio/[slug]/page.tsx`, calling `buildCaseStudyJsonLd(project, slug, "ar")` after its own `if (!project) notFound();` line. Do NOT modify `generateMetadata` in this file.
- [x] T014 [US3] Local verification: with the server still running (or restarted), `curl -s http://localhost:3000/portfolio/<slug> | grep -o '<script type="application/ld+json">[^<]*</script>'`, confirm `"@type":"CreativeWork"` with `name`, `description`, absolute `image`, `inLanguage:"en"`, `publisher` — matching the page's own metadata. Repeat for `/ar/portfolio/<slug>`. Stop the server afterward.

**Checkpoint**: US1, US2, US3 complete — every public page carries correct Organization/Article/CreativeWork structured data.

---

## Phase 6: User Story 4 - Drafts emit no indexable structured data (Priority: P1)

**Goal**: Confirm the gating already built into T008/T009 (article) and T012/T013 (project) actually holds — no `Article`/`CreativeWork` block on a draft, unpublished, or not-found detail page.

**Independent Test**: Local build, request an unpublished article and a nonexistent article/project slug, confirm no `Article`/`CreativeWork` JSON-LD is present (Organization may still be present, since it's site-wide and independent of this page's content).

### Verification for User Story 4

- [x] T015 [US4] Local verification: `npm run build && npm run start &`. `curl -s http://localhost:3000/articles/<unpublished-slug> | grep -c 'application/ld+json'` — expect exactly `1` (Organization only, rendered on the resulting 404/not-found page; no `Article` block, since an unauthenticated request to an unpublished article triggers the page's existing `notFound()` call). `curl -s http://localhost:3000/articles/<nonexistent-slug> | grep -c 'application/ld+json'` — expect `1` (Organization only). `curl -s http://localhost:3000/portfolio/<nonexistent-slug> | grep -c 'application/ld+json'` — expect `1` (Organization only). Stop the server afterward.
- [x] T016 [US4] Code-review confirmation (no code changes): re-read the exact lines added in T008, T009, T012, T013 and confirm each `buildArticleJsonLd`/`buildCaseStudyJsonLd` call sits strictly inside the same conditional as the page's own `noindex`-triggering check (`article.published` for articles; the post-`notFound()` found-path for projects) — no second, independently-written boolean was introduced. Record explicitly that the authenticated-admin draft-preview sub-case (an admin viewing an unpublished article via its own session) is NOT separately curl-verified with a simulated session — it is covered by this same code-review finding, since the identical `article.published` value gates both the page's `noindex` metadata and its JSON-LD emission (research.md §7). This is a documentation/confirmation task, not an implementation task.

**Checkpoint**: All four P1 structured-data stories (US1–US4) are complete and verified. This is a coherent, shippable increment even before `llms.txt` lands.

---

## Phase 7: User Story 5 - An AI agent gets a clean content index (Priority: P2)

**Goal**: In production mode, `/llms.txt` lists every published article and project (title + absolute URL, both languages) alongside the curated header already in place from Phase 2.

**Independent Test**: Local production build with `INDEXING_ENABLED=true`, request `/llms.txt`, confirm the header plus a full bilingual list of published articles and projects, and that listed URLs resolve.

### Implementation for User Story 5

- [x] T017 [US5] In `app/llms.txt/route.ts`'s `INDEXING_ENABLED === "true"` branch, after the header, call `getPublishedArticles("en")` and `getPublishedArticles("ar")` (imported from `@/lib/db/articles`). For each returned article and its language, append a line of the form `<title> — <buildAbsoluteUrl(getLanguagePath(\`/articles/${slug}\`, language))>` to the response body.
- [x] T018 [US5] In the same branch, call `getPortfolioListItems("en")` and `getPortfolioListItems("ar")` (imported from `@/lib/db/portfolio` — title-bearing; do NOT use `getPortfolioSlugs`, which has no title). For each returned item and its language, append a line of the form `<title> — <buildAbsoluteUrl(getLanguagePath(\`/portfolio/${slug}\`, language))>` to the response body.
- [x] T019 [US5] Local verification: `INDEXING_ENABLED=true npm run build && INDEXING_ENABLED=true npm run start &`. `curl -s http://localhost:3000/llms.txt`, confirm the header plus every published article and project, both languages, as title + absolute URL. Extract 4–5 listed URLs (including the Arabic-script article from T001's seed data) and `curl -so /dev/null -w "%{http_code}\n" "<url>"` each — expect `200` for all. Stop the server afterward.

**Checkpoint**: US1–US5 complete — `llms.txt` is fully populated and resolvable in production mode.

---

## Phase 8: User Story 6 - Staging stays clean (Priority: P1)

**Goal**: Confirm that on a noindex staging deployment, `/llms.txt` still shows header-only (now meaningfully contrasted against US5's populated production output), and that structured-data suppression (US4) already holds regardless of `INDEXING_ENABLED`.

**Independent Test**: Local build with `INDEXING_ENABLED` unset, request `/llms.txt`, confirm header-only with zero article/project lines; confirm structured-data behavior is unaffected by the flag.

### Verification for User Story 6

- [x] T020 [US6] Local verification: `npm run build && npm run start &` (no `INDEXING_ENABLED` set). `curl -s http://localhost:3000/llms.txt`, confirm the response is the curated header with zero article/project lines — no titles, no URLs beyond the header itself. Contrast directly against the T019 production-mode output to confirm the difference is exactly the content list. Stop the server afterward.
- [x] T021 [US6] With the same staging-mode server (or restarted), re-run T006's Organization checks and a subset of T015's draft/not-found checks (`curl -s http://localhost:3000/ | grep -o '"@type":"Organization"'`; `curl -s http://localhost:3000/articles/<unpublished-slug> | grep -c 'application/ld+json'`) and confirm identical results to the production-mode runs — proving structured-data presence/suppression is governed solely by publish status, never by `INDEXING_ENABLED` (research.md §6, Constitution Check). Stop the server afterward.

**Checkpoint**: All six user stories (US1–US6) are complete and independently verified.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final non-negotiable gates from the plan — confirm the change stayed exactly as scoped, Slice 3b's surfaces are untouched, and run the full quality gate + end-to-end regression pass.

- [x] T022 [P] Zero-schema-drift gate: run `git diff --stat -- lib/db/schema.ts drizzle/` and confirm it produces no output (empty diff) — no schema change, no migration, per FR-017/AC-8.
- [x] T023 [P] No-logging-code-touched gate: run `git diff --stat -- lib/logger.ts app/api/health app/api/image` and confirm it produces no output (empty diff).
- [x] T024 [P] Sitemap/robots-unchanged gate (Slice 3b regression): run `git diff --stat -- app/sitemap.ts app/robots.ts next.config.ts` and confirm it produces no output (empty diff) — this slice must not touch Slice 3b's files.
- [x] T025 Diff-scope review: run `git status --porcelain` and confirm the changed/new files are exactly `lib/metadata.ts`, `lib/structured-data.ts` (new), `components/site-shell.tsx`, `app/(en)/(public)/articles/[slug]/page.tsx`, `app/ar/(public)/articles/[slug]/page.tsx`, `app/(en)/(public)/portfolio/[slug]/page.tsx`, `app/ar/(public)/portfolio/[slug]/page.tsx`, and `app/llms.txt/route.ts` (new) — plus this feature's `specs/010-jsonld-llmstxt/` docs. Nothing else, including no `.env.local`/deployment-config changes (confirms `INDEXING_ENABLED` was never flipped anywhere persisted).
- [x] T026 Full quality gate: run `npm run check` (zero TypeScript errors), `npm run lint` (zero ESLint errors), and `npm run build` (succeeds) — FR-019/AC-8.
- [x] T027 Run the complete verification pass from [quickstart.md](./quickstart.md) Parts A, B, and C end-to-end as final signoff: JSON-LD presence/absence/well-formedness (AC-1–AC-5), llms.txt production/staging shapes (AC-6, AC-7), and the diff/quality/regression checks (AC-8, overlapping with T022–T026) — confirms the JSON-LD additions are non-visual and no existing public route's rendering, metadata, sitemap, or robots behavior changed anywhere in the process.

**Checkpoint**: Feature complete, verified against every acceptance criterion (AC-1–AC-8) and every non-negotiable, ready for review.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup. T002 (`buildAbsoluteUrl` export) BLOCKS Phases 3, 4, 5, 7 (US1, US2, US3, US5 all use it). T003 (`app/llms.txt/route.ts` skeleton) BLOCKS Phases 7 and 8 (US5, US6).
- **US1 (Phase 3)**: Depends on T002 only. Independent of US2/US3/US5/US6 — different files.
- **US2 (Phase 4)**: Depends on T002 only. Independent of US1/US3.
- **US3 (Phase 5)**: Depends on T002 only. Independent of US1/US2.
- **US4 (Phase 6)**: Depends on US2 (T008/T009) and US3 (T012/T013) being complete — it verifies gating logic those tasks already implement; adds no new implementation of its own.
- **US5 (Phase 7)**: Depends on T003 only (not on US1–US4). Sequenced after US4 here for a single-developer priority-ordered flow, but could run in parallel with US1/US2/US3 by a second developer.
- **US6 (Phase 8)**: Depends on US5 (T017/T018) being complete — its llms.txt half needs production-mode content to exist before staging's "no content" can be meaningfully contrasted against it; its structured-data half depends on US1 (T004/T005) and US4 (T015) for what it's re-confirming.
- **Polish (Phase 9)**: Depends on all six user stories being complete.

### Within Each User Story

- Phase 4 (US2): T007 (builder) → T008, T009 (page wiring, parallel) → T010 (verify).
- Phase 5 (US3): T011 (builder addition) → T012, T013 (page wiring, parallel) → T014 (verify).
- Phase 7 (US5): T017 → T018 (both edit `app/llms.txt/route.ts` — sequential, same file) → T019 (verify).

### Parallel Opportunities

- **T002 and T003** (Foundational) touch different files — safe to run in parallel.
- **T022, T023, T024** (Phase 9) are mutually independent `git diff --stat` checks against disjoint path sets — safe to run in parallel.
- **T009 depends only on T007** (not on T008) — a second developer could do the AR article page while the first does the EN article page. Same for **T013** relative to **T011**/T012.
- **US1, US2, US3** are mutually independent (different files, both gated only by T002) — a second and third developer could implement them concurrently with the first.

---

## Parallel Example: Cross-Story (multi-developer)

```bash
# After T002 and T003 (Foundational) are committed, these can run in parallel:
Task: "T004-T006 [US1] Organization JSON-LD in components/site-shell.tsx"
Task: "T007-T010 [US2] Article JSON-LD in lib/structured-data.ts + both article page files"
Task: "T011-T014 [US3] CreativeWork JSON-LD in lib/structured-data.ts + both portfolio page files"

# T015-T016 [US4] depend on T008/T009/T012/T013 all being complete.
# T017-T019 [US5] depend only on T003, can start as soon as Foundational is done.
# T020-T021 [US6] depend on T017/T018 (US5) and T004/T005 (US1) and T015 (US4).
```

---

## Implementation Strategy

### MVP First (User Stories 1–4 — all P1, structured data only)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational).
2. Complete Phase 3 (US1): Organization JSON-LD site-wide.
3. Complete Phase 4 (US2) and Phase 5 (US3): Article and CreativeWork JSON-LD.
4. Complete Phase 6 (US4): confirm draft/not-found suppression holds.
5. **STOP and VALIDATE**: at this point every public page carries correct, non-divergent structured data — a complete, shippable increment even before `llms.txt` exists.

### Incremental Delivery

1. Setup + Foundational → shared URL utility exported, `llms.txt` skeleton exists (already staging-safe).
2. US1 + US2 + US3 + US4 → full structured-data coverage, verified correct and safely suppressed on drafts (MVP).
3. US5 → `llms.txt` fully populated in production mode.
4. US6 → staging safety for `llms.txt` (and structured data) confirmed by direct contrast.
5. Polish → all non-negotiable gates (schema, logging, 3b-regression, diff-scope, quality) confirmed, full quickstart pass run.

Each increment is independently valuable: structured data alone (after step 2) already makes every page more citable; `llms.txt` (step 3) adds a second, complementary discovery surface; step 4 closes the staging-safety loop for both surfaces at once.
