# Phase 6 (Correctness Pass) — Slice 6.1: Accessibility Defect Fixes

**Status:** Draft (pending operator approval)
**Version:** 0.1
**Related:** Constitution v1.0.0 (VII — Bilingual By Architecture). Sources: `docs/phase-6-design-audit.md` (finding R1), `docs/phase-6-design-audit-mobile.md` (findings Mob4, Mob5, Mob9).

## Overview

Two design-audit passes produced a defect backlog, not a visual-refresh direction. This slice ships the subset that is purely accessibility correctness and needs no cross-language visual comparison to verify. The rendering defects — heading line-height collapse, the Arabic header CTA clipping at 768px, and the two contrast failures — are deferred to Slice 6.2, which requires visual verification at three viewports in both languages.

Four defects, all in shipped code, all affecting every public page:

1. **R1** — the language switcher's `aria-label` values are swapped, so each language announces the other language's string to screen readers.
2. **Mob9** — the mobile navigation overlay has no focus trap and does not close on Escape; elements behind it remain tabbable while it is open.
3. **Mob4** — the mobile menu hamburger/close toggle is 40×40px, under the 44×44 minimum.
4. **Mob5** — the footer newsletter submit button is 40×40px, under the 44×44 minimum.

## Problem statement

R1 is the sharpest of the four: the control whose entire job is switching languages is the one announcing itself in the wrong language. A screen-reader user on the English site hears an unannounced Arabic string; on the Arabic site, an English one.

Mob9 is a standard modal-dialog failure. An overlay that traps neither focus nor Escape is not usable by keyboard, and the audit measured seven elements behind it still reachable by Tab while it was open.

Mob4 and Mob5 are the same defect in two places: interactive controls sized below the 44×44px minimum on the viewports where touch is the only input method.

## Pre-work verification (blocking)

**PV-1:** Confirm R1 by reading `components/language-switcher.tsx:17-20` and reporting the actual `A11Y_TOGGLE_LABEL` values, then confirming the rendered `aria-label` on a live EN page and a live AR page. Report all four strings — the two in source and the two rendered.

**PV-2:** Confirm Mob9 empirically at 375×812. Open the mobile nav, then: (a) Tab through and count how many elements outside the overlay receive focus, (b) press Escape and report whether the overlay closes. Do this in both EN and AR.

**PV-3:** Measure the current rendered dimensions of the hamburger/close toggle and the footer newsletter submit button at 375×812 and 414×896, in both languages. Report actual measured values, not the values quoted in the audit.

**PV-4:** Repo-wide grep — every directory — for other interactive controls that may share the Mob4/Mob5 pattern. The mobile audit measured what it could reach at three viewports; it did not claim to have enumerated every control in the codebase. Report any additional control that renders under 44×44px, with `file:line`. Do not fix them in this slice without asking; report first.

PV-4 exists because a previous slice's verification was scoped to the directories the plan expected to touch, missed a consumer in `components/`, and produced a verified fact that had to be retracted mid-implementation (`docs/decision-015-organization-jsonld-single-emission.md`).

## Functional requirements

### FR-1 — Language switcher accessible label (R1)

- **FR-1.1:** The `aria-label` rendered on the language-switcher control MUST be written in the language the user is currently reading, and MUST describe the action of switching to the other language.
- **FR-1.2:** On an English page, the label MUST be the English string. On an Arabic page, the label MUST be the Arabic string.
- **FR-1.3:** No other property of the language switcher may change — not its visual appearance, its position, its behavior, or the URL it navigates to.

### FR-2 — Mobile navigation overlay (Mob9)

- **FR-2.1:** While the mobile navigation overlay is open, keyboard focus MUST remain within the overlay. No element outside it may receive focus via Tab or Shift+Tab.
- **FR-2.2:** Pressing Escape while the overlay is open MUST close it.
- **FR-2.3:** On close — by Escape, by the toggle, or by selecting a navigation item — focus MUST return to the control that opened the overlay.
- **FR-2.4:** The overlay MUST expose the correct semantics for a modal surface, including an accurate expanded/collapsed state on the toggle control.
- **FR-2.5:** All of FR-2 MUST behave identically in Arabic and English. RTL must not change focus order relative to reading order.

### FR-3 — Touch target minimums (Mob4, Mob5)

