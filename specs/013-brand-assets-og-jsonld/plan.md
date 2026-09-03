# Implementation Plan: Brand Assets, Default OG Image, Organization JSON-LD

**Branch**: `master` (per operator instruction — this project is master-only; no feature branch is created for this slice) | **Date**: 2026-09-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/013-brand-assets-og-jsonld/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Static pages (home, about, services, contact, articles list, portfolio list) currently share to social platforms with a blank preview card because `buildPageMetadata` omits `openGraph.images`/`twitter.images` entirely when no `imageUrl` is passed. Separately, `ORGANIZATION_REF` in `lib/structured-data.ts` is only ever emitted nested as `publisher` inside Article/CreativeWork JSON-LD on the 4 existing detail pages — no standalone Organization entity exists for `Organization.logo` to attach to. This plan wires up: (1) a default-image fallback plus additive OG fields (`siteName`, `type`, `locale`, `alternateLocale`) inside `buildPageMetadata`, backed by two new named asset-path constants added to `lib/site.ts` alongside the existing `siteUrl` export, (2) a new `buildOrganizationJsonLd(language)` emitting a stable-`@id` Organization node on both home pages, with `ORGANIZATION_REF` updated to carry the same `@id`, and (3) confirmation (not creation) that the already-committed `app/icon.png`/`app/apple-icon.png` resolve under both root layouts. No image assets are touched, and `lib/site.ts`'s existing `siteUrl` export and its `BETTER_AUTH_URL` derivation are left untouched — only two new sibling constants are added to that file.

## Verified Facts (supersede spec.md Assumptions on these two points)

**(a) No standalone Organization JSON-LD entity exists anywhere in the repo today.**
`lib/structured-data.ts:4-8` defines:
```ts
const ORGANIZATION_REF = (language: Language) => ({
  "@type": "Organization",
  name: "OmniflowAI",
  url: buildAbsoluteUrl(getLanguagePath("/", language)),
});
```
It carries no `@id`. It is referenced nested as `publisher` at exactly two call sites within that same file: `lib/structured-data.ts:32` (inside `buildArticleJsonLd`) and `lib/structured-data.ts:49` (inside `buildCaseStudyJsonLd`). Those two functions are in turn called from exactly 4 page files (grep-confirmed, no other call sites exist):
- `app/(en)/(public)/articles/[slug]/page.tsx:89` — `buildArticleJsonLd`
- `app/ar/(public)/articles/[slug]/page.tsx:89` — `buildArticleJsonLd`
- `app/(en)/(public)/portfolio/[slug]/page.tsx:67` — `buildCaseStudyJsonLd`
- `app/ar/(public)/portfolio/[slug]/page.tsx:66` — `buildCaseStudyJsonLd`

A repo-wide grep for `application/ld+json` and `@type": "Organization"` across `app/` and `lib/` turns up no other JSON-LD emission site. **FR-006/FR-007/FR-008 are confirmed as a genuine scope addition, not pre-existing/duplicate work.**

**(b) `buildPageMetadata` omits `openGraph.images`/`twitter.images` when `imageUrl` is absent.**
`lib/metadata.ts:54-66`:
```ts
openGraph: {
  title,
  description,
  url: canonicalUrl,
  ...(imageUrl ? { images: [{ url: buildAbsoluteUrl(imageUrl) }] } : {}),   // line 58
},
twitter: {
  card: "summary_large_image",
  title,
  description,
  ...(imageUrl ? { images: [buildAbsoluteUrl(imageUrl)] } : {}),           // line 64
},
```
Both use a conditional spread of `{}` when `imageUrl` is falsy — the `images` key is entirely absent from the returned `Metadata` object in that case, not set to an empty array. **This is exactly the defect FR-002 fixes; no fallback exists today.**

Both spec.md Assumption bullets referring to these two points (the ORGANIZATION_REF/publisher-only bullet and the "buildPageMetadata omits images" framing implicit in FR-002) are hereby treated as verified fact per the citations above, not assumption, for the remainder of this plan and downstream tasks.

## Resolved Ambiguity: og:type on detail pages

**Ambiguity**: FR-005 mandates `siteName`/`type`/`locale`/`alternateLocale` be added inside `buildPageMetadata`. `buildPageMetadata` is called from all 16 page files that have metadata, including the 4 article/portfolio detail pages — not just the two home pages that User Story 3's acceptance scenarios describe. Adding a fixed `type: "website"` inside the builder would silently apply "website" to article and portfolio detail pages too.

