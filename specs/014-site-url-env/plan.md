# Implementation Plan: Dedicated `SITE_URL` Environment Variable

**Branch**: `014-site-url-env` | **Date**: 2026-09-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/014-site-url-env/spec.md`

## Summary

Split the site's public-URL identity from the authentication base URL by introducing a new required, validated `SITE_URL` environment variable and pointing `lib/site.ts`'s `siteUrl` export at it instead of at `BETTER_AUTH_URL`. This is a pure refactor: with `SITE_URL` set to `https://omniflowai.net` (the value `BETTER_AUTH_URL` currently resolves to in production — see PV-1 below), every rendered public URL must be byte-identical to current output. `BETTER_AUTH_URL` stays required, unchanged, and keeps serving Better Auth alone (`lib/auth.ts:15`).

## Pre-planning findings carried into this plan

### PV-1 — Production `BETTER_AUTH_URL` value: resolved by inference

Direct read of Replit Secrets is still unavailable to this session and remains a pending operator-verification step. However, the value is derivable without it:

- `siteUrl = env.BETTER_AUTH_URL` (`lib/site.ts:3`, unchanged today).
- Every canonical URL is `siteUrl + path` (`lib/metadata.ts:16`, `buildAbsoluteUrl`).
- The live home-page canonical (PV-2b, below) is `https://omniflowai.net/` — i.e. `siteUrl + "/"`.
- Therefore `siteUrl` — and so `env.BETTER_AUTH_URL` — currently resolves to `https://omniflowai.net` in production.

**Conclusion**: `SITE_URL` MUST be set to `https://omniflowai.net` (no trailing slash) to satisfy the byte-identical requirement (FR-008). Operator confirmation via the Replit Secrets dashboard is still recommended before deploy (see Deployment Sequencing below), but does not block planning — the value is already established by the live, observable output of the current code path.

### PV-2b — Re-captured production baseline (supersedes PV-2)

PV-2 (captured at the Gate 1 specify step) is **stale**: it was captured against a production deployment older than commit `a020336` (Slice 5.5 had not shipped). The operator has since deployed current `master`. **PV-2b, captured 2026-09-03 against the live site after that deploy, is the authoritative baseline for all post-deploy verification in this feature. PV-2 must not be used for that purpose.**

**PV-2b — `https://omniflowai.net/` (EN home)**

| Field | Value |
|---|---|
| canonical | `https://omniflowai.net/` |
| hreflang en | `https://omniflowai.net/` |
| hreflang ar | `https://omniflowai.net/ar` |
| hreflang x-default | `https://omniflowai.net/` |
| og:url | `https://omniflowai.net/` |
| og:image | `https://omniflowai.net/og-default.png` |
| Organization JSON-LD `@id` | `https://omniflowai.net/#organization` |
| Organization JSON-LD `url` | `https://omniflowai.net/` |

**PV-2b — `https://omniflowai.net/about` (EN about)**

| Field | Value |
|---|---|
| canonical | `https://omniflowai.net/about` |
| hreflang en | `https://omniflowai.net/about` |
| hreflang ar | `https://omniflowai.net/ar/about` |
| hreflang x-default | `https://omniflowai.net/about` |
| og:url | `https://omniflowai.net/about` |
| og:image | `https://omniflowai.net/og-default.png` |
| Organization JSON-LD `@id` | `https://omniflowai.net/#organization` |
| Organization JSON-LD `url` | `https://omniflowai.net/` |

**PV-2b — `https://omniflowai.net/sitemap.xml`**: 17 `<url>` entries, all absolute, all under `https://omniflowai.net/...`, no trailing-slash doubling anywhere, `Sitemap:` field present in robots.txt pointing at this same URL. Full body captured in `research.md`.

**PV-2b — `https://omniflowai.net/robots.txt`**: standard rule plus 10 AI-crawler-specific rules, each `Allow: /`, `Disallow: /admin/`, `Disallow: /api/`; trailing `Sitemap: https://omniflowai.net/sitemap.xml`. Full body captured in `research.md`.

**Diff: PV-2b vs PV-2 (attributed to Slice 5.5, not this feature)**:

| Field | PV-2 (stale, pre-5.5) | PV-2b (current) | Attribution |
|---|---|---|---|
| Organization JSON-LD `@id` | absent | `https://omniflowai.net/#organization` | Slice 5.5 (`a020336`) added the standalone Organization node's stable `@id`. |
| Organization JSON-LD `logo` | absent | `{"@type":"ImageObject","url":"https://omniflowai.net/logo.png","width":512,"height":512}` | Slice 5.5. |
| `og:image` | not present in the JSON-LD-only PV-2 capture (PV-2 did not sample this field) | `https://omniflowai.net/og-default.png` | Slice 5.5's default-OG-image fallback. |
| canonical, hreflang, og:url | unchanged (`https://omniflowai.net/`) | unchanged | No difference — confirms the domain itself was already correct pre-5.5, consistent with PV-3's original finding. |

No field regressed; every difference is additive and traces to Slice 5.5. This confirms PV-2b, not PV-2, is the correct post-deploy comparison target for this feature (FR-4.2/SC-005 in spec.md are read against PV-2b).

### Replit Autoscale failed-build behavior — informational only, not on the critical path

