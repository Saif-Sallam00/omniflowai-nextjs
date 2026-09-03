# Decision 015 — Route Slice 5.5's Organization JSON-LD through `SiteShell`, not the two home pages

**Date:** 2026-09-03
**Status:** Locked
**Type:** Correction to a Gate 2 verification + resulting deviation from `plan.md`'s declared file list
**Related:** Phase 5, Slice 5.5 (`specs/013-brand-assets-og-jsonld/`) — FR-006, FR-007, FR-008, FR-009; Phase 4, Slice 010 (`specs/010-jsonld-llmstxt/`) — that slice's FR-1.1, T004

## The retracted verification

At Gate 2 of Slice 5.5's planning, `plan.md`'s "Verified Facts" section stated: *"No standalone Organization JSON-LD entity is emitted anywhere in the repo today"*, citing a grep across `app/` and `lib/` only. That grep scope was too narrow. **This verified fact is retracted.**

## What it missed

`components/site-shell.tsx` already emits a standalone Organization JSON-LD `<script>` block, added in an earlier slice (`specs/010-jsonld-llmstxt/`, that slice's FR-1.1 and task T004). `SiteShell` wraps both `app/(en)/(public)/layout.tsx` and `app/ar/(public)/layout.tsx`, so this block already rendered on **every public page in both languages** — not just the home pages — well before Slice 5.5 began. Its shape at the time Slice 5.5's implementation began (`components/site-shell.tsx:144-151`):

```ts
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "OmniflowAI",
  url: buildAbsoluteUrl(getLanguagePath("/", language)),
  description: ORGANIZATION_DESCRIPTION[language],
  inLanguage: language,
};
```

No `@id`, no `logo` — that slice's own `research.md §4` explicitly deferred `logo` pending the brand asset this slice (5.5) supplies.

## Why the grep missed it

Gate 2's verification searched `app/` and `lib/` because those are the directories `plan.md`'s "Project Structure" anticipated touching. `components/` was never searched. The Organization block lives in a shared UI shell component, not a page or a `lib/` utility — a location outside the assumed search scope.

## Discovery

During Gate 4 implementation, after adding `buildOrganizationJsonLd(language)` to `lib/structured-data.ts` and embedding it directly on both home pages (Slice 5.5's original T009/T010), curling the home pages showed **two** separate `"@type": "Organization"` blocks per page — the pre-existing `site-shell.tsx` one and the new one. A second, full-repo grep (this time unrestricted) confirmed exactly three code sites reference `"@type": "Organization"`: `components/site-shell.tsx`, and the two inside `lib/structured-data.ts` (`ORGANIZATION_REF`, nested as `publisher`; and the new `buildOrganizationJsonLd`). No other emission site exists anywhere in the repository.

## Decision

`components/site-shell.tsx` remains the single site-wide Organization emission point — it already had the correct architecture (one shared component, both layouts, every public page) for exactly the requirement FR-008 describes. Rather than add a second, competing emission on the two home pages:

1. **T009 and T010 (Slice 5.5) are reverted.** `app/(en)/(public)/page.tsx` and `app/ar/(public)/page.tsx` return to their pre-slice state — no Organization `<script>` is added directly to either file. FR-008 ("home pages embed the organization structured description") is still satisfied, because `SiteShell` already wraps both home pages along with every other public page.
2. **`buildOrganizationJsonLd(language)` in `lib/structured-data.ts` is extended to be a strict superset of what `site-shell.tsx` emitted before this change** — it now carries `@context`, `@type`, `@id` (`ORGANIZATION_ID`, new in this slice), `name`, `url`, `description`, `inLanguage` (the last two moved verbatim from `site-shell.tsx`'s local `ORGANIZATION_DESCRIPTION` map, which moved into `lib/structured-data.ts` alongside it — it had no other caller), and `logo` (new in this slice, `ImageObject` with `width`/`height` 512).
3. **`components/site-shell.tsx` now calls `buildOrganizationJsonLd(language)`** instead of building its own object inline. The `<script type="application/ld+json">` tag itself is unchanged — only the object it serializes changed, from a hand-built literal to the shared builder's output. The now-unused `buildAbsoluteUrl` import and local `ORGANIZATION_DESCRIPTION` constant were removed from `site-shell.tsx` as part of this same edit (orphaned by this change, not pre-existing dead code).

## Deviation from `plan.md`'s declared file list

`plan.md`'s Project Structure section declared `app/(en)/(public)/page.tsx` and `app/ar/(public)/page.tsx` as changed files (embedding the Organization block) and did not list `components/site-shell.tsx` at all. The actual result is the opposite on both counts:

- `app/(en)/(public)/page.tsx` and `app/ar/(public)/page.tsx` — **unchanged**, byte-identical to their pre-slice state.
- `components/site-shell.tsx` — **changed** (the file this slice actually needed to touch to satisfy FR-008).

This is recorded here rather than silently left as an unexplained mismatch against `plan.md`, per the constitution's Scope Discipline principle (out-of-plan findings are reported, not silently absorbed) — even though the net effect is a smaller, more correct diff than originally planned, not scope creep.

## What did not change

- `ORGANIZATION_ID`, the `logo` `ImageObject`, and the `@id` propagation into `ORGANIZATION_REF`'s nested `publisher` (FR-006, FR-007, FR-009) are all unaffected by this correction — those were implemented correctly in `lib/structured-data.ts` from the start and did not need to move.
- No second Organization entity exists anywhere in the final result. Exactly one standalone `"@type": "Organization"` block renders per public page (via `SiteShell`), plus the pre-existing nested `publisher` reference inside `Article`/`CreativeWork` JSON-LD on the 4 detail pages — which is a reference to the same entity via the shared `@id`, not a second standalone entity.
