# Implementation Plan: Accessibility Defect Fixes (Phase 6, Slice 6.1)

**Branch**: `015-a11y-defect-fixes` (label only — this slice works directly on `master`, no
git branch is created; see Constraints) | **Date**: 2026-09-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/015-a11y-defect-fixes/spec.md`

## Summary

Four accessibility defects, fixed across three existing files plus one new small hook file
(approved at Gate 2 — see "Beyond the three expected files" below), with zero new
dependencies:

1. **R1** — swap the two hardcoded strings in `components/language-switcher.tsx`'s
   `A11Y_TOGGLE_LABEL` map so each language announces its *own* language's label. A
   one-line value swap; no structural change.
2. **Mob9** — give `components/site-header.tsx`'s mobile-nav overlay real modal-dialog
   behavior: a dependency-free Tab/Shift+Tab focus trap (a small custom hook, native
   `keydown` interception, no library), Escape-to-close, and `role="dialog" aria-modal="true"`
   on the overlay so its open/closed state is exposed to assistive technology the same way
   its existence/non-existence already communicates that state visually. Focus returns to the
   toggle button on Escape-close and toggle-close; closing via navigation-item selection is
   explicitly exempted (see spec.md FR-005a — this was corrected at this gate; see
   "Corrections applied at this gate" below).
3. **Mob4 / Mob5** — grow the *tappable* area of `site-header.tsx`'s hamburger/close toggle
   and `components/newsletter-form.tsx`'s submit button to ≥44×44px without changing either
   control's *visible* size: padding increase for the toggle (its box is already
   padding-derived), an invisible pseudo-element hit-area expansion for the newsletter button
   (its box is a fixed `h-10 w-10` utility, not padding-derived, so padding can't grow it
   without also growing what's visible).

All three touched components are single shared files parameterized by a `language` prop and
consumed by both the `(en)` and `ar` layout trees — there is no per-language copy to keep in
sync, so FR-012 (bilingual simultaneity) is satisfied by construction, not by discipline.

## Correction applied at Gate 3

The trap boundary was wrong: Gate 2's version of this plan excluded the toggle button from
the focus trap entirely, and stated the consequence outright ("a keyboard user cannot Tab
back to the toggle button while the menu is open"). That's backwards — while the overlay is
open, the toggle button *is* its close button (accessible label "Close menu", confirmed live
at Gate 1's PV-2), and FR-003's intent was always to keep *background page content*
unreachable, not to keep the menu's own close affordance unreachable by Tab. Corrected: the
trapped set is now the toggle control plus the overlay's focusable descendants (9 elements
total, not 8) — see "Focus-trap approach" below for the corrected hook design, and see
`spec.md`'s FR-003 and User Story 2 acceptance scenarios, which were reworded so "outside the
menu" is stated as "page content behind the overlay" throughout, precisely so this doesn't
get re-collapsed into the wrong boundary again at a later gate. Escape-close and
focus-return-to-toggle behavior (FR-005) are conceptually unchanged — focus still returns to
the toggle control on Escape or toggle-close — but making that work correctly once the
toggle is a reachable resting point (not just the pre-Tab starting point) required a second,
related fix: the toggle button and the overlay are DOM siblings, not nested, so a keydown
listener scoped only to the overlay (as Gate 2's design had it) never sees an Escape press
that happens while focus is on the toggle itself. Fixed by having `useFocusTrap` attach its
listener to both elements instead of relying on event bubbling from a single attachment
point. See "Focus-trap approach" below for the full corrected design.

## Corrections applied at Gate 2

Two corrections were required to `spec.md` and one backlog document was written before this
plan could proceed, per the operator's Gate 2 instructions:

1. **FR-005 was logically unsatisfiable as written** (it required focus-return-to-toggle on
   *all* three close paths, including navigating away — which has no coherent target once the
   route has changed). Split into **FR-005** (Escape and toggle-close only) and new
   **FR-005a** (navigation-item close: no focus restoration, standard route-change behavior
   applies instead). Acceptance Scenario 4-5 under User Story 2, the corresponding edge case,
   and SC-003 were all updated to state this distinction explicitly, so it survives into
   `tasks.md` rather than being silently re-collapsed there. This plan's focus-management
   design (below) implements the corrected FR-005/FR-005a split directly — the toggle's
   `onClick` and the overlay's `Escape` handler both call `.focus()` on the toggle button; the
   nav-item `Link`'s `onClick` does not.
2. **PV-4's public-page findings were written to a standalone backlog record**,
   `docs/decision-016-touch-target-backlog.md`, covering the full 11-confirmed +
   2-borderline inventory (file:line for every item), explicitly flagging the two
   `components/business-diagnostic.tsx` controls on the public `/solutions` page (24×24 and
   ~14-16px tall) as materially worse than the two this slice fixes and missed by both prior
   audits, and explicitly flagging that the ~15 admin call sites of `components/admin/button.tsx`
   trace to one shared component (one future fix, not fifteen). No fix is proposed in that
   document, and nothing from it is folded into this slice's file list below.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict mode, per constitution), React 19.2.8, Next.js
16.3.1 (App Router, Server + Client Components)

**Primary Dependencies**: None added. Uses only what the three touched files already import:
`lucide-react` (icons already in use — `Menu`, `X`, `Send`, `Globe`; no new icon needed),
Tailwind CSS 3.4 (existing utility classes plus one new small set for the hit-area
techniques, no new Tailwind plugin). One new first-party file: `lib/hooks/use-focus-trap.ts`
(see "Beyond the three expected files" below) — a same-repo hook, not a package.

**Storage**: N/A — no persisted or transmitted data is involved in any of the three fixes.

**Testing**: This repo has no automated browser/UI test suite (constitution: test
infrastructure is "chosen at implementation time... no blanket coverage goals," and none has
been chosen for this kind of behavior yet). Consistent with how both source audits and this
slice's own Gate 1 pre-work were themselves verified, all verification here is live-browser:
real keyboard input (Tab/Shift+Tab/Escape) and live-rendered measurement against
`next build && next start`, in both languages, per spec.md's Assumptions. See
`quickstart.md` for the exact runnable steps.

**Target Platform**: Web — server-rendered Next.js pages hydrated client-side; every
evergreen desktop and mobile browser. The touch-target and mobile-nav fixes are specifically
mobile-viewport-relevant (375×812, 414×896); the language-switcher fix and the focus-trap
correctness are viewport-independent.

**Project Type**: Existing single Next.js web application (not a new project or module) —
this slice adds no new route, package, or top-level directory.

**Performance Goals**: No explicit new target. Must not regress existing page-load or
interaction performance: no new network request, no new dependency, no new render-blocking
resource. The touch-target fixes are pure CSS; the focus trap is a small `keydown` listener
scoped to while the overlay is mounted (removed on unmount/close), not a persistent
document-wide listener when the menu is closed.

**Constraints**: No new dependency (explicit operator constraint — if the focus trap needed
one, this plan would stop and ask; it doesn't, see "Focus-trap approach" below). No public
URL, route, or page-structure change (standing rule 002 / FR-013). Rendered metadata
byte-identical before/after (SC-006/FR-014). Live production site — changes ship as a normal
slice through the existing build/deploy path, nothing about deployment mechanics changes.

**Scale/Scope**: 3 files touched as expected by the operator's constraint list, plus one new
small hook file used exclusively by one of those three — see justification below. No admin
surface, no database, no API route touched.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design — see bottom of
this section.*

| Principle | Check | Result |
|---|---|---|
| I. Diagnosis Before Solution | Every defect this plan fixes was independently re-verified live at Gate 1 (PV-1 through PV-4), not taken on the audits' word alone. No fabricated metric or capability appears anywhere in this plan. | **PASS** |
| II. Locked Decisions Are Locked | Nothing here touches architectural decisions 001-012 (routing, auth, database, rendering strategy). Pure client-side UI/accessibility behavior inside existing components. | **PASS — N/A, no conflict** |
| III. Verify Before Declaring Done | Quality gate for this slice: `npm run check` (typecheck), `npm run lint`, `npm run build` all zero-exit, plus spec.md's own SC-001 through SC-006 verified live against `next start`, per `quickstart.md`. Implementer's own "it works" is not acceptance — operator verification against these criteria is. | **PASS** |
| IV. Scope Discipline | PV-4 found 11+2 additional undersized controls, including two on the public `/solutions` page. None is touched here; all are reported in `docs/decision-016-touch-target-backlog.md` instead of silently fixed or silently dropped. | **PASS** |
| V. URL Preservation (standing rule 002) | FR-013. Zero routes, paths, or page structures change. All three fixes are attribute/class/behavior changes inside existing components. | **PASS** |
| VI. Security Is Not Convenience | N/A — no auth, session, or credential-handling code is touched. | **PASS — N/A** |
| VII. Bilingual By Architecture | FR-007/FR-012. All three touched components are single shared files parameterized by a `language` prop, rendered into both the `(en)` and `ar` layout trees from the same source — there is structurally no way for one language to receive a fix the other doesn't, short of writing language-conditional code (which none of these three fixes do). | **PASS** |

No violations. **Complexity Tracking is empty** — nothing here required a justified deviation
from a simpler alternative.

*Post-Phase-1 re-check: unchanged — Phase 1 design (below) did not introduce any new
dependency, route, or architectural surface that would change any row above.* **PASS.**

## Focus-trap approach (no new dependency)

A small custom hook, `useFocusTrap`, following this repo's existing pattern for
single-purpose browser-interaction hooks under `lib/hooks/` (see `use-in-view.ts`,
`use-action-attempt.ts` — both native-API, dependency-free, with a short rationale comment).

- **Signature**: `useFocusTrap(leadingRef: RefObject<HTMLElement>, containerRef: RefObject<HTMLElement>, active: boolean, onEscape: () => void)`.
  `leadingRef` is the toggle button; `containerRef` is the overlay `<div>` whose focusable
  descendants form the rest of the trapped set; `onEscape` is called when Escape is pressed
  anywhere within the trapped set (the consumer decides what closing means — see below).
  **Corrected at this gate** — the first version of this plan gave the hook a single
  `containerRef` scoped to the overlay only, which excluded the toggle button from the trap
  entirely. That was wrong: the toggle button *is* the overlay's close affordance (its
  accessible label becomes "Close menu" while open, confirmed at Gate 1's PV-2), and a
  keyboard user must be able to reach and activate it by Tab, not only by Escape. The
  corrected design folds the toggle into the trapped set instead of routing around it.
- **A second, related correction surfaced while fixing the first one**: the toggle button is
  a *sibling* of the overlay div in the DOM (both children of `<nav>`, neither nested inside
  the other), not a descendant of it. A keydown listener attached only to the overlay div —
  which is how Gate 2's design described Escape-handling, relying on bubbling — would never
  fire while focus is on the toggle button itself, since a keydown there bubbles up through
  the toggle's own ancestor chain, not through the overlay's. This was a latent gap in the
  Gate 2 design too (focus sits on the toggle right after opening, before any Tab press), but
  the Gate 3 correction makes it load-bearing, since the toggle is now a reachable resting
  point during normal Tab traversal, not just a momentary starting point. Fixed by having the
  hook itself attach its listener to **both** `leadingRef.current` and `containerRef.current`
  (two `addEventListener` calls, same handler, both cleaned up together) rather than relying
  on DOM nesting/bubbling from a single attachment point.
- **Mechanism**: while `active` is true, via `useEffect`, attaches one `keydown` listener each
  to the toggle button and the overlay container (cleaned up on `active` becoming false or
  unmount). The shared handler:
  - On `Escape`: calls `onEscape()` and returns — the hook does not decide what "close" means
    or where focus goes afterward; see below.
  - On `Tab`: builds the trapped set as
    `[leadingRef.current, ...containerRef.current.querySelectorAll('a[href], button:not([disabled])')]`
    — the toggle button first (it precedes the overlay in DOM order), then the overlay's own
    focusable descendants in their existing DOM order (cheap to recompute each keypress — 9
    items total, no need to cache):
    - If moving forward (no Shift) and `document.activeElement` is the **last** element of
      the trapped set (the overlay's last item, the language switcher), `preventDefault()`
      and focus the **first** element (the toggle button).
    - If moving backward (`Shift+Tab`) and `document.activeElement` is the **first** element
      of the trapped set (the toggle button), `preventDefault()` and focus the **last**
      element (the overlay's last item).
    - Otherwise, does nothing — the browser's native Tab order handles every in-between step
      correctly on its own, including the toggle-button-to-first-overlay-item transition in
      both directions, since the toggle is already DOM-adjacent to the overlay and needs no
      interception there. The hook only needs to intervene at the two true wrap boundaries.
  - Every other key: does nothing.
- **Why this is sufficient and correct**: the trapped set (toggle + 8 overlay items = 9,
  confirmed live at Gate 1's PV-2) is a flat, static list in DOM order for the lifetime of
  one "open" session; there's no nested dialog, no dynamically appearing/disappearing item
  while open. A boundary-only trap over that full set is the standard, minimal
  implementation of the ARIA Authoring Practices Guide's dialog pattern — which explicitly
  includes a dialog's own close control inside its tab cycle — and needs no external library.
  Dual-attaching the same handler to both DOM regions is the direct, minimal fix for the
  sibling/bubbling gap above — no shared ancestor wrapper, no restructuring of `site-header.tsx`'s
  existing JSX layout.
- **Alternative considered and rejected**: a `focus-trap-react` or similar npm package. Not
  needed — the boundary-only pattern above is a well-established ~20-line implementation, and
  adding a dependency for it would violate the operator's explicit no-new-dependency
  constraint for something this contained.
- **Alternative considered and rejected** (for the sibling/bubbling gap specifically):
  attaching a single listener to `<nav>` (the closest common ancestor of the toggle and the
  overlay) instead of two listeners. Rejected — `<nav>` also contains the logo link and the
  desktop-only nav/CTA/language-switcher markup (`hidden md:flex`, present in the DOM even
  though not displayed at mobile widths). `querySelectorAll` does not respect `display: none`,
  so a single `<nav>`-scoped query would pull those hidden desktop elements into the computed
  trapped set and corrupt the first/last boundary calculation. Two narrowly-scoped listeners
  avoid that entirely.
- **What stays outside the hook**: focus-return-to-toggle (FR-005) and what "closing" actually
  does to `isMobileMenuOpen` state remain the *consumer's* responsibility, passed in as
  `onEscape`. `site-header.tsx` supplies
  `onEscape={() => { setIsMobileMenuOpen(false); toggleButtonRef.current?.focus(); }}` — the
  same function reference the toggle button's own `onClick` uses for the toggle-close path.
  This state-machine-specific logic (which boolean to flip, which ref to focus) has exactly
  one caller — folding it into the hook as a hardcoded behavior, rather than an injected
  callback, would be premature abstraction for a codebase with a single mobile-nav overlay
  (constitution IV: YAGNI as active discipline). The hook owns *only* "where should keyboard
  focus be allowed to go, and who should be told about Escape" — not "what closing means."

## Overlay open/closed state exposure (FR-006)

Two complementary signals, both already partially present:

1. **The toggle button already carries `aria-expanded={isMobileMenuOpen}`**
   (`site-header.tsx:91`, pre-existing, unchanged by this slice) — this is the primary,
   correct mechanism for a disclosure/toggle button's state and needs no change.
2. **The overlay gains `role="dialog"` and `aria-modal="true"`** when it renders. Because the
   overlay is already conditionally rendered (`{isMobileMenuOpen && (<div>...)}`) rather than
   always-present-but-hidden, its very presence/absence in the DOM already communicates
   open/closed to assistive technology structurally — adding `role="dialog" aria-modal="true"`
   makes that state *explicit* and *typed* (a screen reader announces entering a modal dialog
   context, not just "some new content appeared"), which is what FR-006 asks for beyond what
   already existed.
3. **Accessible name for the dialog**: a small bilingual constant local to
   `site-header.tsx`, following the exact precedent already in
   `language-switcher.tsx`'s `A11Y_TOGGLE_LABEL` (a hardcoded `Record<Language, string>`, not
   routed through a new i18n system), consumed as `aria-label` on the overlay. No new prop
   needed — `language` is already a required prop of `SiteHeader`.
- **Alternative considered and rejected**: `aria-controls` linking the toggle button to the
  overlay's `id`. Not required by any FR (FR-006 only asks for accurate state exposure, which
  `aria-expanded` + `role="dialog"`/`aria-modal` already deliver) and would be additional
  surface for zero required behavior — left out to keep the diff minimal, per Scope
  Discipline. Can be added later if a concrete need surfaces.

## Touch-target technique (FR-008/FR-009/FR-010/FR-011)

Two different techniques, chosen per control because the two controls are built differently
today:

- **Hamburger/close toggle** (`site-header.tsx:87-95`): its 40×40 box is entirely
  padding-derived (`p-2` = 8px around a `h-6 w-6` = 24px icon: 8+24+8=40). Growing the
  padding value grows the tappable box directly while the icon's own visual size (`h-6 w-6`)
  stays exactly as-is — the simplest, most direct match to "grow the hit area via padding,"
  which is the technique the carried-forward decision already named. The button sits as the
  trailing flex item in a `justify-between` row with nothing to its right, so the extra
  padding extends the box leftward, toward empty space — not toward the logo or off the
  viewport edge (confirmed by the existing measured geometry at Gate 1: the button's right
  edge already sits flush with the header's inner content boundary).
- **Footer newsletter submit button** (`newsletter-form.tsx:24-36`): its 40×40 box is a fixed
  `h-10 w-10` utility, not derived from padding around its `h-4 w-4` (`Send`) icon — there's
  visible empty space inside the button already, so growing padding would either do nothing
  (padding inside a fixed-height box doesn't grow the box) or require removing the fixed
  size (which *would* change the visible box, contradicting FR-010). Instead: an invisible
  pseudo-element (`::after`) hit-area expansion — `position: relative` on the button,
  `position: absolute` + a negative `inset` on the pseudo-element, sized so the *tappable*
  region clears 44×44 while the *visible* button (background, border-radius, icon) stays
  exactly `h-10 w-10` as today. This is a standard, dependency-free CSS technique (no JS)
  for exactly this situation — a design-mandated small visible control with WCAG's larger
  tappable-area requirement.
- **Both techniques are pure CSS class changes** — no new markup nodes, no new client-side
  JS, satisfying FR-011 (no overflow/layout-shift risk) by construction: neither an increased
  `padding` value nor an `absolute`-positioned pseudo-element with `inset` participates in
  document flow or affects sibling layout. This still needs empirical confirmation at
  implementation time (per the spec's edge cases and FR-011) — the reasoning here establishes
  *why* it should be safe, not a substitute for measuring it.
- Exact utility values (e.g. which Tailwind padding step) are left to implementation —
  the requirement is "≥44×44, confirmed by live measurement," not a specific class name; if
  the first attempt lands at exactly 44 and live measurement shows sub-pixel rounding under
  that floor, the next step up is a one-line adjustment, not a design change.

## Known Interaction verification (Mob2, do not worsen)

No design change is needed here — spec.md's "Known Interaction" section already establishes
the reasoning (the toggle only renders below 768px; Mob2 occurs at 768px and above; the two
don't share a code path). This plan schedules the confirmation as a verification step in
`quickstart.md` (before/after measurement of the AR header at 768px), not as a design
decision — there is nothing to design here, only something to check.

## Project Structure

### Documentation (this feature)

```text
specs/015-a11y-defect-fixes/
├── spec.md               # Gate 1 output, corrected at this gate (FR-005/FR-005a split)
├── plan.md               # This file (Gate 2 output)
├── research.md           # Phase 0 output (this gate)
├── data-model.md          # Phase 1 output (this gate) — no new entities; documents why
├── quickstart.md          # Phase 1 output (this gate) — the live verification script
├── checklists/
│   └── requirements.md   # Gate 1 output, unchanged by this gate
└── tasks.md               # Phase 2 output — NOT created by this gate
```

No `contracts/` directory: this feature exposes no external interface (no new API route, no
CLI, no public contract of any kind) — three internal UI components change their own
attributes and behavior. Per the plan workflow's own rule ("skip if project is purely
internal"), `contracts/` is deliberately not created rather than created empty.

### Source code (repository root)

This is an existing Next.js 16 App Router project — no new project, package, or top-level
directory is introduced. The concrete files this slice touches:

```text
components/
├── language-switcher.tsx      # FR-001/FR-002 — swap the two A11Y_TOGGLE_LABEL values
├── site-header.tsx            # FR-003–FR-011 (nav overlay) — focus trap wiring, Escape
│                               #   handler, focus-return refs, role="dialog"/aria-modal,
│                               #   dialog aria-label constant, toggle padding increase
└── newsletter-form.tsx        # FR-009/FR-010/FR-011 — pseudo-element hit-area expansion
                                #   on SubmitButton

