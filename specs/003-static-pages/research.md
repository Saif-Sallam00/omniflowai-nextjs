# Phase 0 Research: Static Public Pages — Slice 1B

**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Three research items were scoped by the operator for this slice. All three are resolved below. One (Decision 1) surfaces a real discrepancy between the spec's literal wording and Next.js's built-in behavior that the operator should explicitly confirm before `/speckit-tasks` locks it in — it is not silently resolved either direction.

---

## Research Item 1: Where does the `/services` → `/solutions` redirect live?

**Decision**: `next.config.ts`'s `redirects()` function — the operator's stated strong prior is confirmed correct. `proxy.ts` is not touched.

**Rationale**:
- `redirects()` is evaluated "before the filesystem, which includes pages and `/public` files" (Next.js docs), so no `page.tsx` needs to exist at `/services` at all — the redirect fires before Next.js would otherwise 404 on the now-removed route. Zero extra route file.
- `redirects()` and the existing `headers()` export in `next.config.ts` are independent `NextConfig` fields with no documented interaction or ordering conflict; adding one does not require restructuring or gate the other. Verified directly against the current `next.config.ts` (only `headers()` is present today — no `redirects`, `rewrites`, or `cacheComponents` key) and against Next.js's own `redirects()` reference doc (fetched 2026-08-26, matching pinned `16.3.1`/`16.3.3`).
- `proxy.ts` is explicitly scoped to the `/admin/:path*` matcher and the Better Auth session-cookie check (Phase 0 FR-6.6, reaffirmed unchanged in slice 1A). A static, unconditional, unauthenticated redirect for a public marketing URL has nothing to do with that job — folding it into `proxy.ts` would broaden a security-relevant file's matcher and responsibility for a concern that has no dependency on request-time logic at all (`/services` always redirects to `/solutions`, for every visitor, unconditionally). `next.config.ts` is the config-level, build-time-known home for exactly this kind of static rule; `proxy.ts` stays untouched, exactly as the operator specified.

**Flagged for operator confirmation — literal status code**: Next.js's `redirects()` does not support HTTP 301. Per its own docs: `permanent: true` maps to **308**, `permanent: false` maps to **307** — "Next.js uses the 307 temporary redirect, and 308 permanent redirect status codes to explicitly preserve the request method," specifically *instead of* the traditional 302/301 pair. There is no `redirects()` option to force a literal 301.

Spec FR-005, User Story 4's acceptance scenario, and SC-004 all say "HTTP 301 permanent redirect" explicitly. Taken completely literally, `next.config.ts` `redirects()` cannot satisfy that exact wording — it will always answer with 308 for a permanent redirect, never 301.

Two ways to resolve this, neither picked unilaterally here:

