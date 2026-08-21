# HTTP Contracts: Foundation Slice — Phase 0

This is a full-stack Next.js App Router application, not an API-first service — most "contracts" are page routes rendered server-side plus Server Actions invoked from forms, with a small number of true HTTP endpoints. Documented per FR-7 and FR-11.

---

## `GET /`

**Handler**: `app/page.tsx` (Server Component)
**Auth**: none required
**Response**: minimal Phase 0 placeholder HTML page identifying the deployment as a foundation build. No real target content (FR-7.13).
**Indexing headers**: `X-Robots-Tag: noindex, nofollow` unless `INDEXING_ENABLED=true` (FR-11.2).

---

## `GET /admin/auth`

**Handler**: `app/admin/auth/page.tsx` (Server Component, NOT under `(protected)`)
**Auth**: none required — must remain reachable when unauthenticated (FR-6.4, AC-11)
**Response**: login form (username, password fields).
**Indexing headers**: `X-Robots-Tag: noindex, nofollow` unless `INDEXING_ENABLED=true`.

## `POST /admin/auth` (Server Action — form submission)

**Handler**: inline Server Action in `app/admin/auth/page.tsx`, calling Better Auth's `signIn.username` equivalent (research.md item 3)
**Request**: `{ username: string, password: string }` (form fields)
**Success**: redirects to `/admin` (FR-7.3), new `auth_session` row created (AC-8)
**Failure**: no redirect; form re-renders with a user-friendly inline error (FR-7.4) — not a raw HTTP status string
**State handling**: `useActionState` for pending/error state (FR-7.5)

---

## `GET /admin` (protected)

**Handler**: `app/admin/(protected)/page.tsx`, wrapped by `app/admin/(protected)/layout.tsx`
**Auth**: required — `requireAuth()` called in the layout before any child renders (FR-6.7)
**Unauthenticated behavior**: server-side redirect to `/admin/auth` via `redirect()` from `next/navigation` (research.md item 6), not an uncaught error (AC-10)
**Authenticated response**: minimal dashboard showing the logged-in username and a "Sign out" control (FR-7.6)
**Indexing headers**: `X-Robots-Tag: noindex, nofollow` unless `INDEXING_ENABLED=true`.

## `POST /admin` (Server Action — sign-out)

**Handler**: inline Server Action on the dashboard, calling Better Auth's sign-out API
**Effect**: invalidates the current `auth_session` row (or Better Auth's equivalent invalidation mechanism), then redirects to `/admin/auth` (FR-7.7, AC-9)

---

## `ANY /api/auth/*`

**Handler**: `app/api/auth/[...auth]/route.ts`, mounted via `toNextJsHandler(auth)` (FR-4.14)
**Auth**: N/A — this IS the auth system's own endpoint surface (session issuance, sign-in, sign-out, etc.), delegated entirely to Better Auth's internal routing
**Contract**: whatever Better Auth 1.6.30 exposes under its handler; not independently specified by this project beyond the mount point and plugin configuration (FR-4.1–FR-4.16)
**Logging**: structured JSON per FR-9.1 (method, path, status, duration); response bodies not logged (FR-9.2, AC-12) — relevant since credential exchanges happen here

---

## `GET /api/health`

**Handler**: `app/api/health/route.ts`
**Auth**: none required (FR-7.11)
**Database**: MUST NOT be called (FR-7.10) — liveness only, not readiness
**Response**: `200 OK`, JSON body:
```json
{ "status": "ok", "version": "<string>" }
```
**Deviation from spec FR-7.9's literal text**: `uptime` is intentionally omitted — see plan.md § Technical Context, "Interpretation note on FR-7.9" (Replit Autoscale `process.uptime()` reflects container, not service, lifetime and would mislead).
**Logging**: excluded from the main access log or routed to a separate low-volume stream (FR-7.12)
**Indexing headers**: not applicable — health checks aren't page content, but if `noindex` middleware applies globally it's harmless here.

---

## `GET /robots.txt`

**Handler**: `app/robots.ts` (or `app/robots.txt/route.ts` — implementation choice)
**Auth**: none required
**Behavior — non-production (default, `INDEXING_ENABLED` unset)**:
```
User-agent: *
Disallow: /
```
Also carries `X-Robots-Tag: noindex, nofollow` on the `/robots.txt` response itself (FR-11.5).

**Behavior — production (`INDEXING_ENABLED=true`)**: production-appropriate `robots.txt` (real crawl rules); no `X-Robots-Tag` header.

**Verification**: per research.md item 7 — local build/curl only; the reachable staging deployment never has `INDEXING_ENABLED=true` during Phase 0 (AC-16).

---

## Error contract (all routes)

Per FR-9.3: the top-level error handler returns `{ "message": string }` as JSON. No stack traces in production responses.
