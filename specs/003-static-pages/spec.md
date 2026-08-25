# Feature Specification: Static Public Pages (Slice 1B)

**Feature Branch**: `003-static-pages`

**Created**: 2026-08-25

**Status**: Draft

**Input**: User description: "Phase 1, Slice 1B — static public pages. Slice 1B delivers the real static public pages that sit on top of slice 1A's bilingual routing foundation: home, about, and services (renamed to 'solutions'), each in both languages. It also introduces the shared site chrome (header, nav, footer) and the visible language-switcher control that slice 1A deferred. This is the first slice with real content and real layout — but it is a faithful port of the current production site's structure and content, not a redesign. In scope: three bilingual static pages (home, about, solutions) replacing slice 1A's placeholders; a shared SiteShell (header, primary nav, footer) used by both language root layouts so the two trees never drift; the visible language-switcher deferred from 1A, consuming slice 1A's existing counterpart-URL logic; real per-page metadata for all three pages via slice 1A's existing metadata helper. Out of scope: portfolio/articles (slice 1C), contact form + email delivery (slice 1D), any visual redesign or new brand system, any database access. Hard constraints: URL preservation for home/about/solutions English URLs per standing rule 002, with a documented exception EX-03 — the services page's URL changes to /solutions and the old services URL must 301-redirect to /solutions; static rendering must be preserved, no per-request Dynamic API in the shell or layouts, the language switcher may be a small client-side island but must not force the shell or pages into dynamic/client rendering; reuse slice 1A's helpers (metadata builder, counterpart-URL logic, language list) rather than reimplementing them; no new runtime dependency without justification."

## Clarifications

### Session 2026-08-26

- Q: What is the current production site's home page URL? → A: `/` (confirmed against the route inventory)
- Q: What is the current production site's about page URL? → A: `/about` (confirmed against the route inventory)
- Q: What is the current production site's exact services page URL (the one that will 301-redirect to `/solutions`)? → A: `/services` (confirmed against the route inventory)
- Q: Is the current production site English-only today, or already bilingual (English + Arabic)? → A: Already bilingual — an Arabic version exists in production today; the Arabic copy for home, about, and solutions is ported directly from it, the same way the English copy is ported, not newly authored or translated.
- Q: What is the current production site's Arabic services-page URL, and does current production serve all Arabic pages under the `/ar/*` prefix (i.e. is the current Arabic scheme already `/ar/about`, `/ar/services`, etc.)? → A: There is no such URL. Current production has **no distinct Arabic URLs at all** — Arabic is client-side language switching on the same English-path URLs (confirmed by the operator: the Arabic homepage serves at bare `omniflowai.net`, with no `/ar` path). **Resolved, not a reopening**: the target `/ar/*` scheme (Principle VII) therefore *adds* net-new Arabic URLs on top of the existing route inventory — it does not change or fail to preserve any URL that currently exists. Standing rule 002 is fully satisfied by this slice as written: every current English-path URL is preserved (services via EX-03's redirect), and there is no pre-existing Arabic URL to preserve or redirect, so none is needed or possible. **FR-005, User Story 4, SC-004, and EX-03 remain English-only, exactly as already written — this is their confirmed final scope, not a pending gap.** Noted consequence, by design and not a regression: at cutover, root-path URLs that currently client-render Arabic (for a visitor whose browser/session selected it) will serve English instead, with Arabic content now living at `/ar/*`. This is the intended outcome of Principle VII — the URL is the sole source of truth and a persisted language preference never overrides it — and returning Arabic visitors reach Arabic content via the language switcher or by navigating directly to the `/ar/*` URL.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor reads real home page content in their language (Priority: P1)

A visitor requests the site's home page, in English or in Arabic, and sees the actual home page content — headline, sections, and layout ported faithfully from the current production site — instead of slice 1A's thin placeholder.

**Why this priority**: The home page is the highest-traffic entry point and the first page most visitors and search engines encounter. Until it carries real content, nothing about this slice is demonstrably done, and every other page in this slice depends on the same content and metadata mechanisms being proven here first.

**Independent Test**: Can be fully tested by requesting `/` and `/ar` and confirming the rendered HTML contains the real home page content (not the slice 1A placeholder) in the correct language, with no other slice's functionality required.

**Acceptance Scenarios**:

1. **Given** a visitor requests `/`, **When** the response is inspected, **Then** it contains the real English home page content and layout, not the slice 1A placeholder.
2. **Given** a visitor requests `/ar`, **When** the response is inspected, **Then** it contains the real Arabic home page content and layout, mirroring the English page's structure.
3. **Given** the home page in either language, **When** the initial HTML response is inspected before any client-side script runs, **Then** the full page content is already present (no loading state, no client-side population).

---

### User Story 2 - Visitor navigates the site via shared header, nav, and footer, and switches language (Priority: P2)

