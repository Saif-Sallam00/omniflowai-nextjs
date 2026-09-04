# Phase 0 Research: Accessibility Defect Fixes (Phase 6, Slice 6.1)

No `[NEEDS CLARIFICATION]` markers were carried into this plan from `spec.md` — the input
document (`docs/phase-6-slice-6-1-spec.md`) had already resolved the open questions that
would otherwise have produced them (touch-target technique, bilingual simultaneity,
keyboard-verification method, no-new-dependency rule). What follows are the
implementation-level decisions this plan still had to make to turn spec.md's requirements
into a concrete, dependency-free design.

## R1 — Decision: swap two string values, nothing else

- **Decision**: `components/language-switcher.tsx:19-22`'s `A11Y_TOGGLE_LABEL` map has its
  `en` and `ar` values swapped in place. No other line in the file changes.
- **Rationale**: the defect is exactly and only this — confirmed at Gate 1 by reading the
  source and the two live-rendered `aria-label` attributes. `href`, visual markup, and
  navigation logic are all already correct.
- **Alternatives considered**: routing the labels through a proper i18n system instead of a
  hardcoded map. Rejected — the file already has a comment stating this is a deliberate
  choice (`// Hardcoded literals in the source design, not i18n keys.`), the repo has no i18n
  framework, and introducing one to fix a two-value swap would be a significant, unjustified
  scope expansion for a correctness slice (constitution IV).

## Focus trap — Decision: boundary-only Tab interception, no library

- **Decision**: see plan.md's "Focus-trap approach" section for the full design. Summary:
  a small `useFocusTrap(leadingRef, containerRef, active, onEscape)` hook under `lib/hooks/`,
  native `keydown` listeners attached to *both* `leadingRef.current` (the toggle button) and
  `containerRef.current` (the overlay) — not just one — intercepting only the two Tab
  boundary cases (Tab past the last overlay item wraps to the toggle, Shift+Tab past the
  toggle wraps to the last overlay item) plus Escape (delegated to the caller via
  `onEscape`), doing nothing on every other keypress.
- **Rationale**: the trapped set is static and flat — toggle button + 8 overlay items = 9,
  confirmed live at Gate 1; the toggle's inclusion was corrected at Gate 3, see plan.md's
  "Correction applied at Gate 3" — for the duration of one "open" session — no nested
  dialogs, no dynamic insertion/removal while open. A boundary-only trap is the
  well-established minimal implementation of the ARIA
  Authoring Practices Guide's dialog pattern and requires no external state beyond "which
  element is focused right now," which the DOM already tracks via `document.activeElement`.
