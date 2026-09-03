# Feature Specification: Dedicated `SITE_URL` Environment Variable

**Feature Branch**: `014-site-url-env`

**Created**: 2026-09-03

**Status**: Draft

**Input**: User description: "docs/phase-5-slice-5-7-spec.md" (Phase 5, Slice 5.7)

## Pre-work verification (PV-1 through PV-4)

These were required by the input spec to run before any specification content was written, because they determine this feature's scope and priority.

**PV-1 — Production `BETTER_AUTH_URL` value**: Not determinable from this environment. This session has no access to Replit Secrets (the production secret store); only a local `.env.local` was readable, and it holds a local development value (`http://localhost:3000`), not the production value. The operator must supply the production value directly, or confirm it via the Replit dashboard.

**PV-2 — Live production values** (fetched from `https://omniflowai.net/` on 2026-09-03):

| Field | Value |
|---|---|
| `<link rel="canonical">` | `https://omniflowai.net/` |
| hreflang `en` | `https://omniflowai.net/` |
| hreflang `ar` | `https://omniflowai.net/ar` |
| hreflang `x-default` | `https://omniflowai.net/` |
| `og:url` | `https://omniflowai.net/` |
| Organization JSON-LD | `{"@context":"https://schema.org","@type":"Organization","name":"OmniflowAI","url":"https://omniflowai.net/","description":"OmniflowAI — AI-powered solutions.","inLanguage":"en"}` — **no `@id` field present** |

**Note (added at Gate 2, carried here at Gate 3):** PV-2 was captured before the operator deployed Slice 5.5 to production and is now stale (it lacks the JSON-LD `@id`/`logo` and `og:image` fields Slice 5.5 added). It is retained above only as a historical record of the Gate 1 finding. **PV-2b — recaptured post-deploy in `plan.md` — is the authoritative baseline for all post-deploy verification.** No requirement or task in this feature cites PV-2 as a verification target.

**PV-3 — Domain check**: All fetched values point at `https://omniflowai.net` with the correct scheme and no `*.replit.app` leakage. No production SEO defect found; this slice's scope and priority are unaffected. Proceeding as a pure refactor.

**Side finding (not in scope, flagged for the operator only):** The live Organization JSON-LD has no `@id` field, but the current repository (`lib/structured-data.ts:14,23`, from commit `a020336`) always emits one (`` `${siteUrl}/#organization` ``). This means the deployed production build predates commit `a020336` — production is running older code than the current `master`. This is a deployment-staleness observation, not a defect this slice introduces or must fix. It does not block this slice: FR-4.1's "before" baseline is captured from a **local** production build of unmodified code (per FR-4.3), not from the live site, so the comparison this slice depends on is unaffected. It is surfaced here only so the operator isn't surprised that a future deploy will change the live JSON-LD shape for reasons unrelated to this slice.

**PV-4 — Repo-wide grep results**:

