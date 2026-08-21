---

description: "Task list template for feature implementation"
---

# Tasks: Foundation Slice — Phase 0

**Input**: Design documents from `/specs/001-foundation-slice/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/http-routes.md, quickstart.md — all present and read.

**Tests**: Not included. Per plan.md's Technical Context testing decision (operator directive), no test framework is introduced in Phase 0 — there is no business logic yet to warrant Vitest/Playwright. Verification is the quality gate (`tsc`/`eslint`/`next build`) plus manual acceptance-criteria verification, captured as explicit tasks below and detailed in `quickstart.md`.

**Organization**: Tasks are grouped by user story (US1–US8, from `spec.md`, in the priority order the spec itself presents them — deploy → bootstrap → sign-in → sign-out → health → boot errors → downstream plumbing → indexing protection) to enable independent implementation and testing of each story. **This grouping is a sequencing convenience, not a partial-delivery plan** — see § Implementation Strategy.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US8)
- File paths below follow the layout fixed in `plan.md` § Project Structure — a single Next.js App Router project at the repository root (no `src/` wrapper).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and tooling, matching the pinned versions from `plan.md` § Technical Context and `research.md`.

- [ ] T001 Create `package.json` at repo root: name, `engines.node` per FR-1.3 (24 preferred, 22 fallback), and pinned dependencies `next@16.3.1`, `better-auth@1.6.30`, `drizzle-orm@0.45.2`, `@neondatabase/serverless@1.1.0`, `ws@8.21.3`, `zod`; devDependencies `drizzle-kit@0.31.10`, `eslint-config-next`, TypeScript (research.md items 1, 2, 8)
- [ ] T002 [P] Create `tsconfig.json` at repo root with TypeScript strict mode enabled (FR-1.5)
- [ ] T003 [P] Create `eslint.config.mjs` at repo root: flat config using `eslint-config-next/core-web-vitals` and Next.js TypeScript rules, kept close to defaults (FR-12.3, research.md item 5)
- [ ] T004 [P] Create `next.config.ts` at repo root — no experimental body-size configuration in Phase 0 (FR-10.6)
- [ ] T005 [P] Create `.replit` at repo root: Node.js LTS module (`nodejs-24` preferred, `nodejs-22` fallback), Autoscale deployment with `build = ["npm", "run", "build"]` / `run = ["npm", "run", "start"]`, `localPort = 3000` / `externalPort = 80` (FR-10.1, FR-10.2, FR-10.4)
- [ ] T006 [P] Create `.gitignore` at repo root (`node_modules`, `.next`, `.env.local`, etc.)
- [ ] T007 [P] Create `.env.example` at repo root documenting shape (no values) for `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (required), `ADMIN_USERNAME`/`ADMIN_PASSWORD` (comment: bootstrap-only, FR-5.8), and `INDEXING_ENABLED` (comment: MUST NOT be set in staging/foundation deployments, FR-11.6) (FR-8.5)
- [ ] T008 Add `build`/`start`/`check`/`lint`/`dev` scripts to `package.json`: `build` runs `next build`, `start` runs `next start -p ${PORT:-3000}`, `check` runs `tsc --noEmit`, `lint` runs `eslint` explicitly (FR-10.3, FR-12.1, FR-12.2) — depends on T001
- [ ] T009 Run `npm install` to materialize the pinned dependency tree from T001/T008 — depends on T001, T008

