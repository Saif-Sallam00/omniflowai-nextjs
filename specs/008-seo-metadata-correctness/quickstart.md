# Quickstart: Verifying SEO Metadata Correctness (Slice 3a)

Manual/local verification steps once implementation is complete. All checks read rendered HTML `<head>` output or exercise the UI directly — no new tooling is introduced by this feature.

## Prerequisites

- Local dev server running (`npm run dev`) against a database seeded with at least:
  - One published article with **different** EN and AR slugs, both published (via admin CRUD).
  - One published article that exists in only one language (no counterpart row at all).
  - One unpublished/draft article.
  - At least one project (already has cover images per existing seed/admin data).
- `npm run check`, `npm run lint`, `npm run build` available (FR-8.1 / AC-8).

## Scenario 1 — Article hreflang with differing slugs (AC-1)

1. In admin, note the EN slug (e.g. `/articles/growth-playbook`) and AR slug (e.g. `/ar/articles/دليل-النمو`) of the same published translation group.
2. Load the EN URL, view page source, find `<link rel="alternate" hreflang="ar" ...>` — its `href` MUST be the AR page's real URL, not `/articles/growth-playbook` under `/ar`.
3. Repeat from the AR page — its `hreflang="en"` MUST point to the real EN slug.

## Scenario 2 — Single-language article (AC-2)

1. Load the single-language article's page.
2. View source — confirm only one language key appears under alternates, and `x-default` matches the language that exists (not the other one).

## Scenario 3 — Language switcher, no 404 (AC-3)

1. On the differing-slug article from Scenario 1, click the language switcher — confirm you land on the correct translated article (not a 404).
2. On the single-language article from Scenario 2, click the switcher — confirm you land on that language's `/articles` list, not a "not found" page.
3. Navigate to a static page (e.g. `/about`) and confirm the switcher still does its original naive path swap (regression check for FR-3.3/FR-007).

## Scenario 4 — OG image (AC-4)

1. Load a published article/project detail page, view source, find `og:image` (and `twitter:image`) — confirm the URL is absolute (starts with the site's own domain).
2. Fetch that URL directly (e.g. `curl -I <url>`) — confirm it returns the image bytes (200, image content-type), matching the item's cover image.

## Scenario 5 — Draft noindex (AC-5)

1. As a signed-in admin, preview the unpublished draft article — view source, confirm `<meta name="robots" content="noindex, nofollow">` is present.
2. Load a published article/project — confirm no such `noindex` meta tag is present.

## Scenario 6 — No regression on static/project hreflang (AC-6)

1. Compare a static page's and a project detail page's `alternates.languages` output against pre-change behavior (same fixed path-mapping / same-slug mapping) — confirm unchanged.

## Scenario 7 — Placeholder copy removed (AC-7)

1. Request a route that has no explicit metadata of its own is not expected to exist today (every public page defines one) — instead, directly inspect `app/(en)/layout.tsx` / `app/ar/layout.tsx` source to confirm "Foundation"/"Phase 0" no longer appears.

## Scenario 8 — Quality gate (AC-8)

1. Run `npm run check`, `npm run lint`, `npm run build` — all MUST exit zero.
2. Run `git diff --stat -- lib/db/schema.ts drizzle/` — MUST show no changes (zero-diff on schema/migrations).
