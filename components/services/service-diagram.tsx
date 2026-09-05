import {
  Search,
  Megaphone,
  Filter,
  TrendingUp,
  Briefcase,
  Users,
  Workflow,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";
import type { ServiceSlug } from "@/lib/services/types";

type Node = { icon?: LucideIcon; label?: string };

// One shared illustration language across all three services — a hexagonal
// core with four symmetric corner nodes — so the page identity stays
// consistent while each service's nodes differ. Symmetric by construction,
// so it needs no mirroring in RTL. Purely decorative: every fact it shows
// (ERP/CRM/etc.) is already stated in the adjacent copy, so it's hidden from
// assistive tech rather than given a translated aria-label.
const NODES: Record<ServiceSlug, [Node, Node, Node, Node]> = {
  software: [
    { label: "ERP" },
    { label: "CRM" },
    { label: "WEB" },
    { label: "APPS" },
  ],
  "digital-marketing": [
    { icon: Search },
    { icon: Megaphone },
    { icon: Filter },
    { icon: TrendingUp },
  ],
  "ai-training": [
    { icon: Briefcase },
    { icon: Users },
    { icon: Workflow },
    { icon: LifeBuoy },
  ],
};

const CORNER_POSITION = [
  "left-4 top-4 sm:left-8 sm:top-8",
  "right-4 top-4 sm:right-8 sm:top-8",
  "left-4 bottom-4 sm:left-8 sm:bottom-8",
  "right-4 bottom-4 sm:right-8 sm:bottom-8",
] as const;

export function ServiceDiagram({ variant }: { variant: ServiceSlug }) {
  const nodes = NODES[variant];

  return (
    <div
      aria-hidden="true"
      className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-4 sm:p-6"
    >
      <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" fill="none">
        <path d="M0 150h400M200 0v300" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
        <circle cx="200" cy="150" r="90" stroke="#F97316" strokeOpacity="0.25" strokeWidth="1" />
        <g stroke="white" strokeOpacity="0.22" strokeWidth="1.2">
          <path d="M170 120 70 70M230 120 330 70M170 180 70 230M230 180 330 230" />
        </g>
        <polygon
          points="240,150 215,193 165,193 140,150 165,107 215,107"
          fill="#F97316"
          fillOpacity="0.08"
          stroke="#F97316"
          strokeWidth="1.4"
        />
        <g fill="#F97316">
          <circle cx="152" cy="97" r="3" />
          <circle cx="248" cy="97" r="3" />
          <circle cx="152" cy="203" r="3" />
          <circle cx="248" cy="203" r="3" />
        </g>
      </svg>

      {nodes.map((node, i) => (
        <div
          key={i}
          className={`absolute flex items-center gap-2 rounded-lg border border-white/15 bg-slate-900/80 px-3 py-2 ${CORNER_POSITION[i]}`}
        >
          {node.icon ? (
            <node.icon className="h-4 w-4 text-brand-400" />
          ) : (
            <span className="text-xs font-semibold tracking-wide text-white">{node.label}</span>
          )}
        </div>
      ))}
    </div>
  );
}
