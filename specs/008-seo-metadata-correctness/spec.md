# Feature Specification: SEO Metadata Correctness + Article Slug-Pairing Fix + OG Images

**Feature Branch**: `008-seo-metadata-correctness`

**Created**: 2026-09-01

**Status**: Draft

**Input**: User description: "Feature: SEO Metadata Correctness + Article Slug-Pairing Fix + OG Images (Phase 3, Slice 3a). Authoritative source: docs/seo-metadata-slice-spec.md (approved, committed). Grounding audit: docs/phase-3-seo-extract.md. Build the spec directly from docs/seo-metadata-slice-spec.md — its user stories, FR-1..FR-8, out-of-scope, settled decisions/assumptions, and AC-1..AC-8 are the operator-approved scope."

**Authoritative source**: `docs/seo-metadata-slice-spec.md` (approved, committed) — this spec is derived directly from it and does not widen, narrow, or reopen any decision marked settled there.

**Grounding audit**: `docs/phase-3-seo-extract.md`

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A crawler gets correct article language alternates (Priority: P1)

As a search crawler fetching a published article, its language-alternate (hreflang) links point to the real counterpart URLs — resolved by the article's underlying cross-language link, not by assuming the two languages use the same slug — so the correct EN/AR pair gets indexed together. If the article has no published counterpart in the other language, no alternate link is emitted for that language.

**Why this priority**: This is the root-cause correctness bug identified by the audit. Articles are linked across languages by an internal grouping identifier with independently chosen slugs per language, but the current code assumes identical slugs — so any article where the two slugs differ emits a language-alternate link to a URL that may not exist. This is the highest-value fix and blocks the two later Phase 3 slices (sitemap, structured data) that reuse this same slug-pairing logic.

**Independent Test**: Publish an article in both languages with deliberately different slugs, then inspect the emitted page metadata for both language versions and confirm each alternate link points to the other version's real slug (not a guessed one).

**Acceptance Scenarios**:

1. **Given** a published article whose English and Arabic versions have different slugs, **When** the English page's metadata is inspected, **Then** its Arabic-language alternate link points to the real Arabic slug URL (and vice versa for the Arabic page) — never to the naive same-slug guess.
2. **Given** an article published in only one language, **When** that page's metadata is inspected, **Then** no language-alternate link is emitted for the missing language, and the default/fallback language link points to the language that actually exists rather than a non-existent URL.

---

### User Story 2 - A bilingual visitor can switch language without a broken page (Priority: P1)

As a visitor on an article page, using the language switcher takes me to the correct translated article when one exists. When the article has no counterpart in the other language, switching does not land me on a broken ("not found") page.

**Why this priority**: This is the user-facing half of the same root-cause bug as User Story 1 — the visible symptom a real person hits, sharing one fix with the crawler-facing case. It directly affects visitor trust and experience on bilingual content.

**Independent Test**: On a published article with a differing counterpart slug, click the language switcher and confirm it lands on the correct translated article. Separately, on a single-language article, click the switcher and confirm it does not produce a broken page.

**Acceptance Scenarios**:

1. **Given** a published article with a counterpart in the other language whose slug differs, **When** a visitor uses the language switcher on that page, **Then** they land on the correct translated article.
2. **Given** an article with no published counterpart in the other language, **When** a visitor uses the language switcher on that page, **Then** they do not land on a "not found" page.

---

### User Story 3 - Drafts are never indexed (Priority: P1)

As a search crawler, an unpublished or draft article or project detail page is explicitly marked as not to be indexed, so a draft previewed by a signed-in admin can never be surfaced in search results.

**Why this priority**: Indexing leakage of unpublished content is a correctness/compliance-adjacent risk (P-04 indexability signalling) and is cheap to close alongside the other metadata work in this slice.

**Independent Test**: Request an unpublished article or project detail page's metadata directly (as an admin preview) and confirm it carries a "do not index" signal, while a published item of the same type does not.

**Acceptance Scenarios**:

1. **Given** an unpublished/draft article or project detail page, **When** its metadata is inspected, **Then** it is marked not indexable.
2. **Given** a published article or project detail page, **When** its metadata is inspected, **Then** it is not marked with a "do not index" signal.

---

### User Story 4 - A social/AEO scraper gets an image (Priority: P2)

