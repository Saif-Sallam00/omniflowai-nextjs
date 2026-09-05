import type { Language } from "@/lib/language";

// Ported from omniflowai-hero-ai-enablement.html (COMPONENT START/END).
// Colors mapped to Tailwind tokens — see the report for the full mapping;
// --orange is an exact match for this project's brand-500.
const NODE = "fill-white/[0.02] stroke-slate-800";
const NODE_ACCENT = "fill-brand-500/5 stroke-brand-500";
const RULE = "stroke-slate-800";
// The hub's internal crosshair lines override .rule's default stroke
// (#1B2942) with an inline stroke="#3A4C6B" in the mockup — lighter gray.
const RULE_ACCENT = "stroke-slate-600";
const LINK = "fill-none stroke-slate-700";
const DOT = "fill-slate-700";
const DOT_ACTIVE = "fill-brand-500";
const HEXMARK = "fill-none stroke-white opacity-5";
const LABEL = "t-label fill-slate-200";
const CAPTION = "t-caption font-mono uppercase fill-slate-500";

const STRINGS = {
  en: {
    title:
      "One central AI Enablement capability extending into Sales, HR, Operations and Management.",
    hub: "AI Enablement",
    sales: "Sales",
    hr: "HR",
    operations: "Operations",
    management: "Management",
    captionWide: "One AI capability, applied across daily work",
    captionStack: "One AI capability, applied across daily work",
  },
  ar: {
    title:
      "قدرة واحدة لتمكين الذكاء الاصطناعي تمتد إلى المبيعات والموارد البشرية والعمليات والإدارة.",
    hub: "تمكين الذكاء الاصطناعي",
    sales: "المبيعات",
    hr: "الموارد البشرية",
    operations: "العمليات",
    management: "الإدارة",
    captionWide: "قدرة ذكاء اصطناعي واحدة تُطبّق عبر العمل اليومي",
    captionStack: "قدرة واحدة تُطبّق عبر العمل اليومي",
  },
} satisfies Record<Language, Record<string, string>>;

