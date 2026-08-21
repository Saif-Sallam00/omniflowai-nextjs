# Implementation Plan: Foundation Slice — Phase 0

**Branch**: `001-foundation-slice` | **Date**: 2026-08-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-foundation-slice/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Deploy the technical foundation for the OmniflowAI Next.js 16 rewrite as a new, separate Replit App: a working Next.js 16.3.1 App Router application with the full target Postgres schema (empty), Better Auth 1.6.30 username/password authentication with a bootstrapped admin, `requireAuth()`/`proxy.ts` auth-enforcement plumbing, structured logging, a `/api/health` liveness endpoint, boot-time env validation, and environment-aware search-engine indexing protection — so that Phase 1 (public content) and Phase 2 (admin CRUD) can build directly on ready plumbing instead of re-solving foundation problems.

## Technical Context

**Language/Version**: TypeScript (strict mode) on Node.js 24 (Replit `nodejs-24` module, preferred) with Node 22 as fallback if unavailable at implementation time (FR-1.2, FR-1.3).

**Primary Dependencies**:
- `next@16.3.1` (App Router, stable — research.md item 1)
- `better-auth@1.6.30` (`username` plugin, Drizzle adapter — research.md item 2)
- `drizzle-orm@0.45.2` + `drizzle-kit@0.31.10`
- `@neondatabase/serverless@1.1.0` + `ws@8.21.3` (`drizzle-orm/neon-serverless`, WebSocket driver — research.md item 8)
- `zod` (boot-time env validation, FR-8.3)
- `eslint-config-next` (`core-web-vitals` + TypeScript rules, flat config — research.md item 5)

**Storage**: Neon Postgres (serverless), fresh dedicated project — not a branch of production (FR-2.1). Single `public` schema holding both application tables and Better Auth's `auth_`-prefixed tables (FR-3.7). Pooled connection (`DATABASE_URL`) for runtime, direct/unpooled (`DATABASE_URL_UNPOOLED`) for `drizzle-kit generate` migrations only — never `drizzle-kit push` (FR-2.2–FR-2.4, FR-2.9).

**Testing**: None introduced in Phase 0 by operator decision — no business logic exists yet to warrant Vitest/Playwright. Verification is the quality gate (`tsc --noEmit`, ESLint, `next build`, all zero-error) plus manual operator verification of AC-1–AC-17 against a running instance (research.md, "Item 2"). Test-framework choice deferred to Phase 1/2.

**Target Platform**: Replit Autoscale — a long-lived Node.js process (not edge/serverless functions), standard `next build`/`next start`, no custom server (FR-10.1–FR-10.5).

**Project Type**: web-service — full-stack Next.js App Router application (Server Components, Server Actions, a small number of Route Handlers). Single project, no separate frontend/backend split.

**Performance Goals**: Not applicable at Phase 0 — no public content and no load-bearing traffic exist yet (deferred to later phases). The only Phase 0 performance-adjacent requirement is that `/api/health` must not call the database, keeping liveness checks trivially fast (FR-7.10).

**Constraints**:
- Session TTL 24h, no rolling extension (FR-4.6/FR-4.7).
- `proxy.ts` does cookie-presence-only optimistic redirect; `requireAuth()` inside Server Components/Actions/Route Handlers is the actual security boundary (FR-6.5, FR-6.8).
- Boot MUST fail fast (refuse to start) if any of `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` is missing (FR-8.1, FR-8.3).
- No response bodies in logs; no stack traces in production error responses (FR-9.2, FR-9.3).
- Staging deployment MUST NOT be indexable (`noindex` header + disallow-all `robots.txt`) by default; production indexing requires the explicit `INDEXING_ENABLED=true` flag, never toggled on the reachable staging deployment (FR-11.1–FR-11.7).
- Rate limiting schema exists (`auth_rate_limit`) but MUST NOT be actively enforced in production Phase 0 (FR-4.10–FR-4.12, AC-17).

**Interpretation note on FR-7.9**: the spec's literal text calls for `status`, `version`, and `uptime` fields in the health response. This plan interprets `uptime` as out of scope for the Phase 0 response body: on Replit Autoscale, `process.uptime()` reflects container lifetime, not service lifetime, and would be a misleading liveness signal. The Phase 0 `/api/health` response is `{ status, version }` only. A genuine service-uptime metric, if needed later, requires a different mechanism (e.g., a persisted process-start timestamp reconciled across restarts) and is deferred — not solved by `process.uptime()` here.

