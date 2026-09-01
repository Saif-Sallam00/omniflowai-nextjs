# Contracts: Structured Data & llms.txt

External interfaces this feature exposes to search/AI crawlers. Full field-level detail lives in [data-model.md](./../data-model.md).

## `application/ld+json` — Organization (site-wide)

- **Producer**: `components/site-shell.tsx`.
- **Present on**: every route rendered through `SiteShell` (i.e., every public page in both languages).
- **Absent on**: `/admin/*`, `/api/*` (neither renders `SiteShell`).
- **Shape**: `{ "@context": "https://schema.org", "@type": "Organization", name, url, description, inLanguage }` (`logo` omitted — research.md §4).
- **Consumers**: any crawler/answer engine parsing `<script type="application/ld+json">` blocks on a page.

## `application/ld+json` — Article (article detail)

- **Producer**: `app/(en)/(public)/articles/[slug]/page.tsx` and `app/ar/(public)/articles/[slug]/page.tsx`, via `lib/structured-data.ts`'s `buildArticleJsonLd`.
- **Present on**: a published article's detail page, both languages.
- **Absent on**: an unpublished/draft article's detail page, or a not-found slug — gated by the exact same `article.published`/not-found determination `generateMetadata` already uses for its `noindex` branch (FR-009).
- **Shape**: `{ "@context": "https://schema.org", "@type": "Article", headline, description, image, datePublished?, inLanguage, url, mainEntityOfPage, publisher: { "@type": "Organization", name, url } }`.
- **Consumers**: answer engines citing a specific article.

## `application/ld+json` — CreativeWork (project/case-study detail)

- **Producer**: `app/(en)/(public)/portfolio/[slug]/page.tsx` and `app/ar/(public)/portfolio/[slug]/page.tsx`, via `lib/structured-data.ts`'s `buildCaseStudyJsonLd`.
- **Present on**: any resolvable project detail page, both languages (projects have no draft state — research.md §1).
- **Absent on**: a not-found slug.
- **Shape**: `{ "@context": "https://schema.org", "@type": "CreativeWork", name, description, image, inLanguage, url, publisher: { "@type": "Organization", name, url } }`.
- **Consumers**: answer engines referencing a case study.

## `GET /llms.txt`

- **Producer**: `app/llms.txt/route.ts`.
- **Production mode** (`INDEXING_ENABLED === "true"`): curated header + full list of published articles and projects (title + absolute URL, both languages).
- **Staging mode** (unset/falsy): header only — no article/project list (research.md §6).
- **Content-Type**: `text/plain`.
- **Consumers**: AI agents fetching a low-noise content index directly.

## Backward compatibility

- No existing route's metadata, rendering, sitemap, or robots output changes. All JSON-LD blocks are additive `<script>` tags with no visible rendering effect (FR-018).
- `/llms.txt` is a wholly new route; it introduces no change to any existing route's behavior.
