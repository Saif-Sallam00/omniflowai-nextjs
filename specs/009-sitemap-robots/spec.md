# Feature Specification: Sitemap + Production Robots

**Feature Branch**: `009-sitemap-robots`

**Created**: 2026-09-01

**Status**: Draft

**Input**: User description: "Feature: Sitemap + Production Robots (Phase 3, Slice 3b). Build directly from docs/sitemap-robots-slice-spec.md (approved, committed) — its user stories, FR-1..FR-6, out-of-scope, settled decisions/assumptions, and AC-1..AC-7 are the operator-approved scope."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A crawler can discover every public URL (Priority: P1)

As a search or AI crawler, I can fetch `/sitemap.xml` and get every public page of the site — all static pages and all published articles and projects, in both English and Arabic, as absolute URLs — so I can discover and index the whole site.

**Why this priority**: Without a sitemap, crawlers have no index of the site's URLs at all — this is the foundational capability the rest of the slice builds on.

**Independent Test**: Can be fully tested by requesting `/sitemap.xml` in production mode and verifying it lists every static page (both languages, `/services` excluded), every published article (both languages, real per-language slugs), and every project (both languages) as absolute URLs.

**Acceptance Scenarios**:

1. **Given** the site is running in production-indexable mode, **When** a crawler requests `/sitemap.xml`, **Then** it receives a valid sitemap listing every static public page in both languages, every published article in both languages at its real per-language slug, and every project in both languages, all as absolute URLs.
2. **Given** an article exists only as a draft, **When** the sitemap is generated, **Then** that article does not appear in it.

---

### User Story 2 - The sitemap reflects real, resolvable URLs (Priority: P1)

As a crawler, every URL in the sitemap resolves to a real 200 page — including Arabic-script article URLs and each language's real per-article slug (not a naive same-slug guess) — so I never waste crawl budget on 404s.

**Why this priority**: A sitemap that links to dead pages actively harms crawl trust and AEO citation quality; correctness of listed URLs is as important as their presence.

**Independent Test**: Can be fully tested by spot-checking a sample of sitemap URLs — an EN article, an AR Arabic-script article, a project in both languages, and a couple of static pages — and confirming each returns 200.

**Acceptance Scenarios**:

1. **Given** an Arabic-script article slug is listed in the sitemap, **When** it is requested, **Then** it resolves to a 200 page (not a 404).
2. **Given** a project listed in the sitemap, **When** its EN and AR URLs are each requested, **Then** both resolve to 200 pages.

---

### User Story 3 - Production robots points to the sitemap and welcomes AI crawlers (Priority: P2)

As an AI crawler (GPTBot, ClaudeBot, CCBot, PerplexityBot, Google-Extended, and other named AI agents), the production `robots.txt` explicitly allows me and references the sitemap, so the site is discoverable and citable by answer engines.

**Why this priority**: Depends on the sitemap existing (US-1); extends discoverability from "a sitemap exists" to "crawlers are explicitly told where it is and that they're welcome."

**Independent Test**: Can be fully tested by requesting `/robots.txt` in production mode and verifying it contains a `Sitemap:` line, explicit `Allow` rules for the named AI crawlers, and the preserved generic `*` rule with `/admin/` and `/api/` disallowed.

**Acceptance Scenarios**:

1. **Given** the site is running in production-indexable mode, **When** `/robots.txt` is requested, **Then** it contains a `Sitemap:` line pointing at the absolute sitemap URL.
2. **Given** the site is running in production-indexable mode, **When** `/robots.txt` is requested, **Then** it contains explicit `Allow` rules for GPTBot, ClaudeBot, CCBot, PerplexityBot, Google-Extended, and other named AI crawlers, alongside the unchanged generic `User-agent: *` rule.

---

### User Story 4 - Admin/API stay out of the index even in production (Priority: P2)

As the operator, `/admin/*` and `/api/*` are protected from indexing in production not only by a `robots.txt` `Disallow` (a soft directive) but also by an `X-Robots-Tag: noindex` response header (a stronger per-response signal), so admin and API surfaces never appear in search results.

