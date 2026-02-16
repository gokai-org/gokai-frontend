'use client';

import { ReactNode } from 'react';

export interface ContentCardProps {
  id: string;
  title: string;
  subtitle?: string;
  thumbnail: string | ReactNode;
  badge?: string;
  progress?: number;
  meta?: string;
  onClick?: () => void;
  onFavoriteToggle?: (id: string) => void;
  isFavorite?: boolean;
}

export function ContentCard({
  id,
  title,
  subtitle,
  thumbnail,
  badge,
  progress,
  meta,
  onClick,
  onFavoriteToggle,
  isFavorite = false,
}: ContentCardProps) {
  return (
    <div className="relative">
      <div
        onClick={onClick}
        className="group relative bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-[#993331] hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full"
      >
        {/* Thumbnail */}
        <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
          {typeof thumbnail === 'string' ? (
            <span className="relative z-10 text-4xl font-bold text-gray-900">
              {thumbnail}
            </span>
          ) : (
            <div className="relative z-10">{thumbnail}</div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-sm text-gray-900 line-clamp-1 group-hover:text-[#993331] transition-colors">
              {title}
            </h3>
            {badge && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 bg-purple-100 text-purple-700">
                {badge}
              </span>
            )}
          </div>

          {subtitle && (
            <p className="text-xs text-gray-600 line-clamp-1 mb-2">
              {subtitle}
            </p>
          )}

          {meta && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              <span>{meta}</span>
            </div>
          )}

          <div className="mt-auto pt-1">
            {progress !== undefined && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300 bg-[#993331]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 shrink-0">
                  {progress}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {onFavoriteToggle && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle(id);
          }}
          className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-md transition-all duration-200 hover:scale-110"
        >
          <svg 
            className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      )}
    </div>
  );
}
