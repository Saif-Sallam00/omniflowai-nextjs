# Phase 0 Research: Client Logo Marquee — Real Assets

No open `NEEDS CLARIFICATION` markers remain from `spec.md` or `plan.md`'s Technical Context — the source document (`docs/phase-5-slice-5-6-spec.md`) fully specified every technical decision needed for this slice. This document records those decisions and their rationale for traceability, rather than resolving unknowns.

## D1: Plain `<img>` instead of `next/image`

- **Decision**: Render each logo with a plain `<img src={`/clients/${file}`} alt={name} loading="lazy" width={...} height={...} className="...object-contain" />`, not `next/image`.
- **Rationale**: The marquee renders a doubled array (`[...clients, ...clients]`) inside a `flex w-max items-center animate-marquee` row so the CSS translateX(-50%) loop is seamless. `next/image` injects its own sizing/wrapper behavior (intrinsic size handling, `fill`/`sizes` layout modes) that is designed around single, layout-managed images — it fights a `w-max` flex row where every image is deliberately duplicated and the row's total width must equal exactly `2×` the natural content width for the loop math to hold. The assets are also small, static, and already served from `public/`, so `next/image`'s main benefits (remote image optimization, responsive `srcset` generation, blur placeholders) add no value here.
- **Alternatives considered**:
  - `next/image` with `unoptimized` — rejected: still carries `next/image`'s wrapper/layout assumptions and API surface for zero benefit.
  - CSS `background-image` on the card — rejected: loses semantic `alt` text (accessibility requirement, FR-004) and is a bigger deviation from the existing card markup than swapping the `<span>` for an `<img>`.

## D2: Explicit `width`/`height` + `loading="lazy"`

- **Decision**: Every `<img>` carries explicit numeric `width` and `height` attributes and `loading="lazy"`.
- **Rationale**: Without explicit dimensions, the browser cannot reserve layout space before the image decodes, causing cumulative layout shift (CLS) as each of the 52 images loads. `loading="lazy"` defers off-screen/below-the-fold image fetches; the marquee sits mid-page on both home pages, so lazy loading avoids competing with above-the-fold resources for bandwidth on first paint. The card itself is a fixed size (`h-20 w-40 md:h-24 md:w-48`) via `object-contain`, so a single representative `width`/`height` pair (aligned to the card's largest breakpoint) is sufficient — the actual rendered size is governed by the CSS classes on the `<img>`, not by the attributes, since `object-contain` scales the image to fit within them.
- **Alternatives considered**: Omitting `width`/`height` and relying on CSS-only sizing — rejected: explicit attributes are what the browser uses for CLS-safe space reservation before CSS/image load completes; relying on CSS alone reintroduces the flicker/shift this constraint exists to prevent.

## D3: Shared static list in `lib/clients.ts`, not database-driven

- **Decision**: `CLIENTS: Client[]` is a plain exported TypeScript constant in a new `lib/clients.ts` module.
- **Rationale**: Spec FR-008 and the source document are explicit that this stays a static constant — no schema change, no migration. The two existing `CLIENT_LOGOS` arrays are already static; this only deduplicates them into one shared source, matching the existing `lib/` convention in the repo (non-DB static/helper modules).
- **Alternatives considered**: Moving clients into Postgres via Drizzle — explicitly out of scope per spec Assumptions and the constitution's Scope Discipline principle; no evidence or product requirement justifies the schema/migration overhead for a static list of 26 logos.

## D4: Filenames as explicit per-entry data, not derived from `name`

- **Decision**: Each `Client` entry carries its own literal `file` string; no slugify/kebab-case transform is applied to `name` to compute a filename.
- **Rationale**: 23 of 26 assets are `.png` and 3 (`majarrah.jpg`, `pioneer.jpg`, `thaki.jpg`) are `.jpg` — verified directly against `public/clients/` in this session. A derivation rule would produce a wrong extension for those three, yielding broken images (silently, since a missing/wrong-extension image renders as an empty box in the existing card rather than an obvious error) — exactly the AC-5 / SC-002 risk the spec calls out.
- **Alternatives considered**: A naming convention with an exception list — rejected as needless indirection for 26 fixed, known entries; a flat explicit table is simpler and matches FR-002's exact data.

## Verified against current repository state

- `public/clients/` contains exactly the 26 filenames listed in spec FR-002, plus `plugin-talents.png` (confirmed present, confirmed not among the 26 — must stay unreferenced per FR-007).
- `app/(en)/(public)/page.tsx` and `app/ar/(public)/page.tsx` each currently define their own local `CLIENT_LOGOS` array of client-name strings and pass it to `<LogoMarquee clients={CLIENT_LOGOS} />`.
- `components/logo-marquee.tsx` currently accepts `{ clients: string[] }`, renders a doubled array via `[...clients, ...clients]`, uses index-based `key`, and renders a `<span>` with the client name inside a card `<div>` with fixed classes; the wrapper `<div className="relative">` and two gradient overlay `<div>`s precede the scrolling row. All of this structure is retained; only the innermost `<span>` becomes an `<img>` and the prop type changes.
