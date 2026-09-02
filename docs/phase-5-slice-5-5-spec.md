# Phase 5 — Slice 5.5: Brand Assets, Default OG Image, Organization JSON-LD

**Status:** Draft (pending approval)
**Phase:** 5 (post-cutover cleanup)
**Related:** Slice 3c (metadata/JSON-LD mechanism, deferred pending asset)

## Overview

Slice 3c built the per-page metadata and JSON-LD mechanism but left two holes
pending a brand asset: static pages emit no Open Graph image, and no site-level
Organization entity exists for `Organization.logo`. This slice supplies the
assets and closes both holes.

## Problem statement

1. `buildPageMetadata` in `lib/metadata.ts` only emits `openGraph.images` and
   `twitter.images` when an `imageUrl` argument is passed. Article and portfolio
   detail pages pass one; every static page (home, about, services, contact,
   articles list, portfolio list) does not. Those pages share to social and chat
   apps with a blank preview card.
2. `lib/structured-data.ts` defines `ORGANIZATION_REF` but only uses it nested as
   `publisher` inside Article and CreativeWork JSON-LD on the four detail pages.
   No standalone Organization node is emitted anywhere, so there is no entity for
   a `logo` property to attach to.
3. Favicon and app icons are not present in the repo.

## Scope

### In scope
- Add brand asset files to the repository.
- Default OG/Twitter image for pages that supply no explicit image.
- Site-level `Organization` JSON-LD, including `logo`, on the home page in both
  languages.
- Give the Organization entity a stable `@id` so nested `publisher` references
  point at the same entity rather than duplicating it.
- Favicon / icon file conventions.
- Additive OG fields on the shared metadata builder: `type`, `siteName`,
  `locale`.

### Out of scope
- Any change to `lib/site.ts` or the `siteUrl` / `BETTER_AUTH_URL` coupling.
- Per-page bespoke OG images (static pages share one default).
- Any visual/design change to rendered pages — this is metadata and assets only.
- Any change to the four detail pages' existing Article/CreativeWork JSON-LD
  beyond the `publisher` `@id` addition.
- All other Phase 5 items (Resend sender domain, analytics, old-app retirement,
  rate limiting, logging tuning).

## Assets

Operator supplies these files. Place exactly as specified.

| Source file | Destination | Size | Purpose |
|---|---|---|---|
| `og-default.png` | `public/og-default.png` | 1200×630 | Default OG/Twitter card |
| `logo__1_.png` (rename to `logo.png`) | `public/logo.png` | 512×512 | `Organization.logo` |
| `favicon.ico` | `app/favicon.ico` | — | Browser favicon |
| `icon-32.png` (rename to `icon.png`) | `app/icon.png` | 32×32 | Next.js icon convention |
| `apple-icon.png` | `app/apple-icon.png` | 180×180 | iOS home screen |

Assets are language-neutral by design (no EN or AR copy), so a single set serves
both locales.

## Functional requirements

### FR-1 — Brand asset constants
- FR-1.1: Define the default OG image path and the logo path as named constants
  in `lib/site.ts`, alongside `siteUrl`. Do not hardcode the string literals at
  each call site.
- FR-1.2: Both constants are root-relative paths (e.g. `/og-default.png`).
  Absolute URLs are produced via the existing `buildAbsoluteUrl` helper, not by
  string concatenation at the call site.

### FR-2 — Default OG image
- FR-2.1: `buildPageMetadata` MUST fall back to the default OG image constant
  when its `imageUrl` argument is absent.
- FR-2.2: When `imageUrl` IS supplied, existing behavior is unchanged — the
  supplied image wins. No detail page's current output may change.
- FR-2.3: `openGraph.images` MUST carry explicit `width: 1200` and `height: 630`
  when serving the default image. Several scrapers do not fetch the image to
  infer dimensions.
- FR-2.4: `twitter.images` MUST receive the same fallback. The existing
  `summary_large_image` card type is unchanged.