**Why this priority**: Welcoming more crawlers (US-3) raises the stakes of admin/API leaking into search results — this hardens the boundary that makes broader crawling safe.

**Independent Test**: Can be fully tested by requesting an `/admin` or `/api` path and a public route in production mode and comparing their `X-Robots-Tag` headers.

**Acceptance Scenarios**:

1. **Given** the site is running in production-indexable mode, **When** a request is made to an `/admin` or `/api` path, **Then** the response carries `X-Robots-Tag: noindex`.
2. **Given** the site is running in production-indexable mode, **When** a request is made to a public route, **Then** the response does not carry an `X-Robots-Tag: noindex` header.

---

### User Story 5 - Staging stays fully deindexed (Priority: P1)

As the operator, none of the above weakens the staging protection: when indexing is disabled, the whole site remains `noindex` (header + `Disallow: /`) and the sitemap does not advertise indexable URLs.

**Why this priority**: This is the safety invariant underpinning every other story — a regression here would let an unfinished/staging deployment leak into search results, which is the most costly possible failure of this slice.

**Independent Test**: Can be fully tested by requesting `/robots.txt`, `/sitemap.xml`, and any route's headers on a deployment with indexing disabled, and confirming behavior is unchanged from before this slice.

**Acceptance Scenarios**:

1. **Given** indexing is disabled (staging default), **When** `/robots.txt` is requested, **Then** it is `Disallow: /` for all user agents.
2. **Given** indexing is disabled, **When** any route is requested, **Then** the response still carries the blanket `X-Robots-Tag: noindex, nofollow`.
3. **Given** indexing is disabled, **When** `/sitemap.xml` is requested, **Then** it does not advertise the site's indexable URLs.

---

### Edge Cases

- What happens when an article has no `published_at` value? The sitemap entry is still included per US-1/US-2; `lastmod` is a should-have (FR-1.3), not a hard requirement, so its absence must not block inclusion.
- What happens when a project has no timestamp available for `lastmod`? The entry is still included without a `lastmod` field (see FR-1.4).
- How does the system handle a request to `/services`? It MUST NOT appear in the sitemap (it is a redirect, not a real route) and MUST remain excluded regardless of language.
- What happens when indexing is disabled but a crawler still requests `/sitemap.xml`? It must not receive a populated sitemap of indexable URLs (US-5, FR-2.1).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a `/sitemap.xml` endpoint.
- **FR-002**: The sitemap MUST include, as absolute URLs built off the site's canonical base URL:
  - All static public pages in both languages: `/`, `/about`, `/solutions`, `/contact`, `/articles`, `/portfolio`, and their Arabic equivalents (`/services` excluded — it is a redirect, not a route).
  - All published articles in both languages, each at its real per-language slug (including Arabic-script slugs).
  - All projects in both languages, at the shared slug.
