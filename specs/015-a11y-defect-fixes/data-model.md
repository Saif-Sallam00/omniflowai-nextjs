# Phase 1 Data Model: Accessibility Defect Fixes (Phase 6, Slice 6.1)

**No new data entities.** This slice fixes accessibility attributes and client-side
interaction behavior in three existing UI components. Nothing here reads from, writes to, or
shapes the database, an API payload, or any persisted or transmitted structure. This file is
produced anyway, as the workflow's Phase 1 output, to state that explicitly rather than leave
the absence ambiguous.

## What does exist: ephemeral client-side UI state (not a data model)

For completeness, the pieces of in-memory state this slice touches or adds, none of which
is a data *entity* in any modeling sense — all of it is transient, component-local React
state and DOM references that exist only while a page is open in a browser tab:

- `isMobileMenuOpen: boolean` — pre-existing `useState` in `site-header.tsx`. Unchanged by
  this slice; the fix consumes it (to know when the trap and dialog semantics should be
  active) but does not alter its shape or where it lives.
- `toggleButtonRef: RefObject<HTMLButtonElement>` — new. Serves two purposes: passed to
  `useFocusTrap` as `leadingRef` (the toggle is part of the trapped set, corrected at Gate 3 —
  it is no longer excluded), and used directly to call `.focus()` on the toggle button when
  the overlay closes via Escape or via the toggle itself (FR-005). One ref, two consumers of
  it (the hook and the component's own close logic), not two separate refs.
- `overlayRef: RefObject<HTMLDivElement>` — new. Passed to `useFocusTrap` as `containerRef`,
  whose focusable descendants form the rest of the trapped set (alongside the toggle button
  via `toggleButtonRef`/`leadingRef` above). Not read or written anywhere else.
- `A11Y_TOGGLE_LABEL` (`language-switcher.tsx`) and the new dialog-name constant
  (`site-header.tsx`) — both are `Record<Language, string>` literals, i.e. static bilingual
  copy, not data in the modeling sense (no identity, no lifecycle, no persistence).

None of the above has validation rules, relationships, or state transitions in the sense this
document's template section asks about — a boolean toggling and a `focus()` call are
UI-interaction behavior, not entity state transitions.