### FR-3 — Additive Open Graph fields
- FR-3.1: `openGraph.siteName` MUST be `"OmniflowAI"`.
- FR-3.2: `openGraph.type` MUST be `"website"`.
- FR-3.3: `openGraph.locale` MUST reflect the page language, and
  `alternateLocale` the other language. Derive both from the existing
  `LANGUAGES` map in `lib/language.ts` — do not introduce a second source of
  locale strings. If the map lacks an OG-format locale value (`en_US` /
  `ar_AR` style), add it there as the single source of truth rather than
  inlining literals in `lib/metadata.ts`.

### FR-4 — Organization JSON-LD
- FR-4.1: Add a stable organization `@id` constant, derived from `siteUrl`, of
  the form `<siteUrl>/#organization`. It MUST be language-independent — one
  organization entity for the whole site, not one per language.
- FR-4.2: Export a new `buildOrganizationJsonLd(language)` from
  `lib/structured-data.ts` producing an `Organization` node with: `@context`,
  `@type`, `@id`, `name`, `url` (the language-appropriate home URL), and `logo`
  (absolute URL to the logo asset).
- FR-4.3: `logo` MUST be an `ImageObject` with `url`, `width: 512`,
  `height: 512` — not a bare string. Google's logo guidance prefers the
  structured form.
- FR-4.4: Emit this node in a `<script type="application/ld+json">` on the
  English home page and the Arabic home page, matching the existing emission
  pattern used on the article and portfolio detail pages.
- FR-4.5: `ORGANIZATION_REF` MUST gain the same `@id`, so the `publisher` on
  Article and CreativeWork resolves to the site-level entity. Its existing
  `@type`, `name`, and `url` fields are retained.

### FR-5 — Icons
- FR-5.1: Place `favicon.ico`, `icon.png`, and `apple-icon.png` at the `app/`
  root so Next.js's file conventions apply across both root layouts.
- FR-5.2: Verify the icons resolve for routes under BOTH root layouts
  (`app/(en)/` and `app/ar/`). This project has two root layouts via route
  groups; confirm empirically rather than assuming a single-root-layout
  resolution.
- FR-5.3: No manual `<link rel="icon">` tags. Use the file convention only.

## Implementation notes

- Home page metadata: confirm the EN and AR home pages actually call
  `buildPageMetadata`. If either relies solely on the static `metadata` export in
  its root layout, it will not pick up the default OG image — report this rather
  than silently restructuring the page.
- The root layouts' static `metadata` exports are a separate fallback path from
  `buildPageMetadata`. Report any gap; do not expand scope to fix it here.

## Acceptance criteria

1. **AC-1:** All five asset files are present at the specified paths and are
   committed to git.
2. **AC-2:** `curl -I https://omniflowai.net/og-default.png` returns 200 with an
   `image/png` content type. Same for `/logo.png`.
3. **AC-3:** View source on the EN home page: `og:image` is the absolute
   default OG URL, with `og:image:width` 1200 and `og:image:height` 630 present.
   Same on the AR home page.
4. **AC-4:** View source on an article detail page and a portfolio detail page:
   `og:image` is still that item's own cover image, NOT the default. Confirms
   FR-2.2 — no regression.
5. **AC-5:** `og:site_name`, `og:type`, and `og:locale` are present and correct
   on both language home pages, with `og:locale` differing between them.
6. **AC-6:** The EN and AR home pages each contain an `application/ld+json`
   block with `@type: "Organization"`, a `logo` ImageObject pointing at the
   absolute logo URL, and the stable `@id`.
7. **AC-7:** An article detail page's Article JSON-LD `publisher` carries the
   same `@id` string as the home page Organization node.
8. **AC-8:** Both home pages and one detail page per language pass Google's Rich
   Results Test with no errors. Warnings are recorded but not blocking.
9. **AC-9:** Favicon renders in a browser tab for a page under `app/(en)/` AND a
   page under `app/ar/`.
10. **AC-10:** Quality gate passes: `npm run check`, `npm run lint`,
    `npm run build` all exit zero.
11. **AC-11:** Zero drift — no files changed outside those required by this
    spec. No schema change, no migration, no new dependency.

## Verification

Operator verifies AC-1 through AC-11 against the deployed site after merge.
AC-8 uses https://search.google.com/test/rich-results. Social card rendering
may additionally be spot-checked with a scraper debugger, but cached previews on
third-party platforms are not a blocking criterion.
