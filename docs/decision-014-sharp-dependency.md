# Decision 014 — Add `sharp` as a new production dependency

**Date:** 2026-09-01
**Status:** Locked
**Type:** New dependency (constitution Scope Discipline)
**Related:** Phase 2, Slice 2a (Admin Image Upload) — spec FR-018, plan.md's Dependency check (research.md)

## Why this is a governed change, not a silent `npm install`

The constitution's Scope Discipline principle requires any new project dependency to be recorded as an explicit, justified decision-log entry at the time it's added — not introduced silently inside an implementation slice. Slice 2a's own spec (FR-018) anticipates and requires this exact record.

## What's being added

`sharp` (`^0.35.4`), a production dependency, for server-side image processing in the new upload Route Handler (`app/api/image/route.ts`):

- EXIF-aware auto-rotation (`.rotate()`), followed by stripping EXIF metadata from the output (sharp's default WebP output omits metadata unless `.withMetadata()` is called).
- Resizing so the longest edge is capped at 1600px, without ever upscaling (`.resize(1600, 1600, { fit: "inside", withoutEnlargement: true })`).
- Re-encoding to WebP at quality 80 (`.webp({ quality: 80 })`).

## Why it's needed

Per FR-006–FR-010, the upload endpoint must perform EXIF-orientation-aware rotation, bounded resizing, and WebP re-encoding on every uploaded image. No library already present in this codebase (`drizzle-orm`, `better-auth`, Next's native `Request`/`FormData`) provides any image-decoding or image-processing capability, and hand-rolling EXIF parsing, resizing, and WebP encoding is infeasible and far out of proportion for this slice. `sharp` is the standard, actively-maintained library for exactly this job in a Node.js server context, and is the same library the prior implementation being replaced already used for this purpose (spec Assumptions: "the prior implementation's processing parameters are the target").

Confirmed via direct inspection of `package.json` before this change: `sharp` was not present anywhere in this codebase's dependencies (research.md's Dependency Check).

## Alternatives considered

| Option | Rejected because |
|---|---|
| `jimp` (pure-JS image processing) | No native EXIF-orientation auto-rotate support as direct as sharp's `.rotate()`; slower, pure-JS decode/encode path is a worse fit for a server-side upload endpoint's per-request processing cost. |
| Hand-rolled EXIF parsing + a minimal resize/WebP encode via a lower-level binding | Reinvents a well-solved problem or duplicates responsibilities cheaply available in a single mature library — no benefit for a low-traffic, single-purpose marketing-site upload endpoint. |
| No new dependency; store the raw uploaded file unprocessed | Fails FR-006–FR-010 outright — no EXIF rotation, no resize ceiling, no WebP conversion, undermining SC-002's file-size and orientation guarantees. |

## Scope

This dependency is used only by `app/api/image/route.ts`. It introduces no new environment variable, no new build step, and no change to any existing table, route, or page.
