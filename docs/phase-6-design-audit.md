# Phase 6 — Design Audit (apple-design skill)

**Scope:** Public site only (`/`, `/about`, `/solutions`, `/contact`, `/articles` + one detail,
`/portfolio` + one detail — EN and AR for every route). `/admin/*` excluded per instructions.
**Type:** Findings only. No source file was modified. No design decision was made here.

## Methodology

- Skill invoked via `Skill(apple-design)`. It is written for native mobile/desktop apps
  (Flutter/Tauri/Electron/SwiftUI); this is a Next.js marketing site, so its guidance was applied
  as the platform-agnostic principles it says it's distilled to (color, typography, layout,
  accessibility, RTL), with app-specific sections (tab bars, window chrome, gestures) skipped as
  not applicable. References actually loaded: `accessibility.md`, `color.md`, `layout.md`,
  `typography.md`, `right-to-left.md` (via `references/hig-lookup.md`).
- Every route was loaded in a real browser (Next dev server, Chrome via chrome-devtools MCP,
  1440×1024 viewport) for both `en` and the matching `ar` path, full-page screenshots taken, and
  cross-compared. Scroll-reveal animations were neutralized for screenshot purposes only
  (an injected `<style>` forcing `.opacity-0{opacity:1}` — a runtime override in the inspector,
  not a file edit) after confirming via `useInView`/`IntersectionObserver` inspection that the
  hidden content was a screenshot-timing artifact, not a real bug (see "Not worth changing").
- Every contrast ratio below was computed with the actual WCAG relative-luminance formula against
  the actual HSL/RGB values in `app/globals.css` and Tailwind's stock slate/gray palette — not
  eyeballed.
- One article slug and one portfolio slug were opened in both languages (note: the AR article
  slug is a separate localized/Arabic slug, not a language-prefixed copy of the EN slug — routing
  detail only, not a finding, since Phase 6 is visual-only).
- Not tested: mobile/tablet breakpoints, keyboard-only navigation, actual screen-reader output,
  `/admin/*`. Called out inline wherever a finding's severity would change under those conditions.

---

## Typography

### T1. Custom heading `leading-[…]` is silently overridden by Tailwind's paired default line-height, and the zero-headroom result clips Arabic glyphs

- **What:** Every large display `<h1>` on the site sets an explicit custom line-height
  (`leading-[1.1]`, `[1.15]`, `[1.08]`, `[1.05]`) intended to give multi-line headings breathing
  room. In the generated CSS, `.text-5xl`/`.md\:text-5xl` etc. (Tailwind's *default* paired
  line-height for that size, `line-height: 1`) are emitted **after** the custom `.leading-\[1.1\]`
  rule — the responsive size utilities live in a later `@media` block. At equal specificity
  (single class each), later wins, so at every breakpoint where a `sm:`/`md:`/`lg:` text-size
  variant is active, the heading's *actual* rendered line-height is exactly `1.0`, not the
  intended `1.05–1.15`. Confirmed live via `getComputedStyle`: `/ar/articles` h1 measured
  `font-size: 48px; line-height: 48px` (ratio 1.0) despite `leading-[1.1]` in the markup.
