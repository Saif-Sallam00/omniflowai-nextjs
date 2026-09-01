# Data Model: Admin Image Upload (Phase 2, Slice 2a)

**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

This slice introduces **one new table** via a committed Drizzle migration (generated, never pushed, per constitution) — no other schema changes. Shapes below extend `lib/db/schema.ts` and introduce a new flat DAL module, `lib/db/images.ts`, matching the existing `lib/db/leads.ts`/`lib/db/articles.ts`/`lib/db/portfolio.ts` convention.

## `images` table (new — `lib/db/schema.ts`)

```ts
export const images = pgTable("images", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  data: text("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
```

- `id`: Postgres-generated UUID (research.md, Decision 1) — same pattern as the existing `articles.translationGroupId`. Non-enumerable per FR-012.
- `data`: the full `data:image/webp;base64,...` string (decision 010's storage model) — always present, never null, never partially written (the row is only inserted after processing succeeds in full).
- `createdAt`: audit timestamp only; not used for any query logic in this slice.
- No foreign key to any consuming table (`articles`, `projects`) — a `Stored Image` is a standalone row that any future column can reference by id/URL. No relation is declared on either side; orphan-image cleanup is explicitly deferred (spec Out of Scope).

## Data-access module (new — `lib/db/images.ts`)

```ts
export type Image = typeof images.$inferSelect;

export async function createImage(data: string): Promise<Image> {
  const [image] = await db.insert(images).values({ data }).returning();
  return image;
}

export async function getImageById(id: string): Promise<Image | null> {
  const [image] = await db.select().from(images).where(eq(images.id, id)).limit(1);
  return image ?? null;
}
```

- Verb-first named exports, `type` alias, matching this file's siblings exactly (`lib/db/leads.ts`'s `createLead`/`getLeadById`-shaped functions are the direct template).
- `getImageById` returns `null` on no match (not a thrown error) — the serving Route Handler turns that into a `404`, the same "DAL returns `null`, caller decides the HTTP response" pattern already used by `updateLeadStatus`/`deleteLead` in slice 004.
- Neither function validates `id`'s shape (e.g. that it's a well-formed UUID) — an arbitrary string passed to `eq(images.id, id)` against a `uuid` column will simply fail to match any row (or Postgres will reject a non-UUID-shaped string with a driver-level error for an obviously malformed value); either outcome is handled by the serving handler treating "no row" as `404` (data-model note carried into contracts.md).

## Upload Route Handler — request/response shapes

```ts
// POST /api/image — request: multipart/form-data, one field "file"
// Success response body:
type UploadImageResponse = {
  id: string;
  url: string; // "/api/image/{id}"
};

// Error response body (401 / 400 / 413):
type UploadImageError = {
  message: string;
};
```

- `url` is constructed as `\`/api/image/${image.id}\`` — a plain string built from the DAL's returned `id`, not a separate stored column (there is nothing to store beyond the id itself; the URL shape is a route-naming convention, not data).
- Every non-2xx response uses the same `{ message: string }` shape already established for this codebase's Route Handler error contract (`lib/error-handler.ts`), so a caller doesn't need a second error-parsing convention for this endpoint.

## Serving Route Handler — response shape

```ts
// GET /api/image/{id} — no request body
// Success: raw image bytes, Content-Type: image/webp,
//          Cache-Control: public, max-age=31536000, immutable
// Not found: 404, { message: string } (same error shape as above)
```

- The success response is not JSON — it is the decoded binary bytes of the stored `data:image/webp;base64,...` value, reconstructed via `Buffer.from(base64Part, "base64")` after stripping the `data:image/webp;base64,` prefix.

## Auth primitive — `lib/auth-server.ts` addition

```ts
// ADDED, alongside the existing requireAuth() (unchanged)
export async function getSessionOrNull(request: Request): Promise<Session | null> {
  return auth.api.getSession({ headers: request.headers });
}
```

- Reuses the `Session` type already defined in this file for `requireAuth()`'s return type (`NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>`) — `getSessionOrNull`'s return type is that same type unioned with `null`, not a new type.
- Called only by the upload handler (FR-003); the serving handler calls nothing here at all — it is intentionally public (FR-014).

## Relationships

```
Stored Image (images table, new)
   └─ created by → upload Route Handler (POST /api/image) ──sharp pipeline──> createImage(dataUri)
   └─ read by → serving Route Handler (GET /api/image/{id}) ──getImageById(id)──> decoded bytes, or 404

Image Reference URL ("/api/image/{id}")
   └─ returned by → the upload Route Handler's success response
   └─ intended future consumer → articles.coverImage / projects.logo,mediaImage,coverImage columns
      (NOT modified by this slice — those columns already exist and already store a plain string;
      a later slice, not this one, is what actually writes an "/api/image/{id}" value into them)
```

No entity here has an update path — a `Stored Image` row, once created, is only ever read (by the serving handler) or left alone; this slice provides no delete/edit operation on `images` (matching FR-019's exclusion of any cleanup mechanism).
