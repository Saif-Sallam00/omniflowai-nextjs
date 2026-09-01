# SEO Metadata Correctness + Article Slug-Pairing Fix + OG Images — Phase 3, Slice 3a

**Status:** Draft (pending approval)
**Version:** 0.1
**Related decisions:** 001–013, standing rule 002 (URL preservation), P-03 (per-page metadata), P-04 (indexability signalling), Principle VII (bilingual)
**Related slices:** Phase 1 (public read path + `buildPageMetadata`), 005 (image upload — `/api/image/{id}`), 006 (articles CRUD — `translation_group_id` pairing), 007 (projects CRUD)
**Authoritative audit:** `docs/phase-3-seo-extract.md`

## Overview

First of three Phase 3 slices. Correct the public-facing metadata that everything else in Phase 3 (sitemap, JSON-LD) depends on: fix the article hreflang/language-switching bug (EN↔AR articles are linked by `translation_group_id` with independent per-language slugs, but the current code assumes identical slugs), wire Open Graph images into `buildPageMetadata` for article and project detail pages, mark unpublished/draft detail pages `noindex`, and clear leftover Phase 0 placeholder copy from the root layout metadata.

This is a read-side and metadata slice — **no schema change, no migration.** It touches `lib/metadata.ts`, the two detail-page `generateMetadata` paths, the client language switcher, and adds one public DAL read.

## Problem statement

The Phase 1 metadata layer is mostly correct, but the audit found one real correctness bug and one uniform gap:

1. **Article hreflang is broken for non-identical slugs.** `buildPageMetadata` computes an article's other-language alternate by naive path substitution on the *same slug string* (`lib/metadata.ts:19-20`), and the client language switcher does the same (`components/language-switcher.tsx:30`). But articles are linked across languages by `translation_group_id`, and their per-language slugs are chosen independently and are not required to match (`(language, slug)` unique; `lib/db/schema.ts:79`). So any article whose EN and AR slugs differ emits an `hreflang` alternate pointing at a slug that may not exist in the other language, and switching language on it 404s. Projects are unaffected — they share one slug across languages (`getPortfolioSlugs()` has no language filter, `lib/db/portfolio.ts:72-75`).

2. **No page emits an OG image.** `buildPageMetadata`'s `openGraph` has no `images` key at all (`lib/metadata.ts:33-37`), across all routes — even though article and project cover images (`/api/image/{id}` URLs) already exist on the loaded objects. Social/AEO scrapers get no image.

Both must be right before Phase 3b (sitemap) and 3c (JSON-LD), which reuse this metadata and the article slug-pairing.

## Decisions settled before this spec (do not reopen)

- The article hreflang/switcher bug is fixed **in this slice**, as part of metadata correctness (operator decision).
- No schema change, no migration — the article↔article linkage already exists (`translation_group_id`); this slice only adds a read that uses it.
- Project hreflang is already correct (shared slug) and is **not** changed. Projects only gain an OG image.
- Static-page hreflang is already correct (fixed 1:1 path mapping) and is **not** changed.

## User stories

### US-1 — A crawler gets correct article language alternates
As a search crawler fetching a published article, its `hreflang` alternates point to the **real** counterpart URLs (resolved via `translation_group_id`), so I index the correct EN/AR pair. If the article has no published counterpart in the other language, no alternate is emitted for that language (rather than a broken link).

### US-2 — A bilingual visitor can switch language without a 404
As a visitor on an article page, using the language switcher takes me to the correct translated article when one exists; when the article has no counterpart in the other language, switching does not land me on a 404.

