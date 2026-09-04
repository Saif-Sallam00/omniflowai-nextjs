import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { textMuted, textPrimary, hoverBg, textPrimaryHoverClass } from "./palette";

export function PageHeader({
  title,
  description,
  status,
  back,
  action,
}: {
  title: string;
  description?: string;
  /** Small status element rendered next to the title (e.g. a StatusBadge or "Unsaved changes"). */
  status?: React.ReactNode;
  /** Breadcrumb / back link shown above the title, e.g. { href: "/admin/projects", label: "Projects" }. */
  back?: { href: string; label: string };
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        {back && (
          <Link
            href={back.href}
            className={`mb-1 inline-flex items-center gap-1 rounded text-sm ${textMuted} ${hoverBg} ${textPrimaryHoverClass} -ml-1 px-1 py-0.5`}
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
            {back.label}
          </Link>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <h1 className={`text-xl font-bold ${textPrimary}`}>{title}</h1>
          {status}
        </div>
        {description && <p className={`mt-1 text-sm ${textMuted}`}>{description}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}
