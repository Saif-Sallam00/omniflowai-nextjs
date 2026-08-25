# HTTP Contracts: Static Public Pages — Slice 1B

Full-stack Next.js App Router pages, not an API-first service. Every real page below is a Server Component page; the one non-page entry is a `next.config.ts` `redirects()` rule, not a route file. Documented per spec FR-001–FR-014.

---

## `GET /`

**Handler**: `app/(en)/(public)/page.tsx` (moved from `app/(en)/page.tsx`, content replaced — was 1A's placeholder; move is required by the `(public)` route-group correction, see Cross-cutting below)
**Language**: English (`lang="en"`, `dir="ltr"`)
**Auth**: none required
**Response**: real, faithfully-ported English home page content, wrapped in `<SiteShell language="en">` (header, nav, footer, language switcher).
**Metadata**: unchanged mechanism (1A's `buildPageMetadata`), real title/description — canonical `https://<deployment>/`, hreflang `en → /`, `ar → /ar`, `x-default → /`.
**Rendering**: static (no Dynamic API in the page, either layout level, or `SiteShell`; `LanguageSwitcher`'s `usePathname()` resolves during prerendering — research.md, Decision 2).

## `GET /ar`

**Handler**: `app/ar/(public)/page.tsx` (moved from `app/ar/page.tsx`, content replaced)
**Language**: Arabic (`lang="ar"`, `dir="rtl"`)
**Response**: real Arabic home page content, wrapped in `<SiteShell language="ar">`.
**Metadata**: canonical `https://<deployment>/ar`, hreflang alternates identical to `/`'s pair.

---

## `GET /about`

**Handler**: `app/(en)/(public)/about/page.tsx` (moved from `app/(en)/about/page.tsx`, content replaced)
**Language**: English
**Response**: real, faithfully-ported English about-page content.
**Metadata**: canonical `https://<deployment>/about`, hreflang `en → /about`, `ar → /ar/about`, `x-default → /about`.

## `GET /ar/about`

**Handler**: `app/ar/(public)/about/page.tsx` (moved from `app/ar/about/page.tsx`, content replaced)
**Language**: Arabic
**Response**: counterpart of `/about`.

---

## `GET /solutions` (new)

**Handler**: `app/(en)/(public)/solutions/page.tsx` (new file, mirrors `about/page.tsx`'s structure)
**Language**: English
**Response**: real content ported from current production's services page — this is the renamed page (EX-03).
**Metadata**: canonical `https://<deployment>/solutions`, hreflang `en → /solutions`, `ar → /ar/solutions`, `x-default → /solutions`.

## `GET /ar/solutions` (new)

**Handler**: `app/ar/(public)/solutions/page.tsx` (new file)
**Language**: Arabic
**Response**: counterpart of `/solutions`. Not a rename-in-place of any prior Arabic URL — production had no distinct Arabic services URL to begin with (spec Clarifications), so this URL is net-new/additive, not a migration of an existing one.

---

## `GET /services` (legacy redirect, EX-03)

**Handler**: none — a `next.config.ts` `redirects()` entry, evaluated before filesystem routing. No `page.tsx` exists at this path.
**Response**: redirect to `/solutions`. **Status code**: 308 via `permanent: true` (research.md, Decision 1 — Next.js's `redirects()` has no literal-301 option; 308 is functionally equivalent for this GET-only page and is the mechanism's built-in permanent-redirect status). Operator confirmed 308 — spec FR-005, User Story 4, and SC-004 now say "308 (permanent)."
**Query strings**: passed through to the destination automatically (Next.js `redirects()` default behavior) — `/services?foo=bar` → `/solutions?foo=bar`.
**Arabic side**: none exists or is added — there is no legacy Arabic services URL (spec Clarifications).

---

## `GET /<anything unmatched>` and `GET /ar/<anything unmatched>`

**Handler**: none (unchanged from 1A) — no `page.tsx` matches; Next.js's default not-found handling applies. `/services` is explicitly excluded from this bucket by the redirect above; it does not 404.
**Response**: `404` (1A's FR-008, unchanged and unaffected by this slice).

---

## Cross-cutting: `app/(en)/layout.tsx` and `app/ar/layout.tsx`

**UNCHANGED** from 1A — corrected from the original design, which would have imported `SiteShell` here directly. These two files are also the root layout for `app/(en)/admin/**`, which has no chrome of its own (`app/(en)/admin/(protected)/layout.tsx` only calls `requireAuth()` and returns `children`); importing `SiteShell` here would have leaked the public header/nav/footer/language-switcher into `/admin/*`. `<html lang dir>` hardcoding (1A) is unchanged either way.

## Cross-cutting: `app/(en)/(public)/layout.tsx` and `app/ar/(public)/layout.tsx` (new)

**New nested, URL-transparent route groups** — one per language tree, sibling to `app/(en)/admin/*` on the English side. Each imports and renders `<SiteShell language="en">{children}</SiteShell>` / `<SiteShell language="ar">{children}</SiteShell>` respectively, scoping the shared chrome to exactly the three public pages. Each also carries its own `metadata` fallback export (replacing the stale Phase-0-era "Foundation" copy that used to live in the now-unchanged parent layouts) — still overridden per-page by each page's own `generateMetadata()`, exactly as in 1A. Route groups add no URL segment, so `/`, `/about`, and `/solutions` are unaffected by this nesting.

## Cross-cutting: `components/site-shell.tsx` (new) and `components/language-switcher.tsx` (new)

**`SiteShell`**: Server Component, no Dynamic API calls, receives `language` as a hardcoded literal prop from each `(public)` layout. Renders header, three fixed nav links (home/about/solutions, computed via 1A's `getLanguagePath`), footer, and `<LanguageSwitcher />`. Both language trees' `(public)` layouts import the same component — they cannot structurally drift (FR-006).
**`LanguageSwitcher`**: `"use client"`, the sole Dynamic-rendering-relevant piece of the chrome. Uses `usePathname()` + the new `getAgnosticPath` + 1A's `getCounterpartPath` to link to the current page's exact counterpart. Does not force `SiteShell`, the layouts, or any page into dynamic rendering (research.md, Decision 2).

## Cross-cutting: `lib/language.ts`

**Modified** (not a new file) — adds one new export, `getAgnosticPath`, alongside 1A's existing `Language`, `LANGUAGES`, `resolveLanguageFromPathname`, `getLanguagePath`, `getCounterpartPath` (all unchanged, data-model.md).

## Cross-cutting: `proxy.ts`

**UNCHANGED.** No new responsibility. Still only the existing `/admin/:path*` matcher and cookie-presence auth-redirect check (Phase 0, reaffirmed unchanged through 1A). The `/services` redirect is handled entirely by `next.config.ts`, not `proxy.ts` (research.md, Decision 1).

## Cross-cutting: `next.config.ts`

**Modified** (not replaced) — adds a `redirects()` export alongside the existing `headers()` export. The existing global `X-Robots-Tag: noindex, nofollow` behavior (gated on `INDEXING_ENABLED`) is unchanged; `redirects()` and `headers()` are independent `NextConfig` fields with no interaction (research.md, Decision 1).

---

## Error contract

Unchanged from Phase 0/1A: `lib/error-handler.ts` still returns `{ "message": string }` JSON for any thrown error. This slice introduces no new error path — every response above is a normal Server Component render, a config-level redirect, or a default Next.js not-found.
