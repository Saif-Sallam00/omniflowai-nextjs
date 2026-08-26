"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { getLanguagePath, type Language } from "@/lib/language";
import { Disclosure } from "@/components/disclosure";
import { HexGlyph } from "@/components/hex-glyph";
import { ltrNames } from "@/lib/ltr-names";

export type SolutionId =
  | "foundation"
  | "growth-engine"
  | "scale-infrastructure"
  | "custom";

export type SolutionCardCopy = {
  id: "foundation" | "growth-engine" | "scale-infrastructure";
  name: string;
  statement: string;
  outcomeShort: string;
  tagline: string;
  bestFor: string;
  problem: string;
  includes: { title: string; body: string; items: ReactNode[] }[];
  outcome: string;
  priceFloor: string;
  priceNote: string;
  note?: string; // foundation only
  credit?: string; // foundation only
  alwaysLabel?: string; // scale only
  always?: string; // scale only
  expandsLabel?: string; // scale only
};

export type SolutionsCopy = {
  router: {
    eyebrow: string;
    heading: string;
    sub: string;
    questions: [string, string, string, string, string, string];
    resultLabel: string;
    results: [string, string, string, string, string, string];
    unsure: string;
  };
  grid: {
    heading: string;
    sub: string;
    recommendedNote: string;
    recommendedBadge: string;
    bestForLabel: string;
    problemLabel: string;
    includedLabel: string;
    outcomeLabel: string;
    priceFromLabel: string;
  };
  cards: SolutionCardCopy[];
  bookCallLabel: string;
  custom: {
    eyebrow: string;
    heading: string;
    body: string;
    name: string;
    price: string;
  };
  solutionNames: Record<SolutionId, string>;
};

const ROUTER_OPTIONS: { target: SolutionId }[] = [
  { target: "growth-engine" },
  { target: "scale-infrastructure" },
  { target: "scale-infrastructure" },
  { target: "foundation" },
  { target: "foundation" },
  { target: "custom" },
];
const DEFAULT_ROUTER_INDEX = 0;
const pad2 = (n: number) => String(n).padStart(2, "0");

function Field({ label, body }: { label: string; body: ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-slate-400">{body}</p>
    </div>
  );
}

