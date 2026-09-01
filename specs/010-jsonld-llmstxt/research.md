# Research: JSON-LD Structured Data + Dynamic llms.txt

**Feature**: [spec.md](./spec.md) | **Source**: `docs/jsonld-llmstxt-slice-spec.md`, `docs/phase-3-seo-extract.md` (§6)

Six mechanism decisions were left open by the spec for this phase. Each is resolved below.

## 1. Schema.org `@type` for case-study (project) structured data

**Decision**: `CreativeWork`.

**Rationale**:
- FR-3.1's minimum field set — title (`name`), `description`, `image`, `inLanguage`, `publisher` — maps directly onto `CreativeWork`'s own core properties; nothing has to be shoehorned in.
- `projects` has no `published_at`/date-authored concept at all (confirmed in `lib/db/schema.ts` — only `createdAt`/`updatedAt`, which are admin bookkeeping timestamps, not editorial publish dates). `Article` expects a `datePublished`/`author` shape that implies journalistic authorship; forcing project rows into `Article` would either fabricate a date the content doesn't really have or omit a property Google's own guidance treats as expected for `Article` rich results — a worse outcome than a type that doesn't ask for it.
- `CreativeWork` is the schema.org supertype `Article` itself inherits from — using it for case studies keeps the two content types visibly distinct to a consuming crawler (an `Article` is specifically the article; a `CreativeWork` describes the case-study "work") while both correctly reference the same `Organization` as publisher.

**Alternatives considered**:
- *`Article`*: rejected — implies a `datePublished`/authorship shape that doesn't exist for projects; reusing it would blur the distinction between the two structured-data blocks this slice deliberately produces (US-2 vs US-3).
- *`Product`*: rejected — a case study describes completed client work, not a purchasable product/service listing; `Product` rich-result eligibility expects `offers`/`review`/`aggregateRating` that don't apply here and would be actively misleading.

## 2. Shared-value mechanism (JSON-LD never diverges from `generateMetadata`)

**Decision**: Add one small `lib/structured-data.ts` module exporting `buildArticleJsonLd(article, language)` and `buildCaseStudyJsonLd(project, slug, language)`. Each reads the exact same raw fields `generateMetadata` already passes into `buildPageMetadata` (article: `title`, `excerpt`, `coverImage`, `publishedAt`; project: `title`, `description`, `coverImage`) and reuses the same URL-building utility `buildPageMetadata` already uses internally. Concretely: export `buildAbsoluteUrl` from `lib/metadata.ts` (currently private) so both `buildPageMetadata` and the new structured-data builders call the identical function for canonical/image URLs — no second implementation of URL concatenation exists anywhere.

Both `generateMetadata` and the page's default-exported component already independently call the same `cache()`-wrapped DAL read (`getArticleBySlug` / `getPortfolioDetailBySlug`) — React's per-request memoization (already relied on elsewhere in this codebase) guarantees both invocations within one request resolve to the same underlying row. The page body calls the new builder with that same object; `generateMetadata` is untouched. Because the builder and `buildPageMetadata` draw from identical field reads and an identical URL utility, the two outputs cannot drift — there is no second, independently-maintained copy of "how do we compute the canonical URL / image URL / description" to fall out of sync.

