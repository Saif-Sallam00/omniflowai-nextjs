# Research: Sitemap + Production Robots

**Feature**: [spec.md](./spec.md) | **Source**: `docs/sitemap-robots-slice-spec.md`, `docs/phase-3-seo-extract.md` (§4, §5, §6)

Five mechanism decisions were left open by the spec for this phase. Each is resolved below.

## 1. Sitemap gate mechanism (empty-in-staging vs. deployment-level)

**Decision**: `app/sitemap.ts` reads `process.env.INDEXING_ENABLED` directly (same pattern as `app/robots.ts` and `next.config.ts`) and returns an empty array (`[]`) when it is not `"true"`. It only queries the DAL and builds the full URL list when `INDEXING_ENABLED === "true"`.

**Rationale**:
- FR-2.1 is a hard MUST ("MUST NOT advertise the site's indexable URLs"), not an incidental side effect of the deployment being noindex overall. An explicit in-file check makes the invariant self-enforcing and independently testable — it doesn't rely on every future deployment correctly wiring up staging noindex everywhere.
- It's the same flag, read the same way (`process.env.INDEXING_ENABLED === "true"`), already used in `app/robots.ts` and `next.config.ts` — no new pattern introduced, and the three files stay consistent and easy to reason about together.
- It's the more locally-testable option: `INDEXING_ENABLED=true npm run build && npm start` vs. leaving it unset, then `curl localhost:3000/sitemap.xml` in each mode — no need to simulate "deployment is noindex" as a separate condition.
- `sitemap.ts` is a cached Route Handler by default unless it uses a request-time API (per Next.js 16 docs); reading `process.env` at module/function scope is not a request-time API, so this preserves the existing caching behavior — consistent with how `robots.ts` already reads the same env var without opting out of caching.

**Alternatives considered**:
- *Rely on deployment-level noindex only* (no check in `sitemap.ts`, always populate it): rejected — the sitemap would leak the full list of production URLs even on a staging deployment, and correctness would depend entirely on the operator remembering that staging is globally noindexed. FR-2.1 asks for the sitemap itself to not advertise; this alternative doesn't actually satisfy the requirement's wording, only its likely practical effect.

## 2. Project `lastmod` handling

**Decision**: Omit `lastmod` for project sitemap entries. `app/sitemap.ts` continues to use the existing `getPortfolioSlugs()` read (slug only, no timestamp) with no new DAL function added.

**Rationale**:
- The instruction is explicit: prefer omitting over adding a DB read, *unless* a public project timestamp read already exists. Checked `lib/db/portfolio.ts` — no public (non-admin) read exposes a project timestamp today. `listProjectsForAdmin` selects `projects.updatedAt`, but it is explicitly scoped as admin-only ("Everything below is used only by the admin CRUD ... never by public rendering").
- FR-1.4 in the source spec explicitly allows omission, and FR-1.3 marks article `lastmod` as a SHOULD, not a MUST, confirming `lastmod` is a nice-to-have signal, not a hard requirement, for any entry type.
- Adding a new public DAL read only to satisfy an optional field would be scope creep beyond what this slice needs, and would touch a file (`lib/db/portfolio.ts`) whose write/read boundary is already carefully commented as admin-only vs. public.

**Alternatives considered**:
- *Add a small additive public read exposing `updatedAt`* (e.g. `getPortfolioSlugsWithLastmod()`): rejected for this slice — permitted by the settled scope but not necessary, since `lastmod` is optional and the existing `getPortfolioSlugs()` already satisfies FR-1.2's core requirement (URL presence). Left as a natural follow-up if a future slice wants richer sitemap metadata.

## 3. AI-crawler user-agent token set

**Decision**: Enumerate the following tokens as explicit `Allow: /` rules in production mode, each as a `MetadataRoute.Robots` rule with the same `/admin/`, `/api/` disallows as the generic rule:

| Token | Operator | Purpose |
|---|---|---|
| `GPTBot` | OpenAI | Training/crawling |
| `OAI-SearchBot` | OpenAI | ChatGPT search citations |
| `ChatGPT-User` | OpenAI | On-demand user-invoked browsing |
| `ClaudeBot` | Anthropic | Training/crawling |
| `anthropic-ai` | Anthropic | Legacy Claude crawler token |
| `Claude-User` | Anthropic | On-demand user-invoked browsing |
| `CCBot` | Common Crawl | Open dataset used by many AI labs |
| `PerplexityBot` | Perplexity | Crawling/indexing for citations |
| `Perplexity-User` | Perplexity | On-demand user-invoked browsing |
| `Google-Extended` | Google | Gemini/AI feature training & grounding |
| `Applebot-Extended` | Apple | Apple Intelligence training |

**Rationale**:
- The spec names GPTBot, ClaudeBot, CCBot, PerplexityBot, Google-Extended as the minimum and explicitly delegates "any other well-known AI agent tokens" to implementation time.
- `anthropic-ai` is included because the grounding audit (`docs/phase-3-seo-extract.md` §6) specifically grepped for it alongside `ClaudeBot` as a token this repo should consider — it is Anthropic's older/alternate crawler identity, still honored by some sites.
- The paired `-User`/search-bot variants (`OAI-SearchBot`, `ChatGPT-User`, `Claude-User`, `Perplexity-User`) are each major AI product's *own* on-demand/citation crawler, distinct from their training crawler — since the operator decision is to maximize AEO citation (not just training-data inclusion), both classes are allowed.
- `Applebot-Extended` is included as the current well-known token for Apple Intelligence's use of crawled content, rounding out the "major AI platform" set without speculative or obscure tokens.
- All are pure `Allow: /` additions with the same `/admin/`, `/api/` disallow already applied to `*` — no crawler is blocked or treated differently, satisfying "additive, never blocking" (FR-3.2/FR-3.3, and the settled instruction).

