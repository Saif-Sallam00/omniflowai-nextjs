# Research: SEO Metadata Correctness + Article Slug-Pairing Fix + OG Images

All items below were pinned by the operator brief as "settled mechanisms" or left open for research. This file resolves the open items and records the exact shape each pinned mechanism takes, grounded in the current code (cited by file:line).

## 1. Counterpart-resolution DAL read

**Decision**: Add one new function to `lib/db/articles.ts`, alongside the existing public reads:

```ts
export const getPublishedCounterpartSlug = cache(
  async (translationGroupId: string, targetLanguage: Language): Promise<string | null> => {
    const rows = await db
      .select({ slug: articles.slug })
      .from(articles)
      .where(
        and(
          eq(articles.translationGroupId, translationGroupId),
          eq(articles.language, targetLanguage),
          eq(articles.published, true),
        ),
      )
      .limit(1);
    return rows[0]?.slug ?? null;
  },
);
```

This mirrors the existing shape of `getPublishedArticleSlugs` (`lib/db/articles.ts:43-51`) and reuses the same `(translation_group_id, language)` unique index the schema already has (`lib/db/schema.ts:80-83`). It is published-only by construction (`eq(articles.published, true)`), so an existing-but-unpublished counterpart returns `null` — satisfying "unpublished counterpart = absent."

**Prerequisite found during research**: `getArticleBySlug`'s current `Article` type and select list (`lib/db/articles.ts:15-25`, `53-73`) do **not** include `translationGroupId` — only the admin-side `getArticleById`/`getArticleByTranslationGroupAndLanguage` select the full row. `generateMetadata` and the page body both call `getArticleBySlug(slug, LANGUAGE)` and need the current article's `translationGroupId` to look up its counterpart. **Decision**: add `translationGroupId: string` to the `Article` type and to `getArticleBySlug`'s select list. This is a code-level type/query change only — no schema change, the column already exists.

**Dedup decision**: `getPublishedCounterpartSlug` is wrapped in React's `cache()` (same pattern as every other read in this file), which dedupes by argument identity within a single render pass. Both the article `generateMetadata` and the page body call it with the same `(translationGroupId, targetLanguage)` pair derived from the same `getArticleBySlug` result, so it resolves to a single query per request. No manual memoization needed beyond what `cache()` already provides — consistent with how `getArticleBySlug` itself is already deduped between `generateMetadata` and the page body today (`app/(en)/(public)/articles/[slug]/page.tsx:36,61`).

**Alternatives considered**: A single combined read returning `{ article, counterpartSlug }` in one call was considered, but rejected — it would require the language of the *page currently being rendered* and the *target* language as two separate parameters anyway, and would break the existing `getArticleBySlug` call sites' simple two-argument shape used elsewhere (unclear it's only used in these two spots, but keeping reads single-purpose matches the flat `lib/db/<entity>.ts` convention already in place, e.g. `getPortfolioSlugs` vs `getPortfolioDetailBySlug` are already separate reads for the same table).

## 2. `buildPageMetadata` signature growth

**Decision**: `lib/metadata.ts`'s `PageMetadataInput` type (`lib/metadata.ts:5-10`) gains exactly two new optional fields, per the pinned mechanism:

```ts
export type PageMetadataInput = {
  path: string;
  language: Language;
  title: string;
  description: string;
  languageAlternates?: { en: string | null; ar: string | null };
  imageUrl?: string;
};
```

- `languageAlternates`, when provided, holds **paths** (not full URLs) for each language, matching the shape `path` already uses. The caller (article `generateMetadata`) always populates the current page's own language with its own path (never `null` — the current page unambiguously exists) and the *other* language with the resolved counterpart path or `null` when `getPublishedCounterpartSlug` returns `null`.
- When `languageAlternates` is **absent** (every static page, both project-detail `generateMetadata` calls), `buildPageMetadata` MUST fall through to its current behavior: derive both `enUrl`/`arUrl` via `getLanguagePath(path, "en"/"ar")` exactly as today (`lib/metadata.ts:19-20`) — i.e. this is a pure additive branch, not a rewrite of the existing code path. This directly satisfies FR-004/FR-007 (no regression on non-article routes) and the constitution's URL Preservation principle (no existing correct alternate is touched).
- `imageUrl`, when provided, is treated as a **relative** path (matching the existing `coverImage` string shape, e.g. `/api/image/42`) and is absolutized internally using the same private `buildAbsoluteUrl` helper already used for canonical/hreflang URLs (`lib/metadata.ts:12-14`) — no new URL-building logic, one code path for "make this repo-relative path absolute."

