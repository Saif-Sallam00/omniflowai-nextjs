import { labelClass, errorTextClass, helpTextClass } from "./palette";

export function FormField({
  label,
  htmlFor,
  error,
  help,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      {children}
      {help && !error && <p className={helpTextClass}>{help}</p>}
      {error && (
        <p role="alert" className={errorTextClass}>
          {error}
        </p>
      )}
    </div>
  );
}
