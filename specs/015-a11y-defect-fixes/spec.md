# Feature Specification: Accessibility Defect Fixes (Phase 6, Slice 6.1)

**Feature Branch**: `015-a11y-defect-fixes`

**Created**: 2026-09-03

**Status**: Draft

**Input**: User description: "docs/phase-6-slice-6-1-spec.md" — Slice 6.1 of the Phase 6 correctness
pass. Fixes four accessibility defects found by two prior design-audit passes
(`docs/phase-6-design-audit.md` finding R1; `docs/phase-6-design-audit-mobile.md` findings
Mob4, Mob5, Mob9), all in shipped, live-production code. This is a correctness slice — no
visual-design direction is proposed or implied by either audit or by this spec.

## Pre-Work Verification (confirmed before this spec was written)

The four defects below were independently re-confirmed live (not re-quoted from the audits)
immediately before this spec was drafted, per the blocking pre-work the input document
requires:

- **Language-switcher label**: source values read directly from
  `components/language-switcher.tsx:17-20` and the rendered `aria-label` attribute read
  live on a served English page and a served Arabic page. Both the source values and the
  two rendered values confirm the swap described in R1.
- **Mobile nav keyboard behavior**: verified by operating a real keyboard (Tab, Shift+Tab,
  Enter, Escape) against a running instance at 375×812, in both languages — not by reading
  the component's source and inferring behavior. Confirmed: opening the overlay and
  continuing to Tab moves focus into page content behind the overlay (7 elements, matching
  Mob9's count, in both languages); Escape does not close the overlay, in either language.
- **Touch target dimensions**: measured live via the rendered bounding box of each control
  at 375×812 and 414×896, in both languages (8 measurements total). Both controls measure
  40×40px in every one of the 8 combinations — confirming Mob4 and Mob5 with no drift from
  the audit's quoted numbers.
- **Repo-wide scope check**: a full-repository search (all directories, not only the ones
  this slice expects to touch) for other interactive controls that might share the
  under-44×44px pattern found 11 additional confirmed instances and 2 borderline ones,
  entirely outside the four defects this slice addresses — see "Out of Scope" below. This
  check exists because a prior slice's narrower-scoped search missed a real consumer and
  produced a fact that had to be retracted mid-implementation; this slice does not repeat
  that mistake, and does not silently expand scope to cover what it found either.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Screen-reader user hears the language switcher announce itself correctly (Priority: P1)

A visitor using a screen reader, on either the English or the Arabic site, tabs to the
language-switcher control. The control's entire purpose is offering to switch languages —
its spoken label should be intelligible in the language the visitor is currently reading,
and should describe what activating it does.

**Why this priority**: This is the single sharpest defect of the four — the control whose
job is language handling currently announces itself in the *wrong* language on both sites.
It affects every screen-reader user, on every public page, in both languages, on every
visit, with no workaround.

**Independent Test**: Load any public page in English with a screen reader (or by reading
the rendered `aria-label` attribute), reach the language switcher, and confirm the
announced label is in English and describes switching to Arabic. Repeat on the Arabic
site, confirming an Arabic label describing switching to English. Fully testable without
touching the other three defects.

**Acceptance Scenarios**:

1. **Given** a visitor is on any public English page, **When** a screen reader (or
   assistive-technology inspection) reaches the language-switcher control, **Then** the
   announced label is written in English and describes switching to Arabic.
2. **Given** a visitor is on any public Arabic page, **When** a screen reader (or
   assistive-technology inspection) reaches the language-switcher control, **Then** the
   announced label is written in Arabic and describes switching to English.
3. **Given** the label text has changed, **When** the control is inspected visually or its
   navigation behavior is tested, **Then** nothing else about the control — appearance,
   position, or the page it links to — has changed.

---

### User Story 2 - Keyboard-only visitor can open, operate, and close the mobile menu without losing their place (Priority: P2)

A visitor navigating by keyboard alone (no mouse, no touch) opens the mobile navigation
menu on a phone-width screen. While the menu is open, they expect the Tab key to move them
only among the menu's own items — including its own visible close button — and the Escape
key to close the menu and return them exactly where they started — the standard behavior of
every other overlay/dialog on the web. Currently, continuing to Tab carries them past the
menu into page content that is still visually hidden underneath it, and Escape does nothing.

**Why this priority**: Without this fix, a keyboard-only visitor who opens the menu has no
reliable way to either finish exploring it or escape it — they can tab forever into content
they cannot see, with no keyboard shortcut back. This is a hard usability wall for the
specific group of visitors it affects, on both language sites.

**Independent Test**: With a mouse disconnected (or simply not used), open the mobile menu
at a phone-width viewport, Tab repeatedly, and confirm focus never lands on page content
behind the overlay — it stays within the menu's own items and its own close button (the
toggle control, which is visibly labeled "Close menu" while the overlay is open); press
Escape and confirm the menu closes and focus lands back on the button that opened it. Repeat
in Arabic. Fully testable without touching the other three defects.

