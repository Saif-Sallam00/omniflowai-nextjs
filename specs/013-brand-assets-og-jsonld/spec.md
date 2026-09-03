# Feature Specification: Brand Assets, Default OG Image, Organization JSON-LD

**Feature Branch**: `013-brand-assets-og-jsonld`

**Created**: 2026-09-03

**Status**: Draft

**Input**: User description: "Phase 5 — Slice 5.5: Brand Assets, Default OG Image, Organization JSON-LD, per docs/phase-5-slice-5-5-spec.md, with two corrections: (1) app/favicon.ico does not exist and must not be recreated — app/icon.png and app/apple-icon.png already cover favicon duty via Next.js file conventions; drop favicon.ico from the asset table and FR-5.1; (2) AC-9 is restated to verify app/icon.png and app/apple-icon.png resolve for a page under app/(en)/ AND a page under app/ar/, confirmed empirically rather than assumed, since the project has two root layouts via route groups."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Shared links show a real preview image (Priority: P1)

A visitor shares a link to any static page (home, about, services, contact, articles list, portfolio list) in a chat app or social platform. Today that page's link preview shows no image because no Open Graph image is emitted when the page has no page-specific image. After this change, the shared link shows the site's default brand image instead of a blank card.

**Why this priority**: This is the core problem statement — most of the site's pages currently share with a blank preview, which looks broken and reduces click-through. It is the highest-impact, most visible gap.

**Independent Test**: Share (or view source on) any static page's URL and confirm the Open Graph and Twitter image tags point at the default brand image with correct dimensions, without touching any other page type.

**Acceptance Scenarios**:

1. **Given** the English home page, **When** its page source is inspected, **Then** `og:image` resolves to the absolute default image URL, with `og:image:width` 1200 and `og:image:height` 630 present, and `twitter:image` is likewise set.
2. **Given** the Arabic home page, **When** its page source is inspected, **Then** the same default image and dimensions are present.
3. **Given** an article detail page or a portfolio detail page, which already supplies its own cover image, **When** its page source is inspected, **Then** `og:image` is still that item's own image — unchanged from current behavior, not the default.

---

### User Story 2 - Search engines and platforms recognize the organization behind the site (Priority: P2)

A search engine or link-preview platform reads a home page. Today there is no structured data anywhere on the site describing "OmniflowAI" as a distinct organization with a logo, even though article and portfolio pages already reference an organization as their publisher. After this change, both home pages carry a structured description of the organization, including its logo, and the existing publisher references resolve to that same organization.

**Why this priority**: This closes a real gap (a dangling reference with no entity to point at) but is secondary to the visible, user-facing preview-image fix in User Story 1.

**Independent Test**: View source on the English and Arabic home pages and confirm each contains a structured-data block describing the organization, including a logo image with its dimensions; then view source on an existing article detail page and confirm its publisher reference now matches the home page's organization identifier.

**Acceptance Scenarios**:

1. **Given** the English home page, **When** its page source is inspected, **Then** it contains a structured-data block identifying "OmniflowAI" as an organization, including a logo image reference with width and height, and a stable identifier.
2. **Given** the Arabic home page, **When** its page source is inspected, **Then** it contains the equivalent structured-data block, using the same stable identifier as the English page (one organization, not one per language).
3. **Given** an article detail page, **When** its structured data is inspected, **Then** its publisher reference carries the same stable identifier as the home page's organization block.

---

### User Story 3 - Pages show correct icons and richer social metadata in both languages (Priority: P3)

A visitor opens any page of the site, in either language, in a browser tab, and separately, a platform reads a home page's Open Graph tags. Today the site has no icon files at all, and static pages' Open Graph data lacks site name, content type, and language locale. After this change, the browser tab shows the site's icon on pages in both languages, and home page Open Graph data additionally states the site's name, content type, and correct language locale.

**Why this priority**: Icons and additive OG fields are polish on top of the core image and organization fixes — valuable, but lower-impact than either.

**Independent Test**: Open a page under the English section and a page under the Arabic section in a browser and confirm each shows the site's icon in the tab; separately, view source on both home pages and confirm the additional Open Graph fields are present and correctly localized.

**Acceptance Scenarios**:

1. **Given** a page under the English section of the site, **When** it loads in a browser, **Then** the browser tab shows the site's icon.
2. **Given** a page under the Arabic section of the site, **When** it loads in a browser, **Then** the browser tab shows the site's icon.
3. **Given** the English home page, **When** its page source is inspected, **Then** `og:site_name` is "OmniflowAI", `og:type` is "website", and `og:locale` reflects English.
4. **Given** the Arabic home page, **When** its page source is inspected, **Then** the same fields are present with `og:locale` reflecting Arabic — differing from the English page's value.

### Edge Cases

