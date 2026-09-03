# Quickstart: Verifying Brand Assets, Default OG Image, Organization JSON-LD

Prerequisites: implementation tasks (Phase 2, not part of this plan) are complete; `npm run build` succeeds; dev server or a deployed instance is reachable.

## 1. Default OG image on static pages (User Story 1, scenarios 1–2)

```bash
npm run dev
curl -s http://localhost:3000/ | grep -oE '<meta property="og:image[^"]*" content="[^"]*"'
curl -s http://localhost:3000/about | grep -oE '<meta property="og:image[^"]*" content="[^"]*"'
```

Expected: `og:image` resolves to the absolute default OG image URL; `og:image:width` = 1200, `og:image:height` = 630 both present. Repeat against `/ar` and `/ar/about`.

## 2. No regression on detail pages (User Story 1, scenario 3)

```bash
curl -s http://localhost:3000/articles/<a-published-slug> | grep -oE '<meta property="og:image[^"]*" content="[^"]*"'
curl -s http://localhost:3000/portfolio/<a-slug> | grep -oE '<meta property="og:image[^"]*" content="[^"]*"'
```

Expected: `og:image` is that item's own cover image URL, NOT the default OG image path. Run this step both before and after the `buildPageMetadata` change lands, and diff the two `og:image` values — they must be identical (FR-003 / SC-002).

## 3. Organization JSON-LD on both home pages (User Story 2, scenarios 1–2)

```bash
curl -s http://localhost:3000/ | grep -A5 'application/ld+json'
curl -s http://localhost:3000/ar | grep -A5 'application/ld+json'
```

Expected: each home page's ld+json blocks include one with `"@type": "Organization"`, a `logo` object with `"@type": "ImageObject"`, `url`, `width: 512`, `height: 512`, and an `"@id"` value of the form `<siteUrl>/#organization` — identical string on both pages.

## 4. `@id` linkage to existing publisher references (User Story 2, scenario 3)

```bash
curl -s http://localhost:3000/articles/<a-published-slug> | grep -A3 '"publisher"'
```

Expected: the `publisher` object's `"@id"` matches the `"@id"` found in step 3.

## 5. Icon resolution under both root layouts (User Story 3, scenarios 1–2)

Open in a browser (not curl — verifies actual tab rendering):
- `http://localhost:3000/about` (English root layout)
- `http://localhost:3000/ar/about` (Arabic root layout)

Expected: browser tab shows the site icon on both. If it resolves under one layout but not the other, STOP per plan.md's contingency — do not duplicate icon files or add a manual `<link rel="icon">` tag; report to the operator instead.

Filesystem assertion — no `app/favicon.ico` source file exists (FR-012):

```bash
test ! -f app/favicon.ico && echo "OK: no app/favicon.ico"
```

Convention-route reachability for the two icon files (FR-013):

```bash
curl -I http://localhost:3000/icon.png
curl -I http://localhost:3000/apple-icon.png
```

Expected: both return 200 with an image content type.

## 6. Additive OG fields (User Story 3, scenarios 3–4)

```bash
curl -s http://localhost:3000/ | grep -oE '<meta property="og:(site_name|type|locale[^"]*)" content="[^"]*"'
curl -s http://localhost:3000/ar | grep -oE '<meta property="og:(site_name|type|locale[^"]*)" content="[^"]*"'
```

Expected: `og:site_name` = "OmniflowAI" on both; `og:type` = "website" on both (home pages are not articles — see plan.md's resolved ambiguity); `og:locale` differs between the two pages (`en_US` vs `ar_AR`).

## 7. Default OG image and logo asset reachability (FR-013)

```bash
curl -I http://localhost:3000/og-default.png
curl -I http://localhost:3000/logo.png
```

Expected: both return 200 with an image content type (`image/png`).

## 8. Quality gate

Not a spec.md FR/SC — required by the project constitution (Principle III, "Verify Before Declaring Done"), carried forward from plan.md's Constitution Check:

```bash
npm run check
npm run lint
npm run build
```

Expected: all three exit zero.
