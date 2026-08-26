// CSS-only client-logo marquee (Home §2). No logo image assets exist in this
// repo yet (1B-content has no /public images), so each client renders as a
// text lockup inside the same logo-card container the real site uses for
// <img> — same doubled-array-for-a-seamless-loop mechanism, .animate-marquee
// from globals.css (30s linear infinite via translateX(-50%)).
export function LogoMarquee({ clients }: { clients: string[] }) {
  const doubled = [...clients, ...clients];

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-[#F6F7F8] to-transparent md:w-48" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-[#F6F7F8] to-transparent md:w-48" />

      <div className="flex w-max items-center animate-marquee">
        {doubled.map((name, index) => (
          <div
            key={index}
            className="mx-3 flex h-20 w-40 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 shadow-card md:mx-4 md:h-24 md:w-48"
          >
            <span className="text-center text-sm font-semibold text-slate-500 md:text-base">
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
