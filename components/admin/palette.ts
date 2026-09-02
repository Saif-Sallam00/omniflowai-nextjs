// Shared Tailwind utility-class tokens for the admin UI only — neutral gray
// scale + one accent (indigo), light mode only. Deliberately independent of
// the public site's branded design tokens (app/globals.css) so this restyle
// never touches public styling.

export const surface = "bg-white";
export const surfaceMuted = "bg-gray-50";
export const border = "border-gray-200";
export const textPrimary = "text-gray-900";
export const textMuted = "text-gray-500";
export const accent = "text-indigo-600";
export const accentBg = "bg-indigo-600";
export const accentBgHover = "hover:bg-indigo-700";
export const accentSoftBg = "bg-indigo-50";
export const accentBorder = "border-indigo-200";

export type StatusBadgeTone = "neutral" | "success" | "warning" | "danger";

export const statusBadgeToneClasses: Record<StatusBadgeTone, string> = {
  neutral: "bg-gray-100 text-gray-700",
  success: "bg-green-50 text-green-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
};
