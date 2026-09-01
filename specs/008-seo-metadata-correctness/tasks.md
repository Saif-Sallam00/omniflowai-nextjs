---

description: "Task list for SEO Metadata Correctness + Article Slug-Pairing Fix + OG Images (Phase 3, Slice 3a)"
---

# Tasks: SEO Metadata Correctness + Article Slug-Pairing Fix + OG Images

**Input**: Design documents from `specs/008-seo-metadata-correctness/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/metadata-contract.md](./contracts/metadata-contract.md), [quickstart.md](./quickstart.md)

**Tests**: No automated test suite exists for metadata output in this project and none was requested in the source spec. Verification tasks below are manual, mapped 1:1 to `quickstart.md`'s scenarios and the spec's AC-1..AC-8 — they are marked as tasks (not skipped) because the source spec's FR-8.1/AC-8 quality gate is non-negotiable.

**Organization**: Tasks are grouped by user story (from `spec.md`) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US5, per `spec.md`)
- Every task includes exact file path(s)

## Path Conventions

Single Next.js App Router project at the repo root (no `src/`, no separate frontend/backend — matches `plan.md`'s Structure Decision). EN routes live under `app/(en)/`, AR routes under `app/ar/`; both mirror each other file-for-file.

---

## Phase 1: Setup

**Purpose**: Establish a verifiable pre-change baseline so the non-regression checks in Polish (T031) have something concrete to diff against.

- [X] T001 [P] Record the current rendered `alternates.languages`/`alternates.canonical` output (via dev server + view-source) for one static page (e.g. `/about`, `/ar/about`) and one project detail page (e.g. `/portfolio/<any-existing-slug>`, `/ar/portfolio/<same-slug>`) into a scratch note — this is the "before" snapshot for the FR-004/FR-007/AC-6 non-regression check later. No repo files are modified by this task.
- [X] T002 Confirm the quality gate passes on `master`/the feature branch before any change: run `npm run check`, `npm run lint`, `npm run build` and confirm all three exit zero, establishing a clean starting point per the constitution's Quality Gate Non-Negotiability clause.

**Checkpoint**: Baseline captured, starting point verified clean.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared infrastructure that User Stories 1, 2, and 4 all build on. **US3 and US5 do not depend on this phase** and may be done in any order relative to it — but completing Foundational first is the simplest sequencing since it touches the same core files (`lib/db/articles.ts`, `lib/metadata.ts`) that later stories also edit.

**⚠️ CRITICAL**: Do not start US1, US2, or US4 until this phase is complete.

- [X] T003 In `lib/db/articles.ts`, add `translationGroupId: string` to the exported `Article` type (currently `lib/db/articles.ts:15-25`) and add `translationGroupId: articles.translationGroupId` to `getArticleBySlug`'s select list (currently `lib/db/articles.ts:53-73`). This is a code/type-only change — the `translation_group_id` column already exists in the schema; no migration, no schema edit.
- [X] T004 In `lib/db/articles.ts`, add a new export `getPublishedCounterpartSlug`, wrapped in React `cache()` (same import already used in this file), with signature `(translationGroupId: string, targetLanguage: Language): Promise<string | null>`. It MUST query `articles` filtered by `eq(articles.translationGroupId, translationGroupId)`, `eq(articles.language, targetLanguage)`, and `eq(articles.published, true)`, select only `slug`, `limit(1)`, and return `rows[0]?.slug ?? null` — so an unpublished-only counterpart or a nonexistent counterpart both resolve to `null`. Match the existing style of `getPublishedArticleSlugs` in the same file.
- [X] T005 [P] In `lib/metadata.ts`, extend `PageMetadataInput` with two new optional fields — `languageAlternates?: { en: string | null; ar: string | null }` and `imageUrl?: string` — and update `buildPageMetadata`'s body: (a) when `languageAlternates` is provided, build the `en`/`ar` absolute URLs from its paths via the existing `buildAbsoluteUrl` helper instead of `getLanguagePath`, omitting a language's key entirely from `alternates.languages` when its value is `null`, and setting `x-default` to the `en` URL if `languageAlternates.en !== null`, else the `ar` URL; (b) when `languageAlternates` is absent, keep the current `getLanguagePath`-based `enUrl`/`arUrl`/`x-default` computation byte-for-byte unchanged (this is the path every static page and both project-detail pages continue to use); (c) when `imageUrl` is provided, absolutize it via `buildAbsoluteUrl` and set it as `openGraph.images` (an array with one `{ url }` entry) and as `twitter.images` (an array with the same absolute URL string); when `imageUrl` is absent, emit no `images` key on either object, matching current behavior exactly.
- [X] T006 [P] Create `lib/language-alternate-context.tsx` (new file, `"use client"`): export a React Context whose value shape is `{ override: string | null | undefined; setOverride: (v: string | null | undefined) => void }`, and export a `LanguageAlternateProvider` component that holds `useState<string | null | undefined>(undefined)` and provides `{ override, setOverride }`. Also export a `useLanguageAlternate()` hook for consumers to read `{ override, setOverride }` via `useContext`.
- [X] T007 In `components/site-shell.tsx`, import `LanguageAlternateProvider` from `lib/language-alternate-context.tsx` and wrap the existing rendered tree (the header plus `{children}`) in it, so both `SiteHeader` and the page content share the same provider instance. Depends on T006.

**Checkpoint**: `lib/db/articles.ts` and `lib/metadata.ts` are ready for US1/US4 to consume; the context plumbing is ready for US2 to consume.

---

## Phase 3: User Story 1 - A crawler gets correct article language alternates (Priority: P1) 🎯 MVP

**Goal**: Article `generateMetadata` emits real counterpart URLs (or omits the alternate when none exists) instead of a naive same-slug guess.

**Independent Test**: Publish an article in both languages with deliberately different slugs; view-source both pages and confirm each `hreflang` alternate points to the other's real slug. Publish a single-language article; confirm no alternate is emitted for the missing language and `x-default` points to the language that exists.

### Implementation for User Story 1

- [X] T008 [US1] In `app/(en)/(public)/articles/[slug]/page.tsx`'s `generateMetadata` (published branch, `:47-52`), after loading `article` via `getArticleBySlug(slug, LANGUAGE)`, call `getPublishedCounterpartSlug(article.translationGroupId, "ar")` and build `languageAlternates: { en: \`/articles/${slug}\`, ar: counterpartSlug ? \`/articles/${counterpartSlug}\` : null }`, passing it into the existing `buildPageMetadata` call.
- [X] T009 [US1] Mirror T008 in `app/ar/(public)/articles/[slug]/page.tsx`'s `generateMetadata`: resolve the `"en"` counterpart via `getPublishedCounterpartSlug(article.translationGroupId, "en")`, and build `languageAlternates: { en: counterpartSlug ? \`/articles/${counterpartSlug}\` : null, ar: \`/articles/${slug}\` }`.
- [X] T010 [US1] Verify AC-1 and AC-2 per `quickstart.md` Scenarios 1 and 2: for a published article with differing EN/AR slugs, confirm both pages' `hreflang` alternates resolve to the real counterpart; for a single-language published article, confirm the missing language's alternate is absent from the rendered `<head>` and `x-default` points to the language that exists.

**Checkpoint**: User Story 1 is fully functional and independently testable — crawler-facing hreflang correctness is fixed.

---

## Phase 4: User Story 2 - A bilingual visitor can switch language without a broken page (Priority: P1)

**Goal**: The client-side language switcher navigates article visitors to the real counterpart, or to that language's article list when no counterpart exists — never to a 404.

**Independent Test**: On a published article with a differing counterpart slug, click the switcher and confirm it lands on the correct translated article. On a single-language article, click the switcher and confirm it does not produce a "not found" page. On a static page, confirm the switcher's original behavior is unchanged.

### Implementation for User Story 2

- [X] T011 [US2] Create `components/article-language-alternate.tsx` (new file, `"use client"`): a component accepting one prop, `href: string | null`, that calls `useLanguageAlternate()` (from `lib/language-alternate-context.tsx`) and, in a `useEffect`, calls `setOverride(href)` on mount and `setOverride(undefined)` in the effect's cleanup function (so unmounting — i.e. navigating away — always resets the override). It renders nothing (`return null`).
- [X] T012 [US2] In `app/(en)/(public)/articles/[slug]/page.tsx`'s page body (`ArticleDetailPage`), after loading `article`, call `getPublishedCounterpartSlug(article.translationGroupId, "ar")` (same cache()-wrapped function as T008 — do not introduce a second implementation) and render `<ArticleLanguageAlternate href={counterpartSlug ? getLanguagePath(\`/articles/${counterpartSlug}\`, "ar") : null} />` once, near the top of the returned JSX.
- [X] T013 [US2] Mirror T012 in `app/ar/(public)/articles/[slug]/page.tsx`'s page body, resolving the `"en"` counterpart and building the EN href via `getLanguagePath(..., "en")`.
- [X] T014 [US2] Update `components/language-switcher.tsx` to call `useLanguageAlternate()` and branch on `override`: `undefined` → keep today's exact `getCounterpartPath(getAgnosticPath(pathname), language)` computation (no change to this branch's logic); a string → use it directly as `href`; `null` → set `href` to `getLanguagePath("/articles", otherLanguage)` (routes to that language's article list).
- [X] T015 [US2] Verify the context reset (no leaked override): with the override set on an article page (e.g. the single-language article from US1's test), navigate via a non-switcher link to a different route (e.g. `/about`) and confirm the switcher on that page uses the naive `undefined`-branch behavior, not a stale override from the article page.
- [X] T016 [US2] Verify the dedup requirement: confirm `generateMetadata` (T008/T009) and the page body (T012/T013) resolve the same `getPublishedCounterpartSlug(translationGroupId, targetLanguage)` call to a single database round-trip per request (React `cache()` dedup) — inspect query logs or a request waterfall in dev mode to confirm no duplicate query for identical arguments within one request.
- [X] T017 [US2] Verify AC-3 per `quickstart.md` Scenario 3: switcher on a differing-slug article lands on the correct translation; switcher on a single-language article lands on that language's article list (not a 404); switcher on a static page (e.g. `/about`) is unchanged from pre-feature behavior.

**Checkpoint**: User Stories 1 AND 2 both work independently — the full hreflang + switcher bug is closed.

---

## Phase 5: User Story 3 - Drafts are never indexed (Priority: P1)

**Goal**: Unpublished/draft article and not-found project detail pages emit a `noindex` signal; published pages do not.

**Independent Test**: Request an unpublished article's (or a nonexistent project's) metadata and confirm it is marked not indexable; confirm a published article/project of the same type is not.

### Implementation for User Story 3

- [X] T018 [P] [US3] In `app/(en)/(public)/articles/[slug]/page.tsx`'s `generateMetadata`, in the existing `if (!article || !article.published)` branch (`:38-45`), change the return to `return { ...buildPageMetadata({...}), robots: { index: false, follow: false } };`, reusing the `article` value already looked up in this same function — no additional query.
- [X] T019 [P] [US3] Mirror T018 in `app/ar/(public)/articles/[slug]/page.tsx`'s `generateMetadata`.
- [X] T020 [P] [US3] In `app/(en)/(public)/portfolio/[slug]/page.tsx`'s `generateMetadata`, in the existing `if (!project)` branch (`:33-40`), change the return to `return { ...buildPageMetadata({...}), robots: { index: false, follow: false } };`, reusing the `project` value already looked up in this same function.
- [X] T021 [P] [US3] Mirror T020 in `app/ar/(public)/portfolio/[slug]/page.tsx`'s `generateMetadata`.
- [X] T022 [US3] Verify AC-5 per `quickstart.md` Scenario 5: as a signed-in admin, preview an unpublished draft article and confirm `<meta name="robots" content="noindex, nofollow">` is present; confirm a published article and a published project do not carry it; confirm a nonexistent project slug's metadata also carries it.

**Checkpoint**: User Stories 1, 2, and 3 (all P1) are complete — this is the full correctness-critical scope of the slice.

---

## Phase 6: User Story 4 - A social/AEO scraper gets an image (Priority: P2)

**Goal**: Article and project detail pages emit a working `og:image`/Twitter image built from the item's existing cover image.

**Independent Test**: Fetch a published article/project detail page's metadata and confirm the declared preview image URL resolves to that item's actual cover image bytes.

### Implementation for User Story 4

- [X] T023 [P] [US4] In `app/(en)/(public)/articles/[slug]/page.tsx`'s `generateMetadata` (published branch), add `imageUrl: article.coverImage` to the `buildPageMetadata` call.
- [X] T024 [P] [US4] Mirror T023 in `app/ar/(public)/articles/[slug]/page.tsx`'s `generateMetadata`.
- [X] T025 [P] [US4] In `app/(en)/(public)/portfolio/[slug]/page.tsx`'s `generateMetadata` (found branch), add `imageUrl: project.coverImage` to the `buildPageMetadata` call.
- [X] T026 [P] [US4] Mirror T025 in `app/ar/(public)/portfolio/[slug]/page.tsx`'s `generateMetadata`.
- [X] T027 [US4] Verify AC-4 per `quickstart.md` Scenario 4: for one published article and one project (both languages), confirm `og:image`/`twitter:image` in the rendered `<head>` is an absolute URL, and that fetching it directly (e.g. `curl -I <url>`) returns a 200 with image bytes matching the item's cover image.

**Checkpoint**: All P1 and P2 stories complete.

---

## Phase 7: User Story 5 - Site metadata has no leftover placeholder copy (Priority: P3)

**Goal**: The root layout fallback metadata no longer contains Phase-0 placeholder text.

**Independent Test**: Inspect `app/(en)/layout.tsx` and `app/ar/layout.tsx`'s `metadata` exports and confirm real site copy, not placeholder wording.

### Implementation for User Story 5

- [X] T028 [P] [US5] In `app/(en)/layout.tsx`, replace `title: "OmniflowAI — Foundation"` / `description: "Phase 0 foundation deployment."` (`:6-9`) with real site-wide default copy (e.g. a title of `"OmniflowAI"` and a one-line company description consistent with the copy already used elsewhere, such as the public layout's `"OmniflowAI — AI-powered solutions."`).
- [X] T029 [P] [US5] In `app/ar/layout.tsx`, replace the Arabic placeholder equivalent with a real Arabic site-wide default, consistent in tone with the existing AR public-layout copy.
- [X] T030 [US5] Verify AC-7: `grep -rn "Foundation\|Phase 0" app/(en)/layout.tsx app/ar/layout.tsx` returns no matches.

**Checkpoint**: All five user stories complete.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final gates that span every story, per FR-7 and FR-8.1 / AC-6 / AC-8.

- [X] T031 Non-regression check (FR-004/FR-007/AC-6): re-inspect the same static page and project detail page recorded in T001's baseline; confirm `alternates.languages`/`alternates.canonical` output is byte-for-byte unchanged (the project detail page's `openGraph.images` is expected to now be present per US4 — only the hreflang/canonical fields must match the baseline exactly).
- [X] T032 Zero-drift gate (FR-013/AC-8): run `git diff --stat -- lib/db/schema.ts drizzle/` from the repo root and confirm the output is empty — no schema or migration file was touched by this slice.
- [X] T033 Quality gate (FR-8.1/AC-8): run `npm run check`, `npm run lint`, `npm run build` and confirm all three exit zero.
- [X] T034 Full `quickstart.md` walkthrough: execute all 8 scenarios end-to-end in order and confirm every one passes as described.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion. **Blocks US1, US2, and US4** (T008–T009, T011–T017, T023–T026 all rely on T003–T007). Does **not** block US3 or US5, which touch entirely separate code paths (`robots` spread at existing branches; root layout copy) and may be done in any order relative to Phase 2.
- **User Stories (Phase 3–7)**: US1/US2/US4 require Phase 2. US3/US5 require only Phase 1 (or nothing beyond the repo itself).
- **Polish (Phase 8)**: Depends on every user story phase you choose to include being complete (T031 in particular depends on US4's OG-image work having landed on the project page, since it deliberately excludes that field from the "unchanged" comparison).

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational (T003–T005). No dependency on US2–US5.
- **US2 (P1)**: Depends on Foundational (T003, T004, T006, T007). Reuses the same `getPublishedCounterpartSlug` call pattern introduced by US1 but does not require US1's `generateMetadata` edits to already exist — the two can be built in either order as long as Foundational is done first. Independently testable per its own Independent Test.
- **US3 (P1)**: No dependency on Foundational, US1, US2, or US4. Fully independent.
- **US4 (P2)**: Depends on Foundational (T005 — the `imageUrl` param). No dependency on US1–US3.
- **US5 (P3)**: No dependency on any other phase. Fully independent.

### Within Each User Story

- US1: T008 and T009 touch different files and can run in parallel; T010 (verification) depends on both.
- US2: T011 (new component) has no dependency; T012/T013 depend on T011 existing; T014 (switcher) depends on T006's context existing (Foundational) but not on T012/T013; T015–T017 (verification) depend on T011–T014 all being done.
- US3: T018–T021 touch four different files and are all parallel; T022 (verification) depends on all four.
- US4: T023–T026 touch four different files and are all parallel; T027 (verification) depends on all four.
- US5: T028–T029 touch different files and are parallel; T030 (verification) depends on both.

### Parallel Opportunities

- T001 has no file-write dependency and can be done alongside T002.
- T005 and T006 (different files: `lib/metadata.ts` vs `lib/language-alternate-context.tsx`) can run in parallel; T003/T004 (both edit `lib/db/articles.ts`) should be done sequentially in that order to avoid conflicting edits to the same file.
- Once Foundational is complete, US1, US3, US4, and US5 can all be worked in parallel by different people (US2 depends only on Foundational too, but shares conceptual context with US1 since both resolve the same counterpart — no file conflict, still parallelizable).
- Within US1, US3, US4, and US5, the EN/AR mirror tasks (e.g. T008+T009, T018+T019+T020+T021, T023+T024+T025+T026, T028+T029) are always parallel — they touch different files.

---

## Parallel Example: User Story 3

```bash
# All four call-site edits touch different files — run together:
Task: "Add noindex robots to app/(en)/(public)/articles/[slug]/page.tsx generateMetadata's unpublished branch"
Task: "Add noindex robots to app/ar/(public)/articles/[slug]/page.tsx generateMetadata's unpublished branch"
Task: "Add noindex robots to app/(en)/(public)/portfolio/[slug]/page.tsx generateMetadata's not-found branch"
Task: "Add noindex robots to app/ar/(public)/portfolio/[slug]/page.tsx generateMetadata's not-found branch"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational).
2. Complete Phase 3 (US1) — the crawler-facing hreflang fix alone is independently valuable and testable.
3. **STOP and VALIDATE**: run T010's verification against a real differing-slug article before continuing.

### Recommended Full-Correctness Increment

Because US1, US2, and US3 are all P1 and together close the entire root-cause bug plus the indexability gap the source spec treats as one correctness slice, deliver them together before moving to US4 (P2, additive) and US5 (P3, cosmetic):

1. Setup → Foundational → US1 → US2 → US3 → validate the full correctness scope.
2. Add US4 (OG images) → validate independently.
3. Add US5 (placeholder copy) → validate independently.
4. Run Phase 8 (Polish) once, at the end, covering the whole slice.

### Parallel Team Strategy

With multiple developers: complete Setup + Foundational together first (Foundational is a hard blocker for 3 of 5 stories). Then one developer takes US1+US2 (they share the counterpart-resolution call and touch the same four page files), a second takes US3 (fully independent), a third takes US4 and US5 (both fully independent, low-risk). Reconvene for Phase 8 once all chosen stories are done.