**Alternatives considered**:
- *Ship only the five spec-named tokens*: rejected — the spec explicitly invites enumerating current well-known additions, and omitting the `-User`/search variants would under-serve the AEO citation goal that motivated this slice in the first place.
- *Enumerate an exhaustive/aggressive list including lesser-known or borderline-adversarial crawlers* (e.g. `Bytespider`, `Meta-ExternalAgent`): rejected — out of scope; the spec's intent is the major recognized AI answer-engine crawlers, not every crawler that self-identifies as AI-related. Sticking to well-documented, widely-referenced tokens keeps the rule set maintainable and avoids allowing something the operator didn't actually intend to bless.

## 4. `next.config.ts` `headers()` branching structure

**Decision**: Keep the existing single `if (INDEXING_ENABLED === "true") { ... } return [...]` branch shape, but change the `true` branch from `return []` to return two path-scoped rules instead of an empty array:

```ts
async headers() {
  if (process.env.INDEXING_ENABLED === "true") {
    return [
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  }

  return [
    { source: "/(.*)", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
  ];
},
```

**Rationale**:
- `/admin/:path*` and `/api/:path*` (Next.js's built-in path-to-regexp-based header source matching) each match the prefix itself and every nested path (`/admin`, `/admin/articles`, `/admin/articles/5`, etc.) — the same scoping the existing `robots.ts` `disallow: ["/admin/", "/api/"]` rule targets.
- The staging branch (`return [...]` with `/(.*)`) is untouched byte-for-byte — satisfies FR-4.2/FR-5.1's "MUST remain unchanged" requirement literally, not just behaviorally.
- One flag, one `if`/`else`, two mutually exclusive return values — matches the settled instruction's description of the branching shape exactly and mirrors the existing pattern already used by both `robots.ts` and this same function today, so no new control-flow idiom is introduced.
- `noindex` alone (no `nofollow`) is used for the production `/admin`/`/api` rule, matching AC-5's wording and FR-4.1, and deliberately distinct from the staging value (`noindex, nofollow`) — the two rules are visibly different in intent (staging: keep the whole deployment out of any index and don't follow links from it; production: keep two specific surfaces out of the index only).

**Alternatives considered**:
- *A single shared rule array with conditional entries computed via a variable, then one `return rules`*: rejected — less literally "unchanged" for the staging branch and adds indirection without benefit for two straightforward return statements.

## 5. Verifying AC-5's per-path header via a local production build

**Decision**: Verify locally with a full production build and start, without ever touching `INDEXING_ENABLED` on the reachable staging deployment:

```bash
INDEXING_ENABLED=true npm run build
INDEXING_ENABLED=true npm run start &
curl -sI http://localhost:3000/admin | grep -i x-robots-tag   # expect: noindex
curl -sI http://localhost:3000/api/health | grep -i x-robots-tag  # expect: noindex
curl -sI http://localhost:3000/ | grep -i x-robots-tag        # expect: no header at all
curl -s http://localhost:3000/robots.txt                      # expect: Sitemap: + AI-crawler Allow rules
curl -s http://localhost:3000/sitemap.xml                     # expect: populated
```

Then repeat without `INDEXING_ENABLED` (or `INDEXING_ENABLED=false`) to confirm the staging branch is unchanged:

```bash
npm run build && npm run start &
curl -sI http://localhost:3000/ | grep -i x-robots-tag        # expect: noindex, nofollow
curl -s http://localhost:3000/robots.txt                      # expect: Disallow: / for *
curl -s http://localhost:3000/sitemap.xml                     # expect: empty urlset
```

**Rationale**:
- `next.config.ts` `headers()` and `INDEXING_ENABLED`-gated behavior are only fully realized in a production build (`next build` + `next start`); `next dev` does not reliably reflect header/caching behavior the same way, and this mirrors the "Phase 0 local-verification approach" referenced in the plan input for the original `INDEXING_ENABLED` gating work.
- This exercises the real code path end-to-end (build-time env read, header emission, sitemap/robots generation) with zero risk to the reachable staging deployment, since the flag is only ever set in the local process environment for this verification, never persisted or pushed.
- Running both modes locally (flag set, flag unset) directly proves both AC-5 (per-path header in production mode) and AC-6 (staging unchanged) from the same verification pass.

**Alternatives considered**:
- *Toggle `INDEXING_ENABLED` on the actual staging deployment temporarily*: rejected — explicitly out of scope per the settled inputs ("does NOT flip `INDEXING_ENABLED=true`"); this would also risk a live, if brief, exposure of production-indexable behavior on a deployment intended to stay noindex until cutover.
- *Unit-test `next.config.ts`'s `headers()` export directly*: not pursued as the primary verification — `headers()` is a plain function and can be unit-tested cheaply as a supplement, but does not substitute for an actual HTTP-level check of the emitted header, which is what AC-5 asks for.
