# Route Handler Contracts: Admin Image Upload (Phase 2, Slice 2a)

Two Route Handlers, no Server Action, no page. Documented per spec FR-001–FR-021.

---

## `POST /api/image`

**Handler**: `app/api/image/route.ts` (new)
**Auth**: required. First statement calls `getSessionOrNull(request)` (`lib/auth-server.ts`, data-model.md) — a `null` result short-circuits to a `401` before any body parsing.
**Request**: `multipart/form-data` with one file field (`file`).
**Processing order**:
1. `getSessionOrNull(request)` — `null` → `401 { message }`, stop.
2. `request.headers.get("content-length")` fast-path check — over 5 MB → `413 { message }`, stop, no body read (research.md, Decision 3).
3. `await request.formData()`, extract the file field. Missing/wrong field → `400 { message }`.
4. Re-check the extracted `File`'s `.size` against 5 MB (backstop) — over → `413 { message }`, stop, `sharp` never invoked.
5. `Buffer.from(await file.arrayBuffer())` → `sharp(buffer).rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toBuffer()`. If `sharp` throws (undecodable input) → `400 { message }`, nothing stored (FR-005).
6. Base64-encode the processed buffer, prefix `data:image/webp;base64,`, `createImage(dataUri)` (`lib/db/images.ts`).
7. `200 { id: image.id, url: \`/api/image/${image.id}\` }`.
**Wrapping**: `withRequestLogging(withErrorHandling(...))`, matching `app/api/auth/[...auth]/route.ts` — structured stdout log line per request, any *unexpected* thrown error (not the deliberate 401/413/400 responses above, which are returned, not thrown) becomes a `500 { message }` with no stack trace in production (constitution: Logging, Deployment & Ops).
**Rendering**: N/A — API endpoint, not a page. Adds no route to any public or admin page tree.

## `GET /api/image/{id}`

**Handler**: `app/api/image/[id]/route.ts` (new)
**Auth**: none — intentionally public (FR-014, INV-06).
**Processing order**:
1. `getImageById(id)` (`lib/db/images.ts`). `null` → `404 { message }`.
2. Strip the `data:image/webp;base64,` prefix from the stored `data` value, `Buffer.from(base64Part, "base64")` to get raw bytes.
3. Return the bytes with `Content-Type: image/webp` and `Cache-Control: public, max-age=31536000, immutable` (FR-014/FR-015).
**Wrapping**: same `withRequestLogging(withErrorHandling(...))` pair as the upload handler, for the same constitutional logging/error-shape reasons. `withErrorHandling`'s `ctx: unknown` parameter type is compatible with this route's actual dynamic `RouteContext<'/api/image/[id]'>` context (a function accepting `unknown` safely satisfies a caller expecting a more specific type) — confirmed compatible, no separate unwrapped variant needed for the dynamic segment.
**Rendering**: dynamic by nature (a per-request lookup) — isolated to this one path, does not affect any other route's rendering mode (spec AC-11/SC-010).

---

## Cross-cutting: `lib/auth-server.ts`

**Modified** (not replaced) — adds `getSessionOrNull(request: Request): Promise<Session | null>` alongside the existing `requireAuth()` (unchanged, still used by pages/Server Actions elsewhere). `Session` is the same exported type `requireAuth()` already defines.

## Cross-cutting: `lib/db/schema.ts`

**Modified** (not replaced) — adds the `images` table export (data-model.md). No existing table, column, or enum is changed.

## Cross-cutting: `lib/db/images.ts` (new)

New flat DAL module: `Image` type, `createImage`, `getImageById` — matching `lib/db/leads.ts`'s existing shape and conventions exactly (data-model.md).

## Cross-cutting: `drizzle/` migration directory

**New migration file** added via `npx drizzle-kit generate` (never `drizzle-kit push`, per constitution) — the single `CREATE TABLE "images" (...)` statement for the new table. Committed to git like the two existing migration files (`0000_initial.sql`, `0001_case_study_schema.sql`).

## Cross-cutting: `package.json`

**Modified** — adds `sharp` as a new production dependency (FR-018). This addition MUST be accompanied by a decision-log entry justifying it (constitution Scope Discipline) at implementation time — this plan does not itself write that entry; it is a required implementation-phase action, carried forward from the spec, not optional.

## Cross-cutting: public route groups (`app/(en)/(public)/*`, `app/ar/**`) and the admin `(protected)` tree

**UNCHANGED.** Both new Route Handlers live under `app/api/image/`, a sibling of `app/api/health` and `app/api/auth`, not nested under any public or admin page route. Neither is reachable from, nor alters the rendering mode of, any existing page (spec AC-11/SC-010, verified in quickstart.md via the production build's route table).

---

## Error contract

Both handlers use the existing `{ message: string }` JSON shape (`lib/error-handler.ts`) for every non-2xx response, whether deliberately constructed (401/404/413/400) or the result of an unexpected thrown error caught by `withErrorHandling` (500, no stack trace in production) — no new error contract is introduced.
