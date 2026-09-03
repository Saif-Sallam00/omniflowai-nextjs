# Phase 6 — Design Audit, Mobile Pass (apple-design skill)

**Scope:** Public site only, three viewports — 375×812 (iPhone-class), 414×896 (larger
phone), 768×1024 (tablet / the `md:` boundary) — both `en` and `ar` for every route:
`/`, `/about`, `/solutions`, `/contact`, `/articles` + one detail, `/portfolio` + one
detail. `/admin/*` excluded per instructions.
**Type:** Findings only. No source file was modified. No design decision was made here.
**Relationship to pass 1:** [docs/phase-6-design-audit.md](phase-6-design-audit.md) covered
desktop only at 1440×1024 and is the baseline. This document does not restate its findings;
see "Pass 1 findings re-evaluated at mobile" for the two items pass 1 flagged as
mobile-dependent (T1, Cmp1), plus anything else whose severity changed.

## Methodology

- All 16 URLs (8 routes × 2 languages) loaded in a real Chrome instance (Next dev server,
  `chrome-devtools` MCP) at all three mandated viewports — 48 page loads total, none
  skipped. Emulation used `isMobile`/`hasTouch` device flags, not just a resized desktop
  window.
- Every measurement (font-size, line-height, element rects, `dir`) was read live via
  `getComputedStyle`/`getBoundingClientRect` after `document.fonts.ready`, never inferred
  from source.
- Horizontal overflow was checked on every page/viewport/language via
  `document.documentElement.scrollWidth` vs. `window.innerWidth`, plus a DOM-wide scan for
  any element whose rect crossed the left or right edge — specifically to catch RTL
  overflow bleeding off the *opposite* (left) side, per the brief's warning.
- The mobile nav (hamburger menu) was opened and inspected in both languages: link/target
  rects, RTL mirroring, Escape-to-close, and whether content behind the overlay remains
  keyboard-reachable.
- Two full-page screenshots were taken per suspected T1 instance (once at a viewport where
  the ratio was intended, once where it collapses) to visually confirm or refute clipping,
  never inferred from the ratio alone.
- One EN and one AR slug were used for both detail page types (same slugs as pass 1):
  `articles/from-inbox-to-insight-how-we-integrated-claude-into-our-daily-business-operation`
  and `portfolio/shoesnet-b2b-wholesale-footwear-marketplace`.
- Nothing was skipped. Contrast (C1–C3) was not re-measured — contrast ratios don't change
  with viewport width, so pass 1's numbers stand unchanged at mobile.

---

## Layout and Overflow

### Mob1. No horizontal-scroll overflow found on any of the 48 page/viewport/language combinations

- **What:** `document.documentElement.scrollWidth` equaled `window.innerWidth` exactly on
  every one of the 16 routes at all three viewports, both languages. No page produces a
  horizontal scrollbar at any tested mobile or tablet width.
- **Affects:** Both languages, all three viewports — a clean result, not a defect.
- **Why it's here:** The brief asked for this to be checked explicitly (including the
  RTL-escapes-to-the-left-edge case) and reported either way. It was checked on every page,
  not sampled.
- **Severity: N/A (clean).**

### Mob2. AR header's CTA button and part of the language switcher render off-canvas at 768px, with no scroll path to reach them

