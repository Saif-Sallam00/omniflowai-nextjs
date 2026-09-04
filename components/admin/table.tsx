import { border, surfaceMuted, textMuted, textPrimary } from "./palette";

export function Table({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`overflow-x-auto rounded-lg border ${border}`}>
      <table className={`min-w-full divide-y divide-admin-border ${className}`}>{children}</table>
    </div>
  );
}

export function TableHead({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <thead className={`${surfaceMuted} ${className}`}>{children}</thead>;
}

export function TableRow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <tr className={className}>{children}</tr>;
}

export function TableCell({
  children,
  className = "",
  header = false,
}: {
  children: React.ReactNode;
  className?: string;
  header?: boolean;
}) {
  const Tag = header ? "th" : "td";
  return (
    <Tag
      className={`px-4 py-3 text-left text-sm ${
        header ? `font-medium uppercase tracking-wide text-xs ${textMuted}` : textPrimary
      } ${className}`}
    >
      {children}
    </Tag>
  );
}
