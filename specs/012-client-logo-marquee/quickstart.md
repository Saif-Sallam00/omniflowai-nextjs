# Quickstart: Validating Client Logo Marquee — Real Assets

Manual validation guide for this slice. No new test infrastructure is introduced; this proves the feature works end-to-end against the acceptance criteria in `spec.md` and `docs/phase-5-slice-5-6-spec.md`.

## Prerequisites

- Implementation complete per `plan.md` (four files changed: `lib/clients.ts`, `components/logo-marquee.tsx`, `app/(en)/(public)/page.tsx`, `app/ar/(public)/page.tsx`).
- Local dev server runnable (`npm run dev` or project's standard start command).

## Quality gate (run first)

```bash
npm run check   # TypeScript, zero errors
npm run lint    # ESLint, zero errors
npm run build   # next build succeeds
```

All three MUST exit zero before manual verification (constitution: Verify Before Declaring Done).

## Manual verification steps

1. **Start the app** and open the English home page (`/`).
   - Scroll to the client marquee section.
   - Confirm every card shows a logo **image**, not text (spec SC-001, AC-3).
   - Open browser devtools → Network tab, filter on `clients`, reload. Confirm every `/clients/*` request returns **200** — zero 404s (spec SC-002, AC-5). This specifically catches filename/extension mismatches (e.g. a `.jpg` entry pointed at a `.png` path).
   - Visually confirm no logo is stretched, cropped-through-distortion, or overflowing its card, across the range of asset aspect ratios (spec SC-003, AC-6).
   - Watch the marquee for a full loop cycle; confirm it still scrolls and loops with no stutter or visible seam (spec SC-004, AC-7).
   - Confirm card size, borders, shadows, spacing, and the two edge fade-gradients are unchanged from the pre-slice render (spec SC-006, AC-8).

2. **Open the Arabic home page** (`/ar`).
   - Repeat the same checks (images not text, network 200s, no distortion, animation intact, unchanged styling) (spec AC-4).
   - Confirm the 26 logos and their order match the English page, and that each `alt` attribute is the client's name **verbatim**, identical to the English page's `alt` text — no localized wrapper text (spec FR-004, AC-4).

3. **Count DOM nodes** (either page): confirm 26 distinct logos × 2 (doubled loop) = 52 `<img>` elements in the marquee row (spec AC-3).

4. **Confirm exclusion**: search the codebase for `plugin-talents` — it MUST NOT appear anywhere (spec FR-007, AC-9).

   ```bash
   grep -r "plugin-talents" app lib components
   ```

   Expected: no matches.

5. **Confirm zero drift**: this work happens directly on `master` (no feature branch — no `.specify/extensions.yml` hook creates one, which is this project's intentional master-only convention, not an error). Check the working tree directly rather than diffing against a branch ref, and confirm only the four expected files changed (spec AC-11).

   ```bash
   git status --short
   git diff --stat
   ```

   Expected paths (new or modified): `lib/clients.ts`, `components/logo-marquee.tsx`, `app/(en)/(public)/page.tsx`, `app/ar/(public)/page.tsx`. No other path should appear.

6. **Confirm list de-duplication**: search both page files for `CLIENT_LOGOS` — it MUST NOT appear (spec AC-2, User Story 2).

   ```bash
   grep -n "CLIENT_LOGOS" "app/(en)/(public)/page.tsx" "app/ar/(public)/page.tsx"
   ```

   Expected: no matches; both files instead import `CLIENTS` from `lib/clients.ts`.

## Known, accepted limitation to check for (not a failure)

- Any logo asset that is white-on-transparent will be invisible against the section's white card background. If observed, **report it** (which client, which file) rather than restyling the card — remediation is an explicit out-of-scope decision for this slice (spec Edge Cases, `docs/phase-5-slice-5-6-spec.md` Note).

## Expected outcome

All quality-gate commands exit zero, all manual checks above pass, and the one known limitation (if any logo is white-on-transparent) is reported rather than fixed in this slice.
