---
description: "Task list for Slice 5.5 — Brand Assets, Default OG Image, Organization JSON-LD"
---

# Tasks: Brand Assets, Default OG Image, Organization JSON-LD

**Input**: Design documents from `/specs/013-brand-assets-og-jsonld/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md (all present)

**Branch**: This project is master-only (per operator instruction at Gate 2/3) — no feature branch is created or assumed for this slice; all tasks apply directly against `master`.

**Tests**: No automated test tasks are included — the source spec and plan verify this feature by direct inspection (view-source, curl, browser) per quickstart.md, consistent with how the existing 4 detail-page JSON-LD emissions were verified. This was not requested as TDD.

**Citation key**: Every task cites the spec.md identifier(s) it satisfies (`FR-001`–`FR-013`, `SC-001`–`SC-006`, or `User Story N scenario M`). A task with no spec.md-derived requirement (the quality gate) says so explicitly instead of inventing a citation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3) — omitted for Setup/Foundational/Polish tasks

---

## Phase 1: Setup

**Purpose**: Capture the pre-change baseline needed for the User Story 1 no-regression comparison later.

- [ ] T001 [P] Capture the current `og:image` value (via `curl -s <url> | grep -oE '<meta property="og:image" content="[^"]*"'`) for all 4 existing detail pages — one EN article, one AR article, one EN portfolio item, one AR portfolio item — and save the four values for later comparison. Supports the FR-003/SC-002 no-regression check (quickstart.md step 2). No code changes in this task.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Pure-addition constants that User Stories 1, 2, and 3 all build on. No existing behavior changes yet.

**⚠️ CRITICAL**: Must complete before any User Story phase begins.

- [ ] T002 [P] Add `DEFAULT_OG_IMAGE_PATH = "/og-default.png"` and `LOGO_PATH = "/logo.png"` as named exported constants in `lib/site.ts`, alongside the existing `siteUrl` export. Do not modify `siteUrl` or its `BETTER_AUTH_URL` derivation. (FR-001)
- [ ] T003 [P] Add an `ogLocale: "en_US" | "ar_AR"` field to the `LanguageConfig` type and to each entry of `LANGUAGES` in `lib/language.ts` (`en` → `"en_US"`, `ar` → `"ar_AR"`). No existing field on `LanguageConfig`/`LANGUAGES` is renamed or removed. (FR-005)

**Checkpoint**: Shared constants exist; nothing observable has changed yet.

---

## Phase 3: User Story 1 - Shared links show a real preview image (Priority: P1) 🎯 MVP

**Goal**: Static pages (home, about, contact, services/solutions, articles list, portfolio list) produce a real Open Graph/Twitter preview image instead of a blank card; existing per-item images on detail pages are unaffected.

**Independent Test**: quickstart.md steps 1–2 — view-source a static page and confirm the default image with dimensions; view-source a detail page and confirm its own image is unchanged from the T001 baseline.

### Implementation for User Story 1

- [ ] T004 [US1] In `lib/metadata.ts`, change `buildPageMetadata` so that when `imageUrl` is absent, `openGraph.images` resolves to `[{ url: buildAbsoluteUrl(DEFAULT_OG_IMAGE_PATH), width: 1200, height: 630 }]` and `twitter.images` resolves to `[buildAbsoluteUrl(DEFAULT_OG_IMAGE_PATH)]`. When `imageUrl` IS supplied, the existing behavior and shape (`openGraph.images: [{ url }]`, `twitter.images: [url]`, no forced width/height) must be byte-for-byte unchanged. Depends on: T002. (FR-002, FR-003, FR-004)
- [ ] T005 [US1] Run quickstart.md step 1 against the EN and AR home, about, contact, solutions, articles-list, and portfolio-list pages. Confirm `og:image` is the absolute default image URL, `og:image:width` = 1200, `og:image:height` = 630, and `twitter:image` is set, on every one of them. Depends on: T004. (FR-002, FR-004, SC-001)
- [ ] T006 [US1] Run quickstart.md step 2 against the same 4 detail pages captured in T001 (EN article, AR article, EN portfolio, AR portfolio). Confirm each page's current `og:image` value is identical to its T001 baseline value — zero regression. Depends on: T001, T004. (FR-003, SC-002)

**Checkpoint**: User Story 1 is fully functional and independently verified. This alone is shippable as the MVP.

---

## Phase 4: User Story 2 - Search engines and platforms recognize the organization behind the site (Priority: P2)

**Goal**: Both home pages emit a standalone Organization JSON-LD entity (with logo), and the existing nested `publisher` reference on the 4 detail pages resolves to the same entity via a shared `@id`.

**Independent Test**: quickstart.md steps 3–4 — view-source both home pages for the Organization block; view-source a detail page and confirm its `publisher.@id` matches.

### Implementation for User Story 2

- [ ] T007 [US2] In `lib/structured-data.ts`, add `const ORGANIZATION_ID = \`${siteUrl}/#organization\`;` (importing `siteUrl` from `lib/site.ts`) and add `"@id": ORGANIZATION_ID` to the object `ORGANIZATION_REF` returns, keeping its existing `@type`, `name`, and `url` fields unchanged. No change to `ORGANIZATION_REF`'s signature or its two existing call sites (`buildArticleJsonLd`, `buildCaseStudyJsonLd`). (FR-006, FR-009)
- [ ] T008 [US2] In `lib/structured-data.ts`, add and export `buildOrganizationJsonLd(language: Language)` returning `{ "@context": "https://schema.org", "@type": "Organization", "@id": ORGANIZATION_ID, name: "OmniflowAI", url: buildAbsoluteUrl(getLanguagePath("/", language)), logo: { "@type": "ImageObject", url: buildAbsoluteUrl(LOGO_PATH), width: 512, height: 512 } }`. Depends on: T002, T007. (FR-007)
- [ ] T009 [P] [US2] In `app/(en)/(public)/page.tsx`, embed `buildOrganizationJsonLd("en")` in a new `<script type="application/ld+json">`, matching the existing emission pattern used on `app/(en)/(public)/articles/[slug]/page.tsx`. Depends on: T008. (FR-008)
- [ ] T010 [P] [US2] In `app/ar/(public)/page.tsx`, embed `buildOrganizationJsonLd("ar")` in a new `<script type="application/ld+json">`, matching the existing pattern. Depends on: T008. (FR-008)
- [ ] T011 [US2] Run quickstart.md step 3 on both home pages. Confirm each emits an `"@type": "Organization"` block with a `logo` `ImageObject` (`url`, `width: 512`, `height: 512`) and an `"@id"` of the form `<siteUrl>/#organization` — identical string on both pages. Depends on: T009, T010. (FR-007, FR-008, SC-003)
- [ ] T012 [US2] Run quickstart.md step 4 on one EN and one AR published article detail page. Confirm the existing `publisher."@id"` matches the `"@id"` observed in T011. Depends on: T007, T011. (FR-009, SC-004)

