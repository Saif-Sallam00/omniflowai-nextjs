# OmniflowAI Extraction Pass 4 — Portfolio & Article Read Paths

Scope: `/portfolio`, `/portfolio/:id`, `/articles`, `/articles/:slug`, and every
piece those four pages depend on. Source of truth for all file paths below is
`client/src/pages/*`, `client/src/lib/*`, `shared/schema.ts`, `shared/taxonomy.ts`,
`server/routes.ts`, `server/storage.ts`. Not a build target — reference only, for
the 1C spec.

---

## 1. PORTFOLIO LIST page — `client/src/pages/Portfolio.tsx`

### Full page JSX (real classNames, trimmed imports)

```tsx
export default function Portfolio() {
  const { t } = useI18n();
  useDocumentTitle("Portfolio");
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const serviceParam = new URLSearchParams(window.location.search).get('service');
  const activePillar: Pillar | null =
    serviceParam && (PILLARS as readonly string[]).includes(serviceParam)
      ? (serviceParam as Pillar)
      : null;
  const inActivePillar = (p: Project) =>
    !activePillar || CATEGORY_TO_PILLAR[p.category] === activePillar;

  const { data: allProjects, isLoading: allLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const { data: filteredData, isLoading: filterLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects', 'filter', activeFilter],
    queryFn: async () => {
      const url =
        activeFilter === 'all'
          ? '/api/projects'
          : `/api/projects?category=${activeFilter}`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load projects');
      return res.json();
    },
  });

  const isLoading = allLoading || filterLoading;
  const filteredProjects = (filteredData || []).filter(inActivePillar);

  const presentCategories = new Set(
    (allProjects || []).filter(inActivePillar).map((p) => p.category)
  );
  const visibleTabs: string[] = [
    'all',
    ...PORTFOLIO_TAB_ORDER.filter((c) => presentCategories.has(c)),
  ];

  const tabLabel = (tab: string) =>
    tab === 'all' ? t('common.all') : t(`category.${tab}`);

  if (isLoading) return <PortfolioSkeleton />;

  return (
    <div className="min-h-screen pt-20 bg-slate-950 text-white">

      {/* 1. Minimal Header */}
      <section className="py-20 md:py-24 bg-slate-950/50 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 md:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            {t('portfolio.title')}
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-normal">
            {t('portfolio.sub')}
          </p>
        </div>
      </section>

      {/* 1b. Active pillar deep-link banner (only when ?service=<pillar> is set) */}
      {activePillar && (
        <section className="border-b border-slate-800/50 bg-brand-500/5 py-3">
          <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-center gap-3 text-sm">
            <span className="text-slate-400">
              {t('portfolio.filter.showing')}{' '}
              <span className="font-semibold text-brand-400">{t(`portfolio.pillar.${activePillar}`)}</span>
            </span>
            <a
              href="/portfolio"
              className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              {t('portfolio.filter.clear')}
            </a>
          </div>
        </section>
      )}

      {/* 2. Filter Tabs */}
      <section className="sticky top-16 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50 py-4">
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex justify-center">
          <Tabs defaultValue="all" className="w-full max-w-3xl" onValueChange={setActiveFilter}>
            <TabsList className="w-full flex-wrap bg-slate-900 border border-slate-800 rounded-full p-1">
              {visibleTabs.map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="rounded-full px-4 py-2 text-sm font-medium text-slate-400 data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all flex-1"
                >
                  {tabLabel(tab)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* 3. The Gallery Grid */}
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-8">

          {filteredProjects.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-400">{t('portfolio.empty')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {filteredProjects.map((project) => (
                <Link key={project.id} href={`/portfolio/${project.id}`}>
                  <div className="group cursor-pointer flex flex-col gap-4" data-testid={`card-project-${project.id}`}>

                    {/* Image Card */}
                    <div className="relative overflow-hidden rounded-xl bg-slate-900 aspect-[4/3] shadow-card border border-slate-800 group-hover:border-slate-700 transition-all duration-500">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 z-10" />
                      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 z-10 transition-colors duration-500" />

                      {/* Hover Overlay Button */}
                      <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center shadow-sm">
                          <ArrowUpRight className="w-5 h-5 text-white" />
                        </div>
                      </div>

                      <img
                        src={project.image}
                        alt={project.title}
                        loading="lazy"
                        decoding="async"
                        onError={onImageError}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    </div>

                    {/* Minimal Text Info */}
                    <div className="space-y-1 px-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white group-hover:text-brand-400 transition-colors">
                          {project.title}
                        </h3>
                        <Badge variant="outline" className="border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider bg-slate-900">
                          {t(`category.${project.category}`)}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 font-medium">
                        {project.client}
                      </p>

                      {/* Free-text tags (data — not translated) */}
                      {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {project.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md bg-slate-900 border border-slate-800 px-2 py-0.5 text-[11px] text-slate-400"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>
      </section>
    </div>
  );
}

const PortfolioSkeleton = () => (
  <div className="min-h-screen pt-32 bg-slate-950 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16 space-y-4">
        <div className="h-10 w-64 bg-slate-800 rounded-full mx-auto animate-pulse"></div>
        <div className="h-4 w-96 bg-slate-800 rounded-full mx-auto animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="space-y-4">
            <div className="w-full aspect-[4/3] bg-slate-900 rounded-xl animate-pulse"></div>
            <div className="h-6 w-3/4 bg-slate-900 rounded animate-pulse"></div>
            <div className="h-4 w-1/4 bg-slate-900 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
```

### Category filtering mechanism

**Not URL-param driven for the category tabs** — it's client component state
(`activeFilter`, a plain `useState<string>('all')`), fed to shadcn `Tabs` via
`onValueChange={setActiveFilter}`. Selecting a tab does **not** change the URL
(no query-string write, no route change). The category tab list itself
(`PORTFOLIO_TAB_ORDER` filtered to categories actually present) is a **derived
client value**, not fetched.

