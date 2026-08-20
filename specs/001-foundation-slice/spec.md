# Foundation Slice — Phase 0

**Status:** Final (pending approval)
**Version:** 0.2
**Related decisions:** 001–012, amendments 008.1, 008.2, 011.1
**Related exceptions:** EX-01, EX-02

## Overview

Deliver the technical foundation for the OmniflowAI Next.js 16 rewrite: a deployable Replit application running the target architecture at foundation level — no public content, no admin CRUD, but working authentication, database schema, health endpoint, and the shared plumbing that later phases depend on.

The target application deploys as a new Replit App separate from the current production Replit App and connects to a fresh, dedicated Neon Postgres database. The current production application is untouched throughout Phase 0.

## Problem statement

Every subsequent public-content phase (Phase 1) and admin-CRUD phase (Phase 2) requires a working Next.js target application, a database with the target schema, an authentication system with an admin who can log in, and shared plumbing (`requireAuth()`, `proxy.ts`, structured logging, health endpoint, boot validation). Without Phase 0, none of that exists.

Phase 0 exists to make Phase 1 possible without any of the phases-1–5 work needing to also solve foundation problems.

## User stories

### US-1 — Operator can deploy the foundation
As the operator (Saif), I can deploy the target application to a new Replit App and reach it at a `*.replit.app` URL so I can verify the foundation is running.

### US-2 — Operator can bootstrap the admin
As the operator, I can run a one-time bootstrap script that creates the admin user, so I have login credentials for the target application.

### US-3 — Admin can sign in
As an admin, I can navigate to `/admin/auth`, enter my credentials, and reach the admin dashboard, so I can verify authentication works end-to-end.

### US-4 — Admin can sign out
As an admin, I can click a sign-out control on the dashboard and be returned to the login page with my session cleared, so I can verify session termination works.

### US-5 — Operator can verify process health
As the operator, I can request `/api/health` and receive a JSON response confirming the process is running, so I can integrate this with monitoring or manually confirm liveness.

### US-6 — Operator sees clear errors on misconfiguration
As the operator, if I deploy the application without setting a required environment variable, I see a boot-time error naming the missing variable, so I can fix the configuration before diagnosing runtime failures.

### US-7 — Downstream developer inherits ready plumbing
As a developer implementing Phase 1 or Phase 2, I can import a `requireAuth()` helper, define new tables in a schema file, and expect Better Auth to already work — so I don't have to solve foundation problems while building features.

### US-8 — Search engines do not index the staging deployment
As the operator, I can trust that the target Replit deployment is not indexable by search engines before cutover, so its URLs never appear in search results and never compete with production URLs.

## Functional requirements

### FR-1 — Runtime and framework
- FR-1.1: The application MUST use Next.js 16.x stable (not canary, beta, RC, or preview). Exact patch pinned in `package.json` at implementation time.
- FR-1.2: The application MUST run on the current supported Node.js LTS available on Replit. Node 24 preferred; Node 22 as fallback if Node 24 is unavailable on Replit.
- FR-1.3: The Node version MUST be pinned in `package.json` `engines` and in `.replit` `modules`.
- FR-1.4: The application MUST use Next.js App Router (not Pages Router).
- FR-1.5: The application MUST use TypeScript with strict mode enabled.
- FR-1.6: The application MUST deploy as a new Replit App, separate from the current production Replit App.