- **Where:** All of these share the identical pattern —
  [app/(en)/(public)/page.tsx:110](app/(en)/(public)/page.tsx#L110), [app/ar/(public)/page.tsx:123](app/ar/(public)/page.tsx#L123),
  [app/(en)/(public)/articles/page.tsx:34](<app/(en)/(public)/articles/page.tsx#L34>), [app/ar/(public)/articles/page.tsx:33](app/ar/(public)/articles/page.tsx#L33),
  [app/(en)/(public)/articles/[slug]/page.tsx:120](<app/(en)/(public)/articles/[slug]/page.tsx#L120>), [app/ar/(public)/articles/[slug]/page.tsx:120](app/ar/(public)/articles/[slug]/page.tsx#L120),
  [app/(en)/(public)/portfolio/[slug]/page.tsx:100](<app/(en)/(public)/portfolio/[slug]/page.tsx#L100>), [app/ar/(public)/portfolio/[slug]/page.tsx:99](app/ar/(public)/portfolio/[slug]/page.tsx#L99),
  [app/(en)/(public)/solutions/page.tsx:409](<app/(en)/(public)/solutions/page.tsx#L409>), [app/ar/(public)/solutions/page.tsx:411](app/ar/(public)/solutions/page.tsx#L411).
- **Affects:** The CSS defect itself is identical on every EN and AR page (same generated
  stylesheet, same cascade). The *visible symptom* is language-dependent: Latin text in
  Inter/Space Grotesk has enough internal headroom at `line-height:1` to not touch the line
  below it. Cairo's Arabic glyphs (diacritic dots, marks that sit above/below the baseline) do
  not have that headroom. **Confirmed visibly broken on `/ar/articles`** — the h1 "ملاحظات عملية
  حول الذكاء الاصطناعي والتسويق..." shows line 1's marks overlapping line 2, and line 3
  overlapping line 4, reproduced after `document.fonts.ready` so it isn't a font-load race.
  The other 4 AR headings sharing the exact same broken CSS did **not** visibly clip at the
  content/viewport tested (2–3 lines instead of 4, different word-wrap points) — they are
  equally fragile, just not currently tripped. EN is unaffected in all cases tested.
- **Why it matters:** This is a readability failure on a primary page heading, not a cosmetic
  nit — overlapping glyphs make words genuinely hard to parse. Design Guideline —
  Typography: text must remain legible at the sizes and languages it's shipped in.
  Design Guideline — Right-to-Left: Arabic script needs its own metrics respected, not
  Latin-tuned values applied unchanged.
- **Severity: HIGH.**

---

## Color and Contrast

### C1. `--muted-foreground` — the "already logged" token: ratio confirmed, but the token is dead code, and the failure mode described doesn't hold

- **What:** `--muted-foreground: 215.4 16.3% 46.9%` in [app/globals.css:32](app/globals.css#L32),
  wired to Tailwind as `text-muted-foreground` via [tailwind.config.ts:38-42](tailwind.config.ts#L38-L42).
  Computed against `--background: 0 0% 100%` (white), this is **rgb(100,116,139) on
  rgb(255,255,255) = 4.76:1** — confirmed correct, matches the brief exactly.
  Two corrections to the brief's framing:
  1. **The token is not used anywhere.** `grep -rln "muted-foreground" --include="*.tsx"` across
     `app/` and `components/` returns nothing but `tailwind.config.ts` itself. There is no
     `components/ui/` directory (no shadcn primitives pulling it in implicitly either). It is a
     defined-but-unconsumed design token — currently zero pages render text at this color.
  2. **The stated failure mode is backwards.** WCAG's large-text threshold (`≥18pt`, or `≥14pt`
     bold) is *lower* than the normal-text threshold (3:1 vs 4.5:1), not higher. A ratio that
     clears 4.5:1 for body text necessarily clears the large-text bar too — it can't "fail AA for
     large-text" while passing AA for body text. What 4.76:1 *does* fail is **AAA for normal
     text** (needs 7:1); it passes AAA-large (4.5:1) by a hair.
- **Where:** [app/globals.css:32](app/globals.css#L32); referenced only at [tailwind.config.ts:40](tailwind.config.ts#L40).
- **Affects:** Both (it's a token, not page content) — moot either way since unused.
- **Why it matters:** Worth keeping in the token file since a future component may reach for
  `text-muted-foreground` expecting shadcn-style semantics, and 4.76:1 is genuinely tight (any
  future dark-surface variant of this token, or any near-white "off" background, would push it
  under AA). But there is no live user-facing defect today. Filed as a finding rather than
  "not worth changing" because the brief explicitly asked for a verified verdict, not just a
  restatement.
- **Severity: LOW** (correctness-of-record, no current rendering impact).

### C2. `text-slate-500` renders below WCAG AA on the homepage's light "trusted by" band

- **What:** The country list ("Egypt · Saudi Arabia · UAE · ...") sits in a `bg-surface`
  section — `--surface-light: 210 14% 97%` ≈ rgb(246,247,248). Tailwind's `slate-500` is
  rgb(100,116,139). Computed contrast: **4.44:1**, at 14px/`text-sm` regular weight. WCAG AA for
  normal text requires 4.5:1 — this fails, by a small but real margin, on a font-size well below
  the "large text" exemption.
- **Where:** [app/(en)/(public)/page.tsx:182](<app/(en)/(public)/page.tsx#L182>), [app/ar/(public)/page.tsx:195](app/ar/(public)/page.tsx#L195);
  section background: [app/(en)/(public)/page.tsx:148](<app/(en)/(public)/page.tsx#L148>) (`bg-surface`).
- **Affects: Both.** Identical Tailwind classes and identical `bg-surface` in both language
  trees — the country list renders at the same failing ratio in EN and AR.
- **Why it matters:** Design Guideline — Accessibility: "Text smaller than 18pt needs a
  contrast ratio of at least 4.5:1." This is exactly that case, on real, live, currently-shipping
  text (unlike C1's dead token) on the homepage.
- **Severity: MEDIUM** (supplementary/decorative-adjacent content, not primary copy, but
  live and failing).

### C3. `text-slate-500` on dark cards fails AA more severely on the portfolio detail page

- **What:** Three `text-slate-500` usages sit on dark card surfaces (`bg-slate-900/40`,
  `bg-slate-950`, or the page's dark base) at 11–12px: the client-field caption, the "Case study
  media will appear here" placeholder, and the media caption. Computed contrast:
  **slate-500 (100,116,139) on gunmetal (15,23,41) ≈ 3.76:1**; on `slate-950` ≈ 4.24:1. Both are
  below the 4.5:1 AA floor for normal text, and this text is *smaller* (11–12px) than C2's.
- **Where:** [app/(en)/(public)/portfolio/[slug]/page.tsx:121](<app/(en)/(public)/portfolio/[slug]/page.tsx#L121>) (client fields, `text-[11px]`),
  :200 and :206 (media placeholder / caption, `text-xs`); identical lines in
  [app/ar/(public)/portfolio/[slug]/page.tsx:120,199,205](app/ar/(public)/portfolio/[slug]/page.tsx#L120).
  Verified live on the rendered ShoesNet case study (EN and AR).
- **Affects: Both** — same classes, same dark card backgrounds, both languages.
- **Why it matters:** Same guideline as C2, worse margin, smaller text, on a page type
  (case-study detail) that will repeat for every future portfolio entry — this is a template
  defect, not a one-off.
- **Severity: HIGH** (more severe failure margin than C2, on a page template that will multiply).

---

## Spacing and Rhythm

### S1. Portfolio grid has only one seeded project, producing a large orphaned empty area

- **What:** `/portfolio` and `/ar/portfolio` render a `grid-cols-3`-capable layout with a single
  card, leaving roughly two-thirds of the grid row as bare background.
- **Where:** [components/portfolio-grid.tsx](components/portfolio-grid.tsx); visible on both
  `/portfolio` and `/ar/portfolio`.
- **Affects: Both** equally (same single seeded record, mirrored grid).
- **Why it matters:** This reads as a content/seeding state (one case study exists today), not a
  layout defect — the grid itself behaves correctly and will fill in as more portfolio entries are
  added. Flagged for visibility, not as something to fix in code.
- **Severity: LOW.**

---

## Component-Level Issues

### Cmp1. Language-switcher globe button is a 36×36px target, below the 44pt mobile minimum

- **What:** `LanguageSwitcher`'s icon variant renders a 36×36px circular hit area (measured live:
  `w:35.97, h:35.97`).
- **Where:** [components/language-switcher.tsx:44-52](components/language-switcher.tsx#L44-L52),
  used in the header on every public page, both languages.
- **Affects: Both** (identical component, no language-specific sizing).
- **Why it matters:** Design Guideline — Accessibility: touch/click targets should be
  ≥44pt on mobile, ≥24pt on desktop. 36px clears the desktop floor but sits under the mobile one.
  **Caveat:** this audit's tested viewport was 1440×1024 desktop only; mobile breakpoints were not
  loaded, so this is reported from static measurement, not an observed mobile failure.
- **Severity: LOW** (fails a guideline that applies to an untested viewport; confirm on mobile
  before treating as urgent).

---

## RTL-Specific Issues

### R1. Language-switcher accessible label is in the wrong language on both sites

- **What:** `A11Y_TOGGLE_LABEL` is keyed by the *current* page's language but the string values
  are swapped: `en: "التبديل إلى العربية"` (Arabic text) and `ar: "Switch to English"` (English
  text). Verified live: on the EN `/solutions` page, the switcher button's actual
  `aria-label` attribute reads `"التبديل إلى العربية"` — Arabic. A screen-reader user on the
  English site hears an Arabic announcement out of nowhere; a screen-reader user on the Arabic
  site hears an English one.
- **Where:** [components/language-switcher.tsx:17-20](components/language-switcher.tsx#L17-L20)
  (`A11Y_TOGGLE_LABEL` object), consumed at
  [components/language-switcher.tsx:45](components/language-switcher.tsx#L45). Site-wide header,
  every public page, both languages.
- **Affects: Both**, in a mirrored way — each language gets the *other* language's label.
- **Why it matters:** Design Guideline — Accessibility: interface elements need
  correct, usable labels for assistive technology. This is the language switcher itself
  announcing in the wrong language — an accessibility bug precisely on the control whose entire
  job is language handling, and it will read as a broken/foreign element to every screen-reader
  user on the site regardless of which language they're in.
- **Severity: HIGH.**

### R2. Primary-CTA arrow icon repositions correctly for RTL but the glyph itself never flips

- **What:** Every `ArrowRight` (lucide) icon used as a "go/submit/continue" indicator on a button
  is repositioned correctly for RTL (via logical `ms-2` margin, or a manual `isRTL ? "mr-2" :
  "ml-2"` conditional, or native flex-direction reversal under `dir="rtl"`) — the icon does move
  to the correct edge of the button. But the SVG path itself is never mirrored, so in Arabic the
  glyph still visually points right (→), i.e. toward where the user just finished reading, not in
  the direction the RTL reading flow is moving. Confirmed live: `/ar/contact`'s submit button
  renders `<svg class="lucide-arrow-right">` with `transform: none`.
  The codebase already has the correct pattern in one place —
  [components/business-diagnostic.tsx:665,673](components/business-diagnostic.tsx#L665) uses
  `rtl:-scale-x-100` on a directional glyph — it just isn't applied to this icon.
- **Where:** [components/site-header.tsx:82](components/site-header.tsx#L82),
  [components/site-shell.tsx:122](components/site-shell.tsx#L122),
  [components/contact-form.tsx:84](components/contact-form.tsx#L84),
  [app/(en)/(public)/page.tsx:122,314,338](<app/(en)/(public)/page.tsx#L122>) /
  [app/ar/(public)/page.tsx:135,327,350](app/ar/(public)/page.tsx#L135),
  [app/ar/(public)/portfolio/[slug]/page.tsx:89](app/ar/(public)/portfolio/[slug]/page.tsx#L89)
  (this last one is a "Back to portfolio" arrow, which is directionally *more* wrong — it points
  the reverse of "back" in RTL).
- **Affects: AR only** for the visible symptom (the icon exists and looks correct in EN, where
  right = forward). The underlying markup is shared, so this is a single fix site-wide, not
  per-instance.
- **Why it matters:** Design Guideline — Right-to-Left > Controls: "Flip controls that
  help people navigate or access items in a fixed order... a back button must point to the right
  [in RTL] so the flow of screens matches the reading order." The "Back to portfolio" instance is
  the clearest violation of this exact clause. The generic CTA arrows are a softer version of the
  same principle (forward-motion arrows should flip).
- **Severity: MEDIUM** (site-wide visual inconsistency with the stated guideline; not a
  functional blocker, and arguably debatable for a generic "go" arrow — see also the "not worth
  changing" note on the portfolio-card expand icon below).

---

## Not Worth Changing

Items the skill's checklist would surface, that I judged fine as-is after checking:

- **Scroll-reveal sections rendering "empty" on first full-page screenshot** (`Reveal` /
  `useInView` components on the homepage). Initially looked like missing content in both EN and
  AR. Traced to [lib/hooks/use-in-view.ts](lib/hooks/use-in-view.ts) — a normal
  `IntersectionObserver`-gated fade-in that reveals correctly on real scroll (verified via
  `scrollIntoView` + wait), and **fails open to visible when `prefers-reduced-motion` is set or
  `IntersectionObserver` is unavailable** — which is the right accessibility behavior, not a bug.
  My first capture attempt just didn't give the observer time to fire before screenshotting.
- **Decorative `·` separators in the country list at ~1.48:1 contrast**
  ([app/(en)/(public)/page.tsx:191](<app/(en)/(public)/page.tsx#L191>)/[196](<app/(en)/(public)/page.tsx#L196>)). Low contrast, but marked
  `aria-hidden="true"` and purely ornamental between list items whose own text is the C2 finding
  above — WCAG contrast requirements don't apply to non-text decorative content, and removing it
  entirely wouldn't change legibility. No action needed.
- **RTL reading-order preservation on paired/sequenced content** (Before/After cards on the
  homepage, the three pricing tiers on `/solutions`, the 4-step "How we work" numbering). All of
  these deliberately swap physical position under `dir="rtl"` while preserving *logical* reading
  order — e.g. "Foundation $1,000" (cheapest, read first) sits on the right in Arabic and
  "Scale Infrastructure $30,000" (priciest, read last) sits on the left, exactly mirroring the EN
  left-to-right sequence. This is the correct RTL pattern per Design Guideline —
  Right-to-Left, and it's applied consistently. Called out here so it doesn't read as an
  oversight in this audit — it was checked and is right.
- **Phone-number field kept LTR inside an RTL form**
  ([components/contact-form.tsx](components/contact-form.tsx), placeholder `+20 100 000 0000`,
  and the portfolio detail client-fields block via `dir="ltr"` at
  [app/(en)/(public)/portfolio/[slug]/page.tsx:121](<app/(en)/(public)/portfolio/[slug]/page.tsx#L121>)). Matches Design Guideline —
  Right-to-Left > Numbers: "Don't reverse the order of numerals in a specific number."
  Correct as-is.
- **Portfolio card's external/expand arrow icon direction** — flagged during review as a possible
  R2 sibling (badge stays visually pointing up-right even after the badge's *position* mirrors to
  the card's other corner in AR), then set aside: unlike a "forward" or "back" arrow, this glyph
  reads as an "opens/expand" affordance rather than a reading-direction indicator, and HIG's own
  guidance calls out that icons tied to real-world/spatial meaning (vs. reading order) are
  commonly left unflipped. Genuinely debatable; not filed as a finding.
- **`darkMode: ["class"]` in `tailwind.config.ts` with no `.dark` styles or theme toggle
  anywhere in the codebase.** Inert configuration, not a rendering defect (nothing ever adds a
  `.dark` class), and out of this phase's visual-only scope regardless.

---

## Summary

| Severity | Count | Findings |
|---|---|---|
| HIGH | 3 | T1 (heading line-height/RTL clip), C3 (portfolio-detail caption contrast), R1 (language-switcher aria-label swap) |
| MEDIUM | 2 | C2 (homepage country-list contrast), R2 (CTA arrow not mirrored) |
| LOW | 3 | C1 (muted-foreground correction), S1 (sparse portfolio grid), Cmp1 (globe touch target) |
