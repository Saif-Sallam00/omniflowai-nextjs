# Feature Specification: Admin Articles CRUD (Phase 2, Slice 2b)

**Feature Branch**: `006-admin-articles-crud`

**Created**: 2026-09-01

**Status**: Draft

**Input**: User description: "Phase 2, Slice 2b — Admin Articles CRUD: add admin create/edit/delete for articles, with bilingual EN↔AR management via translation_group_id, cover-image and inline-body-image upload through the Slice 2a endpoint, Markdown body editing, draft/publish control, and draft preview. Authoritative source: docs/articles-crud-slice-spec.md (approved). Grounding extraction: docs/articles-crud-extract.md."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin creates a new article (Priority: P1)

As the admin, I open a full-page create form, choose the language, enter title / slug / excerpt / cover image / Markdown body / optional related project / optional related solution / publish state, and save — producing a valid article row that the public site can render.

**Why this priority**: Nothing else in this slice has anything to act on until an article can actually be created. The `articles` table is currently populated only by seed data — this is the first capability that lets the admin author a real row at all, and every other story (list, edit, delete, pairing) depends on at least one row existing.

**Independent Test**: Can be fully tested by signing in as admin, opening the create form, filling every field (including uploading a cover image via Story 6's mechanism), saving, and confirming — by inspecting the database directly — that a valid row was inserted with the entered values and a freshly generated translation group identifier.

**Acceptance Scenarios**:

1. **Given** the admin opens the create form with no prior context, **When** they fill in language, title, slug, excerpt, cover image, body, and publish state, and save, **Then** a new article row is created with a newly generated translation-group identifier and the chosen language, and it renders correctly on the matching public list/detail page once published.
2. **Given** the admin is entering a title on a fresh create form, **When** they have not yet touched the slug field, **Then** the slug is auto-generated from the title using rules appropriate to the chosen language, and remains a plain editable field afterward (never locked).
3. **Given** the admin enters a slug containing characters invalid for the chosen language (e.g. uppercase or spaces in an English slug), **When** they attempt to save, **Then** the save is rejected with a clear, specific explanation, not a generic or server-level error.
4. **Given** the admin chooses Arabic as the language, **When** they enter a slug using Arabic-script characters, **Then** the slug is accepted.

---

### User Story 2 - Admin lists all articles, grouped by translation concept (Priority: P2)

As the admin, I see every article — drafts included — in a list **grouped by translation concept**, one line per conceptual article showing its English and Arabic versions side by side (with per-language title, publish state, and actions), so I can see at a glance which concepts have both languages and which are missing one.

**Why this priority**: Once articles can be created (Story 1), the admin needs a way to actually find and manage them — this is the primary navigation surface for every other story (edit, delete, add-counterpart all start from a list row).

**Independent Test**: Can be fully tested by seeding a mix of English-only, Arabic-only, and fully-paired articles (via Story 1) and confirming the list shows one row per translation concept, correctly reflecting each language's presence, title, and publish state, ordered with the most recently changed concept first.

**Acceptance Scenarios**:

1. **Given** a mix of published and draft articles across both languages, **When** the admin opens the articles list, **Then** every article appears (drafts included), grouped one row per translation concept, each present language showing its own title and publish/draft state.
2. **Given** a translation concept that has only an English row and no Arabic counterpart, **When** the admin views that row, **Then** the Arabic side of the row offers an explicit "add the missing version" action instead of appearing blank or broken.
3. **Given** several translation concepts with different last-edited times, **When** the admin views the list, **Then** the concept edited most recently appears first.

---

### User Story 3 - Admin edits an existing article (Priority: P3)

As the admin, I open an existing article (one language at a time) in a full-page edit form, change any field, and save — without affecting its paired counterpart.

**Why this priority**: Authoring is rarely one-shot — typos, updated copy, and re-publishing require editing. This depends on Story 1 (something to edit) and benefits from Story 2 (a way to find it), but is its own distinct, independently verifiable capability.

**Independent Test**: Can be fully tested by creating a paired English/Arabic article (Stories 1 and 5), editing only the English row's title and body, saving, and confirming the English row reflects the change while the Arabic row is completely unchanged.

**Acceptance Scenarios**:

1. **Given** an existing article row, **When** the admin changes any field and saves, **Then** the change is persisted to that row only, its paired counterpart (if any) is left completely unchanged, and the row's last-updated marker advances to now.
2. **Given** an article being re-saved without any slug change, **When** the admin submits the edit form, **Then** the save succeeds and is not incorrectly rejected as a duplicate-slug conflict against itself.
3. **Given** an edit that changes the slug to one already used by another article in the same language, **When** the admin saves, **Then** the save is rejected with a clear, specific explanation.

---

### User Story 4 - Admin deletes an article (Priority: P4)

As the admin, I delete a single language's article row with a confirmation step; its paired counterpart (if any) is left untouched.

**Why this priority**: A necessary but comparatively rare and lower-risk-of-daily-use operation compared to create/list/edit — it rounds out the CRUD set but is not blocking for the slice's core authoring value.

**Independent Test**: Can be fully tested by creating a paired article, deleting only the English row (confirming the prompt), and verifying the English row is gone from the database while the Arabic row still exists untouched.

**Acceptance Scenarios**:

1. **Given** an existing article row, **When** the admin chooses to delete it, **Then** they are shown an explicit confirmation step before anything is removed.
2. **Given** the admin confirms deletion of one language's row from a paired article, **When** the deletion completes, **Then** only that row is removed and its paired counterpart remains fully intact.

---

### User Story 5 - Admin adds the other-language version of an existing article (Priority: P5)

As the admin, from a grouped list row that has only one language, I click "Add Arabic version" (or "Add English version") and get a create form pre-linked to the **same translation concept** and the missing language, so the two rows are paired without me managing identifiers by hand.

**Why this priority**: This is the payoff of the bilingual data model, but it is a refinement on top of create (Story 1) and list (Story 2) rather than a blocking dependency for either — an admin can already produce single-language content without it.

**Independent Test**: Can be fully tested by creating an English-only article (Story 1), using the list's (Story 2) "add missing version" action on it, filling in the Arabic form, saving, and confirming the new row shares the original's translation-group identifier and appears as one paired row in the list.

**Acceptance Scenarios**:

1. **Given** a translation concept with only one language present, **When** the admin uses its "add the missing language" action, **Then** a create form opens already linked to that same concept and pre-set to the missing language.
2. **Given** the admin completes and saves that pre-linked form, **Then** a second row is created sharing the original translation-group identifier, in the previously-missing language, and the list now shows both languages on one row.
3. **Given** a translation concept that unexpectedly already has both languages by the time the admin saves the "add missing version" form (a race), **When** the save is attempted, **Then** it is rejected with a clear, specific explanation rather than corrupting or duplicating data.

---

### User Story 6 - Admin uploads a cover image and inline body images (Priority: P6)

As the admin, when I choose a cover image it uploads immediately and the returned reference is stored in the form; and while editing the Markdown body I can insert an image at the cursor that uploads the same way.

**Why this priority**: A cover image is required for every article, so in practice this capability is exercised the first time Story 1 is used — it is called out as its own story because it is a distinct, independently verifiable mechanism (shared between the create and edit forms, and between the cover field and the body editor) rather than because it can be meaningfully deferred.

**Independent Test**: Can be fully tested by opening the create or edit form, selecting a cover image file, confirming it uploads immediately and a preview appears; separately, placing the cursor in the body editor, inserting an image, and confirming a Markdown image reference appears at the cursor and later renders correctly in the published article.

**Acceptance Scenarios**:

1. **Given** the admin selects a file in the cover-image control, **When** the upload completes, **Then** a stable, short reference to the processed image is stored in the form (not the image data itself), and a preview of the image is shown.
2. **Given** the admin places the cursor at a point in the Markdown body and uses the "insert image" action, **When** the upload completes, **Then** a Markdown image reference is inserted at that exact cursor position, using the same short, stable reference form as the cover image.
3. **Given** an article saved with a cover image and one or more inline body images, **When** the published article is viewed publicly, **Then** every image — cover and inline — renders correctly.

---

### User Story 7 - Admin controls publish state and first-publish date (Priority: P7)

As the admin, I can save an article as a draft or published; the first-publication date is stamped once and never re-bumped by later edits, so the public "latest articles" ordering stays correct.

**Why this priority**: This is a data-integrity refinement layered on top of create/edit (Stories 1 and 3) rather than a separate user-facing surface — it matters for correctness of the public site's ordering, but an admin can create and edit articles productively before this specific guarantee is verified.

**Independent Test**: Can be fully tested by creating a draft, publishing it (confirming a publish date is stamped), editing it again while it remains published (confirming the date does not move), and separately confirming an admin-supplied explicit publish date is honored as given.

**Acceptance Scenarios**:

1. **Given** a new article saved as a draft, **When** it is saved, **Then** it has no publish date.
2. **Given** a draft being published for the first time, **When** it is saved as published, **Then** a publish date is stamped at that moment.
3. **Given** an already-published article, **When** the admin edits and re-saves it (still published), **Then** its original publish date does not change.
4. **Given** the admin explicitly supplies a publish date (e.g. to back-date an article), **When** the article is saved, **Then** that supplied date is honored exactly, overriding the automatic stamping behavior.
5. **Given** two paired articles in different languages, **When** one is published and the other remains a draft, **Then** both states are allowed to coexist with no error or forced correction.

---

### User Story 8 - Admin previews a draft before publishing (Priority: P8)

As the admin, I can open a draft's public page in a new tab and see it render (drafts are visible to a signed-in admin, hidden from the public), so I can check it before flipping it to published.

**Why this priority**: A quality-of-life check before publishing, valuable but not required for the core authoring loop to function — the underlying draft-visibility behavior already exists on the public site from an earlier phase; this story is about surfacing it, not building it.

**Independent Test**: Can be fully tested by creating a draft, using its "preview" action, confirming it renders correctly for the signed-in admin, then confirming the same URL returns not-found for a signed-out visitor and does not leak the draft's real title in page metadata.

**Acceptance Scenarios**:

1. **Given** a draft article and a signed-in admin, **When** the admin opens the draft's preview, **Then** the article renders normally in a new tab.
2. **Given** that same draft URL, **When** it is requested by a signed-out visitor, **Then** the response is not-found, and no page metadata reveals the draft's real title or content.

---

### Edge Cases

- Creating a counterpart for a translation concept that, by the time of save, already has a row in the target language (a race between two admin actions, or a stale "add missing version" link) is rejected with a clear explanation, never a silent overwrite or a raw database error.
- An attempt to save a duplicate slug within the same language — on create, or on edit to a slug another row already owns — is rejected with a clear explanation; re-saving a row without changing its own slug is never mistaken for a clash against itself.
- A translation concept with only one language ever populated (no counterpart ever added) remains a fully valid, permanently supported state — pairing is optional, not eventually enforced.
- The two rows of a paired article may sit in different publish states indefinitely (one live, one draft) with no warning or forced correction.
- Deleting one language's row never removes, hides, or otherwise affects its counterpart.
- A cover image is required to save any article; an image field left empty is rejected before anything is written.
- An oversized, non-image, or corrupt file selected for either the cover image or an inline body image is rejected at the point of upload, before it can be attached to the form.
- A signed-out visitor requesting a draft's public URL always receives not-found, regardless of how they reached the link.

## Requirements *(mandatory)*

### Functional Requirements

**FR-1 — Admin list (grouped)**
- **FR-1.1**: The system MUST provide an admin-only list view reachable only to a signed-in admin.
- **FR-1.2**: The list MUST be grouped by translation concept — one row per concept, presenting each present language's title, publish/draft state, and available actions (edit, delete, open public page/preview).
- **FR-1.3**: When a concept is missing a language, that side of the row MUST show an explicit "add the missing language" action leading into the counterpart-creation flow (User Story 5).
- **FR-1.4**: Concepts MUST be ordered by their most-recently-updated article, descending, since a draft has no publish date to order by.
- **FR-1.5**: The admin navigation MUST include an entry for the articles list.

**FR-2 — Create**
- **FR-2.1**: The system MUST provide a dedicated, full-page create view (not an overlay/modal).
- **FR-2.2**: The create form MUST collect: language, title, slug, excerpt, cover image, Markdown body, publish state, and optional related-project and related-solution selections.
- **FR-2.3**: On submit, the system MUST validate all input, enforce slug rules (FR-7), create the row, apply publish-date stamping (FR-5), and surface any error back to the form (FR-11) rather than failing silently or with a raw system error.
- **FR-2.4**: A fresh create with no prior linkage MUST be assigned a newly generated translation-group identifier automatically, with no manual input required from the admin.

**FR-3 — Add counterpart (pairing)**
- **FR-3.1**: The create flow MUST support being pre-linked to an existing translation concept and a specific target language, for use by the "add missing language" action (FR-1.3).
- **FR-3.2**: Creating a counterpart MUST insert the new row under the same translation-group identifier as the concept it is completing, in the specified language.
- **FR-3.3**: If the target concept unexpectedly already has a row in the requested language by the time of save, the system MUST reject the save with a clear, specific explanation rather than a raw system error or silent overwrite.
- **FR-3.4**: The two languages of a concept MUST remain independent otherwise — neither language's existence is required for the other, and no action on one cascades to the other.

**FR-4 — Edit / Delete**
- **FR-4.1**: The system MUST provide a dedicated, full-page edit view that loads a single existing article and pre-fills the form with its current values.
- **FR-4.2**: Editing MUST operate on exactly one language's row at a time; saving one row's changes MUST NOT alter its paired counterpart in any way.
- **FR-4.3**: Saving an edit MUST validate input, enforce slug rules (FR-7, excluding the row's own current slug from the duplicate check), apply publish-date stamping (FR-5), and advance the row's last-updated marker to the moment of the save (needed for the list ordering in FR-1.4).
- **FR-4.4**: Deleting an article MUST require an explicit confirmation step before anything is removed, MUST remove only the targeted language's row, and MUST leave any paired counterpart completely untouched.

**FR-5 — Publish state and first-publish stamping**
- **FR-5.1**: Publish state MUST be controlled per row; the two languages of a concept MAY be in different publish states simultaneously, and the system MUST NOT prevent or warn against this. The grouped list (FR-1.2) MUST reflect each language's state independently.
- **FR-5.2**: The system MUST stamp a publish date following "first-publish-only" behavior: an admin-supplied explicit publish date always takes precedence; otherwise, the first time a row becomes published it is stamped with the current moment; a row that is not (or not yet) published keeps whatever publish date it already has (typically none); and re-saving an already-published row MUST NOT change its existing publish date.
- **FR-5.3**: This stamping behavior MUST be applied consistently as a single enforced rule for every create and update, not left to each entry point to reimplement.

**FR-6**: *(reserved — pairing/publish behaviors are covered by FR-1, FR-3, FR-4, and FR-5 above)*

**FR-7 — Slug handling**
- **FR-7.1**: Slug validation MUST be language-aware: an English-language slug MUST consist only of lowercase letters, digits, and single hyphens between words (no leading, trailing, or doubled hyphens, no spaces); an Arabic-language slug MUST permit Arabic-script characters, digits, and single hyphens, with no spaces.
- **FR-7.2**: On create, the slug MUST be automatically generated from the title, using rules appropriate to the row's language; the generated slug MUST remain a plain, freely editable field afterward and MUST NOT be locked once set.
- **FR-7.3**: Slug uniqueness MUST be enforced per language (an English slug and an Arabic slug may coincide without conflict). Before saving, the system MUST check for an existing row with the same slug in the same language and, on a clash, reject the save with a clear, specific explanation rather than a raw system error; on an edit, this check MUST exclude the row's own existing slug.
- **FR-7.4**: The English and Arabic slugs of a paired concept MAY differ freely; there is no requirement that they match.

**FR-8 — Cover image**
- **FR-8.1**: A cover image MUST be required to save any article — a create or edit with no cover image set MUST be rejected.
- **FR-8.2**: Selecting a cover image MUST upload it immediately (not deferred until the article itself is saved), and the form MUST store only a short, stable reference to the processed result — never the raw image data, and never a bare identifier without the reference format needed to fetch it.
- **FR-8.3**: The cover-image control SHOULD display a preview of the currently selected or previously stored image.

**FR-9 — Markdown body and inline images**
- **FR-9.1**: The article body MUST be authored as raw Markdown in a plain text editor (no rich-text/WYSIWYG editing), consistent with how the existing public article renderer already interprets it (GFM formatting, link and image handling, a lone-line video-service link becoming an embed).
- **FR-9.2**: The body editor MUST provide an "insert image" action: selecting a file uploads it using the same mechanism as the cover image and inserts a Markdown image reference — using the same short, stable reference form — at the current cursor position.

**FR-10 — Related project / related solution**
- **FR-10.1**: The form MUST offer an optional related-project selection, populated from the full list of existing projects (title and identifier only), with no selection allowed. Any selected value MUST correspond to a real, existing project.
- **FR-10.2**: The form MUST offer an optional related-solution selection from the fixed, known set of solution identifiers already used elsewhere on the public site, with no selection allowed.

**FR-11 — Error surfacing**
- **FR-11.1**: Create and edit forms MUST surface validation errors and save failures (including a slug clash) directly on the form in a way the admin can see and act on immediately; a save MUST NOT fail silently with no visible feedback.
- **FR-11.2**: Every action that creates, updates, or deletes an article MUST independently verify the caller has a valid admin session, regardless of any surrounding page-level protection.

**FR-12 — Draft preview**
- **FR-12.1**: This slice MUST NOT change the existing behavior where a draft article's public page renders only for a signed-in admin and returns not-found for anyone else, nor the existing behavior where a draft's page metadata never reveals its real title or description.
- **FR-12.2**: The admin UI MUST provide a "preview" action that opens an article's live public URL (in the correct language) in a new tab, relying on the existing draft-visibility behavior rather than building a separate preview renderer.

**FR-13 — Public-site consistency**
- **FR-13.1**: After any create, edit, or delete, the affected article's changes MUST become visible on the corresponding public list and detail pages (in the correct language) without requiring a manual site rebuild or redeploy.

**FR-14 — Data access conventions**
- **FR-14.1**: All article persistence (reads and writes) MUST live in a single, dedicated data-access module for the articles entity, consistent with how every other stored entity in this system is accessed — no page or admin-UI code MUST talk to the database directly for articles.
- **FR-14.2**: The list of existing projects for the related-project selection (FR-10.1) MUST be provided by the existing projects/portfolio data-access module, not a new, separate one.
- **FR-14.3**: This slice MUST NOT modify any existing table, column, enum, or index, and MUST NOT introduce a database migration — the `articles` schema is frozen and already matches its originating specification exactly.

**FR-15 — Quality gate**
- **FR-15.1**: The project's standard quality gate (type check, lint, production build) MUST pass with zero errors before this slice is considered complete.

### Key Entities

- **Article**: A single, one-language piece of authored content — title, slug, excerpt, cover image reference, Markdown body, publish state, publish date, optional related-project and related-solution links, plus creation/update timestamps. This entity and its stored shape already exist from an earlier phase; this slice adds the ability to create, edit, and delete it, and adds no new attribute.
- **Translation Concept**: The pairing of at most one English and one Arabic `Article` that represent "the same" piece of content in two languages, linked by a shared identifier. A concept may exist with only one language present; the two languages, when both present, are otherwise fully independent (separate slugs, separate publish states, separate edit/delete lifecycles).
- **Cover Image / Inline Body Image**: A reference to a previously uploaded, processed image (produced and served by this system's existing image-upload capability) that an `Article` points to — for its cover, or from within its Markdown body. This slice consumes that capability; it does not change how images are processed or stored.
- **Related Project**: An optional pointer from an `Article` to an existing project record, used to suggest a next step to the reader. This slice only needs a project's title and identifier for selection purposes.
- **Related Solution**: An optional tag from a fixed, small set of known service-offering identifiers, used the same way as Related Project — a reader-facing "next step" suggestion.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An admin can go from "no article exists" to "a fully published, publicly visible bilingual article" using only the admin UI, with no direct database access or manual step outside the application.
- **SC-002**: 100% of the time, the admin articles list shows every article that exists, including drafts, correctly grouped so that an English and Arabic version of the same concept always appear on a single row together.
- **SC-003**: An admin can tell, within one screen and without opening any individual article, which translation concepts are missing their other-language version.
- **SC-004**: Editing or deleting one language's version of an article never produces an observable change to its paired counterpart, 100% of the time.
- **SC-005**: Zero duplicate-slug save attempts (within the same language) succeed, and 100% of them produce an explanation the admin can act on immediately, never a generic failure or a silent no-op.
- **SC-006**: 100% of successfully saved articles have a working cover image and any inline body images rendering correctly on the public site immediately after publish.
- **SC-007**: 100% of articles' publish dates remain stable across any number of subsequent edits once first published, changing only when the admin explicitly supplies a new one.
- **SC-008**: A change made through the admin UI (create, edit, publish, or delete) is visible on the live public site within the same interaction session, with no manual rebuild step.
- **SC-009**: Zero article-mutating actions succeed without a valid admin session, even if attempted directly rather than through the admin UI.
- **SC-010**: The project's quality gate (type check, lint, production build) exits with zero errors.

## Assumptions

- **Schema is frozen (settled, not open)**: the `articles` table already matches its originating Phase 0 specification exactly, with no drift. This slice adds no column, index, or constraint, and generates no migration — it is data-access and admin-UI work only, built entirely on the existing shape.
- **Image upload is a consumed capability, not built here (settled, not open)**: cover images and inline body images are produced by this system's existing upload capability from an earlier phase, which already returns a short, stable reference (never the image data itself, never a bare identifier alone) suitable for direct storage. This slice only needs to call that capability and store what it returns.
- **Pairing is optional and non-cascading (settled, not open)**: a translation concept may permanently have only one language; when both exist, they are linked purely by a shared identifier with no enforced symmetry — independent slugs, independent publish states, independent edit and delete lifecycles. Nothing in this slice couples the two languages' lifecycles together.
- **Arabic slugs may use Arabic script (settled, not open)**: this is a deliberate, already-decided allowance, distinct from the stricter Latin-only rule that continues to apply to English slugs.
- **Editor is full-page, not an overlay (settled, not open)**: this admin area has no overlay/modal dialog system today, so create and edit each get their own dedicated page rather than a popup.
- **Errors are always visible to the admin (settled, not open)**: a failed save — whatever the cause — must always produce a message the admin can see and act on in the form itself; a save must never appear to do nothing.
- **Admin is English-only**: the admin interface itself (labels, navigation, messages) remains English-only, consistent with the rest of the admin area; only the authored article *content* is bilingual.
- **Out of scope for this slice**: CRUD for projects/portfolio content (a separate, later slice); any change to the underlying schema of articles or projects; a bundled "delete both languages at once" or "force both languages to publish together" action; migrating any pre-existing production article content (articles are authored fresh through this new capability); any change to how article images are wired into page-level social-sharing metadata beyond what already exists.
- **Left open for the planning phase**: the exact character rules for a valid Arabic slug (which Arabic-script ranges and digit forms are accepted) and the precise automatic-slugification behavior for Arabic titles; the exact shape of the grouped-list data query; the exact parameter contract used to pre-link the "add missing language" create flow to an existing concept and target language; the precise mechanism used to advance a row's last-updated marker on edit; the exact shape used to surface form/field errors back to the admin; and how responsibility for the cover-image and body-image upload controls is split between what runs in the browser and what runs on the server. All of these are implementation-mechanism choices, not user-facing behavior, and are intentionally left for `/plan` to resolve.
