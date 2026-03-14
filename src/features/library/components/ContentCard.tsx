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
    <div className="group relative h-full">
      <button
        type="button"
        onClick={onClick}
        className={[
          "flex h-full w-full flex-col justify-between rounded-[24px] border border-gray-100 bg-white p-5 text-left",
          "shadow-[0_2px_14px_-6px_rgba(0,0,0,0.06)]",
          "transition-all duration-300",
          "hover:-translate-y-1 hover:border-[#993331]/15 hover:shadow-[0_16px_32px_-10px_rgba(0,0,0,0.10)]",
          "focus:outline-none focus:ring-2 focus:ring-[#993331]/20",
          "min-h-[170px]",
        ].join(" ")}
      >
        <div className="mb-5 flex items-start">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#993331]/8 text-[24px] font-bold text-[#993331] transition-colors duration-300 group-hover:bg-[#993331] group-hover:text-white">
            {thumbnail}
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-end">
          <h3 className="line-clamp-2 break-words text-[19px] font-extrabold leading-tight tracking-tight text-gray-900 transition-colors group-hover:text-[#993331]">
            {title}
          </h3>

          {subtitle && (
            <p className="mt-2 line-clamp-1 text-[13px] font-medium text-gray-500">
              {subtitle}
            </p>
          )}

          {progress !== undefined && (
            <div className="mt-5 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-[#993331] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="shrink-0 text-[12px] font-extrabold text-[#993331]">
                {progress}%
              </span>
            </div>
          )}
        </div>
      </button>

      {onFavoriteToggle && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle(id);
          }}
          className={[
            "absolute right-4 top-4 z-10 rounded-full border border-gray-100 bg-white p-2 shadow-sm",
            "transition-all duration-200 hover:scale-105 active:scale-95",
            isFavorite ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          ].join(" ")}
          aria-label={
            isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"
          }
        >
          <svg
            className={`h-4.5 w-4.5 transition-colors ${
              isFavorite
                ? "fill-[#F5D076] text-[#F5D076]"
                : "text-gray-300 hover:text-[#993331]"
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