lib/hooks/
└── use-focus-trap.ts          # NEW — see "Beyond the three expected files" below
```

**Structure Decision**: no structural change to the repository. All work happens inside the
existing `components/` and `lib/hooks/` directories, using the existing per-file conventions
already established there (`"use client"` components taking a `language: Language` prop;
small hooks under `lib/hooks/` with a short rationale comment, following `use-in-view.ts`'s
and `use-action-attempt.ts`'s existing shape).

### Beyond the three expected files

The operator's constraint list named three expected files: the language switcher, the mobile
nav/header, and the footer newsletter control. `lib/hooks/use-focus-trap.ts` is a fourth. It
is justified here explicitly, as required:

- It has exactly one consumer — `site-header.tsx` — and exists only because that file's own
  focus-trap logic (the boundary-check-and-redirect `keydown` handling described above) is
  self-contained browser-interaction logic that this repo's existing convention
  (`lib/hooks/use-in-view.ts`, `lib/hooks/use-action-attempt.ts`) extracts into its own file
  rather than inlining into the component. It is not a second component being fixed — it is
  an implementation detail of fixing `site-header.tsx`, factored out for the same reason the
  two existing hooks were.
- **Alternative considered**: inline the trap logic directly inside `site-header.tsx` instead
  of extracting a hook, to keep the changed-file count at exactly three. Rejected — it would
  read against the grain of this repo's own established pattern for this exact kind of logic,
  and `site-header.tsx` would grow a second, unrelated `useEffect` mixed in with its existing
  scroll-listener effect and state, making the diff harder to review, not easier. A four-file,
  pattern-consistent diff is judged preferable to a three-file, pattern-inconsistent one.
  Flagged here so the operator can override this judgment call before Gate 3 if preferred.

## Complexity Tracking

*Empty — the Constitution Check above found no violations requiring justification.*
