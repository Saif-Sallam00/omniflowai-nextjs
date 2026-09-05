import type { Language } from "@/lib/language";

// Shared shell for the three service-hero diagrams (service-viz-*.tsx).
// Ported from the three approved omni-viz mockups: same container-query
// breakpoint (699px, with an @supports fallback for engines without
// container queries), same keyframes/animation timings, same RTL mirror for
// Marketing's linear flow. Colors are intentionally NOT in this stylesheet —
// every diagram applies color exclusively via Tailwind utility classes
// (fill-*/stroke-*), so this block is pure structure/motion, ported as-is.
//
// data-lang="ar" only exists to drive the three rules below that the
// mockups couldn't express any other way: label font-size, caption
// font-family/letter-spacing/case, and Marketing's flow-h mirror. Everything
// else language-dependent (which strings render at all) is decided once,
// server-side, by the caller — there is no client-side language toggle here.
const STRUCTURAL_CSS = `
.omni-viz{
  container-type:inline-size;
  container-name:viz;
  opacity:0;
  animation:omni-panel .34s ease-out both;
}
.omni-viz svg{display:block;width:100%;height:auto;}

.omni-viz .viz-stack{display:none;}
@container viz (max-width:699px){
  .omni-viz .viz-wide{display:none;}
  .omni-viz .viz-linear{display:none;}
  .omni-viz .viz-stack{display:block;}
}
@supports not (container-type:inline-size){
  @media (max-width:1100px){
    .omni-viz .viz-wide{display:none;}
    .omni-viz .viz-linear{display:none;}
    .omni-viz .viz-stack{display:block;}
  }
}

.omni-viz .t-label{font-size:15px;font-weight:600;letter-spacing:-.1px;}
.omni-viz[data-lang="ar"] .t-label{font-size:14px;}

.omni-viz .t-caption{font-size:10px;letter-spacing:1.1px;text-transform:uppercase;}
.omni-viz[data-lang="ar"] .t-caption{font-size:11px;letter-spacing:0;text-transform:none;font-family:inherit;}

.omni-viz[data-lang="ar"] .flow-h{transform-box:view-box;transform-origin:50% 50%;transform:scaleX(-1);}
.omni-viz[data-lang="ar"] .flow-h text{transform-box:fill-box;transform-origin:50% 50%;transform:scaleX(-1);}

@keyframes omni-panel{from{opacity:0}to{opacity:1}}
@keyframes omni-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes omni-fade{from{opacity:0}to{opacity:1}}
@keyframes omni-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}

.omni-viz .s-node{opacity:0;animation:omni-in .26s cubic-bezier(.2,.7,.3,1) both;}
.omni-viz .s-fade{opacity:0;animation:omni-fade .3s ease-out both;}
.omni-viz .s-link{stroke-dasharray:1;stroke-dashoffset:1;animation:omni-draw .25s ease-out both;}

/* Business Technology + AI Enablement share identical d-hub/d-link/d-node
   timings in their source mockups; d-cap differs per diagram (1.00s / .96s
   / 1.14s across the three), so each gets its own suffixed class instead of
   three conflicting .d-cap rules. */
.omni-viz .d-hub {animation-delay:.10s}
.omni-viz .d-link{animation-delay:.30s}
.omni-viz .d-node{animation-delay:.58s}
.omni-viz .d-sec {animation-delay:.84s}
.omni-viz .d-cap-tech{animation-delay:1.00s}
.omni-viz .d-cap-ai{animation-delay:.96s}

.omni-viz .d-in      {animation-delay:.10s}
.omni-viz .d-inlink  {animation-delay:.30s;animation-duration:.26s}
.omni-viz .d-conv    {animation-delay:.50s}
.omni-viz .d-convlink{animation-delay:.70s;animation-duration:.20s}
.omni-viz .d-lead    {animation-delay:.84s}
.omni-viz .d-leadlink{animation-delay:.98s;animation-duration:.16s}
.omni-viz .d-crm     {animation-delay:1.00s}
.omni-viz .d-cap-mkt {animation-delay:1.14s}

@media (prefers-reduced-motion:reduce){
  .omni-viz,.omni-viz .s-node,.omni-viz .s-fade,.omni-viz .s-link{animation:none;opacity:1;stroke-dashoffset:0;}
}
`;

export function ServiceViz({
  language,
  children,
}: {
  language: Language;
  children: React.ReactNode;
}) {
  return (
    <div
      className="omni-viz relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-slate-900 to-slate-950"
      data-lang={language === "ar" ? "ar" : undefined}
    >
      <style>{STRUCTURAL_CSS}</style>
      {children}
    </div>
  );
}