**Scale/Scope**: Single admin user, zero content rows across all application tables at Phase 0 completion (FR-3.8). One deployment environment (the new target Replit App) plus local dev. This is a foundation-only slice — no public traffic, no admin CRUD (both out of scope, deferred to Phase 1/2).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Constraint | Status | Notes |
|---|---|---|
| I. Diagnosis Before Solution | PASS | Spec is derived directly from locked decisions 001–012; open items (research.md) resolved via verified npm-registry/docs lookups or explicit operator decision, not assumption. |
| II. Locked Decisions Are Locked | PASS | Next.js 16.x stable, Node LTS, Neon+Drizzle, Better Auth 1.6.x, `auth_` prefix scheme, URL preservation — all match decisions 001–012 and amendments 008.1/008.2/011.1 verbatim. No decision reopened. |
| III. Verify Before Declaring Done | PASS | FR-12 quality gate (`check`/`lint`/`build`) plus AC-1–AC-17 operator verification defined; no batch accepted on implementer self-report. |
| IV. Scope Discipline | PASS | Out-of-scope section explicitly excludes public content, admin CRUD, image upload, sitemap/hreflang, contact form, data migration, rate-limit production enablement, correlation IDs — all deferred with named future phases, not silently added here. |
| V. URL Preservation as Default | N/A (this phase) | Phase 0 ships no public content routes; URL-preservation invariants apply starting Phase 1. |
| VI. Security Is Not Convenience | PASS | Better Auth 1.6.30 (mature library, not reimplemented), scrypt default hashing, `httpOnly`/`secure`/`sameSite` cookies, boot-time secret enforcement, `requireAuth()` as the real boundary (not `proxy.ts`) — all directly specified (FR-4, FR-6, FR-8). |
| VII. Bilingual By Architecture | N/A (this phase) | No public bilingual pages exist yet in Phase 0; `language_enum` and per-row language columns exist in schema now so Phase 1 doesn't need a schema migration to add bilingual support. |
| Runtime constraints (Next.js/Node/TS/ESLint) | PASS | 16.3.1 stable, Node 24/22, strict TS, flat-config ESLint with `core-web-vitals` — matches constitution exactly. |
| Database constraints | PASS | Neon WebSocket driver, pooled/unpooled split, `globalThis` singleton, Drizzle with committed migrations (never `push`), `auth_` prefix — matches constitution exactly. |
| Authentication constraints | PASS | `username` plugin only, default scrypt, 24h TTL no rolling, bootstrap-only admin creation, database-backed rate-limit schema without production enforcement — matches constitution exactly. |
| Deployment & Ops constraints | PASS | Replit Secrets/`.env.local` split, Zod boot validation, dedicated health endpoint independent of DB, structured JSON logging, standard `next start` shutdown — matches constitution exactly. |

**Result**: No violations. Complexity Tracking table below is not needed (left empty per template instruction).

**Post-Phase-1 re-check**: `data-model.md` and `contracts/http-routes.md` (Phase 1 outputs) introduce no new entities, routes, or dependencies beyond what FR-3/FR-4/FR-7 already specified — they formalize the spec's own requirements, nothing more. Constitution Check result stands unchanged: PASS, no violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-foundation-slice/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── http-routes.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/
├── layout.tsx                        # root layout (minimal Phase 0 chrome)
├── page.tsx                          # Phase 0 placeholder home
├── robots.ts                         # environment-aware robots (INDEXING_ENABLED)
├── admin/
│   ├── auth/
│   │   └── page.tsx                  # login page, NOT under (protected)
│   └── (protected)/
│       ├── layout.tsx                # calls requireAuth() before rendering children
│       └── page.tsx                  # admin dashboard + sign-out
└── api/
    ├── health/
    │   └── route.ts                  # GET liveness endpoint, no DB call
    └── auth/
        └── [...auth]/
            └── route.ts              # toNextJsHandler(auth) mount

lib/
├── auth.ts                           # Better Auth instance (FR-4 config)
├── auth-server.ts                    # requireAuth() helper
├── env.ts                            # Zod boot-time env validation
└── db/
    ├── index.ts                      # Drizzle instance, Neon pool, globalThis singleton
    └── schema.ts                     # all target table + enum definitions

scripts/
└── bootstrap-admin.ts                # one-time admin bootstrap (idempotent)

drizzle/
└── 0001_initial.sql                  # initial migration (generated, committed)

proxy.ts                              # optimistic /admin/* redirect (cookie-presence only)
drizzle.config.ts
next.config.ts
eslint.config.mjs
package.json
tsconfig.json
.env.example
.replit
.gitignore
```

**Structure Decision**: Single Next.js App Router project at the repository root (no `src/` wrapper, no separate frontend/backend split — this is one full-stack Next.js application per constitution "one database, direct access from Server Components," P-05). No `tests/` directory in Phase 0 per the Technical Context testing decision; one is introduced in a later phase alongside the first business logic that warrants it. Layout matches FR-13.1 exactly.

## Complexity Tracking

*No violations — Constitution Check above is a clean PASS. Table intentionally omitted per template instruction ("Fill ONLY if Constitution Check has violations that must be justified").*
