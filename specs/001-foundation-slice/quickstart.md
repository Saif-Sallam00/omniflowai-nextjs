# Quickstart: Foundation Slice — Phase 0

Validation guide for confirming Phase 0 is complete. Maps to `spec.md` Acceptance Criteria AC-1 through AC-17. See `data-model.md` for schema details and `contracts/http-routes.md` for route behavior — not duplicated here.

## Prerequisites

- A fresh, dedicated Neon Postgres project/database (FR-2.1) — not a branch of production.
- Two connection strings from that Neon project: pooled (`DATABASE_URL`) and unpooled/direct (`DATABASE_URL_UNPOOLED`).
- A new Replit App, separate from the production Replit App (FR-1.6).
- Node 24 available as a Replit module (fallback: Node 22) — verify at implementation time (research.md item 1 / spec assumption).

## Setup

1. **Configure secrets** (Replit Secrets in the target deployment; `.env.local` for local dev):
   ```
   DATABASE_URL=<pooled Neon connection string>
   DATABASE_URL_UNPOOLED=<direct Neon connection string>
   BETTER_AUTH_SECRET=<random secret>
   BETTER_AUTH_URL=<deployment URL, e.g. https://<app>.replit.app>
   ADMIN_USERNAME=<bootstrap-only>
   ADMIN_PASSWORD=<bootstrap-only>
   # INDEXING_ENABLED left unset — staging default
   ```

2. **Generate and apply migrations** (drizzle-kit against `DATABASE_URL_UNPOOLED`, per FR-2.4):
   ```
   npx drizzle-kit generate
   # review the generated SQL under drizzle/, then apply manually
   ```

3. **Run the quality gate**:
   ```
   npm run check   # tsc --noEmit
   npm run lint    # eslint-config-next/core-web-vitals
   npm run build   # next build
   ```
   All three MUST exit zero (AC-14).

4. **Bootstrap the admin** (one-time, not run on startup — FR-5.2):
   ```
   npx tsx scripts/bootstrap-admin.ts
   ```
   Expect: `Admin created`. Re-running without `--force` should print `Admin already exists — no action taken` and leave `auth_user`/`auth_account` row counts unchanged (AC-7).

5. **Deploy** to the target Replit App (Autoscale) and confirm it's reachable at its `*.replit.app` URL (AC-1). Confirm the production Replit App is untouched.

## Verification steps (map to Acceptance Criteria)

| Check | Command / Action | Expected (AC) |
|---|---|---|
| Health endpoint | `curl -i https://<app>.replit.app/api/health` | `200`, JSON `status: "ok"` with `version` (`uptime` intentionally omitted — see plan.md "Interpretation note on FR-7.9") (AC-2) |
| Boot with all secrets | Deploy with all four required env vars set | Boots, serves requests (AC-3) |
| Boot without a secret | Temporarily unset one required var, attempt boot | Process refuses to start; log names the missing variable (AC-4) |
| Schema applied | Connect to the target DB (`psql` or Neon console) | All 9 tables present, enums present, unique constraints present, indexes present; `articles`/`projects`/`project_translations`/`leads` have 0 rows (AC-5) |
| Admin created correctly | Inspect `auth_user`/`auth_account` after bootstrap | Exactly one `auth_user` row for the admin username; matching `auth_account` row with `providerId = "credential"` (AC-6) |
| Bootstrap idempotent | Re-run `scripts/bootstrap-admin.ts` without `--force` | No new row; clean exit message (AC-7) |
| Admin login | Submit correct credentials at `/admin/auth` | Redirects to `/admin`; new `auth_session` row; dashboard shows username (AC-8) |
| Admin logout | Click "Sign out" on `/admin` | Redirects to `/admin/auth`; session row removed/invalidated; subsequent `/admin` request redirects again (AC-9) |
| `requireAuth()` gate | `curl -i https://<app>.replit.app/admin` with no session cookie | Redirect to `/admin/auth`, not an uncaught error (AC-10) |
| `proxy.ts` excludes login | `curl -i https://<app>.replit.app/admin/auth` with no cookie | Renders login page, no redirect loop (AC-11) |
| Response bodies not logged | Inspect Replit log stream during a login | Method/path/status/duration present; response body absent (AC-12) |
| No password leakage | Inspect the login response JSON body | No `password`/`hash`/similar field present (AC-13) |
| Quality gate | `npm run check && npm run lint && npm run build` | All exit zero (AC-14) |
| `modelName` smoke test — behavior | Inspect DB queries during bootstrap/login/logout (Neon query log) | Only `auth_user`/`auth_account`/`auth_session` touched, never bare `user`/`account`/`session` (AC-15) |
| `modelName` smoke test — schema | `SELECT tablename FROM pg_tables WHERE schemaname = 'public';` against the target DB | No non-prefixed `user`, `session`, `account`, or `verification` tables exist — only the `auth_`-prefixed versions (`auth_user`, `auth_session`, `auth_account`, `auth_verification`) (AC-15) |
| Staging not indexable (deployed) | `curl -i` against `/`, `/admin/auth`, `/api/health`, `/robots.txt` on the **staging** deployment (`INDEXING_ENABLED` left unset there — never toggled) | `X-Robots-Tag: noindex, nofollow` present on all; `GET /robots.txt` returns `Disallow: /` (AC-16) |
| Production-flag behavior (local only, per FR-11.7) | Locally: `INDEXING_ENABLED=true npm run build && INDEXING_ENABLED=true npm start`, then `curl -i` against the same routes on `localhost`; confirm `X-Robots-Tag` is absent and `/robots.txt` permits crawling. **Stop the local process afterward.** | Confirms production behavior works, without ever exposing it — `INDEXING_ENABLED=true` is never set on the reachable staging deployment (AC-16, FR-11.7) |
| Rate limiting disabled in prod | Inspect `lib/auth.ts`: confirm the `rateLimit` config either sets `enabled: false` directly for the production Phase 0 deployment, or is guarded by an environment condition that evaluates to `false` in production | No active IP-based rate enforcement; `auth_rate_limit` table exists and is ready for Phase 3 enablement (AC-17) |

## Done when

All 17 acceptance criteria above are verified by the operator against the deployed target application. See `spec.md` § Acceptance Criteria for the authoritative list.
