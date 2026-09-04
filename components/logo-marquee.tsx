// CSS-only client-logo marquee (Home §2). Renders real logo images from
// /public/clients inside the logo-card container — same doubled-array-for-a
// -seamless-loop mechanism, .animate-marquee from globals.css (30s linear
// infinite via translateX(-50%)).
import type { Client } from "@/lib/clients";

export function LogoMarquee({ clients }: { clients: Client[] }) {
  const doubled = [...clients, ...clients];

  return (
    <div dir="ltr" className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-[#F6F7F8] to-transparent md:w-48" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-[#F6F7F8] to-transparent md:w-48" />

      <div className="flex w-max items-center animate-marquee">
        {doubled.map(({ name, file }, index) => (
          <div
            key={index}
            className="mx-3 flex h-20 w-40 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 shadow-card md:mx-4 md:h-24 md:w-48"
          >
            <img
              src={`/clients/${file}`}
              alt={name}
              loading="lazy"
              width={160}
              height={80}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
