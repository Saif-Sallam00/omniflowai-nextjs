# Decision 016 — Touch-target backlog: the full PV-4 inventory beyond Slice 6.1

**Date:** 2026-09-03
**Status:** Backlog record (not a decision to fix anything — no fix is proposed here)
**Type:** Findings inventory, preserved so PV-4's work is not lost between gates
**Related:** Phase 6, Slice 6.1 (`specs/015-a11y-defect-fixes/`) — Gate 1 pre-work item PV-4;
sources `docs/phase-6-design-audit.md`, `docs/phase-6-design-audit-mobile.md`

## Why this document exists

Slice 6.1 fixes four accessibility defects: R1 (language-switcher `aria-label` swap), Mob9
(mobile-nav focus trap / Escape), and Mob4 + Mob5 (two 40×40px controls under the 44×44px
touch-target minimum). Its Gate 1 pre-work included PV-4: a repo-wide grep — every
directory, not just the ones the slice expects to touch — for other interactive controls
that might share the Mob4/Mob5 pattern. Both prior design-audit passes were scoped to public
marketing pages at a handful of viewports; neither claimed to enumerate every interactive
control in the codebase, and PV-4 confirmed they didn't.

PV-4 found 11 additional confirmed undersized controls and 2 borderline ones, none
overlapping Slice 6.1's four defects. All of it stays out of Slice 6.1 by design — see that
slice's spec.md "Out of Scope" section. This document exists so that inventory survives past
Gate 1 in full, with file:line, instead of living only in a chat transcript. **It proposes no
fixes.** Whether, when, and how to act on any of it is a future decision, not this one.

## Confirmed under 44×44px

