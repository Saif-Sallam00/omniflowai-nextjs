import { statusBadgeToneClasses, type StatusBadgeTone } from "./palette";

export function StatusBadge({
  tone,
  children,
}: {
  tone: StatusBadgeTone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium uppercase ${statusBadgeToneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
