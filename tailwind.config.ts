import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import tailwindcssTypography from "@tailwindcss/typography";

export default {
  darkMode: ["class"],
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
          border: "hsl(var(--card-border) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
          border: "hsl(var(--popover-border) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
          border: "var(--primary-border)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
          border: "var(--secondary-border)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
          border: "var(--muted-border)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
          border: "var(--accent-border)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
          border: "var(--destructive-border)",
        },
        // Brand accent — "Ember on gunmetal" (orange family, no red).
        // Prefer these tokens over hardcoded orange-* utilities.
        brand: {
          DEFAULT: "hsl(var(--brand-500) / <alpha-value>)",
          400: "hsl(var(--brand-400) / <alpha-value>)",
          500: "hsl(var(--brand-500) / <alpha-value>)",
          600: "hsl(var(--brand-600) / <alpha-value>)",
          700: "hsl(var(--brand-700) / <alpha-value>)",
          light: "hsl(var(--brand-light) / <alpha-value>)",
        },
        // Light readability surface (#F6F7F8) — P6 trust/readability bands.
        surface: "hsl(var(--surface-light) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        chart: {
          "1": "hsl(var(--chart-1) / <alpha-value>)",
          "2": "hsl(var(--chart-2) / <alpha-value>)",
          "3": "hsl(var(--chart-3) / <alpha-value>)",
          "4": "hsl(var(--chart-4) / <alpha-value>)",
          "5": "hsl(var(--chart-5) / <alpha-value>)",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
          primary: "hsl(var(--sidebar-primary) / <alpha-value>)",
          "primary-foreground":
            "hsl(var(--sidebar-primary-foreground) / <alpha-value>)",
          accent: "hsl(var(--sidebar-accent) / <alpha-value>)",
          "accent-foreground":
            "hsl(var(--sidebar-accent-foreground) / <alpha-value>)",
          border: "hsl(var(--sidebar-border) / <alpha-value>)",
          ring: "hsl(var(--sidebar-ring) / <alpha-value>)",
        },
        // Admin dashboard — dark-only semantic tokens (app/(en)/admin/admin-theme.css).
        // Independent of the tokens above: the admin never reads the public
        // site's palette, and the public site never reads this one.
        admin: {
          background: "rgb(var(--admin-background) / <alpha-value>)",
          sidebar: "rgb(var(--admin-sidebar) / <alpha-value>)",
          surface: "rgb(var(--admin-surface) / <alpha-value>)",
          "surface-muted": "rgb(var(--admin-surface-muted) / <alpha-value>)",
          "surface-elevated": "rgb(var(--admin-surface-elevated) / <alpha-value>)",
          input: "rgb(var(--admin-input) / <alpha-value>)",
          hover: "rgb(var(--admin-hover) / <alpha-value>)",
          border: "rgb(var(--admin-border) / <alpha-value>)",
          "border-strong": "rgb(var(--admin-border-strong) / <alpha-value>)",
          "text-primary": "rgb(var(--admin-text-primary) / <alpha-value>)",
          "text-secondary": "rgb(var(--admin-text-secondary) / <alpha-value>)",
          "text-muted": "rgb(var(--admin-text-muted) / <alpha-value>)",
          "text-disabled": "rgb(var(--admin-text-disabled) / <alpha-value>)",
          accent: "rgb(var(--admin-accent) / <alpha-value>)",
          "accent-hover": "rgb(var(--admin-accent-hover) / <alpha-value>)",
          "accent-muted": "rgb(var(--admin-accent-muted) / <alpha-value>)",
          "accent-muted-text": "rgb(var(--admin-accent-muted-text) / <alpha-value>)",
          success: "rgb(var(--admin-success) / <alpha-value>)",
          "success-bg": "rgb(var(--admin-success-bg) / <alpha-value>)",
          warning: "rgb(var(--admin-warning) / <alpha-value>)",
          "warning-bg": "rgb(var(--admin-warning-bg) / <alpha-value>)",
          danger: "rgb(var(--admin-danger) / <alpha-value>)",
          "danger-bg": "rgb(var(--admin-danger-bg) / <alpha-value>)",
          info: "rgb(var(--admin-info) / <alpha-value>)",
          "info-bg": "rgb(var(--admin-info-bg) / <alpha-value>)",
          "focus-ring": "rgb(var(--admin-focus-ring) / <alpha-value>)",
        },
      },
      fontFamily: {
        // Self-hosted via next/font (lib/fonts.ts): the generated font variable
        // is tried first, "Inter" kept as a harmless literal fallback label.
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        display: [
          "var(--font-space-grotesk)",
          "Space Grotesk",
          "var(--font-inter)",
          "Inter",
          "sans-serif",
        ],
        mono: ["var(--font-mono)"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        // Scroll animation for the logo ticker
        scroll: {
          to: { transform: "translate(calc(-50% - 0.5rem))" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 6s ease-in-out infinite",
        scroll: "scroll 40s linear infinite",
      },
      // Extremely subtle elevation (Linear / Vercel / Stripe). Named tokens so
      // components opt in; Tailwind's default shadow-* are left untouched.
      boxShadow: {
        card: "var(--shadow-xs)",
        elevated: "var(--shadow-md)",
        "admin-sm": "0 1px 2px rgb(0 0 0 / 0.4)",
        "admin-md": "0 8px 24px -4px rgb(0 0 0 / 0.5)",
      },
      transitionTimingFunction: {
        standard: "var(--ease-standard)",
      },
    },
  },
  plugins: [tailwindcssAnimate, tailwindcssTypography],
} satisfies Config;
