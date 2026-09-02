---

description: "Task list for Client Logo Marquee — Real Assets"
---

# Tasks: Client Logo Marquee — Real Assets

**Input**: Design documents from `/specs/012-client-logo-marquee/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested for this slice. Verification is manual, per quickstart.md and the acceptance criteria in spec.md — each AC has its own explicit verification task below rather than an automated test task.

**Branch note**: No feature branch was created (no `.specify/extensions.yml`, so branch creation is skipped by design). Work happens directly on `master`, per this project's master-only convention. Task descriptions below reference file paths only, not a branch.

**Organization**: Tasks are grouped by user story from spec.md (US1 = P1, real logo images render; US2 = P2, single shared client list). `lib/clients.ts` and the component change are foundational — both stories depend on them and neither is independently renderable without them, so they sit in the Foundational phase per the required sequencing (list → component → pages).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2) — omitted for Setup/Foundational/Polish

## Path Conventions

Existing single Next.js application at repository root. No new directories.

---

## Phase 1: Setup

No project initialization is required — this slice modifies an existing Next.js app with all tooling already in place. This phase is intentionally empty.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the shared data source and update the component to consume it. Both user stories depend on this phase; neither `LogoMarquee` nor either home page can be correctly wired until it's complete.

**⚠️ CRITICAL**: No page-file edits (US1/US2 phases) can begin until this phase is complete — the pages import both `Client`/`CLIENTS` from `lib/clients.ts` and rely on `LogoMarquee`'s new prop type.

- [X] T001 Create `lib/clients.ts` exporting `type Client = { name: string; file: string }` and `export const CLIENTS: Client[]` with exactly the 26 entries and order from spec.md FR-002 / plan.md data-model.md (verified filenames: 23 `.png`, 3 `.jpg` — `majarrah.jpg`, `pioneer.jpg`, `thaki.jpg` — do not derive `file` from `name`). Do not include `plugin-talents.png`.
- [X] T002 In `components/logo-marquee.tsx`, change the prop type from `{ clients: string[] }` to `{ clients: Client[] }` (import `Client` from `@/lib/clients`), and replace the inner `<span>{name}</span>` with `<img src={`/clients/${file}`} alt={name} loading="lazy" width={...} height={...} className="...object-contain..." />`, sized to fit inside the existing card without distortion. Retain the doubled-array (`[...clients, ...clients]`) loop and its index-based `key` exactly as-is. Retain the card `<div>` and its classes, the wrapper `<div className="relative">`, and both fade-gradient overlay `<div>`s verbatim — do not touch anything but the innermost content and the prop type.
- [X] T003 In `components/logo-marquee.tsx`, update the file's header comment (currently states no logo assets exist in the repo) to reflect that real logo assets are now used — this is a standalone edit within the same file as T002, done as its own explicit step so it isn't forgotten.

**Checkpoint**: `lib/clients.ts` exists and exports the 26-entry list; `LogoMarquee` accepts `Client[]` and renders `<img>`. Neither home page has been touched yet — the app will not type-check against the still-unmodified pages until Phase 3/4 tasks land, which is expected mid-sequence.

---

## Phase 3: User Story 1 - Visitor sees real client logos in the marquee (Priority: P1) 🎯 MVP

**Goal**: Both home pages render actual client logo images (not text) inside the existing marquee cards, without visual regression to the section's styling or animation.

**Independent Test**: Load the EN and AR home pages, scroll to the client marquee, and confirm every card shows a logo image, the marquee still scrolls/loops continuously, and no image is broken, stretched, distorted, or overflowing.

### Implementation for User Story 1

- [X] T004 [US1] In `app/(en)/(public)/page.tsx`, remove the local `CLIENT_LOGOS: string[]` array, import `CLIENTS` from `@/lib/clients`, and pass `<LogoMarquee clients={CLIENTS} />`.
- [X] T005 [US1] In `app/ar/(public)/page.tsx`, remove the local `CLIENT_LOGOS: string[]` array, import `CLIENTS` from `@/lib/clients`, and pass `<LogoMarquee clients={CLIENTS} />`.

### Verification for User Story 1

- [ ] T006 [US1] Verify AC-3 (spec.md/quickstart.md): load the EN home page, confirm all 26 clients render as logo images (52 `<img>` elements counting the doubled loop), none as text, and no image is visibly broken. **Requires operator verification in a browser — not performed by the implementer.**
- [ ] T007 [US1] Verify AC-4: load the AR home page, confirm the same 26 logos render in the same order, and that each `<img>`'s `alt` text matches the corresponding EN entry's `alt` text verbatim (no localized wrapper text). **Requires operator verification in a browser — not performed by the implementer.**
- [ ] T008 [US1] Verify AC-5 — network-tab check (does NOT substitute for visual inspection; a missing logo renders as an empty card, not an obvious error): on both the EN and AR home pages, open browser devtools → Network tab, filter on `clients`, reload, and confirm every `/clients/*` request returns HTTP 200 with zero 404s. **Requires operator verification in a browser — not performed by the implementer.**
- [ ] T009 [US1] Verify AC-6: on both home pages, visually inspect each logo across the range of source asset aspect ratios and confirm none are stretched, distorted, or overflowing their card. **Requires operator verification in a browser — not performed by the implementer.**
- [ ] T010 [US1] Verify AC-7: on both home pages, watch the marquee for a full loop cycle and confirm it continues to scroll and loop seamlessly, matching pre-change animation behavior. **Requires operator verification in a browser — not performed by the implementer.**
- [ ] T011 [US1] Verify AC-8: compare the client marquee section's card size, borders, shadows, spacing, and fade-gradient overlays on both home pages against the pre-change render, and confirm no visual change beyond the text-to-image swap. **Requires operator verification in a browser — not performed by the implementer.**
- [X] T012 [US1] Verify AC-9: run `grep -r "plugin-talents" app lib components` from the repo root and confirm zero matches. **Performed — zero matches confirmed.**
- [ ] T013 [US1] Note (do not fix): during T006/T007/T009, report any logo that renders invisibly due to being white-on-transparent against the white card background, per spec.md's Edge Cases / `docs/phase-5-slice-5-6-spec.md`'s Note — this is an accepted, out-of-scope limitation for this slice, not a defect to remediate here. **Requires operator verification in a browser — not performed by the implementer; no finding to report at this time.**

**Checkpoint**: Both home pages render real logo images with no visual regression. User Story 1 is independently verified.

---

## Phase 4: User Story 2 - Maintainer updates the client list in one place (Priority: P2)

**Goal**: Both home pages source the client roster from a single shared list, eliminating the two independently-maintained arrays.

**Independent Test**: Inspect the EN and AR home page source files and confirm neither defines its own client array — both import the same shared list — and confirm the shared list's entries render identically (same order, same names) on both pages.

**Note**: T004/T005 in Phase 3 already perform the file edits that satisfy this story (removing `CLIENT_LOGOS` and importing `CLIENTS` is a single edit per page that serves both US1 rendering and US2 de-duplication). This phase verifies that outcome explicitly.

### Verification for User Story 2

- [X] T014 [US2] Verify AC-1: open `lib/clients.ts` and confirm it contains exactly 26 entries, in the exact order and with the exact filenames specified in spec.md FR-002. **Performed — 26 entries confirmed, order and filenames match FR-002.**
- [X] T015 [US2] Verify AC-2: run `grep -n "CLIENT_LOGOS" "app/(en)/(public)/page.tsx" "app/ar/(public)/page.tsx"` and confirm zero matches in both files; confirm both files instead import `CLIENTS` from `@/lib/clients`. **Performed — zero matches for `CLIENT_LOGOS`, both files import `CLIENTS`.**

**Checkpoint**: Both home pages source the client roster from the single shared `lib/clients.ts` module. User Story 2 is independently verified.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final quality gate and drift check before commit, covering the acceptance criteria that span the whole slice rather than one user story.

- [ ] T016 Run the quality gate: `npm run check` (zero TypeScript errors), `npm run lint` (zero ESLint errors), `npm run build` (succeeds) — per spec.md AC-10. All three MUST exit zero before proceeding. **`npm run check` and `npm run lint` pass with zero errors. `npm run build` fails, but on `./app/favicon.ico` ("The PNG is not in RGBA format!") — confirmed pre-existing and unrelated to this slice by reproducing the identical failure on unmodified `master` (changes stashed, rebuilt, then restored). Not fixed here — outside this slice's scope. Gate not fully green; operator decision needed on the pre-existing favicon issue.**
- [X] T017 Verify AC-11 — zero drift: run `git status --short` and `git diff --stat` against the working tree (per quickstart.md's corrected step 5 — no feature branch exists, so this checks the working tree directly, not a branch diff) and confirm only these four paths appear, new or modified: `lib/clients.ts`, `components/logo-marquee.tsx`, `app/(en)/(public)/page.tsx`, `app/ar/(public)/page.tsx`. **Performed — confirmed. (The `specs/012-client-logo-marquee/` doc directory also appears as untracked, from the earlier /speckit-specify, /speckit-plan, /speckit-tasks steps — expected, not part of the four-file code-change scope.)**
- [ ] T018 Only after T016 and T017 both pass, and any finding from T013 has been reported to the operator: stage and commit the four changed files.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Empty — no dependencies.
- **Foundational (Phase 2)**: No dependencies. BLOCKS Phase 3 and Phase 4 — `lib/clients.ts` (T001) must exist before the component (T002/T003) is edited, and the component must accept `Client[]` before either page (T004/T005) is wired to it.
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion (T001–T003).
- **User Story 2 (Phase 4)**: Depends on Phase 2 completion and on T004/T005 (Phase 3) — the same two page edits satisfy both stories' file changes; Phase 4 only adds independent verification of the de-duplication outcome.
- **Polish (Phase 5)**: Depends on all of Phase 3 and Phase 4 being complete.

### Within Phase 2 (Foundational)

- T001 (`lib/clients.ts`) before T002 (component consumes `Client` type from it).
- T002 before T003 is not strictly required (same file, different concern) but T003 is listed after T002 for clarity; both must complete before Phase 3.

### Within Phase 3 (User Story 1)

- T004 and T005 are `[P]` — different files (EN vs AR page), no dependency between them, both depend only on Phase 2.
- T006–T013 (verification) depend on T004 and T005 both being complete.

### Within Phase 4 (User Story 2)

- T014 depends only on T001 (Phase 2).
- T015 depends on T004 and T005 (Phase 3).

### Parallel Opportunities

- T004 and T005 can be done in parallel (different files).
- T006, T007, T009, T010, T011 (per-page/visual verification) can be performed in parallel across EN/AR once T004/T005 are both done; T008 (network tab) is most reliable done sequentially per page to keep the filtered Network tab view unambiguous.
- T014 can be done as soon as T001 lands, independent of Phase 3 progress.

---

## Parallel Example: Phase 3

```bash
# Launch both page edits together (different files):
Task: "Wire app/(en)/(public)/page.tsx to import CLIENTS from lib/clients.ts"
Task: "Wire app/ar/(public)/page.tsx to import CLIENTS from lib/clients.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T001–T003).
2. Complete Phase 3: User Story 1 (T004–T013) — both pages wired and rendering real images, verified against AC-3 through AC-9.
3. **STOP and VALIDATE**: User Story 1 alone already delivers the slice's primary visible value (real logos, no text lockups).

### Incremental Delivery

1. Phase 2 (Foundational) → shared list and component ready.
2. Phase 3 (US1) → both pages render real logos, verified independently. This is functionally also most of Phase 4's file change (T004/T005), since the page edit that wires `CLIENTS` in is the same edit that removes the duplicated `CLIENT_LOGOS` array.
3. Phase 4 (US2) → explicit verification that the de-duplication outcome holds (AC-1, AC-2).
4. Phase 5 (Polish) → quality gate, zero-drift check, commit.

## Notes

- [P] tasks = different files, no dependencies.
- [Story] label maps task to US1 or US2 per spec.md; Foundational and Polish tasks carry no story label since they serve both.
- This slice intentionally has no automated tests — verification is manual per quickstart.md, mirrored here as explicit per-AC tasks (T006–T012, T014–T015, T016–T017).
- Do not commit (T018) until the quality gate (T016) and zero-drift check (T017) both pass, and the white-on-transparent finding (T013), if any, has been reported rather than silently fixed.
