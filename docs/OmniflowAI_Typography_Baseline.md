# OmniflowAI Typography Baseline
## Canonical Reference for Existing and Future Pages

**Status:** Approved baseline after typography alignment with the original OmniflowAI website  
**Purpose:** Use this document whenever creating a new page, section, component, card, CTA, article, case study, or marketing surface inside the updated OmniflowAI website.

---

# 1. Core Principle

The current website typography is intentionally **mixed**, not globally standardized into a single "heading font" and "body font" rule.

Do **not** assume:

- every heading should use Space Grotesk;
- every card title should use the same family;
- every eyebrow should use Inter;
- every semibold Space Grotesk request needs a real 600 font file.

The correct approach is:

> **Choose typography based on the role and context of the element, following the patterns below.**

The original website is the visual source of truth, and the updated site has been aligned to it.

---

# 2. Font Families

## Inter

Use Inter for:

- body copy;
- navigation links;
- buttons;
- most Home page headings;
- Home Hero H1;
- Home section H2s;
- Home capability card titles;
- metrics / statistics;
- Portfolio project card titles;
- Portfolio metadata;
- most supporting UI text.

Preferred stack:

```css
font-family: var(--font-inter), "Inter", sans-serif;
```

Tailwind:

```text
font-sans
```

---

## Space Grotesk

Use Space Grotesk selectively for:

- brand / logo text;
- Portfolio page H1;
- Articles page H1;
- article card titles;
- display-style page headings;
- page-level editorial / showcase headings that visually match existing Portfolio / Articles patterns.

Preferred stack:

```css
font-family:
  var(--font-space-grotesk),
  "Space Grotesk",
  var(--font-inter),
  "Inter",
  sans-serif;
```

Tailwind:

```text
font-display
```

### Loaded weights

Only:

```text
400
700
```

are intentionally loaded for Space Grotesk.

Do **not** add 500 or 600 solely because a component requests:

```text
font-medium
font-semibold
```

The existing website intentionally relies on browser nearest-face matching for those cases.

---

## System Monospace

Use system monospace for editorial / metadata microtext such as:

- article eyebrows;
- article dates;
- selected metadata labels;
- compact editorial category labels.

Stack:

```css
ui-monospace,
SFMono-Regular,
"SF Mono",
Menlo,
Consolas,
monospace;
```

Tailwind:

```text
font-mono
```

Do not replace these with Inter unless the new page is intentionally following a Home-page-style eyebrow pattern.

---

## Cairo

Use Cairo for Arabic / RTL content according to the existing Arabic implementation.

Current loaded weights:

```text
400
500
600
700
```

Do not change the Arabic font configuration while working on unrelated English typography.

---

# 3. Global Rules

## Root Font Size

The site assumes:

```text
1rem = 16px
```

Do not change the root `html` font size unless the entire typography system is intentionally being redesigned.

---

## Body

The body should remain:

```text
font-sans antialiased
```

Equivalent:

