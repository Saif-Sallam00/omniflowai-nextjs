import type { Language } from "@/lib/language";

// Ported from omniflowai-hero-business-technology.html (COMPONENT START/END).
// Colors mapped to Tailwind tokens — see the report for the full mapping;
// --orange is an exact match for this project's brand-500.
const NODE = "fill-white/[0.02] stroke-slate-800";
const NODE_ACCENT = "fill-brand-500/5 stroke-brand-500";
const RULE = "stroke-slate-800";
// The hub's internal crosshair line overrides .rule's default stroke (#1B2942)
// with an inline stroke="#3A4C6B" in the mockup — a distinct, lighter gray.
const RULE_ACCENT = "stroke-slate-600";
const LINK = "fill-none stroke-slate-700";
const LINK_FAINT = "fill-none stroke-slate-800 opacity-75";
const ARROW = "fill-none stroke-slate-700";
const DOT = "fill-slate-700";
const DOT_ACTIVE = "fill-brand-500";
const HEXMARK = "fill-none stroke-white opacity-5";
const LABEL = "t-label fill-slate-200";
const CAPTION = "t-caption font-mono uppercase fill-slate-500";

const STRINGS = {
  en: {
    title:
      "ERP, CRM, Web and Apps exchanging information through a central automation and integration layer.",
    erp: "ERP",
    crm: "CRM",
    web: "Web",
    apps: "Apps",
    hub: "Automation & Integration",
    caption: "Systems designed to work together",
  },
  ar: {
    title:
      "أنظمة ERP وCRM والويب والتطبيقات تتبادل البيانات عبر طبقة مركزية للأتمتة والتكامل.",
    erp: "ERP",
    crm: "CRM",
    web: "الويب",
    apps: "التطبيقات",
    hub: "الأتمتة والتكامل",
    caption: "أنظمة مصممة للعمل معًا",
  },
} satisfies Record<Language, Record<string, string>>;