**x-default logic** (resolves the pinned "x-default points to EN when a published EN exists, else AR" rule concretely): when `languageAlternates` is present, x-default = `buildAbsoluteUrl(languageAlternates.en)` if `languageAlternates.en !== null`, else `buildAbsoluteUrl(languageAlternates.ar)`. Since the caller always sets the *current* page's own language slot to a real (non-null) path, and only the *other* language's slot can be `null`, this can never resolve to a non-existent URL — satisfying FR-2.4/AC-2. When `languageAlternates` is absent, x-default keeps its current unconditional `enUrl` value (`lib/metadata.ts:30`) — unchanged for non-article routes.

**Omission mechanic**: when a language's resolved path is `null`, `buildPageMetadata` omits that key from the `alternates.languages` object entirely (rather than setting it to an empty string or omitting the whole `languages` object) — Next.js's `Metadata.alternates.languages` type accepts a partial record, so this requires no schema/type gymnastics beyond conditionally spreading the key in.

**Alternatives considered**: Passing full absolute URLs into `languageAlternates` instead of paths was considered, but rejected for consistency — `path` is already the convention for every other field this function absolutizes, and keeping `languageAlternates` as paths means the caller (the page) never needs to import or duplicate `buildAbsoluteUrl`/`siteUrl` itself.

## 3. Language-switcher delivery mechanism + no-counterpart UX

**Problem confirmed by reading the component tree**: `LanguageSwitcher` (`components/language-switcher.tsx`) is a Client Component rendered inside `SiteHeader` (`components/site-header.tsx:78,129`), which is itself rendered by `SiteShell` (`components/site-shell.tsx`) from the **public layout** (`app/(en)/(public)/layout.tsx:14`, `app/ar/(public)/layout.tsx` equivalent) — i.e., the header is a sibling ancestor of `{children}`, not a descendant of any individual page. A page cannot pass props "down" to a layout that already rendered around it, so plain prop-threading from the article page into `SiteHeader` is not mechanically possible in the App Router. The switcher today computes its href purely from `usePathname()` with no per-page data at all (`components/language-switcher.tsx:27-30`).

**Decision**: introduce one small client-side React Context, provided by a Client Component wrapper mounted inside `SiteShell` so it wraps *both* `SiteHeader` and `{children}` (the page) as siblings under one common provider:

- `lib/language-alternate-context.tsx` (new file, colocated with the other `lib/` client-safe helpers): exports a Context whose value is `{ override: string | null | undefined; setOverride: (v: string | null | undefined) => void }`, and a `LanguageAlternateProvider` Client Component holding that state via `useState<string | null | undefined>(undefined)`.
- `SiteShell` wraps its existing tree (`SiteHeader` + `{children}`) in `<LanguageAlternateProvider>`.
- A new tiny Client Component, e.g. `components/article-language-alternate.tsx`, accepts a single prop `href: string | null` and does nothing but call `setOverride(href)` on mount via `useEffect`, and `setOverride(undefined)` on unmount (cleanup). The article detail page (a Server Component) renders `<ArticleLanguageAlternate href={counterpartHref} />` once, passing either the resolved counterpart path or `null` (no counterpart).
- `LanguageSwitcher` reads the context. Three states:
  - `undefined` (default, no page has published an override — every non-article page): keep today's naive `getCounterpartPath` behavior unchanged, verbatim (FR-3.3/FR-007).
  - a string (an article page with a resolved counterpart): navigate to that string.
  - `null` (an article page with no published counterpart): **route to that language's `/articles` list** rather than disabling the control. This was chosen over disabling the switcher because `LanguageSwitcher` is a single shared, always-interactive nav element reused across the whole site (icon and label variants, header and mobile menu) — introducing a disabled/non-interactive visual state into that shared component is a larger, riskier UI change than computing a different (still valid, still meaningful) destination. Routing to the target language's article list keeps the control always clickable and always lands the visitor on real, relevant content, which satisfies FR-3.2's only hard requirement ("no dead-slug 404") with the smallest change to shared UI.

