# Slice 1B-interactive — the two SVG showpieces

**Working on:** master (solo-dev, commit-per-slice, review + quality gate before commit).
**Source of truth:** `docs/omniflow-extract.md`, `docs/omniflow-extract-2.md`, **plus a required third extraction** (see Prerequisite).
**Depends on:** 1B-style committed (design system, layout, bands, router, disclosures, and the two minimal placeholder slots all in place).
**Closes:** the 1B slice. After this, 1C (DB-driven content) is next.

---

## Objective

Replace the two minimal placeholder slots from 1B-style with the real bespoke SVG components, ported at high fidelity:

1. **`InteractiveSystemMap`** — Home hero right column. Central "Business System" hexagon + 6 capability nodes on a ring; scroll-in reveals the connections; hover/focus/click emphasizes one node with a traveling Flow-Orange pulse along its edge to the center.
2. **`BusinessDiagnostic`** — Solutions hero right column. 7 signal chips scattered in a field; hover/focus/click a signal (or its constraint) draws the "same-cause" links to a shared root constraint and shows a readout; a "Show the system" toggle resolves the field into 3 constraints on a Strategy rail, each labeled with its capability.

Nothing else on any page changes. This is a **slot swap plus two new client components**.

---

## Prerequisite (do this first) — third extraction

The prior extractions elided these two components' geometry. Before porting, extract **verbatim, in full**, into `docs/omniflow-extract-3.md`:

- `client/src/components/systems/InteractiveSystemMap.tsx` — complete file.
- `client/src/components/systems/BusinessDiagnostic.tsx` — complete file, **including both `LAYOUTS` objects with every percent coordinate** (the earlier pass showed these as `{...}`).
- The `./primitives` module they import from (`ring`, `edgePath`, `hexPath`, `wrapLabel`, any `mx`/geometry helpers) — complete file.
- `HexGridSubstrate` (Home hero background substrate, used at `opacity={0.035}`, `fade="radial"`) if it is a separate component and was not already ported in 1B-style.
- Any keyframes these files depend on that are **not** already in the config: `node-drift`, `constraint-breathe`, `diag-resolve`, `flow-travel` — extract the exact `@keyframes` bodies (from `index.css`/tailwind config/inline `<style>`, wherever they live).

Extraction rules: verbatim source, real values (no `{...}` elisions this time — the coordinates ARE the deliverable), note anything genuinely absent as "not present" rather than inventing. No `node_modules`/build output.

---

## Fidelity approach — port verbatim, do not reconstruct

These two files are near-pure SVG rendering + local React state. Port them essentially verbatim, changing only:

