# Phase 0 Research: Brand Assets, Default OG Image, Organization JSON-LD

No `NEEDS CLARIFICATION` markers remain in the Technical Context — this is a small, additive change to an already-established mechanism (Slice 3c's `buildPageMetadata`/`lib/structured-data.ts`), so no new technology, dependency, or pattern choice is required. The two substantive open questions were resolved by code verification and by explicit ambiguity resolution (see plan.md), not by external research. They are recorded here for completeness.

## Decision 1: Default OG image asset path source of truth

- **Decision**: Add two new named constants to `lib/site.ts` (default OG image root-relative path, logo root-relative path), alongside the existing `siteUrl` export. `buildPageMetadata` and `buildOrganizationJsonLd` import these constants rather than hardcoding string literals.
- **Rationale**: FR-001 requires this explicitly. `lib/site.ts` already holds `siteUrl` and is the file both `lib/metadata.ts` and `lib/structured-data.ts` already import from (`buildAbsoluteUrl` in `lib/metadata.ts:3` imports `siteUrl` from `lib/site.ts`) — it is the existing single source of truth for site-identity constants, so adding two more constants there is the smallest change consistent with the existing pattern. This does not touch the existing `siteUrl` export or the `BETTER_AUTH_URL` coupling (out of scope), only adds two new sibling constants.
- **Alternatives considered**: A new `lib/assets.ts` file. Rejected — introduces a new module for two string constants when an established single-purpose site-constants file already exists; against Simplicity First / Scope Discipline.

## Decision 2: OG-format locale values

- **Decision**: Add an `ogLocale: "en_US" | "ar_AR"`-shaped field to each entry in `LANGUAGES` in `lib/language.ts`.
- **Rationale**: FR-005 explicitly requires deriving `og:locale`/`og:locale:alternate` from the existing `LANGUAGES` map and explicitly forbids inlining a second source of locale strings in `lib/metadata.ts`. `LANGUAGES` (`lib/language.ts:9-12`) is confirmed as the map referenced by the spec — it currently has no OG-format value, so one field is added per the spec's own instruction ("if the map lacks an OG-format locale value... add it there as the single source of truth").
- **Alternatives considered**: A separate lookup object mapping `Language` → OG locale string, defined in `lib/metadata.ts`. Rejected — spec.md FR-005 explicitly disallows a second source of locale strings.

## Decision 3: Stable Organization `@id` value and placement

- **Decision**: `ORGANIZATION_ID = \`${siteUrl}/#organization\`` defined once in `lib/structured-data.ts`, used both by `ORGANIZATION_REF` (adding `"@id": ORGANIZATION_ID` to its returned object) and by the new `buildOrganizationJsonLd(language)`.
- **Rationale**: spec.md FR-006 mandates this exact form and that it be language-independent (one entity, not one per language) — confirmed necessary because `ORGANIZATION_REF` is presently called once per language today (it takes a `language` param only to compute the home URL) but must resolve to one `@id` regardless of which language's page emits it.
- **Alternatives considered**: None — spec.md FR-006 through FR-009 fully specify the required shape; this is direct implementation of an unambiguous requirement, not a design choice with real alternatives.

## Decision 4: og:type for detail pages (see plan.md "Resolved Ambiguity")

Full reasoning is recorded in plan.md under "Resolved Ambiguity: og:type on detail pages" to keep the decision co-located with the Constitution Check and Technical Context it constrains. Summary: `buildPageMetadata` gains an optional `ogType` parameter (default `"website"`); the two article detail pages pass `"article"`; every other page (including portfolio detail pages) is left on the default.
