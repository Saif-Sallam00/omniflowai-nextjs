# Contract: Public Page Metadata (HTML `<head>` output)

This feature's only external interface is the metadata a public page emits in its server-rendered `<head>` — consumed by search crawlers and social/AEO scrapers, not by any internal API client. This contract documents what each route category MUST emit after this feature, so `/speckit-tasks` and implementation can be verified against it directly (e.g. via rendered HTML inspection, as AC-1..AC-8 describe).

## Route category: Article detail (`/articles/[slug]`, `/ar/articles/[slug]`)

**Published article, counterpart exists (published, possibly different slug):**

| Field | Value |
|---|---|
| `title` / `description` | The article's own title/excerpt |
| `alternates.canonical` | Absolute URL of the current language's own slug path |
| `alternates.languages.en` | Absolute URL of the EN slug (current if EN page, resolved counterpart if AR page) |
| `alternates.languages.ar` | Absolute URL of the AR slug (current if AR page, resolved counterpart if EN page) |
| `alternates.languages["x-default"]` | Equal to `alternates.languages.en` |
| `openGraph.images` / `twitter.images` | Absolute URL resolving to the article's `coverImage` bytes |
| `robots` | Not set (indexable) |

**Published article, no counterpart in the other language:**

| Field | Value |
|---|---|
| `alternates.languages` | Contains only the current language's key; the missing language's key is **absent**, not empty/null |
| `alternates.languages["x-default"]` | Equal to whichever language's key is present |
| Everything else | Same as the "counterpart exists" row above |

**Unpublished / not-found article (any requester, including an authenticated admin preview):**

| Field | Value |
|---|---|
| `title` / `description` | Generic fallback text (unchanged from current behavior) |
| `robots` | `{ index: false, follow: false }` |
| `alternates` / `openGraph.images` | Same shape as today's fallback (no per-item alternate/image data available) |

## Route category: Project detail (`/portfolio/[slug]`, `/ar/portfolio/[slug]`)

**Existing project:**

| Field | Value |
|---|---|
| `alternates.languages` | Unchanged from current behavior (naive same-slug mapping — already correct, not a target of this feature) |
| `openGraph.images` / `twitter.images` | Absolute URL resolving to the project's `coverImage` bytes (new) |
| `robots` | Not set (indexable) |

**Not-found project (no draft/unpublished state exists for projects):**

| Field | Value |
|---|---|
| `robots` | `{ index: false, follow: false }` (new) |
| Everything else | Same as today's not-found fallback |

## Route category: Static pages (`/`, `/about`, `/solutions`, `/contact`, `/articles`, `/portfolio` — both languages)

| Field | Value |
|---|---|
| `alternates.languages`, canonical | **Unchanged** — no `languageAlternates` is passed, so `buildPageMetadata` keeps its current naive path-mapping behavior verbatim |
| `openGraph.images` | Absent unless a site-default image is supplied (deferred per `research.md` §5 — not shipped in this feature) |
| `robots` | Not set (unchanged) |

## Route category: Root layout fallback metadata (`app/(en)/layout.tsx`, `app/ar/layout.tsx`)

| Field | Value |
|---|---|
| `title` / `description` | Real site copy — MUST NOT contain "Foundation" or "Phase 0" (AC-7) |

## Non-goals of this contract

- No new HTTP route, Server Action, or API endpoint is introduced — this contract governs metadata fields only.
- The sitemap and JSON-LD structured-data contracts are explicitly out of scope (later Phase 3 slices) and are not documented here.
