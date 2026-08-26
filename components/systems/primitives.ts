// =============================================================================
// Connected-systems visual language — shared geometry + types (no React).
// All SVG math lives here so components stay declarative. "Ember on gunmetal":
// flat-top hexagon nodes + thin flow lines, coordinates in a fixed viewBox.
// =============================================================================

export type Point = { x: number; y: number };
export type HexOrientation = "flat" | "pointy";

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * SVG path string for a regular hexagon centered at (cx,cy) with circumradius r.
 * Flat-top by default (a horizontal edge top & bottom; vertices left & right) —
 * the calmer, more "enterprise" orientation.
 */
export function hexPath(cx: number, cy: number, r: number, orientation: HexOrientation = "flat"): string {
  const base = orientation === "flat" ? 0 : 30;
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (base + 60 * i);
    pts.push(`${round(cx + r * Math.cos(a))},${round(cy + r * Math.sin(a))}`);
  }
  return `M${pts.join("L")}Z`;
}

/** Connector path between two points. */
export type EdgeVariant = "straight" | "elbow" | "curve";

export function edgePath(a: Point, b: Point, variant: EdgeVariant = "curve"): string {
  if (variant === "straight") return `M${round(a.x)},${round(a.y)}L${round(b.x)},${round(b.y)}`;
  if (variant === "elbow") {
    const mid = round((a.x + b.x) / 2);
    return `M${round(a.x)},${round(a.y)}L${mid},${round(a.y)}L${mid},${round(b.y)}L${round(b.x)},${round(b.y)}`;
  }
  // curve: a gentle quadratic bowed perpendicular to the a→b line, for organic flow.
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const off = Math.min(len * 0.18, 24);
  const nx = -dy / len;
  const ny = dx / len;
  const qx = round((a.x + b.x) / 2 + nx * off);
  const qy = round((a.y + b.y) / 2 + ny * off);
  return `M${round(a.x)},${round(a.y)}Q${qx},${qy} ${round(b.x)},${round(b.y)}`;
}

// --- Layout helper -----------------------------------------------------------

/** Ring/mesh: nodes evenly on a circle (no center). Used by InteractiveSystemMap. */
export function ring(ids: string[], opts: { w?: number; h?: number; radius?: number } = {}) {
  const w = opts.w ?? 320;
  const h = opts.h ?? 200;
  const R = opts.radius ?? Math.min(w, h) * 0.36;
  const cx = w / 2;
  const cy = h / 2;
  const n = ids.length || 1;
  return ids.map((id, i) => {
    const a = (Math.PI / 180) * (-90 + (360 / n) * i);
    return { id, x: round(cx + R * Math.cos(a)), y: round(cy + R * Math.sin(a)) };
  });
}