### FR-2 — Database and ORM
- FR-2.1: The target database MUST be a fresh, dedicated Neon Postgres database (new database or new Neon project). It MUST NOT be a branch derived from the current production database.
- FR-2.2: Two connection strings MUST be configured: `DATABASE_URL` (pooled, hostname contains `-pooler`) and `DATABASE_URL_UNPOOLED` (direct).
- FR-2.3: The application at runtime MUST use `DATABASE_URL` (pooled).
- FR-2.4: Drizzle Kit migrations MUST use `DATABASE_URL_UNPOOLED` (direct).
- FR-2.5: The application MUST use `@neondatabase/serverless` with the WebSocket driver (`ws` package for Node WebSocket support).
- FR-2.6: The Neon connection pool MUST be configured with explicit `max`, `idleTimeoutMillis`, and `connectionTimeoutMillis`. Default `max = 10` unless evidence at implementation time suggests otherwise.
- FR-2.7: The database instance MUST use the `globalThis` singleton pattern to survive Next.js dev-mode HMR without exhausting connections.
- FR-2.8: The application MUST use Drizzle ORM (latest stable at implementation time).
- FR-2.9: Migration files MUST be committed to git under `drizzle/`. The application MUST NOT use `drizzle-kit push` — only `drizzle-kit generate` producing committed migration files, applied manually by the operator.

### FR-3 — Target schema
- FR-3.1: The schema MUST include all target application tables, even those unpopulated in Phase 0:
  - `articles` with columns: `id serial pk`, `translation_group_id uuid not null default gen_random_uuid()`, `language language_enum not null`, `slug text not null`, `title text not null`, `excerpt text not null`, `body text not null`, `cover_image text not null`, `published boolean not null default false`, `published_at timestamptz`, `related_project_id integer references projects(id) on delete set null`, `related_solution text`, `created_at timestamptz not null default now()`, `updated_at timestamptz not null default now()`.
  - `projects` with columns: `id serial pk`, `category text not null`, `is_featured boolean not null default false`, `is_service_showcase boolean not null default false`, `cover_image text not null`, `created_at timestamptz not null default now()`, `updated_at timestamptz not null default now()`.
  - `project_translations` with columns: `id serial pk`, `project_id integer not null references projects(id) on delete cascade`, `language language_enum not null`, `title text not null`, `client text not null`, `description text not null`, `challenge text not null`, `diagnosis text`, `solution text not null`, `results jsonb not null default '[]'`, `tags jsonb not null default '[]'`, `technologies jsonb not null default '[]'`, `created_at timestamptz not null default now()`, `updated_at timestamptz not null default now()`.
  - `leads` with columns: `id serial pk`, `name text`, `email text not null`, `phone text`, `company text`, `service text`, `message text`, `source lead_source_enum not null default 'contact'`, `status lead_status_enum not null default 'new'`, `created_at timestamptz not null default now()`.
- FR-3.2: The schema MUST include Postgres enum types:
  - `language_enum` with values `('en', 'ar')`.
  - `lead_status_enum` with values `('new', 'read', 'archived')`.
  - `lead_source_enum` with values `('contact', 'newsletter')`.
- FR-3.3: The schema MUST include unique constraints:
  - `articles UNIQUE (language, slug)`.
  - `articles UNIQUE (translation_group_id, language)`.
  - `project_translations UNIQUE (project_id, language)`.
- FR-3.4: The schema MUST include indexes:
  - `articles (language, published, published_at desc)`.
  - `articles (translation_group_id)`.
  - `projects (category)`.
  - `projects (is_service_showcase, category)`.
  - `project_translations (project_id)`.
  - `leads (created_at desc)`.
- FR-3.5: The schema MUST include Better Auth's tables, generated via Better Auth's CLI, with `modelName` prefixes applied per configuration:
  - `auth_user`, `auth_session`, `auth_account`, `auth_verification`, `auth_rate_limit`.
- FR-3.6: No PostgreSQL extensions are required. `gen_random_uuid()` is used as a core function.
- FR-3.7: All schema objects MUST live in the default `public` schema.
- FR-3.8: All application tables MUST be empty at end of Phase 0 (no article rows, no project rows, no lead rows). Better Auth tables contain only what is created by bootstrapping the admin and by any admin login/logout activity performed during acceptance verification.

