"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type PointerEvent,
} from "react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { useInView } from "@/lib/hooks/use-in-view";

// =============================================================================
// BUSINESS DIAGNOSTIC — the Solutions page signature visual.
//
// A living constraint map, not a report. The visitor watches a diagnosis
// happen rather than reading its output:
//
//   1 SYMPTOMS        seven growth signals drifting in a field, unconnected —
//                     the way they look from inside the business
//   2 RELATIONSHIPS   probing one draws the hidden links between it and the
//                     signals nobody thought were related
//   3 ROOT CONSTRAINT the cause surfaces from beneath that cluster, at its own
//                     spatial centroid
//   4 SYSTEM          the field resolves: symptoms are absorbed into their
//                     constraints, which become the three capabilities
//                     standing on one Strategy rail
//
// What keeps this from reading as a network diagram:
//   • At rest there are NO edges. Connection is the discovery, not the
//     permanent subject — the inverse of a topology drawing.
//   • Nodes are typographic. No hexagons, no circles, no icons.
//   • Constraints surface UNDER their own cluster, so nothing is a hub that
//     everything else plugs into.
//   • The nodes are business constraints; the edges mean "same cause", never
//     "sends data to".
//
// GEOMETRY. Nodes are absolutely positioned HTML at x/y percentages, so labels
// stay real text (wrapping, RTL, focusable, readable by AT) and are correct on
// first paint with no measurement. Edges are SVG over the same field, drawn in
// a pixel viewBox taken from a ResizeObserver — matching the element 1:1 keeps
// the scale uniform, so hairlines and dash patterns behave normally. Until the
// first measurement the edge layer simply does not render, which is free:
// every edge is transparent at rest anyway.
//
// Edge endpoints are each node's BASE centre while the chip drifts a few px
// off it. That never shows — the chip is opaque, sits above the edge layer,
// and is far larger than the drift, so every edge terminates behind its chip.
//
// Two hand-tuned layouts (wide / narrow) picked from the FIELD's measured
// width, not the viewport — this sits in a ~495px hero column on a 1280px
// screen, so a viewport breakpoint would pick the wrong one. Narrow is a real
// composition, not a fallback: taller field, wider vertical spread, same seven
// nodes, same interactions, vertical resolve formation.
//
// MOTION. Drift and the entrance demo run only with motion allowed and the
// frame on screen. Drift PAUSES (never unmounts) while a cluster is being
// read, so nodes hold position instead of snapping back to base. Everything is
// gated on prefers-reduced-motion, where the map renders static and fully
// usable.
// =============================================================================

type ConstraintId = "demand" | "operating" | "capacity";
type Pos = { x: number; y: number };

const SIGNALS = [
  { key: "s1", constraint: "demand" },
  { key: "s2", constraint: "demand" },
  { key: "s3", constraint: "operating" },
  { key: "s4", constraint: "operating" },
  { key: "s5", constraint: "operating" },
  { key: "s6", constraint: "capacity" },
  { key: "s7", constraint: "capacity" },
] as const satisfies readonly { key: string; constraint: ConstraintId }[];

const CONSTRAINTS = [
  { id: "demand", key: "c1", buildKey: "solutions.work.marketing.title" },
  { id: "operating", key: "c2", buildKey: "solutions.work.tech.title" },
  { id: "capacity", key: "c3", buildKey: "solutions.work.ai.title" },
] as const satisfies readonly { id: ConstraintId; key: string; buildKey: string }[];

type SignalKey = (typeof SIGNALS)[number]["key"];

/** Structural, not derived from one entry — both layouts must satisfy it. */
type Layout = {
  signals: Record<SignalKey, Pos>;
  constraints: Record<ConstraintId, Pos>;
  system: Record<ConstraintId, Pos>;
  /** Depth of the Strategy rail, in percent of the field. */
  rail: number;
};

