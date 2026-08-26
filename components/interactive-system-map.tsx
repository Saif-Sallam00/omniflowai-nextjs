"use client";

import { useId, useState } from "react";
import { Bot, Target, Layers, Workflow, Users, Compass, type LucideIcon } from "lucide-react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { useInView } from "@/lib/hooks/use-in-view";
import { hexPath, edgePath, ring } from "./systems/primitives";

// Icon components can't cross the Server → Client Component boundary as props
// (Next's RSC serialization rejects functions) — the source app had no such
// boundary. Callers pass plain `id`/`label` data; this is the exact
// heroSystemNodes id → icon mapping from the source Home.tsx, kept as a
// same-component fallback so InteractiveNode.icon (verbatim from the extract)
// still works for any caller that CAN supply it directly.
const NODE_ICON_FALLBACK: Record<string, LucideIcon> = {
  "ai-training": Bot,
  marketing: Target,
  software: Layers,
  automation: Workflow,
  crm: Users,
  strategy: Compass,
};

// =============================================================================
// Hero signature piece (Phase 6.1): the Business System, interactive.
// A central hexagon (the business system) with capability nodes on a ring. The
// story (P0/P1/P2): separate capabilities only matter once they CONNECT into one
// system. So —
//   • On scroll-in, the nodes light up and connect to the centre in sequence
//     (the "system assembling"), then rest in the fully-connected state. This is
//     also the STATIC/touch equivalent: no hover needed to read the story.
//   • On hover/focus (desktop), one node is emphasised and its link to the centre
//     lights Flow Orange with a travelling pulse — "each capability, connected to
//     the whole". Others dim so the single connection reads.
// Degrades: reduced-motion / no-IO → fully-connected static diagram immediately.
// RTL: every x passes through mx(); labels stay upright. Single accent (P5).
// =============================================================================

export interface InteractiveNode {
  id: string;
  label: string;
  icon?: LucideIcon;
}

export interface InteractiveSystemMapProps {
  centerLabel: string;
  nodes: InteractiveNode[];
  /** The whole diagram is one image to AT — real i18n copy. */
  ariaLabel: string;
  /** RTL mirroring — the new app has no i18n context, so the page passes this
   * in directly (source read it from useI18n().isRTL). */
  isRTL: boolean;
  width?: number;
  height?: number;
  className?: string;
}