### FR-4 — Authentication (Better Auth)
- FR-4.1: Better Auth MUST be pinned to a stable 1.6.x release (not 1.7 RC/beta). Exact patch pinned in `package.json` at implementation time.
- FR-4.2: Better Auth MUST use the Drizzle adapter for PostgreSQL, sharing the Neon pool from FR-2.
- FR-4.3: `emailAndPassword.enabled` MUST be `true` (required for the username plugin).
- FR-4.4: The `username` plugin MUST be enabled. Username MUST be the product login identifier.
- FR-4.5: Better Auth MUST use its default scrypt password hashing. Custom `hash`/`verify` functions MUST NOT be configured.
- FR-4.6: `session.expiresIn` MUST be `60 * 60 * 24` (24 hours).
- FR-4.7: `session.updateAge` MUST equal `session.expiresIn` (no rolling session extension).
- FR-4.8: `session.cookieCache.enabled` MUST be `false` in Phase 0.
- FR-4.9: The session cookie MUST have `httpOnly: true`, `secure: true` in production, `sameSite: "lax"`.
- FR-4.10: The Better Auth rate-limit schema MUST be configured and the `auth_rate_limit` table MUST be created (storage: `"database"`, `modelName: "auth_rate_limit"`), so no schema migration is required to enable rate limiting later.
- FR-4.11: `rateLimit.enabled` MUST be `false` in the production Phase 0 deployment. Rate limiting production enablement is blocked until the Replit trusted-client-IP source is verified (a Phase 3 prerequisite per Decision 3).
- FR-4.12: Rate limiting MAY be enabled in local development or a controlled staging context ONLY if the client-IP input in that context is well understood. Enabling it in production without trusted-IP verification MUST NOT happen.
- FR-4.13: The only Better Auth plugin enabled MUST be `username()`. No other plugins.
- FR-4.14: Better Auth MUST be mounted at `/api/auth/*` via `toNextJsHandler(auth)`.
- FR-4.15: Better Auth's `modelName` per core config block MUST use the `auth_` prefix scheme:
  - `user: { modelName: "auth_user" }`
  - `session: { modelName: "auth_session" }`
  - `account: { modelName: "auth_account" }`
  - `verification: { modelName: "auth_verification" }`
- FR-4.16: Any Better-Auth-required internal user fields (e.g., name, email if required by the pinned 1.6.x API) MUST be populated with defensible placeholder values by the bootstrap script. Exact resolution of which fields are required and what placeholder values are appropriate is done during `/plan` against the pinned Better Auth 1.6.x docs.

### FR-5 — Admin bootstrap
- FR-5.1: An explicit one-time bootstrap script (`scripts/bootstrap-admin.ts`) MUST exist to create the admin user.
- FR-5.2: The bootstrap script MUST NOT run automatically on application startup.
- FR-5.3: The bootstrap script MUST read `ADMIN_USERNAME` and `ADMIN_PASSWORD` from environment variables.
- FR-5.4: The bootstrap script MUST use Better Auth's supported server API to create the admin (all Better Auth's own hashing, storage, and validation applies). Exact API call verified against pinned 1.6.x docs during `/plan`.
- FR-5.5: The bootstrap script MUST be idempotent: it MUST refuse to create a second admin identity if one exists with the target username, unless a `--force` flag is passed.
- FR-5.6: The bootstrap script MUST exit with clear log messages indicating success ("Admin created") or that an admin already exists ("Admin already exists — no action taken").
- FR-5.7: Application runtime code MUST NOT read `ADMIN_PASSWORD`.
- FR-5.8: `.env.example` MUST document `ADMIN_USERNAME` and `ADMIN_PASSWORD` with a comment noting bootstrap-only use.