- A page that supplies its own image (article/portfolio detail pages) must never fall back to the default image — the existing per-item image always wins.
- The site has two independent root layouts (one for the English route group, one for Arabic). Icon resolution and the organization structured-data block must each be confirmed on both, not assumed to propagate from one to the other.
- The organization structured-data block and the existing nested publisher reference (on article/portfolio detail pages) must resolve to the identical stable identifier — they describe one real-world organization, not two.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST define the default social-preview image path and the organization logo image path as named, reusable values rather than repeating literal strings at each usage site.
- **FR-002**: When a page does not supply its own preview image, the system MUST fall back to the default social-preview image for both Open Graph and Twitter card metadata.
- **FR-003**: When a page does supply its own preview image (article and portfolio detail pages), that image MUST be used exactly as today — the fallback introduced by FR-002 MUST NOT alter any existing page's output.
- **FR-004**: The default social-preview image, when used, MUST be accompanied by explicit width (1200) and height (630) metadata, since some consuming platforms do not fetch the image to determine its dimensions.
- **FR-005**: Every static page's Open Graph metadata MUST additionally state the site name ("OmniflowAI"), a content type of "website", the page's language as a locale value, and the other supported language as an alternate locale value. These locale values MUST come from the single existing source that already maps supported languages, not from a newly introduced or duplicated source.
- **FR-006**: The system MUST introduce a stable, language-independent identifier for "OmniflowAI" as an organization, so that one organization entity is described once for the whole site rather than once per language.
- **FR-007**: The system MUST make available a way to produce a structured description of the organization, for a given language, containing: the organization's name, the language-appropriate home page URL, and its logo — with the logo described as an image with an explicit URL, width (512), and height (512), not as a bare image link.
- **FR-008**: The English home page and the Arabic home page MUST each embed the organization's structured description, in the same manner that existing detail pages already embed their own structured data.
- **FR-009**: The existing organization reference already nested inside article and portfolio detail pages' structured data MUST be updated to carry the same stable identifier introduced in FR-006, while keeping its existing name, type, and URL fields unchanged — so that reference and the home pages' organization description resolve to one entity.
- **FR-010**: The system MUST provide an icon file and an Apple touch icon file, placed so that both are picked up automatically for pages in the English section and pages in the Arabic section of the site, without any page needing to declare an icon manually.
- **FR-011**: No manually authored icon link tags may be added to any page or layout — icon resolution MUST rely solely on the automatic file-based convention.
- **FR-012**: A legacy `.ico`-format favicon file MUST NOT be introduced. It was previously removed because it broke the production build, and the icon file introduced under FR-010 already fulfills favicon duty.
- **FR-013**: The default social-preview image file and the organization logo image file MUST be reachable at their published locations and served with correct image content.

### Key Entities

- **Organization**: The single real-world entity "OmniflowAI." Represented in structured data with a name, a home page URL (language-appropriate), a logo image (with explicit dimensions), and one stable identifier shared by every reference to it across the site, regardless of language or page type.
- **Default social-preview image**: A single, language-neutral image used as the fallback preview for any page that does not supply its own.
- **Organization logo image**: A single, language-neutral image representing the organization's logo, distinct from the default social-preview image.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of static pages (home, about, services, contact, articles list, portfolio list) in both languages produce a non-blank social preview image when their link is shared or inspected.
- **SC-002**: 100% of article and portfolio detail pages continue to show their own item-specific preview image, with zero regressions from before this change.
- **SC-003**: Both home pages (English and Arabic) expose a structured organization description that a third-party structured-data validator accepts with zero errors.
- **SC-004**: The organization identifier referenced from existing article/portfolio publisher data matches the identifier on the home pages' organization description in 100% of checked cases.
- **SC-005**: A page under the English section and a page under the Arabic section each visibly display the site's icon in the browser tab, confirmed by direct observation in a browser.
- **SC-006**: Zero additional files outside those required for this feature are modified — no unrelated visual, schema, or dependency changes.

## Assumptions

- `public/og-default.png` (1200×630) and `public/logo.png` (512×512) already exist in the repository and are committed; this feature does not create, move, or resize any image asset.
- `app/icon.png` and `app/apple-icon.png` already exist in the repository as committed files serving their routes; this feature does not create or modify them, only confirms and relies on their automatic resolution under both root layouts.
- `app/favicon.ico` does not exist and is intentionally excluded from this feature — it was removed previously because it broke the production build, and the existing PNG icon files already cover favicon duty via framework convention.
- **Verified** (see plan.md "Verified Facts" for full citations): no standalone organization structured-data description exists anywhere in the site today. `lib/structured-data.ts:4-8` defines an internal organization reference used nested as `publisher` at exactly two call sites (`lib/structured-data.ts:32`, `:49`), reached from exactly 4 detail-page files. This is a genuine functional addition, not a pre-existing but unwired feature.
- **Verified** (see plan.md "Verified Facts" for full citations): `buildPageMetadata` (`lib/metadata.ts:54-66`) omits `openGraph.images` and `twitter.images` entirely — via a conditional spread of `{}` — whenever its `imageUrl` argument is absent. This is the exact defect FR-002 fixes; no existing fallback exists.
- Changes to the site's canonical URL configuration and any authentication-URL coupling are explicitly out of scope for this feature.
- Per-page custom preview images beyond the existing article/portfolio detail-page images are out of scope — static pages share one common default image.
- No visual or layout change to any rendered page is in scope — this feature concerns only metadata and structured data, plus confirming existing icon files resolve correctly.
- Verification against third-party tools (structured-data validators, social-platform debuggers) and production URL checks happens after this feature's changes are merged and deployed; it is not part of building the feature itself.
