---

description: "Task list for Admin Image Upload (Phase 2, Slice 2a)"
---

# Tasks: Admin Image Upload (Phase 2, Slice 2a)

**Input**: Design documents from `/specs/005-admin-image-upload/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/route-handlers.md, quickstart.md

**Tests**: Not requested for this slice (per plan.md's Testing section — no automated test framework introduced; verification is the quality gate plus `curl`-driven manual checks against quickstart.md). No test tasks are generated; each user-story phase instead ends with its own manual verification tasks mapped to quickstart.md.

**Organization**: Tasks are grouped by user story (spec.md P1/P2/P3) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in every task description

## Path Conventions

Single Next.js App Router project at the repository root — `app/api/`, `lib/db/`, `lib/auth-server.ts`, `drizzle/`, `docs/`, per plan.md's Project Structure.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the one new dependency this slice requires, with its required decision-log record — before any code that uses it is written.

- [X] T001 Add `sharp` as a production dependency (`npm install sharp`) and create `docs/decision-014-sharp-dependency.md` recording the decision: what it is (image processing — EXIF rotate/strip, resize, WebP encode), why it's needed (FR-006–FR-010 require capabilities not achievable via any library already in this codebase, per research.md's Dependency Check), and confirmation it was absent from `package.json` before this change. Follow the format of `docs/decision-013-case-study-schema.md` (Date/Status/Type/Related header, then narrative). **Verify**: `git diff package.json` shows only `sharp` added; `docs/decision-014-sharp-dependency.md` exists and is non-empty.

**Checkpoint**: Dependency present and logged — foundational schema/DAL work can begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The `images` table, its migration, its DAL, and the auth primitive that both user-story endpoints depend on. No user-story endpoint can be built until this phase is complete.

**⚠️ CRITICAL**: Both User Story 1 and User Story 2 depend on every task in this phase.

- [X] T002 Add the `images` table to `lib/db/schema.ts`: `id uuid` primary key defaulting to `gen_random_uuid()` (same pattern as `articles.translationGroupId`), `data text` not null, `createdAt timestamp with timezone` not null defaulting to `now()` — exact shape from data-model.md. Do not modify any existing table/column/enum in this file.
- [X] T003 Generate the migration: `npx drizzle-kit generate --name images_table` from the repository root. Review the generated SQL file under `drizzle/` (exact filename assigned by drizzle-kit, e.g. `000X_images_table.sql`) — confirm it contains exactly one `CREATE TABLE "images" (...)` statement matching T002's schema, nothing else. Apply it against `DATABASE_URL_UNPOOLED` per this project's normal migration-application step. **Never run `drizzle-kit push`.** Commit the generated migration file (and updated `drizzle/meta/`) to git. **Verify**: migration file exists under `drizzle/`, applied successfully, `git status` shows it staged/committed, not merely generated.
- [X] T004 [P] Create `lib/db/images.ts`: export `type Image = typeof images.$inferSelect`; `createImage(data: string): Promise<Image>` (single `INSERT ... RETURNING`); `getImageById(id: string): Promise<Image | null>` (`SELECT ... WHERE eq(images.id, id) LIMIT 1`, returning `null` on no match) — verb-first named exports, `type` alias, matching `lib/db/leads.ts`'s exact shape and conventions (data-model.md). Depends on T002.
- [X] T005 [P] Add `getSessionOrNull(request: Request): Promise<Session | null>` to `lib/auth-server.ts`, alongside the existing (unmodified) `requireAuth()`. Reuse the same `Session` type already defined in that file. Implementation: `return auth.api.getSession({ headers: request.headers })` — no redirect, no throw on a miss (research.md, Decision 2). Do not alter `requireAuth()`.

**Checkpoint**: `images` table exists in the DB, `lib/db/images.ts` and `getSessionOrNull` are available — User Story 1 and User Story 2 implementation can now begin (in parallel, if staffed).

---

## Phase 3: User Story 1 - Admin uploads an image and receives a stable reference (Priority: P1) 🎯 MVP

**Goal**: An authenticated admin can `POST` an image file to `/api/image` and receive back `{ id, url }` for a normalized (EXIF-rotated, resized ≤1600px, WebP q80), stored image — with every rejection path (auth, size, content) enforced correctly and storing nothing.

**Independent Test**: Sign in as admin, submit a valid image (including one with non-default EXIF orientation) to `POST /api/image`, confirm a `200` with `{ id, url }`; independently confirm the three rejection paths (no session, oversized, non-image) each reject correctly and store nothing — all without needing the serving endpoint.

### Implementation for User Story 1

- [X] T006 [US1] Create `app/api/image/route.ts` exporting `POST`, wrapped as `withRequestLogging(withErrorHandling(...))` (same pair as `app/api/auth/[...auth]/route.ts`), implementing this exact processing order (contracts/route-handlers.md):
  1. `getSessionOrNull(request)` (T005) — `null` → return **401** `{ message }`, stop before any body is read.
  2. Read `request.headers.get("content-length")` — if present and greater than 5 MB (5 \* 1024 \* 1024 bytes) → return **413** `{ message }`, stop, zero body bytes read (research.md, Decision 3, fast-path).
  3. `await request.formData()`, extract the `file` field. Missing or not a `File` → return **400** `{ message }`.
  4. Re-check the extracted `File`'s `.size` against the same 5 MB ceiling (backstop) — over → return **413** `{ message }`, stop, `sharp` never invoked.
  5. `Buffer.from(await file.arrayBuffer())` → `sharp(buffer).rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toBuffer()`. If `sharp` throws (undecodable/corrupt input) → catch and return **400** `{ message }`, nothing stored (FR-005).
  6. Base64-encode the processed buffer, prefix with `data:image/webp;base64,`, call `createImage(dataUri)` (T004).
  7. Return **200** `{ id: image.id, url: \`/api/image/${image.id}\` }`.

  Pin exactly (per corrections to data-model.md's ambiguity): oversized input is **413** in both the fast-path (step 2) and backstop (step 4) cases — never 400 for oversized. Non-image/corrupt/undecodable input is **400** (step 5). Unauthenticated is **401** (step 1). Every error body uses `{ message: string }` (`lib/error-handler.ts`'s existing shape) — do not introduce a second error shape. Depends on T004, T005.

- [X] T007 [US1] Manually verify User Story 1 end-to-end per quickstart.md, using a running dev server (`npm run dev`) and a valid admin session cookie:
  - `curl -b <admin-session-cookie> -F "file=@rotated-photo.jpg" http://localhost:3000/api/image` → `200`, `{ id, url }` with `url` matching `/api/image/{id}` (US1 AC1 / SC-001).
  - Same request with no session cookie → `401`, `{ message }`, not a redirect (US1 AC2 / SC-003).
  - `curl -b <cookie> -F "file=@too-big.jpg" http://localhost:3000/api/image` (file > 5 MB) → `413`, `{ message }`, no row added to `images` (US1 AC3 / SC-004).
  - `curl -b <cookie> -F "file=@not-an-image.txt" http://localhost:3000/api/image` → `400`, `{ message }`, no row added to `images` (US1 AC4 / SC-005).
  - Query the `images` table directly for the row from the first request — confirm `data` holds a `data:image/webp;base64,...` string.
  Depends on T006.

**Checkpoint**: User Story 1 is fully functional and independently testable — an admin can upload and get back a stable reference.

---

## Phase 4: User Story 2 - The uploaded image is served as a real, fetchable file (Priority: P2)

**Goal**: Anyone, with no authentication, can `GET /api/image/{id}` and receive real, correctly processed image bytes with an immutable long-lived cache header — and receive a `404` (never a 500 or empty 200) for any id that doesn't resolve to a stored image, including a malformed one.

**Independent Test**: Fetch the URL returned by a prior upload (or a directly-seeded row) with no credentials at all and confirm real image bytes, correct content type, and long-lived caching come back; separately confirm both a well-formed-but-unissued id and a malformed (non-UUID) id each `404` rather than crash.

### Implementation for User Story 2

- [X] T008 [US2] Create `app/api/image/[id]/route.ts` exporting `GET`, wrapped as `withRequestLogging(withErrorHandling(...))`, implementing:
  1. Guard the `id` route param's shape before calling `getImageById` — this is a required correctness fix, not optional hardening: `getImageById` does `eq(images.id, id)` against a `uuid`-typed column, so a non-UUID string (e.g. `not-a-uuid`) makes the underlying Postgres driver throw a `22P02 invalid input syntax for type uuid` error rather than returning `null` — it does NOT reach the `null → 404` path on its own. Validate `id` against a UUID-shape check (e.g. a regex or a small `isUuid(id)` helper) before calling `getImageById`, and treat a failed check as **404** `{ message }` immediately — OR wrap the `getImageById` call and catch the `22P02` Postgres error specifically, mapping it to the same **404** `{ message }`. Either mechanism is acceptable; the observable result (404, never 500) is what's required.
  2. For a well-formed UUID: `getImageById(id)` (T004) — `null` → **404** `{ message }`.
  3. Strip the `data:image/webp;base64,` prefix from the stored `data` value, `Buffer.from(base64Part, "base64")` to get raw bytes.
  4. Return the bytes with `Content-Type: image/webp` and `Cache-Control: public, max-age=31536000, immutable` (FR-014/FR-015), status `200`.

  Pin exactly: **404** is the only outcome for (a) a malformed/non-UUID id, and (b) a well-formed but never-issued id — both map to the same `{ message }` body and status; neither ever surfaces as a 500. Depends on T004.

- [X] T009 [US2] Add the malformed-id correctness check as its own explicit verification step (not folded into the general 404 check below), confirming the fix in T008 actually prevents a 500: `curl -i http://localhost:3000/api/image/not-a-uuid` → **404** with a `{ message }` JSON body (not a 500, not an unhandled exception in server logs). Depends on T008.

- [X] T010 [US2] Manually verify the rest of User Story 2 per quickstart.md, using the `id` from a successful T007 upload:
  - `curl -i http://localhost:3000/api/image/{id}` (no cookie) → `200`, real image bytes in the body (US2 AC1 / SC-006).
  - Inspect the same response's headers → `Content-Type: image/webp`; `Cache-Control: public, max-age=31536000, immutable` (US2 AC2 / SC-002 / SC-006).
  - Open the fetched bytes in an image viewer, compare to the original → correctly rotated per original intended orientation; longest edge ≤ 1600 px; file size smaller than the original phone/camera photo (US2 AC2 / SC-002).
  - Upload an image already smaller than 1600 px on its longest edge (reuse T006) and fetch it back → dimensions unchanged, not upscaled (Edge Case).
  - `curl -i http://localhost:3000/api/image/00000000-0000-0000-0000-000000000000` (well-formed but never-issued) → `404`, `{ message }` (US2 AC3 / SC-007).
  Depends on T008, T007.

**Checkpoint**: User Stories 1 AND 2 both work independently — an uploaded image is stored and correctly served, with every not-found path (malformed or unissued id) returning a clean 404.

---

## Phase 5: User Story 3 - A downstream slice can consume the upload mechanism without re-solving it (Priority: P3)

**Goal**: Confirm, by inspection, that the upload endpoint's contract is generic and its returned reference is a short, storable string — so slices 2b/3 can integrate against it later without any further changes here.

**Independent Test**: Inspect `app/api/image/route.ts`'s signature and a successful upload's response shape directly — no new code is required for this story; it verifies a property of what Phase 3 already built.

### Verification for User Story 3

- [X] T011 [US3] Inspect `app/api/image/route.ts` (built in T006) and confirm: it accepts only the `file` form field and the caller's session — no article id, project id, or other content-specific parameter anywhere in its signature or body-parsing logic (US3 AC1). Depends on T006.
- [X] T012 [US3] Inspect a successful upload's `url` value from T007's verification run and confirm it is a short path string (`/api/image/{uuid}`, well under any reasonable text-column length limit) — not the megabyte-scale processed image data itself — suitable for storing directly in an ordinary text/URL column on a future `articles`/`projects`-style table (US3 AC2). Depends on T007.

**Checkpoint**: All three user stories are independently verified. The slice's mechanism is confirmed generic and ready for later slices to consume.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final whole-slice checks that span all three user stories.

- [X] T013 Run the project's quality gate from the repository root — `npm run check` (tsc --noEmit), `npm run lint`, `npm run build` — and confirm all three exit with zero errors (FR-021/SC-009). Fix any type/lint error surfaced by T002–T008 before proceeding.
- [X] T014 Run `npm run build` and inspect the printed route table: confirm `/api/image` and `/api/image/[id]` appear as new dynamic (`ƒ`) routes, and every pre-existing public/admin route's rendering marker (static/dynamic) is unchanged from before this slice (AC-11/SC-010). Depends on T013.
- [ ] T015 Load an existing article or portfolio page that has a `cover_image` value in a browser and confirm it renders exactly as before — this slice touches no public rendering code (spec Assumptions, "Existing public rendering is unaffected"). Depends on T014.
- [ ] T016 Run the full quickstart.md checklist top to bottom (all rows) and confirm every row passes, `sharp`'s decision-log entry (T001) is present, and the migration (T003) is committed, not just generated.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 (T001) since T002's schema and later `sharp`-pipeline code both assume the dependency is installed — BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2 (T004, T005) — independent of User Story 2/3's own tasks.
- **User Story 2 (Phase 4)**: Depends on Phase 2 (T004); T010's verification also depends on T007 (needs an uploaded image's id) but T008/T009 (the handler itself and its malformed-id check) do not depend on User Story 1's code.
- **User Story 3 (Phase 5)**: Purely inspects artifacts from Phase 3/4 — depends on T006 and T007.
- **Polish (Phase 6)**: Depends on all prior phases being complete.