### FR-6 — Auth enforcement plumbing
- FR-6.1: `lib/auth.ts` MUST export the Better Auth instance configured per FR-4.
- FR-6.2: `lib/auth-server.ts` (or similar) MUST export a `requireAuth()` helper that reads the session via Better Auth's server API and returns the session, or performs the appropriate server-side redirect to `/admin/auth` when the request is unauthenticated. The exact server-side redirect pattern (e.g., `redirect()` from `next/navigation`) is selected during `/plan`.
- FR-6.3: `proxy.ts` MUST exist at the project root and handle only optimistic auth redirect for `/admin/*` paths.
- FR-6.4: `proxy.ts` MUST explicitly exclude `/admin/auth` and `/admin/auth/*` subpaths from the redirect check to prevent redirect loops.
- FR-6.5: `proxy.ts` MUST NOT validate the session against the database. Cookie-presence check only.
- FR-6.6: `proxy.ts` MUST NOT handle any concerns beyond the `/admin/*` optimistic redirect in Phase 0.
- FR-6.7: `app/admin/(protected)/layout.tsx` MUST be a Server Component that calls `requireAuth()` before rendering any child route. An unauthenticated request to any route under the `(protected)` group MUST redirect to `/admin/auth` via the server-side redirect pattern selected during `/plan`.
- FR-6.8: Authentication enforcement inside route handlers, Server Actions, and Server Components (via `requireAuth()`) is the security boundary. `proxy.ts` is not the security boundary.

### FR-7 — Routes
- FR-7.1: `/admin/auth` (path: `app/admin/auth/page.tsx`) MUST exist, MUST NOT be wrapped by the `(protected)` layout, and MUST render a login form with username and password fields.
- FR-7.2: The login form MUST submit via a Server Action that calls Better Auth's username-signin API (exact call verified at implementation time against Better Auth 1.6.x docs).
- FR-7.3: On successful login, the form MUST redirect to `/admin`.
- FR-7.4: On login failure, the form MUST show a user-friendly inline error message (not a raw HTTP status string).
- FR-7.5: The login form MUST use `useActionState` (React 19) for pending state and error handling. `useFormStatus` MAY be used for nested pending state on the submit button.
- FR-7.6: `/admin` (path: `app/admin/(protected)/page.tsx`) MUST be wrapped by the `(protected)` layout and MUST render a minimal dashboard identifying the logged-in username and including a "Sign out" control.
- FR-7.7: The sign-out control MUST call a Server Action that invokes Better Auth's sign-out API and redirects to `/admin/auth`.
- FR-7.8: `/api/health` (path: `app/api/health/route.ts`) MUST exist as a Route Handler responding to GET.
- FR-7.9: `/api/health` MUST return HTTP 200 with a JSON body containing `status: "ok"`, plus `version` and `uptime` fields.
- FR-7.10: `/api/health` MUST NOT call the database.
- FR-7.11: `/api/health` MUST NOT require authentication.
- FR-7.12: `/api/health` requests MUST NOT be recorded in the main access log (either excluded or logged to a separate low-volume stream).
- FR-7.13: `/` (path: `app/page.tsx`) MUST render a minimal Phase 0 placeholder page identifying it as a foundation deployment and MUST NOT render any real target content. Phase 1 replaces this.

### FR-8 — Configuration and secrets
- FR-8.1: The following environment variables are required in production and MUST cause the process to refuse to start if missing:
  - `DATABASE_URL`
  - `DATABASE_URL_UNPOOLED`
  - `BETTER_AUTH_SECRET`
  - `BETTER_AUTH_URL`
- FR-8.2: The following environment variables are bootstrap-only:
  - `ADMIN_USERNAME`
  - `ADMIN_PASSWORD`
- FR-8.3: Boot-time validation MUST use Zod to validate presence and shape of required variables. Missing required variables MUST cause the process to refuse to start with a specific error naming what is missing.
- FR-8.4: No hardcoded fallback values MUST exist for any security-sensitive configuration (secrets, passwords).
- FR-8.5: `.env.example` MUST document all environment variables with shape but no values. Comments MUST clarify which are bootstrap-only.
- FR-8.6: Development uses `.env.local` (Next.js convention, gitignored). Production uses Replit Secrets.

