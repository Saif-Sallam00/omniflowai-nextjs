# Feature Specification: JSON-LD Structured Data + Dynamic llms.txt

**Feature Branch**: `010-jsonld-llmstxt`

**Created**: 2026-09-01

**Status**: Draft

**Input**: User description: "Feature: JSON-LD Structured Data + Dynamic llms.txt (Phase 3, Slice 3c). Build directly from docs/jsonld-llmstxt-slice-spec.md (approved, committed) — its user stories, FR-1..FR-8, out-of-scope, settled decisions/assumptions, and AC-1..AC-8 are the operator-approved scope."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - An AI/search engine understands the organization (Priority: P1)

As an answer engine crawling any public page, I find `Organization` structured data (name, URL, logo, description) so I can correctly attribute and describe OmniflowAI when citing its content.

**Why this priority**: This is the foundational, site-wide identity signal every other structured-data story builds on — without it, even correctly-structured articles and case studies lack a clear publisher to attribute.

**Independent Test**: Can be fully tested by requesting any public page (both languages) and confirming it emits valid `Organization` structured data with the correct name, URL, logo (if present), description, and language.

**Acceptance Scenarios**:

1. **Given** a public page in either language, **When** an answer engine reads the page, **Then** it finds `Organization` structured data with `name`, `url` (the language-appropriate site root), `logo` (if available), and `description`.
2. **Given** an admin or API route, **When** it is requested, **Then** no `Organization` structured data is present (those routes are not public).

---

### User Story 2 - An answer engine can cite an article precisely (Priority: P1)

As an answer engine fetching a published article, I find `Article` structured data (headline, description, image, publish date, language, publisher) so I can cite the article with correct title, date, and attribution.

**Why this priority**: Article citation accuracy is a primary AEO goal of this phase — articles are the site's main content-marketing surface and the most likely candidate for AI citation.

**Independent Test**: Can be fully tested by requesting a published article detail page (both languages) and confirming the `Article` structured data's headline, description, image, and date match what the page's own metadata already shows.

**Acceptance Scenarios**:

1. **Given** a published article detail page in either language, **When** it is requested, **Then** it emits `Article` structured data with `headline`, `description`, absolute `image` URL, `datePublished`, `inLanguage`, and a `publisher` referencing the organization.
2. **Given** the same article, **When** its structured-data values are compared to the page's own displayed title/description/image, **Then** they match exactly — no divergent or generic fallback values.

---

### User Story 3 - An answer engine can cite a case study precisely (Priority: P1)

As an answer engine fetching a published project (case study), I find structured data describing it (title, description, image, language, publisher) so I can reference the work accurately.

**Why this priority**: Case studies are the site's proof-of-work content; equally important to cite accurately as articles, and delivered alongside them in this slice.

**Independent Test**: Can be fully tested by requesting a published project detail page (both languages) and confirming it emits structured data with a title, description, absolute image URL, language, and publisher.

**Acceptance Scenarios**:

1. **Given** a published project detail page in either language, **When** it is requested, **Then** it emits structured data describing the case study with at least a title, description, absolute `image` URL, `inLanguage`, and a `publisher` referencing the organization.

---

### User Story 4 - Drafts emit no indexable structured data (Priority: P1)

As the operator, an unpublished/draft detail page does not emit `Article`/case-study structured data that could be indexed or cited, consistent with its `noindex` treatment.

**Why this priority**: A safety invariant — without it, draft content could leak into AI citations before the operator intends it to be public, undermining the very `noindex` protection already in place for drafts.

**Independent Test**: Can be fully tested by requesting an unpublished/draft article or a not-found detail-page URL and confirming no `Article`/case-study structured data is present.

**Acceptance Scenarios**:

1. **Given** an unpublished/draft article, **When** its detail page is requested, **Then** no `Article` structured data is emitted.
2. **Given** a detail-page URL for content that does not exist, **When** it is requested, **Then** no `Article`/case-study structured data is emitted.

---

### User Story 5 - An AI agent gets a clean content index (Priority: P2)

As an AI agent, I can fetch `/llms.txt` and get a concise, plain-text description of the site plus a current list of its published articles and case studies (titles + absolute URLs, both languages), so I have a low-noise index of what the site offers.

