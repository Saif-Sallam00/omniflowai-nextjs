# Phase 0 Research: Dedicated `SITE_URL` Environment Variable

No `[NEEDS CLARIFICATION]` markers remain in `spec.md` or in this plan's Technical Context — this feature reuses an existing, already-decided pattern (Zod-validated required env vars in `lib/env.ts`) rather than introducing new technology. Research here is limited to confirming the exact validation shape and capturing the raw PV-2b evidence referenced from `plan.md`.

## Decision 1 — Validation approach for the trailing-slash rule

**Decision**: Add `SITE_URL` to `envSchema` using the same `.string().min(1, ...).url(...)` pattern as the existing four variables, plus a `.refine()` (or equivalent Zod chain) that rejects a value ending in `/`, with its own dedicated error message naming the trailing-slash rule (e.g. `"SITE_URL must not end with a trailing slash"`).

**Rationale**: Every existing variable in `lib/env.ts` follows the `min(1, "<VAR> is required")` + `.url("<VAR> must be a valid URL")` message style (FR-1.2 in the source spec requires matching it). The trailing-slash rule is a distinct, additional constraint on top of "is a valid URL" — a URL can be well-formed and still have a trailing slash — so it needs its own check and its own message rather than being folded into the `.url()` validator, which has no opinion on trailing slashes either way.

**Alternatives considered**:
- Stripping a trailing slash silently (`.transform()`) instead of rejecting it — rejected. FR-2.2/FR-002 forbid silent correction of exactly this kind of misconfiguration; the whole point of this feature is surfacing a problem, not smoothing over it.
- A single combined error message ("must be a valid URL with no trailing slash") — rejected as weaker than the spec's explicit requirement that the trailing-slash violation be nameable on its own (FR-1.3/FR-002).

## Decision 2 — No `https` requirement

**Decision**: `SITE_URL` validation uses the same `.url()` check as the other four variables (which accepts any scheme `zod` considers a valid URL, including `http://`), with no additional scheme restriction.

**Rationale**: FR-1.4/FR-003 requires `http://localhost:3000` to pass, because local production-build verification (`npm run build && npm start`) runs without TLS. Restricting to `https` would make the feature unverifiable locally, contradicting FR-6.2/SC-002's requirement that a local build can be run and checked end-to-end.

**Alternatives considered**: Environment-conditional scheme enforcement (require `https` only when `NODE_ENV === "production"` and not `localhost`) — rejected as unnecessary complexity for a case the spec explicitly says not to gate; `BETTER_AUTH_URL` doesn't do this either, so it would also be an inconsistency between the two variables for no stated benefit.

## Decision 3 — No `contracts/` artifact

**Decision**: Skip generating a `contracts/` directory for this feature.

**Rationale**: `contracts/` is for interfaces the project exposes to users or other systems (APIs, CLI schemas, endpoints). This feature has no such interface — it swaps the source of an existing internal accessor (`siteUrl` in `lib/site.ts`). The relevant "contract" is behavioral (byte-identical rendered output), and it is fully captured by the verification procedure in `quickstart.md` instead.

## PV-2b raw evidence (supporting `plan.md`)

Captured 2026-09-03 via direct HTTPS fetch of the live production site, after the operator's post-Slice-5.5 deploy.

### `/sitemap.xml` (full body, 17 `<url>` entries)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>https://omniflowai.net/</loc></url>
<url><loc>https://omniflowai.net/ar</loc></url>
<url><loc>https://omniflowai.net/about</loc></url>
<url><loc>https://omniflowai.net/ar/about</loc></url>
<url><loc>https://omniflowai.net/solutions</loc></url>
<url><loc>https://omniflowai.net/ar/solutions</loc></url>
<url><loc>https://omniflowai.net/contact</loc></url>
<url><loc>https://omniflowai.net/ar/contact</loc></url>
<url><loc>https://omniflowai.net/articles</loc></url>
<url><loc>https://omniflowai.net/ar/articles</loc></url>
<url><loc>https://omniflowai.net/portfolio</loc></url>
<url><loc>https://omniflowai.net/ar/portfolio</loc></url>
<url><loc>https://omniflowai.net/articles/from-inbox-to-insight-how-we-integrated-claude-into-our-daily-business-operation</loc><lastmod>2026-09-02T02:23:55.386Z</lastmod></url>
<url><loc>https://omniflowai.net/ar/articles/من-البريد-الإلكتروني-إلى-الرؤية-الثاقبة-كيف-دمجنا-كلود-في-عملياتنا-اليومية-في-مص</loc><lastmod>2026-09-02T02:27:42.244Z</lastmod></url>
<url><loc>https://omniflowai.net/portfolio/shoesnet-b2b-wholesale-footwear-marketplace</loc></url>
<url><loc>https://omniflowai.net/ar/portfolio/shoesnet-b2b-wholesale-footwear-marketplace</loc></url>
</urlset>
```

### `/robots.txt` (full body)

```text
User-Agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

User-Agent: GPTBot
Allow: /
Disallow: /admin/
Disallow: /api/

User-Agent: OAI-SearchBot
Allow: /
Disallow: /admin/
Disallow: /api/

User-Agent: ChatGPT-User
Allow: /
Disallow: /admin/
Disallow: /api/

User-Agent: ClaudeBot
Allow: /
Disallow: /admin/
Disallow: /api/

User-Agent: anthropic-ai
Allow: /
Disallow: /admin/
Disallow: /api/

User-Agent: Claude-User
Allow: /
Disallow: /admin/
Disallow: /api/

User-Agent: CCBot
Allow: /
Disallow: /admin/
Disallow: /api/

User-Agent: PerplexityBot
Allow: /
Disallow: /admin/
Disallow: /api/

User-Agent: Perplexity-User
Allow: /
Disallow: /admin/
Disallow: /api/

User-Agent: Google-Extended
Allow: /
Disallow: /admin/
Disallow: /api/

User-Agent: Applebot-Extended
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://omniflowai.net/sitemap.xml
```

These two full bodies are the exact strings the post-deploy verification step in `quickstart.md` compares against byte-for-byte (modulo the `<lastmod>` values, which are expected to advance as content is edited and are not part of the `SITE_URL`-dependent surface being verified).
