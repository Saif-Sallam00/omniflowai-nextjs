# Quickstart: Validating Slice 6.1 (Accessibility Defect Fixes)

This is the runnable validation script for `spec.md`'s Success Criteria (SC-001 through
SC-006). Every step here runs against a production build — per spec.md's Assumptions, never
the dev server.

## Prerequisites

```bash
npm run check   # TypeScript, zero errors
npm run lint    # ESLint, zero errors
npm run build   # next build, must succeed
npm start       # next start — serves the production build on the configured port
```

Capture a "before" snapshot of the four rendered metadata surfaces before making any code
change, to diff against after (SC-006):

```bash
# One EN and one AR page of each type is enough — canonical/hreflang/OG/JSON-LD generation
# is shared per-route logic, not per-instance.
curl -s http://localhost:3000/            > /tmp/before-home-en.html
curl -s http://localhost:3000/ar          > /tmp/before-home-ar.html
curl -s http://localhost:3000/sitemap.xml > /tmp/before-sitemap.xml
curl -s http://localhost:3000/robots.txt  > /tmp/before-robots.txt
```

After the change ships, re-run the same four `curl`s to `/tmp/after-*` and diff the
`<link rel="canonical">`, `<link rel="alternate" hreflang>`, `<meta property="og:*">`, and
`<script type="application/ld+json">` blocks specifically (the surrounding page HTML is
expected to change — the fixes touch the header and footer markup — but nothing inside those
four metadata surfaces should).

## SC-001 — Language-switcher label (US1 / R1)

1. Open `http://localhost:3000/solutions` (or any public EN page) in a browser with
   devtools.
2. Find the language-switcher `<a>` (desktop: the globe icon in the header, ≥768px; mobile:
   the "العربية" pill inside the open mobile menu, <768px).
3. Read its `aria-label` attribute directly in the Elements panel. **Expected**: an English
   string describing switching to Arabic.
4. Repeat on `http://localhost:3000/ar/solutions`. **Expected**: an Arabic string describing
   switching to English.
5. Confirm nothing else about the control changed: same `href`, same visual position, same
   icon (FR-002).

## SC-002 / SC-003 — Mobile nav focus trap and Escape (US2 / Mob9)

Real keyboard input only — do not infer from source.

1. Resize the browser (or use device emulation) to 375×812. Load `http://localhost:3000/`.
2. Click into the page, then press Tab until focus reaches the hamburger button
   (`aria-label="Open menu"`).
3. Press Enter to open the menu. Confirm the overlay appears and the button's `aria-label`
   becomes `"Close menu"`.
4. Press Tab repeatedly. **Expected**: focus moves from the toggle button into the overlay's
   own items (nav links, CTA, language switcher) in order, and Tab from the *last* item
   (the language switcher) **wraps forward to the toggle button** — not to the first overlay
   item. At no point does focus land on page content behind the overlay (SC-002: zero of the
   ~7 previously-reachable background elements are reached).
5. Press Shift+Tab while focus is on the toggle button. **Expected**: focus wraps backward
   to the **last** item in the overlay (the language switcher) — the toggle is the trap's
   first position, not excluded from it. Confirm Shift+Tab from any overlay item other than
   the first behaves normally (moves to the previous overlay item); Shift+Tab from the
   *first* overlay item moves back to the toggle button (natural DOM order, not a wrap the
   trap needs to intervene on).
6. Confirm the toggle button is reachable, and its "Close menu" label readable, purely by
   Tab — this is the point of the correction applied at this gate: a keyboard-only or
   screen-reader user must be able to find and activate the close control without already
   knowing the Escape shortcut.
7. Press Escape. **Expected**: the overlay closes, and focus lands back on the toggle button
   (SC-003).
8. Re-open the menu, Tab a few items in, then activate the toggle button itself (via Enter,
   having Tabbed to it) to close it (not Escape). **Expected**: same as step 7 — overlay
   closes, focus remains on the toggle button.
9. Re-open the menu, Tab to a nav link, and select it (Enter). **Expected**: the overlay
   closes and the browser navigates to the selected route. Per FR-005a, focus is **not**
   required to land back on any particular element — do not fail this step on that basis;
   only confirm the overlay actually closed and navigation happened.
10. Repeat steps 1-9 on `http://localhost:3000/ar` (or any `/ar/*` route). **Expected**:
    identical results — `dir="rtl"`, hamburger mirrored to the left, but the same
    toggle-inclusive trap boundary, wrap points, Escape, and focus-return behavior.

## SC-004 — Touch target measurement (US3 / Mob4, Mob5)

At each of 375×812 and 414×896, in both `en` and the matching `/ar/*` page:

1. Open devtools, select the hamburger/close toggle button, read its rendered
   `getBoundingClientRect()` (or the Elements panel's computed box size).
   **Expected**: width ≥44 and height ≥44.
2. Scroll to the footer, select the newsletter submit button (the small icon button next to
   the email field), read its rendered *tappable* area — for the pseudo-element technique,
   this means confirming a real pointer/touch event anywhere within the expanded region
   (not just the visible `h-10 w-10` box) triggers the button, in addition to reading the
   computed hit-area geometry. **Expected**: tappable area ≥44×44; the *visible* button
   still renders at its original size (no visual regression).
3. That's 2 controls × 2 viewports × 2 languages = 8 combinations; all 8 must pass.

## SC-005 — No new overflow or clipping

At 375×812, 414×896, and 768×1024, in both languages, on at least the pages the mobile audit
covered (`/`, `/about`, `/solutions`, `/contact`, `/articles`, `/portfolio`, one article
detail, one portfolio detail):

```js
// Run in the page console at each viewport/page/language:
({
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
  overflow: document.documentElement.scrollWidth - window.innerWidth,
})
```

**Expected**: `overflow` is `0` on every combination, matching the mobile audit's original
clean baseline (Mob1). Pay particular attention to the header/footer regions the fixes
actually touch.

## Known Interaction — Mob2 must not worsen

Before making any change, and again after:

1. Load `http://localhost:3000/ar` (or any `/ar/*` page) at exactly 768×1024.
2. Measure the header's "Book a strategy call" CTA link's `getBoundingClientRect()`.
3. **Expected before and after**: `left` is negative (the pre-existing Mob2 clip — out of
   scope for this slice to fix) and its magnitude does not increase. If the "after" magnitude
   is larger (more of the button pushed off-canvas) than "before," that is a regression this
   slice introduced and must be reported, even though fixing Mob2 itself stays out of scope.

## Final gate

All of the following must hold before this slice is considered done:

- `npm run check`, `npm run lint`, `npm run build` all exit zero.
- SC-001 through SC-006 above all pass, in both languages, at every viewport listed.
- `git diff --stat` against `master` shows only: `components/language-switcher.tsx`,
  `components/site-header.tsx`, `components/newsletter-form.tsx`,
  `lib/hooks/use-focus-trap.ts` (new file). Anything else is scope drift — report it before
  committing, per plan.md's Project Structure section.
