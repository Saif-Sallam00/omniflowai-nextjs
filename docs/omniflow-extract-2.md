# OmniflowAI — Layout Structure & Interactive-Component Extraction (Pass 2)

Companion to `docs/omniflow-extract.md` (verbatim copy + full design-token layer — not
repeated here). This pass captures **layout skeletons and interactive-component internals
only**: real JSX/TSX structure, real `className` strings, and the state logic driving every
interactive/bespoke piece, so the Next.js port can be a structural match. Verbatim text is
elided as `[COPY: i18n.key]`.

---

## 1. One missing string

From `client/src/lib/i18n.tsx`:

| Key | EN | AR |
|---|---|---|
| `footer.tagline` | We build the systems behind business growth. | نبني الأنظمة التي تقف خلف نمو الأعمال. |

**Newsletter submit button aria-label:** there is no dedicated string for it. The button reuses the newsletter input's placeholder key as its `aria-label`:
```tsx
<Button
  type="submit"
  size="icon"
  disabled={submitting}
  aria-label={t("footer.newsletter.placeholder")}
  className="h-10 w-10 bg-primary text-primary-foreground"
>
  <Send className="w-4 h-4" />
</Button>
```
So the button's accessible name is literally `footer.newsletter.placeholder` — EN "Enter your email" / AR "أدخل بريدك الإلكتروني" (already captured in pass 1). No separate `footer.newsletter.submitLabel`-style key exists.

---

## HOME (`client/src/pages/Home.tsx`)

Page root:
```tsx
<div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-x-hidden">
  {/* 10 sections, in order, below */}
</div>
```

Two local helper components used across sections:

```tsx
// Subtle scroll-in reveal (fade + small rise). Reduced-motion / no-IO → renders in
// final state immediately (useInView initialises inView=true).
function Reveal({ children, className = "", delayMs = 0 }: {
  children: React.ReactNode; className?: string; delayMs?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
      className={`transition-all duration-700 ease-standard ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// Systems-problem highlight: reveal the orange words progressively as the moment