**Rationale**:
- Next.js does not let `generateMetadata` and the page component share values directly (they're separate invocations of the route), so "reuse the same values" has to mean "compute from the same inputs with the same code," not "pass a variable across the boundary." Reusing the cached DAL object plus a shared URL utility is the only mechanism available that actually guarantees identity rather than merely encouraging consistency.
- This is a small, additive module — no existing file's behavior changes except `lib/metadata.ts` gaining one export (`buildAbsoluteUrl`, already implemented, just not exported today).

**Alternatives considered**:
- *A single function returning `{ metadata, jsonLd }` called once and threaded through*: rejected — not actually possible across the `generateMetadata`/page-component boundary in Next.js's App Router; would require re-fetching or serializing through props in a way that adds complexity without adding safety beyond what the shared-inputs approach already gives.
- *Duplicate the field mapping directly in the page component with hardcoded string concatenation*: rejected — this is exactly the "divergent recomputation" FR-005/FR-008 forbid; a future edit to `buildPageMetadata`'s URL logic could silently leave the JSON-LD block out of sync.

## 3. Organization JSON-LD emission point

**Decision**: `components/site-shell.tsx` (`SiteShell`), not the two `(public)/layout.tsx` files.

**Rationale**:
- `SiteShell` is already the single shared component both `app/(en)/(public)/layout.tsx` and `app/ar/(public)/layout.tsx` render (`<SiteShell language={lang}>{children}</SiteShell>`) — adding the JSON-LD block there means one code location instead of two, with `language` already available as the prop that makes the block language-aware (FR-002) for free.
- `SiteShell` is a Server Component (no `"use client"` directive) and the Organization data is fully static/curated (no DB read needed), so no additional data-fetching or client/server boundary changes are required.
- Admin (`app/(en)/admin/(protected)/layout.tsx`) does not render `SiteShell` at all, and API routes have no HTML layout — so FR-003 ("MUST NOT be emitted on admin or API routes") is satisfied by construction, not by an extra conditional.

**Alternatives considered**:
- *Each `(public)/layout.tsx` individually*: rejected — duplicates the same JSON-LD object (with only the `language` value differing) across two files that already delegate their shared chrome to `SiteShell` for exactly this kind of reason.

## 4. Organization `logo`

**Decision**: Omit the `logo` property entirely.

**Rationale**:
- Confirmed no `public/` directory and no favicon/icon file exists anywhere in the repo — there is no existing asset to reference. The spec explicitly forbids pulling brand-asset creation into this slice's scope.
- `logo` is optional in `Organization`'s schema.org definition; omitting an optional property is valid structured data (still passes AC-5's well-formedness check) and is the only option that doesn't fabricate a placeholder image URL that would 404.

**Alternatives considered**:
- *Reference the `/api/image/{id}` of some existing article/project cover image as a stand-in logo*: rejected — that image depicts specific content, not the organization's brand identity; using it as `Organization.logo` would misrepresent it and could actively confuse a consuming crawler about what the image depicts.

## 5. `/llms.txt` route mechanism

**Decision**: `app/llms.txt/route.ts` — a plain Route Handler (`export async function GET()`), directory-named-with-a-dot segment (a supported Next.js App Router pattern; the folder name becomes the literal path segment `/llms.txt`). No `withRequestLogging`/`withErrorHandling` wrapper.

**Rationale**:
- Next.js has no dedicated `llms.txt` file convention (unlike `sitemap.ts`/`robots.ts`); a Route Handler is the documented way to serve arbitrary content at a fixed path, and `app/api/health/route.ts` already demonstrates the same `export function GET()` shape elsewhere in this codebase.
- Deliberately NOT wrapped in `withRequestLogging`/`withErrorHandling` (unlike `app/api/*` routes): `llms.txt` is conceptually a metadata/discovery surface analogous to `sitemap.ts` and `robots.ts` (neither of which are logged or error-wrapped either), not an application API endpoint. This also keeps the feature from touching `lib/logger.ts` or its call sites at all, honoring FR-7.1/the settled "no logging code touched" constraint by construction.

**Alternatives considered**:
- *Place it under `app/api/llms.txt/route.ts`*: rejected — `/api/*` is disallowed from indexing by `robots.ts`/`next.config.ts`'s existing rules; `/llms.txt` must be a public, crawlable path, and grouping it with `/api/*` would put it inside a path prefix this codebase already tells crawlers to avoid.

## 6. `/llms.txt` staging-mode shape

**Decision**: Header-only — the curated header (org name, one-line description, language note) is always returned; the auto-generated content list (articles/projects) is included only when `INDEXING_ENABLED === "true"`, mirroring the `app/sitemap.ts` self-enforcing gate from Slice 3b (research.md §1 there).