There IS one URL-param-driven filter, but it's a separate, coarser mechanism:
the **pillar deep-link** `?service=<pillar-slug>` (e.g. `?service=software`),
read once on mount via `new URLSearchParams(window.location.search)` (raw
browser API, not a wouter/query-string library). This is read-only — there's no
UI control that writes it; it only reacts to a URL a caller lands on (e.g. from
`/services`). The pillar is *derived*, not stored: each project only has a
`category`, and `CATEGORY_TO_PILLAR[project.category]` maps it to a pillar
(`shared/taxonomy.ts`). The two filters **compose**: the pillar filter narrows
which categories can even appear as tabs, and within that, `activeFilter`
narrows further.

Two `useQuery` calls run in parallel:
1. `['/api/projects']` — fetches ALL projects (default `queryFn` in
   `client/src/lib/queryClient.ts`, joins the queryKey as the URL). Used only to
   compute `presentCategories` (which tabs to show) via `.filter(inActivePillar)`.
2. `['/api/projects', 'filter', activeFilter]` — a **custom** `queryFn` (not the
   default one) that hits `/api/projects` when `activeFilter === 'all'`, or
   `/api/projects?category=<slug>` otherwise. This is the actual server-side
   category filter (`server/routes.ts` `GET /api/projects` reads
   `req.query.category` and calls `storage.getProjectsByCategory`). Its result
   is then further filtered client-side by `inActivePillar` before rendering.

So: category = server-side query param (via a custom queryFn, not the default
`apiRequest`/`queryKey.join` pattern), "all" = no `category` param at all.
Pillar = purely client-side derived filter, sourced from the URL once at mount,
never written back to the URL by any control on this page.

**Porting flag:** the custom `queryFn` on query #2 (URL built manually instead
of via `queryKey.join('/')`) won't need porting to Next Server Components at
all — a Server Component would just read `searchParams.category` directly and
query the DB. The `?service=` pillar deep link reads `window.location.search`
directly (no wouter hook) — in Next this becomes `searchParams` on the page.

### Card link pattern

`href={`/portfolio/${project.id}`}` — **confirmed id-based**, via wouter's
`<Link>`. `project.id` is the Drizzle serial PK (number).

### Featured vs non-featured handling

**Not present.** `project.isFeatured` and `project.isServiceShowcase` exist on
the `Project` type (used elsewhere — Home page showcase, Services page hero via
`GET /api/projects/showcase`) but this list page does not read either field or
render featured projects differently. Every returned project renders identically
in the grid, in whatever order the API returns them (no client-side sort).

### Empty state

Markup:
```tsx
<div className="text-center py-20">
  <p className="text-slate-400">{t('portfolio.empty')}</p>
</div>
```
Copy — EN: `"No projects found in this category."` / AR: `"لا توجد مشاريع في هذه الفئة."`

Note this only renders when `filteredProjects.length === 0` — i.e. after both
the category and pillar filters are applied, not when the whole portfolio is
literally empty (there's no distinct "portfolio is empty site-wide" copy; the
same string covers both).

### Fetch shape

- `useQuery<Project[]>({ queryKey: ['/api/projects'] })` → `GET /api/projects` →
  `Project[]` (all projects, unfiltered).
- Second query as described above → `GET /api/projects` or
  `GET /api/projects?category=<slug>` → `Project[]`.

`Project` (from `shared/schema.ts`, `typeof projects.$inferSelect`):
```ts
{
  id: number;
  title: string;
  client: string;
  category: Category;              // one of CATEGORIES in shared/taxonomy.ts
  description: string;
  challenge: string;
  diagnosis: string | null;
  solution: string;
  results: string[];               // jsonb
  technologies: string[];          // jsonb
  image: string;                   // data:image/webp;base64,... or data:image/svg+xml (fallback)
  tags: string[];                  // jsonb, default []
  isFeatured: boolean;
  isServiceShowcase: boolean;
}
```
The list page only reads `id`, `title`, `client`, `category`, `image`, `tags`
from this shape — `description`/`challenge`/`diagnosis`/`solution`/`results`/
`technologies` are fetched but unused until the detail page.

---

## 2. PORTFOLIO DETAIL page — `client/src/pages/ProjectDetail.tsx`

### Full page JSX

```tsx
export default function ProjectDetail() {
  const [, params] = useRoute("/portfolio/:id");
  const id = params?.id;
  const { isRTL, t } = useI18n();

  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: [`/api/projects/${id}`],
    enabled: !!id,
  });

  useDocumentTitle(project?.title);

  if (isLoading) return <ProjectSkeleton />;
  if (error || !project) return <div className="min-h-screen pt-32 bg-slate-950 text-white text-center">{t('projectDetail.notFound')}</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-20">

      {/* HERO HEADER */}
      <section className="relative py-20 md:py-24 border-b border-slate-800/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
          <Link href="/portfolio">
            <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-brand-400 text-slate-400 transition-colors">
              <ArrowLeft className="w-4 h-4 me-2" /> {t('projectDetail.back')}
            </Button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-end">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="border-brand-500/30 text-brand-400 bg-brand-500/10">
                  {t(`category.${project.category}`)}
                </Badge>
                <span className="text-slate-400 font-medium border-l border-slate-800 pl-4">{project.client}</span>
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
                {project.title}
              </h1>
              <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                {project.description}
              </p>

              {/* MOBILE ONLY CTA */}
              <div className="block lg:hidden pt-4">
                <Link href="/contact">
                  <Button className="w-full bg-primary text-primary-foreground font-bold h-12 rounded-full">
                    {t('projectDetail.mobileCta')}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {project.results.slice(0, 4).map((result, i) => (
                <div key={i} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
                  <TrendingUp className="w-4 h-4 text-brand-400 mb-2" />
                  <p className="font-bold text-white text-xs md:text-sm">{result}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MAIN VISUAL */}
      <section className="relative -mt-8 md:-mt-12 z-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="rounded-xl overflow-hidden shadow-elevated border border-slate-800 bg-slate-900">
          <img src={project.image} alt={project.title} loading="lazy" decoding="async" onError={onImageError} className="w-full h-auto object-cover max-h-[700px] opacity-90" />
        </div>
      </section>

      {/* CONTENT & SIDEBAR */}
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12 md:space-y-16">
              <div className="pl-6 border-l-2 border-brand-500">
                <h2 className="text-2xl font-bold text-white mb-4">{t('projectDetail.challenge')}</h2>
                <div className="prose prose-invert text-slate-400"><p>{project.challenge}</p></div>
              </div>
              {project.diagnosis && (
                <div className="pl-6 border-l-2 border-brand-500">
                  <h2 className="text-2xl font-bold text-white mb-4">{t('projectDetail.diagnosis')}</h2>
                  <div className="prose prose-invert text-slate-400"><p>{project.diagnosis}</p></div>
                </div>
              )}
              <div className="pl-6 border-l-2 border-brand-500">
                <h2 className="text-2xl font-bold text-white mb-4">{t('projectDetail.solution')}</h2>
                <div className="prose prose-invert text-slate-400"><p>{project.solution}</p></div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 shadow-card">
                <h3 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">{t('projectDetail.techStack')}</h3>
                <div className="flex flex-wrap gap-2 mb-8">
                  {project.technologies.map(tech => (
                    <Badge key={tech} variant="secondary" className="bg-slate-800 text-slate-300">
                      {tech}
                    </Badge>
                  ))}
                </div>
                <Link href="/contact">
                  <Button className="w-full bg-primary text-primary-foreground font-bold h-12 rounded-full">
                    {t('projectDetail.startProject')}
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

const ProjectSkeleton = () => (
  <div className="min-h-screen pt-32 px-6 bg-slate-950 text-white">
    <div className="max-w-7xl mx-auto space-y-8">
      <Skeleton className="h-12 w-3/4 bg-slate-800" />
      <Skeleton className="h-[400px] w-full rounded-xl bg-slate-800" />
    </div>
  </div>
);
```

