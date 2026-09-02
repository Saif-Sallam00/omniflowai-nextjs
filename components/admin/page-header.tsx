import { textMuted, textPrimary } from "./palette";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className={`text-xl font-bold ${textPrimary}`}>{title}</h1>
        {description && <p className={`mt-1 text-sm ${textMuted}`}>{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