**Checkpoint**: Tooling and dependency scaffold in place; no application code yet.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, auth configuration, and shared plumbing that every user story below builds on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T010 [P] Define Postgres enums `language_enum` (`'en'`, `'ar'`), `lead_status_enum` (`'new'`, `'read'`, `'archived'`), `lead_source_enum` (`'contact'`, `'newsletter'`) in `lib/db/schema.ts` (FR-3.2, data-model.md)
- [ ] T011 Define `articles`, `projects`, `project_translations`, `leads` tables in `lib/db/schema.ts` with all columns, FKs (`project_translations.project_id` → `projects(id)` `ON DELETE CASCADE`; `articles.related_project_id` → `projects(id)` `ON DELETE SET NULL`), unique constraints (`articles(language, slug)`, `articles(translation_group_id, language)`, `project_translations(project_id, language)`), and indexes (`articles(language, published, published_at DESC)`, `articles(translation_group_id)`, `projects(category)`, `projects(is_service_showcase, category)`, `project_translations(project_id)`, `leads(created_at DESC)`) — depends on T010 (FR-3.1, FR-3.3, FR-3.4, data-model.md)
- [ ] T012 [P] Create `lib/env.ts`: Zod schema validating presence/shape of `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` at boot; process exits with an error naming the specific missing variable if validation fails; no hardcoded fallback values for any of them (FR-8.1, FR-8.3, FR-8.4)
- [ ] T013 Create `lib/db/index.ts`: Drizzle instance over `@neondatabase/serverless`'s WebSocket driver (`drizzle-orm/neon-serverless`, `ws` as `neonConfig.webSocketConstructor`), pool configured with explicit `max`/`idleTimeoutMillis`/`connectionTimeoutMillis` (default `max = 10`), using `DATABASE_URL` at runtime, cached via a `globalThis` singleton to survive dev-mode HMR — depends on T011, T012 (FR-2.3, FR-2.5–FR-2.7, research.md item 8)
- [ ] T014 Create `lib/auth.ts`: Better Auth instance using the Drizzle adapter over the pool from T013, `emailAndPassword.enabled: true`, `username` plugin enabled (only plugin), default scrypt hashing (no custom hash/verify), `session.expiresIn = 60*60*24`, `session.updateAge = session.expiresIn`, `session.cookieCache.enabled = false`, cookie `httpOnly`/`secure`-in-production/`sameSite: "lax"`, database-backed rate-limit storage configured with `modelName: "auth_rate_limit"` but `rateLimit.enabled: false` in production, `modelName` prefixes `auth_user`/`auth_session`/`auth_account`/`auth_verification` — depends on T012, T013 (FR-4.1–FR-4.13, FR-4.15)
- [ ] T015 Run `npx @better-auth/cli generate` against the `lib/auth.ts` config from T014 (pinned Better Auth 1.6.30) and merge the generated `auth_user`/`auth_session`/`auth_account`/`auth_verification`/`auth_rate_limit` table definitions into `lib/db/schema.ts`. The CLI output is authoritative — do not hand-author or hand-edit these columns (e.g. `auth_session.token`) based on assumption; take exactly what the CLI generates. **Acceptance**: run `npx tsc --noEmit` scoped to `lib/db/schema.ts` and confirm it imports cleanly with zero type errors, AND confirm the file now contains all five `auth_`-prefixed table definitions (`auth_user`, `auth_session`, `auth_account`, `auth_verification`, `auth_rate_limit`) — not just that the CLI command exited successfully — depends on T011, T014 (FR-3.5, data-model.md correction)
- [ ] T016 [P] Create `drizzle.config.ts` at repo root pointing migrations at `DATABASE_URL_UNPOOLED` (FR-2.4)
- [ ] T017 Run `npx drizzle-kit generate --name initial` to produce the committed migration `drizzle/0001_initial.sql` from `lib/db/schema.ts` — never `drizzle-kit push`. **Acceptance**: confirm the generated migration file includes both the application tables/enums (`articles`, `projects`, `project_translations`, `leads`, `language_enum`, `lead_status_enum`, `lead_source_enum`, from T011) AND the Better Auth tables (`auth_user`, `auth_session`, `auth_account`, `auth_verification`, `auth_rate_limit`, from T015). The migration must not be hand-written — it is generated only after both schemas are already defined — depends on T015, T016 (FR-2.9)
- [ ] T018 Create `app/api/auth/[...auth]/route.ts` mounting Better Auth via `toNextJsHandler(auth)` from `lib/auth.ts` — depends on T014 (FR-4.14)
- [ ] T019 [P] Create `app/layout.tsx` root layout with minimal Phase 0 chrome
- [ ] T020 [P] Create a structured JSON request-logging utility (e.g. `lib/logger.ts`) emitting `{ timestamp, method, path, status, duration }` to stdout for `/api/*` requests, never logging response bodies (FR-9.1, FR-9.2)
- [ ] T021 Create the top-level error handler returning `{ message }` JSON with no stack traces in production — depends on T020 (FR-9.3)
- [ ] T022 [P] Create `proxy.ts` at repo root: optimistic redirect for `/admin/*` paths on cookie presence only (no DB session validation), explicitly excluding `/admin/auth` and `/admin/auth/*` to prevent redirect loops, handling no other concern (FR-6.3–FR-6.6). **Acceptance** (fully checkable once the login page exists — T030): verify with `curl -I http://localhost:3000/admin/auth` (no session cookie set) that the response is HTTP 200 (login page renders), not a 3xx redirect — confirms `/admin/auth` is correctly excluded and no redirect loop occurs (AC-11)

