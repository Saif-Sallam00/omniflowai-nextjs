import { textPrimary, textMuted, borderStrong, surfaceMuted } from "./palette";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={`rounded-lg border border-dashed ${borderStrong} ${surfaceMuted} px-6 py-14 text-center`}>
      <p className={`text-sm font-medium ${textPrimary}`}>{title}</p>
      {description && <p className={`mx-auto mt-1 max-w-sm text-sm ${textMuted}`}>{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
