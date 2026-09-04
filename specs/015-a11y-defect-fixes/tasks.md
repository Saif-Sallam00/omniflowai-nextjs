# Tasks: Accessibility Defect Fixes (Phase 6, Slice 6.1)

**Input**: Design documents from `specs/015-a11y-defect-fixes/` (spec.md, plan.md,
research.md, data-model.md, quickstart.md)

**Tests**: This repo has no automated browser/UI test suite (see plan.md's Technical
Context). Every "test" in this feature is a live-verification task against
`npm run build && npm start` — real keyboard input or live measurement, never source
reading — per the operator's explicit constraint and per Gate 1's own PV-1 through PV-4
method. There are no automated test-file tasks to generate.

**Organization**: Tasks are grouped by user story (spec.md's US1/US2/US3), preceded by one
hard-blocking baseline-capture task and followed by a cross-cutting final-verification phase.

**Expected changed files** (per the operator's Gate 3 constraint — anything beyond these four
is scope drift, to be reported before commit, not silently included):
- `components/language-switcher.tsx`
- `components/site-header.tsx`
- `components/newsletter-form.tsx`
- `lib/hooks/use-focus-trap.ts` (new)

**Out of bounds for every task below**: nothing in `docs/decision-016-touch-target-backlog.md`'s
inventory — including the two public `/solutions` controls in `components/business-diagnostic.tsx`
— is touched by any task in this file. No task introduces a new dependency.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files or independent read-only verification, no
  dependency on an incomplete task)
- **[Story]**: Which user story this task belongs to (US1, US2, US3). Absent for the baseline
  and final-verification phases, which are cross-cutting.
- Every task cites the spec.md `FR-###`/`SC-###` identifier(s) it satisfies or verifies, or
  states plainly that it is a constitution-level gate with no spec citation.

---

## Phase 1: Setup

**N/A.** This is an existing, already-initialized Next.js application — there is no project
scaffolding, dependency installation, or lint/format tool configuration to do. The one task
that would conventionally live here (capture a pre-change baseline) is instead placed in
Phase 2, because it is not merely preparatory — it is a **hard blocking gate** the operator
required explicitly, and "Foundational: blocking prerequisites for all user stories" is the
more accurate phase for it than "Setup."

---

## Phase 2: Foundational (hard-blocking prerequisite for every user story)

**⚠️ CRITICAL — T001 MUST complete, in full, before T002 or any later task starts.** A
baseline captured *after* any code change proves nothing — this exact hazard was already
caught once, at Gate 4 of Slice 5.5 (see `docs/decision-015-organization-jsonld-single-emission.md`).
This slice does not repeat it.

- [ ] T001 Capture the full pre-change baseline, before touching any of the four expected
  files. In order: (1) confirm `master` is clean (`git status`); (2) `npm run build`;
  (3) `npm start` (production server, not dev); (4) capture the four metadata snapshots to
  **`/tmp`** (never inside the repo) — `curl -s http://localhost:3000/ > /tmp/before-home-en.html`,
  `curl -s http://localhost:3000/ar > /tmp/before-home-ar.html`,
  `curl -s http://localhost:3000/sitemap.xml > /tmp/before-sitemap.xml`,
  `curl -s http://localhost:3000/robots.txt > /tmp/before-robots.txt` — satisfies the
  pre-condition for **SC-006**; (5) in the same session, at 768×1024 on `/ar` (or any `/ar/*`
  page), read `getBoundingClientRect()` on the header's "Book a strategy call" CTA link and
  record its `left` value (expected: negative, the pre-existing Mob2 clip) to
  `/tmp/before-mob2-cta-rect.json` — satisfies the pre-condition for the **Known Interaction**
  section of spec.md (Mob2 must not worsen); (6) stop the server. **Blocks: every task below.**
  No spec FR/SC of its own — this is the evidentiary baseline the SC-006 and Known-Interaction
  checks in Phase 6 depend on.

**Checkpoint**: Baseline captured to `/tmp`, server stopped, `master` still untouched. User
story implementation may now begin.

---

## Phase 3: User Story 1 - Language switcher label (Priority: P1) 🎯 MVP

**Goal**: Fix R1 — the language switcher announces itself in the visitor's own language, not
the other one.