**Checkpoint**: User Story 2 is fully functional and independently verified, and does not depend on User Story 1 or 3.

---

## Phase 5: User Story 3 - Pages show correct icons and richer social metadata in both languages (Priority: P3)

**Goal**: Browser tab icon confirmed under both root layouts; additive `siteName`/`type`/`locale`/`alternateLocale` Open Graph fields on home page output, with `og:type` correctly differentiated for article detail pages.

**Independent Test**: quickstart.md steps 5–6 — open an EN and an AR page in a real browser and observe the tab icon; view-source both home pages for the additive OG fields.

### Implementation for User Story 3

- [ ] T013 [US3] In `lib/metadata.ts`, add an optional `ogType?: "website" | "article"` field to `PageMetadataInput` (default `"website"` when omitted), and set `openGraph.siteName = "OmniflowAI"`, `openGraph.type = ogType ?? "website"`, `openGraph.locale = LANGUAGES[language].ogLocale`, `openGraph.alternateLocale = LANGUAGES[otherLanguage].ogLocale` unconditionally. Depends on: T003, T004 (edits the same function as T004; sequenced after it to avoid rework on the same lines). (FR-005, resolved ambiguity in plan.md)
- [ ] T014 [P] [US3] At the existing `buildPageMetadata` call site in `app/(en)/(public)/articles/[slug]/page.tsx` (currently `lib/metadata.ts`-facing call around line 89's `generateMetadata`), pass `ogType: "article"`. Depends on: T013. (FR-005, resolved ambiguity)
- [ ] T015 [P] [US3] At the existing `buildPageMetadata` call site in `app/ar/(public)/articles/[slug]/page.tsx`, pass `ogType: "article"`. Depends on: T013. (FR-005, resolved ambiguity)
- [ ] T016 [US3] Run quickstart.md step 6 on both home pages. Confirm `og:site_name` = `"OmniflowAI"` on both, `og:type` = `"website"` on both, and `og:locale` differs (`en_US` on EN, `ar_AR` on AR). Depends on: T013. (FR-005, User Story 3 scenarios 3–4)
- [ ] T017 [US3] Spot-check one EN and one AR portfolio detail page: confirm `og:type` is still `"website"` (unaffected by T014/T015), and spot-check the EN and AR article detail pages touched in T014/T015: confirm `og:type` is now `"article"`. Depends on: T013, T014, T015. (FR-005 resolved ambiguity; no regression alongside SC-002's intent)
- [ ] T018 [US3] **Browser-verified** (curl/build/lint output is NOT sufficient for this task): open a page under `app/(en)/` (e.g. `/about`) and a page under `app/ar/` (e.g. `/ar/about`) in an actual browser and visually confirm the site icon renders in the browser tab for both. No code dependency — `app/icon.png`/`app/apple-icon.png` already exist; this task is pure observation. (FR-010, FR-011, SC-005, User Story 3 scenarios 1–2)
- [ ] T019 **CONDITIONAL / GATING** [US3] Evaluate T018's two observations. If the icon renders under BOTH layouts: no action, proceed. If it renders under only one (either direction): STOP — do not duplicate `app/icon.png`/`app/apple-icon.png` into a route-group-local path, and do not add a manual `<link rel="icon">` tag (forbidden outright by FR-011). Report the exact discrepancy (which layout failed, what was observed) to the operator and wait for direction; this task contains no remedy of its own. Depends on: T018. (plan.md "Contingency: icon resolution fails under one root layout"; FR-011)
- [ ] T020 [US3] Filesystem assertion, no code change: run `test ! -f app/favicon.ico && echo "OK: no app/favicon.ico"` and confirm it prints OK. This only verifies the exclusion holds — it must never be "fixed" by creating the file. (FR-012)
- [ ] T021 [P] [US3] Reachability check: `curl -I` each of `/icon.png`, `/apple-icon.png`, `/og-default.png`, `/logo.png` against a running instance and confirm all four return `200` with an `image/*` content type. No code dependency — all four files already exist and are committed. (FR-013)

**Checkpoint**: All three user stories are independently functional and verified.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Whole-feature gates that span all three user stories.

- [ ] T022 Run `npm run check`, `npm run lint`, and `npm run build`; confirm all three exit zero. This is a constitution-level gate (Principle III, "Verify Before Declaring Done") — it is not itself a spec.md FR/SC citation, and per the operator's standing note, a green result here does NOT substitute for T018's browser verification or T006/T012/T017's inspection tasks. Depends on: T004, T007, T008, T009, T010, T013, T014, T015.
- [ ] T023 Diff the full set of files changed against plan.md's Project Structure list (`lib/site.ts`, `lib/language.ts`, `lib/metadata.ts`, `lib/structured-data.ts`, `app/(en)/(public)/page.tsx`, `app/ar/(public)/page.tsx`, `app/(en)/(public)/articles/[slug]/page.tsx`, `app/ar/(public)/articles/[slug]/page.tsx`). Confirm no other file changed — no image asset touched, `app/favicon.ico` not created, `lib/site.ts`'s `siteUrl` export and `BETTER_AUTH_URL` coupling unchanged, the three missing `/services/*` pages untouched. Depends on: all prior tasks. (SC-006)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: No dependencies on Setup; can run in parallel with Phase 1. BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2 (T002). Independent of US2 and US3's own tasks, but T013 (US3) is sequenced after T004 (US1) because both edit `buildPageMetadata`.
- **User Story 2 (Phase 4)**: Depends on Phase 2 (T002). Fully independent of US1 and US3 — touches `lib/structured-data.ts` and the two home pages only.
- **User Story 3 (Phase 5)**: Depends on Phase 2 (T003) and on US1's T004 (same function in `lib/metadata.ts`). T018–T021 (icon/asset verification) have no code dependency and can run at any time.
- **Polish (Phase 6)**: Depends on all implementation tasks across all three stories.

### Parallel Opportunities

- T002 and T003 (Foundational) — different files.
- T009 and T010 (US2, home page embeds) — different files.
- T014 and T015 (US3, article page call sites) — different files.
- T001 (Setup) can run alongside Phase 2.
- T018, T020, T021 (US3 verification) have no code dependency and can run any time after the relevant assets/files are confirmed to exist (they already do).

---

## Parallel Example: Foundational Phase

```bash
Task: "Add DEFAULT_OG_IMAGE_PATH and LOGO_PATH constants to lib/site.ts"
Task: "Add ogLocale field to LANGUAGES in lib/language.ts"
```

## Parallel Example: User Story 2

```bash
Task: "Embed buildOrganizationJsonLd(\"en\") on app/(en)/(public)/page.tsx"
Task: "Embed buildOrganizationJsonLd(\"ar\") on app/ar/(public)/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (T001) and Phase 2 (T002–T003).
2. Complete Phase 3 (T004–T006) — User Story 1.
3. **STOP and VALIDATE**: quickstart.md steps 1–2 pass.
4. This alone closes the highest-impact gap (blank social preview cards) and can ship independently.

### Incremental Delivery

1. Setup + Foundational → constants exist, nothing observable changed.
2. User Story 1 → default OG image ships (MVP).
3. User Story 2 → Organization JSON-LD ships (independent of US1).
4. User Story 3 → icon confirmation + additive OG fields ship (depends on US1's `buildPageMetadata` edit landing first).
5. Polish → quality gate + drift check, run once after all three stories are in.

### Notes

- No new dependencies are introduced anywhere in this task list.
- No task creates `app/favicon.ico`, modifies `lib/site.ts`'s `siteUrl` export or the `BETTER_AUTH_URL` coupling, touches the three missing `/services/*` detail pages, or creates/moves/modifies any image asset.
- T018 and T019 exist specifically because a green quality gate has previously missed real defects on this project (12 dead `/services/*` hrefs, a React key collision) — do not treat `npm run build`/lint/check as sufficient evidence for icon rendering.