```css
body {
  font-family: var(--font-inter), "Inter", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

---

## Valid Sans Stack

Do not introduce dangling CSS custom properties into `font-family`.

Correct pattern:

```ts
fontFamily: {
  sans: [
    "var(--font-inter)",
    "Inter",
    "sans-serif",
  ],
}
```

Avoid:

```ts
"var(--font-sans)"
```

unless `--font-sans` is explicitly defined.

---

# 4. Typography Roles

# A. Navigation

## Logo

Use:

```text
Font: Space Grotesk
Size: 36px
Weight: 700
Line-height: 40px
Tracking: -0.025em
```

Tailwind:

```text
font-display text-4xl font-bold tracking-tight
```

---

## Desktop Nav Links

Use:

```text
Font: Inter
Size: 14px
Weight: 500
Line-height: 20px
Tracking: normal
```

Tailwind:

```text
text-sm font-medium
```

Active state should normally change color / decoration only, not typography.

---

## Navbar CTA

Use:

```text
Font: Inter
Size: 14px
Weight: 600
Line-height: 20px
```

Tailwind:

```text
text-sm font-semibold
```

---

# B. Home / Marketing Hero

## Hero H1

The Home Hero is **Inter**, not Space Grotesk.

Use:

```text
Font: Inter
Weight: 900
Tracking: -0.025em
```

Responsive sizes:

| Breakpoint | Font Size | Effective Line Height |
|---|---:|---:|
| Base < 640px | 36px | 39.6px |
| sm ≥ 640px | 48px | 48px |
| md ≥ 768px | 60px | 60px |
| lg ≥ 1024px | 72px | 72px |

Tailwind pattern:

```text
text-4xl
sm:text-5xl
md:text-6xl
lg:text-7xl
font-black
leading-[1.1]
tracking-tight
```

Do not automatically add `font-display`.

---

## Hero Supporting Paragraph

Use:

```text
Font: Inter
Size: 18px base
Size: 20px at md+
Weight: 400
Tracking: normal
```

Tailwind:

```text
text-lg md:text-xl leading-relaxed
```

---

## Hero Primary CTA

Use:

```text
Font: Inter
Size: 14px
Weight: 700
Line-height: 20px
```

Tailwind:

```text
text-sm font-bold
```

---

## Hero Secondary CTA

Use:

```text
Font: Inter
Size: 14px
Weight: 500
Line-height: 20px
```

Tailwind:

```text
text-sm font-medium
```

---

# C. Home Section Headings

Most Home page section headings use **Inter**, not Space Grotesk.

## Standard Home Section H2

Typical target:

```text
Font: Inter
Size: 30px base
Size: 36px at md+
Weight: 700
```

Common Tailwind:

```text
text-3xl md:text-4xl font-bold
```

Use `tracking-tight` only where the existing visual pattern calls for it.

---

## Large Home Statement H2

For large statement / problem / final-CTA sections:

```text
Font: Inter
Size: 30px base
Size: 48px at md+
Weight: 700
```

Common Tailwind:

```text
text-3xl md:text-5xl font-bold leading-tight
```

Do not switch these to Space Grotesk without a deliberate design reason.

---

# D. Home Capability Cards

## Card Title

Use:

```text
Font: Inter
Size: 20px
Weight: 600
Line-height: 1.375
```

Tailwind:

```text
text-xl font-semibold leading-snug
```

---

## Card Body

Use:

```text
Font: Inter
Size: 14px base
Size: 16px at md+
Weight: 400
Line-height: 1.625
```

Tailwind:

```text
text-sm md:text-base leading-relaxed
```

---

## Small Footer / Subcap

Use:

```text
Font: Inter
Size: 12px
Weight: 500
```

Tailwind:

```text
text-xs font-medium
```

---

# E. Metrics / Stats

Primary metric values:

```text
Font: Inter
Size: 36px base
Size: 48px at md+
Weight: 700
Line-height: 1.25
```

Use:

```text
tabular-nums
```

for numeric stats when matching the existing metric style.

Tailwind:

```text
text-4xl md:text-5xl font-bold leading-tight tabular-nums
```

Supporting metric labels:

```text
Inter
14px base
16px at md+
400
```

---

# F. Portfolio Pages

## Portfolio Page H1

Use:

```text
Font: Space Grotesk
Size: 36px base
Size: 48px at md+
Weight: 700
Tracking: usually -0.025em
```

Tailwind:

```text
font-display text-4xl md:text-5xl font-bold
```

Use `tracking-tight` when visually matching the existing page title treatment.

---

## Portfolio Supporting Paragraph

Use:

```text
Font: Inter
Size: 20px
Weight: 400
Line-height: 28px
```

Tailwind:

```text
text-xl
```

---

## Portfolio Filter Tabs

Use:

```text
Font: Inter
Size: 14px
Weight: 500
```

Tailwind:

```text
text-sm font-medium
```

Active state should normally change background / color only.

---

## Portfolio Project Card Title

Important:

**Use Inter, not Space Grotesk.**

Target:

```text
Font: Inter
Size: 20px
Weight: 700
```

Tailwind:

```text
text-xl font-bold
```

Do **not** add:

```text
font-display
```

---

## Portfolio Category Badge

Use:

```text
Font: Inter
Size: 10px
Weight: 600
Transform: uppercase
Tracking: 0.05em
```

Tailwind:

```text
text-[10px] font-semibold uppercase tracking-wider
```

---

## Portfolio Client / Subtitle

Use:

```text
Font: Inter
Size: 14px
Weight: 500
```

Tailwind:

```text
text-sm font-medium
```

---

## Portfolio Tags

Use:

```text
Font: Inter
Size: 11px
Weight: 400
```

Tailwind:

```text
text-[11px]
```

---

# G. Articles / Editorial Pages

## Editorial Eyebrow

Use system monospace:

```text
Font: system monospace
Size: 11px
Weight: 400
Transform: uppercase
Tracking: 0.2em
```

Tailwind:

```text
font-mono text-[11px] uppercase tracking-[0.2em]
```

---

## Articles Page H1

Use:

```text
Font: Space Grotesk
Size: 30px base
36px at sm
48px at md+
Weight: 700
Tracking: -0.025em
```

Tailwind:

```text
font-display
text-3xl
sm:text-4xl
md:text-5xl
font-bold
leading-[1.1]
tracking-tight
```

---

## Editorial Supporting Paragraph

Use:

```text
Font: Inter
Size: 16px
Weight: 400
Line-height: 1.625
```

Tailwind:

```text
leading-relaxed
```

---

## Article Date / Metadata

Use:

```text
Font: system monospace
Size: 10px
Weight: 400
Transform: uppercase
Tracking: 0.12em
```

Tailwind:

```text
font-mono text-[10px] uppercase tracking-[0.12em]
```

---

## Article Card Title

Use:

```text
Font: Space Grotesk
Size: 18px
Requested Weight: 600
Line-height: 1.375
Tracking: -0.025em
```

Tailwind:

```text
font-display text-lg font-semibold leading-snug tracking-tight
```

Important:

Space Grotesk 600 is **not** loaded as a dedicated face.

Do not add a 600 font file just to "fix" this.

---

## Article Excerpt

Use:

```text
Font: Inter
Size: 14px
Weight: 400
Line-height: 1.625
```

Tailwind:

```text
text-sm leading-relaxed
```

---

# 5. Eyebrow Decision Guide

There are two valid eyebrow patterns.

## Editorial / Technical Eyebrow

Use for:

- Articles;
- metadata-heavy pages;
- editorial labels;
- solution / diagnostic micro-labels.

Pattern:

```text
font-mono
uppercase
10–11px
tracking 0.12em–0.2em
```

Example:

```text
font-mono text-[11px] uppercase tracking-[0.2em]
```

---

## Home / Marketing Eyebrow

Use for lightweight marketing labels such as "Trusted partners".

Pattern:

```text
Inter
12px
600
uppercase
0.1em tracking
```

Example:

```text
text-xs font-semibold uppercase tracking-widest
```

---

# 6. Choosing the Right Heading Style for a New Page

When creating a new page, choose based on the page type.

## Marketing / Home-like Landing Page

Use Inter for the dominant hero and section headings.

Recommended:

```text
Hero:
Inter / 900

