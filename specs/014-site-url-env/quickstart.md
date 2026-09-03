# Quickstart: Validating the `SITE_URL` Environment Variable Change

This is a validation guide, not an implementation guide. It assumes the changes described in `plan.md`'s Project Structure (`lib/env.ts`, `lib/site.ts`, `.env.example`) have been made.

## Prerequisites

- Local checkout with `.env.local` configured for the other four required variables.
- Node/npm installed per `package.json` `engines`.

## Step 1 — Capture the "before" baseline (unmodified code)

Per FR-4.3, this MUST happen before any file is edited.

```bash
git stash        # if any WIP exists — ensure a clean, unmodified tree
npm run build && npm start &
```

For each of the following 10 surfaces, capture the exact rendered output:

- `/` (en home), `/ar` (ar home)
- `/about` (en), `/ar/about` (ar)
- one EN article detail page, its AR counterpart
- one EN portfolio detail page, its AR counterpart
- `/sitemap.xml` — full body
- `/robots.txt` — full body

For each HTML page, record: `<link rel="canonical">`, both hreflang alternates, `og:url`, `og:image`, and the standalone Organization JSON-LD `@id` and `url`. Save all 10 outputs to files for diffing (e.g. `before/home-en.html`, `before/sitemap.xml`, ...).

Stop the server; restore any stashed WIP.

## Step 2 — Apply the code change

Make the changes described in `plan.md`: add `SITE_URL` to `lib/env.ts`, point `lib/site.ts`'s `siteUrl` at it, document it in `.env.example`.

**Set `SITE_URL=http://localhost:3000` in `.env.local` for this local comparison — the exact value local `BETTER_AUTH_URL` already holds.** This is not optional and not one of two equivalent choices: Step 1's "before" baseline was captured with `siteUrl = env.BETTER_AUTH_URL = http://localhost:3000` (the value already in `.env.local`), so the "after" build must produce `siteUrl` from the same value for the diff to test what it claims to test. **Setting `SITE_URL=https://omniflowai.net` here is a test-design error, not an alternative configuration** — it would change every URL on every one of the 10 surfaces, every diff in Step 3 would fail, and the byte-identical comparison would prove nothing about the refactor's correctness. The production value belongs only in Replit Secrets and is checked separately, against the live site, in Step 7.

## Step 3 — Capture the "after" output and diff

```bash
npm run build && npm start &
```

With `SITE_URL=http://localhost:3000` (same as Step 2 — do not use the production value here), re-fetch the same 10 surfaces into `after/...`, back-to-back with Step 1's capture (minimize the time between the two captures — see the `<lastmod>` caveat below). Diff every pair:

```bash
diff before/home-en.html after/home-en.html
diff before/sitemap.xml after/sitemap.xml
diff before/robots.txt after/robots.txt
# ...repeat for all 10
```

**Expected result**: zero diffs across all 10 surfaces (FR-008/SC-001). Any diff is a defect — stop and investigate before proceeding, **except** the `<lastmod>` caveat immediately below, which is a known, non-defect source of diff noise specific to `/sitemap.xml`.

**`<lastmod>` caveat**: `/sitemap.xml`'s `<lastmod>` values are derived from each article/project's DB row, not from `SITE_URL`. If any content is edited (published, updated) between the before and after captures, the corresponding `<lastmod>` will legitimately differ even though nothing this feature touches has changed. To avoid this: capture Step 1 and Step 3 back-to-back, with no content edits in between. If a `<lastmod>` diff appears anyway, confirm whether a content edit occurred in that window before concluding it's a regression — a `<lastmod>`-only diff with a confirmed content edit is not a failure of this feature; any diff outside `<lastmod>`, or a `<lastmod>` diff with no corresponding content edit, is.

## Step 4 — Verify fail-fast behavior (FR-6.2/SC-002, SC-003)

```bash
# Missing SITE_URL
unset SITE_URL   # or comment it out of .env.local
npm run build
# Expected: build fails, exit code 1, error output names "SITE_URL"
```

```bash
# Trailing slash
SITE_URL="https://omniflowai.net/" npm run build
# Expected: build fails, error output states the trailing-slash rule explicitly
```

```bash
# http scheme accepted
SITE_URL="http://localhost:3000" npm run build
# Expected: build succeeds (scheme is not restricted, per FR-003)
```

Restore `SITE_URL=https://omniflowai.net` afterward.

## Step 5 — Verify authentication is unaffected (SC-004)

With the build from Step 3 running (`npm start`), exercise a full login and logout cycle through Better Auth. Expected: no behavior change, since `lib/auth.ts:15` still reads `env.BETTER_AUTH_URL`, untouched by this feature.

## Step 6 — Quality gate

```bash
npm run check
npm run lint
npm run build
```

All three MUST exit zero (FR-6.1).

## Step 7 — Deployment sequencing (FR-009 / FR-5.1–FR-5.4 in the source spec)

Before deploying the code change:

1. Set `SITE_URL=https://omniflowai.net` in Replit Secrets for the production deployment.
2. Confirm it is visible to the deployment (redeploy a no-op or check the Replit Secrets panel reflects it for the target deployment).
3. Deploy the code change.
4. Verify the live site: re-fetch `https://omniflowai.net/`, `https://omniflowai.net/about`, `https://omniflowai.net/sitemap.xml`, `https://omniflowai.net/robots.txt` and confirm every field matches **PV-2b** (in `plan.md`) exactly — not PV-2, which is stale. Any mismatch is a defect. Apply the same `<lastmod>` caveat as Step 3 if `/sitemap.xml` differs only in that field.

**Optional, informational, not blocking**: whether a previously-deployed Autoscale revision keeps serving when a build fails is unresolved from public documentation (see `plan.md`). Steps 1–2 above already remove the specific scenario this would matter for (a `SITE_URL`-caused failure from deploying code ahead of the secret). The operator may confirm the general behavior in the Replit dashboard at their convenience; it does not gate this deploy.

## Success criteria mapping

| Step | Spec criteria verified |
|---|---|
| 1–3 | FR-008, SC-001 |
| 4 | FR-002, FR-003, SC-002, SC-003 |
| 5 | SC-004 |
| 6 | (constitution Quality Gate) |
| 7 | FR-009, SC-005 |
