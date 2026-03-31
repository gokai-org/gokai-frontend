"use client";

import { motion } from "framer-motion";
import { LibraryItem } from "@/features/library/types";
import { useCardAnimation } from "@/features/library/hooks/useCardAnimation";

export interface RecentItemProps {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  progress?: number;
  level?: string;
  category?: string;
  lastAccessed?: string | Date;
}

interface RecentCardProps {
  item: LibraryItem | RecentItemProps;
  index?: number;
  onClick?: () => void;
}

export function RecentCard({ item, index = 0, onClick }: RecentCardProps) {
  const { animationsEnabled, motionProps, hoverTransition, cardTransition } =
    useCardAnimation(index, { useInView: false });
  const formatTime = (timeInfo?: string | Date) => {
    if (!timeInfo) return "Hace un momento";

    try {
      const date = new Date(timeInfo);
      if (isNaN(date.getTime())) return "Reciente";

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHrs = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHrs / 24);

      if (diffMins < 1) return "Justo ahora";
      if (diffMins < 60) return `Hace ${diffMins} min`;
      if (diffHrs < 24) return `Hace ${diffHrs} h`;
      if (diffDays === 1) return "Ayer";

      return new Intl.DateTimeFormat("es-ES", {
        day: "numeric",
        month: "short",
      }).format(date);
    } catch {
      return "Reciente";
    }
  };

  return (
    <motion.div className="w-full" {...(animationsEnabled ? motionProps : {})}>
      <button
        type="button"
        onClick={onClick}
        className={[
          "group w-full text-left",
          "flex items-center gap-4 rounded-2xl border border-transparent dark:border-border-subtle/20 bg-surface-elevated p-3.5",
          cardTransition,
          "hover:-translate-y-[1px] hover:border-accent/15 hover:bg-surface-primary hover:shadow-sm",
          "focus:outline-none focus:ring-2 focus:ring-accent/20",
        ].join(" ")}
      >
        <div
          className={[
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            "bg-accent/8 text-lg font-bold text-accent",
            "group-hover:bg-accent group-hover:text-content-inverted",
            hoverTransition,
          ].join(" ")}
        >
          {item.thumbnail}
        </div>

        <div className="min-w-0 flex-1">
          <h3
            className={[
              "truncate text-[15px] font-extrabold text-content-primary group-hover:text-accent",
              hoverTransition,
            ].join(" ")}
          >
            {item.title}
          </h3>

          <p className="mt-1 truncate text-[13px] font-medium text-content-tertiary">
            {item.description || "Actividad reciente"}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <span className="block text-[11px] font-semibold text-content-muted">
            {formatTime(item.lastAccessed)}
          </span>

          {item.progress !== undefined ? (
            <span className="mt-1 block text-[14px] font-extrabold text-accent">
              {item.progress}%
            </span>
          ) : (
            <span className="mt-1 block text-[14px] font-bold text-content-muted">
              --
            </span>
          )}
        </div>
      </button>
    </motion.div>
  );
}