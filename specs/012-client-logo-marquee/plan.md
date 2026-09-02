# Implementation Plan: Client Logo Marquee — Real Assets

**Branch**: `012-client-logo-marquee` | **Date**: 2026-09-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/012-client-logo-marquee/spec.md`

## Summary

`components/logo-marquee.tsx` currently renders each client as a `<span>` text lockup because no logo assets existed when it was built. 26 real logo assets now exist under `public/clients/`. This plan swaps the text lockup for a plain `<img>`, and replaces the two independently-maintained `CLIENT_LOGOS: string[]` arrays (one in each of the EN and AR home pages) with a single shared `lib/clients.ts` constant. Exactly four files change: `lib/clients.ts` (new), `components/logo-marquee.tsx`, `app/(en)/(public)/page.tsx`, `app/ar/(public)/page.tsx`. The card container, wrapper, both fade-gradient overlays, and the `.animate-marquee` doubled-array loop are retained verbatim — this is a content swap inside an existing container, not a restyle.

## Technical Context

**Language/Version**: TypeScript (strict mode), React Server/Client Components, Next.js 16.x

**Primary Dependencies**: None new. Existing: Next.js, React, Tailwind (via existing utility classes already on the card). No `next/image` — a plain `<img>` is used deliberately (see Decision D1 in research.md).

**Storage**: N/A — `lib/clients.ts` is a static, code-defined TypeScript constant, not a database table.

**Testing**: Manual/browser verification per `quickstart.md` (network tab for 200s on all `/clients/*` requests, visual check for containment/no-distortion, both languages). No new automated test infrastructure is introduced by this slice; existing quality gate (`npm run check`, `npm run lint`, `npm run build`) governs correctness.

**Target Platform**: Web — Next.js App Router, server-rendered public pages, bilingual (EN root, AR `/ar/*`) per constitution Principle VII.

**Project Type**: Web application (existing Next.js repo) — this slice touches presentational component + two page files + one new lib module only.

**Performance Goals**: No regression to marquee animation smoothness or page load. Images use `loading="lazy"` and explicit `width`/`height` to avoid layout shift (CLS), per FR and the binding technical constraints below.

**Constraints** (binding, carried from `docs/phase-5-slice-5-6-spec.md` — dropped from the technology-agnostic spec.md but authoritative for this plan):
- Plain `<img>`, NOT `next/image`. The doubled-array marquee renders every logo twice inside a `w-max` flex row; `next/image`'s layout behavior (intrinsic sizing/wrapper injection) fights this container and adds no benefit for small static assets already in `public/`.
- Each `<img>` MUST carry `loading="lazy"` and explicit `width`/`height` attributes to avoid cumulative layout shift.
- Exactly four files change: `lib/clients.ts` (new), `components/logo-marquee.tsx`, `app/(en)/(public)/page.tsx`, `app/ar/(public)/page.tsx`. No others.
- `lib/clients.ts` exports `Client` (`{ name: string; file: string }`) and `CLIENTS: Client[]`. `file` is the filename only (e.g. `"petra.png"`); the component prefixes `/clients/`.
- `LogoMarquee`'s prop type changes from `{ clients: string[] }` to `{ clients: Client[] }`.
- The doubled-array loop is retained exactly; the React `key` stays index-based (each client renders twice, so name/file cannot be a unique key).
- Only the inner `<span>` is replaced by the `<img>`. The card `<div>` and its classes, the wrapper `<div className="relative">`, and both fade-gradient overlay `<div>`s are retained verbatim — no restyling.
- The component's header comment is updated — it currently states no logo assets exist in the repo, which becomes false.
- No schema change, no migration, no new dependency.

**Scale/Scope**: 26 client entries, rendered twice each (52 `<img>` nodes per page) across 2 language pages. Single presentational component change plus one new ~30-line static data module.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Relevant constitution principles evaluated:

- **Principle IV — Scope Discipline**: This slice has an explicit, narrow scope (four files, no restyling, no schema change) directly inherited from `docs/phase-5-slice-5-6-spec.md`. No adjacent cleanup, no new abstractions beyond the single `Client` type. **PASS.**
- **Principle I — Diagnosis Before Solution**: The plan is grounded in the existing component/page source (read directly, not assumed) and the asset folder listing (verified: 26 referenced files + 1 deliberately-unreferenced `plugin-talents.png`, filenames match FR-002 exactly). **PASS.**
- **Rendering & Data / P-02 (Server Components by default)**: `LogoMarquee` and the home pages remain Server Components — no `"use client"` is introduced; a static `<img>` list requires no client-side interactivity. **PASS.**
- **Verify Before Declaring Done (Principle III)**: Quality gate (`npm run check`, `npm run lint`, `npm run build`) plus manual acceptance-criteria verification (network tab, visual containment, both languages) is the acceptance bar, per spec Success Criteria and `docs/phase-5-slice-5-6-spec.md`'s own Verification section. **PASS.**
- **No new dependency, no DB/schema involvement**: Confirmed — `lib/clients.ts` is a static TS module, not Drizzle/Postgres. Constitution's Database section is not implicated. **PASS.**

No violations identified. Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/012-client-logo-marquee/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

No `contracts/` directory is generated: this slice exposes no external API, route handler, or service boundary — it is a static data module plus a presentational component change consumed only by two page files within the same app.

### Source Code (repository root)

```text
lib/
└── clients.ts                       # NEW — Client type + CLIENTS: Client[] constant (26 entries)

components/
└── logo-marquee.tsx                 # MODIFIED — <span> → <img>, prop type string[] → Client[]

app/
├── (en)/(public)/page.tsx           # MODIFIED — remove local CLIENT_LOGOS, import CLIENTS
└── ar/(public)/page.tsx             # MODIFIED — remove local CLIENT_LOGOS, import CLIENTS

public/
└── clients/                         # EXISTING — 26 referenced assets + plugin-talents.png (deliberately unreferenced)
```

**Structure Decision**: Existing single Next.js application structure (no frontend/backend split — App Router serves both). This slice adds one file (`lib/clients.ts`) alongside the existing `lib/` module directory, and modifies one existing component plus the two existing route-group home pages that already import it. No new directories are introduced.

## Complexity Tracking

*No Constitution Check violations — this section is not applicable.*
