# Slice 1B-style — Visual Port (design system + layout + simple interactions)

**Branch:** `slice/1b-style` (off master, after 1B-content committed)
**Source of truth:** `docs/omniflow-extract.md` (pass 1: tokens + copy) and `docs/omniflow-extract-2.md` (pass 2: layout + component internals). Both committed on master.
**Depends on:** 1B-content (verbatim EN/AR copy in place, static, six public routes static).
**Followed by:** 1B-interactive (the two SVG showpieces — see Out of scope).

---

## Objective

Turn the six static, unstyled public pages (Home, About, Solutions × EN/AR) into a faithful **structural-match** port of the production design: real Tailwind design system, real per-section layout, correct light/dark band rhythm, the cheap shared scroll-reveal primitives, and the two *simple* interactions (the solution router and the hand-rolled disclosures). The two bespoke SVG showpieces are explicitly excluded and get placeholder slots.

"Structural match" means: same sections, same design tokens/fonts/colors, same layout and band alternation, same reveal behavior. It does **not** mean pixel-perfect reproduction of the bespoke SVG choreography.

---

## In scope

1. **Design system port.** Bring in the production `tailwind.config.ts` (extract §DESIGN TOKENS, verbatim), the HSL CSS custom properties (`:root` brand + core theme, shadows, motion tokens), and the two Tailwind plugins (`tailwindcss-animate`, `@tailwindcss/typography`). Keyframes in the config that belong to in-scope work only: `accordion-down/up`, `float`, `scroll`, plus the inline `marquee` keyframes. **Do not** add the SVG-showpiece keyframes (`node-drift`, `constraint-breathe`, `diag-resolve`, `flow-travel`) — those ship with 1B-interactive.

2. **Fonts.** Inter (300/400/500/600/700/900), Space Grotesk (400/700), Cairo (400/700) via `next/font` (self-hosted, no external `<link>`). RTL font swap in global CSS: `[dir="rtl"] body` → Cairo/Inter; `[dir="rtl"] .font-display` → Cairo/Space Grotesk. Latin runs inside Arabic (brand name, ERP/CRM, solution names) keep falling through to Inter/Space Grotesk via the stack.

3. **Per-section layout, all six pages.** Apply the real wrapper/container/grid/spacing classes from extract-2 (§HOME 1–10, §ABOUT 1–4, §SOLUTIONS 1–8) around the copy that 1B-content already placed. Copy strings do not change in this slice.

4. **Band map (the backbone).** Reproduce the exact per-section background classes from extract-2 §LIGHT/DARK BAND MAP. This map is authoritative — match it, don't reinvent alternation.

5. **Shared reveal primitives.** Port `useInView` (single IntersectionObserver, reveal-once, **fail-open** to `true` on reduced-motion / no-IO), `Reveal`, and `HighlightWords`. Wire the value-prop word cascade and the how-we-work timeline scroll-activation using them. Port the CSS-only client-logo marquee (doubled array + inline `@keyframes marquee`).

