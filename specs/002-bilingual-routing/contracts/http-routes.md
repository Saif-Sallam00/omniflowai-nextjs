# HTTP Contracts: Bilingual Routing Foundation — Slice 1A

Full-stack Next.js App Router pages, not an API-first service. Every route below is a Server Component page; there are no new Server Actions or Route Handlers in this slice. Documented per spec FR-001–FR-009.

Two placeholder routes are specified (a home-level route and a nested route, per FR-009); `/about` is used below as the concrete example for the nested route, matching the future slice 1B content plan — `/speckit-tasks` may confirm or rename it, provided both a home-level and a nested route are covered.

---

## `GET /`

**Handler**: `app/(en)/page.tsx` (Server Component, inside the `(en)` route group's own root layout, `app/(en)/layout.tsx`)
**Language**: English (`lang="en"`, `dir="ltr"`)
**Auth**: none required
**Response**: thin English home placeholder (no real Phase 1 content — that's slice 1B).
**Metadata** (via the shared helper, FR-005/FR-006): title, description, canonical `https://<deployment>/`, Open Graph, Twitter, hreflang `en → /`, `ar → /ar`, `x-default → /`.
**Indexing headers**: unchanged from Phase 0 — `X-Robots-Tag: noindex, nofollow` unless `INDEXING_ENABLED=true`. Not re-verified here; this slice only adds correct metadata *underneath* that existing header.

## `GET /ar`

**Handler**: `app/ar/page.tsx` (Server Component)
**Language**: Arabic (`lang="ar"`, `dir="rtl"`)
**Auth**: none required
**Response**: thin Arabic home placeholder — the counterpart of `/`, not independent content.
**Metadata**: canonical `https://<deployment>/ar`, hreflang `en → /`, `ar → /ar`, `x-default → /`.

---

## `GET /about`

**Handler**: `app/(en)/about/page.tsx` (Server Component, inside `app/(en)/layout.tsx`)
**Language**: English
**Auth**: none required
**Response**: thin English placeholder proving the URL-pairing and metadata mechanisms generalize past the home route (FR-009).
**Metadata**: canonical `https://<deployment>/about`, hreflang `en → /about`, `ar → /ar/about`, `x-default → /about`.

## `GET /ar/about`

**Handler**: `app/ar/about/page.tsx` (Server Component)
**Language**: Arabic
**Auth**: none required
**Response**: counterpart of `/about`.
**Metadata**: canonical `https://<deployment>/ar/about`, hreflang `en → /about`, `ar → /ar/about`, `x-default → /about`.

---

## `GET /<anything unmatched>` and `GET /ar/<anything unmatched>`

**Handler**: none — no `page.tsx` matches; Next.js's default not-found handling applies in both trees.
**Response**: `404` (FR-008). Not a `200` with empty or fallback content, in either language tree.
**Note**: this is a direct consequence of using mirrored literal route trees rather than a catch-all segment (research.md, Decision 1) — no bespoke 404 logic is written for this slice.

---

## Cross-cutting: `app/(en)/layout.tsx` and `app/ar/layout.tsx`

**Not routes** — the two independent root layouts this slice introduces (research.md, Decision 1). `app/(en)/layout.tsx` renders `<html lang="en" dir="ltr">`; `app/ar/layout.tsx` renders `<html lang="ar" dir="rtl">`. Both values are hardcoded literal JSX — neither layout calls a per-request Dynamic API to determine them, so no route in either tree is forced into per-request dynamic rendering on account of language; every route keeps Next.js's normal default static-rendering eligibility.
**`(en)` vs `ar`**: `(en)` is a route group (parentheses) — URL-transparent, contributes no path segment, so everything inside it (including `/about` and `/admin/*`) keeps its existing unprefixed URL. `ar` is a literal path segment — not a route group — which is what makes `/ar` and `/ar/about` exist as real URLs at all, while still qualifying as its own root layout boundary.
**`app/admin/*` → `app/(en)/admin/*`**: a pure directory move. Route groups add no URL segment, so every `/admin/*` URL and behavior (login, `requireAuth()`, sign-out) is unchanged; the move requires zero content edits since every admin file already imports via the `@/*` absolute alias, not relative paths.

## Cross-cutting: `proxy.ts`

**Not a route** — Next.js's request-time hook (Phase 0's `NextProxy`/`ProxyConfig`, per `proxy.ts`).
**UNCHANGED by this slice.** No new responsibility is added to it — language resolution is handled entirely by the two static root layouts above, not by `proxy.ts`. Its existing `/admin/*` cookie-presence auth-redirect logic (Phase 0) is untouched — same matcher (`"/admin/:path*"`), same `getSessionCookie` check, same redirect to `/admin/auth`. This slice does not touch authentication or add anything to this file.

---

## Error contract

Unchanged from Phase 0: the top-level error handler (`lib/error-handler.ts`) still returns `{ "message": string }` as JSON for any thrown error, no stack traces in production. Nothing in this slice introduces a new error path — all responses here are either a normal Server Component render or a default Next.js not-found.