export function ServiceVizSoftware({ language }: { language: Language }) {
  const t = STRINGS[language];

  return (
    <>
      {/* ————— ARCHITECTURE LAYOUT (container ≥ 700px) ————— */}
      <svg
        className="viz-wide"
        viewBox="0 0 840 460"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="viz-software-wide-title"
      >
        <title id="viz-software-wide-title">{t.title}</title>

        <polygon className={HEXMARK} strokeWidth={1} points="650,220 535,419 305,419 190,220 305,21 535,21" />

        <g className="s-fade d-sec">
          <path className={LINK_FAINT} strokeWidth={1} strokeDasharray="3 5" d="M114 120 L 114 342" />
          <path className={LINK_FAINT} strokeWidth={1} strokeDasharray="3 5" d="M726 120 L 726 342" />
        </g>

        <path className={`${LINK} s-link d-link`} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" pathLength={1} d="M184 90 L 292 180" />
        <path className={`${LINK} s-link d-link`} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" pathLength={1} d="M656 90 L 548 180" />
        <path className={`${LINK} s-link d-link`} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" pathLength={1} d="M184 372 L 292 268" />
        <path className={`${LINK} s-link d-link`} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" pathLength={1} d="M656 372 L 548 268" />

        <g className="s-fade d-link">
          <path className={ARROW} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" transform="translate(284.4,173.7) rotate(39.8)" d="M-5,-4 L0,0 L-5,4" />
          <path className={ARROW} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" transform="translate(191.6,96.3) rotate(219.8)" d="M-5,-4 L0,0 L-5,4" />
          <path className={ARROW} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" transform="translate(555.6,173.7) rotate(140.2)" d="M-5,-4 L0,0 L-5,4" />
          <path className={ARROW} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" transform="translate(648.4,96.3) rotate(320.2)" d="M-5,-4 L0,0 L-5,4" />
          <path className={ARROW} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" transform="translate(284.4,275.3) rotate(-43.9)" d="M-5,-4 L0,0 L-5,4" />
          <path className={ARROW} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" transform="translate(191.6,364.7) rotate(136.1)" d="M-5,-4 L0,0 L-5,4" />
          <path className={ARROW} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" transform="translate(555.6,275.3) rotate(223.9)" d="M-5,-4 L0,0 L-5,4" />
          <path className={ARROW} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" transform="translate(648.4,364.7) rotate(43.9)" d="M-5,-4 L0,0 L-5,4" />
        </g>

        <g className="s-node d-hub">
          <rect className={NODE_ACCENT} strokeWidth={1.15} x="280" y="170" width="280" height="108" rx="12" />
          <g>
            <line x1="366" y1="200" x2="474" y2="200" className={RULE_ACCENT} strokeWidth={1} />
            <circle className={DOT} cx="390" cy="200" r="2.8" />
            <circle className={DOT} cx="450" cy="200" r="2.8" />
            <circle className={DOT_ACTIVE} cx="420" cy="200" r="4" />
            <path className={ARROW} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" transform="translate(474,200)" d="M-5,-4 L0,0 L-5,4" />
            <path className={ARROW} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" transform="translate(366,200) rotate(180)" d="M-5,-4 L0,0 L-5,4" />
          </g>
          <line className={RULE} strokeWidth={1} x1="306" y1="228" x2="534" y2="228" />
          <text className={LABEL} x="420" y="256" textAnchor="middle">{t.hub}</text>
        </g>

        <g className="s-node d-link">
          <circle className={DOT_ACTIVE} cx="292" cy="180" r="2.6" />
          <circle className={DOT_ACTIVE} cx="548" cy="180" r="2.6" />
          <circle className={DOT_ACTIVE} cx="292" cy="268" r="2.6" />
          <circle className={DOT_ACTIVE} cx="548" cy="268" r="2.6" />
        </g>

        <g className="s-node d-node">
          <rect className={NODE} strokeWidth={1} x="44" y="62" width="140" height="56" rx="10" />
          <text className={LABEL} x="114" y="96" textAnchor="middle">{t.erp}</text>
        </g>
        <g className="s-node d-node">
          <rect className={NODE} strokeWidth={1} x="656" y="62" width="140" height="56" rx="10" />
          <text className={LABEL} x="726" y="96" textAnchor="middle">{t.crm}</text>
        </g>
        <g className="s-node d-node">
          <rect className={NODE} strokeWidth={1} x="44" y="344" width="140" height="56" rx="10" />
          <text className={LABEL} x="114" y="378" textAnchor="middle">{t.web}</text>
        </g>
        <g className="s-node d-node">
          <rect className={NODE} strokeWidth={1} x="656" y="344" width="140" height="56" rx="10" />
          <text className={LABEL} x="726" y="378" textAnchor="middle">{t.apps}</text>
        </g>

        <g className="s-node d-cap-tech">
          <text className={CAPTION} x="420" y="436" textAnchor="middle">{t.caption}</text>
        </g>
      </svg>

      {/* ————— STACKED LAYOUT (container < 700px) ————— */}
      <svg
        className="viz-stack"
        viewBox="0 0 400 560"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="viz-software-stack-title"
      >
        <title id="viz-software-stack-title">{t.title}</title>

        <polygon className={HEXMARK} strokeWidth={1} points="375,280 288,432 112,432 25,280 112,128 288,128" />

        <g className="s-fade d-sec">
          <path className={LINK_FAINT} strokeWidth={1} strokeDasharray="3 5" d="M174 54 L 226 54" />
          <path className={LINK_FAINT} strokeWidth={1} strokeDasharray="3 5" d="M174 440 L 226 440" />
        </g>

        <path className={`${LINK} s-link d-link`} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" pathLength={1} d="M99 84 L 120 190" />
        <path className={`${LINK} s-link d-link`} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" pathLength={1} d="M301 84 L 280 190" />
        <path className={`${LINK} s-link d-link`} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" pathLength={1} d="M99 410 L 120 300" />
        <path className={`${LINK} s-link d-link`} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" pathLength={1} d="M301 410 L 280 300" />

        <g className="s-fade d-link">
          <path className={ARROW} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" transform="translate(118.5,182.6) rotate(78.8)" d="M-5,-4 L0,0 L-5,4" />
          <path className={ARROW} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" transform="translate(100.5,91.4) rotate(258.8)" d="M-5,-4 L0,0 L-5,4" />
          <path className={ARROW} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" transform="translate(281.5,182.6) rotate(101.2)" d="M-5,-4 L0,0 L-5,4" />
          <path className={ARROW} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" transform="translate(299.5,91.4) rotate(281.2)" d="M-5,-4 L0,0 L-5,4" />
          <path className={ARROW} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" transform="translate(118.5,307.7) rotate(-79.2)" d="M-5,-4 L0,0 L-5,4" />
          <path className={ARROW} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" transform="translate(100.5,402.3) rotate(100.8)" d="M-5,-4 L0,0 L-5,4" />
          <path className={ARROW} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" transform="translate(281.5,307.7) rotate(259.2)" d="M-5,-4 L0,0 L-5,4" />
          <path className={ARROW} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" transform="translate(299.5,402.3) rotate(79.2)" d="M-5,-4 L0,0 L-5,4" />
        </g>

        <g className="s-node d-hub">
          <rect className={NODE_ACCENT} strokeWidth={1.15} x="40" y="190" width="320" height="110" rx="12" />
          <g>
            <line x1="146" y1="222" x2="254" y2="222" className={RULE_ACCENT} strokeWidth={1} />
            <circle className={DOT} cx="170" cy="222" r="2.8" />
            <circle className={DOT} cx="230" cy="222" r="2.8" />
            <circle className={DOT_ACTIVE} cx="200" cy="222" r="4" />
            <path className={ARROW} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" transform="translate(254,222)" d="M-5,-4 L0,0 L-5,4" />
            <path className={ARROW} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" transform="translate(146,222) rotate(180)" d="M-5,-4 L0,0 L-5,4" />
          </g>
          <line className={RULE} strokeWidth={1} x1="70" y1="250" x2="330" y2="250" />
          <text className={LABEL} x="200" y="278" textAnchor="middle">{t.hub}</text>
        </g>

        <g className="s-node d-link">
          <circle className={DOT_ACTIVE} cx="120" cy="190" r="2.6" />
          <circle className={DOT_ACTIVE} cx="280" cy="190" r="2.6" />
          <circle className={DOT_ACTIVE} cx="120" cy="300" r="2.6" />
          <circle className={DOT_ACTIVE} cx="280" cy="300" r="2.6" />
        </g>

        <g className="s-node d-node">
          <rect className={NODE} strokeWidth={1} x="24" y="24" width="150" height="60" rx="10" />
          <text className={LABEL} x="99" y="60" textAnchor="middle">{t.erp}</text>
        </g>
        <g className="s-node d-node">
          <rect className={NODE} strokeWidth={1} x="226" y="24" width="150" height="60" rx="10" />
          <text className={LABEL} x="301" y="60" textAnchor="middle">{t.crm}</text>
        </g>
        <g className="s-node d-node">
          <rect className={NODE} strokeWidth={1} x="24" y="410" width="150" height="60" rx="10" />
          <text className={LABEL} x="99" y="446" textAnchor="middle">{t.web}</text>
        </g>
        <g className="s-node d-node">
          <rect className={NODE} strokeWidth={1} x="226" y="410" width="150" height="60" rx="10" />
          <text className={LABEL} x="301" y="446" textAnchor="middle">{t.apps}</text>
        </g>

        <g className="s-node d-cap-tech">
          <text className={CAPTION} x="200" y="524" textAnchor="middle">{t.caption}</text>
        </g>
      </svg>
    </>
  );
}
