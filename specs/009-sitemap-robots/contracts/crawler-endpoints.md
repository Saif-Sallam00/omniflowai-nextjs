# Contracts: Crawler-Facing Endpoints

External interfaces this feature exposes to search/AI crawlers. Both are Next.js file-convention routes; shapes are enforced by `MetadataRoute.Sitemap` / `MetadataRoute.Robots` at compile time. Full field-level detail lives in [data-model.md](./../data-model.md).

## `GET /sitemap.xml`

- **Producer**: `app/sitemap.ts`, default-exported function returning `MetadataRoute.Sitemap`.
- **Production mode** (`INDEXING_ENABLED === "true"`): array of `{ url, lastModified? }` entries — every static public page (both languages), every published article (both languages, real per-language slug), every project (both languages). No entry for drafts, `/admin`, `/api`, or `/services`.
- **Staging mode** (`INDEXING_ENABLED` unset/falsy): `[]` — Next.js renders this as an empty `<urlset>`.
- **Consumers**: search/AI crawlers fetching `/sitemap.xml` directly, and any crawler following the `Sitemap:` reference in `/robots.txt`.

## `GET /robots.txt`

- **Producer**: `app/robots.ts`, default-exported function returning `MetadataRoute.Robots`.
- **Production mode**: `rules` is an array — the existing generic `{ userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] }` rule, plus one additional rule per AI-crawler token (§3 of [research.md](./../research.md)), each `{ userAgent: <token>, allow: "/", disallow: ["/admin/", "/api/"] }`. `sitemap` is set to the absolute `/sitemap.xml` URL.
- **Staging mode**: unchanged — `rules: { userAgent: "*", disallow: "/" }`, no `sitemap` field.
- **Consumers**: any crawler fetching `/robots.txt` before crawling the rest of the site.

## Response header: `X-Robots-Tag` on `/admin/*` and `/api/*`

- **Producer**: `next.config.ts` `headers()`.
- **Production mode**: `X-Robots-Tag: noindex` on any path under `/admin/` or `/api/`. No header on any other path.
- **Staging mode**: unchanged — `X-Robots-Tag: noindex, nofollow` on every path (`/(.*)`).
- **Consumers**: any crawler that respects the `X-Robots-Tag` response header, as a stronger-than-`robots.txt` per-response signal.

## Backward compatibility

- Staging-mode output for all three surfaces is byte-for-byte unchanged from pre-feature behavior (verified in [quickstart.md](./../quickstart.md) Part B).
- Production-mode `robots.txt`'s existing generic rule and `next.config.ts`'s staging branch are preserved unmodified; this feature only adds new rules alongside them, and populates a sitemap that did not exist before.
