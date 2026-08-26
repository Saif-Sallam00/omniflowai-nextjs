import { useId } from "react";
import { hexPath } from "./primitives";

export interface HexGridSubstrateProps {
  /** hex = the default brand motif; dot = the quieter fallback; grid = fine lines. */
  variant?: "hex" | "dot" | "grid";
  /** tile size in px. */
  cell?: number;
  /** 2–4% only — it must whisper. */
  opacity?: number;
  /** edge fade so the texture dissolves into the section. */
  fade?: "radial" | "top" | "none";
  className?: string;
}

/**
 * A full-bleed, very-low-opacity engineered texture for section backgrounds.
 * Single tiled SVG `<pattern>` — one paint, no JS, no animation. Always
 * decorative (`aria-hidden` + `pointer-events-none`); symmetric so RTL-safe.
 * Place with an absolute wrapper, e.g. `className="absolute inset-0"`.
 */
export function HexGridSubstrate({
  variant = "hex",
  cell = 28,
  opacity = 0.03,
  fade = "radial",
  className = "",
}: HexGridSubstrateProps) {
  const pid = `hexsub-${useId().replace(/:/g, "")}`;
  const mask =
    fade === "radial"
      ? "radial-gradient(ellipse at center, #000 40%, transparent 78%)"
      : fade === "top"
      ? "linear-gradient(to bottom, #000, transparent)"
      : undefined;

  return (
    <svg
      aria-hidden="true"
      width="100%"
      height="100%"
      className={`pointer-events-none text-slate-500 ${className}`}
      style={{ opacity, ...(mask ? { maskImage: mask, WebkitMaskImage: mask } : {}) }}
    >
      <defs>
        <pattern id={pid} width={cell} height={cell} patternUnits="userSpaceOnUse">
          {variant === "dot" ? (
            <circle cx={cell / 2} cy={cell / 2} r={1} fill="currentColor" />
          ) : variant === "grid" ? (
            <path d={`M${cell} 0 L0 0 0 ${cell}`} fill="none" stroke="currentColor" strokeWidth={0.75} />
          ) : (
            <path
              d={hexPath(cell / 2, cell / 2, cell * 0.42, "flat")}
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
            />
          )}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${pid})`} />
    </svg>
  );
}
