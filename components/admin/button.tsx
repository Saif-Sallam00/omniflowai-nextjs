import { accentBg, accentBgHover } from "./palette";

type ButtonVariant = "primary" | "secondary" | "destructive";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: `${accentBg} ${accentBgHover} text-white border border-transparent`,
  secondary: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300",
  destructive: "bg-white hover:bg-red-50 text-red-600 border border-red-200",
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ variant = "primary", className = "", ...rest }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    />
  );
}