6. **Simple interactions (client islands).**
   - **Solution router** (extract-2 §SOLUTIONS 2): radiogroup + `ROUTER_OPTIONS` array lookup, live `recommended` value threaded to every "Recommended" badge (3 cards + Custom band), `revealSolution` scroll-to-and-flash. **Omit the GA `trackEvent` call** — analytics is Phase 5.
   - **Disclosure** (hand-rolled expand/collapse): the one component the production Solutions page reuses for both the card "What's included" sections and the 7-item FAQ. Build it once, use it in both places. (Note: the repo's shadcn/Radix Accordion is unused in production — do not use it here either.)

7. **Header/footer styling** (extract-2 §SHARED LAYOUT): the transparent→`bg-slate-950/90 backdrop-blur` scroll transition (`scrollY > 20`), the code-based logo lockup (`dir="ltr"`), the 4-column footer grid. Link lists already exist from 1B-content — this is structure/classes, not labels.

8. **One missing string:** add `footer.tagline` — EN "We build the systems behind business growth." / AR "نبني الأنظمة التي تقف خلف نمو الأعمال." (extract-2 §1). Newsletter submit button keeps reusing the placeholder key as its aria-label (no dedicated string exists — confirmed).

---

## Out of scope

- **The two SVG showpieces → 1B-interactive (next slice):** `InteractiveSystemMap` (Home hero right column) and `BusinessDiagnostic` (Solutions hero right column). In this slice their slots get a **minimal placeholder**: render the section heading/copy and the already-present static content (signals/constraints as a plain labeled cluster for the diagnostic; a minimal bordered container or static hexagon-free lockup for the hero map) in a clearly-unfinished container. **No throwaway static SVG craft** — do not build a polished static hexagon we delete next slice.
- **DB-driven sections** (Home Proof/Recent, Solutions Proof): still render nothing — no DB in Phase 1B. Deferred to 1C. Keep the `useQuery(['/api/projects'])` slot returning empty; do not query, do not invent projects.
- **Newsletter + contact CTA submission:** still markup-only. Wiring is 1D.
- **Analytics / GA events:** Phase 5. Build the router without `trackEvent`.
- **Router deep-linking** (`#foundation` hash-on-load scroll): optional. Include only if it drops in cleanly against the new app's scroll-restoration behavior; if it causes friction, defer it and note it — it is not load-bearing for this slice.
- **Copy changes:** none. Strings are frozen from 1B-content.

---

## Authority & fidelity rules

- **extract-2 is the layout authority.** Where it gives real classNames, use them. Do not substitute "cleaner" Tailwind you'd prefer.
- **The band map is authoritative**, including its documented edge cases: Home §6–7 (Proof/Recent) are DB-conditional, so strict LIGHT/DARK alternation is only guaranteed when both render — this is known, not a bug to "fix." Solutions Proof deliberately repeats 950 to preserve the 950/900 rhythm when hidden — keep that.
- **Logical properties:** the extract uses `ms-*/me-*/start/end/rtl:*` utilities throughout for RTL correctness. Ensure the Tailwind setup supports them and keep them — do not rewrite to physical `left/right`.
- **The About CTA is a raw `<a>` in production** — a client-nav defect. Port it as a Next `<Link>`, not `<a>`.
- **wouter `<Link>` → next `<Link>`** everywhere; adapt import/props, keep hrefs identical (URL preservation).

---

## Acceptance criteria

Verified on `slice/1b-style`, local, before merge:

1. **AC-1 Tokens live.** `tailwind.config.ts` + CSS custom properties ported; `brand`/`surface`/`primary` tokens and `shadow-card`/`shadow-elevated`/`ease-standard` resolve in built output. Both plugins present.
2. **AC-2 Fonts.** Inter/Space Grotesk/Cairo load via `next/font`; RTL pages render body in Cairo, `.font-display` in Cairo, while Latin runs inside Arabic stay Inter/Space Grotesk.
3. **AC-3 Band map exact.** Every section on all six pages carries the background class from the band map; spot-check confirms Home alternation, About all-dark (§2/§3 identical bg), Solutions 950/900 + one orange band.
4. **AC-4 Layout match.** Each section's container/grid/spacing matches extract-2 (visual review against the three pages, both languages).
5. **AC-5 Reveal primitives.** Value-prop word cascade and how-we-work timeline reveal on scroll; with `prefers-reduced-motion` they render in final state immediately (fail-open). Marquee loops seamlessly, CSS-only.
6. **AC-6 Router works.** Selecting any of the 6 options updates the live recommendation and every "Recommended" badge (3 cards + Custom band) consistently; selecting scrolls to and flashes the target block. No GA call fires.
7. **AC-7 Disclosures work.** Card "What's included" and all 7 FAQ items expand/collapse via the single hand-rolled `Disclosure`; keyboard-operable; no Radix Accordion used.
8. **AC-8 Placeholders minimal.** Both SVG slots show clearly-placeholder content (static copy/cluster), no bespoke SVG, nothing that 1B-interactive would have to unwind beyond swapping the slot.
9. **AC-9 Header/footer.** Scroll transition fires at `scrollY > 20`; footer 4-column grid renders; `footer.tagline` present EN/AR.
10. **AC-10 Static preserved.** `next build` route table: all six public routes still ○ (static). No `headers()`/`cookies()` introduced; `proxy.ts` untouched; DB sections render nothing.
11. **AC-11 Language parity.** Both languages styled symmetrically; switcher still lands on exact counterparts; RTL layout correct (logical properties, no bidi breakage on Latin brand runs).
12. **AC-12 Quality gate.** `npm run check`, `npm run lint`, `npm run build` all exit zero.

---

## Verification

- Quality gate (AC-12) is mandatory and non-negotiable.
- Manual review by operator against AC-1…AC-11 on a running local instance, both languages.
- Report the `next build` route table (confirming all six routes static) and confirm no copy changed from 1B-content.
- **Do not commit** — operator reviews, then commits on `slice/1b-style`.

---

## Risks & notes

- **Size.** This is a large diff (design system + six pages + shared components). It is large but **low-novelty** — mechanical fidelity to the extract, not new logic. The novel logic (the SVG state machines) was deliberately pulled into 1B-interactive to keep this reviewable. If the diff starts growing *logic* rather than *styling*, something has leaked in from the wrong slice — stop and flag.
- **Tailwind is the new dependency.** Justified: it is the production design system, reused verbatim, and every remaining Phase 1 slice needs it. This is the point where it enters the project.
- **RTL logical properties** are the most likely source of subtle bugs — verify the Arabic pages visually, not just the English.
- **The router touches the cards.** Its `recommended` badge and `revealSolution` flash depend on the cards existing with correct IDs and styling — all in this slice, so it's self-contained, but build the cards before wiring the router.
