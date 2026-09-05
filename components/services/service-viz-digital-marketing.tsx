import type { Language } from "@/lib/language";

// Ported from omniflowai-hero-marketing-systems-v2.html (COMPONENT START/END).
// Colors mapped to Tailwind tokens — see the report for the full mapping;
// --orange is an exact match for this project's brand-500.
const NODE = "fill-white/[0.02] stroke-slate-800";
const NODE_ACCENT = "fill-brand-500/5 stroke-brand-500";
const WIRE = "fill-slate-800";
const WIRE_CTA = "fill-none stroke-brand-500/55";
const RULE = "stroke-slate-800";
const LINK = "fill-none stroke-slate-700";
const LINK_ACTIVE = "fill-none stroke-brand-500";
const HEXMARK = "fill-none stroke-white opacity-5";
const LABEL = "t-label fill-slate-200";
const CAPTION = "t-caption font-mono uppercase fill-slate-500";

const STRINGS = {
  en: {
    title:
      "SEO and paid media converge into landing and conversion, producing a qualified lead that hands off to CRM and sales.",
    seo: "SEO",
    paidMedia: "Paid Media",
    landing: "Landing & Conversion",
    qualifiedLead: "Qualified Lead",
    crm: "CRM / Sales",
    captionWide: "One connected path from demand to qualified opportunity",
    captionStack: "Demand to qualified opportunity",
  },
  ar: {
    title:
      "يلتقي تحسين محركات البحث مع الإعلانات المدفوعة في صفحات الهبوط والتحويل، لينتج عميلاً محتملاً مؤهلاً ينتقل إلى نظام إدارة العملاء والمبيعات.",
    seo: "SEO",
    paidMedia: "الإعلانات المدفوعة",
    landing: "صفحات الهبوط والتحويل",
    qualifiedLead: "عميل محتمل مؤهل",
    crm: "CRM / المبيعات",
    captionWide: "مسار واحد متصل من الطلب إلى الفرصة المؤهلة",
    captionStack: "من الطلب إلى الفرصة المؤهلة",
  },
} satisfies Record<Language, Record<string, string>>;

