---

description: "Task list for Static Public Pages — Slice 1B"
---

# Tasks: Static Public Pages — Slice 1B

**Input**: Design documents from `/specs/003-static-pages/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/http-routes.md, quickstart.md

**Tests**: Not requested for this slice (no test framework introduced, per plan.md's Technical Context — consistent with 1A). Verification is the quality gate plus quickstart.md, referenced directly by task.

**Organization**: Tasks are grouped by user story (spec.md: US1 home, US2 chrome/switcher, US3 about+solutions, US4 legacy redirect). SiteShell, LanguageSwitcher, and their one new helper are Foundational — every page in every story renders through the layout that mounts them, so they must exist first (this was an explicit ordering requirement, not an ordinary story-independence exception).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: Which user story this task belongs to (US1–US4). Setup, Foundational, and Polish tasks carry no story label.

---

## Phase 1: Setup

**Purpose**: Confirm the starting state is clean before any 1B change lands.

- [X] T001 Run the existing quality gate as a baseline (`npm run check`, `npm run lint`, `npm run build`) and confirm slice 1A's quickstart checks still pass — establishes a clean starting point so any later failure is attributable to this slice's own changes, not pre-existing drift.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared chrome and its one new helper. Every one of this slice's six pages renders inside the layout that mounts `SiteShell`, so this must be complete before any page-content story begins (explicit ordering requirement — not the usual story-independence pattern).

**⚠️ CRITICAL**: No page-content work (US1, US3) can begin until this phase is complete. US4 (the redirect) has no dependency on this phase and may be done at any point after Setup.

- [X] T002 Add `getAgnosticPath(pathname: string): string` to `lib/language.ts`, alongside the existing `Language`, `LANGUAGES`, `resolveLanguageFromPathname`, `getLanguagePath`, `getCounterpartPath` exports (all unchanged). Strips the `/ar` prefix from a full pathname (`"/ar"` → `"/"`, `"/ar/about"` → `"/about"`, anything else passed through unchanged) per data-model.md. Pure function, no new dependency.
- [X] T003 Create `components/language-switcher.tsx` — `"use client"`, named export `LanguageSwitcher`, no props. Internally: `usePathname()` → `resolveLanguageFromPathname(pathname)` → `getAgnosticPath(pathname)` (T002) → `getCounterpartPath(agnosticPath, language)` → render a single `<a href={href}>` labeled in the *other* language (e.g. "العربية" on an English page, "English" on an Arabic page). Depends on T002.
- [X] T004 Create `components/site-shell.tsx` — named export `SiteShell`, Server Component (no `"use client"`, no `headers()`/`cookies()`), props `{ language: Language; children: React.ReactNode }`. Renders a header with three fixed nav links (home/about/solutions) computed via 1A's `getLanguagePath(path, language)`, bilingual nav/footer label records keyed by `Language` (colocated in this file), a footer, `<LanguageSwitcher />`, and `{children}`. Depends on T003.
- [X] T005 [P] Create `app/(en)/(public)/layout.tsx` — a new, URL-transparent nested route group. Imports `SiteShell`, renders `<SiteShell language="en">{children}</SiteShell>`, and exports a `metadata` fallback (generic sitewide copy, replacing the stale Phase-0 "Foundation" text — still overridden per-page by each page's own `generateMetadata()`). Does NOT touch `app/(en)/layout.tsx` itself, which stays exactly as 1A left it (that file is also `/admin/*`'s root layout — see plan.md's corrected design). Depends on T004.
- [X] T006 [P] Create `app/ar/(public)/layout.tsx`, mirroring T005 for the Arabic tree: imports `SiteShell`, renders `<SiteShell language="ar">{children}</SiteShell>`, own `metadata` fallback. `app/ar/layout.tsx` itself is untouched. Depends on T004. Parallel with T005 (different files).
- [X] T007 Move `app/(en)/page.tsx` → `app/(en)/(public)/page.tsx` and `app/(en)/about/page.tsx` → `app/(en)/(public)/about/page.tsx` (file moves only — no content change in this task, URLs unchanged since `(public)` is a route group). Depends on T005.
- [X] T008 [P] Move `app/ar/page.tsx` → `app/ar/(public)/page.tsx` and `app/ar/about/page.tsx` → `app/ar/(public)/about/page.tsx` (file moves only, URLs unchanged). Depends on T006. Parallel with T007 (different files).
- [X] T009 Foundational verification: run `npm run check`, `npm run lint`, `npm run build` — all zero-error with the moved files and new chrome in place but still carrying 1A's placeholder content. Confirm `grep -r "headers()\|cookies()" components/site-shell.tsx components/language-switcher.tsx app/\(en\)/\(public\)/layout.tsx app/ar/\(public\)/layout.tsx` returns nothing (guardrail: no Dynamic API in the new chrome). Confirm `app/(en)/layout.tsx` and `app/ar/layout.tsx` are unmodified (`git diff` shows no changes to either). Depends on T007, T008.

**Checkpoint**: Shared chrome and switcher exist, mounted only under `(public)`, admin unaffected, still showing 1A's placeholder content through the new chrome. All page-content stories can now proceed.

---

## Phase 3: User Story 1 — Real home page content (Priority: P1) 🎯 MVP

**Goal**: Replace 1A's placeholder home content with the real, faithfully-ported English and Arabic home page, rendered inside the now-real chrome.

**Independent Test**: Request `/` and `/ar`, confirm real home content (not 1A's placeholder) in the initial HTML response, in the correct language.

- [X] T010 [P] [US1] Replace placeholder content in `app/(en)/(public)/page.tsx` with the real, ported English home page content; update its `generateMetadata()` title/description to real copy (`path: "/"`, `language: "en"`).
- [X] T011 [P] [US1] Replace placeholder content in `app/ar/(public)/page.tsx` with the real, ported Arabic home page content; update its `generateMetadata()` title/description (`path: "/"`, `language: "ar"`). Parallel with T010 (different files).
- [X] T012 [US1] Verify against spec User Story 1's acceptance scenarios: `curl` `/` and `/ar` show real content (no 1A placeholder text) in the correct language; view-source (not rendered DOM) confirms full content present pre-hydration on both. Depends on T010, T011.

**Checkpoint**: Home page is fully real, in both languages, wrapped in the shared chrome.

---

## Phase 4: User Story 2 — Shared chrome and language switcher (Priority: P2)

**Goal**: Confirm the chrome and switcher built in Phase 2 actually satisfy their acceptance scenarios now that real content exists to render them against. No new component code — this phase is verification of Foundational's output, per the explicit ordering requirement that front-loaded SiteShell/LanguageSwitcher construction into Phase 2.

**Independent Test**: Load `/`, `/ar`, `/about`, `/ar/about` (available at this point — `/solutions` lands in US3), confirm identical chrome structure per language pair and correct switcher targeting.

- [X] T013 [US2] Verify chrome structural parity: compare header/nav/footer DOM structure between `/` and `/ar`, and between `/about` and `/ar/about` — identical structure, only text and `dir` differ (US2 AC1). Depends on T012 (US1 checkpoint).
- [X] T014 [US2] Verify the switcher targets the exact counterpart, not the home page: from `/ar/about`, confirm the switcher's `href` is `/about` (US2 AC2). Note: the equivalent check for `/solutions` ↔ `/ar/solutions` (US2 AC3) is deferred to T021 in Phase 5, since those pages don't exist until then — this is the dependency the spec itself calls out (User Story 2's "Why this priority"). Depends on T013.
- [X] T015 [US2] Verify nav labels are entirely in-language on both an English page and an Arabic page — no mixed-language leakage (US2 AC4). Depends on T013.
- [X] T016 [US2] Verify the switcher's `href` is already correct in the raw server-rendered HTML with no JavaScript executed, for the `/` ↔ `/ar` and `/about` ↔ `/ar/about` pairs (spec Edge Cases — JS-disabled case). Depends on T013.

**Checkpoint**: Chrome and switcher mechanism confirmed correct for all pages that exist so far; full three-page coverage completes in Phase 5.

---

## Phase 5: User Story 3 — Real about and solutions content (Priority: P3)

**Goal**: Replace 1A's about placeholder with real content, and add the new solutions page (the renamed "services" page) in both languages.

**Independent Test**: Request `/about`, `/ar/about`, `/solutions`, `/ar/solutions`, confirm each carries its real, faithfully-ported content in the correct language.

- [X] T017 [P] [US3] Replace placeholder content in `app/(en)/(public)/about/page.tsx` with the real, ported English about page content; update `generateMetadata()` (`path: "/about"`, `language: "en"`). Depends on Phase 2 checkpoint (T009) — independent of Phase 3/4.
- [X] T018 [P] [US3] Replace placeholder content in `app/ar/(public)/about/page.tsx` with the real, ported Arabic about page content; update `generateMetadata()` (`path: "/about"`, `language: "ar"`). Parallel with T017.
- [X] T019 [P] [US3] Create new file `app/(en)/(public)/solutions/page.tsx` — real English content ported from current production's services page (EX-03); `generateMetadata()` with `path: "/solutions"`, `language: "en"`. Mirrors the structure of the about page. Parallel with T017/T018.
- [X] T020 [P] [US3] Create new file `app/ar/(public)/solutions/page.tsx` — real Arabic content, counterpart of T019; `generateMetadata()` with `path: "/solutions"`, `language: "ar"`. Parallel with T017–T019.
- [X] T021 [US3] Verify against spec User Story 3's acceptance scenarios: `curl` all four URLs show real content in the correct language. Also closes out T014's deferred check: from `/solutions`, confirm the switcher's `href` is `/ar/solutions` (not `/ar`), and the reverse from `/ar/solutions` — completing US2 AC3. Depends on T017–T020.

**Checkpoint**: All three page types, both languages, fully real content, wrapped in shared chrome, switcher fully verified across all six pages.

---

## Phase 6: User Story 4 — Legacy services URL redirect (Priority: P4)

**Goal**: Inbound links to the current production site's `/services` URL land on `/solutions` instead of breaking.

**Independent Test**: Request the old production services URL, confirm a permanent redirect to `/solutions`. No dependency on US1–US3 — may be done at any point after Setup.

- [X] T022 [US4] Add a `redirects()` export to `next.config.ts`, alongside the existing `headers()` export: `{ source: "/services", destination: "/solutions", permanent: true }` (→ 308, per research.md Decision 1 and spec FR-005/US4/SC-004 as amended). Do not modify `proxy.ts`.
- [X] T023 [US4] Verify: `curl -I http://localhost:3000/services` returns status `308` with a `Location: /solutions` header (spec User Story 4 AC1, as amended). Then `curl -i http://localhost:3000/` (and one other route, e.g. `/about`) and confirm `X-Robots-Tag: noindex, nofollow` is still present — proving the `redirects()` addition did not disturb the existing `headers()` config. Depends on T022.

**Checkpoint**: Legacy URL preserved via redirect; both `next.config.ts` responsibilities (noindex headers, legacy redirect) confirmed independently working.

---

## Phase 7: Polish & Cross-Cutting Verification

**Purpose**: Whole-slice checks that span all four stories.

- [X] T024 [P] Static-rendering verification (SC-006): run `npm run build` and inspect the route output table — confirm `/`, `/ar`, `/about`, `/ar/about`, `/solutions`, `/ar/solutions` are all marked static, none marked dynamic. Depends on T012, T021 (all page content in place).
- [X] T025 [P] Guardrail audit: confirm `proxy.ts` has no diff from its pre-slice state (`git diff proxy.ts` empty); confirm no file added or modified by this slice contains `headers()` or `cookies()` calls (`grep -rn "headers()\|cookies()" components/ app/\(en\)/\(public\)/ app/ar/\(public\)/`). Depends on T009, T022.
- [X] T026 Full `quickstart.md` walkthrough: work through every row in its verification table, confirming spec.md's User Stories 1–4 and Success Criteria SC-001–SC-006 all hold end-to-end, including the admin-does-not-inherit-public-chrome check. Depends on T012, T016, T021, T023, T024.
- [X] T027 Phase 0 + slice 1A regression check: re-run 1A's quickstart — admin login/logout still works via `/admin/auth`, `/admin` dashboard unaffected and shows no public chrome (confirms the `(public)` route-group correction), and 1A's routing/`lang`/`dir`/metadata/URL-pairing mechanisms are still correct on all six pages. Depends on T026.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup. BLOCKS User Stories 1 and 3 (both render pages through the chrome built here). Does NOT block User Story 4 (independent redirect rule).
- **User Story 1 (Phase 3)**: Depends on Foundational.
- **User Story 2 (Phase 4)**: Depends on User Story 1 (verifies chrome/switcher using the now-real home page and the still-placeholder-but-chrome-wrapped about page).
- **User Story 3 (Phase 5)**: Depends on Foundational only — could in principle run in parallel with Phase 3/4, but is sequenced after Phase 4 here to match spec priority order (P1 → P2 → P3) and because it closes out Phase 4's deferred solutions-switcher check.
- **User Story 4 (Phase 6)**: Depends only on Setup — no dependency on Phases 2–5. Could be done first, last, or in parallel with any of them.
- **Polish (Phase 7)**: Depends on all four user stories being complete.

### Parallel Opportunities

- T005/T006 (the two `(public)` layouts) — different files, both depend only on T004.
- T007/T008 (the two languages' file moves) — different files.
- T010/T011 (home content, both languages) — different files.
- T017/T018/T019/T020 (about + solutions content, both languages) — four different files, all depend only on the Phase 2 checkpoint.
- T024/T025 (static-rendering check and guardrail audit) — independent checks, can run together once their prerequisites are met.
- User Story 4 (Phase 6) can run at any time in parallel with Phases 2–5, since it touches only `next.config.ts` and has no dependency on the chrome or page content.

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational — chrome + switcher, blocking).
2. Complete Phase 3 (User Story 1 — real home content).
3. **STOP and VALIDATE**: `/` and `/ar` show real content inside the working chrome.

### Incremental Delivery

1. Setup + Foundational → chrome and switcher exist, admin unaffected, pages still placeholder.
2. Add US1 → real home page → validate independently (MVP).
3. Add US2 → verify chrome/switcher against what exists so far → validate.
4. Add US3 → real about + new solutions pages → validate, closing US2's deferred check.
5. Add US4 → legacy redirect (independent, can slot in anywhere after Setup) → validate.
6. Phase 7 → whole-slice static-rendering, guardrail, quickstart, and regression checks.

Each increment adds value without breaking the previous one; `/admin/*` is unaffected throughout, by construction (Foundational never touches `app/(en)/layout.tsx`).