function wrapLabel(label: string, maxChars: number): string[] {
  if (label.length <= maxChars) return [label];
  const words = label.split(" ");
  if (words.length < 2) return [label];
  let best = 1;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const diff = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

export function InteractiveSystemMap({
  centerLabel,
  nodes,
  ariaLabel,
  isRTL,
  width = 480,
  height = 460,
  className = "",
}: InteractiveSystemMapProps) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<SVGSVGElement>({ threshold: 0.25 });
  const [active, setActive] = useState<string | null>(null);

  const mx = (x: number) => (isRTL ? width - x : x);
  const cx = width / 2;
  const cy = height / 2;
  const R = Math.min(width, height) * 0.34;
  const centerR = 46;
  const nodeR = 26;

  // Reveal = the connected state. True immediately under reduced-motion / no-IO
  // (useInView fails open), so the static equivalent is the finished system.
  const revealed = inView;
  const uid = useId().replace(/:/g, "");

  const positioned = ring(
    nodes.map((n) => n.id),
    { w: width, h: height, radius: R },
  );
  const posById = new Map(positioned.map((p) => [p.id, p]));

  const centerLines = wrapLabel(centerLabel, 10);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full h-auto ${className}`}
      role="img"
      aria-label={ariaLabel}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id={`hub-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(var(--brand-500))" stopOpacity={0.32} />
          <stop offset="65%" stopColor="hsl(var(--brand-500))" stopOpacity={0.08} />
          <stop offset="100%" stopColor="hsl(var(--brand-500))" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`node-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.55} />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* EDGES (node → centre), drawn under the nodes */}
      {nodes.map((n, i) => {
        const p = posById.get(n.id);
        if (!p) return null;
        const from = { x: mx(p.x), y: p.y };
        const to = { x: mx(cx), y: cy };
        const d = edgePath(from, to, "curve");
        const isActive = active === n.id;
        const otherActive = active !== null && !isActive;
        const colorClass = isActive ? "text-brand-500" : "text-slate-600";
        const opacity = !revealed ? 0.1 : isActive ? 0.95 : otherActive ? 0.18 : 0.5;
        return (
          <g key={`edge-${n.id}`} aria-hidden="true">
            <path
              d={d}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              className={`${colorClass} transition-all duration-500 ease-standard`}
              style={{ opacity, transitionDelay: `${i * 110}ms` }}
            />
            {/* travelling pulse only on the emphasised edge, motion permitting */}
            {isActive && !reduced && (
              <path
                d={d}
                fill="none"
                className="text-brand-400"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeDasharray="6 240"
                style={{ animation: "flow-travel 3500ms linear infinite" }}
              />
            )}
          </g>
        );
      })}

      {/* CENTRE — the Business System (always prominent) */}
      <g aria-hidden="true" className="text-brand-500">
        <circle cx={mx(cx)} cy={cy} r={centerR * 2.3} fill={`url(#hub-${uid})`} />
        <path
          d={hexPath(mx(cx), cy, centerR, "flat")}
          fill="currentColor"
          fillOpacity={0.16}
          stroke="currentColor"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <text
          x={mx(cx)}
          y={cy}
          textAnchor="middle"
          className="fill-brand-400"
          style={{ fontSize: 13, fontWeight: 600 }}
        >
          {centerLines.map((ln, i) => (
            <tspan key={i} x={mx(cx)} dy={i === 0 ? -((centerLines.length - 1) / 2) * 15 + 4 : 15}>
              {ln}
            </tspan>
          ))}
        </text>
      </g>

      {/* RING NODES */}
      {nodes.map((n, i) => {
        const p = posById.get(n.id);
        if (!p) return null;
        const nx = mx(p.x);
        const ny = p.y;
        const isActive = active === n.id;
        const otherActive = active !== null && !isActive;
        const Icon = n.icon ?? NODE_ICON_FALLBACK[n.id];

        // radial label placement (fan outward from centre)
        const dx = nx - cx;
        const dy = ny - cy;
        const len = Math.hypot(dx, dy) || 1;
        const gap = nodeR + 12;
        const lx = nx + (dx / len) * gap;
        const ly = ny + (dy / len) * gap;
        // text-anchor start/end are direction-relative, so they invert under
        // dir="rtl". Swap them for RTL (and pin the text's direction below) so
        // every label still fans OUTWARD from its node instead of flowing back
        // over the hexagon (which caused the Arabic clipping/overlap).
        const outwardRight = dx / len > 0.25;
        const outwardLeft = dx / len < -0.25;
        const anchor = outwardRight
          ? (isRTL ? "end" : "start")
          : outwardLeft
          ? (isRTL ? "start" : "end")
          : "middle";
        const lines = wrapLabel(n.label, 12);
        const lineH = 14;
        const firstDy = -((lines.length - 1) / 2) * lineH + 4;

        const hexColor = isActive ? "text-brand-500" : "text-slate-600";
        const hexOpacity = !revealed ? 0.35 : otherActive ? 0.4 : 1;
        const labelColor = isActive ? "fill-brand-400" : "fill-slate-400";

        // Decorative enhancement (the SVG carries the full story via aria-label):
        // pointer hover (desktop) + tap (touch). Not keyboard-focusable — no
        // focusable-but-aria-hidden trap; keyboard/AT users get the labelled image.
        return (
          <g
            key={`node-${n.id}`}
            aria-hidden="true"
            className="cursor-pointer"
            onMouseEnter={() => setActive(n.id)}
            onMouseLeave={() => setActive((cur) => (cur === n.id ? null : cur))}
            onClick={() => setActive((cur) => (cur === n.id ? null : n.id))}
          >
            {/* soft Flow Orange glow when active */}
            <circle
              cx={nx}
              cy={ny}
              r={nodeR * 1.9}
              fill={`url(#node-${uid})`}
              className="transition-opacity duration-500 ease-standard"
              style={{ opacity: isActive ? 1 : 0 }}
            />
            <path
              d={hexPath(nx, ny, nodeR, "flat")}
              fill="currentColor"
              fillOpacity={isActive ? 0.16 : 0.05}
              stroke="currentColor"
              strokeWidth={isActive ? 2 : 1.5}
              strokeLinejoin="round"
              className={`${hexColor} transition-all duration-500 ease-standard`}
              style={{ opacity: hexOpacity, transitionDelay: `${i * 110}ms` }}
            />
            {Icon && (
              <Icon
                x={nx - nodeR * 0.45}
                y={ny - nodeR * 0.45}
                width={nodeR * 0.9}
                height={nodeR * 0.9}
                className={`${isActive ? "text-brand-400" : "text-slate-300"} transition-colors duration-500`}
              />
            )}
            <text
              x={lx}
              y={ly}
              textAnchor={anchor}
              className={`${labelColor} transition-colors duration-500`}
              style={{ fontSize: 12, fontWeight: 500, opacity: revealed ? 1 : 0.4, direction: isRTL ? "rtl" : "ltr" }}
            >
              {lines.map((ln, li) => (
                <tspan key={li} x={lx} dy={li === 0 ? firstDy : lineH}>
                  {ln}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
