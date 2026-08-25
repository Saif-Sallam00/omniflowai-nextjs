# Data Model: Bilingual Routing Foundation

**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

This slice introduces **zero database schema changes and zero migrations** (per spec Assumptions — the Phase 0 schema is already complete for later phases). The "entities" below are in-memory/config `type` shapes only, not Drizzle tables — they exist purely to give `/speckit-tasks` a concrete shape for the pure helper functions research.md's Decision 1 calls for. Named to mirror the spec's own Key Entities section.

## Language

Represents one of the two supported languages and everything fixed about it.

```ts
type Language = "en" | "ar";

type LanguageConfig = {
  prefix: "" | "/ar";   // URL prefix — "" for English (root), per standing rule 002 no /en prefix
  dir: "ltr" | "rtl";
  htmlLang: "en" | "ar"; // value for <html lang="...">
};
```

- Exactly two values exist; this is a closed set, not open for future extension within this slice.
- `LANGUAGES: Record<Language, LanguageConfig>` is the single source of truth these fixed attributes are read from — every other helper (pathname resolution, URL-pairing, `<html>` attributes) derives from this one config object rather than re-encoding `"/ar"`/`"ltr"`/etc. in multiple places.

**Validation rule**: a pathname resolves to exactly one `Language` — never zero, never both (FR-003). The default (any path not starting with `/ar`) is `"en"`.

## Page

A single routed location, identified by a language-agnostic logical path, rendered in one language per request.

```ts
type PageMetadataInput = {
  path: string;        // language-agnostic path, e.g. "/" or "/about" (no /ar prefix)
  language: Language;
  title: string;
  description: string;
};
```

- Not persisted anywhere — this is the shape a page's `generateMetadata` passes into the shared metadata helper (FR-005). `path` is always the *English-form* path (unprefixed); the helper derives both the current language's URL and its counterpart from `path` + `language` using the URL Pair logic below.
- Each of this slice's placeholder pages (home, and one nested route — see [quickstart.md](./quickstart.md)) constructs one `PageMetadataInput` and passes it to the shared helper; no page hand-builds canonical/OG/hreflang tags itself (SC-004).

## URL Pair

The relationship between a page's English URL and its Arabic URL — the same logical page, resolvable in either language.

```ts
type UrlPair = {
  en: string;  // absolute URL, e.g. "https://example.replit.app/about"
  ar: string;  // absolute URL, e.g. "https://example.replit.app/ar/about"
};
```

- Computed, never stored — produced by applying `LanguageConfig.prefix` for each language to the same logical `path`, then qualifying with the absolute-URL base (research.md Decision 2).
- Consumed by:
  - The metadata helper, to emit hreflang alternates (`en`, `ar`, and `x-default` — which points at the pair's `en` URL, per spec Assumptions).
  - The future language-switcher control (slice 1B), which is out of scope here but is the reason this logic is a standalone, reusable function rather than inlined into the metadata helper (FR-007).

## Relationships

```
Language (2 fixed values)
   └─ used by → Page (a request resolves to exactly one Language)
   └─ used by → URL Pair (a pair has exactly one URL per Language)

Page ──(path + language)──> URL Pair ──> feeds hreflang alternates in Page's own metadata
```

No entity here has a lifecycle, a create/update/delete flow, or a persistence layer — everything in this document is derived synchronously from the current request's URL on every response.
