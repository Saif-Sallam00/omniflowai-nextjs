import Link from "next/link";

export function ArticleHero({
  backHref,
  backLabel,
  readingTimeLabel,
  title,
  excerpt,
  publishedLabel,
  updatedLabel,
}: {
  backHref: string;
  backLabel: string;
  readingTimeLabel: string;
  title: string;
  excerpt: string;
  publishedLabel: string | null;
  updatedLabel: string | null;
}) {
  return (
    <header className="relative overflow-hidden py-14 md:py-20">
      <div className="pointer-events-none absolute -top-40 end-[-120px] h-[420px] w-[420px] rounded-full bg-primary/[0.10] blur-3xl" />
      <div className="relative mx-auto max-w-3xl px-6 md:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.14em] text-slate-400 ltr:font-mono rtl:normal-case rtl:tracking-normal">
          <Link href={backHref}>
            <span className="cursor-pointer transition-colors hover:text-white">{backLabel}</span>
          </Link>
          <span aria-hidden className="text-slate-700">
            ·
          </span>
          <span>{readingTimeLabel}</span>
        </div>

        <h1 className="font-display text-[32px] font-bold leading-[1.12] tracking-tight text-white sm:text-[40px] md:text-[48px] lg:text-[52px] rtl:leading-[1.35] rtl:tracking-normal">
          {title}
        </h1>

        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-400 sm:text-xl rtl:leading-loose">
          {excerpt}
        </p>

        {(publishedLabel || updatedLabel) && (
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] uppercase tracking-[0.12em] text-slate-400 ltr:font-mono rtl:normal-case rtl:tracking-normal">
            {publishedLabel && <span>{publishedLabel}</span>}
            {updatedLabel && <span>{updatedLabel}</span>}
          </div>
        )}
      </div>
    </header>
  );
}
