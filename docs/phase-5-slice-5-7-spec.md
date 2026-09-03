# Phase 5 — Slice 5.7: Dedicated `SITE_URL` Environment Variable

**Status:** Draft (pending operator approval)
**Version:** 0.1
**Related:** Constitution v1.0.0 (§ Deployment & Ops — "No silent security-sensitive defaults"; P-13 fail-fast). Follows Slice 5.5 (`a020336`).

## Overview

`lib/site.ts` currently derives the site's public URL from an authentication variable:

```ts
export const siteUrl = env.BETTER_AUTH_URL;
```

Every canonical URL, hreflang alternate, Open Graph URL, Twitter card URL, JSON-LD `url`, the Organization `@id`, and both absolute asset URLs introduced in Slice 5.5 therefore depend on `BETTER_AUTH_URL`. The site is live in production, so this coupling is now an active risk rather than a latent one: any future change to `BETTER_AUTH_URL` made for an authentication reason silently rewrites every public SEO surface on the site.

This slice introduces a dedicated `SITE_URL` variable, points `siteUrl` at it, and leaves `BETTER_AUTH_URL` to its own job.

## Problem statement

Two unrelated concerns share one variable:

1. **Authentication** — Better Auth uses `BETTER_AUTH_URL` to construct callback and cookie-domain behavior.
2. **Public site identity** — every indexable URL the site emits.

These change for different reasons, on different schedules, under different risk profiles. A value that is correct for auth is not necessarily correct for canonicals, and vice versa. Separating them costs one environment variable and removes a category of silent failure.

## Pre-work verification (blocking — run before any code change)

**PV-1:** Determine the current production value of `BETTER_AUTH_URL` in Replit Secrets.

**PV-2:** Fetch the live production home page (`https://omniflowai.net/`) and record the exact values of: `<link rel="canonical">`, both `hreflang` alternates, `og:url`, and the Organization JSON-LD `@id` and `url`.

**PV-3:** If those values point at anything other than `https://omniflowai.net` — for example the `*.replit.app` deployment URL — **stop and report before proceeding.** That would mean the live site is currently advertising the wrong canonical domain to search engines, which is a production SEO defect that changes this slice's priority and scope. Do not silently "fix" it as part of this refactor.

**PV-4:** Repo-wide grep (every directory, not only `app/` and `lib/`) for `BETTER_AUTH_URL` and for `siteUrl`. Record every consumer with `file:line`. The purpose is to confirm that `lib/site.ts` is the only place `BETTER_AUTH_URL` is used for URL construction, and to enumerate everything that will change behavior if `siteUrl`'s source changes.

PV-4 exists because Slice 5.5's Gate 2 verification grepped only `app/` and `lib/`, missed `components/site-shell.tsx`, and produced a verified fact that later had to be retracted (see `docs/decision-015-organization-jsonld-single-emission.md`).

## Functional requirements

### FR-1 — Environment schema

- **FR-1.1:** `lib/env.ts` MUST add `SITE_URL` to `envSchema` as a required variable.
- **FR-1.2:** `SITE_URL` MUST be validated as a non-empty, well-formed URL, using the same message style as the existing four variables.
- **FR-1.3:** `SITE_URL` MUST be rejected if it ends with a trailing slash. A trailing slash produces doubled separators (`https://omniflowai.net//about`) in every absolute URL the site emits, silently corrupting every canonical. The validation error message MUST state the trailing-slash rule explicitly.
- **FR-1.4:** `SITE_URL` MUST NOT require an `https` scheme. Local production-build verification runs against `http://localhost:3000`, and blocking that would make the slice unverifiable locally.
- **FR-1.5:** `BETTER_AUTH_URL` MUST remain in the schema, required, with its current validation unchanged.

### FR-2 — Site URL source

- **FR-2.1:** `lib/site.ts` MUST change `siteUrl` to read `env.SITE_URL`.
- **FR-2.2:** No fallback to `BETTER_AUTH_URL` may be introduced. A fallback would conceal exactly the misconfiguration this slice exists to surface, and the constitution forbids silent defaults for configuration that matters.
- **FR-2.3:** `DEFAULT_OG_IMAGE_PATH` and `LOGO_PATH` in `lib/site.ts` MUST remain unchanged.
- **FR-2.4:** No other file may read `SITE_URL` directly. `lib/site.ts` remains the single consumer, and everything else continues to import `siteUrl` from it.

### FR-3 — Documentation

- **FR-3.1:** `.env.example` MUST document `SITE_URL` with shape but no value, alongside the existing required variables.
- **FR-3.2:** The `.env.example` entry MUST carry a comment stating that the value has no trailing slash and that it is the public site origin used for canonicals, hreflang, Open Graph, and JSON-LD — distinct from `BETTER_AUTH_URL`.

### FR-4 — Output identity (the core safety property)