**Acceptance Scenarios**:

1. **Given** the mobile menu is open and the visitor's focus is on the last item inside the
   overlay (the language switcher), **When** the visitor presses Tab, **Then** focus wraps
   forward to the toggle control (the menu's own close button, DOM-adjacent to and
   immediately preceding the overlay) — it never lands on page content behind the overlay.
2. **Given** the mobile menu is open and the visitor's focus is on the toggle control,
   **When** the visitor presses Shift+Tab, **Then** focus wraps backward to the last item
   inside the overlay (the language switcher) — it never lands on page content behind the
   overlay, and it never lands on anything that was focusable on the page *before* the menu
   was opened (e.g., the logo link), since those are not part of the trapped set either.
3. **Given** the mobile menu is open, **When** the visitor Tabs or Shift+Tabs between the
   toggle control and the overlay's own items (not at either wrap boundary), **Then** focus
   moves through them in their natural DOM order — toggle, then each overlay item in reading
   order — exactly as an untrapped page would behave; the trap only intervenes at the two
   wrap points in scenarios 1-2.
4. **Given** the mobile menu is open, **When** the visitor presses Escape, **Then** the menu
   closes and keyboard focus returns to the toggle control.
5. **Given** the mobile menu is open, **When** the visitor reaches the toggle control (either
   immediately, since it has focus right after opening the menu, or by Tabbing/Shift+Tabbing
   to it per scenarios 1-3) and activates it, **Then** the menu closes and keyboard focus
   remains on that same control. This is the menu's own discoverable close affordance — a
   keyboard user can always reach and activate it by Tab alone, without needing to already
   know the Escape shortcut, and a screen-reader user in browse mode who encounters its
   "Close menu" label can act on it directly.
6. **Given** the mobile menu is open, **When** the visitor selects a navigation item, **Then**
   the menu closes as part of navigating to the selected destination, and standard
   route-change focus behavior applies — focus is **not** required to return to the toggle
   control, since the visitor has left the page that control lived on. See FR-005a; this is
   a deliberate carve-out, not an inconsistency with scenarios 4-5.
7. **Given** the site is in Arabic, **When** scenarios 1-6 are repeated, **Then** they behave
   identically — the reading direction is mirrored visually, but the trap boundary (toggle
   plus overlay items, background content excluded), the wrap points, Escape behavior, and
   the focus-return distinction between closing-in-place (4-5) and closing-via-navigation (6)
   are the same.

---

### User Story 3 - Touch-only visitor can reliably tap the mobile menu button and the newsletter signup button (Priority: P3)

A visitor on a phone taps the hamburger icon to open site navigation, or taps the submit
button next to the newsletter email field in the footer. Both controls currently occupy a
tappable area slightly smaller than the accepted minimum for a touch target, making them
marginally harder to hit precisely — especially for visitors with larger fingers, motor
impairments, or simply typical touchscreen imprecision.

**Why this priority**: Real but modest — both controls are close to the minimum already and
are generally hittable today, so this doesn't block visitors the way User Story 2 does. It's
still a live, site-wide defect worth closing, since the hamburger button is the *only* way
to reach site navigation on a phone.

**Independent Test**: At a phone-width viewport, measure the rendered tappable area of the
hamburger/close toggle and of the footer newsletter submit button; confirm each is at least
44×44px. Repeat at a second phone width and in both languages. Fully testable without
touching the other three defects.

**Acceptance Scenarios**:

1. **Given** a visitor is on any public page at a phone-width viewport where the hamburger
   menu renders, **When** the tappable area of the hamburger/close toggle is measured,
   **Then** it is at least 44×44px.
2. **Given** a visitor is on any public page at a phone-width viewport, **When** the tappable
   area of the footer newsletter submit button is measured, **Then** it is at least 44×44px.
3. **Given** either control's tappable area has grown to meet the minimum, **When** the
   control is viewed, **Then** its visible size and appearance are unchanged — only the
   tappable area around it has grown.
4. **Given** the site is in Arabic, **When** scenarios 1-2 are repeated, **Then** both
   controls meet the same 44×44px minimum, at the same viewports.

---

### Edge Cases