A visitor on any of the three pages sees a consistent header, primary navigation, and footer, and can use a visible language-switcher control to jump to the exact same page in the other language — never landing on that language's home page as a fallback.

**Why this priority**: The shared site chrome and language switcher are visible on every page in this slice, so they gate whether the site feels like one coherent bilingual product rather than two independently assembled trees. This depends on User Story 1 having established real page rendering, but must work before Users Story 3's additional pages can be considered complete, since they render inside the same chrome.

**Independent Test**: Can be fully tested by loading each of the three pages in each language, confirming identical chrome structure across languages, and clicking the language switcher from each page to confirm it lands on that exact page's counterpart — independent of the specific page content from User Story 1 or 3.

**Acceptance Scenarios**:

1. **Given** any of the three pages in either language, **When** the page is rendered, **Then** it displays the same header, primary navigation, and footer structure as every other page in this slice, with only the text and reading direction differing by language.
2. **Given** a visitor viewing the Arabic About page, **When** they activate the language switcher, **Then** they land on the English About page (`/about`) — not the English home page.
3. **Given** a visitor viewing the English Solutions page, **When** they activate the language switcher, **Then** they land on the Arabic Solutions page — not the Arabic home page.
4. **Given** the navigation in the shared chrome, **When** a visitor is on any page in a given language, **Then** the nav links and labels are rendered in that page's language.

---

### User Story 3 - Visitor reads real About and Solutions page content in their language (Priority: P3)

A visitor requests the About page or the (renamed) Solutions page, in either language, and sees that page's actual content, faithfully ported from the current production site's equivalent page.

**Why this priority**: Extends the same proven content/metadata/chrome mechanism from User Story 1 to the remaining two page types. Lower priority than the home page and the shared chrome because these pages reuse both without introducing new mechanisms, but still required for the slice to be complete.

**Independent Test**: Can be fully tested by requesting `/about`, `/ar/about`, `/solutions`, and `/ar/solutions` and confirming each contains its real, faithfully-ported content in the correct language.

**Acceptance Scenarios**:

