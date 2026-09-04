import { accentBg, accentBgHover, border, hoverBg, textSecondary, dangerText } from "./palette";

type ButtonVariant = "primary" | "secondary" | "destructive" | "ghost";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: `${accentBg} ${accentBgHover} text-white border border-transparent`,
  secondary: `bg-admin-surface-elevated ${hoverBg} ${textSecondary} border ${border}`,
  destructive: `bg-admin-surface-elevated hover:bg-admin-danger-bg ${dangerText} border border-admin-danger/30`,
  ghost: `bg-transparent ${hoverBg} ${textSecondary} border border-transparent`,
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ variant = "primary", className = "", ...rest }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    />
  );
}