**Independent Test**: Read the rendered `aria-label` on a served EN page and a served AR
page; confirm each is in the correct language. No dependency on US2 or US3.

- [ ] T002 [US1] In `components/language-switcher.tsx`, swap the two values in
  `A11Y_TOGGLE_LABEL` (lines 19-22) so `en` holds the English string and `ar` holds the
  Arabic string. No other line in the file changes. Satisfies **FR-001**, **FR-002**.
- [ ] T003 [P] [US1] `npm run build && npm start`. On a served EN page (any public route),
  read the language-switcher `<a>`'s `aria-label` attribute directly in devtools (not from
  source). **Expected**: an English string describing switching to Arabic. Also confirm
  `href`, visual position, and icon are unchanged from before T002. Satisfies **SC-001**
  (EN half), **FR-002**.
- [ ] T004 [P] [US1] Same as T003, on a served AR page (any `/ar/*` route). **Expected**: an
  Arabic string describing switching to English. Satisfies **SC-001** (AR half), **FR-002**.

**Checkpoint**: US1 fully verified, both languages. Independently shippable.

---

## Phase 4: User Story 2 - Mobile nav focus trap and Escape (Priority: P2)

**Goal**: Fix Mob9 — while the mobile nav overlay is open, Tab/Shift+Tab stay confined to the
toggle control plus the overlay's own items (the Gate 3 correction: the toggle is *inside*
the trap, not excluded from it), Escape closes it, and focus returns to the toggle on
Escape-close or toggle-close (not on nav-item-selection close, per FR-005a).

**Independent Test**: With a mouse disconnected, open the menu, Tab/Shift+Tab through it in
both directions confirming zero background elements are reachable and the toggle itself is
reachable and activatable, Escape-close, toggle-close, and nav-item-close. Repeat in Arabic.
No dependency on US1 or US3.

### Implementation

- [ ] T005 [US2] Create `lib/hooks/use-focus-trap.ts`: `useFocusTrap(leadingRef, containerRef, active, onEscape)`.
  Per plan.md's "Focus-trap approach": attaches one `keydown` listener each to
  `leadingRef.current` (toggle) and `containerRef.current` (overlay) while `active`, cleaned
  up on `active` becoming false or unmount. On `Escape`, calls `onEscape()`. On `Tab`,
  computes the trapped set `[leadingRef.current, ...containerRef.current.querySelectorAll('a[href], button:not([disabled])')]`
  and wraps forward-from-last to the toggle, backward-from-toggle to the last item;
  does nothing otherwise. No new dependency — native DOM APIs only. Groundwork for
  **FR-003**, **FR-004**.
- [ ] T006 [US2] In `components/site-header.tsx`: add `toggleButtonRef` and `overlayRef`
  (`useRef`), attach them to the toggle `<button>` and the overlay `<div>` respectively, and
  call `useFocusTrap(toggleButtonRef, overlayRef, isMobileMenuOpen, handleEscape)` where
  `handleEscape = () => { setIsMobileMenuOpen(false); toggleButtonRef.current?.focus(); }`.
  The toggle button's own `onClick` (the existing toggle-on-click handler) also calls
  `toggleButtonRef.current?.focus()` after closing, so toggle-self-close and Escape-close
  share the same focus-return behavior. Satisfies **FR-003**, **FR-004**, **FR-005**
  (Escape-close and toggle-close halves only — see T008 for the FR-005a half).
- [ ] T007 [US2] In `components/site-header.tsx`: add `role="dialog"` and `aria-modal="true"`
  to the overlay `<div>`, plus a new small bilingual `Record<Language, string>` constant
  (following the existing `A11Y_TOGGLE_LABEL` precedent in `language-switcher.tsx`) consumed
  as the overlay's `aria-label`. The toggle button's existing `aria-expanded={isMobileMenuOpen}`
  is unchanged. Satisfies **FR-006**.
- [ ] T008 [US2] In `components/site-header.tsx`: confirm (and adjust if not already so) that
  each nav-item `Link`'s `onClick` calls only `setIsMobileMenuOpen(false)` — no
  `toggleButtonRef.current?.focus()` call. This is the FR-005a half of FR-005: closing via
  navigation-item selection does not restore focus to the toggle. Satisfies **FR-005a**.

### Verification — real keyboard input only, both languages (`npm run build && npm start`)

