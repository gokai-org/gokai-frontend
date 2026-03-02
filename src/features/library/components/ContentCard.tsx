"use client";

import { ReactNode } from "react";

export interface ContentCardProps {
  id: string;
  title: string;
  subtitle?: string;
  thumbnail: string | ReactNode;
  progress?: number;
  onClick?: () => void;
  onFavoriteToggle?: (id: string) => void;
  isFavorite?: boolean;
}

export function ContentCard({
  id,
  title,
  subtitle,
  thumbnail,
  progress,
  onClick,
  onFavoriteToggle,
  isFavorite = false,
}: ContentCardProps) {
  return (
    <div className="relative group h-full">
      <div
        onClick={onClick}
        className={[
          "flex flex-col justify-between h-full p-6 rounded-[24px] bg-white",
          "border border-gray-100/80",
          "shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)]",
          "transition-all duration-300 cursor-pointer",
          "hover:-translate-y-1.5 active:translate-y-0",
          "select-none min-h-[160px]",
        ].join(" ")}
      >
        {/* Header: Ícono */}
        <div className="flex items-start mb-5">
          <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[18px] bg-[#BA5149]/10 text-[22px] font-bold text-[#BA5149] group-hover:bg-[#BA5149] group-hover:text-white transition-colors duration-300">
            {thumbnail}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col justify-end mt-2">
          <h3 className="font-black text-[28px] leading-tight tracking-tight text-gray-900 group-hover:text-[#993331] transition-colors line-clamp-1">
            {title}
          </h3>

          {subtitle && (
            <p className="mt-1.5 text-[14px] font-medium text-gray-400 line-clamp-1">
              {subtitle}
            </p>
          )}

          {/* Barra de progreso sutil */}
          {progress !== undefined && (
            <div className="mt-5 flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-[#BA5149]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[12px] font-bold text-[#993331] shrink-0">
                {progress}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Botón de Favorito */}
      {onFavoriteToggle && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle(id);
          }}
          className={[
            "absolute top-5 right-5 z-10 p-2 rounded-full",
            "bg-white shadow-sm border border-gray-100",
            "transition-all duration-200",
            "hover:scale-110 active:scale-95",
            isFavorite ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          ].join(" ")}
          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <svg
            className={`w-4.5 h-4.5 transition-colors ${
              isFavorite ? "fill-[#F5D076] text-[#F5D076]" : "text-gray-300 hover:text-[#BA5149]"
            }`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={isFavorite ? 0 : 2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      )}
    </div>
  );
}