- **What:** At exactly 768×1024 (the `md:` breakpoint where the desktop nav row replaces
  the hamburger menu), the Arabic header's nav row cannot fit `logo + 6 nav links +
  language switcher + "Book a strategy call"` in 768px — Arabic nav labels are collectively
  wider than the English set. The result isn't a scrollbar; the trailing flex group (language
  switcher + CTA button) is pushed to `left: -112px`. Live measurement:
  `{ w: 190.1, left: -112, right: 78.1 }` for the CTA link — only its rightmost ~78px sliver
  (partial text, no arrow icon) renders inside the 0–768 viewport; the rest, including the
  leading word "استراتيجية" and the arrow glyph, is rendered at negative X and is neither
  visible nor reachable, because `document.documentElement.scrollWidth` stays exactly `768`
  (no scrollbar is created — this is a silent clip, not a scroll-past-the-edge case).
  Screenshot confirms: the button reads as a truncated "احجز مكالم" sliver pinned to the
  left edge. Reproduced identically (`left: -112, right: 78.1`, byte-for-byte) on `/ar` and
  `/ar/about`; since this is the shared `SiteHeader` component it applies to every `/ar/*`
  page at this width.
- **Where:** [components/site-header.tsx:77-84](components/site-header.tsx#L77-L84) (the
  `hidden items-center gap-4 md:flex` wrapper around `LanguageSwitcher` + the CTA `Link`),
  rendered on every public page. The language-switcher icon itself (36×36, `left: 94.1` to
  `130.1`) stays inside the viewport and is unaffected — only the CTA button is clipped.
- **Affects: AR only.** EN was checked at the identical 768px width and fits cleanly (CTA
  measured at `173.8×40`, fully on-screen, `right` edge at 736 with 32px of margin to
  spare) — the English nav labels are short enough to fit; the Arabic ones are not.
- **Why it matters:** This is the primary conversion action in the header ("Book a strategy
  call"), rendered unreadable and effectively untappable-as-labeled at a real, in-scope
  viewport (768px is one of the three mandated widths, not an edge case). A tablet or a
  narrow-desktop-window Arabic visitor cannot read or confidently target this button.
  Design Guideline — Right-to-Left: Arabic strings routinely run 20–40% longer than
  their English source and layouts sized to the English string will not survive translation.
- **Severity: HIGH.**

### Mob3. Decorative blurred glow shapes bleed past the viewport edge (harmless — see "Not worth changing")

Noted here for completeness since the overflow scan surfaces them on every viewport; see
the "Not worth changing" section below — they don't affect `scrollWidth` and are
`pointer-events-none`.

---

## Touch Targets

### Mob4. Mobile menu hamburger/close toggle is 40×40px, below the 44×44 minimum

- **What:** The single button that opens and closes the mobile nav — the *only* way to
  reach site navigation below 768px — measures `40×40` in both its "Open menu" and "Close
  menu" states, confirmed live at 375 and 414 (`{ w: 40, h: 40 }`) and traceable to source:
  `p-2` (8px) padding around a `h-6 w-6` (24px) icon = 40px square.
- **Where:** [components/site-header.tsx:99-107](components/site-header.tsx#L99-L107).
  Present on every public page below `md:`, both languages (only the `left`/`right`
  position mirrors between LTR and RTL — size is identical).
- **Affects: Both**, at 375 and 414 (not present at 768, where the desktop nav row is used
  instead).
- **Why it matters:** This is the sole entry point to navigation on phones. A 4px miss on
  each axis is a small margin but a real one on the control every mobile visitor must hit
  first. Design Guideline — Accessibility: touch targets should be ≥44pt on mobile.
- **Severity: MEDIUM.**

### Mob5. Footer newsletter submit button is 40×40px, below the 44×44 minimum

- **What:** `NewsletterForm`'s submit button is `h-10 w-10` (40×40px) in source, confirmed
  live (`{ w: 40, h: 40 }`) on every page tested. Its adjacent email input is `h-10` (40px
  tall) as well — also under the 44px floor, though as a text field rather than a
  discrete tap target it's a softer miss.
- **Where:** [components/newsletter-form.tsx:26-35](components/newsletter-form.tsx#L26-L35)
  (`SubmitButton`), rendered via `site-shell.tsx` in the footer of every public page, both
  languages. Not breakpoint-gated — the same 40×40 renders at 768 and would at desktop
  widths too, but the 44px floor is specifically the *mobile* threshold this pass is
  checking, so it's reported here.
- **Affects: Both** (identical component, no language-specific sizing) — confirmed on
  `/contact`, `/`, and `/articles` in both languages.
- **Why it matters:** Same guideline as Mob4 — this is a live, site-wide control, not a
  one-off. Design Guideline — Accessibility: ≥44pt targets on mobile.
- **Severity: MEDIUM.**

### Mob6. Everything else measured clears 44px (or isn't a real target)

For completeness: mobile-menu nav links (327–366px × 60px), the mobile-menu CTA and
language-switcher (327–366px × 48px), the main contact-form submit button (261×44,
exactly at the floor), and the contact-form text/email/tel/select inputs (261×42, 2px
under — not independently actionable "targets" in the WCAG sense, noted but not filed as
a separate finding) were all checked and are not standalone problems. The one `w:162,
h:24` "text" input found in the DOM during this scan is the newsletter's honeypot field
(`sr-only`, `aria-hidden`, `tabIndex={-1}` — [components/newsletter-form.tsx:59-65](components/newsletter-form.tsx#L59-L65)),
not a real control.

---

## Typography

(T1 itself is covered under "Pass 1 findings re-evaluated at mobile" below, since it's a
pass-1 finding. This section covers what's new.)

### Mob7. The T1 cascade defect also affects headings using Tailwind's named `leading-tight` utility, not just arbitrary `leading-[…]` values — pass 1's file inventory missed this

- **What:** Pass 1 listed five files sharing the T1 pattern, all using an arbitrary
  `leading-[1.05–1.15]` value. The `/about` page's `<h1>` uses the *named* utility
  `leading-tight` (`line-height: 1.25`) instead, and is not in that list — but it has the
  identical defect. Confirmed live: `text-4xl leading-tight md:text-6xl` measures
  `font-size: 36px; line-height: 45px` (ratio 1.25, correct) at 375/414, and
  `font-size: 60px; line-height: 60px` (ratio 1.0, collapsed) at 768 — the same
  responsive-utility-wins-the-cascade mechanism as T1, just triggered by a named class
  instead of an arbitrary one, which is presumably why a `leading-\[` grep-based inventory
  didn't catch it.
- **Where:** [app/(en)/(public)/about/page.tsx:53](<app/(en)/(public)/about/page.tsx#L53>),
  [app/ar/(public)/about/page.tsx:53](app/ar/(public)/about/page.tsx#L53).
- **Affects: Both.** Checked visually at 768 in AR (the language where T1 actually clips) —
  this specific string ("مهندسون يفهمون الأعمال.") happens *not* to visibly clip at this
  content/width, for the same reason pass 1 noted for its own non-clipping instances: no
  diacritic mark happens to sit at the exact seam between these two lines. It is equally
  fragile, just not currently tripped — the same caveat pass 1 gave its own list.
- **Why it matters:** It confirms T1's root cause is broader than the affected-file list in
  pass 1 suggests. Anyone fixing T1 by hand-patching the five listed files would still leave
  this instance (and possibly others using named `leading-*` utilities) broken.
- **Severity: LOW** (does not currently visibly clip; filed for completeness of the T1
  root-cause record, per pass 1's own precedent for non-clipping-but-fragile instances).

### Mob8. Headings with no custom `leading-*` value at all are unaffected — correctly so

`/portfolio` (`text-4xl md:text-5xl`, no leading override) and `/contact` (`text-5xl
md:text-6xl`, no leading override) both render at Tailwind's own default line-height at
every viewport tested, in both languages. This isn't a defect — there was never a custom
value for the cascade to override. Listed to be explicit about what was checked and ruled
out, not left ambiguous.

---

## Navigation (mobile menu)

### Mob9. Mobile nav overlay has no focus trap and does not close on Escape

- **What:** With the mobile menu open, `<main>` is not `aria-hidden` and none of its
  descendants are `inert`; all 7 links/buttons in `<main>` remain focusable via Tab while
  the overlay is visually covering them (confirmed via
  `document.querySelectorAll('main a, main button')` — all 7 pass the "still focusable"
  check). Separately, dispatching an `Escape` keydown at the document while the menu is
  open does not close it (`aria-label` stays `"Close menu"` afterward — verified, not
  inferred).
- **Where:** [components/site-header.tsx:117-146](components/site-header.tsx#L117-L146)
  (the mobile menu's conditional render block) — it's a plain conditionally-rendered `div`,
  not a dialog/overlay primitive, so it has none of the usual affordances.
- **Affects: Both.** This is DOM/keyboard behavior, language-independent — the menu's
  *visual* RTL mirroring is correct (see Mob10), but the missing focus trap and Escape
  handling reproduce identically in `ar`.
- **Why it matters:** A keyboard or screen-reader user tabbing through the page after
  opening the menu will land on invisible content underneath it, with no `Escape` shortcut
  to recover — they must tab all the way through the (still-live) homepage content to get
  back to visible controls. Design Guideline — Accessibility: overlays that visually
  replace content need to also remove that content from the interaction surface while
  open.
- **Severity: MEDIUM** (keyboard-only path, not visible to a mouse/touch user, but a real
  dead-end for the users it affects).

### Mob10. Mobile nav opens, closes (via the toggle), and mirrors correctly in RTL — verified, not a finding

Confirmed live (not just via markup) in both languages: the button opens/closes the menu
correctly (`aria-expanded` and label toggle as expected once a *bubbling, trusted-style*
click event is used — see note below), the hamburger/close icon and logo swap sides
correctly under `dir="rtl"` (hamburger at `left: 24` in AR vs. `right`-anchored in EN), nav
links right-align and read top-to-bottom in the same logical order as EN, and the
language-switcher label ("العربية" / "English") renders at the bottom of the stack in both
directions with no overflow (`scrollWidth === innerWidth` throughout). This is correct
behavior, not a defect — recorded so it doesn't read as unchecked.

*Note on method:* the `chrome-devtools` click tool's synthesized pointer event did not
register with this button's React handler during testing (likely a devtools/CDP + 2x-DPR
mobile-emulation interaction, not a site bug — a manually dispatched bubbling `MouseEvent`
worked immediately, and no console errors were present). Flagged here for transparency
about the testing method, not as a product defect — nothing suggests real touch input would
behave differently.

---

## RTL-Specific Issues

### Mob11. See Mob2 (AR header CTA off-canvas at 768px) — the pass's most consequential RTL-specific finding, filed under "Layout and Overflow" above since it's fundamentally an overflow bug, not a mirroring bug.

No other new RTL-specific defects were found at mobile widths. Mobile-menu RTL mirroring
(Mob10), nav-link stacking, and directional icon absence in the mobile CTA (see below) were
all checked and are correct.

### Mob12. R2 (pass 1's un-mirrored arrow icon) does not reproduce in the mobile nav CTA — there's no icon there to mirror

Pass 1's R2 finding is about `ArrowRight` icons that reposition for RTL but never flip the
glyph. The mobile-menu version of the header CTA
([components/site-header.tsx:123-128](components/site-header.tsx#L123-L128)) has no icon
at all — just centered text — so R2 doesn't extend to this instance. Not a new finding, and
not a fix to R2; noted so R2's scope isn't assumed to silently include a component it
doesn't touch.

---

## Pass 1 findings re-evaluated at mobile

### T1 — heading `leading-[…]` overridden by Tailwind's paired default: does NOT hold at phone widths (375/414); reproduces at tablet width (768) exactly as at desktop

Verified live with `getComputedStyle` on all five of pass 1's listed files, in both
languages, at all three viewports:

| Page | 375/414 ratio (intended) | 768 ratio | Matches pass 1's desktop finding? |
|---|---|---|---|
| Home (`/`, `/ar`) | 1.10 (39.6/36) | **1.00** (60/60) | Yes — collapses at `md:` |
| Articles list | 1.10 (33/30) | **1.00** (48/48) | Yes |
| Solutions | 1.08 (38.88/36) | **1.00** (48/48) | Yes |
| Article detail | 1.15 (34.5/30) | **1.11** (40/36) | Partially — see below |
| Portfolio detail | 1.05 (31.5/30) | **1.00** (48/48) | Yes |

**Verdict: the defect does not hold at 375 or 414 on any page tested** — every heading
renders at exactly its intended custom ratio at both phone widths, because no `sm:`/`md:`/
`lg:` text-size variant is active yet at those widths (all are below Tailwind's 640px `sm:`
boundary). **It reproduces starting exactly at 768px** (the `md:` boundary, one of the
three mandated viewports), matching pass 1's desktop finding.

One nuance pass 1 didn't have the mobile evidence to state: the *severity* of the collapse
at 768 depends on which Tailwind size step the heading lands on. Article detail's `<h1>`
only defines `text-3xl` / `sm:text-4xl` (no `md:`/`lg:` step), so at 768 it's still on
`sm:text-4xl` — and Tailwind's own default line-height for `text-4xl` is `2.5rem`
(ratio 1.111 relative to its 36px size), not exactly 1. The custom `leading-[1.15]` still
loses the cascade fight (1.11 measured, not the intended 1.15), but lands closer to intact
than the other four pages, which reach `text-5xl`/`text-6xl` where Tailwind's own default
line-height genuinely is 1 — a full collapse.

**Visual confirmation (not inferred from ratios alone), all at 768×1024:**
- `/ar` (Home): full-page screenshot shows the descender/diacritic marks of line 1
  ("الأداة.") visibly touching the ascender marks of line 2 ("نحن نبدأ") — clipping
  confirmed.
- `/ar/solutions`: same pattern — line 1 ("عليها") touches line 2's leading word
  ("نمّوك"), whose doubled shadda mark visibly overlaps the line above.
- `/ar/articles`: reproduces pass 1's exact desktop finding, now confirmed at 768 as well
  — line 2/3 marks overlap.
- `/ar/articles` at 375, by contrast: four clean lines with visible whitespace between
  every line — **no clipping**, confirming the ratio-based verdict above rather than just
  trusting the number.
- `/ar/about` and `/ar/portfolio/shoesnet-b2b-wholesale-footwear-marketplace` at 768: ratio
  is broken identically (1.0 / 1.0) but this pass's specific Arabic strings don't happen to
  put a mark at the line seam — no visible clip in these two instances, same
  "equally fragile, not currently tripped" caveat pass 1 applied to its own list.

Also see Mob7 above: the same defect additionally affects `/about`'s heading via the named
`leading-tight` utility, which pass 1's file inventory did not include.

**Severity: unchanged from pass 1 (HIGH)** as an overall defect, but its *practical mobile
footprint is smaller than a naive "affects all mobile" read of pass 1 would suggest* — real
phones (375/414) are entirely unaffected; only tablet-and-wider (≥768) trips it, which
pass 1's own 1440 test already covered for the "wide" end of that range.

### Cmp1 — language-switcher 36×36px target: REFUTED at phone widths; CONFIRMED unchanged at 768

Pass 1 measured the icon-variant switcher at 36×36px and explicitly flagged it as
unconfirmed on mobile. Now confirmed both ways:

- **At 375 and 414: refuted.** The 36×36 icon variant
  ([components/language-switcher.tsx:44-52](components/language-switcher.tsx#L44-L52),
  `variant="icon"`) only exists inside `site-header.tsx`'s `hidden ... md:flex` desktop nav
  row — it is not rendered at all below 768px (`{ w: 0, h: 0 }` when queried at 375/414 on
  every page checked). The control mobile users actually see and tap is the *other*
  variant, `variant="label"`
  ([components/site-header.tsx:129](components/site-header.tsx#L129)), which measures
  **327–366×48px** live inside the open mobile menu — well clear of the 44×44 floor, in
  both languages.
- **At 768: confirmed, unchanged.** The icon variant does render at this width (desktop nav
  is active at `md:`) and measures exactly what pass 1 found: `36×36`.

**Verdict: Cmp1 is not a real mobile-phone issue** — the component that would need fixing
for phones doesn't exist on phones; a different, correctly-sized component is used instead.
It remains exactly the tablet/desktop-only issue pass 1's LOW rating already anticipated.

**Severity: LOW, confirmed (no change from pass 1's rating; the "confirm on mobile before
treating as urgent" caveat can be dropped — mobile is clear, desktop/tablet is not
urgent).**

### C1, C2, C3, S1, R1, R2 — no severity change at mobile

Contrast ratios (C1–C3) are computed from color values and font sizes that don't vary with
viewport width — pass 1's numbers stand unchanged; not re-measured here. S1 (sparse
portfolio grid) is a content-seeding state, unaffected by viewport. R1 (swapped
`aria-label` strings) and R2 (un-mirrored arrow icon, outside the mobile-menu instance
covered in Mob12) are both language/markup-level defects with no viewport dependency —
confirmed still present by inspecting the same source at mobile widths, no severity change.

---

## Not Worth Changing

- **Decorative `pointer-events-none` blurred glow shapes bleeding past the viewport edge**
  (seen on `/about`, `/portfolio/[slug]`, and the homepage's hero at all three mobile
  viewports — e.g.
  [app/(en)/(public)/about/page.tsx](<app/(en)/(public)/about/page.tsx>)'s ambient
  background blobs). These render with `left`/`right` values that place them outside
  0–viewport-width, which the DOM-wide overflow scan surfaces every time — but they never
  contribute to `document.documentElement.scrollWidth` (confirmed: scrollWidth stayed
  exactly equal to viewport width on every page where these appear), are
  `pointer-events-none`, and are purely ambient decoration. No visible or functional impact.
- **Contact-form and portfolio-detail inputs at 42px height** (2px under the 44px floor):
  not filed as an independent finding. These are text fields, not discrete tap targets in
  the same sense as a button/icon — the WCAG 44px guidance is aimed at isolated targets
  users must precisely hit, and a 42px-tall full-width text input in a single-column mobile
  form doesn't carry the same mis-tap risk a small button does. Noted in Mob6 for
  completeness rather than filed as its own item.
- **The `chrome-devtools` click-tool / React event-handler interaction described in
  Mob10.** Investigated in enough depth to be confident it's a testing-harness quirk
  (trusted-style dispatch works instantly, no console errors, no hydration warnings) and
  not a real product defect — recorded transparently rather than silently worked around.
- **Mobile-menu CTA button having no arrow icon** (Mob12): a plain, deliberate visual
  simplification for the mobile variant, not a regression of anything — there's nothing to
  mirror because there's no icon.

---

## Summary

| Severity | Count | Findings |
|---|---|---|
| HIGH | 1 | Mob2 (AR header CTA + language switcher rendered off-canvas at 768px, unreachable) |
| MEDIUM | 3 | Mob4 (40×40 hamburger/close toggle), Mob5 (40×40 footer newsletter button), Mob9 (mobile nav: no focus trap, no Escape-close) |
| LOW | 1 | Mob7 (T1 defect also affects `/about` via `leading-tight`, not currently visibly tripped) |
| N/A (clean/refuted) | 2 | Mob1 (no horizontal overflow anywhere), Cmp1 re-eval (refuted at 375/414, confirmed unchanged at 768) |

**Re-evaluated pass 1 findings:** T1 — does not hold at 375/414, reproduces unchanged at
768 (severity unchanged, footprint narrower than assumed). Cmp1 — refuted at 375/414,
confirmed unchanged at 768. C1–C3, S1, R1, R2 — no change at mobile.