- **FR-003**: Article sitemap entries SHOULD carry a `lastmod` value derived from the article's publish timestamp.
- **FR-004**: Project sitemap entries MAY carry a `lastmod` value if a project timestamp is available; omitting it is acceptable. No schema change may be introduced to support this.
- **FR-005**: The sitemap MUST NOT include unpublished/draft articles, admin routes, API routes, or the `/services` redirect.
- **FR-006**: The sitemap MUST read published-content data directly (no intermediate API layer).
- **FR-007**: On a deployment where indexing is disabled (staging default), the sitemap MUST NOT advertise the site's indexable URLs.
- **FR-008**: On a deployment where indexing is enabled (production-indexable mode), the sitemap MUST be fully populated per FR-002.
- **FR-009**: In production-indexable mode, `robots.txt` MUST emit a `Sitemap:` reference pointing at the absolute `/sitemap.xml` URL.
- **FR-010**: In production-indexable mode, `robots.txt` MUST emit explicit allow rules for named AI crawlers — at minimum GPTBot, ClaudeBot, CCBot, PerplexityBot, Google-Extended (and other well-known AI agent tokens) — allowing them to crawl the public site while keeping the same `/admin/`, `/api/` disallows the generic rule already applies.
- **FR-011**: The existing generic `User-agent: *` production rule (allow public site, disallow `/admin/` and `/api/`) MUST be preserved unchanged; AI-crawler rules are additive, not a replacement.
- **FR-012**: In staging/noindex mode, `robots.txt` MUST remain the blanket `Disallow: /` for all user agents, unchanged from today. AI-crawler allow rules apply only in production-indexable mode.
- **FR-013**: In production-indexable mode, all `/admin/*` and `/api/*` responses MUST additionally carry an `X-Robots-Tag: noindex` response header, active only when indexing is enabled.
- **FR-014**: The production-mode header rule (FR-013) MUST NOT collide with or weaken the existing staging-mode rule, under which every route carries `X-Robots-Tag: noindex, nofollow` when indexing is disabled. The two rule sets are mutually exclusive — exactly one is active at a time, governed by the single indexing flag.
- **FR-015**: In production-indexable mode, public routes (everything except `/admin` and `/api`) MUST NOT carry any `X-Robots-Tag: noindex` header.
- **FR-016**: The staging deindex behavior (blanket noindex header + `Disallow: /` robots) MUST be verifiably unchanged by this feature when indexing is disabled.
- **FR-017**: No existing public route's rendering, metadata, or canonical/hreflang output may be changed by this feature.
- **FR-018**: This feature MUST NOT introduce any schema change or migration.
- **FR-019**: The system's standard type-check, lint, and build checks MUST all pass with zero errors.

### Key Entities *(include if feature involves data)*

- **Sitemap entry**: A single URL entry in `/sitemap.xml` — represents one public, resolvable page (static page, published article, or project) with its absolute URL, language variant, and optional last-modified timestamp.
- **Robots rule set**: The set of crawl directives served at `/robots.txt` for a given indexing mode (staging/noindex vs. production/indexable) — governs which user agents may crawl which paths and whether a sitemap reference is advertised.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In production-indexable mode, 100% of static public pages, published articles, and projects (both languages) appear in `/sitemap.xml` as absolute URLs, with drafts, `/admin`, `/api`, and `/services` fully absent.
- **SC-002**: 100% of a spot-checked sample of sitemap URLs (including an Arabic-script article URL) return a successful page load with no dead links.
- **SC-003**: In production-indexable mode, `/robots.txt` references the sitemap and explicitly welcomes 100% of the named AI crawlers, while `/admin` and `/api` remain disallowed for the generic crawler rule.
- **SC-004**: In production-indexable mode, 100% of requests to `/admin` or `/api` paths carry a noindex response header, and 0% of requests to public routes do.
- **SC-005**: When indexing is disabled, site-wide deindexing behavior (robots, headers, sitemap) is unchanged from pre-feature behavior, verified with zero regressions.
- **SC-006**: This feature ships with zero changes to existing public-route rendering/metadata/canonical output, and zero schema or migration changes.

## Assumptions

- The site's canonical absolute-URL base (used for hreflang/canonical elsewhere) is reused as the sitemap's URL base — no new base URL concept is introduced.
- Indexing mode is controlled by a single existing flag with two mutually exclusive states (disabled/staging vs. enabled/production); this feature does not introduce a new flag or change the flag's semantics.
- Article slug-pairing and Arabic-script article URL resolution are already correct as of prior work in this phase — this feature depends on, but does not fix, those.
- Enabling production indexing mode itself (flipping the flag on any real deployment) is a separate operational action outside this feature's scope; this feature only makes production-mode behavior correct when that flag is eventually enabled.
- Project last-modified timestamps may not currently be exposed by existing data-read functions; if so, sitemap entries for projects may omit `lastmod` rather than requiring new data exposure.
- AI-crawler allow rules are purely additive (welcoming more crawlers); no crawler is blocked or restricted beyond the existing `/admin`/`/api` disallow.
- Logging behavior for any endpoints is unaffected by and out of scope for this feature.
