"use client";

import type { Kanji } from "@/shared/types/content";

interface KanjiGridCardProps {
  kanji: Kanji;
  onClick: () => void;
  onFavoriteToggle?: (id: string) => void;
  isFavorite?: boolean;
  showMeaningCount?: boolean;
}

export function KanjiGridCard({
  kanji,
  onClick,
  onFavoriteToggle,
  isFavorite = false,
  showMeaningCount = false,
}: KanjiGridCardProps) {
  return (
    <div className="relative">
      <div
        onClick={onClick}
        className="group relative bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-[#993331] hover:shadow-lg transition-all duration-300 cursor-pointer"
      >
        <div className="aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
          <span className="relative z-10 text-6xl font-bold text-gray-900">
            {kanji.symbol}
          </span>
        </div>

        <div className="p-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-sm text-gray-900 line-clamp-1 group-hover:text-[#993331] transition-colors">
              {kanji.meanings[0] || "Sin significado"}
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 bg-purple-100 text-purple-700">
              N{kanji.points_to_unlock / 10}
            </span>
          </div>

          <p className="text-xs text-gray-600 line-clamp-1 mb-2">
            {kanji.readings.length > 0 && `音: ${kanji.readings[0]}`}
          </p>

          {showMeaningCount && (
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  />
                </svg>
                <span>{kanji.meanings.length} significados</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {onFavoriteToggle && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle(kanji.id);
          }}
          className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-md transition-all duration-200 hover:scale-110"
        >
          <svg
            className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
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
