# Phase 1 Data Model: Dedicated `SITE_URL` Environment Variable

This feature has no application data (no database tables, no request/response payloads). Its only "entities" are configuration values and the derived identity they feed.

## Entity: Environment Configuration Variable (`SITE_URL`)

| Field | Type | Rule |
|---|---|---|
| Presence | required | Boot-time production validation fails (process exits) if absent. No fallback value. |
| Format | string, URL | Must parse as a well-formed URL (any scheme — `https` not required). |
| Trailing slash | forbidden | A value ending in `/` is rejected with a message stating the trailing-slash rule explicitly, distinct from the generic "not a valid URL" message. |
| Scope | production-only validation | Consistent with the four existing variables: `lib/env.ts` only parses `envSchema` when `NODE_ENV === "production"`; in development the raw `process.env` value (or `undefined`) is used unchecked. This is pre-existing, unchanged behavior. |

Relationship: `SITE_URL` is one of five sibling members of the same `envSchema` object (`DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and now `SITE_URL`). It has no relationship to `BETTER_AUTH_URL` beyond being validated independently and, prior to this feature, having accidentally shared a downstream consumer.

## Entity: Public Site Identity (`siteUrl`, exported from `lib/site.ts`)

| Field | Type | Source (after this feature) | Source (before this feature) |
|---|---|---|---|
| `siteUrl` | string (URL, no trailing slash) | `env.SITE_URL` | `env.BETTER_AUTH_URL` |
| `DEFAULT_OG_IMAGE_PATH` | string (root-relative path) | Unchanged: `"/og-default.png"` | Unchanged |
| `LOGO_PATH` | string (root-relative path) | Unchanged: `"/logo.png"` | Unchanged |

Relationship: `siteUrl` is the sole input to every absolute public URL the site emits. Its consumers (confirmed exhaustively by PV-4) are:

- `lib/metadata.ts` → `buildAbsoluteUrl` → canonical, hreflang alternates, OG URL/image, Twitter card URL for every page via `buildPageMetadata`.
- `lib/structured-data.ts` → `ORGANIZATION_ID` (`${siteUrl}/#organization`) and the JSON-LD `url` fields for Organization, Article, and CreativeWork nodes.
- `app/sitemap.ts` → every `<url><loc>` entry in the generated sitemap.
- `app/robots.ts` → the `sitemap` field's absolute URL.

No consumer reads `SITE_URL` directly; all go through `siteUrl`. This is the invariant FR-2.4/FR-006 requires and PV-4 confirmed already holds today for `BETTER_AUTH_URL`.

## State transition

There is no runtime state transition — `siteUrl` is computed once at module load from the validated `env` object and never changes for the life of the process. The only "transition" this feature introduces is at the configuration level: the source `siteUrl` reads from changes from `BETTER_AUTH_URL` to `SITE_URL`, one time, in this change.
