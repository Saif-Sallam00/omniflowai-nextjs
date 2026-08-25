# Data Model: Static Public Pages — Slice 1B

**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

This slice introduces **zero database schema changes and zero migrations** (spec hard constraint — no database access at all). The shapes below are in-memory `type` shapes and one new pure function, extending 1A's existing `lib/language.ts`/`lib/metadata.ts` model rather than replacing it. Named to mirror the spec's own Key Entities section.

## Static Page (extends 1A's "Page")

One of `home`, `about`, or `solutions` — a language-agnostic content unit rendered at a fixed path in each language.

```ts
// no new type — reuses 1A's PageMetadataInput (lib/metadata.ts) unchanged:
type PageMetadataInput = {
  path: string;        // "/" | "/about" | "/solutions" — language-agnostic
  language: Language;
  title: string;
  description: string;
};
```

- The three concrete `path` values this slice adds/confirms: `"/"` (home, already exists from 1A — content replaced), `"/about"` (already exists from 1A — content replaced), `"/solutions"` (new).
- Each of the six page files (3 paths × 2 languages) calls `generateMetadata()` with its own `PageMetadataInput`, exactly as 1A's placeholders already do — no change to this type or to `buildPageMetadata()`.
- Body content (the real ported English/Arabic copy) is inline JSX in each `page.tsx`, not a separate data shape (research.md, Decision 3) — there is nothing to model here beyond what each page file already contains.

## Site Chrome

The shared header, primary navigation, and footer rendered around every page in both language trees.

```ts
type SiteShellProps = {
  language: Language;   // hardcoded literally by each root layout — "en" in app/(en)/layout.tsx, "ar" in app/ar/layout.tsx
  children: React.ReactNode;
};

type NavLink = {
  path: string;          // language-agnostic, e.g. "/about"
  label: string;         // language-specific display label
};
```

- `SiteShell` is a Server Component. It derives its three `NavLink`s' hrefs itself, per render, via 1A's existing `getLanguagePath(path, language)` — no new URL logic. Labels come from a small fixed `Record<Language, { home: string; about: string; solutions: string }>` (nav) and a parallel record for footer copy, both colocated in `components/site-shell.tsx` — not persisted, not database-backed, just fixed bilingual strings analogous to `LANGUAGES` in `lib/language.ts`.
- `SiteShell` needs no per-request data to render the header, nav, or footer — every value it renders is either its `language` prop (hardcoded per layout) or one of the three fixed page paths. This is what keeps it static (research.md, Decision 2).
- `SiteShell` renders `<LanguageSwitcher />` as its one interactive child — the only piece of the chrome that needs the current, specific page's path.

## Language Switcher (new)

```ts
// components/language-switcher.tsx — "use client"
// No props: reads its own state via usePathname().
```

- Internally: `const pathname = usePathname()` → `const language = resolveLanguageFromPathname(pathname)` (1A, unchanged) → `const agnosticPath = getAgnosticPath(pathname)` (new, below) → `const href = getCounterpartPath(agnosticPath, language)` (1A, unchanged).
- Renders a single `<a href={href}>` with a label in the *other* language (e.g. "العربية" when currently on an English page, "English" when currently on an Arabic page) — a fixed two-value lookup, not new state.

## New helper: `getAgnosticPath` (extends `lib/language.ts`)

```ts
// lib/language.ts — ADDED, alongside the existing exports
function getAgnosticPath(pathname: string): string {
  if (pathname === "/ar") return "/";
  if (pathname.startsWith("/ar/")) return pathname.slice(3);
  return pathname;
}
```

- Pure function, mirrors the prefix-detection already done by `resolveLanguageFromPathname` (same module, same `/ar` / `/ar/` boundary check) — not new URL-pairing logic, a companion that produces the input shape `getCounterpartPath` already expects (research.md, Decision 2).
- **Validation rule**: for any pathname in either tree, `getAgnosticPath` composed with `getLanguagePath` round-trips to the original pathname: `getLanguagePath(getAgnosticPath(p), resolveLanguageFromPathname(p)) === p` for every `p` this slice's six routes produce.

## Legacy Redirect

```ts
// next.config.ts redirects() entry — not a TypeScript type, a config object shape:
{
  source: "/services",
  destination: "/solutions",
  permanent: true,   // → HTTP 308 (research.md, Decision 1 — operator confirmed 308; spec.md amended from its original literal "301")
}
```

- Fixed, single entry. Not parameterized, not data-driven — one legacy English URL, one destination.
- No Arabic-side entry exists or is needed (spec Clarifications — production has no pre-existing Arabic services URL to redirect from).

## Relationships

```
Language (2 fixed values, from 1A)
   └─ used by → Static Page (a request resolves to exactly one Language, unchanged from 1A)
   └─ used by → SiteShell (language prop, hardcoded per layout)
   └─ used by → LanguageSwitcher (resolved at render time from the current pathname)

Static Page ──(path + language)──> URL Pair (1A, unchanged) ──> feeds hreflang alternates (1A) AND the switcher's target href (new, via getAgnosticPath + getCounterpartPath)

Legacy Redirect: /services (English, fixed) ──307/308──> /solutions — independent of the Language/Page model above, config-level only
```

No entity here has a lifecycle, a create/update/delete flow, or a persistence layer — everything is either static content authored once per page, or derived synchronously from the current render (`SiteShell`) or the current client-side pathname (`LanguageSwitcher`) on every response.