### Hero

Category badge (`Badge variant="outline"`, translated via `category.${category}`),
client name (raw `project.client`, plain text, not translated — separated from
the badge by a `border-l` divider), title (`project.title`, raw), description
(`project.description`, raw). All in a two-column grid where the right column is
the "Quick Stats" grid, not a separate results section.

### Results/outcome grid

It's **not a fixed 2×2 of labeled outcome cards** — it's `project.results`
(a flat `string[]`), sliced to the first 4 (`project.results.slice(0, 4)`), each
rendered as an unlabeled card with a `TrendingUp` icon and the raw string as the
only content:
```tsx
<div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
  <TrendingUp className="w-4 h-4 text-brand-400 mb-2" />
  <p className="font-bold text-white text-xs md:text-sm">{result}</p>
</div>
```
Grid wrapper: `grid grid-cols-2 gap-3 md:gap-4` — 2 columns × up to 2 rows since
it's capped at 4 items, so visually a 2×2 when a project has 4+ results, fewer
cells otherwise. There is no separate "results" section further down the page —
this IS the entire results treatment, positioned in the hero as "Quick Stats."

### Cover image / image block

Single "MAIN VISUAL" section directly under the hero, overlapping it with a
negative margin (`-mt-8 md:-mt-12`) so it visually breaks out of the hero's
bottom border:
```tsx
<section className="relative -mt-8 md:-mt-12 z-20 px-4 md:px-8 max-w-7xl mx-auto">
  <div className="rounded-xl overflow-hidden shadow-elevated border border-slate-800 bg-slate-900">
    <img src={project.image} alt={project.title} loading="lazy" decoding="async" onError={onImageError} className="w-full h-auto object-cover max-h-[700px] opacity-90" />
  </div>
</section>
```
No lightbox, no gallery, no additional images — `project.image` is the only
image field on the model and this is its only render site on the detail page.

### Full body layout — sections in order

1. **The Problem** (`t('projectDetail.challenge')`) → `project.challenge` — always rendered (non-nullable column).
2. **The Diagnosis** (`t('projectDetail.diagnosis')`) → `project.diagnosis` — **conditionally rendered**, only `{project.diagnosis && (...)}`. Column is nullable in the schema; never fabricated when absent.
3. **The System** (`t('projectDetail.solution')`) → `project.solution` — always rendered.

Each section shares identical markup: `pl-6 border-l-2 border-brand-500` wrapper,
`h2` heading, then `<div className="prose prose-invert text-slate-400"><p>{...}</p></div>`.

No "results" or "technologies" section appears in the main content column —
`results` lives in the hero (Quick Stats above), and `technologies` lives in the
sidebar, not the main content flow. `project.tags` (the free-text sub-category
array shown on the list-page cards) is **not rendered anywhere on the detail page**.

Sidebar (right column, `lg:col-span-1`, sticky-less, just flows with the grid):
- **Tech Stack** (`t('projectDetail.techStack')`) heading, then `project.technologies` mapped to `Badge variant="secondary"` chips (raw strings, not translated).
- A CTA button ("Start Your Project" → `/contact`).

### Related section / back-link / bottom CTA

- **Back-link**: at the very top of the hero, not the bottom — `<Link href="/portfolio">` wrapping a ghost `Button` with `ArrowLeft` icon, text `t('projectDetail.back')`.
- **No "related projects" section** — not present anywhere on this page.
- **Bottom CTA**: none as a distinct end-of-page section. The only CTAs are (a) the mobile-only "Start a Project Like This" button inside the hero (`block lg:hidden`), and (b) the sidebar's "Start Your Project" button. There is no full-width CTA banner at the page's end like the article detail page has.

### Query key/endpoint and field mapping

`useQuery<Project>({ queryKey: [`/api/projects/${id}`], enabled: !!id })` →
`GET /api/projects/:id` (route in `server/routes.ts:208`) → single `Project`
object (see full shape in section 1) or 404.

Field → render site map:
| Field | Rendered as |
|---|---|
| `id` | route param only, not displayed |
| `title` | hero `<h1>`, and `<title>`/`alt` |
| `client` | hero, next to category badge |
| `category` | hero badge (`category.${category}` i18n key) |
| `description` | hero paragraph |
| `challenge` | "The Problem" section |
| `diagnosis` | "The Diagnosis" section (conditional) |
| `solution` | "The System" section |
| `results` | hero "Quick Stats" cards, `.slice(0, 4)` |
| `technologies` | sidebar "Tech Stack" badges |
| `image` | "MAIN VISUAL" section |
| `tags` | not rendered on this page |
| `isFeatured` / `isServiceShowcase` | not rendered on this page |