// enters view. `inView` comes from the parent section so the stagger is tied to the
// statement, not each word. Splitting on spaces works for EN and AR.
function HighlightWords({ text, inView }: { text: string; inView: boolean }) {
  const words = text.split(" ");
  return (
    <span className="text-brand-400">
      {words.map((word, i) => (
        <span
          key={i}
          style={{ transitionDelay: `${i * 90}ms` }}
          className={`inline-block me-[0.25em] transition-all duration-500 ease-standard ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
```

Component-level state (all declared once in `Home()`, feeding multiple sections):
```tsx
const { t } = useI18n();
useDocumentTitle();
const valueProp = useInView<HTMLDivElement>();   // gates §3
const process = useInView<HTMLDivElement>();     // gates §8 timeline

const heroSystemNodes: InteractiveNode[] = [
  { id: "ai-training", label: t("systemMap.node.aiTraining"), icon: Bot },
  { id: "marketing", label: t("systemMap.node.marketing"), icon: Target },
  { id: "software", label: t("systemMap.node.software"), icon: Layers },
  { id: "automation", label: t("systemMap.node.automation"), icon: Workflow },
  { id: "crm", label: t("systemMap.node.crm"), icon: Users },
  { id: "strategy", label: t("systemMap.node.strategy"), icon: Compass },
];

const { data: projects } = useQuery<Project[]>({ queryKey: ['/api/projects'] });
const all = projects || [];
const featured = all.filter((p) => p.isFeatured).sort((a, b) => proofRank(a.category) - proofRank(b.category));
const recent = all.filter((p) => !p.isFeatured).slice(0, 6);
```
`proofRank` sorts featured projects by a fixed category order (`business-systems → automation → digital-marketing → web → mobile → ai-training`, anything else last) — pure data logic, no UI.

### 1. Hero

```tsx
<section className="relative min-h-[80vh] mt-16 md:mt-20 flex items-center overflow-hidden py-20 md:py-28">
  <div className="absolute inset-0 bg-gradient-to-b from-orange-950/10 via-transparent to-transparent pointer-events-none" />
  <HexGridSubstrate className="absolute inset-0" opacity={0.035} fade="radial" />

  <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-8">
    <div className="grid lg:grid-cols-2 gap-12 lg:gap-10 items-center">

      <div className="text-center lg:text-start">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight">
          [COPY: home.hero.h1.lead]{" "}
          <span className="text-brand-400">[COPY: home.hero.h1.highlight]</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0 mt-8">
          [COPY: home.hero.sub]
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-10">
          <Link href="/contact">
            <Button size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground font-bold h-12 md:h-14 px-8 rounded-full shadow-sm hover:brightness-110 transition">
              [COPY: common.cta.bookCall] <ArrowRight className="ms-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/portfolio">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-700 text-slate-300 hover:text-white hover:bg-white/10 h-12 md:h-14 px-8 rounded-full">
              [COPY: home.hero.cta2]
            </Button>
          </Link>
        </div>
      </div>

      <div className="mx-auto w-full max-w-sm lg:max-w-none">
        <InteractiveSystemMap
          centerLabel={t("systemMap.center")}
          nodes={heroSystemNodes}
          ariaLabel={t("systemMap.aria")}
          width={480}
          height={460}
        />
      </div>

    </div>
  </div>
</section>
```

#### Interactive piece: Hero "system map" visual (`client/src/components/systems/InteractiveSystemMap.tsx`)

**Concept:** a central hexagon ("Business System") with 6 capability nodes on a ring. On scroll-in the connections reveal; on hover/focus/click one node is emphasized with a Flow-Orange traveling pulse on its edge to the center.

**State/hooks:**
```tsx
const { isRTL } = useI18n();
const reduced = useReducedMotion();
const { ref, inView } = useInView<SVGSVGElement>({ threshold: 0.25 });
const [active, setActive] = useState<string | null>(null);
```
- `revealed = inView` — drives the connected/unconnected opacity state of every edge and node (reduced-motion/no-IO fails open to `true`, i.e. renders the final connected state immediately).
- `active` — which node id is currently hovered/focused/tapped; drives per-edge emphasis.
- Geometry: `mx(x) = isRTL ? width - x : x` mirrors every x-coordinate for RTL; node positions come from a shared `ring()` helper in `./primitives`; `wrapLabel()` splits long labels into up to 2 lines by nearest-length-balance.

**Markup skeleton (SVG):**
```tsx
<svg ref={ref} viewBox={`0 0 ${width} ${height}`} className={`w-full h-auto ${className}`}
     role="img" aria-label={ariaLabel} preserveAspectRatio="xMidYMid meet">
  <defs>
    <radialGradient id={`hub-${uid}`} ...>{/* center glow */}</radialGradient>
    <radialGradient id={`node-${uid}`} ...>{/* node hover glow */}</radialGradient>
  </defs>

  {/* EDGES — one curved path per node → center, drawn under the nodes */}
  {nodes.map((n, i) => (
    <g key={`edge-${n.id}`} aria-hidden="true">
      <path
        d={edgePath(from, to, "curve")}
        fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"
        className={`${isActive ? "text-brand-500" : "text-slate-600"} transition-all duration-500 ease-standard`}
        style={{ opacity: !revealed ? 0.1 : isActive ? 0.95 : otherActive ? 0.18 : 0.5, transitionDelay: `${i * 110}ms` }}
      />
      {isActive && !reduced && (
        <path d={d} fill="none" className="text-brand-400" stroke="currentColor" strokeWidth={1.6}
              strokeLinecap="round" strokeDasharray="6 240"
              style={{ animation: "flow-travel 3500ms linear infinite" }} />
      )}
    </g>
  ))}

  {/* CENTER — the Business System hexagon, always prominent */}
  <g aria-hidden="true" className="text-brand-500">
    <circle cx={mx(cx)} cy={cy} r={centerR * 2.3} fill={`url(#hub-${uid})`} />
    <path d={hexPath(mx(cx), cy, centerR, "flat")} fill="currentColor" fillOpacity={0.16}
          stroke="currentColor" strokeWidth={2} strokeLinejoin="round" />
    <text x={mx(cx)} y={cy} textAnchor="middle" className="fill-brand-400" style={{ fontSize: 13, fontWeight: 600 }}>
      {/* centerLines via <tspan> per wrapped line */}
    </text>
  </g>

  {/* RING NODES — hexagon + icon + radial label, decorative-only pointer/click */}
  {nodes.map((n, i) => (
    <g key={`node-${n.id}`} aria-hidden="true" className="cursor-pointer"
       onMouseEnter={() => setActive(n.id)}
       onMouseLeave={() => setActive((cur) => (cur === n.id ? null : cur))}
       onClick={() => setActive((cur) => (cur === n.id ? null : n.id))}>
      <circle r={nodeR * 1.9} fill={`url(#node-${uid})`} style={{ opacity: isActive ? 1 : 0 }} />
      <path d={hexPath(nx, ny, nodeR, "flat")} fill="currentColor"
            fillOpacity={isActive ? 0.16 : 0.05} stroke="currentColor"
            strokeWidth={isActive ? 2 : 1.5} strokeLinejoin="round"
            className={`${isActive ? "text-brand-500" : "text-slate-600"} transition-all duration-500 ease-standard`}
            style={{ opacity: !revealed ? 0.35 : otherActive ? 0.4 : 1, transitionDelay: `${i * 110}ms` }} />
      {Icon && <Icon className={isActive ? "text-brand-400" : "text-slate-300"} .../>}
      <text textAnchor={anchor} className={isActive ? "fill-brand-400" : "fill-slate-400"}
            style={{ fontSize: 12, fontWeight: 500, opacity: revealed ? 1 : 0.4, direction: isRTL ? "rtl" : "ltr" }}>
        {/* wrapped label via <tspan> */}
      </text>
    </g>
  ))}
</svg>
```
The whole SVG is `role="img" aria-label={ariaLabel}` (one accessible image); every internal `<g>` is `aria-hidden="true"` since interaction is decorative-only, not keyboard-navigable.

### 2. Trust strip + client-logo marquee

```tsx
<section className="py-20 md:py-24 bg-surface border-y border-black/[0.06] overflow-hidden">
  <div className="max-w-4xl mx-auto px-6 md:px-8 mb-16 flex flex-col items-center text-center">
    <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-600">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
      </span>
      [COPY: home.trustEyebrow]
    </span>
    <h2 className="mt-5 text-3xl md:text-4xl font-bold tracking-tight text-slate-900 max-w-3xl text-balance">
      [COPY: home.reach.headline]
    </h2>

    <dl className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-6 w-full max-w-3xl">
      {reachStats.map((s) => (
        <div key={s.valueKey} className="flex flex-col items-center text-center">
          <dd className={`flex min-h-[3rem] md:min-h-[3.5rem] items-center justify-center font-bold leading-tight text-brand-600 ${
            s.text ? "text-2xl md:text-3xl" : "text-4xl md:text-5xl tabular-nums"
          }`}>
            [COPY: s.valueKey]
          </dd>
          <dt className="mt-3 text-sm md:text-base text-slate-600">[COPY: s.labelKey]</dt>
        </div>
      ))}
    </dl>

    {/* Country strip — split on " · ", rendered as discrete spans so the
        middle-dot separators mirror correctly in RTL and wrap gracefully. */}
    <div className="mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-slate-500">
      {t("home.reach.countries").split(" · ").flatMap((country, i) =>
        i === 0
          ? [<span key={country}>{country}</span>]
          : [
              <span key={`sep-${i}`} aria-hidden="true" className="text-slate-300">·</span>,
              <span key={country}>{country}</span>,
            ]
      )}
    </div>
  </div>

  {/* Marquee row */}
  <div className="relative">
    <div className="absolute left-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-r from-[#F6F7F8] to-transparent z-10 pointer-events-none" />
    <div className="absolute right-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-l from-[#F6F7F8] to-transparent z-10 pointer-events-none" />

    <div className="flex w-max items-center animate-marquee">
      {[...allClients, ...allClients].map((client, index) => (
        <div key={index} className="flex-shrink-0 mx-3 md:mx-4 h-20 md:h-24 w-40 md:w-48 flex items-center justify-center rounded-xl bg-white border border-slate-200 px-4 shadow-card">
          <img src={client.logo} alt={client.name} loading="lazy" decoding="async"
               className="max-h-16 md:max-h-20 max-w-full w-auto object-contain" />
        </div>
      ))}
    </div>
  </div>

  <style>{`
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .animate-marquee { animation: marquee 30s linear infinite; }
  `}</style>
</section>
```
Marquee mechanism: `allClients` (26 entries) is concatenated with itself (`[...allClients, ...allClients]`) so the row is exactly double length, then `translateX(-50%)` over 30s loops seamlessly back to the start — no JS, pure CSS `linear infinite` animation. No pause-on-hover handler exists.

### 3. Value proposition (word-by-word scroll reveal)

```tsx
<section className="py-20 md:py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-y border-white/[0.06]">
  <div ref={valueProp.ref} className="max-w-4xl mx-auto px-6 md:px-8 text-center">
    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
      <span className={`transition-opacity duration-700 ease-standard ${valueProp.inView ? "opacity-100" : "opacity-0"}`}>
        [COPY: home.valueProp.title.lead]{" "}
      </span>
      <HighlightWords text={t("home.valueProp.title.highlight")} inView={valueProp.inView} />
    </h2>
    <p
      style={{ transitionDelay: "450ms" }}
      className={`text-lg text-slate-400 leading-relaxed mt-8 transition-all duration-700 ease-standard ${
        valueProp.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      [COPY: home.valueProp.body]
    </p>
  </div>
</section>
```

**Mechanism (not a per-word IntersectionObserver — one observer gates the whole section, then CSS transition-delay staggers the words):**
1. `valueProp = useInView<HTMLDivElement>()` (from `use-in-view.ts`) is attached via `ref={valueProp.ref}` to the section's inner wrapper — a single native `IntersectionObserver` with `threshold: 0.15`, `rootMargin: "0px 0px -12% 0px"`, latches `inView = true` once and disconnects (reveal-once, not repeatable). Reduced-motion or no-IO support makes it initialize `true` immediately (fail-open).
2. The lead clause fades via a plain opacity transition gated on `valueProp.inView`.
3. `HighlightWords` receives the same `inView` boolean and the highlight string, splits it on spaces, and renders each word in its own `<span>` with `transitionDelay: ${i * 90}ms` — so as soon as the section's `inView` flips true, all the word spans transition simultaneously but each starts its `opacity`/`translate-y` animation `90ms` later than the previous one, producing the word-by-word cascade purely from staggered CSS `transition-delay`, not sequential state updates.
4. The body paragraph has its own fixed `450ms` delay so it lands after the headline cascade finishes.

### 4. Pillars / Services grid

```tsx
<section className="py-20 md:py-24 bg-surface border-t border-black/[0.06]">
  <div className="max-w-6xl mx-auto px-6 md:px-8">
    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 md:mb-16 max-w-2xl">
      [COPY: home.pillars.title]
    </h2>

    <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
      {pillars.map((pillar, index) => (
        <Link key={index} href={pillar.href}>
          <div className="card-lift group h-full flex flex-col p-6 md:p-8 rounded-xl bg-white border border-slate-200 hover:border-slate-300 cursor-pointer shadow-card">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-6">
              <Icon className="w-6 h-6 text-brand-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3 leading-snug">[COPY: pillar.titleKey]</h3>
            <p className="text-sm md:text-base text-slate-600 leading-relaxed">[COPY: pillar.bodyKey]</p>
            {pillar.subcapsKey && (
              <p className="text-xs text-brand-700 font-medium mt-6 pt-6 border-t border-slate-200">
                [COPY: pillar.subcapsKey]
              </p>
            )}
          </div>
        </Link>
      ))}
    </Reveal>
  </div>
</section>
```
Uses the shared `Reveal` wrapper (fade + rise on its own `useInView`) around the whole 3-card grid, not per-card.

### 5. Transformation (Before/After — two-column block)

```tsx
<section className="py-20 md:py-24 bg-slate-950 border-y border-white/[0.06]">
  <div className="max-w-6xl mx-auto px-6 md:px-8">
    <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 md:mb-16 text-center">
      [COPY: home.transform.title]
    </h2>

    <Reveal className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
      {/* Before */}
      <div className="p-6 md:p-8 rounded-xl bg-slate-900/50 border border-slate-800 shadow-card">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">[COPY: home.transform.before.label]</p>
        <ul className="space-y-4">
          {transformBefore.map((key, i) => (
            <li key={i} className="flex items-start gap-3 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-2 flex-shrink-0" />
              [COPY: key]
            </li>
          ))}
        </ul>
      </div>

      {/* After */}
      <div className="p-6 md:p-8 rounded-xl bg-gradient-to-br from-brand-700/15 to-slate-900/50 border border-brand-500/20 shadow-card">
        <p className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-6">[COPY: home.transform.after.label]</p>
        <ul className="space-y-4">
          {transformAfter.map((key, i) => (
            <li key={i} className="flex items-start gap-3 text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-brand-400 mt-1 flex-shrink-0" />
              [COPY: key]
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  </div>
</section>
```
Both columns are inside one `Reveal` wrapper (single fade/rise, not staggered per item). "Before" bullets use a plain dot marker; "After" bullets use a `CheckCircle2` lucide icon in brand color — the visual asymmetry (dull dot vs. affirmative check) is deliberate, not accidental.

### 6. Proof (DB-driven, conditional render)

```tsx
{featured.length > 0 && (
  <section className="py-20 md:py-24 bg-surface border-t border-black/[0.06]">
    <div className="max-w-6xl mx-auto px-6 md:px-8">
      <div className="max-w-2xl mb-12 md:mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">[COPY: home.proof.title]</h2>
        <p className="text-slate-600 leading-relaxed">[COPY: home.proof.body]</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featured.map((project) => (
          <Link key={project.id} href={`/portfolio/${project.id}`}>
            <div className="group cursor-pointer">
              <div className="card-lift relative overflow-hidden rounded-xl bg-slate-100 aspect-[4/3] border border-slate-200 hover:border-slate-300 mb-4">
                <img src={project.image} alt={project.title} loading="lazy" decoding="async" onError={onImageError}
                     className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-brand-600 transition-colors mb-1">{project.title}</h3>
              <p className="text-sm text-slate-600">[COPY: category.{project.category}]</p>
              {project.results?.[0] && (
                <p className="text-sm font-semibold text-brand-700 mt-2">{project.results[0]}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
)}
```
Whole `<section>` is gated on `featured.length > 0` — no empty-state markup exists, the section simply doesn't render.

### 7. Recent work (DB-driven carousel, conditional render)

```tsx
{recent.length > 0 && (
  <section className="py-20 md:py-24 bg-slate-950 border-y border-white/[0.06]">
    <div className="max-w-6xl mx-auto px-6 md:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">[COPY: home.recent.title]</h2>
          <p className="text-slate-400">[COPY: home.recent.sub]</p>
        </div>
        <Link href="/portfolio">
          <Button variant="ghost" className="text-slate-400 hover:text-white">
            [COPY: common.viewAllProjects]
            <ArrowRight className="w-4 h-4 ms-2" />
          </Button>
        </Link>
      </div>

      <Carousel opts={{ align: "start", loop: true }} className="w-full">
        <CarouselContent>
          {recent.map((project) => (
            <CarouselItem key={project.id} className="md:basis-1/2 lg:basis-1/3 pl-6">
              <Link href={`/portfolio/${project.id}`}>
                <div className="group cursor-pointer">
                  <div className="card-lift relative overflow-hidden rounded-xl bg-slate-900 aspect-[4/3] border border-slate-800 hover:border-slate-700 mb-4">
                    <img src={project.image} alt={project.title} loading="lazy" decoding="async" onError={onImageError}
                         className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-brand-400 transition-colors mb-1">{project.title}</h3>
                  <p className="text-sm text-slate-400">[COPY: category.{project.category}]</p>
                  {project.results?.[0] && (
                    <p className="text-sm font-semibold text-brand-400 mt-2">{project.results[0]}</p>
                  )}
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex justify-end gap-2 mt-8">
          <CarouselPrevious className="static translate-y-0 bg-slate-900 border-slate-800 hover:bg-slate-800 text-white w-10 h-10" />
          <CarouselNext className="static translate-y-0 bg-slate-900 border-slate-800 hover:bg-slate-800 text-white w-10 h-10" />
        </div>
      </Carousel>
    </div>
  </section>
)}
```
Uses the shadcn/ui `Carousel`/`CarouselContent`/`CarouselItem`/`CarouselPrevious`/`CarouselNext` primitives (`@/components/ui/carousel`, itself an Embla wrapper) with `opts={{ align: "start", loop: true }}`. No custom autoplay/state — entirely the shadcn carousel's own internal state.

### 8. How we work (4-step scroll-activated timeline)

```tsx
<section className="py-20 md:py-24 bg-surface border-t border-black/[0.06]">
  <div className="max-w-6xl mx-auto px-6 md:px-8">
    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 md:mb-16">[COPY: home.how.title]</h2>

    <div ref={process.ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
      {howWeWork.map((item, index) => {
        const active = process.inView;
        const delay = { transitionDelay: `${index * 180}ms` };
        return (
          <div
            key={index}
            style={delay}
            className={`relative p-4 md:p-6 rounded-xl bg-white shadow-card overflow-hidden border transition-colors duration-500 ease-standard ${
              active ? "border-brand-500/30" : "border-slate-200"
            }`}
          >
            <span
              aria-hidden="true"
              style={delay}
              className={`absolute inset-x-0 top-0 h-1 bg-primary transition-opacity duration-500 ease-standard ${
                active ? "opacity-100" : "opacity-0"
              }`}
            />
            <div
              style={delay}
              className={`text-4xl md:text-6xl font-bold mb-3 md:mb-4 transition-colors duration-500 ease-standard ${
                active ? "text-brand-400" : "text-slate-200"
              }`}
            >
              {item.step}
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2 md:mb-3">[COPY: item.titleKey]</h3>
            <p className="text-sm md:text-base text-slate-600 leading-relaxed">[COPY: item.descKey]</p>
          </div>
        );
      })}
    </div>
  </div>
</section>
```

**Scroll-activation mechanism:** identical single-observer pattern to the value-prop section — `process = useInView<HTMLDivElement>()` is attached to the 4-column grid wrapper (one `IntersectionObserver`, reveal-once, fail-open on reduced-motion/no-IO). `active` is just `process.inView` (the same boolean for all 4 cards). What creates the *sequential* look is `transitionDelay: ${index * 180}ms` applied identically to 3 different elements per card (the card border-color transition, the top accent bar's opacity, and the step-number color) — so all 4 cards start transitioning the instant the section scrolls into view, but each one's transition is delayed 180ms longer than the previous, making them light up left-to-right (or right-to-left under RTL, since flex/grid order follows `dir`) in sequence purely via CSS, not staggered state updates. `item.step` is a literal `"01"`/`"02"`/`"03"`/`"04"` string, not computed.

### 9. Global brand line (shield icon + statement band)

```tsx
<section className="py-20 md:py-24 bg-slate-950 bg-gradient-to-r from-brand-700/15 via-slate-950 to-brand-700/15 border-y border-brand-500/10">
  <div className="max-w-6xl mx-auto px-6 md:px-8">
    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center flex-shrink-0 border border-brand-500/20">
          <Shield className="w-6 h-6 text-brand-400" />
        </div>
        <p className="text-lg md:text-xl font-semibold text-white max-w-2xl">[COPY: common.brandLine]</p>
      </div>
      <Link href="/contact">
        <Button className="bg-primary text-primary-foreground font-semibold px-6 rounded-full transition-colors whitespace-nowrap">
          [COPY: common.cta.bookCall]
          <ArrowRight className="w-4 h-4 ms-2" />
        </Button>
      </Link>
    </div>
  </div>
</section>
```
No animation/state — a static two-item flex row (icon+statement vs. CTA) that stacks vertically below `md`.

### 10. Final CTA

```tsx
<section className="py-24 md:py-32 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative">
  <div className="absolute inset-0 bg-gradient-to-t from-orange-950/20 via-transparent to-transparent" />

  <Reveal className="relative z-10 max-w-3xl mx-auto px-6 md:px-8 text-center">
    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">[COPY: home.finalCta.title]</h2>
    <p className="text-xl text-slate-400 mb-10 leading-relaxed">[COPY: home.finalCta.body]</p>

    <Link href="/contact">
      <Button size="lg" className="bg-primary text-primary-foreground font-semibold px-10 py-7 text-lg rounded-full transition-colors">
        [COPY: home.finalCta.button]
        <ArrowRight className="w-5 h-5 ms-2" />
      </Button>
    </Link>

    <p className="text-sm text-slate-400 mt-6">[COPY: home.finalCta.sub]</p>
  </Reveal>
</section>
```

---

## ABOUT (`client/src/pages/About.tsx`)

Page root: `<div className="min-h-screen pt-20 bg-slate-950 text-white">` — no local state, no `useInView`/scroll logic anywhere on this page; the only motion is a plain CSS `group-hover` transition on the story image (§2).

### 1. Hero

```tsx
<section className="py-20 md:py-24 relative overflow-hidden">
  <div className="absolute top-0 right-0 w-[50%] h-[60%] bg-gradient-to-bl from-orange-950/30 via-transparent to-transparent pointer-events-none" />

  <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 text-center">
    <div className="max-w-4xl mx-auto">
      <Badge variant="outline" className="mb-6 px-4 py-1 border-brand-500/30 text-brand-400 tracking-widest uppercase text-xs font-semibold bg-brand-500/10">
        [COPY: about.badge]
      </Badge>
      <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-8 leading-tight">
        [COPY: about.headline.lead]{" "}
        <span className="text-brand-400">[COPY: about.headline.highlight]</span>
      </h1>
      <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">[COPY: about.sub]</p>
    </div>
  </div>
</section>
```
Uses shadcn `Badge` (`variant="outline"`).

### 2. Story

```tsx
<section className="py-20 md:py-24 bg-slate-900/30 border-y border-slate-800/30">
  <div className="max-w-7xl mx-auto px-6 md:px-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      {/* Image side */}
      <div className="relative group">
        <div className="absolute inset-0 bg-brand-500 rounded-xl transform rotate-2 translate-x-2 translate-y-2 opacity-20 group-hover:opacity-30 transition-opacity"></div>
        <img
          src={TeamImage}
          alt="The OmniflowAI team"
          loading="lazy"
          decoding="async"
          className="relative rounded-xl shadow-elevated w-full object-cover aspect-video grayscale group-hover:grayscale-0 transition-all duration-700 border border-slate-800"
        />
      </div>

      {/* Text side */}
      <div className="space-y-8">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-white">[COPY: about.story.heading]</h2>
        <div className="prose prose-lg text-slate-400 space-y-6">
          <p>[COPY: about.story.p1]</p>
          <p>[COPY: about.story.p2]</p>
          <p>[COPY: about.story.p3]</p>
        </div>
      </div>
    </div>
  </div>
</section>
```
**Animation note:** two hover-only CSS transitions, no JS/state — a skewed brand-orange "shadow card" behind the photo fades from `opacity-20` to `opacity-30` on `group-hover`, and the photo itself desaturates (`grayscale`) at rest and turns full-color (`grayscale-0`) on hover, over `duration-700`. Uses Tailwind's `@tailwindcss/typography` `prose` classes for the paragraph block.

### 3. Values (4-card grid)

```tsx
<section className="py-20 md:py-24 bg-slate-900/30 border-y border-slate-800/30">
  <div className="max-w-7xl mx-auto px-6 md:px-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <ValueCard icon={Shield} title={t("about.values.1.title")} desc={t("about.values.1.desc")} />
      <ValueCard icon={Target} title={t("about.values.2.title")} desc={t("about.values.2.desc")} />
      <ValueCard icon={Users} title={t("about.values.3.title")} desc={t("about.values.3.desc")} />
      <ValueCard icon={Award} title={t("about.values.4.title")} desc={t("about.values.4.desc")} />
    </div>
  </div>
</section>
```
`ValueCard` local helper component:
```tsx
function ValueCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:bg-slate-900/60 hover:border-slate-700 transition-all duration-300 shadow-card">
      <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}
```
Note the Story and Values sections share the exact same wrapper classes (`bg-slate-900/30 border-y border-slate-800/30`) — two visually-identical consecutive bands, not a deliberate alternation.

### 4. CTA

```tsx
<section className="py-24 md:py-32 text-center relative overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-t from-orange-950/20 via-transparent to-transparent pointer-events-none" />

  <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-8">
    <h2 className="text-3xl font-display font-bold text-white mb-6">[COPY: about.cta.title]</h2>
    <p className="text-lg text-slate-400 mb-8">[COPY: common.brandLine]</p>
    <a href="/contact">
      <Button size="lg" className="bg-primary text-primary-foreground text-lg px-8 py-6 rounded-full font-bold shadow-sm">
        [COPY: common.cta.bookCall]
      </Button>
    </a>
  </div>
</section>
```
Note: this is the one CTA link on the whole site that uses a plain `<a href="/contact">` instead of wouter's `<Link href="/contact">` — everywhere else (Home, Solutions, Nav, Footer) uses `<Link>`. Worth normalizing in the port but flagged here as-is, not fixed.

---

## SOLUTIONS (`client/src/pages/Services.tsx`, route `/services`)

Page root: `<div className="min-h-screen pt-20 bg-slate-950 text-slate-300">`

### Module-level data & types

```tsx
type SolutionId = 'foundation' | 'growth-engine' | 'scale-infrastructure' | 'custom';

const SOLUTIONS = [
  { id: 'foundation', key: 'foundation', includes: [4, 4, 6, 3], priceFloor: '$1,000' as string | null, priceNoteKey: 'solutions.grid.priceNote1' },
  { id: 'growth-engine', key: 'growth', includes: [5, 3, 4, 3], priceFloor: '$7,000' as string | null, priceNoteKey: 'solutions.grid.priceNote2' },
  { id: 'scale-infrastructure', key: 'scale', includes: [4, 4, 4, 3], priceFloor: '$30,000' as string | null, priceNoteKey: 'solutions.grid.priceNote2' },
] as const;

// index → which solution that router question routes to
const ROUTER_OPTIONS = [
  { target: 'growth-engine' },
  { target: 'scale-infrastructure' },
  { target: 'scale-infrastructure' },
  { target: 'foundation' },
  { target: 'foundation' },
  { target: 'custom' },
] as const satisfies readonly { target: SolutionId }[];

const DEFAULT_ROUTER_INDEX = 0; // pre-answered on Q1 → Growth Engine

const SOLUTION_NAME_KEY: Record<SolutionId, string> = {
  foundation: 'solutions.foundation.name',
  'growth-engine': 'solutions.growth.name',
  'scale-infrastructure': 'solutions.scale.name',
  custom: 'solutions.custom.name',
};
const DEEP_LINK_IDS: readonly string[] = Object.keys(SOLUTION_NAME_KEY); // #foundation, #growth-engine, #scale-infrastructure, #custom

const CAPABILITIES = [
  { key: 'marketing', href: '/services/digital-marketing', glyph: 'marketing' },
  { key: 'tech', href: '/services/software', glyph: 'tech' },
  { key: 'ai', href: '/services/ai-training', glyph: 'ai' },
] as const;

const FAQ_ITEMS = [1, 2, 3, 4, 5, 6, 7] as const;
const pad2 = (n: number) => String(n).padStart(2, '0'); // "01".."06" for router option numbers
```

`ltrNames(text)`: splits any translated string on a regex matching the 4 product names (longest-first) and wraps each match in `<span dir="ltr">`, leaving everything else untouched — used everywhere a solution name can appear inside an Arabic sentence.

### Page-level state & handlers

```tsx
const { t } = useI18n();
useDocumentTitle('Solutions');
const reduced = useReducedMotion();

const [selected, setSelected] = useState<number>(DEFAULT_ROUTER_INDEX);       // which router question is checked (0-5)
const [highlighted, setHighlighted] = useState<SolutionId | null>(null);      // which card/band flashes a highlight ring
const highlightTimer = useRef<number>();
const routerRef = useRef<HTMLElement>(null);

// Scrolls to a solution block and flashes its highlight ring for 2s.
const revealSolution = useCallback((id: SolutionId) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  window.clearTimeout(highlightTimer.current);
  setHighlighted(null);                                  // clear first...
  requestAnimationFrame(() => setHighlighted(id));        // ...then set next frame, so re-selecting the same block restarts the flash
  highlightTimer.current = window.setTimeout(() => setHighlighted(null), 2000);
}, [reduced]);

// Deep-link support: #foundation / #growth-engine / #scale-infrastructure / #custom on load
const deepLinked = useRef(false);
useEffect(() => {
  if (deepLinked.current) return;
  deepLinked.current = true;
  const id = window.location.hash.slice(1);
  if (!DEEP_LINK_IDS.includes(id)) return;
  const frame = requestAnimationFrame(() => revealSolution(id as SolutionId)); // deferred a frame to land after App's ScrollToTop
  return () => cancelAnimationFrame(frame);
}, [revealSolution]);

useEffect(() => () => window.clearTimeout(highlightTimer.current), []);

// Router selection — only ever called from a real click, never on mount.
const onRouterSelect = (index: number) => {
  setSelected(index);
  const target = ROUTER_OPTIONS[index].target;
  trackEvent('router_select', 'solutions_router', target, index + 1); // GA4 — never fires for the pre-answered default
  revealSolution(target);
};

const { data: projects } = useQuery<Project[]>({ queryKey: ['/api/projects'] });
const featured = (projects || []).filter((p) => p.isFeatured);

const recommended = ROUTER_OPTIONS[selected].target;  // derived, drives every "Recommended" badge on the page
```

### 1. Hero

```tsx
<section className="relative overflow-hidden py-16 md:py-24">
  <div className="pointer-events-none absolute -top-40 end-[-120px] h-[520px] w-[520px] rounded-full bg-primary/[0.13] blur-3xl" />

  <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 md:px-8 lg:grid-cols-[1.05fr_0.95fr]">
    <div>
      <Eyebrow>[COPY: solutions.eyebrow]</Eyebrow>
      <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl">
        [COPY: solutions.h1.lead]{' '}
        <span className="text-primary">[COPY: solutions.h1.accent]</span>
      </h1>
      <p className="mt-5 max-w-[46ch] leading-relaxed text-slate-300">[COPY: solutions.subhead]</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link href="/contact" className="w-full sm:w-auto">
          <span className="block w-full rounded-lg border border-primary bg-primary px-6 py-3 text-center text-sm font-semibold text-slate-950 transition-colors hover:bg-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
            [COPY: common.cta.bookCall]
          </span>
        </Link>
        <button
          type="button"
          onClick={() => routerRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })}
          className="w-full rounded-lg border border-slate-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:border-slate-600 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto"
        >
          [COPY: solutions.hero.secondary]
        </button>
      </div>
    </div>

    <BusinessDiagnostic />
  </div>
</section>
```
`Eyebrow` local helper: `<span className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">{children}<span aria-hidden="true" className="h-px flex-1 bg-slate-800" /></span>` — a mono label + a trailing hairline rule that flexes to fill remaining width.

#### Interactive piece: BusinessDiagnostic (`client/src/components/systems/BusinessDiagnostic.tsx`)

**Concept:** 7 growth "signal" chips scattered in a field with no visible connections at rest. Hovering/focusing/clicking a signal (or its parent constraint) draws dashed "same-cause" links between the signals sharing that constraint, plus a solid trace down to their shared root-constraint node, and shows a readout panel explaining the connection. A "Show the system" toggle switches the whole field into a resolved state: the 7 signals fade out and the 3 constraints fly to fixed positions on a horizontal "Strategy" rail, each now displaying its corresponding capability name (Marketing Systems / Business Technology / AI Enablement).

**Static data:**
```tsx
type ConstraintId = "demand" | "operating" | "capacity";

const SIGNALS = [
  { key: "s1", constraint: "demand" }, { key: "s2", constraint: "demand" },
  { key: "s3", constraint: "operating" }, { key: "s4", constraint: "operating" }, { key: "s5", constraint: "operating" },
  { key: "s6", constraint: "capacity" }, { key: "s7", constraint: "capacity" },
] as const;

const CONSTRAINTS = [
  { id: "demand", key: "c1", buildKey: "solutions.work.marketing.title" },
  { id: "operating", key: "c2", buildKey: "solutions.work.tech.title" },
  { id: "capacity", key: "c3", buildKey: "solutions.work.ai.title" },
] as const;

// Two hand-tuned layouts (percent-of-field x/y for every signal, constraint-at-rest,
// and constraint-in-resolved-system position), picked by measured FIELD width, not viewport:
const NARROW_BELOW = 400; // px
const LAYOUTS = { wide: { signals: {...}, constraints: {...}, system: {...}, rail: 76 },
                  narrow: { signals: {...}, constraints: {...}, system: {...}, rail: 86 } };

// Every same-cluster signal pair (for the dashed "hidden relationship" links)
const PEERS = CONSTRAINTS.flatMap((c) => { /* all C(n,2) pairs within each cluster */ });
const COUNTS = { demand: 2, operating: 3, capacity: 2 }; // signals per constraint, derived

const DEMO_CLUSTER: ConstraintId = "operating"; // which cluster the unprompted entrance demo plays
const DEMO_IN = 700; const DEMO_OUT = 3600;     // ms — demo starts, then auto-clears
```

**State:**
```tsx
const reduced = useReducedMotion();
const { ref: frameRef, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });

const fieldRef = useRef<HTMLDivElement>(null);
const [size, setSize] = useState({ w: 0, h: 0 });
useEffect(() => {
  const el = fieldRef.current;
  if (!el || typeof ResizeObserver === "undefined") return;
  const ro = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
  ro.observe(el);
  return () => ro.disconnect();
}, []);
const layout = size.w > 0 && size.w < NARROW_BELOW ? LAYOUTS.narrow : LAYOUTS.wide;
const measured = size.w > 0 && size.h > 0;
const at = (p) => ({ x: (p.x / 100) * size.w, y: (p.y / 100) * size.h }); // percent → the SVG edge layer's pixel viewBox

const [mode, setMode] = useState<"diagnosis" | "system">("diagnosis");
const [preview, setPreview] = useState<ConstraintId | null>(null);  // hover/focus-driven, transient
const [locked, setLocked] = useState<ConstraintId | null>(null);    // click-driven, sticky until toggled off
const [demo, setDemo] = useState<ConstraintId | null>(null);        // the unprompted entrance demo
const active = preview ?? locked ?? demo;                           // precedence: hover > click > demo

const activeConstraint = CONSTRAINTS.find((c) => c.id === active) ?? null;
const resolved = mode === "system";
```

**Entrance demo (runs once, plays itself unless the visitor interacts first):**
```tsx
const timers = useRef<number[]>([]);
const touched = useRef(false);
useEffect(() => {
  if (!inView || reduced || touched.current) return;
  timers.current = [
    window.setTimeout(() => setDemo(DEMO_CLUSTER), DEMO_IN),
    window.setTimeout(() => setDemo(null), DEMO_OUT),
  ];
  return () => timers.current.forEach(window.clearTimeout);
}, [inView, reduced]);

const takeOver = () => {
  if (!touched.current) {
    touched.current = true;
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    setDemo(null); // cancel a pending/playing demo the instant the visitor does anything real
  }
};
```

**Per-node interaction handlers (shared by every signal button and constraint button):**
```tsx
const handlers = (id: ConstraintId) => ({
  onPointerEnter: (e) => { if (e.pointerType === "touch") return; takeOver(); setPreview(id); },
  onPointerLeave: (e) => { if (e.pointerType !== "touch") setPreview(null); },
  onFocus: (e) => { if (!isKeyboardFocus(e.currentTarget)) return; takeOver(); setPreview(id); },
  onBlur: () => setPreview(null),
  onClick: () => { takeOver(); setLocked((cur) => (cur === id ? null : id)); }, // click toggles a sticky lock
  "aria-describedby": readoutId,
});

const switchMode = () => {
  takeOver();
  setMode((m) => (m === "diagnosis" ? "system" : "diagnosis"));
  setPreview(null);
  setLocked(null);
};
```
`isKeyboardFocus(el)` = `el.matches(":focus-visible")` (falls back to `true` if the browser throws on the selector) — used so a mouse-click-induced focus doesn't also trigger the hover-style preview state.

**Markup skeleton:**
```tsx
<div ref={frameRef} role="group" aria-labelledby={titleId} className={`rounded-xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6 ${className}`}>

  {/* Frame header */}
  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-slate-800/60 pb-3.5">
    <p id={titleId} className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
      [COPY: resolved ? solutions.diag.systemTitle : solutions.diag.title]
    </p>
    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">
      {/* solutions.diag.summary template, {s}/{c} filled from SIGNALS.length / CONSTRAINTS.length */}
    </p>
  </div>

  {/* THE FIELD */}
  <div ref={fieldRef} className="relative mt-4 h-[26rem] w-full overflow-hidden sm:h-[22rem]">
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--primary)/0.10),transparent_70%)]" />

    {/* EDGE LAYER — SVG absolutely positioned over the field, mounted only once measured */}
    {measured && (
      <svg aria-hidden="true" viewBox={`0 0 ${size.w} ${size.h}`} className="pointer-events-none absolute inset-0 h-full w-full">
        {/* dashed peer↔peer curves within the active cluster */}
        {/* solid, pathLength=1 draw-in traces from each signal to its constraint (stroke-dashoffset transition) */}
        {/* resolved-state: one horizontal "rail" line + one vertical drop per constraint down to it */}
      </svg>
    )}

    {/* SIGNAL NODES — 7 absolutely-positioned <button>s (percent left/top), each:
        - at rest: sits at its scattered layout.signals[key] position, gently drifting via
          `animation: node-drift ${13 + (i%4)*2.5}s ...`, paused while any node is active
        - on resolve: animates (via `transition: left/top 900ms, opacity 700ms`) to
          layout.system[constraint] and fades to opacity 0, tabIndex=-1, aria-hidden — "absorbed"
        - visible label = solutions.diag.{key}.label; full solutions.diag.{key}.text is sr-only
          appended as the accessible name */}
    {SIGNALS.map((signal, i) => (
      <div key={signal.key} className="absolute z-10" style={{ left: `${target.x}%`, top: `${target.y}%`, transition: travel, opacity: resolved ? 0 : 1 }}>
        <div className="-translate-x-1/2 -translate-y-1/2">
          <div style={driftStyle(i)}>
            <button type="button" {...handlers(signal.constraint)} tabIndex={resolved ? -1 : undefined} aria-hidden={resolved || undefined}
              className={`block max-w-[8.5rem] rounded-md border px-2.5 py-2 text-start text-[11px] leading-snug transition-colors duration-300 ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-[9.5rem] sm:py-1.5 sm:text-xs ${resolved ? "pointer-events-none " : ""}${
                on ? "border-primary bg-slate-950 text-white" : muted ? "border-slate-800 bg-slate-950/80 text-slate-400" : "border-slate-700 bg-slate-950/80 text-slate-300"
              }`}>
              [COPY: solutions.diag.{signal.key}.label]
              <span className="sr-only"> — [COPY: solutions.diag.{signal.key}.text]</span>
            </button>
          </div>
        </div>
      </div>
    ))}

    {/* CONSTRAINT NODES — 3 absolutely-positioned nodes.
        - Dormant (not active, not resolved): a tiny rotated 8px square (border-primary/60
          bg-primary/20), `animation: constraint-breathe`, paused while anything is active.
        - Active (not resolved): expands into a bordered chip showing
          solutions.diag.rootLabel + the constraint's name.
        - Resolved: no longer a <button> — a static bordered chip showing the capability
          name (buildKey, dir="ltr") + the constraint's own name below it, entrance via
          `animation: diag-resolve 500ms ... ${420 + i*90}ms both`. */}
    {CONSTRAINTS.map((c, i) => ( /* see full source for the resolved/dormant/active branches */ ))}

    {/* Strategy rail label — only visible when resolved */}
    <div aria-hidden={!resolved} className="pointer-events-none absolute inset-x-0 z-10 px-2 text-center transition-opacity duration-500 ease-standard" style={{ top: `${layout.rail + 3}%`, opacity: resolved ? 1 : 0 }}>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">[COPY: solutions.diag.strategyLabel]</p>
      <p className="mx-auto mt-1 max-w-[30ch] text-[11px] leading-snug text-slate-400">[COPY: solutions.diag.strategyBody]</p>
    </div>
  </div>

  {/* READOUT — fixed min-height so nothing reflows; 3 states: resolved / active / idle-hint */}
  <div id={readoutId} aria-live="polite" className="mt-3.5 min-h-[5.5rem] border-t border-slate-800/60 pt-3.5">
    {resolved ? (
      <p className="font-display text-sm font-medium leading-snug tracking-tight text-white">[COPY: solutions.diag.thesis]</p>
    ) : activeConstraint ? (
      <>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary">{/* solutions.diag.trace template, {n}/{s} filled */}</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-300">[COPY: solutions.diag.{activeConstraint.key}.impact]</p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">
          [COPY: solutions.diag.buildLabel] <span dir="ltr" className="text-white">[COPY: activeConstraint.buildKey]</span>
        </p>
      </>
    ) : (
      <p className="text-[13px] leading-relaxed text-slate-400">[COPY: solutions.diag.hint]</p>
    )}
  </div>

  {/* Mode toggle */}
  <div className="mt-4 flex justify-end border-t border-slate-800/60 pt-3.5">
    <button type="button" onClick={switchMode} className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-primary transition-colors hover:text-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {resolved ? (<><span aria-hidden="true" className="text-sm leading-none rtl:-scale-x-100">&larr;</span>[COPY: solutions.diag.showSignals]</>)
                : (<>[COPY: solutions.diag.showSystem]<span aria-hidden="true" className="text-sm leading-none rtl:-scale-x-100">&rarr;</span></>)}
    </button>
  </div>
</div>
```

### 2. Diagnostic router (6-question, live recommendation)

```tsx
<section ref={routerRef} id="router" className="scroll-mt-24 border-y border-slate-800 bg-slate-900/30 py-16 md:py-20">
  <div className="mx-auto max-w-6xl px-6 md:px-8">
    <Eyebrow>[COPY: solutions.router.eyebrow]</Eyebrow>
    <h2 id="router-heading" className="font-display text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">
      [COPY: solutions.router.heading]
    </h2>
    <p id="router-sub" className="mt-3 max-w-[66ch] leading-relaxed text-slate-400">[COPY: solutions.router.sub]</p>

    <div role="radiogroup" aria-labelledby="router-heading" aria-describedby="router-sub" className="mt-8 grid grid-cols-1 gap-2.5 md:grid-cols-2">
      {ROUTER_OPTIONS.map((_, i) => {
        const isOn = selected === i;
        return (
          <label key={i} className={`group flex min-h-[3.25rem] cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors focus-within:ring-2 focus-within:ring-ring sm:p-5 ${
            isOn ? 'border-primary bg-primary/[0.13]' : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
          }`}>
            <input type="radio" name="growth-constraint" className="sr-only" checked={isOn} onChange={() => onRouterSelect(i)} />
            <span aria-hidden="true" className={`flex-none pt-0.5 font-mono text-[11px] tracking-[0.1em] ${isOn ? 'text-primary' : 'text-slate-400'}`}>
              {pad2(i + 1)}
            </span>
            <span className={`font-display text-base font-medium leading-snug tracking-tight ${isOn ? 'text-white' : 'text-slate-300'}`}>
              [COPY: solutions.router.q{i+1}]
            </span>
          </label>
        );
      })}
    </div>

    {/* Live recommendation — always present (router starts pre-answered), aria-live="polite" */}
    <div aria-live="polite">
      <div className="relative mt-4 flex flex-wrap items-center gap-6 overflow-hidden rounded-e-xl border border-primary/30 bg-slate-950/60 p-5 sm:p-6">
        <span aria-hidden="true" className="absolute inset-y-0 start-0 w-[3px] bg-primary" />
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">[COPY: solutions.router.resultLabel]</p>
          <p dir="ltr" className="mt-1 font-display text-2xl font-bold tracking-tight text-white rtl:text-end">
            [COPY: SOLUTION_NAME_KEY[recommended]]
          </p>
        </div>
        <p className="min-w-[15rem] flex-1 text-sm leading-relaxed text-slate-400">
          {ltrNames(t(`solutions.router.r${selected + 1}`))}
        </p>
      </div>
    </div>

    <p className="mt-5 text-sm text-slate-400">
      <Link href="/contact">
        <span className="cursor-pointer underline decoration-slate-700 underline-offset-4 transition-colors hover:text-white hover:decoration-primary">
          [COPY: solutions.router.unsure]
        </span>
      </Link>
    </p>
  </div>
</section>
```

**Logic mapping question → recommendation:** it's a plain array lookup, not a scoring/weighting system. `ROUTER_OPTIONS[index].target` gives the `SolutionId` for whichever radio index is `selected` (native single-select radiogroup, one `name="growth-constraint"` for all 6 `<input type="radio">`s, each visually hidden via `sr-only` with the label's background/border driving the visible selected state). `recommended = ROUTER_OPTIONS[selected].target` is computed once at the top of the component and threaded down to every "Recommended" badge on the page (the 3 cards + the Custom band) — so there is exactly one source of truth for which one is marked, and it updates live on every selection. Selecting a radio calls `onRouterSelect(i)`, which updates `selected`, fires the GA `router_select` event (only for genuine clicks — the default pre-selected index never fires it since `onRouterSelect` is never called on mount), and calls `revealSolution(target)` to scroll+flash the corresponding card/band.

### 3. The three solutions — grid + card component

```tsx
<section className="py-16 md:py-20">
  <div className="mx-auto max-w-6xl px-6 md:px-8">
    <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">[COPY: solutions.grid.heading]</h2>
    <p className="mt-3 max-w-[66ch] leading-relaxed text-slate-400">[COPY: solutions.grid.sub]</p>
    <p className="mt-2 max-w-[66ch] text-sm leading-relaxed text-slate-400">[COPY: solutions.grid.recommendedNote]</p>

    <div className="mt-9 grid grid-cols-1 gap-4 md:grid-cols-3">
      {SOLUTIONS.map((s) => (
        <SolutionCard key={s.id} solution={s} highlighted={highlighted === s.id} recommended={recommended === s.id} />
      ))}
    </div>
  </div>
</section>
```

**`SolutionCard` component** (props: `solution`, `highlighted`, `recommended`):
```tsx
<div
  id={id}
  className={`relative flex scroll-mt-24 flex-col rounded-xl border p-6 transition-colors duration-300 ${
    recommended ? 'bg-primary/[0.05]' : 'bg-slate-900/50'
  } ${
    highlighted ? 'border-primary ring-2 ring-primary/60'
      : recommended ? 'border-primary/60' : 'border-slate-800'
  }`}
>
  {recommended && (
    <p className="absolute -top-px start-6 -translate-y-1/2 rounded-full border border-primary bg-slate-950 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
      [COPY: solutions.grid.recommended]
    </p>
  )}

  <HexGlyph glyph={id} />

  <p dir="ltr" className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-primary rtl:text-end">[COPY: solutions.{key}.name]</p>
  <h3 className="mt-2.5 font-display text-xl font-semibold leading-snug tracking-tight text-white">[COPY: solutions.{key}.statement]</h3>

  <div className="mt-3 border-t border-slate-800/40 pt-3.5">
    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">[COPY: solutions.grid.outcomeLabel]</p>
    <p className="mt-1 text-sm leading-relaxed text-slate-400">[COPY: solutions.{key}.outcomeShort]</p>
  </div>

  {isScale && (
    <div className="mt-3.5 rounded-lg border border-primary/30 bg-primary/[0.13] p-3.5">
      <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">[COPY: solutions.scale.alwaysLabel]</p>
      <p className="text-xs leading-relaxed text-slate-300">[COPY: solutions.scale.always]</p>
    </div>
  )}

  <div className="mt-4">
    <Disclosure id={`inc-${id}`} label={t('solutions.grid.included')}>
      <div className="space-y-4 py-4">
        <p className="text-sm leading-relaxed text-slate-300">[COPY: solutions.{key}.tagline]</p>
        <Field label={t('solutions.grid.bestFor')} body={ltrNames(t(`solutions.${key}.bestFor`))} />
        <Field label={t('solutions.grid.problem')} body={ltrNames(t(`solutions.${key}.problem`))} />
        {isScale && <p className="text-xs leading-relaxed text-slate-400">[COPY: solutions.scale.expandsLabel]</p>}

        <ul className="space-y-4">
          {includes.map((itemCount, idx) => (
            <li key={idx + 1}>
              <p className="text-sm font-medium text-white">[COPY: solutions.{key}.inc{idx+1}.title]</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-400">[COPY: solutions.{key}.inc{idx+1}.body]</p>
              <ul className="mt-2 space-y-1.5">
                {Array.from({ length: itemCount }, (_, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-300">
                    <span aria-hidden="true" className="mt-[6px] h-1.5 w-[5px] flex-none bg-primary/70 [clip-path:polygon(50%_0,100%_25%,100%_75%,50%_100%,0_75%,0_25%)]" />
                    [COPY: solutions.{key}.inc{idx+1}.item{i+1}]
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <Field label={t('solutions.grid.outcome')} body={ltrNames(t(`solutions.${key}.outcome`))} />
        {isFoundation && <p className="text-xs leading-relaxed text-slate-400">[COPY: solutions.foundation.note]</p>}
      </div>
    </Disclosure>
  </div>

  {/* Price — never collapsed */}
  <div className="mt-auto pt-5">
    {priceFloor ? (
      <>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">[COPY: solutions.grid.priceFrom]</p>
        <p dir="ltr" className="mt-1 font-display text-3xl font-bold tracking-tight text-white rtl:text-end">{priceFloor}</p>
      </>
    ) : (
      <p className="font-display text-xl font-bold tracking-tight text-white">[COPY: solutions.grid.priceOnRequest]</p>
    )}
    <p className="mt-2 text-[11px] leading-relaxed text-slate-400">[COPY: priceNoteKey]</p>

    {isFoundation && (
      <p className="mt-3 rounded-lg border border-[#7DDBA3]/30 bg-[#7DDBA3]/[0.08] p-3 text-[11px] leading-relaxed text-[#7DDBA3]">
        [COPY: solutions.foundation.credit]
      </p>
    )}

    <Link href={`/contact?service=${id}`} className="mt-5 block">
      <span className={`block w-full rounded-lg border px-5 py-3 text-center text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
        recommended ? 'border-primary bg-primary text-slate-950 hover:bg-brand-400' : 'border-slate-700 text-white hover:border-slate-600 hover:bg-white/5'
      }`}>
        [COPY: common.cta.bookCall]
      </span>
    </Link>
  </div>
</div>
```
`isScale = key === 'scale'`, `isFoundation = key === 'foundation'` — the only per-solution conditional branching; Growth Engine renders none of the three special blocks (always-included callout, expands-label, foundation note/credit).

**"What's included" disclosure mechanism** — a hand-rolled `Disclosure` component (**not** shadcn/Radix `Accordion` or `Collapsible** — see FAQ section below for the same finding):
```tsx
function Disclosure({ id, label, labelClassName = '', children }: {
  id: string; label: ReactNode; labelClassName?: string; children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-[2.75rem] w-full items-center justify-between gap-4 border-b border-slate-800/40 py-3.5 text-start text-sm text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className={labelClassName}>{label}</span>
        <span aria-hidden="true" className="flex-none text-lg leading-none text-primary">{open ? '−' : '+'}</span>
      </button>
      <div id={`${id}-panel`} className={open ? 'block' : 'hidden'}>{children}</div>
    </div>
  );
}
```
Plain local `useState<boolean>`, `hidden`/`block` toggle (no height-animation, no Radix). Reused verbatim for the FAQ (§7) — same component, different `id`/`label`/`children`. A "+"/"−" glyph is used instead of a chevron specifically because it needs no mirroring in RTL.

`Field` local helper (used inside the disclosure body for "Best for" / "The problem" / "Outcome"):
```tsx
function Field({ label, body }: { label: string; body: ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-400">{body}</p>
    </div>
  );
}
```

### 4. Custom Transformation (band)

```tsx
<section
  id="custom"
  className={`scroll-mt-24 bg-primary py-16 transition-shadow md:py-20 ${
    highlighted === 'custom' ? 'ring-4 ring-inset ring-slate-950/60' : ''
  }`}
>
  <div className="mx-auto max-w-6xl px-6 md:px-8">
    {recommended === 'custom' && (
      <p className="mb-4 inline-block rounded-full bg-slate-950 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
        [COPY: solutions.grid.recommended]
      </p>
    )}
    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-950/80">[COPY: solutions.custom.eyebrow]</p>
    <h2 className="mt-4 max-w-[19ch] font-display text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-3xl md:text-4xl">
      [COPY: solutions.custom.heading]
    </h2>
    <p className="mt-4 max-w-[62ch] leading-relaxed text-slate-950/80">[COPY: solutions.custom.body]</p>
    <p dir="ltr" className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-950 rtl:text-end">[COPY: solutions.custom.name]</p>

    <div className="mt-6 flex flex-col flex-wrap items-stretch gap-4 sm:flex-row sm:items-center">
      <Link href="/contact?service=custom" className="w-full sm:w-auto">
        <span className="block w-full rounded-lg border border-slate-950 bg-slate-950 px-6 py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 focus-visible:ring-offset-primary">
          [COPY: common.cta.bookCall]
        </span>
      </Link>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-950/80">[COPY: solutions.custom.price]</p>
    </div>
  </div>
</section>
```
This is the only section on the page with `bg-primary` (solid Flow Orange) — every other band is a slate/dark surface; text colors are inverted accordingly (`text-slate-950` instead of `text-white`). The `ring-4 ring-inset ring-slate-950/60` highlight-flash (from `revealSolution('custom')`, e.g. via router Q6) is the band's equivalent of the cards' `border-primary ring-2 ring-primary/60` highlight.

### 5. How we work (Strategy block + 3 capability cards)

```tsx
<section className="py-16 md:py-20">
  <div className="mx-auto max-w-6xl px-6 md:px-8">
    <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">[COPY: solutions.work.heading]</h2>

    <div className="relative mt-7 overflow-hidden rounded-e-xl border border-slate-800 bg-slate-900/40 p-6">
      <span aria-hidden="true" className="absolute inset-y-0 start-0 w-[2px] bg-primary" />
      <h3 className="font-display text-lg font-semibold text-white">[COPY: solutions.work.strategy.label]</h3>
      <p className="mt-2 max-w-[80ch] leading-relaxed text-slate-400">[COPY: solutions.work.strategy.body]</p>
    </div>

    <p className="my-6 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">[COPY: solutions.work.divider]</p>

    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {CAPABILITIES.map((c) => (
        <Link key={c.key} href={c.href}>
          <div className="card-lift group h-full cursor-pointer rounded-xl border border-slate-800 bg-slate-900/40 p-6 hover:border-slate-700">
            <HexGlyph size={26} glyph={c.glyph} />
            <h3 className="mt-3.5 font-display text-base font-semibold text-white transition-colors group-hover:text-primary">[COPY: solutions.work.{c.key}.title]</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">[COPY: solutions.work.{c.key}.body]</p>
          </div>
        </Link>
      ))}
    </div>
  </div>
</section>
```
No state — the Strategy block is a static callout (an `inset-y-0 start-0 w-[2px] bg-primary` accent bar simulating a left/leading border, chosen as an element instead of a real border so it mirrors correctly in RTL). The 3 capability cards below link out to the individual service-detail pages.

### 6. Proof (DB-driven, conditional)

```tsx
{featured.length > 0 && (
  <section className="border-t border-slate-800/40 py-16 md:py-20">
    <div className="mx-auto max-w-6xl px-6 md:px-8">
      <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">[COPY: solutions.proof.heading]</h2>
      <p className="mt-3 max-w-[66ch] leading-relaxed text-slate-400">[COPY: solutions.proof.sub]</p>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {featured.map((project) => (
          <Link key={project.id} href={`/portfolio/${project.id}`}>
            <div className="group cursor-pointer">
              <div className="card-lift relative mb-4 aspect-[4/3] overflow-hidden rounded-xl border border-slate-800 bg-slate-900 hover:border-slate-700">
                <img src={project.image} alt={project.title} loading="lazy" decoding="async" onError={onImageError}
                     className="h-full w-full transform object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <h3 className="mb-1 font-display text-lg font-semibold text-white transition-colors group-hover:text-primary">{project.title}</h3>
              <p className="text-sm text-slate-400">[COPY: category.{project.category}]</p>
              {project.results?.[0] && <p className="mt-2 text-sm font-semibold text-brand-400">{project.results[0]}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
)}
```
Structurally identical pattern to Home's Proof/Recent sections (same DB fields, same conditional render on `.length > 0`).

### 7. FAQ (7-item accordion)

```tsx
<section className="border-y border-slate-800 bg-slate-900/30 py-16 md:py-20">
  <div className="mx-auto max-w-6xl px-6 md:px-8">
    <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">[COPY: solutions.faq.heading]</h2>
    <div className="mt-6 border-t border-slate-800/40">
      {FAQ_ITEMS.map((n) => (
        <Disclosure key={n} id={`faq-${n}`} label={ltrNames(t(`solutions.faq.q${n}`))} labelClassName="font-display text-base font-medium text-white">
          <p className="max-w-[80ch] pb-4 text-sm leading-relaxed text-slate-400">{ltrNames(t(`solutions.faq.a${n}`))}</p>
        </Disclosure>
      ))}
    </div>
  </div>
</section>
```
**Important finding for the port:** the FAQ is **not** a shadcn/Radix `Accordion` component. `client/src/components/ui/accordion.tsx` (a shadcn Radix-based accordion, `AccordionItem`/`AccordionTrigger`/`AccordionContent`) exists in the codebase but is **not imported or used anywhere in `Services.tsx`**. The FAQ reuses the same hand-rolled `Disclosure` function documented under §3 above (plain `useState<boolean>` per item, `aria-expanded`/`aria-controls`, `hidden`/`block` panel toggle, "+"/"−" glyph). Each of the 7 items is fully independent — opening one does not close another (no single-open-at-a-time accordion behavior, since there's no shared state across `Disclosure` instances).

### 8. Final CTA

```tsx
<section className="relative overflow-hidden py-20 text-center md:py-24">
  <div className="pointer-events-none absolute -bottom-52 left-1/2 h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-primary/[0.13] blur-3xl" />
  <div className="relative mx-auto max-w-3xl px-6 md:px-8">
    <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">[COPY: solutions.cta.heading]</h2>
    <p className="mx-auto mt-4 max-w-[56ch] leading-relaxed text-slate-400">[COPY: solutions.cta.body]</p>
    <Link href="/contact">
      <span className="mt-7 inline-block rounded-lg border border-primary bg-primary px-7 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
        [COPY: common.cta.bookCall]
      </span>
    </Link>
  </div>
</section>
```

---

## LIGHT/DARK BAND MAP

Legend: **DARK** = slate-900/950-family background · **LIGHT** = `bg-surface` (`#F6F7F8`) · **ORANGE** = `bg-primary` solid.

### HOME
| # | Section | Actual background classes | Band |
|---|---|---|---|
| — | Page root (base, shows through any section with no own bg) | `bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950` | DARK |
| 1 | Hero | no own bg (page root gradient); overlay `bg-gradient-to-b from-orange-950/10 via-transparent to-transparent` | DARK |
| 2 | Trust strip + logos | `bg-surface border-y border-black/[0.06]` | LIGHT |
| 3 | Value proposition | `bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-y border-white/[0.06]` | DARK |
| 4 | Pillars grid | `bg-surface border-t border-black/[0.06]` | LIGHT |
| 5 | Transformation | `bg-slate-950 border-y border-white/[0.06]` | DARK |
| 6 | Proof (conditional) | `bg-surface border-t border-black/[0.06]` | LIGHT |
| 7 | Recent work (conditional) | `bg-slate-950 border-y border-white/[0.06]` | DARK |
| 8 | How we work | `bg-surface border-t border-black/[0.06]` | LIGHT |
| 9 | Global brand line | `bg-slate-950 bg-gradient-to-r from-brand-700/15 via-slate-950 to-brand-700/15 border-y border-brand-500/10` | DARK |
| 10 | Final CTA | `bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950` (+ orange radial overlay) | DARK |

Pattern: strict alternation LIGHT/DARK/LIGHT/DARK... starting DARK (hero), except sections 6–7 (Proof/Recent) are both DB-driven and can each independently disappear — if Proof is empty but Recent isn't, section 8 (LIGHT) would sit directly after section 5 (DARK) with Recent (DARK) skipped, i.e. the alternation is only guaranteed when both DB sections render.

### ABOUT
| # | Section | Actual background classes | Band |
|---|---|---|---|
| — | Page root | `bg-slate-950` (`text-white`) | DARK |
| 1 | Hero | no own bg (page root); overlay `bg-gradient-to-bl from-orange-950/30 via-transparent to-transparent` | DARK |
| 2 | Story | `bg-slate-900/30 border-y border-slate-800/30` | DARK (slightly lighter) |
| 3 | Values | `bg-slate-900/30 border-y border-slate-800/30` (identical to Story — no alternation) | DARK (slightly lighter) |
| 4 | CTA | no own bg (page root); overlay `bg-gradient-to-t from-orange-950/20 via-transparent to-transparent` | DARK |

About is DARK end-to-end — no light band anywhere on this page, and sections 2/3 use the exact same background class rather than alternating.

### SOLUTIONS
Per an explicit source comment in `Services.tsx`: *"Surface rhythm alternates between the two darkest surfaces (§12.6): hero 950 · router 900 · solutions 950 · custom ORANGE · how-we-work 950 · proof 950 · faq 900 · final CTA 950."*

| # | Section | Actual background classes | Band |
|---|---|---|---|
| — | Page root | `bg-slate-950` (`text-slate-300`) | DARK |
| 1 | Hero | no own bg (page root) | DARK (950) |
| 2 | Diagnostic router | `border-y border-slate-800 bg-slate-900/30` | DARK (900) |
| 3 | Three solutions grid | no own bg (page root) | DARK (950) |
| 4 | Custom Transformation | `bg-primary` | **ORANGE** |
| 5 | How we work | no own bg (page root) | DARK (950) |
| 6 | Proof (conditional) | `border-t border-slate-800/40`, no bg class → falls to page root | DARK (950) |
| 7 | FAQ | `border-y border-slate-800 bg-slate-900/30` | DARK (900) |
| 8 | Final CTA | no own bg (page root) | DARK (950) |

No light (`bg-surface`) band anywhere on Solutions — it's the only one of the three pages in this pass with zero light sections; contrast comes entirely from the 950/900 alternation plus the one orange band. Source comment explicitly notes Proof "deliberately repeats the 950 of the section above it" — hiding it (when there are no featured projects) must not break the 950/900 alternation, which is why it was given no distinct background of its own.

---

## SHARED LAYOUT

### Header (`client/src/components/Navigation.tsx`)

**Scroll-transition state:**
```tsx
const [isScrolled, setIsScrolled] = useState(false);
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
const [location] = useLocation();
const { t, language, setLanguage, isRTL } = useI18n();

useEffect(() => {
  const handleScroll = () => setIsScrolled(window.scrollY > 20);
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

const toggleLanguage = () => setLanguage(language === 'en' ? 'ar' : 'en');
```
No throttle/debounce on the scroll listener — a plain `addEventListener('scroll', ...)` firing on every scroll event, gated only by the `scrollY > 20` boolean threshold (so re-renders only actually occur on the two transitions across that threshold, not on every pixel, since `setIsScrolled` is a no-op re-render when the boolean doesn't change).

**Markup:**
```tsx
<nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
  isScrolled
    ? 'bg-slate-950/90 backdrop-blur-md border-slate-800/50 py-2'
    : 'bg-slate-950/0 border-transparent py-4'
}`}>
  <div className="max-w-7xl mx-auto px-6 md:px-8">
    <div className="flex items-center justify-between h-16">

      <Link href="/">
        <span className="flex items-center gap-3 cursor-pointer group">
          <span dir="ltr" className="text-4xl font-bold font-display tracking-tight transition-colors flex items-center">
            <Hexagon className="w-9 h-9 text-brand-500 group-hover:text-brand-400 transition-colors stroke-[3] mr-1" />
            <span className="text-white group-hover:text-brand-400 transition-colors">Omniflow</span>
            <span className="text-brand-500 group-hover:text-brand-400 transition-colors">AI</span>
          </span>
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <span className={`text-sm font-medium transition-colors cursor-pointer ${
              location === link.href ? 'text-brand-400' : 'text-slate-300 hover:text-white'
            }`}>{link.label}</span>
          </Link>
        ))}
      </div>

      <div className="hidden md:flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleLanguage}
          aria-label={language === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
          className="rounded-full text-slate-400 hover:text-white hover:bg-white/10">
          <Globe className="w-5 h-5" />
        </Button>
        <Link href="/contact">
          <Button className="whitespace-nowrap bg-primary text-primary-foreground font-semibold rounded-full px-4 lg:px-6">
            {t('common.cta.bookCall')}
            <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
          </Button>
        </Link>
      </div>

      <button className="md:hidden p-2 rounded-md text-slate-300 hover:text-white hover:bg-white/10"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
    </div>
  </div>

  {isMobileMenuOpen && (
    <div className="md:hidden bg-slate-950 border-t border-slate-800 absolute top-full left-0 right-0 h-screen">
      <div className="px-6 py-6 space-y-4">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <span className={`block px-4 py-4 rounded-xl text-lg font-medium transition-colors cursor-pointer ${
              location === link.href ? 'text-brand-400 bg-brand-500/10' : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`} onClick={() => setIsMobileMenuOpen(false)}>{link.label}</span>
          </Link>
        ))}
        <div className="mt-8 space-y-3">
          <Link href="/contact" className="block">
            <Button className="w-full bg-primary text-primary-foreground font-bold h-12 rounded-full" onClick={() => setIsMobileMenuOpen(false)}>
              {t('common.cta.bookCall')}
            </Button>
          </Link>
          <Button variant="outline" className="w-full border-slate-700 text-slate-300 h-12" onClick={toggleLanguage}>
            <Globe className="w-4 h-4 mr-2" /> {language === 'en' ? 'العربية' : 'English'}
          </Button>
        </div>
      </div>
    </div>
  )}
</nav>
```
`isRTL` explicitly flips the header CTA's arrow margin (`mr-2` vs `ml-2`) even though most spacing elsewhere relies on Tailwind logical properties (`ms-`/`me-`) — this one spot is a manual conditional rather than a logical-property class. The mobile menu panel is `absolute top-full ... h-screen` (full-viewport-height dropdown), not a slide-in drawer or a portal/dialog — it's plain conditional rendering of a block, no animation library and no CSS transition on open/close (it's either mounted or not).

### Footer (`client/src/components/Footer.tsx`)

```tsx
<footer className="bg-slate-950 text-slate-300 border-t border-slate-800 relative overflow-hidden">
  <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/5 rounded-full blur-[60px] pointer-events-none" />
  <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-700/5 rounded-full blur-[60px] pointer-events-none" />

  <div className="max-w-7xl mx-auto px-6 md:px-8 pt-12 md:pt-24 pb-10 relative z-10">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-4 md:gap-12 mb-12 md:mb-16">

      {/* Column 1 — Brand, spans full width on mobile */}
      <div className="col-span-2 md:col-span-1 space-y-4 md:space-y-6 text-center md:text-start">
        <Link href="/">
          <span className="text-2xl font-bold font-display text-white cursor-pointer flex items-center justify-center md:justify-start gap-2">
            OmniflowAI
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          </span>
        </Link>
        <p className="text-slate-400 leading-relaxed text-sm md:text-base">[COPY: footer.tagline]</p>
        {socials.length > 0 && (
          <div className="flex items-center justify-center md:justify-start gap-4">
            {socials.map(([key, url]) => <SocialIcon key={key} href={url} icon={SOCIAL_ICONS[key]} />)}
          </div>
        )}
      </div>

      {/* Column 2 — Services */}
      <div className="col-span-1">
        <h3 className="font-bold text-white mb-4 md:mb-6 text-xs md:text-base uppercase md:normal-case">[COPY: footer.services]</h3>
        <ul className="space-y-3 md:space-y-4 text-xs md:text-sm">{/* 3 FooterLink items */}</ul>
      </div>

      {/* Column 3 — Company */}
      <div className="col-span-1">
        <h3 className="font-bold text-white mb-4 md:mb-6 text-xs md:text-base uppercase md:normal-case">[COPY: footer.company]</h3>
        <ul className="space-y-3 md:space-y-4 text-xs md:text-sm">{/* 4 FooterLink items */}</ul>
      </div>

      {/* Column 4 — Stay Connected, spans full width on mobile */}
      <div className="col-span-2 md:col-span-1 space-y-4 md:space-y-6">
        <h3 className="font-bold text-white mb-4 md:mb-6 text-xs md:text-base uppercase md:normal-case">
          <span className="md:hidden">[COPY: footer.connectShort]</span>
          <span className="hidden md:inline">[COPY: footer.stayConnected]</span>
        </h3>
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 space-y-4">
          <p className="text-xs text-slate-400">[COPY: footer.newsletter.text]</p>
          <NewsletterForm />
        </div>
        <div className="space-y-3 pt-0 md:pt-2">
          <div className="flex items-center gap-3 text-xs md:text-sm text-slate-400">
            <Mail className="w-4 h-4 text-brand-500 flex-shrink-0" />
            <span className="break-all">{CONTACT_EMAIL}</span>
          </div>
          <div className="flex items-center gap-3 text-xs md:text-sm text-slate-400">
            <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0" />
            <span>[COPY: footer.location]</span>
          </div>
        </div>
      </div>
    </div>

    <Separator className="bg-slate-800 mb-8" />

    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 text-center md:text-start">
      <p>© {currentYear} [COPY: footer.copyright]</p>
    </div>
  </div>
</footer>
```
Grid: `grid-cols-2 lg:grid-cols-4` — 2 columns on mobile (Brand and Stay Connected each `col-span-2` to fill a full row; Services and Company sit `col-span-1` side by side in the remaining 2-col row), expanding to a flat 4-column row at `lg`. `currentYear = new Date().getFullYear()` computed at render, not a static string.

**`NewsletterForm` local component:**
```tsx
function NewsletterForm() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await apiRequest("POST", "/api/subscribe", { email });
      toast({ title: t("footer.toast.subscribed") });
      setEmail("");
    } catch {
      toast({ title: t("footer.toast.error"), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
             placeholder={t("footer.newsletter.placeholder")}
             className="bg-slate-950 border-slate-800 text-white text-xs h-10 focus-visible:ring-brand-500" />
      <Button type="submit" size="icon" disabled={submitting}
              aria-label={t("footer.newsletter.placeholder")}
              className="h-10 w-10 bg-primary text-primary-foreground">
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
}
```
No client-side email validation beyond `input type="email"` + a non-empty check (`if (!email.trim()) return`) — server-side validation is presumed to happen in `POST /api/subscribe`. No debounce/loading spinner beyond `disabled={submitting}` on the button; toast on success clears the field, toast on failure leaves it.

**`FooterLink` / `SocialIcon` local components:**
```tsx
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href}>
        <span className="text-slate-400 hover:text-brand-400 transition-colors cursor-pointer flex items-center gap-2 group">
          <ArrowRight className="w-3 h-3 opacity-0 -ms-5 group-hover:opacity-100 group-hover:ms-0 transition-all duration-300 hidden md:block" />
          {children}
        </span>
      </Link>
    </li>
  );
}

function SocialIcon({ href, icon: Icon }: { href: string; icon: any }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
       className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-brand-500 hover:text-slate-900 transition-all duration-300">
      <Icon className="w-5 h-5" />
    </a>
  );
}
```
`FooterLink`'s hover micro-interaction: an `ArrowRight` icon starts off-screen (`-ms-5`, `opacity-0`), and on `group-hover` slides in (`group-hover:ms-0`) while fading in (`group-hover:opacity-100`) — desktop-only (`hidden md:block`).