1. **Given** a visitor requests `/about` or `/ar/about`, **When** the response is inspected, **Then** it contains the real About page content in the correct language.
2. **Given** a visitor requests `/solutions` or `/ar/solutions`, **When** the response is inspected, **Then** it contains the real Solutions page content (the current production site's services content, faithfully ported) in the correct language.

---

### User Story 4 - Inbound links to the old services URL still work after cutover (Priority: P4)

A visitor or search engine following an existing link to the current production site's services page is automatically taken to the new Solutions page at its new URL, without landing on a broken link.

**Why this priority**: This is the one deliberate URL change in this slice (exception EX-03) and protects existing inbound links and search ranking. Lower priority than the pages themselves rendering correctly, since the redirect is only meaningful once `/solutions` exists to redirect to.

**Independent Test**: Can be fully tested by requesting the old production services URL and confirming a permanent redirect response pointing to `/solutions`, independent of the other stories.

**Acceptance Scenarios**:

1. **Given** the old production services URL, **When** it is requested, **Then** the response is an HTTP 308 permanent redirect to `/solutions`.

---

### Edge Cases

- The language switcher must resolve to the exact counterpart page (via slice 1A's existing counterpart-URL logic) for all three page types — it must never fall back to that language's home page when a same-page counterpart exists.
- The shared site chrome (header, nav, footer) must render as static, server-produced HTML in both language trees; only the switcher's own small interactive element may be a client-side island, and it must not force the surrounding page or chrome into dynamic or client rendering.
- If a visitor's browser has JavaScript disabled, the language switcher must still be a real, working link to the counterpart page — its href must not depend on client-side script to be correct, since the surrounding shell is static.
- The old-services-URL redirect must be a permanent (308) redirect, not a temporary one, and must not vary based on request language, query string presence, or trailing slash.
- Nav and footer labels must never mix languages within a single rendered page — the entire chrome must present in the same language as the page's own content.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST serve real, faithfully-ported content (not placeholder content) for three page types — home, about, and solutions — in both English and Arabic, replacing slice 1A's placeholder pages at the equivalent routes. The Arabic copy for all three pages MUST be ported directly from the current production site's existing Arabic content, the same way the English copy is ported — it is not newly authored or translated as part of this slice.
- **FR-002**: The home page MUST be served at English root path `/` (confirmed as the current production home URL against the reverse-engineering route inventory) and at `/ar` in Arabic.
- **FR-003**: The about page MUST be served at English path `/about` (confirmed as the current production about-page URL against the reverse-engineering route inventory) and at `/ar/about` in Arabic.
- **FR-004**: The current production "services" page MUST be served under the new English path `/solutions` and `/ar/solutions` in Arabic — this is exception EX-03 to standing rule 002 (URL preservation), documented in Assumptions below, and is a deliberate URL change, not an oversight.
- **FR-005**: System MUST serve a permanent (HTTP 308, not 301 — Next.js's `redirects({ permanent: true })` emits 308 by design; for a GET-only page, 308 is permanent and passes full link equity identically to 301, and avoids a custom dynamic Route Handler) redirect from the current production services page's exact URL, `/services` (confirmed against the reverse-engineering route inventory), to `/solutions`, so existing inbound links and search equity survive cutover.
- **FR-006**: System MUST provide one shared site-chrome component (header, primary navigation, footer) that both the English and Arabic root layouts import, so the two language trees cannot structurally drift from each other.
- **FR-007**: The shared site chrome MUST render its navigation labels and footer content in the language of the page tree it is rendered within.
- **FR-008**: System MUST provide a visible language-switcher control, present in the shared site chrome on all three page types, that links the current page to its exact counterpart page in the other language.
- **FR-009**: The language switcher MUST compute its target URL using slice 1A's existing counterpart-URL logic — this slice MUST NOT introduce new or duplicate URL-pairing logic.
- **FR-010**: Each of the three pages, in each language, MUST expose real, page-specific metadata (title, description, canonical URL, Open Graph tags, Twitter tags, hreflang alternates) generated via slice 1A's existing per-page metadata mechanism — no placeholder or generic sitewide values.
- **FR-011**: The shared site chrome and both root layouts MUST render as static output — neither MUST read per-request data (e.g., request headers or cookies) to decide what to render.
- **FR-012**: Any interactive behavior needed by the language switcher MUST be isolated to the smallest possible piece of the chrome, and MUST NOT convert the enclosing page, layout, or shell into a per-request dynamic or fully client-rendered component.
- **FR-013**: This slice MUST NOT introduce portfolio pages, article pages, a contact form, or any database access — those are explicitly deferred to slices 1C and 1D.
- **FR-014**: This slice MUST NOT add a new runtime dependency unless explicitly justified against the constitution's scope-discipline principle.

### Key Entities

- **Static Page**: One of home, about, or solutions — a language-agnostic content unit rendered at a fixed English path and its `/ar`-prefixed Arabic counterpart, carrying real body content and page-specific metadata (reusing the "Page" concept established in slice 1A).
- **Site Chrome**: The shared header, primary navigation, and footer structure rendered around every page in both language trees, including the language-switcher control; identical in structure between languages, differing only in language-specific text and reading direction.
- **Legacy Redirect**: A fixed mapping from the current production site's old services-page URL to the new `/solutions` URL, served as a permanent redirect.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor loading any of the three pages, in either language, sees that page's complete, real content in the initial HTTP response — with zero pages still showing slice 1A's placeholder content.
- **SC-002**: A visitor on any of the three pages can reach that exact page's counterpart in the other language in a single interaction, landing on the equivalent page (not the other language's home page) 100% of the time.
- **SC-003**: All six page/language combinations (3 pages × 2 languages) expose accurate, page-specific canonical, hreflang, and social-preview metadata, verifiable by inspecting the raw HTML alone.
- **SC-004**: 100% of requests to the old production services URL receive a permanent (308) redirect to `/solutions`, with zero broken links reported for that URL after cutover.
- **SC-005**: The header, navigation, and footer render with identical structure across both language trees on every page in this slice, differing only in language-specific text and direction — zero structural drift between the two trees.
- **SC-006**: All three pages continue to render as static output (verifiable via the production build's route output), with zero pages in this slice becoming server-rendered per-request.

## Assumptions

- **URL mapping (confirmed)**: home = `/`, about = `/about`, and services (renamed) = `/solutions`, with the old services page's current production path being `/services`. All three are confirmed against the reverse-engineering route inventory (see Clarifications above); no open marker remains.
- **Exception EX-03 (standing rule 002)**: The services page's URL intentionally changes from its current production path (`/services`) to `/solutions`. This is a deliberate, documented exception to URL preservation, mitigated by the mandatory 308 permanent redirect in FR-005. It is recorded here as exception EX-03, alongside EX-01 and EX-02 already on file in the constitution.
- **Source of Arabic content (confirmed)**: The current production site is already bilingual. The Arabic copy for home, about, and solutions is ported directly from the existing Arabic production content, exactly as the English copy is ported — it is not a net-new content-authoring dependency for this slice.
- This slice is a faithful port of the current production site's structure and content for these three pages — clean, responsive styling is expected, but no visual redesign or new brand system is introduced.
- No database schema change, migration, or query is introduced by this slice; all three pages and the shared chrome are static content with no data dependency.
- Slice 1A's `buildPageMetadata`, `getCounterpartPath`, and language-list helpers are reused as-is; this slice does not reimplement language resolution, metadata construction, or URL-pairing logic.
- The global `X-Robots-Tag: noindex, nofollow` protection introduced in Phase 0 remains unchanged and continues to apply to every route in this slice; this slice's acceptance criteria verify metadata *correctness*, not indexability.
- Portfolio, articles, and the contact form remain out of scope, deferred to slices 1C and 1D respectively, as already established in slice 1A's spec.
