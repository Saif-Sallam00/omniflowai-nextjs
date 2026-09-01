# Quickstart: Admin Image Upload (Phase 2, Slice 2a)

Validation guide for confirming this slice is complete. Maps to `spec.md`'s User Story acceptance scenarios and Success Criteria SC-001–SC-010. See `data-model.md` for shapes and `contracts/route-handlers.md` for per-endpoint behavior — not duplicated here.

## Prerequisites

- Phase 0 (auth, DB) and slice 004 (admin session pattern) already shipped.
- Local dev server running (`npm run dev`) or the target deployment reachable, with a valid admin session cookie available for authenticated requests (sign in at `/admin/auth` first, or reuse a session cookie from the browser).
- A test image file with non-default EXIF orientation (e.g. a phone photo taken sideways) to verify rotation; a file larger than 5 MB to verify the size ceiling; a non-image file (e.g. a renamed `.txt`) to verify content rejection.
- `sharp` added to `package.json` with its decision-log entry in place (FR-018) — confirm this before running the rest of the checklist, not after.

## Setup

1. **Generate and apply the migration**:
   ```
   npx drizzle-kit generate --name images_table
   ```
   Review the generated SQL (should be exactly one `CREATE TABLE "images" (...)`), then apply it against `DATABASE_URL_UNPOOLED` per this project's normal migration-application step. Never `drizzle-kit push`.

2. **Run the quality gate**:
   ```
   npm run check   # tsc --noEmit
   npm run lint    # eslint-config-next/core-web-vitals
   npm run build   # next build
   ```
   All three MUST exit zero (FR-021/SC-009).

## Verification steps (map to User Stories & Success Criteria)

| Check | Command / Action | Expected |
|---|---|---|
| Authed upload succeeds (US1 AC1 / SC-001) | `curl -b <admin-session-cookie> -F "file=@rotated-photo.jpg" http://localhost:3000/api/image` | `200`, JSON body `{ id, url }`, `url` matching `/api/image/{id}` |
| Unauthenticated upload rejected (US1 AC2 / SC-003) | Same request with no session cookie | `401`, JSON `{ message }` — not a redirect response |
| Oversized upload rejected before buffering (US1 AC3 / SC-004) | `curl -b <cookie> -F "file=@too-big.jpg" http://localhost:3000/api/image` (file > 5 MB) | `413` (or `400`), JSON `{ message }`, no row added to `images` |
| Non-image rejected (US1 AC4 / SC-005) | `curl -b <cookie> -F "file=@not-an-image.txt" http://localhost:3000/api/image` | `400`, JSON `{ message }`, no row added to `images` |
| Stored as data URI in text (AC-3, data-model.md) | Query the `images` table directly for the row just created | `data` column holds a `data:image/webp;base64,...` string |
| Public fetch succeeds, no auth (US2 AC1 / SC-006) | `curl -i http://localhost:3000/api/image/{id}` (no cookie) with the `id` from the successful upload above | `200`, real image bytes in the body |
| Correct content type + cache header (US2 AC2 / SC-002 / SC-006) | Inspect the same response's headers | `Content-Type: image/webp`; `Cache-Control: public, max-age=31536000, immutable` |
| Rotation + resize correct (US2 AC2 / SC-002) | Open the fetched bytes in an image viewer; compare to the original | Correctly rotated (matches the original's intended orientation, not its raw un-rotated pixels); longest edge ≤ 1600 px; file size smaller than the original phone/camera photo |
| Small image not upscaled (Edge Case) | Upload an image already smaller than 1600 px on its longest edge | Served image's dimensions are unchanged from the original — not stretched up to 1600 px |
| Unknown id 404s (US2 AC3 / SC-007) | `curl -i http://localhost:3000/api/image/00000000-0000-0000-0000-000000000000` (a well-formed but never-issued id) | `404`, JSON `{ message }` — not a `200` with empty/placeholder content |
| Upload endpoint has no content-specific parameters (US3 AC1) | Inspect `app/api/image/route.ts` | Accepts only the file field and the caller's session — no article/project id or other content-specific input anywhere in its signature |
| Returned reference is a short, storable string (US3 AC2) | Inspect a successful upload's `url` value | A short path string (`/api/image/{uuid}`), not the megabyte-scale image data itself — safe to store directly in an ordinary text column |
| No new dependency beyond the logged one (AC-9 / SC-008) | `git diff package.json` | Only `sharp` added, with its decision-log entry present in the project's decision log |
| Public rendering unaffected (AC-11 / SC-010) | `npm run build`, inspect the route table | All existing public/admin routes' markers unchanged from before this slice; `/api/image` and `/api/image/[id]` appear as new dynamic (`ƒ`) routes, isolated from the rest |
| Phase 1 rendering still works unmodified (spec Assumptions) | Load an existing article or portfolio page that has a `cover_image` | Renders exactly as before — this slice touches no public rendering code, confirming the "purely additive" assumption held |

## Done when

All rows above pass, all three User Stories' acceptance scenarios and SC-001–SC-010 hold (spec.md), and the migration is committed (not pushed) alongside a decision-log entry for `sharp`.