**Why this priority**: Complements the structured-data stories (US1–US4) with a purpose-built, low-noise index format some AI agents specifically look for; depends on production-indexable mode existing (delivered in the prior slice) but is otherwise additive.

**Independent Test**: Can be fully tested by requesting `/llms.txt` in production mode and confirming it contains a curated header plus an auto-generated list of every published article and project, in both languages, as titles and absolute URLs.

**Acceptance Scenarios**:

1. **Given** the site is running in production-indexable mode, **When** `/llms.txt` is requested, **Then** it returns a curated header (organization name, one-line description, a note on available languages) followed by a list of every published article and project, in both languages, each as a title and absolute URL.
2. **Given** a URL listed in `/llms.txt`, **When** it is requested, **Then** it resolves to a 200 page.

---

### User Story 6 - Staging stays clean (Priority: P1)

As the operator, on a `noindex` staging deployment, `/llms.txt` does not advertise the site's content, and structured data does not promote staging pages — consistent with the sitemap's staging behavior.

**Why this priority**: The safety invariant underpinning every other story in this slice — a regression here would let an unfinished/staging deployment's content leak into an AI agent's index or citations, mirroring why the equivalent sitemap invariant was P1 in the prior slice.

**Independent Test**: Can be fully tested by requesting `/llms.txt` on a deployment with indexing disabled and confirming it does not advertise the site's content.

**Acceptance Scenarios**:

1. **Given** indexing is disabled (staging default), **When** `/llms.txt` is requested, **Then** it does not advertise the site's published content (list of articles/projects).
2. **Given** indexing is disabled, **When** any public page is requested, **Then** structured data does not promote staging content beyond what the deployment's existing noindex treatment already suppresses.

---

### Edge Cases

