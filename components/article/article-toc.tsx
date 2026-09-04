"use client";

import { useEffect, useState } from "react";
import type { ArticleHeading } from "@/lib/article-headings";

export function ArticleToc({
  headings,
  label,
  mobileLabel,
}: {
  headings: ArticleHeading[];
  label: string;
  mobileLabel: string;
}) {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);

  useEffect(() => {
    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  const list = (
    <ul className="space-y-2.5">
      {headings.map((heading) => (
        <li key={heading.id} className={heading.level === 3 ? "ms-3" : ""}>
          <a
            href={`#${heading.id}`}
            aria-current={activeId === heading.id ? "location" : undefined}
            className={`block text-sm leading-snug transition-colors ${
              activeId === heading.id
                ? "font-medium text-primary"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <details className="mb-8 rounded-lg border border-slate-800 bg-slate-900/40 p-4 lg:hidden">
        <summary className="cursor-pointer text-xs font-medium uppercase tracking-[0.1em] text-slate-400 rtl:normal-case rtl:tracking-normal">
          {mobileLabel}
        </summary>
        <nav aria-label={mobileLabel} className="mt-4">
          {list}
        </nav>
      </details>
      <nav aria-label={label} className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500 ltr:font-mono rtl:normal-case rtl:tracking-normal">
          {label}
        </p>
        {list}
      </nav>
    </>
  );
}