- What happens when a keyboard user opens the mobile menu — focus lands on the toggle control
  itself, since that's what they just activated — and immediately presses Shift+Tab without
  ever pressing Tab forward first? The toggle is the first element of the trapped set (it
  precedes the overlay's items in DOM order), so this must wrap focus to the *last* item
  inside the overlay (the language switcher), not escape backward to whatever was focusable
  on the page before the menu opened (e.g., the logo link).
- Conversely, what happens when focus is on the last item inside the overlay and the visitor
  presses Tab forward? Focus must wrap to the toggle control — not to the first overlay item,
  and not out to page content behind the overlay. The toggle is the trap's designated "first"
  position precisely because it's DOM-adjacent to and precedes the overlay.
- What happens when the mobile menu is closed via Escape or by activating the toggle control
  while focus is deep inside the overlay (e.g., on the language-switcher item, the last one)?
  Focus must still return to the toggle control, not be lost to the document body. This does
  **not** apply to closing by selecting a navigation item — see FR-005a: once the visitor has
  navigated to a new route, there is no longer a "the button that opened the menu" on the
  page they're now on to return focus to.
- What happens at the 768px width, where the hamburger toggle does not render at all (the
  desktop nav row is used instead)? The touch-target requirement for the toggle does not
  apply there — there is nothing to measure. This width is already known to have a separate,
  out-of-scope Arabic-only clipping defect (Mob2); this slice must not make that defect
  worse (see "Known interaction" below).
- What happens if enlarging either control's tappable area causes it to visually or
  functionally overlap an adjacent element (the logo next to the hamburger button, or the
  email input next to the newsletter submit button)? This must not happen at any of the
  three mobile/tablet viewports, in either language — no new overlap, overflow, or clipping.
- What happens to the mobile menu's Tab order under Arabic's right-to-left layout, where the
  menu's items are visually mirrored? Tab order must still follow the logical reading order,
  not the mirrored visual position.

## Known Interaction — Verify, Do Not Assume

A separate, already-known, and explicitly out-of-scope defect (Mob2: the Arabic header's
"Book a strategy call" button renders partly off-canvas at exactly 768px width) exists
independent of anything in this slice. The hamburger toggle this slice touches only renders
*below* 768px, and Mob2 occurs *at and above* 768px, so the two are not expected to
interact. This expectation must be confirmed, not assumed: the 768px Arabic header must be
checked before and after this slice's changes ship, and any worsening of the existing clip
must be reported, even though fixing it is out of scope.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The language-switcher control MUST announce a label, in the language the
  visitor is currently reading, that describes switching to the other language.
- **FR-002**: No other property of the language-switcher control (appearance, position,
  behavior, or navigation destination) may change as a result of fixing FR-001.
- **FR-003**: While the mobile navigation overlay is open, keyboard focus MUST stay confined
  to the trapped set — the toggle control plus the overlay's own interactive items. No page
  content behind the overlay may receive focus via Tab or Shift+Tab. The toggle control is
  part of the trapped set, not excluded from it: it is the overlay's visible, labeled close
  affordance ("Close menu"), and a keyboard user MUST be able to reach and activate it by
  Tab alone — Escape (FR-004) is a shortcut for this, not the only path to it. Concretely:
  Tab from the last overlay item wraps to the toggle control; Shift+Tab from the toggle
  control wraps to the last overlay item.
- **FR-004**: Pressing Escape while the mobile navigation overlay is open MUST close it.
- **FR-005**: When the mobile navigation overlay is closed by Escape or by the toggle
  control itself, keyboard focus MUST return to the control that opened it. When the overlay
  is closed by selecting a navigation item, this does not apply — see FR-005a.
- **FR-005a**: Selecting a navigation item closes the overlay as a side effect of navigating
  to the selected route. Focus is NOT required to return to the (now-superseded) toggle
  control on the new page; standard route-change focus behavior applies instead. This is a
  deliberate carve-out, not an oversight: the overlay's opening control lives in a header
  that persists across navigation, but "restore focus to where the *previous* page's overlay
  was opened" is not a coherent requirement once the route itself has changed underneath the
  visitor.
- **FR-006**: The mobile navigation overlay MUST expose accurate open/closed state to
  assistive technology at all times.
- **FR-007**: FR-003 through FR-006 MUST behave identically in English and Arabic; the
  right-to-left visual mirroring must not change the logical focus order.
- **FR-008**: The mobile menu hamburger/close toggle control MUST present a tappable area of
  at least 44×44px at every viewport where it renders.
- **FR-009**: The footer newsletter submit button MUST present a tappable area of at least
  44×44px at every viewport where it renders.
- **FR-010**: The visible (as opposed to tappable) size of the two controls in FR-008 and
  FR-009 is not required to change, and should not change, if the tappable area can be
  grown by other means.
- **FR-011**: Growing either control's tappable area MUST NOT introduce new horizontal
  overflow, new off-canvas clipping, or layout shift, at any tested mobile or tablet
  viewport, in either language.
- **FR-012**: Every change made to satisfy FR-001 through FR-011 MUST ship for English and
  Arabic at the same time — no fix may land in one language's tree without its counterpart
  in the other.
- **FR-013**: No public URL, route, or page structure may change as part of satisfying any
  of the above.
- **FR-014**: No page's rendered metadata (canonical URL, hreflang alternates, Open Graph
  tags, structured data, sitemap entry, or robots directives) may change as a result of
  satisfying any of the above.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a served English page, the language switcher's spoken/announced label is in
  English; on a served Arabic page, it is in Arabic — verified against the actual rendered
  page, in both languages (2 of 2 languages correct).
