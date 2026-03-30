import {
  Bell,
  BookOpen,
  RotateCcw,
  Trophy,
  Monitor,
  Flame,
} from "lucide-react";
import type { NoticeCategory } from "@/features/notices/types";

export interface NoticeCategoryStyle {
  label: string;
  icon: typeof Bell;
  color: string;
  bg: string;
  accent: string;
}

export const noticeCategoryConfig: Record<NoticeCategory, NoticeCategoryStyle> =
  {
    lesson: {
      label: "Lecciones",
      icon: BookOpen,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/30",
      accent: "from-blue-500 to-blue-600",
    },
    review: {
      label: "Revisiones",
      icon: RotateCcw,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      accent: "from-emerald-500 to-emerald-600",
    },
    achievement: {
      label: "Logros",
      icon: Trophy,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      accent: "from-amber-500 to-amber-600",
    },
    streak: {
      label: "Racha",
      icon: Flame,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-950/30",
      accent: "from-orange-500 to-orange-600",
    },
    system: {
      label: "Sistema",
      icon: Monitor,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-950/30",
      accent: "from-indigo-500 to-indigo-600",
    },
  };

export function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return "Justo ahora";
  if (mins < 60) return `Hace ${mins} min`;

  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs} h`;

  const days = Math.floor(hrs / 24);
  if (days < 7) return `Hace ${days} d`;

  return new Date(dateStr).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
  });
}

export const cls = (...classes: Array<string | false | undefined>) =>
  classes.filter(Boolean).join(" ");