**Checkpoint**: Schema, database connection, auth configuration, and shared plumbing (env validation, logging, error handling, optimistic redirect) are in place. Every user story below can now proceed.

---

## Phase 3: User Story 1 - Operator can deploy the foundation (Priority: P1)

**Goal**: Deploy the target application to a new Replit App and reach it at a `*.replit.app` URL, confirming the foundation runs.

**Independent Test**: Deploy to Replit Autoscale; `curl` the root URL and confirm a valid Phase 0 placeholder response; confirm the production Replit App is untouched.

### Implementation for User Story 1

- [ ] T023 [P] [US1] Create `app/page.tsx`: minimal Phase 0 placeholder home page identifying the deployment as a foundation build, rendering no real target content (FR-7.13)
- [ ] T024 [US1] Deploy the target application to a new Replit App (Autoscale), separate from the current production Replit App; confirm reachable at its `*.replit.app` URL and that production is unaffected — depends on T023 and Phase 1/2 completion (AC-1)

**Checkpoint**: The foundation is deployed and reachable. User Story 1 is independently verifiable.

---

## Phase 4: User Story 2 - Operator can bootstrap the admin (Priority: P2)

**Goal**: Run a one-time bootstrap script that creates the admin user, producing login credentials for the target application.

**Independent Test**: Run `scripts/bootstrap-admin.ts` against a configured database; confirm exactly one `auth_user` row and a matching `auth_account` credential row exist; re-run without `--force` and confirm no additional rows are created.

### Implementation for User Story 2

- [ ] T025 [P] [US2] Create `scripts/bootstrap-admin.ts`: read `ADMIN_USERNAME`/`ADMIN_PASSWORD` from env, call Better Auth's `signUpEmail`-equivalent server API (research.md item 3) with `username`/`displayUsername` = `ADMIN_USERNAME`, placeholder `email = "${ADMIN_USERNAME}@omniflowai.local"`, placeholder `name = ADMIN_USERNAME`, `emailVerified: true` — no raw SQL, Better Auth's own hashing applies (FR-5.1, FR-5.3, FR-5.4, FR-4.16)
- [ ] T026 [US2] Add idempotency to `scripts/bootstrap-admin.ts`: query `auth_user` by the target username first; if a match exists and `--force` was not passed, skip creation and log "Admin already exists — no action taken"; on success log "Admin created"; the script never runs automatically on app startup — depends on T025 (FR-5.2, FR-5.5, FR-5.6)
- [ ] T027 [US2] Execute `scripts/bootstrap-admin.ts` against the configured target database; verify AC-6: exactly one `auth_user` row exists with the intended admin username, a matching `auth_account` row exists with `providerId = "credential"`, and the placeholder `name`/`email`/`emailVerified` fields are populated per FR-4.16. Then run the bootstrap script a **second time without `--force`**; confirm the "Admin already exists — no action taken" message is printed and that no additional `auth_user` or `auth_account` row was created (row counts unchanged) — verifies AC-7 — depends on T026

**Checkpoint**: The admin bootstrap flow works end-to-end, has been executed and verified against a real database, and is confirmed idempotent by an actual second run. User Story 2 is independently verifiable (AC-6, AC-7).

---

## Phase 5: User Story 3 - Admin can sign in (Priority: P3)

**Goal**: Navigate to `/admin/auth`, enter credentials, and reach the admin dashboard — proving authentication works end-to-end.

**Independent Test**: Submit correct credentials at `/admin/auth`; confirm redirect to `/admin`, a new `auth_session` row, and the dashboard rendering the logged-in username. Confirm an unauthenticated request to `/admin` redirects to `/admin/auth` without an uncaught error, and that `/admin/auth` itself never redirect-loops.

### Implementation for User Story 3

