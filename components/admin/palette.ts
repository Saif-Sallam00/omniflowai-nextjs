// Shared Tailwind utility-class tokens for the admin UI — all resolved from
// the dark-only semantic scale in app/(en)/admin/admin-theme.css via the
// `admin-*` Tailwind color tokens (tailwind.config.ts). Deliberately
// independent of the public site's own design tokens (app/globals.css) so
// this system never touches public styling, and vice versa.
//
// The admin has no light mode and no theme toggle by design — components
// should resolve colors through these tokens, never through raw
// gray/white/black/red Tailwind utilities.

export const background = "bg-admin-background";
export const surface = "bg-admin-surface";
export const surfaceMuted = "bg-admin-surface-muted";
export const surfaceElevated = "bg-admin-surface-elevated";
export const sidebarBg = "bg-admin-sidebar";
export const inputBg = "bg-admin-input";
export const hoverBg = "hover:bg-admin-hover";

export const border = "border-admin-border";
export const borderStrong = "border-admin-border-strong";

// NOTE: Tailwind's content scanner needs a variant+token pair to appear as
// one literal substring somewhere in a scanned file — `` `hover:${textPrimary}` ``
// never does, since the two halves only meet at runtime. Any hover/focus
// variant of a token below must be its own full literal export, not built
// by interpolating a variant prefix onto an unprefixed token export.
export const textPrimaryHoverClass = "hover:text-admin-text-primary";

export const textPrimary = "text-admin-text-primary";
export const textSecondary = "text-admin-text-secondary";
export const textMuted = "text-admin-text-muted";
export const textDisabled = "text-admin-text-disabled";

export const accent = "text-admin-accent";
export const accentBg = "bg-admin-accent";
export const accentBgHover = "hover:bg-admin-accent-hover";
export const accentSoftBg = "bg-admin-accent-muted";
export const accentSoftText = "text-admin-accent-muted-text";
export const accentBorder = "border-admin-accent";

export const dangerText = "text-admin-danger";
export const focusRing = "focus:border-admin-accent focus:outline-none focus:ring-1 focus:ring-admin-focus-ring";

export type StatusBadgeTone = "neutral" | "success" | "warning" | "danger";

export const statusBadgeToneClasses: Record<StatusBadgeTone, string> = {
  neutral: "bg-admin-surface-elevated text-admin-text-secondary",
  success: "bg-admin-success-bg text-admin-success",
  warning: "bg-admin-warning-bg text-admin-warning",
  danger: "bg-admin-danger-bg text-admin-danger",
};

// Shared field control classes — centralized so no two form components hand-
// roll a slightly different version of "the input look."
export const inputClass = `w-full rounded-md border ${border} ${inputBg} px-3 py-2 text-sm ${textPrimary} placeholder:${textDisabled} ${focusRing}`;
export const labelClass = `text-sm font-medium ${textPrimary}`;
export const helpTextClass = `text-xs ${textMuted}`;
export const errorTextClass = `text-sm ${dangerText}`;
export const checkboxClass = `h-4 w-4 rounded ${border} ${inputBg} text-admin-accent focus:ring-admin-focus-ring`;
