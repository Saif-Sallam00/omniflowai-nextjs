# Feature Specification: Bilingual Routing Foundation

**Feature Branch**: `002-bilingual-routing`

**Created**: 2026-08-25

**Status**: Draft

**Input**: User description: "Phase 1, Slice 1A — the bilingual routing foundation. Slice 1A delivers the bilingual routing and shared page plumbing that every Phase 1 public page builds on. Infrastructure only — no real content, no visible UI controls — verified against thin placeholder pages. In scope: bilingual routing (English at root, Arabic under /ar/*, URL as sole source of truth per constitution Principle VII), request-time language resolution from the URL path, correct <html lang dir> per language, a reusable per-page metadata helper (title, description, canonical, Open Graph, Twitter, hreflang en/ar/x-default), URL-pairing logic between language counterparts, and 404s for unknown routes in both trees. Out of scope: language-switcher control, real page content, data-driven pages, markdown pipeline, contact form (deferred to slices 1B/1C/1D). No schema changes. The exact i18n mechanism is an open question left for /speckit-plan."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor sees content in the language dictated by the URL (Priority: P1)

A visitor requests a page. Whether they see the English or Arabic version is determined entirely by which URL they requested — the root path for English, the `/ar` prefix for Arabic — never by their browser language, a stored cookie, or a prior visit.

**Why this priority**: This is the foundational, load-bearing behavior. Every other Phase 1 page, and every acceptance criterion in this slice, depends on the rendered language being derived correctly and exclusively from the URL. Nothing else in this slice can be verified until this holds.

**Independent Test**: Can be fully tested by requesting a placeholder route at its root path and at its `/ar`-prefixed equivalent and inspecting the initial HTML response's `<html>` tag and visible text — no other slice's functionality is required.

**Acceptance Scenarios**:

1. **Given** a visitor with no stored language preference, **When** they request the root placeholder page (`/`), **Then** the response is the English placeholder page with `<html lang="en" dir="ltr">`.
2. **Given** the same visitor, **When** they request the Arabic-prefixed equivalent (`/ar`), **Then** the response is the Arabic placeholder page with `<html lang="ar" dir="rtl">`.
3. **Given** a visitor whose browser/device language is set to Arabic and who carries a stored cookie or preference indicating Arabic, **When** they request `/`, **Then** the response is still the English placeholder page — the stored preference does not override the URL.
4. **Given** the reverse visitor (device/cookie set to English), **When** they request `/ar`, **Then** the response is still the Arabic placeholder page.

---

### User Story 2 - Each page exposes correct per-page metadata and its language-counterpart link (Priority: P2)

Every page, in either language, carries its own title, description, canonical URL, social-preview tags, and a correct link to its counterpart page in the other language — without each page having to build this itself.

**Why this priority**: Depends directly on User Story 1 (the correct language must already be resolving). It is the next most critical piece because it is what makes every future page correctly discoverable and correctly linked across languages — the reusable mechanism this slice exists to deliver.

**Independent Test**: Can be fully tested by requesting each placeholder route in each language and inspecting the initial HTML `<head>` for title, description, canonical URL, Open Graph tags, Twitter tags, and hreflang alternates — independent of any other slice.

**Acceptance Scenarios**:

1. **Given** the English placeholder page at `/`, **When** its HTML is inspected, **Then** it contains a title, a description, a canonical URL pointing to `/`, Open Graph and Twitter tags, and hreflang alternates for `en` (pointing to `/`), `ar` (pointing to `/ar`), and `x-default`.
2. **Given** the Arabic placeholder page at `/ar`, **When** its HTML is inspected, **Then** it contains the equivalent metadata, with its canonical URL pointing to `/ar` and its hreflang alternates cross-referencing `/` and `/ar` correctly.
3. **Given** a second, nested placeholder route implemented in both languages (e.g. one path segment deep), **When** its HTML is inspected in each language, **Then** its canonical URL and hreflang alternates correctly reference its own nested path pair — not the home page's.

---

### User Story 3 - Visiting a URL with no matching page returns not-found, not a blank success (Priority: P3)

A visitor or crawler requesting a path that doesn't correspond to any implemented page gets a genuine not-found response, in either language tree.

**Why this priority**: Lower priority than correct rendering of real routes, but still required before Phase 1 content ships — an incorrect 200-with-nothing response would misrepresent every future missing or mistyped URL to visitors and crawlers alike.

**Independent Test**: Can be fully tested by requesting a path that matches no implemented route under `/` and under `/ar` and confirming a not-found response in both cases — independent of any other slice.

**Acceptance Scenarios**:

1. **Given** no page exists at `/this-does-not-exist`, **When** it is requested, **Then** the response is a not-found (404) response.
2. **Given** no page exists at `/ar/this-does-not-exist`, **When** it is requested, **Then** the response is a not-found (404) response.

---

### Edge Cases

