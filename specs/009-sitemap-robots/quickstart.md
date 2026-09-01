# Quickstart: Sitemap + Production Robots

Validates the feature end-to-end against [spec.md](./spec.md)'s acceptance scenarios, without ever toggling `INDEXING_ENABLED` on the reachable staging deployment (see [research.md](./research.md) §5 for why).

## Prerequisites

- Local `.env.local` with a valid `DATABASE_URL` (and the rest of the usual required env vars) already configured — same as for any other local build.
- At least one published article per language and one project in the database, so the populated-sitemap checks have something to assert against.

## Part A — Production-indexable mode (`INDEXING_ENABLED=true`)

```bash
INDEXING_ENABLED=true npm run build
INDEXING_ENABLED=true npm run start &
```

1. **Sitemap is populated (AC-1, US-1)**

   ```bash
   curl -s http://localhost:3000/sitemap.xml
   ```

   Expected: a valid `<urlset>` containing every static page in both languages (`/`, `/about`, `/solutions`, `/contact`, `/articles`, `/portfolio`, and `/ar` equivalents; `/services` absent), every published article in both languages at its real slug (including any Arabic-script slug), and every project in both languages — all as absolute URLs off the same base used elsewhere for canonical/hreflang.

2. **Sitemap URLs resolve (AC-2, US-2)**

   Spot-check a handful of URLs pulled from the sitemap output above — an EN article, an AR article (ideally one with an Arabic-script slug), a project in both languages, and two static pages:

   ```bash
   curl -so /dev/null -w "%{http_code}\n" "<url from sitemap>"
   ```

   Expected: `200` for every URL checked.

3. **Drafts/admin/api/services excluded (AC-3)**

   ```bash
   curl -s http://localhost:3000/sitemap.xml | grep -E "/admin|/api|/services"
   ```

   Expected: no matches. Also confirm any known draft article's slug does not appear.

4. **Robots references the sitemap and welcomes AI crawlers (AC-4, US-3)**

   ```bash
   curl -s http://localhost:3000/robots.txt
   ```

   Expected: a `Sitemap:` line with the absolute sitemap URL; explicit `User-agent`/`Allow: /` blocks for each AI-crawler token enumerated in [research.md](./research.md) §3; the generic `User-agent: *` block still present with `Allow: /` and `Disallow: /admin/`, `/api/`.

5. **Admin/API carry the noindex header, public routes don't (AC-5, US-4)**

   ```bash
   curl -sI http://localhost:3000/admin | grep -i x-robots-tag       # expect: X-Robots-Tag: noindex
   curl -sI http://localhost:3000/api/health | grep -i x-robots-tag  # expect: X-Robots-Tag: noindex
   curl -sI http://localhost:3000/ | grep -i x-robots-tag            # expect: no output (header absent)
   curl -sI http://localhost:3000/about | grep -i x-robots-tag       # expect: no output (header absent)
   ```

Stop the server (`kill %1` or Ctrl-C) before Part B.

## Part B — Staging/noindex mode (`INDEXING_ENABLED` unset) — regression check

```bash
npm run build
npm run start &
```

6. **Staging behavior unchanged (AC-6, US-5)**

   ```bash
   curl -s http://localhost:3000/robots.txt                    # expect: User-agent: *  Disallow: /  (only)
   curl -sI http://localhost:3000/ | grep -i x-robots-tag       # expect: X-Robots-Tag: noindex, nofollow
   curl -sI http://localhost:3000/admin | grep -i x-robots-tag  # expect: X-Robots-Tag: noindex, nofollow (same blanket rule)
   curl -s http://localhost:3000/sitemap.xml                   # expect: an empty <urlset></urlset> (no <url> entries)
   ```

Stop the server.

## Part C — No regressions (AC-7)

```bash
npm run check   # tsc --noEmit, zero errors
npm run lint    # eslint, zero errors
npm run build   # succeeds (already exercised above, but confirm a clean run too)
git diff --stat -- lib/db/schema.ts drizzle/   # expect: no output (zero-diff)
```

Also manually confirm (e.g. via a quick diff review) that no existing public route's rendering, metadata, canonical, or hreflang output changed — this feature's diff should be limited to `app/sitemap.ts` (new), `app/robots.ts`, and `next.config.ts`.