### US-3 — A social/AEO scraper gets an image
As a scraper fetching any article or project detail page, the page carries an `og:image` (the item's cover), so a shared or cited link renders with the right image. The image URL is absolute and fetchable (it resolves to the public `/api/image/{id}` bytes).

### US-4 — Drafts are never indexed
As a search crawler, an unpublished/draft article or project detail page returns metadata marked `noindex`, so a draft previewed by a signed-in admin can never be indexed.

### US-5 — Site metadata has no leftover placeholder copy
As anyone inspecting the site, the root/default metadata no longer reads "Foundation" / "Phase 0 foundation deployment" — it carries real site defaults.

## Functional requirements

### FR-1 — Counterpart-resolution DAL read (articles)
- FR-1.1: Add a public read to `lib/db/articles.ts` that, given an article's `translation_group_id` and a target language, returns the **published** counterpart's slug or `null` if none exists (e.g. `getPublishedCounterpartSlug(translationGroupId, targetLanguage): Promise<string | null>`). Published-only — an unpublished counterpart is treated as absent.
- FR-1.2: The read MUST be wrapped in React `cache()` (or otherwise deduped) so resolving the counterpart in both `generateMetadata` and the page body does not double-query per request.
- FR-1.3: No new table, column, or index — this reads the existing `articles` table via the existing `(translation_group_id, language)` uniqueness.

### FR-2 — Correct article hreflang / canonical / x-default
- FR-2.1: `buildPageMetadata` MUST accept, for dynamic routes, explicit per-language alternate **paths** (not naively substituted), e.g. an optional `languageAlternates?: { en: string | null; ar: string | null }`. When provided, these are used verbatim; when a language's value is `null`, that language's `hreflang` alternate MUST be **omitted** entirely.
- FR-2.2: When `languageAlternates` is not provided (static pages, projects), `buildPageMetadata` MUST keep its current naive `getLanguagePath`-based behavior unchanged (it is correct for those routes).
- FR-2.3: The article detail `generateMetadata` (both EN and AR) MUST resolve the counterpart slug via FR-1, build the counterpart path (or `null`), and pass it to `buildPageMetadata`. The current-language `canonical` remains the real current URL.
- FR-2.4: `x-default` MUST point to the English alternate when it exists; if the article exists only in Arabic (no published EN counterpart), `x-default` MUST point to the Arabic URL instead — never to a non-existent EN URL.

### FR-3 — Correct language switcher on article pages (no 404)
- FR-3.1: On an article detail page, the client language switcher MUST navigate to the **resolved counterpart URL** (from FR-1) rather than a naive path substitution.
- FR-3.2: When an article has no published counterpart in the target language, switching MUST NOT produce a 404. The exact graceful behavior (disable the toggle for that language, or route to the target language's `/articles` list) is selected during `/plan` — the hard requirement is no dead-slug 404.
- FR-3.3: On all non-article pages (static pages, project detail, list pages), the switcher's current naive path-swap behavior MUST remain unchanged — it is already correct there.
- FR-3.4: The mechanism for delivering the server-resolved counterpart (a Server Component) to the client switcher (per-page context, prop threading, or equivalent) is selected during `/plan`.

### FR-4 — Open Graph images
- FR-4.1: `buildPageMetadata` MUST accept an optional image URL and, when present, emit it as `openGraph.images` and as the `twitter` image, as an **absolute** URL (built via the existing absolute-URL helper off `siteUrl`).
- FR-4.2: The article detail and project detail `generateMetadata` MUST pass the item's `coverImage` (`/api/image/{id}`) as that image. The resulting absolute URL MUST resolve to the public image bytes (Slice 2a's serving route is public and crawler-fetchable).
- FR-4.3: Static pages (`/`, `/about`, `/solutions`, `/contact`, `/articles`, `/portfolio`) MAY pass a single site-default OG image if a brand asset is supplied; if none is supplied, they keep no OG image (status quo). Whether a default asset is included now is decided during `/plan` — the mechanism MUST exist regardless, so a default can be dropped in without further code change.

### FR-5 — noindex on unpublished/draft detail pages
- FR-5.1: The article and project detail `generateMetadata` MUST emit `robots: { index: false, follow: false }` when the requested item is not published/available (draft or not found), so a draft previewed by a signed-in admin is never indexable. (The happy path — a published item — emits normal indexable metadata.)
- FR-5.2: This MUST reuse the item already loaded/looked up in `generateMetadata` — it MUST NOT introduce a second redundant query beyond what FR-1.2's caching already covers.

### FR-6 — Clear leftover placeholder metadata
- FR-6.1: The root layout default metadata currently reading "OmniflowAI — Foundation" / "Phase 0 foundation deployment." (`app/(en)/layout.tsx:6-9` and the AR equivalent) MUST be updated to real site defaults. This is a fallback only (no live page relies on it today), but the placeholder copy MUST NOT ship to production.

### FR-7 — No regressions / no schema change
- FR-7.1: Static-page and project-detail hreflang/canonical output MUST be unchanged (verify they still emit the same correct alternates).
- FR-7.2: No existing table/column/index/constraint is modified. No migration is generated.
- FR-7.3: Existing public reads and rendering (`getArticleBySlug`, `getPortfolioDetailBySlug`, the detail page bodies) MUST continue to work; this slice adds one read and edits `generateMetadata`/the switcher, nothing else on the data path.

### FR-8 — Quality gate
- FR-8.1: `npm run check`, `npm run lint`, `npm run build` MUST all pass with zero errors.

## Out of scope (later Phase 3 slices / other phases)

- **Sitemap** (`app/sitemap.ts`, DB-driven both languages) — Slice 3b. It depends on this slice's correct article slug-pairing.
- **Production robots.txt** (sitemap reference, AI-crawler rules, `X-Robots-Tag` on `/admin`,`/api` in indexable mode) — Slice 3b.
- **AEO** (JSON-LD structured data, `llms.txt`) — Slice 3c. It depends on this slice's corrected metadata.
- **Structured-logging gaps** (`/api/health` unwrapped, `/api/image` unthrottled) — folded into 3b.
- **Creating the site-default OG brand image asset** — a design/content task; this slice wires the mechanism only.
- **Legacy id→slug redirects** (`/portfolio/7|8`) — Phase 4 cutover.
- **AR footer headings** (`site-shell.tsx` `TODO(ar-footer-headings)`) — content task, not metadata.
- **Empirical ops items** (Neon WebSocket flakiness, `after()` on Autoscale) — Phase 4 cutover-prep verification; not code-fixable here.

## Assumptions (settled by the audit — do not reopen)

- `buildPageMetadata` (`lib/metadata.ts:16-44`) is the single metadata builder every public page uses; canonical/hreflang/OG absolute URLs are built off `siteUrl = env.BETTER_AUTH_URL` (`lib/site.ts:3`).
- Articles are linked across languages by `translation_group_id` (independent per-language slugs); the admin already resolves pairs this way (`getArticleByTranslationGroupAndLanguage`, `listArticleGroups`) — this slice adds the *public* equivalent.
- Projects share one `slug` across languages — their hreflang is already correct; they need only an OG image.
- Cover images are `/api/image/{id}` strings; that serving route is public and crawler-fetchable (INV-06, Slice 2a).
- Draft/unpublished article detail pages are already gated (published-only for the public; drafts visible to a signed-in admin, else `notFound()`).

## Acceptance criteria

1. **AC-1:** For a published article whose EN and AR slugs **differ**, the EN page's `hreflang="ar"` alternate points to the real AR slug URL (and vice versa), verified in the emitted HTML `<head>`. The naive same-slug URL is no longer emitted.
2. **AC-2:** For an article published in only one language, the detail page emits **no** `hreflang` alternate for the missing language, and `x-default` points to the language that exists — no alternate points to a non-existent URL.
3. **AC-3:** Using the language switcher on an article with a differing counterpart slug lands on the correct translated article (not a 404); using it on a single-language article does not produce a 404.
4. **AC-4:** Every article and project detail page emits `og:image` (and the twitter image) as an absolute URL that, when fetched, returns the item's cover image bytes.
5. **AC-5:** An unpublished/draft article or project detail page emits `robots: noindex` metadata; a published one does not.
6. **AC-6:** Static-page and project-detail hreflang/canonical output is unchanged from before this slice (correct alternates still emitted).
7. **AC-7:** The root/default metadata no longer contains "Foundation"/"Phase 0" placeholder copy.
8. **AC-8:** `npm run check`, `npm run lint`, `npm run build` all exit zero; no migration is produced and no existing schema object is modified (zero-diff on `schema.ts`/`drizzle/`).

## Notes for `/plan` (mechanism details deferred)

- Exact name/signature of the counterpart-resolution DAL read and its `cache()` wrapping; how `generateMetadata` and the page body share the one lookup.
- The mechanism carrying the server-resolved counterpart path to the client language switcher (per-page context provider vs. prop threading through `SiteShell`), and the FR-3.2 graceful no-counterpart behavior (disable vs. route-to-list).
- The exact `buildPageMetadata` signature growth (`languageAlternates` and `imageUrl` optional params) and how `x-default` is chosen when EN is absent.
- Whether a site-default OG image asset is included in this slice or deferred (FR-4.3).
- How `generateMetadata` cleanly detects the unpublished/not-found case for the `noindex` branch (FR-5) reusing the already-performed lookup.