- **SC-002**: A visitor navigating the mobile menu by keyboard alone can Tab through every
  item in the menu — including the toggle control, which is part of the trap, not excluded
  from it — in either direction, without ever landing on page content hidden behind it: zero
  of the roughly seven previously-reachable background elements receive focus while the menu
  is open, confirmed in both languages.
- **SC-003**: A visitor can close the mobile menu with the Escape key, or by re-activating
  the toggle control, from any point while it is open, and their keyboard focus lands back
  on the control that opened the menu — confirmed in both languages. This criterion applies
  only to Escape-close and toggle-close; closing the menu by selecting a navigation item is
  governed by ordinary route-change focus behavior instead (FR-005a) and is intentionally
  not part of this criterion.
- **SC-004**: Both the mobile menu toggle and the footer newsletter submit button measure at
  least 44×44px at every combination of phone-width viewport and language tested (2 controls
  × 2 viewports × 2 languages = 8 of 8 combinations meeting the minimum).
- **SC-005**: No public page shows new horizontal overflow or new off-canvas clipping at any
  mobile or tablet viewport, in either language, after this work ships (0 regressions
  against the design audit's clean baseline).
- **SC-006**: Every public page's rendered canonical URL, hreflang alternates, Open Graph
  tags, structured data, sitemap entry, and robots directive are byte-identical before and
  after this work ships.

## Out of Scope

- **T1 / Mob7** (heading line-height collapse at 768px and above), **Mob2** (Arabic header
  CTA rendering off-canvas at 768px — see "Known Interaction" above, verify-don't-worsen
  only), **C2 and C3** (color-contrast failures) — all deferred to Slice 6.2, which needs
  visual verification across three viewports in both languages that this slice does not
  perform.
- **R2** (un-mirrored arrow glyph in RTL — a judgment call, not a defect), **Cmp1** (refuted
  by the mobile audit — the undersized control it named does not render below 768px), **S1**
  (sparse portfolio grid — a content state, not a defect), **C1** (`--muted-foreground` —
  confirmed dead code) — not planned in any slice, for the reasons already established in
  the source audits.
- **Every additional undersized-control candidate found by this slice's own repo-wide
  pre-work check**, none of which overlaps the four defects above: the icon-variant
  language switcher (36×36, tablet/desktop only — this is Cmp1, already out of scope); the
  shared admin button component and its ~15 call sites across articles, projects, and leads
  admin screens; the admin nav's own mobile toggle and sidebar links; a tag-removal (×)
  button and an "insert image" control in the admin article editor; three interactive
  controls inside the public `/solutions` page's diagnostic-map component; the `/portfolio`
  page's category filter tabs; two admin checkbox rows. These are genuine candidates for a
  future slice, not silently folded into this one — none is touched here.
- Any visual redesign. Whether the site needs one is a separate business decision that
  neither audit and neither slice has made.
- All postponed items from the prior implementation phase, including the database
  connection-timeout configuration issue.

## Assumptions

- The four defects fixed here are corrected by adjusting existing behavior and existing
  markup/styling only — none requires a new dependency. If satisfying FR-003 through FR-006
  (the focus-trap requirement) turns out to need a new package, that is a decision point
  requiring explicit sign-off before proceeding, not an assumption this spec resolves in
  advance.
- "Every viewport where it renders" (FR-008) is scoped to the viewports the source audits
  actually tested — 375×812 and 414×896 for the hamburger toggle, which does not render at
  768px or above. The footer newsletter button is not viewport-gated and renders at all
  widths, but the 44×44px requirement is being enforced here specifically because it's the
  mobile-touch floor; nothing about its desktop appearance is expected to need to change to
  satisfy it.
- Verification for all of the above happens against a production build (`next build` /
  `next start`), not the development server, consistent with how the rest of this phase's
  work is verified.
- The roughly seven background elements referenced in SC-002 is the count confirmed live in
  this slice's own pre-work, matching the count the mobile audit originally reported; the
  exact number is not itself a requirement — the requirement is zero reachable, whatever the
  current count of background elements happens to be.