### Not-found (404) behavior

No route-level 404 — it's handled **inline** in the component body:
```tsx
if (error || !project) return <div className="min-h-screen pt-32 bg-slate-950 text-white text-center">{t('projectDetail.notFound')}</div>;
```
Copy — EN: `"Project not found"` / AR: `"المشروع غير موجود"`. This triggers both
on a genuine 404 from the server (`GET /api/projects/:id` returns
`{ message: "Project not found" }` with HTTP 404, which TanStack Query surfaces
as `error`) and on a malformed id (server responds 400 for `isNaN(id)`, which
also becomes a query `error` here — the client doesn't distinguish 400 vs 404,
both render the same "not found" text). There is no redirect, no `not-found.tsx`
page shown, no HTTP-status-aware branching on the client.

**Porting flag:** this whole page currently returns 200 with an inline "not
found" message baked into a 200 HTML shell for JS-disabled/crawler clients — a
Next Server Component route can instead call Next's `notFound()` to emit a true
404 status, which is strictly better and is the natural port target.

---

## 3. ARTICLE LIST page — `client/src/pages/Articles.tsx`

### Full page JSX

```tsx
export default function Articles() {
  const { t, language } = useI18n();
  useDocumentTitle(t('articles.title'));

  const { data, isLoading } = useQuery<ArticleCard[]>({ queryKey: ['/api/articles'] });
  const articles = (data || []).filter((a) => a.language === language);

  return (
    <div className="min-h-screen bg-slate-950 pt-20 text-slate-300">
      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="pointer-events-none absolute -top-40 end-[-120px] h-[420px] w-[420px] rounded-full bg-primary/[0.10] blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6 md:px-8">
          <span className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            {t('articles.eyebrow')}
            <span aria-hidden="true" className="h-px flex-1 bg-slate-800" />
          </span>
          <h1 className="max-w-[20ch] font-display text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl">
            {t('articles.heading')}
          </h1>
          <p className="mt-5 max-w-[62ch] leading-relaxed text-slate-400">
            {t('articles.sub')}
          </p>
        </div>
      </section>

      <section className="border-t border-slate-800/40 py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          {isLoading ? (
            <p className="text-sm text-slate-400">{t('articles.loading')}</p>
          ) : articles.length === 0 ? (
            <p className="max-w-[52ch] leading-relaxed text-slate-400">
              {t('articles.empty')}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <Link key={article.id} href={`/articles/${article.slug}`}>
                  <article className="group cursor-pointer">
                    <div className="card-lift relative mb-4 aspect-[16/9] overflow-hidden rounded-xl border border-slate-800 bg-slate-900 hover:border-slate-700">
                      <img
                        src={article.coverImage}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        onError={onImageError}
                        className="h-full w-full transform object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    {article.publishedAt && (
                      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">
                        {formatArticleDate(article.publishedAt, language)}
                      </p>
                    )}
                    <h2 className="mt-2 font-display text-lg font-semibold leading-snug tracking-tight text-white transition-colors group-hover:text-primary">
                      {article.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      {article.excerpt}
                    </p>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
```

### Layout details

- Grid: `grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3` (1/2/3 columns).
- Cover image: `aspect-[16/9]`, `object-cover`, `alt=""` (decorative — the
  heading carries the semantic title), scale-up on hover (`group-hover:scale-105`),
  wrapped in a `card-lift` utility class + bordered container.
- Excerpt: `article.excerpt`, plain paragraph, no truncation/line-clamp class applied.
- Published date: `formatArticleDate(article.publishedAt, language)`, only
  rendered `{article.publishedAt && (...)}` — i.e. never shown for a null date.
- **No category or related-solution tag is shown on the list card.** The card
  only shows cover image, date, title, excerpt — nothing else (no pillar badge,
  no "related solution" chip, unlike the portfolio card which shows a category
  badge and free-text tags).

### Published vs draft handling

Filtering happens in two layers:
1. **Server**: `GET /api/articles` (`server/routes.ts:253`) calls
   `storage.listPublishedArticles()`, which is hard-scoped to
   `where(eq(articles.published, true))` — drafts never leave the server for
   this endpoint. There is no `?published=` query param; the public list
   endpoint is unconditionally published-only.
2. **Client**: additionally filters by `article.language === language` (the
   active i18n language) — this is a *client-side* filter, not passed as a
   query param to the API. The endpoint returns both EN and AR published
   articles in one array; the page discards the ones not matching the current
   UI language.

**Porting flag:** the language filter currently happens client-side after
fetching all published articles regardless of language — an obvious Next
Server Component win is pushing `language` into the DB query directly (`WHERE
published = true AND language = $1`) instead of over-fetching then filtering.

### Empty state

Markup:
```tsx
<p className="max-w-[52ch] leading-relaxed text-slate-400">
  {t('articles.empty')}
</p>
```
Copy — EN: `"No articles published yet. The first ones are on the way."` /
AR: `"لا توجد مقالات منشورة بعد. الأولى في الطريق."`

Note: this same empty state also covers "there are published articles, but none
in the current language" — there's no distinct copy for that case.

### Card href pattern

`href={`/articles/${article.slug}`}` — **confirmed slug-based**.

### Fetch shape

`useQuery<ArticleCard[]>({ queryKey: ['/api/articles'] })` → `GET /api/articles`
→ `ArticleCard[]`.

`ArticleCard` (from `shared/schema.ts` — a `Pick<Article, ...>`, deliberately
excludes `body` to avoid shipping base64 cover images... actually **does**
include `coverImage`, just not `body`):
```ts
type ArticleCard = Pick<Article,
  "id" | "slug" | "title" | "excerpt" | "coverImage" | "language" | "published" | "publishedAt"
>;
```
Server selects exactly these columns (`DatabaseStorage.cardColumns` in
`server/storage.ts:173`) and orders by `desc(articles.publishedAt)`.

---

