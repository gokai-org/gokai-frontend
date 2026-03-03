import {
  Bell,
  BookOpen,
  RotateCcw,
  Trophy,
  Monitor,
  Flame,
} from "lucide-react";
import type { NoticeCategory } from "../types";

export interface CategoryStyle {
  label: string;
  icon: typeof Bell;
  color: string;
  bg: string;
}

export const categoryConfig: Record<NoticeCategory, CategoryStyle> = {
  lesson: {
    label: "Lecciones",
    icon: BookOpen,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  review: {
    label: "Revisiones",
    icon: RotateCcw,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  achievement: {
    label: "Logros",
    icon: Trophy,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  system: {
    label: "Sistema",
    icon: Monitor,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  streak: {
    label: "Racha",
    icon: Flame,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
};

/** Tiempo relativo legible */
export function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Justo ahora";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `Hace ${days}d`;
  return new Date(dateStr).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
  });
}

/** Concat clases condicionales */
export const cls = (...c: Array<string | false | undefined>) =>
  c.filter(Boolean).join(" ");
