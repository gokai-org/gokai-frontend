"use client";

import { LibraryItem } from "@/features/library/types";

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
  onClick?: () => void;
}

export function RecentCard({ item, onClick }: RecentCardProps) {
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
    <button
      type="button"
      onClick={onClick}
      className={[
        "group w-full text-left",
        "flex items-center gap-4 rounded-2xl border border-gray-100 bg-[#FCFCFC] p-3.5",
        "transition-all duration-300",
        "hover:-translate-y-[1px] hover:border-[#993331]/15 hover:bg-white hover:shadow-sm",
        "focus:outline-none focus:ring-2 focus:ring-[#993331]/20",
      ].join(" ")}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#993331]/8 text-lg font-bold text-[#993331] transition-colors duration-300 group-hover:bg-[#993331] group-hover:text-white">
        {item.thumbnail}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-extrabold text-gray-900 transition-colors group-hover:text-[#993331]">
          {item.title}
        </h3>

        <p className="mt-1 truncate text-[13px] font-medium text-gray-500">
          {item.description || "Actividad reciente"}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <span className="block text-[11px] font-semibold text-gray-400">
          {formatTime(item.lastAccessed)}
        </span>

        {item.progress !== undefined ? (
          <span className="mt-1 block text-[14px] font-extrabold text-[#993331]">
            {item.progress}%
          </span>
        ) : (
          <span className="mt-1 block text-[14px] font-bold text-gray-300">
            --
          </span>
        )}
      </div>
    </button>
  );
}