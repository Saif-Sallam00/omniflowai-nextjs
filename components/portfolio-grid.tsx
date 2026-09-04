"use client";

import { useMemo, useState, type SyntheticEvent } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getLanguagePath, type Language } from "@/lib/language";
import { formatCategoryLabel } from "@/lib/category-label";
import type { PortfolioListItem } from "@/lib/db/portfolio";

const IMAGE_FALLBACK =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='600'%20height='400'%3E%3Crect%20width='600'%20height='400'%20fill='%230f172a'/%3E%3Ctext%20x='50%25'%20y='50%25'%20fill='%23475569'%20font-family='sans-serif'%20font-size='22'%20text-anchor='middle'%20dominant-baseline='middle'%3ENo%20image%3C/text%3E%3C/svg%3E";

function onImageError(e: SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  img.onerror = null;
  img.src = IMAGE_FALLBACK;
}

export function PortfolioGrid({
  items,
  language,
  allLabel,
  emptyLabel,
}: {
  items: PortfolioListItem[];
  language: Language;
  allLabel: string;
  emptyLabel: string;
}) {
  const [activeFilter, setActiveFilter] = useState("all");

  const categories = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const item of items) {
      if (!seen.has(item.category)) {
        seen.add(item.category);
        ordered.push(item.category);
      }
    }
    return ordered;
  }, [items]);

  const filteredItems =
    activeFilter === "all" ? items : items.filter((item) => item.category === activeFilter);

  return (
    <div>
      {categories.length > 1 && (
        <div className="mb-10 flex justify-center">
          <div className="flex flex-wrap justify-center gap-1 rounded-full border border-slate-800 bg-slate-900 p-1">
            {["all", ...categories].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
                className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-all ${
                  activeFilter === tab
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab === "all" ? allLabel : formatCategoryLabel(tab)}
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-slate-400">{emptyLabel}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <Link key={item.slug} href={getLanguagePath(`/portfolio/${item.slug}`, language)}>
              <div className="card-lift group flex cursor-pointer flex-col gap-4">
                <div className="shadow-card relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-800 bg-slate-900 transition-all duration-500 group-hover:border-slate-700">
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                  <div className="absolute end-4 top-4 z-20 -translate-y-2 transform opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-sm">
                      <ArrowUpRight className="h-5 w-5 text-primary-foreground" />
                    </div>
                  </div>
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    onError={onImageError}
                    className="h-full w-full transform object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>

                <div className="space-y-1 px-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-bold text-white transition-colors group-hover:text-primary">
                      {item.title}
                    </h3>
                    <span className="whitespace-nowrap rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {item.categoryLabel || formatCategoryLabel(item.category)}
                    </span>
                  </div>

                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 text-[11px] text-slate-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
