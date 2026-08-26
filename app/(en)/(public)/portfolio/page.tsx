import { buildPageMetadata } from "@/lib/metadata";
import { getPortfolioListItems } from "@/lib/db/portfolio";
import { PortfolioGrid } from "@/components/portfolio-grid";

const LANGUAGE = "en" as const;

export const revalidate = 3600;

export function generateMetadata() {
  return buildPageMetadata({
    path: "/portfolio",
    language: "en",
    title: "Real systems. Measured outcomes.",
    description:
      "Case studies from the marketing, technology, and AI systems we've built — the problem, the diagnosis, and what changed.",
  });
}

export default async function PortfolioPage() {
  const items = await getPortfolioListItems(LANGUAGE);

  return (
    <main className="min-h-screen bg-slate-950 pt-20 text-slate-300">
      <section className="border-b border-slate-800/50 bg-slate-950/50 py-20 text-center md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <h1 className="font-display text-4xl font-bold text-white md:text-5xl">Portfolio</h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-slate-400">
            Case studies from the systems we&apos;ve built — the problem, the diagnosis, and what
            changed.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <PortfolioGrid
            items={items}
            language={LANGUAGE}
            allLabel="All"
            emptyLabel="No projects found in this category."
          />
        </div>
      </section>
    </main>
  );
}
