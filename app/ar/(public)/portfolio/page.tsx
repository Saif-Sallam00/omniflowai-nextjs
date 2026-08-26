import { buildPageMetadata } from "@/lib/metadata";
import { getPortfolioListItems } from "@/lib/db/portfolio";
import { PortfolioGrid } from "@/components/portfolio-grid";

const LANGUAGE = "ar" as const;

export const revalidate = 3600;

export function generateMetadata() {
  return buildPageMetadata({
    path: "/portfolio",
    language: "ar",
    title: "أنظمة حقيقية. نتائج قابلة للقياس.",
    description:
      "دراسات حالة من أنظمة التسويق والتقنية والذكاء الاصطناعي التي بنيناها — المشكلة والتشخيص وما تغيّر.",
  });
}

export default async function PortfolioPage() {
  const items = await getPortfolioListItems(LANGUAGE);

  return (
    <main className="min-h-screen bg-slate-950 pt-20 text-slate-300">
      <section className="border-b border-slate-800/50 bg-slate-950/50 py-20 text-center md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <h1 className="font-display text-4xl font-bold text-white md:text-5xl">أعمالنا</h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-slate-400">
            دراسات حالة من الأنظمة التي بنيناها — المشكلة والتشخيص وما تغيّر.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <PortfolioGrid
            items={items}
            language={LANGUAGE}
            allLabel="الكل"
            emptyLabel="لا توجد مشاريع في هذه الفئة."
          />
        </div>
      </section>
    </main>
  );
}