Section H2:
Inter / 700

Card titles:
Inter / 600–700
```

Do not automatically use Space Grotesk.

---

## Portfolio / Showcase Page

Use Space Grotesk for the page-level H1.

Use Inter for project card titles unless the component is explicitly editorial.

Recommended:

```text
Page H1:
Space Grotesk / 700

Project cards:
Inter / 700

Supporting copy:
Inter / 400
```

---

## Articles / Editorial Page

Use Space Grotesk for editorial page titles and article titles.

Use system monospace for dates / eyebrows / compact metadata.

Use Inter for paragraphs.

Recommended:

```text
Page H1:
Space Grotesk / 700

Article title:
Space Grotesk / 600 request

Date:
System mono / 400

Body:
Inter / 400
```

---

## Generic Internal Page

If the page is not clearly Home-like, Portfolio-like, or Editorial:

Default to:

```text
Page H1:
Space Grotesk / 700

Body:
Inter / 400

Buttons / navigation / controls:
Inter

Metadata:
Inter unless editorial styling is intended
```

Then compare visually with the closest existing page.

---

# 7. Recommended Reusable Type Recipes

These are recommended class recipes for new development.

## Marketing Hero

```tsx
className="
  text-4xl
  sm:text-5xl
  md:text-6xl
  lg:text-7xl
  font-black
  leading-[1.1]
  tracking-tight