- [ ] T028 [P] [US3] Create `lib/auth-server.ts` exporting `requireAuth()`: reads the session via `auth.api.getSession({ headers: await headers() })`, and calls `redirect("/admin/auth")` from `next/navigation` when unauthenticated, returning `Promise<Session>` with no null variant (`redirect()` is `never`-typed and throws internally — research.md item 6) (FR-6.2)
- [ ] T029 [US3] Create `app/admin/(protected)/layout.tsx`: Server Component calling `requireAuth()` before rendering any child route — depends on T028 (FR-6.7)
- [ ] T030 [P] [US3] Create `app/admin/auth/page.tsx`: login page (username, password fields), NOT wrapped by the `(protected)` layout (FR-7.1)
- [ ] T031 [US3] Implement the login Server Action in `app/admin/auth/page.tsx` calling Better Auth's `signIn.username` (research.md item 3) with `useActionState` for pending/error state; redirect to `/admin` on success; user-friendly inline error (not a raw HTTP status string) on failure — depends on T030 (FR-7.2–FR-7.5)
- [ ] T032 [P] [US3] Create `app/admin/(protected)/page.tsx`: dashboard rendering the logged-in username — depends on T029 (FR-7.6, partial — sign-out control added in User Story 4)

**Checkpoint**: Admin login works end-to-end, and `requireAuth()`/`proxy.ts` correctly gate `/admin` while leaving `/admin/auth` reachable. Re-run the T022 `curl -I http://localhost:3000/admin/auth` check now that the login page exists. User Story 3 is independently verifiable (AC-8, AC-10, AC-11).

---

## Phase 6: User Story 4 - Admin can sign out (Priority: P4)

**Goal**: Click a sign-out control on the dashboard and be returned to the login page with the session cleared.

**Independent Test**: Click "Sign out" on `/admin`; confirm redirect to `/admin/auth`, the `auth_session` row removed/invalidated, and that a subsequent request to `/admin` with the now-cleared cookie redirects to `/admin/auth` again.

### Implementation for User Story 4

- [ ] T033 [US4] Add a sign-out Server Action and a "Sign out" control to `app/admin/(protected)/page.tsx`: the action calls Better Auth's sign-out API (`auth.api.signOut`) and redirects to `/admin/auth` — depends on T032 (FR-7.6, FR-7.7)

**Checkpoint**: Session termination works end-to-end. User Story 4 is independently verifiable (AC-9).

---

## Phase 7: User Story 5 - Operator can verify process health (Priority: P5)

**Goal**: `GET /api/health` returns a JSON response confirming the process is running.

**Independent Test**: `curl /api/health`; confirm `200` with `{ status: "ok", version }`, no database call, no auth required, and that the request doesn't appear in the main access log.

### Implementation for User Story 5

- [ ] T034 [P] [US5] Create `app/api/health/route.ts`: GET handler returning `200` with JSON `{ status: "ok", version }` — no database call, no auth required. Per `plan.md`'s "Interpretation note on FR-7.9," `uptime` is intentionally omitted (misleading on Replit Autoscale) (FR-7.8–FR-7.11)
- [ ] T035 [US5] Exclude `/api/health` requests from the main structured access log (T020), either by filtering them out or routing them to a separate low-volume stream — depends on T020, T034 (FR-7.12)

**Checkpoint**: Liveness checks work and stay out of the main log. User Story 5 is independently verifiable (AC-2).

---

## Phase 8: User Story 6 - Operator sees clear errors on misconfiguration (Priority: P6)

**Goal**: Deploying without a required environment variable produces a boot-time error naming the missing variable, instead of an obscure runtime failure.

**Independent Test**: Deploy/boot with all four required vars set — confirm the app boots and serves requests. Remove one required var and attempt to boot again — confirm the process refuses to start and the log names the specific missing variable.

### Implementation for User Story 6

- [ ] T036 [US6] Manually verify AC-3/AC-4 against `lib/env.ts` (T012): boot with all required vars set succeeds; boot with any one of `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` removed fails fast with a specific named error — depends on T012 and Phase 1/2 completion (AC-3, AC-4, quickstart.md)

**Checkpoint**: Misconfiguration fails loudly and specifically, not silently. User Story 6 is independently verifiable.

---

## Phase 9: User Story 7 - Downstream developer inherits ready plumbing (Priority: P7)