**Reset-on-navigate correctness**: because `ArticleLanguageAlternate`'s cleanup effect runs on unmount (which Next.js triggers when navigating away from the article page to any other route), the context reverts to `undefined` automatically — no stale override can leak onto an unrelated page.

**Alternatives considered**:
- *URL search params or a data attribute read by the header*: rejected — would require the header to inspect the current route/DOM rather than reading page-supplied data, adding coupling instead of removing it.
- *Server-side cookie or header-based signaling*: rejected — this is a purely client-side, single-render-cycle piece of UI state; a network-adjacent mechanism would be disproportionate.
- *Disabling the switcher when no counterpart exists*: considered and rejected per above — bigger shared-component UI change for the same correctness outcome.

## 4. `noindex` detection reusing the existing lookup

**Decision**: no new lookup is introduced. Both detail pages already branch on the exact condition FR-5 cares about:
- Article: `app/(en)/(public)/articles/[slug]/page.tsx:38` — `if (!article || !article.published)` already distinguishes "not found or unpublished" from the happy path, in `generateMetadata`, using the same `getArticleBySlug` call the page body also uses.
- Project: `app/(en)/(public)/portfolio/[slug]/page.tsx:33` — `if (!project)` already distinguishes "not found" from the happy path (projects have no `published` column — confirmed in `lib/db/schema.ts:21-39` — so "not found" is the only non-indexable state a project can be in, consistent with the source spec's assumption that projects don't have a draft concept).

**Decision**: in each of those existing early-return branches, the `Metadata` object returned MUST additionally carry `robots: { index: false, follow: false }`, by spreading over `buildPageMetadata`'s result: `return { ...buildPageMetadata({...}), robots: { index: false, follow: false } };`. This is a change to the *caller* (each page's `generateMetadata`), not to `buildPageMetadata` itself — `buildPageMetadata`'s signature growth (Research §2) is limited to exactly the two fields the operator pinned; `robots` is layered on afterward by the two call sites that need it, which is also why `buildPageMetadata` needs no third parameter.

**Alternatives considered**: adding a `noindex?: boolean` third parameter to `buildPageMetadata` was considered (symmetric with the other two new fields) but rejected because the operator brief explicitly pins the signature growth at "two optional params," and the spread-based approach requires zero changes to the shared builder — the smallest-diff option that still satisfies FR-5.1/FR-5.2 exactly.

## 5. Default OG image asset — ship now or defer?

**Finding**: no `public/` directory exists in the repository at all (confirmed by directory listing) — there is no brand image asset anywhere in the codebase to wire up. The source spec (`docs/seo-metadata-slice-spec.md`) already lists "Creating the site-default OG brand image asset" under Out of Scope as "a design/content task."

**Decision**: defer. This slice wires the `imageUrl` mechanism into `buildPageMetadata` (Research §2) and uses it for article/project detail pages (which already have a real cover image), but static pages pass no `imageUrl` and continue to have no OG image — identical to current behavior, per FR-4.3/FR-009. No placeholder or stock asset is introduced as part of this slice.

## 6. Root-layout placeholder copy replacement

**Finding**: `app/(en)/layout.tsx:6-9` — `title: "OmniflowAI — Foundation"`, `description: "Phase 0 foundation deployment."`; the AR root layout carries the equivalent Arabic placeholder. This is a fallback `Metadata` export only — confirmed in the prior audit (`docs/phase-3-seo-extract.md` §2) that no live public page currently falls through to it, since every page defines its own `generateMetadata`/`metadata`.

**Decision**: replace with real site-wide defaults — title `"OmniflowAI"` / description a real one-line company description, in both `app/(en)/layout.tsx` and `app/ar/layout.tsx` (their exact wording is a content detail, not an architectural one, and is written directly during implementation rather than decided here). No structural change to how the fallback is wired — it remains a plain `export const metadata: Metadata = {...}` on the root layout, unchanged in mechanism.
