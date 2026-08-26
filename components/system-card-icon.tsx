import {
  Target,
  Search,
  FlaskConical,
  MessagesSquare,
  BarChart3,
  Workflow,
  Shield,
  Zap,
  Layers,
  Users,
  Compass,
  Bot,
  type LucideIcon,
} from "lucide-react";

// Mirrors SYSTEM_CARD_ICONS (lib/db/schema.ts) — icon ids cross the
// server/client boundary as plain strings, resolved to a component here
// (same pattern as HexGlyph / InteractiveSystemMap's NODE_ICON_FALLBACK).
const SYSTEM_CARD_ICON_MAP: Record<string, LucideIcon> = {
  target: Target,
  search: Search,
  "flask-conical": FlaskConical,
  "messages-square": MessagesSquare,
  "bar-chart-3": BarChart3,
  workflow: Workflow,
  shield: Shield,
  zap: Zap,
  layers: Layers,
  users: Users,
  compass: Compass,
  bot: Bot,
};

export function SystemCardIcon({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  const Icon = SYSTEM_CARD_ICON_MAP[icon] ?? Compass;
  return <Icon className={className} />;
}
