'use client';

import { LibraryItem } from '@/types/library';
import { Thumbnail } from './Thumbnail';
import { LevelBadge } from './LevelBadge';
import { MetaInfo } from './MetaInfo';
import { ProgressBar } from './ProgressBar';

interface LibraryCardProps {
  item: LibraryItem;
  onClick?: () => void;
}

export function LibraryCard({ item, onClick }: LibraryCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-[#993331] hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      <div className="relative">
        <Thumbnail content={item.thumbnail} size="large" />
        
        {item.isFavorite && (
          <div className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md">
            <svg className="w-4 h-4 text-red-500 fill-current" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-sm text-gray-900 line-clamp-1 group-hover:text-[#993331] transition-colors">
            {item.title}
          </h3>
          <LevelBadge level={item.level} />
        </div>
        
        <p className="text-xs text-gray-600 line-clamp-1 mb-2">
          {item.description}
        </p>

        <MetaInfo duration={item.duration} itemCount={item.itemCount} />

        {item.progress !== undefined && (
          <div className="mt-2">
            <ProgressBar progress={item.progress} />
          </div>
        )}
      </div>
    </div>
  );
}
