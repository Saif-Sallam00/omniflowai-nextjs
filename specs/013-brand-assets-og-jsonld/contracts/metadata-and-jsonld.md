# Contract: Internal metadata & JSON-LD builder interfaces

This project has no external API surface for this feature — the "contract" here is the internal function signature boundary between page files and the two shared builder modules (`lib/metadata.ts`, `lib/structured-data.ts`), since that boundary is what tasks/implementation must not break for existing callers.

## `buildPageMetadata(input: PageMetadataInput): Metadata`

**Location**: `lib/metadata.ts`

**Backward compatibility contract**: Every existing call site (16 call sites across both languages, listed in plan.md) continues to compile and produce output identical to today for all fields it does not newly touch. Specifically:
- Omitting `ogType` MUST behave exactly as before this feature for `openGraph.type` (i.e. resolves to `"website"`).
- Supplying `imageUrl` (the 2× portfolio detail pages, indirectly the 2× article detail pages that also pass their own cover image) MUST continue to produce the same `openGraph.images`/`twitter.images` shape as today for that image — no width/height is force-added to a caller-supplied image, only to the new default-image fallback branch.
- Every existing required field (`title`, `description`, `alternates.canonical`, `alternates.languages`) is unchanged.

**New behavior**:
- `imageUrl` absent → `openGraph.images` = `[{ url: buildAbsoluteUrl(DEFAULT_OG_IMAGE_PATH), width: 1200, height: 630 }]`, `twitter.images` = `[buildAbsoluteUrl(DEFAULT_OG_IMAGE_PATH)]`.
- `openGraph.siteName` = `"OmniflowAI"` always.
- `openGraph.type` = `input.ogType ?? "website"`.
- `openGraph.locale` = `LANGUAGES[input.language].ogLocale`; `openGraph.alternateLocale` = `LANGUAGES[otherLanguage].ogLocale`.

## `buildOrganizationJsonLd(language: Language): object`

**Location**: `lib/structured-data.ts` (new export)

**Contract**: Pure function, no side effects, mirrors the existing `buildArticleJsonLd`/`buildCaseStudyJsonLd` shape (`@context`, `@type`, plus entity fields) so callers can spread it into a `<script type="application/ld+json">` the same way the 4 existing detail pages already do. Returns the exact shape documented in data-model.md. Called with `"en"` on the EN home page and `"ar"` on the AR home page — same function, different `language` argument, same `@id` output both times.

## `ORGANIZATION_REF(language: Language): object` (existing, internal)

**Contract**: Remains a module-private (non-exported) helper, as it is today — only its returned shape changes (adds `@id`). `buildArticleJsonLd` and `buildCaseStudyJsonLd`'s own exported contracts (parameters and top-level returned fields) are unchanged; only the nested `publisher` sub-object gains the `@id` field. No existing detail-page call site needs to change.

## `LANGUAGES: Record<Language, LanguageConfig>` (existing, extended)

**Contract**: Existing consumers (`getLanguagePath`, `getCounterpartPath`, `resolveLanguageFromPathname`, `getAgnosticPath`, and any component reading `prefix`/`dir`/`htmlLang`) are unaffected — only one new field (`ogLocale`) is added to each language's config object. No existing field is renamed, removed, or retyped.