- A bare request to `/ar` (no further path segments) MUST resolve to the Arabic home placeholder, exactly mirroring how `/` resolves to the English home placeholder.
- A route that exists in only one language tree (should one ever occur) MUST still correctly return not-found in the other tree — never silently redirect to the wrong language or render the wrong language's content in its place.
- Cross-language URL-pairing MUST only produce hreflang alternates and counterpart links for routes that actually exist in both languages — it must not fabricate a plausible-looking link to a page that isn't actually implemented.
- Standard URL normalization (e.g. trailing slashes) does not change which language tree a request belongs to — the presence or absence of the `/ar` prefix remains the only signal.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST serve the English-language variant of every implemented page at its unprefixed root-relative path (e.g. `/`), with no `/en` prefix ever introduced.
- **FR-002**: System MUST serve the Arabic-language variant of the same page under the `/ar` prefix (e.g. `/ar`), mirroring the English path structure exactly except for that prefix.
- **FR-003**: System MUST determine the rendered language for a given request solely from the URL path (presence or absence of the `/ar` prefix). No cookie, stored preference, `Accept-Language` header, or other signal may influence which language is rendered for a given URL.
- **FR-004**: System MUST emit `<html lang="en" dir="ltr">` in the initial HTML response for every route in the English tree, and `<html lang="ar" dir="rtl">` for every route in the Arabic tree.
- **FR-005**: System MUST provide one reusable mechanism that any Phase 1 page can call to emit its page-specific metadata — title, description, canonical URL, Open Graph tags, Twitter tags, and hreflang alternates (`en`, `ar`, `x-default`) — present in the initial HTML response, so individual pages never re-implement this logic themselves.
- **FR-006**: The canonical URL emitted for a page MUST be that page's own resolved URL (self-referencing), never a fixed sitewide URL. Canonical and hreflang URLs MUST be absolute (fully-qualified, including scheme and host), as required for valid hreflang annotations.
- **FR-007**: System MUST provide a way to compute, for any given implemented route, the URL of its counterpart in the other language (English→Arabic and Arabic→English) by applying the root/`/ar` prefix mapping. This computation is what feeds the hreflang alternates required by FR-005, and is the logic the future language-switcher control (slice 1B) will also depend on.
- **FR-008**: Requesting a URL that does not correspond to any implemented route MUST return an HTTP 404 response — in both the English tree and the Arabic tree — never a 200 response with fallback or empty content.
- **FR-009**: This slice MUST be verified against at least two distinct placeholder routes (a home-level route and one nested route), each implemented in both languages, so the language resolution, metadata, and URL-pairing mechanisms are demonstrated working beyond the trivial single-segment case.

*No requirement in this list required a [NEEDS CLARIFICATION] marker — the feature description supplied explicit, unambiguous scope, constraints, and deferrals for every decision this spec needed to make.*

### Key Entities

- **Page**: A single routed location in the site, identified by a language-agnostic path (e.g. "home", "about") plus the language it's being rendered in. Carries its own metadata (title, description, canonical URL) and belongs to exactly one language tree per request.
- **Language**: One of two supported values (English, Arabic), each with a fixed URL prefix (none, `/ar`), a fixed text direction (`ltr`, `rtl`), and a fixed `lang` attribute value (`en`, `ar`).
- **URL Pair**: The relationship between a page's English URL and its Arabic URL — the same logical page, resolvable in either language, used to generate hreflang alternates and (in a later slice) the language-switcher's target link.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor loading a page's English URL and a visitor loading its Arabic-prefixed equivalent both see correctly language-tagged HTML (correct `lang` and reading direction) on the very first response, with no additional visitor action required.
- **SC-002**: 100% of implemented placeholder routes expose correct, page-specific canonical, hreflang (`en`/`ar`/`x-default`), and social-preview metadata in the initial HTML response — verifiable by inspecting the raw HTML alone, before any client-side behavior runs.
- **SC-003**: 100% of requests to URLs with no matching implemented route return a not-found response, in both language trees, with zero exceptions.
- **SC-004**: A page added in a later slice can adopt correct bilingual routing, `lang`/`dir`, and full per-page metadata by reusing this slice's shared mechanisms alone — with zero page-specific reimplementation of language detection, metadata boilerplate, or URL-pairing logic.
- **SC-005**: For any given URL, changing a visitor's browser/device language setting or any previously stored language preference never changes which language that URL renders — the same URL renders the same language 100% of the time.

## Assumptions

- This slice ships enough thin placeholder pages — at minimum a home-level page and one nested page, each in both languages — to demonstrate the routing, `lang`/`dir`, metadata, and URL-pairing mechanisms working across more than the trivial root-only case. These placeholders carry no real Phase 1 content; real content is slice 1B's scope.
- The visible language-switcher UI control is explicitly deferred to slice 1B; this slice is only responsible for making sure the URL-pairing logic it will consume is correct and available.
- Data-driven pages (articles, portfolio) and the markdown rendering pipeline are deferred to slice 1C; the contact form and its email delivery are deferred to slice 1D. Neither is touched here.
- No database schema change or migration is introduced by this slice — the target schema is already complete from Phase 0, and this slice is routing/plumbing only.
- Global indexing protection (the `X-Robots-Tag: noindex, nofollow` header applied to every route until `INDEXING_ENABLED=true`, per Phase 0) is unchanged by this slice and continues to apply. This slice's acceptance criteria verify that `lang`, `dir`, canonical, hreflang, and metadata are *present and correct* — not that pages are indexable, and not touching that configuration.
- `x-default` in a page's hreflang alternates points at that page's OWN English counterpart URL (e.g. for the about-page pair, `x-default → /about`, never the site homepage), following common hreflang convention. This slice introduces no separate language-negotiation landing page.
- The absolute-URL base (scheme + host) needed for canonical and hreflang is a configuration input. Whether it reuses an existing variable (e.g. `BETTER_AUTH_URL`) or introduces a dedicated site-URL variable is a `/speckit-plan` decision — flag any new variable rather than silently adding it.
- The exact technical mechanism for language resolution and routing (e.g. an i18n library versus a minimal hand-rolled dictionary-and-routing approach) is an open implementation question, intentionally left unresolved here for `/speckit-plan` to research and decide — including flagging, rather than silently accepting, any new runtime dependency that decision would introduce.