| Option | What it does | Tradeoff |
|---|---|---|
| **A — Accept 308, treat spec wording as "a permanent redirect" not a literal status-code mandate (recommended)** | Use `redirects()` with `permanent: true` → 308. | For a GET-only static marketing page (no POST/PUT semantics to preserve or break), 301 and 308 are observably and functionally identical to every real consumer: both are permanent, both are cached indefinitely by browsers and CDNs, and Google's own guidance treats 301 and 308 as equivalent for passing ranking/link-equity signals during a permanent move — which is the exact concern FR-005 is written to protect ("so existing inbound links and search equity survive cutover"). Zero new code, uses the framework's own built-in mechanism exactly as the operator's strong prior specified. The cost is that a tool or test asserting the literal string "301" (rather than "is this redirect permanent") would need updating to 308, or the spec's wording would need a one-line amendment. |
| **B — Custom Route Handler for a literal 301** | `app/(en)/services/route.ts` exporting a `GET` handler that returns `NextResponse.redirect(url, 301)` (an explicit numeric status Next.js's `redirect()` helper does support when passed directly). | Satisfies the spec's literal text exactly. Costs one new file and one new mechanism (Route Handler) sitting alongside `next.config.ts` for a single URL, which is more moving parts than Option A for a difference with no observable effect on visitors, browsers, or search engines. |

**Recommendation**: Option A. It is what the operator's stated prior already pointed at, it needs no new file, and the underlying goal FR-005 exists to serve (preserved inbound links and search equity) is fully met by a 308. This is flagged here rather than silently decided because the spec's own acceptance scenario (User Story 4, AC1) and SC-004 currently assert the literal number "301" — the operator should either bless 308 as satisfying that scenario's intent (a one-line spec note, not a re-run of `/speckit-clarify`) or explicitly choose Option B before `/speckit-tasks` writes a task that tests for a status code the chosen mechanism cannot produce.

**Resolved 2026-08-26**: Operator confirmed Option A. `spec.md` is amended accordingly — FR-005, User Story 4's acceptance scenario, and SC-004 now say "308 (permanent)" rather than "301," with FR-005 carrying the one-line rationale above inline. `plan.md` and `contracts/http-routes.md` are updated to match; nothing downstream still asserts a literal 301.

**Alternatives considered**:
| Option | Rejected because |
|---|---|
| `proxy.ts` | Locked to the `/admin/*` auth job by explicit operator instruction and prior decisions; a static unconditional public redirect has no request-time logic to justify moving it there. |
| A `rewrites()` entry instead of `redirects()` | A rewrite serves `/solutions`'s content at `/services` silently, without changing the browser's URL or emitting any redirect status — this doesn't satisfy FR-005's requirement that the *browser* is sent to `/solutions` via an HTTP redirect (rewrites are invisible to the client and to search-engine URL-consolidation signals, defeating the exact "search equity survives cutover" purpose of this requirement). |

---

## Research Item 2: SiteShell / language-switcher static-safety

**Decision**: `SiteShell` (and the two root layouts that import it) stay plain Server Components with zero Dynamic API calls. The language switcher is a small `"use client"` component that reads the current path via `usePathname()` (a Client Component hook, not a Dynamic API) — not via `headers()`/`cookies()` in the layout.

**Why this is slice 1A's Decision 1 trap in new clothing, and why the same trap is avoidable here**: 1A's original (rejected) approach called `headers()` inside the single shared root layout to learn the request path, which forces the *entire application* into per-request dynamic SSR because a Dynamic API call in a root layout poisons the whole tree beneath it — there is no scope smaller than "everything." The same shape of mistake here would be: `app/(en)/layout.tsx` or `SiteShell` itself calling `headers()` (or `cookies()`) to learn which page is being rendered, so it can compute the switcher's target URL. That must not happen, for the same reason 1A rejected it — SC-006 would fail for every page in this slice, not just the one that needs the path.

**Why a Client Component reading `usePathname()` does *not* reintroduce that cost**: verified directly against Next.js's own `usePathname()` reference (fetched 2026-08-26, matching pinned `16.3.1`/`16.3.3`):
- `usePathname` is a Client Component hook, not a Server Component Dynamic API — it doesn't run through the `headers()`/`cookies()` per-request-opt-out-of-static-rendering mechanism at all.
- For a **static route** (none of this slice's three pages have dynamic segments), "every route segment... is known at build time. The pathname can be resolved during prerendering, so `usePathname` resolves on the server and no Suspense boundary is required." That behavior note lives under Next.js's `cacheComponents` documentation specifically, but it describes the general mechanism: for a static route, the pathname is a build-time-known constant, not a per-request unknown, so a Client Component reading it doesn't need request-time data at all — there is nothing for it to opt the route out of. This project does not enable `cacheComponents` (confirmed — absent from `next.config.ts`, and 1A's research already evaluated and declined to adopt it), so the stricter Suspense-boundary rule that applies under that flag doesn't even come into play here; the plain, unconditional case applies.
- One documented caveat does not apply here: `usePathname()` can hydration-mismatch "if your app has rewrites in `next.config` or a Proxy file" that changes the browser's pathname relative to what was prerendered. This project's `proxy.ts` matcher is `"/admin/:path*"` only — it does not touch `/`, `/about`, `/solutions`, or their `/ar/*` counterparts, and this slice adds no `rewrites()` entry (only the `redirects()` from Research Item 1, which is a different mechanism and doesn't rewrite the tree the switcher renders in). So the caveat's precondition never occurs for any page in this slice.

**Consequence for the JS-disabled edge case (spec Edge Cases)**: because the pathname resolves during prerendering for a static route (not only after client-side hydration), the switcher's `<a href>` is already correct in the server-rendered HTML — a visitor with JavaScript disabled still gets a real, correctly-targeted link, not a placeholder that only becomes correct after hydration. This is precisely what the spec's edge case requires and is the reason `usePathname()` — not `headers()`/`cookies()`, and not a purely-client-computed href with no SSR value — is the correct mechanism.

**Addendum — where `SiteShell` actually mounts (corrected 2026-08-26, before task generation)**: the design below originally had `SiteShell` imported directly by `app/(en)/layout.tsx` and `app/ar/layout.tsx`, matching the operator's literal feature-description wording ("imported by BOTH root layouts"). That was wrong: `app/(en)/layout.tsx` is *also* the root layout for `app/(en)/admin/**`, and `app/(en)/admin/(protected)/layout.tsx` has no chrome of its own (it only calls `requireAuth()` and returns `children`) — so importing `SiteShell` at that level would have leaked the public header/nav/footer/language-switcher into the admin login page and dashboard. The fix, confirmed with the operator: one new nested, URL-transparent route group per language tree, `app/(en)/(public)/` and `app/ar/(public)/`, whose own `layout.tsx` is what imports `SiteShell`; `app/(en)/layout.tsx`/`app/ar/layout.tsx` themselves stay unchanged. This is the same technique 1A already used to scope `/admin/*` in without changing its URL, applied in the other direction (scoping the *public* pages instead). It changes nothing about the static-safety argument above — the `(public)` layouts are exactly as static as the root layouts would have been, zero Dynamic API calls either way.

**Design**: `SiteShell` (Server Component) receives a `language: Language` prop, hardcoded literally by each `(public)` route group's own layout, exactly as `LANGUAGES.en`/`LANGUAGES.ar` are already hardcoded in 1A's layouts — it needs no per-request data to render the header, the three fixed nav links (home/about/solutions, each computed via 1A's existing `getLanguagePath`), or the footer, all of which are the same for every page in a given language. Only the nested `LanguageSwitcher` Client Component needs the *current* page's specific path (to link to that exact page's counterpart, not always the home page) — so only it calls `usePathname()`, kept to the smallest possible piece of the tree (FR-012).

One small new pure helper is needed and is added to 1A's existing `lib/language.ts` (not a new module, not new URL-pairing logic — a companion to `resolveLanguageFromPathname`, which already does the equivalent work for language detection): `getAgnosticPath(pathname: string): string` strips the `/ar` prefix (if present) from a full pathname, producing the language-agnostic `path` shape that `getCounterpartPath` already expects as input. Without this, calling `getCounterpartPath` with a raw `/ar/about` pathname would double-prefix instead of resolving to `/about`. This does not reimplement or duplicate `getCounterpartPath`/`getLanguagePath` — it feeds them the input shape they already require, mirroring the existing prefix-detection pattern `resolveLanguageFromPathname` already uses (see data-model.md).

**Alternatives considered**:
| Option | Rejected because |
|---|---|
| Layout (or `SiteShell`) calls `headers()` to learn the request path, passes it down as a prop | Reintroduces 1A's Decision-1 cost exactly: forces every page under that layout into per-request dynamic SSR, failing SC-006 for all three pages, not just the switcher. |
| Pass each page's own `path` (already known to `generateMetadata`) down through the layout as a prop | Not mechanically possible without a Dynamic API or a client hook: Next.js layouts do not receive the current page's route/path as a prop for a fixed set of static (non-dynamic-segment) routes — that information is exactly what `usePathname()`/`headers()` exist to expose. |
| Switcher computes its href purely client-side with no SSR value (e.g. empty `href` until `useEffect` fires) | Fails the JS-disabled edge case outright — no working link exists before hydration. Also unnecessary, since `usePathname()` already resolves correctly during prerendering for these static routes. |

---

## Research Item 3: Content-porting representation for the three pages' EN/AR copy

**Decision**: Co-located inline JSX per page — the same pattern slice 1A's placeholder pages already use — not a separate content module.

**Rationale**:
- 1A's existing pages (`app/(en)/page.tsx`, `app/(en)/about/page.tsx`, and their `app/ar/*` counterparts) already inline both the metadata strings (via `generateMetadata`) and the body copy directly in each `page.tsx`. Slice 1B extends the same three-pages-in-two-languages shape (adding `solutions`) with real copy instead of placeholder copy — it does not change the shape of the problem, so it does not need a different mechanism.
- A content module (e.g. a `content/` directory of per-page/per-language data objects) would earn its cost once there are many pages, a non-technical content editor, or a need to reuse the same copy in more than one place. None of those conditions exist here: six fixed files (3 pages × 2 languages), each rendered exactly once, authored once by the operator porting from current production. Introducing an indirection layer for that would be exactly the kind of speculative abstraction Scope Discipline and Simplicity First warn against — "no features beyond what was asked," "no abstractions for single-use code."
- No database access is in scope for this slice (spec hard constraint) — a content module backed by a data file is the only realistic alternative to inline JSX, and it buys nothing over inline JSX at this scale while adding one more file per page to keep in sync with its own metadata strings.

**Alternatives considered**:
| Option | Rejected because |
|---|---|
| Per-page content module (e.g. `content/home.ts` exporting `{ en: {...}, ar: {...} }`) | No current need it solves at three pages; adds indirection between the copy and where it renders for no reuse benefit; not how 1A's existing pages are already structured. |
| MDX / Markdown files per page | Pulls in a rendering pipeline (`react-markdown`/`remark-gfm`) that this project reserves for slice 1C's database-driven articles content (per constitution's Content section) — introducing it here for fixed, non-database static copy is an unjustified scope pull-forward into 1C's territory. |

---

## Sources

- [`redirects` — Next.js docs](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects) (fetched 2026-08-26, version `16.3.3`, matching pinned `16.3.1`)
- [`usePathname` — Next.js docs](https://nextjs.org/docs/app/api-reference/functions/use-pathname) (fetched 2026-08-26, version `16.3.3`, matching pinned `16.3.1`)
- Current repo state: `next.config.ts`, `proxy.ts`, `lib/language.ts`, `lib/metadata.ts`, `app/(en)/layout.tsx`, `app/ar/layout.tsx`, `app/(en)/page.tsx`, `app/(en)/about/page.tsx`, `app/ar/page.tsx` (read directly, 2026-08-26).