### Within Each User Story

- User Story 1: T006 (implementation) → T007 (verification).
- User Story 2: T008 (implementation) → T009 (malformed-id check) and T010 (remaining verification), both after T008; T010 additionally needs T007's uploaded image.
- User Story 3: T011 (inspects T006) and T012 (inspects T007) — no new implementation.

### Parallel Opportunities

- T004 and T005 (Phase 2) touch different files (`lib/db/images.ts` vs `lib/auth-server.ts`) and can run in parallel once T002/T003 (schema + migration) are done for T004.
- Once Phase 2 is complete, T006 (US1) and T008 (US2) can be implemented in parallel by different developers — T008 does not depend on T006, only on T004.
- T011 and T012 (US3) can run in parallel with each other once their respective dependencies (T006, T007) are done.

---

## Parallel Example: Phase 2 (Foundational)

```bash
# After T002 (schema) and T003 (migration) complete:
Task: "Create lib/db/images.ts DAL (Image type, createImage, getImageById)"
Task: "Add getSessionOrNull to lib/auth-server.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (sharp + decision log).
2. Complete Phase 2: Foundational (schema, migration, DAL, auth helper) — CRITICAL, blocks all stories.
3. Complete Phase 3: User Story 1 (upload endpoint).
4. **STOP and VALIDATE**: Run T007's verification independently — an admin can upload and get back `{ id, url }`, and all three rejection paths behave correctly.
5. This is a usable MVP: uploads work and are stored, even before a public serving endpoint exists.

### Incremental Delivery

1. Setup + Foundational → foundation ready (dependency logged, table + migration + DAL + auth helper in place).
2. Add User Story 1 → verify independently (T007) → upload capability is real.
3. Add User Story 2 → verify independently (T009, T010), including the malformed-id correctness fix → images are now actually fetchable, publicly, forever.
4. Add User Story 3 → verify by inspection (T011, T012) → contract confirmed generic and ready for slices 2b/3.
5. Polish (Phase 6) → quality gate, route-table check, unaffected-rendering check, full quickstart pass.

### Solo Developer Strategy

Given this slice's small size (two Route Handlers, one table, one DAL module, one auth helper, one dependency), sequential execution in task order (T001→T016) is the simplest path — the parallel opportunities above matter mainly if the schema/migration (T002/T003) and the two handlers (T006/T008) are split across two people.

---

## Notes

- [P] tasks touch different files with no unmet dependency.
- [Story] labels map every user-story-phase task to its spec.md story for traceability.
- No task in this file was generated from a Test-First requirement — tests were not requested for this slice; verification is manual (`curl` + quickstart.md) plus the standard quality gate, per plan.md.
- The malformed-id 404 fix (T008 step 1, T009) is a correctness requirement, not an enhancement: without it, `GET /api/image/not-a-uuid` would surface a Postgres `22P02` error as an uncaught `500` via `withErrorHandling`, violating FR-016's "never a crash" requirement.
- Error status pins (401/413/400/404, all `{ message }`) are stated exactly in T006 and T008 to remove any "413 or 400" ambiguity for oversized uploads.
