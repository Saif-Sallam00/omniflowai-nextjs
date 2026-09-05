// Direction-neutral chapter numeral used between sections on the service
// detail pages — purely decorative (the section's H2 carries the real
// heading), so it's hidden from assistive tech rather than read as a label.
export function ServiceChapterMarker({
  index,
  tone = "light",
}: {
  index: string;
  tone?: "dark" | "light" | "peak";
}) {
  const toneClasses =
    tone === "dark"
      ? "text-primary/90"
      : tone === "peak"
        ? "text-slate-950/60"
        : "text-brand-600";
  const lineClasses =
    tone === "dark" ? "bg-slate-700" : tone === "peak" ? "bg-slate-950/20" : "bg-slate-900/15";

  return (
    <p
      aria-hidden="true"
      className={`mb-4 flex items-center gap-3 font-mono text-[11px] tracking-[0.2em] ${toneClasses}`}
    >
      {index}
      <span className={`h-px flex-1 ${lineClasses}`} />
    </p>
  );
}
