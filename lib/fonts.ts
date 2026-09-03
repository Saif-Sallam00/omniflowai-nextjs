import { Inter, Space_Grotesk, Cairo } from "next/font/google";

// Self-hosted via next/font — no external Google Fonts <link>. Weights match
// the production stack: Inter 300/400/500/600/700/900, Space Grotesk 400/700,
// Cairo 400/500/600/700 (500/600 added — AR pages use font-medium/font-semibold).
export const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cairo",
  display: "swap",
});

export const fontVariables = `${inter.variable} ${spaceGrotesk.variable} ${cairo.variable}`;
