// Next.js App Router (16.3.1, observed with Turbopack) delivers a non-ASCII
// dynamic route segment inconsistently within the same request: the page
// component receives it still percent-encoded while generateMetadata receives
// it decoded (ref: vercel/next.js#48058). Both call sites must normalize the
// raw params.slug through this before any DB lookup, so they agree on one
// value regardless of which form Next.js handed them.
export function normalizeSlugParam(raw: string): string {
  if (!raw.includes("%")) return raw;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}