- **Alternatives considered**:
  - **`focus-trap-react` (or similar npm package)**: rejected per the operator's explicit
    no-new-dependency constraint. Also unnecessary — the problem this class of library solves
    (nested/dynamic focusable sets, portals, SSR hydration timing) doesn't apply here; this is
    a flat list inside one always-client-rendered overlay.
  - **`inert` attribute on everything outside the overlay** (e.g. `<main inert={isOpen}>`)
    instead of a keydown-based trap: considered as a *complementary*, not alternative,
    technique — `inert` (native DOM API since 2022-era browsers, no dependency) would also
    remove background content from the tab order and from screen-reader browse mode.
    **Not adopted in this plan** because `aria-modal="true"` on the overlay already
    communicates modality to assistive technology (see FR-006 section), and adding `inert`
    to `<main>` conditionally would touch a **fourth-plus component boundary** (the page
    content wrapper, which `SiteHeader` doesn't currently have a reference to — it would
    require threading a ref or restructuring `SiteShell`'s composition). The Tab/Shift+Tab
    keydown trap alone fully satisfies FR-003 (no page content behind the overlay receives
    focus via Tab — the trap boundary is the toggle plus the overlay's own items) without
    that structural change. Flagged here as a considered-but-deferred
    enhancement, not a gap: if a future need for `inert` emerges (e.g. background content
    interactivity via non-Tab means), it's a separate, explicit decision, not something this
    slice is quietly leaving half-done.
  - **`document`-level Escape listener** instead of the two narrowly-scoped listeners
    described above: considered and rejected, but the *reasoning* changed at Gate 3. The
    original reasoning ("focus is always inside the overlay, so a single handler on the
    overlay div catches everything via bubbling") turned out to be wrong once the toggle
    button — a DOM *sibling* of the overlay, not a descendant — became a valid resting point
    for focus: an Escape press while focus is on the toggle never bubbles through the
    overlay's subtree at all. A `document`-level listener would technically solve that (it
    sees every keydown regardless of bubbling path), but was still rejected in favor of the
    two-element attachment described in plan.md — a document-wide listener would also need to
    filter out Escape presses that happen while the menu is closed or while focus is
    elsewhere on the page entirely, adding a condition a narrowly-scoped pair of listeners
    doesn't need.

## FR-006 (state exposure) — Decision: `role="dialog"` + `aria-modal="true"` + existing `aria-expanded`

- **Decision**: see plan.md's "Overlay open/closed state exposure" section.
- **Rationale**: `aria-expanded` on the toggle button is already correct and pre-existing
  (confirmed at Gate 1, unaffected by this slice). What's missing is that the overlay itself,
  when present, doesn't identify itself as a modal surface to assistive technology beyond
  simply "new DOM content appeared." `role="dialog"` + `aria-modal="true"` is the standard
  ARIA vocabulary for exactly this, is supported by all major screen readers, and requires no
  JavaScript beyond the attributes themselves (they're already conditionally rendered along
  with the rest of the overlay div, since the whole block only mounts when
  `isMobileMenuOpen` is true).
- **Alternatives considered**: `aria-controls` linking button→overlay by `id`. Not required
  by any FR; left out per Scope Discipline — see plan.md for the full note.

## Touch targets — Decision: two different techniques, chosen per control's existing box model

- **Decision**: see plan.md's "Touch-target technique" section. Padding increase for the
  hamburger toggle (already padding-derived box); pseudo-element (`::after`, absolute
  position, negative inset) hit-area expansion for the newsletter submit button (fixed
  `h-10 w-10` box, not padding-derived).
- **Rationale**: "grow the hit area, not the visual size" (carried-forward decision) has two
  different correct implementations depending on how a control's current visible box is
  constructed. Padding only grows a box that has no fixed dimension fighting it; a box with
  an explicit fixed size needs the hit area extended *outside* its own visible bounds instead,
  which a pseudo-element with negative `inset` does without adding a DOM node or touching
  layout flow.
- **Alternatives considered**:
  - **Just changing `h-10 w-10` to `h-11 w-11`** (44px) on the newsletter button: rejected —
    this changes the *visible* box (a slightly larger button), which the carried-forward
    decision explicitly says to avoid when hit-area growth is achievable by other means, and
    it is.
  - **A wrapping `<span>` element sized 44×44 around the newsletter button** instead of a
    pseudo-element: functionally equivalent, but adds a real DOM node for a purely
    presentational concern the pseudo-element handles without one. Pseudo-element preferred
    as the smaller diff.
  - **`min-h-[44px] min-w-[44px]`** on the hamburger toggle instead of increasing `p-2`:
    would work equally well arithmetically, but expresses the same intent less directly than
    a padding change on a control whose box is already 100% padding-derived — padding was
    chosen as the more legible diff, not because the alternative is wrong.

## Metadata non-regression (FR-014/SC-006) — Decision: no research needed, verification-only

None of the three touched files renders, reads, or influences `<head>` metadata, JSON-LD,
sitemap entries, or robots directives — `language-switcher.tsx`, `site-header.tsx`, and
`newsletter-form.tsx` are all interactive body-content components. This is stated here as a
research finding (nothing to design) rather than skipped silently: SC-006 is satisfied by the
fact that these files are architecturally disconnected from metadata generation, and
`quickstart.md` still includes an explicit byte-diff verification step rather than relying on
this reasoning alone (consistent with this slice's own "verify, don't assume" standard).

## Known Interaction (Mob2) — no design decision required

Covered in plan.md directly — this is a verification step (confirm the reasoned expectation
holds), not something requiring a design choice. Recorded here only to note explicitly that
Phase 0 did not skip it; it simply produced no design output because none was needed.