**Resolution**: `buildPageMetadata` gains one new optional input, `ogType?: "website" | "article"`, defaulting to `"website"`. The two article detail pages (`app/(en)/(public)/articles/[slug]/page.tsx`, `app/ar/(public)/articles/[slug]/page.tsx`) pass `ogType: "article"` at their existing `buildPageMetadata` call sites; every other call site (both home pages, about, services/solutions, contact, articles list, portfolio list, and the two portfolio detail pages) is left unchanged and defaults to `"website"`.

**Justification**: The Open Graph protocol defines `article` specifically for this content shape (blog-style posts with a publish date), which is what the article detail pages already represent in their existing `Article` JSON-LD (`buildArticleJsonLd`). A portfolio/case-study item is modeled as `CreativeWork` in JSON-LD, not `Article`, and Open Graph has no closer standard type for it than `website` — so portfolio detail pages keep `"website"`, matching every other page on the site. This choice is additive (one new optional parameter, default preserves current behavior everywhere it isn't explicitly overridden) and orthogonal to `imageUrl`: `og:type` and `og:image` are independent Metadata fields, so this does not touch or risk regressing FR-002/FR-003/SC-002 (the existing per-item image on detail pages is untouched by this parameter).

## Contingency: icon resolution fails under one root layout (FR-010 / SC-005)

Root-level `app/icon.png` and `app/apple-icon.png` covering both `app/(en)/` and `app/ar/` root layouts is the assumption this slice exists to confirm empirically (per the spec's own correction to the source document) — it is not guaranteed in advance. Two outcomes are possible when the browser-verification task (see tasks.md) runs:

- **Both layouts resolve the icon correctly** — proceed normally; SC-005 is satisfied as-is, no further action.
- **One layout resolves the icon and the other does not** (e.g. `app/(en)/` shows it but `app/ar/` does not, or vice versa) — **STOP and report to the operator before applying any fix.** Do not silently work around this by duplicating `icon.png`/`apple-icon.png` into a route-group-local location, and do not add a manual `<link rel="icon">` tag anywhere — FR-011 forbids the latter outright, and duplicating the file would be an undeclared scope expansion (a second copy of an asset this slice was told not to create, move, or modify) requiring its own decision, not a same-slice silent patch. The corresponding task in tasks.md is a conditional/gating task: it defines the STOP condition and produces a report, it does not itself contain a remedy.

This contingency does not change the Constitution Check outcome above — Scope Discipline (Principle IV) is exactly why an unplanned fix is deferred to the operator rather than improvised here.

## Technical Context

**Language/Version**: TypeScript (strict mode), Next.js 16.x stable (App Router)

**Primary Dependencies**: None new. Uses existing `next` `Metadata` type, existing `lib/metadata.ts`, `lib/structured-data.ts`, `lib/language.ts` (`LANGUAGES` map), and `lib/site.ts` — the existing `siteUrl` export and its `BETTER_AUTH_URL` derivation are read-only/not modified, but the file itself gains two new sibling constants (default OG image path, logo path) per FR-001.

**Storage**: N/A — no database involved. Static image assets only (already committed).

**Testing**: Manual/quality-gate verification per constitution (`npm run check`, `npm run lint`, `npm run build`) plus view-source / browser-tab inspection per spec's acceptance scenarios. No new automated test infrastructure is introduced for this slice (metadata/JSON-LD output is verified by direct inspection, consistent with how the existing 4 detail-page JSON-LD emissions were verified).

**Target Platform**: Web (Next.js server-rendered pages), both `app/(en)/` and `app/ar/` route groups / root layouts.

**Project Type**: Web application (existing Next.js monorepo-less single app) — this slice touches `lib/metadata.ts`, `lib/structured-data.ts`, `lib/language.ts`, and the `generateMetadata`/JSON-LD call sites in the two home pages and two article detail pages. No new top-level structure.

**Performance Goals**: N/A — metadata/JSON-LD generation is negligible-cost, server-side, per-request string/object construction; no measurable performance target beyond "does not regress existing page render cost."

**Constraints**: No public URL changes (standing rule 002). No new dependencies. `app/favicon.ico` must never be created (FR-012). `lib/site.ts`'s existing `siteUrl` export and the `siteUrl`/`BETTER_AUTH_URL` coupling are not modified — only two new named constants are added to that file (FR-001). No image asset is created, moved, or resized (`public/og-default.png`, `public/logo.png`, `app/icon.png`, `app/apple-icon.png` all already exist and are committed).

**Scale/Scope**: Small — additive changes to 3 lib files and metadata/JSON-LD wiring on 4 existing page files (2 home pages get the new Organization JSON-LD block; the 2 article detail pages get one new `ogType` argument at an existing call site). Icon files are verified, not created.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Diagnosis Before Solution** — PASS. Both defects (missing OG image fallback, missing standalone Organization entity) are verified against actual code with file:line citations above, not assumed from the source spec's narrative.
- **II. Locked Decisions Are Locked** — PASS. No architectural decision 001–012 is touched; this is additive metadata/JSON-LD work within the already-locked bilingual-routing and metadata mechanism (Slice 3c).
- **III. Verify Before Declaring Done** — Carried forward to implementation/tasks gates: `npm run check`, `npm run lint`, `npm run build` must exit zero (constitution quality gate; not itself a spec.md FR/SC), plus spec.md's own acceptance scenarios (SC-001 through SC-006, User Stories 1–3) verified by inspection.
- **IV. Scope Discipline** — PASS. No adjacent cleanup proposed. `lib/site.ts`'s existing `siteUrl` export, the `siteUrl`/`BETTER_AUTH_URL` coupling, the three missing `/services/*` detail pages, and other Phase 5 postponed items are explicitly untouched — only two new sibling constants are added to `lib/site.ts` (FR-001). The one new `ogType` parameter is the minimum addition needed to avoid silently mis-typing detail pages, not a speculative feature.
- **V. URL Preservation as Default** — PASS. No route, path, or URL is added, removed, or changed. Icon resolution is confirmed via existing file-convention routes (`/icon.png`, `/apple-icon.png`), which already exist and already serve today — nothing new is exposed.
- **VI. Security Is Not Convenience** — N/A. No auth, session, or secret-handling surface in this slice.
- **VII. Bilingual By Architecture** — PASS by design: the Organization JSON-LD block is emitted on both home pages using `buildOrganizationJsonLd(language)`; the additive OG locale fields are sourced from `LANGUAGES` (single source of truth per FR-005) for both languages; icon resolution is verified under both `app/(en)/` and `app/ar/` root layouts (User Story 3 / SC-005).

No violations requiring Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/013-brand-assets-og-jsonld/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── metadata-and-jsonld.md
└── tasks.md             # Phase 2 output (/speckit-tasks command — NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
lib/
├── metadata.ts            # buildPageMetadata: add default-image fallback, ogType param, siteName/type/locale/alternateLocale
├── structured-data.ts     # Add ORGANIZATION_ID constant + @id on ORGANIZATION_REF; add buildOrganizationJsonLd(language)
├── language.ts            # LANGUAGES: add OG-format locale value (en_US / ar_AR style) per language
└── site.ts                # Add two new named asset-path constants (default OG image, logo) per FR-001, alongside the existing siteUrl export. The siteUrl export and its BETTER_AUTH_URL derivation are untouched.

app/(en)/(public)/page.tsx              # Home (EN): embed buildOrganizationJsonLd("en") as a new <script type="application/ld+json">
app/ar/(public)/page.tsx                # Home (AR): embed buildOrganizationJsonLd("ar") as a new <script type="application/ld+json">
app/(en)/(public)/articles/[slug]/page.tsx   # Existing buildPageMetadata call site: add ogType: "article"
app/ar/(public)/articles/[slug]/page.tsx     # Existing buildPageMetadata call site: add ogType: "article"

app/icon.png            # Already exists — verified only, not modified
app/apple-icon.png      # Already exists — verified only, not modified
public/og-default.png   # Already exists — verified only, not modified
public/logo.png         # Already exists — verified only, not modified
```

**Structure Decision**: Single Next.js application, no new directories. Changes are confined to four `lib/` modules (the existing metadata/JSON-LD mechanism from Slice 3c) plus four existing page files that already call `buildPageMetadata` and/or already emit JSON-LD `<script>` tags in the same pattern. This matches the existing project structure exactly — no new project type, no new build target.

## Complexity Tracking

*No Constitution Check violations. Table omitted.*