- What happens when an article or project has no cover image available for the structured-data `image` field? The field is omitted or left consistent with however the page's own metadata already handles a missing image — no invented placeholder value.
- What happens when a case-study project has no separate "description" field distinct from its title? The structured data uses the same description value the page's own metadata already computes for that project — never a generic fallback.
- How does the system handle a request to `/llms.txt` when there is no published content at all (e.g., zero articles, zero projects) in production mode? It still returns the curated header; the content list is simply empty.
- What happens when a detail page is requested for content that doesn't exist (404)? No `Article`/case-study structured data is emitted (US4, edge case already covered by the not-found determination the page's metadata makes).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every public page (both languages) MUST emit `Organization` structured data — via a machine-readable script block — placed once at a site-wide level, covering: `name`, `url` (the language-appropriate site root), `logo` (if available), and a `description`.
- **FR-002**: The `Organization` structured data MUST be language-aware — English pages reference the English root/description, Arabic pages the Arabic root/description, with the correct language indicated.
- **FR-003**: `Organization` structured data MUST NOT be emitted on admin or API routes.
- **FR-004**: A published article detail page (both languages) MUST emit `Article` structured data including at least: `headline` (the article title), `description` (the excerpt/meta description), `image` (the absolute cover-image URL), `datePublished` (from the article's publish timestamp), the article's language, and a `publisher` referencing the Organization.
- **FR-005**: The `Article` structured-data values MUST come from the same source the page's own metadata already computes — no divergent recomputation, no generic fallback.
- **FR-006**: The `Article` structured data's canonical URL / main-entity reference MUST be the article's real current-language URL.
- **FR-007**: A published project detail page (both languages) MUST emit structured data describing the case study — at minimum: a title, description, absolute `image` URL, the page's language, and a `publisher` referencing the Organization.
- **FR-008**: The case-study structured-data values MUST come from the project detail data the page already reads and the metadata it already computes — no divergent recomputation.
- **FR-009**: An unpublished/draft article, or a not-found detail page, MUST NOT emit `Article`/case-study structured data — this reuses the same published/not-found determination the page's metadata already makes for its noindex treatment.
- **FR-010**: The system MUST provide an `/llms.txt` endpoint serving plain-text (or markdown) content.
- **FR-011**: In production-indexable mode, `/llms.txt` MUST contain: a curated header (organization name, a one-line description of what OmniflowAI does, and a note on the primary/available languages), followed by an auto-generated list of published articles and projects — each as a title + absolute URL — in both languages.
- **FR-012**: The absolute URLs in `/llms.txt` MUST be built off the site's canonical base URL and MUST be the real per-language article slugs and shared project slugs.
- **FR-013**: `/llms.txt` MUST read published-content data directly (no intermediate API layer).
- **FR-014**: On a deployment where indexing is disabled (staging default), `/llms.txt` MUST NOT advertise the site's content — mirroring the sitemap's staging gate. The invariant: a noindex staging deployment never publishes a populated content index via `/llms.txt`.
- **FR-015**: On a deployment where indexing is enabled (production-indexable mode), `/llms.txt` MUST be fully populated per FR-011.
- **FR-016**: No existing public route's rendering, metadata (canonical/hreflang/OG), or the sitemap/robots behavior from prior work may be changed by this feature.
- **FR-017**: This feature MUST NOT introduce any schema change or migration.
- **FR-018**: The structured-data script blocks MUST NOT alter the visible rendered page — they are non-visual, machine-readable data only.
- **FR-019**: The system's standard type-check, lint, and build checks MUST all pass with zero errors.

### Key Entities *(include if feature involves data)*

- **Organization structured-data block**: A single, site-wide machine-readable description of OmniflowAI — name, URL, logo (if available), description, language — present on every public page and absent from admin/API routes.
- **Article structured-data block**: A per-page machine-readable description of one published article — headline, description, image, publish date, language, and a reference to the Organization — present only on published article detail pages.
- **Case-study structured-data block**: A per-page machine-readable description of one published project — title, description, image, language, and a reference to the Organization — present only on published project detail pages.
- **llms.txt content index**: A plain-text document combining a curated header with an auto-generated list of published articles and projects (title + absolute URL, both languages) — fully populated in production-indexable mode, not advertising content when indexing is disabled.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of public pages (both languages) emit valid `Organization` structured data with correct name, URL, and language; 0% of admin/API routes do.
- **SC-002**: 100% of published article detail pages (both languages) emit `Article` structured data whose headline, description, and image match the page's own displayed metadata exactly — zero instances of generic or divergent fallback values.
- **SC-003**: 100% of published project detail pages (both languages) emit case-study structured data with title, description, image, and language populated from the page's own real data.
- **SC-004**: 100% of unpublished/draft or not-found detail pages emit zero `Article`/case-study structured data.
- **SC-005**: All emitted structured-data blocks are well-formed and machine-parseable with no malformed or invalid instances.
- **SC-006**: In production-indexable mode, `/llms.txt` lists 100% of published articles and projects (both languages) as resolvable absolute URLs, with zero dead links in a spot-checked sample.
- **SC-007**: When indexing is disabled, `/llms.txt` advertises zero pieces of site content, and structured data promotes zero staging pages beyond the deployment's existing noindex suppression.
- **SC-008**: This feature ships with zero changes to existing public-route rendering/metadata/sitemap/robots behavior, zero visible page changes from the structured-data additions, and zero schema or migration changes.

## Assumptions

- The site's canonical absolute-URL base and the `INDEXING_ENABLED` staging/production gate (both established in prior work) are reused unchanged — this feature introduces no new base URL or flag.
- Per-page metadata (title, description, canonical URL, image) is already correct as of prior work in this phase; this feature reuses those already-correct values rather than recomputing them independently.
- The published/unpublished and not-found determinations used to suppress structured data on drafts are the same determinations already used elsewhere on these pages to suppress indexing — no new determination logic is introduced.
- Article slug resolution (including Arabic-script slugs) is already correct as of prior work — this feature depends on, but does not fix, article URL resolution.
- No brand logo asset currently exists for the organization; the `Organization` structured data's logo field may be omitted if no suitable asset is available, rather than blocking this feature on producing a new brand asset.
- The exact machine-readable vocabulary/type used for the case-study structured data is an implementation decision deferred to planning; this specification only requires that the case study be described with a title, description, image, language, and publisher reference.
- This feature does not enable indexing on any real deployment; enabling indexing (flipping the flag) remains a separate operational action outside this feature's scope.
- Additional structured-data types beyond Organization, Article, and case-study (such as breadcrumbs or FAQ markup) and any rewriting of page content for citation-friendliness are out of scope for this feature.