| # | Location | Public / Admin | Size | Notes |
|---|---|---|---|---|
| 1 | `components/language-switcher.tsx:44-52` | Public (header, `md:` and up only) | 36×36 | This is Cmp1 from the desktop audit — refuted as a phone-width issue (doesn't render below 768px) but confirmed unchanged at 768px and above. Already tracked; listed here for completeness of the inventory, not as new. |
| 2 | `components/admin/button.tsx:15-22` | Admin | ~34px tall (`py-1.5` = 12px + `text-sm` line-height 20px) | The single shared `<Button>` component. Root cause for essentially every admin touch-target finding below — see "One fix, not fifteen" section. |
| 3 | `app/(en)/admin/(protected)/admin-nav.tsx:53-61` | Admin | ~34px tall | Admin's own mobile nav hamburger/close toggle — a separate component from the public site's, not fixed by Slice 6.1's Mob4 work. |
| 4 | `app/(en)/admin/(protected)/admin-nav.tsx:28-38` | Admin | ~36px tall (`py-2` = 16px + `text-sm` 20px) | `SidebarLinks` — desktop sidebar and mobile drawer nav items. Text-labelled, full-width rows, so width is not at issue, only height. |
| 5 | `app/(en)/admin/(protected)/projects/chip-input.tsx:49-56` | Admin | No padding — roughly 10-14px per side around the glyph | Tag "remove" (×) button inside `ChipInput`. Icon-only (bare `×` character), same risk class as Mob4/Mob5. |
| 6 | `app/(en)/admin/(protected)/articles/body-editor.tsx:46-51` | Admin | ~34px tall | "Insert image" `<label>` styled as a button (file-input trigger). Same arithmetic as #2. |
| 7 | `components/business-diagnostic.tsx:553-592` | **Public** (`/solutions`, `/ar/solutions`) | 24×24 (`p-2` = 8px×2 + `h-2 w-2` mark = 8px) | Constraint-node button in the interactive diagnostic map. **The code carries its own comment**: `// Padding, not size: the dormant mark stays 8px while the hit area clears the 24px minimum.` — i.e. this was deliberately built to satisfy WCAG's *desktop* 24px floor. Nothing in the surrounding code suggests the 44px *mobile* floor was ever considered for this control. Icon-only, no visible text. |
| 8 | `components/business-diagnostic.tsx:484-506` | **Public** (`/solutions`, `/ar/solutions`) | ~31-32px tall at mobile (`py-2` = 16px + `text-[11px]` line-height ≈ 15-16px); width depends on label text, capped by `max-w-[8.5rem]`/`max-w-[9.5rem]` but not fixed | Signal-node buttons, same diagnostic-map component. Has visible text, so a softer miss than #7, but still under the 44px height floor. |
| 9 | `components/business-diagnostic.tsx:658-678` | **Public** (`/solutions`, `/ar/solutions`) | ~14-16px tall, no padding (`text-[10px]` line-height only) | "Show system" / "Show signals" mode-toggle button, same component. Has visible text (uppercase mono label), lowest severity of the three `business-diagnostic.tsx` items but still far under 44px. |
| 10 | `components/portfolio-grid.tsx:53-64` | **Public** (`/portfolio`, `/ar/portfolio`) | ~36px tall (`py-2` = 16px + `text-sm` 20px) | Category filter-tab buttons. Text-labelled, full-width-of-label rows — width is not at issue, only height. |
| 11 | `app/(en)/admin/(protected)/articles/article-form.tsx:177-186` ("Published" checkbox) and `app/(en)/admin/(protected)/projects/project-form.tsx:347-370` ("Featured", "Service showcase" checkboxes) | Admin | Checkbox glyph itself: `h-4 w-4` = 16×16. Effective row height (label + checkbox, no padding): ~20px (`text-sm` line-height) | Native `<input type="checkbox">` custom-sized well under 44×44; the wrapping `<label>` extends the *width* of the clickable area across the text but does not fix the *height*. |

Every "Admin" row above is explicitly out of scope for Slice 6.1 — the slice's carried-forward
constraint list only names the language switcher, the mobile nav/header, and the footer
newsletter control as expected changed files. Admin surfaces were never in scope to begin
with; PV-4 covered them anyway per its instruction to search the entire repo, not just the
directories a narrower search would have assumed.

## One fix, not fifteen

Row #2 (`components/admin/button.tsx`) is the shared `<Button>` primitive consumed by roughly
15 admin call sites, all inheriting the same ~34px height from that one component:

- `app/(en)/admin/auth/login-form.tsx:17` (Sign in)
- `app/(en)/admin/(protected)/sign-out-button.tsx:9` (Sign out)
- `app/(en)/admin/(protected)/articles/article-form.tsx:48`
- `app/(en)/admin/(protected)/articles/delete-article-form.tsx:9`
- `app/(en)/admin/(protected)/articles/page.tsx:68` (New article)
- `app/(en)/admin/(protected)/leads/delete-lead-form.tsx:9` (`text-xs` override — even
  smaller than the base component, roughly 28-30px)
- `app/(en)/admin/(protected)/projects/delete-project-form.tsx:9`
- `app/(en)/admin/(protected)/projects/project-form.tsx:75,324`
- `app/(en)/admin/(protected)/projects/results-editor.tsx:87,90,98,104`
- `app/(en)/admin/(protected)/projects/system-cards-editor.tsx:130,133,141,152`
- `app/(en)/admin/(protected)/projects/page.tsx:21` (New project)

None of these is a separate defect requiring its own fix. A single change to
`components/admin/button.tsx`'s base height would resolve all of them at once — recorded here
so a future pass doesn't accidentally treat this as fifteen independent line items.

## Borderline — need live measurement before they can be confirmed either way

| # | Location | Public / Admin | Why it's borderline |
|---|---|---|---|
| 12 | `app/(en)/(public)/portfolio/[slug]/page.tsx:88-93` and the `app/ar/...` equivalent — "Back to portfolio" link | **Public** | No padding; height ≈ `text-xs` line-height (~16px), estimated from source, not measured live. Has visible text and might qualify for WCAG's inline-text target-size exception, but it's a standalone link rather than text embedded in a paragraph, so that exception is arguable rather than clear-cut. Needs a live rendered measurement, and a judgment call on whether the exception applies, before it can be filed as confirmed either way. |
| 13 | `components/interactive-system-map.tsx:232-283` — hero "system map" hex nodes on the public home page | **Public** | Each node is an SVG `<g>` with `onClick`/`cursor-pointer`, but is explicitly `aria-hidden="true"` and, per the code's own comment, deliberately **not keyboard-focusable**. It has no `role="button"` and is outside the accessibility tree, so it may fall outside WCAG 2.5.8's definition of a "target" (pointer-operable controls exposed as such) regardless of pixel size. Its rendered size also can't be read from source — it scales with the SVG `viewBox` against a responsive container, so actual CSS-pixel size depends on live viewport width. Needs live measurement, and a scoping judgment call (does an intentionally-non-interactive-to-AT decorative click surface even count), before it can be filed as confirmed either way. |

## Reviewed and cleared — not part of this backlog

Checked during PV-4 and ruled out; recorded so they aren't re-investigated later under the
mistaken impression they were never checked:

- `components/disclosure.tsx:21-35` — FAQ/"What's included" toggle: `min-h-[2.75rem]` = 44px
  exactly, and actual rendered height exceeds that floor once `py-3.5` and text line-height
  are accounted for. Clears the minimum.
- `components/hex-glyph.tsx:23` — the `w-9 h-9`/`w-11 h-11` box is purely decorative (no
  `onClick`, no link/button wrapper); not an interactive element at all.
- `components/portfolio-grid.tsx:82` — the `h-10 w-10` circular arrow badge is decorative;
  the actual clickable element is the enclosing full-size card `<Link>`, far larger than
  44×44.
- `components/solutions-interactive.tsx:296-327` — router-question `<label>` radio rows:
  `min-h-[3.25rem]` = 52px. Clears the minimum.

## Explicitly not decided here

- Whether any of the items above will be fixed, in what order, or in what slice.
- Whether the admin surfaces get the same 44×44px mobile-touch bar applied to them at all —
  admin is typically operated at desktop, and neither design audit's brief extended WCAG's
  mobile touch-target floor to `/admin/*`. That scoping question is unresolved and belongs to
  whichever future slice picks this up, not to this record.
- Whether rows #12 and #13 are real defects or false positives — both require live
  measurement (and, for #13, a scoping judgment) that PV-4 explicitly did not perform, by
  design, since Slice 6.1 does not touch either of them.

This document is descriptive, not prescriptive. It is complete as of Slice 6.1 Gate 1's
PV-4 pass; it is not re-verified or updated by this slice's later gates.
