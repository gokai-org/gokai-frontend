"use client";

import { ReactNode } from "react";

export interface ContentCardProps {
  id: string;
  title: string;
  subtitle?: string;
  thumbnail: string | ReactNode;
  topRightBadge?: string;
  topRightBadgeClassName?: string;
  favoriteButtonThemeClassName?: string;
  favoriteIconThemeClassName?: string;
  favoriteIconHoverClassName?: string;
  progress?: number;
  onClick?: () => void;
  onFavoriteToggle?: (id: string) => void;
  isFavorite?: boolean;
  thumbnailClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

function isLongTextThumbnail(thumbnail: string | ReactNode) {
  return typeof thumbnail === "string" && thumbnail.trim().length > 2;
}

export function ContentCard({
  id,
  title,
  subtitle,
  thumbnail,
  topRightBadge,
  topRightBadgeClassName = "",
  favoriteButtonThemeClassName = "",
  favoriteIconThemeClassName = "",
  favoriteIconHoverClassName = "hover:text-[#993331]",
  progress,
  onClick,
  onFavoriteToggle,
  isFavorite = false,
  thumbnailClassName = "",
  titleClassName = "",
  subtitleClassName = "",
}: ContentCardProps) {
  const longThumbnail = isLongTextThumbnail(thumbnail);
  const hasCustomThumbnailStyles = thumbnailClassName.trim().length > 0;

  return (
    <div className="group relative h-full">
      {topRightBadge && (
        <div
          className={[
            "absolute right-4 top-4 z-10 rounded-full px-2 py-0.5 text-[10px] font-extrabold",
            topRightBadgeClassName ||
              "border border-[#993331]/15 bg-[#993331]/10 text-[#993331]",
          ].join(" ")}
        >
          {topRightBadge}
        </div>
      )}

      <button
        type="button"
        onClick={onClick}
        className={[
          "flex h-full w-full flex-col justify-between rounded-[24px] border border-[#E8E3E1] bg-white p-5 text-left",
          "shadow-[0_2px_14px_-6px_rgba(0,0,0,0.06)]",
          "transition-all duration-300",
          "hover:-translate-y-1 hover:border-[#993331]/20 hover:shadow-[0_16px_32px_-10px_rgba(0,0,0,0.10)]",
          "focus:outline-none focus:ring-2 focus:ring-[#993331]/20",
          "min-h-[188px]",
        ].join(" ")}
      >
        <div className="mb-5 flex items-start">
          <div
            className={[
              "flex shrink-0 items-center justify-center rounded-2xl transition-colors duration-300",
              hasCustomThumbnailStyles
                ? ""
                : "bg-[#993331]/8 text-[#993331] group-hover:bg-[#993331]/12",
              longThumbnail
                ? "min-h-[60px] min-w-[60px] max-w-[72px] px-3 py-2 text-[14px] font-extrabold leading-tight"
                : "h-14 w-14 text-[24px] font-bold",
              thumbnailClassName,
            ].join(" ")}
          >
            {thumbnail}
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-end">
          <h3
            className={[
              "line-clamp-2 break-words text-[18px] font-extrabold leading-tight tracking-tight text-gray-900 transition-colors group-hover:text-[#993331]",
              titleClassName,
            ].join(" ")}
          >
            {title}
          </h3>

          {subtitle && (
            <p
              className={[
                "mt-2 line-clamp-2 break-words text-[13px] font-medium leading-relaxed text-gray-500",
                subtitleClassName,
              ].join(" ")}
            >
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
            "absolute z-10 rounded-full border border-gray-100 bg-white p-2 shadow-sm",
            "transition-all duration-200 hover:scale-105 active:scale-95",
            isFavorite ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            isFavorite ? favoriteButtonThemeClassName : "",
            "right-4 bottom-4",
          ].join(" ")}
          aria-label={
            isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"
          }
        >
          <svg
            className={`h-4.5 w-4.5 transition-colors ${
              isFavorite
                ? `fill-current ${favoriteIconThemeClassName || "text-[#F5D076]"}`
                : `text-gray-300 ${favoriteIconHoverClassName}`
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