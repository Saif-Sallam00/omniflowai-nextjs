---

description: "Task list for Slice 1A — Bilingual Routing Foundation"
---

# Tasks: Bilingual Routing Foundation — Slice 1A

**Input**: Design documents from `specs/002-bilingual-routing/` (spec.md, plan.md, research.md, data-model.md, contracts/http-routes.md, quickstart.md)

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/http-routes.md ✅, quickstart.md ✅ — all committed (`ce7c0ce`).

**Tests**: Not requested. Spec.md's own Testing decision (carried into plan.md's Technical Context) defers automated-test-framework adoption to a later batch. Verification is quickstart.md's manual/curl-based checks against spec.md's acceptance scenarios and success criteria, plus the existing quality gate (`tsc --noEmit`, ESLint, `next build`).

**Organization**: Tasks are grouped by user story (spec.md's US1/US2/US3, in priority order) so each can be verified independently, per spec.md's own "Independent Test" for each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1, US2, or US3 — maps to spec.md's user stories. Setup/Foundational/Polish tasks carry no story label.
- File paths are exact, relative to the repository root.

**Standing constraints on every task below** (research.md, Decision 1 — reopened and reversed): no task may call `headers()` (or any other per-request Dynamic API) in a layout to determine language, and no task touches `proxy.ts`. Both `app/(en)/layout.tsx` and `app/ar/layout.tsx` set `lang`/`dir` from a statically-imported config only.

---

## Phase 1: Setup

**Purpose**: Confirm this slice's scope boundaries before any code is written.

- [X] T001 Confirm no new `package.json` dependency and no new `.env.example`/`lib/env.ts` variable is required for this slice — re-read `research.md`'s Decision 1 (no i18n library) and Decision 2 (reuse `BETTER_AUTH_URL`, no new env var) and confirm both still hold against the current `package.json` and `.env.example`

**Checkpoint**: Scope confirmed — no dependency or environment changes are in play for this slice.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The shared `lib/` helpers, both root layouts, removal of the now-superseded Phase 0 root layout, and relocation of **every** file that layout's removal would otherwise orphan — admin and the home page alike — so Foundational ends on a fully clean `next build`, with nothing broken carried into Phase 3.

**⚠️ CRITICAL**: No user story task may begin until this phase is complete.

- [X] T002 [P] Create `lib/language.ts` — `Language` type (`"en" | "ar"`), `LanguageConfig` type (`prefix`, `dir`, `htmlLang`), the `LANGUAGES: Record<Language, LanguageConfig>` config (`en`: prefix `""`, dir `"ltr"`, htmlLang `"en"`; `ar`: prefix `"/ar"`, dir `"rtl"`, htmlLang `"ar"`), `resolveLanguageFromPathname(pathname: string): Language`, and `getCounterpartPath(path: string, language: Language): string` (data-model.md, "Language" and "URL Pair")
- [X] T003 [P] Create `lib/site.ts` — a thin accessor re-exporting `env.BETTER_AUTH_URL` as the absolute-URL base (e.g. `export const siteUrl = env.BETTER_AUTH_URL`) — no new environment variable (research.md, Decision 2)
- [X] T004 Create `lib/metadata.ts` — `buildPageMetadata(input: PageMetadataInput): Metadata`, the single reusable per-page metadata helper: absolute canonical URL, title, description, Open Graph, Twitter, and hreflang alternates (`en`, `ar`, `x-default` — `x-default` pointing at the pair's own `en` URL, not the site homepage) computed via `getCounterpartPath()` from `lib/language.ts` and qualified with `siteUrl` from `lib/site.ts` (data-model.md "Page" and "URL Pair"; depends on T002, T003)
- [X] T005 [P] Create `app/(en)/layout.tsx` — root layout for the `(en)` route group (URL-transparent), rendering `<html lang={LANGUAGES.en.htmlLang} dir={LANGUAGES.en.dir}>` sourced from `lib/language.ts`'s `LANGUAGES` config; no Dynamic API call of any kind (research.md, Decision 1; depends on T002)
- [X] T006 [P] Create `app/ar/layout.tsx` — root layout for the literal `ar` path segment (NOT a route group — this is what produces the actual `/ar` URL prefix), rendering `<html lang={LANGUAGES.ar.htmlLang} dir={LANGUAGES.ar.dir}>` sourced from `lib/language.ts`'s `LANGUAGES` config; no Dynamic API call of any kind (research.md, Decision 1; depends on T002)
- [X] T007 Delete the old `app/layout.tsx` now that `app/(en)/layout.tsx` and `app/ar/layout.tsx` both exist — with two route-group root layouts each rendering their own `<html>`, the original Phase 0 `app/layout.tsx` must be removed, or Next.js rejects the build with a nested/conflicting `<html>` error. This immediately orphans two existing Phase 0 files with no root layout above them — `app/admin/**` and `app/page.tsx` — both resolved by the two moves below, in this same phase, before Foundational is considered done (depends on T005, T006)
- [X] T008 [P] Move `app/admin` to `app/(en)/admin` as a single whole-directory move — `git mv app/admin "app/(en)/admin"` (quote the destination; it contains parentheses), **not** a glob over its contents (a glob over `app/admin/*` risks skipping or mangling the nested `(protected)` route-group directory). After moving, run `git status` and confirm every file under the destination is reported as a rename (`R`), not a delete+add pair (depends on T007)
- [X] T009 [P] Move `app/page.tsx` to `app/(en)/page.tsx` as a single whole-file move — `git mv app/page.tsx "app/(en)/page.tsx"` (quote the destination). No content changes beyond the relocation — it remains the same thin English home placeholder (no real Phase 1 content); the file now renders under the `(en)` root layout from T005 (contracts/http-routes.md, `GET /`; depends on T005, T007)
- [X] T010 Verify `next build` is fully clean — zero errors, specifically no "multiple root layouts" / conflicting-`<html>` error and no "missing root layout" error for either the admin tree or the home page. This is the explicit, checkable gate confirming both T008 and T009 fully resolved what T007's deletion orphaned (depends on T008, T009)
- [X] T011 Verify admin regression now that the build is confirmed clean — confirm: login at `/admin/auth` succeeds and creates a session; `requireAuth()` still redirects an unauthenticated `/admin` request to `/admin/auth`; sign-out invalidates the session and redirects to `/admin/auth`; every `/admin/*` URL is byte-for-byte unchanged from Phase 0 (route groups add no URL segment) — this is the dedicated verification gate for T008, kept separate from layout creation per the operator's explicit requirement, and sequenced after T010 since a manual login test needs an actually-running, successfully-built app (depends on T010)

**Checkpoint**: Foundation ready. `next build` is fully clean — **zero expected or carried-forward build errors** (confirmed by T010); no orphaned routes remain (both `app/admin/**` and `app/page.tsx` have moved). `proxy.ts` has not been touched by any task above. Both root layouts exist and are static (no Dynamic API). Admin is confirmed working at its unchanged URLs under its new location (T011). Nothing broken is carried into Phase 3 — user story implementation can now begin against a healthy build.

---

## Phase 3: User Story 1 - Visitor sees content in the language dictated by the URL (Priority: P1) 🎯 MVP

**Goal**: The home placeholder renders with the correct `lang`/`dir` purely from the requested URL, and no stored preference can override it.

**Independent Test** (spec.md): request `/` and request `/ar`, inspect the `<html>` tag of each response — no other story's functionality is required.

**Note**: the home page's file relocation (`app/page.tsx` → `app/(en)/page.tsx`) already happened in Foundational (T009), against a build that's already confirmed clean (T010). This phase adds the Arabic counterpart and verifies the bilingual behavior itself — it does not re-verify build health.

### Implementation for User Story 1

- [X] T012 [P] [US1] Create `app/ar/page.tsx` — thin Arabic home placeholder, the counterpart of `app/(en)/page.tsx`, rendered under the `ar` root layout from T006 (contracts/http-routes.md, `GET /ar`; depends on T006)
- [X] T013 [US1] Verify US1 acceptance scenarios AC1–AC4 against `quickstart.md`'s table: `/` returns `<html lang="en" dir="ltr">`; `/ar` returns `<html lang="ar" dir="rtl">`; a request to `/` carrying an Arabic-language stored cookie still returns the English page; a request to `/ar` carrying an English-language stored cookie still returns the Arabic page (spec.md US1 AC1–AC4; depends on T009, T012)

**Checkpoint**: User Story 1 (MVP) is independently functional and testable — language is fully determined by the URL alone. Build health was already established at the end of Foundational; this checkpoint confirms the bilingual behavior on top of it.

---

## Phase 4: User Story 2 - Each page exposes correct per-page metadata and its language-counterpart link (Priority: P2)

**Goal**: Every page carries correct title/description/canonical/Open Graph/Twitter/hreflang metadata, self-referencing and cross-referencing its actual counterpart — proven on both the home route and a nested route, not just the trivial case.

**Independent Test** (spec.md): request each placeholder route in each language, inspect the initial HTML `<head>`.

### Implementation for User Story 2

- [X] T014 [US2] Add a `generateMetadata` export to `app/(en)/page.tsx` calling `buildPageMetadata()` from `lib/metadata.ts` with `path: "/"`, `language: "en"` (contracts/http-routes.md, `GET /` metadata; depends on T004, T009)
- [X] T015 [US2] Add a `generateMetadata` export to `app/ar/page.tsx` calling `buildPageMetadata()` with `path: "/"`, `language: "ar"` (contracts/http-routes.md, `GET /ar` metadata; depends on T004, T012)
- [X] T016 [P] [US2] Create `app/(en)/about/page.tsx` — thin English nested placeholder (FR-009's second route) with a `generateMetadata` export calling `buildPageMetadata()` with `path: "/about"`, `language: "en"` (contracts/http-routes.md, `GET /about`; depends on T004, T005)
- [X] T017 [P] [US2] Create `app/ar/about/page.tsx` — thin Arabic nested placeholder, counterpart of T016, with a `generateMetadata` export calling `buildPageMetadata()` with `path: "/about"`, `language: "ar"` (contracts/http-routes.md, `GET /ar/about`; depends on T004, T006)
- [X] T018 [US2] Verify US2 acceptance scenarios AC1–AC3 against `quickstart.md`'s table: `/` and `/ar` each carry complete, cross-referenced metadata (canonical self-referencing, hreflang `en`/`ar`/`x-default` correct); `/about` and `/ar/about` carry their own canonical/hreflang pair, distinct from the home pair (spec.md US2 AC1–AC3; depends on T014, T015, T016, T017)

**Checkpoint**: User Stories 1 and 2 both independently functional.

---

## Phase 5: User Story 3 - Visiting a URL with no matching page returns not-found (Priority: P3)

**Goal**: Unmatched paths 404 in both language trees.

**Independent Test** (spec.md): request an unmatched path under `/` and under `/ar`, confirm a 404 in both.

### Implementation for User Story 3

- [X] T019 [US3] Verify US3 acceptance scenarios AC1–AC2 against `quickstart.md`'s table: `GET /this-does-not-exist` returns `404`; `GET /ar/this-does-not-exist` returns `404` — no new file or code is created for this task, since mirrored literal route trees make unmatched-path 404 Next.js's default behavior (research.md, Decision 1; spec.md US3 AC1–AC2; depends on T009, T012, T016, T017 so the mirrored trees actually exist to be "unmatched" against)

**Checkpoint**: All three user stories independently functional. Core slice behavior complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cross-story checks that don't belong to a single user story, plus the final regression and quality gates.

- [X] T020 [P] Verify SC-004 (reusability) against `quickstart.md`'s table: inspect `app/(en)/about/page.tsx` and `app/ar/about/page.tsx` and confirm each calls only `lib/metadata.ts`'s `buildPageMetadata()` and relies on its root layout for `lang`/`dir` — zero inline canonical/OG/hreflang/`lang`/`dir` logic duplicated per page (depends on T016, T017)
- [X] T021 [P] Verify the global `noindex` protection is unaffected: `X-Robots-Tag: noindex, nofollow` is still present on `/` and `/ar` — `next.config.ts` is not touched by this slice (spec.md hard constraint; quickstart.md; depends on T009, T012)
- [X] T022 Final Phase 0 regression re-check: re-run the Phase 0 quickstart's admin login/logout checks and the `/api/health` liveness check end-to-end, confirming no task after T011 regressed `/admin/*` or `/api/health` (quickstart.md, "Existing Phase 0 behavior unaffected"; depends on T011 and every task above)
- [X] T023 Run the quality gate — `npm run check`, `npm run lint`, `npm run build` — all three MUST exit zero (plan.md, Technical Context "Testing"; depends on every task above)

**Done when**: every checkbox above is checked, `quickstart.md`'s full verification table passes, and T023's quality gate is green. See `spec.md` for the authoritative acceptance scenarios and success criteria.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies — start immediately.
- **Foundational (Phase 2)**: depends on Setup completion — BLOCKS all user stories. Contains the old-layout deletion (T007), **both** orphaned-route relocations (T008 admin, T009 home page), an explicit clean-build gate (T010), and the admin-specific manual verification (T011). Ends with zero build errors carried forward.
- **User Stories (Phase 3–5)**: all depend on Foundational completion. Unlike a typical independent-story slice, these three are intentionally sequential — spec.md states US2 "Depends directly on User Story 1" and US3 is explicitly lower-priority — so US2's tasks extend files US1 created/relocated, and US3 adds no new files at all.
- **Polish (Phase 6)**: depends on Phases 2–5 all being complete.

### Within Each Phase

- T002 (language.ts) blocks T004, T005, T006 — every other helper and both layouts read from its `LANGUAGES` config.
- T003 (site.ts) blocks T004 — the metadata helper needs the absolute-URL base.
- T005 and T006 (root layouts) block T007 (old-layout deletion) — deleting `app/layout.tsx` before both replacements exist would leave every route with no root layout at all.
- T007 blocks T008 and T009 (the two orphaned-route moves) — moving either file in while `app/layout.tsx` still exists would put it under a conflicting double root layout the instant it lands.
- T008 and T009 both block T010 (clean-build gate) — the build can't be confirmed clean until both orphaned files have a home.
- T010 blocks T011 (admin verify) — a manual login test needs an actually-running, successfully-built app, not a build with known-broken routes.
- T009 (home page relocated) and T012 (Arabic home created) both block T013 (US1 verification).

### Parallel Opportunities

- T002 and T003 (independent `lib/` files) — parallel.
- T005 and T006 (independent root layouts, different route trees) — parallel, once T002 is done.
- T008 and T009 (independent orphaned-route moves, different files) — parallel, once T007 is done.
- T012 (US1 Arabic home) can run in parallel with anything else in Phase 3 that doesn't depend on it — there's nothing else, so it simply starts as soon as T006 is done.
- T016 and T017 (US2 about pages, different files) — parallel, once T004/T005/T006 are done.
- T020 and T021 (independent Polish checks) — parallel.

---

## Parallel Example: Foundational Phase

```bash
# Once T002 (lib/language.ts) is done, launch together:
Task: "Create lib/site.ts"
Task: "Create app/(en)/layout.tsx"
Task: "Create app/ar/layout.tsx"

# Once T007 (delete app/layout.tsx) is done, launch together:
Task: "Move app/admin to app/(en)/admin"
Task: "Move app/page.tsx to app/(en)/page.tsx"
```

## Parallel Example: User Story 2

```bash
# Once T004/T005/T006 are done, launch together:
Task: "Create app/(en)/about/page.tsx with generateMetadata"
Task: "Create app/ar/about/page.tsx with generateMetadata"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational) — including the old-layout deletion (T007), **both** orphaned-route moves (T008 admin, T009 home page), the explicit clean-build gate (T010), and admin's dedicated verification (T011).
2. Complete Phase 3 (User Story 1) — just the Arabic home page (T012) and its verification (T013).
3. **STOP and VALIDATE**: run T013 against `quickstart.md` — confirm `/` and `/ar` render with correct `lang`/`dir` and are immune to stored-preference overrides.
4. This is the smallest slice that demonstrates bilingual routing actually works end-to-end — and the build has been clean since the end of Foundational, not just since this checkpoint.

### Incremental Delivery

1. Setup + Foundational → foundation ready, old root layout removed, **both** orphaned routes relocated, build fully clean, admin verified at its new location.
2. Add User Story 1 → verify independently (T013) → MVP.
3. Add User Story 2 → verify independently (T018) → metadata/hreflang complete.
4. Add User Story 3 → verify independently (T019) → 404 behavior confirmed (no new code).
5. Polish → SC-004 reusability check, noindex re-check, full Phase 0 regression re-check, quality gate.

---

## Notes

- No task in this list calls `headers()` in a layout or edits `proxy.ts` — both are explicitly forbidden per research.md's reversed Decision 1. If a future task ever proposes either, it contradicts the current plan and should be rejected, not silently implemented.
- `[P]` tasks touch different files with no incomplete dependency between them.
- T008/T011 (the admin move and its verification) are the only tasks in this entire slice that touch already-shipped Phase 0 code; T009 relocates another Phase 0 file (`app/page.tsx`) but is a pure move with no behavioral change to verify beyond what T010's build check and T013's US1 check already cover.
- Foundational now ends with **zero** carried-forward build errors — T010 is the explicit, checkable gate for that; T023 remains the final, whole-slice quality gate (`check`/`lint`/`build`) run once everything is in place.
- This slice ships no content, no styling polish, and no visible UI controls — matching spec.md's own scope boundary — so no tasks exist for any of those.
