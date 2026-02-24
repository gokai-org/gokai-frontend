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
      
      return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(date);
    } catch (e) {
      return "Reciente";
    }
  };

  return (
    <div
      onClick={onClick}
      className={[
        "group flex items-center gap-5 p-4 rounded-[20px] bg-transparent border border-transparent",
        "hover:bg-white hover:border-gray-100/50 hover:shadow-[0_4px_24px_-6px_rgba(0,0,0,0.05)]",
        "transition-all duration-300 cursor-pointer select-none",
      ].join(" ")}
    >
      {/* Ícono de la actividad (más grande: w-14 h-14) */}
      <div className="shrink-0 flex items-center justify-center w-14 h-14 rounded-[16px] bg-[#BA5149]/10 text-[#BA5149] font-bold text-xl group-hover:bg-[#BA5149] group-hover:text-white transition-colors duration-300">
        {item.thumbnail}
      </div>

      {/* Textos centrales */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className="font-black text-[15px] text-gray-900 truncate group-hover:text-[#993331] transition-colors">
          {item.title}
        </h3>
        
        {item.description ? (
          <p className="text-[13px] font-medium text-gray-400 truncate mt-1">
            {item.description}
          </p>
        ) : (
          <p className="text-[13px] font-medium text-gray-300 truncate mt-1">
            Actividad completada
          </p>
        )}
      </div>

      {/* Métricas lado derecho */}
      <div className="shrink-0 flex flex-col items-end justify-center">
        <span className="text-[12px] font-medium text-gray-400 mb-1">
          {formatTime(item.lastAccessed)}
        </span>
        
        {item.progress !== undefined ? (
          <span className="text-[15px] font-black text-[#993331]">
            {item.progress}%
          </span>
        ) : (
          <span className="text-[15px] font-black text-gray-300">
            --
          </span>
        )}
      </div>
    </div>
  );
}