- [ ] T009 [P] [US2] At 375×812 on `/` (EN): with the mouse disconnected, Tab to the toggle,
  press Enter to open. Tab through all overlay items; confirm Tab from the last item (the
  language switcher) wraps to the toggle, not to page content behind the overlay. Then
  Shift+Tab from the toggle; confirm it wraps to the last overlay item. Confirm zero of the
  ~7 background elements in `<main>` ever receive focus during this sequence. While open,
  confirm the overlay has `role="dialog"` and `aria-modal="true"`, and the toggle's
  `aria-expanded` is `"true"`. Satisfies **FR-003**, **FR-006**, **SC-002**.
- [ ] T010 [P] [US2] Same as T009, on `/ar` (AR), confirming identical results in RTL — DOM
  tab order unchanged, trap boundary unchanged. Satisfies **FR-003**, **FR-006**, **SC-002**,
  **FR-007**.
- [ ] T011 [P] [US2] At 375×812 on `/` (EN): open the menu, Tab a few items in, press
  Escape. **Expected**: overlay closes, `aria-expanded` returns to `"false"`, keyboard focus
  is on the toggle button. Satisfies **FR-004**, **FR-005**, **SC-003**.
- [ ] T012 [P] [US2] Same as T011, on `/ar` (AR). Satisfies **FR-004**, **FR-005**, **SC-003**,
  **FR-007**.
- [ ] T013 [P] [US2] At 375×812 on `/` (EN): open the menu, Tab a few items in (not
  immediately closing), Tab or Shift+Tab back to the toggle button, press Enter/Space to
  activate it. **Expected**: overlay closes, focus remains on the toggle button — this is the
  menu's own discoverable close affordance, reachable without knowing the Escape shortcut.
  Satisfies **FR-005**, **SC-003**.
- [ ] T014 [P] [US2] Same as T013, on `/ar` (AR). Satisfies **FR-005**, **SC-003**, **FR-007**.
- [ ] T015 [P] [US2] At 375×812 on `/` (EN): open the menu, Tab to a nav item, press Enter to
  select it. **Expected**: the overlay closes and the browser navigates to the selected
  route. Do **not** require focus to land back on the toggle — per FR-005a, standard
  route-change focus behavior applies instead. Satisfies **FR-005a**.
- [ ] T016 [P] [US2] Same as T015, on `/ar` (AR). Satisfies **FR-005a**, **FR-007**.

**Checkpoint**: US2 fully verified, both languages, real keyboard input throughout.
Independently shippable alongside US1.

---

## Phase 5: User Story 3 - Touch target minimums (Priority: P3)

**Goal**: Fix Mob4 and Mob5 — the hamburger/close toggle and the footer newsletter submit
button each present a tappable area of at least 44×44px, without changing either control's
visible size.

**Independent Test**: Live-measure both controls' rendered tappable area at both phone
viewports, both languages. No dependency on US1 or US2.

### Implementation

- [ ] T017 [P] [US3] In `components/site-header.tsx`, increase the hamburger/close toggle
  button's padding (currently `p-2`, 8px) enough to clear 44×44px total with the existing
  `h-6 w-6` (24px) icon unchanged — grows the tappable area via padding, not by changing the
  icon's visible size. Satisfies **FR-008**, **FR-010**.
- [ ] T018 [P] [US3] In `components/newsletter-form.tsx`'s `SubmitButton`, add
  `position: relative` and an `::after` pseudo-element (`position: absolute`, negative
  `inset`, no visible background/content) sized so the tappable region clears 44×44px while
  the visible `h-10 w-10` box and the `Send` icon are unchanged. Satisfies **FR-009**,
  **FR-010**.

### Verification — live measurement in a browser, both viewports, both languages
### (2 controls × 2 viewports × 2 languages = 8 combinations, covered by T019-T022)

- [ ] T019 [P] [US3] `npm run build && npm start`. At 375×812 on a served EN page, measure
  the rendered `getBoundingClientRect()` of the hamburger toggle and the footer newsletter
  submit button. **Expected**: both ≥44×44px. (2 of 8 combinations.) Satisfies **FR-008**,
  **FR-009**, **SC-004**.
- [ ] T020 [P] [US3] Same as T019, at 375×812 on a served AR page. (2 of 8 combinations.)
  Satisfies **FR-008**, **FR-009**, **SC-004**, **FR-007**.