**Goal**: A developer implementing Phase 1 or Phase 2 can import `requireAuth()`, define new tables in the schema file, and expect Better Auth to already work — without solving foundation problems.

**Independent Test**: Import `requireAuth()` into a scratch Server Component and confirm it type-checks and redirects correctly when unauthenticated. Add a throwaway table to `lib/db/schema.ts` and confirm `npx drizzle-kit generate` produces a clean migration for it without touching the Better Auth tables.

### Implementation for User Story 7

- [ ] T037 [P] [US7] Verify `lib/auth-server.ts`'s `requireAuth()` (T028) is cleanly importable and usable from a new Server Component with no additional setup beyond the import — depends on T028
- [ ] T038 [P] [US7] Verify `lib/db/schema.ts` (T015/T017) supports adding a new table definition and running `npx drizzle-kit generate` to produce a clean, isolated migration for it, without requiring changes to the Better Auth tables — depends on T017

**Checkpoint**: The plumbing genuinely works for a downstream developer, not just for Phase 0 itself. User Story 7 is independently verifiable.

---

## Phase 10: User Story 8 - Search engines do not index the staging deployment (Priority: P8)

**Goal**: The target Replit deployment is not indexable by search engines before cutover, by default, while a production-indexing flag exists for later use.

**Independent Test**: On the staging deployment, confirm `X-Robots-Tag: noindex, nofollow` on all responses and a disallow-all `/robots.txt`. Locally only, confirm that setting `INDEXING_ENABLED=true` flips both behaviors — without ever setting that flag on the reachable staging deployment.

### Implementation for User Story 8

- [ ] T039 [P] [US8] Create `app/robots.ts`: environment-aware robots handler — `Disallow: /` for all user agents when `INDEXING_ENABLED` is unset (default), production-appropriate rules when `INDEXING_ENABLED=true` (FR-11.2, FR-11.4)
- [ ] T040 [P] [US8] Configure `X-Robots-Tag: noindex, nofollow` on all responses (including `/robots.txt` itself) when `INDEXING_ENABLED` is unset, via `next.config.ts` `headers()` (not `proxy.ts`, which per FR-6.6 must not handle concerns beyond the `/admin/*` redirect) — no header when `INDEXING_ENABLED=true` — depends on T004 (FR-11.1, FR-11.2, FR-11.3, FR-11.5)
- [ ] T041 [US8] Manually verify production-flag behavior **locally only**, using this exact sequence:
  1. `INDEXING_ENABLED=true npm run build`
  2. `INDEXING_ENABLED=true npm start` (in the background or a separate terminal)
  3. `curl -sI http://localhost:3000/` — confirm the `X-Robots-Tag` header is **absent**
  4. `curl -sI http://localhost:3000/robots.txt` — confirm the `X-Robots-Tag` header is **absent**
  5. `curl http://localhost:3000/robots.txt` — confirm the content permits crawling (no `Disallow: /` for the `*` user agent)
  6. Stop the local `npm start` process
  7. Confirm the deployed staging environment was never touched during this verification

  — depends on T039, T040 (FR-11.7, AC-16)

**Checkpoint**: Staging is safely non-indexable by default, and the production path is proven without ever exposing it. User Story 8 is independently verifiable.

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Final acceptance criteria that span multiple user stories, plus the full quality gate.

- [ ] T042 [P] Run the full quality gate: `npm run check && npm run lint && npm run build`, confirm all three exit zero (FR-12.1, AC-14)
- [ ] T043 Manually verify AC-5 against the deployed target database: all 9 tables (`articles`, `projects`, `project_translations`, `leads`, `auth_user`, `auth_session`, `auth_account`, `auth_verification`, `auth_rate_limit`), all enums, all unique constraints, all indexes present; all four application tables hold zero rows
- [ ] T044 Manually verify AC-12/AC-13: inspect the Replit log stream during a real login to confirm method/path/status/duration are present and the response body is absent; inspect the login response JSON body to confirm no `password`/`hash`/similar field is present
- [ ] T045 Manually verify AC-15: confirm via Neon query log (or `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`) that only `auth_user`/`auth_session`/`auth_account` are touched during bootstrap/login/logout, and that no non-prefixed `user`, `session`, `account`, or `verification` tables exist in the schema
- [ ] T046 Manually verify AC-17: inspect `lib/auth.ts` (T014) to confirm `rateLimit.enabled` is `false` for the production Phase 0 deployment (directly or via an environment guard that evaluates false in production)
- [ ] T047 Run the complete `quickstart.md` walkthrough end-to-end against the deployed target application, confirming all of AC-1 through AC-17 pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories.
- **User Stories (Phase 3–10)**: All depend on Foundational completion.
  - Priority order is P1→P8 as listed, matching the spec's own ordering and the natural build-up (deploy → bootstrap → sign-in → sign-out → health → boot errors → downstream plumbing → indexing).
  - User Story 4 (sign-out) builds on User Story 3's dashboard file (`app/admin/(protected)/page.tsx`) — not independent of US3 in implementation, though independently *testable* once US3 is done.
  - User Stories 1, 2, 5, 6, 7, 8 have no file-level dependency on each other and can proceed in parallel once Foundational is complete.
