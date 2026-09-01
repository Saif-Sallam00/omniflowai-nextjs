# Implementation Plan: Admin Image Upload — Phase 2, Slice 2a

**Branch**: `005-admin-image-upload` | **Date**: 2026-08-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-admin-image-upload/spec.md`, itself built directly from the pre-approved `docs/image-upload-slice-spec.md`.

## Summary

Deliver the isolated image-processing infrastructure Phase 2's article/project forms will depend on: an authenticated multipart upload Route Handler (`POST /api/image`) that runs an uploaded file through `sharp` — EXIF auto-rotate then strip, resize so the longest edge is ≤1600px without ever upscaling, WebP re-encode at quality 80 — stores the result as a `data:image/webp;base64,...` string in a new, dedicated `images` table, and returns `{ id, url: "/api/image/{id}" }`; plus a public serving Route Handler (`GET /api/image/{id}`) that decodes and streams the bytes back with an immutable, one-year cache header and a `404` for an unknown id. All three of the operator's research items resolve to mechanisms already proven elsewhere in this exact codebase — a Postgres-generated `uuid` primary key (the same pattern `articles.translationGroupId` already uses), a `null`-returning sibling of the existing `requireAuth()` for the Route-Handler 401 case, and a `Content-Length` fast-path guard backed by a post-parse `file.size` check for the 5 MB ceiling — with **one new dependency**, `sharp`, whose addition is a required, explicitly-logged decision (constitution Scope Discipline), not a silent one.

## Technical Context

**Language/Version**: TypeScript (strict mode) on Next.js 16.3.1 App Router — unchanged from Phase 0/1/2 slice 1.

**Primary Dependencies**: `sharp` (new — image processing; no equivalent exists in this codebase and hand-rolling EXIF/resize/WebP is infeasible, per spec FR-018 and research.md's Dependency check). Everything else is already present and reused as-is: `drizzle-orm` (new `images` table + DAL), `better-auth` (`auth.api.getSession()`, already proven via `requireAuth()`), Next's native `Request`/`FormData`/Route Handler surface (no new HTTP/multipart library).

**Storage**: Neon Postgres via the existing pooled Drizzle connection (`lib/db/index.ts`, unchanged). One new table, `images` (`id uuid`, `data text NOT NULL`, `created_at timestamptz default now()`), added via a committed Drizzle migration (`npx drizzle-kit generate`, never `push`, per constitution) — matching how slice 1C's case-study schema revision and slice 004's (zero-schema-change) precedent both handled schema evolution.

**Testing**: No automated test framework introduced by this slice, consistent with every prior slice's own deferral (1A/1B/004). Verification is the quality gate (`tsc --noEmit`, ESLint, `next build`, all zero-error) plus `curl`-driven manual verification against `quickstart.md`, mapped 1:1 to spec.md's acceptance scenarios and success criteria — the same verification shape slice 004 used for its own Server-Action auth re-checks (AC-8's "reasoning/inspection or a direct invocation attempt").

**Target Platform**: Replit Autoscale — unchanged.

**Project Type**: web-service — unchanged; same single Next.js App Router project.

**Performance Goals**: Not independently load-bearing for this slice, but two constraints function as hard performance/safety floors: the 5 MB input ceiling must be enforced without buffering unbounded data (research.md, Decision 3), and the immutable one-year `Cache-Control` on the serving endpoint (FR-015) means a given image is fetched from this server at most once per client/cache, not on every page view.

**Constraints**:
- **Upload MUST be a Route Handler, not a Server Action** (FR-002) — sidesteps the Server Action body-size ceiling for a file that can legitimately be several megabytes before processing.
- **Upload MUST independently return `401` JSON on no session** (FR-003) — via the new `getSessionOrNull()` helper (research.md, Decision 2), never `requireAuth()`'s redirect.
- **Serving endpoint MUST require no authentication** (FR-014) — crawler/scraper fetchability (INV-06) is the entire point of this endpoint existing.
- **Processing parameters are fixed, not re-derived** (FR-006–FR-010): EXIF auto-rotate then strip (achieved by calling `.rotate()` and never calling `.withMetadata()` — `sharp`'s default output already omits EXIF), resize to a 1600×1600 bounding box with `fit: "inside", withoutEnlargement: true` (bounds the *longest* edge at ≤1600 while preserving aspect ratio and never upscaling), WebP quality 80.
- **Storage is a dedicated `images` table, not the consuming row** (FR-011) — `articles.coverImage`/projects' image columns are unmodified by this slice; only a later slice will start writing `/api/image/{id}` values into them.
- **Image id MUST be non-enumerable** (FR-012) — Postgres-generated UUID (research.md, Decision 1).
- **5 MB ceiling enforced before full buffering** (FR-004) — `Content-Length` fast-path guard, plus a post-parse `file.size` backstop (research.md, Decision 3); the residual gap (a lying `Content-Length` header) is explicitly acknowledged, not silently accepted, and is mitigated by the endpoint already being auth-gated.
- **Non-image input rejected via actual decode attempt, not just content-type sniffing** (FR-005) — a `sharp()` call that throws on the buffered input is caught and converted to `400`.
- **DAL lives in `lib/db/images.ts`**, matching the flat `lib/db/<entity>.ts` convention already established by `leads.ts`/`articles.ts`/`portfolio.ts` (FR-017).
- **`sharp` is a required, logged new dependency** (FR-018) — this plan does not add it silently; the decision-log entry is a required implementation-time deliverable, tracked explicitly rather than left implicit.
- **No public or admin page rendering is touched** (FR-019/FR-020, AC-11) — both new routes live under `app/api/image/`, structurally isolated from every page route tree.
- **Naming/style conventions carried forward** (spec Assumptions): kebab-case files, default-export page/layout modules (N/A here — no page is added), verb-first named exports, `type` aliases (not `interface`), `@/*` alias only, TypeScript strict — applied throughout Project Structure below.

**Scale/Scope**: Two new Route Handlers, one new DB table + migration, one new DAL module (2 functions), one new auth helper, one new dependency. No new page, no new admin nav entry (this slice has no UI of its own — it is pure backend infrastructure for slices 2b/3 to consume later).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Constraint | Status | Notes |
|---|---|---|
| I. Diagnosis Before Solution | PASS | All three research decisions are grounded in already-shipped, directly-inspected precedent in this exact repo (`translationGroupId`'s uuid pattern, `requireAuth()`'s proven `getSession` call, `package.json`'s confirmed absence of `sharp`) — nothing assumed or invented. The spec's own central "is this additive to Phase 1?" question was resolved by a direct grep before this spec was even written, not re-derived here. |
| II. Locked Decisions Are Locked | PASS | No locked decision reopened. Decision 010 (base64 data URI in a `text` column) is honored exactly — only its *location* (a dedicated table vs. the consuming row) was the spec's own already-resolved central decision, not something this plan revisits. |
| III. Verify Before Declaring Done | PASS (deferred to implementation) | `quickstart.md` maps 1:1 to every acceptance scenario and success criterion in spec.md, including a direct `curl`-based check of the auth, size-ceiling, and content-validation rejection paths. |
| IV. Scope Discipline | PASS, with one flagged, required action | Zero *unlogged* new dependencies: `sharp` is the one new dependency, and its addition is carried forward as a required decision-log entry (FR-018), not silently added — this is the one place this slice deliberately does NOT claim a bare "zero new dependencies" PASS, because the spec itself requires logging this one. No orphan-cleanup, no OG/meta wiring, no multi-image UI, no CDN — all explicitly out of scope and untouched. |
| V. URL Preservation as Default | N/A | Both new routes (`/api/image`, `/api/image/[id]`) are net-new API surface with no legacy production equivalent — standing rule 002 governs the public marketing route inventory, which this slice does not touch. |
| VI. Security Is Not Convenience | PASS | The upload handler independently verifies a valid admin session as its first action (FR-003), using Better Auth's own `auth.api.getSession()` (the same call `requireAuth()` already uses, not a bespoke mechanism) — a direct, literal application of "Authorization is enforced inside... Route Handlers... never solely in `proxy.ts`." The serving handler's public-by-design lack of auth is itself a requirement (FR-014/INV-06), not an oversight. |
| VII. Bilingual By Architecture | N/A | Both endpoints are language-agnostic infrastructure (an uploaded image has no language); admin remains English-only per established precedent. |
| Runtime constraints (Next.js/Node/TS/ESLint) | PASS | No version changes. Strict TS and the existing ESLint config apply unchanged. Both new Route Handlers reuse the existing `withRequestLogging`/`withErrorHandling` wrapper pair (`app/api/auth/[...auth]/route.ts`'s precedent) rather than inventing new logging/error conventions. |
| Database constraints (P-08, migrations) | PASS | One new table via a committed, generated migration (never `push`) — matching the constitution's explicit migration-workflow rule and slice 1C's own precedent for a schema-revision migration. The new `data text NOT NULL` column is exactly decision 010's storage model; no DB-native constraint beyond `NOT NULL` is needed since there is no enum/status-like invariant to protect here. |
| One DB, direct access, no JSON API for own frontend (P-05) | PASS by construction | These two Route Handlers are not "a JSON API for the app's own frontend" in the sense P-05 prohibits — P-05's own carve-out is explicit: "API routes exist only for external consumers, webhooks, image serving, or third-party integrations." Image upload and image serving are exactly the named "image serving" exception; the DAL (`lib/db/images.ts`) itself is still Drizzle called directly, with no JSON API standing between it and any Server Component that might read it later. |
| Atomic mutations (P-15) | N/A | `createImage` is a single `INSERT ... RETURNING` statement — no check-then-write pattern, no transaction needed. |
| Required secrets fail-fast (P-13) | N/A | No new environment variable is introduced by this slice. |

**Result**: No violations requiring the Complexity Tracking table. The one item flagged above (the `sharp` dependency) is a required, already-anticipated action per the spec itself, not a gate failure — it is called out explicitly here so it cannot be silently missed at implementation time.

**Post-design re-check**: `data-model.md` and `contracts/route-handlers.md` introduce no entity, dependency, or route beyond what FR-001–FR-021 and the three research decisions already specify — they formalize the spec's own requirements plus the two exact DAL function signatures and the one new auth helper research.md determined were necessary. Constitution Check result stands unchanged: PASS (with the one flagged, required `sharp` decision-log action carried into tasks.md).

## Project Structure

### Documentation (this feature)

```text
specs/005-admin-image-upload/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
├── contracts/            # Phase 1 output (/speckit-plan command)
│   └── route-handlers.md
├── checklists/
│   └── requirements.md
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/api/
├── health/route.ts                    # UNCHANGED
├── auth/[...auth]/route.ts            # UNCHANGED — the withRequestLogging(withErrorHandling(...))
│                                       # precedent this slice's two new handlers follow
└── image/
    ├── route.ts                       # NEW — POST only. Auth (getSessionOrNull), Content-Length
    │                                   # guard, formData parse, size backstop, sharp pipeline,
    │                                   # createImage, { id, url } response. Wrapped in
    │                                   # withRequestLogging(withErrorHandling(...)).
    └── [id]/
        └── route.ts                   # NEW — GET only, public. getImageById, decode base64,
                                        # image/webp + immutable cache header, 404 on miss.
                                        # Same wrapper pair as above.

lib/
├── db/
│   ├── schema.ts                      # MODIFIED — adds the `images` table export (data-model.md).
│   │                                   # No existing table/column/enum changed.
│   ├── images.ts                      # NEW — Image type, createImage, getImageById. Flat
│   │                                   # lib/db/<entity>.ts convention (leads.ts/articles.ts/
│   │                                   # portfolio.ts sibling).
│   ├── leads.ts / articles.ts / portfolio.ts / index.ts   # UNCHANGED
└── auth-server.ts                     # MODIFIED — adds getSessionOrNull(request), alongside the
                                        # existing requireAuth() (unchanged, still used by pages/
                                        # Server Actions elsewhere).

drizzle/
├── 0000_initial.sql / 0001_case_study_schema.sql   # UNCHANGED
└── 0002_images_table.sql              # NEW — generated via `npx drizzle-kit generate`, committed.
                                        # Exact filename assigned by drizzle-kit at generation time.

app/(en)/(public)/*, app/ar/**, app/(en)/admin/**   # UNCHANGED — no public or admin page route
                                                      # is touched by this slice (it has no UI).

package.json                            # MODIFIED — adds `sharp` as a new production dependency
                                        # (FR-018), accompanied by a decision-log entry at
                                        # implementation time (constitution Scope Discipline).

next.config.ts / proxy.ts / drizzle.config.ts / tsconfig.json / eslint.config.mjs   # UNCHANGED
```

**Structure Decision**: No new top-level directory beyond the new `app/api/image/` route segment and the new `lib/db/images.ts` module — both slot directly into conventions already established (`app/api/{health,auth}` for Route Handlers; `lib/db/{leads,articles,portfolio}.ts` for the flat DAL pattern). The upload and serving handlers are split into two files (`app/api/image/route.ts` for `POST /api/image`, `app/api/image/[id]/route.ts` for `GET /api/image/{id}`) rather than one file handling both, because they are genuinely different route segments (one static, one with a dynamic `[id]` param) with entirely different auth postures (one gated, one deliberately public) — collapsing them into one file would gain nothing and would make the public/private split less visually obvious at the file-tree level. `getSessionOrNull` is added to the existing `lib/auth-server.ts` rather than a new file, since it is a small, direct sibling of `requireAuth()` (same underlying call, different response to the same lookup) — not an independent concern warranting its own module.

## Complexity Tracking

*No entries — Constitution Check reported no violations requiring justification. The one required action (logging the `sharp` dependency addition) is a spec-mandated deliverable, not a complexity violation to justify away.*