- **FR-4.1:** When `SITE_URL` is set to the same value `BETTER_AUTH_URL` currently holds, the rendered output of every page MUST be byte-identical to the pre-change output. This is a pure refactor; any observable difference is a defect.
- **FR-4.2:** Verification MUST be a before/after comparison of the actual emitted values on at least: EN home, AR home, EN about, AR about, one EN article detail page, one AR article detail page, one EN portfolio detail page, one AR portfolio detail page. For each, capture `<link rel="canonical">`, both hreflang alternates, `og:url`, `og:image`, and the standalone Organization JSON-LD `@id` and `url`.
- **FR-4.3:** The "before" capture MUST be taken from a production build (`npm run build && npm start`) on unmodified code, before any file is edited. A baseline captured after the change is worthless.

### FR-5 — Deployment ordering (production-risk control)

The site is live. `lib/env.ts` calls `process.exit(1)` on validation failure, and `NODE_ENV=production` during `next build`, so a missing `SITE_URL` fails the **build**, not merely the runtime.

- **FR-5.1:** `SITE_URL` MUST be added to Replit Secrets and confirmed present **before** the code change is deployed.
- **FR-5.2:** The deployment sequence MUST be: (1) set the Replit Secret, (2) confirm it is visible to the deployment, (3) deploy the code change, (4) verify the live site. No step may be merged or reordered.
- **FR-5.3:** The behavior of a failed Replit Autoscale build MUST be confirmed before deploying — specifically, whether the previously deployed revision continues serving when a new build fails. This determines whether a mistake here is a degraded deploy or an outage.
- **FR-5.4:** Post-deploy verification MUST re-run the FR-4.2 checks against the live production site and confirm the values match the PV-2 baseline.

### FR-6 — Quality gate

- **FR-6.1:** `npm run check`, `npm run lint`, and `npm run build` MUST all exit zero.
- **FR-6.2:** The build MUST be run locally with `SITE_URL` deliberately unset at least once, to confirm it fails fast with an error naming `SITE_URL` rather than producing a build with broken URLs.

## Recorded behavior — not fixed in this slice

**Development mode performs no environment validation.** `lib/env.ts` parses only when `NODE_ENV === "production"`; otherwise it casts `process.env` directly. In development, a missing `SITE_URL` yields `undefined`, and canonical URLs silently render as `undefined/about` rather than failing.

This affects all five variables equally and is pre-existing behavior, not something this slice introduces. It is recorded here so it is a known gap rather than a surprise. Extending validation to development is a separate decision with its own blast radius across local workflows, and is explicitly out of scope.

Local verification for this slice is unaffected: `npm run build && npm start` sets `NODE_ENV=production`, so validation does fire during verification.

## Out of scope

- Extending environment validation to development mode.
- Any change to `BETTER_AUTH_URL`'s value, validation, or usage by Better Auth.
- The Organization JSON-LD `@id` / per-language `url` shape question logged at the close of Slice 5.5.
- The three missing `/services/*` detail pages.
- Internal-link checking and full-repo-grep additions to the quality gate (separate slice).
- Every item on the Phase 5 postponed list.

## Acceptance criteria

1. **AC-1:** PV-1 through PV-4 completed and reported, including the full grep results with `file:line` and the live production canonical values.
2. **AC-2:** `SITE_URL` is present in `envSchema` as required, URL-validated, and rejects a trailing slash with a message naming the rule.
3. **AC-3:** `lib/site.ts` reads `env.SITE_URL`, with no fallback to `BETTER_AUTH_URL` anywhere in the codebase.
4. **AC-4:** `BETTER_AUTH_URL` remains required and unchanged; Better Auth login and logout still work end-to-end against a local production build.
5. **AC-5:** A local production build with `SITE_URL` unset fails with an error naming `SITE_URL`.
6. **AC-6:** `.env.example` documents `SITE_URL` with the trailing-slash and purpose comments.
7. **AC-7:** The FR-4.2 before/after comparison shows byte-identical values across all eight pages when `SITE_URL` matches the previous `BETTER_AUTH_URL` value.
8. **AC-8:** `npm run check`, `npm run lint`, `npm run build` all exit zero.
9. **AC-9:** `git diff --stat` shows only `lib/env.ts`, `lib/site.ts`, and `.env.example` changed. Any other changed file is scope drift and must be reported before commit.
10. **AC-10:** The Replit Secret is confirmed set before deploy, and post-deploy verification confirms the live site's canonical, hreflang, Open Graph, and JSON-LD URLs match the PV-2 baseline exactly.

## Open question for the operator

**What value should `SITE_URL` hold in production?** The answer follows from PV-1/PV-2/PV-3. If the live canonicals already read `https://omniflowai.net`, `SITE_URL` takes that same value and the change is output-neutral as FR-4.1 requires. If they read something else, that is a separate production defect to decide on before this slice proceeds.