function SolutionCard({
  language,
  solution,
  highlighted,
  recommended,
  grid,
  bookCallLabel,
}: {
  language: Language;
  solution: SolutionCardCopy;
  highlighted: boolean;
  recommended: boolean;
  grid: SolutionsCopy["grid"];
  bookCallLabel: string;
}) {
  const { id } = solution;
  const isScale = id === "scale-infrastructure";
  const isFoundation = id === "foundation";

  return (
    <div
      id={id}
      className={`relative flex scroll-mt-24 flex-col rounded-xl border p-6 transition-colors duration-300 ${
        recommended ? "bg-primary/[0.05]" : "bg-slate-900/50"
      } ${
        highlighted
          ? "border-primary ring-2 ring-primary/60"
          : recommended
            ? "border-primary/60"
            : "border-slate-800"
      }`}
    >
      {recommended && (
        <p className="absolute -top-px start-6 -translate-y-1/2 rounded-full border border-primary bg-slate-950 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
          {grid.recommendedBadge}
        </p>
      )}

      <HexGlyph glyph={id} />

      <p
        dir="ltr"
        className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-primary rtl:text-end"
      >
        {solution.name}
      </p>
      <h3 className="mt-2.5 font-display text-xl font-semibold leading-snug tracking-tight text-white">
        {solution.statement}
      </h3>

      <div className="mt-3 border-t border-slate-800/40 pt-3.5">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
          {grid.outcomeLabel}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-slate-400">
          {solution.outcomeShort}
        </p>
      </div>

      {isScale && (
        <div className="mt-3.5 rounded-lg border border-primary/30 bg-primary/[0.13] p-3.5">
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
            {solution.alwaysLabel}
          </p>
          <p className="text-xs leading-relaxed text-slate-300">{solution.always}</p>
        </div>
      )}

      <div className="mt-4">
        <Disclosure id={`inc-${id}`} label={grid.includedLabel}>
          <div className="space-y-4 py-4">
            <p className="text-sm leading-relaxed text-slate-300">{solution.tagline}</p>
            <Field label={grid.bestForLabel} body={ltrNames(solution.bestFor)} />
            <Field label={grid.problemLabel} body={ltrNames(solution.problem)} />
            {isScale && (
              <p className="text-xs leading-relaxed text-slate-400">
                {solution.expandsLabel}
              </p>
            )}

            <ul className="space-y-4">
              {solution.includes.map((component, idx) => (
                <li key={idx}>
                  <p className="text-sm font-medium text-white">{component.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                    {component.body}
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {component.items.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-300"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-[6px] h-1.5 w-[5px] flex-none bg-primary/70 [clip-path:polygon(50%_0,100%_25%,100%_75%,50%_100%,0_75%,0_25%)]"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>

            <Field label={grid.outcomeLabel} body={ltrNames(solution.outcome)} />
            {isFoundation && solution.note && (
              <p className="text-xs leading-relaxed text-slate-400">{ltrNames(solution.note)}</p>
            )}
          </div>
        </Disclosure>
      </div>

      <div className="mt-auto pt-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">
          {grid.priceFromLabel}
        </p>
        <p
          dir="ltr"
          className="mt-1 font-display text-3xl font-bold tracking-tight text-white rtl:text-end"
        >
          {solution.priceFloor}
        </p>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
          {solution.priceNote}
        </p>

        {isFoundation && solution.credit && (
          <p className="mt-3 rounded-lg border border-[#7DDBA3]/30 bg-[#7DDBA3]/[0.08] p-3 text-[11px] leading-relaxed text-[#7DDBA3]">
            {ltrNames(solution.credit)}
          </p>
        )}

        <Link href={getLanguagePath(`/contact?service=${id}`, language)} className="mt-5 block">
          <span
            className={`block w-full rounded-lg border px-5 py-3 text-center text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
              recommended
                ? "border-primary bg-primary text-slate-950 hover:bg-brand-400"
                : "border-slate-700 text-white hover:border-slate-600 hover:bg-white/5"
            }`}
          >
            {bookCallLabel}
          </span>
        </Link>
      </div>
    </div>
  );
}

export function SolutionsInteractive({
  language,
  copy,
}: {
  language: Language;
  copy: SolutionsCopy;
}) {
  const [selected, setSelected] = useState<number>(DEFAULT_ROUTER_INDEX);
  const [highlighted, setHighlighted] = useState<SolutionId | null>(null);
  const highlightTimer = useRef<number | undefined>(undefined);

  const revealSolution = useCallback((id: SolutionId) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ block: "start" });
    window.clearTimeout(highlightTimer.current);
    setHighlighted(null);
    requestAnimationFrame(() => setHighlighted(id));
    highlightTimer.current = window.setTimeout(() => setHighlighted(null), 2000);
  }, []);

  const onRouterSelect = (index: number) => {
    setSelected(index);
    revealSolution(ROUTER_OPTIONS[index].target);
  };

  const recommended = ROUTER_OPTIONS[selected].target;

  return (
    <>
      <section
        id="router"
        className="scroll-mt-24 border-y border-slate-800 bg-slate-900/30 py-16 md:py-20"
      >
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <span className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            {copy.router.eyebrow}
            <span aria-hidden="true" className="h-px flex-1 bg-slate-800" />
          </span>
          <h2
            id="router-heading"
            className="font-display text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl"
          >
            {copy.router.heading}
          </h2>
          <p id="router-sub" className="mt-3 max-w-[66ch] leading-relaxed text-slate-400">
            {copy.router.sub}
          </p>

          <div
            role="radiogroup"
            aria-labelledby="router-heading"
            aria-describedby="router-sub"
            className="mt-8 grid grid-cols-1 gap-2.5 md:grid-cols-2"
          >
            {ROUTER_OPTIONS.map((_, i) => {
              const isOn = selected === i;
              return (
                <label
                  key={i}
                  className={`group flex min-h-[3.25rem] cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors focus-within:ring-2 focus-within:ring-ring sm:p-5 ${
                    isOn
                      ? "border-primary bg-primary/[0.13]"
                      : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="growth-constraint"
                    className="sr-only"
                    checked={isOn}
                    onChange={() => onRouterSelect(i)}
                  />
                  <span
                    aria-hidden="true"
                    className={`flex-none pt-0.5 font-mono text-[11px] tracking-[0.1em] ${
                      isOn ? "text-primary" : "text-slate-400"
                    }`}
                  >
                    {pad2(i + 1)}
                  </span>
                  <span
                    className={`font-display text-base font-medium leading-snug tracking-tight ${
                      isOn ? "text-white" : "text-slate-300"
                    }`}
                  >
                    {copy.router.questions[i]}
                  </span>
                </label>
              );
            })}
          </div>

          <div aria-live="polite">
            <div className="relative mt-4 flex flex-wrap items-center gap-6 overflow-hidden rounded-e-xl border border-primary/30 bg-slate-950/60 p-5 sm:p-6">
              <span aria-hidden="true" className="absolute inset-y-0 start-0 w-[3px] bg-primary" />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                  {copy.router.resultLabel}
                </p>
                <p
                  dir="ltr"
                  className="mt-1 font-display text-2xl font-bold tracking-tight text-white rtl:text-end"
                >
                  {copy.solutionNames[recommended]}
                </p>
              </div>
              <p className="min-w-[15rem] flex-1 text-sm leading-relaxed text-slate-400">
                {ltrNames(copy.router.results[selected])}
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm text-slate-400">
            <Link href={getLanguagePath("/contact", language)}>
              <span className="cursor-pointer underline decoration-slate-700 underline-offset-4 transition-colors hover:text-white hover:decoration-primary">
                {copy.router.unsure}
              </span>
            </Link>
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">
            {copy.grid.heading}
          </h2>
          <p className="mt-3 max-w-[66ch] leading-relaxed text-slate-400">{copy.grid.sub}</p>
          <p className="mt-2 max-w-[66ch] text-sm leading-relaxed text-slate-400">
            {copy.grid.recommendedNote}
          </p>

          <div className="mt-9 grid grid-cols-1 gap-4 md:grid-cols-3">
            {copy.cards.map((solution) => (
              <SolutionCard
                key={solution.id}
                language={language}
                solution={solution}
                highlighted={highlighted === solution.id}
                recommended={recommended === solution.id}
                grid={copy.grid}
                bookCallLabel={copy.bookCallLabel}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        id="custom"
        className={`scroll-mt-24 bg-primary py-16 transition-shadow md:py-20 ${
          highlighted === "custom" ? "ring-4 ring-inset ring-slate-950/60" : ""
        }`}
      >
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          {recommended === "custom" && (
            <p className="mb-4 inline-block rounded-full bg-slate-950 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
              {copy.grid.recommendedBadge}
            </p>
          )}
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-950/80">
            {copy.custom.eyebrow}
          </p>
          <h2 className="mt-4 max-w-[19ch] font-display text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-3xl md:text-4xl">
            {copy.custom.heading}
          </h2>
          <p className="mt-4 max-w-[62ch] leading-relaxed text-slate-950/80">
            {copy.custom.body}
          </p>
          <p
            dir="ltr"
            className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-950 rtl:text-end"
          >
            {copy.custom.name}
          </p>

          <div className="mt-6 flex flex-col flex-wrap items-stretch gap-4 sm:flex-row sm:items-center">
            <Link
              href={getLanguagePath("/contact?service=custom", language)}
              className="w-full sm:w-auto"
            >
              <span className="block w-full rounded-lg border border-slate-950 bg-slate-950 px-6 py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 focus-visible:ring-offset-primary">
                {copy.bookCallLabel}
              </span>
            </Link>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-950/80">
              {copy.custom.price}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
