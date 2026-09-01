# Feature Specification: Admin Projects CRUD (Phase 2, Slice 3)

**Feature Branch**: `007-admin-projects-crud`

**Created**: 2026-09-01

**Status**: Draft

**Input**: User description: "Phase 2, Slice 3 — Admin Projects CRUD: add admin create/edit/delete for portfolio projects, one canonical project plus its required English and Arabic case-study content, authored together as a single unit, with structured system-cards and results content, three independent image uploads, and public preview. Authoritative source: docs/projects-crud-slice-spec.md (approved). Grounding extraction: docs/projects-crud-extract.md."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin creates a project, both languages at once (Priority: P1)

As the admin, I open a full-page form, enter the project's shared details once (slug, category, visibility flags, cover image, optional logo and media image) and the full English and Arabic case-study content, and save — creating the project and both its language versions together, as a single unit.

**Why this priority**: Nothing else in this slice has anything to act on until a project can be created at all. Unlike a simpler content type, a project isn't usable in only one language — a case study is meant to be read by a visitor in either language from the moment it exists, so this story's "done" state is a fully bilingual, publicly renderable project, not a partial one.

**Independent Test**: Can be fully tested by signing in as admin, opening the create form, filling in every shared field and both languages' required content, saving, and confirming — by inspecting the database directly — that exactly one project record and exactly two language-content records (one English, one Arabic) were created together, with no partial or mismatched state possible.

**Acceptance Scenarios**:

1. **Given** the admin fills in valid shared fields and complete English and Arabic content, **When** they save, **Then** one project and exactly two language-content records (English, Arabic) are created together, and the project renders correctly on both language versions of the public portfolio once saved.
2. **Given** a save is interrupted partway through by an unexpected failure, **When** the admin checks afterward, **Then** no partial project exists — not a project with no language content, not a project with only one language, nothing at all until a save fully succeeds.
3. **Given** the admin leaves a required field blank (the shared slug, category, or cover image, or either language's title or description), **When** they attempt to save, **Then** the save is rejected with a clear, specific explanation, and nothing is written.

---

### User Story 2 - Admin lists all projects (Priority: P2)

As the admin, I see every project in a list — one row per project — showing its cover thumbnail, English title, category, and featured/showcase state, with actions to edit, delete, or preview it, ordered by most recently updated.

**Why this priority**: Once projects can be created (Story 1), the admin needs a way to find and manage them — this is the entry point for every other story.

**Independent Test**: Can be fully tested by creating a small number of projects (via Story 1) and confirming the list shows one row per project with the correct thumbnail, title, category, and flag state, ordered with the most recently changed project first.

**Acceptance Scenarios**:

1. **Given** several existing projects, **When** the admin opens the projects list, **Then** every project appears, one row each, showing its cover thumbnail, English title, category, and featured/showcase state, with edit, delete, and preview actions available.
2. **Given** projects with different last-edited times, **When** the admin views the list, **Then** the most recently updated project appears first.

---

### User Story 3 - Admin edits an existing project (Priority: P3)

As the admin, I open an existing project in the same combined form, pre-filled with its shared details and both languages' content, change anything, and save — updating the project as a single unit.

**Why this priority**: Case-study content changes over time (updated metrics, corrected copy, a new logo) — this depends on Story 1 (something to edit) and benefits from Story 2 (a way to find it), but is its own distinct, independently verifiable capability.

**Independent Test**: Can be fully tested by creating a project (Story 1), editing its English description and one shared field, saving, and confirming the change is reflected everywhere it should be while nothing else about the project changed unexpectedly.

**Acceptance Scenarios**:

1. **Given** an existing project, **When** the admin changes any field (shared or in either language) and saves, **Then** the change is persisted, the project's last-updated marker advances, and the list re-orders accordingly.
2. **Given** a project being re-saved without any change to its slug, **When** the admin submits the edit, **Then** the save succeeds and is not incorrectly rejected as a duplicate-slug conflict against itself.
3. **Given** an edit that changes the slug to one already used by another project, **When** the admin saves, **Then** the save is rejected with a clear, specific explanation.

---

### User Story 4 - Admin deletes a project (Priority: P4)

As the admin, I delete a project after an explicit confirmation step; both its language versions are removed automatically as part of the same operation.

**Why this priority**: A necessary but comparatively rare operation that rounds out the core management capability — not blocking for the slice's primary authoring value.

**Independent Test**: Can be fully tested by creating a project, deleting it (confirming the prompt), and verifying the project and both its language versions are gone, with nothing left behind.

**Acceptance Scenarios**:

1. **Given** an existing project, **When** the admin chooses to delete it, **Then** they are shown an explicit confirmation step before anything is removed.
2. **Given** the admin confirms deletion, **When** the deletion completes, **Then** the project and both its language versions are gone, and the project no longer appears in the list.

---

### User Story 5 - Admin authors structured case-study content (Priority: P5)

As the admin, I build the project's system-capability highlights (an icon plus a bilingual title and description per item, addable/removable/reorderable) and its measured results (a shared number plus a bilingual caption per item), and enter free-form tags and technologies for each language — all without needing to write any structured data by hand.

**Why this priority**: This is the heart of the case-study content model Decision 013 introduced, and it is what makes Story 1's "complete bilingual content" requirement achievable in practice — called out as its own story because it is a distinct, independently verifiable authoring mechanism, not because a project could be usefully created without it (at least one system-capability item is required for a project to be complete).

**Independent Test**: Can be fully tested by opening the create or edit form, adding several system-capability items and result items with the shared and per-language parts filled in, saving, and confirming — by inspecting the stored data directly — that each language's version has its own text but the same icon/order (for system capabilities) and the same number (for results) as the other language.

**Acceptance Scenarios**:

1. **Given** the admin adds a system-capability item with an icon and both languages' title and description, **When** they save, **Then** both languages' stored content show that item with the identical icon and position, and each language's own title and description.
2. **Given** the admin adds a result item with a shared number and both languages' captions, **When** they save, **Then** both languages' stored content show that result with the identical number and each language's own caption.
3. **Given** the admin attempts to save with zero system-capability items, or more than the allowed maximum, **When** they submit, **Then** the save is rejected with a clear explanation of the allowed range.
4. **Given** the admin enters tags or technologies for a language, **When** they save, **Then** those values are stored as that language's own simple list, independent of the other language's list.

---

### User Story 6 - Admin uploads the three project images (Priority: P6)

As the admin, I upload a cover image (required) and, optionally, a logo and a separate case-study media image — each uploading immediately and storing only a stable reference, never the image data itself.

**Why this priority**: A cover image is required for every project, so in practice this is exercised the first time Story 1 is used — it is its own story because it is a distinct, reusable mechanism applied three times in the same form (one required, two optional), not because it can be meaningfully deferred.

**Independent Test**: Can be fully tested by opening the create or edit form and, for each of the three image fields, selecting a file, confirming it uploads immediately with a preview, and confirming the form clearly distinguishes which control is for the cover thumbnail, which is the logo, and which is the case-study media.

**Acceptance Scenarios**:

1. **Given** the admin selects a cover image, **When** the upload completes, **Then** a stable, short reference to the processed image is stored in the form, a preview appears, and the form will not save without one.
2. **Given** the admin leaves the logo and media image fields empty, **When** they save, **Then** the save succeeds and those fields remain unset.
3. **Given** the admin uploads a logo and a media image, **When** the project is saved and viewed publicly, **Then** all three images — cover, logo, and media — render correctly in their respective places.

---

### User Story 7 - Admin previews a project (Priority: P7)

As the admin, I can open a project's live public pages, in both languages, directly from the admin UI, to check that everything renders correctly.

**Why this priority**: A quality-of-life check, valuable but not required for the core authoring loop — projects render live the moment they are saved, so "preview" here is simply a convenient link to already-real, already-public pages rather than a separate rendering mode.

**Independent Test**: Can be fully tested by creating a project, using its preview actions, and confirming each opens the correct live public page in the correct language.

**Acceptance Scenarios**:

1. **Given** an existing project, **When** the admin uses its English preview action, **Then** the project's live English public page opens and renders correctly.
2. **Given** the same project, **When** the admin uses its Arabic preview action, **Then** the project's live Arabic public page opens and renders correctly.

---

### Edge Cases

- A save that fails at any point — whether due to invalid input or an unexpected error partway through writing — never leaves a partially-created or partially-updated project behind; the admin sees either a complete success or a clear rejection, never a project missing one language's content.
- A duplicate slug is rejected with a clear explanation whether it happens on create or on edit; re-saving a project without changing its own slug is never mistaken for a clash against itself.
- A slug containing anything other than lowercase Latin letters, digits, and single hyphens is rejected before saving.
- A category value that has never been used before is still accepted — the list of existing categories is a convenience suggestion, not a restriction.
- Neither the featured nor the showcase flag has any effect on any other project — multiple projects may be marked featured or showcase at once, in the same or different categories, with no conflict or warning.
- A system-capability item or result item left with blank text in one language is still saved as entered — the editor does not silently invent placeholder text for a language the admin skipped.
- Deleting a project removes everything belonging to it — both language versions disappear along with it — with no leftover, orphaned language content in any state.
- Changing a project's slug during an edit means its old public URL, in both languages, stops serving that project's content going forward.

## Requirements *(mandatory)*

### Functional Requirements

**FR-1 — Admin list**
- **FR-1.1**: The system MUST provide an admin-only list view reachable only to a signed-in admin.
- **FR-1.2**: The list MUST show one row per project: cover thumbnail, English title, category, featured/showcase state, and edit, delete, and preview actions.
- **FR-1.3**: Rows MUST be ordered by most-recently-updated first.
- **FR-1.4**: The admin navigation MUST include an entry for the projects list.

**FR-2 — Create (as a single unit, both languages)**
- **FR-2.1**: The system MUST provide a dedicated, full-page create view (not an overlay/modal) collecting the shared project details and both languages' content in one combined form.
- **FR-2.2**: The form MUST collect: slug, category, featured flag, showcase flag, cover image, optional logo, optional media image, and for each of English and Arabic: title, description, and every other case-study field (FR-6–FR-9).
- **FR-2.3**: Saving MUST create the project and both its language versions together as one indivisible action — validating first, and writing all of it or none of it. A failure at any point during the write MUST leave nothing behind.
- **FR-2.4**: Both languages' required content (title and description) MUST be present for a save to succeed; a submission missing either is rejected.

**FR-3 — Edit (as a single unit)**
- **FR-3.1**: The system MUST provide a dedicated, full-page edit view that loads an existing project's shared details and both languages' content and pre-fills the form.
- **FR-3.2**: Saving an edit MUST update the shared details and both languages' content together as one indivisible action, and MUST advance the project's last-updated marker.
- **FR-3.3**: A project's two language versions are always exactly English and Arabic; editing never changes which language a piece of content belongs to.

**FR-4 — Delete**
- **FR-4.1**: Deleting a project MUST require an explicit confirmation step before anything is removed, and MUST remove the project along with both its language versions, with nothing left behind.

**FR-5 — Shared project details (entered once, not per language)**
- **FR-5.1**: Slug MUST be required, unique across all projects, and in the fixed URL-safe format (FR-10).
- **FR-5.2**: Category MUST be required, entered as free text; the form SHOULD suggest previously-used category values to encourage consistency, without restricting the admin to only those values.
- **FR-5.3**: The featured and showcase flags MUST each be a simple on/off control, defaulting to off, with no restriction on how many projects may have either flag set.
- **FR-5.4**: A cover image MUST be required.
- **FR-5.5**: A logo and a media image MUST each be optional.

**FR-6 — Per-language case-study content (required for both English and Arabic)**
- **FR-6.1**: Title and description MUST be required, independently, for both languages.
- **FR-6.2**: The following MUST be optional, independently, for both languages: a category display label, four client-identity fields, a problem headline and body, a diagnosis headline and body, a system-section headline, a media caption, and an optional call-to-action headline and subtext.
- **FR-6.3**: All narrative text fields MUST be authored as plain text (no rich-text/Markdown formatting), consistent with how they are already displayed publicly.
- **FR-6.4**: The call-to-action fields MUST show the admin what default text is used publicly when they are left blank, so the admin can judge whether an override is needed.

**FR-7 — System-capability highlights (shared structure, per-language text)**
- **FR-7.1**: The system MUST provide a way to add, remove, and reorder a list of system-capability items. Each item MUST have an icon (chosen from a fixed, known set of icon options) and, for each language, a title and a description.
- **FR-7.2**: An item's icon and its position in the list MUST be the same for both languages — authored once, applying to both; only its title and description differ per language.
- **FR-7.3**: A project MUST have between 1 and 6 system-capability items; saving with fewer or more MUST be rejected with a clear explanation.
- **FR-7.4**: Each item SHOULD have its title and description provided in both languages, so that neither language's public page shows a noticeably incomplete item.

**FR-8 — Result highlights (shared number, per-language caption)**
- **FR-8.1**: The system MUST provide a way to add, remove, and reorder a list of result items. Each item MUST have a number/value (shared across both languages — entered once) and, for each language, a caption.
- **FR-8.2**: A result item's value MUST be identical across both languages by construction — the admin enters it once, not separately per language — while its caption is entered per language.

**FR-9 — Tags and technologies**
- **FR-9.1**: Tags and technologies MUST each be an independent, simple list of short text values per language, entered via an add/remove control (not free-form paragraph text).

**FR-10 — Slug handling**
- **FR-10.1**: A slug MUST consist only of lowercase Latin letters, digits, and single hyphens between words, with no leading, trailing, or doubled hyphens and no spaces — one slug per project, shared by both its language pages.
- **FR-10.2**: The form MAY offer a one-click way to generate a slug from the English title; the slug MUST otherwise remain a plain, freely editable field at all times.
- **FR-10.3**: Slug uniqueness MUST be enforced across all projects. Before saving, the system MUST check for an existing project with the same slug and, on a clash, reject the save with a clear, specific explanation rather than a raw system error.
- **FR-10.4**: On an edit, the slug uniqueness check MUST exclude the project's own current slug.

**FR-11 — Images (three independent fields)**
- **FR-11.1**: Each of the three image fields (cover, logo, media) MUST upload immediately upon selection and store only a short, stable reference to the processed result — never the raw image data, and never a bare identifier without the means to fetch it.
- **FR-11.2**: The three image controls MUST be labeled clearly enough that the admin cannot reasonably confuse the required cover thumbnail with the optional logo or the optional case-study media image.

**FR-12 — Error surfacing**
- **FR-12.1**: Create and edit MUST surface validation errors and save failures (including a slug clash) directly on the form in a way the admin can see and act on immediately; a save MUST NOT fail silently with no visible feedback.
- **FR-12.2**: Every action that creates, updates, or deletes a project MUST independently verify the caller has a valid admin session, regardless of any surrounding page-level protection.

**FR-13 — All-or-nothing saves**
- **FR-13.1**: Creating a project MUST NOT be able to produce a project with missing or mismatched language content — the shared details and both languages' content are written together, completely, or not at all.
- **FR-13.2**: Updating a project MUST apply changes to the shared details and both languages' content together, completely, or not at all.
- **FR-13.3**: Every update MUST advance the project's last-updated marker at the moment of the save.

**FR-14 — Public-site consistency**
- **FR-14.1**: After any create, edit, or delete, the affected project's changes MUST become visible on the corresponding public portfolio list and detail pages, in both languages, without requiring a manual site rebuild or redeploy.
- **FR-14.2**: If an edit changes a project's slug, the project's previous public URL (in both languages) MUST also reflect that it no longer serves that project's content, without requiring a manual rebuild.

**FR-15 — Data access conventions**
- **FR-15.1**: All project persistence (reads and writes) MUST live in a single, dedicated data-access module for the projects entity, consistent with how every other stored entity in this system is accessed — no page or admin-UI code MUST talk to the database directly for projects.
- **FR-15.2**: This slice MUST NOT change or break any existing way projects are already read — the public portfolio pages, the "related project" feature on article pages, and the existing project-selection list used elsewhere in the admin MUST all continue to work exactly as before.
- **FR-15.3**: This slice MUST NOT modify any existing table, column, index, or constraint, and MUST NOT introduce a database migration — the `projects`/`project_translations` schema is frozen and already matches its originating specification exactly.

**FR-16 — Preview**
- **FR-16.1**: The admin UI MUST provide preview actions that open a project's live public page in each language in a new tab, relying entirely on the existing public rendering (projects have no draft state — a saved project is already live) rather than building a separate preview renderer.

**FR-17 — Quality gate**
- **FR-17.1**: The project's standard quality gate (type check, lint, production build) MUST pass with zero errors before this slice is considered complete.

### Key Entities

- **Project**: The canonical, language-independent record for one portfolio case study — a unique slug, a category, two independent visibility flags (featured, showcase), and three optional-or-required image references (cover, logo, media). Exists as exactly one record per project, shared by both its language versions.
- **Project Language Content**: One language's (English or Arabic) complete case-study text for a project — title, description, and the full set of optional narrative fields, plus that language's own system-capability text, result captions, tags, and technologies. A project always has exactly two of these, one per language, created and updated together with the project itself.
- **System-Capability Item**: One entry in a project's ordered list of highlighted capabilities — an icon (from a fixed set) shared across languages, plus a title and description that differ per language. Between 1 and 6 per project.
- **Result Item**: One entry in a project's ordered list of measured outcomes — a value shared across languages, plus a caption that differs per language.
- **Cover / Logo / Media Image**: A reference to a previously uploaded, processed image (produced and served by this system's existing image-upload capability) that a Project points to. This slice consumes that capability three times per project; it does not change how images are processed or stored.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An admin can go from "no project exists" to "a fully published, bilingual, publicly visible case study" using only the admin UI, with no direct database access or manual step outside the application.
- **SC-002**: 100% of created or edited projects have complete, matching English and Arabic content — never a project visible in one language but missing or broken in the other.
- **SC-003**: Zero save attempts — whether rejected for invalid input or interrupted by an unexpected failure — ever leave a partially-written project in the system.
- **SC-004**: Zero duplicate-slug save attempts succeed, and 100% of them produce an explanation the admin can act on immediately, never a generic failure or a silent no-op.
- **SC-005**: 100% of a project's structured highlights (system-capability items and result items) keep their shared parts (icon/order, and value respectively) identical across both languages, by construction rather than by the admin's manual care.
- **SC-006**: 100% of successfully saved projects have a working cover image, and any provided logo or media image, rendering correctly on the public site immediately after saving.
- **SC-007**: A change made through the admin UI (create, edit, or delete) is visible on the live public site, in both languages, within the same interaction session, with no manual rebuild step.
- **SC-008**: Zero project-mutating actions succeed without a valid admin session, even if attempted directly rather than through the admin UI.
- **SC-009**: Deleting a project leaves zero trace of either of its language versions behind.
- **SC-010**: Introducing this slice causes zero regressions to the existing public portfolio pages, the article "related project" feature, or the existing project-selection list used elsewhere in the admin.
- **SC-011**: The project's quality gate (type check, lint, production build) exits with zero errors.

## Assumptions

- **Schema is frozen (settled, not open)**: the `projects`/`project_translations` tables already match their originating specification (Decision 013) exactly, with no drift. This slice adds no column, index, or constraint, and generates no migration — it is data-access and admin-UI work only, built entirely on the existing shape.
- **A project is inherently bilingual (settled, not open)**: unlike some other content in this system, a project has no valid "single-language" or "draft" state — it is created, edited, and deleted as one unit covering both languages together. There is no scenario in this slice where a project exists with only one language's content.
- **Deleting is whole-project only (settled, not open)**: there is no way to remove just one language's content while keeping the project — deleting removes the whole project and everything belonging to it, in one step.
- **Structured highlights are authored once per shared part (settled, not open)**: a system-capability item's icon and position, and a result item's value, are entered a single time and apply to both languages automatically — this is a structural guarantee of how the editor is built, not a rule the admin has to remember to follow.
- **No exclusivity between projects for the visibility flags (settled, not open)**: the featured and showcase flags are independent, unconstrained on/off switches in this slice; a stricter rule some earlier system version had for the showcase flag is deliberately not carried forward here, since nothing today publicly consumes either flag yet.
- **Category has no fixed list (settled, not open)**: category is free text with a helpful suggestion list of prior values, not a closed set of choices.
- **Legacy URL redirects are out of scope (settled, not open)**: an older system's numeric project links redirecting to this system's slug-based links is a separate, later concern tied to when that older content is brought in — not part of authoring new projects now.
- **Images are a consumed capability, not built here (settled, not open)**: all three image fields are produced by this system's existing upload capability from an earlier phase, which already returns a short, stable reference suitable for direct storage. This slice only needs to call that capability and store what it returns.
- **Errors are always visible to the admin (settled, not open)**: a failed save — whatever the cause — must always produce a message the admin can see and act on in the form itself; a save must never appear to do nothing.
- **Admin is English-only**: the admin interface itself (labels, navigation, messages) remains English-only, consistent with the rest of the admin area; only the authored project *content* is bilingual.
- **Out of scope for this slice**: any homepage or services-page feature that would consume the featured/showcase flags (neither exists yet); a stricter one-showcase-per-category rule; migrating any pre-existing production project content (projects are authored fresh through this new capability, with prior production projects brought in during a later, separate step); redirecting an older numeric project link to a new slug-based one; any change to the underlying schema of projects or their language content.
- **Left open for the planning phase**: the precise mechanism guaranteeing an all-or-nothing save across the project and its two language records; exactly how the shared-versus-per-language parts of system-capability items and result items are assembled from the editor's working state into what gets stored, and how strictly both languages' text is required per item; how the large combined form is broken into smaller pieces for building and maintaining it; the exact rules and helper behavior for generating a slug from a title; the exact shape used to surface a slug-clash error back to the admin; the exact query shape behind the admin list and the category-suggestion list; and whether a project's last-updated marker is tracked at the level of the whole project only, or also within each language's own content. All of these are implementation-mechanism choices, not user-facing behavior, and are intentionally left for `/plan` to resolve.
