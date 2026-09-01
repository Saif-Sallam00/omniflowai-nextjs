# Admin Image Upload — Phase 2, Slice 2a

**Status:** Draft (pending operator approval)
**Version:** 0.1
**Related decisions:** 010 (base64 data URIs in `text` columns; crawler-fetchable via dedicated Route Handler / INV-06), 013 (projects gain logo/media_image — future consumer)
**Depends on:** Phase 0 (auth, DB, schema plumbing), Phase 1 (however it renders article `cover_image` — see §Central decision)
**Extraction source:** `docs/phase-2-admin-extract.md` §3
**Blocks:** 2b (articles CRUD — sets `cover_image`), slice 3 (projects — multiple images)

## Overview

An isolated image-upload capability: an authenticated endpoint that accepts an image file, normalizes it (EXIF-rotate, resize, WebP), stores it as a base64 data URI in a `text` column, and returns a stable reference; plus a public endpoint that serves the stored image as real bytes at a fetchable URL. Built and verified on its own — no article form, no translation flow — so the hardest infrastructure piece of Phase 2 is proven before the CRUD forms consume it (2b for `cover_image`, slice 3 for projects' logo/media_image/cover).

This slice extracts the *mechanism* from OLD (`docs/phase-2-admin-extract.md` §3: multipart → in-memory buffer → `sharp` EXIF-rotate + resize ≤1600px + WebP q80 → base64 → `text` column), ported to a Next.js Route Handler.

## Problem statement

`articles.cover_image` is NOT NULL — 2b can't create an article without an image, so image upload must exist first. Solving it in isolation avoids building it inside the article form (and re-solving it inside the projects form). Doing it as a Route Handler (multipart), not a Server Action, sidesteps the Server Action body-size limit for the upload itself (FR-10.6 parked this; it's now needed).

## Central decision — what the endpoint stores and returns (READ FIRST)

Decision 010 says two things that must be reconciled: images are **base64 data URIs in a `text` column**, *and* they are **crawler-fetchable via a dedicated Route Handler** (INV-06). Two models fit the first clause; only one fits both:

**Recommended — dedicated `images` table + serving handler; consumers store a reference URL.**
- Upload handler: multipart → sharp → base64 data URI → INSERT into an `images` table (`data text` holds the `data:image/webp;base64,…` URI) → returns `{ id, url: "/api/image/{id}" }`.
- Serving handler `GET /api/image/{id}`: reads `images.data`, decodes the base64, returns the raw bytes with `Content-Type: image/webp` and an immutable cache header — publicly fetchable (satisfies INV-06).
- `articles.cover_image` (and later projects' image fields) store the short **reference URL**, not the megabyte data URI.

Why this over storing the data URI directly in `cover_image`:
1. **Dissolves the body-size limit permanently** — the article-save path (2b) carries a ~30-char URL, never a 100–400 KB string, so it doesn't matter whether the save is a Server Action.
2. **Satisfies INV-06 natively** — a stable `/api/image/{id}` is exactly the "dedicated Route Handler" decision 010 calls for, and gives Phase 3 a real `og:image` URL for free (a `data:` URI cannot be an OG image — social scrapers require an HTTP URL).
3. **Handles projects cleanly** — slice 3 has multiple images per project (logo, media_image, cover, decision 013); stable image ids beat threading several large data URIs through one form.
4. **Storage still matches decision 010** — the base64 data URI lives in a `text` column (`images.data`); only its *location* is a dedicated table rather than the consuming row.

**Alternative — inline: `cover_image` stores the data URI itself, page renders `<img src="data:…">`, no serving handler.** Simpler for 2a (one handler, no migration), but leaves the body-size risk on every save path, doesn't satisfy INV-06, and forces a painful Phase-3 retrofit (every stored image would need re-storing to become OG-fetchable). Not recommended.

**Confirm before `/plan` (the one real open item):** how does the *existing Phase 1 article page* render `cover_image` today — a plain `<img src={coverImage}>` (works with a reference URL unchanged → recommended model is purely additive), or something that assumes a `data:` URI specifically (validation, a data-URI-only code path)? If the latter, we reconcile at `/plan` (possibly a one-line decision-010 clarification). This is a single grep of the Phase 1 article/portfolio render path — cheap, and it de-risks the whole model.

The FRs below assume the recommended model.

## User stories

### US-1 — Admin uploads an image
As the admin, I can upload an image file to an authenticated endpoint and get back a stable URL, so the article/project forms can reference it.

### US-2 — The image is served as a real, fetchable file
As any client (browser, crawler, social scraper), I can fetch the stored image at its URL and receive proper image bytes, so images render in pages and in OG/meta later.

### US-3 — A downstream slice consumes the upload
As the developer of 2b/slice 3, I can call one upload endpoint and store its returned URL in an image column, without re-solving processing or storage.

## Functional requirements

### FR-1 — Upload endpoint
- FR-1.1: A Route Handler MUST accept `POST` of a single image as multipart form-data. It MUST NOT be a Server Action (avoids the body-size limit; matches OLD's multipart POST).
- FR-1.2: The endpoint MUST require a valid admin session. Unauthenticated requests MUST receive `401` (JSON), NOT a redirect — this is an API endpoint, not a page. (Note: the leads slice's `requireAuth()` redirects; that primitive is wrong here — a session check returning 401 is needed.)
- FR-1.3: The endpoint MUST enforce a maximum raw input size (recommend 5 MB). Oversized input MUST be rejected with `413` (or `400`) before processing, not after buffering unbounded data.
- FR-1.4: The endpoint MUST reject non-image / unparseable input with `400` (validated by content type and by `sharp` successfully decoding it — if `sharp` can't parse it, it's a `400`).

### FR-2 — Image processing (ported from OLD, `docs/phase-2-admin-extract.md` §3)
- FR-2.1: Auto-rotate per EXIF orientation, then strip EXIF.
- FR-2.2: Resize so the longest edge is ≤ 1600 px; never upscale a smaller image.
- FR-2.3: Encode to WebP at quality 80.
- FR-2.4: Produce a `data:image/webp;base64,…` data URI from the processed bytes.
- FR-2.5: The exact ceiling (1600) and quality (80) MUST match OLD unless `/plan` finds evidence to change them; they are not to be re-guessed.

### FR-3 — Storage
- FR-3.1: The data URI MUST be stored in a `text` column (decision 010). Per the Central decision, this lives in a dedicated `images` table (`id`, `data text` NOT NULL, `created_at timestamptz default now()`), added via a committed Drizzle migration (never `push`, per constitution).
- FR-3.2: The image `id` MUST NOT be trivially enumerable in a way that lets an outsider scrape the full image set (recommend UUID or similar rather than a bare serial). Final id strategy is a `/plan` detail.

### FR-4 — Serving endpoint
- FR-4.1: A Route Handler `GET /api/image/{id}` MUST return the decoded image bytes with `Content-Type: image/webp`.
- FR-4.2: This endpoint MUST be public (no auth) — crawler-fetchability (INV-06) requires it.
- FR-4.3: It MUST set an immutable, long-lived cache header (`Cache-Control: public, max-age=31536000, immutable`) — a given id's bytes never change.
- FR-4.4: A nonexistent id MUST return `404` (not a 200 with an empty/placeholder body).

### FR-5 — Data access
- FR-5.1: Image insert/read MUST live in a DAL module (e.g. `lib/db/images.ts`), matching the flat `lib/db/<entity>.ts` convention (`leads.ts`, `articles.ts`, `portfolio.ts`).

### FR-6 — Dependency
- FR-6.1: If `sharp` is not already in the NEW repo's dependency tree, adding it is a new-dependency decision requiring explicit justification per the constitution (Scope Discipline) and a decision-log entry — flagged, not added silently. (Justification is strong: same library OLD used, the standard Node image lib; EXIF-rotate + resize + WebP is infeasible to hand-roll.)

### FR-7 — Quality gate
- FR-7.1: `npm run check`, `npm run lint`, `npm run build` MUST all exit zero before the slice is accepted.

## Out of scope (deferred)

- **Article/project forms** consuming the upload — 2b and slice 3.
- **Orphan cleanup** (images whose referencing row was deleted or re-pointed) — deferred; flag as a known follow-up. A marketing site accumulates few images; not worth solving now (YAGNI).
- **OG/meta wiring** to image URLs — Phase 3. (This slice makes it *possible* by giving fetchable URLs; it does not wire metadata.)
- **Multiple-image UI, alt text, image library/reuse** — later, if needed.
- **Client-side cropping/editing** — not in OLD, not added.
- **CDN / external blob storage** — explicitly not; storage is Postgres `text` per decision 010.

## Assumptions

- Phase 0's DB plumbing and admin auth are in place; this slice adds an `images` table via migration and reads the admin session in Route Handlers.
- OLD's pipeline params (≤1600 px, WebP q80, EXIF-rotate) as captured in the extraction are the intended target.
- The recommended store/serve model is additive to Phase 1's article rendering — to be confirmed by the single pre-`/plan` grep in the Central decision.
- Admin is English-only; nothing here is language-specific.

## Acceptance criteria

1. **AC-1: Authed upload succeeds.** `POST` of a valid JPEG/PNG (with EXIF rotation) by an authenticated admin returns `200` with `{ id, url }`.
2. **AC-2: Processing correct.** `GET` of the returned url yields `Content-Type: image/webp`, correctly rotated, longest edge ≤ 1600 px, and smaller than the original.
3. **AC-3: Stored as data URI in text.** The `images` row holds a `data:image/webp;base64,…` value in a `text` column.
4. **AC-4: Upload is auth-gated.** `POST` without a valid admin session returns `401` (JSON), no image stored — not a redirect.
5. **AC-5: Oversized rejected.** `POST` above the size ceiling returns `413`/`400`, nothing stored.
6. **AC-6: Non-image rejected.** `POST` of a non-image / unparseable file returns `400`, nothing stored.
7. **AC-7: Serving is public + cached.** `GET /api/image/{id}` with no session returns `200` image bytes and an immutable cache header.
8. **AC-8: Missing image 404s.** `GET /api/image/{unknown}` returns `404`.
9. **AC-9: No new dependency unlogged.** If `sharp` was added, a decision-log entry justifies it; otherwise zero new dependencies.
10. **AC-10: Quality gate.** `check`, `lint`, `build` all exit zero.
11. **AC-11: Public rendering intact.** No public route group's static rendering changes; the serving handler is dynamic by nature but isolated.

## Notes for `/plan`

- **Pre-plan confirmation (do this first):** grep the Phase 1 article/portfolio render path for how `cover_image` is consumed (`<img src={…}>` vs a `data:`-specific assumption). Resolves whether the recommended model is purely additive.
- **`sharp` dependency:** confirm presence in the NEW tree; if absent, draft the decision-log entry (FR-6.1) — same handling as the 1A i18n-dependency flag.
- **Id strategy:** UUID vs serial vs content-hash (content-hash gives free dedup + perfectly immutable URLs, at slight complexity). Recommend non-enumerable.
- **Auth primitive for Route Handlers:** the 401-returning session check (FR-1.2) vs the redirecting `requireAuth()` used by pages/actions — confirm the correct Better Auth server call for a Route Handler context.
- **Size enforcement point:** ensure the ceiling is enforced on the incoming stream/parsed form, before fully buffering unbounded input (FR-1.3).