`BETTER_AUTH_URL` consumers (code, excluding historical spec/doc/task files which only describe past decisions):
- `lib/env.ts:17-20` — schema definition (required, URL-validated)
- `lib/site.ts:3` — `export const siteUrl = env.BETTER_AUTH_URL;` (the line this feature changes)
- `lib/auth.ts:15` — `baseURL: env.BETTER_AUTH_URL` (Better Auth's own base URL — a separate, legitimate consumer that must NOT change)

`siteUrl` consumers (code):
- `app/robots.ts:2,33` — imports `siteUrl`, builds the `sitemap` field
- `app/sitemap.ts:5,17,25,34` — imports `siteUrl`, builds every sitemap entry URL
- `lib/metadata.ts:3,16` — imports `siteUrl` (and `DEFAULT_OG_IMAGE_PATH`), builds absolute URLs for canonical/hreflang/OG/Twitter
- `lib/structured-data.ts:3,5` — imports `siteUrl` (and `LOGO_PATH`), builds `ORGANIZATION_ID` and JSON-LD `url` fields

**Confirmed**: `lib/site.ts` is the only place `BETTER_AUTH_URL` is read for public-URL construction. `lib/auth.ts` is a separate, legitimate consumer for Better Auth's own configuration and is explicitly out of scope. No consumer outside `lib/site.ts` reads `BETTER_AUTH_URL` or (post-change) `SITE_URL` directly — every other file goes through the `siteUrl` export, matching FR-2.4's constraint.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Decouple public site identity from the auth variable (Priority: P1)

As the operator, I want the site's public URL (used in canonicals, hreflang tags, Open Graph tags, and JSON-LD) to come from its own configuration value, so that a future change to the authentication base URL cannot silently rewrite every indexable URL the site emits.

**Why this priority**: This is the core risk this feature exists to close. Today, one variable serves two unrelated purposes; splitting them removes an entire class of silent SEO breakage.

**Independent Test**: Set `SITE_URL` to the value `BETTER_AUTH_URL` currently holds, build the site, and confirm every emitted canonical/hreflang/OG/JSON-LD URL is byte-identical to the pre-change output. Then change `BETTER_AUTH_URL` alone (leaving `SITE_URL` untouched) and confirm public URLs do not change.

**Acceptance Scenarios**:

1. **Given** `SITE_URL` is set to the site's real public origin, **When** any page is rendered, **Then** its canonical, hreflang alternates, `og:url`, `og:image`, and JSON-LD `@id`/`url` are all built from `SITE_URL`, not `BETTER_AUTH_URL`.
2. **Given** `SITE_URL` is set to the same value `BETTER_AUTH_URL` previously held, **When** the site is built and rendered, **Then** the output is byte-identical to the output before this change, across the home, about, article-detail, and portfolio-detail pages in both languages.
3. **Given** `SITE_URL` is set, **When** `BETTER_AUTH_URL` is later changed for an authentication-only reason, **Then** no public URL the site emits changes as a result.

---

### User Story 2 - Fail fast on missing or malformed configuration (Priority: P2)

As the operator, I want the build to refuse to run with a missing, empty, or malformed `SITE_URL` — including one with a trailing slash — so that a misconfiguration is caught before it reaches production rather than silently corrupting every public URL.

**Why this priority**: A silent bad default (or a fallback to `BETTER_AUTH_URL`) would defeat the purpose of the whole feature. This must be enforced, not just documented.

**Independent Test**: Run a local production build with `SITE_URL` unset, then with `SITE_URL` set to a value with a trailing slash, and confirm both fail with a clear, specific error naming `SITE_URL` and (for the trailing-slash case) the specific rule violated.

**Acceptance Scenarios**:

1. **Given** `SITE_URL` is unset, **When** a production build runs, **Then** the build fails before producing output, with an error message naming `SITE_URL`.
2. **Given** `SITE_URL` is set to a value ending in `/`, **When** a production build runs, **Then** the build fails with an error message stating the trailing-slash rule explicitly.
3. **Given** `SITE_URL` is set to `http://localhost:3000` (no `https`), **When** a production build runs, **Then** validation passes — an `https` scheme is not required.
4. **Given** `SITE_URL` is missing, **When** the build fails, **Then** there is no fallback to `BETTER_AUTH_URL`'s value anywhere in the resulting behavior.

---

### User Story 3 - Document the new variable for future setup (Priority: P3)

As anyone setting up a new environment for this project, I want `SITE_URL` documented in the example environment file with a clear explanation of what it is and how it differs from `BETTER_AUTH_URL`, so I don't have to reverse-engineer the distinction from code.

**Why this priority**: Lowest risk, but necessary so the split this feature introduces doesn't become tribal knowledge.

**Independent Test**: Read `.env.example` with no other context and correctly explain, from the comment alone, what `SITE_URL` is for and why it's separate from `BETTER_AUTH_URL`.

**Acceptance Scenarios**:

1. **Given** a fresh checkout of the repository, **When** a developer opens the example environment file, **Then** `SITE_URL` is listed alongside the other required variables with a comment stating it has no trailing slash and that it is the public site origin used for canonicals, hreflang, Open Graph, and JSON-LD — distinct from `BETTER_AUTH_URL`.

---

### Edge Cases

- `SITE_URL` set to an empty string → treated as missing; build fails naming `SITE_URL`.
- `SITE_URL` set to a non-URL string (e.g. `not-a-url`) → build fails with a "must be a valid URL" style message, consistent with the other four variables.
- `SITE_URL` set to a value with a trailing slash on a non-root path (e.g. `https://omniflowai.net/`) → rejected, per FR-2 below; this is the exact case that would otherwise double a separator (`https://omniflowai.net//about`).
- `SITE_URL` set correctly, but `BETTER_AUTH_URL` missing → build still fails, because `BETTER_AUTH_URL` remains required and unchanged; the two variables are validated independently.
- Development mode (`NODE_ENV !== "production"`) with `SITE_URL` unset → no validation runs (pre-existing behavior for all five variables); public URLs render with `undefined` in them. This is recorded as a known, pre-existing gap and is explicitly not fixed here.
- Deployment ordering: the code that requires `SITE_URL` must not reach a production build before the `SITE_URL` secret exists in that environment, or the build breaks production. This is an operational sequencing requirement, not a code requirement, and is covered under Success Criteria below.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST require a `SITE_URL` configuration value to be present for a production build to succeed. There is no default and no fallback to any other variable.
- **FR-002**: The system MUST reject a `SITE_URL` value that is empty, not a well-formed URL, or ends with a trailing slash. The trailing-slash rejection MUST produce an error message that states the trailing-slash rule explicitly, distinct from the generic "not a valid URL" message.
- **FR-003**: The system MUST NOT require `SITE_URL` to use the `https` scheme. `http://localhost:3000` MUST be accepted as valid.
- **FR-004**: The system MUST continue to require `BETTER_AUTH_URL` as its own independent, required, URL-validated configuration value, with no change to its current validation behavior or its use by the authentication system.
- **FR-005**: Every public-facing URL the site emits — canonical links, hreflang alternates, Open Graph URLs, Twitter card URLs, JSON-LD `url` fields, and the JSON-LD Organization `@id` — MUST be built from `SITE_URL`, not `BETTER_AUTH_URL`.
- **FR-006**: No part of the system other than the single existing site-identity accessor (`lib/site.ts`) may read `SITE_URL` directly; every other consumer continues to go through the existing `siteUrl` export.
- **FR-007**: The example environment file MUST document `SITE_URL` as a required variable, with a comment explaining that it must have no trailing slash and that it is the public site origin used for canonicals, hreflang, Open Graph, and JSON-LD — distinct from `BETTER_AUTH_URL`, which remains documented as-is.
- **FR-008**: When `SITE_URL` is set to the value `BETTER_AUTH_URL` currently holds, the rendered output of every page MUST be byte-identical to the output before this change. This is the safety property that makes the change a pure refactor rather than a behavior change.
- **FR-009**: The rollout MUST set and confirm `SITE_URL` in the production secret store before the code change is deployed, and MUST verify the live site's canonical/hreflang/OG/JSON-LD URLs — plus the full `/sitemap.xml` and `/robots.txt` bodies — against the **PV-2b** baseline (`plan.md`) after deployment. PV-2 is stale and MUST NOT be used for this comparison. A missing `SITE_URL` at deploy time fails the production build, not merely a runtime request, so this ordering is a hard requirement, not a best practice.

### Key Entities

- **Site configuration**: The set of environment-derived values the application depends on at boot. This feature adds one new required member (`SITE_URL`) alongside the four existing ones, without changing how the existing four are validated.
- **Public site identity**: The single logical "base URL" concept consumed everywhere a public, indexable URL is constructed (sitemap, robots, metadata, structured data). After this change, its source is `SITE_URL` instead of `BETTER_AUTH_URL`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of pages sampled (home, about, one article detail, one portfolio detail — each in both languages, 8 pages total) show byte-identical canonical, hreflang, `og:url`, `og:image`, and JSON-LD `@id`/`url` values before and after this change, when `SITE_URL` is set to `BETTER_AUTH_URL`'s prior value.
- **SC-002**: A local production build with `SITE_URL` unset fails 100% of the time, with zero successful builds producing broken (`undefined`-containing) URLs.
- **SC-003**: A local production build with a trailing-slash `SITE_URL` fails 100% of the time, with an error identifying the trailing-slash rule.
- **SC-004**: Authentication (login and logout) continues to work end-to-end against a local production build after the change, with zero regressions attributable to this feature.
- **SC-005**: Post-deployment, the live site's canonical/hreflang/OG/JSON-LD values, plus the full `/sitemap.xml` and `/robots.txt` bodies, match the **PV-2b** baseline (`plan.md`) exactly, confirming the production rollout introduced no observable change.

## Assumptions

- The production value for `SITE_URL` will be `https://omniflowai.net` (no trailing slash), matching the domain PV-2 confirms the live site already uses for every sampled field. This is the value that satisfies FR-008's byte-identical requirement, since PV-3 found no evidence the live site's `BETTER_AUTH_URL` currently resolves to anything else.
- `lib/auth.ts`'s use of `BETTER_AUTH_URL` for Better Auth's own base URL is a legitimate, separate concern and is unaffected by this feature.
- The pre-existing gap where development mode performs no environment validation is out of scope for this feature and is not being fixed here.
- Deployment ordering (setting the secret before deploying the code) is an operational step performed outside this codebase, by whoever operates the Replit deployment; this specification records it as a requirement but does not implement tooling to enforce it.