As a scraper fetching any article or project detail page, the page carries a preview image (the item's cover image), so a shared or cited link renders with the right image instead of a blank/default preview.

**Why this priority**: This is an additive enhancement independent of the hreflang bug fix — the underlying cover images already exist and are already served publicly; this only wires them into the page's shareable-preview metadata. Valuable but not correctness-critical the way User Stories 1–3 are.

**Independent Test**: Fetch a published article or project detail page's metadata and confirm it declares a preview image whose URL, when fetched, returns the item's actual cover image bytes.

**Acceptance Scenarios**:

1. **Given** a published article detail page with a cover image, **When** its metadata is inspected, **Then** it declares a preview image URL that resolves to that cover image.
2. **Given** a published project detail page with a cover image, **When** its metadata is inspected, **Then** it declares a preview image URL that resolves to that cover image.

---

### User Story 5 - Site metadata has no leftover placeholder copy (Priority: P3)

As anyone inspecting the site's default metadata, it no longer reads placeholder text left over from an earlier development phase — it carries real site defaults.

**Why this priority**: Lowest-risk, lowest-effort item in the slice — a copy fix on a fallback that no live page currently relies on, but it must not ship to production as-is.

**Independent Test**: Inspect the site's root/default metadata (the fallback used when a page defines none of its own) and confirm it no longer contains the old placeholder wording.

**Acceptance Scenarios**:

1. **Given** the site's root default metadata, **When** it is inspected, **Then** it contains real site copy, not development-phase placeholder text.

---

### Edge Cases

- An article is published in only one language (no counterpart exists at all) — no broken alternate link, no broken switcher target, default/fallback language link points to the language that exists (per User Story 1 / 2).
- An article has a counterpart in the other language, but that counterpart is currently unpublished/draft — the unpublished counterpart is treated as if it does not exist for alternate-link and switcher purposes (only published counterparts count).
- A request for an unpublished/draft detail page's metadata (e.g. an admin preview) must still emit a "do not index" signal even though the page itself renders for the admin.
- A static page (home/about/solutions/contact/articles list/portfolio list) has no per-item cover image available — it is not required to carry a preview image in this slice; the absence of one is not a regression.
- Fixing the article slug-pairing and image wiring must not change the already-correct behavior for static pages or project detail pages (same-slug project pairing, fixed static-page path pairing) — those are regression surfaces, not fix targets.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST resolve, for a given published article, the real slug of its published counterpart in the other language (using the article's existing cross-language grouping link, not slug-text matching), returning "none" when no published counterpart exists.
- **FR-002**: For article detail pages, the system MUST emit language-alternate metadata links using the resolved real counterpart path (FR-001) rather than a same-slug assumption; when a language has no published counterpart, that language's alternate link MUST be omitted entirely rather than pointing at a guessed URL.
- **FR-003**: For article detail pages, the default/fallback language-alternate signal MUST point to the English version when a published English version exists, and MUST point to the Arabic version instead when only the Arabic version is published — it MUST NOT ever point to a non-existent version.
- **FR-004**: For all pages other than article detail pages (static pages, project detail, list pages), existing language-alternate behavior MUST remain unchanged — it is already correct and is not a target of this fix.
- **FR-005**: On article detail pages, the language switcher MUST navigate to the resolved real counterpart (FR-001) rather than a naive same-slug path swap.
- **FR-006**: When an article has no published counterpart in the target language, using the language switcher MUST NOT produce a "not found" page; the specific graceful behavior (e.g. disabling that option, or routing to that language's article list) is a mechanism decision left to the planning phase — the only hard requirement here is that no dead link/404 results.
- **FR-007**: On all pages other than article detail pages, the language switcher's existing behavior MUST remain unchanged — it is already correct and is not a target of this fix.
- **FR-008**: Article and project detail page metadata MUST include a preview ("social share") image built from the item's existing cover image, as a fully resolvable absolute address, whenever the item has one.
- **FR-009**: Static pages MAY include a single site-wide default preview image if one is supplied; if none is supplied, they continue to have no preview image (no regression from current behavior). Whether a default image is supplied in this delivery, versus left for a later content/design task, is decided during planning — but the capability to add one MUST exist.
- **FR-010**: Article and project detail page metadata MUST be marked "do not index" when the requested item is unpublished/draft/not available, and MUST NOT carry that marking when the item is published.
- **FR-011**: The "do not index" determination (FR-010) MUST reuse the item lookup the page's metadata generation already performs — it MUST NOT require an additional redundant data lookup beyond what the counterpart-resolution caching (FR-001) already covers.
- **FR-012**: The site's root/default metadata (used only as a fallback when a page defines no metadata of its own) MUST be updated to real site copy, removing all "Foundation" / "Phase 0" placeholder wording, in both languages.
- **FR-013**: This feature MUST introduce no changes to the underlying data structure — no new/changed/removed table, column, index, or constraint, and no migration. It uses only the article cross-language link that already exists today.
- **FR-014**: Existing public reads and page rendering for articles and projects MUST continue to function unchanged; this feature adds one new data read and changes metadata generation and the language switcher only — it does not alter how article/project content itself is fetched or displayed.
- **FR-015**: All automated correctness, linting, and build checks used by the project MUST pass with zero errors before this feature is considered complete.

### Key Entities

- **Article**: Bilingual content item. Each language version has its own independently chosen slug; the English and Arabic versions of the same article are linked by a shared cross-language grouping identifier (not by matching slugs). Has a published/unpublished state per language version, and an existing cover image reference.
- **Project (portfolio case study)**: Bilingual content item that, unlike Article, shares one slug across both language versions. Has a published/unpublished state and an existing cover image reference. Its language-pairing and metadata correctness are already established and are explicitly not a target of this feature (verified as unchanged, not modified).
- **Page Metadata**: The set of signals a page exposes describing itself to search engines and social/AI scrapers — title, description, canonical address, language-alternate links, indexability signal, and preview image. This feature changes how Page Metadata is computed for article and project detail pages, and for the site-wide fallback; it does not change how Page Metadata is computed for static pages.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of published articles with differing English/Arabic slugs expose a language-alternate link that correctly points to the real counterpart page, verifiable by inspecting each page's metadata.
- **SC-002**: 0% of single-language-published articles expose a language-alternate link pointing to a non-existent page.
- **SC-003**: 0% of language-switcher uses on article pages result in a "not found" page, whether or not a counterpart exists.
- **SC-004**: 100% of published article and project detail pages with a cover image expose a working preview image that resolves to that image's actual bytes when fetched.
- **SC-005**: 100% of unpublished/draft article and project detail pages are marked not indexable; 0% of published ones carry that marking.
- **SC-006**: 0 regressions in existing correct language-alternate behavior for static pages and project detail pages, confirmed by comparing output before and after this change.
- **SC-007**: 0 occurrences of development-phase placeholder wording remain in the site's default metadata, in either language.
- **SC-008**: 100% of the project's automated correctness, linting, and build checks pass with zero errors prior to release.

## Assumptions

- The mechanism by which articles are linked across languages (a shared cross-language grouping identifier, independent of slug text) already exists and is not being introduced by this feature — this feature adds a new *read* against that existing linkage, not the linkage itself.
- Projects already correctly pair their English/Arabic versions (via a shared slug) and already correctly compute their language-alternate links; this feature does not change that logic, only adds a preview image to project detail pages.
- Static pages already correctly compute their language-alternate links (a fixed one-to-one mapping between English and Arabic paths); this feature does not change that logic.
- Cover images referenced by articles and projects are already served through a public, scraper-fetchable address; this feature reuses that existing address rather than introducing new image handling.
- Unpublished/draft article and project detail pages are already restricted from general public viewing (visible only in an admin preview context); this feature only adds the "do not index" metadata signal on top of that existing gating — it does not change who can view a draft.
- The following are explicitly out of scope for this feature and are deferred to later, separate work: the sitemap; production robots.txt changes (sitemap reference, AI-crawler-specific rules, indexing headers on admin/API paths); structured data (JSON-LD) and `llms.txt`; structured-logging gaps; creating an actual site-default preview image asset (only the capability to use one is in scope here); legacy numeric-URL redirects for older portfolio items; Arabic footer heading copy; and infrastructure-level open questions (e.g. database connection behavior under autoscaling, background-task reliability) that require real-deployment verification rather than a code change.
- Exact mechanism-level decisions — the precise shape of the new counterpart-resolution read and its request-level caching, how the resolved counterpart reaches the client-side language switcher, the specific no-counterpart switcher behavior (disable vs. redirect), whether a site-default preview image ships now or later, and how the "unpublished" check is detected for the indexability signal — are intentionally left open for the planning phase, not decided here.
