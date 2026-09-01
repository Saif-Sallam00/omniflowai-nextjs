# Quickstart: JSON-LD Structured Data + Dynamic llms.txt

Validates the feature end-to-end against [spec.md](./spec.md)'s acceptance scenarios. Extends the two-mode local production-build approach from Slice 3b (research.md §7).

## Prerequisites

- Local `.env.local` with a valid `DATABASE_URL` (and the rest of the usual required env vars).
- At least one published article per language, one unpublished/draft article, and one project in the database — so both the "present" and "absent" structured-data checks have real data to assert against.

## Part A — JSON-LD (indexing-mode-independent — run against either build)

```bash
npm run build && npm run start &
```

1. **Organization present on public pages, absent on admin (AC-1)**

   ```bash
   curl -s http://localhost:3000/ | grep -o '"@type":"Organization"'          # expect: found
   curl -s http://localhost:3000/ar | grep -o '"@type":"Organization"'       # expect: found
   curl -s http://localhost:3000/admin | grep -c 'application/ld+json'        # expect: 0
   ```

2. **Article JSON-LD on a published article, values match the page's own metadata (AC-2)**

   ```bash
   curl -s http://localhost:3000/articles/<published-slug> | grep -o '<script type="application/ld+json">[^<]*</script>'
   ```

   Confirm the extracted JSON includes `headline`, `description`, an absolute `image` (an `/api/image/{id}` URL made absolute), `datePublished`, `inLanguage: "en"`, and a `publisher` object — and that `headline`/`description`/`image` match the page's `<title>`/meta description/OG image exactly.

3. **Case-study JSON-LD on a project (AC-3)**

   ```bash
   curl -s http://localhost:3000/portfolio/<slug> | grep -o '<script type="application/ld+json">[^<]*</script>'
   ```

   Confirm `"@type":"CreativeWork"` with `name`, `description`, absolute `image`, `inLanguage`, `publisher`.

4. **No structured data on draft/not-found (AC-4)**

   ```bash
   curl -s http://localhost:3000/articles/<unpublished-slug> | grep -c 'application/ld+json'   # expect: 1 (Organization only — no Article block)
   curl -s http://localhost:3000/articles/<nonexistent-slug> | grep -c 'application/ld+json'   # expect: 1 (Organization only, on the 404 page)
   curl -s http://localhost:3000/portfolio/<nonexistent-slug> | grep -c 'application/ld+json'  # expect: 1 (Organization only)
   ```

   Note: this covers the unauthenticated case. The authenticated-admin draft-preview sub-case is not independently curl-verified here — see research.md §7 for why it's covered by code review instead (the same `published` boolean gates both the page's `noindex` branch and its JSON-LD emission).

5. **Well-formedness (AC-5)**

   For each `<script type="application/ld+json">...</script>` block extracted above, pipe the inner JSON through a parser to confirm it's valid JSON with a `@context`/`@type`:

   ```bash
   echo '<extracted JSON>' | node -e "JSON.parse(require('fs').readFileSync(0, 'utf8'))" && echo "valid JSON"
   ```

Stop the server before Part B.

## Part B — llms.txt (indexing-mode-gated, mirrors sitemap.xml/robots.txt)

```bash
INDEXING_ENABLED=true npm run build
INDEXING_ENABLED=true npm run start &
```

6. **Production mode: populated (AC-6)**

   ```bash
   curl -s http://localhost:3000/llms.txt
   ```

   Expected: the curated header (org name, one-line description, language note) followed by every published article and project, both languages, as title + absolute URL. Spot-check a handful of listed URLs for `200`:

   ```bash
   curl -so /dev/null -w "%{http_code}\n" "<url from llms.txt>"
   ```

Stop the server.

```bash
npm run build
npm run start &
```

7. **Staging mode: header only (AC-7)**

   ```bash
   curl -s http://localhost:3000/llms.txt
   ```

   Expected: the same curated header, with no article/project list — no titles, no URLs beyond what's in the header itself.

Stop the server.

## Part C — No regressions (AC-8)

```bash
npm run check   # tsc --noEmit, zero errors
npm run lint    # eslint, zero errors
npm run build   # succeeds
git diff --stat -- lib/db/schema.ts drizzle/         # expect: no output (zero-diff)
curl -s http://localhost:3000/sitemap.xml | head      # unchanged from Slice 3b
curl -s http://localhost:3000/robots.txt              # unchanged from Slice 3b
```

Also manually confirm (e.g. via a quick diff review) that no existing public route's visible rendering changed — the JSON-LD additions are non-visual `<script>` tags only.