// The cluster the entrance demo plays. The three-signal one: it is the
// clearest proof that separate-looking problems share a cause.
const DEMO_CLUSTER: ConstraintId = "operating";
const DEMO_IN = 700;
const DEMO_OUT = 3600;

/** Below this field width the scatter collides; switch to the narrow layout. */
const NARROW_BELOW = 400;

/**
 * Positions in percent of the field. Scattered deliberately irregularly — a
 * business under strain is not a grid — and clusters are only LOOSELY
 * co-located, so proximity alone never gives the grouping away before it is
 * discovered (capacity's two signals sit far apart on purpose).
 *
 * `constraints` are where each cause surfaces: roughly the x-centroid of its
 * own cluster, at staggered depths so the three never read as a row.
 * `system` is where they settle once the map resolves — that one IS ordered,
 * because order is the payoff.
 *
 * Both sets are tuned against the node max-widths below so no chip is clipped
 * by the field edge and no two overlap, in either language.
 */
const LAYOUTS = {
  wide: {
    signals: {
      s1: { x: 25, y: 11 },
      s2: { x: 19, y: 27 },
      s3: { x: 58, y: 27 },
      s4: { x: 33, y: 42 },
      s5: { x: 52, y: 56 },
      s6: { x: 74, y: 11 },
      s7: { x: 79, y: 42 },
    },
    constraints: {
      demand: { x: 22, y: 80 },
      operating: { x: 50, y: 91 },
      capacity: { x: 78, y: 79 },
    },
    system: {
      demand: { x: 18, y: 40 },
      operating: { x: 50, y: 40 },
      capacity: { x: 82, y: 40 },
    },
    rail: 76,
  },
  narrow: {
    signals: {
      s1: { x: 28, y: 7 },
      s2: { x: 25, y: 28 },
      s3: { x: 66, y: 38 },
      s4: { x: 31, y: 49 },
      s5: { x: 40, y: 67 },
      s6: { x: 70, y: 17 },
      s7: { x: 72, y: 59 },
    },
    constraints: {
      demand: { x: 32, y: 80 },
      operating: { x: 50, y: 91 },
      capacity: { x: 68, y: 80 },
    },
    system: {
      demand: { x: 50, y: 16 },
      operating: { x: 50, y: 40 },
      capacity: { x: 50, y: 64 },
    },
    rail: 86,
  },
} as const satisfies Record<string, Layout>;

/** Every pair inside a cluster — the "these are the same problem" links. */
const PEERS = CONSTRAINTS.flatMap((c) => {
  const members = SIGNALS.filter((s) => s.constraint === c.id).map((s) => s.key);
  const pairs: { id: string; constraint: ConstraintId; a: SignalKey; b: SignalKey }[] = [];
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      pairs.push({
        id: `${members[i]}-${members[j]}`,
        constraint: c.id,
        a: members[i] as SignalKey,
        b: members[j] as SignalKey,
      });
    }
  }
  return pairs;
});

const COUNTS = Object.fromEntries(
  CONSTRAINTS.map((c) => [c.id, SIGNALS.filter((s) => s.constraint === c.id).length]),
) as Record<ConstraintId, number>;

const fill = (text: string, vars: Record<string, number>) =>
  text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );

/** Gentle quadratic bow, so links read as organic rather than schematic. */
function curve(a: Pos, b: Pos, bow: number): string {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const qx = (a.x + b.x) / 2 + (-dy / len) * len * bow;
  const qy = (a.y + b.y) / 2 + (dx / len) * len * bow;
  return `M${a.x},${a.y} Q${qx},${qy} ${b.x},${b.y}`;
}

/**
 * Keyboard focus only. A click also focuses the button in some browsers, and
 * treating that as a hover would leave a tapped node stuck lit on touch.
 * :focus-visible is baseline, but an unsupported selector makes matches()
 * throw — falling back to `true` keeps keyboard users working either way.
 */