- **FR-3.1:** The mobile menu hamburger/close toggle MUST present a touch target of at least 44×44px at every viewport where it renders.
- **FR-3.2:** The footer newsletter submit button MUST present a touch target of at least 44×44px at every viewport where it renders.
- **FR-3.3:** The visible size of these controls MAY remain as-is if the target is enlarged by padding or an equivalent technique. Meeting the minimum by growing the hit area is preferred over changing the visual design, since visual design decisions are out of scope for this slice.
- **FR-3.4:** Enlarging either target MUST NOT introduce horizontal overflow, off-canvas clipping, or layout shift at any of 375×812, 414×896, or 768×1024, in either language.

### FR-4 — Bilingual symmetry

- **FR-4.1:** Every change MUST ship for English and Arabic simultaneously. No change may land in one language tree without its counterpart.
- **FR-4.2:** Verification MUST cover both languages for every requirement above. A finding verified only in English is not verified.

### FR-5 — Non-regression

- **FR-5.1:** No public URL, route, or page structure may change (standing rule 002).
- **FR-5.2:** No rendered metadata may change — canonical, hreflang, Open Graph, JSON-LD, sitemap, and robots output MUST be unaffected.
- **FR-5.3:** No visual design change beyond what FR-3 strictly requires.
- **FR-5.4:** No new dependency. If a focus-trap implementation is proposed that requires a package, stop and ask before adding it.

## Known interaction — verify, do not assume

The Arabic header CTA clips off-canvas at 768px (Mob2, deferred to Slice 6.2). Mob4's toggle renders only below the `md:` breakpoint, and Mob2 occurs at `md:` and above, so the two should not interact. **This is a reasoned expectation, not a measured fact** — confirm it by checking the 768px AR header before and after the FR-3 changes, and report if enlarging any target makes the existing clip worse.

## Out of scope

Deferred to Slice 6.2 (requires visual verification at three viewports in both languages):

- T1 / Mob7 — heading `leading-*` collapse at 768px and above
- Mob2 — Arabic header CTA rendering off-canvas at 768px
- C2 — homepage country-list contrast at 4.44:1
- C3 — portfolio detail captions at 3.76–4.24:1

Not planned in either slice:

- R2 — un-mirrored arrow glyphs in RTL (judgment call, not a defect)
- Cmp1 — refuted by the mobile pass; the 36×36 icon variant does not render below 768px
- S1 — sparse portfolio grid; a content state, not a layout defect
- C1 — `--muted-foreground`; confirmed dead code with no rendering impact
- Any visual redesign. Whether this site needs one is an open business decision, not something either audit established.
- All postponed Phase 5 items, including the Neon `connectionTimeoutMillis` issue.

## Acceptance criteria

1. **AC-1:** PV-1 through PV-4 completed and reported, including the four R1 strings, the Mob9 keyboard results in both languages, the measured control dimensions, and the full PV-4 grep with `file:line`.
2. **AC-2:** On a live English page, the language switcher's rendered `aria-label` is the English string; on a live Arabic page, it is the Arabic string. Verified by reading the rendered attribute, not the source.
3. **AC-3:** With the mobile nav open at 375×812, Tab and Shift+Tab cycle only within the overlay — zero elements outside it receive focus. Verified in both languages.
4. **AC-4:** Escape closes the overlay, and focus returns to the opening control. Verified in both languages.
5. **AC-5:** The hamburger/close toggle and the footer newsletter submit button each measure at least 44×44px at 375×812 and 414×896, in both languages, confirmed by live measurement.
6. **AC-6:** No horizontal overflow and no off-canvas clipping is introduced at 375×812, 414×896, or 768×1024 in either language. `scrollWidth` equals viewport width, and no element renders at a negative X offset that did not before.
7. **AC-7:** The 768px Arabic header behaves no worse than it did before this slice — the Mob2 clip is unchanged, not amplified.
8. **AC-8:** `npm run check`, `npm run lint`, `npm run build` all exit zero.
9. **AC-9:** Rendered metadata is unchanged: canonical, hreflang, Open Graph, JSON-LD, `/sitemap.xml`, and `/robots.txt` are byte-identical before and after, captured from a local production build.
10. **AC-10:** `git diff --stat` shows only files required by FR-1 through FR-3. Any other changed file is scope drift and must be reported before commit.

## Verification approach

All verification runs against `npm run build && npm start`, never the dev server.

Keyboard behavior (AC-3, AC-4) MUST be verified by actually operating the keyboard in a browser. A code reading that concludes a focus trap is present is not verification — the audit found seven tabbable elements behind an overlay that presumably looked correct in source.

Touch-target dimensions (AC-5) MUST come from live measurement at the stated viewports, not from computed CSS values reasoned about in isolation.