## 4. ARTICLE DETAIL page — `client/src/pages/ArticleDetail.tsx`

### Full page JSX

```tsx
const YOUTUBE = /^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;

function urlTransform(url: string) {
  if (/^data:image\//i.test(url)) {
    return url;
  }
  return defaultUrlTransform(url);
}

const SOLUTION_NAME_KEY: Record<string, string> = {
  foundation: 'solutions.foundation.name',
  'growth-engine': 'solutions.growth.name',
  'scale-infrastructure': 'solutions.scale.name',
  custom: 'solutions.custom.name',
};

export default function ArticleDetail() {
  const [, params] = useRoute('/articles/:slug');
  const { t, language } = useI18n();
  const slug = params?.slug || '';

  const { data: article, isLoading, isError } = useQuery<Article>({
    queryKey: ['/api/articles', slug],
    enabled: Boolean(slug),
  });

  useDocumentTitle(article?.title);

  const { data: projects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    enabled: Boolean(article?.relatedProjectId),
  });
  const relatedProject = projects?.find((p) => p.id === article?.relatedProjectId);

  const components = useMemo(
    () => ({
      a: ({ href, children }: { href?: string; children?: React.ReactNode }) => {
        const url = href || '';
        if (url.startsWith('/')) {
          return (
            <Link href={url}>
              <span className="cursor-pointer text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary">
                {children}
              </span>
            </Link>
          );
        }
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary"
          >
            {children}
          </a>
        );
      },
      img: ({ src, alt }: { src?: string; alt?: string }) => (
        <img
          src={src}
          alt={alt || ''}
          loading="lazy"
          decoding="async"
          onError={onImageError}
          className="w-full rounded-xl border border-slate-800"
        />
      ),
      p: ({ children }: { children?: React.ReactNode }) => {
        const only = Array.isArray(children) ? children.filter((c) => c !== '\n') : [children];
        if (only.length === 1) {
          const node = only[0] as { props?: { href?: string; children?: unknown } };
          const href = node?.props?.href;
          const id = typeof href === 'string' ? YOUTUBE.exec(href)?.[1] : undefined;
          if (id) {
            return (
              <span className="not-prose my-6 block aspect-video w-full overflow-hidden rounded-xl border border-slate-800">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${id}`}
                  title="YouTube video"
                  loading="lazy"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </span>
            );
          }
        }
        return <p>{children}</p>;
      },
    }),
    [],
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 pt-20">
        <div className="mx-auto max-w-3xl px-6 py-20 md:px-8">
          <p className="text-sm text-slate-400">{t('articles.loading')}</p>
        </div>
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 pt-20">
        <div className="px-6 text-center">
          <h1 className="mb-4 font-display text-3xl font-bold text-white">
            {t('articles.notFound.title')}
          </h1>
          <Link href="/articles">
            <span className="inline-block cursor-pointer rounded-lg border border-primary bg-primary px-6 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-brand-400">
              {t('articles.notFound.button')}
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-20 text-slate-300">
      <article>
        {/* === HEADER === */}
        <header className="relative overflow-hidden py-12 md:py-16">
          <div className="pointer-events-none absolute -top-40 end-[-120px] h-[420px] w-[420px] rounded-full bg-primary/[0.10] blur-3xl" />
          <div className="relative mx-auto max-w-3xl px-6 md:px-8">
            <Link href="/articles">
              <span className="mb-8 inline-block cursor-pointer font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400 transition-colors hover:text-white">
                {t('articles.backAll')}
              </span>
            </Link>

            {!article.published && (
              <p className="mb-4 inline-block rounded-full border border-primary px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
                {t('articles.draft')}
              </p>
            )}

            <h1 className="font-display text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl">
              {article.title}
            </h1>
            {article.publishedAt && (
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-slate-400">
                {formatArticleDate(article.publishedAt, language)}
              </p>
            )}
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-6 md:px-8">
          <img
            src={article.coverImage}
            alt=""
            decoding="async"
            onError={onImageError}
            className="aspect-[16/9] w-full rounded-xl border border-slate-800 object-cover"
          />
        </div>

        {/* === BODY === */}
        <div className="mx-auto max-w-3xl px-6 py-12 md:px-8 md:py-16">
          <div
            className="prose prose-invert max-w-none
              prose-headings:font-display prose-headings:tracking-tight prose-headings:text-white
              prose-p:leading-relaxed prose-p:text-slate-300
              prose-li:text-slate-300 prose-strong:text-white
              prose-blockquote:border-s-2 prose-blockquote:border-primary prose-blockquote:not-italic prose-blockquote:text-slate-300
              prose-hr:border-slate-800
              prose-code:text-brand-400 prose-code:before:content-none prose-code:after:content-none
              prose-pre:border prose-pre:border-slate-800 prose-pre:bg-slate-900/60"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={components} urlTransform={urlTransform}>
              {article.body}
            </ReactMarkdown>
          </div>
        </div>

        {/* === NEXT STEP === */}
        {(relatedProject || article.relatedSolution) && (
          <section className="border-y border-slate-800 bg-slate-900/30 py-12 md:py-16">
            <div className="mx-auto max-w-3xl px-6 md:px-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                {t('articles.next')}
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {relatedProject && (
                  <Link href={`/portfolio/${relatedProject.id}`}>
                    <div className="card-lift group h-full cursor-pointer rounded-xl border border-slate-800 bg-slate-950/60 p-5 hover:border-slate-700">
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
                        {t('articles.next.project')}
                      </p>
                      <p className="mt-2 font-display text-base font-semibold text-white transition-colors group-hover:text-primary">
                        {relatedProject.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {t(`category.${relatedProject.category}`)}
                      </p>
                    </div>
                  </Link>
                )}

                {article.relatedSolution && (
                  <Link href={`/services#${article.relatedSolution}`}>
                    <div className="card-lift group h-full cursor-pointer rounded-xl border border-slate-800 bg-slate-950/60 p-5 hover:border-slate-700">
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
                        {t('articles.next.solution')}
                      </p>
                      <p
                        dir="ltr"
                        className="mt-2 font-display text-base font-semibold text-white transition-colors group-hover:text-primary rtl:text-end"
                      >
                        {t(SOLUTION_NAME_KEY[article.relatedSolution])}
                      </p>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

        {/* === CTA === */}
        <section className="relative overflow-hidden py-16 text-center md:py-20">
          <div className="pointer-events-none absolute -bottom-52 left-1/2 h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-primary/[0.10] blur-3xl" />
          <div className="relative mx-auto max-w-2xl px-6 md:px-8">
            <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {t('articles.cta.heading')}
            </h2>
            <p className="mx-auto mt-4 max-w-[52ch] leading-relaxed text-slate-400">
              {t('articles.cta.body')}
            </p>
            <Link href="/contact">
              <span className="mt-7 inline-block cursor-pointer rounded-lg border border-primary bg-primary px-7 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-brand-400">
                {[COPY: common.cta.bookCall]}
              </span>
            </Link>
          </div>
        </section>
      </article>
    </div>
  );
}
```
(`[COPY: common.cta.bookCall]` — already extracted in a prior pass: EN "Book a
strategy call" / AR "احجز مكالمة استراتيجية".)

### Hero/header

- Back-link: `t('articles.backAll')` — a `Link` to `/articles`, styled as text
  (not a button), positioned above everything else in the header.
- Draft badge: `{!article.published && (...)}` — a pill, `t('articles.draft')`.
  Only meaningful to an authenticated admin previewing a draft URL, since the
  public `GET /api/articles/:slug` 404s an unpublished article for anyone not
  authenticated (see Not-found below) — so in practice a logged-out visitor
  never sees this badge; it renders when an admin views their own draft.
- Title: `article.title`, raw, `<h1>`.
- Published date: `formatArticleDate(article.publishedAt, language)`, only
  rendered when `article.publishedAt` is truthy (drafts have `null`).
- Cover image: full-width, `aspect-[16/9]`, `object-cover`, `alt=""` (decorative),
  directly below the header text block, in its own `max-w-3xl` container (same
  width as the body text — narrower than the list page's grid).
- Related-solution/related-project link: **not in the header** — it's a
  separate "NEXT STEP" section after the body (see below), not part of the hero.

### The Markdown pipeline (verbatim)

Library: `react-markdown`, imported with `defaultUrlTransform`:
```ts
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown';
import remarkGfm from 'remark-gfm';
```

Invocation:
```tsx
<ReactMarkdown remarkPlugins={[remarkGfm]} components={components} urlTransform={urlTransform}>
  {article.body}
</ReactMarkdown>
```
- **remark plugins**: `[remarkGfm]` only. No `rehype` plugins at all (no
  `rehype-raw`, no `rehype-sanitize`, no `rehype-highlight`/`rehype-slug`).
- **No syntax highlighting** — `pre`/`code` styling is pure CSS via the
  `prose-code:*` / `prose-pre:*` Tailwind typography modifiers on the wrapper
  div (`prose-code:text-brand-400 prose-code:before:content-none
  prose-code:after:content-none`, `prose-pre:border prose-pre:border-slate-800
  prose-pre:bg-slate-900/60`) — no custom `code`/`pre` component override, no
  highlighter library.
- **Custom component overrides map** (`components` object, memoized with
  `useMemo(() => ({...}), [])`):
  - `a`: internal links (`href` starting with `/`) render as a wouter `<Link>`
    wrapping a styled `<span>` (not a real `<a>`, so it never full-page-reloads
    the SPA); external links render as a real `<a target="_blank"
    rel="noopener noreferrer">`. Both share the same underline styling classes.
  - `img`: forces `loading="lazy"`, `decoding="async"`, the shared
    `onImageError` fallback handler, and a fixed `className="w-full rounded-xl
    border border-slate-800"` — every markdown image gets this treatment
    unconditionally, no per-image override in markdown syntax.
  - `p`: intercepted to detect the "one YouTube link alone in its own
    paragraph" pattern — if a paragraph's only child is a link whose `href`
    matches the `YOUTUBE` regex, it renders a `not-prose` `<iframe>` embed
    (`youtube-nocookie.com/embed/<id>`) instead of the paragraph; any other
    paragraph content renders as a normal `<p>`. No `h1`–`h6`, `ul`/`ol`/`li`,
    `blockquote`, `code`/`pre`, `table`, or `hr` overrides — those are styled
    purely through the `prose-*` Tailwind classes on the wrapper `div`, not
    through component overrides.
- **Image data-URI handling (the important one)**: `react-markdown`'s
  `defaultUrlTransform` has a safe-protocol allowlist that is **http(s) /
  irc(s) / mailto / xmpp only** — it strips `data:` URIs by default, which
  would break every image the admin's "Insert image" tool embeds (those are
  `data:image/webp;base64,...`, matching `server/objectStorage.ts`'s upload
  pipeline). The fix is a **custom `urlTransform` function**, passed as the
  `urlTransform` prop (not a rehype/remark plugin):
  ```ts
  function urlTransform(url: string) {
    if (/^data:image\//i.test(url)) {
      return url;
    }
    return defaultUrlTransform(url);
  }
  ```
  Any `data:image/*` URI passes through completely unmodified; every other URL
  (including non-image `data:` URIs, e.g. `data:text/html`) still goes through
  the library's own default sanitization. This is the entire allowlist — no
  separate `rehype-sanitize` schema, no MIME/extension whitelist beyond the
  regex shown.

**Porting flag**: `react-markdown`'s `urlTransform`/`components` API and the
wouter-based internal-link override are React-runtime concepts; a Next.js
Server Component can still use `react-markdown` client-side the same way (it
has no server-only alternative in this codebase), but the internal `<Link>`
override should swap from wouter's `Link` to `next/link`. This is a like-for-like
swap, not a redesign — the `if (url.startsWith('/'))` branching logic carries
over unchanged.

### Table of contents / share / related-articles section

- **Table of contents**: not present.
- **Share buttons**: not present.
- **Related-articles** (other articles, as a list/grid): not present. The only
  "next step" content is the single **NEXT STEP section** described below,
  which points to at most one related *project* and/or one related *solution*
  (from `/services`), never other articles.

**NEXT STEP section** — renders only if `relatedProject || article.relatedSolution`
is truthy (both are optional per-article admin fields, so this section is
entirely absent when neither is set):
- Related project card → links to `/portfolio/${relatedProject.id}` (same
  id-based pattern as the portfolio list), shows `t('articles.next.project')`
  label, the project's `title`, and its category via `t(`category.${category}`)`.
  `relatedProject` is resolved client-side by fetching `['/api/projects']` (all
  projects) only when `article?.relatedProjectId` is set, then
  `.find(p => p.id === article.relatedProjectId)` — no dedicated
  `/api/projects/:id` call is made for this even though one exists; it reuses
  the full-list endpoint, presumably because it's usually already cached from
  the Portfolio page's own query with the same `['/api/projects']` key.
- Related solution card → links to `/services#${article.relatedSolution}` (a
  hash anchor, not a distinct route), shows `t('articles.next.solution')`
  label and the solution's display name via a lookup table
  (`SOLUTION_NAME_KEY`) into i18n keys `solutions.foundation.name` /
  `solutions.growth.name` / `solutions.scale.name` / `solutions.custom.name`
  (all four already extracted in a prior pass — Solutions page). Rendered
  `dir="ltr"` with an `rtl:text-end` override — presumably because these
  solution names read better kept LTR-anchored even in the RTL layout.

### useQuery key/endpoint + fields consumed

```ts
useQuery<Article>({ queryKey: ['/api/articles', slug], enabled: Boolean(slug) })
// → GET /api/articles/:slug

useQuery<Project[]>({ queryKey: ['/api/projects'], enabled: Boolean(article?.relatedProjectId) })
// → GET /api/projects (only fired when the article has a relatedProjectId)
```

`Article` (full row, `typeof articles.$inferSelect`, from `shared/schema.ts`):
```ts
{
  id: number;
  slug: string;
  title: string;
  excerpt: string;              // used server-side for meta/OG, not rendered on this page
  coverImage: string;           // data:image/webp;base64,...
  body: string;                 // Markdown
  language: "en" | "ar";        // not read here — the current UI language drives rendering, not the article's own language
  published: boolean;
  publishedAt: string | null;   // ISO timestamp or null
  createdAt: string;            // not read
  updatedAt: string;            // not read
  relatedProjectId: number | null;
  relatedSolution: "foundation" | "growth-engine" | "scale-infrastructure" | "custom" | null;
}
```
Fields actually consumed by this page: `title`, `published`, `publishedAt`,
`coverImage`, `body`, `relatedProjectId`, `relatedSolution`. `excerpt`,
`language`, `createdAt`, `updatedAt`, `slug` (beyond the route param), `id` are
fetched as part of the full row but not rendered here (`excerpt` is used
server-side for `<meta>`/OG tags per the comment in the file, not client-rendered).

### Not-found (404) behavior

Same inline pattern as the portfolio detail page — no router-level fallback:
```tsx
if (isError || !article) {
  return (/* "Article not found" + "See all articles" button, links to /articles */);
}
```
Server-side, `GET /api/articles/:slug` (`server/routes.ts:261`) returns 404
`{ message: "Article not found" }` for two distinct cases collapsed into one:
(a) no article with that slug exists at all, or (b) the article exists but
`!article.published && !req.isAuthenticated()` — i.e. **a draft is a 404 to
anyone not logged in**, deliberately indistinguishable from a truly nonexistent
slug so the slug's existence can't be leaked. The client doesn't need to
special-case this — `isError` covers both.

Copy — EN: title "Article not found", button "See all articles" / AR: title
"المقال غير موجود", button "استعرض كل المقالات".

**Porting flag**: same as the portfolio detail 404 — this can become a real
`notFound()` call in a Next Server Component, and the published/authenticated
branching (currently duplicated 404-message logic in the Express route) maps
directly onto a Drizzle query with the same `WHERE slug = $1 AND (published =
true OR $2::boolean)` shape gated by the session check.

---

## 5. SHARED PORTFOLIO/ARTICLE PIECES

**None exist as extracted components.** There is no `ProjectCard`,
`ArticleCard`, `CategoryBadge`, or reusable date-formatter *component* — every
card's JSX is written inline in `Portfolio.tsx` and `Articles.tsx`
respectively, with no shared markup between them (confirmed by grep across
`client/src/components/` — zero matches for `ProjectCard`/`ArticleCard`).

The only genuinely shared pieces are plain utility functions/values, not components:

- **`onImageError`** (`client/src/lib/placeholder.ts`) — shared image-fallback
  handler, used identically on every `<img>` across all four pages (portfolio
  list card, portfolio detail cover, article list card, article detail cover,
  and the markdown-body `img` override):
  ```ts
  export const IMAGE_FALLBACK =
    "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='600'%20height='400'%3E%3Crect%20width='600'%20height='400'%20fill='%230f172a'/%3E%3Ctext%20x='50%25'%20y='50%25'%20fill='%23475569'%20font-family='sans-serif'%20font-size='22'%20text-anchor='middle'%20dominant-baseline='middle'%3ENo%20image%3C/text%3E%3C/svg%3E";

  export function onImageError(e: SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    img.onerror = null;
    img.src = IMAGE_FALLBACK;
  }
  ```
  Used in: Portfolio.tsx (card image), ProjectDetail.tsx (main visual),
  Articles.tsx (card cover), ArticleDetail.tsx (cover image + markdown `img` override).

- **`formatArticleDate`** (`client/src/lib/article-date.ts`) — shared date
  formatter, used identically in Articles.tsx (card date) and ArticleDetail.tsx
  (header date):
  ```ts
  export function formatArticleDate(value: string | Date, language: "en" | "ar"): string {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat(language === "ar" ? "ar-EG-u-nu-latn" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  }
  ```
  Not used on the portfolio pages (projects have no date field rendered).

- **`useDocumentTitle`** (`client/src/hooks/use-document-title.ts`) — shared
  across all four pages (and others sitewide), sets `document.title` to
  `"<title> — OmniflowAI"` or the site default, restoring the default on
  unmount. Portfolio.tsx hardcodes `"Portfolio"` (English literal, not i18n —
  admin/tab titles are deliberately English-only per project convention);
  Articles.tsx uses `t('articles.title')`; ProjectDetail.tsx uses
  `project?.title`; ArticleDetail.tsx uses `article?.title`.

- **Badge / Button / Tabs / Skeleton** — shadcn/ui primitives
  (`client/src/components/ui/*`), used across the app generally, not specific
  to portfolio/articles.

No `CategoryBadge` component exists — the category badge markup
(`<Badge variant="outline" className="border-slate-800 text-slate-400
text-[10px] uppercase tracking-wider bg-slate-900">{t(`category.${category}`)}</Badge>`
on the list, a differently-styled but structurally identical `Badge` on the
detail hero) is duplicated inline between Portfolio.tsx and ProjectDetail.tsx
with different Tailwind classes each time — this is a legitimate porting
candidate for extraction into one shared component, since 1C changes styling
opportunities anyway, but is called out here as "not present," per the
extraction rules, rather than invented.

---

## 6. ROUTING / DATA NOTES

### Route definitions (from `client/src/App.tsx`)

```tsx
const Portfolio = lazy(() => import("@/pages/Portfolio"));
const ProjectDetail = lazy(() => import("@/pages/ProjectDetail"));
const Articles = lazy(() => import("@/pages/Articles"));
const ArticleDetail = lazy(() => import("@/pages/ArticleDetail"));

<Route path="/portfolio" component={Portfolio} />
<Route path="/portfolio/:id" component={ProjectDetail} />
<Route path="/articles" component={Articles} />
<Route path="/articles/:slug" component={ArticleDetail} />
```
All four are plain wouter `<Route>`s with no route-level guards, loaders, or
data-fetching — each page owns its own `useQuery` calls entirely client-side.
**Porting flag**: this is the core wouter idiom that doesn't port 1:1 — Next's
file-based routing (`app/portfolio/page.tsx`, `app/portfolio/[id]/page.tsx`,
`app/articles/page.tsx`, `app/articles/[slug]/page.tsx`) replaces both the
`<Route>` declarations and the client-side `useQuery` fetch-on-mount pattern
with Server Component data fetching (direct Drizzle calls via `storage.ts`,
no client round-trip, no loading skeleton needed for the initial render).

### React-query endpoints and JSON shapes

| Endpoint | Method | Returns | Used by |
|---|---|---|---|
| `/api/projects` | GET | `Project[]` (all) | Portfolio.tsx (both queries), ArticleDetail.tsx (related-project lookup) |
| `/api/projects?category=<slug>` | GET | `Project[]` (filtered) | Portfolio.tsx |
| `/api/projects/:id` | GET | `Project` or 404 | ProjectDetail.tsx |
| `/api/projects/showcase` | GET | `Project[]` (`isServiceShowcase = true`) | not used by these 4 pages (Home/Services) |
| `/api/articles` | GET | `ArticleCard[]` (published only) | Articles.tsx |
| `/api/articles/:slug` | GET | `Article` (full row) or 404 | ArticleDetail.tsx |
| `/api/articles/:slug/cover` | GET | raw image bytes | not fetched by these client pages — used only by server-rendered `<meta property="og:image">` |

Full `Project` and `Article`/`ArticleCard` shapes are given in sections 1–4
above, sourced from `shared/schema.ts`.

**Porting flag**: several of these react-query keys are non-default custom
`queryFn`s (the category-filtered projects query in Portfolio.tsx) rather than
the app's default `queryKey.join('/')` convention (`client/src/lib/queryClient.ts`)
— worth flagging since a literal "port the queryKey" approach would miss the
custom fetch logic; the Next port should read the equivalent DB filter directly
instead of replicating either fetch style.

### Category enum the portfolio filter depends on

From `shared/taxonomy.ts` (this is data, not translated copy — EN/AR labels
come from i18n `category.*` keys shown per page above):
```ts
export const CATEGORIES = [
  "business-systems", "web", "mobile", "automation", "digital-marketing", "ai-training",
] as const;

export const PORTFOLIO_TAB_ORDER = [
  "business-systems", "web", "mobile", "automation", "digital-marketing", "ai-training",
] as const satisfies readonly Category[];
```
(Tab order matches category-declaration order exactly.) Pillar mapping used by
the `?service=` deep link:
```ts
export const PILLARS = ["ai-training", "digital-marketing", "software"] as const;

export const CATEGORY_TO_PILLAR: Record<Category, Pillar> = {
  "business-systems": "software",
  web: "software",
  mobile: "software",
  automation: "software",
  "digital-marketing": "digital-marketing",
  "ai-training": "ai-training",
};
```

### Published-date formatting function / locale handling

Single function, `formatArticleDate` (shown verbatim in section 5), used by
both article pages. Locale handling:
- EN → `Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" })` → e.g. "26 August 2026".
- AR → `Intl.DateTimeFormat("ar-EG-u-nu-latn", { day: "numeric", month: "long", year: "numeric" })` — the `-u-nu-latn` Unicode extension pins **Western (Latin) numerals** even in the Arabic locale, so dates read e.g. "26 أغسطس 2026" rather than using Eastern Arabic-Indic digits (١٢٣...). This is a deliberate spec requirement per the file's own comment ("Western numerals in both languages (spec §12.7)").
- Guards against invalid dates: `Number.isNaN(date.getTime())` returns `""` rather than "Invalid Date" — relevant since `publishedAt` is nullable and both call sites already guard with `{article.publishedAt && ...}` before calling this, so the empty-string path is a defensive fallback, not something currently reachable through normal use.

---

## Copy already extracted in a prior pass (referenced via [COPY: key], not repeated verbatim above except where shown inline for context)

- `common.cta.bookCall`
- `common.all`
- `category.business-systems`, `category.web`, `category.mobile`, `category.automation`, `category.digital-marketing`, `category.ai-training`
- `solutions.foundation.name`, `solutions.growth.name`, `solutions.scale.name`, `solutions.custom.name`

All other strings referenced on these four pages are given verbatim (EN + AR) inline above.