### FR-9 — Logging and observability
- FR-9.1: HTTP request logging for `/api/*` MUST emit structured JSON to stdout. Fields: timestamp, method, path, status, duration.
- FR-9.2: Response bodies MUST NOT be logged.
- FR-9.3: The top-level error handler MUST return `{ message }` in JSON and MUST NOT include stack traces in production.
- FR-9.4: Request-correlation IDs are NOT required in Phase 0. If the plan surfaces a specific need, they may be added; otherwise defer.

### FR-10 — Deployment shape
- FR-10.1: `.replit` MUST declare Node.js LTS module (24 preferred, 22 fallback).
- FR-10.2: `.replit` MUST configure Autoscale deployment with `build = ["npm", "run", "build"]` and `run = ["npm", "run", "start"]`.
- FR-10.3: `package.json` scripts: `build` runs `next build`; `start` runs `next start -p ${PORT:-3000}`.
- FR-10.4: Port configuration: `localPort = 3000, externalPort = 80`.
- FR-10.5: No custom Node server. `next start` handles all serving including SIGTERM graceful shutdown.
- FR-10.6: No experimental body-size configuration in `next.config.ts` unless implementation-time evidence shows the framework default is insufficient for the Phase 2 5MB image-upload requirement.

### FR-11 — Search engine indexing protection (staging)
- FR-11.1: The Phase 0 deployment (at its `*.replit.app` URL) MUST NOT be indexable by search engines.
- FR-11.2: Indexing protection MUST be environment-aware:
  - When the environment indicates non-production/staging (default), the application MUST emit `X-Robots-Tag: noindex, nofollow` HTTP header on all responses AND serve a `/robots.txt` disallowing all crawlers.
  - When the environment indicates production (via an explicit environment flag whose exact name is chosen during `/plan`), the application MUST emit no such header and MUST serve a production-appropriate `robots.txt`.
- FR-11.3: The default MUST be non-production behavior (safe by default). Production behavior MUST require an explicit environment flag.
- FR-11.4: The staging `/robots.txt` MUST be served with `Disallow: /` for all user agents.
- FR-11.5: The `noindex` header MUST also apply to `/robots.txt` itself.
- FR-11.6: `.env.example` MUST document the production-indexing flag with a comment explicitly stating it MUST NOT be set in staging/foundation deployments.
- FR-11.7: Production indexing behavior MUST be verifiable without exposing the staging deployment to indexing. Verification methods (e.g., local build against the production flag with header inspection, or an automated configuration test) are selected during `/plan`. The publicly reachable staging deployment MUST NOT have the production flag toggled during Phase 0 verification.