export function ServiceVizDigitalMarketing({ language }: { language: Language }) {
  const t = STRINGS[language];

  return (
    <>
      {/* ————— LINEAR LAYOUT (container ≥ 700px) ————— */}
      <svg
        className="viz-linear"
        viewBox="0 0 840 460"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="viz-marketing-linear-title"
      >
        <title id="viz-marketing-linear-title">{t.title}</title>

        <polygon className={HEXMARK} strokeWidth={1} points="650,220 535,419 305,419 190,220 305,21 535,21" />

        <g className="flow-h">
          <path className={`${LINK} s-link d-inlink`} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" pathLength={1} d="M190 125 C 226 125, 226 172, 258 172" />
          <path className={`${LINK} s-link d-inlink`} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" pathLength={1} d="M190 291 C 226 291, 226 244, 258 244" />

          <path className={`${LINK_ACTIVE} s-link d-convlink`} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} d="M458 208 L 490 208" />
          <path className={`${LINK_ACTIVE} s-link d-convlink`} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} d="M484 203 L 491 208 L 484 213" />

          <path className={`${LINK} s-link d-leadlink`} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" pathLength={1} d="M642 208 L 668 208" />
          <path className={`${LINK} s-link d-leadlink`} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" pathLength={1} d="M662 203 L 669 208 L 662 213" />

          <g className="s-node d-in">
            <rect className={NODE} strokeWidth={1} x="24" y="96" width="166" height="58" rx="10" />
            <text className={LABEL} x="107" y="131" textAnchor="middle">{t.seo}</text>
          </g>

          <g className="s-node d-in">
            <rect className={NODE} strokeWidth={1} x="24" y="262" width="166" height="58" rx="10" />
            <text className={LABEL} x="107" y="297" textAnchor="middle">{t.paidMedia}</text>
          </g>

          <g className="s-node d-conv">
            <rect className={NODE} strokeWidth={1} x="258" y="128" width="200" height="160" rx="12" />
            <rect className={WIRE} x="280" y="158" width="88" height="7" rx="3.5" />
            <rect className={`${WIRE} opacity-[0.72]`} x="280" y="176" width="136" height="5" rx="2.5" />
            <rect className={`${WIRE} opacity-[0.72]`} x="280" y="190" width="104" height="5" rx="2.5" />
            <rect className={WIRE_CTA} strokeWidth={1} x="280.5" y="210.5" width="62" height="21" rx="5" />
            <line className={RULE} strokeWidth={1} x1="280" y1="244" x2="436" y2="244" />
            <text className={LABEL} x="280" y="270">{t.landing}</text>
          </g>

          <g className="s-node d-lead">
            <rect className={NODE_ACCENT} strokeWidth={1.15} x="496" y="170" width="146" height="76" rx="10" />
            <circle className="fill-brand-500" cx="624" cy="188" r="3.2" />
            <circle className="fill-none stroke-brand-500 opacity-[0.28]" cx="624" cy="188" r="7.5" strokeWidth={1} />
            <text className={LABEL} x="569" y="213" textAnchor="middle">{t.qualifiedLead}</text>
          </g>

          <g className="s-node d-crm">
            <rect className={NODE} strokeWidth={1} x="674" y="170" width="146" height="76" rx="10" />
            <text className={LABEL} x="747" y="213" textAnchor="middle">{t.crm}</text>
          </g>
        </g>

        <g className="s-node d-cap-mkt">
          <text className={CAPTION} x="420" y="440" textAnchor="middle">{t.captionWide}</text>
        </g>
      </svg>

      {/* ————— STACKED LAYOUT (container < 700px) ————— */}
      <svg
        className="viz-stack"
        viewBox="0 0 400 600"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="viz-marketing-stack-title"
      >
        <title id="viz-marketing-stack-title">{t.title}</title>

        <polygon className={HEXMARK} strokeWidth={1} points="385,300 297,452 103,452 15,300 103,148 297,148" />

        <path className={`${LINK} s-link d-inlink`} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" pathLength={1} d="M103 82 C 103 118, 145 118, 200 150" />
        <path className={`${LINK} s-link d-inlink`} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" pathLength={1} d="M297 82 C 297 118, 255 118, 200 150" />

        <path className={`${LINK_ACTIVE} s-link d-convlink`} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} d="M200 318 L 200 372" />
        <path className={`${LINK_ACTIVE} s-link d-convlink`} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} d="M195 366 L 200 373 L 205 366" />

        <path className={`${LINK} s-link d-leadlink`} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" pathLength={1} d="M200 456 L 200 484" />
        <path className={`${LINK} s-link d-leadlink`} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" pathLength={1} d="M195 478 L 200 485 L 205 478" />

        <g className="s-node d-in">
          <rect className={NODE} strokeWidth={1} x="14" y="20" width="178" height="62" rx="10" />
          <text className={LABEL} x="103" y="57" textAnchor="middle">{t.seo}</text>
        </g>

        <g className="s-node d-in">
          <rect className={NODE} strokeWidth={1} x="208" y="20" width="178" height="62" rx="10" />
          <text className={LABEL} x="297" y="57" textAnchor="middle">{t.paidMedia}</text>
        </g>

        <g className="s-node d-conv">
          <rect className={NODE} strokeWidth={1} x="64" y="150" width="272" height="168" rx="12" />
          <rect className={WIRE} x="94" y="182" width="88" height="7" rx="3.5" />
          <rect className={`${WIRE} opacity-[0.72]`} x="94" y="200" width="180" height="5" rx="2.5" />
          <rect className={`${WIRE} opacity-[0.72]`} x="94" y="214" width="140" height="5" rx="2.5" />
          <rect className={WIRE_CTA} strokeWidth={1} x="94.5" y="234.5" width="62" height="21" rx="5" />
          <line className={RULE} strokeWidth={1} x1="94" y1="268" x2="306" y2="268" />
          <text className={LABEL} x="200" y="296" textAnchor="middle">{t.landing}</text>
        </g>

        <g className="s-node d-lead">
          <rect className={NODE_ACCENT} strokeWidth={1.15} x="100" y="380" width="200" height="76" rx="10" />
          <circle className="fill-brand-500" cx="282" cy="398" r="3.2" />
          <circle className="fill-none stroke-brand-500 opacity-[0.28]" cx="282" cy="398" r="7.5" strokeWidth={1} />
          <text className={LABEL} x="200" y="423" textAnchor="middle">{t.qualifiedLead}</text>
        </g>

        <g className="s-node d-crm">
          <rect className={NODE} strokeWidth={1} x="100" y="490" width="200" height="76" rx="10" />
          <text className={LABEL} x="200" y="533" textAnchor="middle">{t.crm}</text>
        </g>

        <g className="s-node d-cap-mkt">
          <text className={CAPTION} x="200" y="588" textAnchor="middle">{t.captionStack}</text>
        </g>
      </svg>
    </>
  );
}
