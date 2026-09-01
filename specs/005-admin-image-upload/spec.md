# Feature Specification: Admin Image Upload (Phase 2, Slice 2a)

**Feature Branch**: `005-admin-image-upload`

**Created**: 2026-08-31

**Status**: Draft

**Input**: User description: "Phase 2, Slice 2a — Admin Image Upload: authenticated multipart upload Route Handler that normalizes images via sharp (EXIF-rotate, resize, WebP) and stores them as base64 data URIs in a dedicated images table, plus a public serving Route Handler at /api/image/{id}. Authoritative source: docs/image-upload-slice-spec.md (approved)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin uploads an image and receives a stable reference (Priority: P1)

As the admin, I upload an image file to an authenticated endpoint and get back a stable URL, so the article and project forms being built in later slices can reference it.

**Why this priority**: This is the foundational capability the whole slice exists to deliver — until an image can be uploaded and normalized at all, there is nothing to serve and nothing for a downstream form to consume. Every other story depends on this one existing.

**Independent Test**: Can be fully tested by signing in as admin and submitting a valid image file (including one with non-default EXIF orientation) directly to the upload endpoint, and confirming a success response containing a stable id and URL — independent of the serving endpoint or any consuming form.

**Acceptance Scenarios**:

1. **Given** a valid JPEG or PNG file with EXIF rotation data, **When** the admin submits it to the upload endpoint while signed in, **Then** the response indicates success and includes a stable identifier and a URL that can be used to fetch the processed image later.
2. **Given** no valid admin session, **When** the same file is submitted to the upload endpoint, **Then** the request is rejected as unauthorized, in a form appropriate to an API caller (not a redirect to a sign-in page), and no image is stored.
3. **Given** a file larger than the configured size ceiling, **When** it is submitted, **Then** the request is rejected before the full file is read into memory, and no image is stored.
4. **Given** a file that is not a valid, decodable image (e.g. a renamed text file, or corrupt image data), **When** it is submitted, **Then** the request is rejected as invalid, and no image is stored.

---

### User Story 2 - The uploaded image is served as a real, fetchable file (Priority: P2)

As any client — a visitor's browser, a search-engine crawler, or a social-media link-preview scraper — I can fetch a stored image at its returned URL and receive real image bytes, so the image actually renders wherever it's referenced, now and in future metadata use.

**Why this priority**: Serving is what makes an uploaded image usable at all; it depends on User Story 1 having produced a stored image to serve, but is a distinct capability with its own correctness requirements (public reachability, caching, correct content type) worth verifying on its own.

**Independent Test**: Can be fully tested by fetching the URL returned by a prior upload (or by a directly-seeded stored image) with no session/credentials at all, and confirming real, correctly processed image bytes come back with appropriate caching — independent of whether the request originates from the same session that performed the upload.

**Acceptance Scenarios**:

1. **Given** a previously uploaded image's URL, **When** it is fetched with no authentication of any kind, **Then** the response succeeds and returns the actual image bytes, not a redirect, an error, or a placeholder.
2. **Given** that same fetch, **When** the response is inspected, **Then** it declares an image content type, is marked cacheable for a very long time in a way that indicates the content at that URL never changes, and the image is correctly rotated with its longest edge no greater than the configured ceiling.
3. **Given** a URL referencing an id that was never uploaded (or no longer exists), **When** it is fetched, **Then** the response is a not-found error, never a success with an empty or placeholder body.

---

### User Story 3 - A downstream slice can consume the upload mechanism without re-solving it (Priority: P3)

As the developer of the article-editing slice (2b) or the projects slice (3), I can call one upload endpoint and store its returned URL in an image column, without re-implementing image processing, storage, or serving myself.

**Why this priority**: This story's payoff is fully realized only once those later slices exist and actually integrate against this one, so it can't be exercised as a live end-to-end user journey today — but the mechanism's shape (a single, generically-callable endpoint returning a stable, storable reference) is itself something this slice must get right and can verify now, independent of any consuming form existing yet.

**Independent Test**: Can be fully tested today by confirming, via inspection, that the upload endpoint accepts a single image with no article/project-specific parameters, and that its returned reference is a plain string short enough to store directly in a normal database column — without needing 2b's or slice 3's own forms to exist.

**Acceptance Scenarios**:

1. **Given** the upload endpoint's contract, **When** it is inspected, **Then** it requires nothing beyond the image file itself and a valid admin session — no article id, no project id, no other content-specific input.
2. **Given** a successful upload's returned URL, **When** its length and shape are inspected, **Then** it is a short, stable reference (not the megabyte-scale processed image data itself) suitable for storing directly in an ordinary text/URL column on any future consuming table.