export function ServiceVizAiTraining({ language }: { language: Language }) {
  const t = STRINGS[language];

  return (
    <>
      {/* ————— RADIAL LAYOUT (container ≥ 700px) ————— */}
      <svg
        className="viz-wide"
        viewBox="0 0 840 460"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="viz-ai-wide-title"
      >
        <title id="viz-ai-wide-title">{t.title}</title>

        <polygon className={HEXMARK} strokeWidth={1} points="650,220 535,419 305,419 190,220 305,21 535,21" />

        <path className={`${LINK} s-link d-link`} strokeWidth={1.1} strokeLinecap="round" pathLength={1} d="M210 88 C 258 88, 264 176, 312 176" />
        <path className={`${LINK} s-link d-link`} strokeWidth={1.1} strokeLinecap="round" pathLength={1} d="M630 88 C 582 88, 576 176, 528 176" />
        <path className={`${LINK} s-link d-link`} strokeWidth={1.1} strokeLinecap="round" pathLength={1} d="M210 364 C 258 364, 264 268, 312 268" />
        <path className={`${LINK} s-link d-link`} strokeWidth={1.1} strokeLinecap="round" pathLength={1} d="M630 364 C 582 364, 576 268, 528 268" />

        <g className="s-node d-hub">
          <rect className={NODE_ACCENT} strokeWidth={1.15} x="300" y="170" width="240" height="104" rx="12" />
          <g>
            <line x1="398" y1="198" x2="442" y2="198" className={RULE_ACCENT} strokeWidth={1} />
            <line x1="420" y1="184" x2="420" y2="212" className={RULE_ACCENT} strokeWidth={1} />
            <circle className={DOT} cx="398" cy="198" r="2.4" />
            <circle className={DOT} cx="442" cy="198" r="2.4" />
            <circle className={DOT} cx="420" cy="184" r="2.4" />
            <circle className={DOT} cx="420" cy="212" r="2.4" />
            <circle className={DOT_ACTIVE} cx="420" cy="198" r="4" />
          </g>
          <line className={RULE} strokeWidth={1} x1="328" y1="228" x2="512" y2="228" />
          <text className={LABEL} x="420" y="254" textAnchor="middle">{t.hub}</text>
        </g>

        <g className="s-node d-link">
          <circle className={DOT_ACTIVE} cx="312" cy="176" r="2.6" />
          <circle className={DOT_ACTIVE} cx="528" cy="176" r="2.6" />
          <circle className={DOT_ACTIVE} cx="312" cy="268" r="2.6" />
          <circle className={DOT_ACTIVE} cx="528" cy="268" r="2.6" />
        </g>

        <g className="s-node d-node">
          <rect className={NODE} strokeWidth={1} x="60" y="60" width="150" height="56" rx="10" />
          <text className={LABEL} x="135" y="94" textAnchor="middle">{t.sales}</text>
        </g>
        <g className="s-node d-node">
          <rect className={NODE} strokeWidth={1} x="630" y="60" width="150" height="56" rx="10" />
          <text className={LABEL} x="705" y="94" textAnchor="middle">{t.hr}</text>
        </g>
        <g className="s-node d-node">
          <rect className={NODE} strokeWidth={1} x="60" y="336" width="150" height="56" rx="10" />
          <text className={LABEL} x="135" y="370" textAnchor="middle">{t.operations}</text>
        </g>
        <g className="s-node d-node">
          <rect className={NODE} strokeWidth={1} x="630" y="336" width="150" height="56" rx="10" />
          <text className={LABEL} x="705" y="370" textAnchor="middle">{t.management}</text>
        </g>

        <g className="s-node d-cap-ai">
          <text className={CAPTION} x="420" y="436" textAnchor="middle">{t.captionWide}</text>
        </g>
      </svg>

      {/* ————— STACKED LAYOUT (container < 700px) ————— */}
      <svg
        className="viz-stack"
        viewBox="0 0 400 560"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="viz-ai-stack-title"
      >
        <title id="viz-ai-stack-title">{t.title}</title>

        <polygon className={HEXMARK} strokeWidth={1} points="375,280 288,432 112,432 25,280 112,128 288,128" />

        <path className={`${LINK} s-link d-link`} strokeWidth={1.1} strokeLinecap="round" pathLength={1} d="M200 146 L 200 412" />
        <path className={`${LINK} s-link d-link`} strokeWidth={1.1} strokeLinecap="round" pathLength={1} d="M200 282 L 170 282" />
        <path className={`${LINK} s-link d-link`} strokeWidth={1.1} strokeLinecap="round" pathLength={1} d="M200 282 L 230 282" />
        <path className={`${LINK} s-link d-link`} strokeWidth={1.1} strokeLinecap="round" pathLength={1} d="M200 412 L 170 412" />
        <path className={`${LINK} s-link d-link`} strokeWidth={1.1} strokeLinecap="round" pathLength={1} d="M200 412 L 230 412" />

        <g className="s-node d-hub">
          <rect className={NODE_ACCENT} strokeWidth={1.15} x="70" y="36" width="260" height="110" rx="12" />
          <g>
            <line x1="178" y1="72" x2="222" y2="72" className={RULE_ACCENT} strokeWidth={1} />
            <line x1="200" y1="58" x2="200" y2="86" className={RULE_ACCENT} strokeWidth={1} />
            <circle className={DOT} cx="178" cy="72" r="2.4" />
            <circle className={DOT} cx="222" cy="72" r="2.4" />
            <circle className={DOT} cx="200" cy="58" r="2.4" />
            <circle className={DOT} cx="200" cy="86" r="2.4" />
            <circle className={DOT_ACTIVE} cx="200" cy="72" r="4" />
          </g>
          <line className={RULE} strokeWidth={1} x1="100" y1="102" x2="300" y2="102" />
          <text className={LABEL} x="200" y="128" textAnchor="middle">{t.hub}</text>
        </g>

        <g className="s-node d-link">
          <circle className={DOT_ACTIVE} cx="200" cy="282" r="2.6" />
          <circle className={DOT_ACTIVE} cx="200" cy="412" r="2.6" />
        </g>

        <g className="s-node d-node">
          <rect className={NODE} strokeWidth={1} x="20" y="250" width="150" height="64" rx="10" />
          <text className={LABEL} x="95" y="288" textAnchor="middle">{t.sales}</text>
        </g>
        <g className="s-node d-node">
          <rect className={NODE} strokeWidth={1} x="230" y="250" width="150" height="64" rx="10" />
          <text className={LABEL} x="305" y="288" textAnchor="middle">{t.hr}</text>
        </g>
        <g className="s-node d-node">
          <rect className={NODE} strokeWidth={1} x="20" y="380" width="150" height="64" rx="10" />
          <text className={LABEL} x="95" y="418" textAnchor="middle">{t.operations}</text>
        </g>
        <g className="s-node d-node">
          <rect className={NODE} strokeWidth={1} x="230" y="380" width="150" height="64" rx="10" />
          <text className={LABEL} x="305" y="418" textAnchor="middle">{t.management}</text>
        </g>

        <g className="s-node d-cap-ai">
          <text className={CAPTION} x="200" y="524" textAnchor="middle">{t.captionStack}</text>
        </g>
      </svg>
    </>
  );
}
