# Phase 1 Data Model: Brand Assets, Default OG Image, Organization JSON-LD

No database entities or persisted records are introduced by this feature — everything here is a plain-object shape produced at request time by existing builder functions. Documented for completeness per the Key Entities in spec.md.

## PageMetadataInput (extended)

Existing type in `lib/metadata.ts`, extended with one new optional field:

| Field | Type | Required | Notes |
|---|---|---|---|
| `path` | `string` | yes | unchanged |
| `language` | `Language` | yes | unchanged |
| `title` | `string` | yes | unchanged |
| `description` | `string` | yes | unchanged |
| `languageAlternates` | `{ en: string \| null; ar: string \| null }` | no | unchanged |
| `imageUrl` | `string` | no | unchanged — when present, wins over the new default fallback (FR-003) |
| `ogType` | `"website" \| "article"` | no, default `"website"` | **new** — see plan.md "Resolved Ambiguity" |

## Metadata output (extended)

The `Metadata` object `buildPageMetadata` returns gains, inside `openGraph`:

| Field | Value | Condition |
|---|---|---|
| `openGraph.images` | `[{ url, width: 1200, height: 630 }]` (default) or `[{ url }]` (explicit `imageUrl`, unchanged shape) | Always present now (FR-002); default branch adds explicit dimensions (FR-004) |
| `openGraph.siteName` | `"OmniflowAI"` | Always (FR-005) |
| `openGraph.type` | `ogType` input, default `"website"` | Always (FR-005, resolved ambiguity) |
| `openGraph.locale` | `LANGUAGES[language].ogLocale` | Always (FR-005) |
| `openGraph.alternateLocale` | `LANGUAGES[otherLanguage].ogLocale` | Always (FR-005) |
| `twitter.images` | same fallback logic as `openGraph.images`, sans width/height (existing `twitter.images` shape is a bare URL array) | Always present now (FR-002) |

No existing field's meaning changes when `imageUrl` is supplied — FR-003 requires bit-for-bit identical output for that branch aside from the new siteName/type/locale additions, which apply uniformly regardless of `imageUrl`.

## LANGUAGES (extended)

`lib/language.ts` `LanguageConfig` gains one field:

| Field | Type | Notes |
|---|---|---|
| `ogLocale` | `"en_US" \| "ar_AR"` | **new** — single source of truth for FR-005; `en` → `"en_US"`, `ar` → `"ar_AR"` |

## Organization (new JSON-LD shape, not a stored entity)

Produced by the new `buildOrganizationJsonLd(language: Language)` in `lib/structured-data.ts`:

```ts
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORGANIZATION_ID,             // `${siteUrl}/#organization` — same value regardless of language
  name: "OmniflowAI",
  url: buildAbsoluteUrl(getLanguagePath("/", language)),  // language-appropriate home URL
  logo: {
    "@type": "ImageObject",
    url: buildAbsoluteUrl(LOGO_PATH),
    width: 512,
    height: 512,
  },
}
```

## ORGANIZATION_REF (existing, extended)

`lib/structured-data.ts:4-8`, gains one field, all else unchanged:

```ts
const ORGANIZATION_REF = (language: Language) => ({
  "@type": "Organization",
  "@id": ORGANIZATION_ID,   // new — same constant as buildOrganizationJsonLd
  name: "OmniflowAI",
  url: buildAbsoluteUrl(getLanguagePath("/", language)),
});
```

This is the field that makes SC-004 true: the `publisher` on the 4 existing detail pages' Article/CreativeWork JSON-LD now carries the identical `@id` string as the home pages' standalone Organization node (per FR-009).

## Asset path constants (new, in `lib/site.ts`)

| Constant | Value | Used by |
|---|---|---|
| `DEFAULT_OG_IMAGE_PATH` | `/og-default.png` | `buildPageMetadata` fallback (FR-002) |
| `LOGO_PATH` | `/logo.png` | `buildOrganizationJsonLd`'s `logo.url` (FR-007) |

Both are root-relative; absolute URLs are produced via the existing `buildAbsoluteUrl` helper only (FR-001) — no string concatenation at call sites.