Public Replit documentation and community sources do not state definitively whether a previously-deployed Autoscale revision continues serving traffic when a subsequent build fails. This is *informational context*, not a blocking gate: FR-009 already mandates setting and confirming `SITE_URL` in Replit Secrets before the code deploy, which removes the scenario this question was worried about (a `SITE_URL`-caused build failure happening after code ships ahead of the secret). The residual case — a build failing for some unrelated reason — is a pre-existing risk on every deploy this project has ever done and is not introduced or worsened by this feature. No task in this feature depends on answering this question. The operator may optionally confirm the behavior in the Replit dashboard at their convenience, but it does not gate this slice's deploy.

## Technical Context

**Language/Version**: TypeScript (strict), Next.js 16.x (per constitution), Node.js LTS (22/24)

**Primary Dependencies**: Zod (already used in `lib/env.ts` for the existing four variables) — no new dependency added.

**Storage**: N/A — environment configuration only.

**Testing**: Manual quality-gate verification per constitution (`npm run check`, `npm run lint`, `npm run build`) plus the before/after byte-identical comparison defined in quickstart.md. No new automated test infrastructure is introduced; this is boot-time configuration validation, consistent with how the existing four variables are verified today (no unit tests exist for `lib/env.ts`'s current schema either).

**Target Platform**: Replit Autoscale (per constitution), Linux server via `next build`/`next start`.

**Project Type**: Web application (Next.js, single repo) — this feature touches only the environment/configuration layer.

**Performance Goals**: N/A — no runtime performance impact; validation runs once at boot.

**Constraints**: Byte-identical rendered output pre/post change (FR-008/SC-001). No new dependency. No `https` requirement on `SITE_URL` (FR-003). Trailing slash rejected with an explicit message (FR-002). Deployment ordering: secret set and confirmed before code deploy (FR-009).

**Scale/Scope**: 3 files changed (`lib/env.ts`, `lib/site.ts`, `.env.example`). Verification touches 8 HTML pages plus `/sitemap.xml` and `/robots.txt` (10 surfaces total, per Correction 1).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design — no changes.*

- **I. Diagnosis Before Solution** — PASS. PV-1/PV-2b/PV-3/PV-4 are evidence gathered before any design decision; the `SITE_URL` production value is derived from observed behavior, not assumed.
- **II. Locked Decisions Are Locked** — PASS. No locked architectural decision (001–012) is touched. `BETTER_AUTH_URL`'s role in Better Auth (decision 008) is explicitly preserved.
- **III. Verify Before Declaring Done** — PASS (planned). Quality gate (type check, lint, build) plus the byte-identical before/after comparison across all 10 surfaces are the acceptance mechanism; nothing is accepted on implementer say-so.
- **IV. Scope Discipline** — PASS. Expected file list is exactly `lib/env.ts`, `lib/site.ts`, `.env.example`. `lib/auth.ts` (Better Auth's own `BETTER_AUTH_URL` consumer) is explicitly untouched. The Organization `@id`/logo shape question and the three missing `/services/*` pages are explicitly out of scope, unchanged from spec.md.
- **V. URL Preservation as Default (standing rule 002)** — PASS, and this is the feature's core safety property: FR-008 requires byte-identical public URLs. No public URL changes as a result of this feature when `SITE_URL` is set correctly.
- **VI. Security Is Not Convenience** — PASS. `SITE_URL` follows the existing pattern of required-secret-causes-boot-failure (P-13); no silent default or fallback is introduced (FR-002 forbids a fallback to `BETTER_AUTH_URL`).
- **VII. Bilingual By Architecture** — PASS, unaffected. Both language trees continue to resolve through the same `siteUrl` accessor; verification samples both languages for every HTML surface.

No violations. Complexity Tracking table is empty (not needed).

## Project Structure

### Documentation (this feature)

```text
specs/014-site-url-env/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created by this gate)
```

No `contracts/` directory: this feature has no external interface (API, CLI surface, or UI contract) of its own — it changes an internal configuration source consumed entirely within this codebase. The nearest thing to an external contract is the set of rendered public URLs (canonical/hreflang/OG/JSON-LD/sitemap/robots), which is fully specified by the byte-identical requirement in `quickstart.md` rather than a separate contracts file.

### Source Code (repository root)

```text
lib/
├── env.ts     # MODIFIED — add SITE_URL to envSchema: required, URL-validated,
│              # trailing-slash rejected with an explicit rule-naming message.
│              # BETTER_AUTH_URL entry unchanged.
├── site.ts    # MODIFIED — siteUrl reads env.SITE_URL instead of env.BETTER_AUTH_URL.
│              # DEFAULT_OG_IMAGE_PATH and LOGO_PATH unchanged.
└── auth.ts    # UNCHANGED — still reads env.BETTER_AUTH_URL for Better Auth's baseURL.
               # Listed here only to make explicit what is NOT touched.

.env.example   # MODIFIED — document SITE_URL alongside the existing four variables,
               # with a comment stating the no-trailing-slash rule and its purpose
               # (canonicals/hreflang/OG/JSON-LD), distinct from BETTER_AUTH_URL.
```

No other file is modified. Every other `siteUrl` consumer (`app/robots.ts`, `app/sitemap.ts`, `lib/metadata.ts`, `lib/structured-data.ts`, per PV-4) requires no code change — they already import `siteUrl` from `lib/site.ts` and are unaffected by where that export's value comes from.

**Structure Decision**: Single Next.js application, no new modules or directories. The three-file change list matches the "Expected file list" constraint exactly; `lib/auth.ts` is documented as an explicit non-change, not a scope addition.

## Complexity Tracking

*Not applicable — no Constitution Check violations.*