- [ ] T021 [P] [US3] Same as T019, at 414×896 on a served EN page. (2 of 8 combinations.)
  Satisfies **FR-008**, **FR-009**, **SC-004**.
- [ ] T022 [P] [US3] Same as T019, at 414×896 on a served AR page. (2 of 8 combinations —
  8 of 8 total across T019-T022.) Satisfies **FR-008**, **FR-009**, **SC-004**, **FR-007**.
- [ ] T023 [P] [US3] At 375×812 and 414×896, both languages: with the newsletter form's
  `::after` hit-area expansion in place (T018), confirm a pointer/touch event fired at the
  visible boundary between the email `<input>` and the submit button — specifically within
  the ~2px expanded region on the input's side of that boundary — still lands on the
  `<input>`, not the button. The expansion is small (~2px per side per plan.md's technique)
  but sits directly beside a text field, and a silent tap-stealing regression would not
  otherwise be caught by the dimension measurements in T019-T022 alone. Satisfies **FR-011**
  (edge case named explicitly in spec.md's Edge Cases: adjacent-element overlap).
- [ ] T024 [P] [US3] At 375×812, 414×896, and 768×1024, both languages: confirm
  `document.documentElement.scrollWidth === window.innerWidth` (no new horizontal overflow)
  and no element of the header or footer renders at an off-canvas negative-X position that
  didn't before T017/T018. Satisfies **FR-011**.

**Checkpoint**: US3 fully verified, both viewports, both languages, all 8 dimension
combinations plus the adjacent-input and overflow checks. Independently shippable alongside
US1 and US2.

---

## Phase 6: Final Cross-Cutting Verification

**Purpose**: Checks that span all three user stories together, plus the constitution's
quality gate. Depends on Phases 3, 4, and 5 all being complete.

- [ ] T025 [P] Re-run the horizontal-overflow/off-canvas-clipping check from T024, but across
  the full page set the mobile audit originally covered (`/`, `/about`, `/solutions`,
  `/contact`, `/articles`, `/portfolio`, one article detail, one portfolio detail), at
  375×812, 414×896, and 768×1024, both languages. **Expected**: `0` overflow everywhere,
  matching the mobile audit's original clean baseline. Satisfies **SC-005**.
- [ ] T026 [P] At 768×1024 on `/ar`, repeat T001's Mob2 measurement (the header CTA's
  `getBoundingClientRect().left`) and compare against `/tmp/before-mob2-cta-rect.json`.
  **Expected**: the clip's magnitude is unchanged, not worsened. If it worsened, report it —
  fixing Mob2 stays out of scope, but a regression introduced by this slice does not.
  Verifies spec.md's **Known Interaction** section (not a numbered FR/SC — the spec names
  this section explicitly rather than assigning it an FR/SC identifier).
- [ ] T027 [P] Capture the four "after" metadata snapshots the same way T001 captured
  "before" (`/tmp/after-home-en.html`, `/tmp/after-home-ar.html`, `/tmp/after-sitemap.xml`,
  `/tmp/after-robots.txt`). Diff each against its `/tmp/before-*` counterpart, specifically
  the `<link rel="canonical">`, `<link rel="alternate" hreflang>`, `<meta property="og:*">`,
  and `<script type="application/ld+json">` blocks. **Expected**: byte-identical. Satisfies
  **SC-006**, **FR-014**.
- [ ] T028 `npm run check` — zero TypeScript errors. Constitution-level gate (Constitution
  III, Verify Before Declaring Done) — no spec.md FR/SC citation.
- [ ] T029 `npm run lint` — zero ESLint errors. Constitution-level gate (Constitution III) —
  no spec.md FR/SC citation.
- [ ] T030 `npm run build` — succeeds. Constitution-level gate (Constitution III) — no
  spec.md FR/SC citation.
- [ ] T031 `git diff --stat` against `master`. **Expected**: exactly
  `components/language-switcher.tsx`, `components/site-header.tsx`,
  `components/newsletter-form.tsx`, and the new `lib/hooks/use-focus-trap.ts` — nothing else.
  Any additional changed file is scope drift and must be reported before commit. Constitution-
  level gate (Constitution IV, Scope Discipline) — no spec.md FR/SC citation.