"
```

Family: inherited Inter / `font-sans`.

---

## Display Page H1

```tsx
className="
  font-display
  text-4xl
  md:text-5xl
  font-bold
  tracking-tight
"
```

---

## Editorial H1

```tsx
className="
  font-display
  text-3xl
  sm:text-4xl
  md:text-5xl
  font-bold
  leading-[1.1]
  tracking-tight
"
```

---

## Standard Marketing H2

```tsx
className="
  text-3xl
  md:text-4xl
  font-bold
"
```

---

## Large Statement H2

```tsx
className="
  text-3xl
  md:text-5xl
  font-bold
  leading-tight
"
```

---

## Marketing Card Title

```tsx
className="
  text-xl
  font-semibold
  leading-snug
"
```

---

## Portfolio Card Title

```tsx
className="
  text-xl
  font-bold
"
```

No `font-display`.

---

## Article Card Title

```tsx
className="
  font-display
  text-lg
  font-semibold
  leading-snug
  tracking-tight
"
```

---

## Large Body

```tsx
className="
  text-lg
  md:text-xl
  leading-relaxed
"
```

---

## Standard Body

```tsx
className="
  text-base
"
```

Add:

```text
leading-relaxed
```

when matching long-form / marketing paragraph treatment.

---

## Small Body

```tsx
className="
  text-sm
  leading-relaxed
"
```

---

## Nav Link

```tsx
className="
  text-sm
  font-medium
"
```

---

## Primary CTA

```tsx
className="
  text-sm
  font-bold
"
```

---

## Secondary CTA

```tsx
className="
  text-sm
  font-medium
"
```

---

## Editorial Eyebrow

```tsx
className="
  font-mono
  text-[11px]
  uppercase
  tracking-[0.2em]
"
```

---

## Editorial Date

```tsx
className="
  font-mono
  text-[10px]
  uppercase
  tracking-[0.12em]
"
```

---

## Marketing Eyebrow

```tsx
className="
  text-xs
  font-semibold
  uppercase
  tracking-widest
"
```

---

# 8. Weight Rules

## Inter

Available and safe:

```text
300
400
500
600
700
900
```

Common usage:

| Weight | Typical Use |
|---:|---|
| 400 | body copy |
| 500 | nav, tabs, secondary CTA |
| 600 | navbar CTA, marketing eyebrow, capability title |
| 700 | strong headings, metrics, Portfolio card title, primary CTA |
| 900 | Home Hero H1 |

---

## Space Grotesk

Loaded:

```text
400
700
```

Existing components may request:

```text
500
600
900
```

Do not add new font files without a deliberate typography decision.

For new components, prefer:

```text
700
```

for display headings unless matching an existing component that intentionally requests 600.

---

# 9. Tracking Rules

Common approved values:

| Role | Tracking |
|---|---:|
| Hero / display heading | `-0.025em` |
| Normal body / nav / buttons | `normal` |
| Marketing eyebrow | `0.1em` |
| Portfolio category badge | `0.05em` |
| Editorial date | `0.12em` |
| Editorial eyebrow | `0.2em` |

Avoid inventing arbitrary tracking values unless matching an existing component.

---

# 10. Line-Height Rules

Use existing patterns rather than manually assigning random pixel values.

## Approved patterns

```text
Hero responsive display:
1.1 mobile, effectively 1.0 at sm+

Large statement:
leading-tight

Card titles:
leading-snug

Long body:
leading-relaxed

