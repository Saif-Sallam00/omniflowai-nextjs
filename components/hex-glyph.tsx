import { Bot, Target, Layers, Compass, type LucideIcon } from "lucide-react";

// Reuses the same capability → icon mapping as the Home hero system-map nodes
// (aiTraining → Bot, marketing → Target, software → Layers, strategy →
// Compass) so the glyph stays visually consistent with the rest of the site.
const GLYPHS: Record<string, LucideIcon> = {
  foundation: Compass,
  "growth-engine": Target,
  "scale-infrastructure": Layers,
  marketing: Target,
  tech: Layers,
  ai: Bot,
};

export function HexGlyph({
  glyph,
  size = 40,
}: {
  glyph: string;
  size?: number;
}) {
  const Icon = GLYPHS[glyph] ?? Compass;
  const box = size <= 28 ? "w-9 h-9" : "w-11 h-11";
  return (
    <div
      className={`${box} flex items-center justify-center rounded-xl bg-brand-500/10`}
    >
      <Icon className="h-[55%] w-[55%] text-brand-400" />
    </div>
  );
}