---

### Edge Cases

- A file at or just under the size ceiling is accepted; a file just over it is rejected without the server having read the entire file into memory first.
- An image smaller than the resize ceiling on its longest edge is stored at its original dimensions — it is never upscaled.
- A file with a valid image extension but corrupt or unparseable contents is rejected the same way as a non-image file, on the same terms as User Story 1's acceptance scenario 4.
- Two different uploads of visually identical source images may or may not produce the same stored id — this is left unconstrained (an implementation detail for the planning phase), but each id, once issued, always serves the same bytes forever.
- An id that is well-formed but was never actually issued by the upload endpoint is treated identically to a malformed id: both are not-found, never a crash or a 200 with empty content.
- Guessing or incrementing from one known image id must not make it meaningfully easier to discover other stored images' ids.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide an endpoint that accepts a single image file uploaded as multipart form data over `POST`.
- **FR-002**: The upload endpoint MUST NOT be implemented as a Server Action — it must be a mechanism that is not subject to the smaller body-size ceiling that applies to Server Actions, since an original, unprocessed image file can exceed that ceiling.
- **FR-003**: The upload endpoint MUST require a valid admin session. An unauthenticated request MUST receive a rejection response appropriate to a programmatic API caller (a structured error, not a redirect to a sign-in page), and MUST NOT store anything.
- **FR-004**: The upload endpoint MUST enforce a maximum accepted input size (a 5 MB ceiling is the recommended default). A request whose input exceeds this ceiling MUST be rejected before the full input is buffered into memory, and MUST NOT store anything.
- **FR-005**: The upload endpoint MUST reject input that is not a valid, decodable image, and MUST NOT store anything in that case. Validity MUST be determined by actually attempting to decode the image content, not merely by trusting a client-supplied content type or file extension.
- **FR-006**: On a valid upload, the system MUST automatically rotate the image according to its embedded EXIF orientation data, then remove the EXIF metadata from the stored result.
- **FR-007**: On a valid upload, the system MUST resize the image so its longest edge is no greater than 1600 pixels. An image whose longest edge is already at or below 1600 pixels MUST be left at its original dimensions — it MUST NOT be upscaled.
- **FR-008**: On a valid upload, the system MUST encode the final processed image as WebP at quality level 80.
- **FR-009**: The processed image MUST be represented as a `data:image/webp;base64,...` data URI before storage.
- **FR-010**: The 1600-pixel resize ceiling and quality-80 WebP encoding MUST be treated as fixed, carried-forward values from the prior implementation being ported, not re-derived or re-guessed.
- **FR-011**: The processed image's data URI MUST be persisted in a text-typed column, in a dedicated store separate from any article, project, or other content row — never embedded directly inside a content row's own image field.
- **FR-012**: Each stored image MUST be assigned an identifier that is not trivially enumerable — an outsider must not be able to guess or increment their way through the full set of stored images from one known identifier.
- **FR-013**: On a successful upload, the system MUST return a stable identifier and a short reference URL that can be used to fetch the processed image later; it MUST NOT return the raw processed image data itself in place of a reference.
- **FR-014**: The system MUST provide a public endpoint that, given a stored image's identifier, returns the decoded image bytes with an image content type. This endpoint MUST require no authentication of any kind, since it must remain fetchable by search-engine crawlers and social-media link-preview scrapers.
- **FR-015**: The public serving endpoint MUST mark its response as cacheable for a very long, effectively permanent duration, reflecting that a given identifier's bytes never change once stored.
- **FR-016**: The public serving endpoint MUST return a not-found response for an identifier that does not correspond to any stored image — never a success response with an empty or placeholder body.
- **FR-017**: Image storage and retrieval logic MUST live in one dedicated data-access module, separate from the page/route code that calls it, following the same one-module-per-entity pattern already established for other stored entities in this project.
- **FR-018**: This slice MUST add image-processing capability as a new project dependency (the standard library this project's prior implementation used for exactly this purpose is not presently part of this codebase). Because this is a new dependency, its addition MUST be recorded as an explicit, justified decision-log entry at the time this slice is implemented — it MUST NOT be added silently without that record.
- **FR-019**: This slice MUST NOT introduce any article-editing or project-editing form, any UI for browsing or reusing previously uploaded images, any image cropping/editing capability, or any cleanup mechanism for images no longer referenced by any content row.
- **FR-020**: This slice MUST NOT wire any uploaded image's URL into page metadata (social preview / "og" tags) — it only makes doing so possible in a later phase by producing a fetchable URL.
- **FR-021**: The project's standard quality gate (type check, lint, production build) MUST pass with zero errors before this slice is considered complete.

### Key Entities

- **Stored Image**: A single processed image — an identifier, the processed image's data URI (WebP, EXIF-stripped, resized, base64-encoded), and a capture timestamp. Created only by a successful upload; never edited once created. Not directly tied to any specific article or project — it is a standalone, reusable reference that any future content row can point to.
- **Image Reference URL**: The short, stable string (built from a stored image's identifier) that a consuming content row stores in its own image column, in place of the image data itself.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An admin can upload a valid image and receive a usable reference URL in a single request, with no manual follow-up step needed before that URL is fetchable.
- **SC-002**: 100% of successfully uploaded images are served back rotated correctly per their original orientation, at no more than the configured maximum dimension, and smaller in file size than a typical unprocessed photo from a modern phone or camera.
- **SC-003**: Zero uploads succeed without a valid admin session; the rejection is immediate and does not silently store anything.
- **SC-004**: Zero oversized uploads result in the full file being read into server memory before rejection.
- **SC-005**: Zero non-image or corrupt files result in a stored image row.
- **SC-006**: Every successfully stored image remains fetchable by an unauthenticated request indefinitely, with a response that a browser, crawler, or scraper can cache essentially forever.
- **SC-007**: 100% of requests for a nonexistent image identifier receive a clear not-found response, never a silent empty success.
- **SC-008**: If a new image-processing dependency is introduced by this slice, it is accompanied by a written justification at the time of implementation, not added without explanation.
- **SC-009**: The project's quality gate (type check, lint, production build) exits with zero errors.
- **SC-010**: Introducing this slice produces zero change in which public (non-admin) pages render as static output — the new endpoints are additive and isolated.

## Assumptions

- **Store/serve model (resolved, not open)**: a dedicated store for processed images, separate from the rows that reference them, with its own public-fetch endpoint, is the confirmed model for this slice — not the simpler alternative of embedding the image data directly inside each referencing row. This was the one explicitly flagged open question in the originating feature document, pending a check of how the existing public pages consume their current image field; that check has been performed and confirmed this model is purely additive to the existing pages (they already treat that field as an opaque, directly-usable image source with no format-specific assumption), so it is treated here as settled, not a pending clarification.
- **Existing public rendering is unaffected**: no public-facing page requires any change as a result of this slice; this slice is purely new, additive surface area (the two new endpoints).
- **The prior implementation's processing parameters are the target**: the 1600-pixel resize ceiling, WebP quality 80, and EXIF auto-rotate-then-strip behavior are carried forward unchanged from the system this project is replacing, not reconsidered here.
- **A new image-processing dependency is expected and pre-justified**: this slice's own functional requirements (EXIF handling, resizing, WebP encoding) are not reasonably achievable without a dedicated image-processing library, and no such library exists in this project yet. Adding one is anticipated, not merely possible — the required action is producing the decision-log record for it, not deciding whether to add it.
- **A schema change is in scope**: a new, dedicated table for stored images is expected, added through this project's normal committed-migration process rather than any ad hoc schema sync.
- **Admin is English-only**: nothing in this slice is language-specific; it follows the same English-only admin assumption already established for the admin area generally.
- **Deferred, explicitly out of scope for this slice**: any article- or project-editing form that consumes this upload endpoint (later slices), cleanup of images that become unreferenced, wiring uploaded images into page/social metadata, any multi-image browsing or reuse UI, alt-text handling, client-side image cropping or editing, and any storage location other than this project's own database.
- **Carried-forward project conventions** (apply to how this slice is implemented, not to its user-facing behavior): kebab-case file names, default-export page/layout modules, verb-first named exports for helper functions, `type` aliases rather than `interface` declarations, the project's internal path alias exclusively for internal imports, and strict type-checking throughout.
- **Left open for the planning phase**: the exact identifier strategy for stored images (e.g. a randomly generated identifier vs. one derived from the image's own content), the precise mechanism used to check a caller's session validity inside these endpoints (as distinct from the redirect-based mechanism already used for authenticated pages, which is not appropriate here), and the exact point in request handling where the size ceiling is enforced. All three are implementation-mechanism choices, not user-facing behavior, and are intentionally left for `/plan` to resolve.