### FR-12 — Quality gate
- FR-12.1: The following commands MUST pass with zero errors before Phase 0 is accepted:
  - `npm run check` (TypeScript type check via `tsc --noEmit` or Next.js's built-in type check).
  - `npm run lint` (ESLint using `eslint-config-next/core-web-vitals`).
  - `npm run build` (Next.js production build).
- FR-12.2: `npm run lint` MUST run ESLint explicitly. Next.js 16 `next build` does not run lint automatically; a separate lint step is required.
- FR-12.3: ESLint configuration MUST use the official Next.js flat config with `eslint-config-next/core-web-vitals` and Next.js TypeScript rules. Configuration MUST remain small and close to Next.js defaults.
- FR-12.4: Biome MUST NOT be introduced in Phase 0.

### FR-13 — Directory structure
- FR-13.1: The repository structure MUST follow this baseline (paths relative to repo root):
  - `app/layout.tsx` — root layout (minimal Phase 0 chrome).
  - `app/page.tsx` — Phase 0 placeholder home.
  - `app/robots.ts` (or `app/robots.txt/route.ts`) — environment-aware robots.
  - `app/admin/auth/page.tsx` — login page (not gated).
  - `app/admin/(protected)/layout.tsx` — auth-gated layout.
  - `app/admin/(protected)/page.tsx` — admin dashboard.
  - `app/api/health/route.ts` — health endpoint.
  - `app/api/auth/[...auth]/route.ts` — Better Auth handler mount.
  - `proxy.ts` — optimistic `/admin/*` redirect.
  - `lib/auth.ts` — Better Auth config.
  - `lib/auth-server.ts` — `requireAuth()` helper.
  - `lib/db/index.ts` — Drizzle instance, Neon pool, `globalThis` singleton.
  - `lib/db/schema.ts` — all target table definitions.
  - `lib/env.ts` — Zod boot-time env validation.
  - `scripts/bootstrap-admin.ts` — one-time admin bootstrap.
  - `drizzle/0001_initial.sql` — initial migration.
  - `drizzle.config.ts`
  - `next.config.ts`
  - `eslint.config.js` (flat config)
  - `package.json`, `tsconfig.json`, `.env.example`, `.replit`, `.gitignore`

## Out of scope for Phase 0

The following are explicitly deferred to later phases:

- Any public content page beyond the Phase 0 placeholder (home, about, services, articles, portfolio, contact) — Phase 1.
- Any admin CRUD (articles, projects, leads) — Phase 2.
- Image upload endpoint — Phase 2.
- Sitemap generation, production robots policy, hreflang, per-page metadata beyond Phase 0 — Phase 3.
- Bilingual routing and rendering — Phase 1.
- Contact form and Resend integration — Phase 1.
- **Rate limiting enablement in production** — deferred until Replit trusted-client-IP source is verified (Phase 3 prerequisite). The schema and configuration surface exist in Phase 0; production enablement does not.
- Data migration script from current production database — Phase 4.
- Graceful shutdown customization — uses `next start` defaults.
- `after()` background work — Phase 3 empirical verification.
- Request-correlation IDs — deferred unless a subsequent plan justifies them.

## Assumptions

- Replit supports `nodejs-24` module. Fallback to `nodejs-22` if not.
- Better Auth 1.6.x latest stable at implementation time supports the username plugin, `modelName` overrides, database-backed rate limiting, and Drizzle adapter for Postgres.
- Neon's default account configuration permits the pool sizes specified.
- Replit Autoscale sends SIGTERM on shutdown (confirmed by Replit docs).
- The current production application, running on a separate Replit App, is unaffected by any Phase 0 activity.
- Better Auth 1.6.x's username-plugin flow through its supported server API for user creation returns a valid record that logins can subsequently authenticate against; exact API surface is verified at `/plan`.

## Acceptance criteria

Phase 0 is complete when all of the following are verified by the operator:

1. **AC-1: Deployment.** Target Replit App is deployed to Autoscale and reachable at its `*.replit.app` URL. Current production Replit App unchanged.

2. **AC-2: Health endpoint.** `GET /api/health` returns HTTP 200 with valid JSON containing `status: "ok"`.

3. **AC-3: Boot succeeds with required secrets.** With all required environment variables set, the application boots without errors and serves requests.

4. **AC-4: Boot fails without required secrets.** With any required environment variable missing, the process refuses to start in production and logs a specific error naming the missing variable.

5. **AC-5: Schema applied.** Connecting to the target database shows all tables present (`articles`, `projects`, `project_translations`, `leads`, `auth_user`, `auth_session`, `auth_account`, `auth_verification`, `auth_rate_limit`), all Postgres enums present, all unique constraints present, all indexes present. All application tables are empty (`articles`, `projects`, `project_translations`, `leads` have zero rows).

6. **AC-6: Admin identity created correctly.** After running the bootstrap script:
   - Exactly one `auth_user` row exists with the intended admin username.
   - The Better Auth credential/account relationship for that user exists correctly (e.g., a corresponding `auth_account` row with `providerId` and `accountId` per the pinned 1.6.x conventions verified during `/plan`).
   - Any Better-Auth-required user fields (e.g., name, email if required) are populated with defensible values per FR-4.16.

7. **AC-7: Bootstrap is idempotent.** Rerunning the bootstrap script without `--force` produces no additional admin identity. The script exits cleanly with a message indicating an admin already exists. Row counts in `auth_user` and `auth_account` are unchanged after the second run.

8. **AC-8: Admin can log in.** Submitting the login form with correct credentials at `/admin/auth` redirects to `/admin`. A new session row is created in `auth_session` for that user. The dashboard renders and displays the logged-in username.

9. **AC-9: Admin can log out.** Clicking sign-out on `/admin` redirects to `/admin/auth`. The corresponding `auth_session` row for that session is removed (or invalidated per Better Auth's mechanism verified at `/plan`). A subsequent request to `/admin` with the now-cleared cookie redirects to `/admin/auth`.

10. **AC-10: `requireAuth()` gates protected routes via server-side redirect.** A request to `/admin` without a valid session cookie results in a redirect to `/admin/auth` (via the server-side redirect pattern selected in `/plan`, not via an uncaught error).

11. **AC-11: `proxy.ts` excludes `/admin/auth`.** A direct request to `/admin/auth` without a session cookie renders the login page (no redirect loop).

12. **AC-12: Response bodies not logged.** Inspection of the log stream during a login shows the request logged with method/path/status/duration, but the response body is not present.

13. **AC-13: No password hash in responses.** Inspection of a login response's JSON body confirms no `password`, `hash`, or similar sensitive field is present in the response.

14. **AC-14: Quality gate passes.** `npm run check`, `npm run lint`, `npm run build` all exit with zero errors.

15. **AC-15: Better Auth `modelName` smoke test.** All auth-related DB reads and writes during bootstrap, login, and logout hit `auth_user`, `auth_account`, and `auth_session` — never a hardcoded `user`, `account`, or `session` table. Verified by inspecting DB queries (via Neon's query log, or by confirming absence of a non-prefixed `user` table in the schema and that the flow succeeds).

16. **AC-16: Staging is not indexable.** All HTTP responses from the target deployment include `X-Robots-Tag: noindex, nofollow` (verified by inspecting response headers on `/`, `/admin/auth`, `/api/health`, `/robots.txt`). `GET /robots.txt` returns a robots file with `Disallow: /` for all user agents. **The production-indexing flag MUST NOT be toggled on the staging deployment during verification.** Verification of production-flag behavior is performed separately (e.g., via a local build with the flag set and header inspection, or an automated configuration test) — mechanism selected during `/plan`.

17. **AC-17: Production rate limiting is disabled.** Inspection of the running application confirms Better Auth's rate limiting is not actively enforcing IP-based limits in the production deployment. Schema and configuration for `auth_rate_limit` exist (per AC-5) so enablement in Phase 3 requires no schema change.

## Notes on things Spec Kit `/clarify` will likely ask

- **Exact Next.js 16.x patch to pin.** Deferred to implementation.
- **Exact Better Auth 1.6.x patch to pin.** Deferred to implementation.
- **Exact Better Auth server API calls** for username sign-up (bootstrap), sign-in (login), sign-out (logout), session read, and any credential/account inspection needed for AC-6. Verified against pinned 1.6.x docs during `/plan`.
- **Exact env-var name for production-indexing toggle.** Selected during `/plan`.
- **ESLint flat config file extension** (`.mjs` vs `.js`). From Next.js docs at implementation time.
- **Which Better-Auth user fields require values** (name, email, other). Verified against pinned 1.6.x docs at `/plan`; placeholder-value approach documented per FR-4.16.
- **The exact server-side redirect pattern** for `requireAuth()` (e.g., `redirect()` from `next/navigation` invoked inside the helper, or another supported approach). Selected during `/plan`.
- **The exact production-flag verification mechanism** (local build inspection vs. automated test vs. cutover-preparation check). Selected during `/plan`.
- **Where logs go** — Replit's log viewer during Phase 0; no external log shipping in scope.