**Rationale**:
- The curated header is not "the site's content" in the sense FR-6.1/AC-7 mean — it's a fixed description of the organization, already publicly visible in the layout `<meta description>` on every page regardless of indexing mode. Withholding it wouldn't protect anything; only the per-article/per-project list is the thing a `noindex` staging deployment must not advertise.
- A header-only response is a well-formed, non-broken plain-text document (as opposed to an empty body, which could look like a misconfigured route rather than an intentional gate) while still satisfying the hard invariant: zero article/project titles or URLs appear when indexing is disabled.
- Matches the same `process.env.INDEXING_ENABLED !== "true"` check used in `app/sitemap.ts`/`app/robots.ts` — one flag, read the same way, branching the same way, keeping all indexing-gated surfaces in this codebase consistent with each other.

**Alternatives considered**:
- *Fully empty body in staging mode*: rejected — provides no more safety than header-only (the header carries no page-specific content either way) while being harder to distinguish from a broken route during manual verification.

## 7. Verifying JSON-LD (AC-1..AC-5) and llms.txt (AC-6, AC-7) via a local two-mode production build

**Decision**: Extend the same local two-mode production-build approach used in Slice 3b (`INDEXING_ENABLED=true npm run build && npm start`, then the same without the flag), adding:

```bash
# JSON-LD presence/absence (works in either indexing mode — JSON-LD is not
# gated by INDEXING_ENABLED, only by published/not-found status)
curl -s http://localhost:3000/ | grep -o '<script type="application/ld+json">.*</script>'          # Organization present
curl -s http://localhost:3000/admin | grep -c 'application/ld+json'                                  # expect: 0
curl -s http://localhost:3000/articles/<published-slug> | grep -o '<script type="application/ld+json">.*</script>'  # Organization + Article, both present
curl -s http://localhost:3000/portfolio/<slug> | grep -o '<script type="application/ld+json">.*</script>'           # Organization + CreativeWork, both present
curl -s http://localhost:3000/articles/<nonexistent-slug>   # 404 page — no Article JSON-LD (trivially: no article data reached the page at all)

# llms.txt (indexing-mode-gated, same two-mode pattern as sitemap.xml/robots.txt)
INDEXING_ENABLED=true npm run build && INDEXING_ENABLED=true npm run start &
curl -s http://localhost:3000/llms.txt   # header + populated article/project list
# then, staging mode:
npm run build && npm run start &
curl -s http://localhost:3000/llms.txt   # header only, no article/project list
```

Each JSON-LD script block's raw JSON is additionally piped through `node -e "JSON.parse(...)"` (or an online/offline structured-data validator, per AC-5) to confirm well-formedness.

**Rationale**:
- JSON-LD correctness (AC-1..AC-5) is independent of `INDEXING_ENABLED` — it depends only on published/not-found status, which is already exercisable in either build mode. Reusing whichever server is already running for another check avoids redundant builds.
- `llms.txt` correctness (AC-6, AC-7) is `INDEXING_ENABLED`-gated exactly like `sitemap.xml`/`robots.txt`, so it reuses the identical two-server-runs verification already established and explained in Slice 3b's research.md §5 — no new verification pattern is introduced.
- The draft-article-preview case (an authenticated admin viewing an unpublished article, per the page's existing `auth.api.getSession` check) is the one sub-case this local `curl`-based approach cannot exercise without simulating an authenticated session. It is not separately curl-verified; instead it is guaranteed by code inspection — the page's JSON-LD emission call is gated by the identical `article.published` boolean check already used for the page's own `noindex` branch (FR-4.1 requires reusing that exact determination, not a second one), so there is no code path where an authenticated draft preview could emit `Article` JSON-LD without also being marked `noindex`. This gap is called out explicitly in quickstart.md rather than silently assumed covered.

**Alternatives considered**:
- *Simulate an authenticated admin session with curl and cookies to verify the draft-preview sub-case end-to-end*: not pursued — meaningfully more verification-harness complexity (bootstrapping a session cookie) for a sub-case already provably covered by the single shared boolean check FR-4.1 mandates; flagged as a manual/code-review verification step instead of automated further.