- [ ] T032 Confirm, by inspecting the diff from T031, that no line touches anything listed in
  `docs/decision-016-touch-target-backlog.md` — in particular, `components/business-diagnostic.tsx`
  is not in the changed-file list at all. Constitution-level gate (Constitution IV, Scope
  Discipline) — no spec.md FR/SC citation; this is the operator's explicit Gate 3 boundary,
  restated here so it's checked, not assumed.

**Checkpoint**: All three user stories verified, both languages, no regressions, quality
gate green, scope confirmed clean. Ready for operator review before commit.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: N/A, nothing to do.
- **Phase 2 (Foundational, T001)**: No dependencies — can start immediately. **Hard-blocks**
  every task in Phases 3-6.
- **Phase 3 (US1), Phase 4 (US2), Phase 5 (US3)**: Each depends only on T001 (Phase 2). They
  touch disjoint files (`language-switcher.tsx` / `site-header.tsx` + new hook /
  `newsletter-form.tsx` — note `site-header.tsx` is shared between US2's trap work and US3's
  toggle-padding work, so within that one file US2's tasks (T005-T008) and US3's T017 should
  not be edited concurrently by two different actors, but the *stories* are still logically
  independent and can be sequenced in either order). Each story is independently completable,
  testable, and shippable.
- **Phase 6 (Final Verification)**: Depends on Phases 3, 4, and 5 all being complete, and on
  T001's captured baseline files still existing in `/tmp`.

### Within Each User Story

- US1: T002 (implement) before T003/T004 (verify).
- US2: T005 before T006 (T006 imports the hook T005 creates); T006, T007, T008 all edit
  `site-header.tsx` and should be applied in that order by one actor, not concurrently; all
  of T005-T008 before any of T009-T016 (verification needs the implementation to exist).
- US3: T017 and T018 touch different files and have no dependency on each other; both before
  T019-T024 (verification needs the implementation to exist).

### Parallel Opportunities

- T003 and T004 (US1 verification, EN vs AR) — different pages, independent.
- T009-T016 (US2 verification) — independent read-only browser sessions once T005-T008 are
  done; any order or true parallelism both work.
- T017 and T018 (US3 implementation) — different files.
- T019-T024 (US3 verification) — independent once T017/T018 are done.
- T025-T027 (final verification) — independent of each other, though all depend on every
  prior phase being complete.
- The three user-story phases themselves (3, 4, 5) have no cross-dependency and could be
  staffed in parallel by different people, once T001 is done — the only shared-file caution
  is `site-header.tsx` between US2 and US3, noted above.

---

## Parallel Example: User Story 2 verification

```bash
# Once T005-T008 are done, all eight verification tasks are independent browser sessions:
Task: "T009 — EN Tab/Shift+Tab wrap + role/aria-modal check at 375x812"
Task: "T010 — AR Tab/Shift+Tab wrap + role/aria-modal check at 375x812"
Task: "T011 — EN Escape-close + focus-return"
Task: "T012 — AR Escape-close + focus-return"
Task: "T013 — EN toggle-self-close + focus-return"
Task: "T014 — AR toggle-self-close + focus-return"
Task: "T015 — EN nav-item-close, no focus-return required"
Task: "T016 — AR nav-item-close, no focus-return required"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. T001 (baseline — mandatory regardless of which stories follow).
2. T002-T004 (US1: the language-switcher fix). This alone ships R1, the single highest-
   severity defect of the four (spec.md rates it P1 for exactly this reason).
3. Run Phase 6's constitution-gate tasks (T028-T031, scoped to just this change) before
   considering US1 alone shippable.

### Incremental Delivery

1. T001 → baseline ready.
2. US1 (T002-T004) → verify independently → shippable on its own.
3. US2 (T005-T016) → verify independently → shippable alongside or after US1.
4. US3 (T017-T024) → verify independently → shippable alongside or after US1/US2.
5. T025-T032 → full cross-cutting verification once all three are in → operator review.

### Suggested Full-Slice Order

Given all three stories are small and touch largely disjoint files, sequential T001 → US1 →
US2 → US3 → Phase 6 is likely simpler to review as one coherent diff than three separate
partial deliveries, but nothing here requires that — the dependency graph above supports
shipping US1 alone, or any subset, if the operator prefers smaller increments.