- **Add `"use client"`** at the top of each (they use `useState`/`useEffect`/`useRef`/observers).
- **Swap imports to the new app's equivalents:** `useI18n` → the new app's i18n hook; `useInView` / `useReducedMotion` → the hooks 1B-style already created in `lib/hooks/` (reuse them; only add `useReducedMotion` if 1B-style didn't). `Link` (if present) → `next/link`. lucide icon imports stay.
- **Do NOT** rewrite the geometry, re-derive hexagon math, or hand-tune new coordinate layouts. Take the extracted `primitives` and `LAYOUTS` as-is.
- **Do NOT** "improve" the interaction model, accessibility approach, or animation timings — port them as they are.

If a genuine framework incompatibility surfaces (something that cannot port as-is under Next/React 19), stop and flag it — do not silently redesign around it.

---

## In scope

1. New client component: `components/interactive-system-map.tsx` (+ its geometry in `components/systems/primitives.ts` or `lib/` — match the extracted structure).
2. New client component: `components/business-diagnostic.tsx`.
3. `HexGridSubstrate` — as a component if separate; only if not already present from 1B-style.
4. The four missing keyframes (`node-drift`, `constraint-breathe`, `diag-resolve`, `flow-travel`) added to `tailwind.config.ts`/`globals.css` — exact bodies from the extraction.
5. Slot swaps: replace the 1B-style minimal placeholders with the real components in the Home hero and Solutions hero. The hero sections are shared across languages, so this is the same swap reflected on `/`, `/ar`, `/solutions`, `/ar/solutions`.
6. Wire the components' i18n keys (`systemMap.*`, `solutions.diag.*`) — these strings already exist from 1B-content; the components consume them. No new copy.

---

## Out of scope

- **Any change to page copy, layout, bands, router, disclosures, cards, header, footer** — all frozen from 1B-style. If porting a component seems to require touching one of these, stop and flag; it almost certainly doesn't.
- **New dependencies** — none. lucide-react is already in; the components need nothing else. If the extracted source imports something not already in the project, flag it before adding, with justification.
- **DB-driven sections** — untouched, still render nothing (1C).
- **Deep-linking / analytics** — still out (Phase 5 / deferred), consistent with 1B-style.

---

## Known risks / watch-items

- **The coordinate `LAYOUTS` are the crux.** If the third extraction returns them incomplete or elided again, this slice cannot hit fidelity — reject the extraction and re-run it before porting. The coordinates are non-negotiable input, not something to approximate.
- **Static prerender must survive.** These are client components, but the six public routes must **stay `○` static** — the server renders the initial SVG (reveal fail-open state), the client hydrates and animates. No `headers()`/`cookies()`, nothing that forces dynamic rendering. Verify in the build route table.
- **Reduced-motion fail-open.** Both components must render their final/connected state immediately under `prefers-reduced-motion` (map: connections shown; diagnostic in a stable state) — no motion, no broken intermediate state. This is in the source; confirm it survived the port.
- **RTL.** `InteractiveSystemMap` mirrors x-coordinates via `mx()` in the source — confirm it works. `BusinessDiagnostic`'s field is abstract-positioned; its **readout text and labels** must read correctly RTL (logical props), even if the node field itself isn't mirrored. Verify both hero widgets visually in Arabic, not just English.
- **Decorative-only a11y.** The system map is one `role="img"` with an `aria-label`; internal groups are `aria-hidden`. The diagnostic's signals/constraints are real focusable buttons with an `aria-live` readout. Preserve each component's own accessibility model exactly as extracted — they differ deliberately.
- **Bundle/perf.** These add client JS to two otherwise-light pages. Acceptable (they're the signature visuals), but note the first-load JS delta in the report so it's visible, not silent.

---

## Acceptance criteria

Verified locally, before commit:

1. **AC-1 Third extraction complete.** `docs/omniflow-extract-3.md` contains both component files and the geometry primitives verbatim, with all `LAYOUTS` coordinates present (no elisions).
2. **AC-2 System map live.** Home hero renders the real hexagon + 6 nodes; scroll-in reveals connections; hover/focus/click emphasizes a node with the traveling pulse; keyboard focus works; RTL mirrors correctly.
3. **AC-3 Diagnostic live.** Solutions hero renders the 7-signal field; hover/focus/click draws same-cause links + readout; the entrance demo plays once and cancels on first real interaction; the "Show the system" toggle resolves the field to 3 constraints on the rail; narrow/wide layout switches on field width (ResizeObserver).
4. **AC-4 Reduced-motion fail-open.** With `prefers-reduced-motion`, both components render a stable final state immediately — no animation, no broken layout.
5. **AC-5 Routes still static.** `next build` route table shows all six public routes `○`. No dynamic rendering introduced.
6. **AC-6 Placeholders gone.** The 1B-style dashed-border placeholders are fully replaced; no placeholder markup remains in either hero.
7. **AC-7 Nothing else moved.** Copy, bands, router, disclosures, cards, header/footer unchanged from 1B-style (spot-diff the non-hero sections — they should be untouched).
8. **AC-8 No new deps** (or any addition explicitly justified and flagged).
9. **AC-9 Quality gate.** `npm run check`, `npm run lint`, `npm run build` all zero.
10. **AC-10 Both languages.** Both hero widgets verified in EN and AR; RTL readout/labels correct.

---

## Verification & handoff

- Quality gate (AC-9) mandatory.
- Operator does the runtime check (AC-2/AC-3/AC-4/AC-10) in-browser — these are interaction-heavy and won't fully verify from static inspection.
- Report: the `next build` route table (static preserved), the three quality-gate results, the first-load JS delta on `/` and `/solutions`, and confirmation that no non-hero section changed.
- **Do not commit** — operator reviews, then commits on master as the 1B-interactive slice.

---

## Slice sequencing note

This closes 1B. Two small content gaps remain parked from earlier and are **not** part of this slice — carry them to 1C or an asset step: (a) footer column headings (`footer.services`/`footer.company` values, absent from all extractions), and (b) static image assets (client logos, story image) which need migrating from the old repo into `/public`.