function isKeyboardFocus(el: Element): boolean {
  try {
    return el.matches(":focus-visible");
  } catch {
    return true;
  }
}

export interface BusinessDiagnosticProps {
  /** Flat i18n dict for this component's copy (solutions.diag.* + the three
   * solutions.work.*.title build targets). The new app has no i18n context —
   * this replaces useI18n()'s `t`, sourced from the page's per-language copy. */
  copy: Record<string, string>;
  className?: string;
}

export function BusinessDiagnostic({ copy, className = "" }: BusinessDiagnosticProps) {
  const t = (key: string) => copy[key] ?? key;
  const reduced = useReducedMotion();
  const { ref: frameRef, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });

  const uid = useId().replace(/:/g, "");
  const titleId = `${uid}-title`;
  const readoutId = `${uid}-readout`;

  const fieldRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = fieldRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) =>
      setSize({ w: entry.contentRect.width, h: entry.contentRect.height }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Unmeasured falls to the wide scatter; percentage positions are already
  // correct either way, so this only picks which arrangement is used.
  const layout: Layout =
    size.w > 0 && size.w < NARROW_BELOW ? LAYOUTS.narrow : LAYOUTS.wide;
  const measured = size.w > 0 && size.h > 0;
  /** Percent → the edge layer's pixel viewBox. */
  const at = (p: Pos): Pos => ({ x: (p.x / 100) * size.w, y: (p.y / 100) * size.h });

  const [mode, setMode] = useState<"diagnosis" | "system">("diagnosis");
  const [preview, setPreview] = useState<ConstraintId | null>(null);
  const [locked, setLocked] = useState<ConstraintId | null>(null);
  const [demo, setDemo] = useState<ConstraintId | null>(null);
  const active = preview ?? locked ?? demo;

  const activeConstraint = CONSTRAINTS.find((c) => c.id === active) ?? null;
  const resolved = mode === "system";

  // Entrance: the map diagnoses one cluster by itself, then lets go. It shows
  // the visitor that probing is possible without asking them to guess, and it
  // is the only place the sequence plays unprompted. Runs once.
  const timers = useRef<number[]>([]);
  const touched = useRef(false);
  useEffect(() => {
    if (!inView || reduced || touched.current) return;
    timers.current = [
      window.setTimeout(() => setDemo(DEMO_CLUSTER), DEMO_IN),
      window.setTimeout(() => setDemo(null), DEMO_OUT),
    ];
    const pending = timers.current;
    return () => pending.forEach(window.clearTimeout);
  }, [inView, reduced]);

  // Any real interaction retires the demo for good — including a pending one,
  // which would otherwise fire over the top of the visitor's own selection.
  const takeOver = () => {
    if (!touched.current) {
      touched.current = true;
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
      setDemo(null);
    }
  };

  // Touch never sets a preview — it only clicks, and a stuck preview would
  // make a second tap look like it did nothing.
  const handlers = (id: ConstraintId) => ({
    onPointerEnter: (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      takeOver();
      setPreview(id);
    },
    onPointerLeave: (e: PointerEvent) => {
      if (e.pointerType !== "touch") setPreview(null);
    },
    onFocus: (e: FocusEvent<HTMLElement>) => {
      if (!isKeyboardFocus(e.currentTarget)) return;
      takeOver();
      setPreview(id);
    },
    onBlur: () => setPreview(null),
    onClick: () => {
      takeOver();
      setLocked((cur) => (cur === id ? null : id));
    },
    "aria-describedby": readoutId,
  });

  const switchMode = () => {
    takeOver();
    setMode((m) => (m === "diagnosis" ? "system" : "diagnosis"));
    setPreview(null);
    setLocked(null);
  };

  // Nodes travel between rest and resolved positions.
  const travel = reduced
    ? undefined
    : "left 900ms var(--ease-standard), top 900ms var(--ease-standard), opacity 700ms var(--ease-standard)";

  // Drift stays mounted and merely pauses while the map is being read, so a
  // node holds where it is instead of snapping back to its base point.
  const drifting = !reduced && inView && !resolved;
  const driftStyle = (i: number): CSSProperties | undefined =>
    drifting
      ? {
          animation: `node-drift ${13 + (i % 4) * 2.5}s var(--ease-standard) -${i * 1.7}s infinite`,
          animationPlayState: active !== null ? "paused" : "running",
        }
      : undefined;

  const summary = fill(t("solutions.diag.summary"), {
    s: SIGNALS.length,
    c: CONSTRAINTS.length,
  });

  return (
    <div
      ref={frameRef}
      role="group"
      aria-labelledby={titleId}
      className={`rounded-xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6 ${className}`}
    >
      {/* Frame header */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-slate-800/60 pb-3.5">
        <p
          id={titleId}
          className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary"
        >
          {t(resolved ? "solutions.diag.systemTitle" : "solutions.diag.title")}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">
          {summary}
        </p>
      </div>

      {/* ================= THE FIELD ================= */}
      <div
        ref={fieldRef}
        className="relative mt-4 h-[26rem] w-full overflow-hidden sm:h-[22rem]"
      >
        {/* Faint depth under the constraint zone — something beneath the
            surface, before anything down there has a name. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--primary)/0.10),transparent_70%)]"
        />

        {/* --- EDGE LAYER ------------------------------------------------
            Mounted at all times and revealed by opacity + dash offset, so the
            links draw in AND retract rather than popping. pointer-events off:
            a stroke must never intercept a hover meant for a node. */}
        {measured && (
          <svg
            aria-hidden="true"
            viewBox={`0 0 ${size.w} ${size.h}`}
            className="pointer-events-none absolute inset-0 h-full w-full"
          >
            {/* Hidden relationships: signal ↔ signal within one cluster.
                Dashed, because a shared cause is an inference, not a wire. */}
            {PEERS.map((pair) => {
              const on = !resolved && active === pair.constraint;
              return (
                <path
                  key={`peer-${pair.id}`}
                  d={curve(at(layout.signals[pair.a]), at(layout.signals[pair.b]), 0.14)}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth={1}
                  strokeDasharray="2 3"
                  className="transition-opacity duration-300 ease-standard"
                  style={{ opacity: on ? 0.55 : 0 }}
                />
              );
            })}

            {/* The trace: every signal in the cluster down into its cause.
                pathLength=1 makes the draw-in independent of path length, and
                the offset lives in `style` so it is a CSS declaration the
                transition can actually act on. */}
            {SIGNALS.map((signal, i) => {
              const on = !resolved && active === signal.constraint;
              const delay = on ? 260 + i * 70 : 0;
              return (
                <path
                  key={`trace-${signal.key}`}
                  d={curve(
                    at(layout.signals[signal.key]),
                    at(layout.constraints[signal.constraint]),
                    0.07,
                  )}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth={1.2}
                  pathLength={1}
                  strokeDasharray={1}
                  style={{
                    strokeDashoffset: on ? 0 : 1,
                    opacity: on ? 0.85 : 0,
                    transition: reduced
                      ? undefined
                      : `stroke-dashoffset 650ms var(--ease-standard) ${delay}ms, opacity 300ms var(--ease-standard) ${delay}ms`,
                  }}
                />
              );
            })}

            {/* Resolved: three systems standing on one Strategy rail. */}
            <path
              d={`M${0.12 * size.w},${(layout.rail / 100) * size.h} L${0.88 * size.w},${(layout.rail / 100) * size.h}`}
              stroke="hsl(var(--primary))"
              strokeWidth={1.5}
              className="transition-opacity duration-500 ease-standard"
              style={{
                opacity: resolved ? 0.75 : 0,
                transitionDelay: resolved ? "500ms" : "0ms",
              }}
            />
            {CONSTRAINTS.map((c, i) => {
              const from = at(layout.system[c.id]);
              return (
                <path
                  key={`rail-${c.id}`}
                  d={`M${from.x},${from.y} L${from.x},${(layout.rail / 100) * size.h}`}
                  stroke="hsl(var(--primary))"
                  strokeWidth={1}
                  className="transition-opacity duration-500 ease-standard"
                  style={{
                    opacity: resolved ? 0.4 : 0,
                    transitionDelay: resolved ? `${560 + i * 80}ms` : "0ms",
                  }}
                />
              );
            })}
          </svg>
        )}

        {/* --- SIGNAL NODES ---------------------------------------------
            On resolve they fly into their own constraint and fade: the
            symptoms are not deleted, they are absorbed by the system that
            explains them. */}
        {SIGNALS.map((signal, i) => {
          const target = resolved
            ? layout.system[signal.constraint]
            : layout.signals[signal.key];
          const on = !resolved && active === signal.constraint;
          const muted = !resolved && active !== null && !on;
          return (
            <div
              key={signal.key}
              className="absolute z-10"
              style={{
                left: `${target.x}%`,
                top: `${target.y}%`,
                transition: travel,
                transitionDelay: reduced ? undefined : `${i * 60}ms`,
                opacity: resolved ? 0 : 1,
              }}
            >
              <div className="-translate-x-1/2 -translate-y-1/2">
                <div style={driftStyle(i)}>
                  <button
                    type="button"
                    {...handlers(signal.constraint)}
                    // Absorbed nodes are invisible: out of the tab order and
                    // out of the accessibility tree, never a focus trap.
                    tabIndex={resolved ? -1 : undefined}
                    aria-hidden={resolved || undefined}
                    className={`block max-w-[8.5rem] rounded-md border px-2.5 py-2 text-start text-[11px] leading-snug transition-colors duration-300 ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-[9.5rem] sm:py-1.5 sm:text-xs ${
                      resolved ? "pointer-events-none " : ""
                    }${
                      on
                        ? "border-primary bg-slate-950 text-white"
                        : muted
                          ? "border-slate-800 bg-slate-950/80 text-slate-400"
                          : "border-slate-700 bg-slate-950/80 text-slate-300"
                    }`}
                  >
                    {t(`solutions.diag.${signal.key}.label`)}
                    {/* The full statement is the accessible name; the chip
                        keeps the map legible. The visible label leads, so
                        voice control still matches what is on screen. */}
                    <span className="sr-only"> — {t(`solutions.diag.${signal.key}.text`)}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* --- CONSTRAINT NODES -----------------------------------------
            Dormant marks until something traces to them. */}
        {CONSTRAINTS.map((c, i) => {
          const target = resolved ? layout.system[c.id] : layout.constraints[c.id];
          const on = !resolved && active === c.id;
          return (
            <div
              key={c.id}
              className="absolute z-20"
              style={{
                left: `${target.x}%`,
                top: `${target.y}%`,
                transition: travel,
                transitionDelay: reduced ? undefined : `${120 + i * 80}ms`,
              }}
            >
              <div className="-translate-x-1/2 -translate-y-1/2">
                {resolved ? (
                  // Not a control any more — the system is the conclusion.
                  <div
                    className="max-w-[7.5rem] rounded-lg border border-primary bg-primary/[0.12] px-3 py-2.5 text-center sm:max-w-[8rem]"
                    style={
                      reduced
                        ? undefined
                        : {
                            animation: `diag-resolve 500ms var(--ease-standard) ${420 + i * 90}ms both`,
                          }
                    }
                  >
                    <p
                      dir="ltr"
                      className="font-display text-[13px] font-semibold leading-tight tracking-tight text-white"
                    >
                      {t(c.buildKey)}
                    </p>
                    <p className="mt-1 text-[10px] leading-snug text-slate-400">
                      {t(`solutions.diag.${c.key}.name`)}
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    {...handlers(c.id)}
                    aria-label={t(`solutions.diag.${c.key}.name`)}
                    // Padding, not size: the dormant mark stays 8px while the
                    // hit area clears the 24px minimum.
                    className="block rounded-lg p-2 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {on ? (
                      <span
                        className="block max-w-[9.5rem] rounded-lg border border-primary bg-slate-950 px-3 py-2 sm:max-w-[11rem]"
                        style={
                          reduced
                            ? undefined
                            : { animation: "diag-resolve 420ms var(--ease-standard) 620ms both" }
                        }
                      >
                        <span className="block font-mono text-[9px] uppercase tracking-[0.16em] text-primary">
                          {t("solutions.diag.rootLabel")}
                        </span>
                        <span className="mt-1 block font-display text-[13px] font-semibold leading-snug tracking-tight text-white">
                          {t(`solutions.diag.${c.key}.name`)}
                        </span>
                      </span>
                    ) : (
                      // Dormant: present, unnamed, faintly alive.
                      <span
                        aria-hidden="true"
                        className="block h-2 w-2 rotate-45 border border-primary/60 bg-primary/20"
                        style={
                          reduced || !inView
                            ? undefined
                            : {
                                animation: `constraint-breathe ${9 + i * 2}s var(--ease-standard) ${i * 0.8}s infinite`,
                                animationPlayState: active !== null ? "paused" : "running",
                              }
                        }
                      />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Strategy — method, not a capability (spec §0.4). It labels the rail
            the three systems stand on; it is never a fourth node. */}
        <div
          aria-hidden={!resolved}
          className="pointer-events-none absolute inset-x-0 z-10 px-2 text-center transition-opacity duration-500 ease-standard"
          style={{
            top: `${layout.rail + 3}%`,
            opacity: resolved ? 1 : 0,
            transitionDelay: resolved ? "700ms" : "0ms",
          }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
            {t("solutions.diag.strategyLabel")}
          </p>
          <p className="mx-auto mt-1 max-w-[30ch] text-[11px] leading-snug text-slate-400">
            {t("solutions.diag.strategyBody")}
          </p>
        </div>
      </div>

      {/* ================= READOUT ================= */}
      {/* Fixed floor, so nothing in the frame reflows as the cursor moves. */}
      <div
        id={readoutId}
        aria-live="polite"
        className="mt-3.5 min-h-[5.5rem] border-t border-slate-800/60 pt-3.5"
      >
        {resolved ? (
          <p className="font-display text-sm font-medium leading-snug tracking-tight text-white">
            {t("solutions.diag.thesis")}
          </p>
        ) : activeConstraint ? (
          <>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
              {fill(t("solutions.diag.trace"), {
                n: COUNTS[activeConstraint.id],
                s: SIGNALS.length,
              })}
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-300">
              {t(`solutions.diag.${activeConstraint.key}.impact`)}
            </p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">
              {t("solutions.diag.buildLabel")}{" "}
              <span dir="ltr" className="text-white">
                {t(activeConstraint.buildKey)}
              </span>
            </p>
          </>
        ) : (
          <p className="text-[13px] leading-relaxed text-slate-400">
            {t("solutions.diag.hint")}
          </p>
        )}
      </div>

      {/* Mode toggle. Tertiary on purpose — it must not read as a third CTA
          next to the two hero buttons. */}
      <div className="mt-4 flex justify-end border-t border-slate-800/60 pt-3.5">
        <button
          type="button"
          onClick={switchMode}
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-primary transition-colors hover:text-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {resolved ? (
            <>
              <span aria-hidden="true" className="text-sm leading-none rtl:-scale-x-100">
                &larr;
              </span>
              {t("solutions.diag.showSignals")}
            </>
          ) : (
            <>
              {t("solutions.diag.showSystem")}
              <span aria-hidden="true" className="text-sm leading-none rtl:-scale-x-100">
                &rarr;
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