Standard text:
Tailwind size default unless a nearby component establishes another pattern
```

Do not globally force all headings to the same line-height.

---

# 11. New Page Checklist

Before merging a new page, confirm:

## Font Family

- [ ] Is the page Home-like, Portfolio-like, or Editorial?
- [ ] Did I choose Inter vs Space Grotesk based on an existing page pattern?
- [ ] Did I avoid "all headings = Space Grotesk"?
- [ ] Are metadata labels using the correct Inter vs mono pattern?

## Sizes

- [ ] Page H1 matches the closest existing page type.
- [ ] Section H2s use existing Tailwind scale values.
- [ ] Body copy uses 14 / 16 / 18 / 20px patterns already present.
- [ ] Buttons remain 14px unless there is a documented existing exception.

## Weights

- [ ] Inter weight is one of the loaded weights.
- [ ] I did not add Space Grotesk 500/600 files just because a class requests those weights.
- [ ] Portfolio card titles remain Inter 700.
- [ ] Home marketing card titles remain Inter 600.

## Tracking

- [ ] Display headings use `tracking-tight` where appropriate.
- [ ] Editorial labels use 0.12em–0.2em patterns.
- [ ] Marketing eyebrow uses 0.1em.
- [ ] Body / nav / CTA tracking remains normal.

## Rendering

- [ ] Body still has `antialiased`.
- [ ] `font-sans` contains no undefined CSS variable.
- [ ] No root font-size override has been introduced.
- [ ] No page-level CSS unintentionally overrides the font stack.

---

# 12. Things Not to Normalize Without a Design Decision

Do not "clean up" the following just because they look inconsistent in code:

- Home Hero H1 using Inter.
- Home H2s using Inter.
- Portfolio page H1 using Space Grotesk.
- Portfolio card titles using Inter.
- Article card titles using Space Grotesk.
- Article metadata using system monospace.
- Trusted Partners eyebrow using Inter instead of mono.
- Space Grotesk having only 400 / 700 loaded.
- different card-title treatments across page types.
- different line-height mechanisms across page types.

These are part of the current visual language.

---

# 13. Recommended Decision Tree

When adding text to a new component:

```text
Is it body / navigation / button / UI?
→ Inter

Is it a Home-style marketing hero or section heading?
→ Inter

Is it a page-level showcase/editorial heading?
→ Space Grotesk

Is it a Portfolio project card title?
→ Inter 700

Is it an article/editorial card title?
→ Space Grotesk

Is it a date / editorial eyebrow / compact metadata label?
→ System monospace

Is it a marketing eyebrow?
→ Inter 600 uppercase
```

---

# 14. Canonical Quick Reference

| Role | Family | Size | Weight | Tracking |
|---|---|---:|---:|---:|
| Home Hero H1 | Inter | 36→48→60→72 | 900 | -0.025em |
| Home H2 | Inter | 30→36 / 48 | 700 | normal / -0.025em |
| Display Page H1 | Space Grotesk | 36→48 | 700 | -0.025em |
| Editorial H1 | Space Grotesk | 30→36→48 | 700 | -0.025em |
| Marketing Card Title | Inter | 20 | 600 | normal |
| Portfolio Card Title | Inter | 20 | 700 | normal |
| Article Card Title | Space Grotesk | 18 | 600 request | -0.025em |
| Large Body | Inter | 18→20 | 400 | normal |
| Standard Body | Inter | 16 | 400 | normal |
| Small Body | Inter | 14 | 400 | normal |
| Nav Link | Inter | 14 | 500 | normal |
| Navbar CTA | Inter | 14 | 600 | normal |
| Primary CTA | Inter | 14 | 700 | normal |
| Secondary CTA | Inter | 14 | 500 | normal |
| Marketing Eyebrow | Inter | 12 | 600 | 0.1em |
| Editorial Eyebrow | System mono | 11 | 400 | 0.2em |
| Editorial Date | System mono | 10 | 400 | 0.12em |
| Metric | Inter | 36→48 | 700 | normal |

---

# 15. Final Rule

When in doubt:

1. Find the existing page that is closest in purpose to the new page.
2. Copy its typography pattern before inventing a new one.
3. Preserve the current Inter / Space Grotesk / mono division.
4. Verify the result visually at desktop and mobile breakpoints.
5. Prefer consistency with the existing website over abstract typography "best practices."

This document is the canonical typography baseline for future OmniflowAI page development.