- **Polish (Phase 11)**: Depends on all user stories being complete (it verifies cross-cutting acceptance criteria against the whole system).

### Within Each User Story

- Story-specific setup → implementation → manual verification, in that order.
- Same-file edits are sequenced (no `[P]`); different-file work is marked `[P]`.

### Parallel Opportunities

- All Setup tasks marked `[P]` (T002–T007) can run in parallel once T001 exists.
- Within Foundational, T010/T012/T016/T019/T020/T022 are marked `[P]` — independent files.
- Once Foundational is complete, User Stories 1, 2, 5, 6, 7, 8 can be staffed and worked in parallel; User Story 3 must precede User Story 4 (shared dashboard file).

---

## Parallel Example: Foundational Phase

```bash
# Independent files, can run together once Setup is done:
Task: "Define Postgres enums in lib/db/schema.ts"                      # T010
Task: "Create lib/env.ts Zod boot validation"                          # T012
Task: "Create drizzle.config.ts"                                       # T016
Task: "Create app/layout.tsx root layout"                              # T019
Task: "Create structured JSON request-logging utility"                 # T020
Task: "Create proxy.ts optimistic /admin/* redirect"                   # T022
```

## Parallel Example: User Stories 1, 2, 5 (once Foundational is done)

```bash
Task: "Create app/page.tsx Phase 0 placeholder home"                   # T023 [US1]
Task: "Create scripts/bootstrap-admin.ts core creation logic"          # T025 [US2]
Task: "Create app/api/health/route.ts GET handler"                     # T034 [US5]
```

---

## Implementation Strategy

**Phase 0's shipping unit is all 17 acceptance criteria (AC-1 through AC-17) — not a partial subset.** The user-story grouping above orders the work sensibly (deploy before bootstrap before sign-in, etc.) and lets independent pieces be built and checked in parallel, but no priority tier is an acceptable stopping point on its own. "Done" for this feature means every task through T047 is complete and `quickstart.md`'s full walkthrough passes — matching the spec's own framing ("Phase 0 is complete when all of the following are verified by the operator: AC-1 … AC-17").

### Build Order

1. Setup (Phase 1) + Foundational (Phase 2) — required before any user story; nothing is independently useful yet.
2. User Stories 1 → 8, in priority order, using the parallel opportunities noted above where staffing allows (US1/US2/US5/US6/US7/US8 have no file-level dependencies on each other; US4 depends on US3's dashboard file).
3. Polish (Phase 11) — final cross-cutting acceptance criteria (AC-5, AC-12, AC-13, AC-14, AC-15, AC-17) and the complete `quickstart.md` walkthrough.
4. Phase 0 is accepted only once all of Setup, Foundational, all 8 user stories, and Polish are complete and AC-1 through AC-17 have all been verified — not before.

### Parallel Team Strategy

With multiple developers, once Foundational is done: User Stories 1, 2, 5, 6, 7, 8 can be assigned to different people concurrently; User Story 3 should be staffed before User Story 4 (shared file). All stories still ship together as one Phase 0 acceptance, not as separate incremental releases.

---

## Notes

- `[P]` tasks = different files, no dependencies.
- `[Story]` label maps task to specific user story for traceability.
- No test tasks are included — see the **Tests** note at the top of this document.
- Commit after each task or logical group.
- Stop at any checkpoint to sanity-check a story's own behavior — but do not treat any single story or subset of stories as a deliverable on its own; see § Implementation Strategy.
